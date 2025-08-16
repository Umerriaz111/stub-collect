import os

class Config:
    # FIXED: Base URL configuration
    BASE_URL = os.environ.get('BACKEND_URL') or 'http://localhost:5000'
    
     
    # Secret key for session management
    SECRET_KEY = os.environ.get('SECRET_KEY') or 'dev-secret-key'
 
    # Database configuration
    SQLALCHEMY_DATABASE_URI = os.environ.get('DATABASE_URL') or 'sqlite:///stub_collector.db'
    SQLALCHEMY_TRACK_MODIFICATIONS = False 

    # FIXED: Stripe configuration with enhanced settings
    STRIPE_SECRET_KEY = os.environ.get('STRIPE_SECRET_KEY')
    STRIPE_WEBHOOK_SECRET = os.environ.get('STRIPE_WEBHOOK_SECRET')
    STRIPE_PUBLIC_KEY = os.environ.get('STRIPE_PUBLIC_KEY') 
    
    # FIXED: Direct Charges specific configuration
    STRIPE_PAYOUT_HOLD_DAYS = int(os.environ.get('STRIPE_PAYOUT_HOLD_DAYS', '7'))
    STRIPE_PLATFORM_FEE_PERCENTAGE = float(os.environ.get('STRIPE_PLATFORM_FEE_PERCENTAGE', '0.10'))
    STRIPE_ENABLE_LIABILITY_SHIFT = os.environ.get('STRIPE_ENABLE_LIABILITY_SHIFT', 'true').lower() == 'true'
    
    # FIXED: Rate limiting configuration
    RATELIMIT_STORAGE_URL = os.environ.get('REDIS_URL', 'memory://')
    
    # Chatbot configuration
    GEMINI_API_KEY = os.environ.get('GEMINI_API_KEY')
    SAVE_CHATBOT_IMAGES = os.environ.get('SAVE_CHATBOT_IMAGES', 'false').lower() == 'true' 