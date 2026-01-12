# RentalConnects Frontend API Contracts

**Date:** 2026-01-11  
**Version:** Production-Ready  
**Status:** Complete API Documentation

---

## Table of Contents

1. [Overview](#overview)
2. [Authentication](#authentication)
3. [Properties](#properties)
4. [Bookings & Viewings](#bookings--viewings)
5. [Payments & Wallet](#payments--wallet)
6. [Chat & Messaging](#chat--messaging)
7. [User Management](#user-management)
8. [Admin & Super Admin](#admin--super-admin)
9. [Ads](#ads)
10. [Analytics](#analytics)
11. [Maintenance](#maintenance)
12. [Notifications](#notifications)
13. [Mock vs Real Mapping](#mock-vs-real-mapping)

---

## Overview

This document defines the API contracts expected by the RentalConnects frontend. All endpoints use **JSON** unless specified otherwise (e.g., multipart for file uploads).

### Base URL

- **Development:** `http://localhost:8000/api`
- **Production:** Set via `VITE_API_BASE_URL` environment variable

### Authentication

Most endpoints require authentication via **JWT Bearer token**:

```
Authorization: Bearer <token>
```

### Response Format

**Success Response:**
```json
{
  "data": { ... },
  "message": "Success message (optional)"
}
```

**Error Response:**
```json
{
  "message": "Error message",
  "detail": "Detailed error (optional)",
  "errors": { "field": ["Error message"] }
}
```

### Status Codes

- `200` - Success
- `201` - Created
- `204` - No Content
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `500` - Internal Server Error

---

## Authentication

### POST /auth/login

Login with email and password.

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
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "u_123",
    "email": "user@example.com",
    "full_name": "John Doe",
    "role": "tenant",
    "subscription": "free",
    "phone": "+233123456789",
    "permissions": {}
  }
}
```

**Mock:** `mocks/axiosMock.js` - `POST /auth/login`

---

### GET /auth/profile

Get current user profile.

**Response:**
```json
{
  "id": "u_123",
  "email": "user@example.com",
  "full_name": "John Doe",
  "role": "tenant",
  "subscription": "free",
  "phone": "+233123456789",
  "permissions": {},
  "created_at": "2025-01-01T00:00:00Z",
  "updated_at": "2025-01-01T00:00:00Z"
}
```

**Mock:** `mocks/axiosMock.js` - `GET /auth/profile`

---

### POST /auth/forgot-password

Request password reset.

**Request:**
```json
{
  "email": "user@example.com"
}
```

**Response:**
```json
{
  "message": "Password reset email sent"
}
```

---

### POST /auth/reset-password/:token

Reset password with token.

**Request:**
```json
{
  "password": "newpassword123",
  "password_confirm": "newpassword123"
}
```

**Response:**
```json
{
  "message": "Password reset successful"
}
```

---

## Properties

### GET /properties

List properties with optional filters.

**Query Parameters:**
- `page` - Page number (default: 1)
- `page_size` - Items per page (default: 20)
- `search` - Search query
- `min_price` - Minimum price
- `max_price` - Maximum price
- `bedrooms` - Number of bedrooms
- `bathrooms` - Number of bathrooms
- `property_type` - Property type
- `location` - Location filter
- `status` - Status filter (draft, pending, published, archived)

**Response:**
```json
{
  "results": [
    {
      "id": "prop_123",
      "title": "Modern 2-Bedroom Apartment",
      "description": "Spacious apartment in prime location",
      "address": "123 Main St, Accra",
      "price_ghs": 2500,
      "bedrooms": 2,
      "bathrooms": 1,
      "property_type": "apartment",
      "status": "published",
      "images": ["https://cloudinary.com/...", "..."],
      "amenities": ["wifi", "parking", "security"],
      "owner": {
        "id": "u_456",
        "full_name": "Jane Landlord",
        "email": "jane@example.com"
      },
      "created_at": "2025-01-01T00:00:00Z",
      "updated_at": "2025-01-01T00:00:00Z"
    }
  ],
  "count": 50,
  "next": "http://api.example.com/properties/?page=2",
  "previous": null
}
```

**Mock:** `mocks/mockData.js` - `mockProperties`

---

### GET /properties/:id

Get property details.

**Response:**
```json
{
  "id": "prop_123",
  "title": "Modern 2-Bedroom Apartment",
  "description": "Spacious apartment in prime location",
  "address": "123 Main St, Accra",
  "price_ghs": 2500,
  "bedrooms": 2,
  "bathrooms": 1,
  "property_type": "apartment",
  "status": "published",
  "images": ["https://cloudinary.com/...", "..."],
  "amenities": ["wifi", "parking", "security"],
  "location": {
    "latitude": 5.6037,
    "longitude": -0.1870
  },
  "owner": {
    "id": "u_456",
    "full_name": "Jane Landlord",
    "email": "jane@example.com"
  },
  "created_at": "2025-01-01T00:00:00Z",
  "updated_at": "2025-01-01T00:00:00Z"
}
```

**Mock:** `mocks/propertyMock.js`

---

### POST /landlord/properties

Create property (Landlord only).

**Request (multipart/form-data):**
```
title: "Modern 2-Bedroom Apartment"
description: "Spacious apartment..."
address: "123 Main St, Accra"
price_ghs: 2500
bedrooms: 2
bathrooms: 1
property_type: "apartment"
images: [File, File, ...]
amenities: ["wifi", "parking"]
latitude: 5.6037
longitude: -0.1870
```

**Response:**
```json
{
  "id": "prop_123",
  "title": "Modern 2-Bedroom Apartment",
  "status": "pending",
  ...
}
```

**Mock:** `mocks/landlordMock.js`

---

### PATCH /landlord/properties/:id

Update property (Landlord only).

**Request:** Same as POST, but all fields optional.

**Response:** Updated property object.

**Mock:** `mocks/landlordMock.js`

---

### DELETE /landlord/properties/:id

Delete property (Landlord only).

**Response:** `204 No Content`

**Mock:** `mocks/landlordMock.js`

---

### GET /landlord/amenities

Get available amenities list.

**Response:**
```json
{
  "results": [
    { "id": "wifi", "name": "WiFi", "icon": "..." },
    { "id": "parking", "name": "Parking", "icon": "..." },
    ...
  ]
}
```

**Mock:** Inline mock in `propertyService.js`

---

## Bookings & Viewings

### POST /properties/:id/viewing-request

Create viewing request (Tenant only).

**Request:**
```json
{
  "preferred_date": "2025-02-01T10:00:00Z",
  "alternative_date": "2025-02-02T14:00:00Z",
  "message": "I'm interested in viewing this property",
  "contact_phone": "+233123456789"
}
```

**Response:**
```json
{
  "id": "view_123",
  "property_id": "prop_123",
  "tenant_id": "u_123",
  "status": "pending",
  "preferred_date": "2025-02-01T10:00:00Z",
  "alternative_date": "2025-02-02T14:00:00Z",
  "message": "I'm interested in viewing this property",
  "created_at": "2025-01-15T00:00:00Z"
}
```

**Mock:** `mocks/landlordMock.js` - `fetchBookingsMock`

---

### GET /landlord/bookings

Get viewing requests for landlord (Landlord only).

**Query Parameters:**
- `status` - Filter by status (pending, accepted, declined, completed)
- `page` - Page number
- `page_size` - Items per page

**Response:**
```json
{
  "results": [
    {
      "id": "view_123",
      "property": {
        "id": "prop_123",
        "title": "Modern 2-Bedroom Apartment",
        "address": "123 Main St, Accra"
      },
      "tenant": {
        "id": "u_123",
        "full_name": "John Doe",
        "email": "john@example.com",
        "phone": "+233123456789"
      },
      "status": "pending",
      "preferred_date": "2025-02-01T10:00:00Z",
      "alternative_date": "2025-02-02T14:00:00Z",
      "message": "I'm interested in viewing this property",
      "created_at": "2025-01-15T00:00:00Z"
    }
  ],
  "count": 10
}
```

**Mock:** `mocks/landlordMock.js` - `fetchBookingsMock`

---

### POST /landlord/bookings/:id/respond

Respond to viewing request (Landlord only).

**Request:**
```json
{
  "action": "accept"  // or "decline"
}
```

**Response:**
```json
{
  "id": "view_123",
  "status": "accepted",  // or "declined"
  "updated_at": "2025-01-16T00:00:00Z"
}
```

**Mock:** `mocks/axiosMock.js`

---

### GET /tenant/viewing-requests

Get viewing requests for tenant (Tenant only).

**Query Parameters:**
- `status` - Filter by status
- `page` - Page number
- `page_size` - Items per page

**Response:** Same format as `/landlord/bookings` but filtered for current tenant.

**Mock:** `mocks/mockData.js` - `mockBookings`

---

## Payments & Wallet

### GET /wallet/

Get wallet information (Landlord, Artisan, Admin, Super Admin).

**Response:**
```json
{
  "id": "wallet_123",
  "user_id": "u_456",
  "balance": 1250.50,
  "currency": "GHS",
  "is_setup": true,
  "bank_account": {
    "account_number": "1234567890",
    "bank_name": "GCB Bank",
    "account_name": "Jane Landlord"
  },
  "mobile_money": {
    "network": "MTN",
    "number": "+233123456789"
  },
  "created_at": "2025-01-01T00:00:00Z",
  "updated_at": "2025-01-15T00:00:00Z"
}
```

**Mock:** Inline mock in `walletService.js`

---

### POST /wallet/setup/

Setup wallet (Landlord, Artisan, Admin, Super Admin).

**Request:**
```json
{
  "bank_account": {
    "account_number": "1234567890",
    "bank_name": "GCB Bank",
    "account_name": "Jane Landlord"
  },
  "mobile_money": {
    "network": "MTN",
    "number": "+233123456789"
  }
}
```

**Response:** Wallet object (same as GET /wallet/).

**Mock:** Inline mock in `walletService.js`

---

### PATCH /wallet/

Update wallet information.

**Request:** Partial wallet data (same fields as setup).

**Response:** Updated wallet object.

**Mock:** Inline mock in `walletService.js`

---

### GET /wallet/balance/

Get wallet balance.

**Response:**
```json
{
  "balance": 1250.50,
  "currency": "GHS"
}
```

**Mock:** Inline mock in `walletService.js`

---

### POST /wallet/top-up/

Top up wallet.

**Request:**
```json
{
  "amount": 100.00,
  "payment_method": "paystack",  // or "mobile_money", "bank_transfer"
  "reference": "paystack_ref_123"  // for Paystack
}
```

**Response:**
```json
{
  "transaction_id": "txn_123",
  "amount": 100.00,
  "status": "completed",
  "created_at": "2025-01-15T00:00:00Z"
}
```

**Mock:** Inline mock in `walletService.js`

---

### GET /wallet/transactions/

Get wallet transaction history.

**Query Parameters:**
- `type` - Transaction type (credit, debit, top_up, withdrawal)
- `status` - Transaction status
- `date_from` - Start date (ISO 8601)
- `date_to` - End date (ISO 8601)
- `page` - Page number
- `page_size` - Items per page

**Response:**
```json
{
  "results": [
    {
      "id": "txn_123",
      "type": "credit",
      "amount": 2500.00,
      "description": "Rent payment from John Doe",
      "status": "completed",
      "created_at": "2025-01-15T00:00:00Z"
    },
    ...
  ],
  "count": 25
}
```

**Mock:** Inline mock in `walletService.js`

---

### POST /wallet/withdraw/

Withdraw from wallet.

**Request:**
```json
{
  "amount": 500.00,
  "destination": "bank_account"  // or "mobile_money"
}
```

**Response:**
```json
{
  "transaction_id": "txn_456",
  "amount": 500.00,
  "status": "pending",
  "created_at": "2025-01-15T00:00:00Z"
}
```

**Mock:** Inline mock in `walletService.js`

---

### GET /payments/

Get payments (filtered by role).

**Query Parameters:**
- `status` - Payment status
- `payment_type` - Payment type
- `property_id` - Property ID
- `page` - Page number
- `page_size` - Items per page

**Response:**
```json
{
  "results": [
    {
      "id": "pay_123",
      "amount": 2500.00,
      "currency": "GHS",
      "status": "completed",
      "payment_type": "rent",
      "property_id": "prop_123",
      "tenant_id": "u_123",
      "landlord_id": "u_456",
      "created_at": "2025-01-15T00:00:00Z"
    }
  ],
  "count": 10
}
```

**Mock:** `mocks/mockData.js` - `mockPayments`

---

### POST /payments/verify-paystack/

Verify Paystack payment (for premium upgrades).

**Request:**
```json
{
  "reference": "paystack_ref_123"
}
```

**Response:**
```json
{
  "success": true,
  "payment": {
    "id": "pay_123",
    "amount": 29.00,
    "status": "completed"
  }
}
```

**Mock:** Inline mock or `paymentService.js`

---

## Chat & Messaging

### GET /chat/conversations/

Get all conversations for current user.

**Query Parameters:**
- `page` - Page number
- `page_size` - Items per page

**Response:**
```json
{
  "results": [
    {
      "id": "conv_123",
      "participants": [
        {
          "id": "u_123",
          "full_name": "John Doe",
          "email": "john@example.com",
          "role": "tenant"
        },
        {
          "id": "u_456",
          "full_name": "Jane Landlord",
          "email": "jane@example.com",
          "role": "landlord"
        }
      ],
      "last_message": {
        "id": "msg_789",
        "content": "Hello!",
        "sender_id": "u_123",
        "created_at": "2025-01-15T10:00:00Z"
      },
      "unread_count": 2,
      "updated_at": "2025-01-15T10:00:00Z"
    }
  ],
  "count": 5
}
```

**Mock:** `mocks/mockData.js` - Mock conversations

---

### GET /chat/conversations/:id/

Get conversation details.

**Response:**
```json
{
  "id": "conv_123",
  "participants": [...],
  "created_at": "2025-01-01T00:00:00Z",
  "updated_at": "2025-01-15T10:00:00Z"
}
```

**Mock:** `mocks/mockData.js`

---

### POST /chat/conversations/

Create conversation.

**Request:**
```json
{
  "recipient_id": "u_456"
}
```

**Response:** Conversation object.

**Mock:** `mocks/mockData.js`

---

### GET /chat/conversations/:id/messages/

Get messages in conversation.

**Query Parameters:**
- `page` - Page number
- `page_size` - Items per page

**Response:**
```json
{
  "results": [
    {
      "id": "msg_123",
      "conversation_id": "conv_123",
      "sender_id": "u_123",
      "content": "Hello!",
      "encrypted": false,  // Backend stores encrypted, frontend decrypts
      "created_at": "2025-01-15T10:00:00Z",
      "read_at": "2025-01-15T10:05:00Z",
      "attachments": []
    }
  ],
  "count": 50
}
```

**Mock:** `mocks/mockData.js`

---

### POST /chat/conversations/:id/messages/

Send message in conversation.

**Request:**
```json
{
  "content": "Hello!",
  "attachments": []  // File URLs
}
```

**Response:** Message object.

**Mock:** `mocks/mockData.js`

---

### POST /chat/messages/send/

Send direct message (creates conversation if needed).

**Request:**
```json
{
  "recipient_id": "u_456",
  "content": "Hello!"
}
```

**Response:** Message object.

**Mock:** `mocks/mockData.js`

---

## User Management

### GET /tenant/rentals

Get tenant's active rentals (Tenant only).

**Response:**
```json
{
  "results": [
    {
      "id": "rental_123",
      "property": {
        "id": "prop_123",
        "title": "Modern 2-Bedroom Apartment",
        "address": "123 Main St, Accra",
        "images": ["..."]
      },
      "landlord": {
        "id": "u_456",
        "full_name": "Jane Landlord"
      },
      "monthly_rent": 2500.00,
      "start_date": "2025-01-01",
      "end_date": "2025-12-31",
      "status": "active"
    }
  ]
}
```

**Mock:** `mocks/mockData.js` - `mockRentals`

---

### GET /tenant/payments

Get tenant's payment history (Tenant Premium only).

**Response:** Same format as `/payments/` but filtered for tenant.

**Mock:** `mocks/mockData.js` - `mockPayments`

---

### GET /artisan/tasks

Get artisan tasks (Artisan only).

**Query Parameters:**
- `status` - Filter by status (pending, in_progress, completed)
- `page` - Page number
- `page_size` - Items per page

**Response:**
```json
{
  "results": [
    {
      "id": "task_123",
      "title": "Fix leaking sink",
      "description": "Kitchen sink leaking at base",
      "priority": "high",
      "status": "pending",
      "property": {
        "id": "prop_123",
        "address": "123 Main St, Accra"
      },
      "landlord": {
        "id": "u_456",
        "full_name": "Jane Landlord"
      },
      "assigned_at": "2025-01-15T00:00:00Z",
      "due_date": "2025-01-20T00:00:00Z"
    }
  ]
}
```

**Mock:** `mocks/artisanTasks.js`

---

### GET /artisan/earnings/summary

Get artisan earnings summary (Artisan only).

**Response:**
```json
{
  "total_earnings": 5000.00,
  "pending_earnings": 500.00,
  "completed_tasks": 25,
  "pending_tasks": 5
}
```

**Mock:** `mocks/artisanTasks.js`

---

## Admin & Super Admin

### GET /admin/users/pending

Get pending user approvals (Admin/Super Admin only).

**Response:**
```json
{
  "results": [
    {
      "id": "u_123",
      "email": "newuser@example.com",
      "full_name": "New User",
      "role": "landlord",
      "status": "pending",
      "created_at": "2025-01-15T00:00:00Z"
    }
  ]
}
```

**Mock:** `mocks/adminMock.js`

---

### PATCH /admin/users/:id/approve

Approve user (Admin/Super Admin only).

**Request:**
```json
{}
```

**Response:**
```json
{
  "success": true,
  "user": {
    "id": "u_123",
    "status": "active",
    ...
  }
}
```

**Mock:** `mocks/axiosMock.js`

---

### GET /admin/properties/pending

Get pending property approvals (Admin/Super Admin only).

**Response:** Same format as `/properties/` but filtered for pending status.

**Mock:** `mocks/adminMock.js`

---

### PATCH /admin/properties/:id/approve

Approve property (Admin/Super Admin only).

**Request:**
```json
{}
```

**Response:** Updated property object.

**Mock:** `mocks/axiosMock.js`

---

### GET /super-admin/users

Get all users (Super Admin only).

**Query Parameters:**
- `role` - Filter by role
- `status` - Filter by status
- `page` - Page number
- `page_size` - Items per page

**Response:**
```json
{
  "results": [
    {
      "id": "u_123",
      "email": "user@example.com",
      "full_name": "User Name",
      "role": "tenant",
      "subscription": "free",
      "status": "active",
      "created_at": "2025-01-01T00:00:00Z"
    }
  ],
  "count": 100
}
```

**Mock:** `mocks/superAdminMock.js`

---

### POST /super-admin/users/:id/roles

Delegate role to user (Super Admin only).

**Request:**
```json
{
  "role": "admin"
}
```

**Response:** Updated user object.

**Mock:** `mocks/axiosMock.js`

---

### GET /super-admin/system/stats

Get system statistics (Super Admin only).

**Response:**
```json
{
  "total_users": 1000,
  "total_properties": 500,
  "total_revenue": 100000.00,
  "active_listings": 400,
  "pending_approvals": 25
}
```

**Mock:** `mocks/superAdminMock.js`

---

### GET /super-admin/audit

Get audit logs (Super Admin only).

**Query Parameters:**
- `action` - Filter by action type
- `user_id` - Filter by user
- `date_from` - Start date
- `date_to` - End date
- `page` - Page number
- `page_size` - Items per page

**Response:**
```json
{
  "results": [
    {
      "id": "audit_123",
      "action": "user.approved",
      "user_id": "u_123",
      "admin_id": "u_789",
      "details": {},
      "created_at": "2025-01-15T00:00:00Z"
    }
  ],
  "count": 500
}
```

**Mock:** `mocks/superAdminMock.js`

---

## Ads

### GET /ads/

Get active ads.

**Query Parameters:**
- `ad_type` - Ad type (banner, card, inline)
- `role` - Target role
- `region` - Region filter
- `page` - Page number
- `page_size` - Items per page

**Response:**
```json
{
  "results": [
    {
      "id": "ad_123",
      "title": "Premium Listing Promotion",
      "description": "Get featured!",
      "image_url": "https://cloudinary.com/...",
      "ad_type": "banner",
      "target_roles": ["landlord"],
      "link_url": "/upgrade",
      "is_active": true,
      "created_at": "2025-01-01T00:00:00Z"
    }
  ],
  "count": 10
}
```

**Mock:** `mocks/mockData.js` - Mock ads

---

### POST /ads/:id/click/

Track ad click (public endpoint).

**Response:**
```json
{
  "success": true
}
```

**Mock:** Silent success (no error thrown)

---

### POST /ads/:id/view/

Track ad view (public endpoint).

**Response:**
```json
{
  "success": true
}
```

**Mock:** Silent success (no error thrown)

---

## Analytics

### GET /landlord/dashboard/stats

Get landlord dashboard statistics (Landlord Premium only).

**Response:**
```json
{
  "total_properties": 12,
  "monthly_revenue": 8500.00,
  "occupancy_rate": 86,
  "pending_view_requests": 5,
  "revenue_chart": [
    { "month": "Jan", "revenue": 6000 },
    { "month": "Feb", "revenue": 7000 },
    ...
  ],
  "occupancy_trend": [
    { "month": "Jan", "rate": 72 },
    { "month": "Feb", "rate": 80 },
    ...
  ]
}
```

**Mock:** `mocks/dashboardMock.js`

---

## Maintenance

### GET /tenant/maintenance

Get maintenance requests (Tenant Premium only).

**Query Parameters:**
- `status` - Filter by status
- `page` - Page number
- `page_size` - Items per page

**Response:**
```json
{
  "results": [
    {
      "id": "maint_123",
      "title": "Leaking sink",
      "description": "Kitchen sink leaking at base",
      "priority": "high",
      "status": "pending",
      "property_id": "prop_123",
      "images": ["https://cloudinary.com/..."],
      "created_at": "2025-01-15T00:00:00Z"
    }
  ]
}
```

**Mock:** `mocks/mockData.js` - Mock maintenance requests

---

### POST /tenant/maintenance

Create maintenance request (Tenant Premium only).

**Request (multipart/form-data):**
```
title: "Leaking sink"
description: "Kitchen sink leaking at base"
priority: "high"
property_id: "prop_123"
images: [File, File, ...]
```

**Response:** Maintenance request object.

**Mock:** `mocks/mockData.js`

---

## Notifications

### GET /notifications/

Get user notifications.

**Query Parameters:**
- `read` - Filter by read status (true/false)
- `page` - Page number
- `page_size` - Items per page

**Response:**
```json
{
  "results": [
    {
      "id": "notif_123",
      "type": "booking_accepted",
      "title": "Viewing Request Accepted",
      "message": "Your viewing request for 'Modern Apartment' has been accepted",
      "read": false,
      "created_at": "2025-01-15T00:00:00Z",
      "action_url": "/tenant/viewing-requests"
    }
  ],
  "count": 20
}
```

**Mock:** `mocks/mockData.js` - Mock notifications

---

### PATCH /notifications/:id/read

Mark notification as read.

**Response:**
```json
{
  "id": "notif_123",
  "read": true
}
```

**Mock:** `mocks/mockData.js`

---

## Mock vs Real Mapping

### Mock Mode Control

- **Environment Variable:** `VITE_USE_MOCK=true`
- **Development Mode:** Automatically enabled if `import.meta.env.DEV === true`
- **Runtime Toggle:** `localStorage.demoMockEnabled = "true"`

### Mock Implementation Locations

| Endpoint | Mock Source | Notes |
|----------|-------------|-------|
| `POST /auth/login` | `mocks/axiosMock.js` | Returns demo users |
| `GET /auth/profile` | `mocks/axiosMock.js` | Returns current user from localStorage |
| `GET /properties` | `mocks/mockData.js` | `mockProperties` array |
| `GET /landlord/bookings` | `mocks/landlordMock.js` | `fetchBookingsMock` function |
| `GET /artisan/tasks` | `mocks/artisanTasks.js` | `devTasks` array |
| `GET /admin/users/pending` | `mocks/adminMock.js` | `pendingUsers` array |
| `GET /super-admin/system/stats` | `mocks/superAdminMock.js` | `systemStats` object |
| `GET /wallet/*` | Inline mocks in `walletService.js` | Returns mock wallet data |
| `GET /chat/*` | `mocks/mockData.js` | Mock conversations/messages |
| `GET /ads/*` | `mocks/mockData.js` | Mock ads array |

### Mock Data Structure

Mock data is centralized in:
- `src/mocks/mockData.js` - Main mock data registry
- `src/mocks/axiosMock.js` - Axios adapter with route handlers
- Service-specific mocks (e.g., `landlordMock.js`, `adminMock.js`)

### Service Layer Pattern

Services check mock mode and return mock data:

```javascript
const USE_MOCK = String(import.meta.env.VITE_USE_MOCK || "").toLowerCase() === "true";

export const fetchProperties = async (opts = {}) => {
  if (USE_MOCK) {
    return mockData.mockProperties;
  }
  
  try {
    const { data } = await apiClient.get("/properties", { params: opts });
    return data.results || data;
  } catch (err) {
    throw extractError(err, "Failed to fetch properties");
  }
};
```

---

## Error Handling

### Standard Error Format

```json
{
  "message": "Error message",
  "detail": "Detailed error description",
  "errors": {
    "field_name": ["Error message for field"]
  }
}
```

### HTTP Status Codes

- `400` - Bad Request (validation errors)
- `401` - Unauthorized (missing/invalid token)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found (resource doesn't exist)
- `500` - Internal Server Error

### Frontend Error Extraction

Services use `extractError()` helper:

```javascript
function extractError(err, fallback = "Server error") {
  if (!err) return new Error(fallback);
  if (err.response?.data?.message) return new Error(err.response.data.message);
  if (err.response?.data?.detail) return new Error(err.response.data.detail);
  if (err.message) return new Error(err.message);
  return new Error(fallback);
}
```

---

## Pagination

### Standard Pagination Format

```json
{
  "results": [...],
  "count": 100,
  "next": "http://api.example.com/endpoint/?page=2",
  "previous": "http://api.example.com/endpoint/?page=1"
}
```

### Query Parameters

- `page` - Page number (default: 1)
- `page_size` - Items per page (default: 20, max: 100)

---

## Date Format

All dates use **ISO 8601** format:
```
2025-01-15T10:30:00Z
```

---

## File Uploads

### Multipart Requests

File uploads use `multipart/form-data`:
- Property images
- Profile pictures
- Ad images
- Maintenance request photos
- Chat attachments

### File Size Limits

- Images: 5MB per file
- Documents: 10MB per file
- Maximum files per request: 10

---

**Last Updated:** 2026-01-11  
**Maintained By:** RentalConnects Development Team

