"""
Вспомогательные функции для работы с БД из Telegram Bot.
Используются в admin_commands.py и других местах где нет прямого доступа к AsyncSession.
"""

from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List, Optional

from db.session import get_session_factory
from db.models import User, DinnerSlot, Booking
from db.repository import SlotRepo, UserRepo, BookingRepo
from utils import format_date


async def create_slot(date: str, time: str, city: str, restaurant: str, max_people: int) -> dict:
    """Создание нового слота ужина"""
    async_session = get_session_factory()
    async with async_session() as session:
        slot_repo = SlotRepo(session)
        slot = await slot_repo.create_slot(
            date=date,
            time=time,
            city=city,
            restaurant=restaurant,
            max_people=max_people
        )
        return {
            "id": slot.id,
            "date": format_date(slot.date),
            "time": slot.time,
            "city": slot.city,
            "restaurant": slot.restaurant,
            "max_people": slot.max_people
        }


async def get_all_slots() -> List[dict]:
    """Получение всех слотов"""
    async_session = get_session_factory()
    async with async_session() as session:
        slot_repo = SlotRepo(session)
        slots = await slot_repo.get_all_slots()
        return [
            {
                "id": slot.id,
                "date": format_date(slot.date),
                "time": slot.time,
                "city": slot.city,
                "restaurant": slot.restaurant,
                "max_people": slot.max_people,
                "current_bookings": slot.current_bookings,
                "is_active": slot.is_active
            }
            for slot in slots
        ]


async def get_users_count() -> int:
    """Получение количества пользователей"""
    async_session = get_session_factory()
    async with async_session() as session:
        user_repo = UserRepo(session)
        return await user_repo.get_total_count()


async def get_active_slots_count() -> int:
    """Получение количества активных слотов"""
    async_session = get_session_factory()
    async with async_session() as session:
        slot_repo = SlotRepo(session)
        slots = await slot_repo.get_all_slots()
        return len([s for s in slots if s.is_active])


async def get_total_bookings_count() -> int:
    """Получение общего количества бронирований"""
    async_session = get_session_factory()
    async with async_session() as session:
        booking_repo = BookingRepo(session)
        # Используем прямой запрос если метода нет в репозитории
        stmt = select(func.count(Booking.id))
        result = await session.execute(stmt)
        return result.scalar() or 0


async def get_user_initial_screen(user_id: int) -> str:
    """
    Определяет начальный экран для пользователя на основе данных в БД.
    
    ВАЖНО! Определение типа пользователя происходит в БЭКЕНДЕ:
    1. Если пользователь администратор → "admin"
       - Проверяются ОБА источника: ADMIN_IDS из конфига И поле is_admin в БД
    2. Если профиль заполнен → "booking"
    3. Если новый пользователь → "welcome"
    
    Эта функция вызывается:
    - При /start команде в боте
    - При API запросе /api/user/initial-screen (используется фронтендом)
    """
    from config import ADMIN_IDS
    from logger import get_api_logger
    
    logger = get_api_logger()
    logger.info(f"🔍 get_user_initial_screen() called for user_id={user_id}")
    
    # 1. Проверяем ОБА источника администратора:
    #    а) ADMIN_IDS из конфига (для быстрой проверки)
    logger.info(f"📋 ADMIN_IDS from config: {ADMIN_IDS}")
    if user_id in ADMIN_IDS:
        logger.info(f"✅ User {user_id} is ADMIN (found in ADMIN_IDS config)")
        return "admin"
    
    #    б) Проверяем поле is_admin в БД
    try:
        async_session = get_session_factory()
        async with async_session() as session:
            user_repo = UserRepo(session)
            user = await user_repo.get_user_profile(user_id)
            
            if user:
                logger.info(f"👤 User {user_id} found in DB. is_admin={user.is_admin}, is_profile_completed={user.is_profile_completed}")
                
                # Проверяем администатора ИЗ БД
                if user.is_admin:
                    logger.info(f"✅ User {user_id} is ADMIN (is_admin=True in DB)")
                    return "admin"
                
                # Если не администратор - проверяем профиль
                if user.is_profile_completed:
                    logger.info(f"✅ User {user_id} has completed profile")
                    return "booking"
                
                logger.info(f"❌ User {user_id} profile is NOT completed")
                return "welcome"
            else:
                logger.info(f"⚠️ User {user_id} not found in DB - first time user")
                return "welcome"
                
    except Exception as e:
        logger.error(f"❌ Error checking user profile for {user_id}: {e}")
        import traceback
        logger.error(traceback.format_exc())
        return "welcome"
