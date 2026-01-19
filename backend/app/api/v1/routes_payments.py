"""Routes for Payment and Refund management."""
from typing import List
from uuid import UUID
from decimal import Decimal

from fastapi import APIRouter, Depends, HTTPException, status, Request, Header
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_db_session, get_current_active_user, get_current_active_admin
from app.core.config import settings
from app.crud.payment import (
    get_payment,
    get_payment_by_intent,
    get_payments_by_order,
    create_payment,
    update_payment_status,
    create_refund,
    get_refunds_by_order,
)
from app.crud.order import get_order
from app.crud.inventory import create_order_event
from app.schemas.payment import (
    PaymentOut,
    CreatePaymentIntentRequest,
    CreatePaymentIntentResponse,
    RefundCreate,
    RefundOut,
)
from app.models.user import User as UserModel
from app.models.order import Order

router = APIRouter()


def ensure_stripe_configured():
    """Check if Stripe is configured."""
    if not settings.STRIPE_SECRET_KEY:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Ödeme sistemi yapılandırılmamış.",
        )


@router.post("/create-intent", response_model=CreatePaymentIntentResponse)
async def create_payment_intent(
    body: CreatePaymentIntentRequest,
    db: AsyncSession = Depends(get_db_session),
    current_user: UserModel = Depends(get_current_active_user),
):
    """Create a Stripe PaymentIntent for an order."""
    ensure_stripe_configured()
    
    order = await get_order(db, body.order_id)
    if not order:
        raise HTTPException(status_code=404, detail="Sipariş bulunamadı.")
    
    # Check ownership
    if not current_user.is_superuser and order.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Bu siparişe erişim yetkiniz yok.")
    
    if order.status not in ("pending",):
        raise HTTPException(status_code=400, detail="Bu sipariş için ödeme yapılamaz.")
    
    import stripe
    stripe.api_key = settings.STRIPE_SECRET_KEY
    
    try:
        # Convert to cents (Stripe uses smallest currency unit)
        amount_cents = int(order.total_amount * 100)
        
        intent = stripe.PaymentIntent.create(
            amount=amount_cents,
            currency="try",
            metadata={"order_id": str(order.id)},
        )
        
        # Save payment record
        payment = await create_payment(
            db,
            order_id=order.id,
            amount=order.total_amount,
            intent_id=intent.id,
            status="pending",
        )
        
        return CreatePaymentIntentResponse(
            payment_id=payment.id,
            client_secret=intent.client_secret,
            publishable_key=settings.STRIPE_PUBLISHABLE_KEY or "",
        )
    except stripe.error.StripeError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/webhook")
async def stripe_webhook(
    request: Request,
    stripe_signature: str = Header(None, alias="Stripe-Signature"),
    db: AsyncSession = Depends(get_db_session),
):
    """Handle Stripe webhook events."""
    ensure_stripe_configured()
    
    if not settings.STRIPE_WEBHOOK_SECRET:
        raise HTTPException(status_code=503, detail="Webhook secret not configured.")
    
    import stripe
    stripe.api_key = settings.STRIPE_SECRET_KEY
    
    payload = await request.body()
    
    try:
        event = stripe.Webhook.construct_event(
            payload, stripe_signature, settings.STRIPE_WEBHOOK_SECRET
        )
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid payload")
    except stripe.error.SignatureVerificationError:
        raise HTTPException(status_code=400, detail="Invalid signature")
    
    if event["type"] == "payment_intent.succeeded":
        intent = event["data"]["object"]
        payment = await get_payment_by_intent(db, intent["id"])
        if payment:
            await update_payment_status(db, payment, "succeeded")
            
            # Update order status
            order = await get_order(db, payment.order_id)
            if order and order.status == "pending":
                order.status = "paid"
                await db.commit()
                
                # Create timeline event
                await create_order_event(
                    db,
                    order_id=order.id,
                    event_type="paid",
                    description="Ödeme başarıyla alındı.",
                )
    
    elif event["type"] == "payment_intent.payment_failed":
        intent = event["data"]["object"]
        payment = await get_payment_by_intent(db, intent["id"])
        if payment:
            await update_payment_status(db, payment, "failed")
    
    return {"status": "success"}


@router.post("/refund", response_model=RefundOut)
async def create_refund_endpoint(
    body: RefundCreate,
    db: AsyncSession = Depends(get_db_session),
    current_user = Depends(get_current_active_admin),
):
    """Create a refund for an order (admin only)."""
    ensure_stripe_configured()
    
    order = await get_order(db, body.order_id)
    if not order:
        raise HTTPException(status_code=404, detail="Sipariş bulunamadı.")
    
    if order.status not in ("paid", "shipped", "delivered"):
        raise HTTPException(status_code=400, detail="Bu sipariş için iade yapılamaz.")
    
    # Find the successful payment
    payments = await get_payments_by_order(db, order.id)
    successful_payment = next((p for p in payments if p.status == "succeeded"), None)
    
    if not successful_payment:
        raise HTTPException(status_code=400, detail="Başarılı ödeme bulunamadı.")
    
    import stripe
    stripe.api_key = settings.STRIPE_SECRET_KEY
    
    try:
        amount_cents = int(body.amount * 100)
        
        stripe_refund = stripe.Refund.create(
            payment_intent=successful_payment.intent_id,
            amount=amount_cents,
            reason="requested_by_customer" if body.reason else None,
        )
        
        refund = await create_refund(
            db,
            payment_id=successful_payment.id,
            order_id=order.id,
            amount=body.amount,
            reason=body.reason,
            provider_refund_id=stripe_refund.id,
            status="succeeded" if stripe_refund.status == "succeeded" else "pending",
        )
        
        # Update order status
        order.status = "refunded"
        await db.commit()
        
        # Create timeline event
        await create_order_event(
            db,
            order_id=order.id,
            event_type="refunded",
            description=f"İade işlemi: {body.amount} TL",
            actor_id=current_user.id,
        )
        
        return refund
        
    except stripe.error.StripeError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/order/{order_id}", response_model=List[PaymentOut])
async def get_order_payments(
    order_id: UUID,
    db: AsyncSession = Depends(get_db_session),
    current_user: UserModel = Depends(get_current_active_user),
):
    """Get all payments for an order."""
    order = await get_order(db, order_id)
    if not order:
        raise HTTPException(status_code=404, detail="Sipariş bulunamadı.")
    
    if not current_user.is_superuser and order.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Bu siparişe erişim yetkiniz yok.")
    
    return await get_payments_by_order(db, order_id)


@router.get("/order/{order_id}/refunds", response_model=List[RefundOut])
async def get_order_refunds(
    order_id: UUID,
    db: AsyncSession = Depends(get_db_session),
    current_user: UserModel = Depends(get_current_active_user),
):
    """Get all refunds for an order."""
    order = await get_order(db, order_id)
    if not order:
        raise HTTPException(status_code=404, detail="Sipariş bulunamadı.")
    
    if not current_user.is_superuser and order.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Bu siparişe erişim yetkiniz yok.")
    
    return await get_refunds_by_order(db, order_id)
