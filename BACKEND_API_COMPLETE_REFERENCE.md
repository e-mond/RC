# Complete Backend API Reference - RentalConnects

**Version:** 2.0.0  
**Last Updated:** January 15, 2026  
**Purpose:** Comprehensive backend API reference for all endpoints used by the RentalConnects frontend

---

## Table of Contents

1. [Introduction](#introduction)
2. [Base Configuration](#base-configuration)
3. [Authentication & Authorization](#authentication--authorization)
4. [User Management](#user-management)
5. [Property Management](#property-management)
6. [Bookings & Viewing Requests](#bookings--viewing-requests)
7. [Wallet & Payments](#wallet--payments)
8. [Messaging System](#messaging-system)
9. [Reviews & Ratings](#reviews--ratings)
10. [Background Checks & Verification](#background-checks--verification)
11. [Admin Functions](#admin-functions)
12. [Super Admin Functions](#super-admin-functions)
13. [Marketing & Campaigns](#marketing--campaigns)
14. [Ads Management](#ads-management)
15. [Notifications](#notifications)
16. [Announcements](#announcements)
17. [Analytics & Reports](#analytics--reports)
18. [Lease Management](#lease-management)
19. [Preferences & Settings](#preferences--settings)
20. [File Uploads](#file-uploads)
21. [Public Endpoints](#public-endpoints)
21. [Error Handling](#error-handling)
22. [Response Formats](#response-formats)
23. [Mock Mode Support](#mock-mode-support)

---

## Introduction

This document provides a complete reference for all API endpoints that the RentalConnects frontend expects from the backend. The frontend is built with React and uses Django REST Framework as the expected backend.

### Key Principles

- **RESTful Design:** All endpoints follow REST principles
- **JWT Authentication:** Token-based authentication
- **Trailing Slashes:** Django-style URLs with trailing slashes
- **Consistent Response Format:** Standard JSON response structure
- **Error Handling:** Comprehensive error responses
- **Pagination:** For list endpoints
- **File Uploads:** Multipart/form-data for files

---

## Base Configuration

### Base URL

```
Development: http://localhost:8000/api
Production: https://api.rentalconnects.com/api
```

### Environment Variable

Frontend expects:
```env
VITE_API_BASE_URL=http://localhost:8000/api
```

### URL Format

- All endpoints support trailing slashes (`/`)
- Use kebab-case for endpoint names
- Versioning optional but recommended (`/api/v1/`)

---

## Authentication & Authorization

### JWT Token Format

**Request Header:**
```
Authorization: Bearer <access_token>
```

**Token Structure:**
```json
{
  "user_id": 1,
  "email": "user@example.com",
  "role": "landlord",
  "permissions": {
    "canApproveUsers": true,
    "canApproveProperties": true,
    ...
  },
  "exp": 1234567890
}
```

### Login

**Endpoint:** `POST /api/auth/login/`

**Request:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "access": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...",
  "refresh": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...",
  "user": {
    "id": 1,
    "email": "user@example.com",
    "full_name": "John Doe",
    "role": "landlord",
    "permissions": {
      "canApproveUsers": false,
      "canApproveProperties": false
    }
  }
}
```

**Status Codes:**
- `200` - Success
- `400` - Invalid credentials
- `401` - Unauthorized

### Signup - Tenant

**Endpoint:** `POST /api/auth/signup/tenant/`

**Content-Type:** `multipart/form-data`

**Request Fields:**
- `fullName` (string, required)
- `email` (string, required, unique)
- `phone` (string, required)
- `password` (string, required, min 8 chars)
- `confirmPassword` (string, required, must match password)
- `location` (string, optional)
- `rentRange` (string, optional)
- `idUpload` (file, optional)

**Response:**
```json
{
  "message": "Account created successfully. Awaiting verification.",
  "user": {
    "id": 1,
    "email": "tenant@example.com",
    "full_name": "John Tenant",
    "role": "tenant",
    "status": "active"
  }
}
```

**Status Codes:**
- `201` - Created
- `400` - Validation error
- `409` - Email already exists

### Signup - Landlord

**Endpoint:** `POST /api/auth/signup/landlord/`

**Content-Type:** `multipart/form-data`

**Request Fields:**
- `fullName` (string, required)
- `email` (string, required, unique)
- `phone` (string, required)
- `password` (string, required)
- `confirmPassword` (string, required)
- `businessType` (string, required: "Individual" | "Company")
- `location` (string, optional)
- `idUpload` (file, optional)

**Response:**
```json
{
  "message": "Registration successful. Your account is pending approval.",
  "user": {
    "id": 2,
    "email": "landlord@example.com",
    "full_name": "Jane Landlord",
    "role": "landlord",
    "status": "pending"
  }
}
```

**Note:** Landlord accounts start with `status: "pending"` and require admin approval.

### Signup - Artisan

**Endpoint:** `POST /api/auth/signup/artisan`

**Content-Type:** `multipart/form-data`

**Request Fields:**
- `fullName` (string, required)
- `email` (string, required, unique)
- `phone` (string, required)
- `password` (string, required)
- `confirmPassword` (string, required)
- `profession` (string, required)
- `experience` (string, optional)
- `region` (string, optional)
- `idUpload` (file, optional)

**Response:**
```json
{
  "message": "Registration successful. Your account is pending approval.",
  "user": {
    "id": 3,
    "email": "artisan@example.com",
    "full_name": "Mike Artisan",
    "role": "artisan",
    "status": "pending"
  }
}
```

**Note:** Artisan accounts start with `status: "pending"` and require admin approval.

### Get Current User Profile

**Endpoint:** `GET /api/auth/profile/`

**Authentication:** Required

**Response:**
```json
{
  "id": 1,
  "email": "user@example.com",
  "full_name": "John Doe",
  "phone": "+233241234567",
  "role": "landlord",
  "status": "active",
  "permissions": {
    "canApproveUsers": false,
    "canApproveProperties": false
  },
  "verification_status": {
    "identity_verified": true,
    "background_check_status": "verified",
    "payment_verified": true,
    "document_verified": true,
    "overall_status": "verified"
  },
  "created_at": "2026-01-01T00:00:00Z",
  "updated_at": "2026-01-15T00:00:00Z"
}
```

### Update Profile

**Endpoint:** `PATCH /api/auth/profile/`

**Content-Type:** `multipart/form-data`

**Request Fields (all optional):**
- `full_name` (string)
- `phone` (string)
- `avatar` (file)
- `location` (string)
- `bio` (string)

**Response:** Updated user object

### Refresh Token

**Endpoint:** `POST /api/auth/refresh/`

**Request:**
```json
{
  "refresh": "refresh_token_here"
}
```

**Response:**
```json
{
  "access": "new_access_token"
}
```

### Logout

**Endpoint:** `POST /api/auth/logout/`

**Authentication:** Required

**Response:**
```json
{
  "message": "Successfully logged out"
}
```

### Forgot Password

**Endpoint:** `POST /api/auth/forgot-password/`

**Request:**
```json
{
  "email": "user@example.com"
}
```

**Response:**
```json
{
  "message": "Password reset link sent to your email"
}
```

**Note:** Backend must send email with reset link.

### Reset Password

**Endpoint:** `POST /api/auth/reset-password/:token/`

**Request:**
```json
{
  "token": "reset_token_from_email",
  "new_password": "newpassword123",
  "confirm_password": "newpassword123"
}
```

**Response:**
```json
{
  "message": "Password reset successfully"
}
```

---

## User Management

### Get User by ID (Public Profile)

**Endpoint:** `GET /api/users/:id/`

**Authentication:** Required (for viewing profiles)

**Response:**
```json
{
  "id": 1,
  "full_name": "John Doe",
  "email": "user@example.com",  // May be hidden based on privacy settings
  "role": "landlord",
  "phone": "+233241234567",  // May be hidden
  "avatar": "https://cloudinary.com/...",
  "verification_status": {
    "identity_verified": true,
    "background_check_status": "verified",
    "overall_status": "verified"
  },
  "ratings": {
    "average": 4.5,
    "total": 12
  },
  "trust_score": 85,
  "properties_count": 5,  // If landlord
  "services_count": 10,  // If artisan
  "jobs_completed": 45,  // If artisan
  "bookings_count": 3  // If tenant
}
```

### Update User (Self)

**Endpoint:** `PATCH /api/users/:id/`

**Authentication:** Required (own profile only, or admin)

**Request:** Same as Update Profile

---

## Property Management

### List Properties

**Endpoint:** `GET /api/properties/`

**Query Parameters:**
- `page` (integer, default: 1)
- `page_size` (integer, default: 20)
- `search` (string, optional)
- `city` (string, optional)
- `region` (string, optional)
- `min_price` (number, optional)
- `max_price` (number, optional)
- `bedrooms` (integer, optional)
- `bathrooms` (integer, optional)
- `property_type` (string, optional)
- `status` (string, optional: "available", "occupied", "pending")
- `latitude` (number, optional, for geographic search)
- `longitude` (number, optional)
- `radius` (number, optional, in km)

**Response:**
```json
{
  "count": 150,
  "next": "http://api.example.com/api/properties/?page=2",
  "previous": null,
  "results": [
    {
      "id": 1,
      "title": "Beautiful Apartment in East Legon",
      "description": "A modern 3-bedroom apartment...",
      "address": "East Legon, Accra",
      "city": "Accra",
      "region": "Greater Accra",
      "country": "Ghana",
      "latitude": 5.6037,
      "longitude": -0.1870,
      "priceGhs": 1500,
      "currency": "GHS",
      "bedrooms": 3,
      "bathrooms": 2,
      "sqm": 120,
      "property_type": "apartment",
      "status": "available",
      "images": [
        {
          "id": 1,
          "image": "https://cloudinary.com/...",
          "order": 1
        }
      ],
      "amenities": [
        {
          "id": 1,
          "name": "WiFi",
          "amenity": {
            "id": 1,
            "name": "WiFi"
          }
        }
      ],
      "landlord": {
        "id": 2,
        "full_name": "Jane Landlord",
        "business_type": "Individual",
        "ratings": {
          "average": 4.5,
          "total": 10
        },
        "verification_status": {
          "identity_verified": true,
          "background_check_status": "verified",
          "overall_status": "verified"
        }
      },
      "created_at": "2026-01-01T00:00:00Z",
      "updated_at": "2026-01-15T00:00:00Z"
    }
  ]
}
```

### Get Property by ID

**Endpoint:** `GET /api/properties/:id/`

**Response:** Single property object (same structure as list item)

### Create Property

**Endpoint:** `POST /api/properties/`

**Authentication:** Required (Landlord role)

**Content-Type:** `multipart/form-data`

**Request Fields:**
- `title` (string, required)
- `description` (string, required)
- `address` (string, required)
- `city` (string, required)
- `region` (string, required)
- `country` (string, default: "Ghana")
- `latitude` (number, optional)
- `longitude` (number, optional)
- `priceGhs` (number, required)
- `currency` (string, default: "GHS")
- `bedrooms` (integer, required)
- `bathrooms` (integer, required)
- `sqm` (number, optional)
- `property_type` (string, required: "apartment" | "house" | "studio" | "commercial")
- `images[]` (files, required, max 10)
- `amenities[]` (array of IDs, optional)

**Response:**
```json
{
  "id": 1,
  "title": "New Property",
  "status": "pending",
  "message": "Property created successfully. Awaiting admin approval."
}
```

**Note:** New properties start with `status: "pending"` and require admin approval.

### Update Property

**Endpoint:** `PATCH /api/properties/:id/`

**Authentication:** Required (Owner or Admin)

**Content-Type:** `multipart/form-data`

**Request:** Same fields as Create (all optional)

**Note:** Updating a property may reset status to "pending" for re-approval.

### Delete Property

**Endpoint:** `DELETE /api/properties/:id/`

**Authentication:** Required (Owner or Admin)

**Response:**
```json
{
  "message": "Property deleted successfully"
}
```

**Note:** Must be logged in audit log.

---

## Bookings & Viewing Requests

### Create Viewing Request

**Endpoint:** `POST /api/tenant/viewing-requests/`

**Authentication:** Required (Tenant role)

**Request:**
```json
{
  "propertyId": 1,
  "preferredDate": "2026-01-20",
  "message": "I'm interested in viewing this property"
}
```

**Response:**
```json
{
  "id": 1,
  "property": {
    "id": 1,
    "title": "Beautiful Apartment"
  },
  "tenant": {
    "id": 1,
    "full_name": "John Tenant"
  },
  "preferredDate": "2026-01-20",
  "status": "requested",
  "message": "I'm interested in viewing this property",
  "created_at": "2026-01-15T00:00:00Z"
}
```

**Note:** Backend must send email notification to landlord.

### List Viewing Requests (Landlord)

**Endpoint:** `GET /api/landlord/bookings/`

**Authentication:** Required (Landlord role)

**Query Parameters:**
- `status` (string, optional: "requested", "accepted", "declined", "completed")
- `page` (integer)

**Response:**
```json
{
  "count": 10,
  "results": [
    {
      "id": 1,
      "propertyId": 1,
      "propertyTitle": "Beautiful Apartment",
      "tenantId": 5,
      "tenantName": "John Tenant",
      "tenantEmail": "tenant@example.com",
      "phone": "+233241234567",
      "preferredDate": "2026-01-20",
      "dateRequested": "2026-01-15T00:00:00Z",
      "status": "requested",
      "message": "I'm interested in viewing"
    }
  ]
}
```

### Respond to Booking

**Endpoint:** `POST /api/landlord/bookings/:id/respond/`

**Authentication:** Required (Landlord role)

**Request:**
```json
{
  "action": "accept"  // or "decline"
}
```

**Response:**
```json
{
  "id": 1,
  "status": "accepted",
  "message": "Booking accepted successfully"
}
```

**Note:** Backend must send email notification to tenant.

---

## Wallet & Payments

### Get Wallet

**Endpoint:** `GET /api/wallet/`

**Authentication:** Required (Landlord, Artisan, Admin, Super Admin)

**Response:**
```json
{
  "id": 1,
  "balance": 5000.00,
  "currency": "GHS",
  "status": "active",
  "account_setup": {
    "bank_account": {
      "account_number": "1234567890",
      "bank_name": "GCB Bank",
      "account_name": "John Doe"
    },
    "mobile_money": {
      "network": "MTN",
      "number": "0241234567"
    }
  },
  "created_at": "2026-01-01T00:00:00Z"
}
```

### Setup Wallet

**Endpoint:** `POST /api/wallet/setup/`

**Authentication:** Required

**Request:**
```json
{
  "bank_account": {
    "account_number": "1234567890",
    "bank_name": "GCB Bank",
    "account_name": "John Doe"
  },
  "mobile_money": {
    "network": "MTN",
    "number": "0241234567"
  }
}
```

**Response:** Updated wallet object

### Wallet Top-Up (Initiate Paystack)

**Endpoint:** `POST /api/wallet/top-up/`

**Authentication:** Required

**Request:**
```json
{
  "amount": 100.00,
  "currency": "GHS"
}
```

**Response:**
```json
{
  "authorization_url": "https://checkout.paystack.com/...",
  "access_code": "access_code_here",
  "reference": "reference_here"
}
```

### Verify Paystack Payment

**Endpoint:** `POST /api/payments/verify-paystack/`

**Request:**
```json
{
  "reference": "payment_reference"
}
```

**Response:**
```json
{
  "status": "success",
  "amount": 100.00,
  "transaction": {
    "id": 1,
    "type": "wallet_topup",
    "amount": 100.00,
    "status": "completed",
    "reference": "reference_here"
  }
}
```

**Note:** Backend must send email receipt.

### Get Wallet Transactions

**Endpoint:** `GET /api/wallet/transactions/`

**Authentication:** Required

**Query Parameters:**
- `page` (integer)
- `type` (string, optional: "topup", "withdrawal", "payment", "refund")
- `start_date` (date, optional)
- `end_date` (date, optional)

**Response:**
```json
{
  "count": 50,
  "results": [
    {
      "id": 1,
      "type": "topup",
      "amount": 100.00,
      "currency": "GHS",
      "status": "completed",
      "reference": "paystack_ref_123",
      "description": "Wallet top-up",
      "created_at": "2026-01-15T00:00:00Z"
    }
  ]
}
```

### Premium Upgrade (Paystack)

**Endpoint:** `POST /api/payments/premium/upgrade/`

**Authentication:** Required

**Request:**
```json
{
  "plan": "monthly",  // or "yearly"
  "amount": 49.00
}
```

**Response:**
```json
{
  "authorization_url": "https://checkout.paystack.com/...",
  "access_code": "access_code_here",
  "reference": "reference_here"
}
```

**Note:** After payment verification, backend must:
1. Activate premium subscription
2. Send email receipt
3. Update user's premium status

---

## Messaging System

### List Conversations

**Endpoint:** `GET /api/messages/conversations/`

**Authentication:** Required

**Query Parameters:**
- `page` (integer)

**Response:**
```json
{
  "count": 10,
  "results": [
    {
      "id": 1,
      "participant": {
        "id": 2,
        "full_name": "Jane Landlord",
        "avatar": "https://cloudinary.com/...",
        "role": "landlord"
      },
      "last_message": {
        "id": 100,
        "content": "Hello, I'm interested in your property",
        "created_at": "2026-01-15T10:00:00Z",
        "sender_id": 1
      },
      "unread_count": 2,
      "updated_at": "2026-01-15T10:00:00Z"
    }
  ]
}
```

### Get Conversation Messages

**Endpoint:** `GET /api/messages/conversations/:id/messages/`

**Authentication:** Required

**Query Parameters:**
- `page` (integer)
- `page_size` (integer, default: 50)

**Response:**
```json
{
  "conversation": {
    "id": 1,
    "participant": {
      "id": 2,
      "full_name": "Jane Landlord"
    }
  },
  "count": 25,
  "results": [
    {
      "id": 1,
      "sender": {
        "id": 1,
        "full_name": "John Tenant"
      },
      "content": "Hello, I'm interested in your property",
      "is_read": false,
      "attachments": [],
      "created_at": "2026-01-15T10:00:00Z"
    }
  ]
}
```

### Send Message

**Endpoint:** `POST /api/messages/send/`

**Authentication:** Required

**Content-Type:** `multipart/form-data` (if attachments) or `application/json`

**Request:**
```json
{
  "conversation_id": 1,  // Optional if starting new conversation
  "recipient_id": 2,  // Required if new conversation
  "content": "Hello, I'm interested in your property",
  "attachments": []  // Array of file URLs (uploaded separately)
}
```

**Response:**
```json
{
  "id": 101,
  "conversation_id": 1,
  "sender": {
    "id": 1,
    "full_name": "John Tenant"
  },
  "content": "Hello, I'm interested in your property",
  "is_read": false,
  "attachments": [],
  "created_at": "2026-01-15T10:05:00Z"
}
```

**Note:** Backend must:
1. Validate messaging rules (can tenant message landlord, etc.)
2. Create conversation if doesn't exist
3. Send email notification to recipient
4. Support encrypted content (if encryption is enabled)

### Create Conversation

**Endpoint:** `POST /api/messages/conversations/`

**Authentication:** Required

**Request:**
```json
{
  "recipient_id": 2
}
```

**Response:**
```json
{
  "id": 1,
  "participant": {
    "id": 2,
    "full_name": "Jane Landlord"
  },
  "created_at": "2026-01-15T00:00:00Z"
}
```

### Mark Messages as Read

**Endpoint:** `POST /api/messages/conversations/:id/read/`

**Authentication:** Required

**Response:**
```json
{
  "message": "Messages marked as read"
}
```

### Upload Message Attachment

**Endpoint:** `POST /api/messages/attachments/`

**Authentication:** Required

**Content-Type:** `multipart/form-data`

**Request:**
- `file` (file, required)

**Response:**
```json
{
  "url": "https://cloudinary.com/...",
  "public_id": "messages/abc123",
  "file_type": "image/jpeg",
  "file_size": 1024000
}
```

---

## Reviews & Ratings

### Get Reviews for Property

**Endpoint:** `GET /api/reviews/property/:propertyId/`

**Query Parameters:**
- `page` (integer)

**Response:**
```json
{
  "property_id": 1,
  "average_rating": 4.5,
  "total_reviews": 12,
  "rating_breakdown": {
    "5": 8,
    "4": 3,
    "3": 1,
    "2": 0,
    "1": 0
  },
  "reviews": [
    {
      "id": 1,
      "reviewer": {
        "id": 5,
        "full_name": "John Tenant",
        "avatar": "https://cloudinary.com/..."
      },
      "rating": 5,
      "comment": "Excellent property and landlord!",
      "review_type": "property",
      "target_id": 1,
      "status": "approved",
      "created_at": "2026-01-10T00:00:00Z"
    }
  ]
}
```

### Get Reviews for User

**Endpoint:** `GET /api/reviews/user/:userId/`

**Query Parameters:**
- `review_type` (string, optional: "landlord", "tenant", "artisan")
- `page` (integer)

**Response:**
```json
{
  "user_id": 2,
  "average_rating": 4.5,
  "total_reviews": 10,
  "rating_breakdown": {
    "5": 7,
    "4": 2,
    "3": 1
  },
  "reviews": [...]
}
```

### Create Review

**Endpoint:** `POST /api/reviews/`

**Authentication:** Required

**Request:**
```json
{
  "review_type": "property",  // "property", "landlord", "tenant", "artisan"
  "target_id": 1,  // Property ID, User ID, etc.
  "rating": 5,  // 1-5
  "comment": "Excellent property!",
  "title": "Great experience"  // Optional
}
```

**Response:**
```json
{
  "id": 1,
  "review_type": "property",
  "target_id": 1,
  "rating": 5,
  "comment": "Excellent property!",
  "status": "pending",  // Requires moderation
  "message": "Review submitted successfully. Awaiting moderation."
}
```

**Validation Rules:**
- Property reviews: Only verified tenants who have occupied/currently occupy the property
- Landlord reviews: Only tenants who have had booking interactions
- Tenant reviews: Only landlords who have interacted with the tenant
- Artisan reviews: Only users who have assigned tasks to the artisan

### Moderate Review (Admin)

**Endpoint:** `POST /api/admin/reviews/:id/moderate/`

**Authentication:** Required (Admin role)

**Request:**
```json
{
  "action": "approve"  // or "reject"
}
```

---

## Background Checks & Verification

### Get User Verification Status

**Endpoint:** `GET /api/admin/users/:id/verification/`

**Authentication:** Required (Admin, Super Admin)

**Response:**
```json
{
  "user_id": 1,
  "verification_status": {
    "identity_verified": true,
    "background_check_status": "verified",  // "unverified", "pending", "verified", "rejected"
    "payment_verified": true,
    "document_verified": true,
    "overall_status": "verified"
  },
  "background_check": {
    "requested_at": "2026-01-01T00:00:00Z",
    "completed_at": "2026-01-05T00:00:00Z",
    "status": "verified",
    "checked_by": {
      "id": 10,
      "full_name": "Admin User"
    }
  }
}
```

### Update Verification Status

**Endpoint:** `PATCH /api/admin/users/:id/verification/`

**Authentication:** Required (Admin, Super Admin)

**Request:**
```json
{
  "identity_verified": true,
  "background_check_status": "verified",
  "payment_verified": true,
  "document_verified": true,
  "overall_status": "verified"
}
```

**Note:** Must be logged in audit log.

### Initiate Background Check

**Endpoint:** `POST /api/admin/users/:id/background-check/`

**Authentication:** Required (Admin, Super Admin)

**Request:**
```json
{
  "reason": "Tenant application requires verification"
}
```

**Response:**
```json
{
  "id": 1,
  "user_id": 1,
  "status": "pending",
  "requested_at": "2026-01-15T00:00:00Z",
  "requested_by": {
    "id": 10,
    "full_name": "Admin User"
  }
}
```

### Get Pending Background Checks

**Endpoint:** `GET /api/admin/background-checks/pending/`

**Authentication:** Required (Admin, Super Admin)

**Response:**
```json
{
  "count": 5,
  "results": [
    {
      "id": 1,
      "user": {
        "id": 5,
        "full_name": "John Tenant",
        "email": "tenant@example.com"
      },
      "status": "pending",
      "requested_at": "2026-01-15T00:00:00Z",
      "requested_by": {
        "id": 10,
        "full_name": "Admin User"
      }
    }
  ]
}
```

### Approve Background Check

**Endpoint:** `POST /api/admin/background-checks/:id/approve/`

**Authentication:** Required (Admin, Super Admin)

**Response:**
```json
{
  "id": 1,
  "status": "verified",
  "approved_at": "2026-01-15T00:00:00Z",
  "approved_by": {
    "id": 10,
    "full_name": "Admin User"
  }
}
```

**Note:** Must be logged in audit log.

### Reject Background Check

**Endpoint:** `POST /api/admin/background-checks/:id/reject/`

**Authentication:** Required (Admin, Super Admin)

**Request:**
```json
{
  "reason": "Background check revealed issues"
}
```

**Response:**
```json
{
  "id": 1,
  "status": "rejected",
  "rejected_at": "2026-01-15T00:00:00Z",
  "rejected_by": {
    "id": 10,
    "full_name": "Admin User"
  },
  "reason": "Background check revealed issues"
}
```

---

## Admin Functions

### Get Pending Users

**Endpoint:** `GET /api/admin/users/pending/`

**Authentication:** Required (Admin role, `canApproveUsers` permission)

**Query Parameters:**
- `role` (string, optional: "landlord", "artisan")
- `page` (integer)

**Response:**
```json
{
  "count": 5,
  "users": [
    {
      "id": 2,
      "full_name": "Jane Landlord",
      "email": "landlord@example.com",
      "phone": "+233241234567",
      "role": "landlord",
      "status": "pending",
      "business_type": "Individual",
      "created_at": "2026-01-10T00:00:00Z"
    }
  ]
}
```

### Approve User

**Endpoint:** `POST /api/admin/users/:id/approve/`

**Authentication:** Required (Admin role, `canApproveUsers` permission)

**Request (optional):**
```json
{
  "message": "Welcome to RentalConnects!"
}
```

**Response:**
```json
{
  "id": 2,
  "status": "active",
  "message": "User approved successfully"
}
```

**Note:** Backend must:
1. Send approval email to user
2. Log action in audit log

### Reject User

**Endpoint:** `POST /api/admin/users/:id/reject/`

**Authentication:** Required (Admin role, `canApproveUsers` permission)

**Request:**
```json
{
  "reason": "Incomplete documentation"
}
```

**Response:**
```json
{
  "id": 2,
  "status": "rejected",
  "message": "User rejected successfully"
}
```

**Note:** Backend must send rejection email with reason.

### Suspend User

**Endpoint:** `POST /api/admin/users/:id/suspend/`

**Authentication:** Required (Admin role, `canApproveUsers` permission)

**Request:**
```json
{
  "reason": "Violation of terms",
  "duration_days": 30  // Optional, permanent if not provided
}
```

**Response:**
```json
{
  "id": 2,
  "status": "suspended",
  "suspended_until": "2026-02-15T00:00:00Z",  // null if permanent
  "message": "User suspended successfully"
}
```

### Get Pending Properties

**Endpoint:** `GET /api/admin/properties/pending/`

**Authentication:** Required (Admin role, `canApproveProperties` permission)

**Response:**
```json
{
  "count": 3,
  "data": [
    {
      "id": 5,
      "title": "New Property Listing",
      "landlord": {
        "id": 2,
        "full_name": "Jane Landlord"
      },
      "status": "pending",
      "created_at": "2026-01-14T00:00:00Z"
    }
  ]
}
```

### Approve Property

**Endpoint:** `POST /api/admin/properties/:id/approve/`

**Authentication:** Required (Admin role, `canApproveProperties` permission)

**Response:**
```json
{
  "id": 5,
  "status": "approved",
  "message": "Property approved successfully"
}
```

### Reject Property

**Endpoint:** `POST /api/admin/properties/:id/reject/`

**Authentication:** Required (Admin role, `canApproveProperties` permission)

**Request:**
```json
{
  "reason": "Incomplete information"
}
```

**Response:**
```json
{
  "id": 5,
  "status": "rejected",
  "message": "Property rejected"
}
```

### Get Admin Reports

**Endpoint:** `GET /api/admin/reports/`

**Authentication:** Required (Admin role)

**Query Parameters:**
- `type` (string, optional: "users", "properties", "bookings", "payments")
- `start_date` (date, optional)
- `end_date` (date, optional)
- `format` (string, optional: "json", "csv")

**Response:**
```json
{
  "type": "users",
  "period": {
    "start": "2026-01-01",
    "end": "2026-01-31"
  },
  "summary": {
    "total": 100,
    "new": 20,
    "active": 80,
    "pending": 5
  },
  "data": [...]
}
```

### Get Admin Insights

**Endpoint:** `GET /api/admin/insights/`

**Authentication:** Required (Admin role)

**Response:**
```json
{
  "pending_users": 5,
  "pending_properties": 3,
  "pending_maintenance": 10,
  "recent_activities": [...]
}
```

---

## Super Admin Functions

### Get System Stats

**Endpoint:** `GET /api/super-admin/system/stats/`

**Authentication:** Required (Super Admin role)

**Response:**
```json
{
  "total_users": 1000,
  "active_users": 850,
  "pending_users": 5,
  "active_properties": 500,
  "pending_properties": 3,
  "total_bookings": 2000,
  "revenue_this_month": 50000.00,
  "system_health": {
    "cpu": 62,
    "memory": 71,
    "api_latency": 92,
    "uptime": "99.97%"
  },
  "role_distribution": {
    "tenant": 700,
    "landlord": 250,
    "artisan": 40,
    "admin": 5,
    "super-admin": 2
  }
}
```

### Get All Users

**Endpoint:** `GET /api/super-admin/users/`

**Authentication:** Required (Super Admin role)

**Query Parameters:**
- `role` (string, optional)
- `status` (string, optional: "active", "pending", "suspended", "rejected")
- `search` (string, optional)
- `page` (integer)

**Response:**
```json
{
  "count": 1000,
  "results": [
    {
      "id": 1,
      "email": "user@example.com",
      "full_name": "John Doe",
      "role": "landlord",
      "status": "active",
      "created_at": "2026-01-01T00:00:00Z"
    }
  ]
}
```

### Create User (Super Admin)

**Endpoint:** `POST /api/super-admin/users/`

**Authentication:** Required (Super Admin role)

**Request:**
```json
{
  "email": "newuser@example.com",
  "full_name": "New User",
  "password": "password123",
  "role": "admin",
  "status": "active"
}
```

**Response:** Created user object

### Delete User

**Endpoint:** `DELETE /api/super-admin/users/:id/`

**Authentication:** Required (Super Admin role)

**Response:**
```json
{
  "message": "User deleted successfully"
}
```

### Get Audit Logs

**Endpoint:** `GET /api/super-admin/audit/`

**Authentication:** Required (Super Admin role)

**Query Parameters:**
- `user_id` (integer, optional)
- `action_type` (string, optional)
- `start_date` (date, optional)
- `end_date` (date, optional)
- `page` (integer)

**Response:**
```json
{
  "count": 500,
  "results": [
    {
      "id": 1,
      "user": {
        "id": 10,
        "full_name": "Admin User",
        "role": "admin"
      },
      "action_type": "user_approved",
      "target_user": {
        "id": 2,
        "full_name": "Jane Landlord"
      },
      "details": "User approved for landlord role",
      "ip_address": "192.168.1.1",
      "created_at": "2026-01-15T00:00:00Z"
    }
  ]
}
```

### Assign Role

**Endpoint:** `POST /api/super-admin/roles/assign/`

**Authentication:** Required (Super Admin role)

**Request:**
```json
{
  "user_id": 5,
  "role": "admin",
  "permissions": {
    "canApproveUsers": true,
    "canApproveProperties": true
  }
}
```

**Response:**
```json
{
  "user_id": 5,
  "role": "admin",
  "permissions": {
    "canApproveUsers": true,
    "canApproveProperties": true
  },
  "message": "Role assigned successfully"
}
```

### Get Premium Pricing

**Endpoint:** `GET /api/super-admin/premium/pricing/`

**Authentication:** Required (Super Admin role)

**Response:**
```json
{
  "monthly": 49.0,
  "yearly": 490.0,
  "currency": "GHS",
  "enabled": true,
  "listingFee": 5.0,
  "adPromotionFee": 10.0,
  "featuredListingFee": 15.0,
  "upgradeFee": 0.0
}
```

### Update Premium Pricing

**Endpoint:** `PATCH /api/super-admin/premium/pricing/`

**Authentication:** Required (Super Admin role)

**Request:**
```json
{
  "monthly": 49.0,
  "yearly": 490.0,
  "currency": "GHS",
  "enabled": true,
  "listingFee": 5.0,
  "adPromotionFee": 10.0,
  "featuredListingFee": 15.0,
  "upgradeFee": 0.0
}
```

**Response:** Updated pricing object

**Note:** Changes must be immediately reflected in public pricing endpoint.

---

## Marketing & Campaigns

### Send Marketing Email

**Endpoint:** `POST /api/admin/marketing/email/`

**Authentication:** Required (Admin, Super Admin role)

**Request:**
```json
{
  "subject": "Welcome to RentalConnects",
  "message": "We're excited to have you...",
  "user_ids": [1, 2, 3],  // Array of user IDs, or null for all users
  "target_role": "landlord",  // Optional, filter by role
  "target_all": false  // If true, send to all users (ignores user_ids)
}
```

**Response:**
```json
{
  "success": true,
  "sent_to": 150,
  "campaign_id": 1,
  "message": "Email sent to 150 users"
}
```

**Note:** Backend must:
1. Support media attachments (if provided)
2. Store campaign in history
3. Handle email sending (queue recommended)

### Send Marketing SMS

**Endpoint:** `POST /api/admin/marketing/sms/`

**Authentication:** Required (Admin, Super Admin role)

**Request:**
```json
{
  "message": "Welcome to RentalConnects!",
  "user_ids": [1, 2, 3],
  "target_role": "landlord",
  "target_all": false
}
```

**Response:**
```json
{
  "success": true,
  "sent_to": 150,
  "campaign_id": 2,
  "message": "SMS sent to 150 users"
}
```

**Validation:** Message must be ≤ 160 characters.

### Get Campaign History

**Endpoint:** `GET /api/admin/marketing/history/`

**Authentication:** Required (Admin, Super Admin role)

**Query Parameters:**
- `type` (string, optional: "email", "sms")
- `page` (integer)

**Response:**
```json
{
  "count": 20,
  "results": [
    {
      "id": 1,
      "type": "email",
      "subject": "Welcome to RentalConnects",
      "sent_to": 150,
      "created_by": {
        "id": 10,
        "full_name": "Admin User"
      },
      "created_at": "2026-01-15T00:00:00Z"
    }
  ]
}
```

---

## Ads Management

### List Ads

**Endpoint:** `GET /api/ads/`

**Query Parameters:**
- `placement` (string, optional: "banner", "card", "inline")
- `role` (string, optional: "tenant", "landlord", "artisan")
- `page` (integer)

**Response:**
```json
{
  "count": 10,
  "results": [
    {
      "id": 1,
      "title": "Premium Listing Promotion",
      "description": "Boost your property visibility",
      "image": "https://cloudinary.com/...",
      "link": "https://example.com",
      "placement": "banner",
      "target_roles": ["landlord"],
      "is_active": true,
      "created_at": "2026-01-10T00:00:00Z"
    }
  ]
}
```

### Create Ad

**Endpoint:** `POST /api/ads/`

**Authentication:** Required (Landlord, Artisan role, `advertisement_manager` feature)

**Content-Type:** `multipart/form-data`

**Request Fields:**
- `title` (string, required)
- `description` (string, required)
- `image` (file, required)
- `link` (string, optional)
- `placement` (string, required: "banner", "card", "inline")
- `duration_days` (integer, optional)

**Response:**
```json
{
  "id": 1,
  "title": "My Property Promotion",
  "status": "pending",
  "message": "Ad created successfully. Awaiting approval."
}
```

**Note:** Ads require admin approval before going live.

### Update Ad

**Endpoint:** `PATCH /api/ads/:id/`

**Authentication:** Required (Owner or Admin)

**Content-Type:** `multipart/form-data`

**Request:** Same fields as Create (all optional)

### Delete Ad

**Endpoint:** `DELETE /api/ads/:id/`

**Authentication:** Required (Owner or Admin)

**Response:**
```json
{
  "message": "Ad deleted successfully"
}
```

---

## Notifications

### Get Notifications

**Endpoint:** `GET /api/notifications/`

**Authentication:** Required

**Query Parameters:**
- `is_read` (boolean, optional)
- `notification_type` (string, optional)
- `page` (integer)

**Response:**
```json
{
  "count": 20,
  "results": [
    {
      "id": 1,
      "type": "booking_accepted",
      "title": "Viewing Request Accepted",
      "message": "Your viewing request for 'Beautiful Apartment' has been accepted",
      "is_read": false,
      "action_url": "/tenant/viewing-requests",
      "created_at": "2026-01-15T00:00:00Z"
    }
  ]
}
```

### Mark Notification as Read

**Endpoint:** `PATCH /api/notifications/:id/`

**Authentication:** Required

**Request:**
```json
{
  "is_read": true
}
```

**Response:**
```json
{
  "id": 1,
  "is_read": true
}
```

### Mark All Notifications as Read

**Endpoint:** `POST /api/notifications/mark-all-read/`

**Authentication:** Required

**Response:**
```json
{
  "message": "All notifications marked as read"
}
```

### Get Unread Count

**Endpoint:** `GET /api/notifications/unread-count/`

**Authentication:** Required

**Response:**
```json
{
  "unread_count": 5
}
```

---

## Announcements

### Get Announcements

**Endpoint:** `GET /api/announcements/`

**Authentication:** Optional (public announcements)

**Query Parameters:**
- `is_active` (boolean, default: true)

**Response:**
```json
{
  "count": 3,
  "results": [
    {
      "id": 1,
      "title": "Welcome to RentalConnects!",
      "message": "We're excited to have you on board...",
      "severity": "info",  // "info", "warning", "error", "success"
      "is_active": true,
      "created_at": "2026-01-13T00:00:00Z",
      "updated_at": "2026-01-13T00:00:00Z"
    }
  ]
}
```

---

## Analytics & Reports

### Get Landlord Analytics

**Endpoint:** `GET /api/landlord/analytics/`

**Authentication:** Required (Landlord role, `landlord_advanced_analytics` feature)

**Query Parameters:**
- `start_date` (date, optional)
- `end_date` (date, optional)

**Response:**
```json
{
  "properties": {
    "total": 10,
    "available": 5,
    "occupied": 5
  },
  "bookings": {
    "total": 50,
    "pending": 5,
    "accepted": 40,
    "declined": 5
  },
  "revenue": {
    "this_month": 5000.00,
    "last_month": 4500.00,
    "total": 50000.00
  },
  "views": {
    "total": 1000,
    "this_month": 150
  }
}
```

---

## Lease Management

### Get System Lease Templates

**Endpoint:** `GET /api/leases/system/`

**Authentication:** Required

**Response:**
```json
{
  "leases": [
    {
      "id": "standard-residential",
      "title": "Standard Residential Lease",
      "description": "Standard lease agreement for residential properties in Ghana",
      "file_url": "/api/leases/system/standard-residential.pdf",
      "file_type": "pdf",
      "version": "1.0",
      "updated_at": "2024-01-15T00:00:00Z"
    }
  ]
}
```

### Download System Lease Template

**Endpoint:** `GET /api/leases/system/:lease_id/download/`

**Authentication:** Required

**Query Parameters:**
- `format` (string, optional): Format to download (`pdf`, `docx`, or `doc`). Default: `pdf`

**Response:** File blob (PDF, DOCX, or DOC)

### Update System Lease Template

**Endpoint:** `PATCH /api/leases/system/:lease_id/`

**Authentication:** Required (Admin/Super Admin only)

**Content-Type:** `multipart/form-data`

**Request Body:**
- `file` (file, optional): Updated lease file
- `title` (string, optional): Updated title
- `description` (string, optional): Updated description

**Response:**
```json
{
  "id": "standard-residential",
  "title": "Updated Lease Title",
  "description": "Updated description",
  "file_url": "/api/leases/system/standard-residential.pdf",
  "updated_at": "2024-01-20T00:00:00Z",
  "version": "1.1"
}
```

### Create System Lease Template

**Endpoint:** `POST /api/leases/system/`

**Authentication:** Required (Super Admin only)

**Content-Type:** `multipart/form-data`

**Request Body:**
- `file` (file, required): Lease file (PDF, DOCX, or DOC)
- `title` (string, required): Lease title
- `description` (string, required): Lease description

**Response:**
```json
{
  "id": "new-lease-template",
  "title": "New Lease Template",
  "description": "Description",
  "file_url": "/api/leases/system/new-lease-template.pdf",
  "version": "1.0",
  "created_at": "2024-01-20T00:00:00Z"
}
```

### Get Landlord Custom Leases

**Endpoint:** `GET /api/leases/landlord/`

**Authentication:** Required (Landlord only)

**Response:**
```json
{
  "leases": [
    {
      "id": "custom-1",
      "title": "Custom Lease Agreement",
      "description": "Landlord's custom lease terms",
      "file_url": "/api/leases/custom/custom-1.pdf",
      "file_type": "pdf",
      "property_id": "prop-1",
      "property_title": "Luxury Apartment",
      "created_at": "2024-01-20T00:00:00Z",
      "updated_at": "2024-01-20T00:00:00Z"
    }
  ]
}
```

### Upload Custom Lease

**Endpoint:** `POST /api/leases/landlord/upload/`

**Authentication:** Required (Landlord only)

**Content-Type:** `multipart/form-data`

**Request Body:**
- `file` (file, required): Lease file (PDF, DOCX, or DOC)
- `property_id` (string, optional): Associated property ID
- `title` (string, optional): Lease title
- `description` (string, optional): Lease description

**Response:**
```json
{
  "id": "custom-123",
  "title": "Custom Lease",
  "description": "Description",
  "file_url": "/api/leases/custom/custom-123.pdf",
  "property_id": "prop-1",
  "created_at": "2024-01-20T00:00:00Z"
}
```

### Download Custom Lease

**Endpoint:** `GET /api/leases/custom/:lease_id/download/`

**Authentication:** Required

**Response:** File blob (PDF, DOCX, or DOC)

### Sign Lease

**Endpoint:** `POST /api/leases/:lease_id/sign/`

**Authentication:** Required (Tenant only)

**Content-Type:** `multipart/form-data`

**Request Body:**
- `signed_file` (file, required): Signed lease file (PDF)
- `property_id` (string, required): Property ID
- `landlord_id` (string, required): Landlord ID

**Response:**
```json
{
  "id": "signed-123",
  "lease_id": "lease-1",
  "property_id": "prop-1",
  "landlord_id": "landlord-1",
  "tenant_id": "tenant-1",
  "signed_file_url": "/api/leases/signed/signed-123.pdf",
  "signed_at": "2024-01-20T00:00:00Z",
  "status": "pending_landlord_approval"
}
```

### Get Signed Leases for Property

**Endpoint:** `GET /api/leases/property/:property_id/signed/`

**Authentication:** Required

**Response:**
```json
{
  "leases": [
    {
      "id": "signed-123",
      "lease_id": "lease-1",
      "lease_title": "Standard Residential Lease",
      "property_id": "prop-1",
      "tenant_id": "tenant-1",
      "tenant_name": "John Doe",
      "signed_file_url": "/api/leases/signed/signed-123.pdf",
      "signed_at": "2024-01-20T00:00:00Z",
      "status": "approved"
    }
  ]
}
```

**Note:** Backend must:
1. Support multiple file formats (PDF, DOCX, DOC)
2. Store files securely (Cloudinary or similar)
3. Track lease versions
4. Send email notifications when leases are signed
5. Support approval workflow (pending → approved/rejected)

## Preferences & Settings

### Get User Preferences

**Endpoint:** `GET /api/auth/preferences/`

**Authentication:** Required

**Response:**
```json
{
  "emailNotifications": true,
  "smsNotifications": false,
  "twoFactorAuth": false,
  "profileVisibility": "public",  // "public", "private", "friends"
  "marketingEmails": true,
  "dataSharing": false,
  "language": "en"  // "en", "fr"
}
```

### Update Preferences

**Endpoint:** `PATCH /api/auth/preferences/`

**Authentication:** Required

**Request (partial update supported):**
```json
{
  "emailNotifications": false,
  "language": "fr"
}
```

**Response:** Updated preferences object

---

## File Uploads

### Upload Image (Cloudinary)

**Endpoint:** `POST /api/upload/image/`

**Authentication:** Required

**Content-Type:** `multipart/form-data`

**Request:**
- `file` (file, required)
- `folder` (string, optional: "properties", "profiles", "ads", etc.)

**Response:**
```json
{
  "url": "https://res.cloudinary.com/.../image/upload/v1234567890/abc123.jpg",
  "public_id": "properties/abc123",
  "secure_url": "https://res.cloudinary.com/.../image/upload/v1234567890/abc123.jpg",
  "format": "jpg",
  "width": 1920,
  "height": 1080,
  "bytes": 250000
}
```

**Supported Formats:**
- Images: jpg, jpeg, png, gif, webp
- Max file size: 10MB per file

### Upload Document

**Endpoint:** `POST /api/upload/document/`

**Authentication:** Required

**Content-Type:** `multipart/form-data`

**Request:**
- `file` (file, required)
- `document_type` (string, optional: "id", "contract", "invoice")

**Response:**
```json
{
  "url": "https://cloudinary.com/.../documents/abc123.pdf",
  "public_id": "documents/abc123",
  "format": "pdf",
  "bytes": 500000
}
```

**Supported Formats:**
- Documents: pdf, doc, docx
- Max file size: 5MB per file

---

## Public Endpoints

### Get Public Pricing

**Endpoint:** `GET /api/public/pricing/`

**Authentication:** Not required

**Response:**
```json
{
  "monthly": 49.0,
  "yearly": 490.0,
  "currency": "GHS",
  "enabled": true,
  "listingFee": 5.0,
  "adPromotionFee": 10.0,
  "featuredListingFee": 15.0,
  "upgradeFee": 0.0
}
```

**Note:** This endpoint must always be accessible and reflect current Super Admin pricing.

---

## Error Handling

### HTTP Status Codes

- `200` - Success (GET, PATCH)
- `201` - Created (POST)
- `204` - No Content (DELETE)
- `400` - Bad Request (validation errors)
- `401` - Unauthorized (missing/invalid token)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found
- `409` - Conflict (e.g., email already exists)
- `422` - Unprocessable Entity (validation errors)
- `500` - Internal Server Error

### Error Response Format

```json
{
  "detail": "Error message here",
  "errors": {
    "field_name": ["Error for this field"]
  },
  "code": "ERROR_CODE"
}
```

**Example:**
```json
{
  "detail": "Validation failed",
  "errors": {
    "email": ["This email is already registered"],
    "password": ["Password must be at least 8 characters"]
  }
}
```

---

## Response Formats

### Standard List Response

```json
{
  "count": 100,
  "next": "http://api.example.com/api/resource/?page=2",
  "previous": "http://api.example.com/api/resource/?page=1",
  "results": [...]
}
```

### Standard Object Response

```json
{
  "id": 1,
  "field1": "value1",
  "field2": "value2",
  ...
}
```

### Pagination

Default pagination:
- `page_size`: 20
- `page`: 1

Query parameters:
- `page`: Page number (1-indexed)
- `page_size`: Items per page (max 100)

---

## Mock Mode Support

### Mock Mode Detection

Backend should respect mock mode when `VITE_USE_MOCK=true`:

1. **Return Mock Data:** Provide realistic but clearly test data
2. **Maintain Structure:** Mock responses must match real API structure
3. **Support All Operations:** Mock mode should support CRUD operations
4. **Clear Indicators:** Mock responses should indicate mock mode

### Mock Data Requirements

- Mock data should be realistic
- Mock data should be clearly distinguishable from production
- Mock endpoints should support all query parameters
- Mock responses should include proper pagination

---

## Additional Notes

### Email Notifications

Backend must send email notifications for:
- Account approval/rejection/suspension
- Password reset
- Booking accept/decline
- Payment receipts
- New messages (optional, can be disabled)
- System announcements

### Audit Logging

All critical actions must be logged:
- User approvals/rejections/suspensions
- Property approvals/rejections/deletions
- Background check approvals/rejections
- Role assignments
- Pricing changes
- Property deletions

### Real-Time Updates

Consider implementing WebSockets or Server-Sent Events for:
- Real-time notifications
- New messages
- Booking status updates

---

**Last Updated:** January 15, 2026  
**Version:** 2.0.0  
**Status:** Complete Reference
