#!/usr/bin/env python3
"""
Create Test Stub Data
Adds test stubs directly to the database for payment testing
"""

from app import create_app, db
from app.models.user import User
from app.models.stub import Stub
from datetime import datetime

def create_test_data():
    app = create_app()
    with app.app_context():
        print("🎯 Creating Test Data for Payment Testing")
        print("=" * 50)
        
        # Find or create a test user
        user = User.query.filter_by(username='test_seller').first()
        if not user:
            user = User(
                username='test_seller', 
                email='test_seller@example.com',
                is_seller=True  # Make them a seller
            )
            user.set_password('testpass123')
            db.session.add(user)
            db.session.commit()
            print(f"✅ Created user: {user.username} (ID: {user.id})")
        else:
            print(f"✅ Found existing user: {user.username} (ID: {user.id})")
        
        # Create test stubs
        test_stubs = [
            {
                "title": "Taylor Swift Eras Tour 2024",
                "event_name": "Taylor Swift - The Eras Tour",
                "event_date": datetime(2024, 7, 15),
                "venue_name": "MetLife Stadium",
                "ticket_price": 150.0,
                "seat_info": "Section 133, Row 12, Seat 8",
                "description": "Amazing concert experience!"
            },
            {
                "title": "Lakers vs Warriors - NBA Finals",
                "event_name": "Los Angeles Lakers vs Golden State Warriors",
                "event_date": datetime(2024, 6, 10),
                "venue_name": "Crypto.com Arena",
                "ticket_price": 250.0,
                "seat_info": "Lower Bowl, Section 101, Row 5, Seat 15",
                "description": "Epic basketball game!"
            },
            {
                "title": "Broadway Show - Hamilton",
                "event_name": "Hamilton - An American Musical",
                "event_date": datetime(2024, 8, 20),
                "venue_name": "Richard Rodgers Theatre",
                "ticket_price": 200.0,
                "seat_info": "Orchestra, Row F, Seat 12",
                "description": "Incredible Broadway performance!"
            }
        ]
        
        created_stubs = []
        for stub_data in test_stubs:
            # Check if stub already exists
            existing = Stub.query.filter_by(
                user_id=user.id,
                title=stub_data["title"]
            ).first()
            
            if not existing:
                stub = Stub(
                    user_id=user.id,
                    title=stub_data["title"],
                    image_path=f"test_{stub_data['title'].lower().replace(' ', '_')}.jpg",
                    raw_text=f"Test stub for {stub_data['title']}",
                    event_name=stub_data["event_name"],
                    event_date=stub_data["event_date"],
                    venue_name=stub_data["venue_name"],
                    ticket_price=stub_data["ticket_price"],
                    currency="USD",
                    seat_info=stub_data["seat_info"],
                    status="processed"
                )
                
                db.session.add(stub)
                db.session.commit()
                created_stubs.append(stub)
                
                print(f"✅ Created stub: {stub.title} (ID: {stub.id})")
                print(f"   Price: ${stub.ticket_price} {stub.currency}")
                print(f"   Event Date: {stub.event_date.strftime('%Y-%m-%d')}")
            else:
                created_stubs.append(existing)
                print(f"✅ Found existing stub: {existing.title} (ID: {existing.id})")
        
        print(f"\n🎉 Test Data Created Successfully!")
        print(f"✅ User: {user.username} (ID: {user.id})")
        print(f"✅ Stubs: {len(created_stubs)} stubs ready")
        
        print(f"\n📝 Login Credentials for Testing:")
        print(f"   Email: test_seller@example.com")
        print(f"   Password: testpass123")
        
        print(f"\n🚀 Next Steps:")
        print(f"1. Run: python test_full_payment_flow.py")
        print(f"2. Or create listings manually via API")
        
        return user, created_stubs

if __name__ == "__main__":
    create_test_data() 