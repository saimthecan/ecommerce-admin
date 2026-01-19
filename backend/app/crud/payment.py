"""CRUD operations for Payment and Refund models."""
from uuid import UUID
from typing import Sequence
from decimal import Decimal

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.payment import Payment, Refund
from app.schemas.payment import PaymentCreate


async def get_payment(db: AsyncSession, payment_id: UUID) -> Payment | None:
    return await db.get(Payment, payment_id)


async def get_payment_by_intent(db: AsyncSession, intent_id: str) -> Payment | None:
    """Get payment by Stripe PaymentIntent ID."""
    stmt = select(Payment).where(Payment.intent_id == intent_id)
    result = await db.execute(stmt)
    return result.scalar_one_or_none()


async def get_payments_by_order(db: AsyncSession, order_id: UUID) -> Sequence[Payment]:
    """Get all payments for an order."""
    stmt = select(Payment).where(Payment.order_id == order_id).order_by(Payment.created_at)
    result = await db.execute(stmt)
    return result.scalars().all()


async def create_payment(
    db: AsyncSession,
    order_id: UUID,
    amount: Decimal,
    intent_id: str | None = None,
    provider: str = "stripe",
    currency: str = "TRY",
    status: str = "pending",
) -> Payment:
    obj = Payment(
        order_id=order_id,
        provider=provider,
        intent_id=intent_id,
        status=status,
        amount=amount,
        currency=currency,
    )
    db.add(obj)
    await db.commit()
    await db.refresh(obj)
    return obj


async def update_payment_status(
    db: AsyncSession,
    db_obj: Payment,
    status: str,
) -> Payment:
    db_obj.status = status
    await db.commit()
    await db.refresh(db_obj)
    return db_obj


# ───────────────── Refund ─────────────────

async def get_refund(db: AsyncSession, refund_id: UUID) -> Refund | None:
    return await db.get(Refund, refund_id)


async def get_refunds_by_order(db: AsyncSession, order_id: UUID) -> Sequence[Refund]:
    """Get all refunds for an order."""
    stmt = select(Refund).where(Refund.order_id == order_id).order_by(Refund.created_at)
    result = await db.execute(stmt)
    return result.scalars().all()


async def create_refund(
    db: AsyncSession,
    payment_id: UUID,
    order_id: UUID,
    amount: Decimal,
    reason: str | None = None,
    provider_refund_id: str | None = None,
    status: str = "pending",
) -> Refund:
    obj = Refund(
        payment_id=payment_id,
        order_id=order_id,
        amount=amount,
        reason=reason,
        provider_refund_id=provider_refund_id,
        status=status,
    )
    db.add(obj)
    await db.commit()
    await db.refresh(obj)
    return obj


async def update_refund_status(
    db: AsyncSession,
    db_obj: Refund,
    status: str,
    provider_refund_id: str | None = None,
) -> Refund:
    db_obj.status = status
    if provider_refund_id:
        db_obj.provider_refund_id = provider_refund_id
    await db.commit()
    await db.refresh(db_obj)
    return db_obj
