# StubCollector Project Plan - Checklist

This checklist outlines the core functional areas and tasks for the StubCollector project.

### A. Project Foundation & Setup
- [ ] **A.1:** Set up development environment (frontend + backend)
- [ ] **A.2:** Create GitHub repo / version control system
- [ ] **A.3:** Configure domain & hosting (e.g., Vercel for frontend, Supabase/Firebase/PostgreSQL backend)

### B. User Management & Authentication
- [ ] **B.1:** Implement user registration & login (API + Frontend UI)
    - [ ] **B.1.1:** Backend APIs for registration and login
    - [ ] **B.1.2:** Frontend UI for registration and login forms
    - [ ] **B.1.3:** JWT or session token management
- [ ] **B.2:** Create user dashboard for managing listed stubs
    - [ ] **B.2.1:** Basic dashboard structure (post-login)
    - [ ] **B.2.2:** Display user's uploaded stubs with status
    - [ ] **B.2.3:** Options to edit/unlist stubs
- [ ] **B.3:** Add password reset functionality
    - [ ] **B.3.1:** Backend API for password reset (request token, reset)
    - [ ] **B.3.2:** Frontend UI for password reset flow
- [ ] **B.4:** Implement email verification
    - [ ] **B.4.1:** Backend API for email verification (send token, verify)
    - [ ] **B.4.2:** Frontend UI for email verification flow

### C. Ticket Stub Submission & Recognition
- [ ] **C.1:** Enable image upload or camera input for stubs (Frontend)
- [ ] **C.2:** Build core recognition system (Backend OCR)
    - [ ] **C.2.1:** Integrate OCR library/service (e.g., Tesseract.js, Cloud Vision)
    - [ ] **C.2.2:** API endpoint to process image and extract text
- [ ] **C.3:** Implement manual input form as fallback/correction
    - [ ] **C.3.1:** Frontend form for manual stub details
    - [ ] **C.3.2:** Backend API to save manually entered/corrected stub data
- [ ] **C.4:** (Optional) AI/image matching to assist identification (e.g., team, artist, movie)

### D. Event Database & Management (Multi-Category)
- [ ] **D.1:** Design and implement flexible event database schema
    - [ ] **D.1.1:** Schema for events (sports, concerts, movies etc.), categories, venues, artists, teams
    - [ ] **D.1.2:** Support for multiple event types and custom tags
- [ ] **D.2:** Develop smart matching between stub info and events
    - [ ] **D.2.1:** Algorithm for matching based on date/location/keywords
    - [ ] **D.2.2:** API to associate stubs with database events
- [ ] **D.3:** Create admin/editor tools for event data
    - [ ] **D.3.1:** Backend APIs for CRUD operations on event entities (for admin use)
    - [ ] **D.3.2:** Interface/tools for manual correction or tagging of stubs to events (Admin Panel)

### E. Stub Page & Detailed View
- [ ] **E.1:** Automatically generate a detail page per uploaded stub
    - [ ] **E.1.1:** API to fetch detailed stub data (including linked event info)
    - [ ] **E.1.2:** Frontend to display event info (type, participants, date, highlights)
    - [ ] **E.1.3:** Display user-uploaded stub images (front/back)
- [ ] **E.2:** Implement dynamic badges or labels (e.g., "Sold Out," "Historic Game," "Final Show")
- [ ] **E.3:** Link to user's collection or profile from stub page

### F. Marketplace: Stub Exchange - Listing & Discovery
- [ ] **F.1:** Enable users to list stubs for sale/trade
    - [ ] **F.1.1:** Form to add title, description, price, condition, tags
    - [ ] **F.1.2:** API to update stub status (for sale/trade) and save marketplace details
- [ ] **F.2:** Implement browse, search, and filter functionality
    - [ ] **F.2.1:** Filter by category (sport, concert, movie), team/artist, date, etc.
    - [ ] **F.2.2:** Search by keywords
    - [ ] **F.2.3:** Sorting functions (e.g., price, date listed)
    - [ ] **F.2.4:** API to support advanced search, filter, and sort
- [ ] **F.3:** Allow users to save favorites or follow specific sellers/collections
    - [ ] **F.3.1:** API and UI for favoriting stubs
    - [ ] **F.3.2:** API and UI for following sellers

### G. Marketplace: Seller & Buyer Interaction Features
- [ ] **G.1:** Implement in-app messaging between users (or contact form as V1)
- [ ] **G.2:** Develop Wishlist/watchlist functionality for stubs
- [ ] **G.3:** Implement a seller rating system (required for transactions)

### H. Payment Functionality (Conceptual - Requires Detailed Planning)
- [ ] **H.1:** Research and select payment gateway (e.g., Stripe, PayPal)
- [ ] **H.2:** Design API for initiating transactions (placeholder)
- [ ] **H.3:** Define payment flow logic (direct vs. escrow - conceptual)

### I. Back Office / Admin Panel
- [ ] **I.1:** Build a secure admin dashboard (back office)
- [ ] **I.2:** Develop tools to view and moderate user-submitted stubs (approve, reject)
- [ ] **I.3:** Create interface to manage event database entries (CRUD for events, artists, etc.)
- [ ] **I.4:** Implement system to handle content flags/reports from users
- [ ] **I.5:** Develop user management tools (roles, bans, activity history)

### J. Mobile Optimization & Responsiveness
- [ ] **J.1:** Ensure full mobile responsiveness for all pages and features
- [ ] **J.2:** Optimize for fast load times on mobile devices (image optimization, lazy loading, asset minification)
- [ ] **J.3:** Optimize mobile navigation for ease of use

### K. Visual Design & User Experience
- [ ] **K.1:** Implement playful, colorful UI (brand-aligned)
- [ ] **K.2:** Design stub frames/cards to mimic real-world collectibles
- [ ] **K.3:** Add subtle animations (hover, transitions, flipping stubs, etc.)

---
**Note:** Items marked `[ ]` are pending. This checklist will be updated as development progresses.
