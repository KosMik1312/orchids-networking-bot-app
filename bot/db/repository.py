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
from .models import User, DinnerSlot, Booking, Payment, Group, UserGroup, Promotion, PromotionPurchase

# Импортируем из родительского пакета
import sys
import os

# Добавляем родительскую директорию для импорта schemas
parent_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if parent_dir not in sys.path:
    sys.path.insert(0, parent_dir)

from schemas import UserProfile
from utils import parse_date
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

    async def get_user(self, user_id: int) -> Optional[User]:
        """Backwards-compatible alias used in older code: возвращает User или None."""
        return await self.session.get(User, user_id)

    async def save_user_profile(self, user_id: int, profile_data: UserProfile) -> User:
        """Обновляет или создает профиль пользователя."""
        logger.info(f"📝 save_user_profile called for user {user_id}")
        
        user = await self.session.get(User, user_id)
        if user is None:
            logger.info(f"👤 User {user_id} not found, creating new user")
            user = User(user_id=user_id)
            self.session.add(user)
        
        # Используем model_dump(exclude_none=True) чтобы не затирать существующие данные на None
        profile_dict = profile_data.model_dump(exclude_none=True)
        logger.info(f"📋 Profile dict keys: {list(profile_dict.keys())}")
        logger.info(f"📋 Profile dict values: {profile_dict}")
        
        # Сопоставление ключа 'format' с фронтенда с полем БД 'communication_format'
        if 'format' in profile_dict:
            profile_dict['communication_format'] = profile_dict.pop('format')
            logger.info(f"🔄 Mapped 'format' to 'communication_format'")
        
        # Небольшая подстраховка: часто фронтенд использует camelCase
        # мэпим известные варианты в snake_case, чтобы не терять поля.
        camel_to_snake = {
            'familyStatus': 'relationship_status',
            'hasChildren': 'children',
            'loveLanguage': 'love_language',
            'meetingMetro': 'meeting_metro',
            'meetingDays': 'meeting_days',
            'meetingTimeFrom': 'meeting_time_from',
            'meetingTimeTo': 'meeting_time_to',
            'telegramNickname': 'telegram',
            'instagramNickname': 'instagram',
        }

        for ckey, skey in camel_to_snake.items():
            if ckey in profile_dict and skey not in profile_dict:
                profile_dict[skey] = profile_dict.pop(ckey)
                logger.debug(f"🔁 Mapped camelCase {ckey} -> {skey}")
        logger.debug(f"Saving profile for user {user_id}: {list(profile_dict.keys())}")
        
        missing_keys = []
        for key, value in profile_dict.items():
            if hasattr(user, key):
                logger.debug(f"  Setting {key}={value}")
                setattr(user, key, value)
            else:
                missing_keys.append(key)
                logger.debug(f"  Attribute {key} not found on User model")
        
        # Если все обязательные поля заполнены, можно ставить True (опционально, или доверяем фронту)
        # В данном случае доверяем фронту, который присылает is_profile_completed=True в конце
        if 'is_profile_completed' in profile_dict:
             user.is_profile_completed = profile_dict['is_profile_completed']
             logger.info(f"✅ Set is_profile_completed={user.is_profile_completed}")
        
        logger.info(f"💾 Committing changes for user {user_id}...")
        await self.session.commit()
        logger.info(f"✅ Commit successful for user {user_id}")
        
        await self.session.refresh(user)
        if missing_keys:
            logger.warning(f"⚠️ Some profile keys were not applied to User (unknown attributes): {missing_keys}")
        logger.info(f"✅ Profile saved for user {user_id}: name={user.name}, is_profile_completed={user.is_profile_completed}")
        return user
    
    async def get_total_count(self) -> int:
        """Возвращает общее количество пользователей."""
        result = await self.session.execute(select(func.count(User.user_id)))
        return result.scalar_one()

    async def set_user_admin(self, user_id: int, is_admin: bool = True) -> bool:
        """Устанавливает или снимает флаг администратора для пользователя.

        Возвращает True при успешном обновлении, False если пользователь не найден.
        """
        user = await self.session.get(User, user_id)
        if user is None:
            return False
        user.is_admin = bool(is_admin)
        await self.session.commit()
        await self.session.refresh(user)
        logger.info(f"User {user_id} admin flag set to {user.is_admin}")
        return True

    async def toggle_favorite(self, user_id: int, slot_id: int) -> List[int]:
        """Добавляет или удаляет слот из избранного пользователя."""
        user = await self.session.get(User, user_id)
        if not user:
            raise ValueError(f"User {user_id} not found")
            
        favorites = user.favorite_slots or []
        # Обеспечиваем, что все ID — числа
        favorites = [int(fid) for fid in favorites]
        
        slot_id_int = int(slot_id)
        if slot_id_int in favorites:
            favorites.remove(slot_id_int)
            logger.info(f"Removed slot {slot_id_int} from favorites for user {user_id}")
        else:
            favorites.append(slot_id_int)
            logger.info(f"Added slot {slot_id_int} to favorites for user {user_id}")
            
        user.favorite_slots = favorites
        await self.session.commit()
        # Refresh is not strictly needed here as we return the list, but good for consistency
        # await self.session.refresh(user) 
        return favorites

    async def get_favorites(self, user_id: int) -> List[int]:
        """Возвращает список ID избранных слотов пользователя."""
        user = await self.session.get(User, user_id)
        if not user:
            return []
        faves = user.favorite_slots or []
        # Принудительно приводим к int для надёжности
        return [int(fid) for fid in faves]

    async def delete_user(self, user_id: int) -> bool:
        """
        Полностью удаляет пользователя и связанные данные.
        - Удаление бронирований с возвратом мест в слоты.
        - Удаление платежей (?) - Решено: Скрываем связь, но не удаляем запись для отчетности.
        - Удаление из групп.
        - Удаление самого пользователя.
        """
        logger.info(f"🗑️ Attempting to delete user {user_id}")
        
        user = await self.session.get(User, user_id)
        if not user:
            logger.warning(f"⚠️ User {user_id} not found for deletion")
            return False

        try:
            # 🎯 ИСПРАВЛЕНИЕ: Отключаем autoflush для предотвращения преждевременного сохранения
            with self.session.no_autoflush:
                # 1. Обработка бронирований
                # Используем session.execute для получения всех бронирований
                bookings = await self.session.execute(
                    select(Booking).where(Booking.user_id == user_id)
                )
                for booking in bookings.scalars():
                    if booking.status == 'active':
                        # Возвращаем место в слоте
                        slot = await self.session.get(DinnerSlot, booking.slot_id)
                        if slot and slot.current_bookings > 0:
                            slot.current_bookings -= 1
                            logger.info(f"  Slot {slot.id} bookings decremented")
                    
                    # Удаляем бронирование
                    await self.session.delete(booking)
                    logger.info(f"  Booking {booking.id} deleted")

                # 2. Обработка групп
                groups = await self.session.execute(
                    select(UserGroup).where(UserGroup.user_id == user_id)
                )
                for ug in groups.scalars():
                    await self.session.delete(ug)
                    logger.info(f"  UserGroup record deleted")

                # 3. Обработка платежей (анонимизируем, но не удаляем)
                payments = await self.session.execute(
                    select(Payment).where(Payment.user_id == user_id)
                )
                for payment in payments.scalars():
                    payment.user_id = None  # NULL вместо 0 - не нарушает FK
                    logger.info(f"  Payment {payment.id} anonymized")

                # 4. Удаление самого пользователя
                await self.session.delete(user)
                
                # 5. Явно выполняем flush и commit
                await self.session.flush()
                await self.session.commit()
            
            logger.info(f"✅ User {user_id} successfully deleted from system")
            return True

        except Exception as e:
            await self.session.rollback()
            logger.error(f"❌ Error deleting user {user_id}: {e}")
            raise


class SlotRepo(BaseRepo):
    """Репозиторий для работы со слотами ужинов."""
    
    async def create_slot(
        self, date: str, time: str, city: str, restaurant: str, max_people: int, price: int = 10
    ) -> DinnerSlot:
        """Создает новый слот."""
        # Парсим дату из строки "DD.MM.YYYY" в date object
        try:
            date_obj = parse_date(date)
        except ValueError as e:
            raise ValueError(str(e))

        new_slot = DinnerSlot(
            date=date_obj,
            time=time,
            city=city,
            restaurant=restaurant,
            max_people=max_people,
            price=price,
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

    async def get_slots_by_ids(self, slot_ids: List[int]) -> List[DinnerSlot]:
        """Получает слоты по списку ID."""
        if not slot_ids:
            return []
        # Принудительно приводим к int для SQL запроса
        clean_ids = [int(sid) for sid in slot_ids]
        stmt = select(DinnerSlot).where(DinnerSlot.id.in_(clean_ids)).order_by(DinnerSlot.date, DinnerSlot.time)
        result = await self.session.execute(stmt)
        return list(result.scalars().all())


class BookingRepo(BaseRepo):
    """Репозиторий для работы с бронированиями."""
    
    async def create_booking(self, user_id: int, slot_id: int) -> Optional[Booking]:
        """
        Создает бронирование с атомарной блокировкой слота.
        Использует SELECT FOR UPDATE для предотвращения race condition.
        """
        logger.info(f"Creating booking: user={user_id}, slot={slot_id}")
        
        try:
            # 1. Проверяем существующее бронирование
            existing_booking_result = await self.session.execute(
                select(Booking).where(
                    Booking.user_id == user_id,
                    Booking.slot_id == slot_id
                )
            )
            existing_booking = existing_booking_result.scalar_one_or_none()
            
            if existing_booking:
                if existing_booking.status == 'active':
                    logger.info(f"User {user_id} already has an active booking for slot {slot_id}. Reusing it.")
                    return existing_booking
                
                # Если бронирование было отменено, пробуем его восстановить
                if existing_booking.status == 'cancelled':
                    logger.info(f"User {user_id} has a cancelled booking. Attempting to reactivate.")
                    
                    # Получаем слот с блокировкой для проверки мест
                    slot_result = await self.session.execute(
                        select(DinnerSlot).where(DinnerSlot.id == slot_id).with_for_update()
                    )
                    slot = slot_result.scalar_one_or_none()
                    
                    if not slot or not slot.is_active:
                        logger.warning(f"Slot {slot_id} not found or not active")
                        return None
                        
                    if slot.current_bookings >= slot.max_people:
                        logger.warning(f"Slot {slot_id} is full ({slot.current_bookings}/{slot.max_people})")
                        return None
                        
                    # Реактивируем бронирование
                    existing_booking.status = 'active'
                    slot.current_bookings += 1
                    await self.session.commit()
                    logger.info(f"Booking {existing_booking.id} reactivated successfully")
                    return existing_booking

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
                return None
            
            if not slot.is_active:
                logger.warning(f"Slot {slot_id} is not active")
                return None
            
            if slot.current_bookings >= slot.max_people:
                logger.warning(f"Slot {slot_id} is full ({slot.current_bookings}/{slot.max_people})")
                return None
            
            # 3. Создаем бронирование
            new_booking = Booking(user_id=user_id, slot_id=slot_id)
            self.session.add(new_booking)
            
            # 4. Увеличиваем счетчик бронирований
            slot.current_bookings += 1
            
            # 5. Коммитим транзакцию (освобождает блокировку)
            await self.session.commit()
            
            logger.info(f"Booking created successfully: user={user_id}, slot={slot_id}")
            return new_booking
            
        except Exception as e:
            await self.session.rollback()
            logger.error(f"Error creating booking: {e}")
            return None

    async def create_booking_after_payment(self, user_id: int, slot_id: int, payment_id: int) -> Optional[Booking]:
        """
        Создает бронирование ПОСЛЕ успешной оплаты.
        Используется в обработчике вебхука.
        
        ВАЖНО: Резервирует место при создании платежа (soft reservation),
        финализирует при успешной оплате.
        """
        logger.info(f"🚀 Creating booking after payment: user={user_id}, slot={slot_id}, payment={payment_id}")
        
        try:
            # 1. Проверяем, не создано ли уже бронирование для этого платежа (idempotency)
            existing_booking_result = await self.session.execute(
                select(Booking).join(Payment).where(
                    Payment.id == payment_id,
                    Booking.user_id == user_id
                )
            )
            existing_booking = existing_booking_result.scalar_one_or_none()
            if existing_booking:
                logger.info(f"ℹ️ Booking {existing_booking.id} already exists for payment {payment_id}")
                return existing_booking
            
            # 2. Получаем слот с блокировкой
            slot_result = await self.session.execute(
                select(DinnerSlot).where(DinnerSlot.id == slot_id).with_for_update()
            )
            slot = slot_result.scalar_one_or_none()
            
            if not slot or not slot.is_active:
                logger.error(f"❌ Slot {slot_id} not found or not active for payment {payment_id}")
                # TODO: Инициировать возврат средств через ЮКассу
                return None
            
            if slot.current_bookings >= slot.max_people:
                logger.error(f"❌ OVERBOOKING DETECTED! Slot {slot_id} is full for payment {payment_id}. Capacity: {slot.current_bookings}/{slot.max_people}")
                logger.error(f"⚠️ REFUND REQUIRED for payment {payment_id}, user {user_id}")
                # TODO: Автоматический возврат средств
                return None
            
            # 2. Создаем бронирование
            new_booking = Booking(user_id=user_id, slot_id=slot_id, status='active')
            self.session.add(new_booking)
            
            # 3. Счётчик УЖЕ увеличен при создании платежа (soft lock)
            # Ничего не делаем с current_bookings - он уже корректный
            
            # 4. Привязываем бронирование к платежу
            payment_repo = PaymentRepo(self.session)
            payment = await payment_repo.get_payment(payment_id)
            if payment:
                # Сначала фиксируем бронь, чтобы получить её ID
                await self.session.flush()
                payment.booking_id = new_booking.id
            
            await self.session.commit()
            await self.session.refresh(new_booking)
            
            logger.info(f"✅ Booking created after payment: id={new_booking.id}")
            return new_booking
            
        except Exception as e:
            await self.session.rollback()
            logger.error(f"❌ Error creating booking after payment: {e}")
            return None

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
        slot_id: Optional[int] = None,
        booking_id: Optional[int] = None,
        status: str = 'created'
    ) -> Payment:
        """
        Создает новый платеж.
        
        ВАЖНО: При создании платежа для слота резервирует место (soft lock).
        Если оплата не пройдет за 15 минут, scheduler освободит место.
        """
        payment = Payment(
            user_id=user_id,
            yookassa_payment_id=yookassa_payment_id,
            amount=amount,
            slot_id=slot_id,
            booking_id=booking_id,
            status=status
        )
        self.session.add(payment)
        
        # 🎯 ИСПРАВЛЕНИЕ OVERBOOKING: Атомарная проверка и резервация
        if slot_id:
            # Получаем слот с блокировкой FOR UPDATE (предотвращает race condition)
            slot_result = await self.session.execute(
                select(DinnerSlot).where(DinnerSlot.id == slot_id).with_for_update()
            )
            slot = slot_result.scalar_one_or_none()
            
            if not slot:
                logger.error(f"❌ Slot {slot_id} not found for payment creation")
                raise ValueError(f"Slot {slot_id} not found")
            
            if not slot.is_active:
                logger.error(f"❌ Slot {slot_id} is not active")
                raise ValueError(f"Slot {slot_id} is not active")
            
            # 🎯 КРИТИЧНАЯ ПРОВЕРКА: Есть ли доступные места?
            available_seats = slot.max_people - slot.current_bookings
            if available_seats <= 0:
                logger.error(f"❌ OVERBOOKING PREVENTED! Slot {slot_id} is full ({slot.current_bookings}/{slot.max_people})")
                raise ValueError(f"Все места раскуплены! Выберите другое мероприятие.")
            
            # Резервируем место (soft lock)
            slot.current_bookings += 1
            logger.info(f"🔒 Soft lock: Reserved place in slot {slot_id} for payment (current: {slot.current_bookings}/{slot.max_people})")
        
        await self.session.commit()
        await self.session.refresh(payment)
        logger.info(f"Payment created: id={payment.id}, user={user_id}, slot={slot_id}, yookassa_id={yookassa_payment_id}")
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

    async def get_pending_payments(self, minutes: int = 1) -> List[Payment]:
        """
        Получает платежи со статусом 'pending' или 'created', которые старше N минут.
        Используется для автопроверки "зависших" платежей scheduler'ом.
        
        Args:
            minutes: Количество минут, после которых платёж считается "зависшим" (по умолчанию 1)
        
        Returns:
            Список Payment'ов, которые могут быть потеряны
        """
        from datetime import timedelta
        
        cutoff_time = datetime.utcnow() - timedelta(minutes=minutes)
        
        stmt = (
            select(Payment)
            .where(
                Payment.created_at <= cutoff_time,
                Payment.status.in_(['pending', 'created']),
                Payment.booking_id == None  # Бронирование ещё не создано
            )
            .order_by(Payment.created_at.asc())
        )
        result = await self.session.execute(stmt)
        payments = list(result.scalars().all())
        
        if payments:
            logger.warning(f"⚠️ Found {len(payments)} pending/orphaned payments older than {minutes} minutes")
        
        return payments

    async def get_expired_reservations(self, minutes: int = 15) -> List[Payment]:
        """
        🕒 Получает платежи, которые зарезервировали место, но не оплатили за N минут.
        Используется для освобождения soft lock'ов.
        
        Args:
            minutes: Время жизни резервации (по умолчанию 15 минут)
        """
        from datetime import timedelta
        
        cutoff_time = datetime.utcnow() - timedelta(minutes=minutes)
        
        stmt = (
            select(Payment)
            .where(
                Payment.created_at <= cutoff_time,
                Payment.status.in_(['created', 'pending']),
                Payment.booking_id == None,
                Payment.slot_id != None  # Только платежи со слотами
            )
            .order_by(Payment.created_at.asc())
        )
        result = await self.session.execute(stmt)
        return list(result.scalars().all())

    async def release_reservation(self, payment_id: int) -> bool:
        """
        🔓 Освобождает зарезервированное место в слоте и отменяет платеж.
        Используется для очистки просроченных резерваций.
        """
        payment = await self.session.get(Payment, payment_id)
        if not payment or not payment.slot_id:
            return False
        
        # Получаем слот с блокировкой
        slot_result = await self.session.execute(
            select(DinnerSlot).where(DinnerSlot.id == payment.slot_id).with_for_update()
        )
        slot = slot_result.scalar_one_or_none()
        
        if slot and slot.current_bookings > 0:
            slot.current_bookings -= 1
            logger.info(f"🔓 Released reservation: slot {slot.id} now has {slot.current_bookings}/{slot.max_people}")
        
        # Отменяем платеж
        payment.status = 'expired'
        await self.session.commit()
        
        logger.info(f"✅ Reservation released for payment {payment_id}")
        return True


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
                        value = parse_date(value)
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

    async def get_all_user_ids(self) -> List[int]:
        """Возвращает user_id всех зарегистрированных пользователей."""
        result = await self.session.execute(select(User.user_id))
        return [row[0] for row in result.all()]


class GroupRepo(BaseRepo):
    """Репозиторий для работы с группами."""

    async def get_all_groups(self, slot_id: Optional[int] = None) -> List[dict]:
        """Возвращает все группы с количеством участников."""
        stmt = (
            select(Group, func.count(UserGroup.id).label("member_count"))
            .outerjoin(UserGroup, Group.id == UserGroup.group_id)
            .group_by(Group.id)
            .order_by(Group.created_at.desc())
        )
        if slot_id is not None:
            stmt = stmt.where(Group.slot_id == slot_id)
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

    async def create_group(self, name: str, slot_id: Optional[int] = None) -> Group:
        """Создаёт новую группу."""
        group = Group(name=name, slot_id=slot_id)
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

    async def get_teammate_ids(self, user_id: int) -> set[int]:
        """Возвращает ID всех пользователей, которые состоят в одних группах с данным пользователем."""
        # 1. Находим все ID групп, в которых состоит пользователь
        groups_stmt = select(UserGroup.group_id).where(UserGroup.user_id == user_id)
        groups_result = await self.session.execute(groups_stmt)
        group_ids = [row[0] for row in groups_result.all()]
        
        if not group_ids:
            return set()
            
        # 2. Находим всех участников этих групп
        teammates_stmt = select(UserGroup.user_id).where(UserGroup.group_id.in_(group_ids))
        teammates_result = await self.session.execute(teammates_stmt)
        return {row[0] for row in teammates_result.all() if row[0] != user_id}


class PromotionRepo(BaseRepo):
    """Репозиторий для работы с акциями и предложениями."""

    async def get_active_promotions(self) -> List[Promotion]:
        """Возвращает все активные акции (для пользователей)."""
        stmt = (
            select(Promotion)
            .where(Promotion.is_active == True)
            .order_by(Promotion.created_at.desc())
        )
        result = await self.session.execute(stmt)
        return list(result.scalars().all())

    async def get_all_promotions(self) -> List[Promotion]:
        """Возвращает все акции (для админа, включая неактивные)."""
        stmt = select(Promotion).order_by(Promotion.created_at.desc())
        result = await self.session.execute(stmt)
        return list(result.scalars().all())

    async def get_promotion_by_id(self, promotion_id: int) -> Optional[Promotion]:
        """Возвращает акцию по ID."""
        return await self.session.get(Promotion, promotion_id)

    async def create_promotion(
        self,
        title: str,
        description: str,
        price: int,
        target_audience: Optional[str] = None,
        quantity: int = 1,
        validity_days: int = 30,
    ) -> Promotion:
        """Создаёт новую акцию."""
        promo = Promotion(
            title=title,
            description=description,
            target_audience=target_audience,
            price=price,
            quantity=quantity,
            validity_days=validity_days,
        )
        self.session.add(promo)
        await self.session.commit()
        await self.session.refresh(promo)
        return promo

    async def update_promotion(self, promotion_id: int, **kwargs) -> Optional[Promotion]:
        """Обновляет поля акции."""
        promo = await self.session.get(Promotion, promotion_id)
        if not promo:
            return None
        for key, value in kwargs.items():
            if hasattr(promo, key):
                setattr(promo, key, value)
        await self.session.commit()
        await self.session.refresh(promo)
        return promo

    async def delete_promotion(self, promotion_id: int) -> bool:
        """Деактивирует акцию (мягкое удаление)."""
        promo = await self.session.get(Promotion, promotion_id)
        if not promo:
            return False
        promo.is_active = False
        await self.session.commit()
        return True

    async def create_purchase(
        self,
        user_id: int,
        promotion_id: int,
        payment_id: Optional[int] = None,
    ) -> Optional[PromotionPurchase]:
        """Создаёт покупку акции пользователем."""
        promo = await self.session.get(Promotion, promotion_id)
        if not promo:
            return None

        from datetime import timedelta
        expires_at = datetime.utcnow() + timedelta(days=promo.validity_days)

        purchase = PromotionPurchase(
            user_id=user_id,
            promotion_id=promotion_id,
            payment_id=payment_id,
            status='active',
            expires_at=expires_at,
            visits_remaining=promo.quantity,
        )
        self.session.add(purchase)
        await self.session.commit()
        await self.session.refresh(purchase)
        return purchase

