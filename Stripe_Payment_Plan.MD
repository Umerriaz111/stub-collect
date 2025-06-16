# Flask Marketplace “Hold‑Then‑Release” Payment Flow with Stripe Connect

A complete reference for charging buyers, holding funds in your platform, and releasing or refunding on buyer/admin confirmation.

## 1. Stripe Connect

**What it is:**  
A suite of APIs for marketplaces and platforms to manage sellers (“Connected Accounts”), split payments, and automate payouts.

**Core capabilities:**
- **Onboarding**: Collect KYC/verification information via Express or Custom account flows.  
- **Splitting**: Take an application fee and transfer the remainder to sellers.  
- **Payouts**: Schedule automatic or manual transfers to seller bank accounts.  
- **Funds management**: Hold, release, refund, and dispute funds centrally.

## 2. Stripe Checkout

**What it is:**  
A pre‑built, Stripe‑hosted payment page you configure server‑side. Checkout handles:

- Secure card entry (+ wallets/local methods)  
- SCA (3D Secure) & localization  
- Tax, shipping, and coupon logic (optional)  
- A single **Checkout Session** object & hosted URL → zero PCI‑scope for you

You can pass Connect parameters (or metadata) into Checkout to tie the payment to a seller’s Connected Account.

---

## Hold‑Then‑Release Flow

1. Buyer Checkout

    - Your Flask endpoint calls stripe.checkout.Session.create(...) with the painting price and the seller’s Connected Account ID in metadata.

    - The buyer is redirected to Stripe’s hosted Checkout page.

2. Webhook: Record Charge

    - Stripe emits checkout.session.completed after successful payment.

    - Your /webhook handler retrieves the PaymentIntent and Charge, then saves a pending ChargeRecord in your database, including payment_intent_id, charge_id, amount_cents, fee_cents, and seller_stripe_acct.

3. Buyer/Admin Confirmation

    - In your app or admin panel, when the painting is delivered and accepted, you call your Flask route POST /release-funds/<record_id>.

    - This marks the ChargeRecord as confirmed and issues a stripe.Transfer of (amount_cents – fee_cents) from your platform balance to the seller’s Connected Account.

4. Optional Refund

    - If the buyer complains before release, you call POST /refund/<record_id>, which calls stripe.Refund.create(...) on the PaymentIntent and marks the record as refunded.

---

## 3. High‑Level Flow

1. ### Seller Onboarding (Connect)  
   - **Create a Connected Account** (Express) when a painter signs up:
     ```python
     acct = stripe.Account.create(type="express")
     link = stripe.AccountLink.create(
       account       = acct.id,
       refresh_url   = YOUR_REFRESH_URL,
       return_url    = YOUR_RETURN_URL,
       type          = "account_onboarding"
     )
     # Redirect seller to link.url; store acct.id in your DB.
     ```
   - After KYC, seller’s account is “Ready”.  
   - Optionally configure payout schedule (daily/weekly/manual) or leave manual for full control.

2. ### Buyer Checkout (Checkout + Connect Metadata)  
   - Buyer clicks “Buy”—your backend calls:
     ```python
     session = stripe.checkout.Session.create(
       payment_method_types=["card"],
       mode="payment",
       line_items=[{ ... painting price & details ... }],
       metadata={"seller_stripe_acct": seller_acct_id},
       success_url=YOUR_SUCCESS_URL+"?session_id={CHECKOUT_SESSION_ID}",
       cancel_url=YOUR_CANCEL_URL,
     )
     ```
   - Buyer is redirected to Stripe’s hosted page and completes payment.  
   - **All funds (100%) land in your platform balance.**

3. ### Webhook: Record & Hold Funds  
   - Listen for `checkout.session.completed`.  
   - Retrieve the `PaymentIntent` & its Charge, then save a **pending** record in your DB:
     ```python
     ChargeRecord(
       payment_intent_id, charge_id,
       amount_cents, fee_cents,
       currency, seller_stripe_acct,
       status="pending"
     )
     ```
   - No transfer yet—funds remain in your Stripe account.

4. ### Confirm & Release (Buyer or Admin)  
   - When delivery is confirmed, call:
     ```http
     POST /release-funds/<record_id>
     ```
   - Your endpoint:
     1. Marks `ChargeRecord.buyer_confirmed = True`  
     2. Creates a `stripe.Transfer`:
        ```python
        stripe.Transfer.create(
          amount             = amount_cents - fee_cents,
          currency           = currency,
          destination        = seller_stripe_acct,
          source_transaction = charge_id
        )
        ```
     3. Updates `status="released"`

5. ### Refund Path (optional)  
   - If the buyer complains **before** release:
     ```http
     POST /refund/<record_id>
     ```
   - Your endpoint calls:
     ```python
     stripe.Refund.create(payment_intent=payment_intent_id)
     ```
   - Sets `status="refunded"`

---

## 4. Why This Works

- **Connect** handles seller identity, verification, and payout rails.  
- **Checkout** delivers a turnkey, secure buyer experience.  
- **Hold‑Then‑Release** pattern gives your platform full custody of funds until you choose to transfer or refund.  

---

## 1. Prerequisites & Configuration

1. **Install dependencies**  
   ```bash
   pip install flask stripe flask‑sqlalchemy
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

    app = Flask(__name__)
    app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv('DATABASE_URL')
    app.config['STRIPE_SECRET_KEY']     = os.getenv('STRIPE_SECRET_KEY')
    app.config['STRIPE_WEBHOOK_SECRET'] = os.getenv('STRIPE_WEBHOOK_SECRET')

    db = SQLAlchemy(app)
    stripe.api_key = app.config['STRIPE_SECRET_KEY']
    ```

## 2. Database Model

```
# models.py
from app import db

class ChargeRecord(db.Model):
    id                  = db.Column(db.Integer, primary_key=True)
    payment_intent_id   = db.Column(db.String, unique=True, nullable=False)
    charge_id           = db.Column(db.String, nullable=False)
    amount_cents        = db.Column(db.Integer, nullable=False)
    fee_cents           = db.Column(db.Integer, nullable=False)
    currency            = db.Column(db.String(3), nullable=False)
    seller_stripe_acct  = db.Column(db.String, nullable=False)
    status              = db.Column(db.Enum("pending","released","refunded"), default="pending", nullable=False)
    buyer_confirmed     = db.Column(db.Boolean, default=False, nullable=False)
```

- amount_cents: total paid by buyer
- fee_cents: platform commission
- status: pending → released or refunded

## 3. Creating a Checkout Session

```
# app.py
from flask import request, jsonify, url_for

@app.route("/create-checkout-session", methods=["POST"])
def create_checkout_session():
    data = request.json
    session = stripe.checkout.Session.create(
        payment_method_types=["card"],
        mode="payment",
        line_items=[{
            "price_data": {
                "currency": data["currency"],
                "unit_amount": data["price_cents"],
                "product_data": {"name": data["painting_name"]},
            },
            "quantity": 1,
        }],
        metadata={"seller_stripe_acct": data["seller_account_id"]},
        success_url=url_for("success", _external=True) + "?session_id={CHECKOUT_SESSION_ID}",
        cancel_url=url_for("cancel", _external=True),
    )
    return jsonify({
        "sessionId": session.id,
        "publicKey": app.config['STRIPE_PUBLISHABLE_KEY']
    })
```

- Pass the seller’s Stripe account ID in metadata.

## 4. Webhook: Record the Charge

```
# app.py
@app.route("/webhook", methods=["POST"])
def webhook():
    payload, sig = request.data, request.headers.get("stripe-signature")
    event = stripe.Webhook.construct_event(payload, sig, app.config['STRIPE_WEBHOOK_SECRET'])

    if event.type == "checkout.session.completed":
        sess = event.data.object
        pi   = stripe.PaymentIntent.retrieve(sess.payment_intent)
        ch   = pi.charges.data[0]

        record = ChargeRecord(
            payment_intent_id  = pi.id,
            charge_id          = ch.id,
            amount_cents       = pi.amount,
            fee_cents          = sess.amount_total - (pi.amount - (sess.total_details.amount_tax or 0)),
            currency           = pi.currency,
            seller_stripe_acct = sess.metadata["seller_stripe_acct"],
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
    record = ChargeRecord.query.get_or_404(record_id)

    if record.status != "pending":
        return jsonify({"error": "Already processed"}), 400

    # Mark as confirmed
    record.buyer_confirmed = True

    # Transfer seller’s share
    transfer = stripe.Transfer.create(
        amount             = record.amount_cents - record.fee_cents,
        currency           = record.currency,
        destination        = record.seller_stripe_acct,
        source_transaction = record.charge_id,
    )

    record.status = "released"
    db.session.commit()

    return jsonify({"status": "released", "transfer_id": transfer.id})
```

- Call this when the buyer or admin marks the order complete.

## 6. Optional Refund Endpoint

```
# app.py
@app.route("/refund/<int:record_id>", methods=["POST"])
def refund(record_id):
    record = ChargeRecord.query.get_or_404(record_id)

    if record.status != "pending":
        return jsonify({"error": "Cannot refund"}), 400

    stripe.Refund.create(payment_intent=record.payment_intent_id)
    record.status = "refunded"
    db.session.commit()

    return jsonify({"status": "refunded"})
```

- Use if the buyer complains before release.

## 7. Security & Best Practices

- Authenticate & authorize all endpoints (/release-funds, /refund).
- Validate input data and record existence.
- Verify webhook signatures with STRIPE_WEBHOOK_SECRET.
- Log state changes and API errors for auditing.

## 8. Testing
- Use Stripe test cards (e.g. 4242 4242 4242 4242).
- Run Stripe CLI locally:
    ```
    stripe listen --forward-to localhost:5000/webhook
    stripe trigger checkout.session.completed
    ```
- Simulate both release and refund flows via your API.

