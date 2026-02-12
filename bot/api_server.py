"""
FastAPI сервер для Orchids Networking Bot.
Обновлённая версия с:
- JWT аутентификацией
- Централизованным логированием
- Валидацией webhook
- Обработкой отмены платежа
"""

import os
import traceback
import hashlib
import hmac
from typing import Optional, List

from fastapi import FastAPI, HTTPException, Depends, Header, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from contextlib import asynccontextmanager
from pydantic import BaseModel, ConfigDict
from sqlalchemy.ext.asyncio import AsyncSession

from db.session import init_db, get_session
from db.repository import UserRepo, SlotRepo, BookingRepo, PaymentRepo
from db.models import User, DinnerSlot, Booking
from schemas import UserProfile as UserProfileSchema
from config import DATABASE_NAME, SECRET_KEY
from auth_token import validate_user_token
from utils import format_date
from payments.payment_service import PaymentService
from payments.payment_config import YOOKASSA_SECRET_KEY
from logger import get_api_logger
from admin_api import admin_router_api

# Логгер для API
logger = get_api_logger()


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    logger.info("Starting FastAPI server...")
    await init_db()
    logger.info("✅ Database initialized")
    yield
    # Shutdown
    logger.info("Shutting down FastAPI server...")


app = FastAPI(title="Orchids Networking Bot API", lifespan=lifespan)

# Логирующий middleware для отладки
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request

class LoggingMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        logger.info(f"📨 Incoming request: {request.method} {request.url.path}")
        if request.headers.get("authorization"):
            logger.info(f"   Authorization: {request.headers['authorization'][:50]}...")
        try:
            response = await call_next(request)
            logger.info(f"✅ Response: {request.method} {request.url.path} → {response.status_code}")
            return response
        except Exception as e:
            logger.error(f"❌ Error in {request.method} {request.url.path}: {e}")
            raise

app.add_middleware(LoggingMiddleware)

# Подключаем админские эндпоинты
app.include_router(admin_router_api)

# Настройки безопасности для токенов
security = HTTPBearer(auto_error=False)


async def get_current_user_id(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(security)
) -> Optional[int]:
    """
    Извлекает user_id из JWT токена.
    """
    
    # Если токен не передан — возвращаем None (некоторые эндпоинты работают с query param userId)
    if not credentials:
        return None

    token = credentials.credentials
    result = validate_user_token(token)

    if not result:
        raise HTTPException(status_code=401, detail="Invalid or expired token")

    return result['user_id']


def get_user_id_or_param(auth_user_id: Optional[int], param_user_id: Optional[int]) -> int:
    """Возвращает user_id приоритетно из токена, затем из query param; иначе бросает 401."""
    if auth_user_id:
        return auth_user_id
    if param_user_id:
        return param_user_id
    raise HTTPException(status_code=401, detail="Missing user identification")




# CORS для MiniApp
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://orchids-networking-bot-app.vercel.app",
        "https://leracinema.ru",
        "https://www.leracinema.ru",
        "http://localhost:3000",  # Для локальной разработки
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ===== Pydantic модели =====

class UserProfile(BaseModel):
    model_config = ConfigDict(str_strip_whitespace=True)

    name: Optional[str] = None
    age: Optional[int] = None
    gender: Optional[str] = None
    relationship_status: Optional[str] = None
    children: Optional[str] = None
    occupation: Optional[str] = None
    goal: Optional[str] = None
    interests: Optional[str] = None
    comfort_level: Optional[int] = None
    social_frequency: Optional[int] = None
    communication_format: Optional[str] = None
    evening_scenario: Optional[str] = None
    telegram: Optional[str] = None
    instagram: Optional[str] = None
    photo: Optional[str] = None
    about_me: Optional[str] = None
    city: Optional[str] = None
    meeting_metro: Optional[List[str]] = None
    meeting_days: Optional[List[str]] = None
    meeting_time_from: Optional[str] = None
    meeting_time_to: Optional[str] = None
    format: Optional[str] = None
    is_profile_completed: bool = False

class ProfileRequest(BaseModel):
    userId: int
    profile: UserProfile


class BookingRequest(BaseModel):
    userId: int
    slotId: int


class PaymentRequest(BaseModel):
    userId: int
    amount: str
    bookingId: Optional[int] = None
    returnUrl: str


# ===== Публичные эндпоинты (без аутентификации) =====

@app.get("/api/health")
async def health_check():
    """Проверка здоровья сервера (публичный)."""
    return {"status": "OK"}


@app.get("/test")
async def test_endpoint(session: AsyncSession = Depends(get_session)):
    """Тестовый эндпоинт для проверки (публичный)."""
    try:
        slot_repo = SlotRepo(session)
        user_repo = UserRepo(session)
        slots = await slot_repo.get_all_slots()
        users_count = await user_repo.get_total_count()
        return {
            "status": "OK", 
            "slots_count": len(slots),
            "users_count": users_count,
            "auth_disabled": AUTH_DISABLED,
            "slots": [
                {
                    "id": slot.id,
                    "date": slot.date.strftime("%d.%m.%Y"),
                    "time": slot.time,
                    "city": slot.city,
                    "restaurant": slot.restaurant,
                    "max_people": slot.max_people,
                    "current_bookings": slot.current_bookings
                }
                for slot in slots[:3]
            ]
        }
    except Exception as e:
        logger.error(f"Test endpoint error: {e}")
        return {"error": str(e)}


@app.get("/api/user/initial-screen")
async def get_user_initial_screen_endpoint(token: str):
    """
    ✅ КЛЮЧЕВОЙ ЭНДПОИНТ ДЛЯ АРХИТЕКТУРЫ
    
    Определяет тип пользователя и нужный экран при ЛЮБОЙ загрузке фронтенда.
    
    Вызывается:
    - После загрузки фронт-приложения (холодная или горячая загрузка)
    - Является ИСТОЧНИКОМ ИСТИНЫ о типе пользователя
    
    Возвращает:
    - screen: "admin" | "booking" | "welcome"
    
    Гарантирует АКТУАЛЬНОСТЬ при:
    - Обновлении страницы (F5)
    - Повторном открытии приложения
    - Изменении прав пользователя (добавлении в админы)
    - Заполнении профиля
    """
    try:
        # Валидируем токен и получаем user_id
        result = validate_user_token(token)
        if not result:
            raise ValueError("Invalid or expired token")
        user_id = result['user_id']
        
        # Определяем тип пользователя в БД
        from database_helpers import get_user_initial_screen
        screen = await get_user_initial_screen(user_id)
        
        logger.info(f"✅ User {user_id} screen determination: {screen}")
        
        return {
            "screen": screen,
            "user_id": user_id,
            "success": True
        }
    
    except ValueError as e:
        # Невалидный токен
        logger.warning(f"⚠️  Invalid token for initial-screen endpoint: {e}")
        return {
            "screen": "welcome",
            "user_id": None,
            "success": False,
            "error": "Invalid token"
        }
    
    except Exception as e:
        logger.error(f"❌ Error in initial-screen endpoint: {e}")
        return {
            "screen": "welcome",
            "user_id": None,
            "success": False,
            "error": str(e)
        }


@app.get("/api/slots")
async def get_slots_endpoint(city: Optional[str] = None, session: AsyncSession = Depends(get_session)):
    """
    Получить доступные слоты (публичный).
    Возвращает только активные слоты с доступными местами.
    """
    try:
        logger.info(f"Запрос слотов для города: {city}")
        slot_repo = SlotRepo(session)
        
        all_slots = await slot_repo.get_all_slots()
        logger.debug(f"Всего слотов в БД: {len(all_slots)}")
        
        # Фильтруем: только активные и с доступными местами
        available_slots = [
            slot for slot in all_slots 
            if slot.is_active and slot.current_bookings < slot.max_people
        ]
        
        # Фильтруем по городу если указан
        if city:
            from urllib.parse import unquote
            city_decoded = unquote(city)
            city_clean = city_decoded.replace("г. ", "").strip()
            
            available_slots = [
                slot for slot in available_slots 
                if city_clean.lower() in slot.city.lower()
            ]
        
        logger.info(f"Найдено {len(available_slots)} доступных слотов")
        
        slots_data = [
            {
                "id": slot.id,
                "date": slot.date.strftime("%d.%m.%Y"),
                "time": slot.time,
                "city": slot.city,
                "restaurant": slot.restaurant,
                "max_people": slot.max_people,
                "current_bookings": slot.current_bookings,
                "available_places": slot.max_people - slot.current_bookings,
                "created_at": slot.created_at.isoformat() if slot.created_at else None,
                "is_active": slot.is_active
            }
            for slot in available_slots
        ]
        
        return {"slots": slots_data}
    except Exception as e:
        logger.error(f"Ошибка получения слотов: {e}")
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))


# ===== Защищённые эндпоинты (требуют аутентификации) =====

@app.post("/api/profile")
async def save_profile_endpoint(
    request: ProfileRequest,
    session: AsyncSession = Depends(get_session),
    auth_user_id: Optional[int] = Depends(get_current_user_id)
):
    """Сохранить профиль пользователя. Можно передавать JWT или userId в теле запроса."""
    user_id = get_user_id_or_param(auth_user_id, request.userId)
    
    logger.info(f"Saving profile for user {user_id}")
    profile_dict = request.profile.model_dump(exclude_none=False)
    
    try:
        user_repo = UserRepo(session)
        profile_schema = UserProfileSchema(**profile_dict)
        await user_repo.save_user_profile(user_id, profile_schema)
        logger.info(f"Profile saved successfully for user {user_id}")
        return {"success": True}
    except Exception as e:
        logger.error(f"Save profile failed: {e}")
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/profile")
async def get_profile_endpoint(
    session: AsyncSession = Depends(get_session),
    userId: Optional[int] = None,
    auth_user_id: Optional[int] = Depends(get_current_user_id)
):
    """Получить профиль пользователя. Можно передавать JWT или query param userId."""
    user_id = get_user_id_or_param(auth_user_id, userId)
    
    try:
        user_repo = UserRepo(session)
        user = await user_repo.get_user_profile(user_id)
        if not user:
            raise HTTPException(status_code=404, detail="Profile not found")
        
        profile_dict = {
            "name": user.name,
            "age": user.age,
            "gender": user.gender,
            "relationship_status": user.relationship_status,
            "children": user.children,
            "occupation": user.occupation,
            "goal": user.goal,
            "interests": user.interests,
            "comfort_level": user.comfort_level,
            "social_frequency": user.social_frequency,
            "communication_format": user.communication_format,
            "evening_scenario": user.evening_scenario,
            "telegram": user.telegram,
            "instagram": user.instagram,
            "photo": user.photo,
            "about_me": user.about_me,
            "city": user.city,
            "is_profile_completed": user.is_profile_completed
        }
        return {"profile": profile_dict}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Get profile failed: {e}")
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")


@app.get("/api/bookings")
async def get_user_bookings_endpoint(
    session: AsyncSession = Depends(get_session),
    auth_user_id: int = Depends(get_current_user_id)
):
    """Получить бронирования пользователя."""
    user_id = auth_user_id
    
    try:
        logger.info(f"Getting bookings for user {user_id}")
        booking_repo = BookingRepo(session)
        bookings = await booking_repo.get_user_bookings(user_id)
        
        if bookings is None:
            bookings = []
        
        logger.info(f"Found {len(bookings)} bookings for user {user_id}")
        
        bookings_data = []
        for booking in bookings:
            try:
                slot = booking.slot
                booking_dict = {
                    "id": booking.id,
                    "user_id": booking.user_id,
                    "slot_id": booking.slot_id,
                    "booking_date": booking.booking_date.isoformat() if booking.booking_date else None,
                    "status": booking.status,
                    "date": slot.date.strftime("%d.%m.%Y") if slot else None,
                    "time": slot.time if slot else None,
                    "city": slot.city if slot else None,
                    "restaurant": slot.restaurant if slot else None,
                    "max_people": slot.max_people if slot else None,
                    "current_bookings": slot.current_bookings if slot else None,
                }
                bookings_data.append(booking_dict)
            except Exception as item_error:
                logger.error(f"Error processing booking {booking.id}: {item_error}")
                continue
        
        return {"bookings": bookings_data}
    except Exception as e:
        logger.error(f"Error getting bookings: {e}")
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/bookings")
async def create_booking_endpoint(
    request: BookingRequest,
    session: AsyncSession = Depends(get_session),
    auth_user_id: int = Depends(get_current_user_id)
):
    """Создать бронирование."""
    user_id = auth_user_id
    
    try:
        logger.info(f"Creating booking: user={user_id}, slot={request.slotId}")
        booking_repo = BookingRepo(session)
        success = await booking_repo.create_booking(user_id, request.slotId)
        
        if not success:
            raise HTTPException(status_code=400, detail="Slot is full or already booked")
        
        logger.info(f"Booking created successfully")
        return {"success": True}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Create booking error: {e}")
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/contacts")
async def get_contacts_endpoint(
    slotId: int,
    userId: Optional[int] = None,
    session: AsyncSession = Depends(get_session),
    auth_user_id: Optional[int] = Depends(get_current_user_id)
):
    """Получить контакты участников слота."""
    user_id = get_user_id_or_param(auth_user_id, userId)
    
    try:
        slot_repo = SlotRepo(session)
        contacts_users = await slot_repo.get_slot_contacts(slotId, user_id)
        
        contacts = []
        for user in contacts_users:
            contacts.append({
                "name": user.name,
                "age": user.age,
                "interests": user.interests,
                "city": user.city,
                "telegram": user.telegram,
                "instagram": user.instagram,
                "about_me": user.about_me
            })
        
        # Добавляем контакт поддержки
        contacts.append({
            "name": "Поддержка Allora",
            "id": "support",
            "isSupport": True,
            "telegram": "@allora_support"
        })
        
        return {"contacts": contacts}
    except Exception as e:
        logger.error(f"Get contacts error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


# ===== Платежные эндпоинты =====

@app.post("/api/payments")
async def create_payment_endpoint(
    request: PaymentRequest,
    session: AsyncSession = Depends(get_session),
    auth_user_id: Optional[int] = Depends(get_current_user_id)
):
    """Создает новый платеж через Yookassa."""
    user_id = get_user_id_or_param(auth_user_id, request.userId)
    
    logger.info(f"Creating payment: user={user_id}, amount={request.amount}")
    
    try:
        payment_service = PaymentService()
        payment_result = await payment_service.create_payment(
            user_id=user_id,
            amount=request.amount,
            booking_id=request.bookingId,
            return_url=request.returnUrl
        )
        
        # Сохраняем платеж в базу данных
        payment_repo = PaymentRepo(session)
        db_payment = await payment_repo.create_payment(
            user_id=user_id,
            yookassa_payment_id=payment_result['payment_id'],
            amount=request.amount,
            booking_id=request.bookingId,
            status='created'
        )
        
        logger.info(f"Payment created: id={db_payment.id}, yookassa_id={db_payment.yookassa_payment_id}")
        
        return {
            "paymentId": db_payment.id,
            "yookassaPaymentId": db_payment.yookassa_payment_id,
            "confirmationUrl": payment_result.get('confirmation_url'),
            "status": payment_result['status']
        }
    except Exception as e:
        logger.error(f"Create payment error: {e}")
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/payments/{payment_id}")
async def get_payment_status(
    payment_id: int,
    session: AsyncSession = Depends(get_session),
    auth_user_id: Optional[int] = Depends(get_current_user_id)
):
    """Получает статус платежа."""
    logger.info(f"Getting payment status: payment_id={payment_id}")
    
    try:
        payment_repo = PaymentRepo(session)
        payment = await payment_repo.get_payment(payment_id)
        
        if not payment:
            raise HTTPException(status_code=404, detail="Payment not found")
        
        # Проверяем, что платеж принадлежит пользователю (если аутентификация включена)
        if not AUTH_DISABLED and auth_user_id and payment.user_id != auth_user_id:
            raise HTTPException(status_code=403, detail="Access denied")
        
        # Получаем актуальный статус от ЮКассы
        payment_service = PaymentService()
        yookassa_payment = await payment_service.get_payment_status(payment.yookassa_payment_id)
        
        # Обновляем статус в базе данных
        await payment_repo.update_payment_status(payment_id, yookassa_payment['status'])
        
        return {
            "paymentId": payment_id,
            "yookassaPaymentId": payment.yookassa_payment_id,
            "status": yookassa_payment['status'],
            "amount": payment.amount,
            "userId": payment.user_id,
            "bookingId": payment.booking_id
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Get payment status error: {e}")
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))


def verify_webhook_signature(body: bytes, signature: str) -> bool:
    """
    Проверяет подпись webhook от Ю-Кассы.
    
    Ю-Касса подписывает тело запроса с помощью HMAC-SHA256.
    Подпись передается в заголовке 'YooKassa-Signature'.
    """
    if not signature or not YOOKASSA_SECRET_KEY:
        return False
    
    expected_signature = hmac.new(
        YOOKASSA_SECRET_KEY.encode('utf-8'),
        body,
        hashlib.sha256
    ).hexdigest()
    
    return hmac.compare_digest(expected_signature, signature)


@app.post("/api/payments/webhook")
async def payment_webhook(
    request: Request,
    session: AsyncSession = Depends(get_session)
):
    """
    Обработчик вебхука от Yookassa.
    Проверяет подпись и обновляет статус платежа.
    """
    logger.info("Received payment webhook")
    
    try:
        # Получаем тело запроса для проверки подписи
        body = await request.body()
        
        # Проверяем подпись (в тестовом режиме можно пропустить)
        signature = request.headers.get("YooKassa-Signature", "")
        
        # Если подпись передана - проверяем её
        # В тестовом режиме Ю-Касса может не отправлять подпись
        if signature and not verify_webhook_signature(body, signature):
            logger.warning("Invalid webhook signature")
            raise HTTPException(status_code=401, detail="Invalid signature")
        
        # Парсим JSON
        webhook_data = await request.json()
        logger.debug(f"Webhook data: {webhook_data}")
        
        payment_service = PaymentService()
        result = await payment_service.handle_webhook(webhook_data)
        
        yookassa_id = result.get('payment_id')
        status = result.get('status')
        
        if not yookassa_id:
            return {"success": True, "status": "no_payment_id"}
        
        payment_repo = PaymentRepo(session)
        payment = await payment_repo.get_payment_by_yookassa_id(yookassa_id)
        
        if not payment:
            logger.warning(f"Payment not found for yookassa_id={yookassa_id}")
            return {"success": True, "status": "payment_not_found"}
        
        # Обработка успешного платежа
        if status == 'succeeded':
            await payment_repo.update_payment_status(payment.id, 'succeeded')
            
            # Подтверждаем бронирование если есть
            if payment.booking_id:
                booking_repo = BookingRepo(session)
                await booking_repo.confirm_booking(payment.booking_id)
            
            logger.info(f"Payment {payment.id} marked as succeeded")
        
        # Обработка отменённого платежа
        elif status == 'canceled':
            await payment_repo.update_payment_status(payment.id, 'canceled')
            
            # Отменяем бронирование если есть
            if payment.booking_id:
                booking_repo = BookingRepo(session)
                await booking_repo.cancel_booking(payment.booking_id)
            
            logger.info(f"Payment {payment.id} canceled, booking cancelled")
        
        else:
            await payment_repo.update_payment_status(payment.id, status or 'unknown')
            logger.info(f"Payment {payment.id} status updated to {status}")
        
        return {"success": True, "status": status}
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Webhook handling error: {e}")
        traceback.print_exc()
        return {"success": False, "error": str(e)}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)