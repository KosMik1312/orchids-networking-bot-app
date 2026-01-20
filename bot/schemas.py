from typing import Optional
from pydantic import BaseModel, Field


class UserProfile(BaseModel):
    name: Optional[str] = Field(None, description="User display name")
    age: Optional[int] = Field(None, description="Age of the user")
    relationship_status: Optional[str] = Field(None, description="Relationship status")
    children: Optional[str] = Field(None, description="Children status")
    occupation: Optional[str] = Field(None, description="Occupation type")
    goal: Optional[str] = Field(None, description="Meeting goal")
    interests: Optional[str] = Field(None, description="Short interests text")
    comfort_level: Optional[int] = Field(None, description="Comfort level")
    social_frequency: Optional[int] = Field(None, description="Social frequency")
    communication_format: Optional[str] = Field(None, description="Communication format")
    evening_scenario: Optional[str] = Field(None, description="Evening scenario")
    telegram: Optional[str] = Field(None, description="Telegram username")
    instagram: Optional[str] = Field(None, description="Instagram username")
    photo: Optional[str] = Field(None, description="Photo URL")
    about_me: Optional[str] = Field(None, description="About me text")
    city: Optional[str] = Field(None, description="City")

    class Config:
        anystr_strip_whitespace = True
