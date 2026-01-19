"""Schemas for Address model."""
from datetime import datetime
from uuid import UUID

from pydantic import BaseModel


class AddressBase(BaseModel):
    name: str
    phone: str | None = None
    line1: str
    line2: str | None = None
    city: str
    state: str | None = None
    postal_code: str
    country: str = "Türkiye"
    is_default: str = "false"


class AddressCreate(AddressBase):
    pass


class AddressUpdate(BaseModel):
    name: str | None = None
    phone: str | None = None
    line1: str | None = None
    line2: str | None = None
    city: str | None = None
    state: str | None = None
    postal_code: str | None = None
    country: str | None = None
    is_default: str | None = None


class AddressOut(AddressBase):
    id: UUID
    user_id: UUID
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
