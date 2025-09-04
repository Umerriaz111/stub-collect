from flask import Blueprint, request, jsonify
from flask_login import login_user, logout_user, login_required, current_user
from app import db
from app.models.user import User
from app.utils.validators import validate_email, validate_password

bp = Blueprint('auth', __name__)

@bp.route('/register', methods=['POST'])
def register():
    data = request.get_json()
    
    # Check if required fields are present
    if not all(k in data for k in ['username', 'email', 'password']):
        return jsonify({
            'status': 'error',
            'message': 'Missing required fields'
        }), 400

    # Validate email and password
    if not validate_email(data['email']):
        return jsonify({
            'status': 'error',
            'message': 'Invalid email format'
        }), 400

    if not validate_password(data['password']):
        return jsonify({
            'status': 'error',
            'message': 'Password must be at least 8 characters long'
        }), 400

    # Check if user already exists
    if User.query.filter_by(email=data['email']).first():
        return jsonify({
            'status': 'error',
            'message': 'Email already registered'
        }), 400

    if User.query.filter_by(username=data['username']).first():
        return jsonify({
            'status': 'error',
            'message': 'Username already taken'
        }), 400

    # Create new user
    user = User(username=data['username'], email=data['email'])
    user.set_password(data['password'])
    
    db.session.add(user)
    db.session.commit()

    return jsonify({
        'status': 'success',
        'message': 'User registered successfully',
        'data': {'username': user.username}
    }), 201

@bp.route('/login', methods=['POST'])
def login():
    if current_user.is_authenticated:
        return jsonify({
            'status': 'error',
            'message': 'Already logged in'
        }), 400

    data = request.get_json()
    
    if not all(k in data for k in ['email', 'password']):
        return jsonify({
            'status': 'error',
            'message': 'Missing required fields'
        }), 400

    user = User.query.filter_by(email=data['email']).first()
    
    if user is None or not user.check_password(data['password']):
        return jsonify({
            'status': 'error',
            'message': 'Invalid email or password'
        }), 401

    login_user(user)
    
    return jsonify({
        'status': 'success',
        'message': 'Logged in successfully',
        'data': {'username': user.username}
    }), 200

@bp.route('/logout', methods=['POST'])
@login_required
def logout():
    logout_user()
    return jsonify({
        'status': 'success',
        'message': 'Logged out successfully'
    }), 200

@bp.route('/userAuthStatusCheck', methods=['GET'])
def user_auth_status_check():
    if current_user.is_authenticated:
        return jsonify({
            'status': 'success',
            'message': 'User is authenticated',
            'data': {
                'is_authenticated': True,
                'username': current_user.username,
                'user_id': current_user.id
            }
        }), 200
    else:
        return jsonify({
            'status': 'success',
            'message': 'User is not authenticated',
            'data': {
                'is_authenticated': False
            }
        }), 200 