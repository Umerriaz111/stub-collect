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
    stripe_account_id = db.Column(db.String(100), unique=True, nullable=True, index=True)
    stripe_account_status = db.Column(db.String(20), default="pending", nullable=True, index=True)  # pending, active, restricted, disabled
    stripe_onboarding_completed = db.Column(db.Boolean, default=False, nullable=False, index=True)
    stripe_capabilities_enabled = db.Column(db.Boolean, default=False, nullable=False)  # charges_enabled & payouts_enabled
    stripe_requirements_due = db.Column(db.Text, nullable=True)  # JSON string of pending requirements
    is_seller = db.Column(db.Boolean, default=False, nullable=False, index=True)
    seller_bio = db.Column(db.Text, nullable=True)
    seller_verification_level = db.Column(db.String(20), default="unverified", nullable=False, index=True)  # unverified, pending, verified
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