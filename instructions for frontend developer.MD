# Frontend Development Guide - Stub Marketplace

## Overview
This is a comprehensive guide for developing the frontend of our Stub Marketplace application. The backend provides a RESTful API for ticket stub collection, AI-powered data extraction, marketplace functionality, and secure payment processing.

## Tech Stack Recommendations
- **React.js** (TypeScript recommended for better type safety)
- **Axios** for API calls
- **React Router** for navigation
- **Stripe.js** for payment processing
- **Material-UI, Tailwind CSS, or similar** for UI components
- **React Hook Form** for form management
- **Context API or Redux** for state management

## Backend Configuration
- **Base URL**: `http://localhost:5000` (development)
- **Authentication**: Session-based (cookies)
- **CORS**: Already configured for `http://localhost:3000`

---

## Authentication System

### Authentication Flow
The application uses session-based authentication with Flask-Login. Users must be authenticated for most operations.

### API Endpoints

#### 1. User Registration
```javascript
POST /auth/register
Content-Type: application/json

{
  "username": "string",
  "email": "string", 
  "password": "string"
}

// Success Response (201)
{
  "status": "success",
  "message": "User registered successfully",
  "data": {
    "username": "user123"
  }
}
```

#### 2. User Login
```javascript
POST /auth/login
Content-Type: application/json

{
  "email": "string",
  "password": "string"
}

// Success Response (200)
{
  "status": "success",
  "message": "Logged in successfully",
  "data": {
    "username": "user123"
  }
}
```

#### 3. User Logout
```javascript
POST /auth/logout
// Requires authentication

// Success Response (200)
{
  "status": "success",
  "message": "Logged out successfully"
}
```

### Frontend Implementation Notes
- Set `credentials: 'include'` in all API calls to maintain session cookies
- Create an authentication context to manage login state
- Implement route guards for protected pages
- Store user info in context/state after successful login

---

## Stub Management System

### Core Functionality
Users can upload ticket stub images, which are processed using AI to extract event information.

### API Endpoints

#### 1. Upload Stub
```javascript
POST /api/stubs/upload
Content-Type: multipart/form-data
// Requires authentication
// Rate Limited: 10 uploads per minute

FormData:
- image: File (PNG, JPG, JPEG - max 5MB)
- title: string (required)

// Success Response (201)
{
  "status": "success",
  "message": "Stub processed successfully",
  "data": {
    "id": 1,
    "title": "Concert Ticket",
    "event_name": "Global Music Fest",
    "event_date": "2025-08-15T19:00:00",
    "venue_name": "Olympic Stadium",
    "ticket_price": 99.99,
    "currency": "USD",
    "seat_info": "Section GA, Row Stand",
    "status": "processed",
    "image_url": "/static/uploads/stubs/1/20231201_143022_ticket.jpg"
  }
}
```

#### 2. Get User's Stubs
```javascript
GET /api/stubs
// Requires authentication

// Success Response (200)
{
  "status": "success",
  "data": [
    {
      "id": 1,
      "title": "Concert Ticket",
      "event_name": "Global Music Fest",
      // ... other stub data
    }
  ]
}
```

#### 3. Get Specific Stub
```javascript
GET /api/stubs/{stub_id}
// Requires authentication

// Success Response (200)
{
  "status": "success",
  "data": {
    "id": 1,
    "title": "Concert Ticket",
    // ... complete stub data
  }
}
```

#### 4. Update Stub (Manual Correction)
```javascript
PUT /api/stubs/{stub_id}
Content-Type: application/json
// Requires authentication

{
  "title": "string",
  "event_name": "string",
  "event_date": "YYYY-MM-DD",
  "venue_name": "string",
  "ticket_price": number,
  "currency": "USD|EUR|JPY|GBP|AUD|CAD|CHF|CNH|HKD|NZD",
  "seat_info": "string"
}
```

### Frontend Implementation Notes
- Use drag-and-drop file upload component
- Show upload progress and processing status
- Display extracted data in editable form for manual corrections
- Implement image preview functionality
- Handle rate limiting with user feedback
- Supported currencies: USD, EUR, JPY, GBP, AUD, CAD, CHF, CNH, HKD, NZD

---

## Marketplace System

### Core Functionality
Users can list their stubs for sale and browse/purchase others' listings.

### API Endpoints

#### 1. Create Listing
```javascript
POST /api/marketplace/list
Content-Type: application/json
// Requires authentication

{
  "stub_id": number,
  "asking_price": number,
  "currency": "string",
  "description": "string" // optional
}

// Success Response (201)
{
  "status": "success",
  "message": "Listing created successfully",
  "data": {
    "id": 1,
    "stub_id": 1,
    "seller_id": 1,
    "asking_price": 150.0,
    "currency": "USD",
    "description": "Great seats!",
    "status": "active",
    "listed_at": "2023-12-01T14:30:22"
  }
}
```

#### 2. Browse All Listings
```javascript
GET /api/marketplace/listings?status=active
// Public endpoint (no auth required)

// Success Response (200)
{
  "status": "success",
  "data": [
    {
      "id": 1,
      "asking_price": 150.0,
      "currency": "USD",
      "description": "Great seats!",
      "status": "active",
      "stub": {
        "event_name": "Global Music Fest",
        "event_date": "2025-08-15T19:00:00",
        "venue_name": "Olympic Stadium",
        "image_url": "/static/uploads/stubs/1/ticket.jpg"
      }
    }
  ]
}
```

#### 3. Get User's Listings
```javascript
GET /api/marketplace/my-listings
// Requires authentication

// Returns array of user's listings with full stub data
```

#### 4. Update Listing
```javascript
PUT /api/marketplace/listings/{listing_id}
Content-Type: application/json
// Requires authentication (must be listing owner)

{
  "asking_price": number,
  "currency": "string",
  "description": "string"
}
```

#### 5. Cancel Listing
```javascript
DELETE /api/marketplace/listings/{listing_id}
// Requires authentication (must be listing owner)
```

### Frontend Implementation Notes
- Create marketplace browse page with filtering options
- Implement listing cards with stub images and details
- Add "List for Sale" functionality on stub detail pages
- Show listing management interface for sellers
- Prevent users from purchasing their own listings

---

## Purchase & Payment System

### Core Functionality
Secure payment processing using Stripe for purchasing marketplace listings.

### API Endpoints

#### 1. Initiate Purchase
```javascript
POST /api/purchases
Content-Type: application/json
// Requires authentication

{
  "listing_id": number,
  "idempotency_key": "string" // optional, for preventing duplicates
}

// Success Response (201)
{
  "purchase": {
    "id": 1,
    "listing_id": 1,
    "buyer_id": 2,
    "purchase_price": 150.0,
    "currency": "USD",
    "payment_status": "pending",
    "status": "pending"
  },
  "client_secret": "pi_xxxxx_secret_xxxxx" // For Stripe
}
```

#### 2. Get User's Purchases
```javascript
GET /api/purchases
// Requires authentication

// Returns array of user's purchase history
```

#### 3. Get Specific Purchase
```javascript
GET /api/purchases/{purchase_id}
// Requires authentication (buyer or seller only)
```

### Stripe Integration
```javascript
// Install Stripe.js
npm install @stripe/stripe-js

// Payment flow example
import { loadStripe } from '@stripe/stripe-js';

const stripe = await loadStripe('pk_test_xxxxx'); // Use STRIPE_PUBLIC_KEY

// After creating purchase, use client_secret to confirm payment
const {error} = await stripe.confirmCardPayment(clientSecret, {
  payment_method: {
    card: cardElement,
    billing_details: {
      name: 'Customer name',
    },
  }
});
```

### Frontend Implementation Notes
- Integrate Stripe Elements for secure card input
- Handle payment confirmation flow
- Show purchase confirmation and receipt
- Implement purchase history page
- Handle payment errors gracefully

---

## User Interface Recommendations

### Page Structure

#### 1. Authentication Pages
- **Login Page**: Email/password form with registration link
- **Register Page**: Username/email/password form with validation
- **Logout**: Button in navigation

#### 2. Dashboard/Home Page
- Recent stubs uploaded
- Quick stats (total stubs, active listings, purchases)
- Navigation to main features

#### 3. Stub Management
- **Upload Page**: Drag-and-drop upload with title input
- **My Stubs Page**: Grid/list view of user's stubs
- **Stub Detail Page**: Full stub info with edit functionality and "List for Sale" button

#### 4. Marketplace
- **Browse Page**: Grid of available listings with filters
- **Listing Detail Page**: Full listing info with purchase button
- **My Listings Page**: User's active/sold listings management

#### 5. Purchase Management
- **Purchase History**: List of completed purchases
- **Purchase Detail**: Individual purchase information

### UI/UX Considerations
- **Responsive Design**: Mobile-first approach
- **Loading States**: Show progress during AI processing
- **Error Handling**: User-friendly error messages
- **Image Display**: Thumbnail and full-size views
- **Form Validation**: Real-time validation feedback
- **Success Feedback**: Clear confirmation messages

---

## Error Handling

### Common Error Responses
```javascript
// Validation Error (400)
{
  "status": "error",
  "message": "Missing required fields"
}

// Authentication Error (401)
{
  "status": "error", 
  "message": "Invalid email or password"
}

// Not Found (404)
{
  "status": "error",
  "message": "Stub not found"
}

// Server Error (500)
{
  "status": "error",
  "message": "An error occurred while processing the stub",
  "error": "Detailed error message"
}
```

### Frontend Error Handling
- Implement global error boundary
- Show user-friendly error messages
- Handle network errors gracefully
- Provide retry mechanisms where appropriate

---

## State Management Recommendations

### Global State (Context/Redux)
- User authentication status
- Current user information
- Shopping cart (if implementing)
- Global loading states

### Local State
- Form data
- Component-specific loading states
- Temporary UI states

---

## File Upload Implementation

### Upload Component Example
```javascript
const StubUpload = () => {
  const [file, setFile] = useState(null);
  const [title, setTitle] = useState('');
  const [uploading, setUploading] = useState(false);

  const handleUpload = async () => {
    const formData = new FormData();
    formData.append('image', file);
    formData.append('title', title);

    setUploading(true);
    try {
      const response = await axios.post('/api/stubs/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        credentials: 'include'
      });
      // Handle success
    } catch (error) {
      // Handle error
    } finally {
      setUploading(false);
    }
  };
};
```

---

## Security Considerations

1. **API Calls**: Always include `credentials: 'include'` for session cookies
2. **Input Validation**: Validate all user inputs on frontend
3. **File Upload**: Validate file types and sizes before upload
4. **Payment**: Never handle raw card data - use Stripe Elements
5. **Error Messages**: Don't expose sensitive server information

---

## Development Workflow

### 1. Setup Phase
- Initialize React project with TypeScript
- Install required dependencies
- Set up development environment
- Configure API base URL

### 2. Authentication First
- Implement auth context and API calls
- Create login/register forms
- Set up route protection

### 3. Core Features
- Build stub upload functionality
- Implement stub management pages
- Create marketplace browsing
- Add purchase workflow

### 4. Polish & Testing
- Add error handling
- Implement loading states
- Test all user flows
- Add responsive design

---

## API Testing

Use tools like Postman or create a simple test page to verify API endpoints work correctly before full implementation.

### Example Axios Configuration
```javascript
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5000',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Redirect to login
    }
    return Promise.reject(error);
  }
);
```

---

## Questions for Backend Team

If you encounter any issues or need clarification:
1. Check this documentation first
2. Test API endpoints with Postman
3. Review backend error logs
4. Ask specific questions about API behavior

---

This guide covers all the essential aspects of integrating with the stub marketplace backend. The API is well-structured and should provide a smooth development experience. Focus on user experience and error handling to create a polished marketplace application.
