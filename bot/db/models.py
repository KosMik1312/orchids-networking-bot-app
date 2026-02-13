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
    relationship_status = Column(String)
    children = Column(String)
    occupation = Column(String)
    goal = Column(String)
    interests = Column(Text)
    comfort_level = Column(Integer)
    social_frequency = Column(Integer)
    communication_format = Column(String)
    evening_scenario = Column(String)
    telegram = Column(String)
    instagram = Column(String)
    photo = Column(String)
    about_me = Column(Text)
    # Настройки встреч (JSONB для PostgreSQL)
    meeting_metro = Column(JSONB, nullable=True)
    meeting_days = Column(JSONB, nullable=True)
    meeting_time_from = Column(String, nullable=True)
    meeting_time_to = Column(String, nullable=True)
    city = Column(String, index=True)  # Индекс для поиска по городу
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

    # Составной уникальный индекс: пользователь может забронировать слот только один раз
    __table_args__ = (
        Index('ix_bookings_user_slot', 'user_id', 'slot_id', unique=True),
        Index('ix_bookings_user_status', 'user_id', 'status'),
    )


class Payment(Base):
    __tablename__ = 'payments'

    id = Column(Integer, primary_key=True, autoincrement=True)
    yookassa_payment_id = Column(String, unique=True, nullable=False, index=True)  # Индекс для поиска по yookassa_id
    user_id = Column(BigInteger, ForeignKey('users.user_id', ondelete="CASCADE"), nullable=False, index=True)
    booking_id = Column(Integer, ForeignKey('bookings.id', ondelete="SET NULL"), nullable=True)
    amount = Column(String, nullable=False)
    status = Column(String, default='created', index=True)  # Индекс для фильтрации по статусу
    created_at = Column(TIMESTAMP, server_default=func.now())
    updated_at = Column(TIMESTAMP, server_default=func.now(), onupdate=func.now())

    user = relationship("User")
    booking = relationship("Booking")

    # Составной индекс для поиска платежей пользователя
    __table_args__ = (
        Index('ix_payments_user_status', 'user_id', 'status'),
    )


class Group(Base):
    __tablename__ = 'groups'

    id = Column(Integer, primary_key=True, autoincrement=True)
    name = Column(String, nullable=False, unique=True)
    created_at = Column(TIMESTAMP, server_default=func.now())

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
