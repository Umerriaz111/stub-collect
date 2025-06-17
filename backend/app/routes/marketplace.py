from flask import Blueprint, request, jsonify
from flask_login import login_required, current_user
from app import db
from app.models.stub import Stub, SUPPORTED_CURRENCIES
from app.models.stub_listing import StubListing
from app.models.user import User
from datetime import datetime
from sqlalchemy.orm import joinedload

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

# Seller Profile Routes

@bp.route('/marketplace/sellers/<int:seller_id>', methods=['GET'])
def get_seller_profile(seller_id):
    """Get public profile information for a specific seller"""
    seller = User.query.get(seller_id)
    
    if not seller:
        return jsonify({
            'status': 'error',
            'message': 'Seller not found'
        }), 404
    
    return jsonify({
        'status': 'success',
        'data': seller.to_public_profile()
    })

@bp.route('/marketplace/sellers/<int:seller_id>/listings', methods=['GET'])
def get_seller_listings(seller_id):
    """Get all active listings from a specific seller"""
    # Verify seller exists
    seller = User.query.get(seller_id)
    if not seller:
        return jsonify({
            'status': 'error',
            'message': 'Seller not found'
        }), 404
    
    try:
        # Get query parameters
        status = request.args.get('status', 'active')
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 10, type=int)
        
        # Ensure per_page is reasonable
        per_page = min(per_page, 50)  # Max 50 items per page
        
        # Query seller's listings with pagination
        listings_query = StubListing.query.filter_by(
            seller_id=seller_id, 
            status=status
        ).order_by(StubListing.listed_at.desc())
        
        listings_paginated = listings_query.paginate(
            page=page,
            per_page=per_page,
            error_out=False
        )
        
        return jsonify({
            'status': 'success',
            'data': {
                'seller': seller.to_public_profile(),
                'listings': [listing.to_dict() for listing in listings_paginated.items],
                'pagination': {
                    'page': page,
                    'per_page': per_page,
                    'total': listings_paginated.total,
                    'pages': listings_paginated.pages,
                    'has_next': listings_paginated.has_next,
                    'has_prev': listings_paginated.has_prev
                }
            }
        })
        
    except Exception as e:
        return jsonify({
            'status': 'error',
            'message': 'An error occurred while fetching seller listings',
            'error': str(e)
        }), 500

@bp.route('/marketplace/sellers/<int:seller_id>/stubs', methods=['GET'])
def get_seller_stubs_summary(seller_id):
    """Get a summary of seller's stub collection (public view)"""
    # Verify seller exists
    seller = User.query.get(seller_id)
    if not seller:
        return jsonify({
            'status': 'error',
            'message': 'Seller not found'
        }), 404
    
    try:
        # Get only stubs that have active listings (public stubs)
        public_stubs = db.session.query(Stub).join(StubListing).filter(
            Stub.user_id == seller_id,
            StubListing.status == 'active'
        ).options(joinedload('listings')).all()
        
        # Group by event types or venues for summary
        venues = {}
        events = {}
        
        for stub in public_stubs:
            if stub.venue_name:
                venues[stub.venue_name] = venues.get(stub.venue_name, 0) + 1
            if stub.event_name:
                events[stub.event_name] = events.get(stub.event_name, 0) + 1
        
        return jsonify({
            'status': 'success',
            'data': {
                'seller': seller.to_public_profile(),
                'collection_summary': {
                    'total_public_stubs': len(public_stubs),
                    'top_venues': sorted(venues.items(), key=lambda x: x[1], reverse=True)[:5],
                    'top_events': sorted(events.items(), key=lambda x: x[1], reverse=True)[:5]
                }
            }
        })
        
    except Exception as e:
        return jsonify({
            'status': 'error',
            'message': 'An error occurred while fetching seller stub summary',
            'error': str(e)
        }), 500 