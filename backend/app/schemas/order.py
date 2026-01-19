from datetime import datetime
from decimal import Decimal
from uuid import UUID

from pydantic import BaseModel

from app.schemas.inventory import OrderEventOut


# ----- Order Items -----


class OrderItemBase(BaseModel):
    product_id: UUID
    quantity: int
    variant_id: UUID | None = None


class OrderItemCreate(OrderItemBase):
    pass


class OrderItemInDBBase(BaseModel):
    id: UUID
    product_id: UUID
    variant_id: UUID | None
    quantity: int
    unit_price: Decimal
    line_total: Decimal
    created_at: datetime

    class Config:
        from_attributes = True


class OrderItemOut(OrderItemInDBBase):
    pass


# ----- Orders -----


class OrderBase(BaseModel):
    status: str = "pending"


class OrderCreate(OrderBase):
    """
    Admin panelde sipariş oluştururken:
    - user_id: opsiyonel (admin başka kullanıcı adına sipariş açabilir)
    - items: product_id + quantity
    unit_price ve line_total backend'de hesaplanacak.
    """

    user_id: UUID | None = None
    items: list[OrderItemCreate]
    shipping_address_id: UUID | None = None


class OrderUpdateStatus(BaseModel):
    status: str
    tracking_number: str | None = None
    carrier: str | None = None


class OrderUpdateShipping(BaseModel):
    tracking_number: str | None = None
    carrier: str | None = None


class OrderInDBBase(OrderBase):
    id: UUID
    user_id: UUID | None
    total_amount: Decimal
    shipping_address_id: UUID | None
    tracking_number: str | None
    carrier: str | None
    shipped_at: datetime | None
    delivered_at: datetime | None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class OrderOut(OrderInDBBase):
    items: list[OrderItemOut]
    events: list[OrderEventOut] = []
