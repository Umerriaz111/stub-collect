from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_login import LoginManager
from flask_cors import CORS
from flask_migrate import Migrate
from config import Config
import os

# Initialize extensions
db = SQLAlchemy()
migrate = Migrate()
login_manager = LoginManager()

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
        r"/api/stubs/*": {  # Add CORS for stub endpoints
            "origins": ["http://localhost:3000"],
            "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
            "allow_headers": ["Content-Type"],
            "supports_credentials": True
        },
        r"/api/marketplace/*": {  # Add CORS for marketplace endpoints
            "origins": ["http://localhost:3000"],
            "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
            "allow_headers": ["Content-Type"],
            "supports_credentials": True
        },
        r"/api/purchases/*": {  # Add CORS for purchase endpoints
            "origins": ["http://localhost:3000"],
            "methods": ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
            "allow_headers": ["Content-Type", "Stripe-Signature"],
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

    # Import and register blueprints
    from app.routes import auth, stubs, marketplace, purchases
    app.register_blueprint(auth.bp, url_prefix='/auth')
    app.register_blueprint(stubs.bp, url_prefix='/api')
    app.register_blueprint(marketplace.bp, url_prefix='/api')
    app.register_blueprint(purchases.purchases)  # Purchase routes are already prefixed with /api

    # Setup login manager
    @login_manager.user_loader
    def load_user(id):
        from app.models.user import User
        return User.query.get(int(id))

    # Create database tables
    with app.app_context():
        db.create_all()

    return app
