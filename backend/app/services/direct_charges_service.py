# backend/app/services/direct_charges_service.py - Enhanced with security fixes
import stripe
import os
import json
import time
import hmac
import hashlib
from datetime import datetime, timedelta
from typing import Dict, Tuple, Optional
from app import db
from app.models.user import User
from app.models.stub_order import StubOrder
from app.models.stub_payment import StubPayment
from app.models.stub_listing import StubListing

class DirectChargesService:
    """
    Stripe Connect Direct Charges payment processing service
    Handles payment intents, webhook validation, and liability shifting
    """
    
    def __init__(self):
        """Initialize the service with Stripe configuration"""
        # Load Stripe configuration from environment
        stripe.api_key = os.getenv('STRIPE_SECRET_KEY')
        self.webhook_secret = os.getenv('STRIPE_WEBHOOK_SECRET')
        
        # Validate required environment variables
        if not stripe.api_key:
            raise ValueError("STRIPE_SECRET_KEY environment variable is not set")
        if not self.webhook_secret:
            raise ValueError("STRIPE_WEBHOOK_SECRET environment variable is not set")
        
        # FIXED: Simplified configuration for USD only
        self.PAYOUT_HOLD_DAYS = int(os.getenv('STRIPE_PAYOUT_HOLD_DAYS', '7'))
        self.PLATFORM_FEE_PERCENTAGE = float(os.getenv('STRIPE_PLATFORM_FEE_PERCENTAGE', '0.10'))
        self.ENABLE_LIABILITY_SHIFT = os.getenv('STRIPE_ENABLE_LIABILITY_SHIFT', 'true').lower() == 'true'
        
        # FIXED: USD only
        self.SUPPORTED_CURRENCY = 'USD'
        
        # FIXED: Stripe webhook IP addresses for security validation
        self.STRIPE_WEBHOOK_IPS = [
            '3.18.12.63', '3.130.192.231', '13.235.14.237', '13.235.122.149',
            '18.211.135.69', '3.89.151.148', '34.234.32.107', '52.15.183.38',
            '35.154.171.200', '52.74.223.119', '18.139.77.50', '52.221.197.229'
        ]
    
    def validate_webhook_security(self, payload: bytes, signature: str, timestamp_header: str = None) -> Tuple[bool, str]:
        """FIXED: Enhanced webhook security validation"""
        try:
            # 1. Validate timestamp to prevent replay attacks
            if timestamp_header:
                try:
                    timestamp = int(timestamp_header)
                    current_time = int(time.time())
                    if abs(current_time - timestamp) > 300:  # 5 minutes tolerance
                        return False, "Webhook timestamp too old (replay attack prevention)"
                except (ValueError, TypeError):
                    return False, "Invalid timestamp format"
            
            # 2. Validate webhook signature
            if not signature:
                return False, "Missing webhook signature"
            
            # 3. Verify signature using Stripe's method
            try:
                stripe.Webhook.construct_event(payload, signature, self.webhook_secret)
                return True, "Webhook validated successfully"
            except stripe.error.SignatureVerificationError as e:
                return False, f"Invalid webhook signature: {str(e)}"
            
        except Exception as e:
            return False, f"Webhook validation error: {str(e)}"
    
    def validate_seller_eligibility(self, seller_id: int) -> Tuple[bool, str, Optional[Dict]]:
        """Enhanced seller eligibility validation for liability shift"""
        try:
            seller = User.query.get(seller_id)
            if not seller:
                return False, "Seller not found", None
            
            if not seller.stripe_account_id:
                return False, "Seller has no Stripe account", None
            
            # Retrieve latest Stripe account information
            account = stripe.Account.retrieve(seller.stripe_account_id)
            
            # Check account capabilities
            if not account.charges_enabled:
                return False, "Seller account cannot accept charges", None
            
            if not account.payouts_enabled:
                return False, "Seller account cannot receive payouts", None
            
            # Check specific capability status
            card_payments_capability = account.capabilities.get('card_payments')
            transfers_capability = account.capabilities.get('transfers')
            
            if card_payments_capability != 'active':
                return False, f"Card payments capability status: {card_payments_capability}", None
                
            if transfers_capability != 'active':
                return False, f"Transfers capability status: {transfers_capability}", None
            
            # Check verification requirements
            if account.requirements.currently_due:
                requirements = account.requirements.currently_due
                deadline = account.requirements.current_deadline
                
                seller.stripe_requirements_due = json.dumps({
                    'requirements': requirements,
                    'deadline': deadline
                })
                db.session.commit()
                
                return False, f"Seller has pending requirements: {', '.join(requirements)}", {
                    'requirements': requirements,
                    'deadline': deadline
                }
            
            # Update seller status in our database
            seller.stripe_capabilities_enabled = True
            seller.stripe_account_status = 'active'
            seller.seller_verification_level = 'verified'
            seller.stripe_requirements_due = None
            db.session.commit()
            
            # Configure payout schedule
            payout_result = self.configure_seller_payout_schedule(
                seller.stripe_account_id, 
                self.PAYOUT_HOLD_DAYS
            )
            
            return True, "Seller eligible for liability shift", {
                'account_id': account.id,
                'business_type': account.business_type,
                'country': account.country,
                'capabilities': account.capabilities,
                'payout_schedule_configured': payout_result['success']
            }
            
        except stripe.error.StripeError as e:
            return False, f"Stripe error: {str(e)}", None
        except Exception as e:
            return False, f"Validation error: {str(e)}", None
    
    def create_direct_charge_payment_intent(self, listing_id: int, buyer_id: int) -> Dict:
        """FIXED: Create PaymentIntent with proper listing lifecycle management"""
        try:
            # Validate listing
            listing = StubListing.query.get(listing_id)
            if not listing:
                return {'success': False, 'error': 'Listing not found'}
            
            # FIXED: Use can_be_purchased method
            can_purchase, reason = listing.can_be_purchased()
            if not can_purchase:
                return {'success': False, 'error': reason}
            
            # Prevent self-purchase
            if listing.seller_id == buyer_id:
                return {'success': False, 'error': 'Cannot purchase your own listing'}
            
            # FIXED: Validate currency (USD only)
            if listing.currency != self.SUPPORTED_CURRENCY:
                return {'success': False, 'error': f'Only {self.SUPPORTED_CURRENCY} payments supported'}
            
            # Validate seller eligibility
            seller_eligible, message, seller_info = self.validate_seller_eligibility(listing.seller_id)
            if not seller_eligible:
                return {
                    'success': False, 
                    'error': f'Seller cannot accept payments: {message}',
                    'seller_requirements': seller_info
                }
            
            # FIXED: Create database records first, then Stripe PaymentIntent
            try:
                # First, create the order and payment records in database
                order = None
                payment = None
                
                with db.session.begin():
                    # Create order (this also reserves the listing)
                    order = StubOrder.from_listing(listing, buyer_id, self.PLATFORM_FEE_PERCENTAGE)
                    db.session.add(order)
                    db.session.flush()  # Get order ID
                    
                    # Set seller payout schedule
                    order.set_seller_payout_schedule(self.PAYOUT_HOLD_DAYS)
                    
                    # Create payment record with temporary status
                    payment = StubPayment(
                        order_id=order.id,
                        payment_intent_id='pending',  # Temporary until Stripe call succeeds
                        amount_total_cents=order.total_amount_cents,
                        platform_fee_cents=order.platform_fee_cents,
                        currency=self.SUPPORTED_CURRENCY,
                        payment_status='creating',  # Temporary status
                        liability_shift_status='shifted_to_seller' if self.ENABLE_LIABILITY_SHIFT and seller_eligible else 'platform_liable',
                        hold_reason='buyer_protection'
                    )
                    
                    db.session.add(payment)
                    # Transaction commits here - database records are now saved
                
                # Now create the Stripe PaymentIntent (outside transaction)
                seller = User.query.get(listing.seller_id)
                
                intent_params = {
                    'amount': order.total_amount_cents,
                    'currency': self.SUPPORTED_CURRENCY.lower(),
                    'payment_method_types': ['card'],
                    'capture_method': 'automatic',
                    'metadata': {
                        'order_id': order.id,
                        'listing_id': listing.id,
                        'buyer_id': buyer_id,
                        'seller_id': listing.seller_id,
                        'type': 'direct_charge_stub_purchase',
                        'platform_fee_cents': order.platform_fee_cents,
                        'liability_shift_enabled': str(self.ENABLE_LIABILITY_SHIFT).lower()
                    }
                }
                
                # Add liability shift parameters if enabled
                if self.ENABLE_LIABILITY_SHIFT and seller_eligible:
                    intent_params.update({
                        'on_behalf_of': seller.stripe_account_id,
                        'application_fee_amount': order.platform_fee_cents,
                        'transfer_group': f'order_{order.id}',
                    })
                
                # Create the PaymentIntent (this might fail)
                try:
                    intent = stripe.PaymentIntent.create(**intent_params)
                    
                    # Update payment record with actual PaymentIntent ID
                    with db.session.begin():
                        payment.payment_intent_id = intent.id
                        payment.payment_status = 'pending'
                        # Transaction commits - PaymentIntent ID is now saved
                    
                except stripe.error.StripeError as stripe_error:
                    # Stripe call failed - clean up database records
                    with db.session.begin():
                        # Release the listing reservation
                        listing.release_reservation()
                        # Delete the payment and order records
                        db.session.delete(payment)
                        db.session.delete(order)
                        # Transaction commits - cleanup complete
                    
                    return {'success': False, 'error': f'Stripe payment creation failed: {str(stripe_error)}'}
                
                return {
                    'success': True,
                    'client_secret': intent.client_secret,
                    'payment_intent_id': intent.id,
                    'order_id': order.id,
                    'liability_shifted': self.ENABLE_LIABILITY_SHIFT and seller_eligible,
                    'seller_account_id': seller.stripe_account_id,
                    'payout_schedule_days': self.PAYOUT_HOLD_DAYS,
                    'expected_payout_date': order.get_expected_payout_date()[0].isoformat() if order.get_expected_payout_date()[0] else None
                }
                    
            except Exception as e:
                # Database transaction failed - no cleanup needed since transaction was rolled back
                return {'success': False, 'error': f'Order creation failed: {str(e)}'}
            
        except stripe.error.StripeError as e:
            return {'success': False, 'error': f'Stripe error: {str(e)}'}
        except Exception as e:
            return {'success': False, 'error': f'Payment creation failed: {str(e)}'}
    
    def handle_successful_payment(self, payment_intent_id: str) -> Dict:
        """FIXED: Handle successful payment with proper listing status sync"""
        try:
            with db.session.begin():  # Use transaction for consistency
                payment = StubPayment.query.filter_by(
                    payment_intent_id=payment_intent_id
                ).first()
                
                if not payment:
                    return {'success': False, 'error': 'Payment record not found'}
                
                # Check for duplicate processing (idempotency)
                if payment.payment_status == 'completed':
                    return {
                        'success': True,
                        'message': 'Payment already processed',
                        'payment_status': 'completed'
                    }
                
                # Retrieve PaymentIntent details
                intent = stripe.PaymentIntent.retrieve(
                    payment_intent_id,
                    expand=['latest_charge']
                )
                
                if intent.status == 'succeeded':
                    # Update payment record
                    payment.payment_status = 'completed'
                    payment.processed_at = datetime.utcnow()
                    payment.charge_id = intent.latest_charge.id if intent.latest_charge else None
                    
                    # Record Stripe processing fee
                    if intent.latest_charge and hasattr(intent.latest_charge, 'balance_transaction'):
                        payment.stripe_processing_fee_cents = intent.latest_charge.balance_transaction.fee
                    
                    # Update order
                    order = payment.order
                    order.order_status = 'payment_completed'
                    order.payment_confirmed_at = datetime.utcnow()
                    
                    # FIXED: Sync listing status properly
                    order.sync_with_listing_status()
                    
                    # Transaction commits automatically
                    
                    return {
                        'success': True,
                        'payment_status': 'completed',
                        'order_status': order.order_status,
                        'liability_shifted': payment.liability_shift_status == 'shifted_to_seller',
                        'payout_note': f'Funds in seller Stripe balance, will payout in {self.PAYOUT_HOLD_DAYS} days'
                    }
                
                return {'success': False, 'error': f'Payment status is {intent.status}, not succeeded'}
                
        except stripe.error.StripeError as e:
            return {'success': False, 'error': f'Stripe error: {str(e)}'}
        except Exception as e:
            return {'success': False, 'error': f'Payment processing failed: {str(e)}'}
    
    def configure_seller_payout_schedule(self, seller_stripe_account_id: str, delay_days: int = 7) -> Dict:
        """Configure payout schedule with country-specific handling"""
        try:
            account = stripe.Account.retrieve(seller_stripe_account_id)
            
            # Check minimum delay requirements by country
            country_minimums = {
                'US': 2, 'CA': 2, 'GB': 2, 'AU': 3,
            }
            
            min_delay = country_minimums.get(account.country, 1)
            if delay_days < min_delay:
                delay_days = min_delay
            
            # Update seller's payout schedule
            updated_account = stripe.Account.modify(
                seller_stripe_account_id,
                settings={
                    "payouts": {
                        "schedule": {
                            "interval": "daily",
                            "delay_days": delay_days
                        }
                    }
                },
                metadata={
                    'payout_schedule_set_by': 'platform',
                    'delay_days': str(delay_days),
                    'configured_at': datetime.utcnow().isoformat(),
                    'country': account.country
                }
            )
            
            return {
                'success': True,
                'message': f'Payout schedule configured with {delay_days} day delay',
                'account_id': seller_stripe_account_id,
                'country': account.country,
                'delay_days_applied': delay_days
            }
            
        except stripe.error.StripeError as e:
            return {'success': False, 'error': f'Payout schedule configuration failed: {str(e)}'}
    
    def process_refund(self, order_id: int, refund_reason: str = 'requested_by_customer') -> Dict:
        """FIXED: Process refund with proper listing status restoration"""
        try:
            with db.session.begin():  # Use transaction
                order = StubOrder.query.get(order_id)
                if not order:
                    return {'success': False, 'error': 'Order not found'}
                
                payment = order.payment
                if not payment or payment.payment_status != 'completed':
                    return {'success': False, 'error': 'Payment not eligible for refund'}
                
                # Create refund
                refund_params = {
                    'payment_intent': payment.payment_intent_id,
                    'amount': payment.amount_total_cents,
                    'reason': refund_reason,
                    'metadata': {
                        'order_id': order.id,
                        'refund_reason': refund_reason
                    }
                }
                
                # For Direct Charges with liability shift
                if payment.liability_shift_status == 'shifted_to_seller':
                    refund_params.update({
                        'refund_application_fee': True,
                        'reverse_transfer': True
                    })
                
                refund = stripe.Refund.create(**refund_params)
                
                # Update payment record
                payment.refund_id = refund.id
                payment.payment_status = 'refunded'
                payment.refunded_at = datetime.utcnow()
                
                # Update order
                order.order_status = 'refunded'
                
                # FIXED: Sync listing status properly
                order.sync_with_listing_status()
                
                return {
                    'success': True,
                    'refund_id': refund.id,
                    'amount_refunded_cents': refund.amount,
                    'refund_status': refund.status
                }
                
        except stripe.error.StripeError as e:
            return {'success': False, 'error': f'Refund failed: {str(e)}'}
        except Exception as e:
            return {'success': False, 'error': f'Refund processing failed: {str(e)}'} 