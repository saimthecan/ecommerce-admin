from datetime import datetime
from decimal import Decimal
from uuid import UUID

from pydantic import BaseModel


class ProductBase(BaseModel):
    name: str
    description: str | None = None
    price: Decimal
    stock: int
    is_active: bool = True
    category_id: UUID | None = None


class ProductCreate(ProductBase):
    pass


class ProductUpdate(BaseModel):
    name: str | None = None
    description: str | None = None
    price: Decimal | None = None
    stock: int | None = None
    is_active: bool | None = None
    category_id: UUID | None = None


class ProductInDBBase(ProductBase):
    id: UUID
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class ProductOut(ProductInDBBase):
    pass