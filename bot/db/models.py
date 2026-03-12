"""
ORM модели для базы данных.
Обновлённая версия с:
- Индексами для часто запрашиваемых полей
- JSON вместо JSONB для совместимости (PostgreSQL использует JSONB автоматически)
"""

from sqlalchemy import (
    Column, Integer, BigInteger, String, Text, ForeignKey, TIMESTAMP, Boolean, Index, Date
)
from sqlalchemy.orm import declarative_base, relationship
from sqlalchemy.sql import func
from sqlalchemy.dialects.postgresql import JSONB

Base = declarative_base()


class User(Base):
    __tablename__ = 'users'

    user_id = Column(BigInteger, primary_key=True)
    name = Column(String)
    age = Column(Integer)
    gender = Column(String)
    zodiac = Column(String, nullable=True)  # Зодиак
    relationship_status = Column(String)
    children = Column(String)
    occupation = Column(String)
    goal = Column(JSONB, nullable=True)  # Массив целей встреч
    interests = Column(JSONB, nullable=True)  # Массив интересов
    comfort_level = Column(Integer)
    social_frequency = Column(Integer)
    communication_format = Column(JSONB, nullable=True)  # Массив форматов встреч
    evening_scenario = Column(String)
    telegram = Column(String)
    instagram = Column(String)
    photo = Column(String)
    about_me = Column(Text)
    # Поля из BestInMeScreen
    strengths = Column(JSONB, nullable=True)  # Массив сильных сторон
    weaknesses = Column(Text, nullable=True)  # Текстовое поле слабостей
    values = Column(JSONB, nullable=True)  # Массив жизненных ценностей
    love_language = Column(JSONB, nullable=True)  # Массив языков любви
    goals = Column(Text, nullable=True)  # Мои цели
    dreams = Column(Text, nullable=True)  # Мои мечты
    # Настройки встреч (JSONB для PostgreSQL)
    meeting_metro = Column(JSONB, nullable=True)
    meeting_days = Column(JSONB, nullable=True)
    meeting_time_from = Column(String, nullable=True)
    meeting_time_to = Column(String, nullable=True)
    city = Column(String, index=True)  # Индекс для поиска по городу
    favorite_slots = Column(JSONB, nullable=True)  # Избранные мероприятия
    is_admin = Column(Boolean, default=False)  # Флаг администратора
    is_profile_completed = Column(Boolean, default=False)  # Флаг завершенности профиля
    created_at = Column(TIMESTAMP, server_default=func.now())
    updated_at = Column(TIMESTAMP, server_default=func.now(), onupdate=func.now())

    bookings = relationship("Booking", back_populates="user", cascade="all, delete-orphan")


class DinnerSlot(Base):
    __tablename__ = 'dinner_slots'

    id = Column(Integer, primary_key=True, autoincrement=True)
    date = Column(Date, nullable=False)
    time = Column(String, nullable=False)
    city = Column(String, nullable=False)
    restaurant = Column(String, nullable=False)
    max_people = Column(Integer, nullable=False)
    price = Column(Integer, nullable=False, default=10)
    current_bookings = Column(Integer, default=0)
    is_active = Column(Boolean, default=True, index=True)  # Индекс для фильтрации активных
    created_at = Column(TIMESTAMP, server_default=func.now())
    
    bookings = relationship("Booking", back_populates="slot", cascade="all, delete-orphan")

    # Составной индекс для поиска доступных слотов
    __table_args__ = (
        Index('ix_dinner_slots_active_city', 'is_active', 'city'),
        Index('ix_dinner_slots_date_time', 'date', 'time'),
    )


class Booking(Base):
    __tablename__ = 'bookings'

    id = Column(Integer, primary_key=True, autoincrement=True)
    user_id = Column(BigInteger, ForeignKey('users.user_id', ondelete="CASCADE"), nullable=False)
    slot_id = Column(Integer, ForeignKey('dinner_slots.id', ondelete="CASCADE"), nullable=False)
    booking_date = Column(TIMESTAMP, server_default=func.now())
    status = Column(String, default='active', index=True)  # Индекс для фильтрации по статусу

    user = relationship("User", back_populates="bookings")
    slot = relationship("DinnerSlot", back_populates="bookings")

    # Составной индекс: пользователь может забронировать слот несколько раз
    __table_args__ = (
        Index('ix_bookings_user_slot', 'user_id', 'slot_id'),
        Index('ix_bookings_user_status', 'user_id', 'status'),
    )


class Payment(Base):
    __tablename__ = 'payments'

    id = Column(Integer, primary_key=True, autoincrement=True)
    yookassa_payment_id = Column(String, unique=True, nullable=False, index=True)
    user_id = Column(BigInteger, ForeignKey('users.user_id', ondelete="CASCADE"), nullable=False, index=True)
    slot_id = Column(Integer, ForeignKey('dinner_slots.id', ondelete="SET NULL"), nullable=True)
    booking_id = Column(Integer, ForeignKey('bookings.id', ondelete="SET NULL"), nullable=True)
    amount = Column(String, nullable=False)
    status = Column(String, default='created', index=True)
    created_at = Column(TIMESTAMP, server_default=func.now())
    updated_at = Column(TIMESTAMP, server_default=func.now(), onupdate=func.now())

    user = relationship("User")
    slot = relationship("DinnerSlot")
    booking = relationship("Booking")

    # Составной индекс для поиска платежей пользователя
    __table_args__ = (
        Index('ix_payments_user_status', 'user_id', 'status'),
    )


class Group(Base):
    __tablename__ = 'groups'

    id = Column(Integer, primary_key=True, autoincrement=True)
    slot_id = Column(Integer, ForeignKey('dinner_slots.id', ondelete="CASCADE"), nullable=True, index=True)
    name = Column(String, nullable=False)
    created_at = Column(TIMESTAMP, server_default=func.now())

    slot = relationship("DinnerSlot")
    members = relationship("UserGroup", back_populates="group", cascade="all, delete-orphan")


class UserGroup(Base):
    __tablename__ = 'user_groups'

    id = Column(Integer, primary_key=True, autoincrement=True)
    user_id = Column(BigInteger, ForeignKey('users.user_id', ondelete="CASCADE"), nullable=False)
    group_id = Column(Integer, ForeignKey('groups.id', ondelete="CASCADE"), nullable=False)

    user = relationship("User")
    group = relationship("Group", back_populates="members")

    __table_args__ = (
        Index('ix_user_groups_unique', 'user_id', 'group_id', unique=True),
    )


class Promotion(Base):
    """Акция / специальное предложение (пакет мероприятий)."""
    __tablename__ = 'promotions'

    id = Column(Integer, primary_key=True, autoincrement=True)
    title = Column(String, nullable=False)              # "Подписка для пар"
    description = Column(Text, nullable=False)           # Подробное описание
    target_audience = Column(String, nullable=True)      # "Пары, близкие друзья, коллеги"
    price = Column(Integer, nullable=False)              # Стоимость в рублях
    quantity = Column(Integer, nullable=False, default=1) # Кол-во посещений в пакете
    validity_days = Column(Integer, nullable=False, default=30)  # Срок действия (дней)
    is_active = Column(Boolean, default=True, index=True)
    created_at = Column(TIMESTAMP, server_default=func.now())

    purchases = relationship("PromotionPurchase", back_populates="promotion", cascade="all, delete-orphan")


class PromotionPurchase(Base):
    """Покупка акции пользователем."""
    __tablename__ = 'promotion_purchases'

    id = Column(Integer, primary_key=True, autoincrement=True)
    user_id = Column(BigInteger, ForeignKey('users.user_id', ondelete="CASCADE"), nullable=False, index=True)
    promotion_id = Column(Integer, ForeignKey('promotions.id', ondelete="CASCADE"), nullable=False, index=True)
    payment_id = Column(Integer, ForeignKey('payments.id', ondelete="SET NULL"), nullable=True)
    status = Column(String, default='pending', index=True)  # pending, active, expired, used
    purchased_at = Column(TIMESTAMP, server_default=func.now())
    expires_at = Column(TIMESTAMP, nullable=True)
    visits_remaining = Column(Integer, nullable=True)  # Оставшиеся посещения

    user = relationship("User")
    promotion = relationship("Promotion", back_populates="purchases")
    payment = relationship("Payment")

    __table_args__ = (
        Index('ix_promotion_purchases_user_status', 'user_id', 'status'),
    )
