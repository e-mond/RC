# RentalConnects API Reference

> Compiled API Endpoints for Backend Team  
> Last Updated: January 2026

---

## Base Configuration

```
Base URL: ${VITE_API_BASE_URL}
Default: https://api.rentalconnects.com/api/v1

Authentication: Bearer Token (JWT)
Content-Type: application/json (default)
Content-Type: multipart/form-data (file uploads)
```

---

## Table of Contents

1. [Authentication](#1-authentication)
2. [Users](#2-users)
3. [Properties](#3-properties)
4. [Bookings](#4-bookings)
5. [Artisans](#5-artisans)
6. [Notifications](#6-notifications)
7. [Reviews](#7-reviews)
8. [Payments/Wallet](#8-paymentswallet)
9. [Admin](#9-admin)
10. [Super Admin](#10-super-admin)
11. [AI Services](#11-ai-services)
12. [Preferences](#12-preferences)

---

## 1. Authentication

### Register User
```http
POST /auth/signup/{role}/
Content-Type: multipart/form-data

# Common fields
email: string (required)
password: string (required, min 8 chars)
confirmPassword: string (required)
fullName: string (required)
phone: string (required)

# Role-specific fields (artisan)
profession: string
experience: number
region: string
profilePhoto: File (required for artisan)
workSamples: File[] (max 5)
idUpload: File

Response: 201 Created
{
  "message": "Registration successful",
  "user": { id, email, fullName, role, status: "pending" }
}
```

### Login
```http
POST /auth/login/
{
  "email": "string",
  "password": "string"
}

Response: 200 OK
{
  "access_token": "jwt_token",
  "refresh_token": "refresh_token",
  "user": { id, email, fullName, role, status }
}

Error Responses:
- 401: Invalid credentials
- 403 (AccountSuspendedError): { error, reason, suspended_at, suspended_until }
- 403 (AccountBannedError): { error, reason, banned_at }
```

### Refresh Token
```http
POST /auth/token/refresh/
{
  "refresh_token": "string"
}

Response: 200 OK
{
  "access_token": "new_jwt_token"
}
```

### Logout
```http
POST /auth/logout/
Authorization: Bearer <token>

Response: 200 OK
```

### 2FA Setup
```http
POST /auth/2fa/setup/
Authorization: Bearer <token>

Response: 200 OK
{
  "secret": "TOTP_SECRET",
  "qr_code_url": "otpauth://totp/...",
  "manual_entry_key": "SECRET_KEY"
}
```

### 2FA Verify
```http
POST /auth/2fa/verify/
Authorization: Bearer <token>
{
  "code": "123456",
  "secret": "TOTP_SECRET"
}

Response: 200 OK
{
  "success": true,
  "backup_codes": ["XXXX-XXXX", "XXXX-XXXX", ...]
}
```

### 2FA Disable
```http
POST /auth/2fa/disable/
Authorization: Bearer <token>
{
  "code": "123456"
}

Response: 200 OK
```

---

## 2. Users

### Get Current User
```http
GET /users/me/
Authorization: Bearer <token>

Response: 200 OK
{
  "id": "user_123",
  "email": "user@example.com",
  "fullName": "John Doe",
  "phone": "+233241234567",
  "role": "tenant",
  "status": "active",
  "created_at": "2024-01-15T10:00:00Z"
}
```

### Update Profile
```http
PUT /users/me/
Authorization: Bearer <token>
Content-Type: multipart/form-data

fullName: string
phone: string
bio: string
avatar: File

Response: 200 OK
```

### Change Password
```http
POST /users/me/change-password/
Authorization: Bearer <token>
{
  "current_password": "string",
  "new_password": "string",
  "confirm_password": "string"
}

Response: 200 OK
```

---

## 3. Properties

### List Properties (Public)
```http
GET /properties/
Query params:
  - search: string
  - location: string
  - min_price: number
  - max_price: number
  - bedrooms: number
  - property_type: string
  - page: number
  - limit: number

Response: 200 OK
{
  "properties": [...],
  "total": 150,
  "page": 1,
  "pages": 15
}
```

### Get Property Details
```http
GET /properties/{id}/

Response: 200 OK
{
  "id": "prop_123",
  "title": "3 Bedroom Apartment",
  "description": "...",
  "price": 2500,
  "currency": "GHS",
  "location": "East Legon, Accra",
  "coordinates": { "lat": 5.6037, "lng": -0.1870 },
  "bedrooms": 3,
  "bathrooms": 2,
  "amenities": ["parking", "security", "water"],
  "images": ["url1", "url2"],
  "landlord": { id, fullName },
  "trust_score": 85,
  "created_at": "2024-06-01T10:00:00Z"
}
```

### Create Property (Landlord)
```http
POST /properties/
Authorization: Bearer <token>
Content-Type: multipart/form-data

title: string (required)
description: string (required)
price: number (required)
currency: string (default: GHS)
location: string (required)
latitude: number
longitude: number
bedrooms: number
bathrooms: number
property_type: string
amenities: string[] (JSON)
images: File[] (max 10)

Response: 201 Created
```

### Update Property
```http
PUT /properties/{id}/
Authorization: Bearer <token>
```

### Delete Property
```http
DELETE /properties/{id}/
Authorization: Bearer <token>

Response: 204 No Content
```

---

## 4. Bookings

### Create Booking (Tenant)
```http
POST /bookings/
Authorization: Bearer <token>
{
  "property_id": "prop_123",
  "check_in_date": "2026-02-01",
  "check_out_date": "2026-02-28",
  "message": "Optional message to landlord"
}

Response: 201 Created
```

### Get My Bookings
```http
GET /bookings/mine/
Authorization: Bearer <token>
Query: status=pending|confirmed|cancelled

Response: 200 OK
{
  "bookings": [...]
}
```

### Landlord Respond to Booking
```http
POST /bookings/{id}/respond/
Authorization: Bearer <token>
{
  "action": "accept" | "reject",
  "message": "Optional response"
}

Response: 200 OK
```

### Cancel Booking
```http
POST /bookings/{id}/cancel/
Authorization: Bearer <token>
{
  "reason": "Cancellation reason"
}

Response: 200 OK
```

---

## 5. Artisans

### List Artisans (Public)
```http
GET /artisans/
Query params:
  - profession: string
  - location: string
  - min_rating: number
  - search: string
  - page: number
  - limit: number

Response: 200 OK
{
  "artisans": [
    {
      "id": "art_123",
      "fullName": "Kwame Asante",
      "profession": "Electrician",
      "location": "Accra",
      "profile_photo": "url",
      "rating": 4.8,
      "review_count": 156,
      "trust_score": 92,
      "is_available": true,
      "is_verified": true,
      "experience": 8,
      "work_samples": ["url1", "url2"]
    }
  ],
  "total": 45
}
```

### Get Artisan Details
```http
GET /artisans/{id}/

Response: 200 OK
{
  // Full artisan profile with reviews
}
```

### Get Artisan Reviews
```http
GET /artisans/{id}/reviews/
Query: page, limit

Response: 200 OK
{
  "reviews": [...],
  "average_rating": 4.8,
  "total_reviews": 156
}
```

### Book Artisan (Tenant)
```http
POST /artisans/bookings/
Authorization: Bearer <token>
{
  "artisan_id": "art_123",
  "service_type": "Wiring",
  "description": "Need electrical wiring for new room",
  "preferred_date": "2026-02-15",
  "preferred_time": "morning" | "afternoon" | "evening" | null,
  "address": "123 Main St, East Legon"
}

Response: 201 Created
```

### Get My Artisan Bookings (Tenant)
```http
GET /artisans/bookings/mine/
Authorization: Bearer <token>

Response: 200 OK
```

### Artisan Profile Management
```http
# Get own profile
GET /artisan/profile/
Authorization: Bearer <token>

# Update profile
PUT /artisan/profile/
Authorization: Bearer <token>

# Upload work samples
POST /artisan/work-samples/
Authorization: Bearer <token>
Content-Type: multipart/form-data
files: File[] (max 5)

# Delete work sample
DELETE /artisan/work-samples/{id}/
Authorization: Bearer <token>
```

### Profession Change Request
```http
# Submit request
POST /artisan/profession-change/
Authorization: Bearer <token>
Content-Type: multipart/form-data
new_profession: string (required)
reason: string (required, min 50 chars)
supporting_documents: File[] (max 5)

Response: 201 Created

# Get status
GET /artisan/profession-change/status/
Authorization: Bearer <token>

# Cancel request
DELETE /artisan/profession-change/
Authorization: Bearer <token>
```

---

## 6. Notifications

### List Notifications
```http
GET /notifications/
Authorization: Bearer <token>
Query: unread_only=true|false, page, limit

Response: 200 OK
{
  "notifications": [
    {
      "id": "notif_123",
      "type": "booking_confirmed",
      "title": "Booking Confirmed",
      "message": "Your booking has been confirmed.",
      "action_url": "/tenant/bookings/123",
      "is_read": false,
      "created_at": "2026-01-28T10:00:00Z"
    }
  ],
  "unread_count": 5
}
```

### Create Notification
```http
POST /notifications/
Authorization: Bearer <token>
{
  "type": "string",
  "title": "string",
  "message": "string",
  "action_url": "string",
  "recipient_id": "user_id" (admin only),
  "metadata": {}
}

Response: 201 Created
```

### Mark as Read
```http
PATCH /notifications/{id}/
Authorization: Bearer <token>
{
  "is_read": true
}

Response: 200 OK
```

### Mark All as Read
```http
POST /notifications/mark-all-read/
Authorization: Bearer <token>

Response: 200 OK
```

### Get Unread Count
```http
GET /notifications/unread-count/
Authorization: Bearer <token>

Response: 200 OK
{ "count": 5 }
```

### Delete Notification
```http
DELETE /notifications/{id}/
Authorization: Bearer <token>

Response: 204 No Content
```

---

## 7. Reviews

### Get User Reviews
```http
GET /reviews/user/{userId}/
Query: page, limit

Response: 200 OK
{
  "reviews": [...],
  "average_rating": 4.5,
  "total_reviews": 23,
  "rating_breakdown": { "5": 15, "4": 5, "3": 2, "2": 1, "1": 0 }
}
```

### Create Review
```http
POST /reviews/
Authorization: Bearer <token>
{
  "target_id": "user_123",
  "target_type": "landlord" | "artisan" | "tenant",
  "booking_id": "book_123",
  "rating": 5,
  "comment": "Great experience!",
  "would_recommend": true
}

Response: 201 Created
```

---

## 8. Payments/Wallet

### Get Wallet
```http
GET /wallet/
Authorization: Bearer <token>

Response: 200 OK
{
  "is_setup": true,
  "balance": 5000,
  "currency": "GHS",
  "bank_details": { bank_name, account_number }
}
```

### Setup Wallet
```http
POST /wallet/setup/
Authorization: Bearer <token>
{
  "bank_code": "string",
  "account_number": "string"
}

Response: 200 OK
```

### Top Up Wallet
```http
POST /wallet/top-up/
Authorization: Bearer <token>
{
  "amount": 1000,
  "reference": "paystack_ref"
}

Response: 200 OK
```

### Verify Paystack Payment
```http
POST /payments/verify/
Authorization: Bearer <token>
{
  "reference": "paystack_ref"
}

Response: 200 OK
{ "success": true, "amount": 1000 }
```

---

## 9. Admin

### Dashboard Stats
```http
GET /admin/dashboard/stats/
Authorization: Bearer <token> (admin role)

Response: 200 OK
{
  "total_users": 50000,
  "pending_approvals": 23,
  "pending_properties": 15,
  "pending_profession_requests": 8,
  "active_listings": 12000,
  "total_transactions": 85000
}
```

### User Management
```http
# List users
GET /admin/users/
Query: role, status, search, page, limit

# Get user details
GET /admin/users/{id}/

# Approve user
POST /admin/users/{id}/approve/
{ "notes": "optional" }

# Reject user
POST /admin/users/{id}/reject/
{ "reason": "required" }

# Suspend user
POST /admin/users/{id}/suspend/
{ "reason": "required", "duration_days": 30 }

# Unsuspend user
POST /admin/users/{id}/unsuspend/
```

### Property Moderation
```http
# List pending properties
GET /admin/properties/pending/

# Approve property
POST /admin/properties/{id}/approve/

# Reject property
POST /admin/properties/{id}/reject/
{ "reason": "required" }
```

### Profession Change Requests
```http
# List requests
GET /admin/profession-changes/
Query: status=pending|approved|rejected

# Get request details
GET /admin/profession-changes/{id}/

# Approve
POST /admin/profession-changes/{id}/approve/
{ "notes": "optional" }

# Reject
POST /admin/profession-changes/{id}/reject/
{ "reason": "required" }
```

---

## 10. Super Admin

### Role Management
```http
# Assign role
POST /super-admin/users/{id}/assign-role/
Authorization: Bearer <token> (super-admin role)
{
  "role": "admin",
  "permissions": ["users.view", "users.approve"]
}

Response: 200 OK
```

### Audit Logs
```http
GET /super-admin/audit/
Authorization: Bearer <token> (super-admin role)
Query: page, limit, actor, action, date_from, date_to

Response: 200 OK
{
  "logs": [
    {
      "id": "log_123",
      "action": "user_suspended",
      "actor": "admin@example.com",
      "actor_name": "Admin User",
      "target": "User: john@example.com",
      "target_type": "user",
      "level": "warning",
      "description": "Suspended user for policy violation",
      "timestamp": "2026-01-28T10:00:00Z"
    }
  ]
}
```

### Announcements
```http
# List announcements
GET /super-admin/announcements/

# Create announcement
POST /super-admin/announcements/
{
  "title": "string",
  "message": "string",
  "severity": "info" | "warning" | "critical",
  "expires_at": "2026-02-28T23:59:59Z",
  "send_email": true
}

# Update announcement
PUT /super-admin/announcements/{id}/

# Delete announcement
DELETE /super-admin/announcements/{id}/
```

### Ban User (Permanent)
```http
POST /super-admin/users/{id}/ban/
Authorization: Bearer <token> (super-admin role)
{
  "reason": "required"
}

Response: 200 OK
```

---

## 11. AI Services

### Efie AI Chat
```http
POST /ai/chat/
Authorization: Bearer <token>
{
  "message": "Find me a 2-bedroom apartment in East Legon",
  "context": {
    "user_id": "usr_123",
    "role": "tenant",
    "current_page": "/tenant/properties"
  }
}

Response: 200 OK
{
  "message": "I found 23 apartments matching your criteria...",
  "actions": [
    { "type": "navigate", "label": "View All", "url": "/..." },
    { "type": "quick_reply", "options": ["Under GHC 2000", "Furnished"] }
  ],
  "results": [...]
}
```

### Trust Score
```http
GET /ai/trust-score/{userId}/
Authorization: Bearer <token>

Response: 200 OK
{
  "score": 85,
  "label": "Very Good",
  "breakdown": {
    "verification": 100,
    "reviews": 85,
    "response_rate": 92,
    "completion_rate": 88,
    "account_age": 75,
    "activity": 80
  }
}
```

### Recommendations
```http
GET /ai/recommendations/properties/
Authorization: Bearer <token>
Query: limit=6

Response: 200 OK
{
  "recommendations": [...],
  "reason": "Based on your search history"
}

GET /ai/recommendations/artisans/
Authorization: Bearer <token>
Query: limit=6
```

---

## 12. Preferences

### Get Preferences
```http
GET /preferences/
Authorization: Bearer <token>

Response: 200 OK
{
  "emailNotifications": true,
  "smsNotifications": false,
  "twoFactorAuth": true,
  "profileVisibility": "public",
  "marketingEmails": true,
  "language": "en"
}
```

### Update Preferences
```http
PATCH /preferences/
Authorization: Bearer <token>
{
  "emailNotifications": false
}

Response: 200 OK
```

---

## Email Notification Triggers

The following events should trigger email notifications from the backend:

| Event | Endpoint Called | Email Template |
|-------|-----------------|----------------|
| Role Promotion | POST /super-admin/users/{id}/assign-role/ | Role Promotion Email |
| Account Suspended | POST /admin/users/{id}/suspend/ | Account Suspension Email |
| Account Banned | POST /super-admin/users/{id}/ban/ | Account Banned Email |
| Account Restored | POST /admin/users/{id}/unsuspend/ | Account Restored Email |
| Announcement (opt-in) | POST /super-admin/announcements/ | Announcement Email |
| Profession Change Approved | POST /admin/profession-changes/{id}/approve/ | Profession Change Email |
| Profession Change Rejected | POST /admin/profession-changes/{id}/reject/ | Profession Change Email |

---

## Error Response Format

```json
{
  "error": "ErrorType",
  "message": "Human-readable error message",
  "details": {
    "field": ["Specific field error"]
  },
  "code": "ERROR_CODE"
}
```

### Common Error Codes

| Code | HTTP Status | Description |
|------|-------------|-------------|
| UNAUTHORIZED | 401 | Missing or invalid token |
| FORBIDDEN | 403 | Insufficient permissions |
| NOT_FOUND | 404 | Resource not found |
| VALIDATION_ERROR | 400 | Invalid request data |
| RATE_LIMITED | 429 | Too many requests |
| SERVER_ERROR | 500 | Internal server error |

---

*This document compiles all frontend-expected API endpoints. Backend team should implement these endpoints with the specified request/response formats.*
