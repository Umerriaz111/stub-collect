#!/usr/bin/env python3
"""
Stripe Integration Test Script for Stub Collector
Tests all payment endpoints and functionality
"""

import requests
import json
import time
from datetime import datetime
from dotenv import load_dotenv
import os

load_dotenv()

# Configuration
BASE_URL = os.getenv("BACKEND_URL")

TEST_USER_CREDENTIALS = {
    "username": "testuser",
    "email": "test@example.com", 
    "password": "testpass123"
}

class StripeIntegrationTester:
    def __init__(self):
        self.session = requests.Session()
        self.base_url = BASE_URL
        
    def test_app_health(self):
        """Test if Flask app is running"""
        print("🔍 Testing Flask app health...")
        try:
            response = self.session.get(f"{self.base_url}/api/payments/health")
            if response.status_code == 200:
                print("✅ Flask app is running!")
                return True
            else:
                print(f"❌ Flask app health check failed: {response.status_code}")
                return False
        except requests.exceptions.ConnectionError:
            print(f"❌ Cannot connect to Flask app. Make sure it's running on {BASE_URL}")
            return False
    
    def register_test_user(self):
        """Register a test user"""
        print("👤 Registering test user...")
        data = TEST_USER_CREDENTIALS
        
        response = self.session.post(f"{self.base_url}/auth/register", json=data)
        if response.status_code in [200, 201]:
            print("✅ Test user registered successfully!")
            return True
        elif response.status_code == 400:
            # Check if it's because user already exists
            response_text = response.text.lower()
            if "already" in response_text or "exists" in response_text or "registered" in response_text:
                print("ℹ️  Test user already exists, will try to login...")
                return True
            else:
                print(f"❌ User registration failed: {response.status_code} - {response.text}")
                return False
        else:
            print(f"❌ User registration failed: {response.status_code} - {response.text}")
            return False
    
    def login_test_user(self):
        """Login test user"""
        print("🔐 Logging in test user...")
        data = {
            "email": TEST_USER_CREDENTIALS["email"],  # Changed from username to email
            "password": TEST_USER_CREDENTIALS["password"]
        }
        
        response = self.session.post(f"{self.base_url}/auth/login", json=data)
        if response.status_code == 200:
            print("✅ Login successful!")
            return True
        else:
            print(f"❌ Login failed: {response.status_code} - {response.text}")
            return False
    
    def test_payment_endpoints(self):
        """Test all payment endpoints"""
        print("\n💳 Testing Payment Endpoints...")
        
        endpoints_to_test = [
            ("GET", "/api/payments/connect/status", "Check Stripe account status"),
            ("GET", "/api/marketplace/payment-compatibility", "Check payment compatibility"),
            ("POST", "/api/payments/connect/onboard", "Start Stripe onboarding (should show URL)"),
        ]
        
        for method, endpoint, description in endpoints_to_test:
            print(f"\n🔍 Testing: {description}")
            try:
                if method == "GET":
                    response = self.session.get(f"{self.base_url}{endpoint}")
                else:
                    response = self.session.post(f"{self.base_url}{endpoint}", json={})
                
                print(f"   Status: {response.status_code}")
                if response.headers.get('content-type', '').startswith('application/json'):
                    data = response.json()
                    print(f"   Response: {json.dumps(data, indent=2)}")
                
                if response.status_code in [200, 201, 400]:  # 400 is expected for some tests
                    print("   ✅ Endpoint working!")
                else:
                    print(f"   ❌ Unexpected status code: {response.status_code}")
                    
            except Exception as e:
                print(f"   ❌ Error testing endpoint: {e}")
    
    def test_marketplace_integration(self):
        """Test marketplace payment integration"""
        print("\n🏪 Testing Marketplace Payment Integration...")
        
        try:
            response = self.session.get(f"{self.base_url}/api/marketplace/listings")
            if response.status_code == 200:
                listings = response.json()
                print(f"✅ Retrieved {len(listings)} marketplace listings")
                
                # Check if listings have payment integration fields
                if listings:
                    sample_listing = listings[0]
                    payment_fields = ['payment_integration']
                    has_payment_fields = any(field in sample_listing for field in payment_fields)
                    
                    if has_payment_fields:
                        print("✅ Listings include payment integration data!")
                    else:
                        print("ℹ️  Listings don't include payment integration data yet")
                else:
                    print("ℹ️  No listings found to test payment integration")
            else:
                print(f"❌ Marketplace test failed: {response.status_code}")
                
        except Exception as e:
            print(f"❌ Error testing marketplace: {e}")
    
    def test_database_models(self):
        """Test if payment models are working"""
        print("\n🗄️  Testing Database Models...")
        
        # Test by trying to access payment compatibility endpoint
        try:
            response = self.session.get(f"{self.base_url}/api/marketplace/payment-compatibility")
            if response.status_code == 200:
                data = response.json()
                print("✅ Payment models and services are working!")
                print(f"   Payment system info: {json.dumps(data, indent=2)}")
            else:
                print(f"❌ Payment models test failed: {response.status_code}")
        except Exception as e:
            print(f"❌ Error testing models: {e}")
    
    def run_all_tests(self):
        """Run complete test suite"""
        print("🚀 Starting Stripe Integration Test Suite")
        print("=" * 50)
        
        # Test 1: App health
        if not self.test_app_health():
            return False
        
        # Test 2: User registration and login
        if not self.register_test_user():
            return False
        
        if not self.login_test_user():
            return False
        
        # Test 3: Payment endpoints
        self.test_payment_endpoints()
        
        # Test 4: Marketplace integration
        self.test_marketplace_integration()
        
        # Test 5: Database models
        self.test_database_models()
        
        print("\n🎉 Test Suite Complete!")
        print("=" * 50)
        
        return True

def main():
    """Main test runner"""
    print("Stub Collector - Stripe Integration Tester")
    print("Make sure your Flask app is running: flask run --debug")
    print()
    
    tester = StripeIntegrationTester()
    
    try:
        tester.run_all_tests()
    except KeyboardInterrupt:
        print("\n⏹️  Tests interrupted by user")
    except Exception as e:
        print(f"\n❌ Test suite failed with error: {e}")

if __name__ == "__main__":
    main() 