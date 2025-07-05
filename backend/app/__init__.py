from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_login import LoginManager
from flask_cors import CORS
from flask_migrate import Migrate
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address
from config import Config
import os

# Initialize extensions
db = SQLAlchemy()
migrate = Migrate()
login_manager = LoginManager()

# FIXED: Consolidated rate limiter configuration
limiter = Limiter(
    key_func=get_remote_address,
    default_limits=["200 per day", "50 per hour"],
    storage_uri="memory://"  # Use Redis in production: "redis://localhost:6379"
)

def create_app(config_class=Config):
    app = Flask(__name__)
    app.config.from_object(config_class)

    # Configure CORS
    CORS(app, resources={
        r"/auth/*": {
            "origins": ["http://localhost:3000"],  # Assuming React's default port
            "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
            "allow_headers": ["Content-Type"],
            "supports_credentials": True  # Important for session cookies
        },
        r"/api/*": {  # FIXED: Covers both stubs and payments
            "origins": ["http://localhost:3000"],
            "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
            "allow_headers": ["Content-Type"],
            "supports_credentials": True
        }
    })

    # Create upload directory
    upload_dir = os.path.join(app.root_path, 'static', 'uploads', 'stubs')
    os.makedirs(upload_dir, exist_ok=True)

    # Initialize extensions with app
    db.init_app(app)
    migrate.init_app(app, db)  # Initialize Flask-Migrate
    login_manager.init_app(app)
    
    # FIXED: Initialize rate limiter
    limiter.init_app(app)

    # FIXED: Import all models for Flask-Migrate to detect them
    from app import models

    # Import and register blueprints
    from app.routes import auth, stubs, marketplace
    app.register_blueprint(auth.bp, url_prefix='/auth')
    app.register_blueprint(stubs.bp, url_prefix='/api')
    app.register_blueprint(marketplace.bp, url_prefix='/api')

    # Setup login manager
    @login_manager.user_loader
    def load_user(id):
        from app.models.user import User
        return User.query.get(int(id))

    # Create database tables
    with app.app_context():
        db.create_all()

    return app
