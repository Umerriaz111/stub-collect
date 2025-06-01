import stripe
from flask import current_app
from datetime import datetime
from app import db
from app.models.purchase import Purchase

class PaymentProcessor:
    def __init__(self):
        self.stripe = stripe

    def _init_stripe(self):
        """Initialize Stripe with the current application's API key"""
        self.stripe.api_key = current_app.config['STRIPE_SECRET_KEY']

    def create_payment_intent(self, purchase, idempotency_key):
        """
        Create a Stripe payment intent for a purchase
        """
        self._init_stripe()
        try:
            intent = self.stripe.PaymentIntent.create(
                amount=int(purchase.purchase_price * 100),  # Convert to cents
                currency=purchase.currency.lower(),
                metadata={
                    'purchase_id': purchase.id,
                    'listing_id': purchase.listing_id,
                    'buyer_id': purchase.buyer_id
                },
                idempotency_key=idempotency_key
            )
            
            purchase.payment_intent_id = intent.id
            purchase.payment_status = 'processing'
            db.session.commit()
            
            return intent
            
        except stripe.error.StripeError as e:
            purchase.payment_status = 'failed'
            purchase.payment_error = str(e)
            db.session.commit()
            raise

    def handle_webhook(self, event):
        """
        Handle Stripe webhook events
        """
        self._init_stripe()
        if event.type == 'payment_intent.succeeded':
            payment_intent = event.data.object
            
            # Get the latest charge ID from the PaymentIntent
            charges = payment_intent.charges.data
            if charges:
                latest_charge = charges[0]  # Most recent charge
                charge_id = latest_charge.id
            else:
                charge_id = None
                
            purchase = Purchase.query.filter_by(
                payment_intent_id=payment_intent.id
            ).first()
            
            if purchase:
                purchase.payment_status = 'completed'
                purchase.status = 'completed'
                purchase.charge_id = charge_id
                purchase.payment_completed_at = datetime.utcnow()
                purchase.listing.status = 'sold'
                purchase.listing.sold_at = datetime.utcnow()
                db.session.commit()
                
        elif event.type == 'payment_intent.payment_failed':
            payment_intent = event.data.object
            purchase = Purchase.query.filter_by(
                payment_intent_id=payment_intent.id
            ).first()
            
            if purchase:
                purchase.payment_status = 'failed'
                purchase.payment_error = payment_intent.last_payment_error.message if payment_intent.last_payment_error else 'Payment failed'
                db.session.commit() 