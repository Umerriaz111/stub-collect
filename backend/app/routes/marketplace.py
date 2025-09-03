from flask import Blueprint, request, jsonify
from flask_login import login_required, current_user
from app import db, limiter
from app.models.stub import Stub, SUPPORTED_CURRENCIES
from app.models.stub_listing import StubListing
from app.models.stub_order import StubOrder
from app.models.user import User
from datetime import datetime
from sqlalchemy.orm import joinedload

bp = Blueprint('marketplace', __name__)

@bp.route('/marketplace/list', methods=['POST'])
@limiter.limit("10 per minute")  # PHASE 6: Add rate limiting
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
    
    # PHASE 6: Validate currency (USD only for payment compatibility)
    if data['currency'] not in SUPPORTED_CURRENCIES:
        return jsonify({
            'status': 'error',
            'message': f'Invalid currency. Supported currencies: {", ".join(SUPPORTED_CURRENCIES)}'
        }), 400
    
    # PHASE 6: Validate seller can accept payments if payment_required is True
    payment_required = data.get('payment_required', True)
    if payment_required and not current_user.can_accept_payments():
        return jsonify({
            'status': 'error',
            'message': 'You must complete Stripe onboarding before listing items for sale',
            'payment_onboarding_required': True,
            'seller_status': current_user.get_liability_status()
        }), 400
    
    try:
        # Create new listing with payment integration
        listing = StubListing(
            stub_id=data['stub_id'],
            seller_id=current_user.id,
            asking_price=float(data['asking_price']),
            currency=data['currency'],
            description=data.get('description', ''),
            status='active',
            payment_required=payment_required  # PHASE 6: Payment integration
        )
        
        db.session.add(listing)
        db.session.commit()
        
        # PHASE 6: Include payment status in response
        return jsonify({
            'status': 'success',
            'message': 'Listing created successfully',
            'data': {
                **listing.to_dict(),
                'payment_integration': {
                    'payment_enabled': payment_required,
                    'seller_verified': current_user.can_accept_payments(),
                    'supported_currency': data['currency']
                }
            }
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
@limiter.limit("30 per minute")  # PHASE 6: Add rate limiting
def get_listings():
    """
    Get all active marketplace listings with payment status and optional filtering
    
    Query Parameters (all optional):
    - status: Listing status (default: 'active')
    - payment_enabled: Filter by payment capability (true/false)
    - title: Search in stub titles (case-insensitive partial match)
    - min_price: Minimum asking price (number)
    - max_price: Maximum asking price (number)
    - start_date: Start date for listings (YYYY-MM-DD format)
    - end_date: End date for listings (YYYY-MM-DD format)
    
    Examples:
    - /marketplace/listings?title=concert&min_price=50&max_price=200
    """
    try:
        # Get query parameters for filtering
        status = request.args.get('status', 'active')
        payment_enabled = request.args.get('payment_enabled', None)
        
        # New optional filtering parameters
        title_search = request.args.get('title', None)
        min_price = request.args.get('min_price', None)
        max_price = request.args.get('max_price', None)
        start_date = request.args.get('start_date', None)
        end_date = request.args.get('end_date', None)
        
        # Build query with stub relationship for title search
        query = StubListing.query.options(
            joinedload(StubListing.seller),
            joinedload(StubListing.stub)
        )
        
        # Filter by status
        query = query.filter_by(status=status)
        
        # PHASE 6: Filter by payment capability if requested
        if payment_enabled is not None:
            payment_enabled = payment_enabled.lower() == 'true'
            query = query.filter_by(payment_required=payment_enabled)
        
        # Filter by title search (case-insensitive partial match)
        if title_search:
            query = query.join(Stub).filter(
                Stub.title.ilike(f'%{title_search}%')
            )
        
        # Filter by price range
        if min_price is not None:
            try:
                min_price_float = float(min_price)
                query = query.filter(StubListing.asking_price >= min_price_float)
            except ValueError:
                return jsonify({
                    'status': 'error',
                    'message': 'Invalid min_price parameter. Must be a number.'
                }), 400
        
        if max_price is not None:
            try:
                max_price_float = float(max_price)
                query = query.filter(StubListing.asking_price <= max_price_float)
            except ValueError:
                return jsonify({
                    'status': 'error',
                    'message': 'Invalid max_price parameter. Must be a number.'
                }), 400
        
        # Filter by date range (using listed_at date)
        if start_date:
            try:
                start_date_obj = datetime.strptime(start_date, '%Y-%m-%d')
                query = query.filter(StubListing.listed_at >= start_date_obj)
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
                query = query.filter(StubListing.listed_at < end_date_obj)
            except ValueError:
                return jsonify({
                    'status': 'error',
                    'message': 'Invalid end_date parameter. Use YYYY-MM-DD format.'
                }), 400
        
        listings = query.order_by(StubListing.listed_at.desc()).all()
        
        # PHASE 6: Enhanced response with payment information
        listings_data = []
        for listing in listings:
            listing_dict = listing.to_dict()
            
            # Add payment integration status
            listing_dict['payment_integration'] = {
                'payment_enabled': listing.payment_required,
                'seller_verified': listing.seller.can_accept_payments() if listing.seller else False,
                'can_purchase': listing.can_be_purchased()[0],
                'purchase_status_reason': listing.can_be_purchased()[1]
            }
            
            listings_data.append(listing_dict)
        
        return jsonify({
            'status': 'success',
            'data': listings_data,
            # 'filters_applied': {
            #     'status': status
                # 'payment_enabled': payment_enabled,
                # 'title_search': title_search,
                # 'min_price': min_price,
                # 'max_price': max_price,
                # 'start_date': start_date,
                # 'end_date': end_date
            # }
        })
        
    except Exception as e:
        return jsonify({
            'status': 'error',
            'message': 'An error occurred while fetching listings',
            'error': str(e)
        }), 500

@bp.route('/marketplace/listings/<int:listing_id>', methods=['GET'])
@limiter.limit("30 per minute")  # PHASE 6: Add rate limiting
def get_listing(listing_id):
    """Get a specific marketplace listing with payment status"""
    listing = StubListing.query.options(joinedload(StubListing.seller)).get_or_404(listing_id)
    
    # PHASE 6: Enhanced response with payment information
    listing_dict = listing.to_dict()
    
    # Add payment integration status
    listing_dict['payment_integration'] = {
        'payment_enabled': listing.payment_required,
        'seller_verified': listing.seller.can_accept_payments() if listing.seller else False,
        'can_purchase': listing.can_be_purchased()[0],
        'purchase_status_reason': listing.can_be_purchased()[1],
        'liability_status': listing.seller.get_liability_status() if listing.seller else None
    }
    
    # PHASE 6: Add order history if available
    orders = StubOrder.query.filter_by(stub_listing_id=listing_id).all()
    if orders:
        listing_dict['order_history'] = {
            'total_orders': len(orders),
            'completed_orders': len([o for o in orders if o.order_status == 'completed']),
            'pending_orders': len([o for o in orders if o.order_status in ['pending', 'payment_processing']])
        }
    
    return jsonify({
        'status': 'success',
        'data': listing_dict
    })

@bp.route('/marketplace/my-listings', methods=['GET'])
@limiter.limit("20 per minute")  # PHASE 6: Add rate limiting
@login_required
def get_my_listings():
    """Get all listings for the current user with payment status"""
    try:
        listings = StubListing.query.options(joinedload(StubListing.orders)).filter_by(seller_id=current_user.id).order_by(StubListing.listed_at.desc()).all()
        
        # PHASE 6: Enhanced response with payment information
        listings_data = []
        for listing in listings:
            listing_dict = listing.to_dict()
            
            # Add payment integration status
            listing_dict['payment_integration'] = {
                'payment_enabled': listing.payment_required,
                'seller_verified': current_user.can_accept_payments(),
                'can_purchase': listing.can_be_purchased()[0],
                'purchase_status_reason': listing.can_be_purchased()[1]
            }
            
            # Add order information
            if listing.orders:
                listing_dict['order_summary'] = {
                    'total_orders': len(listing.orders),
                    'completed_sales': len([o for o in listing.orders if o.order_status == 'completed']),
                    'pending_orders': len([o for o in listing.orders if o.order_status in ['pending', 'payment_processing', 'payment_completed']])
                }
            
            listings_data.append(listing_dict)
        
        return jsonify({
            'status': 'success',
            'data': listings_data,
            'seller_payment_status': {
                'can_accept_payments': current_user.can_accept_payments(),
                'verification_level': current_user.seller_verification_level,
                'account_status': current_user.stripe_account_status
            }
        })
        
    except Exception as e:
        return jsonify({
            'status': 'error',
            'message': 'An error occurred while fetching your listings',
            'error': str(e)
        }), 500

@bp.route('/marketplace/listings/<int:listing_id>', methods=['PUT'])
@limiter.limit("10 per minute")  # PHASE 6: Add rate limiting
@login_required
def update_listing(listing_id):
    """Update a marketplace listing"""
    listing = StubListing.query.filter_by(id=listing_id, seller_id=current_user.id).first()
    
    if not listing:
        return jsonify({
            'status': 'error',
            'message': 'Listing not found or you do not have permission to update it'
        }), 404
    
    # PHASE 6: Prevent updates to listings with pending orders
    if listing.status == 'payment_pending':
        return jsonify({
            'status': 'error',
            'message': 'Cannot update listing with pending payment'
        }), 400
    
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
        
        # PHASE 6: Handle payment_required updates
        if 'payment_required' in data:
            payment_required = data['payment_required']
            if payment_required and not current_user.can_accept_payments():
                return jsonify({
                    'status': 'error',
                    'message': 'You must complete Stripe onboarding before enabling payments',
                    'payment_onboarding_required': True
                }), 400
            listing.payment_required = payment_required
        
        db.session.commit()
        
        # PHASE 6: Enhanced response with payment information
        listing_dict = listing.to_dict()
        listing_dict['payment_integration'] = {
            'payment_enabled': listing.payment_required,
            'seller_verified': current_user.can_accept_payments(),
            'can_purchase': listing.can_be_purchased()[0],
            'purchase_status_reason': listing.can_be_purchased()[1]
        }
        
        return jsonify({
            'status': 'success',
            'message': 'Listing updated successfully',
            'data': listing_dict
        })
        
    except ValueError as e:
        return jsonify({
            'status': 'error',
            'message': str(e)
        }), 400

@bp.route('/marketplace/listings/<int:listing_id>', methods=['DELETE'])
@limiter.limit("10 per minute")  # PHASE 6: Add rate limiting
@login_required
def cancel_listing(listing_id):
    """Cancel a marketplace listing"""
    listing = StubListing.query.filter_by(id=listing_id, seller_id=current_user.id).first()
    
    if not listing:
        return jsonify({
            'status': 'error',
            'message': 'Listing not found or you do not have permission to cancel it'
        }), 404
    
    # PHASE 6: Prevent cancellation of listings with pending orders
    if listing.status == 'payment_pending':
        return jsonify({
            'status': 'error',
            'message': 'Cannot cancel listing with pending payment. Please wait for payment to complete or fail.'
        }), 400
    
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

# PHASE 6: Enhanced Seller Profile Routes with Payment Integration

@bp.route('/marketplace/sellers/<int:seller_id>', methods=['GET'])
@limiter.limit("20 per minute")  # PHASE 6: Add rate limiting
def get_seller_profile(seller_id):
    """Get public profile information for a specific seller with payment status"""
    seller = User.query.get(seller_id)
    
    if not seller:
        return jsonify({
            'status': 'error',
            'message': 'Seller not found'
        }), 404
    
    # PHASE 6: Enhanced seller profile with payment information
    profile_data = seller.to_public_profile()
    
    # Add payment integration status
    profile_data['payment_integration'] = {
        'can_accept_payments': seller.can_accept_payments(),
        'verification_level': seller.seller_verification_level,
        'liability_status': seller.get_liability_status()
    }
    
    # Add sales statistics
    total_sales = StubOrder.query.filter_by(seller_id=seller_id, order_status='completed').count()
    profile_data['sales_stats'] = {
        'total_completed_sales': total_sales,
        'verified_seller': seller.can_accept_payments()
    }
    
    return jsonify({
        'status': 'success',
        'data': profile_data
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
        ).options(joinedload(Stub.listings)).all()
        
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

# PHASE 6: New Payment Integration Routes

@bp.route('/marketplace/payment-compatibility', methods=['GET'])
@limiter.limit("20 per minute")
def get_payment_compatibility():
    """Get payment system compatibility information"""
    return jsonify({
        'status': 'success',
        'data': {
            'payment_integration': {
                'enabled': True,
                'supported_currencies': SUPPORTED_CURRENCIES,
                'platform_fee_percentage': 0.10,
                'payout_hold_days': 7,
                'liability_shift_available': True
            },
            'seller_requirements': {
                'stripe_onboarding_required': True,
                'verification_levels': ['unverified', 'pending', 'verified'],
                'capabilities_required': ['charges_enabled', 'payouts_enabled']
            }
        }
    })

@bp.route('/marketplace/my-orders', methods=['GET'])
@limiter.limit("20 per minute")
@login_required
def get_my_orders():
    """Get all orders for the current user (both buying and selling)"""
    try:
        # Get orders where user is buyer
        purchase_orders = StubOrder.query.options(
            joinedload(StubOrder.stub_listing),
            joinedload(StubOrder.seller)
        ).filter_by(buyer_id=current_user.id).all()
        
        # Get orders where user is seller
        sale_orders = StubOrder.query.options(
            joinedload(StubOrder.stub_listing),
            joinedload(StubOrder.buyer)
        ).filter_by(seller_id=current_user.id).all()
        
        return jsonify({
            'status': 'success',
            'data': {
                'purchases': [order.to_dict() for order in purchase_orders],
                'sales': [order.to_dict() for order in sale_orders],
                'summary': {
                    'total_purchases': len(purchase_orders),
                    'total_sales': len(sale_orders),
                    'completed_purchases': len([o for o in purchase_orders if o.order_status == 'completed']),
                    'completed_sales': len([o for o in sale_orders if o.order_status == 'completed'])
                }
            }
        })
        
    except Exception as e:
        return jsonify({
            'status': 'error',
            'message': 'An error occurred while fetching your orders',
            'error': str(e)
        }), 500 