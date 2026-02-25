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


async def get_user_initial_screen(user_id: int, mode: str = "user") -> str:
    """
    Определяет начальный экран для пользователя на основе данных в БД.
    
    СТРОГАЯ ЛОГИКА:
    1. Сначала проверяем, является ли пользователь администратором.
    2. Если пользователь администратор И mode="admin" -> возвращаем "admin".
    3. В ЛЮБЫХ ДРУГИХ СЛУЧАЯХ игнорируем статус админа и идем по пути пользователя:
       - Если профиль заполнен -> "booking"
       - Иначе -> "welcome"
    """
    from config import ADMIN_IDS
    from logger import get_api_logger
    
    logger = get_api_logger()
    logger.info(f"🔍 get_user_initial_screen() called: user_id={user_id}, mode={mode}")
    
    # 1. Сначала просто определяем, админ ли это
    is_admin = (user_id in ADMIN_IDS)
    
    # Если не в конфиге - проверяем БД
    if not is_admin:
        try:
            async_session = get_session_factory()
            async with async_session() as session:
                user_repo = UserRepo(session)
                user = await user_repo.get_user_profile(user_id)
                if user and user.is_admin:
                    is_admin = True
        except Exception as e:
            logger.error(f"Error checking admin status in DB: {e}")

    # 2. Если это админ И он просит админку - пускаем
    if is_admin and mode == "admin":
        logger.info(f"✅ User {user_id} is ADMIN and requested mode=admin. Sending to admin panel.")
        return "admin"
    
    # 3. В ОСТАЛЬНЫХ СЛУЧАЯХ (даже если админ) - проверяем как обычного пользователя
    logger.info(f"👤 Following user flow for user_id={user_id} (requested mode={mode})")
    try:
        async_session = get_session_factory()
        async with async_session() as session:
            user_repo = UserRepo(session)
            user = await user_repo.get_user_profile(user_id)
            
            if user:
                logger.info(f"👤 User {user_id} found in DB. is_profile_completed={user.is_profile_completed}")
                if user.is_profile_completed:
                    return "booking"
                return "welcome"
            else:
                logger.info(f"⚠️ User {user_id} not found in DB - first time user")
                return "welcome"
                
    except Exception as e:
        logger.error(f"❌ Error checking user profile for {user_id}: {e}")
        return "welcome"
