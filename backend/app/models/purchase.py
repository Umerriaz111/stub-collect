from datetime import datetime
from app import db
from app.models.stub_listing import StubListing
import uuid

class Purchase(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    listing_id = db.Column(db.Integer, db.ForeignKey('stub_listing.id'), nullable=False)
    buyer_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    
    # Idempotency and Payment Gateway Details
    idempotency_key = db.Column(db.String(36), unique=True, nullable=False, default=lambda: str(uuid.uuid4()))
    payment_intent_id = db.Column(db.String(255), unique=True, nullable=True)
    charge_id = db.Column(db.String(255), unique=True, nullable=True)
    
    # Stripe Checkout specific fields
    checkout_session_id = db.Column(db.String(255), unique=True, nullable=True)
    checkout_status = db.Column(db.String(20), default='pending')  # pending, complete, expired
    checkout_url = db.Column(db.String(500), nullable=True)
    
    payment_status = db.Column(db.String(20), default='pending')  # pending, processing, completed, failed
    payment_error = db.Column(db.Text)
    
    # Purchase Details
    purchase_price = db.Column(db.Float, nullable=False)
    currency = db.Column(db.String(3), nullable=False)
    status = db.Column(db.String(20), default='pending')  # pending, completed, failed
    
    # Transaction metadata
    purchased_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    payment_completed_at = db.Column(db.DateTime)
    
    # Relationships
    listing = db.relationship('StubListing', backref='purchase')
    buyer = db.relationship('User', backref='purchases')
    
    def to_dict(self):
        return {
            'id': self.id,
            'listing_id': self.listing_id,
            'buyer_id': self.buyer_id,
            'idempotency_key': self.idempotency_key,
            'payment_status': self.payment_status,
            'charge_id': self.charge_id,
            'checkout_status': self.checkout_status,
            'checkout_url': self.checkout_url,
            'purchase_price': float(self.purchase_price),
            'currency': self.currency,
            'status': self.status,
            'purchased_at': self.purchased_at.isoformat(),
            'updated_at': self.updated_at.isoformat(),
            'payment_completed_at': self.payment_completed_at.isoformat() if self.payment_completed_at else None,
            'listing': self.listing.to_dict() if self.listing else None
        } 