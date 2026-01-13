"""
This module provides a high-level API for interacting with the database.
It uses the repository pattern to abstract the database operations.
The bot's command handlers should use these functions to interact with the DB.
"""
from typing import List, Optional, Dict, Any

from bot.db.session import get_session
from bot.db.repository import UserRepo, SlotRepo, BookingRepo
from bot.schemas import UserProfile
from bot.db import models


async def to_dict(model_instance: models.Base) -> Optional[Dict[str, Any]]:
    """Converts a SQLAlchemy model instance to a dictionary."""
    if not model_instance:
        return None
    return {c.key: getattr(model_instance, c.key) for c in model_instance.__table__.columns}

# --- Database Initialization ---

async def init_db():
    """Initializes the database by creating all tables."""
    from bot.db.session import init_db as _init
    await _init()

# --- User Profile Functions ---

async def save_user_profile(user_id: int, profile: UserProfile):
    """Saves a user's profile."""
    async for session in get_session():
        repo = UserRepo(session)
        await repo.save_user_profile(user_id, profile)

async def get_user_profile(user_id: int) -> Optional[Dict[str, Any]]:
    """Retrieves a user's profile."""
    async for session in get_session():
        repo = UserRepo(session)
        user = await repo.get_user_profile(user_id)
        return await to_dict(user)

# --- Slot Functions ---

async def get_available_slots(city: str = None) -> List[Dict[str, Any]]:
    """Gets all available dinner slots."""
    async for session in get_session():
        repo = SlotRepo(session)
        slots = await repo.get_available_slots(city)
        return [await to_dict(slot) for slot in slots]

async def get_slot_contacts(slot_id: int, current_user_id: int) -> List[Dict[str, Any]]:
    """Gets the contacts of all users in a slot, except the current user."""
    async for session in get_session():
        repo = SlotRepo(session)
        users = await repo.get_slot_contacts(slot_id, current_user_id)
        return [await to_dict(user) for user in users]

# --- Booking Functions ---

async def get_user_bookings(user_id: int) -> List[Dict[str, Any]]:
    """Retrieves a user's active bookings."""
    async for session in get_session():
        repo = BookingRepo(session)
        # This relationship loading requires a bit more care.
        bookings = await repo.get_user_bookings(user_id)
        results = []
        for booking in bookings:
            booking_dict = await to_dict(booking)
            # The slot information is loaded via the relationship
            slot_info = await to_dict(booking.slot)
            if slot_info:
                booking_dict.update(slot_info)
            results.append(booking_dict)
        return results


async def create_booking(user_id: int, slot_id: int) -> bool:
    """Creates a new booking for a user in a slot."""
    async for session in get_session():
        repo = BookingRepo(session)
        return await repo.create_booking(user_id, slot_id)


# --- Admin Functions ---

async def get_all_slots() -> List[Dict[str, Any]]:
    """Gets all dinner slots (for admin purposes)."""
    async for session in get_session():
        repo = SlotRepo(session)
        slots = await repo.get_all_slots()
        return [await to_dict(slot) for slot in slots]

async def create_slot(date: str, time: str, city: str, restaurant: str, max_people: int) -> bool:
    """Creates a new dinner slot (for admin purposes)."""
    async for session in get_session():
        repo = SlotRepo(session)
        await repo.create_slot(date, time, city, restaurant, max_people)
        return True
