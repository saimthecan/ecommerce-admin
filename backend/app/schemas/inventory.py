"""Schemas for InventoryMovement and OrderEvent models."""
from datetime import datetime
from uuid import UUID

from pydantic import BaseModel


# ───────────────── InventoryMovement ─────────────────

class InventoryMovementBase(BaseModel):
    change: int
    reason: str
    notes: str | None = None


class InventoryMovementCreate(InventoryMovementBase):
    product_id: UUID | None = None
    variant_id: UUID | None = None
    ref_order_id: UUID | None = None


class InventoryMovementOut(InventoryMovementBase):
    id: UUID
    product_id: UUID | None
    variant_id: UUID | None
    ref_order_id: UUID | None
    created_at: datetime

    class Config:
        from_attributes = True


# ───────────────── OrderEvent (Timeline) ─────────────────

class OrderEventBase(BaseModel):
    type: str
    description: str | None = None


class OrderEventCreate(OrderEventBase):
    order_id: UUID
    actor_id: UUID | None = None


class OrderEventOut(OrderEventBase):
    id: UUID
    order_id: UUID
    actor_id: UUID | None
    created_at: datetime

    class Config:
        from_attributes = True
