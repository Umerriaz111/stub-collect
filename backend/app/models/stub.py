from datetime import datetime
from app import db
from flask_login import UserMixin
import os

SUPPORTED_CURRENCIES = ['USD', 'EUR', 'JPY', 'GBP', 'AUD', 'CAD', 'CHF', 'CNH', 'HKD', 'NZD']

class Stub(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    
    # Title for the stub
    title = db.Column(db.String(255), nullable=False)
    
    # Image information
    image_path = db.Column(db.String(255), nullable=False)
    
    # OCR extracted data
    raw_text = db.Column(db.Text)
    
    # Processed information
    event_name = db.Column(db.String(255))
    event_date = db.Column(db.DateTime)
    venue_name = db.Column(db.String(255))
    ticket_price = db.Column(db.Float)
    currency = db.Column(db.String(3), default='USD')
    seat_info = db.Column(db.String(100))
    
    # Meta information
    status = db.Column(db.String(20), default='pending')  # pending, processed, manual, verified
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    user = db.relationship('User', backref='stubs')

    @staticmethod
    def parse_date(date_str):
        """Parse date string to datetime object"""
        if not date_str:
            return None
        try:
            # First try YYYY-MM-DD format
            return datetime.strptime(date_str, '%Y-%m-%d')
        except ValueError:
            try:
                # Then try other common formats
                from dateutil import parser
                return parser.parse(date_str)
            except:
                return None

    def get_image_url(self):
        return f"/static/uploads/stubs/{self.user_id}/{os.path.basename(self.image_path)}"

    def to_dict(self):
        listing_status = "unlisted"
        listing_id = None

        # Check for an active listing first
        active_listing = next((l for l in self.listings if l.status == 'active'), None)
        
        if active_listing:
            listing_status = "listed"
            listing_id = active_listing.id
        else:
            # If no active listing, check if it has ever been sold
            if any(l.status == 'sold' for l in self.listings):
                listing_status = "sold"

        return {
            'id': self.id,
            'title': self.title,
            'image_path': self.image_path,
            'event_name': self.event_name,
            'event_date': self.event_date.isoformat() if self.event_date else None,
            'venue_name': self.venue_name,
            'ticket_price': float(self.ticket_price) if self.ticket_price is not None else None,
            'currency': self.currency,
            'seat_info': self.seat_info,
            'status': self.status,
            'listing_status': listing_status,
            'listing_id': listing_id,
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat(),
            'image_url': self.get_image_url(),
        } 