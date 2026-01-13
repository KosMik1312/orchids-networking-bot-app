from sqlalchemy import select, update
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List, Optional

from . import models
from bot.schemas import UserProfile

class BaseRepo:
    """
    Базовый репозиторий для выполнения общих операций с базой данных.
    """
    def __init__(self, session: AsyncSession):
        self.session = session

class UserRepo(BaseRepo):
    """
    Репозиторий для работы с пользователями.
    """
    async def get_or_create_user(self, user_id: int, name: Optional[str] = None) -> models.User:
        """Получает пользователя по ID или создает нового, если он не найден."""
        user = await self.session.get(models.User, user_id)
        if user is None:
            user = models.User(user_id=user_id, name=name)
            self.session.add(user)
            await self.session.commit()
            await self.session.refresh(user)
        return user

    async def get_user_profile(self, user_id: int) -> Optional[models.User]:
        """Получает профиль пользователя по ID."""
        return await self.session.get(models.User, user_id)

    async def save_user_profile(self, user_id: int, profile_data: UserProfile) -> models.User:
        """Обновляет или создает профиль пользователя."""
        user = await self.session.get(models.User, user_id)
        if user is None:
            user = models.User(user_id=user_id)
            self.session.add(user)
        
        profile_dict = profile_data.dict(exclude_unset=True)
        for key, value in profile_dict.items():
            setattr(user, key, value)
            
        await self.session.commit()
        await self.session.refresh(user)
        return user


class SlotRepo(BaseRepo):
    """
    Репозиторий для работы со слотами ужинов.
    """
    async def create_slot(
        self, date: str, time: str, city: str, restaurant: str, max_people: int
    ) -> models.DinnerSlot:
        """Создает новый слот."""
        new_slot = models.DinnerSlot(
            date=date,
            time=time,
            city=city,
            restaurant=restaurant,
            max_people=max_people,
        )
        self.session.add(new_slot)
        await self.session.commit()
        return new_slot

    async def get_all_slots(self) -> List[models.DinnerSlot]:
        """Получает все слоты."""
        stmt = select(models.DinnerSlot).order_by(
            models.DinnerSlot.date.desc(), models.DinnerSlot.time.desc()
        )
        result = await self.session.execute(stmt)
        return result.scalars().all()

    async def get_available_slots(self, city: Optional[str] = None) -> List[models.DinnerSlot]:
        """Получает доступные для бронирования слоты."""
        stmt = select(models.DinnerSlot).where(
            models.DinnerSlot.is_active == True,
            models.DinnerSlot.current_bookings < models.DinnerSlot.max_people
        ).order_by(models.DinnerSlot.date, models.DinnerSlot.time)

        if city:
            stmt = stmt.where(models.DinnerSlot.city == city)
            
        result = await self.session.execute(stmt)
        return result.scalars().all()

    async def get_slot_contacts(self, slot_id: int, current_user_id: int) -> List[models.User]:
        """Получает контакты участников слота, кроме текущего пользователя."""
        stmt = (
            select(models.User)
            .join(models.Booking, models.User.user_id == models.Booking.user_id)
            .where(
                models.Booking.slot_id == slot_id,
                models.Booking.status == 'active',
                models.User.user_id != current_user_id
            )
        )
        result = await self.session.execute(stmt)
        return result.scalars().all()


class BookingRepo(BaseRepo):
    """
    Репозиторий для работы с бронированиями.
    """
    async def create_booking(self, user_id: int, slot_id: int) -> bool:
        """
        Создает бронирование в рамках транзакции, чтобы обеспечить целостность данных.
        """
        # Начало транзакции обеспечивается самой сессией, коммит в конце
        
        # 1. Проверяем, не забронировал ли пользователь этот слот ранее
        existing_booking = await self.session.execute(
            select(models.Booking).where(
                models.Booking.user_id == user_id,
                models.Booking.slot_id == slot_id
            )
        )
        if existing_booking.scalar_one_or_none() is not None:
            return False  # Уже забронировано

        # 2. Получаем слот и проверяем наличие мест
        slot = await self.session.get(models.DinnerSlot, slot_id)
        if not slot or not slot.is_active or slot.current_bookings >= slot.max_people:
            return False # Слот не найден, неактивен или полон
        
        # 3. Создаем бронирование
        new_booking = models.Booking(user_id=user_id, slot_id=slot_id)
        self.session.add(new_booking)
        
        # 4. Увеличиваем счетчик бронирований
        slot.current_bookings += 1
        
        await self.session.commit()
        return True

    async def get_user_bookings(self, user_id: int) -> List[models.Booking]:
        """Получает активные бронирования пользователя."""
        stmt = (
            select(models.Booking)
            .join(models.DinnerSlot)
            .where(
                models.Booking.user_id == user_id,
                models.Booking.status == 'active'
            )
            .order_by(models.DinnerSlot.date, models.DinnerSlot.time)
        )
        result = await self.session.execute(stmt)
        return result.scalars().all()
