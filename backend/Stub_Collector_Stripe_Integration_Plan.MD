# **Stub Collector - Stripe Connect Direct Charges Implementation Plan**

## **Overview**
This plan implements **Stripe Connect with Direct Charges** for your ticket stub marketplace with delayed payouts, seller liability assignment, and enhanced platform control. Unlike traditional destination charges, this approach gives you full control over fund distribution while shifting chargeback liability to sellers.

## **Key Benefits of Direct Charges**
- **Automatic Fund Flow**: Funds flow directly to seller's Stripe balance after successful payment
- **Seller Liability**: Chargebacks are assigned to sellers, not platform
- **Payout Schedule Control**: Platform configures seller payout delays (7-day hold period)
- **Enhanced Security**: Better fraud prevention and dispute management
- **Flexible Fees**: Dynamic platform fee structure with automatic application fee collection

## **Table of Contents**
1. [Enhanced Database Models](#1-enhanced-database-models)
2. [New Payment Service Layer](#2-new-payment-service-layer)
3. [Payment Routes Implementation](#3-payment-routes-implementation)
4. [Integration with Existing App](#4-integration-with-existing-app)
5. [Direct Charges Payment Flow](#5-direct-charges-payment-flow)
6. [Liability Management System](#6-liability-management-system)
7. [Security and Validation](#7-security-and-validation)
8. [Migration and Deployment](#8-migration-and-deployment)
9. [Testing Strategy](#9-testing-strategy)
10. [Monitoring and Analytics](#10-monitoring-and-analytics)

---

## **1. Enhanced Database Models**

### **1.1 Enhanced User Model**
**File:** `backend/app/models/user.py`

```python
# backend/app/models/user.py - Enhanced with Stripe Connect Direct Charges
from datetime import datetime
from werkzeug.security import generate_password_hash, check_password_hash
from flask_login import UserMixin
from app import db

class User(UserMixin, db.Model):
    # --- Existing Fields (DO NOT MODIFY THESE) ---
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(64), unique=True, nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(128))
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    # --- NEW Stripe Connect Fields (ADD THESE) ---
    stripe_account_id = db.Column(db.String(100), unique=True, nullable=True, index=True)
    stripe_account_status = db.Column(db.String(20), default="pending", nullable=True)  # pending, active, restricted, disabled
    stripe_onboarding_completed = db.Column(db.Boolean, default=False, nullable=False, index=True)
    stripe_capabilities_enabled = db.Column(db.Boolean, default=False, nullable=False)  # charges_enabled & payouts_enabled
    stripe_requirements_due = db.Column(db.Text, nullable=True)  # JSON string of pending requirements
    
    # --- NEW Seller Profile Fields (ADD THESE) ---
    is_seller = db.Column(db.Boolean, default=False, nullable=False, index=True)
    seller_bio = db.Column(db.Text, nullable=True)
    seller_verification_level = db.Column(db.String(20), default="unverified", nullable=False)  # unverified, pending, verified
    
    # --- NEW Platform Admin Fields (ADD THESE) ---
    is_admin = db.Column(db.Boolean, default=False, nullable=False, index=True)
    
    def set_password(self, password):
        self.password_hash = generate_password_hash(password)

    def check_password(self, password):
        return check_password_hash(self.password_hash, password)
    
    def can_accept_payments(self):
        """Check if user can accept payments (liability shift eligible)"""
        return (
            self.stripe_account_id and 
            self.stripe_onboarding_completed and 
            self.stripe_capabilities_enabled and
            self.stripe_account_status == 'active'
        )
    
    def get_liability_status(self):
        """Get seller's liability acceptance status"""
        if not self.can_accept_payments():
            return {
                'can_accept_liability': False,
                'reason': 'Stripe account not fully configured',
                'requirements': self.stripe_requirements_due
            }
        
        return {
            'can_accept_liability': True,
            'verification_level': self.seller_verification_level,
            'account_status': self.stripe_account_status
        }

    def to_public_profile(self):
        """Return public profile information (safe for public viewing)"""
        from app.models.stub_listing import StubListing
        
        # Calculate seller statistics
        total_listings = StubListing.query.filter_by(seller_id=self.id).count()
        active_listings = StubListing.query.filter_by(seller_id=self.id, status='active').count()
        sold_listings = StubListing.query.filter_by(seller_id=self.id, status='sold').count()
        
        return {
            'id': self.id,
            'username': self.username,
            'member_since': self.created_at.isoformat(),
            'is_verified_seller': self.can_accept_payments(),
            'seller_verification_level': self.seller_verification_level,
            'stats': {
                'total_listings': total_listings,
                'active_listings': active_listings,
                'completed_sales': sold_listings
            }
        }

    def __repr__(self):
        return f'<User {self.username}>'
```

### **1.2 New StubOrder Model**
**File:** `backend/app/models/stub_order.py`

```python
# backend/app/models/stub_order.py - Enhanced for Direct Charges
from datetime import datetime, timedelta
from app import db

class StubOrder(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    
    # Order participants
    buyer_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    seller_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    stub_listing_id = db.Column(db.Integer, db.ForeignKey('stub_listing.id'), nullable=False)
    
    # Order details
    order_status = db.Column(db.String(20), default='pending', nullable=False)  
    # pending, payment_processing, payment_completed, completed, cancelled, disputed, refunded
    
    # Pricing (stored in cents to avoid floating point issues)
    total_amount_cents = db.Column(db.Integer, nullable=False)
    platform_fee_cents = db.Column(db.Integer, nullable=False)
    seller_amount_cents = db.Column(db.Integer, nullable=False)
    stripe_fee_cents = db.Column(db.Integer, nullable=True)  # Actual Stripe processing fee
    currency = db.Column(db.String(3), nullable=False)
    
    # Direct Charges specific fields
    liability_shifted_to_seller = db.Column(db.Boolean, default=False, nullable=False)
    seller_payout_schedule_days = db.Column(db.Integer, default=7, nullable=False)  # Seller's payout delay
    funds_flow_method = db.Column(db.String(20), default='direct_to_seller', nullable=False)  # direct_to_seller
    
    # Timestamps
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    payment_confirmed_at = db.Column(db.DateTime, nullable=True)
    funds_held_at = db.Column(db.DateTime, nullable=True)
    delivered_at = db.Column(db.DateTime, nullable=True)
    cancelled_at = db.Column(db.DateTime, nullable=True)
    
    # Relationships
    buyer = db.relationship('User', foreign_keys=[buyer_id], backref='purchases')
    seller = db.relationship('User', foreign_keys=[seller_id], backref='sales')
    stub_listing = db.relationship('StubListing', backref='orders')
    payment = db.relationship('StubPayment', backref='order', uselist=False)

    def calculate_fees(self, amount_cents, platform_fee_percentage=0.10):
        """Calculate platform fee and seller amount"""
        self.platform_fee_cents = int(amount_cents * platform_fee_percentage)
        self.seller_amount_cents = amount_cents - self.platform_fee_cents
    
    def set_seller_payout_schedule(self, schedule_days=7):
        """Set seller's payout schedule delay"""
        self.seller_payout_schedule_days = schedule_days
    
    def get_expected_payout_date(self):
        """Calculate when seller will receive payout from Stripe"""
        if not self.payment_confirmed_at:
            return None, "Payment not yet confirmed"
        
        expected_payout = self.payment_confirmed_at + timedelta(days=self.seller_payout_schedule_days)
        return expected_payout, f"Seller will receive payout in {self.seller_payout_schedule_days} days"
    
    @classmethod
    def from_listing(cls, listing, buyer_id, platform_fee_percentage=0.10):
        """Create order from existing listing with Direct Charges setup"""
        amount_cents = int(listing.asking_price * 100)
        order = cls(
            buyer_id=buyer_id,
            seller_id=listing.seller_id,
            stub_listing_id=listing.id,
            total_amount_cents=amount_cents,
            currency=listing.currency.upper()
        )
        order.calculate_fees(amount_cents, platform_fee_percentage)
        
        # Check if seller can accept liability
        seller = listing.seller
        order.liability_shifted_to_seller = seller.can_accept_payments()
        
        return order
        
    def to_dict(self):
        return {
            'id': self.id,
            'buyer_id': self.buyer_id,
            'seller_id': self.seller_id,
            'stub_listing_id': self.stub_listing_id,
            'order_status': self.order_status,
            'total_amount_cents': self.total_amount_cents,
            'platform_fee_cents': self.platform_fee_cents,
            'seller_amount_cents': self.seller_amount_cents,
            'stripe_fee_cents': self.stripe_fee_cents,
            'currency': self.currency,
            'liability_shifted_to_seller': self.liability_shifted_to_seller,
            'seller_payout_schedule_days': self.seller_payout_schedule_days,
            'expected_payout_date': self.get_expected_payout_date()[0].isoformat() if self.get_expected_payout_date()[0] else None,
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat(),
            'payment_confirmed_at': self.payment_confirmed_at.isoformat() if self.payment_confirmed_at else None,
            'delivered_at': self.delivered_at.isoformat() if self.delivered_at else None,
        }
```

### **1.3 Enhanced StubPayment Model**
**File:** `backend/app/models/stub_payment.py`

```python
# backend/app/models/stub_payment.py - Enhanced for Direct Charges
from datetime import datetime
from app import db

class StubPayment(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    
    # Stripe identifiers for Direct Charges
    payment_intent_id = db.Column(db.String(255), unique=True, nullable=False)
    charge_id = db.Column(db.String(255), nullable=True)
    transfer_id = db.Column(db.String(255), nullable=True)  # For manual transfers
    automatic_transfer_id = db.Column(db.String(255), nullable=True)  # For on_behalf_of transfers
    refund_id = db.Column(db.String(255), nullable=True)
    
    # Payment details
    amount_total_cents = db.Column(db.Integer, nullable=False)
    platform_fee_cents = db.Column(db.Integer, nullable=False)
    stripe_processing_fee_cents = db.Column(db.Integer, nullable=True)
    currency = db.Column(db.String(3), nullable=False)
    
    # Direct Charges specific tracking
    payment_method = db.Column(db.String(20), default='card', nullable=False)  # card, bank_transfer, etc.
    capture_method = db.Column(db.String(20), default='automatic', nullable=False)
    liability_shift_status = db.Column(db.String(20), default='pending', nullable=False)  
    # pending, shifted_to_seller, platform_liable, failed_to_shift
    
    # Payment status tracking
    payment_status = db.Column(db.String(20), default='pending', nullable=False)
    # pending, processing, completed, partially_refunded, refunded, failed, disputed
    
    # Payout tracking
    payout_schedule_days = db.Column(db.Integer, default=7, nullable=False)  # Seller's payout delay
    completion_method = db.Column(db.String(20), nullable=True)  # buyer_confirmed, auto_complete, admin_override
    
    # Timestamps
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    processed_at = db.Column(db.DateTime, nullable=True)
    completed_at = db.Column(db.DateTime, nullable=True)
    refunded_at = db.Column(db.DateTime, nullable=True)
    
    # Relationship
    order_id = db.Column(db.Integer, db.ForeignKey('stub_order.id'), nullable=False)
    
    # New hold_reason field
    hold_reason = db.Column(db.String(50), nullable=True)  # buyer_protection, manual_review, dispute
    
    def get_liability_status(self):
        """Get detailed liability information"""
        return {
            'liability_shifted': self.liability_shift_status == 'shifted_to_seller',
            'shift_status': self.liability_shift_status,
            'platform_liable': self.liability_shift_status in ['platform_liable', 'failed_to_shift'],
            'seller_liable': self.liability_shift_status == 'shifted_to_seller'
        }
    
    def get_net_platform_amount(self):
        """Calculate net amount for platform after all fees"""
        return self.platform_fee_cents - (self.stripe_processing_fee_cents or 0)
    
    def get_seller_payout_amount(self):
        """Calculate amount to be paid to seller"""
        return self.amount_total_cents - self.platform_fee_cents
    
    def to_dict(self):
        liability_info = self.get_liability_status()
        
        return {
            'id': self.id,
            'payment_intent_id': self.payment_intent_id,
            'charge_id': self.charge_id,
            'transfer_id': self.transfer_id,
            'amount_total_cents': self.amount_total_cents,
            'platform_fee_cents': self.platform_fee_cents,
            'stripe_processing_fee_cents': self.stripe_processing_fee_cents,
            'net_platform_amount_cents': self.get_net_platform_amount(),
            'seller_payout_amount_cents': self.get_seller_payout_amount(),
            'currency': self.currency,
            'payment_status': self.payment_status,
            'liability_info': liability_info,
            'payout_schedule_days': self.payout_schedule_days,
            'completion_method': self.completion_method,
            'created_at': self.created_at.isoformat(),
            'processed_at': self.processed_at.isoformat() if self.processed_at else None,
            'completed_at': self.completed_at.isoformat() if self.completed_at else None,
            'refunded_at': self.refunded_at.isoformat() if self.refunded_at else None,
            'hold_reason': self.hold_reason,
        }
```

---

## **2. New Payment Service Layer**

### **2.1 Direct Charges Payment Service**
**File:** `backend/app/services/direct_charges_service.py`

```python
# backend/app/services/direct_charges_service.py
import stripe
import os
import json
from datetime import datetime, timedelta
from typing import Dict, Tuple, Optional
from app import db
from app.models.user import User
from app.models.stub_order import StubOrder
from app.models.stub_payment import StubPayment
from app.models.stub_listing import StubListing

class DirectChargesService:
    def __init__(self):
        stripe.api_key = os.getenv('STRIPE_SECRET_KEY')
        self.webhook_secret = os.getenv('STRIPE_WEBHOOK_SECRET')
        
        # Configuration
        self.PAYOUT_HOLD_DAYS = int(os.getenv('STRIPE_PAYOUT_HOLD_DAYS', '7'))
        self.PLATFORM_FEE_PERCENTAGE = float(os.getenv('STRIPE_PLATFORM_FEE_PERCENTAGE', '0.10'))
        self.ENABLE_LIABILITY_SHIFT = os.getenv('STRIPE_ENABLE_LIABILITY_SHIFT', 'true').lower() == 'true'
        
        # Supported currencies for Direct Charges
        self.STRIPE_SUPPORTED_CURRENCIES = [
            'usd', 'eur', 'gbp', 'jpy', 'aud', 'cad', 'chf', 'hkd', 'nzd', 'cny'
        ]
    
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
            
            # Check verification requirements with more detail
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
                    'deadline': deadline,
                    'requirements_url': f"https://dashboard.stripe.com/connect/accounts/{account.id}"
                }
            
            # Check for any restrictions
            if hasattr(account, 'restrictions') and account.restrictions:
                return False, "Account has restrictions", {
                    'restrictions': account.restrictions
                }
            
            # Update seller status in our database
            seller.stripe_capabilities_enabled = True
            seller.stripe_account_status = 'active'
            seller.seller_verification_level = 'verified'
            seller.stripe_requirements_due = None
            db.session.commit()
            
            # Configure payout schedule for this seller (7-day hold)
            payout_result = self.configure_seller_payout_schedule(
                seller.stripe_account_id, 
                self.PAYOUT_HOLD_DAYS
            )
            
            return True, "Seller eligible for liability shift", {
                'account_id': account.id,
                'business_type': account.business_type,
                'country': account.country,
                'capabilities': account.capabilities,
                'payout_schedule_configured': payout_result['success'],
                'verification_status': 'verified'
            }
            
        except stripe.error.StripeError as e:
            return False, f"Stripe error: {str(e)}", None
        except Exception as e:
            return False, f"Validation error: {str(e)}", None
    
    def create_direct_charge_payment_intent(self, listing_id: int, buyer_id: int) -> Dict:
        """Create PaymentIntent for Direct Charges with liability shift"""
        try:
            # Validate listing
            listing = StubListing.query.get(listing_id)
            if not listing or listing.status != 'active':
                return {'success': False, 'error': 'Listing not available'}
            
            # Prevent self-purchase
            if listing.seller_id == buyer_id:
                return {'success': False, 'error': 'Cannot purchase your own listing'}
            
            # Validate seller eligibility for liability shift
            seller_eligible, message, seller_info = self.validate_seller_eligibility(listing.seller_id)
            if not seller_eligible:
                return {
                    'success': False, 
                    'error': f'Seller cannot accept payments: {message}',
                    'seller_requirements': seller_info
                }
            
            # Create order
            order = StubOrder.from_listing(listing, buyer_id, self.PLATFORM_FEE_PERCENTAGE)
            db.session.add(order)
            db.session.flush()  # Get order ID
            
            # Set seller payout schedule
            order.set_seller_payout_schedule(self.PAYOUT_HOLD_DAYS)
            
            # Get seller info
            seller = User.query.get(listing.seller_id)
            
            # Create PaymentIntent with Direct Charges configuration
            intent_params = {
                'amount': order.total_amount_cents,
                'currency': order.currency.lower(),
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
            
            # Add liability shift parameters if enabled and seller eligible
            if self.ENABLE_LIABILITY_SHIFT and seller_eligible:
                intent_params.update({
                    'on_behalf_of': seller.stripe_account_id,  # Shifts liability
                    'application_fee_amount': order.platform_fee_cents,  # Platform fee
                    'transfer_group': f'order_{order.id}',  # For tracking related transfers
                })
            
            # Create the PaymentIntent
            intent = stripe.PaymentIntent.create(**intent_params)
            
            # Create payment record
            payment = StubPayment(
                order_id=order.id,
                payment_intent_id=intent.id,
                amount_total_cents=order.total_amount_cents,
                platform_fee_cents=order.platform_fee_cents,
                currency=order.currency.upper(),
                payment_status='pending',
                liability_shift_status='shifted_to_seller' if self.ENABLE_LIABILITY_SHIFT and seller_eligible else 'platform_liable',
                hold_reason='buyer_protection'
            )
            
            db.session.add(payment)
            db.session.commit()
            
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
            
        except stripe.error.StripeError as e:
            db.session.rollback()
            return {'success': False, 'error': f'Stripe error: {str(e)}'}
        except Exception as e:
            db.session.rollback()
            return {'success': False, 'error': f'Payment creation failed: {str(e)}'}
    
    def handle_successful_payment(self, payment_intent_id: str) -> Dict:
        """Handle successful payment with Direct Charges flow"""
        try:
            payment = StubPayment.query.filter_by(
                payment_intent_id=payment_intent_id
            ).first()
            
            if not payment:
                return {'success': False, 'error': 'Payment record not found'}
            
            # Retrieve PaymentIntent details
            intent = stripe.PaymentIntent.retrieve(
                payment_intent_id,
                expand=['latest_charge', 'transfer_data']
            )
            
            if intent.status == 'succeeded':
                # Check for duplicate processing (idempotency)
                if payment.payment_status == 'completed':
                    return {
                        'success': True,
                        'message': 'Payment already processed',
                        'payment_status': 'completed'
                    }
                
                # Update payment record - funds are in seller's Stripe balance immediately
                payment.payment_status = 'completed'
                payment.processed_at = datetime.utcnow()
                payment.charge_id = intent.latest_charge.id if intent.latest_charge else None
                
                # Record Stripe processing fee
                if intent.latest_charge:
                    payment.stripe_processing_fee_cents = intent.latest_charge.balance_transaction.fee if hasattr(intent.latest_charge, 'balance_transaction') else None
                
                # Update order - with Direct Charges, funds flow immediately to seller
                order = payment.order
                order.order_status = 'payment_completed'
                order.payment_confirmed_at = datetime.utcnow()
                
                # Mark listing as sold
                order.stub_listing.status = 'sold'
                
                db.session.commit()
                
                return {
                    'success': True,
                    'payment_status': 'completed',
                    'order_status': order.order_status,
                    'liability_shifted': payment.liability_shift_status == 'shifted_to_seller',
                    'payout_note': f'Funds in seller Stripe balance, will payout in {self.PAYOUT_HOLD_DAYS} days'
                }
            
            return {'success': False, 'error': f'Payment status is {intent.status}, not succeeded'}
            
        except stripe.error.StripeError as e:
            db.session.rollback()
            return {'success': False, 'error': f'Stripe error: {str(e)}'}
        except Exception as e:
            db.session.rollback()
            return {'success': False, 'error': f'Payment processing failed: {str(e)}'}
    
    def configure_seller_payout_schedule(self, seller_stripe_account_id: str, delay_days: int = 7) -> Dict:
        """Enhanced payout schedule configuration with country-specific handling"""
        try:
            # First, retrieve account to check country and current settings
            account = stripe.Account.retrieve(seller_stripe_account_id)
            
            # Check minimum delay requirements by country
            country_minimums = {
                'US': 2,  # US accounts have 2-day minimum
                'CA': 2,  # Canada accounts have 2-day minimum
                'GB': 2,  # UK accounts have 2-day minimum
                'AU': 3,  # Australia accounts have 3-day minimum
            }
            
            min_delay = country_minimums.get(account.country, 1)
            if delay_days < min_delay:
                delay_days = min_delay
                print(f"Adjusted delay_days to {delay_days} for country {account.country}")
            
            # Update seller's payout schedule to enforce platform hold period
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
                'delay_days_applied': delay_days,
                'payout_schedule': updated_account.settings.payouts.schedule
            }
            
        except stripe.error.InvalidRequestError as e:
            # Handle cases where delay_days might be invalid
            if 'delay_days' in str(e):
                return {
                    'success': False, 
                    'error': f'Invalid delay_days for this account: {str(e)}',
                    'suggestion': 'Try a lower delay_days value'
                }
            return {'success': False, 'error': f'Invalid request: {str(e)}'}
        except stripe.error.StripeError as e:
            return {'success': False, 'error': f'Payout schedule configuration failed: {str(e)}'}
    
    def mark_order_completed(self, order_id: int) -> Dict:
        """Mark order as completed (funds automatically flow to seller per payout schedule)"""
        try:
            order = StubOrder.query.get(order_id)
            if not order:
                return {'success': False, 'error': 'Order not found'}
            
            payment = order.payment
            if not payment:
                return {'success': False, 'error': 'Payment record not found'}
            
            # With Direct Charges, funds are already in seller's Stripe balance
            # We just need to mark the order as completed
            payment.payment_status = 'completed'
            order.order_status = 'completed'
            order.delivered_at = datetime.utcnow()
            
            db.session.commit()
            
            return {
                'success': True,
                'message': 'Order marked as completed. Funds will be paid out per seller payout schedule.',
                'order_status': order.order_status,
                'payout_note': f'Seller will receive payout in {self.PAYOUT_HOLD_DAYS} days via their configured payout schedule'
            }
            
        except Exception as e:
            db.session.rollback()
            return {'success': False, 'error': f'Order completion failed: {str(e)}'}
    
    def process_refund(self, order_id: int, refund_reason: str = 'requested_by_customer') -> Dict:
        """Process refund for Direct Charges with liability considerations"""
        try:
            order = StubOrder.query.get(order_id)
            if not order:
                return {'success': False, 'error': 'Order not found'}
            
            payment = order.payment
            if not payment or payment.payment_status != 'completed':
                return {'success': False, 'error': 'Payment not eligible for refund'}
            
            # Create refund with application fee refund and transfer reversal
            refund_params = {
                'payment_intent': payment.payment_intent_id,
                'amount': payment.amount_total_cents,
                'reason': refund_reason,
                'metadata': {
                    'order_id': order.id,
                    'refund_reason': refund_reason
                }
            }
            
            # For Direct Charges, refund both application fee and reverse transfer
            if payment.liability_shift_status == 'shifted_to_seller':
                refund_params.update({
                    'refund_application_fee': True,  # Refund platform fee to customer
                    'reverse_transfer': True  # Take back funds from seller's account
                })
            
            refund = stripe.Refund.create(**refund_params)
            
            # Update payment record
            payment.refund_id = refund.id
            payment.payment_status = 'refunded'
            payment.refunded_at = datetime.utcnow()
            
            # Update order
            order.order_status = 'refunded'
            
            # Reactivate listing
            order.stub_listing.status = 'active'
            
            db.session.commit()
            
            return {
                'success': True,
                'refund_id': refund.id,
                'amount_refunded_cents': refund.amount,
                'refund_status': refund.status
            }
            
        except stripe.error.StripeError as e:
            db.session.rollback()
            return {'success': False, 'error': f'Refund failed: {str(e)}'}
        except Exception as e:
            db.session.rollback()
            return {'success': False, 'error': f'Refund processing failed: {str(e)}'}
    
    def get_seller_balance(self, seller_stripe_account_id: str) -> Dict:
        """Get seller's Stripe account balance"""
        try:
            balance = stripe.Balance.retrieve(stripe_account=seller_stripe_account_id)
            
            return {
                'success': True,
                'available': balance.available,
                'pending': balance.pending,
                'instant_available': balance.instant_available if hasattr(balance, 'instant_available') else None
            }
            
        except stripe.error.StripeError as e:
            return {'success': False, 'error': f'Balance retrieval failed: {str(e)}'}
```

### **2.2 Stripe Connect Onboarding Service**
**File:** `backend/app/services/stripe_connect_service.py`

```python
# backend/app/services/stripe_connect_service.py
import stripe
import os
from datetime import datetime
from typing import Dict
from app import db
from app.models.user import User

class StripeConnectService:
    def __init__(self):
        stripe.api_key = os.getenv('STRIPE_SECRET_KEY')
    
    def create_express_account(self, user_id: int, return_url: str, refresh_url: str) -> Dict:
        """Create Stripe Express account for seller onboarding"""
        try:
            user = User.query.get(user_id)
            if not user:
                return {'success': False, 'error': 'User not found'}
            
            if user.stripe_account_id:
                return {'success': False, 'error': 'User already has a Stripe account'}
            
            # Create Express account
            account = stripe.Account.create(
                type='express',
                email=user.email,
                business_profile={
                    'mcc': '5094',  # Computer software stores
                    'product_description': 'Digital collectible ticket stubs marketplace',
                    'url': 'https://stubcollector.com'  # Replace with your domain
                },
                capabilities={
                    'card_payments': {'requested': True},
                    'transfers': {'requested': True},
                },
                metadata={
                    'user_id': user.id,
                    'username': user.username,
                    'created_via': 'direct_charges_onboarding'
                }
            )
            
            # Create onboarding link
            account_link = stripe.AccountLink.create(
                account=account.id,
                refresh_url=refresh_url,
                return_url=return_url,
                type='account_onboarding'
            )
            
            # Save account ID to user
            user.stripe_account_id = account.id
            user.is_seller = True
            user.stripe_account_status = 'pending'
            db.session.commit()
            
            return {
                'success': True,
                'account_id': account.id,
                'onboarding_url': account_link.url,
                'account_status': 'pending'
            }
            
        except stripe.error.StripeError as e:
            return {'success': False, 'error': f'Stripe error: {str(e)}'}
        except Exception as e:
            return {'success': False, 'error': f'Account creation failed: {str(e)}'}
    
    def configure_seller_payout_schedule(self, seller_stripe_account_id: str, delay_days: int = 7) -> Dict:
        """Configure seller's payout schedule with delay days"""
        try:
            # Update seller's payout schedule to enforce platform hold period
            account = stripe.Account.modify(
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
                    'configured_at': datetime.utcnow().isoformat()
                }
            )
            
            return {
                'success': True,
                'message': f'Payout schedule configured with {delay_days} day delay',
                'account_id': seller_stripe_account_id,
                'payout_schedule': account.settings.payouts.schedule
            }
            
        except stripe.error.StripeError as e:
            return {'success': False, 'error': f'Payout schedule configuration failed: {str(e)}'}
    
    def refresh_account_link(self, user_id: int, return_url: str, refresh_url: str) -> Dict:
        """Create new account link for incomplete onboarding"""
        try:
            user = User.query.get(user_id)
            if not user or not user.stripe_account_id:
                return {'success': False, 'error': 'No Stripe account found'}
            
            account_link = stripe.AccountLink.create(
                account=user.stripe_account_id,
                refresh_url=refresh_url,
                return_url=return_url,
                type='account_onboarding'
            )
            
            return {
                'success': True,
                'onboarding_url': account_link.url
            }
            
        except stripe.error.StripeError as e:
            return {'success': False, 'error': f'Stripe error: {str(e)}'}
    
    def check_account_status(self, user_id: int) -> Dict:
        """Check and update user's Stripe account status"""
        try:
            user = User.query.get(user_id)
            if not user or not user.stripe_account_id:
                return {
                    'success': True,
                    'has_account': False,
                    'status': 'no_account'
                }
            
            # Retrieve account from Stripe
            account = stripe.Account.retrieve(user.stripe_account_id)
            
            # Update user record based on Stripe account status
            if account.charges_enabled and account.payouts_enabled:
                user.stripe_account_status = 'active'
                user.stripe_onboarding_completed = True
                user.stripe_capabilities_enabled = True
                user.seller_verification_level = 'verified'
                
                # Configure payout schedule for newly verified sellers
                payout_result = self.configure_seller_payout_schedule(
                    user.stripe_account_id, 
                    7  # 7-day hold period
                )
                
            elif account.details_submitted:
                user.stripe_account_status = 'restricted'
                user.stripe_onboarding_completed = False
            else:
                user.stripe_account_status = 'pending'
                user.stripe_onboarding_completed = False
            
            # Update requirements
            if hasattr(account, 'requirements') and account.requirements.currently_due:
                user.stripe_requirements_due = str(account.requirements.currently_due)
            else:
                user.stripe_requirements_due = None
            
            db.session.commit()
            
            return {
                'success': True,
                'has_account': True,
                'account_id': user.stripe_account_id,
                'status': user.stripe_account_status,
                'onboarding_completed': user.stripe_onboarding_completed,
                'capabilities_enabled': user.stripe_capabilities_enabled,
                'can_accept_payments': user.can_accept_payments(),
                'requirements_due': account.requirements.currently_due if hasattr(account, 'requirements') else None
            }
            
        except stripe.error.StripeError as e:
            return {'success': False, 'error': f'Stripe error: {str(e)}'}
        except Exception as e:
            return {'success': False, 'error': f'Status check failed: {str(e)}'}
    
    def create_dashboard_link(self, user_id: int) -> Dict:
        """Create Stripe Express Dashboard login link for sellers"""
        try:
            user = User.query.get(user_id)
            if not user or not user.stripe_account_id:
                return {'success': False, 'error': 'No Stripe account found'}
            
            if not user.can_accept_payments():
                return {'success': False, 'error': 'Account not ready for dashboard access'}
            
            # Create login link for Express Dashboard
            login_link = stripe.Account.create_login_link(user.stripe_account_id)
            
            return {
                'success': True,
                'dashboard_url': login_link.url,
                'expires_at': datetime.utcnow().timestamp() + 300  # Links expire in 5 minutes
            }
            
        except stripe.error.StripeError as e:
            return {'success': False, 'error': f'Dashboard link creation failed: {str(e)}'}
```

---

## **3. Payment Routes Implementation**

### **3.1 Direct Charges Payment Routes**
**File:** `backend/app/routes/direct_charges_payments.py`

```python
# backend/app/routes/direct_charges_payments.py
from flask import Blueprint, request, jsonify, url_for
from flask_login import login_required, current_user
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address
import stripe
import os
import json
from app import db
from app.services.direct_charges_service import DirectChargesService
from app.services.stripe_connect_service import StripeConnectService
from app.models.stub_order import StubOrder
from app.models.stub_payment import StubPayment
from app.models.user import User

bp = Blueprint('direct_charges_payments', __name__)

# Initialize services
direct_charges_service = DirectChargesService()
connect_service = StripeConnectService()

# Initialize rate limiter
limiter = Limiter(
    key_func=get_remote_address,
    default_limits=["200 per day", "50 per hour"]
)

### SELLER ONBOARDING ROUTES ###

@bp.route('/payments/connect/onboard', methods=['POST'])
@limiter.limit("3 per minute")
@login_required
def create_stripe_connect_account():
    """Create Stripe Connect Express account for seller"""
    if current_user.stripe_account_id:
        return jsonify({
            'status': 'error',
            'message': 'User already has a Stripe account'
        }), 400
    
    # Generate URLs for onboarding flow
    return_url = url_for('direct_charges_payments.onboard_return', _external=True)
    refresh_url = url_for('direct_charges_payments.onboard_refresh', _external=True)
    
    result = connect_service.create_express_account(
        user_id=current_user.id,
        return_url=return_url,
        refresh_url=refresh_url
    )
    
    if result['success']:
        return jsonify({
            'status': 'success',
            'onboarding_url': result['onboarding_url'],
            'account_id': result['account_id']
        })
    else:
        return jsonify({
            'status': 'error',
            'message': result['error']
        }), 400

@bp.route('/payments/create-payment-intent', methods=['POST'])
@limiter.limit("5 per minute")
@login_required
def create_payment_intent():
    """Create PaymentIntent for Direct Charges with liability shift"""
    data = request.get_json()
    
    if 'listing_id' not in data:
        return jsonify({
            'status': 'error',
            'message': 'listing_id is required'
        }), 400
    
    result = direct_charges_service.create_direct_charge_payment_intent(
        listing_id=data['listing_id'],
        buyer_id=current_user.id
    )
    
    if result['success']:
        return jsonify({
            'status': 'success',
            'client_secret': result['client_secret'],
            'payment_intent_id': result['payment_intent_id'],
            'order_id': result['order_id'],
            'liability_shifted': result['liability_shifted'],
            'hold_period_days': result['hold_period_days']
        })
    else:
        return jsonify({
            'status': 'error',
            'message': result['error']
        }), 400

@bp.route('/payments/webhook', methods=['POST'])
def stripe_webhook():
    """Handle Stripe webhooks for Direct Charges with comprehensive event handling"""
    payload = request.data
    sig_header = request.headers.get('Stripe-Signature')
    
    try:
        event = stripe.Webhook.construct_event(
            payload, sig_header, direct_charges_service.webhook_secret
        )
    except ValueError:
        return jsonify({'error': 'Invalid payload'}), 400
    except stripe.error.SignatureVerificationError:
        return jsonify({'error': 'Invalid signature'}), 400
    
    # Handle payment success with idempotency check
    if event['type'] == 'payment_intent.succeeded':
        payment_intent = event['data']['object']
        
        # Check if we've already processed this event (idempotency)
        existing_payment = StubPayment.query.filter_by(
            payment_intent_id=payment_intent['id']
        ).first()
        
        if existing_payment and existing_payment.payment_status == 'completed':
            print(f"Payment already processed: {payment_intent['id']}")
            return jsonify({'status': 'success', 'message': 'Already processed'})
        
        result = direct_charges_service.handle_successful_payment(payment_intent['id'])
        
        if result['success']:
            print(f"Direct charge payment processed: {payment_intent['id']}")
        else:
            print(f"Error processing payment: {result['error']}")
    
    # Handle Connect account updates
    elif event['type'] == 'account.updated':
        account = event['data']['object']
        account_id = account['id']
        
        # Find user with this Stripe account
        user = User.query.filter_by(stripe_account_id=account_id).first()
        if user:
            # Update user's account status based on Stripe account capabilities
            if account.get('charges_enabled') and account.get('payouts_enabled'):
                user.stripe_account_status = 'active'
                user.stripe_capabilities_enabled = True
                user.seller_verification_level = 'verified'
                user.stripe_requirements_due = None
                
                # Configure payout schedule for newly verified sellers
                connect_service.configure_seller_payout_schedule(account_id, 7)
                
            elif account.get('details_submitted'):
                user.stripe_account_status = 'restricted'
                user.stripe_capabilities_enabled = False
            else:
                user.stripe_account_status = 'pending'
                user.stripe_capabilities_enabled = False
            
            # Update requirements if any
            requirements = account.get('requirements', {})
            if requirements.get('currently_due'):
                user.stripe_requirements_due = json.dumps(requirements['currently_due'])
            
            db.session.commit()
            print(f"Updated account status for user {user.username}: {user.stripe_account_status}")
    
    # Handle payout events (optional monitoring)
    elif event['type'] == 'payout.paid':
        payout = event['data']['object']
        print(f"Payout completed: {payout['id']} for account {payout.get('destination')}")
    
    elif event['type'] == 'payout.failed':
        payout = event['data']['object']
        print(f"Payout failed: {payout['id']} - {payout.get('failure_message')}")
        
        # Optionally notify the seller about payout failure
        # You could add email notification logic here
    
    # Handle disputes (since liability is shifted to sellers)
    elif event['type'] == 'charge.dispute.created':
        dispute = event['data']['object']
        charge_id = dispute['charge']
        
        # Find the payment record for this charge
        payment = StubPayment.query.filter_by(charge_id=charge_id).first()
        if payment and payment.liability_shift_status == 'shifted_to_seller':
            print(f"Dispute created for seller-liable charge: {charge_id}")
            # The dispute will be handled by the seller's account automatically
            
            # Optionally notify the seller
            order = payment.order
            seller = order.seller
            print(f"Dispute assigned to seller: {seller.username}")
    
    return jsonify({'status': 'success'})

@bp.route('/payments/orders/<int:order_id>/complete', methods=['POST'])
@login_required
def mark_order_completed(order_id):
    """Mark order as completed (buyer confirms delivery)"""
    order = StubOrder.query.get(order_id)
    
    if not order:
        return jsonify({
            'status': 'error',
            'message': 'Order not found'
        }), 404
    
    # Only buyer can mark order as completed
    if order.buyer_id != current_user.id:
        return jsonify({
            'status': 'error',
            'message': 'Only the buyer can mark order as completed'
        }), 403
    
    result = direct_charges_service.mark_order_completed(order_id)
    
    if result['success']:
        return jsonify({
            'status': 'success',
            'message': result['message'],
            'order_status': result['order_status'],
            'payout_note': result['payout_note']
        })
    else:
        return jsonify({
            'status': 'error',
            'message': result['error']
        }), 400

@bp.route('/payments/connect/dashboard', methods=['GET'])
@login_required
def get_seller_dashboard():
    """Get Stripe Express Dashboard link for seller"""
    if not current_user.stripe_account_id:
        return jsonify({
            'status': 'error',
            'message': 'No Stripe account found'
        }), 400
    
    result = connect_service.create_dashboard_link(current_user.id)
    
    if result['success']:
        return jsonify({
            'status': 'success',
            'dashboard_url': result['dashboard_url'],
            'expires_at': result['expires_at']
        })
    else:
        return jsonify({
            'status': 'error',
            'message': result['error']
        }), 400

@bp.route('/payments/connect/balance', methods=['GET'])
@login_required
def get_seller_balance():
    """Get seller's Stripe account balance"""
    if not current_user.stripe_account_id or not current_user.can_accept_payments():
        return jsonify({
            'status': 'error',
            'message': 'Stripe account not available'
        }), 400
    
    result = direct_charges_service.get_seller_balance(current_user.stripe_account_id)
    
    if result['success']:
        return jsonify({
            'status': 'success',
            'balance': result
        })
    else:
        return jsonify({
            'status': 'error',
            'message': result['error']
        }), 400

@bp.route('/payments/connect/status', methods=['GET'])
@login_required
def get_account_status():
    """Get current user's Stripe Connect account status"""
    result = connect_service.check_account_status(current_user.id)
    
    if result['success']:
        return jsonify({
            'status': 'success',
            'account_info': result
        })
    else:
        return jsonify({
            'status': 'error',
            'message': result['error']
        }), 400

@bp.route('/payments/orders/<int:order_id>/refund', methods=['POST'])
@login_required
def process_refund(order_id):
    """Process refund for an order"""
    order = StubOrder.query.get(order_id)
    
    if not order:
        return jsonify({
            'status': 'error',
            'message': 'Order not found'
        }), 404
    
    # Only admin or buyer can initiate refund
    if not (current_user.is_admin or order.buyer_id == current_user.id):
        return jsonify({
            'status': 'error',
            'message': 'Not authorized to refund this order'
        }), 403
    
    data = request.get_json() or {}
    refund_reason = data.get('reason', 'requested_by_customer')
    
    result = direct_charges_service.process_refund(
        order_id=order_id,
        refund_reason=refund_reason
    )
    
    if result['success']:
        return jsonify({
            'status': 'success',
            'refund_id': result['refund_id'],
            'amount_refunded_cents': result['amount_refunded_cents'],
            'refund_status': result['refund_status']
        })
    else:
        return jsonify({
            'status': 'error',
            'message': result['error']
        }), 400
```

---

## **4. Integration with Existing App**

### **4.1 Update Main App Initialization**
**File:** `backend/app/__init__.py`

Add these lines to register the new payment routes:

```python
# Import the new payment routes
from app.routes import direct_charges_payments

# Register the blueprint
app.register_blueprint(direct_charges_payments.bp, url_prefix='/api')
```

### **4.2 Update Configuration**
**File:** `backend/config.py`

```python
# Add these configuration options
STRIPE_PAYOUT_HOLD_DAYS = int(os.environ.get('STRIPE_PAYOUT_HOLD_DAYS', '7'))
STRIPE_PLATFORM_FEE_PERCENTAGE = float(os.environ.get('STRIPE_PLATFORM_FEE_PERCENTAGE', '0.10'))
STRIPE_ENABLE_LIABILITY_SHIFT = os.environ.get('STRIPE_ENABLE_LIABILITY_SHIFT', 'true').lower() == 'true'
```

### **4.3 Update Environment Variables**
**File:** `backend/.env_sample`

```env
# Add these Stripe Direct Charges settings
STRIPE_PAYOUT_HOLD_DAYS=7
STRIPE_PLATFORM_FEE_PERCENTAGE=0.10
STRIPE_ENABLE_LIABILITY_SHIFT=true
```

---

## **5. Database Migration**

### **5.1 Create Migration for User Model Updates**
```bash
# Run this command to create the migration
flask db migrate -m "Add Stripe Connect fields to User model"
```

### **5.2 Create Migration for Payment Models**
```bash
# Run this command to create payment tables
flask db migrate -m "Add StubOrder and StubPayment models"
```

### **5.3 Apply Migrations**
```bash
# Apply all pending migrations
flask db upgrade
```

---

## **6. Testing the Implementation**

### **6.1 Test Seller Onboarding**
```bash
# Test creating a Stripe Connect account
curl -X POST http://localhost:5000/api/payments/connect/onboard \
  -H "Content-Type: application/json" \
  -b "session=your_session_cookie"
```

### **6.2 Test Payment Intent Creation**
```bash
# Test creating a payment intent with liability shift
curl -X POST http://localhost:5000/api/payments/create-payment-intent \
  -H "Content-Type: application/json" \
  -d '{"listing_id": 1}' \
  -b "session=your_session_cookie"
```

---

## **7. Enhanced Features Added**

### **🔧 Enhanced Seller Eligibility Validation**
- **Detailed Capability Checks**: Validates `card_payments` and `transfers` capabilities individually
- **Country-Specific Payout Delays**: Automatically adjusts minimum delay days based on seller's country
- **Restriction Detection**: Checks for account restrictions that could prevent payments
- **Requirements Tracking**: Stores detailed requirement information with deadlines

### **🔧 Improved Payout Schedule Management**
- **Country Compliance**: Respects minimum delay requirements per country (US: 2 days, AU: 3 days, etc.)
- **Error Handling**: Graceful handling of invalid delay_days with suggestions
- **Metadata Tracking**: Comprehensive logging of payout schedule configurations

### **🔧 Enhanced Webhook Handling**
- **Account Updates**: Automatically updates user status when Stripe account changes
- **Payout Monitoring**: Tracks successful and failed payouts with logging
- **Dispute Management**: Handles disputes for seller-liable charges
- **Idempotency**: Prevents duplicate event processing

### **🔧 Additional API Endpoints**
- **Dashboard Access**: `/payments/connect/dashboard` - Stripe Express Dashboard links
- **Balance Inquiry**: `/payments/connect/balance` - Real-time seller balance
- **Status Check**: `/payments/connect/status` - Comprehensive account status
- **Refund Processing**: `/payments/orders/{id}/refund` - Streamlined refund handling

## **8. Key Benefits of This Implementation**

### **✅ Liability Management**
- **Seller Liability**: Chargebacks assigned to sellers, not platform
- **Automatic Assignment**: Liability shifts based on seller verification status
- **Fallback Protection**: Platform remains liable if seller not eligible

### **✅ Payout Control**
- **Country-Compliant Delays**: Respects Stripe's minimum requirements per country
- **Automated Scheduling**: Configures seller payout schedules during onboarding
- **Real-time Balance**: Sellers can check their Stripe balance anytime

### **✅ Enhanced Security**
- **Webhook Validation**: Secure payment event processing
- **Rate Limiting**: Abuse prevention on payment endpoints
- **Comprehensive Logging**: Detailed audit trail
- **Dispute Handling**: Automatic routing of disputes to liable parties

---

## **9. Production Deployment Checklist**

### **Pre-Deployment**
- [ ] Configure Stripe webhook endpoint
- [ ] Set production environment variables
- [ ] Run database migrations
- [ ] Test payment flow in Stripe test mode

### **Go-Live**
- [ ] Switch to Stripe live keys
- [ ] Monitor payment processing
- [ ] Set up alerting for failed payments
- [ ] Test liability shift functionality

---

## **10. Conclusion**

This implementation provides a complete **Stripe Connect with Direct Charges** solution that:

1. **Shifts liability to sellers** while maintaining platform control
2. **Provides flexible payout management** with configurable hold periods
3. **Ensures secure payment processing** with comprehensive validation
4. **Integrates seamlessly** with your existing Stub Collector architecture

The Direct Charges approach gives you the best of both worlds: protection from chargebacks through liability shifting, while maintaining full control over the payment flow and fund distribution timing.
