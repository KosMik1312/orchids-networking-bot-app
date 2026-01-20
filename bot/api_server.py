from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
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

# Настройка кодировки для Windows
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')
sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding='utf-8', errors='replace')

app = FastAPI(title="Orchids Networking Bot API")

# CORS для MiniApp
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://orchids-networking-bot-app.vercel.app",
        "https://*.ngrok.io",
        "https://*.loca.lt",
        "http://localhost:3000",
        "*"  # Временно для отладки
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
    print(f"[PROFILE] Saving profile for user {request.userId}")
    print(f"[PROFILE] Data: {request.profile.dict()}")
    try:
        user_repo = UserRepo(session)
        profile_schema = UserProfileSchema(**request.profile.dict())
        await user_repo.save_user_profile(request.userId, profile_schema)
        print(f"[PROFILE] Profile saved successfully")
        return {"success": True}
    except Exception as e:
        print(f"[ERROR] Save profile failed: {e}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/profile")
async def get_profile_endpoint(userId: int, session: AsyncSession = Depends(get_session)):
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
    try:
        print(f"[SLOTS] Request for city: {city}")
        slot_repo = SlotRepo(session)
        slots = await slot_repo.get_all_slots()
        print(f"[SLOTS] Found {len(slots)} slots")
        
        if city:
            try:
                from urllib.parse import unquote
                city_decoded = unquote(city)
                print(f"[SLOTS] Decoded city: {city_decoded}")
                
                # Remove prefix "g. " for comparison
                city_clean = city_decoded.replace("г. ", "").strip()
                print(f"[SLOTS] Clean city: {city_clean}")
                
                slots = [slot for slot in slots if city_clean.lower() in slot.city.lower()]
            except Exception as decode_error:
                print(f"[SLOTS] Decode error: {decode_error}")
                slots = [slot for slot in slots if city.lower() in slot.city.lower()]
            
            print(f"[SLOTS] After filter: {len(slots)} slots")
        
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
                "created_at": slot.created_at.isoformat() if slot.created_at else None,
                "is_active": slot.is_active
            }
            for slot in slots
        ]
        
        return {"slots": slots_data}
    except Exception as e:
        print(f"[ERROR] Get slots failed: {e}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/bookings")
async def get_user_bookings_endpoint(userId: int, session: AsyncSession = Depends(get_session)):
    try:
        booking_repo = BookingRepo(session)
        bookings = await booking_repo.get_user_bookings(userId)
        
        # Конвертируем объекты в словари
        bookings_data = [
            {
                "id": booking.id,
                "user_id": booking.user_id,
                "slot_id": booking.slot_id,
                "booking_date": booking.booking_date.isoformat() if booking.booking_date else None,
                "status": booking.status,
                "date": booking.slot.date,
                "time": booking.slot.time,
                "city": booking.slot.city,
                "restaurant": booking.slot.restaurant,
                "max_people": booking.slot.max_people,
                "current_bookings": booking.slot.current_bookings
            }
            for booking in bookings
        ]
        return {"bookings": bookings_data}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/bookings")
async def create_booking_endpoint(request: BookingRequest, session: AsyncSession = Depends(get_session)):
    try:
        booking_repo = BookingRepo(session)
        success = await booking_repo.create_booking(request.userId, request.slotId)
        
        if not success:
            raise HTTPException(status_code=400, detail="Slot is full or already booked")
        
        return {"success": True}
    except Exception as e:
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