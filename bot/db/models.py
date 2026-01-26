from sqlalchemy import (
    create_engine, Column, Integer, String, Text, ForeignKey, TIMESTAMP, Boolean,
    func
)
from sqlalchemy.orm import declarative_base, relationship
from sqlalchemy.sql import func

Base = declarative_base()

class User(Base):
    __tablename__ = 'users'

    user_id = Column(Integer, primary_key=True)
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
    city = Column(String)
    created_at = Column(TIMESTAMP, server_default=func.now())
    updated_at = Column(TIMESTAMP, server_default=func.now(), onupdate=func.now())

    bookings = relationship("Booking", back_populates="user", cascade="all, delete-orphan")

class DinnerSlot(Base):
    __tablename__ = 'dinner_slots'

    id = Column(Integer, primary_key=True, autoincrement=True)
    date = Column(String, nullable=False)
    time = Column(String, nullable=False)
    city = Column(String, nullable=False)
    restaurant = Column(String, nullable=False)
    max_people = Column(Integer, nullable=False)
    current_bookings = Column(Integer, default=0)
    is_active = Column(Boolean, default=True)
    created_at = Column(TIMESTAMP, server_default=func.now())
    
    bookings = relationship("Booking", back_populates="slot", cascade="all, delete-orphan")


class Booking(Base):
    __tablename__ = 'bookings'

    id = Column(Integer, primary_key=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey('users.user_id', ondelete="CASCADE"), nullable=False)
    slot_id = Column(Integer, ForeignKey('dinner_slots.id', ondelete="CASCADE"), nullable=False)
    booking_date = Column(TIMESTAMP, server_default=func.now())
    status = Column(String, default='active')

    user = relationship("User", back_populates="bookings")
    slot = relationship("DinnerSlot", back_populates="bookings")


class Payment(Base):
    __tablename__ = 'payments'

    id = Column(Integer, primary_key=True, autoincrement=True)
    yookassa_payment_id = Column(String, unique=True, nullable=False)
    user_id = Column(Integer, ForeignKey('users.user_id', ondelete="CASCADE"), nullable=False)
    booking_id = Column(Integer, ForeignKey('bookings.id', ondelete="SET NULL"), nullable=True)
    amount = Column(String, nullable=False)
    status = Column(String, default='created')
    created_at = Column(TIMESTAMP, server_default=func.now())
    updated_at = Column(TIMESTAMP, server_default=func.now(), onupdate=func.now())

    user = relationship("User")
    booking = relationship("Booking")
