# backend/app/services/stripe_connect_service.py
import stripe
import os
from datetime import datetime
from typing import Dict
from app import db
from app.models.user import User

class StripeConnectService:
    """
    Stripe Connect Express account management service
    Handles seller onboarding, account verification, and dashboard access
    """
    
    def __init__(self):
        """Initialize the service with Stripe configuration"""
        # Load Stripe configuration from environment
        stripe.api_key = os.getenv('STRIPE_SECRET_KEY')
        
        # Validate required environment variables
        if not stripe.api_key:
            raise ValueError("STRIPE_SECRET_KEY environment variable is not set")
    
    def create_express_account(self, user_id: int, return_url: str, refresh_url: str) -> Dict:
        """Create Stripe Express account for seller onboarding"""
        try:
            # Ensure clean session state
            try:
                db.session.rollback()
            except Exception:
                pass

            user = User.query.get(user_id)
            if not user:
                return {'success': False, 'error': 'User not found'}
            
            if user.stripe_account_id:
                return {'success': False, 'error': 'User already has a Stripe account'}
            
            # Create Express account
            account = stripe.Account.create(
                type='express',
                email=user.email,
                business_profile={
                    'mcc': '5094',  # Computer software stores
                    'product_description': 'Digital collectible ticket stubs marketplace',
                    'url': 'https://stubcollector.com'  # Replace with your domain
                },
                capabilities={
                    'card_payments': {'requested': True},
                    'transfers': {'requested': True},
                },
                metadata={
                    'user_id': user.id,
                    'username': user.username,
                    'created_via': 'direct_charges_onboarding'
                }
            )
            
            # Create onboarding link
            account_link = stripe.AccountLink.create(
                account=account.id,
                refresh_url=refresh_url,
                return_url=return_url,
                type='account_onboarding'
            )
            
            # Save account ID to user
            try:
                user.stripe_account_id = account.id
                user.is_seller = True
                user.stripe_account_status = 'pending'
                db.session.commit()
            except Exception as db_error:
                db.session.rollback()
                return {'success': False, 'error': f'Failed to persist account: {str(db_error)}'}
            
            return {
                'success': True,
                'account_id': account.id,
                'onboarding_url': account_link.url,
                'account_status': 'pending'
            }
            
        except stripe.error.StripeError as e:
            return {'success': False, 'error': f'Stripe error: {str(e)}'}
        except Exception as e:
            return {'success': False, 'error': f'Account creation failed: {str(e)}'}
    
    def configure_seller_payout_schedule(self, seller_stripe_account_id: str, delay_days: int = 7) -> Dict:
        """Configure seller's payout schedule with delay days"""
        try:
            # Retrieve account to check country requirements
            account = stripe.Account.retrieve(seller_stripe_account_id)
            
            # Check minimum delay requirements by country
            country_minimums = {
                'US': 2, 'CA': 2, 'GB': 2, 'AU': 3,
            }
            
            min_delay = country_minimums.get(account.country, 1)
            if delay_days < min_delay:
                delay_days = min_delay
            
            # Update seller's payout schedule to enforce platform hold period
            updated_account = stripe.Account.modify(
                seller_stripe_account_id,
                settings={
                    "payouts": {
                        "schedule": {
                            "interval": "daily",
                            "delay_days": delay_days
                        }
                    }
                },
                metadata={
                    'payout_schedule_set_by': 'platform',
                    'delay_days': str(delay_days),
                    'configured_at': datetime.utcnow().isoformat(),
                    'country': account.country
                }
            )
            
            return {
                'success': True,
                'message': f'Payout schedule configured with {delay_days} day delay',
                'account_id': seller_stripe_account_id,
                'country': account.country,
                'delay_days_applied': delay_days,
                'payout_schedule': updated_account.settings.payouts.schedule
            }
            
        except stripe.error.StripeError as e:
            return {'success': False, 'error': f'Payout schedule configuration failed: {str(e)}'}
    
    def refresh_account_link(self, user_id: int, return_url: str, refresh_url: str) -> Dict:
        """Create new account link for incomplete onboarding"""
        try:
            user = User.query.get(user_id)
            if not user or not user.stripe_account_id:
                return {'success': False, 'error': 'No Stripe account found'}
            
            account_link = stripe.AccountLink.create(
                account=user.stripe_account_id,
                refresh_url=refresh_url,
                return_url=return_url,
                type='account_onboarding'
            )
            
            return {
                'success': True,
                'onboarding_url': account_link.url
            }
            
        except stripe.error.StripeError as e:
            return {'success': False, 'error': f'Stripe error: {str(e)}'}
    
    def check_account_status(self, user_id: int) -> Dict:
        """Check and update user's Stripe account status"""
        try:
            # Ensure clean session state
            try:
                db.session.rollback()
            except Exception:
                pass

            user = User.query.get(user_id)
            if not user or not user.stripe_account_id:
                return {
                    'success': True,
                    'has_account': False,
                    'status': 'no_account'
                }
            
            # Retrieve account from Stripe
            account = stripe.Account.retrieve(user.stripe_account_id)
            
            # Update user record based on Stripe account status
            if account.charges_enabled and account.payouts_enabled:
                user.stripe_account_status = 'active'
                user.stripe_onboarding_completed = True
                user.stripe_capabilities_enabled = True
                user.seller_verification_level = 'verified'
                
                # Configure payout schedule for newly verified sellers
                payout_result = self.configure_seller_payout_schedule(
                    user.stripe_account_id, 
                    7  # 7-day hold period
                )
                
            elif account.details_submitted:
                user.stripe_account_status = 'restricted'
                user.stripe_onboarding_completed = False
                user.stripe_capabilities_enabled = False
            else:
                user.stripe_account_status = 'pending'
                user.stripe_onboarding_completed = False
                user.stripe_capabilities_enabled = False
            
            # Update requirements
            if hasattr(account, 'requirements') and account.requirements.currently_due:
                import json
                user.stripe_requirements_due = json.dumps(account.requirements.currently_due)
            else:
                user.stripe_requirements_due = None
            
            try:
                db.session.commit()
            except Exception as db_error:
                db.session.rollback()
                return {'success': False, 'error': f'Failed to save account status: {str(db_error)}'}
            
            return {
                'success': True,
                'has_account': True,
                'account_id': user.stripe_account_id,
                'status': user.stripe_account_status,
                'onboarding_completed': user.stripe_onboarding_completed,
                'capabilities_enabled': user.stripe_capabilities_enabled,
                'can_accept_payments': user.can_accept_payments(),
                'requirements_due': account.requirements.currently_due if hasattr(account, 'requirements') else None,
                'business_type': account.business_type,
                'country': account.country
            }
            
        except stripe.error.StripeError as e:
            return {'success': False, 'error': f'Stripe error: {str(e)}'}
        except Exception as e:
            return {'success': False, 'error': f'Status check failed: {str(e)}'}
    
    def create_dashboard_link(self, user_id: int) -> Dict:
        """Create Stripe Express Dashboard login link for sellers"""
        try:
            user = User.query.get(user_id)
            if not user or not user.stripe_account_id:
                return {'success': False, 'error': 'No Stripe account found'}
            
            if not user.can_accept_payments():
                return {'success': False, 'error': 'Account not ready for dashboard access'}
            
            # Create login link for Express Dashboard
            login_link = stripe.Account.create_login_link(user.stripe_account_id)
            
            return {
                'success': True,
                'dashboard_url': login_link.url,
                'expires_at': datetime.utcnow().timestamp() + 300  # Links expire in 5 minutes
            }
            
        except stripe.error.StripeError as e:
            return {'success': False, 'error': f'Dashboard link creation failed: {str(e)}'}
    
    def get_account_balance(self, user_id: int) -> Dict:
        """Get seller's Stripe account balance"""
        try:
            user = User.query.get(user_id)
            if not user or not user.stripe_account_id:
                return {'success': False, 'error': 'No Stripe account found'}
            
            if not user.can_accept_payments():
                return {'success': False, 'error': 'Account not ready for balance access'}
            
            # Retrieve balance from seller's Stripe account
            balance = stripe.Balance.retrieve(stripe_account=user.stripe_account_id)
            
            return {
                'success': True,
                'balance': {
                    'available': balance.available,
                    'pending': balance.pending,
                    'instant_available': getattr(balance, 'instant_available', None)
                }
            }
            
        except stripe.error.StripeError as e:
            return {'success': False, 'error': f'Balance retrieval failed: {str(e)}'}
    
    def get_account_transactions(self, user_id: int, limit: int = 10) -> Dict:
        """Get seller's recent transactions"""
        try:
            user = User.query.get(user_id)
            if not user or not user.stripe_account_id:
                return {'success': False, 'error': 'No Stripe account found'}
            
            if not user.can_accept_payments():
                return {'success': False, 'error': 'Account not ready for transaction access'}
            
            # Retrieve recent balance transactions
            transactions = stripe.BalanceTransaction.list(
                stripe_account=user.stripe_account_id,
                limit=limit
            )
            
            return {
                'success': True,
                'transactions': [
                    {
                        'id': txn.id,
                        'amount': txn.amount,
                        'currency': txn.currency,
                        'description': txn.description,
                        'fee': txn.fee,
                        'net': txn.net,
                        'status': txn.status,
                        'type': txn.type,
                        'created': txn.created
                    }
                    for txn in transactions.data
                ]
            }
            
        except stripe.error.StripeError as e:
            return {'success': False, 'error': f'Transaction retrieval failed: {str(e)}'}
    
    def update_account_information(self, user_id: int, account_data: Dict) -> Dict:
        """Update seller's account information"""
        try:
            user = User.query.get(user_id)
            if not user or not user.stripe_account_id:
                return {'success': False, 'error': 'No Stripe account found'}
            
            # Update account with provided data
            updated_account = stripe.Account.modify(
                user.stripe_account_id,
                **account_data
            )
            
            # Refresh our local user data
            status_result = self.check_account_status(user_id)
            
            return {
                'success': True,
                'message': 'Account information updated',
                'account_status': status_result.get('status') if status_result['success'] else 'unknown'
            }
            
        except stripe.error.StripeError as e:
            return {'success': False, 'error': f'Account update failed: {str(e)}'}
        except Exception as e:
            return {'success': False, 'error': f'Update failed: {str(e)}'}
    
    def delete_account(self, user_id: int) -> Dict:
        """Delete seller's Stripe account (use with caution)"""
        try:
            # Ensure clean session state
            try:
                db.session.rollback()
            except Exception:
                pass

            user = User.query.get(user_id)
            if not user or not user.stripe_account_id:
                return {'success': False, 'error': 'No Stripe account found'}
            
            # Delete the Stripe account
            stripe.Account.delete(user.stripe_account_id)
            
            # Update user record
            try:
                user.stripe_account_id = None
                user.stripe_account_status = 'pending'
                user.stripe_onboarding_completed = False
                user.stripe_capabilities_enabled = False
                user.seller_verification_level = 'unverified'
                user.stripe_requirements_due = None
                user.is_seller = False
                db.session.commit()
            except Exception as db_error:
                db.session.rollback()
                return {'success': False, 'error': f'Failed to persist deletion: {str(db_error)}'}
            
            return {
                'success': True,
                'message': 'Stripe account deleted successfully'
            }
            
        except stripe.error.StripeError as e:
            return {'success': False, 'error': f'Account deletion failed: {str(e)}'}
        except Exception as e:
            return {'success': False, 'error': f'Deletion failed: {str(e)}'} 