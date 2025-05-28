from datetime import datetime
from app import db
from flask_login import UserMixin
import os

class Stub(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    
    # Image information
    image_path = db.Column(db.String(255), nullable=False)
    
    # OCR extracted data
    raw_text = db.Column(db.Text)
    
    # Processed information
    event_name = db.Column(db.String(255))
    event_date = db.Column(db.DateTime)
    venue_name = db.Column(db.String(255))
    ticket_price = db.Column(db.Float)
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
        return {
            'id': self.id,
            'image_path': self.image_path,
            'event_name': self.event_name,
            'event_date': self.event_date.isoformat() if self.event_date else None,
            'venue_name': self.venue_name,
            'ticket_price': float(self.ticket_price) if self.ticket_price is not None else None,
            'seat_info': self.seat_info,
            'status': self.status,
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat(),
            'image_url': self.get_image_url(),
        } 