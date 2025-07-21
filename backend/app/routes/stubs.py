from flask import Blueprint, request, jsonify, current_app
from flask_login import login_required, current_user
import os
from app import db, limiter
from app.models.stub import Stub, SUPPORTED_CURRENCIES
from app.services.stub_service import StubProcessor
from datetime import datetime
from sqlalchemy.orm import joinedload

bp = Blueprint('stubs', __name__)

ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg'}

def get_stub_processor():
    """Get or create StubProcessor instance"""
    UPLOAD_FOLDER = os.path.join(current_app.root_path, 'static', 'uploads', 'stubs')
    return StubProcessor(UPLOAD_FOLDER)

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

@bp.route('/stubs/upload', methods=['POST'])
@limiter.limit("10 per minute")
@login_required
def upload_stub():
    """Upload and process a new stub image"""
    if 'image' not in request.files:
        return jsonify({
            'status': 'error',
            'message': 'No image file provided'
        }), 400

    # Get the title from form data
    title = request.form.get('title')
    if not title:
        return jsonify({
            'status': 'error',
            'message': 'Title is required'
        }), 400

    image_file = request.files['image']
    if image_file.filename == '':
        return jsonify({
            'status': 'error',
            'message': 'No selected file'
        }), 400

    if not allowed_file(image_file.filename):
        return jsonify({
            'status': 'error',
            'message': 'Invalid file type. Allowed types: PNG, JPG, JPEG'
        }), 400

    # Check file size (limit to 5MB)
    if len(image_file.read()) > 5 * 1024 * 1024:  # 5MB in bytes
        return jsonify({
            'status': 'error',
            'message': 'File size too large. Maximum size is 5MB'
        }), 400
    image_file.seek(0)  # Reset file pointer after reading

    try:
        stub_processor = get_stub_processor()
        
        # Save the image
        image_path = stub_processor.save_image(image_file, current_user.id)
        
        # Process the image with Gemini Vision
        result = stub_processor.process_image(image_path)
        
        if not result['success']:
            return jsonify({
                'status': 'error',
                'message': 'Failed to process image',
                'error': result.get('error', 'Unknown error occurred')
            }), 500

        # Create new stub record
        parsed_data = result['parsed_data']
        stub = Stub(
            user_id=current_user.id,
            title=title,
            image_path=image_path,
            raw_text=result['raw_text'],
            event_name=parsed_data.get('event_name'),
            event_date=Stub.parse_date(parsed_data.get('event_date')),
            venue_name=parsed_data.get('venue_name'),
            ticket_price=parsed_data.get('ticket_price'),
            currency=parsed_data.get('currency', 'USD'),
            seat_info=parsed_data.get('seat_info'),
            status='processed'
        )

        db.session.add(stub)
        db.session.commit()

        return jsonify({
            'status': 'success',
            'message': 'Stub processed successfully',
            'data': stub.to_dict()
        }), 201

    except Exception as e:
        # Log the error here if you have logging configured
        print(f"Error processing stub: {str(e)}")
        return jsonify({
            'status': 'error',
            'message': 'An error occurred while processing the stub',
            'error': str(e)
        }), 500

@bp.route('/stubs/<int:stub_id>', methods=['PUT'])
@login_required
def update_stub(stub_id):
    """Update stub information (manual correction)"""
    stub = Stub.query.filter_by(id=stub_id, user_id=current_user.id).first()
    
    if not stub:
        return jsonify({
            'status': 'error',
            'message': 'Stub not found'
        }), 404

    data = request.get_json()
    
    try:
        # Update fields if provided
        if 'title' in data:
            if not data['title']:
                return jsonify({
                    'status': 'error',
                    'message': 'Title cannot be empty'
                }), 400
            stub.title = data['title']
        if 'event_name' in data:
            stub.event_name = data['event_name']
        if 'event_date' in data:
            parsed_date = Stub.parse_date(data['event_date'])
            if parsed_date is None:
                return jsonify({
                    'status': 'error',
                    'message': 'Invalid date format. Use YYYY-MM-DD'
                }), 400
            stub.event_date = parsed_date
        if 'venue_name' in data:
            stub.venue_name = data['venue_name']
        if 'ticket_price' in data:
            stub.ticket_price = float(data['ticket_price']) if data['ticket_price'] else None
        if 'currency' in data:
            if data['currency'] not in SUPPORTED_CURRENCIES:
                return jsonify({
                    'status': 'error',
                    'message': f'Invalid currency. Supported currencies: {", ".join(SUPPORTED_CURRENCIES)}'
                }), 400
            stub.currency = data['currency']
        if 'seat_info' in data:
            stub.seat_info = data['seat_info']

        stub.status = 'manual'
        db.session.commit()

        return jsonify({
            'status': 'success',
            'message': 'Stub updated successfully',
            'data': stub.to_dict()
        })
    except ValueError as e:
        return jsonify({
            'status': 'error',
            'message': str(e)
        }), 400

@bp.route('/stubs', methods=['GET'])
@login_required
def get_stubs():
    """Get all stubs for the current user"""
    stubs = Stub.query.filter_by(user_id=current_user.id).order_by(Stub.created_at.desc()).all()
    return jsonify({
        'status': 'success',
        'data': [stub.to_dict() for stub in stubs]
    })

@bp.route('/stubs/<int:stub_id>', methods=['GET'])
@login_required
def get_stub(stub_id):
    """Get a specific stub"""
    stub = Stub.query.filter_by(id=stub_id, user_id=current_user.id).first()
    
    if not stub:
        return jsonify({
            'status': 'error',
            'message': 'Stub not found'
        }), 404

    return jsonify({
        'status': 'success',
        'data': stub.to_dict()
    }) 