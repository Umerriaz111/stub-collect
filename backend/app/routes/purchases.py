from flask import Blueprint, request, jsonify, current_app
from flask_login import login_required, current_user
from app import db
from app.models.purchase import Purchase
from app.models.stub_listing import StubListing
from app.utils.payment import PaymentProcessor
from datetime import datetime
import stripe
import uuid

purchases = Blueprint('purchases', __name__)

@purchases.route('/api/purchases', methods=['POST'])
@login_required
def create_purchase():
    data = request.get_json()
    
    if not data or 'listing_id' not in data:
        return jsonify({'error': 'Missing required data'}), 400
        
    # Check for idempotency key
    idempotency_key = data.get('idempotency_key', str(uuid.uuid4()))
    
    # Check for existing purchase with this idempotency key
    existing_purchase = Purchase.query.filter_by(idempotency_key=idempotency_key).first()
    if existing_purchase:
        return jsonify(existing_purchase.to_dict()), 200
        
    listing = StubListing.query.get(data['listing_id'])
    if not listing:
        return jsonify({'error': 'Listing not found'}), 404
        
    if listing.status != 'active':
        return jsonify({'error': 'This listing is no longer available'}), 400
        
    if listing.seller_id == current_user.id:
        return jsonify({'error': 'You cannot purchase your own listing'}), 400
    
    try:
        # Create the purchase record
        purchase = Purchase(
            listing_id=listing.id,
            buyer_id=current_user.id,
            purchase_price=listing.asking_price,
            currency=listing.currency,
            idempotency_key=idempotency_key
        )
        
        db.session.add(purchase)
        db.session.commit()
        
        # Create payment intent
        payment_processor = PaymentProcessor()
        payment_intent = payment_processor.create_payment_intent(
            purchase=purchase,
            idempotency_key=f"pi_{idempotency_key}"
        )
        
        return jsonify({
            'purchase': purchase.to_dict(),
            'client_secret': payment_intent.client_secret
        }), 201
        
    except stripe.error.StripeError as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 400
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@purchases.route('/api/webhook/stripe', methods=['POST'])
def stripe_webhook():
    payload = request.get_data()
    sig_header = request.headers.get('Stripe-Signature')
    
    try:
        event = stripe.Webhook.construct_event(
            payload, sig_header, current_app.config['STRIPE_WEBHOOK_SECRET']
        )
        payment_processor = PaymentProcessor()
        payment_processor.handle_webhook(event)
        return jsonify({'status': 'success'}), 200
        
    except stripe.error.SignatureVerificationError:
        return jsonify({'error': 'Invalid signature'}), 400
    except Exception as e:
        return jsonify({'error': str(e)}), 400

@purchases.route('/api/purchases', methods=['GET'])
@login_required
def get_user_purchases():
    purchases = Purchase.query.filter_by(buyer_id=current_user.id).all()
    return jsonify([purchase.to_dict() for purchase in purchases])

@purchases.route('/api/purchases/<int:purchase_id>', methods=['GET'])
@login_required
def get_purchase(purchase_id):
    purchase = Purchase.query.get_or_404(purchase_id)
    
    # Check if user is either buyer or seller
    if purchase.buyer_id != current_user.id and purchase.listing.seller_id != current_user.id:
        return jsonify({'error': 'Unauthorized'}), 403
        
    return jsonify(purchase.to_dict())

@purchases.route('/api/purchases/<int:purchase_id>/status', methods=['PATCH'])
@login_required
def update_purchase_status(purchase_id):
    purchase = Purchase.query.get_or_404(purchase_id)
    
    # Only allow seller to update status
    if purchase.listing.seller_id != current_user.id:
        return jsonify({'error': 'Unauthorized'}), 403
    
    data = request.get_json()
    if not data or 'status' not in data:
        return jsonify({'error': 'Missing status in request'}), 400
        
    allowed_statuses = ['completed', 'refunded', 'disputed']
    if data['status'] not in allowed_statuses:
        return jsonify({'error': f'Status must be one of: {", ".join(allowed_statuses)}'}), 400
    
    try:
        purchase.status = data['status']
        db.session.commit()
        return jsonify(purchase.to_dict())
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500 