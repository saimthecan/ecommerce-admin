"""Payment and Refund models for Stripe integration."""
import uuid
from datetime import datetime
from decimal import Decimal

from sqlalchemy import Column, String, ForeignKey, DateTime, Numeric, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship

from app.db.base import Base


class Payment(Base):
    __tablename__ = "payments"

    id = Column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
        index=True,
    )
    order_id = Column(
        UUID(as_uuid=True),
        ForeignKey("orders.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    provider = Column(String(50), default="stripe")
    intent_id = Column(String(255), nullable=True, unique=True)  # Stripe PaymentIntent ID
    status = Column(String(50), default="pending")  # pending, succeeded, failed, cancelled
    amount = Column(Numeric(12, 2), nullable=False)
    currency = Column(String(10), default="TRY")
    
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    order = relationship("Order", back_populates="payments")
    refunds = relationship("Refund", back_populates="payment", cascade="all, delete-orphan")


class Refund(Base):
    __tablename__ = "refunds"

    id = Column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
        index=True,
    )
    payment_id = Column(
        UUID(as_uuid=True),
        ForeignKey("payments.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    order_id = Column(
        UUID(as_uuid=True),
        ForeignKey("orders.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    provider_refund_id = Column(String(255), nullable=True)  # Stripe Refund ID
    status = Column(String(50), default="pending")  # pending, succeeded, failed
    amount = Column(Numeric(12, 2), nullable=False)
    reason = Column(Text, nullable=True)
    
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    payment = relationship("Payment", back_populates="refunds")
    order = relationship("Order", back_populates="refunds")
