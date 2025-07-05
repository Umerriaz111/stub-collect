# backend/app/models/stub_order.py - Connected to existing StubListing
from datetime import datetime, timedelta
from app import db

class StubOrder(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    
    # Order participants
    buyer_id = db.Column(db.Integer, db.ForeignKey('user.id', name='fk_stub_order_buyer'), nullable=False, index=True)
    seller_id = db.Column(db.Integer, db.ForeignKey('user.id', name='fk_stub_order_seller'), nullable=False, index=True)
    stub_listing_id = db.Column(db.Integer, db.ForeignKey('stub_listing.id', name='fk_stub_order_listing'), nullable=False, index=True)
    
    # Order details - FIXED: USD only
    order_status = db.Column(db.String(20), default='pending', nullable=False, index=True)  
    # pending, payment_processing, payment_completed, completed, cancelled, disputed, refunded
    
    # Pricing (stored in cents to avoid floating point issues) - USD only
    total_amount_cents = db.Column(db.Integer, nullable=False)
    platform_fee_cents = db.Column(db.Integer, nullable=False)
    seller_amount_cents = db.Column(db.Integer, nullable=False)
    stripe_fee_cents = db.Column(db.Integer, nullable=True)  # Actual Stripe processing fee
    currency = db.Column(db.String(3), default='USD', nullable=False)  # FIXED: USD only
    
    # Direct Charges specific fields
    liability_shifted_to_seller = db.Column(db.Boolean, default=False, nullable=False)
    seller_payout_schedule_days = db.Column(db.Integer, default=7, nullable=False)
    funds_flow_method = db.Column(db.String(20), default='direct_to_seller', nullable=False)
    
    # Timestamps
    created_at = db.Column(db.DateTime, default=datetime.utcnow, index=True)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    payment_confirmed_at = db.Column(db.DateTime, nullable=True)
    completed_at = db.Column(db.DateTime, nullable=True)
    cancelled_at = db.Column(db.DateTime, nullable=True)
    
    # Relationships - FIXED: Connected to existing models
    buyer = db.relationship('User', foreign_keys=[buyer_id], backref='purchases')
    seller = db.relationship('User', foreign_keys=[seller_id], backref='sales')
    stub_listing = db.relationship('StubListing', backref='orders')
    payment = db.relationship('StubPayment', backref='order', uselist=False)

    def calculate_fees(self, amount_cents, platform_fee_percentage=0.10):
        """Calculate platform fee and seller amount - USD only"""
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
        """FIXED: Create order from existing listing with proper validation"""
        # Validate listing can be purchased
        can_purchase, reason = listing.can_be_purchased()
        if not can_purchase:
            raise ValueError(f"Cannot create order: {reason}")
        
        # FIXED: USD only validation
        if listing.currency != 'USD':
            raise ValueError("Only USD currency supported")
        
        amount_cents = int(listing.asking_price * 100)
        order = cls(
            buyer_id=buyer_id,
            seller_id=listing.seller_id,
            stub_listing_id=listing.id,
            total_amount_cents=amount_cents,
            currency='USD'  # FIXED: USD only
        )
        order.calculate_fees(amount_cents, platform_fee_percentage)
        
        # Check if seller can accept liability
        seller = listing.seller
        order.liability_shifted_to_seller = seller.can_accept_payments()
        
        # FIXED: Reserve the listing during order creation
        listing.reserve_for_payment(buyer_id)
        
        return order
    
    def sync_with_listing_status(self):
        """FIXED: Synchronize order status with listing status"""
        if self.order_status == 'payment_completed' and self.stub_listing.status == 'payment_pending':
            self.stub_listing.mark_as_sold(self.payment_confirmed_at)
        elif self.order_status == 'cancelled' and self.stub_listing.status == 'payment_pending':
            self.stub_listing.release_reservation()
        elif self.order_status == 'refunded' and self.stub_listing.status == 'sold':
            self.stub_listing.status = 'active'
            self.stub_listing.sold_at = None
        
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
            'completed_at': self.completed_at.isoformat() if self.completed_at else None,
        } 