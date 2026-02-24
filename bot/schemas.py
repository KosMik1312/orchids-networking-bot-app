"""
Pydantic схемы для API.
Обновлённая версия с:
- Полной типизацией
- Response моделями для API
"""

from typing import Optional, List
from datetime import datetime
from pydantic import BaseModel, Field, ConfigDict


# ===== Request Models =====

class UserProfile(BaseModel):
    """Профиль пользователя (для сохранения/получения)."""
    name: Optional[str] = Field(None, description="User display name")
    age: Optional[int] = Field(None, description="Age of the user")
    gender: Optional[str] = Field(None, description="Gender")
    zodiac: Optional[str] = Field(None, description="Zodiac sign")
    relationship_status: Optional[str] = Field(None, description="Relationship status")
    children: Optional[str] = Field(None, description="Children status")
    occupation: Optional[str] = Field(None, description="Occupation type")
    goal: Optional[List[str]] = Field(None, description="Meeting goals (multiple selection)")
    interests: Optional[List[str]] = Field(None, description="Interests list (multiple selection)")
    comfort_level: Optional[int] = Field(None, description="Comfort level")
    social_frequency: Optional[int] = Field(None, description="Social frequency")
    communication_format: Optional[str] = Field(None, description="Communication format")
    evening_scenario: Optional[str] = Field(None, description="Evening scenario")
    telegram: Optional[str] = Field(None, description="Telegram username")
    instagram: Optional[str] = Field(None, description="Instagram username")
    photo: Optional[str] = Field(None, description="Photo URL")
    about_me: Optional[str] = Field(None, description="About me text")
    city: Optional[str] = Field(None, description="City")
    # Fields from BestInMeScreen
    strengths: Optional[List[str]] = Field(None, description="Strengths/strong sides")
    weaknesses: Optional[str] = Field(None, description="Weaknesses text")
    values: Optional[List[str]] = Field(None, description="Life values")
    love_language: Optional[List[str]] = Field(None, description="Love languages")
    goals: Optional[str] = Field(None, description="Goals text")
    dreams: Optional[str] = Field(None, description="Dreams text")
    # New meeting-related fields
    meeting_metro: Optional[List[str]] = Field(None, description="Preferred metro stations")
    meeting_days: Optional[List[str]] = Field(None, description="Preferred meeting days")
    meeting_time_from: Optional[str] = Field(None, description="Preferred meeting time from")
    meeting_time_to: Optional[str] = Field(None, description="Preferred meeting time to")
    # Frontend sends 'format' — map it on save to `communication_format` in the DB
    format: Optional[List[str]] = Field(None, description="Meeting format (multiple selection)")
    # Флаг завершённости профиля
    is_profile_completed: Optional[bool] = Field(None, description="Whether the profile is completed")

    model_config = ConfigDict(str_strip_whitespace=True)


# ===== Response Models =====

class SlotResponse(BaseModel):
    """Ответ со слотом."""
    id: int
    date: str
    time: str
    city: str
    restaurant: str
    max_people: int
    current_bookings: int
    available_places: int
    created_at: Optional[str] = None
    is_active: bool

    model_config = ConfigDict(from_attributes=True)


class SlotsListResponse(BaseModel):
    """Список слотов."""
    slots: List[SlotResponse]


class BookingResponse(BaseModel):
    """Ответ с бронированием."""
    id: int
    user_id: int
    slot_id: int
    booking_date: Optional[str] = None
    status: str
    date: Optional[str] = None
    time: Optional[str] = None
    city: Optional[str] = None
    restaurant: Optional[str] = None
    max_people: Optional[int] = None
    current_bookings: Optional[int] = None

    model_config = ConfigDict(from_attributes=True)


class BookingsListResponse(BaseModel):
    """Список бронирований."""
    bookings: List[BookingResponse]


class PaymentResponse(BaseModel):
    """Ответ с платежом."""
    paymentId: int
    yookassaPaymentId: str
    confirmationUrl: Optional[str] = None
    status: str

    model_config = ConfigDict(from_attributes=True)


class PaymentStatusResponse(BaseModel):
    """Ответ со статусом платежа."""
    paymentId: int
    yookassaPaymentId: str
    status: str
    amount: str
    userId: int
    bookingId: Optional[int] = None


class ContactResponse(BaseModel):
    """Ответ с контактом."""
    name: Optional[str] = None
    age: Optional[int] = None
    interests: Optional[str] = None
    city: Optional[str] = None
    telegram: Optional[str] = None
    instagram: Optional[str] = None
    about_me: Optional[str] = None
    id: Optional[str] = None  # Для support контакта
    isSupport: Optional[bool] = None


class ContactsListResponse(BaseModel):
    """Список контактов."""
    contacts: List[ContactResponse]


class ProfileResponse(BaseModel):
    """Ответ с профилем."""
    profile: UserProfile


class SuccessResponse(BaseModel):
    """Успешный ответ."""
    success: bool = True


class ErrorResponse(BaseModel):
    """Ответ с ошибкой."""
    detail: str
    success: bool = False


class HealthResponse(BaseModel):
    """Ответ health check."""
    status: str = "OK"
