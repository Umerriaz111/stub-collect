from datetime import datetime
from app import db
from app.models.stub import SUPPORTED_CURRENCIES

class StubListing(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    stub_id = db.Column(db.Integer, db.ForeignKey('stub.id'), nullable=False)
    seller_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    
    # Listing Details
    asking_price = db.Column(db.Float, nullable=False)
    currency = db.Column(db.String(3), default='USD')
    description = db.Column(db.Text)
    status = db.Column(db.String(20), default='active', index=True)  # active, payment_pending, sold, cancelled
    
    # Marketplace metadata
    listed_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    sold_at = db.Column(db.DateTime)
    
    # Payment Integration Fields
    payment_required = db.Column(db.Boolean, default=True, nullable=False)
    stripe_product_id = db.Column(db.String(100), nullable=True)  # For tracking
    reserved_until = db.Column(db.DateTime, nullable=True)  # Temporary reservation during payment
    reserved_by_user_id = db.Column(db.Integer, db.ForeignKey('user.id', name='fk_stub_listing_reserved_by_user'), nullable=True)
    
    # Relationships
    stub = db.relationship('Stub', backref='listings')
    seller = db.relationship('User', foreign_keys=[seller_id], backref='listings')
    reserved_by = db.relationship('User', foreign_keys=[reserved_by_user_id])

    def can_be_purchased(self):
        """Check if listing can be purchased"""
        if self.status != 'active':
            return False, f"Listing status is {self.status}"
        
        if not self.payment_required:
            return False, "Payment not enabled for this listing"
        
        # Add defensive check for seller relationship
        if not self.seller:
            # Try to load the seller if relationship is not loaded
            from app.models.user import User
            self.seller = User.query.get(self.seller_id)
            
            # If still no seller found, return error
            if not self.seller:
                return False, "Seller not found"
        
        if not self.seller.can_accept_payments():
            return False, "Seller cannot accept payments yet"
        
        if self.currency != 'USD':
            return False, "Only USD payments supported"
        
        return True, "Available for purchase"
    
    def reserve_for_payment(self, buyer_id, minutes=15):
        """Reserve listing during payment process"""
        from datetime import timedelta
        self.status = 'payment_pending'
        self.reserved_by_user_id = buyer_id
        self.reserved_until = datetime.utcnow() + timedelta(minutes=minutes)
    
    def release_reservation(self):
        """Release reservation if payment fails"""
        if self.status == 'payment_pending':
            self.status = 'active'
            self.reserved_by_user_id = None
            self.reserved_until = None
    
    def mark_as_sold(self, sold_at=None):
        """Properly mark listing as sold"""
        self.status = 'sold'
        self.sold_at = sold_at or datetime.utcnow()
        self.reserved_by_user_id = None
        self.reserved_until = None

    def to_dict(self):
        return {
            'id': self.id,
            'stub_id': self.stub_id,
            'seller_id': self.seller_id,
            'seller_name': self.seller.username if self.seller else None,
            'asking_price': float(self.asking_price),
            'currency': self.currency,
            'description': self.description,
            'status': self.status,
            'listed_at': self.listed_at.isoformat(),
            'updated_at': self.updated_at.isoformat(),
            'sold_at': self.sold_at.isoformat() if self.sold_at else None,
            'can_purchase': self.can_be_purchased()[0],
            'purchase_status_reason': self.can_be_purchased()[1],
            'stub': self.stub.to_dict() if self.stub else None
        } 