# Backend Implementation Guide - Complete Documentation

**Last Updated:** January 2026  
**Status:** Production Ready  
**Version:** 1.0

---

## Table of Contents

1. [Overview](#overview)
2. [API Endpoints](#api-endpoints)
3. [Email System](#email-system)
4. [AI Features](#ai-features)
5. [Error Handling & Rate Limiting](#error-handling--rate-limiting)
6. [Property Management](#property-management)
7. [User Management](#user-management)
8. [Authentication & Security](#authentication--security)
9. [Recent Updates](#recent-updates)

---

## Overview

This document provides complete specifications for all backend API endpoints, services, and integrations required by the RentalConnects frontend application.

### Base URL
- **Development:** `https://rc-backend-658461237694.europe-west1.run.app/api`
- **Production:** Configure via `VITE_API_BASE_URL` environment variable

### Authentication
All protected endpoints require JWT authentication via:
- **Header:** `Authorization: Bearer <access_token>`
- **Refresh Token:** `POST /api/auth/refresh/` with `{ refresh: "<token>" }`

---

## API Endpoints

### Authentication Endpoints

#### Login
- **Endpoint:** `POST /api/auth/login/`
- **Request:**
  ```json
  {
    "email": "user@example.com",
    "password": "password123"
  }
  ```
- **Response:**
  ```json
  {
    "access": "jwt_access_token",
    "refresh": "jwt_refresh_token",
    "user": {
      "id": 1,
      "email": "user@example.com",
      "role": "tenant",
      "full_name": "John Doe"
    }
  }
  ```
- **Notes:** Must track login activity for email notifications

#### Signup
- **Tenant:** `POST /api/auth/signup/tenant/`
- **Landlord:** `POST /api/auth/signup/landlord/`
- **Artisan:** `POST /api/auth/signup/artisan/`
- **Request:** Role-specific form data (multipart/form-data for file uploads)
- **Response:** Same as login response

**Artisan Signup Details:**
- **Endpoint:** `POST /api/auth/signup/artisan/`
- **Content-Type:** `multipart/form-data`
- **Required Fields:**
  - `email` (string)
  - `password` (string, minimum 8 characters)
  - `fullName` (string, camelCase)
  - `phone` (string)
  - `confirmPassword` (string)
  - `profession` (string: "plumber", "electrician", "carpenter", "mason", "painter", or custom string)
- **Optional Fields:**
  - `experience` (number, years of experience)
  - `region` (string, service region/city)
  - `idUpload` (File, image or PDF document)
- **Response:** `{ access, refresh, user }` (same as login)

#### Token Refresh
- **Endpoint:** `POST /api/auth/refresh/`
- **Request:** `{ "refresh": "<refresh_token>" }`
- **Response:** `{ "access": "<new_access_token>", "refresh": "<new_refresh_token>" }`

#### Logout
- **Endpoint:** `POST /api/auth/logout/`
- **Headers:** Authorization required
- **Response:** `{ "message": "Logged out successfully" }`

---

### Property Endpoints

#### List Properties
- **Endpoint:** `GET /api/properties/`
- **Query Params:**
  - `page` (int): Page number
  - `limit` (int): Items per page
  - `search` (string): Search term
  - `status` (string): Filter by status (draft, pending, active, rejected)
- **Response:**
  ```json
  {
    "results": [/* property objects */],
    "count": 100,
    "next": "http://...",
    "previous": null
  }
  ```

#### Get Property
- **Endpoint:** `GET /api/properties/{id}/`
- **Response:** Complete property object with landlord info
  - **Amenities Format:** Can be string array, flat objects `{id, name}`, or nested objects `{id, amenity: {id, name}}`
  - **Frontend:** Automatically normalizes all formats using `amenityUtils.js`

#### Create Property
- **Endpoint:** `POST /api/landlord/properties/`
- **Request:** Multipart form data
- **Fields:**
  - `title`, `description`, `address`, `price`, `currency`
  - `bedrooms`, `bathrooms`, `property_type`
  - `images[]`: Array of image files
  - `amenity_ids[]`: Array of amenity IDs (strings or numbers)
- **Response:** Created property object
  - **Note:** Response `amenities` field may be in any format (string array, flat objects, or nested objects). Frontend handles all formats automatically.

#### Update Property
- **Endpoint:** `PUT /api/properties/{id}/`
- **Request:** Same as create
- **Response:** Updated property object

#### Delete Property
- **Endpoint:** `DELETE /api/properties/{id}/`
- **Response:** `{ "message": "Property deleted" }`

#### Landlord Booking Management
- **Get Bookings (Landlord):**
  - **Primary Endpoint:** `GET /api/properties/viewing-requests/`
  - **Alternative Endpoints:** 
    - `GET /api/bookings/` (fallback)
    - `GET /api/landlord/bookings/` (fallback)
  - **Authentication:** Required (Landlord role)
  - **Query Params:**
    - `status`: Filter by status (pending, accepted, declined, all)
    - `property_id`: Filter by property ID
  - **Response Format:**
    ```json
    {
      "results": [/* booking objects */],
      "count": 10
    }
    ```
    OR
    ```json
    [/* array of booking objects */]
    ```
  - **Booking Object Structure (Backend can return any of these formats):**
    ```json
    {
      "id": 1,
      "property_id": 123,
      "property": {
        "id": 123,
        "title": "Modern Apartment"
      },
      "tenant_id": 45,
      "tenant": {
        "id": 45,
        "full_name": "John Doe",
        "phone": "+233241234567"
      },
      "status": "pending",
      "preferred_date": "2026-02-15T10:00:00Z",
      "message": "Interested in viewing",
      "contact_phone": "+233241234567",
      "created_at": "2026-01-25T10:00:00Z"
    }
    ```
  - **Field Name Variations (Frontend Normalizes Automatically):**
    - **Property:** `propertyTitle` or `property.title` or `property_title` → normalized to `propertyTitle`
    - **Tenant Name:** `applicantName` or `tenant.full_name` or `tenant_name` or `tenantName` → normalized to `applicantName`
    - **Date:** `dateRequested` or `requested_date` or `preferred_date` or `preferredDate` or `created_at` → normalized to `dateRequested`
    - **Phone:** `phone` or `contact_phone` or `contactPhone` or `tenant.phone` → normalized to `phone`
  - **Important:** Frontend automatically normalizes all field name variations for consistent display in calendar and list views
  - **Status Values:**
    - `pending` or `requested` - Awaiting landlord response
    - `accepted` or `approved` - Landlord accepted
    - `declined` or `rejected` - Landlord declined
    - `completed` - Viewing completed
    - `no-show` - Tenant didn't show up

- **Respond to Booking:**
  - **Primary Endpoint (RECOMMENDED):** `PATCH /api/properties/viewing-requests/{id}/respond/`
  - **Alternative Endpoints (Frontend tries as fallbacks):**
    - `PATCH /api/properties/viewing-requests/{id}/` (currently returns 500 - needs fix)
    - `PATCH /api/landlord/bookings/{id}/respond/` (currently returns 404)
    - `PATCH /api/bookings/{id}/` (currently returns 404)
  - **Authentication:** Required (Landlord role - must own the property)
  - **Request:**
    ```json
    {
      "status": "approved"  // or "rejected"
    }
    ```
  - **Response:** Updated booking/viewing request object
  - **Status Codes:**
    - `200 OK`: Success
    - `404 Not Found`: Viewing request doesn't exist
    - `403 Forbidden`: User doesn't own the property
    - `400 Bad Request`: Invalid status value
  - **⚠️ BACKEND ACTION REQUIRED:**
    - Implement `PATCH /api/properties/viewing-requests/{id}/respond/` endpoint
    - OR fix the existing `PATCH /api/properties/viewing-requests/{id}/` endpoint (currently has UnboundLocalError at line 707 in properties/views.py)
  - **Notifications (CRITICAL):**
    - **When Status Changes to "approved":**
      - **In-App Notification (Tenant):**
        - Type: `booking_accepted` or `viewing_confirmed`
        - Title: "Viewing Request Accepted"
        - Message: "Your viewing request for [property title] has been accepted"
        - Action URL: `/tenant/viewing-requests` or `/properties/{id}`
      - **Email Notification (Tenant):**
        - Subject: "Viewing Request Accepted - [Property Title]"
        - Template: Booking confirmation email
        - Include: Property details, confirmed date/time, landlord contact info
    - **When Status Changes to "rejected":**
      - **In-App Notification (Tenant):**
        - Type: `booking_declined` or `viewing_rejected`
        - Title: "Viewing Request Declined"
        - Message: "Your viewing request for [property title] was declined"
        - Action URL: `/tenant/viewing-requests`
      - **Email Notification (Tenant):**
        - Subject: "Viewing Request Update - [Property Title]"
        - Template: Booking declined email
        - Include: Property details, reason (if provided)
  - **Backend Requirements:**
    - Verify landlord owns the property associated with booking
    - Update booking status
    - Create in-app notification for tenant
    - Send email notification to tenant
    - Return updated booking object

#### Property Status Flow
Properties follow this state machine:
1. **draft** → **pending** (on submit)
2. **pending** → **active** (on admin approval)
3. **pending** → **rejected** (on admin rejection)
4. **rejected** → **pending** (on resubmit)

**Backend must:**
- Validate state transitions
- Send notifications on state changes
- Return current status in property object

---

### Tenant Endpoints

#### Favorites
- **Add:** `POST /api/tenant/favorites/`
  - Request: `{ "property_id": 123 }` or `{ "propertyId": 123 }`
  - Response: `{ "id": 1, "property_id": 123, "created_at": "..." }`
  
- **Remove:** `DELETE /api/tenant/favorites/{propertyId}/`
  - Response: `{ "message": "Removed from favorites" }`
  
- **Check:** `GET /api/tenant/favorites/{propertyId}/check/`
  - Response: `{ "isFavorited": true }`
  
- **List:** `GET /api/tenant/favorites/`
  - Response: Array of favorite objects with full property data

#### Tenant Booking Management ⚠️ **NEW - BACKEND ACTION REQUIRED**

**Get All Tenant Bookings:**
- **Primary Endpoint:** `GET /api/tenant/bookings/`
- **Alternative Endpoint:** `GET /api/tenant/viewing-requests/` (fallback)
- **Authentication:** Required (Tenant role)
- **Query Params:**
  - `status`: Filter by status (pending, approved, scheduled, cancelled, completed)
- **Response:**
  ```json
  {
    "results": [/* booking objects */],
    "count": 10
  }
  ```
  OR
  ```json
  [/* array of booking objects */]
  ```
- **Booking Object Structure:**
  ```json
  {
    "id": 1,
    "property_id": 123,
    "property": {
      "id": 123,
      "title": "Modern Apartment",
      "address": "East Legon, Accra",
      "images": ["url1", "url2"]
    },
    "tenant_id": 45,
    "status": "approved",
    "preferred_date": "2026-02-15T10:00:00Z",
    "scheduled_date": "2026-02-15T10:00:00Z",
    "scheduled_time": "14:00",
    "message": "Interested in viewing",
    "contact_phone": "+233241234567",
    "landlord": {
      "id": 10,
      "full_name": "John Doe",
      "phone": "+233241234567"
    },
    "created_at": "2026-01-25T10:00:00Z",
    "updated_at": "2026-01-26T00:58:11Z"
  }
  ```
- **Status Values:**
  - `pending` / `requested` - Awaiting landlord response
  - `approved` / `scheduled` - Confirmed and scheduled
  - `rescheduled` - Tenant requested reschedule
  - `cancelled` - Cancelled by tenant or landlord
  - `completed` - Viewing completed
  - `no-show` - Tenant didn't show up
  - `declined` / `rejected` - Landlord declined

**Get Scheduled Bookings (Dashboard):**
- **Endpoint:** `GET /api/tenant/bookings/scheduled/`
- **Authentication:** Required (Tenant role)
- **Response:** Array of approved/scheduled bookings only, sorted by date (upcoming first)
- **Use Case:** Display upcoming bookings on tenant dashboard

**Reschedule Booking:**
- **Endpoint:** `PATCH /api/tenant/bookings/{id}/reschedule/`
- **Authentication:** Required (Tenant role - must own the booking)
- **Request:**
  ```json
  {
    "new_date": "2026-02-20",  // Required: YYYY-MM-DD format
    "new_time": "14:00",        // Optional: HH:MM format
    "message": "Need to reschedule due to..."  // Optional: Message to landlord
  }
  ```
- **Response:** Updated booking object with new status "rescheduled"
- **Validation:**
  - Booking must exist
  - Booking must be in status: pending, approved, or scheduled
  - New date must be in the future
- **Notifications (CRITICAL):**
  - **In-App Notification (Landlord):**
    - Type: `booking_rescheduled`
    - Title: "Booking Rescheduled"
    - Message: "Tenant has requested to reschedule viewing for [property title]"
    - Action URL: `/landlord/bookings/{id}`
  - **Email Notification (Landlord):**
    - Subject: "Booking Rescheduled - [Property Title]"
    - Include: New date/time, tenant message, property details

**Cancel Booking:**
- **Endpoint:** `PATCH /api/tenant/bookings/{id}/cancel/`
- **Authentication:** Required (Tenant role - must own the booking)
- **Request:**
  ```json
  {
    "reason": "No longer interested"  // Optional: Cancellation reason
  }
  ```
- **Response:** Updated booking object with status "cancelled"
- **Validation:**
  - Booking must exist
  - Booking must be in status: pending, approved, or scheduled
- **Notifications (CRITICAL):**
  - **In-App Notification (Landlord):**
    - Type: `booking_cancelled`
    - Title: "Booking Cancelled"
    - Message: "Tenant has cancelled viewing request for [property title]"
    - Action URL: `/landlord/bookings`
  - **Email Notification (Landlord):**
    - Subject: "Booking Cancelled - [Property Title]"
    - Include: Cancellation reason (if provided), property details

**Booking Lifecycle & Status Flow:**
1. **Tenant Creates Request** → Status: `pending`
   - Triggers: Notification to landlord (in-app + email)
2. **Landlord Approves** → Status: `approved` / `scheduled`
   - Triggers: Notification to tenant (in-app + email)
3. **Tenant Reschedules** → Status: `rescheduled`
   - Triggers: Notification to landlord (in-app + email)
   - Landlord can accept/reject reschedule
4. **Tenant Cancels** → Status: `cancelled`
   - Triggers: Notification to landlord (in-app + email)
5. **Viewing Completed** → Status: `completed`
   - Set by landlord or system after viewing
6. **No Show** → Status: `no-show`
   - Set by landlord if tenant doesn't show

**Important Notes:**
- All status changes must trigger both in-app and email notifications
- Booking data must include property details for display
- Scheduled date/time must be clearly separated (date vs time)
- Frontend normalizes all status variations automatically

#### Viewing Requests
- **Create Viewing Request (Property-scoped):**
  - **Endpoint:** `POST /api/properties/{propertyId}/viewing-request/`
  - **Authentication:** Required (Tenant role)
  - **Request:**
    ```json
    {
      "preferred_date": "2026-02-15T10:00:00Z",  // ISO datetime string (OPTIONAL - can be omitted)
      "message": "Interested in viewing this property",  // Optional (defaults to empty string)
      "contact_phone": "+233241234567"  // Optional - only send if provided (do not send null)
    }
    ```
  - **Important:** 
    - All fields are now **OPTIONAL** - frontend allows submission without any fields
    - Frontend will NOT send `contact_phone` field if it's null or empty
    - Frontend will NOT send `preferred_date` if not provided
    - Frontend will NOT send `message` if not provided
    - Backend should accept requests with no fields (landlord can suggest times)
  - **Response:**
    ```json
    {
      "id": 1,
      "property_id": 123,
      "tenant_id": 45,
      "status": "pending",
      "preferred_date": "2026-02-15T10:00:00Z",
      "message": "Interested in viewing this property",
      "contact_phone": "+233241234567",
      "created_at": "2026-01-25T10:00:00Z"
    }
    ```
  - **Error Handling:**
    - **400 Bad Request:** Return field-specific validation errors:
      ```json
      {
        "message": "Validation error",
        "errors": {
          "preferred_date": ["This field is required."],
          "property_id": ["Property not found or not available for viewing."]
        }
      }
      ```
    - **401 Unauthorized:** Authentication required
    - **403 Forbidden:** User must be a tenant
    - **404 Not Found:** Property doesn't exist
  - **Backend Requirements:**
    - Validate `preferred_date` is in the future
    - Validate property exists and is available (status: "active" or "approved")
    - Auto-set `tenant_id` from authenticated user
    - Default `status` to "pending"
    - Send notification to landlord when viewing request is created
    - `message` and `contact_phone` are optional fields

- **Create Viewing Request (Tenant-scoped - Alternative):**
  - **Endpoint:** `POST /api/tenant/viewing-requests/`
  - **Authentication:** Required (Tenant role)
  - **Request:**
    ```json
    {
      "property_id": 123,
      "preferred_date": "2026-02-15T10:00:00Z",
      "message": "Interested in viewing this property",
      "contact_phone": "+233241234567"  // Optional - only sent if provided
    }
    ```
  - **Response:** Same as property-scoped endpoint
  - **Note:** Frontend tries property-scoped endpoint first, falls back to this endpoint
  - **Important:** Frontend will NOT send `contact_phone` field if it's null or empty. Backend should treat missing field as optional.

- **Get Viewing Requests:**
  - **Endpoint:** `GET /api/tenant/viewing-requests/`
  - **Authentication:** Required (Tenant role)
  - **Response:**
    ```json
    {
      "results": [
        {
          "id": 1,
          "property_id": 123,
          "property": {
            "id": 123,
            "title": "Modern Apartment",
            "address": "East Legon, Accra"
          },
          "status": "pending",
          "preferred_date": "2026-02-15T10:00:00Z",
          "created_at": "2026-01-25T10:00:00Z"
        }
      ],
      "count": 1
    }
    ```

#### Maintenance Requests
- **List:** `GET /api/tenant/maintenance/`
- **Create:** `POST /api/tenant/maintenance/`
- **Update:** `PATCH /api/tenant/maintenance/{id}/`

#### Rentals
- **List:** `GET /api/tenant/rentals/`
- **Get:** `GET /api/tenant/rentals/{id}/`

---

### User Management Endpoints

#### Public Profile
- **Primary Endpoint:** `GET /api/users/{id}/profile/`
- **Alternative Endpoint:** `GET /api/users/{id}/` (fallback if primary returns 404)
- **Authentication:** Optional (public access, but authenticated users may see more data)
- **Response:** Public user profile
  ```json
  {
    "id": 4,
    "email": "user@example.com",
    "full_name": "John Doe",
    "role": "tenant",
    "phone": "+233241234567",
    "profile_picture": "https://example.com/avatar.jpg",
    "properties_count": 5,
    "services_count": 2,
    "jobs_completed": 3,
    "bookings_count": 2,
    "verification_status": "verified",
    "trust_score": 85,
    "created_at": "2025-01-01T00:00:00Z"
  }
  ```
- **Access Rules:**
  - **Public Users:** Basic info + approved properties/services + reviews
  - **Self:** Full profile + wallet information
  - **Admin/Super Admin:** Full profile for any user
- **⚠️ BACKEND ACTION REQUIRED:**
  - Implement `GET /api/users/{id}/profile/` endpoint
  - OR ensure `GET /api/users/{id}/` returns complete profile data
  - Currently returns 404, causing frontend errors

#### Admin - Pending Users
- **Endpoint:** `GET /api/admin/users/pending/`
- **Query Params:** `?role=landlord&page=1`
- **Response:** Paginated list of pending users

#### Admin - Approve User
- **Endpoint:** `PATCH /api/admin/users/{id}/approve/`
- **Request:** `{ "notes": "..." }` (optional)
- **Response:** Updated user object

#### Admin - Reject User
- **Endpoint:** `PATCH /api/admin/users/{id}/reject/`
- **Request:** `{ "reason": "Required field" }`
- **Response:** Updated user object

#### Admin - Suspend User
- **Endpoint:** `PATCH /api/admin/users/{id}/suspend/`
- **Request:** `{ "reason": "Violation of terms" }`
- **Response:** Updated user object

#### Super Admin - Delete User
- **Endpoint:** `DELETE /api/super-admin/users/{id}/`
- **Response:** `{ "message": "User deleted successfully" }`
- **Note:** Must be soft delete with audit log

---

### AI Endpoints

#### Property Recommendations
- **Endpoint:** `POST /api/ai/recommendations/properties/`
- **Authentication:** Required (JWT token)
- **Request:**
  ```json
  {
    "user_role": "tenant",
    "location": {
      "latitude": 5.6037,
      "longitude": -0.1870
    },
    "budget_range": {
      "min": 500,
      "max": 2000
    },
    "preferences": {
      "property_type": ["apartment", "house"],
      "bedrooms": 2,
      "bathrooms": 1,
      "amenities": ["Parking", "WiFi"]
    },
    "past_activity": {
      "viewed_properties": [1, 2, 3],
      "favorited_properties": [4, 5],
      "search_history": ["2-bedroom", "East Legon"]
    }
  }
  ```
- **Response:**
  ```json
  {
    "recommendations": [
      {
        "id": 1,
        "title": "Modern Apartment",
        "address": "East Legon, Accra",
        "price": 1500,
        "currency": "GHS",
        "bedrooms": 2,
        "bathrooms": 1,
        "images": ["url1", "url2"],
        "landlord": { "id": 1, "full_name": "John Doe" }
      }
    ],
    "reasoning": "Based on your preferences and activity history",
    "confidence_score": 0.85
  }
  ```
- **Error Handling:**
  - **500 Internal Server Error:** Should return user-friendly message: "Failed to generate recommendations. Please try again."
  - **400 Bad Request:** Return validation errors with field-specific messages
  - **401 Unauthorized:** Return authentication error
- **Backend Requirements:**
  - Must handle all optional fields gracefully (location, budget_range, preferences, past_activity)
  - Should return at least 3-5 recommendations if available
  - If no recommendations found, return empty array: `{"recommendations": [], "reasoning": "...", "confidence_score": 0}`
  - All property objects in recommendations must include: id, title, address, price, currency, images, landlord info

#### Artisan Recommendations
- **Endpoint:** `POST /api/ai/recommendations/artisans/`
- **Request:**
  ```json
  {
    "user_role": "tenant",
    "location": { "latitude": 5.6037, "longitude": -0.1870 },
    "service_type": "plumber",
    "trust_score_threshold": 80
  }
  ```
- **Response:**
  ```json
  {
    "recommendations": [/* artisan objects */],
    "reasoning": "...",
    "confidence_score": 0.82
  }
  ```

#### AI Chatbot
- **Send Message:** `POST /api/ai/chat/message/`
  - **Authentication:** Optional (supports both authenticated and public users)
  - **Request:**
    ```json
    {
      "message": "Find me a 2-bedroom apartment",
      "conversation_id": "conv_123",  // null for public users
      "context": {
        "user_role": "tenant",  // "public" for unauthenticated users
        "location": { "latitude": 5.6037, "longitude": -0.1870 },
        "current_page": "/tenant/properties"
      }
    }
    ```
  - **Response:**
    ```json
    {
      "response": "I found 5 properties matching your criteria...",
      "conversation_id": "conv_123",  // null for public users
      "suggested_actions": [
        { "type": "search", "label": "View Properties", "data": { "query": "2-bedroom" } }
      ]
    }
    ```
  - **Role-Based Responses:**
    - **Public:** General information about RentalConnects, property browsing, platform features
    - **Tenant:** Property search, artisan discovery, rental questions
    - **Landlord:** Property management, bookings, tenant finding
    - **Artisan:** Task management, earnings, schedule
    - **Admin:** Approvals, reports, administration
    - **Super Admin:** System management, user management, pricing

- **Get Conversations:** `GET /api/ai/chat/conversations/`
  - **Authentication:** Required (public users cannot access)
  - **Response:** Array of conversation objects with messages
  - **Note:** Public users do not have persistent conversations

#### Trust Score
- **Get Score:** `GET /api/ai/trust-score/{userId}/`
- **Authentication:** Optional (public profiles may access)
- **Response:**
  ```json
  {
    "user_id": 123,
    "trust_score": 85,
    "breakdown": {
      "verification": 25,
      "activity": 20,
      "reviews": 30,
      "behavior": 10
    },
    "last_updated": "2026-01-25T10:00:00Z"
  }
  ```
- **Error Handling:**
  - **404 Not Found:** User doesn't exist or no trust score calculated yet
  - **500 Internal Server Error:** Frontend will use default score (50) - backend should log error but not break user experience
  - **400 Bad Request:** Invalid user ID format
- **Backend Requirements:**
  - Trust score should be calculated on-demand or cached
  - Score range: 0-100
  - Breakdown categories: verification, activity, reviews, behavior (all optional)
  - If calculation fails, return 404 instead of 500 (allows frontend to use default)

- **Batch Scores:** `POST /api/ai/trust-score/batch/`
  - **Authentication:** Required
  - **Request:** `{ "user_ids": [1, 2, 3] }`
  - **Response:**
    ```json
    {
      "scores": [
        { "user_id": 1, "trust_score": 85 },
        { "user_id": 2, "trust_score": 72 },
        { "user_id": 3, "trust_score": 90 }
      ]
    }
    ```
  - Response: `{ "scores": [{ "user_id": 1, "trust_score": 85 }, ...] }`

**Rate Limiting:** All AI endpoints must implement rate limiting (429 errors) with clear error messages.

---

## Booking & Viewing Request System

### Booking Status Flow

```
pending/requested → accepted/approved → completed
                ↓
            declined/rejected
```

**Status Transitions:**
1. **pending/requested:** Initial state when tenant creates viewing request
2. **accepted/approved:** Landlord accepts the viewing request
3. **declined/rejected:** Landlord declines the viewing request
4. **completed:** Viewing was completed (optional status)
5. **no-show:** Tenant didn't show up (optional status)

### Notification System for Bookings

#### When Tenant Creates Viewing Request

**1. In-App Notification (Landlord):**
- **Endpoint:** `POST /api/notifications/`
- **Type:** `viewing_request` or `booking_request`
- **Title:** "New Viewing Request"
- **Message:** "Tenant [tenant_name] requested to view [property_title]"
- **Action URL:** `/landlord/bookings` or `/landlord/bookings/{booking_id}`
- **Metadata:**
  ```json
  {
    "booking_id": 1,
    "property_id": 123,
    "tenant_id": 45,
    "property_title": "Modern Apartment",
    "tenant_name": "John Doe"
  }
  ```

**2. Email Notification (Landlord):**
- **Trigger:** Automatically when viewing request is created
- **Recipient:** Property owner (landlord)
- **Subject:** "New Viewing Request for [Property Title] - RentalConnects"
- **Template:** `generateViewingRequestEmail`
- **Content:**
  - Tenant name
  - Property title
  - Requested date/time (if provided)
  - Tenant message (if provided)
  - Link to manage booking: `/landlord/bookings/{booking_id}`
- **Backend Implementation:**
  ```python
  # After creating viewing request
  send_viewing_request_email(
      landlord=property.landlord,
      request_data={
          "tenantName": tenant.full_name,
          "propertyTitle": property.title,
          "requestDate": booking.preferred_date,
          "requestId": booking.id
      }
  )
  ```

#### When Landlord Accepts Booking

**1. In-App Notification (Tenant):**
- **Type:** `booking_accepted` or `viewing_confirmed`
- **Title:** "Viewing Request Accepted"
- **Message:** "Your viewing request for [property_title] has been accepted"
- **Action URL:** `/tenant/viewing-requests` or `/properties/{property_id}`

**2. Email Notification (Tenant):**
- **Subject:** "Viewing Request Accepted - [Property Title]"
- **Template:** Booking confirmation email
- **Content:**
  - Property details
  - Confirmed date/time
  - Landlord contact information
  - Property address for viewing

#### When Landlord Declines Booking

**1. In-App Notification (Tenant):**
- **Type:** `booking_declined` or `viewing_rejected`
- **Title:** "Viewing Request Declined"
- **Message:** "Your viewing request for [property_title] was declined"
- **Action URL:** `/tenant/viewing-requests`

**2. Email Notification (Tenant):**
- **Subject:** "Viewing Request Update - [Property Title]"
- **Template:** Booking declined email
- **Content:**
  - Property details
  - Decline reason (if provided by landlord)
  - Alternative suggestions (optional)

### Backend Implementation Requirements

**Viewing Request Creation:**
1. Create booking record with status "pending"
2. Create in-app notification for landlord
3. Send email notification to landlord
4. Return booking object

**Booking Response (Accept/Decline):**
1. Update booking status
2. Create in-app notification for tenant
3. Send email notification to tenant
4. Return updated booking object

**Notification Endpoints:**
- `POST /api/notifications/` - Create in-app notification
- Email notifications are sent automatically by backend email service

---

## Email System

### Email Template Structure

All emails use a consistent template with:
- **Logo:** Circular logo (80px) with 3px border in header
- **Colors:** White background, Teal (#0b6e4f) accents
- **Footer:** Links to Terms, Privacy, Support, Unsubscribe
- **Responsive:** Works on all email clients

### Email Templates

#### 1. Welcome Email
- **Trigger:** User signup
- **Subject:** "Welcome to RentalConnects!"
- **Content:** Welcome message, next steps

#### 2. Password Reset
- **Trigger:** Forgot password request
- **Subject:** "Reset Your Password"
- **Content:** Reset link with expiration

#### 3. Property Approval
- **Trigger:** Property approved by admin
- **Subject:** "Your Property Has Been Approved"
- **Content:** Property details, next steps

#### 4. Property Rejection
- **Trigger:** Property rejected by admin
- **Subject:** "Property Submission Update"
- **Content:** Rejection reason, resubmission instructions

#### 5. Login Activity Emails
- **Successful Login:** `sendSuccessfulLoginEmail(user, loginData)`
- **Failed Login:** `sendFailedLoginEmail(user, loginData)`
- **New Device Login:** `sendNewDeviceLoginEmail(user, loginData)`
- **Suspicious Login:** `sendSuspiciousLoginEmail(user, loginData)`

**Login Data Structure:**
```json
{
  "loginTime": "2026-01-25 10:00:00",
  "ipAddress": "192.168.1.1",
  "device": "Chrome on Windows",
  "location": "Accra, Ghana"
}
```

#### 6. Viewing Request Emails
- **Viewing Request Received (Landlord):**
  - **Trigger:** Tenant creates viewing request
  - **Subject:** "New Viewing Request for [Property Title] - RentalConnects"
  - **Template:** `generateViewingRequestEmail`
  - **Parameters:**
    ```json
    {
      "userName": "Landlord Name",
      "tenantName": "Tenant Name",
      "propertyTitle": "Property Title",
      "requestDate": "2026-02-15T10:00:00Z",  // Optional - may be null
      "viewRequestUrl": "/landlord/bookings/{booking_id}",
      "logoUrl": "https://..."
    }
    ```
  - **Content:** Tenant name, property title, requested date (if provided), link to manage booking

- **Booking Confirmation (Tenant):**
  - **Trigger:** Landlord accepts viewing request
  - **Subject:** "Viewing Request Confirmed - RentalConnects"
  - **Template:** `generateBookingConfirmationEmail`
  - **Parameters:**
    ```json
    {
      "userName": "Tenant Name",
      "propertyTitle": "Property Title",
      "bookingDate": "2026-02-15T10:00:00Z",
      "landlordName": "Landlord Name",
      "logoUrl": "https://..."
    }
    ```
  - **Content:** Property details, confirmed date/time, landlord contact information

- **Booking Declined (Tenant):**
  - **Trigger:** Landlord declines viewing request
  - **Subject:** "Viewing Request Update - [Property Title]"
  - **Template:** Booking declined email (similar structure to confirmation)
  - **Content:** Property details, decline reason (if provided), alternative suggestions (optional)

### Email Implementation Options

#### Option 1: Frontend Generates HTML (Recommended)
Frontend generates HTML and sends to backend:
```python
POST /api/admin/send-email/
{
  "to": "user@example.com",
  "subject": "Welcome to RentalConnects",
  "html": "<!DOCTYPE html>...",
  "text": "Plain text version"
}
```

#### Option 2: Backend Generates HTML
Backend uses template structure to generate HTML server-side.

### Email Service Requirements
- Use Django's `send_mail()` or similar
- Support HTML and plain text
- Handle email failures gracefully
- Log all email sends
- Support unsubscribe links

---

## Error Handling & Rate Limiting

### HTTP Status Codes

- **200:** Success
- **201:** Created
- **400:** Bad Request (validation errors)
- **401:** Unauthorized (token expired/invalid)
- **403:** Forbidden (insufficient permissions)
- **404:** Not Found
- **409:** Conflict (duplicate data)
- **422:** Unprocessable Entity (validation errors with field details)
- **429:** Too Many Requests (rate limit exceeded)
- **500+:** Server Error

### Rate Limiting (429 Errors)

**All AI endpoints must implement rate limiting:**
- **Limit:** Configurable (e.g., 10 requests per minute per user)
- **Response:**
  ```json
  {
    "error": "Too many requests",
    "message": "We're receiving too many requests right now. Please wait a moment and try again. This helps ensure everyone gets fast responses!",
    "retry_after": 60
  }
  ```
- **Headers:**
  - `X-RateLimit-Limit`: Maximum requests allowed
  - `X-RateLimit-Remaining`: Remaining requests
  - `X-RateLimit-Reset`: Time when limit resets
  - `Retry-After`: Seconds to wait before retrying

### Error Response Format

**Standard Error:**
```json
{
  "error": "Error type",
  "message": "User-friendly error message",
  "details": { /* optional additional details */ }
}
```

**Validation Error (422):**
```json
{
  "error": "Validation error",
  "message": "Invalid data provided",
  "field_errors": {
    "email": ["This field is required"],
    "password": ["Password must be at least 8 characters"]
  }
}
```

---

## Property Management

### Property Status Flow

```
draft → pending → active
              ↓
          rejected
```

**State Transitions:**
1. **draft → pending:** Landlord submits for approval
2. **pending → active:** Admin approves
3. **pending → rejected:** Admin rejects (with reason)
4. **rejected → pending:** Landlord resubmits

**Backend Requirements:**
- Validate transitions are valid
- Store rejection reason
- Send notifications on state changes
- Return status in all property responses

### Property Fields

**Required:**
- `title` (string)
- `description` (text)
- `address` (string)
- `price` (decimal)
- `currency` (string: "GHS" or "USD")
- `property_type` (string)
- `landlord_id` (foreign key)

**Optional:**
- `bedrooms` (integer)
- `bathrooms` (integer)
- `images` (array of image URLs)
- `amenities` (array of amenity IDs or objects - see Amenity Format section)
- `status` (string: draft, pending, active, rejected)
- `rejection_reason` (text, when rejected)

### Amenity Format & Handling

**Important:** The backend may return amenities in various formats. The frontend handles all formats automatically using the `amenityUtils` utility.

#### Backend Response Formats

The `amenities` field in property responses can be in any of these formats:

1. **String Array (Simple):**
   ```json
   {
     "amenities": ["Parking", "WiFi", "Security"]
   }
   ```

2. **Object Array (Flat):**
   ```json
   {
     "amenities": [
       { "id": 1, "name": "Parking" },
       { "id": 2, "name": "WiFi" },
       { "id": 3, "name": "Security" }
     ]
   }
   ```

3. **Nested Object Array (Django Many-to-Many):**
   ```json
   {
     "amenities": [
       { "id": 1, "amenity": { "id": 1, "name": "Parking" } },
       { "id": 2, "amenity": { "id": 2, "name": "WiFi" } },
       { "id": 3, "amenity": { "id": 3, "name": "Security" } }
     ]
   }
   ```

#### Frontend Handling

The frontend uses `src/utils/amenityUtils.js` to normalize all formats:

- **`getAmenityName(amenity, index)`** - Extracts amenity name from any format
- **`getAmenityId(amenity)`** - Extracts amenity ID from any format
- **`normalizeAmenities(amenities)`** - Normalizes entire array to string names

**Backend Recommendation:**
- **Preferred Format:** Return amenities as flat objects: `{ "id": 1, "name": "Parking" }`
- **Alternative:** Return nested format if using Django Many-to-Many relationships
- **Avoid:** Mixing formats in the same response (use consistent format per endpoint)

#### Amenity Endpoints

**Get All Amenities:**
- **Endpoint:** `GET /api/properties/amenities/`
- **Response:** Array of amenity objects
  ```json
  [
    { "id": 1, "name": "Parking" },
    { "id": 2, "name": "WiFi" },
    { "id": 3, "name": "Security" }
  ]
  ```

**Property Creation/Update:**
- **Request Field:** `amenity_ids[]` (array of amenity ID strings/numbers)
- **Example:** `amenity_ids: ["1", "2", "3"]`
- **Note:** Frontend converts amenity names to IDs before sending

---

## User Management

### User Roles

1. **tenant:** Can browse properties, add favorites, request viewings
2. **landlord:** Can create/manage properties, respond to bookings
3. **artisan:** Can provide services, manage profile
4. **admin:** Can approve/reject users and properties
5. **super_admin:** Full system access

### User Approval Flow

1. User signs up → Status: `pending`
2. Admin reviews → Approve or Reject
3. If approved → Status: `active`, send welcome email
4. If rejected → Status: `rejected`, store reason

### User Suspension

- **Endpoint:** `PATCH /api/admin/users/{id}/suspend/`
- **Request:** `{ "reason": "Violation of terms" }`
- **Action:** Set user status to `suspended`
- **Effect:** User cannot log in
- **Notification:** Send suspension email

### User Deletion (Super Admin)

- **Endpoint:** `DELETE /api/super-admin/users/{id}/`
- **Action:** Soft delete (set `is_deleted=True`)
- **Audit:** Log deletion in audit log
- **Cascade:** Handle related data (properties, favorites, etc.)

---

## Authentication & Security

### JWT Tokens

- **Access Token:** Short-lived (15 minutes recommended)
- **Refresh Token:** Long-lived (7 days recommended)
- **Storage:** Frontend stores in memory/sessionStorage
- **Refresh:** Automatic on 401 responses

### Login Activity Tracking

**Backend must track:**
- Login time
- IP address
- User agent (device/browser)
- Location (if available)
- Success/failure status

**Use for:**
- Email notifications
- Security monitoring
- Audit logs

### Password Requirements

- Minimum 8 characters
- Must contain letters and numbers
- Case-sensitive

---

## Recent Updates

### January 2026 Updates

#### 1. Error Message Improvements
- Added user-friendly error messages for all HTTP status codes
- Special handling for 429 rate limit errors
- Consistent error format across all endpoints

#### 2. Rate Limiting
- All AI endpoints now have rate limiting
- Clear error messages when limit exceeded
- Retry-After headers included

#### 3. AI Chatbot Enhancements
- Support for conversation history
- Context-aware responses (user role, location, current page)
- Suggested actions in responses

#### 4. Property Status Flow
- Complete state machine implementation
- Validation of state transitions
- Notifications on state changes

#### 5. Email System
- Login activity email templates
- Circular logo with border
- Responsive email design

#### 6. Trust Score System
- AI-calculated trust scores
- Breakdown by category (verification, activity, reviews, behavior)
- Batch retrieval support

#### 7. Artisan Signup Form Enhancement (January 2026)
- **Form Fields:** All input fields now have visible labels using `FormInput` component
- **Required Fields:** Full Name, Email, Phone, Password, Confirm Password, Profession
- **Optional Fields:** Experience (years), Region/City, ID Upload (image/PDF)
- **Field Format:** Backend expects camelCase field names (`fullName`, `confirmPassword`, `idUpload`)
- **File Upload:** Supports `multipart/form-data` for ID document uploads
- **Validation:** Password minimum 8 characters, email format validation

#### 8. AI Chatbot - Public Access (January 2026)
- **Public Users:** Chatbot now accessible to unauthenticated users on public pages
- **Role-Based Assistance:** Different welcome messages and context based on user role:
  - **Public:** General platform information, property browsing help
  - **Tenant:** Property search, artisan discovery, rental questions
  - **Landlord:** Property management, bookings, tenant finding
  - **Artisan:** Task management, earnings, schedule
  - **Admin:** Approvals, reports, administration
  - **Super Admin:** System management, user management, pricing
- **Conversation Handling:** 
  - Authenticated users: Persistent conversations with history
  - Public users: No conversation persistence (conversation_id is null)
- **Context:** All requests include `user_role` in context (use "public" for unauthenticated users)
- **Endpoint:** `POST /api/ai/chat/message/` now accepts requests without authentication

#### 9. Error Handling Standardization (January 2026)
- **Centralized Error Messages:** All endpoints return user-friendly error messages
- **Rate Limit Messages:** 429 errors include clear, actionable messages
- **Error Format:** Consistent error response structure across all endpoints
- **Frontend Integration:** Error messages are standardized in `src/utils/errorMessages.js`

#### 10. Amenity Format Handling (January 2026)
- **Multiple Format Support:** Frontend now handles all amenity response formats:
  - String arrays: `["Parking", "WiFi"]`
  - Flat objects: `[{id: 1, name: "Parking"}]`
  - Nested objects: `[{id: 1, amenity: {id: 1, name: "Parking"}}]`
- **Utility Functions:** Created `src/utils/amenityUtils.js` for consistent amenity extraction
- **Error Prevention:** Fixed React rendering errors where amenity objects were rendered directly
- **Backend Recommendation:** Use flat object format `{id, name}` for consistency
- **Components Updated:**
  - `PropertyDetail.jsx`
  - `PropertyDetailsPage.jsx` (Landlord)
  - `AdminPropertyDetailPage.jsx`

#### 11. Booking Form - All Fields Optional (January 2026)
- **Form Updates:**
  - `preferred_date` is now optional (removed required validation)
  - `message` remains optional
  - `contact_phone` remains optional
  - Users can submit viewing requests with no fields (landlord can suggest times)
- **Backend Requirements:**
  - Accept viewing requests with no fields
  - All fields (`preferred_date`, `message`, `contact_phone`) should be optional
  - If `preferred_date` is provided, validate it's in the future
  - If `preferred_date` is not provided, allow landlord to suggest available times

#### 12. Booking Notification System (January 2026)
- **When Tenant Creates Viewing Request:**
  - In-app notification sent to landlord (type: `viewing_request`)
  - Email notification sent to landlord (subject: "New Viewing Request for [Property]")
- **When Landlord Accepts Booking:**
  - In-app notification sent to tenant (type: `booking_accepted`)
  - Email notification sent to tenant (subject: "Viewing Request Accepted")
- **When Landlord Declines Booking:**
  - In-app notification sent to tenant (type: `booking_declined`)
  - Email notification sent to tenant (subject: "Viewing Request Update")
- **Backend Requirements:**
  - All status changes must trigger both in-app and email notifications
  - Notifications must include relevant booking/property/tenant information
  - Action URLs should link to appropriate pages for managing bookings

#### 13. Booking Response Endpoint Fix (January 2026) ⚠️ **CRITICAL - BACKEND ACTION REQUIRED**
- **Issue:** All booking response endpoints currently fail:
  - `PATCH /api/landlord/bookings/{id}/respond/` → 404
  - `PATCH /api/properties/viewing-requests/{id}/` → 500 (UnboundLocalError)
  - `PATCH /api/bookings/{id}/` → 404
- **Frontend Solution:** Tries multiple endpoints in order:
  1. `PATCH /api/properties/viewing-requests/{id}/respond/` (RECOMMENDED - implement this)
  2. `PATCH /api/properties/viewing-requests/{id}/` (fallback - fix existing bug)
  3. `PATCH /api/landlord/bookings/{id}/respond/` (alternative)
  4. `PATCH /api/bookings/{id}/` (last resort)
- **Backend Requirements:**
  - **Priority 1:** Implement `PATCH /api/properties/viewing-requests/{id}/respond/` endpoint
    - Accept `status` field: "approved" or "rejected"
    - Validate landlord owns the property
    - Update viewing request status
    - Trigger notifications (in-app + email)
    - Return updated viewing request object
  - **OR Priority 2:** Fix existing `PATCH /api/properties/viewing-requests/{id}/` endpoint
    - Fix `UnboundLocalError` in `properties/views.py` line 707
    - Ensure serializer is properly initialized before use
- **Request Format:**
  ```json
  {
    "status": "approved"  // or "rejected"
  }
  ```
- **Response Format:** Updated viewing request object with new status
- **Status Codes:**
  - `200 OK`: Success
  - `404 Not Found`: Viewing request doesn't exist
  - `403 Forbidden`: User doesn't own the property
  - `400 Bad Request`: Invalid status value

#### 14. User Profile Endpoint Fix (January 2026) ⚠️ **HIGH PRIORITY - BACKEND ACTION REQUIRED**
- **Issue:** `GET /api/users/{id}/profile/` returns 404
- **Frontend Solution:** Added fallback to `GET /api/users/{id}/` if primary returns 404
- **Backend Requirements:**
  - **Priority:** Implement `GET /api/users/{id}/profile/` endpoint
    - OR ensure `GET /api/users/{id}/` returns complete profile data
  - **Response Should Include:**
    - Basic info: id, email, full_name, role, phone, profile_picture
    - Counts: properties_count, services_count, jobs_completed, bookings_count
    - Status: verification_status, trust_score
    - Timestamps: created_at
  - **Access Control:**
    - Public users: Basic info + approved properties/services
    - Self: Full profile + wallet
    - Admin/Super Admin: Full profile for any user

#### 15. Tenant Booking Management System (January 2026) ⚠️ **CRITICAL - BACKEND ACTION REQUIRED**
- **New Features Implemented:**
  - Tenant bookings management page (`/tenant/bookings`)
  - Scheduled bookings overview on dashboard
  - Reschedule booking functionality
  - Cancel booking functionality
  - Calendar and list views
  - Status filtering (all, pending, scheduled, cancelled, completed)
- **Backend Requirements:**
  - **Priority 1:** Implement `GET /api/tenant/bookings/` endpoint
    - Return all bookings for authenticated tenant
    - Include property details in response
    - Support status filtering via query params
  - **Priority 2:** Implement `GET /api/tenant/bookings/scheduled/` endpoint
    - Return only scheduled/approved bookings
    - Sort by date (upcoming first)
    - Used for dashboard overview
  - **Priority 3:** Implement `PATCH /api/tenant/bookings/{id}/reschedule/` endpoint
    - Accept: `new_date` (required), `new_time` (optional), `message` (optional)
    - Validate booking can be rescheduled
    - Update status to "rescheduled"
    - Trigger notifications to landlord
  - **Priority 4:** Implement `PATCH /api/tenant/bookings/{id}/cancel/` endpoint
    - Accept: `reason` (optional)
    - Validate booking can be cancelled
    - Update status to "cancelled"
    - Trigger notifications to landlord
- **Notification Requirements:**
  - **When Tenant Reschedules:**
    - In-app notification to landlord (type: `booking_rescheduled`)
    - Email notification to landlord
  - **When Tenant Cancels:**
    - In-app notification to landlord (type: `booking_cancelled`)
    - Email notification to landlord
- **Data Format Requirements:**
  - Booking objects must include: id, property_id, property (with title, address, images), status, scheduled_date, scheduled_time, landlord info
  - All dates in ISO format
  - Status values: pending, approved, scheduled, rescheduled, cancelled, completed, no-show
- **Empty State Handling:**
  - Return empty array `[]` if no bookings (not 404)
  - Frontend handles empty states gracefully
- **Issue:** `GET /api/users/{id}/profile/` returns 404
- **Frontend Solution:** Added fallback to `GET /api/users/{id}/` if primary returns 404
- **Backend Requirements:**
  - **Priority:** Implement `GET /api/users/{id}/profile/` endpoint
    - OR ensure `GET /api/users/{id}/` returns complete profile data
  - **Response Should Include:**
    - Basic info: id, email, full_name, role, phone, profile_picture
    - Counts: properties_count, services_count, jobs_completed, bookings_count
    - Status: verification_status, trust_score
    - Timestamps: created_at
  - **Access Control:**
    - Public users: Basic info + approved properties/services
    - Self: Full profile + wallet
    - Admin/Super Admin: Full profile for any user

#### 13. API Error Handling Improvements (January 2026)
- **Recommendations Endpoint:**
  - Improved error messages for 500 errors: "Failed to generate recommendations. Please try again."
  - Backend should return user-friendly error messages instead of generic 500 errors
- **Trust Score Endpoint:**
  - Frontend now gracefully handles 500 errors by using default score (50)
  - Backend should return 404 for users without trust scores instead of 500
  - Trust score calculation failures should not break user experience
- **Viewing Request Endpoints:**
  - Enhanced validation error messages with field-specific feedback
  - Frontend validates required fields before sending request
  - Backend should return detailed validation errors:
    ```json
    {
      "message": "Validation error",
      "errors": {
        "preferred_date": ["This field is required."],
        "property_id": ["Property not found."]
      }
    }
    ```
- **Error Response Format:**
  - All endpoints should return consistent error format:
    - `message`: User-friendly error message
    - `detail`: Detailed error description (optional)
    - `errors`: Field-specific validation errors (for 400 errors)

---

## Testing Requirements

### Unit Tests
- All endpoints should have unit tests
- Test authentication/authorization
- Test validation rules
- Test error handling

### Integration Tests
- Test complete user flows
- Test state transitions
- Test email sending
- Test rate limiting

### Performance Tests
- Test API response times
- Test rate limiting effectiveness
- Test concurrent requests

---

## Deployment Checklist

- [ ] All endpoints implemented
- [ ] Rate limiting configured
- [ ] Email service configured
- [ ] Error handling tested
- [ ] Authentication working
- [ ] CORS configured
- [ ] Environment variables set
- [ ] Database migrations run
- [ ] Logging configured
- [ ] Monitoring set up

---

## Support & Contact

For backend implementation questions or issues, refer to:
- API endpoint definitions: `src/config/apiEndpoints.js`
- Frontend service files: `src/services/`
- Error handling: `src/utils/errorMessages.js`

---

**End of Documentation**
