# Flask Marketplace “Hold‑Then‑Release” Payment Flow with Stripe Connect (Revised)
A complete reference for charging buyers, holding funds in your platform, and releasing or refunding on buyer/admin confirmation.

## 1. Stripe Connect
**What it is:**
A suite of APIs for marketplaces and platforms to manage sellers (“Connected Accounts”), split payments, and automate payouts.

Core capabilities:

- Onboarding: Collect KYC/verification information via Express or Custom account flows.
- Splitting: Take an application fee and transfer the remainder to sellers.
- Payouts: Schedule automatic or manual transfers to seller bank accounts.
- Funds management: Hold, release, refund, and dispute funds centrally.

## 2. Stripe Checkout
**What it is:**
A pre‑built, Stripe‑hosted payment page you configure server‑side. Checkout handles:

- Secure card entry (+ wallets/local methods)
- SCA (3D Secure) & localization
- Tax, shipping, and coupon logic (optional)
- A single Checkout Session object & hosted URL → zero PCI‑scope for you
- You can pass Connect parameters (or metadata) into Checkout to tie the payment to a seller’s Connected Account.


## Hold‑Then‑Release Flow
### 1.Buyer Checkout
- Your Flask endpoint calls `stripe.checkout.Session.create(...)` with the painting price. Crucially, you will calculate your platform fee and pass both it and the seller’s Connected Account ID in the `metadata` hash.
- The buyer is redirected to Stripe’s hosted Checkout page.

### 2.Webhook: Record Charge
- Stripe emits `checkout.session.completed` after successful payment.
- Your `/webhook` handler inspects the event. It retrieves the payment_intent_id, the total amount, and your platform fee directly from the session object and its metadata. It also retrieves the Charge ID to be used later.
It saves a pending ChargeRecord in your database.

### 3.Buyer/Admin Confirmation
- In your app or admin panel, when the painting is delivered and accepted, you call your Flask route `POST /release-funds/<record_id>`.
- This marks the ChargeRecord as confirmed and issues a stripe.Transfer of (amount_cents – fee_cents) from your platform balance to the seller’s Connected Account.

### 4.Optional Refund
If the buyer complains before release, you call `POST /refund/<record_id>`, which calls `stripe.Refund.create(...)` on the PaymentIntent and marks the record as refunded.

## 3. High‑Level Flow
### 1.Seller Onboarding (Connect)
- Create a Connected Account (Express) when a painter signs up:
```
acct = stripe.Account.create(type="express")
link = stripe.AccountLink.create(
  account     = acct.id,
  refresh_url = YOUR_REFRESH_URL,
  return_url  = YOUR_RETURN_URL,
  type        = "account_onboarding"
)
# Redirect seller to link.url; store acct.id in your DB.
```

- After KYC, seller’s account is “Ready”.
- Optionally configure payout schedule (daily/weekly/manual) or leave manual for full control.

### 2. Buyer Checkout (Checkout + Connect Metadata)
- Buyer clicks “Buy”—your backend calculates your fee and calls:
```
# Example: Your platform takes a 10% commission
application_fee_cents = int(price_cents * 0.10)

session = stripe.checkout.Session.create(
  payment_method_types=["card"],
  mode="payment",
  line_items=[{ ... painting price & details ... }],
  metadata={
      "seller_stripe_acct": seller_acct_id,
      "application_fee_cents": application_fee_cents
  },
  success_url=YOUR_SUCCESS_URL+"?session_id={CHECKOUT_SESSION_ID}",
  cancel_url=YOUR_CANCEL_URL,
)
```

- Buyer is redirected to Stripe’s hosted page and completes payment.
- All funds (100%) land in your platform balance.

### 3. Webhook: Record & Hold Funds
- Listen for checkout.session.completed.
- Retrieve details from the Session object and its metadata. Then save a pending record in your DB:

```
# pi = stripe.PaymentIntent.retrieve(sess.payment_intent, expand=["latest_charge"])
# ...
ChargeRecord(
  payment_intent_id,
  charge_id=pi.latest_charge.id, # The specific Charge ID
  amount_cents=sess.amount_total,
  fee_cents=int(sess.metadata.get("application_fee_cents", 0)),
  currency=sess.currency,
  seller_stripe_acct=sess.metadata["seller_stripe_acct"],
  status="pending"
)
```
- No transfer yet—funds remain in your Stripe account.

### 4.Confirm & Release (Buyer or Admin)
- When delivery is confirmed, call:
```
POST /release-funds/<record_id>
```

- Your endpoint:
  - Marks ChargeRecord.buyer_confirmed = True
  - Creates a stripe.Transfer with an idempotency key:
  ```
  import uuid
  # ...
  idempotency_key = request.headers.get('X-Idempotency-Key')
  stripe.Transfer.create(
    amount             = record.amount_cents - record.fee_cents,
    currency           = record.currency,
    destination        = record.seller_stripe_acct,
    source_transaction = record.charge_id,
    idempotency_key    = idempotency_key
  )
  ```
  - Updates status="released"

### 5. Refund Path (optional)
- If the buyer complains before release:
```
POST /refund/<record_id>
```
- Your endpoint calls:
```
stripe.Refund.create(payment_intent=payment_intent_id)
```
- Sets status="refunded"

## 4. Why This Works
- Connect handles seller identity, verification, and payout rails.
- Checkout delivers a turnkey, secure buyer experience.
- Hold‑Then‑Release pattern gives your platform full custody of funds until you choose to transfer or refund.
- Metadata reliably tracks your application fee, avoiding complex and fragile calculations.

## 1. Prerequisites & Configuration
  1. Install dependencies
  ```
  pip install flask stripe flask-sqlalchemy
  ```
  2. Environment variables (e.g. in .env or your host’s config)
  ```
  STRIPE_SECRET_KEY=sk_test_…
  STRIPE_PUBLISHABLE_KEY=pk_test_…
  STRIPE_WEBHOOK_SECRET=whsec_…
  DATABASE_URL=postgresql://…
  ```

  3. Flask app setup (app.py)
  ```
  from flask import Flask
  from flask_sqlalchemy import SQLAlchemy
  import stripe
  import os
  import uuid # For idempotency keys

  app = Flask(__name__)
  app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv('DATABASE_URL')
  app.config['STRIPE_SECRET_KEY']      = os.getenv('STRIPE_SECRET_KEY')
  app.config['STRIPE_WEBHOOK_SECRET'] = os.getenv('STRIPE_WEBHOOK_SECRET')

  db = SQLAlchemy(app)
  stripe.api_key = app.config['STRIPE_SECRET_KEY']
  ```

## 2. Database Model
```
# models.py
from app import db

class ChargeRecord(db.Model):
    id                = db.Column(db.Integer, primary_key=True)
    payment_intent_id = db.Column(db.String, unique=True, nullable=False)
    charge_id         = db.Column(db.String, nullable=False)
    amount_cents      = db.Column(db.Integer, nullable=False)
    fee_cents         = db.Column(db.Integer, nullable=False)
    currency          = db.Column(db.String(3), nullable=False)
    seller_stripe_acct= db.Column(db.String, nullable=False)
    status            = db.Column(db.Enum("pending","released","refunded"), default="pending", nullable=False)
    buyer_confirmed   = db.Column(db.Boolean, default=False, nullable=False)
```

- amount_cents: total paid by buyer
- fee_cents: your platform's commission, stored during checkout
- status: pending → released or refunded

## 3. Creating a Checkout Session
```
# app.py
from flask import request, jsonify, url_for

@app.route("/create-checkout-session", methods=["POST"])
def create_checkout_session():
    data = request.json
    price_cents = data["price_cents"]

    # ✅ BEST PRACTICE: Calculate your fee upfront and store it in metadata.
    # Example: A 10% platform fee.
    application_fee_cents = int(price_cents * 0.10)

    session = stripe.checkout.Session.create(
        payment_method_types=["card"],
        mode="payment",
        line_items=[{
            "price_data": {
                "currency": data["currency"],
                "unit_amount": price_cents,
                "product_data": {"name": data["painting_name"]},
            },
            "quantity": 1,
        }],
        metadata={
            "seller_stripe_acct": data["seller_account_id"],
            "application_fee_cents": application_fee_cents
        },
        success_url=url_for("success", _external=True) + "?session_id={CHECKOUT_SESSION_ID}",
        cancel_url=url_for("cancel", _external=True),
    )
    return jsonify({
        "sessionId": session.id,
        "publicKey": app.config['STRIPE_PUBLISHABLE_KEY']
    })
```

- FIXED: Pass your calculated application_fee_cents and the seller’s Stripe account ID in metadata.

## 4. Webhook: Record the Charge
```
# app.py
@app.route("/webhook", methods=["POST"])
def webhook():
    payload, sig = request.data, request.headers.get("stripe-signature")
    try:
        event = stripe.Webhook.construct_event(payload, sig, app.config['STRIPE_WEBHOOK_SECRET'])
    except (ValueError, stripe.error.SignatureVerificationError) as e:
        return "Invalid signature", 400

    if event.type == "checkout.session.completed":
        sess = event.data.object

        # ✅ SIMPLIFIED: Use data directly from the session object where possible.
        # This reduces API calls and simplifies logic.
        pi = stripe.PaymentIntent.retrieve(sess.payment_intent, expand=["latest_charge"])

        record = ChargeRecord(
            payment_intent_id = sess.payment_intent,
            charge_id         = pi.latest_charge.id,
            amount_cents      = sess.amount_total,
            # ✅ FIXED: Retrieve your fee directly from metadata. No fragile calculations.
            fee_cents         = int(sess.metadata.get("application_fee_cents", 0)),
            currency          = sess.currency,
            seller_stripe_acct= sess.metadata["seller_stripe_acct"],
        )
        db.session.add(record)
        db.session.commit()

    return "", 200
```

- Saves a pending ChargeRecord for each completed Checkout Session.

## 5. Release Funds Endpoint
```
# app.py

@app.route("/release-funds/<int:record_id>", methods=["POST"])
def release_funds(record_id):
    # NOTE: Add authentication/authorization here!
    record = ChargeRecord.query.get_or_404(record_id)

    if record.status != "pending":
        return jsonify({"error": f"Cannot release funds for a charge with status '{record.status}'"}), 400

    # ✅ BEST PRACTICE: Use a robust idempotency key
    idempotency_key = request.headers.get('X-Idempotency-Key')

    try:
        # Create the transfer first. If this fails, the DB is not changed.
        transfer = stripe.Transfer.create(
            amount=record.amount_cents - record.fee_cents,
            currency=record.currency,
            destination=record.seller_stripe_acct,
            source_transaction=record.charge_id,
            idempotency_key=idempotency_key
        )

        # ✅ BEST PRACTICE: Only update status after the API call is successful.
        record.status = "released"
        record.buyer_confirmed = True # Set confirmation here
        db.session.commit()

        return jsonify({"status": "released", "transfer_id": transfer.id})

    except stripe.error.StripeError as e:
        # Handle potential Stripe errors (e.g., card declined, account restricted)
        app.logger.error(f"Stripe error during transfer for record {record.id}: {e}")
        return jsonify({"error": str(e)}), 500
    except Exception as e:
        # Handle other unexpected errors
        app.logger.error(f"Unexpected error during transfer for record {record.id}: {e}")
        return jsonify({"error": "An unexpected error occurred."}), 500
```
- Call this when the buyer or admin marks the order complete.

## 6. Optional Refund Endpoint
```
# app.py
@app.route("/refund/<int:record_id>", methods=["POST"])
def refund(record_id):
    # NOTE: Add authentication/authorization here!
    record = ChargeRecord.query.get_or_404(record_id)

    if record.status != "pending":
        return jsonify({"error": f"Cannot refund a charge with status '{record.status}'"}), 400

    try:
        # For partial refunds, you could get an amount from the request body
        # data = request.json
        # amount_to_refund = data.get("amount_cents")

        stripe.Refund.create(
            payment_intent=record.payment_intent_id
            # amount=amount_to_refund # Uncomment for partial refunds
        )

        # Only update the status after the Stripe API call succeeds
        record.status = "refunded"
        db.session.commit()

        return jsonify({"status": "refunded"})

    except stripe.error.StripeError as e:
        app.logger.error(f"Stripe error during refund for record {record.id}: {e}")
        return jsonify({"error": str(e)}), 500
    except Exception as e:
        app.logger.error(f"Unexpected error during refund for record {record.id}: {e}")
        return jsonify({"error": "An unexpected error occurred."}), 500
```

- Use if the buyer complains before release.

## 7. Security & Best Practices
- Authenticate & authorize all endpoints (/release-funds, /refund). Ensure only an admin or the correct buyer/seller can trigger these actions.
- Validate input data and record existence.
- Verify webhook signatures with STRIPE_WEBHOOK_SECRET. The code now includes a try...except block for this.
- Log state changes and API errors for auditing.
- Use idempotency keys for critical operations like transfers to prevent duplicate transactions.

-------
# Core Database Models
Based on your marketplace requirements and the "Hold-Then-Release" payment flow, here is a recommended database schema with the necessary models, their relationships, and an explanation of how they work together.

This structure is designed to be robust, scalable, and to clearly separate concerns within your application. We will use a classic e-commerce pattern with four primary models: User, Painting, Order, and Payment.

## 1. User Model
- This model will store information about both buyers and sellers (painters). A simple boolean flag (is_seller) will differentiate them.
```
# models.py
from app import db
from datetime import datetime

class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    full_name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(128))
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    # --- Seller-specific fields ---
    is_seller = db.Column(db.Boolean, default=False, nullable=False)
    stripe_account_id = db.Column(db.String(100), unique=True, nullable=True)
    stripe_account_status = db.Column(db.String(20), default="pending", nullable=True) # e.g., 'pending', 'active', 'restricted'

    # --- Relationships ---
    # A seller has many paintings
    paintings = db.relationship('Painting', backref='seller', lazy='dynamic')
    # A buyer has many orders
    orders = db.relationship('Order', backref='buyer', lazy='dynamic')

    def __repr__(self):
        return f'<User {self.full_name}>'
```

## 2. Painting Model
This model represents the products for sale in your marketplace.
```
# models.py
class Painting(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(200), nullable=False)
    description = db.Column(db.Text, nullable=True)
    image_url = db.Column(db.String(255), nullable=False)
    
    # BEST PRACTICE: Store monetary values as integers (in cents) to avoid floating-point errors
    price_cents = db.Column(db.Integer, nullable=False)
    currency = db.Column(db.String(3), nullable=False, default="usd")
    
    is_sold = db.Column(db.Boolean, default=False, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    # --- Relationships ---
    # The 'seller' is the User who owns this painting
    seller_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    
    # A painting can be part of one order
    order = db.relationship('Order', backref='painting', uselist=False)

    def __repr__(self):
        return f'<Painting {self.title}>'
```

## 3. Order Model
This model acts as a record of a purchase, linking a buyer to a specific painting. It tracks the fulfillment status of the transaction (e.g., has it been shipped?).
```
# models.py
class Order(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Tracks the fulfillment/delivery status
    order_status = db.Column(db.Enum("processing", "shipped", "delivered", "cancelled", name="order_status_enum"), default="processing", nullable=False)

    # --- Relationships ---
    buyer_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    painting_id = db.Column(db.Integer, db.ForeignKey('painting.id'), unique=True, nullable=False) # An item can only be sold once

    # An order has one associated payment
    payment = db.relationship('Payment', backref='order', uselist=False)

    def __repr__(self):
        return f'<Order {self.id}>'
```

## 4. Payment Model
This model is the evolution of your ChargeRecord. It is laser-focused on the financial status of an order, tracking everything from the initial charge to the final payout.

```
# models.py
class Payment(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    
    # --- Stripe Identifiers ---
    payment_intent_id = db.Column(db.String, unique=True, nullable=False)
    charge_id = db.Column(db.String, nullable=True) # Populated from webhook
    transfer_id = db.Column(db.String, nullable=True) # Populated on release

    # --- Financial Data ---
    amount_total_cents = db.Column(db.Integer, nullable=False)
    platform_fee_cents = db.Column(db.Integer, nullable=False)
    currency = db.Column(db.String(3), nullable=False)
    
    # Tracks the flow of money
    payment_status = db.Column(db.Enum("pending", "released", "refunded", name="payment_status_enum"), default="pending", nullable=False)

    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # --- Relationships ---
    order_id = db.Column(db.Integer, db.ForeignKey('order.id'), nullable=False)

    def __repr__(self):
        return f'<Payment {self.payment_intent_id}>'
```

### How They Link and Work Together
Here is the step-by-step lifecycle of a transaction, showing how the models interact:

#### 1. Seller Onboarding & Listing:

- A User signs up and enables is_seller = True.
- They complete the Stripe Connect onboarding. Your app listens for the webhook and stores their stripe_account_id in their User record.
- The now-verified seller creates a Painting record. The painting.seller_id links it back to their User.id.

#### 2. Buyer Initiates Checkout:

- A buyer (another User) clicks "Buy" on a Painting.
- Your backend performs these actions in a single database transaction:
- Create an Order record, linking buyer.id and painting.id.
- Create a Payment record, linking it to the new order.id. You populate amount_total_cents, platform_fee_cents, and set payment_status to "pending".
- Generate the Stripe Checkout Session. You can pass the payment.id or order.id in the client_reference_id of the Checkout Session for easy lookup later.
- Mark the Painting as is_sold = True to prevent anyone else from buying it.

#### 3. Webhook Confirms Payment:

- Stripe sends the checkout.session.completed event to your webhook.
- You use the client_reference_id (or retrieve the payment_intent_id from the event) to find the corresponding Payment record in your database.
- You update this Payment record with the charge_id received from the PaymentIntent object. The payment_status remains "pending".

#### 4. Admin/Buyer Confirms Delivery:

- Sometime later, the physical painting is delivered. An admin or the buyer confirms this in your UI.
- This action updates the Order model, changing order_status to "delivered".

#### 5. Releasing Funds:

- The change in order_status (or a separate admin action) triggers your /release-funds/<payment_id> endpoint.
- The endpoint fetches the Payment record.
- It uses the charge_id, amount_total_cents, platform_fee_cents, and the seller's stripe_account_id (retrieved via payment.order.painting.seller.stripe_account_id) to - create the Stripe Transfer.
- Upon a successful API response from Stripe, you update the Payment record:
- Set payment_status to "released".
- Store the transfer.id in the transfer_id field.