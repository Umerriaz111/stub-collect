# backend/app/routes/direct_charges_payments.py - Phase 4 API Routes Implementation
from flask import Blueprint, request, jsonify, url_for
from flask_login import login_required, current_user
import stripe
import os
import json
import time
from datetime import datetime
from app import db, limiter
from app.services.direct_charges_service import DirectChargesService
from app.services.stripe_connect_service import StripeConnectService
from app.models.stub_order import StubOrder
from app.models.stub_payment import StubPayment
from app.models.user import User

# Initialize blueprint
bp = Blueprint('direct_charges_payments', __name__)

# Initialize services
direct_charges_service = DirectChargesService()
connect_service = StripeConnectService()

### SELLER ONBOARDING ROUTES ###

@bp.route('/payments/connect/onboard', methods=['POST'])
@limiter.limit("5 per minute")
@login_required
def create_stripe_connect_account():
    """Create Stripe Connect Express account for seller onboarding"""
    try:
        if current_user.stripe_account_id:
            return jsonify({
                'status': 'error',
                'message': 'User already has a Stripe account'
            }), 400
        
        # Generate URLs for onboarding flow
        return_url = url_for('direct_charges_payments.onboard_return', _external=True)
        refresh_url = url_for('direct_charges_payments.onboard_refresh', _external=True)
        
        result = connect_service.create_express_account(
            user_id=current_user.id,
            return_url=return_url,
            refresh_url=refresh_url
        )
        
        if result['success']:
            return jsonify({
                'status': 'success',
                'onboarding_url': result['onboarding_url'],
                'account_id': result['account_id']
            })
        else:
            return jsonify({
                'status': 'error',
                'message': result['error']
            }), 400
            
    except Exception as e:
        return jsonify({
            'status': 'error',
            'message': f'Onboarding initialization failed: {str(e)}'
        }), 500

@bp.route('/payments/onboard/return', methods=['GET'])
@login_required
def onboard_return():
    """Handle return from Stripe Connect onboarding"""
    try:
        # Check account status after onboarding
        result = connect_service.check_account_status(current_user.id)
        
        if result['success'] and result.get('onboarding_completed'):
            return jsonify({
                'status': 'success',
                'message': 'Account onboarding completed successfully',
                'account_status': result.get('status'),
                'can_accept_payments': result.get('can_accept_payments', False)
            })
        else:
            return jsonify({
                'status': 'error',
                'message': 'Onboarding not completed or failed',
                'account_status': result.get('status', 'unknown')
            }), 400
            
    except Exception as e:
        return jsonify({
            'status': 'error',
            'message': f'Onboarding return processing failed: {str(e)}'
        }), 500

@bp.route('/payments/onboard/refresh', methods=['GET'])
@login_required
def onboard_refresh():
    """Handle refresh during Stripe Connect onboarding"""
    try:
        # Generate new onboarding link
        return_url = url_for('direct_charges_payments.onboard_return', _external=True)
        refresh_url = url_for('direct_charges_payments.onboard_refresh', _external=True)
        
        result = connect_service.refresh_account_link(
            user_id=current_user.id,
            return_url=return_url,
            refresh_url=refresh_url
        )
        
        if result['success']:
            return jsonify({
                'status': 'success',
                'onboarding_url': result['onboarding_url']
            })
        else:
            return jsonify({
                'status': 'error',
                'message': result['error']
            }), 400
            
    except Exception as e:
        return jsonify({
            'status': 'error',
            'message': f'Onboarding refresh failed: {str(e)}'
        }), 500

### PAYMENT PROCESSING ROUTES ###

@bp.route('/payments/create-payment-intent', methods=['POST'])
@limiter.limit("10 per minute")
@login_required
def create_payment_intent():
    """Create PaymentIntent for Direct Charges with liability shift"""
    try:
        data = request.get_json()
        
        if not data or 'listing_id' not in data:
            return jsonify({
                'status': 'error',
                'message': 'listing_id is required'
            }), 400
        
        result = direct_charges_service.create_direct_charge_payment_intent(
            listing_id=data['listing_id'],
            buyer_id=current_user.id
        )
        
        if result['success']:
            return jsonify({
                'status': 'success',
                'client_secret': result['client_secret'],
                'payment_intent_id': result['payment_intent_id'],
                'order_id': result['order_id'],
                'liability_shifted': result['liability_shifted'],
                'payout_schedule_days': result['payout_schedule_days']
            })
        else:
            return jsonify({
                'status': 'error',
                'message': result['error'],
                'seller_requirements': result.get('seller_requirements')
            }), 400
            
    except Exception as e:
        return jsonify({
            'status': 'error',
            'message': f'Payment intent creation failed: {str(e)}'
        }), 500

@bp.route('/payments/webhook', methods=['POST'])
@limiter.limit("100 per minute")  # Higher limit for webhooks
def stripe_webhook():
    """Enhanced webhook security with IP validation and replay protection"""
    try:
        payload = request.data
        sig_header = request.headers.get('Stripe-Signature')
        timestamp_header = request.headers.get('Stripe-Timestamp')
        
        # Enhanced IP validation for additional security
        client_ip = request.environ.get('HTTP_X_FORWARDED_FOR', request.remote_addr)
        if client_ip:
            client_ip = client_ip.split(',')[0].strip()
            if client_ip not in direct_charges_service.STRIPE_WEBHOOK_IPS:
                return jsonify({'error': 'Unauthorized IP address'}), 403
        
        # Enhanced webhook validation with replay protection
        is_valid, error_message = direct_charges_service.validate_webhook_security(
            payload, sig_header, timestamp_header
        )
        
        if not is_valid:
            return jsonify({'error': error_message}), 400
        
        # Construct event
        try:
            event = stripe.Webhook.construct_event(
                payload, sig_header, direct_charges_service.webhook_secret
            )
        except ValueError:
            return jsonify({'error': 'Invalid payload'}), 400
        except stripe.error.SignatureVerificationError:
            return jsonify({'error': 'Invalid signature'}), 400
        
        # Process webhook events
        if event['type'] == 'payment_intent.succeeded':
            payment_intent = event['data']['object']
            
            result = direct_charges_service.handle_successful_payment(payment_intent['id'])
            
            if result['success']:
                print(f"✅ Direct charge payment processed: {payment_intent['id']}")
                return jsonify({'status': 'success', 'processed': True})
            else:
                print(f"❌ Error processing payment: {result['error']}")
                return jsonify({'status': 'error', 'message': result['error']}), 500
        
        # Handle Connect account updates
        elif event['type'] == 'account.updated':
            account = event['data']['object']
            account_id = account['id']
            
            # Find user with this Stripe account
            user = User.query.filter_by(stripe_account_id=account_id).first()
            if user:
                try:
                    # Update user's account status based on Stripe account capabilities
                    if account.get('charges_enabled') and account.get('payouts_enabled'):
                        user.stripe_account_status = 'active'
                        user.stripe_capabilities_enabled = True
                        user.seller_verification_level = 'verified'
                        user.stripe_requirements_due = None
                        
                        # Configure payout schedule for newly verified sellers
                        connect_service.configure_seller_payout_schedule(account_id, 7)
                        
                    elif account.get('details_submitted'):
                        user.stripe_account_status = 'restricted'
                        user.stripe_capabilities_enabled = False
                    else:
                        user.stripe_account_status = 'pending'
                        user.stripe_capabilities_enabled = False
                    
                    # Update requirements if any
                    requirements = account.get('requirements', {})
                    if requirements.get('currently_due'):
                        user.stripe_requirements_due = json.dumps(requirements['currently_due'])
                    
                    db.session.commit()
                    print(f"✅ Updated account status for user {user.username}: {user.stripe_account_status}")
                    
                except Exception as e:
                    db.session.rollback()
                    print(f"❌ Error updating user account status: {str(e)}")
        
        # Handle payout events
        elif event['type'] == 'payout.paid':
            payout = event['data']['object']
            print(f"✅ Payout completed: {payout['id']} for account {payout.get('destination')}")
        
        elif event['type'] == 'payout.failed':
            payout = event['data']['object']
            print(f"❌ Payout failed: {payout['id']} - {payout.get('failure_message')}")
            
        # Handle disputes (liability shifted to sellers)
        elif event['type'] == 'charge.dispute.created':
            dispute = event['data']['object']
            charge_id = dispute['charge']
            
            # Find the payment record for this charge
            payment = StubPayment.query.filter_by(charge_id=charge_id).first()
            if payment and payment.liability_shift_status == 'shifted_to_seller':
                print(f"⚠️ Dispute created for seller-liable charge: {charge_id}")
                
                # Optionally notify the seller
                order = payment.order
                seller = order.seller
                print(f"📧 Dispute assigned to seller: {seller.username}")
        
        return jsonify({'status': 'success'})
        
    except Exception as e:
        print(f"❌ Webhook processing error: {str(e)}")
        return jsonify({'error': f'Webhook processing failed: {str(e)}'}), 500

### MANAGEMENT ROUTES ###

@bp.route('/payments/orders/<int:order_id>/complete', methods=['POST'])
@limiter.limit("20 per minute")
@login_required
def mark_order_completed(order_id):
    """Mark order as completed (buyer confirms delivery)"""
    try:
        order = StubOrder.query.get(order_id)
        
        if not order:
            return jsonify({
                'status': 'error',
                'message': 'Order not found'
            }), 404
        
        # Only buyer can mark order as completed
        if order.buyer_id != current_user.id:
            return jsonify({
                'status': 'error',
                'message': 'Only the buyer can mark order as completed'
            }), 403
        
        # Use transaction for order completion
        try:
            with db.session.begin():
                order.order_status = 'completed'
                order.completed_at = datetime.utcnow()
                
                if order.payment:
                    order.payment.completion_method = 'buyer_confirmed'
            
            return jsonify({
                'status': 'success',
                'message': 'Order marked as completed',
                'order_status': order.order_status,
                'payout_note': f'Seller will receive payout in {direct_charges_service.PAYOUT_HOLD_DAYS} days'
            })
        except Exception as e:
            return jsonify({
                'status': 'error',
                'message': f'Failed to complete order: {str(e)}'
            }), 500
            
    except Exception as e:
        return jsonify({
            'status': 'error',
            'message': f'Order completion failed: {str(e)}'
        }), 500

@bp.route('/payments/orders/<int:order_id>/refund', methods=['POST'])
@limiter.limit("10 per minute")
@login_required
def process_refund(order_id):
    """Process refund for an order"""
    try:
        order = StubOrder.query.get(order_id)
        
        if not order:
            return jsonify({
                'status': 'error',
                'message': 'Order not found'
            }), 404
        
        # Only admin or buyer can initiate refund
        if not (current_user.is_admin or order.buyer_id == current_user.id):
            return jsonify({
                'status': 'error',
                'message': 'Not authorized to refund this order'
            }), 403
        
        data = request.get_json() or {}
        refund_reason = data.get('reason', 'requested_by_customer')
        
        result = direct_charges_service.process_refund(
            order_id=order_id,
            refund_reason=refund_reason
        )
        
        if result['success']:
            return jsonify({
                'status': 'success',
                'refund_id': result['refund_id'],
                'amount_refunded_cents': result['amount_refunded_cents'],
                'refund_status': result['refund_status']
            })
        else:
            return jsonify({
                'status': 'error',
                'message': result['error']
            }), 400
            
    except Exception as e:
        return jsonify({
            'status': 'error',
            'message': f'Refund processing failed: {str(e)}'
        }), 500

@bp.route('/payments/connect/dashboard', methods=['GET'])
@limiter.limit("10 per minute")
@login_required
def get_seller_dashboard():
    """Get Stripe Express Dashboard link for seller"""
    try:
        if not current_user.stripe_account_id:
            return jsonify({
                'status': 'error',
                'message': 'No Stripe account found'
            }), 400
        
        result = connect_service.create_dashboard_link(current_user.id)
        
        if result['success']:
            return jsonify({
                'status': 'success',
                'dashboard_url': result['dashboard_url'],
                'expires_at': result['expires_at']
            })
        else:
            return jsonify({
                'status': 'error',
                'message': result['error']
            }), 400
            
    except Exception as e:
        return jsonify({
            'status': 'error',
            'message': f'Dashboard access failed: {str(e)}'
        }), 500

@bp.route('/payments/connect/balance', methods=['GET'])
@limiter.limit("20 per minute")
@login_required
def get_seller_balance():
    """Get seller's Stripe account balance"""
    try:
        if not current_user.stripe_account_id or not current_user.can_accept_payments():
            return jsonify({
                'status': 'error',
                'message': 'Stripe account not available'
            }), 400
        
        try:
            balance = stripe.Balance.retrieve(stripe_account=current_user.stripe_account_id)
        
            return jsonify({
                'status': 'success',
                'balance': {
                    'available': balance.available,
                    'pending': balance.pending,
                    'instant_available': getattr(balance, 'instant_available', None)
                }
            })
        except stripe.error.StripeError as e:
            return jsonify({
                'status': 'error',
                'message': f'Balance retrieval failed: {str(e)}'
            }), 400
            
    except Exception as e:
        return jsonify({
            'status': 'error',
            'message': f'Balance access failed: {str(e)}'
        }), 500

@bp.route('/payments/connect/status', methods=['GET'])
@limiter.limit("20 per minute")
@login_required
def get_account_status():
    """Get current user's Stripe Connect account status"""
    try:
        result = connect_service.check_account_status(current_user.id)
        
        if result['success']:
            return jsonify({
                'status': 'success',
                'account_info': result
            })
        else:
            return jsonify({
                'status': 'error',
                'message': result['error']
            }), 400
            
    except Exception as e:
        return jsonify({
            'status': 'error',
            'message': f'Status check failed: {str(e)}'
        }), 500

### HEALTH CHECK ROUTE ###

@bp.route('/payments/health', methods=['GET'])
def health_check():
    """Health check endpoint for payment services"""
    return jsonify({
        'status': 'success',
        'message': 'Payment services are operational',
        'timestamp': datetime.utcnow().isoformat(),
        'services': {
            'direct_charges': 'active',
            'stripe_connect': 'active'
        }
    }) 