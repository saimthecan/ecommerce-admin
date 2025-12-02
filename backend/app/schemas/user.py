from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, EmailStr, Field


class UserBase(BaseModel):
    email: EmailStr
    full_name: str | None = None
    is_active: bool = True
    is_superuser: bool = False


class UserCreate(BaseModel):
    email: EmailStr
    full_name: str | None = None
    password: str = Field(min_length=6, max_length=128)


class UserUpdate(BaseModel):
    full_name: str | None = None
    is_active: bool | None = None
    is_superuser: bool | None = None


class UserInDBBase(UserBase):
    id: UUID
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True  # SQLAlchemy modelden otomatik okuma


class UserOut(UserInDBBase):
    """API'den döneceğimiz kullanıcı modeli."""
    pass
