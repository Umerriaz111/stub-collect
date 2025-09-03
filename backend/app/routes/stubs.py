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

@bp.route('/stubs/<int:stub_id>', methods=['DELETE'])
@login_required
def delete_stub(stub_id):
    """Delete a stub and its associated image file"""
    stub = Stub.query.filter_by(id=stub_id, user_id=current_user.id).first()
    
    if not stub:
        return jsonify({
            'status': 'error',
            'message': 'Stub not found'
        }), 404

    try:
        # Delete the associated image file if it exists
        if stub.image_path and os.path.exists(stub.image_path):
            os.remove(stub.image_path)
        
        # Remove the stub from database
        db.session.delete(stub)
        db.session.commit()

        return jsonify({
            'status': 'success',
            'message': 'Stub deleted successfully'
        })
    except Exception as e:
        db.session.rollback()
        print(f"Error deleting stub: {str(e)}")
        return jsonify({
            'status': 'error',
            'message': 'An error occurred while deleting the stub',
            'error': str(e)
        }), 500

@bp.route('/stubs', methods=['GET'])
@login_required
def get_stubs():
    """
    Get all stubs for the current user with optional filtering
    
    Query Parameters (all optional):
    - title: Search in stub titles (case-insensitive partial match)
    - min_price: Minimum ticket price (number)
    - max_price: Maximum ticket price (number)
    - start_date: Start date for stubs (YYYY-MM-DD format)
    - end_date: End date for stubs (YYYY-MM-DD format)
    
    Examples:
    - /stubs?title=concert&min_price=50&max_price=200
    - /stubs?start_date=2024-01-01&end_date=2024-12-31
    - /stubs?title=stadium&min_price=100
    """
    try:
        # Get query parameters for filtering
        title_search = request.args.get('title', None)
        min_price = request.args.get('min_price', None)
        max_price = request.args.get('max_price', None)
        start_date = request.args.get('start_date', None)
        end_date = request.args.get('end_date', None)
        
        # Build query
        query = Stub.query.filter_by(user_id=current_user.id)
        
        # Filter by title search (case-insensitive partial match)
        if title_search:
            query = query.filter(Stub.title.ilike(f'%{title_search}%'))
        
        # Filter by price range
        if min_price is not None:
            try:
                min_price_float = float(min_price)
                query = query.filter(Stub.ticket_price >= min_price_float)
            except ValueError:
                return jsonify({
                    'status': 'error',
                    'message': 'Invalid min_price parameter. Must be a number.'
                }), 400
        
        if max_price is not None:
            try:
                max_price_float = float(max_price)
                query = query.filter(Stub.ticket_price <= max_price_float)
            except ValueError:
                return jsonify({
                    'status': 'error',
                    'message': 'Invalid max_price parameter. Must be a number.'
                }), 400
        
        # Filter by date range (using created_at date)
        if start_date:
            try:
                start_date_obj = datetime.strptime(start_date, '%Y-%m-%d')
                query = query.filter(Stub.created_at >= start_date_obj)
            except ValueError:
                return jsonify({
                    'status': 'error',
                    'message': 'Invalid start_date parameter. Use YYYY-MM-DD format.'
                }), 400
        
        if end_date:
            try:
                end_date_obj = datetime.strptime(end_date, '%Y-%m-%d')
                # Add one day to include the entire end date
                from datetime import timedelta
                end_date_obj = end_date_obj + timedelta(days=1)
                query = query.filter(Stub.created_at < end_date_obj)
            except ValueError:
                return jsonify({
                    'status': 'error',
                    'message': 'Invalid end_date parameter. Use YYYY-MM-DD format.'
                }), 400
        
        stubs = query.order_by(Stub.created_at.desc()).all()
        
        return jsonify({
            'status': 'success',
            'data': [stub.to_dict() for stub in stubs],
            # 'filters_applied': {
            #     'title_search': title_search,
            #     'min_price': min_price,
            #     'max_price': max_price,
            #     'start_date': start_date,
            #     'end_date': end_date
            # }
        })
        
    except Exception as e:
        return jsonify({
            'status': 'error',
            'message': 'An error occurred while fetching stubs',
            'error': str(e)
        }), 500

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