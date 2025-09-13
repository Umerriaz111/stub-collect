#!/usr/bin/env python3
"""
Create Test Data for Payment Testing
Adds test stubs and listings to the database
"""

import requests
import json
import time
from datetime import datetime
import os
import sys
from dotenv import load_dotenv

load_dotenv()

BASE_URL = os.getenv("BACKEND_URL")


def create_test_user_and_login():
    """Create and login a test user"""
    print("👤 Creating test user...")
    
    timestamp = int(time.time())
    user_data = {
        "username": f"seller_test_{timestamp}",
        "email": f"seller_test_{timestamp}@example.com",
        "password": "testpass123"
    }
    
    session = requests.Session()
    
    # Register
    response = session.post(f"{BASE_URL}/auth/register", json=user_data)
    if response.status_code not in [200, 201]:
        print(f"❌ Registration failed: {response.text}")
        return None, None
    
    # Login
    login_data = {"email": user_data["email"], "password": user_data["password"]}
    response = session.post(f"{BASE_URL}/auth/login", json=login_data)
    if response.status_code != 200:
        print(f"❌ Login failed: {response.text}")
        return None, None
    
    print("✅ Test user created and logged in!")
    return session, user_data

def create_test_stub_manually():
    """Create a test stub directly in the database using Flask CLI"""
    print("\n📝 Creating test stub in database...")
    
    # We'll create a simple script to add test data directly
    test_script = '''
import sys
sys.path.append('/home/azam_personal/Desktop/stub collector/backend')

from app import create_app, db
from app.models.user import User
from app.models.stub import Stub
from datetime import datetime

app = create_app()
with app.app_context():
    # Find or create a test user
    user = User.query.filter_by(username='test_seller').first()
    if not user:
        user = User(username='test_seller', email='test_seller@example.com')
        user.set_password('testpass123')
        db.session.add(user)
        db.session.commit()
        print(f"Created user: {user.username}")
    
    # Create test stub
    stub = Stub(
        user_id=user.id,
        title="Test Concert Stub - Payment Testing",
        image_path="test_image.jpg",
        raw_text="Test Concert Stub for Payment Flow Testing",
        event_name="Test Concert 2024",
        event_date=datetime(2024, 6, 15),
        venue_name="Test Arena",
        ticket_price=50.0,
        currency="USD",
        seat_info="Section A, Row 5, Seat 12",
        status="processed"
    )
    
    db.session.add(stub)
    db.session.commit()
    
    print(f"✅ Created test stub with ID: {stub.id}")
    print(f"   Title: {stub.title}")
    print(f"   Price: ${stub.ticket_price} {stub.currency}")
    print(f"   User ID: {stub.user_id}")
    
    # Also make user a seller
    user.is_seller = True
    db.session.commit()
    print(f"✅ Made user a seller")
'''
    
    # Write the script to a temporary file
    with open('/tmp/create_test_stub.py', 'w') as f:
        f.write(test_script)
    
    print("✅ Test stub creation script ready")
    print("📝 Run this command to create test data:")
    print("   cd backend && python /tmp/create_test_stub.py")
    
    return True

def create_test_listing(session):
    """Create a test listing for the stub"""
    print("\n🏪 Creating test marketplace listing...")
    
    listing_data = {
        "stub_id": 1,  # Assuming the stub we just created has ID 1
        "asking_price": 75.0,
        "currency": "USD", 
        "description": "Rare concert stub from Test Concert 2024. Great condition!",
        "payment_required": True
    }
    
    response = session.post(f"{BASE_URL}/api/marketplace/list", json=listing_data)
    print(f"Status Code: {response.status_code}")
    
    if response.status_code in [200, 201]:
        data = response.json()
        print("✅ Test listing created successfully!")
        listing_info = data.get('data', {})
        print(f"   Listing ID: {listing_info.get('id')}")
        print(f"   Price: ${listing_info.get('asking_price')} {listing_info.get('currency')}")
        print(f"   Payment Required: {listing_info.get('payment_required')}")
        return True, listing_info.get('id')
    else:
        print(f"❌ Listing creation failed: {response.text}")
        return False, None

def test_marketplace_listings():
    """Test viewing marketplace listings"""
    print("\n🔍 Testing marketplace listings...")
    
    response = requests.get(f"{BASE_URL}/api/marketplace/listings")
    if response.status_code == 200:
        data = response.json()
        listings = data.get('data', [])
        print(f"✅ Found {len(listings)} marketplace listings")
        
        for i, listing in enumerate(listings):
            print(f"\n   Listing {i+1}:")
            print(f"   - ID: {listing.get('id')}")
            print(f"   - Price: ${listing.get('asking_price')} {listing.get('currency')}")
            print(f"   - Payment Enabled: {listing.get('payment_required')}")
            
            payment_info = listing.get('payment_integration', {})
            print(f"   - Can Purchase: {payment_info.get('can_purchase')}")
            print(f"   - Seller Verified: {payment_info.get('seller_verified')}")
        
        return listings
    else:
        print(f"❌ Failed to get listings: {response.text}")
        return []

def main():
    print("🎯 Create Test Data for Payment Testing")
    print("=" * 50)
    
    # Step 1: Create test stub (manual step required)
    create_test_stub_manually()
    
    print("\n" + "="*50)
    print("🚨 MANUAL STEP REQUIRED:")
    print("   Run: cd backend && python /tmp/create_test_stub.py")
    print("   This will create test stub and user data")
    print("   Then come back and run the rest of this script")
    print("="*50)
    
    input("\nPress Enter after you've run the stub creation script...")
    
    # Step 2: Create authenticated session
    session, user_data = create_test_user_and_login()
    if not session:
        print("❌ Could not create test user")
        return
    
    # Step 3: Create test listing
    success, listing_id = create_test_listing(session)
    
    # Step 4: View marketplace
    listings = test_marketplace_listings()
    
    print("\n🎉 Test Data Creation Complete!")
    print("=" * 50)
    
    if listings:
        print("✅ You now have test data ready for payment testing!")
        print(f"✅ Found {len(listings)} listings ready for purchase")
        print("\n🚀 Next: Run payment flow test again:")
        print("   python test_full_payment_flow.py")
    else:
        print("⚠️  No listings found. Check the manual stub creation step.")

if __name__ == "__main__":
    main() 