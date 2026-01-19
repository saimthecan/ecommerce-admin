"""Schemas for ProductVariant and ProductImage models."""
from datetime import datetime
from decimal import Decimal
from uuid import UUID
from typing import Any

from pydantic import BaseModel


# ───────────────── ProductVariant ─────────────────

class VariantBase(BaseModel):
    name: str
    sku: str | None = None
    attributes: dict[str, Any] = {}
    price_override: Decimal | None = None
    stock: int = 0
    is_active: bool = True


class VariantCreate(VariantBase):
    product_id: UUID


class VariantUpdate(BaseModel):
    name: str | None = None
    sku: str | None = None
    attributes: dict[str, Any] | None = None
    price_override: Decimal | None = None
    stock: int | None = None
    is_active: bool | None = None


class VariantOut(VariantBase):
    id: UUID
    product_id: UUID
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


# ───────────────── ProductImage ─────────────────

class ImageBase(BaseModel):
    url: str
    alt_text: str | None = None
    is_primary: bool = False
    sort_order: int = 0


class ImageCreate(ImageBase):
    product_id: UUID | None = None
    variant_id: UUID | None = None


class ImageOut(ImageBase):
    id: UUID
    product_id: UUID | None
    variant_id: UUID | None
    created_at: datetime

    class Config:
        from_attributes = True
