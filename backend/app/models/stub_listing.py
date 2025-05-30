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
    status = db.Column(db.String(20), default='active')  # active, sold, cancelled
    
    # Marketplace metadata
    listed_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    sold_at = db.Column(db.DateTime)
    
    # Relationships
    stub = db.relationship('Stub', backref='listings')
    seller = db.relationship('User', backref='listings')

    def to_dict(self):
        return {
            'id': self.id,
            'stub_id': self.stub_id,
            'seller_id': self.seller_id,
            'asking_price': float(self.asking_price),
            'currency': self.currency,
            'description': self.description,
            'status': self.status,
            'listed_at': self.listed_at.isoformat(),
            'updated_at': self.updated_at.isoformat(),
            'sold_at': self.sold_at.isoformat() if self.sold_at else None,
            'stub': self.stub.to_dict() if self.stub else None
        } 