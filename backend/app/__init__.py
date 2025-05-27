from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_login import LoginManager
from flask_cors import CORS
from config import Config

# Initialize extensions
db = SQLAlchemy()
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
        }
    })

    # Initialize extensions with app
    db.init_app(app)
    login_manager.init_app(app)

    # Import and register blueprints
    from app.routes import auth
    app.register_blueprint(auth.bp, url_prefix='/auth')

    # Setup login manager
    @login_manager.user_loader
    def load_user(id):
        from app.models.user import User
        return User.query.get(int(id))

    # Create database tables
    with app.app_context():
        db.create_all()

    return app
