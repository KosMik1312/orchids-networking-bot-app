from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, List
import asyncio
import sys
import io
from database import (
    init_db, save_user_profile, get_user_profile,
    create_slot, get_all_slots, get_users_count,
    get_active_slots_count, get_total_bookings_count
)
import aiosqlite
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
async def save_profile_endpoint(request: ProfileRequest):
    print(f"[PROFILE] Saving profile for user {request.userId}")
    print(f"[PROFILE] Data: {request.profile.dict()}")
    try:
        await save_user_profile(request.userId, request.profile.dict())
        print(f"[PROFILE] Profile saved successfully")
        return {"success": True}
    except Exception as e:
        print(f"[ERROR] Save profile failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/profile")
async def get_profile_endpoint(userId: int):
    try:
        profile = await get_user_profile(userId)
        if not profile:
            raise HTTPException(status_code=404, detail="Profile not found")
        
        # Конвертируем tuple в dict
        profile_dict = {
            "name": profile[1],
            "age": profile[2],
            "interests": profile[3]
        }
        return {"profile": profile_dict}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/test")
async def test_endpoint():
    """Тестовый эндпоинт для проверки"""
    try:
        slots = await get_all_slots()
        users_count = await get_users_count()
        return {
            "status": "OK", 
            "slots_count": len(slots),
            "users_count": users_count,
            "slots": slots[:3]  # Первые 3 слота для проверки
        }
    except Exception as e:
        return {"error": str(e)}

@app.get("/api/slots")
async def get_slots_endpoint(city: Optional[str] = None):
    try:
        print(f"[SLOTS] Request for city: {city}")
        slots = await get_all_slots()
        print(f"[SLOTS] Found {len(slots)} slots")
        
        if city:
            try:
                from urllib.parse import unquote
                city_decoded = unquote(city)
                print(f"[SLOTS] Decoded city: {city_decoded}")
                
                # Remove prefix "g. " for comparison
                city_clean = city_decoded.replace("г. ", "").strip()
                print(f"[SLOTS] Clean city: {city_clean}")
                
                slots = [slot for slot in slots if city_clean.lower() in slot['city'].lower()]
            except Exception as decode_error:
                print(f"[SLOTS] Decode error: {decode_error}")
                slots = [slot for slot in slots if city.lower() in slot['city'].lower()]
            
            print(f"[SLOTS] After filter: {len(slots)} slots")
        
        return {"slots": slots}
    except Exception as e:
        print(f"[ERROR] Get slots failed: {e}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/bookings")
async def get_user_bookings_endpoint(userId: int):
    try:
        async with aiosqlite.connect(DATABASE_NAME) as db:
            db.row_factory = aiosqlite.Row
            cursor = await db.execute("""
                SELECT b.*, s.date, s.time, s.city, s.restaurant, s.max_people, s.current_bookings
                FROM bookings b
                JOIN dinner_slots s ON b.slot_id = s.id
                WHERE b.user_id = ? AND b.status = 'active'
                ORDER BY s.date, s.time
            """, (userId,))
            rows = await cursor.fetchall()
            bookings = [dict(row) for row in rows]
        return {"bookings": bookings}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/bookings")
async def create_booking_endpoint(request: BookingRequest):
    try:
        async with aiosqlite.connect(DATABASE_NAME) as db:
            # Проверяем доступность слота
            cursor = await db.execute(
                "SELECT current_bookings, max_people FROM dinner_slots WHERE id = ? AND is_active = 1",
                (request.slotId,)
            )
            slot = await cursor.fetchone()
            
            if not slot:
                raise HTTPException(status_code=404, detail="Slot not found or inactive")
            
            if slot[0] >= slot[1]:
                raise HTTPException(status_code=400, detail="Slot is full")
            
            # Создаем бронирование
            await db.execute(
                "INSERT INTO bookings (user_id, slot_id) VALUES (?, ?)",
                (request.userId, request.slotId)
            )
            
            # Обновляем счетчик бронирований
            await db.execute(
                "UPDATE dinner_slots SET current_bookings = current_bookings + 1 WHERE id = ?",
                (request.slotId,)
            )
            
            await db.commit()
        
        return {"success": True}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/contacts")
async def get_contacts_endpoint(slotId: int, userId: int):
    try:
        async with aiosqlite.connect(DATABASE_NAME) as db:
            db.row_factory = aiosqlite.Row
            cursor = await db.execute("""
                SELECT u.name, u.age, u.interests, u.user_id
                FROM bookings b
                JOIN users u ON b.user_id = u.user_id
                WHERE b.slot_id = ? AND b.status = 'active' AND b.user_id != ?
            """, (slotId, userId))
            rows = await cursor.fetchall()
            
            contacts = []
            for row in rows:
                contacts.append({
                    "name": row["name"],
                    "age": row["age"],
                    "interests": row["interests"],
                    "telegram": f"@user{row['user_id']}"  # Заглушка
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