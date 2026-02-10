"""
Репозитории для работы с базой данных.
Обновлённая версия с:
- Атомарным бронированием (SELECT FOR UPDATE)
- Правильной структурой импортов
- Типизацией
"""

from sqlalchemy import select, update, func
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload
from typing import List, Optional
from datetime import datetime

from . import models
from .models import User, DinnerSlot, Booking, Payment, Group, UserGroup

# Импортируем из родительского пакета
import sys
import os

# Добавляем родительскую директорию для импорта schemas
parent_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if parent_dir not in sys.path:
    sys.path.insert(0, parent_dir)

from schemas import UserProfile
from logger import get_db_logger

logger = get_db_logger()


class BaseRepo:
    """Базовый репозиторий для выполнения общих операций с базой данных."""
    
    def __init__(self, session: AsyncSession):
        self.session = session


class UserRepo(BaseRepo):
    """Репозиторий для работы с пользователями."""
    
    async def get_or_create_user(self, user_id: int, name: Optional[str] = None) -> User:
        """Получает пользователя по ID или создает нового, если он не найден."""
        user = await self.session.get(User, user_id)
        if user is None:
            user = User(user_id=user_id, name=name)
            self.session.add(user)
            await self.session.commit()
            await self.session.refresh(user)
        return user

    async def get_user_profile(self, user_id: int) -> Optional[User]:
        """Получает профиль пользователя по ID."""
        return await self.session.get(User, user_id)

    async def save_user_profile(self, user_id: int, profile_data: UserProfile) -> User:
        """Обновляет или создает профиль пользователя."""
        user = await self.session.get(User, user_id)
        if user is None:
            user = User(user_id=user_id)
            self.session.add(user)
        
        # Используем model_dump(exclude_none=True) чтобы не затирать существующие данные на None
        profile_dict = profile_data.model_dump(exclude_none=True)
        
        # Сопоставление ключа 'format' с фронтенда с полем БД 'communication_format'
        if 'format' in profile_dict:
            profile_dict['communication_format'] = profile_dict.pop('format')
        
        logger.debug(f"Saving profile for user {user_id}: {list(profile_dict.keys())}")
        
        for key, value in profile_dict.items():
            if hasattr(user, key):
                setattr(user, key, value)
        
        # Если все обязательные поля заполнены, можно ставить True (опционально, или доверяем фронту)
        # В данном случае доверяем фронту, который присылает is_profile_completed=True в конце
        if 'is_profile_completed' in profile_dict:
             user.is_profile_completed = profile_dict['is_profile_completed']
        
        await self.session.commit()
        await self.session.refresh(user)
        logger.info(f"Profile saved for user {user_id}")
        return user
    
    async def get_total_count(self) -> int:
        """Возвращает общее количество пользователей."""
        result = await self.session.execute(select(func.count(User.user_id)))
        return result.scalar_one()


class SlotRepo(BaseRepo):
    """Репозиторий для работы со слотами ужинов."""
    
    async def create_slot(
        self, date: str, time: str, city: str, restaurant: str, max_people: int
    ) -> DinnerSlot:
        """Создает новый слот."""
        # Парсим дату из строки "DD.MM.YYYY" в date object
        try:
            date_obj = datetime.strptime(date, "%d.%m.%Y").date()
        except ValueError:
            # Резервный вариант для формата ISO или других
            try:
                date_obj = datetime.fromisoformat(date).date()
            except ValueError:
                # Если совсем не вышло, пробуем как есть (хотя это вызовет ошибку БД если тип Date)
                # Но лучше кинуть ошибку здесь
                raise ValueError(f"Invalid date format: {date}")

        new_slot = DinnerSlot(
            date=date_obj,
            time=time,
            city=city,
            restaurant=restaurant,
            max_people=max_people,
        )
        self.session.add(new_slot)
        await self.session.commit()
        return new_slot

    async def get_all_slots(self) -> List[DinnerSlot]:
        """Получает все слоты."""
        stmt = select(DinnerSlot).order_by(
            DinnerSlot.date.desc(), DinnerSlot.time.desc()
        )
        result = await self.session.execute(stmt)
        return list(result.scalars().all())

    async def get_available_slots(self, city: Optional[str] = None) -> List[DinnerSlot]:
        """Получает доступные для бронирования слоты."""
        stmt = select(DinnerSlot).where(
            DinnerSlot.is_active == True,
            DinnerSlot.current_bookings < DinnerSlot.max_people
        ).order_by(DinnerSlot.date, DinnerSlot.time)

        if city:
            stmt = stmt.where(DinnerSlot.city == city)
            
        result = await self.session.execute(stmt)
        return list(result.scalars().all())

    async def get_slot_contacts(self, slot_id: int, current_user_id: int) -> List[User]:
        """Получает контакты участников слота, кроме текущего пользователя."""
        stmt = (
            select(User)
            .join(Booking, User.user_id == Booking.user_id)
            .where(
                Booking.slot_id == slot_id,
                Booking.status == 'active',
                User.user_id != current_user_id
            )
        )
        result = await self.session.execute(stmt)
        return list(result.scalars().all())

    async def get_active_count(self) -> int:
        """Возвращает количество активных слотов."""
        result = await self.session.execute(
            select(func.count(DinnerSlot.id)).where(DinnerSlot.is_active == True)
        )
        return result.scalar_one()

    async def get_total_bookings_sum(self) -> int:
        """Возвращает сумму всех текущих бронирований."""
        result = await self.session.execute(select(func.sum(DinnerSlot.current_bookings)))
        return result.scalar_one() or 0


class BookingRepo(BaseRepo):
    """Репозиторий для работы с бронированиями."""
    
    async def create_booking(self, user_id: int, slot_id: int) -> bool:
        """
        Создает бронирование с атомарной блокировкой слота.
        Использует SELECT FOR UPDATE для предотвращения race condition.
        """
        logger.info(f"Creating booking: user={user_id}, slot={slot_id}")
        
        try:
            # 1. Проверяем, не забронировал ли пользователь этот слот ранее
            existing_booking = await self.session.execute(
                select(Booking).where(
                    Booking.user_id == user_id,
                    Booking.slot_id == slot_id
                )
            )
            if existing_booking.scalar_one_or_none() is not None:
                logger.warning(f"User {user_id} already booked slot {slot_id}")
                return False

            # 2. Получаем слот с блокировкой FOR UPDATE (атомарная операция)
            # Это предотвращает race condition при одновременных бронированиях
            stmt = (
                select(DinnerSlot)
                .where(DinnerSlot.id == slot_id)
                .with_for_update()  # SELECT FOR UPDATE - блокировка строки
            )
            result = await self.session.execute(stmt)
            slot = result.scalar_one_or_none()
            
            if not slot:
                logger.warning(f"Slot {slot_id} not found")
                return False
            
            if not slot.is_active:
                logger.warning(f"Slot {slot_id} is not active")
                return False
            
            if slot.current_bookings >= slot.max_people:
                logger.warning(f"Slot {slot_id} is full ({slot.current_bookings}/{slot.max_people})")
                return False
            
            # 3. Создаем бронирование
            new_booking = Booking(user_id=user_id, slot_id=slot_id)
            self.session.add(new_booking)
            
            # 4. Увеличиваем счетчик бронирований
            slot.current_bookings += 1
            
            # 5. Коммитим транзакцию (освобождает блокировку)
            await self.session.commit()
            
            logger.info(f"Booking created successfully: user={user_id}, slot={slot_id}")
            return True
            
        except Exception as e:
            await self.session.rollback()
            logger.error(f"Booking creation failed: {e}")
            raise

    async def get_user_bookings(self, user_id: int) -> List[Booking]:
        """Получает активные бронирования пользователя с предзагруженными слотами."""
        logger.debug(f"Getting bookings for user {user_id}")
        
        try:
            # Используем selectinload для предзагрузки связанных слотов
            stmt = (
                select(Booking)
                .options(selectinload(Booking.slot))
                .join(DinnerSlot)
                .where(
                    Booking.user_id == user_id,
                    Booking.status == 'active'
                )
                .order_by(DinnerSlot.date, DinnerSlot.time)
            )
            result = await self.session.execute(stmt)
            bookings = list(result.scalars().all())
            logger.debug(f"Found {len(bookings)} bookings for user {user_id}")
            return bookings
        except Exception as e:
            logger.error(f"Error getting bookings for user {user_id}: {e}")
            return []

    async def confirm_booking(self, booking_id: int) -> bool:
        """Подтверждает бронирование (после успешной оплаты)."""
        booking = await self.session.get(Booking, booking_id)
        if booking:
            booking.status = 'confirmed'
            await self.session.commit()
            logger.info(f"Booking {booking_id} confirmed")
            return True
        return False

    async def cancel_booking(self, booking_id: int) -> bool:
        """Отменяет бронирование и освобождает место в слоте."""
        booking = await self.session.get(Booking, booking_id)
        if not booking or booking.status == 'canceled':
            return False
        
        # Получаем слот с блокировкой
        stmt = (
            select(DinnerSlot)
            .where(DinnerSlot.id == booking.slot_id)
            .with_for_update()
        )
        result = await self.session.execute(stmt)
        slot = result.scalar_one_or_none()
        
        if slot and slot.current_bookings > 0:
            slot.current_bookings -= 1
        
        booking.status = 'canceled'
        await self.session.commit()
        
        logger.info(f"Booking {booking_id} canceled")
        return True


class PaymentRepo(BaseRepo):
    """Репозиторий для работы с платежами."""
    
    async def create_payment(
        self, 
        user_id: int, 
        yookassa_payment_id: str,
        amount: str,
        booking_id: Optional[int] = None,
        status: str = 'created'
    ) -> Payment:
        """Создает новый платеж."""
        payment = Payment(
            user_id=user_id,
            yookassa_payment_id=yookassa_payment_id,
            amount=amount,
            booking_id=booking_id,
            status=status
        )
        self.session.add(payment)
        await self.session.commit()
        await self.session.refresh(payment)
        logger.info(f"Payment created: id={payment.id}, user={user_id}, yookassa_id={yookassa_payment_id}")
        return payment

    async def get_payment(self, payment_id: int) -> Optional[Payment]:
        """Получает платеж по ID."""
        return await self.session.get(Payment, payment_id)

    async def get_payment_by_yookassa_id(self, yookassa_payment_id: str) -> Optional[Payment]:
        """Получает платеж по Yookassa ID."""
        stmt = select(Payment).where(Payment.yookassa_payment_id == yookassa_payment_id)
        result = await self.session.execute(stmt)
        return result.scalar_one_or_none()

    async def update_payment_status(self, payment_id: int, status: str) -> Optional[Payment]:
        """Обновляет статус платежа."""
        payment = await self.session.get(Payment, payment_id)
        if payment:
            payment.status = status
            await self.session.commit()
            await self.session.refresh(payment)
            logger.info(f"Payment {payment_id} status updated to {status}")
        return payment

    async def get_user_payments(self, user_id: int) -> List[Payment]:
        """Получает все платежи пользователя."""
        stmt = (
            select(Payment)
            .where(Payment.user_id == user_id)
            .order_by(Payment.created_at.desc())
        )
        result = await self.session.execute(stmt)
        return list(result.scalars().all())


class AdminRepo(BaseRepo):
    """Репозиторий для админских операций."""

    async def get_all_users(self, limit: int = 50, offset: int = 0) -> tuple[List[User], int]:
        """Возвращает список пользователей с пагинацией и общее количество."""
        total_result = await self.session.execute(select(func.count(User.user_id)))
        total = total_result.scalar_one()

        stmt = (
            select(User)
            .order_by(User.created_at.desc())
            .limit(limit)
            .offset(offset)
        )
        result = await self.session.execute(stmt)
        users = list(result.scalars().all())
        return users, total

    async def get_all_slots_admin(self) -> List[DinnerSlot]:
        """Возвращает все слоты (включая неактивные)."""
        stmt = select(DinnerSlot).order_by(DinnerSlot.date.desc(), DinnerSlot.time.desc())
        result = await self.session.execute(stmt)
        return list(result.scalars().all())

    async def get_slot_by_id(self, slot_id: int) -> Optional[DinnerSlot]:
        """Возвращает слот по ID."""
        return await self.session.get(DinnerSlot, slot_id)

    async def update_slot(self, slot_id: int, **kwargs) -> Optional[DinnerSlot]:
        """Обновляет поля слота."""
        slot = await self.session.get(DinnerSlot, slot_id)
        if not slot:
            return None
        for key, value in kwargs.items():
            if hasattr(slot, key):
                # Специальная обработка для даты
                if key == 'date' and isinstance(value, str):
                    try:
                        value = datetime.strptime(value, "%d.%m.%Y").date()
                    except ValueError:
                        try:
                            value = datetime.fromisoformat(value).date()
                        except ValueError:
                             pass # Оставляем как есть, упадет ниже или в БД
                
                setattr(slot, key, value)
        await self.session.commit()
        await self.session.refresh(slot)
        return slot

    async def get_slot_participants(self, slot_id: int) -> List[dict]:
        """Возвращает участников слота с информацией об оплате."""
        stmt = (
            select(Booking, User, Payment)
            .join(User, Booking.user_id == User.user_id)
            .outerjoin(Payment, (Payment.booking_id == Booking.id) & (Payment.status == 'succeeded'))
            .where(Booking.slot_id == slot_id)
            .order_by(Booking.booking_date)
        )
        result = await self.session.execute(stmt)
        rows = result.all()

        participants = []
        for booking, user, payment in rows:
            participants.append({
                "user_id": user.user_id,
                "name": user.name,
                "telegram": user.telegram,
                "instagram": user.instagram,
                "city": user.city,
                "booking_id": booking.id,
                "booking_status": booking.status,
                "booking_date": booking.booking_date.isoformat() if booking.booking_date else None,
                "paid": payment is not None,
                "payment_amount": payment.amount if payment else None,
            })
        return participants

    async def get_stats(self) -> dict:
        """Возвращает общую статистику."""
        users_count = (await self.session.execute(select(func.count(User.user_id)))).scalar_one()
        slots_count = (await self.session.execute(select(func.count(DinnerSlot.id)))).scalar_one()
        active_slots = (await self.session.execute(
            select(func.count(DinnerSlot.id)).where(DinnerSlot.is_active == True)
        )).scalar_one()
        bookings_count = (await self.session.execute(select(func.count(Booking.id)))).scalar_one()
        paid_count = (await self.session.execute(
            select(func.count(Payment.id)).where(Payment.status == 'succeeded')
        )).scalar_one()

        return {
            "total_users": users_count,
            "total_slots": slots_count,
            "active_slots": active_slots,
            "total_bookings": bookings_count,
            "total_paid": paid_count,
        }


class GroupRepo(BaseRepo):
    """Репозиторий для работы с группами."""

    async def get_all_groups(self) -> List[dict]:
        """Возвращает все группы с количеством участников."""
        stmt = (
            select(Group, func.count(UserGroup.id).label("member_count"))
            .outerjoin(UserGroup, Group.id == UserGroup.group_id)
            .group_by(Group.id)
            .order_by(Group.created_at.desc())
        )
        result = await self.session.execute(stmt)
        rows = result.all()
        return [
            {
                "id": group.id,
                "name": group.name,
                "created_at": group.created_at.isoformat() if group.created_at else None,
                "member_count": count,
            }
            for group, count in rows
        ]

    async def create_group(self, name: str) -> Group:
        """Создаёт новую группу."""
        group = Group(name=name)
        self.session.add(group)
        await self.session.commit()
        await self.session.refresh(group)
        return group

    async def delete_group(self, group_id: int) -> bool:
        """Удаляет группу (CASCADE удалит связи)."""
        group = await self.session.get(Group, group_id)
        if not group:
            return False
        await self.session.delete(group)
        await self.session.commit()
        return True

    async def add_members(self, group_id: int, user_ids: List[int]) -> dict:
        """Добавляет пользователей в группу. Возвращает отчёт."""
        group = await self.session.get(Group, group_id)
        if not group:
            return {"error": "group_not_found"}

        added = []
        skipped = []
        not_found = []

        for uid in user_ids:
            user = await self.session.get(User, uid)
            if not user:
                not_found.append(uid)
                continue

            existing = await self.session.execute(
                select(UserGroup).where(UserGroup.user_id == uid, UserGroup.group_id == group_id)
            )
            if existing.scalar_one_or_none():
                skipped.append(uid)
                continue

            self.session.add(UserGroup(user_id=uid, group_id=group_id))
            added.append(uid)

        await self.session.commit()
        return {"added": added, "skipped": skipped, "not_found": not_found}

    async def remove_member(self, group_id: int, user_id: int) -> bool:
        """Удаляет пользователя из группы."""
        stmt = select(UserGroup).where(UserGroup.user_id == user_id, UserGroup.group_id == group_id)
        result = await self.session.execute(stmt)
        ug = result.scalar_one_or_none()
        if not ug:
            return False
        await self.session.delete(ug)
        await self.session.commit()
        return True

    async def get_group_members(self, group_id: int) -> List[User]:
        """Возвращает участников группы."""
        stmt = (
            select(User)
            .join(UserGroup, User.user_id == UserGroup.user_id)
            .where(UserGroup.group_id == group_id)
            .order_by(User.name)
        )
        result = await self.session.execute(stmt)
        return list(result.scalars().all())

    async def get_group_member_ids(self, group_ids: List[int]) -> List[int]:
        """Возвращает уникальные user_id из нескольких групп."""
        stmt = (
            select(UserGroup.user_id)
            .where(UserGroup.group_id.in_(group_ids))
            .distinct()
        )
        result = await self.session.execute(stmt)
        return [row[0] for row in result.all()]
