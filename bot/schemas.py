from typing import Optional
from pydantic import BaseModel, Field, constr, conint


class UserProfile(BaseModel):
    name: constr(strip_whitespace=True, min_length=1) = Field(..., description="User display name")
    age: conint(ge=14, le=120) = Field(..., description="Age of the user")
    interests: Optional[str] = Field(None, description="Short interests text")

    class Config:
        anystr_strip_whitespace = True
