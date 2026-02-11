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
    Возвращает 'welcome' (анкета не заполнена) или 'booking' (анкета заполнена).
    Вызывается ботом при /start — определение типа пользователя в бэкенде.
    """
    async_session = get_session_factory()
    async with async_session() as session:
        user_repo = UserRepo(session)
        user = await user_repo.get_user_profile(user_id)
        if user and user.is_profile_completed:
            return "booking"
        return "welcome"
