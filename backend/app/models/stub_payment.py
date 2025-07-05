# backend/app/models/stub_payment.py - Enhanced with security fixes
from datetime import datetime
from app import db

class StubPayment(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    
    # Stripe identifiers for Direct Charges
    payment_intent_id = db.Column(db.String(255), unique=True, nullable=False, index=True)
    charge_id = db.Column(db.String(255), nullable=True, index=True)
    transfer_id = db.Column(db.String(255), nullable=True)
    automatic_transfer_id = db.Column(db.String(255), nullable=True)
    refund_id = db.Column(db.String(255), nullable=True)
    
    # Payment details - FIXED: USD only
    amount_total_cents = db.Column(db.Integer, nullable=False)
    platform_fee_cents = db.Column(db.Integer, nullable=False)
    stripe_processing_fee_cents = db.Column(db.Integer, nullable=True)
    currency = db.Column(db.String(3), default='USD', nullable=False)  # FIXED: USD only
    
    # Direct Charges specific tracking
    payment_method = db.Column(db.String(20), default='card', nullable=False)
    capture_method = db.Column(db.String(20), default='automatic', nullable=False)
    liability_shift_status = db.Column(db.String(20), default='pending', nullable=False, index=True)  
    # pending, shifted_to_seller, platform_liable, failed_to_shift
    
    # Payment status tracking
    payment_status = db.Column(db.String(20), default='pending', nullable=False, index=True)
    # pending, processing, completed, partially_refunded, refunded, failed, disputed
    
    # Payout tracking
    payout_schedule_days = db.Column(db.Integer, default=7, nullable=False)
    completion_method = db.Column(db.String(20), nullable=True)
    hold_reason = db.Column(db.String(50), nullable=True)
    
    # Timestamps
    created_at = db.Column(db.DateTime, default=datetime.utcnow, index=True)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    processed_at = db.Column(db.DateTime, nullable=True)
    completed_at = db.Column(db.DateTime, nullable=True)
    refunded_at = db.Column(db.DateTime, nullable=True)
    
    # Relationship
    order_id = db.Column(db.Integer, db.ForeignKey('stub_order.id', name='fk_stub_payment_order'), nullable=False, index=True)
    
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