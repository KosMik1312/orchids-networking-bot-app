from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel
from typing import Optional, List
import sys
import io
from sqlalchemy.ext.asyncio import AsyncSession

from db.session import init_db, get_session
from db.repository import UserRepo, SlotRepo, BookingRepo
from db.models import User, DinnerSlot, Booking
from schemas import UserProfile as UserProfileSchema
from config import DATABASE_NAME
from auth_token import validate_user_token

# Настройка кодировки для Windows
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')
sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding='utf-8', errors='replace')

app = FastAPI(title="Orchids Networking Bot API")

# Security для токенов
security = HTTPBearer()

# Функция для извлечения user_id из токена
async def get_user_id_from_token(credentials: Optional[HTTPAuthorizationCredentials] = Depends(security)) -> int:
    """
    Извлекает user_id из JWT токена в заголовке Authorization.
    Если токен не предоставлен или невалиден, выбрасывает HTTPException.
    """
    if not credentials:
        raise HTTPException(status_code=401, detail="Missing authorization token")
    
    token = credentials.credentials
    result = validate_user_token(token)
    
    if not result:
        raise HTTPException(status_code=401, detail="Invalid or expired token")
    
    return result['user_id']

# CORS для MiniApp
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://orchids-networking-bot-app.vercel.app",
        "https://leracinema.ru",
        "https://www.leracinema.ru"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Pydantic модели
class UserProfile(BaseModel):
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

class ProfileRequest(BaseModel):
    userId: int
    profile: UserProfile

class BookingRequest(BaseModel):
    userId: int
    slotId: int

# API эндпоинты
@app.on_event("startup")
async def startup():
    await init_db()

@app.post("/api/profile")
async def save_profile_endpoint(request: ProfileRequest, session: AsyncSession = Depends(get_session)):
    print(f"\n[API] === SAVE PROFILE START ===")
    print(f"[API] User ID: {request.userId}")
    print(f"[API] Request profile dict: {request.profile.dict()}")
    print(f"[API] Request profile dict (exclude_none): {request.profile.dict(exclude_none=True)}")
    try:
        user_repo = UserRepo(session)
        profile_schema = UserProfileSchema(**request.profile.dict())
        print(f"[API] Profile schema created: {profile_schema}")
        result = await user_repo.save_user_profile(request.userId, profile_schema)
        print(f"[API] Profile saved successfully, returning success response")
        print(f"[API] === SAVE PROFILE END ===\n")
        return {"success": True}
    except Exception as e:
        print(f"[ERROR] Save profile failed: {e}")
        import traceback
        traceback.print_exc()
        print(f"[API] === SAVE PROFILE ERROR ===\n")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/profile")
async def get_profile_endpoint(
    userId: Optional[int] = None,
    session: AsyncSession = Depends(get_session),
    user_id_from_token: Optional[int] = Depends(lambda: None)
):
    """
    Получить профиль пользователя.
    Может использовать либо userId query параметр, либо токен в заголовке Authorization.
    """
    # Если передан токен в заголовке, приоритет выше
    try:
        credentials = None
        # Попытка получить токен из заголовков
        # Note: это сделано для совместимости, нужно улучшить
        if not userId:
            raise HTTPException(status_code=400, detail="userId or token required")
    except:
        pass
    
    if not userId:
        raise HTTPException(status_code=400, detail="userId or token required")
    
    try:
        user_repo = UserRepo(session)
        user = await user_repo.get_user_profile(userId)
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
            "city": user.city
        }
        return {"profile": profile_dict}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/test")
async def test_endpoint(session: AsyncSession = Depends(get_session)):
    """Тестовый эндпоинт для проверки"""
    try:
        slot_repo = SlotRepo(session)
        user_repo = UserRepo(session)
        slots = await slot_repo.get_all_slots()
        users_count = await user_repo.get_total_count()
        return {
            "status": "OK", 
            "slots_count": len(slots),
            "users_count": users_count,
            "slots": [
                {
                    "id": slot.id,
                    "date": slot.date,
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
        return {"error": str(e)}

@app.get("/api/slots")
async def get_slots_endpoint(city: Optional[str] = None, session: AsyncSession = Depends(get_session)):
    """
    Получить доступные слоты.
    Возвращает только активные слоты с доступными местами.
    Если указан город - фильтрует по городу.
    """
    try:
        print(f"[SLOTS] Запрос слотов для города: {city}")
        slot_repo = SlotRepo(session)
        
        # Получаем ВСЕ слоты
        all_slots = await slot_repo.get_all_slots()
        print(f"[SLOTS] Всего слотов в БД: {len(all_slots)}")
        
        # Фильтруем: только активные и с доступными местами
        available_slots = [
            slot for slot in all_slots 
            if slot.is_active and slot.current_bookings < slot.max_people
        ]
        print(f"[SLOTS] Доступные слоты (активные + есть места): {len(available_slots)}")
        
        # Фильтруем по городу если указан
        if city:
            try:
                from urllib.parse import unquote
                city_decoded = unquote(city)
                print(f"[SLOTS] Декодированный город: {city_decoded}")
                
                # Убираем префикс "г. " для сравнения
                city_clean = city_decoded.replace("г. ", "").strip()
                print(f"[SLOTS] Очищенный город: {city_clean}")
                
                available_slots = [
                    slot for slot in available_slots 
                    if city_clean.lower() in slot.city.lower()
                ]
            except Exception as decode_error:
                print(f"[SLOTS] Ошибка декодирования города: {decode_error}")
                available_slots = [
                    slot for slot in available_slots 
                    if city.lower() in slot.city.lower()
                ]
        
        print(f"[SLOTS] Слотов после фильтрации по городу: {len(available_slots)}")
        
        # Конвертируем объекты в словари
        slots_data = [
            {
                "id": slot.id,
                "date": slot.date,
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
        print(f"[ERROR] Ошибка получения слотов: {e}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/bookings")
async def get_user_bookings_endpoint(userId: int, session: AsyncSession = Depends(get_session)):
    try:
        print(f"[BOOKINGS] Получение бронирований для пользователя: {userId}")
        booking_repo = BookingRepo(session)
        bookings = await booking_repo.get_user_bookings(userId)
        
        # Защита от None
        if bookings is None:
            print(f"[BOOKINGS] Функция вернула None, используем пустой список")
            bookings = []
        
        print(f"[BOOKINGS] Найдено {len(bookings)} бронирований для пользователя {userId}")
        
        # Конвертируем объекты в словари
        bookings_data = []
        for booking in bookings:
            try:
                booking_dict = {
                    "id": booking.id,
                    "user_id": booking.user_id,
                    "slot_id": booking.slot_id,
                    "booking_date": booking.booking_date.isoformat() if booking.booking_date else None,
                    "status": booking.status,
                    "date": booking.slot.date if booking.slot else None,
                    "time": booking.slot.time if booking.slot else None,
                    "city": booking.slot.city if booking.slot else None,
                    "restaurant": booking.slot.restaurant if booking.slot else None,
                    "max_people": booking.slot.max_people if booking.slot else None,
                    "current_bookings": booking.slot.current_bookings if booking.slot else None
                }
                bookings_data.append(booking_dict)
            except Exception as item_error:
                print(f"[BOOKINGS] Ошибка при обработке бронирования {booking.id}: {item_error}")
                continue
        
        return {"bookings": bookings_data}
    except Exception as e:
        print(f"[ERROR] Ошибка получения бронирований: {e}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/bookings")
async def create_booking_endpoint(request: BookingRequest, session: AsyncSession = Depends(get_session)):
    try:
        print(f"\n[API BOOKING] === CREATE BOOKING START ===")
        print(f"[API BOOKING] User ID: {request.userId}, Slot ID: {request.slotId}")
        booking_repo = BookingRepo(session)
        success = await booking_repo.create_booking(request.userId, request.slotId)
        print(f"[API BOOKING] Result: {success}")
        
        if not success:
            print(f"[API BOOKING] === BOOKING FAILED ===\n")
            raise HTTPException(status_code=400, detail="Slot is full or already booked")
        
        print(f"[API BOOKING] === BOOKING SUCCESS ===\n")
        return {"success": True}
    except HTTPException:
        raise
    except Exception as e:
        print(f"[API BOOKING] === ERROR ===")
        print(f"[API BOOKING] Exception: {e}")
        import traceback
        traceback.print_exc()
        print(f"[API BOOKING] === ERROR END ===\n")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/contacts")
async def get_contacts_endpoint(slotId: int, userId: int, session: AsyncSession = Depends(get_session)):
    try:
        slot_repo = SlotRepo(session)
        contacts_users = await slot_repo.get_slot_contacts(slotId, userId)
        
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
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)