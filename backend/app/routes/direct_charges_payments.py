# backend/app/routes/direct_charges_payments.py - Phase 4 API Routes Implementation
from flask import Blueprint, request, jsonify, url_for, redirect
from flask_login import login_required, current_user
import stripe
import os
import json
import time
from datetime import datetime
from app import db, limiter
from config import Config
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
@limiter.limit("3 per minute")  # PHASE 5: Stricter limit for account creation
@login_required
def create_stripe_connect_account():
    """Create Stripe Connect Express account for seller or resume incomplete onboarding"""
    try:
        # If user already has an account, check if onboarding is complete
        if current_user.stripe_account_id:
            # Check current account status
            result = connect_service.check_account_status(current_user.id)
            
            if result['success'] and result.get('onboarding_completed'):
                direct_charges_service.log_security_event("duplicate_onboard_attempt", {
                    'user_id': current_user.id,
                    'existing_account_id': current_user.stripe_account_id
                }, "WARNING")
                return jsonify({
                    'status': 'error',
                    'message': 'User already has a completed Stripe account',
                    'account_status': result.get('status'),
                    'can_accept_payments': result.get('can_accept_payments', False)
                }), 400
            else:
                # Onboarding is incomplete, generate new onboarding link
                direct_charges_service.log_security_event("resume_onboard_initiated", {
                    'user_id': current_user.id,
                    'existing_account_id': current_user.stripe_account_id,
                    'current_status': result.get('status', 'unknown')
                }, "INFO")
                
                return_url = url_for('direct_charges_payments.onboard_return', _external=True)
                refresh_url = url_for('direct_charges_payments.onboard_refresh', _external=True)
                
                # Generate new account link for existing account
                resume_result = connect_service.refresh_account_link(
                    user_id=current_user.id,
                    return_url=return_url,
                    refresh_url=refresh_url
                )
                
                if resume_result['success']:
                    return jsonify({
                        'status': 'success',
                        'onboarding_url': resume_result['onboarding_url'],
                        'account_id': current_user.stripe_account_id,
                        'message': 'Resuming incomplete onboarding'
                    })
                else:
                    return jsonify({
                        'status': 'error',
                        'message': f'Failed to resume onboarding: {resume_result["error"]}'
                    }), 400
        
        # Original logic for new account creation
        direct_charges_service.log_security_event("stripe_onboard_initiated", {
            'user_id': current_user.id,
            'username': current_user.username
        }, "INFO")
        
        # Generate URLs for onboarding flow
        return_url = url_for('direct_charges_payments.onboard_return', _external=True)
        refresh_url = url_for('direct_charges_payments.onboard_refresh', _external=True)
        
        result = connect_service.create_express_account(
            user_id=current_user.id,
            return_url=return_url,
            refresh_url=refresh_url
        )
        
        if result['success']:
            direct_charges_service.log_security_event("stripe_account_created", {
                'user_id': current_user.id,
                'account_id': result['account_id']
            }, "INFO")
            return jsonify({
                'status': 'success',
                'onboarding_url': result['onboarding_url'],
                'account_id': result['account_id']
            })
        else:
            direct_charges_service.log_security_event("stripe_account_creation_failed", {
                'user_id': current_user.id,
                'error': result['error']
            }, "ERROR")
            return jsonify({
                'status': 'error',
                'message': result['error']
            }), 400
            
    except Exception as e:
        direct_charges_service.log_security_event("onboard_endpoint_error", {
            'user_id': current_user.id,
            'error': str(e)
        }, "ERROR")
        return jsonify({
            'status': 'error',
            'message': f'Account creation failed: {str(e)}'
        }), 500

@bp.route('/payments/onboard/return', methods=['GET'])
@limiter.limit("10 per minute")  # PHASE 5: Reasonable limit for returns
@login_required
def onboard_return():
    """Handle return from Stripe Connect onboarding"""
    try:
        # Log return attempt
        direct_charges_service.log_security_event("onboard_return_accessed", {
            'user_id': current_user.id
        }, "INFO")
        
        # Check account status after onboarding
        result = connect_service.check_account_status(current_user.id)
        
        if result['success'] and result.get('onboarding_completed'):
            direct_charges_service.log_security_event("onboard_completed_successfully", {
                'user_id': current_user.id,
                'account_status': result.get('status')
            }, "INFO")
            
            # Redirect to frontend callback with success status
            callback_url = f"{Config.FRONTEND_URL}/connect-payments/callback?status=success&message=Account%20onboarding%20completed%20successfully"
            return redirect(callback_url)
        else:
            direct_charges_service.log_security_event("onboard_incomplete", {
                'user_id': current_user.id,
                'account_status': result.get('status', 'unknown')
            }, "WARNING")
            
            # Redirect to frontend callback with error status
            callback_url = f"{Config.FRONTEND_URL}/connect-payments/callback?status=error&message=Onboarding%20not%20completed%20or%20failed"
            return redirect(callback_url)
            
    except Exception as e:
        direct_charges_service.log_security_event("onboard_return_error", {
            'user_id': current_user.id,
            'error': str(e)
        }, "ERROR")
        
        # Redirect to frontend callback with error status
        callback_url = f"{Config.FRONTEND_URL}/connect-payments/callback?status=error&message=Onboarding%20return%20failed"
        return redirect(callback_url)

@bp.route('/payments/onboard/refresh', methods=['GET'])
@limiter.limit("5 per minute")  # PHASE 5: Moderate limit for refresh
@login_required
def onboard_refresh():
    """Handle refresh during Stripe Connect onboarding"""
    try:
        # Log refresh attempt
        direct_charges_service.log_security_event("onboard_refresh_accessed", {
            'user_id': current_user.id
        }, "INFO")
        
        # Generate new onboarding link
        return_url = url_for('direct_charges_payments.onboard_return', _external=True)
        refresh_url = url_for('direct_charges_payments.onboard_refresh', _external=True)
        
        result = connect_service.refresh_account_link(
            user_id=current_user.id,
            return_url=return_url,
            refresh_url=refresh_url
        )
        
        if result['success']:
            # Redirect to the new onboarding URL from Stripe
            return redirect(result['onboarding_url'])
        else:
            direct_charges_service.log_security_event("onboard_refresh_failed", {
                'user_id': current_user.id,
                'error': result['error']
            }, "ERROR")
            
            # Redirect to frontend callback with error status
            callback_url = f"{Config.FRONTEND_URL}/connect-payments/callback?status=error&message=Onboarding%20refresh%20failed"
            return redirect(callback_url)
            
    except Exception as e:
        direct_charges_service.log_security_event("onboard_refresh_error", {
            'user_id': current_user.id,
            'error': str(e)
        }, "ERROR")
        
        # Redirect to frontend callback with error status
        callback_url = f"{Config.FRONTEND_URL}/connect-payments/callback?status=error&message=Onboarding%20refresh%20failed"
        return redirect(callback_url)

@bp.route('/payments/connect/onboard-status', methods=['GET'])
@limiter.limit("10 per minute")
@login_required
def get_onboarding_status():
    """Check if user needs to complete onboarding"""
    try:
        if not current_user.stripe_account_id:
            return jsonify({
                'status': 'success',
                'needs_onboarding': True,
                'has_account': False,
                'message': 'No Stripe account found'
            })
        
        result = connect_service.check_account_status(current_user.id)
        
        if result['success']:
            needs_onboarding = not result.get('onboarding_completed', False)
            
            return jsonify({
                'status': 'success',
                'needs_onboarding': needs_onboarding,
                'has_account': True,
                'account_status': result.get('status'),
                'can_accept_payments': result.get('can_accept_payments', False),
                'onboarding_completed': result.get('onboarding_completed', False),
                'requirements_due': result.get('requirements_due', [])
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

### PAYMENT PROCESSING ROUTES ###@bp.route('/payments/create-payment-intent', methods=['POST'])
@limiter.limit("5 per minute")  # PHASE 5: Stricter limit for payment creation
@login_required
def create_payment_intent():
    """PHASE 5 ENHANCED: Create PaymentIntent with enhanced security validation"""
    try:
        data = request.get_json()
        
        # Enhanced input validation
        if not data or 'listing_id' not in data:
            direct_charges_service.log_security_event("payment_intent_missing_data", {
                'user_id': current_user.id,
                'data_received': data is not None
            }, "WARNING")
            return jsonify({
                'status': 'error',
                'message': 'listing_id is required'
            }), 400
        
        # Validate listing_id is integer
        try:
            listing_id = int(data['listing_id'])
        except (ValueError, TypeError):
            direct_charges_service.log_security_event("payment_intent_invalid_listing_id", {
                'user_id': current_user.id,
                'listing_id': data.get('listing_id')
            }, "WARNING")
            return jsonify({
                'status': 'error',
                'message': 'listing_id must be a valid integer'
            }), 400
        
        # Log payment intent creation attempt
        direct_charges_service.log_security_event("payment_intent_creation_attempted", {
            'user_id': current_user.id,
            'listing_id': listing_id
        }, "INFO")
        
        result = direct_charges_service.create_direct_charge_payment_intent(
            listing_id=listing_id,
            buyer_id=current_user.id
        )
        
        if result['success']:
            direct_charges_service.log_security_event("payment_intent_created_successfully", {
                'user_id': current_user.id,
                'listing_id': listing_id,
                'payment_intent_id': result['payment_intent_id'],
                'order_id': result['order_id']
            }, "INFO")
            return jsonify({
                'status': 'success',
                'client_secret': result['client_secret'],
                'payment_intent_id': result['payment_intent_id'],
                'order_id': result['order_id'],
                'liability_shifted': result['liability_shifted'],
                'payout_schedule_days': result['payout_schedule_days']
            })
        else:
            direct_charges_service.log_security_event("payment_intent_creation_failed", {
                'user_id': current_user.id,
                'listing_id': listing_id,
                'error': result['error']
            }, "WARNING")
            return jsonify({
                'status': 'error',
                'message': result['error'],
                'seller_requirements': result.get('seller_requirements')
            }), 400
            
    except Exception as e:
        direct_charges_service.log_security_event("payment_intent_endpoint_error", {
            'user_id': current_user.id,
            'error': str(e)
        }, "ERROR")
        return jsonify({
            'status': 'error',
            'message': f'Payment intent creation failed: {str(e)}'
        }), 500

@bp.route('/payments/webhook', methods=['POST'])
@limiter.limit("100 per minute")  # Higher limit for webhooks
def stripe_webhook():
    """PHASE 5 ENHANCED: Advanced webhook security with IP validation and idempotency protection"""
    try:
        payload = request.data
        sig_header = request.headers.get('Stripe-Signature')
        timestamp_header = request.headers.get('Stripe-Timestamp')
        
        # PHASE 5 ENHANCEMENT: Enhanced IP validation for additional security
        client_ip = request.environ.get('HTTP_X_FORWARDED_FOR', request.remote_addr)
        if client_ip:
            client_ip = client_ip.split(',')[0].strip()
            if client_ip not in direct_charges_service.STRIPE_WEBHOOK_IPS:
                direct_charges_service.log_security_event("webhook_unauthorized_ip", {
                    'client_ip': client_ip,
                    'endpoint': '/payments/webhook'
                }, "ERROR")
                return jsonify({'error': 'Unauthorized IP address'}), 403
        
        # Construct event first to get event ID
        try:
            event = stripe.Webhook.construct_event(
                payload, sig_header, direct_charges_service.webhook_secret
            )
            event_id = event.get('id')
        except ValueError:
            direct_charges_service.log_security_event("webhook_invalid_payload", {
                'client_ip': client_ip,
                'error': 'Invalid JSON payload'
            }, "ERROR")
            return jsonify({'error': 'Invalid payload'}), 400
        except stripe.error.SignatureVerificationError as e:
            direct_charges_service.log_security_event("webhook_signature_verification_failed", {
                'client_ip': client_ip,
                'error': str(e)
            }, "ERROR")
            return jsonify({'error': 'Invalid signature'}), 400
        
        # PHASE 5 ENHANCEMENT: Enhanced webhook validation with idempotency checking
        is_valid, error_message = direct_charges_service.validate_webhook_security(
            payload, sig_header, event_id, timestamp_header
        )
        
        if not is_valid:
            direct_charges_service.log_security_event("webhook_security_validation_failed", {
                'client_ip': client_ip,
                'event_id': event_id,
                'error': error_message
            }, "ERROR")
            return jsonify({'error': error_message}), 400
        
        # Log successful webhook reception
        direct_charges_service.log_security_event("webhook_received", {
            'event_id': event_id,
            'event_type': event.get('type'),
            'client_ip': client_ip
        }, "INFO")
        
        # Process webhook events with enhanced logging
        if event['type'] == 'payment_intent.succeeded':
            payment_intent = event['data']['object']
            
            direct_charges_service.log_security_event("payment_webhook_processing", {
                'event_id': event_id,
                'payment_intent_id': payment_intent['id'],
                'amount': payment_intent.get('amount')
            }, "INFO")
            
            result = direct_charges_service.handle_successful_payment(payment_intent['id'])
            
            if result['success']:
                direct_charges_service.log_security_event("payment_processed_successfully", {
                    'event_id': event_id,
                    'payment_intent_id': payment_intent['id']
                }, "INFO")
                print(f"✅ Direct charge payment processed: {payment_intent['id']}")
                return jsonify({'status': 'success', 'processed': True})
            else:
                direct_charges_service.log_security_event("payment_processing_failed", {
                    'event_id': event_id,
                    'payment_intent_id': payment_intent['id'],
                    'error': result['error']
                }, "ERROR")
                print(f"❌ Error processing payment: {result['error']}")
                return jsonify({'status': 'error', 'message': result['error']}), 500
        
        # Handle Connect account updates with logging
        elif event['type'] == 'account.updated':
            account = event['data']['object']
            account_id = account['id']
            
            direct_charges_service.log_security_event("account_update_webhook", {
                'event_id': event_id,
                'account_id': account_id,
                'charges_enabled': account.get('charges_enabled'),
                'payouts_enabled': account.get('payouts_enabled')
            }, "INFO")
            
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
                    direct_charges_service.log_security_event("account_status_updated", {
                        'event_id': event_id,
                        'user_id': user.id,
                        'username': user.username,
                        'new_status': user.stripe_account_status
                    }, "INFO")
                    print(f"✅ Updated account status for user {user.username}: {user.stripe_account_status}")
                    
                except Exception as e:
                    db.session.rollback()
                    direct_charges_service.log_security_event("account_update_failed", {
                        'event_id': event_id,
                        'user_id': user.id if user else None,
                        'error': str(e)
                    }, "ERROR")
                    print(f"❌ Error updating user account status: {str(e)}")
        
        # Handle payout events with logging
        elif event['type'] == 'payout.paid':
            payout = event['data']['object']
            direct_charges_service.log_security_event("payout_completed", {
                'event_id': event_id,
                'payout_id': payout['id'],
                'amount': payout.get('amount'),
                'destination': payout.get('destination')
            }, "INFO")
            print(f"✅ Payout completed: {payout['id']} for account {payout.get('destination')}")
        
        elif event['type'] == 'payout.failed':
            payout = event['data']['object']
            direct_charges_service.log_security_event("payout_failed", {
                'event_id': event_id,
                'payout_id': payout['id'],
                'failure_message': payout.get('failure_message'),
                'destination': payout.get('destination')
            }, "ERROR")
            print(f"❌ Payout failed: {payout['id']} - {payout.get('failure_message')}")
            
        # Handle disputes with enhanced logging
        elif event['type'] == 'charge.dispute.created':
            dispute = event['data']['object']
            charge_id = dispute['charge']
            
            # Find the payment record for this charge
            payment = StubPayment.query.filter_by(charge_id=charge_id).first()
            if payment and payment.liability_shift_status == 'shifted_to_seller':
                direct_charges_service.log_security_event("dispute_created_seller_liable", {
                    'event_id': event_id,
                    'dispute_id': dispute['id'],
                    'charge_id': charge_id,
                    'order_id': payment.order_id,
                    'seller_id': payment.order.seller_id
                }, "WARNING")
                print(f"⚠️ Dispute created for seller-liable charge: {charge_id}")
                
                # Optionally notify the seller
                order = payment.order
                seller = order.seller
                print(f"📧 Dispute assigned to seller: {seller.username}")
        
        return jsonify({'status': 'success'})
        
    except Exception as e:
        direct_charges_service.log_security_event("webhook_processing_error", {
            'client_ip': client_ip if 'client_ip' in locals() else 'unknown',
            'error': str(e)
        }, "ERROR")
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
        
        # Use explicit commit/rollback for order completion
        try:
            try:
                db.session.rollback()
            except Exception:
                pass

            order.order_status = 'completed'
            order.completed_at = datetime.utcnow()
            if order.payment:
                order.payment.completion_method = 'buyer_confirmed'

            db.session.commit()

            return jsonify({
                'status': 'success',
                'message': 'Order marked as completed',
                'order_status': order.order_status,
                'payout_note': f'Seller will receive payout in {direct_charges_service.PAYOUT_HOLD_DAYS} days'
            })
        except Exception as e:
            db.session.rollback()
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
    """PHASE 5 ENHANCED: Enhanced health check with security validation"""
    try:
        return jsonify({
            'status': 'success',
            'message': 'Payment system operational',
            'timestamp': datetime.utcnow().isoformat(),
            'version': 'Phase 5 - Enhanced Security',
            'services': {
                'direct_charges': 'operational',
                'stripe_connect': 'operational',
                'webhook_security': 'enhanced',
                'rate_limiting': 'active',
                'audit_logging': 'active'
            },
            'security_features': {
                'ip_validation': 'enabled',
                'signature_verification': 'enabled',
                'replay_protection': 'enabled',
                'idempotency_checking': 'enabled',
                'price_validation': 'enabled',
                'audit_logging': 'enabled'
            }
        })
    except Exception as e:
        return jsonify({
            'status': 'error',
            'message': f'Health check failed: {str(e)}',
            'timestamp': datetime.utcnow().isoformat()
        }), 500

@bp.route('/payments/security/test', methods=['POST'])
@limiter.limit("2 per minute")  # Very strict limit for security testing
@login_required
def run_security_tests():
    """PHASE 5: Run comprehensive security test suite (admin only)"""
    try:
        # Check if user is admin
        if not getattr(current_user, 'is_admin', False):
            direct_charges_service.log_security_event("unauthorized_security_test_attempt", {
                'user_id': current_user.id,
                'username': current_user.username
            }, "WARNING")
            return jsonify({
                'status': 'error',
                'message': 'Admin access required for security testing'
            }), 403
        
        # Log security test initiation
        direct_charges_service.log_security_event("security_test_initiated", {
            'user_id': current_user.id,
            'username': current_user.username
        }, "INFO")
        
        # Run security tests
        test_results = direct_charges_service.run_security_tests()
        
        # Log test completion
        direct_charges_service.log_security_event("security_test_completed", {
            'user_id': current_user.id,
            'tests_run': test_results['tests_run'],
            'tests_passed': test_results['tests_passed'],
            'success_rate': test_results['success_rate']
        }, "INFO" if test_results['success_rate'] > 80 else "WARNING")
        
        return jsonify({
            'status': 'success',
            'message': 'Security tests completed',
            'results': test_results
        })
        
    except Exception as e:
        direct_charges_service.log_security_event("security_test_error", {
            'user_id': current_user.id,
            'error': str(e)
        }, "ERROR")
        return jsonify({
            'status': 'error',
            'message': f'Security test failed: {str(e)}'
        }), 500 