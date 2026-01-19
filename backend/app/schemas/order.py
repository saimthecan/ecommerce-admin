from datetime import datetime
from decimal import Decimal
from uuid import UUID

from pydantic import BaseModel


# ----- Order Items -----


class OrderItemBase(BaseModel):
    product_id: UUID
    quantity: int


class OrderItemCreate(OrderItemBase):
    pass


class OrderItemInDBBase(BaseModel):
    id: UUID
    product_id: UUID
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
    status: str = "pending"  # Şimdilik string, istersen enum'a çekebiliriz.


class OrderCreate(OrderBase):
    """
    Admin panelde sipariş oluştururken:
    - user_id: opsiyonel (admin başka kullanıcı adına sipariş açabilir)
    - items: product_id + quantity
    unit_price ve line_total backend'de hesaplanacak.
    """

    user_id: UUID | None = None
    items: list[OrderItemCreate]


class OrderUpdateStatus(BaseModel):
    status: str


class OrderInDBBase(OrderBase):
    id: UUID
    user_id: UUID | None
    total_amount: Decimal
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class OrderOut(OrderInDBBase):
    items: list[OrderItemOut]
