# Stub Collector - Comprehensive Testing Checklist

This document provides a detailed checklist for testing the Stub Collector application, with a strong focus on the Stripe integration.

---

## 1. Model and Database Testing

### 1.1. User Model (`user.py`)
- [x] **Stripe Account ID:**
    - [x] Verify `stripe_account_id` is stored correctly after successful seller onboarding.
    - [x] Test that a user without a Stripe account has a `NULL` `stripe_account_id`.
- [x] **Account Status:**
    - [x] Check if `stripe_account_status` defaults to `pending`.
    - [x] Verify the status updates to `active` after successful onboarding and to `restricted` if there are issues.
- [x] **Onboarding and Capabilities:**
    - [x] Ensure `stripe_onboarding_completed` and `stripe_capabilities_enabled` are `False` by default and `True` after successful onboarding.
- [x] **Methods:**
    - [x] Test `can_accept_payments()`:
        - [x] Returns `True` for a fully onboarded seller.
        - [x] Returns `False` for a new user, a user with incomplete onboarding, or a restricted account.
    - [x] Test `get_liability_status()` returns correct liability information.
    - [x] Test `to_public_profile()` includes the correct seller verification status.

### 1.2. StubListing Model (`stub_listing.py`)
- [x] **Payment Fields:**
    - [x] Confirm `payment_required` defaults to `True`.
    - [x] Verify `stripe_product_id` is stored if used.
- [x] **Reservation Logic:**
    - [x] `reserve_for_payment()`:
        - [x] Sets `status` to `payment_pending`.
        - [x] Correctly sets `reserved_by_user_id` and `reserved_until`.
    - [x] `release_reservation()`:
        - [x] Resets `status` to `active`.
        - [x] Clears reservation fields.
- [x] **Purchase Logic:**
    - [x] `can_be_purchased()`:
        - [x] Returns `True` for an active listing with a payable seller.
        - [x] Returns `False` for a sold, pending, or cancelled listing.
        - [x] Returns `False` if the seller cannot accept payments.
- [x] **`mark_as_sold()`:**
    - [x] Correctly updates the listing's status and `sold_at` timestamp.

### 1.3. StubOrder Model (`stub_order.py`)
- [x] **Order Creation:**
    - [x] `from_listing()`:
        - [x] Correctly creates an order from a valid listing.
        - [x] Raises a `ValueError` if the listing cannot be purchased.
        - [x] Calculates `total_amount_cents`, `platform_fee_cents`, and `seller_amount_cents` correctly.
        - [x] Shifts liability to the seller if they are eligible.
- [x] **Status Synchronization:**
    - [x] `sync_with_listing_status()`:
        - [x] Correctly updates the associated `StubListing` when an order is completed, cancelled, or refunded.
- [x] **Fees and Payouts:**
    - [x] `calculate_fees()` correctly computes the platform fee.
    - [x] `get_expected_payout_date()` returns the correct date.

### 1.4. StubPayment Model (`stub_payment.py`)
- [x] **Payment Record Creation:**
    - [x] Ensure a `StubPayment` record is created for each payment intent.
    - [x] Verify all Stripe IDs (`payment_intent_id`, `charge_id`, etc.) are stored.
- [x] **Liability Status:**
    - [x] `get_liability_status()`:
        - [x] Correctly reports whether liability was shifted to the seller.
- [x] **Amount Calculation:**
    - [x] `get_net_platform_amount()` and `get_seller_payout_amount()` return the correct amounts.

---

## 2. Service Layer Testing

### 2.1. DirectChargesService (`direct_charges_service.py`)
- [x] **Seller Eligibility:**
    - [x] `validate_seller_eligibility()`:
        - [x] Returns `True` for an eligible seller.
        - [x] Returns `False` and the correct reason for an ineligible seller.
- [x] **Payment Intent Creation:**
    - [x] `create_direct_charge_payment_intent()`:
        - [x] Creates a Stripe PaymentIntent with the correct amount, currency, and fees.
        - [x] Correctly sets the `on_behalf_of` and `transfer_group` for direct charges.
        - [x] Returns a `client_secret` to the frontend.
        - [x] Returns an error if the listing is not purchasable or the seller is ineligible.
- [x] **Payment Handling:**
    - [x] `handle_successful_payment()`:
        - [x] Updates the `StubPayment` and `StubOrder` statuses to `completed`.
        - [x] Syncs the `StubListing` status.
        - [x] Is idempotent (can be called multiple times for the same payment without causing issues).
- [x] **Refunds:**
    - [x] `process_refund()`:
        - [x] Creates a refund in Stripe.
        - [x] Correctly reverses the transfer and application fee.
        - [x] Updates the statuses of the `StubPayment`, `StubOrder`, and `StubListing`.

### 2.2. StripeConnectService (`stripe_connect_service.py`)
- [x] **Account Creation:**
    - [x] `create_express_account()`:
        - [x] Creates a new Stripe Express account.
        - [x] Generates and returns a valid onboarding URL.
        - [x] Stores the new `stripe_account_id` on the `User` model.
- [x] **Account Status:**
    - [x] `check_account_status()`:
        - [x] Correctly fetches and updates the user's Stripe account status.
- [x] **Dashboard Access:**
    - [x] `create_dashboard_link()` generates a valid login link for an eligible seller.

---

## 3. API Route Testing (`direct_charges_payments.py`, etc.)

For each endpoint, test:
- **Happy Path:** The expected successful response (200 OK).
- **Authentication/Authorization:** The endpoint is protected and only accessible by the correct users (e.g., buyer, seller, admin).
- **Input Validation:** Invalid or missing data in the request body or URL results in a 4xx error.
- **Error Handling:** The API returns a meaningful error message if an internal error occurs (5xx).

### 3.1. Seller Onboarding
- [x] `POST /api/payments/connect/onboard`
- [x] `GET /api/payments/onboard/return`
- [x] `GET /api/payments/onboard/refresh`

### 3.2. Payment Flow
- [x] `POST /api/payments/create-payment-intent`
- [x] `POST /api/payments/webhook` (see Stripe Integration Testing section)
- [x] `POST /api/payments/orders/<id>/complete`
- [x] `POST /api/payments/orders/<id>/refund`

### 3.3. Seller Dashboard
- [x] `GET /api/payments/connect/dashboard`
- [x] `GET /api/payments/connect/balance`
- [x] `GET /api/payments/connect/status`

---

## 4. Stripe Integration Testing

- [x] **Webhook Handler (`/api/payments/webhook`):**
    - [x] **Signature Verification:** Rejects requests with an invalid Stripe signature.
    - [x] **Timestamp Verification:** Rejects requests with a timestamp that is too old (prevents replay attacks).
    - [x] **IP Validation:** Rejects requests from non-Stripe IP addresses.
    - [x] **Event Handling:**
        - [x] `payment_intent.succeeded`: Triggers `handle_successful_payment()`.
        - [x] `account.updated`: Updates the seller's account status in the database.
        - [x] `payout.paid` / `payout.failed`: Logs payout events correctly.
        - [x] `charge.dispute.created`: Handles disputes correctly.
- [x] **Test with Stripe CLI:** Use `stripe listen` to forward events to the local webhook endpoint and test various scenarios.

---

## 5. Security Testing

- [x] **Rate Limiting:**
    - [x] Verify that the rate limits defined in `app/__init__.py` are being enforced on the payment routes.
    - [x] Test that exceeding the rate limit returns a `429 Too Many Requests` error.
- [x] **Data Exposure:**
    - [x] Ensure that no sensitive information (e.g., Stripe secret keys, user password hashes) is ever exposed in API responses.
- [x] **Authorization:**
    - [x] A user cannot create a payment for another user.
    - [x] A user cannot complete an order they did not purchase.
    - [x] Only authorized users (admin, buyer) can initiate a refund.

---

## 6. End-to-End Flow Testing

### 6.1. Successful Purchase
1. [x] A new user signs up.
2. [x] The user onboards as a seller via the Stripe Express flow.
3. [x] The seller creates a `StubListing`.
4. [x] A different user (the buyer) views the listing.
5. [x] The buyer initiates a purchase, and a `PaymentIntent` is created.
6. [x] The buyer completes the payment on the frontend.
7. [x] The backend receives the `payment_intent.succeeded` webhook from Stripe.
8. [x] The `StubOrder`, `StubPayment`, and `StubListing` are all updated to reflect the successful purchase.
9. [x] The buyer marks the order as complete.
10. [x] The seller can view their balance in the Stripe Express Dashboard.

### 6.2. Failed Payment
1. [x] A buyer attempts to purchase a listing but the payment fails (e.g., declined card).
2. [x] The `StubListing` reservation is released, and its status returns to `active`.
3. [x] The `StubOrder` is marked as `cancelled`.

### 6.3. Refund
1. [x] After a successful purchase, the buyer requests a refund.
2. [x] An admin or the buyer initiates a refund via the API.
3. [x] A refund is created in Stripe, and the transfer and application fee are reversed.
4. [x] The statuses of the `StubPayment`, `StubOrder`, and `StubListing` are updated to reflect the refund. 