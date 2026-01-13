# Backend Implementation Guide - RentalConnects

**Version:** 1.1.0  
**Last Updated:** January 20, 2026  
**Focus:** Account Management, Approvals, Property Listing, and Super Admin Features

---

## Table of Contents

1. [Account Signup & Authentication](#account-signup--authentication)
2. [User Approvals System](#user-approvals-system)
3. [Property Listing & Management](#property-listing--management)
4. [Super Admin Features](#super-admin-features)
5. [API Endpoints Reference](#api-endpoints-reference)
6. [Unified API Endpoints Configuration](#unified-api-endpoints-configuration)
7. [Data Models](#data-models)
8. [Workflow Diagrams](#workflow-diagrams)
9. [Security Requirements](#security-requirements)

---

## Account Signup & Authentication

### Overview

RentalConnects supports three user roles: **Tenant**, **Landlord**, and **Artisan**. Each role has different signup requirements and approval workflows.

### Signup Flow

```
User → Select Role → Fill Form → Upload Documents → Submit → Pending Approval → Approved/Rejected
```

### 1. Tenant Signup

**Endpoint:** `POST /api/auth/signup/tenant/`

**Content-Type:** `multipart/form-data`

**Request Fields:**
```json
{
  "email": "tenant@example.com",           // Required, unique, validated
  "password": "SecurePass123!",            // Required, min 8 chars
  "full_name": "John Doe",                  // Required
  "phone": "+233241234567",                 // Required, Ghana format
  "id_document": <file>,                    // Optional, PDF/Image
  "profile_picture": <file>                 // Optional, Image
}
```

**Validation Rules:**
- Email must be unique and valid format
- Password: minimum 8 characters, at least one uppercase, one lowercase, one number
- Phone: Must be in Ghana format (+233XXXXXXXXX)
- ID Document: Max 5MB, formats: PDF, JPG, PNG
- Profile Picture: Max 2MB, formats: JPG, PNG

**Response (Success - 201):**
```json
{
  "access": "eyJ0eXAiOiJKV1QiLCJhbGc...",
  "refresh": "eyJ0eXAiOiJKV1QiLCJhbGc...",
  "user": {
    "id": 124,
    "email": "tenant@example.com",
    "full_name": "John Doe",
    "phone": "+233241234567",
    "role": "tenant",
    "status": "active",                    // Tenants are auto-approved
    "is_verified": false,
    "subscription": "free",
    "created_at": "2026-01-20T10:00:00Z"
  },
  "message": "Account created successfully. You can start browsing properties immediately."
}
```

**Response (Error - 400):**
```json
{
  "error": "ValidationError",
  "message": "Invalid input data",
  "details": {
    "email": ["This email is already registered."],
    "password": ["Password must be at least 8 characters."]
  }
}
```

**Backend Implementation Notes:**
1. Hash password using bcrypt (cost factor 12)
2. Store files in Cloudinary (folder: `users/documents/`)
3. Set `status = "active"` for tenants (auto-approved)
4. Send welcome email
5. Generate JWT tokens immediately

---

### 2. Landlord Signup

**Endpoint:** `POST /api/auth/signup/landlord/`

**Content-Type:** `multipart/form-data`

**Request Fields:**
```json
{
  "email": "landlord@example.com",         // Required, unique
  "password": "SecurePass123!",            // Required
  "full_name": "Jane Landlord",            // Required
  "phone": "+233241234567",                 // Required
  "business_name": "ABC Properties Ltd",    // Optional
  "business_registration": <file>,         // Optional, PDF
  "id_document": <file>,                    // Recommended
  "profile_picture": <file>                 // Optional
}
```

**Response (Success - 201):**
```json
{
  "access": "eyJ0eXAiOiJKV1QiLCJhbGc...",
  "refresh": "eyJ0eXAiOiJKV1QiLCJhbGc...",
  "user": {
    "id": 125,
    "email": "landlord@example.com",
    "full_name": "Jane Landlord",
    "role": "landlord",
    "status": "pending_approval",          // Requires admin approval
    "is_verified": false,
    "subscription": "free",
    "created_at": "2026-01-20T10:00:00Z"
  },
  "message": "Account created successfully. Your account is pending admin approval. You will receive an email notification once approved."
}
```

**Backend Implementation Notes:**
1. Set `status = "pending_approval"`
2. Create notification for admins
3. Send confirmation email to landlord
4. Store business registration document if provided
5. Generate JWT tokens (but restrict access until approved)

---

### 3. Artisan Signup

**Endpoint:** `POST /api/auth/signup/artisan/`

**Content-Type:** `multipart/form-data`

**Request Fields:**
```json
{
  "email": "artisan@example.com",          // Required, unique
  "password": "SecurePass123!",            // Required
  "full_name": "Mike Artisan",             // Required
  "phone": "+233241234567",                 // Required
  "specialization": "plumber",             // Required: "plumber", "electrician", "carpenter", etc.
  "years_experience": 5,                    // Optional, integer
  "certifications": [<file>, <file>],       // Optional, array of files
  "id_document": <file>,                    // Recommended
  "profile_picture": <file>                 // Optional
}
```

**Response (Success - 201):**
```json
{
  "access": "eyJ0eXAiOiJKV1QiLCJhbGc...",
  "refresh": "eyJ0eXAiOiJKV1QiLCJhbGc...",
  "user": {
    "id": 126,
    "email": "artisan@example.com",
    "full_name": "Mike Artisan",
    "role": "artisan",
    "status": "pending_approval",          // Requires admin approval
    "specialization": "plumber",
    "years_experience": 5,
    "is_verified": false,
    "subscription": "free",
    "created_at": "2026-01-20T10:00:00Z"
  },
  "message": "Account created successfully. Your account is pending admin approval."
}
```

**Backend Implementation Notes:**
1. Set `status = "pending_approval"`
2. Store specialization and experience
3. Upload certifications to Cloudinary
4. Create notification for admins
5. Send confirmation email

---

### 4. Login

**Endpoint:** `POST /api/auth/login/`

**Content-Type:** `application/json`

**Request:**
```json
{
  "email": "user@example.com",
  "password": "SecurePass123!"
}
```

**Response (Success - 200):**
```json
{
  "access": "eyJ0eXAiOiJKV1QiLCJhbGc...",
  "refresh": "eyJ0eXAiOiJKV1QiLCJhbGc...",
  "user": {
    "id": 124,
    "email": "user@example.com",
    "full_name": "John Doe",
    "role": "tenant",
    "status": "active",
    "is_verified": true,
    "subscription": "premium",
    "subscription_expires_at": "2026-12-31T23:59:59Z",
    "profile_picture": "https://cloudinary.com/.../profile.jpg",
    "created_at": "2026-01-01T00:00:00Z"
  }
}
```

**Response (Error - 401):**
```json
{
  "error": "AuthenticationError",
  "message": "Invalid email or password."
}
```

**Response (Error - 403 - Account Pending):**
```json
{
  "error": "AccountPendingError",
  "message": "Your account is pending admin approval. You will receive an email notification once approved.",
  "status": "pending_approval"
}
```

**Response (Error - 403 - Account Rejected):**
```json
{
  "error": "AccountRejectedError",
  "message": "Your account has been rejected. Please contact support for more information.",
  "status": "rejected",
  "rejection_reason": "Incomplete documentation"
}
```

**Response (Error - 403 - Account Suspended):**
```json
{
  "error": "AccountSuspendedError",
  "message": "Your account has been suspended. Please contact support.",
  "status": "suspended"
}
```

**Backend Implementation Notes:**
1. Verify email and password
2. Check account status:
   - `active` → Allow login
   - `pending_approval` → Return 403 with pending message
   - `rejected` → Return 403 with rejection reason
   - `suspended` → Return 403 with suspension message
3. Generate JWT tokens (access: 15 min, refresh: 7 days)
4. Update last login timestamp
5. Log login attempt (success/failure)

---

### 5. Token Refresh

**Endpoint:** `POST /api/auth/refresh/`

**Request:**
```json
{
  "refresh": "eyJ0eXAiOiJKV1QiLCJhbGc..."
}
```

**Response (Success - 200):**
```json
{
  "access": "eyJ0eXAiOiJKV1QiLCJhbGc..."
}
```

**Response (Error - 401):**
```json
{
  "error": "TokenError",
  "message": "Invalid or expired refresh token."
}
```

---

## User Approvals System

### Overview

Landlords and Artisans require admin approval before they can use the platform. Admins and Super Admins can approve, reject, or suspend user accounts.

### Approval Workflow

```
Pending User → Admin Reviews → Approve/Reject/Suspend → Email Notification → Status Updated
```

### 1. Get Pending Users

**Endpoint:** `GET /api/admin/pending-users/`

**Authentication:** Required (Admin/Super Admin)

**Query Parameters:**
- `page` (integer, default: 1)
- `page_size` (integer, default: 20, max: 100)
- `role` (string, optional): Filter by role (`landlord`, `artisan`)
- `status` (string, optional): Filter by status (`pending_approval`, `rejected`, `suspended`)

**Response (Success - 200):**
```json
{
  "count": 15,
  "next": "http://api.example.com/api/admin/pending-users/?page=2",
  "previous": null,
  "results": [
    {
      "id": 125,
      "email": "landlord@example.com",
      "full_name": "Jane Landlord",
      "phone": "+233241234567",
      "role": "landlord",
      "status": "pending_approval",
      "business_name": "ABC Properties Ltd",
      "created_at": "2026-01-15T00:00:00Z",
      "documents": {
        "id_document": "https://cloudinary.com/.../id_doc.pdf",
        "business_registration": "https://cloudinary.com/.../business_reg.pdf",
        "profile_picture": "https://cloudinary.com/.../profile.jpg"
      },
      "submitted_at": "2026-01-15T00:00:00Z"
    },
    {
      "id": 126,
      "email": "artisan@example.com",
      "full_name": "Mike Artisan",
      "phone": "+233241234568",
      "role": "artisan",
      "status": "pending_approval",
      "specialization": "plumber",
      "years_experience": 5,
      "created_at": "2026-01-16T00:00:00Z",
      "documents": {
        "id_document": "https://cloudinary.com/.../id_doc.pdf",
        "certifications": [
          "https://cloudinary.com/.../cert1.pdf",
          "https://cloudinary.com/.../cert2.pdf"
        ],
        "profile_picture": "https://cloudinary.com/.../profile.jpg"
      },
      "submitted_at": "2026-01-16T00:00:00Z"
    }
  ]
}
```

**Backend Implementation Notes:**
1. Filter by `status = "pending_approval"` by default
2. Include all uploaded documents
3. Sort by `created_at` descending (newest first)
4. Only return users that admin has permission to view

---

### 2. Get User Details

**Endpoint:** `GET /api/admin/users/{id}/`

**Authentication:** Required (Admin/Super Admin)

**Response (Success - 200):**
```json
{
  "user": {
    "id": 125,
    "email": "landlord@example.com",
    "fullName": "Jane Landlord",
    "phone": "+233241234567",
    "role": "landlord",
    "status": "pending_approval",
    "businessType": "Individual",
    "createdAt": "2026-01-15T00:00:00Z",
    "submittedAt": "2026-01-15T00:00:00Z",
    "documents": {
      "id_document": "https://cloudinary.com/.../id_doc.pdf",
      "business_registration": "https://cloudinary.com/.../business_reg.pdf"
    }
  }
}
```

**Backend Implementation Notes:**
- Return full user details including all documents
- Ensure documents are accessible (Cloudinary URLs)
- Include role-specific fields
- Verify user has permission to view this user's details

---

### 3. Approve User

**Endpoint:** `PATCH /api/admin/users/{id}/approve/`

**Authentication:** Required (Admin/Super Admin)

**Request:**
```json
{
  "notes": "User approved after document verification. All documents verified."  // Optional
}
```

**Response (Success - 200):**
```json
{
  "id": 125,
  "email": "landlord@example.com",
  "full_name": "Jane Landlord",
  "status": "approved",
  "approved_by": {
    "id": 789,
    "full_name": "Admin User",
    "role": "admin"
  },
  "approved_at": "2026-01-20T10:00:00Z",
  "notes": "User approved after document verification.",
  "message": "User approved successfully"
}
```

**Backend Implementation Notes:**
1. Update user `status = "approved"`
2. Set `is_verified = true`
3. Record approval in audit log:
   - `action`: "user_approved"
   - `admin_id`: Current admin ID
   - `user_id`: Approved user ID
   - `notes`: Approval notes
   - `timestamp`: Current timestamp
4. Send email notification to user:
   - Subject: "Your Rental Connects Account Has Been Approved"
   - Body: Include welcome message and next steps
5. Create in-app notification for user
6. Remove from pending users list

---

### 3. Reject User

**Endpoint:** `POST /api/admin/users/{id}/reject/`

**Authentication:** Required (Admin/Super Admin)

**Request:**
```json
{
  "reason": "Incomplete documentation. Missing business registration certificate.",  // Required
  "notes": "User can resubmit after providing missing documents."  // Optional
}
```

**Response (Success - 200):**
```json
{
  "id": 125,
  "email": "landlord@example.com",
  "full_name": "Jane Landlord",
  "status": "rejected",
  "rejected_by": {
    "id": 789,
    "full_name": "Admin User",
    "role": "admin"
  },
  "rejected_at": "2026-01-20T10:00:00Z",
  "rejection_reason": "Incomplete documentation. Missing business registration certificate.",
  "notes": "User can resubmit after providing missing documents.",
  "message": "User rejected successfully"
}
```

**Backend Implementation Notes:**
1. Update user `status = "rejected"`
2. Store `rejection_reason` in user record
3. Record rejection in audit log
4. Send email notification to user:
   - Subject: "Your Rental Connects Account Application"
   - Body: Include rejection reason and next steps
5. Create in-app notification for user
6. User can resubmit after addressing issues

---

### 4. Suspend User

**Endpoint:** `POST /api/admin/users/{id}/suspend/`

**Authentication:** Required (Admin/Super Admin)

**Request:**
```json
{
  "reason": "Violation of platform terms. Multiple complaints received.",  // Required
  "duration_days": 30,  // Optional, null for indefinite
  "notes": "Review after 30 days"  // Optional
}
```

**Response (Success - 200):**
```json
{
  "id": 125,
  "email": "landlord@example.com",
  "full_name": "Jane Landlord",
  "status": "suspended",
  "suspended_by": {
    "id": 789,
    "full_name": "Admin User",
    "role": "admin"
  },
  "suspended_at": "2026-01-20T10:00:00Z",
  "suspension_reason": "Violation of platform terms. Multiple complaints received.",
  "suspension_ends_at": "2026-02-19T10:00:00Z",  // null if indefinite
  "notes": "Review after 30 days",
  "message": "User suspended successfully"
}
```

**Backend Implementation Notes:**
1. Update user `status = "suspended"`
2. Store suspension details
3. Set `suspension_ends_at` if duration provided
4. Record suspension in audit log
5. Send email notification to user
6. Revoke all active sessions (invalidate tokens)
7. Hide user's properties/listings (if landlord)
8. Create background job to auto-unsuspend if duration set

---

### 5. Get User Details (Admin View)

**Endpoint:** `GET /api/admin/users/{id}/`

**Authentication:** Required (Admin/Super Admin)

**Response (Success - 200):**
```json
{
  "id": 125,
  "email": "landlord@example.com",
  "full_name": "Jane Landlord",
  "phone": "+233241234567",
  "role": "landlord",
  "status": "approved",
  "is_verified": true,
  "subscription": "premium",
  "business_name": "ABC Properties Ltd",
  "created_at": "2026-01-15T00:00:00Z",
  "last_login": "2026-01-20T09:00:00Z",
  "documents": {
    "id_document": "https://cloudinary.com/.../id_doc.pdf",
    "business_registration": "https://cloudinary.com/.../business_reg.pdf"
  },
  "approval_history": [
    {
      "action": "approved",
      "admin": "Admin User",
      "timestamp": "2026-01-16T10:00:00Z",
      "notes": "Documents verified"
    }
  ],
  "properties_count": 5,
  "total_reviews": 12,
  "average_rating": 4.5,
  "trust_score": 4.3
}
```

---

## Property Listing & Management

### Overview

Landlords can create, update, and delete property listings. All properties require admin approval before being visible to tenants.

### Property Creation Workflow

```
Landlord Creates → Property Saved as Draft → Submit for Approval → Admin Reviews → Approved/Rejected → Visible to Tenants
```

### 1. Create Property

**Endpoint:** `POST /api/properties/`

**Authentication:** Required (Landlord only)

**Content-Type:** `multipart/form-data`

**Request Fields:**
```json
{
  "title": "Beautiful 3-Bedroom Apartment in East Legon",  // Required, max 200 chars
  "description": "Spacious apartment with modern amenities...",  // Required, max 5000 chars
  "address": "East Legon, Accra",  // Required
  "latitude": 5.603717,  // Required, float
  "longitude": -0.186964,  // Required, float
  "price": 1500.00,  // Required, decimal, min: 0
  "currency": "GHS",  // Required, default: "GHS"
  "bedrooms": 3,  // Required, integer, min: 0
  "bathrooms": 2,  // Required, integer, min: 0
  "property_type": "apartment",  // Required: "apartment", "house", "commercial", "studio"
  "images": [<file>, <file>, ...],  // Required, min: 3, max: 10, each max 5MB
  "amenities": ["parking", "security", "wifi", "pool"],  // Optional, array or comma-separated string
  "furnished": true,  // Optional, boolean
  "available_from": "2026-02-01",  // Optional, date
  "lease_duration": "12 months"  // Optional, string
}
```

**Response (Success - 201):**
```json
{
  "id": "prop-123",
  "title": "Beautiful 3-Bedroom Apartment in East Legon",
  "status": "pending_approval",
  "message": "Property submitted for approval. You will receive a notification once approved.",
  "created_at": "2026-01-20T10:00:00Z"
}
```

**Backend Implementation Notes:**
1. Validate all required fields
2. Validate images:
   - Format: JPG, PNG, WebP
   - Size: Max 5MB per image
   - Count: Minimum 3, maximum 10
3. Upload images to Cloudinary (folder: `properties/`)
4. Geocode address if coordinates not provided (using Nominatim or Google Geocoding)
5. Set `status = "pending_approval"`
6. Set `is_verified = false`
7. Create notification for admins
8. Send confirmation email to landlord
9. Store property with landlord association

---

### 2. Get Pending Properties

**Endpoint:** `GET /api/admin/properties/pending/`

**Authentication:** Required (Admin/Super Admin)

**Query Parameters:**
- `page` (integer, default: 1)
- `page_size` (integer, default: 20)
- `landlord_id` (integer, optional): Filter by landlord

**Response (Success - 200):**
```json
{
  "count": 8,
  "next": null,
  "previous": null,
  "results": [
    {
      "id": "prop-123",
      "title": "Beautiful 3-Bedroom Apartment in East Legon",
      "address": "East Legon, Accra",
      "price": 1500.00,
      "currency": "GHS",
      "bedrooms": 3,
      "bathrooms": 2,
      "property_type": "apartment",
      "images": [
        "https://cloudinary.com/.../image1.jpg",
        "https://cloudinary.com/.../image2.jpg"
      ],
      "landlord": {
        "id": 125,
        "full_name": "Jane Landlord",
        "email": "landlord@example.com",
        "is_verified": true
      },
      "status": "pending_approval",
      "created_at": "2026-01-20T10:00:00Z",
      "submitted_at": "2026-01-20T10:00:00Z"
    }
  ]
}
```

---

### 3. Approve Property

**Endpoint:** `POST /api/admin/properties/{id}/approve/`

**Authentication:** Required (Admin/Super Admin)

**Request:**
```json
{
  "notes": "Property verified. All images and details are accurate."  // Optional
}
```

**Response (Success - 200):**
```json
{
  "id": "prop-123",
  "title": "Beautiful 3-Bedroom Apartment in East Legon",
  "status": "approved",
  "is_verified": true,
  "approved_by": {
    "id": 789,
    "full_name": "Admin User",
    "role": "admin"
  },
  "approved_at": "2026-01-20T11:00:00Z",
  "notes": "Property verified. All images and details are accurate.",
  "message": "Property approved successfully"
}
```

**Backend Implementation Notes:**
1. Update property `status = "approved"`
2. Set `is_verified = true`
3. Record approval in audit log
4. Send email notification to landlord
5. Create in-app notification for landlord
6. Property becomes visible to all tenants
7. Index property for search (if using search engine)

---

### 4. Reject Property

**Endpoint:** `POST /api/admin/properties/{id}/reject/`

**Authentication:** Required (Admin/Super Admin)

**Request:**
```json
{
  "reason": "Insufficient property images. Please provide at least 3 high-quality images.",  // Required
  "notes": "Landlord can resubmit after adding more images."  // Optional
}
```

**Response (Success - 200):**
```json
{
  "id": "prop-123",
  "title": "Beautiful 3-Bedroom Apartment in East Legon",
  "status": "rejected",
  "rejected_by": {
    "id": 789,
    "full_name": "Admin User",
    "role": "admin"
  },
  "rejected_at": "2026-01-20T11:00:00Z",
  "rejection_reason": "Insufficient property images. Please provide at least 3 high-quality images.",
  "notes": "Landlord can resubmit after adding more images.",
  "message": "Property rejected successfully"
}
```

**Backend Implementation Notes:**
1. Update property `status = "rejected"`
2. Store rejection reason
3. Record rejection in audit log
4. Send email notification to landlord with rejection reason
5. Property remains hidden from tenants
6. Landlord can edit and resubmit

---

### 5. Update Property

**Endpoint:** `PATCH /api/properties/{id}/`

**Authentication:** Required (Owner or Admin)

**Content-Type:** `multipart/form-data` (if images) or `application/json`

**Request:** (All fields optional)
```json
{
  "title": "Updated Title",
  "description": "Updated description",
  "price": 1600.00,
  "images": [<file>, <file>],  // New images to add
  "remove_image_urls": ["https://cloudinary.com/.../old_image.jpg"]  // URLs to remove
}
```

**Response (Success - 200):**
```json
{
  "id": "prop-123",
  "title": "Updated Title",
  "status": "pending_approval",  // If significant changes, require re-approval
  "message": "Property updated. Changes require admin approval before going live."
}
```

**Backend Implementation Notes:**
1. Check if user is owner or admin
2. If significant changes (price, location, images), set `status = "pending_approval"`
3. If minor changes (description, amenities), keep current status
4. Handle image updates:
   - Add new images
   - Remove old images from Cloudinary
5. Record update in audit log
6. Notify admins if re-approval required

---

### 6. Delete Property

**Endpoint:** `DELETE /api/properties/{id}/`

**Authentication:** Required (Owner or Admin)

**Response (Success - 200):**
```json
{
  "message": "Property deleted successfully"
}
```

**Backend Implementation Notes:**
1. Check if user is owner or admin
2. Soft delete (set `is_deleted = true`) or hard delete
3. Delete images from Cloudinary
4. Record deletion in audit log
5. Cancel any pending bookings
6. Notify affected tenants (if any active bookings)

---

### 7. List Properties (Public)

**Endpoint:** `GET /api/properties/`

**Authentication:** Optional (public endpoint)

**Query Parameters:**
- `page` (integer, default: 1)
- `page_size` (integer, default: 20, max: 100)
- `min_price` (float, optional)
- `max_price` (float, optional)
- `bedrooms` (integer, optional)
- `bathrooms` (integer, optional)
- `property_type` (string, optional)
- `location` (string, optional): Search by address
- `latitude` (float, optional): For location-based search
- `longitude` (float, optional)
- `radius` (float, optional): Search radius in km
- `status` (string, optional): Filter by status (only for authenticated landlords/admins)
- `verified` (boolean, optional): Only verified properties

**Response (Success - 200):**
```json
{
  "count": 150,
  "next": "http://api.example.com/api/properties/?page=2",
  "previous": null,
  "results": [
    {
      "id": "prop-123",
      "title": "Beautiful 3-Bedroom Apartment in East Legon",
      "description": "Spacious apartment...",
      "address": "East Legon, Accra",
      "latitude": 5.603717,
      "longitude": -0.186964,
      "price": 1500.00,
      "currency": "GHS",
      "bedrooms": 3,
      "bathrooms": 2,
      "property_type": "apartment",
      "images": [
        "https://cloudinary.com/.../image1.jpg",
        "https://cloudinary.com/.../image2.jpg"
      ],
      "amenities": ["parking", "security", "wifi"],
      "landlord": {
        "id": 125,
        "full_name": "Jane Landlord",
        "is_verified": true,
        "trust_score": 4.5
      },
      "status": "available",
      "is_verified": true,
      "average_rating": 4.5,
      "total_reviews": 10,
      "created_at": "2026-01-15T00:00:00Z"
    }
  ]
}
```

**Backend Implementation Notes:**
1. Only return properties with `status = "approved"` and `is_verified = true` for public
2. Apply filters (price, bedrooms, etc.)
3. Support location-based search (radius search)
4. Sort by relevance, price, or date
5. Include landlord basic info (for trust indicators)
6. Include average rating and review count

---

## Super Admin Features

### Overview

Super Admins have full system control including user management, system configuration, pricing management, and analytics.

### 1. Get System Statistics

**Endpoint:** `GET /api/super-admin/stats/`

**Authentication:** Required (Super Admin only)

**Response (Success - 200):**
```json
{
  "users": {
    "total": 1000,
    "active": 850,
    "pending": 50,
    "suspended": 20,
    "rejected": 80,
    "by_role": {
      "tenant": 600,
      "landlord": 300,
      "artisan": 80,
      "admin": 15,
      "super-admin": 5
    },
    "new_today": 12,
    "new_this_week": 85,
    "new_this_month": 320
  },
  "properties": {
    "total": 500,
    "available": 350,
    "rented": 150,
    "pending_approval": 50,
    "rejected": 20,
    "new_today": 5,
    "new_this_week": 35,
    "new_this_month": 120
  },
  "revenue": {
    "total": 50000.00,
    "this_month": 5000.00,
    "this_week": 1200.00,
    "today": 150.00,
    "currency": "GHS",
    "breakdown": {
      "subscriptions": 30000.00,
      "listing_fees": 15000.00,
      "ad_promotions": 5000.00
    }
  },
  "systemHealth": {
    "uptime": 99.9,
    "response_time_ms": 150,
    "status": "healthy",
    "database_status": "connected",
    "cache_status": "connected",
    "storage_status": "connected"
  },
  "recentActivity": [
    {
      "id": "activity-1",
      "type": "user_approved",
      "user": "Jane Landlord",
      "admin": "Admin User",
      "timestamp": "2026-01-20T10:00:00Z"
    },
    {
      "id": "activity-2",
      "type": "property_approved",
      "property": "Beautiful Apartment",
      "admin": "Admin User",
      "timestamp": "2026-01-20T09:30:00Z"
    }
  ]
}
```

**Backend Implementation Notes:**
1. Calculate real-time statistics
2. Cache expensive queries (refresh every 5 minutes)
3. Include system health metrics
4. Return recent activity (last 50 actions)
5. Include revenue breakdown by source

---

### 2. Get All Users

**Endpoint:** `GET /api/super-admin/users/`

**Authentication:** Required (Super Admin only)

**Query Parameters:**
- `page` (integer, default: 1)
- `page_size` (integer, default: 50)
- `role` (string, optional): Filter by role
- `status` (string, optional): Filter by status
- `search` (string, optional): Search by name or email
- `sort` (string, optional): Sort by `created_at`, `last_login`, `name` (default: `created_at`)
- `order` (string, optional): `asc` or `desc` (default: `desc`)

**Response (Success - 200):**
```json
{
  "count": 1000,
  "next": "http://api.example.com/api/super-admin/users/?page=2",
  "previous": null,
  "results": [
    {
      "id": 125,
      "email": "landlord@example.com",
      "full_name": "Jane Landlord",
      "phone": "+233241234567",
      "role": "landlord",
      "status": "approved",
      "is_verified": true,
      "subscription": "premium",
      "created_at": "2026-01-15T00:00:00Z",
      "last_login": "2026-01-20T09:00:00Z",
      "properties_count": 5,
      "total_reviews": 12,
      "average_rating": 4.5
    }
  ]
}
```

---

### 3. Create User (Super Admin)

**Endpoint:** `POST /api/super-admin/users/create/`

**Authentication:** Required (Super Admin only)

**Content-Type:** `multipart/form-data` or `application/json`

**Request:**
```json
{
  "email": "newuser@example.com",
  "password": "SecurePass123!",
  "full_name": "New User",
  "phone": "+233241234567",
  "role": "landlord",  // "tenant", "landlord", "artisan", "admin"
  "status": "active",  // "active", "pending_approval", "suspended"
  "subscription": "premium",  // "free", "premium"
  "is_verified": true
}
```

**Response (Success - 201):**
```json
{
  "id": 127,
  "email": "newuser@example.com",
  "full_name": "New User",
  "role": "landlord",
  "status": "active",
  "is_verified": true,
  "subscription": "premium",
  "created_at": "2026-01-20T10:00:00Z",
  "created_by": {
    "id": 1,
    "full_name": "Super Admin",
    "role": "super-admin"
  },
  "message": "User created successfully"
}
```

**Backend Implementation Notes:**
1. Validate all fields
2. Hash password
3. Set default values if not provided
4. Record creation in audit log
5. Send welcome email
6. Generate JWT tokens if status is "active"

---

### 4. Delete User (Super Admin)

**Endpoint:** `DELETE /api/super-admin/users/{id}/`

**Authentication:** Required (Super Admin only)

**Request:**
```json
{
  "reason": "Account closure requested by user",  // Optional
  "delete_properties": false,  // Optional: Delete user's properties (default: false)
  "delete_data": false  // Optional: Hard delete vs soft delete (default: false)
}
```

**Response (Success - 200):**
```json
{
  "message": "User deleted successfully",
  "deleted_user_id": 125,
  "properties_deleted": 0,
  "deleted_at": "2026-01-20T10:00:00Z"
}
```

**Backend Implementation Notes:**
1. Prevent deletion of other super admins
2. Soft delete by default (set `is_deleted = true`)
3. Optionally delete user's properties
4. Record deletion in audit log
5. Send notification email to user
6. Revoke all active sessions

---

### 5. Get Premium Pricing Configuration

**Endpoint:** `GET /api/super-admin/premium/pricing/`

**Authentication:** Required (Super Admin only)

**Response (Success - 200):**
```json
{
  "monthly": 49.00,
  "yearly": 490.00,
  "currency": "GHS",
  "listing_fee": 5.00,
  "ad_promotion_fee": 10.00,
  "featured_listing_fee": 15.00,
  "upgrade_fee": 0.00,
  "enabled": true,
  "updated_at": "2026-01-15T00:00:00Z",
  "updated_by": {
    "id": 1,
    "full_name": "Super Admin"
  }
}
```

---

### 6. Update Premium Pricing

**Endpoint:** `PATCH /api/super-admin/premium/pricing/`

**Authentication:** Required (Super Admin only)

**Request:**
```json
{
  "monthly": 59.00,
  "yearly": 590.00,
  "listing_fee": 6.00,
  "ad_promotion_fee": 12.00,
  "featured_listing_fee": 18.00
}
```

**Response (Success - 200):**
```json
{
  "monthly": 59.00,
  "yearly": 590.00,
  "currency": "GHS",
  "listing_fee": 6.00,
  "ad_promotion_fee": 12.00,
  "featured_listing_fee": 18.00,
  "updated_at": "2026-01-20T10:00:00Z",
  "updated_by": {
    "id": 1,
    "full_name": "Super Admin"
  },
  "message": "Pricing updated successfully"
}
```

**Backend Implementation Notes:**
1. Validate pricing values (must be positive)
2. Update pricing configuration
3. Record change in audit log
4. Invalidate pricing cache
5. Notify active premium users of price changes (optional)

---

### 7. Get Audit Logs

**Endpoint:** `GET /api/super-admin/audit/`

**Authentication:** Required (Super Admin only)

**Query Parameters:**
- `page` (integer, default: 1)
- `page_size` (integer, default: 50)
- `action_type` (string, optional): Filter by action (`user_approved`, `property_approved`, `user_created`, etc.)
- `user_id` (integer, optional): Filter by user
- `admin_id` (integer, optional): Filter by admin
- `start_date` (date, optional)
- `end_date` (date, optional)

**Response (Success - 200):**
```json
{
  "count": 5000,
  "next": "http://api.example.com/api/super-admin/audit/?page=2",
  "previous": null,
  "results": [
    {
      "id": "audit-1",
      "action": "user_approved",
      "admin": {
        "id": 789,
        "full_name": "Admin User",
        "role": "admin"
      },
      "target_user": {
        "id": 125,
        "full_name": "Jane Landlord",
        "email": "landlord@example.com"
      },
      "details": {
        "previous_status": "pending_approval",
        "new_status": "approved",
        "notes": "Documents verified"
      },
      "ip_address": "192.168.1.1",
      "user_agent": "Mozilla/5.0...",
      "timestamp": "2026-01-20T10:00:00Z"
    }
  ]
}
```

**Backend Implementation Notes:**
1. Log all admin actions automatically
2. Include IP address and user agent
3. Store action details as JSON
4. Support filtering and search
5. Retain logs for compliance (minimum 1 year)

---

## Data Models

### User Model

```python
class User(models.Model):
    id = models.AutoField(primary_key=True)
    email = models.EmailField(unique=True)
    password = models.CharField(max_length=255)  # Hashed
    full_name = models.CharField(max_length=255)
    phone = models.CharField(max_length=20)
    role = models.CharField(max_length=20, choices=[
        ('tenant', 'Tenant'),
        ('landlord', 'Landlord'),
        ('artisan', 'Artisan'),
        ('admin', 'Admin'),
        ('super-admin', 'Super Admin')
    ])
    status = models.CharField(max_length=20, choices=[
        ('active', 'Active'),
        ('pending_approval', 'Pending Approval'),
        ('rejected', 'Rejected'),
        ('suspended', 'Suspended')
    ], default='pending_approval')
    is_verified = models.BooleanField(default=False)
    subscription = models.CharField(max_length=20, default='free')  # REQUIRED: All new users default to "free"
    subscription_expires_at = models.DateTimeField(null=True, blank=True)
    profile_picture = models.URLField(null=True, blank=True)
    trust_score = models.FloatField(default=0.0)
    last_login = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    # Landlord-specific fields
    business_name = models.CharField(max_length=255, null=True, blank=True)
    business_registration = models.URLField(null=True, blank=True)
    
    # Artisan-specific fields
    specialization = models.CharField(max_length=100, null=True, blank=True)
    years_experience = models.IntegerField(null=True, blank=True)
    
    # Rejection/Suspension fields
    rejection_reason = models.TextField(null=True, blank=True)
    suspension_reason = models.TextField(null=True, blank=True)
    suspension_ends_at = models.DateTimeField(null=True, blank=True)
```

### Property Model

```python
class Property(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4)
    landlord = models.ForeignKey(User, on_delete=models.CASCADE, related_name='properties')
    title = models.CharField(max_length=200)
    description = models.TextField(max_length=5000)
    address = models.CharField(max_length=500)
    latitude = models.FloatField()
    longitude = models.FloatField()
    price = models.DecimalField(max_digits=10, decimal_places=2)
    currency = models.CharField(max_length=3, default='GHS')
    bedrooms = models.IntegerField()
    bathrooms = models.IntegerField()
    property_type = models.CharField(max_length=50, choices=[
        ('apartment', 'Apartment'),
        ('house', 'House'),
        ('commercial', 'Commercial'),
        ('studio', 'Studio')
    ])
    images = models.JSONField(default=list)  # Array of Cloudinary URLs
    amenities = models.JSONField(default=list)  # Array of strings
    furnished = models.BooleanField(default=False)
    available_from = models.DateField(null=True, blank=True)
    lease_duration = models.CharField(max_length=50, null=True, blank=True)
    status = models.CharField(max_length=20, choices=[
        ('draft', 'Draft'),
        ('pending_approval', 'Pending Approval'),
        ('approved', 'Approved'),
        ('rejected', 'Rejected'),
        ('rented', 'Rented')
    ], default='pending_approval')
    is_verified = models.BooleanField(default=False)
    rejection_reason = models.TextField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    is_deleted = models.BooleanField(default=False)
```

### AuditLog Model

```python
class AuditLog(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4)
    action = models.CharField(max_length=100)  # e.g., "user_approved", "property_rejected"
    admin = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name='admin_actions')
    target_user = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name='targeted_actions')
    target_property = models.ForeignKey(Property, on_delete=models.SET_NULL, null=True)
    details = models.JSONField(default=dict)  # Store action-specific details
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    user_agent = models.TextField(null=True, blank=True)
    timestamp = models.DateTimeField(auto_now_add=True)
```

---

## Security Requirements

### Authentication Security

1. **Password Hashing:**
   - Use bcrypt with cost factor 12
   - Never store plain text passwords
   - Never return passwords in API responses

2. **JWT Tokens:**
   - Access tokens expire in 15 minutes
   - Refresh tokens expire in 7 days
   - Use secure secret key (minimum 256 bits)
   - Sign tokens with HS256 or RS256
   - Support token blacklisting on logout

3. **Rate Limiting:**
   - Login attempts: 5 per 15 minutes per IP
   - Signup attempts: 3 per hour per IP
   - API requests: 1000 per hour per user
   - Use Redis or similar for rate limiting

### Authorization

1. **Role-Based Access:**
   - Check user role on every protected endpoint
   - Verify account status (active, pending, etc.)
   - Prevent pending users from accessing protected features

2. **Resource Ownership:**
   - Verify user owns resource before update/delete
   - Admins can override ownership checks
   - Log all ownership violations

### Data Validation

1. **Input Validation:**
   - Validate all user inputs
   - Sanitize data before storage
   - Use Django serializers or similar
   - Return clear error messages

2. **File Upload Security:**
   - Validate file types (whitelist approach)
   - Limit file sizes
   - Scan for malware
   - Store files securely (Cloudinary)

### Audit Logging

1. **Log All Admin Actions:**
   - User approvals/rejections
   - Property approvals/rejections
   - User creation/deletion
   - Pricing changes
   - System configuration changes

2. **Log Security Events:**
   - Failed login attempts
   - Password reset requests
   - Account status changes
   - Suspicious activity

---

## Workflow Diagrams

### User Signup & Approval Flow

```
┌─────────────┐
│ User Signup │
└──────┬──────┘
       │
       ├─ Tenant → Auto-Approved → Active
       │
       ├─ Landlord → Pending Approval
       │              │
       │              └─ Admin Reviews → Approve/Reject
       │
       └─ Artisan → Pending Approval
                    │
                    └─ Admin Reviews → Approve/Reject
```

### Property Listing Flow

```
┌──────────────────┐
│ Landlord Creates │
│    Property      │
└────────┬─────────┘
         │
         ├─ Save as Draft (optional)
         │
         └─ Submit for Approval
                   │
                   └─ Admin Reviews
                             │
                             ├─ Approve → Visible to Tenants
                             │
                             └─ Reject → Landlord Can Resubmit
```

---

## Testing Checklist

### Signup Endpoints
- [ ] Tenant signup with valid data
- [ ] Tenant signup with duplicate email (should fail)
- [ ] Landlord signup with valid data
- [ ] Landlord signup with missing required fields (should fail)
- [ ] Artisan signup with valid data
- [ ] File upload validation (size, format)
- [ ] Password strength validation

### Login Endpoints
- [ ] Login with valid credentials
- [ ] Login with invalid credentials (should fail)
- [ ] Login with pending account (should return 403)
- [ ] Login with rejected account (should return 403)
- [ ] Login with suspended account (should return 403)
- [ ] Token refresh with valid token
- [ ] Token refresh with expired token (should fail)

### Approval Endpoints
- [ ] Get pending users (admin only)
- [ ] Approve user (admin only)
- [ ] Reject user with reason (admin only)
- [ ] Suspend user (admin only)
- [ ] Non-admin cannot access approval endpoints

### Property Endpoints
- [ ] Create property (landlord only)
- [ ] Get pending properties (admin only)
- [ ] Approve property (admin only)
- [ ] Reject property with reason (admin only)
- [ ] Update property (owner only)
- [ ] Delete property (owner or admin)
- [ ] List properties (public, only approved)

### Super Admin Endpoints
- [ ] Get system stats (super admin only)
- [ ] Get all users (super admin only)
- [ ] Create user (super admin only)
- [ ] Delete user (super admin only)
- [ ] Update pricing (super admin only)
- [ ] Get audit logs (super admin only)
- [ ] Non-super-admin cannot access super admin endpoints

---

## Additional Resources

- **Complete API Reference:** See `BACKEND_API_COMPLETE_REFERENCE.md`
- **Complete Developer Guide:** See `COMPLETE_BACKEND_DEVELOPER_GUIDE.md`
- **Frontend Services:** Check `src/services/` for expected request/response formats

---

**End of Backend Implementation Guide**
