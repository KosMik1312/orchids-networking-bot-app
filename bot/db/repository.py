from sqlalchemy import select, update, func
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List, Optional
import sys
import os

# Add bot directory to path for imports
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from . import models
from schemas import UserProfile

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
        
        # Используем dict(exclude_none=True) чтобы не затирать существующие данные на None
        profile_dict = profile_data.dict(exclude_none=True)
        
        print(f"[REPO] Saving profile for user {user_id}")
        print(f"[REPO] Profile dict: {profile_dict}")
        
        for key, value in profile_dict.items():
            print(f"[REPO] Setting {key} = {value}")
            setattr(user, key, value)
        
        print(f"[REPO] Before commit - user data: {user.__dict__}")
        await self.session.commit()
        await self.session.refresh(user)
        print(f"[REPO] Profile saved successfully for user {user_id}")
        print(f"[REPO] After refresh - user data: {user.__dict__}")
        return user
    
    async def get_total_count(self) -> int:
        """Возвращает общее количество пользователей."""
        result = await self.session.execute(select(func.count(models.User.user_id)))
        return result.scalar_one()


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

    async def get_active_count(self) -> int:
        """Возвращает количество активных слотов."""
        result = await self.session.execute(
            select(func.count(models.DinnerSlot.id)).where(models.DinnerSlot.is_active == True)
        )
        return result.scalar_one()

    async def get_total_bookings_sum(self) -> int:
        """Возвращает сумму всех текущих бронирований."""
        result = await self.session.execute(select(func.sum(models.DinnerSlot.current_bookings)))
        return result.scalar_one() or 0


class BookingRepo(BaseRepo):
    """
    Репозиторий для работы с бронированиями.
    """
    async def create_booking(self, user_id: int, slot_id: int) -> bool:
        """
        Создает бронирование в рамках транзакции, чтобы обеспечить целостность данных.
        """
        print(f"[REPO BOOKING] === START create_booking ===")
        print(f"[REPO BOOKING] user_id={user_id}, slot_id={slot_id}")
        
        # 1. Проверяем, не забронировал ли пользователь этот слот ранее
        print(f"[REPO BOOKING] Проверка дублей бронирования...")
        existing_booking = await self.session.execute(
            select(models.Booking).where(
                models.Booking.user_id == user_id,
                models.Booking.slot_id == slot_id
            )
        )
        if existing_booking.scalar_one_or_none() is not None:
            print(f"[REPO BOOKING] ОШИБКА: Пользователь уже забронировал этот слот")
            return False

        # 2. Получаем слот и проверяем наличие мест
        print(f"[REPO BOOKING] Получение слота {slot_id}...")
        slot = await self.session.get(models.DinnerSlot, slot_id)
        
        if not slot:
            print(f"[REPO BOOKING] ОШИБКА: Слот {slot_id} не найден!")
            return False
        
        print(f"[REPO BOOKING] Слот найден: id={slot.id}, is_active={slot.is_active}, current_bookings={slot.current_bookings}, max_people={slot.max_people}")
        
        if not slot.is_active:
            print(f"[REPO BOOKING] ОШИБКА: Слот неактивен (is_active={slot.is_active})")
            return False
        
        if slot.current_bookings >= slot.max_people:
            print(f"[REPO BOOKING] ОШИБКА: Слот полон ({slot.current_bookings}/{slot.max_people})")
            return False
        
        # 3. Создаем бронирование
        print(f"[REPO BOOKING] Создание записи бронирования...")
        new_booking = models.Booking(user_id=user_id, slot_id=slot_id)
        self.session.add(new_booking)
        
        # 4. Увеличиваем счетчик бронирований
        print(f"[REPO BOOKING] Увеличение счетчика: {slot.current_bookings} -> {slot.current_bookings + 1}")
        slot.current_bookings += 1
        
        await self.session.commit()
        print(f"[REPO BOOKING] === УСПЕШНО ===\n")
        return True

    async def get_user_bookings(self, user_id: int) -> List[models.Booking]:
        """Получает активные бронирования пользователя с предзагруженными слотами."""
        print(f"[REPO] Получение бронирований для пользователя user_id={user_id}")
        try:
            from sqlalchemy.orm import selectinload
            
            # Используем selectinload для предзагрузки связанных слотов
            stmt = (
                select(models.Booking)
                .options(selectinload(models.Booking.slot))
                .join(models.DinnerSlot)
                .where(
                    models.Booking.user_id == user_id,
                    models.Booking.status == 'active'
                )
                .order_by(models.DinnerSlot.date, models.DinnerSlot.time)
            )
            result = await self.session.execute(stmt)
            bookings = result.scalars().all()
            print(f"[REPO] Найдено {len(bookings)} активных бронирований для user_id={user_id}")
            return bookings
        except Exception as e:
            print(f"[REPO] ОШИБКА при получении бронирований для user_id={user_id}: {e}")
            import traceback
            traceback.print_exc()
            return []
