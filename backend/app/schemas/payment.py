"""Schemas for Payment and Refund models."""
from datetime import datetime
from decimal import Decimal
from uuid import UUID

from pydantic import BaseModel


# ───────────────── Payment ─────────────────

class PaymentBase(BaseModel):
    provider: str = "stripe"
    currency: str = "TRY"


class PaymentCreate(PaymentBase):
    order_id: UUID
    amount: Decimal


class PaymentOut(PaymentBase):
    id: UUID
    order_id: UUID
    intent_id: str | None
    status: str
    amount: Decimal
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class CreatePaymentIntentRequest(BaseModel):
    order_id: UUID


class CreatePaymentIntentResponse(BaseModel):
    payment_id: UUID
    client_secret: str
    publishable_key: str


# ───────────────── Refund ─────────────────

class RefundCreate(BaseModel):
    order_id: UUID
    amount: Decimal
    reason: str | None = None


class RefundOut(BaseModel):
    id: UUID
    payment_id: UUID
    order_id: UUID
    provider_refund_id: str | None
    status: str
    amount: Decimal
    reason: str | None
    created_at: datetime

    class Config:
        from_attributes = True
