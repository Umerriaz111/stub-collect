from datetime import datetime
from werkzeug.security import generate_password_hash, check_password_hash
from flask_login import UserMixin
from app import db

class User(UserMixin, db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(64), unique=True, nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(128))
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def set_password(self, password):
        self.password_hash = generate_password_hash(password)

    def check_password(self, password):
        return check_password_hash(self.password_hash, password)

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
            'stats': {
                'total_listings': total_listings,
                'active_listings': active_listings,
                'completed_sales': sold_listings
            }
        }

    def __repr__(self):
        return f'<User {self.username}>' 