"""
FastAPI сервер для Orchids Networking Bot.
Обновлённая версия с:
- JWT аутентификацией
- Централизованным логированием
- Валидацией webhook
- Обработкой отмены платежа
- APScheduler для проверки pending платежей
"""

import os
import traceback
import hashlib
import hmac
from typing import Optional, List
from datetime import datetime, timedelta

from fastapi import FastAPI, HTTPException, Depends, Header, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from contextlib import asynccontextmanager
from pydantic import BaseModel, ConfigDict
from sqlalchemy.ext.asyncio import AsyncSession
from apscheduler.schedulers.asyncio import AsyncIOScheduler

from db.session import init_db, get_session
from db.repository import UserRepo, SlotRepo, BookingRepo, PaymentRepo, PromotionRepo
from db.models import User, DinnerSlot, Booking
from schemas import UserProfile as UserProfileSchema
from config import DATABASE_NAME, SECRET_KEY, AUTH_DISABLED
from auth_token import validate_init_data, validate_auth_header
from utils import format_date
from payments.payment_service import PaymentService
from payments.payment_config import YOOKASSA_SECRET_KEY
from logger import get_api_logger
from admin_api import admin_router_api

# Логгер для API
logger = get_api_logger()

# Глобальный scheduler (инициализируется в lifespan)
scheduler = None


async def check_pending_payments():
    """
    🔄 Проверяет платежи со статусом 'pending' или 'created', которые старше 5 минут.
    Если статус в ЮКассе 'succeeded', а бронирование не создано - создает его.
    
    Запускается каждые 5 минут.
    """
    logger.info("🔍 [SCHEDULER] Starting pending payments check...")
    
    try:
        # Получаем БД сессию
        from db.session import engine
        from sqlalchemy.ext.asyncio import AsyncSession
        from sqlalchemy.orm import sessionmaker
        
        # Создаём сессию для scheduler'а
        async_session = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)
        
        async with async_session() as session:
            payment_repo = PaymentRepo(session)
            
            # Получаем платежи старше 5 минут со статусом pending/created и без бронирования
            pending_payments = await payment_repo.get_pending_payments(minutes=5)
            
            if not pending_payments:
                logger.debug("✅ [SCHEDULER] No pending payments found")
                return
            
            logger.warning(f"⚠️ [SCHEDULER] Found {len(pending_payments)} pending payments. Checking with YooKassa...")
            
            for payment in pending_payments:
                try:
                    logger.info(f"   📌 Checking payment {payment.id} (yookassa_id={payment.yookassa_payment_id})")
                    
                    # Проверяем статус в ЮКассе
                    payment_service = PaymentService()
                    yookassa_payment = await payment_service.get_payment_status(payment.yookassa_payment_id)
                    
                    logger.info(f"      YooKassa status: {yookassa_payment.get('status')}")
                    
                    # Если статус succeeded, но бронирования нет - создаём
                    if yookassa_payment.get('status') == 'succeeded' and not payment.booking_id:
                        logger.warning(f"   ⚠️ Payment {payment.id} succeeded but booking is missing! Creating booking...")
                        
                        # Обновляем статус платежа
                        await payment_repo.update_payment_status(payment.id, 'succeeded')
                        
                        # Создаём бронирование
                        booking_repo = BookingRepo(session)
                        booking = await booking_repo.create_booking_after_payment(
                            user_id=payment.user_id,
                            slot_id=payment.slot_id,
                            payment_id=payment.id
                        )
                        
                        if booking:
                            logger.info(f"   ✅ [SCHEDULER] Booking created for payment {payment.id}: booking_id={booking.id}")
                        else:
                            logger.error(f"   ❌ [SCHEDULER] Failed to create booking for payment {payment.id}")
                    
                    # Если статус failed/canceled - обновляем статус
                    elif yookassa_payment.get('status') in ['failed', 'canceled']:
                        logger.info(f"   ❌ [SCHEDULER] Payment {payment.id} is {yookassa_payment.get('status')} - updating status")
                        await payment_repo.update_payment_status(payment.id, yookassa_payment.get('status'))
                    
                    else:
                        logger.debug(f"   ℹ️ Payment {payment.id} status is {yookassa_payment.get('status')} - no action needed")
                
                except Exception as item_error:
                    logger.error(f"   ❌ [SCHEDULER] Error checking payment {payment.id}: {item_error}")
                    traceback.print_exc()
                    continue
            
            logger.info("✅ [SCHEDULER] Pending payments check completed")
    
    except Exception as e:
        logger.error(f"❌ [SCHEDULER] Error in check_pending_payments: {e}")
        traceback.print_exc()


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    logger.info("Starting FastAPI server...")
    await init_db()
    logger.info("✅ Database initialized")
    
    # Запускаем APScheduler для проверки pending платежей
    global scheduler
    scheduler = AsyncIOScheduler()
    
    # Добавляем job для проверки платежей каждые 5 минут
    scheduler.add_job(
        check_pending_payments,
        "interval",
        minutes=5,
        id="check_pending_payments",
        name="Check pending payments from Yookassa",
        replace_existing=True,
        max_instances=1  # Только одна инстанция одновременно
    )
    
    scheduler.start()
    logger.info("✅ APScheduler started - pending payments check enabled (every 5 minutes)")
    
    yield
    
    # Shutdown
    scheduler.shutdown(wait=False)
    logger.info("✅ APScheduler shutdown")
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

# ✅ ВАЖНО: Порядок middleware имеет значение!
# Middleware добавляются в стек, поэтому добавлять нужно от внутренних к внешним.
# CORS должен быть СНАРУЖИ (обрабатываться первым)
# Logging должен быть ВНУТРИ (обрабатываться вторым после CORS)
# Поэтому добавляем в ОБРАТНОМ порядке: сначала Logging, потом CORS

app.add_middleware(LoggingMiddleware)

# CORS для MiniApp - должен быть добавлен ПОСЛЕ LoggingMiddleware
# (будет выполняться ПЕРЕД ним в цепи обработки)
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://orchids-networking-bot-app.vercel.app",
        "https://leracinema.ru",
        "https://www.leracinema.ru",
        "http://localhost:3000",  # Для локальной разработки
        "http://81.177.6.20:8000",  # IP сервера
        "http://81.177.6.20",  # IP сервера без порта
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Подключаем админские эндпоинты
app.include_router(admin_router_api)

# Настройки безопасности для токенов
security = HTTPBearer(auto_error=False)


async def get_current_user_id(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(security)
) -> Optional[int]:
    """
    🎯 ГИБРИДНАЯ АУТЕНТИФИКАЦИЯ
    Извлекает user_id из:
    1. Telegram initData (продакшн через Telegram MiniApp)
    2. JWT токена (локальное тестирование / альтернативные клиенты)
    
    Соответствует документации: https://core.telegram.org/bots/webapps#validating-data-received-via-the-mini-app
    """
    
    # Если токен не передан — возвращаем None (некоторые эндпоинты работают с query param userId)
    if not credentials:
        return None

    token = credentials.credentials
    
    # 🔐 Используем гибридную валидацию
    result = validate_auth_header(token)

    if not result:
        raise HTTPException(status_code=401, detail="Invalid authentication - neither initData nor JWT token valid")

    return result['user_id']


def get_user_id_or_param(auth_user_id: Optional[int], param_user_id: Optional[int]) -> int:
    """Возвращает user_id приоритетно из токена, затем из query param; иначе бросает 401."""
    if auth_user_id:
        return auth_user_id
    if param_user_id:
        return param_user_id
    raise HTTPException(status_code=401, detail="Missing user identification")


# ===== Pydantic модели =====

class ProfileRequest(BaseModel):
    userId: Optional[int] = None
    profile: UserProfileSchema


class BookingRequest(BaseModel):
    slotId: int


class PaymentRequest(BaseModel):
    amount: str
    slotId: Optional[int] = None
    promotionId: Optional[int] = None
    returnUrl: str


class ContactsRequest(BaseModel):
    slotId: int


# ===== Pydantic модели (общие) =====

class InitDataRequest(BaseModel):
    initData: str
    mode: Optional[str] = "user"


# ===== Публичные эндпоинты (без аутентификации) =====

@app.get("/api/health")
async def health_check():
    """Проверка здоровья сервера (публичный)."""
    return {"status": "OK"}


@app.post("/api/debug/validate-initdata")
async def debug_validate_initdata(request: InitDataRequest):
    """
    ⚠️ DEBUG ENDPOINT - тестирование валидации initData.
    Это для локальной разработки и отладки.
    """
    logger.info(f"🔍 DEBUG: Validating initData")
    logger.info(f"   Full initData: {request.initData}")
    
    result = validate_init_data(request.initData)
    
    if result:
        logger.info(f"✅ DEBUG: InitData is valid for user {result['user_id']}")
        return {
            "valid": True,
            "user_id": result['user_id'],
            "user_data": result.get('user_data'),
        }
    else:
        logger.error(f"❌ DEBUG: InitData validation failed")
        return {
            "valid": False,
            "error": "InitData validation failed - see server logs for details"
        }


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
                    "price": slot.price,
                    "current_bookings": slot.current_bookings
                }
                for slot in slots[:3]
            ]
        }
    except Exception as e:
        logger.error(f"Test endpoint error: {e}")
        return {"error": str(e)}


@app.post("/api/user/initial-screen")
async def get_user_initial_screen_endpoint(
    request: InitDataRequest,
    user_id: Optional[int] = Depends(get_current_user_id),
    session: AsyncSession = Depends(get_session)
):
    """
    ✅ КЛЮЧЕВОЙ ЭНДПОИНТ ДЛЯ АРХИТЕКТУРЫ (ОБНОВЛЁН ДЛЯ ГИБРИДНОЙ АУТЕНТИФИКАЦИИ)
    
    🎯 Использует гибридную аутентификацию (документация Telegram API):
    - Telegram initData в Authorization заголовке (продакшн)
    - JWT токен в Authorization заголовке (локальное тестирование)
    
    Определяет тип пользователя и нужный экран при ЛЮБОЙ загрузке фронтенда.
    
    Вызывается:
    - После загрузки фронт-приложения (холодная или горячая загрузка)
    - Является ИСТОЧНИКОМ ИСТИНЫ о типе пользователя
    
    Возвращает:
    - screen: "admin" | "booking" | "welcome"
    """
    try:
        if not user_id:
            logger.warning("❌ No user_id from authentication")
            return {
                "screen": "welcome",
                "user_id": None,
                "success": False,
                "error": "Authentication failed"
            }
        
        logger.info(f"✅ User authenticated. user_id={user_id}")
        
        # Определяем тип пользователя в БД
        from database_helpers import get_user_initial_screen
        from config import ADMIN_IDS
        
        logger.info(f"🔍 Checking initial screen for user_id={user_id}")
        logger.info(f"📋 Current ADMIN_IDS from config: {ADMIN_IDS}, type={type(ADMIN_IDS)}")
        logger.info(f"❓ Is user_id {user_id} in ADMIN_IDS? {user_id in ADMIN_IDS}")
        
        screen = await get_user_initial_screen(user_id, request.mode)
        logger.info(f"✅ Determined screen for user {user_id}: {screen}")
        
        logger.info(f"📤 Returning response: screen={screen}, user_id={user_id}, success=True")
        
        return {
            "screen": screen,
            "user_id": user_id,
            "success": True
        }
    
    except Exception as e:
        import traceback
        logger.error(f"❌ Error in initial-screen endpoint: {e}")
        logger.error(f"Traceback: {traceback.format_exc()}")
        return {
            "screen": "welcome",
            "user_id": user_id,
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
        
        # NOTE: Пользователь хочет видеть все города на афише, 
        # поэтому фильтрацию по городу отключаем по умолчанию.
        # Если city передан, можем оставить его как опциональный фильтр, 
        # но AfishaScreen перестанет его присылать.
        if city and city != "all":
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
                "date": slot.date.isoformat(),
                "time": slot.time,
                "city": slot.city,
                "restaurant": slot.restaurant,
                "max_people": slot.max_people,
                "price": slot.price,
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


@app.get("/api/promotions")
async def get_promotions_endpoint(session: AsyncSession = Depends(get_session)):
    """Получить активные акции и предложения (публичный)."""
    try:
        logger.info("📦 Getting active promotions")
        promo_repo = PromotionRepo(session)
        promos = await promo_repo.get_active_promotions()

        promos_data = [
            {
                "id": p.id,
                "title": p.title,
                "description": p.description,
                "target_audience": p.target_audience,
                "price": p.price,
                "quantity": p.quantity,
                "validity_days": p.validity_days,
            }
            for p in promos
        ]

        logger.info(f"✅ Found {len(promos_data)} active promotions")
        return {"promotions": promos_data}
    except Exception as e:
        logger.error(f"Get promotions error: {e}")
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))


# ===== Защищённые эндпоинты (требуют аутентификации) =====

@app.post("/api/profile")
async def save_profile_endpoint(
    request: ProfileRequest,
    user_id: Optional[int] = Depends(get_current_user_id),
    session: AsyncSession = Depends(get_session)
):
    """
    🎯 Сохранить профиль пользователя (ОБНОВЛЁН ДЛЯ ГИБРИДНОЙ АУТЕНТИФИКАЦИИ)
    
    Использует гибридную аутентификацию:
    - Telegram initData в Authorization заголовке (продакшн)
    - JWT токен в Authorization заголовке (локальное тестирование)
    """
    
    logger.info(f"📦 POST /api/profile called")
    
    if not user_id:
        logger.error(f"❌ Cannot extract user_id from Authorization header")
        raise HTTPException(status_code=401, detail="Invalid authentication")
    
    logger.info(f"📦 POST /api/profile for user {user_id}")
    profile_dict = request.profile.model_dump(exclude_none=True)
    logger.info(f"   Profile data keys: {list(profile_dict.keys())}")
    logger.info(f"   Profile data sample: name={profile_dict.get('name')}, age={profile_dict.get('age')}, gender={profile_dict.get('gender')}")
    
    try:
        user_repo = UserRepo(session)
        
        # ✅ Получаем или создаём пользователя
        user = await user_repo.get_user_profile(user_id)
        if not user:
            logger.info(f"👤 User {user_id} not found in DB, creating...")
            await user_repo.get_or_create_user(user_id)
            logger.info(f"✅ User {user_id} created")
        else:
            logger.info(f"👤 User {user_id} found in DB, updating...")
        
        profile_schema = UserProfileSchema(**profile_dict)
        logger.info(f"📝 Profile schema created with {len(profile_dict)} fields")
        
        saved_user = await user_repo.save_user_profile(user_id, profile_schema)
        logger.info(f"✅ Profile saved successfully for user {user_id}")
        logger.info(f"   Saved: name={saved_user.name}, age={saved_user.age}, gender={saved_user.gender}")
        logger.info(f"   is_profile_completed={saved_user.is_profile_completed}")
        
        return {"success": True}
    except Exception as e:
        logger.error(f"❌ Save profile failed for user {user_id}: {e}")
        import traceback
        logger.error(f"Traceback: {traceback.format_exc()}")
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/debug/profile-save")
async def debug_save_profile_endpoint(
    request: ProfileRequest,
    session: AsyncSession = Depends(get_session)
):
    """
    ⚠️ DEBUG ENDPOINT - сохранение профиля с тестовым user_id (для разработки).
    Использует userId из request.userId, игнорируя initData.
    """
    if not request.userId:
        raise HTTPException(status_code=400, detail="userId required for debug endpoint")
    
    user_id = request.userId
    logger.info(f"🔧 DEBUG: Saving profile for test user {user_id}")
    
    profile_dict = request.profile.model_dump(exclude_none=False)
    logger.info(f"   Profile keys: {list(profile_dict.keys())}")
    
    try:
        user_repo = UserRepo(session)
        
        user = await user_repo.get_user_profile(user_id)
        if not user:
            logger.info(f"   Creating new user {user_id}")
            await user_repo.get_or_create_user(user_id)
        
        profile_schema = UserProfileSchema(**profile_dict)
        saved_user = await user_repo.save_user_profile(user_id, profile_schema)
        
        logger.info(f"✅ DEBUG: Profile saved: name={saved_user.name}, completed={saved_user.is_profile_completed}")
        
        return {
            "success": True,
            "user_id": user_id,
            "profile_saved": {
                "name": saved_user.name,
                "age": saved_user.age,
                "gender": saved_user.gender,
                "is_profile_completed": saved_user.is_profile_completed
            }
        }
    except Exception as e:
        logger.error(f"❌ DEBUG: Save profile failed: {e}")
        logger.error(traceback.format_exc())
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/profile")
async def get_profile_endpoint(
    user_id: Optional[int] = Depends(get_current_user_id),
    session: AsyncSession = Depends(get_session),
    userId: Optional[int] = None
):
    """
    🎯 Получить профиль пользователя (ОБНОВЛЁН ДЛЯ ГИБРИДНОЙ АУТЕНТИФИКАЦИИ)
    
    Использует гибридную аутентификацию:
    - Telegram initData в Authorization заголовке (продакшн)
    - JWT токен в Authorization заголовке (локальное тестирование)
    """
    
    # Используем user_id из Authorization заголовка, или queryParam userId как fallback
    final_user_id = user_id or userId
    
    if not final_user_id:
        raise HTTPException(status_code=401, detail="Invalid authentication or missing userId")
    
    logger.info(f"📦 GET /api/profile called for user {final_user_id}")
    
    try:
        user_repo = UserRepo(session)
        user = await user_repo.get_user_profile(final_user_id)
        if not user:
            logger.warning(f"⚠️ Profile not found for user {final_user_id}")
            raise HTTPException(status_code=404, detail="Profile not found")
        
        logger.info(f"✅ Retrieved profile for user {final_user_id}, is_profile_completed={user.is_profile_completed}")
        
        profile_dict = {
            "name": user.name,
            "age": user.age,
            "gender": user.gender,
            "zodiac": user.zodiac,
            "relationship_status": user.relationship_status,
            "children": user.children,
            "occupation": user.occupation,
            "goal": user.goal,
            "interests": user.interests,
            "comfort_level": user.comfort_level,
            "social_frequency": user.social_frequency,
            # Map DB `communication_format` to frontend `format`
            "format": user.communication_format,
            "communication_format": user.communication_format,
            "evening_scenario": user.evening_scenario,
            "telegram": user.telegram,
            "instagram": user.instagram,
            "photo": user.photo,
            "about_me": user.about_me,
            "city": user.city,
            # BestInMeScreen fields
            "strengths": user.strengths,
            "weaknesses": user.weaknesses,
            "values": user.values,
            "love_language": user.love_language,
            "goals": user.goals,
            "dreams": user.dreams,
            # Meeting related
            "meeting_metro": user.meeting_metro,
            "meeting_days": user.meeting_days,
            "meeting_time_from": user.meeting_time_from,
            "meeting_time_to": user.meeting_time_to,
            "is_profile_completed": user.is_profile_completed
        }
        return {"profile": profile_dict}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Get profile failed: {e}")
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")


@app.delete("/api/profile")
async def delete_profile_endpoint(
    user_id: Optional[int] = Depends(get_current_user_id),
    session: AsyncSession = Depends(get_session)
):
    """
    🗑️ Удалить профиль пользователя (гибридная аутентификация)
    """
    if not user_id:
        raise HTTPException(status_code=401, detail="Invalid authentication")

    logger.info(f"🗑️ DELETE /api/profile called for user {user_id}")
    
    try:
        user_repo = UserRepo(session)
        success = await user_repo.delete_user(user_id)
        
        if not success:
            raise HTTPException(status_code=404, detail="User not found")
            
        return {"success": True, "message": "User profile and associated data deleted"}
    except Exception as e:
        logger.error(f"❌ Delete profile failed for user {user_id}: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/bookings/list")
async def get_user_bookings_endpoint(
    user_id: Optional[int] = Depends(get_current_user_id),
    session: AsyncSession = Depends(get_session)
):
    """Получить бронирования пользователя (гибридная аутентификация)."""
    try:
        if not user_id:
            logger.error("❌ Authentication failed for get bookings")
            raise HTTPException(status_code=401, detail="Invalid authentication")
        logger.info(f"📦 Getting bookings for user {user_id}")
        
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
                    "price": slot.price if slot else None,
                    "current_bookings": slot.current_bookings if slot else None,
                }
                bookings_data.append(booking_dict)
            except Exception as item_error:
                logger.error(f"Error processing booking {booking.id}: {item_error}")
                continue
        
        return {"bookings": bookings_data}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting bookings: {e}")
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/bookings")
async def create_booking_endpoint(
    request: BookingRequest,
    user_id: Optional[int] = Depends(get_current_user_id),
    session: AsyncSession = Depends(get_session)
):
    """🎯 Создать бронирование (ОБНОВЛЁН ДЛЯ ГИБРИДНОЙ АУТЕНТИФИКАЦИИ)
    
    Использует гибридную аутентификацию:
    - Telegram initData в Authorization заголовке (продакшн)
    - JWT токен в Authorization заголовке (локальное тестирование)
    """
    try:
        if not user_id:
            logger.error("❌ Authentication failed for create booking")
            raise HTTPException(status_code=401, detail="Invalid authentication")
        
        logger.info(f"📦 Creating booking: user={user_id}, slot={request.slotId}")
        
        booking_repo = BookingRepo(session)
        booking = await booking_repo.create_booking(user_id, request.slotId)
        
        if not booking:
            raise HTTPException(status_code=400, detail="Slot is full or already booked")
        
        logger.info(f"✅ Booking created successfully: id={booking.id}")
        return {"success": True, "bookingId": booking.id}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Create booking error: {e}")
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/contacts")
async def get_contacts_endpoint(
    request: ContactsRequest,
    user_id: Optional[int] = Depends(get_current_user_id),
    session: AsyncSession = Depends(get_session)
):
    """🎯 Получить контакты участников слота (ОБНОВЛЁН ДЛЯ ГИБРИДНОЙ АУТЕНТИФИКАЦИИ)
    
    Использует гибридную аутентификацию:
    - Telegram initData в Authorization заголовке (продакшн)
    - JWT токен в Authorization заголовке (локальное тестирование)
    """
    try:
        if not user_id:
            logger.error("❌ Authentication failed for get contacts")
            raise HTTPException(status_code=401, detail="Invalid authentication")
        
        logger.info(f"📦 Getting contacts for user {user_id}, slot {request.slotId}")
        
        slot_repo = SlotRepo(session)
        group_repo = GroupRepo(session)
        
        # Получаем ID всех «одногруппников» пользователя
        teammate_ids = await group_repo.get_teammate_ids(user_id)
        
        contacts_users = await slot_repo.get_slot_contacts(request.slotId, user_id)
        
        contacts = []
        for user in contacts_users:
            contacts.append({
                "id": user.user_id,
                "name": user.name,
                "age": user.age,
                "interests": user.interests,
                "city": user.city,
                "telegram": user.telegram,
                "instagram": user.instagram,
                "about_me": user.about_me,
                "photo": user.photo,
                "is_teammate": user.user_id in teammate_ids
            })
        
        # Добавляем контакт поддержки
        contacts.append({
            "name": "Поддержка Antre Club",
            "id": "support",
            "isSupport": True,
            "telegram": "@allora_support"
        })
        
        return {"contacts": contacts}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Get contacts error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


# ===== Избранное =====

@app.post("/api/favorites/toggle")
async def toggle_favorite_endpoint(
    slot_id: int,
    user_id: Optional[int] = Depends(get_current_user_id),
    session: AsyncSession = Depends(get_session)
):
    """Добавить/удалить слот из избранного."""
    try:
        if not user_id:
            raise HTTPException(status_code=401, detail="Invalid authentication")
        
        logger.info(f"📦 Toggle favorite: user={user_id}, slot={slot_id}")
        
        user_repo = UserRepo(session)
        favorites = await user_repo.toggle_favorite(user_id, slot_id)
        
        return {"success": True, "favorites": favorites}
    except ValueError as e:
        logger.error(f"Toggle favorite user error: {e}")
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        logger.error(f"Toggle favorite error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/favorites")
async def get_favorites_endpoint(
    user_id: Optional[int] = Depends(get_current_user_id),
    session: AsyncSession = Depends(get_session)
):
    """Получить список избранных слотов."""
    try:
        if not user_id:
            raise HTTPException(status_code=401, detail="Invalid authentication")
        
        logger.info(f"📦 Getting favorites for user {user_id}")
        
        user_repo = UserRepo(session)
        favorites_ids = await user_repo.get_favorites(user_id)
        logger.info(f"✅ Found {len(favorites_ids)} favorite IDs")
        
        slot_repo = SlotRepo(session)
        favorite_slots = await slot_repo.get_slots_by_ids(favorites_ids)
        
        slots_data = [
            {
                "id": slot.id,
                "date": slot.date.isoformat(),
                "time": slot.time,
                "city": slot.city,
                "restaurant": slot.restaurant,
                "max_people": slot.max_people,
                "price": slot.price,
                "current_bookings": slot.current_bookings,
                "available_places": slot.max_people - slot.current_bookings,
                "created_at": slot.created_at.isoformat() if slot.created_at else None,
                "is_active": slot.is_active
            }
            for slot in favorite_slots
        ]
        
        return {"favorites": slots_data}
    except Exception as e:
        logger.error(f"Get favorites error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


# ===== Платежные эндпоинты =====

@app.post("/api/payments")
async def create_payment_endpoint(
    request: PaymentRequest,
    user_id: Optional[int] = Depends(get_current_user_id),
    session: AsyncSession = Depends(get_session)
):
    """🎯 Создать платеж (ОБНОВЛЁН ДЛЯ ГИБРИДНОЙ АУТЕНТИФИКАЦИИ)
    
    Использует гибридную аутентификацию:
    - Telegram initData в Authorization заголовке (продакшн)
    - JWT токен в Authorization заголовке (локальное тестирование)
    """
    try:
        if not user_id:
            logger.error("❌ Authentication failed for create payment")
            raise HTTPException(status_code=401, detail="Invalid authentication")
        
        logger.info(f"💳 Creating payment: user={user_id}, amount={request.amount}")
        
        # Определяем цену из базы данных для безопасности
        slot_id_for_payment = request.slotId
        promotion_id_for_payment = request.promotionId

        if promotion_id_for_payment:
            # Оплата акции
            from db.models import Promotion as PromotionModel
            promo = await session.get(PromotionModel, promotion_id_for_payment)
            if not promo or not promo.is_active:
                raise HTTPException(status_code=404, detail="Promotion not found or inactive")
            secure_amount = str(promo.price)
            logger.info(f"💳 Promotion payment: promo_id={promotion_id_for_payment}, price={secure_amount}")
        elif slot_id_for_payment:
            # Оплата мероприятия (существующая логика)
            slot = await session.get(DinnerSlot, slot_id_for_payment)
            if not slot:
                raise HTTPException(status_code=404, detail="Slot not found")
            secure_amount = str(slot.price)
        else:
            raise HTTPException(status_code=400, detail="Either slotId or promotionId required")

        payment_service = PaymentService()
        payment_result = await payment_service.create_payment(
            user_id=user_id,
            amount=secure_amount,
            slot_id=slot_id_for_payment or 0,
            return_url=request.returnUrl
        )
        
        # Проверяем успешность создания платежа в Ю-Кассе
        if not payment_result.get('success'):
            error_msg = payment_result.get('error', 'Failed to create payment in YooKassa')
            logger.error(f"❌ YooKassa payment creation failed: {error_msg}")
            raise HTTPException(status_code=400, detail=error_msg)
            
        logger.info(f"✅ YooKassa payment created: {payment_result['payment_id']}")

        # Сохраняем платеж в базу данных
        payment_repo = PaymentRepo(session)
        db_payment = await payment_repo.create_payment(
            user_id=user_id,
            yookassa_payment_id=payment_result['payment_id'],
            amount=secure_amount,
            slot_id=slot_id_for_payment,
            status='created'
        )
        
        logger.info(f"Payment saved to DB: id={db_payment.id}, user={user_id}, slot={slot_id_for_payment}, promo={promotion_id_for_payment}")

        # Если это оплата акции — создаём запись о покупке после успешного создания платежа
        if promotion_id_for_payment:
            promo_repo = PromotionRepo(session)
            purchase = await promo_repo.create_purchase(
                user_id=user_id,
                promotion_id=promotion_id_for_payment,
                payment_id=db_payment.id,
            )
            if purchase:
                logger.info(f"✅ Promotion purchase created: id={purchase.id}")
        
        return {
            "paymentId": db_payment.id,
            "yookassaPaymentId": db_payment.yookassa_payment_id,
            "confirmationUrl": payment_result.get('confirmation_url'),
            "status": payment_result['status']
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Create payment error: {e}")
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
    Создает бронирование только после успешной оплаты.
    """
    logger.info("🔔 Received payment webhook")
    
    try:
        body = await request.body()
        signature = request.headers.get("YooKassa-Signature", "")
        
        if signature and not verify_webhook_signature(body, signature):
            logger.error("❌ Invalid webhook signature")
            raise HTTPException(status_code=401, detail="Invalid signature")

        payload = await request.json()
        payment_service = PaymentService()
        result = await payment_service.handle_webhook(payload)
        
        if not result.get("success"):
            return {"status": "ignored"}

        payment_repo = PaymentRepo(session)
        db_payment = await payment_repo.get_payment_by_yookassa_id(result["payment_id"])
        
        if not db_payment:
            logger.error(f"❌ Payment {result['payment_id']} not found in DB")
            return {"status": "error", "message": "Payment not found"}

        # Обновляем статус платежа
        await payment_repo.update_payment_status(db_payment.id, result["status"])
        
        # Если оплата прошла успешно - создаем бронирование
        if result["action"] == "confirm_booking":
            if not db_payment.booking_id:
                logger.info(f"✨ Payment successful! Creating booking for user={db_payment.user_id}, slot={db_payment.slot_id}")
                booking_repo = BookingRepo(session)
                booking = await booking_repo.create_booking_after_payment(
                    user_id=db_payment.user_id,
                    slot_id=db_payment.slot_id,
                    payment_id=db_payment.id
                )
                if booking:
                    logger.info(f"✅ Booking finalized: {booking.id}")
                else:
                    logger.error(f"❌ Failed to finalize booking for payment {db_payment.id}")
            else:
                logger.info(f"ℹ️ Booking {db_payment.booking_id} already exists for this payment")

        return {"status": "ok"}
        
    except Exception as e:
        logger.error(f"❌ Webhook error: {e}")
        traceback.print_exc()
        return {"status": "error", "message": str(e)}


@app.post("/api/payments/{payment_id}")
async def get_payment_status(
    payment_id: int,
    request: InitDataRequest,
    user_id: Optional[int] = Depends(get_current_user_id),
    session: AsyncSession = Depends(get_session)
):
    """🎯 Получить статус платежа (ОБНОВЛЁН ДЛЯ ГИБРИДНОЙ АУТЕНТИФИКАЦИИ)
    
    Использует гибридную аутентификацию:
    - Telegram initData в Authorization заголовке (продакшн)
    - JWT токен в Authorization заголовке (локальное тестирование)
    """
    logger.info(f"Getting payment status: payment_id={payment_id}")
    
    try:
        if not user_id:
            logger.error("❌ Authentication failed for get payment status")
            raise HTTPException(status_code=401, detail="Invalid authentication")
        
        payment_repo = PaymentRepo(session)
        payment = await payment_repo.get_payment(payment_id)
        
        if not payment:
            raise HTTPException(status_code=404, detail="Payment not found")
        
        # Проверяем, что платеж принадлежит пользователю
        if payment.user_id != user_id:
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


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)