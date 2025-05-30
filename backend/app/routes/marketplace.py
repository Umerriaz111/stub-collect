from flask import Blueprint, request, jsonify
from flask_login import login_required, current_user
from app import db
from app.models.stub import Stub, SUPPORTED_CURRENCIES
from app.models.stub_listing import StubListing
from datetime import datetime

bp = Blueprint('marketplace', __name__)

@bp.route('/marketplace/list', methods=['POST'])
@login_required
def create_listing():
    """Create a new marketplace listing for a stub"""
    data = request.get_json()
    
    # Validate required fields
    required_fields = ['stub_id', 'asking_price', 'currency']
    for field in required_fields:
        if field not in data:
            return jsonify({
                'status': 'error',
                'message': f'Missing required field: {field}'
            }), 400
    
    # Validate stub ownership
    stub = Stub.query.filter_by(id=data['stub_id'], user_id=current_user.id).first()
    if not stub:
        return jsonify({
            'status': 'error',
            'message': 'Stub not found or you do not have permission to list it'
        }), 404
    
    # Check if stub is already listed
    existing_listing = StubListing.query.filter_by(
        stub_id=data['stub_id'],
        status='active'
    ).first()
    if existing_listing:
        return jsonify({
            'status': 'error',
            'message': 'This stub is already listed in the marketplace'
        }), 400
    
    # Validate currency
    if data['currency'] not in SUPPORTED_CURRENCIES:
        return jsonify({
            'status': 'error',
            'message': f'Invalid currency. Supported currencies: {", ".join(SUPPORTED_CURRENCIES)}'
        }), 400
    
    try:
        # Create new listing
        listing = StubListing(
            stub_id=data['stub_id'],
            seller_id=current_user.id,
            asking_price=float(data['asking_price']),
            currency=data['currency'],
            description=data.get('description', ''),
            status='active'
        )
        
        db.session.add(listing)
        db.session.commit()
        
        return jsonify({
            'status': 'success',
            'message': 'Listing created successfully',
            'data': listing.to_dict()
        }), 201
        
    except ValueError as e:
        return jsonify({
            'status': 'error',
            'message': str(e)
        }), 400
    except Exception as e:
        db.session.rollback()
        return jsonify({
            'status': 'error',
            'message': 'An error occurred while creating the listing',
            'error': str(e)
        }), 500

@bp.route('/marketplace/listings', methods=['GET'])
def get_listings():
    """Get all active marketplace listings"""
    try:
        # Get query parameters for filtering
        status = request.args.get('status', 'active')
        
        # Query listings
        listings = StubListing.query.filter_by(status=status).order_by(StubListing.listed_at.desc()).all()
        
        return jsonify({
            'status': 'success',
            'data': [listing.to_dict() for listing in listings]
        })
        
    except Exception as e:
        return jsonify({
            'status': 'error',
            'message': 'An error occurred while fetching listings',
            'error': str(e)
        }), 500

@bp.route('/marketplace/listings/<int:listing_id>', methods=['GET'])
def get_listing(listing_id):
    """Get a specific marketplace listing"""
    listing = StubListing.query.get_or_404(listing_id)
    
    return jsonify({
        'status': 'success',
        'data': listing.to_dict()
    })

@bp.route('/marketplace/my-listings', methods=['GET'])
@login_required
def get_my_listings():
    """Get all listings for the current user"""
    try:
        listings = StubListing.query.filter_by(seller_id=current_user.id).order_by(StubListing.listed_at.desc()).all()
        
        return jsonify({
            'status': 'success',
            'data': [listing.to_dict() for listing in listings]
        })
        
    except Exception as e:
        return jsonify({
            'status': 'error',
            'message': 'An error occurred while fetching your listings',
            'error': str(e)
        }), 500

@bp.route('/marketplace/listings/<int:listing_id>', methods=['PUT'])
@login_required
def update_listing(listing_id):
    """Update a marketplace listing"""
    listing = StubListing.query.filter_by(id=listing_id, seller_id=current_user.id).first()
    
    if not listing:
        return jsonify({
            'status': 'error',
            'message': 'Listing not found or you do not have permission to update it'
        }), 404
    
    if listing.status != 'active':
        return jsonify({
            'status': 'error',
            'message': f'Cannot update listing with status: {listing.status}'
        }), 400
    
    data = request.get_json()
    
    try:
        # Update fields if provided
        if 'asking_price' in data:
            listing.asking_price = float(data['asking_price'])
        if 'currency' in data:
            if data['currency'] not in SUPPORTED_CURRENCIES:
                return jsonify({
                    'status': 'error',
                    'message': f'Invalid currency. Supported currencies: {", ".join(SUPPORTED_CURRENCIES)}'
                }), 400
            listing.currency = data['currency']
        if 'description' in data:
            listing.description = data['description']
        
        db.session.commit()
        
        return jsonify({
            'status': 'success',
            'message': 'Listing updated successfully',
            'data': listing.to_dict()
        })
        
    except ValueError as e:
        return jsonify({
            'status': 'error',
            'message': str(e)
        }), 400

@bp.route('/marketplace/listings/<int:listing_id>', methods=['DELETE'])
@login_required
def cancel_listing(listing_id):
    """Cancel a marketplace listing"""
    listing = StubListing.query.filter_by(id=listing_id, seller_id=current_user.id).first()
    
    if not listing:
        return jsonify({
            'status': 'error',
            'message': 'Listing not found or you do not have permission to cancel it'
        }), 404
    
    if listing.status != 'active':
        return jsonify({
            'status': 'error',
            'message': f'Cannot cancel listing with status: {listing.status}'
        }), 400
    
    try:
        listing.status = 'cancelled'
        db.session.commit()
        
        return jsonify({
            'status': 'success',
            'message': 'Listing cancelled successfully',
            'data': listing.to_dict()
        })
        
    except Exception as e:
        db.session.rollback()
        return jsonify({
            'status': 'error',
            'message': 'An error occurred while cancelling the listing',
            'error': str(e)
        }), 500 