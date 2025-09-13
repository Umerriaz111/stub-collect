# 🚀 Stub Collector - Frontend Integration Guide (CORRECTED)
## Stripe Connect Seller Onboarding & Payment System

### 📋 Table of Contents
1. [Overview](#overview)
2. [Authentication System](#authentication-system)
3. [Seller Onboarding Flow](#seller-onboarding-flow)
4. [Payment Integration](#payment-integration)
5. [API Reference](#api-reference)
6. [Error Handling](#error-handling)
7. [Testing Guide](#testing-guide)
8. [UI/UX Guidelines](#uiux-guidelines)

---

## 🎯 Overview

This guide covers implementing the frontend for **Stub Collector's Stripe Connect marketplace** with:
- **Seller onboarding** with Stripe Express accounts
- **Payment processing** with Direct Charges
- **Seller liability** for chargebacks
- **7-day payout hold** for buyer protection

### **Tech Stack Requirements**
- **Frontend Framework**: React/Vue/Angular (your choice)
- **HTTP Client**: Axios/Fetch API
- **Stripe SDK**: `@stripe/stripe-js`
- **State Management**: Redux/Vuex/Context (recommended)

### **Base API URL**
```javascript
const API_BASE_URL = 'http://localhost:5000/api';
const AUTH_BASE_URL = 'http://localhost:5000/auth';
```

---

## 🔐 Authentication System

### **Login Flow (CORRECTED)**
```javascript
// ✅ CORRECTED: Login response structure matches backend
const loginUser = async (email, password) => {
  try {
    const response = await fetch(`${AUTH_BASE_URL}/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include', // Important for session cookies
      body: JSON.stringify({ email, password })
    });
    
    const data = await response.json();
    
    if (data.status === 'success') {
      // ✅ CORRECTED: Backend only returns username, not full user object
      return { 
        success: true, 
        username: data.data.username,
        message: data.message 
      };
    } else {
      return { success: false, error: data.message };
    }
  } catch (error) {
    return { success: false, error: 'Network error' };
  }
};

// Usage Example
const handleLogin = async () => {
  const result = await loginUser('test_seller@example.com', 'testpass123');
  if (result.success) {
    // ✅ CORRECTED: Only username is available
    setUsername(result.username);
    navigate('/dashboard');
  } else {
    setError(result.error);
  }
};
```

### **Registration Flow (CORRECTED)**
```javascript
// ✅ CORRECTED: Registration response structure
const registerUser = async (username, email, password) => {
  try {
    const response = await fetch(`${AUTH_BASE_URL}/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({ username, email, password })
    });
    
    const data = await response.json();
    
    if (data.status === 'success') {
      return { 
        success: true, 
        username: data.data.username,
        message: data.message 
      };
    } else {
      return { success: false, error: data.message };
    }
  } catch (error) {
    return { success: false, error: 'Registration failed' };
  }
};
```

---

## 🏪 Seller Onboarding Flow

### **Step 1: Check Seller Status (CORRECTED)**
```javascript
// ✅ CORRECTED: Account info structure matches backend
const checkSellerStatus = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/payments/connect/status`, {
      method: 'GET',
      credentials: 'include'
    });
    
    const data = await response.json();
    
    if (data.status === 'success') {
      return {
        hasAccount: data.account_info.has_account,
        accountStatus: data.account_info.status,
        canAcceptPayments: data.account_info.can_accept_payments,
        onboardingCompleted: data.account_info.onboarding_completed,
        // ✅ ADDED: Additional fields from backend
        capabilitiesEnabled: data.account_info.capabilities_enabled,
        requirementsDue: data.account_info.requirements_due
      };
    }
    
    return { hasAccount: false };
  } catch (error) {
    console.error('Error checking seller status:', error);
    return { hasAccount: false, error: error.message };
  }
};
```

### **Step 2: Start Stripe Onboarding (CORRECTED)**
```javascript
// ✅ CORRECTED: Response structure matches backend
const startStripeOnboarding = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/payments/connect/onboard`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include'
    });
    
    const data = await response.json();
    
    if (data.status === 'success') {
      // ✅ CORRECTED: Backend returns account_id, not accountId
      return { 
        success: true, 
        onboardingUrl: data.onboarding_url,
        accountId: data.account_id 
      };
    } else {
      return { success: false, error: data.message };
    }
  } catch (error) {
    return { success: false, error: 'Onboarding initialization failed' };
  }
};
```

### **Step 3: Handle Onboarding Return (CORRECTED)**
```javascript
// ✅ CORRECTED: Response structure matches backend
const handleOnboardingReturn = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/payments/onboard/return`, {
      method: 'GET',
      credentials: 'include'
    });
    
    const data = await response.json();
    
    if (data.status === 'success') {
      return {
        success: true,
        accountStatus: data.account_status,
        canAcceptPayments: data.can_accept_payments,
        message: data.message
      };
    } else {
      return { success: false, error: data.message };
    }
  } catch (error) {
    return { success: false, error: 'Return processing failed' };
  }
};
```

---

## 💳 Payment Integration

### **Step 1: Install Stripe JavaScript SDK**
```bash
npm install @stripe/stripe-js
```

### **Step 2: Initialize Stripe**
```javascript
import { loadStripe } from '@stripe/stripe-js';

// ✅ CORRECTED: Use your actual public key
const stripePromise = loadStripe('pk_test_YOUR_ACTUAL_STRIPE_PUBLIC_KEY');
```

### **Step 3: Create Payment Intent (CORRECTED)**
```javascript
// ✅ CORRECTED: Response structure matches backend
const createPaymentIntent = async (listingId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/payments/create-payment-intent`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({ listing_id: listingId })
    });
    
    const data = await response.json();
    
    if (data.status === 'success') {
      return {
        success: true,
        clientSecret: data.client_secret,
        paymentIntentId: data.payment_intent_id,
        orderId: data.order_id,
        liabilityShifted: data.liability_shifted,
        payoutScheduleDays: data.payout_schedule_days
      };
    } else {
      return { 
        success: false, 
        error: data.message,
        // ✅ ADDED: Backend may return seller requirements
        sellerRequirements: data.seller_requirements
      };
    }
  } catch (error) {
    return { success: false, error: 'Payment creation failed' };
  }
};
```

### **Step 4: Get Marketplace Listings (CORRECTED)**
```javascript
// ✅ CORRECTED: Response structure matches backend
const getMarketplaceListings = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/marketplace/listings`, {
      method: 'GET',
      credentials: 'include'
    });
    
    const data = await response.json();
    
    if (data.status === 'success') {
      return {
        success: true,
        listings: data.data.map(listing => ({
          ...listing,
          // ✅ CORRECTED: Backend uses payment_integration structure
          canPurchase: listing.payment_integration.can_purchase,
          purchaseStatusReason: listing.payment_integration.purchase_status_reason,
          sellerVerified: listing.payment_integration.seller_verified,
          paymentEnabled: listing.payment_integration.payment_enabled
        })),
        // ✅ ADDED: Backend includes filters_applied
        filtersApplied: data.filters_applied
      };
    }
    
    return { success: false, error: data.message };
  } catch (error) {
    return { success: false, error: 'Failed to load listings' };
  }
};
```

---

## 📚 API Reference (CORRECTED)

### **Authentication Endpoints**
| Method | Endpoint | Purpose | Required Data | Response |
|--------|----------|---------|---------------|----------|
| POST | `/auth/register` | User registration | `{username, email, password}` | `{status, message, data: {username}}` |
| POST | `/auth/login` | User login | `{email, password}` | `{status, message, data: {username}}` |
| POST | `/auth/logout` | User logout | None | `{status, message}` |

### **Seller Onboarding Endpoints**
| Method | Endpoint | Purpose | Response |
|--------|----------|---------|----------|
| POST | `/api/payments/connect/onboard` | Start onboarding | `{status, onboarding_url, account_id}` |
| GET | `/api/payments/connect/status` | Check account status | `{status, account_info: {...}}` |
| GET | `/api/payments/onboard/return` | Handle onboarding return | `{status, account_status, can_accept_payments, message}` |
| GET | `/api/payments/onboard/refresh` | Refresh onboarding | `{status, onboarding_url}` |
| GET | `/api/payments/connect/dashboard` | Get Stripe dashboard link | `{status, dashboard_url, expires_at}` |

### **Payment Endpoints**
| Method | Endpoint | Purpose | Required Data | Response |
|--------|----------|---------|---------------|----------|
| POST | `/api/payments/create-payment-intent` | Create payment | `{listing_id}` | `{status, client_secret, payment_intent_id, order_id, liability_shifted, payout_schedule_days}` |
| POST | `/api/payments/orders/{id}/complete` | Mark order complete | None | `{status, message, order_status, payout_note}` |
| POST | `/api/payments/orders/{id}/refund` | Process refund | `{reason}` | `{status, refund_id, amount_refunded_cents, refund_status}` |
| GET | `/api/payments/connect/balance` | Get seller balance | None | `{status, balance: {...}}` |

### **Marketplace Endpoints (CORRECTED)**
| Method | Endpoint | Purpose | Required Data | Response |
|--------|----------|---------|---------------|----------|
| GET | `/api/marketplace/listings` | Get all listings | Query: `status`, `payment_enabled` | `{status, data: [...], filters_applied}` |
| GET | `/api/marketplace/listings/{id}` | Get specific listing | None | `{status, data: {...}}` |
| POST | `/api/marketplace/list` | Create listing | `{stub_id, asking_price, currency, description?}` | `{status, message, data: {...}}` |
| GET | `/api/marketplace/my-listings` | Get user's listings | None | `{status, data: [...], seller_payment_status}` |
| PUT | `/api/marketplace/listings/{id}` | Update listing | `{asking_price?, currency?, description?}` | `{status, message, data: {...}}` |
| DELETE | `/api/marketplace/listings/{id}` | Cancel listing | None | `{status, message, data: {...}}` |

### **Additional Endpoints (MISSING FROM ORIGINAL GUIDE)**
| Method | Endpoint | Purpose | Response |
|--------|----------|---------|----------|
| GET | `/api/marketplace/sellers/{id}` | Get seller profile | `{status, data: {...}}` |
| GET | `/api/marketplace/sellers/{id}/listings` | Get seller's listings | `{status, data: {...}}` |
| GET | `/api/marketplace/my-orders` | Get user's orders | `{status, data: {purchases: [...], sales: [...]}}` |
| GET | `/api/marketplace/payment-compatibility` | Get payment system info | `{status, data: {...}}` |
| GET | `/api/payments/health` | Health check | `{status, message, services: {...}}` |

---

## ⚠️ Error Handling (CORRECTED)

### **Error Response Format**
```javascript
// ✅ CORRECTED: All backend errors use this structure
{
  "status": "error",
  "message": "Error description",
  "error"?: "Additional error details" // Optional
}
```

### **Common Error Handling**
```javascript
// ✅ CORRECTED: Handle actual error responses
const handleApiError = (data, response) => {
  if (response.status === 401) {
    // Redirect to login
    window.location.href = '/login';
    return 'Please log in to continue';
  }
  
  if (response.status === 403) {
    return 'You do not have permission for this action';
  }
  
  if (response.status === 429) {
    return 'Too many requests. Please wait and try again';
  }
  
  if (response.status >= 500) {
    return 'Server error. Please try again later';
  }
  
  return data.message || 'An error occurred';
};
```

---

## 🧪 Testing Guide (CORRECTED)

### **Test Data Available**
```javascript
// ✅ CORRECTED: Actual test data from backend
const TEST_SELLER = {
  username: 'test_seller',
  email: 'test_seller@example.com',
  password: 'testpass123'
};

// ✅ CORRECTED: Actual test listings created by backend
const TEST_LISTINGS = [
  { title: 'Taylor Swift Eras Tour 2024', price: 150.00, currency: 'USD' },
  { title: 'Lakers vs Warriors - NBA Finals', price: 250.00, currency: 'USD' },
  { title: 'Broadway Show - Hamilton', price: 200.00, currency: 'USD' }
];
```

### **Stripe Test Cards (VERIFIED)**
```javascript
// ✅ VERIFIED: These are standard Stripe test cards
const STRIPE_TEST_CARDS = {
  SUCCESS: '4242424242424242',
  DECLINED: '4000000000000002',
  EXPIRED: '4000000000000069',
  INSUFFICIENT_FUNDS: '4000000000009995',
  PROCESSING_ERROR: '4000000000000119'
};
```

---

## 🚨 **MAJOR CORRECTIONS SUMMARY**

### **1. Authentication Response Structure**
- **❌ WRONG**: `{success: true, user: data.user}`
- **✅ CORRECT**: `{status: 'success', data: {username: string}}`

### **2. Marketplace Listing Structure**
- **❌ WRONG**: `{can_purchase, purchase_status_reason, seller_verified}`
- **✅ CORRECT**: `{payment_integration: {can_purchase, purchase_status_reason, seller_verified}}`

### **3. Payment Intent Response**
- **❌ WRONG**: Missing `seller_requirements` field
- **✅ CORRECT**: Includes `seller_requirements` when seller not ready

### **4. Endpoint Names**
- **❌ WRONG**: `/api/marketplace/listings` (correct)
- **✅ CORRECT**: `/api/marketplace/list` for creating listings

### **5. Missing Endpoints**
- **❌ MISSING**: 8 additional endpoints not documented
- **✅ ADDED**: Complete endpoint reference

### **6. Error Handling**
- **❌ WRONG**: Generic error structure
- **✅ CORRECT**: Specific `{status: 'error', message: string}` format

---