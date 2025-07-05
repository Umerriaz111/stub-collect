# Stripe Integration Testing Checklist

## Project: Stub Collector - Stripe Connect Direct Charges
**Created:** December 2024

---

## Phase 1: Foundation Testing ✅ COMPLETED

### Environment Testing
- [x] Stripe package imports successfully
- [x] Flask-Limiter package imports successfully  
- [x] Flask app initializes with rate limiter
- [x] Configuration files load correctly
- [ ] Local .env file with real Stripe keys (pending user setup)

---

## Phase 2: Database & Model Testing (PENDING)

### Model Creation Testing
- [ ] User model migrations apply successfully
- [ ] StubListing model migrations apply successfully
- [ ] StubOrder model creates correctly
- [ ] StubPayment model creates correctly
- [ ] Model relationships work correctly

### Model Method Testing
- [ ] User.can_accept_payments() method
- [ ] User.get_liability_status() method
- [ ] StubListing.can_be_purchased() method
- [ ] StubListing.reserve_for_payment() method
- [ ] StubOrder.from_listing() class method
- [ ] StubPayment.get_liability_status() method

---

## Phase 3: Service Layer Testing (PENDING)

### DirectChargesService Testing
- [ ] Service initialization
- [ ] Webhook security validation
- [ ] Seller eligibility validation
- [ ] Payment intent creation
- [ ] Payment processing
- [ ] Refund processing

### StripeConnectService Testing
- [ ] Express account creation
- [ ] Account link generation
- [ ] Account status checking
- [ ] Payout configuration

---

## Phase 4: API Routes Testing (PENDING)

### Seller Onboarding Routes
- [ ] POST /api/payments/connect/onboard
- [ ] GET /api/payments/onboard/return
- [ ] GET /api/payments/onboard/refresh

### Payment Processing Routes
- [ ] POST /api/payments/create-payment-intent
- [ ] POST /api/payments/webhook
- [ ] POST /api/payments/orders/<id>/complete
- [ ] POST /api/payments/orders/<id>/refund

### Dashboard Routes
- [ ] GET /api/payments/connect/dashboard
- [ ] GET /api/payments/connect/balance
- [ ] GET /api/payments/connect/status

---

## Phase 5: Security Testing (PENDING)

### Webhook Security
- [ ] IP validation works
- [ ] Signature verification works
- [ ] Timestamp validation prevents replay attacks
- [ ] Invalid requests properly rejected

### Payment Security
- [ ] Server-side price verification
- [ ] User authorization checks
- [ ] Payment amount validation
- [ ] Rate limiting prevents abuse

---

## Phase 6: Integration Testing (PENDING)

### End-to-End Payment Flow
- [ ] Seller onboarding complete flow
- [ ] Payment intent creation → completion
- [ ] Order completion flow
- [ ] Refund processing flow

### Existing Functionality
- [ ] Stub upload still works
- [ ] Marketplace browsing still works
- [ ] User authentication still works
- [ ] No conflicts with existing routes

---

## Phase 7: Production Testing (PENDING)

### Pre-Production
- [ ] Database migrations in staging
- [ ] Webhook endpoint accessible
- [ ] SSL/TLS certificate valid
- [ ] Environment variables set

### Production Validation
- [ ] Real Stripe account onboarding
- [ ] Live payment processing test
- [ ] Webhook delivery verification
- [ ] Performance monitoring active

---

## Testing Tools & Commands

### Local Testing Commands
```bash
# Test package imports
python -c "import stripe; import flask_limiter; print('Packages OK')"

# Test Flask app initialization  
python -c "from app import create_app; app = create_app(); print('App OK')"

# Test database migrations
flask db migrate -m "Test migration"
flask db upgrade

# Test webhook with Stripe CLI
stripe listen --forward-to localhost:5000/api/payments/webhook
```

### Manual Testing Scenarios
1. **Happy Path:** Complete seller onboarding → create listing → buyer purchase → completion
2. **Error Cases:** Invalid payment attempts, network failures, validation errors
3. **Security:** Webhook tampering, rate limit testing, unauthorized access
4. **Edge Cases:** Concurrent payments, expired reservations, partial refunds

---

## Test Data Requirements

### Test Accounts Needed
- [ ] Seller test account (Stripe Express)
- [ ] Buyer test account (platform user)
- [ ] Admin test account (platform admin)

### Test Payment Methods
- [ ] Test credit card numbers
- [ ] Various currencies (USD focus)
- [ ] Different payment amounts

### Test Webhooks
- [ ] payment_intent.succeeded
- [ ] account.updated  
- [ ] payout.paid
- [ ] charge.dispute.created

---

*Testing checklist will be updated as implementation progresses* 