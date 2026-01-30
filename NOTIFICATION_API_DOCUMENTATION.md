# Notification System - Complete API Documentation

**Date**: January 26, 2026  
**Version**: 1.1  
**Status**: Frontend Ready - Backend Implementation Required

---

## Overview

This document provides complete API specifications for the notification system, including all endpoints, request/response formats, error handling, and integration requirements.

---

## Table of Contents

1. [Notification State Management APIs](#notification-state-management-apis)
2. [Email Notification API](#email-notification-api)
3. [Notification Creation (Backend Auto-Create)](#notification-creation-backend-auto-create)
4. [Notification Object Schema](#notification-object-schema)
5. [Conditional View Details Logic](#conditional-view-details-logic)
6. [Pinned Notification Styling](#pinned-notification-styling)
7. [Error Handling](#error-handling)
8. [Testing Requirements](#testing-requirements)

---

## Notification State Management APIs

### 1. Pin/Unpin Notification

**Endpoint**: `PATCH /api/notifications/{id}/`

**Method**: `PATCH`

**Authentication**: Required (Bearer token)

**Request Headers**:
```http
Authorization: Bearer {access_token}
Content-Type: application/json
```

**Request Body**:
```json
{
  "is_pinned": true
}
```

OR to unpin:
```json
{
  "is_pinned": false
}
```

**Response** (200 OK):
```json
{
  "id": 123,
  "notification_type": "booking_accepted",
  "type": "booking_accepted",
  "title": "Viewing Request Accepted",
  "message": "Your viewing request for Modern Apartment has been accepted. Scheduled for February 15, 2026 at 14:00.",
  "is_read": false,
  "is_pinned": true,
  "is_archived": false,
  "action_url": "/tenant/bookings",
  "metadata": {
    "booking_id": 123,
    "property_id": 456,
    "property_title": "Modern Apartment"
  },
  "created_at": "2026-01-26T10:00:00Z",
  "updated_at": "2026-01-26T11:00:00Z"
}
```

**Status Codes**:
- `200 OK`: Success - Notification updated
- `404 Not Found`: Notification doesn't exist
- `403 Forbidden`: User doesn't own the notification
- `400 Bad Request`: Invalid request data
- `401 Unauthorized`: Not authenticated

**Error Response Format**:
```json
{
  "detail": "Not found."
}
```

OR
```json
{
  "error": "You do not have permission to perform this action."
}
```

---

### 2. Archive/Unarchive Notification

**Endpoint**: `PATCH /api/notifications/{id}/`

**Method**: `PATCH`

**Authentication**: Required (Bearer token)

**Request Headers**:
```http
Authorization: Bearer {access_token}
Content-Type: application/json
```

**Request Body**:
```json
{
  "is_archived": true
}
```

OR to unarchive:
```json
{
  "is_archived": false
}
```

**Response** (200 OK):
```json
{
  "id": 123,
  "notification_type": "booking_accepted",
  "type": "booking_accepted",
  "title": "Viewing Request Accepted",
  "message": "Your viewing request for Modern Apartment has been accepted...",
  "is_read": false,
  "is_pinned": false,
  "is_archived": true,
  "action_url": "/tenant/bookings",
  "metadata": {
    "booking_id": 123,
    "property_id": 456
  },
  "created_at": "2026-01-26T10:00:00Z",
  "updated_at": "2026-01-26T11:00:00Z"
}
```

**Status Codes**: Same as Pin/Unpin

**Important Notes**:
- Archived notifications should be excluded from default queries (`is_archived=false` by default)
- Frontend uses `GET /api/notifications/?is_archived=true` to fetch archived notifications
- Unarchiving restores notification to main list

---

### 3. Delete Notification

**Endpoint**: `DELETE /api/notifications/{id}/`

**Method**: `DELETE`

**Authentication**: Required (Bearer token)

**Request Headers**:
```http
Authorization: Bearer {access_token}
```

**Request Body**: None

**Response** (204 No Content - Preferred):
```
(No body)
```

**Alternative Response** (200 OK):
```json
{
  "message": "Notification deleted successfully"
}
```

**Status Codes**:
- `204 No Content`: Success (preferred)
- `200 OK`: Success with message body
- `404 Not Found`: Notification doesn't exist or already deleted
- `403 Forbidden`: User doesn't own the notification
- `401 Unauthorized`: Not authenticated

**Error Response Format**:
```json
{
  "detail": "Not found."
}
```

**Important Requirements**:
- **Idempotent**: Should not throw error if notification already deleted
- **Permanent**: Deletion should be permanent (soft delete optional but not required)
- **Frontend Expectation**: Frontend expects 204 or 200 response
- **No Error on Already Deleted**: If notification already deleted, return 204 or 200 (not 404)

---

### 4. Get Archived Notifications

**Endpoint**: `GET /api/notifications/?is_archived=true`

**Method**: `GET`

**Authentication**: Required (Bearer token)

**Query Parameters**:
- `is_archived`: `true` (required for archived view)
- `is_read`: Optional (`true`/`false`)
- `notification_type`: Optional filter by type
- `is_pinned`: Optional filter by pinned status

**Request Example**:
```http
GET /api/notifications/?is_archived=true&is_read=false
Authorization: Bearer {access_token}
```

**Response** (200 OK):
```json
{
  "results": [
    {
      "id": 123,
      "notification_type": "booking_accepted",
      "type": "booking_accepted",
      "title": "Viewing Request Accepted",
      "message": "Your viewing request has been accepted...",
      "is_read": false,
      "is_pinned": false,
      "is_archived": true,
      "action_url": "/tenant/bookings",
      "metadata": {
        "booking_id": 123,
        "property_id": 456
      },
      "created_at": "2026-01-26T10:00:00Z"
    }
  ],
  "count": 1,
  "next": null,
  "previous": null
}
```

**Alternative Response Format** (if not paginated):
```json
[
  {
    "id": 123,
    "notification_type": "booking_accepted",
    ...
  }
]
```

**Status Codes**:
- `200 OK`: Success
- `401 Unauthorized`: Not authenticated

---

### 5. Get All Notifications (with Filters)

**Endpoint**: `GET /api/notifications/`

**Method**: `GET`

**Authentication**: Required (Bearer token)

**Query Parameters**:
- `is_read`: Optional filter by read status (`true`/`false`)
- `is_pinned`: Optional filter by pinned status (`true`/`false`)
- `is_archived`: Optional filter by archived status (`true`/`false`) - **Default: `false`**
- `notification_type`: Optional filter by type (e.g., `booking_accepted`)
- `type`: Alias for `notification_type` (for compatibility)

**Request Examples**:
```http
# Get all unread notifications
GET /api/notifications/?is_read=false

# Get all pinned notifications
GET /api/notifications/?is_pinned=true

# Get all booking notifications
GET /api/notifications/?notification_type=booking_accepted

# Get unread, non-archived notifications
GET /api/notifications/?is_read=false&is_archived=false
```

**Response** (200 OK):
```json
{
  "results": [/* notification objects */],
  "count": 10,
  "next": null,
  "previous": null
}
```

**Important Notes**:
- **Default Behavior**: If `is_archived` is not specified, return only non-archived notifications (`is_archived=false`)
- **Pagination**: Support pagination if many notifications exist
- **Sorting**: Frontend sorts by pinned first, then unread, then date (backend can pre-sort)

---

## Email Notification API

### Trigger Email Notification

**Endpoint**: `POST /api/notifications/send-email/`

**Method**: `POST`

**Authentication**: Required (Bearer token)

**Request Headers**:
```http
Authorization: Bearer {access_token}
Content-Type: application/json
```

**Request Body**:
```json
{
  "notification_type": "booking_approved",
  "recipient_id": 45,
  "email_data": {
    "subject": "Viewing Request Accepted - Modern Apartment",
    "property_title": "Modern Apartment",
    "property_address": "East Legon, Accra",
    "scheduled_date": "February 15, 2026",
    "scheduled_time": "14:00",
    "landlord_name": "John Doe",
    "booking_id": 123
  },
  "metadata": {
    "booking_id": 123,
    "property_id": 456,
    "tenant_id": 45
  }
}
```

**Response** (200 OK - Success):
```json
{
  "success": true,
  "message": "Email sent successfully",
  "email_id": "email_123"
}
```

**Response** (200 OK - Failure - Non-blocking):
```json
{
  "success": false,
  "error": "Email service unavailable",
  "message": "Failed to send email, but notification created"
}
```

**Status Codes**:
- `200 OK`: Request processed (success or failure returned in body)
- `400 Bad Request`: Invalid request data
- `401 Unauthorized`: Not authenticated
- `404 Not Found`: Recipient user not found

**Critical Requirements**:
- **MUST NOT throw errors** - Always return 200 with success/failure in body
- **Non-blocking**: Email failures should not prevent notification creation
- **Graceful Degradation**: If email fails, return `success: false` but don't throw
- **Frontend Expectation**: Frontend handles `success: false` gracefully

---

## Notification Creation (Backend Auto-Create)

### When to Auto-Create Notifications

Backend should automatically create in-system notifications when these events occur:

#### 1. Booking Approved (Landlord → Tenant)

**Trigger**: When landlord approves a viewing request/booking

**Notification Type**: `booking_accepted` or `booking_approved`

**Recipient**: Tenant (booking creator)

**Notification Data**:
```json
{
  "notification_type": "booking_accepted",
  "title": "Viewing Request Accepted",
  "message": "Your viewing request for [property_title] has been accepted. Scheduled for [scheduled_date] at [scheduled_time].",
  "action_url": "/tenant/bookings",
  "metadata": {
    "booking_id": 123,
    "property_id": 456,
    "property_title": "Modern Apartment",
    "scheduled_date": "2026-02-15T10:00:00Z",
    "scheduled_time": "14:00",
    "landlord_id": 10,
    "landlord_name": "John Doe"
  }
}
```

**Email Trigger**: Also send email notification (see Email Notification API)

---

#### 2. Booking Rejected (Landlord → Tenant)

**Trigger**: When landlord rejects/declines a viewing request/booking

**Notification Type**: `booking_declined` or `booking_rejected`

**Recipient**: Tenant (booking creator)

**Notification Data**:
```json
{
  "notification_type": "booking_declined",
  "title": "Viewing Request Declined",
  "message": "Your viewing request for [property_title] was declined.[reason]",
  "action_url": "/tenant/bookings",
  "metadata": {
    "booking_id": 123,
    "property_id": 456,
    "property_title": "Modern Apartment",
    "reason": "Property no longer available" // optional
  }
}
```

**Email Trigger**: Also send email notification

---

#### 3. Booking Rescheduled (Tenant → Landlord)

**Trigger**: When tenant reschedules a booking

**Notification Type**: `booking_rescheduled`

**Recipient**: Landlord (property owner)

**Notification Data**:
```json
{
  "notification_type": "booking_rescheduled",
  "title": "Booking Rescheduled",
  "message": "[tenant_name] has requested to reschedule viewing for [property_title] to [new_date] at [new_time]. Message: [message]",
  "action_url": "/landlord/bookings?booking=123",
  "metadata": {
    "booking_id": 123,
    "property_id": 456,
    "property_title": "Modern Apartment",
    "tenant_id": 45,
    "tenant_name": "Jane Doe",
    "old_date": "2026-02-15T10:00:00Z",
    "new_date": "2026-02-20",
    "new_time": "14:00",
    "message": "Need to reschedule due to..." // optional
  }
}
```

**Email Trigger**: Also send email notification

---

#### 4. Booking Cancelled (Tenant → Landlord)

**Trigger**: When tenant cancels a booking

**Notification Type**: `booking_cancelled`

**Recipient**: Landlord (property owner)

**Notification Data**:
```json
{
  "notification_type": "booking_cancelled",
  "title": "Booking Cancelled",
  "message": "[tenant_name] has cancelled viewing request for [property_title].[reason]",
  "action_url": "/landlord/bookings",
  "metadata": {
    "booking_id": 123,
    "property_id": 456,
    "property_title": "Modern Apartment",
    "tenant_id": 45,
    "tenant_name": "Jane Doe",
    "reason": "No longer interested" // optional
  }
}
```

**Email Trigger**: Also send email notification

---

#### 5. Viewing Request Created (Tenant → Landlord)

**Trigger**: When tenant creates a new viewing request

**Notification Type**: `viewing_request`

**Recipient**: Landlord (property owner)

**Notification Data**:
```json
{
  "notification_type": "viewing_request",
  "title": "New Viewing Request",
  "message": "[tenant_name] has requested to view [property_title]. Preferred date: [preferred_date].",
  "action_url": "/landlord/bookings?booking=123",
  "metadata": {
    "booking_id": 123,
    "property_id": 456,
    "property_title": "Modern Apartment",
    "tenant_id": 45,
    "tenant_name": "Jane Doe",
    "preferred_date": "2026-02-15T10:00:00Z",
    "message": "Interested in viewing" // optional
  }
}
```

**Email Trigger**: Also send email notification

---

## Notification Object Schema

### Complete Notification Object

```json
{
  "id": 123,
  "notification_type": "booking_accepted",
  "type": "booking_accepted",
  "title": "Viewing Request Accepted",
  "message": "Your viewing request for Modern Apartment has been accepted. Scheduled for February 15, 2026 at 14:00.",
  "is_read": false,
  "is_pinned": false,
  "is_archived": false,
  "action_url": "/tenant/bookings",
  "metadata": {
    "booking_id": 123,
    "property_id": 456,
    "property_title": "Modern Apartment",
    "property_address": "East Legon, Accra",
    "tenant_id": 45,
    "tenant_name": "Jane Doe",
    "landlord_id": 10,
    "landlord_name": "John Doe",
    "scheduled_date": "2026-02-15T10:00:00Z",
    "scheduled_time": "14:00",
    "reason": "Optional reason text",
    "message": "Optional message text"
  },
  "created_at": "2026-01-26T10:00:00Z",
  "updated_at": "2026-01-26T11:00:00Z"
}
```

### Field Descriptions

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | integer | Yes | Unique notification ID |
| `notification_type` | string | Yes | Notification type (e.g., `booking_accepted`) |
| `type` | string | Yes | Alias for `notification_type` (for compatibility) |
| `title` | string | Yes | Notification title |
| `message` | string | Yes | Notification message/body |
| `is_read` | boolean | Yes | Read status (default: `false`) |
| `is_pinned` | boolean | Yes | Pinned status (default: `false`) - **Used for background styling** |
| `is_archived` | boolean | Yes | Archived status (default: `false`) |
| `action_url` | string | Optional | Deep link URL - **Only set for notifications that need "View Details"** |
| `metadata` | object | Optional | Additional data (recommended for booking notifications) |
| `created_at` | string (ISO) | Yes | Creation timestamp |
| `updated_at` | string (ISO) | Optional | Last update timestamp |

### Field Requirements

**`is_pinned`**:
- Used by frontend to apply blue background styling
- Pinned notifications: `bg-blue-50 dark:bg-blue-900/20`
- Unpinned notifications: Normal background

**`action_url`**:
- **Only set for notifications that need "View Details" link**
- **Do NOT set for**: `login_success`, `welcome`, `system`, `account_pending`
- **DO set for**: All booking, payment, approval, maintenance notifications
- Frontend uses `shouldShowViewDetails()` to conditionally display link

**`metadata`**:
- Recommended for all booking notifications
- Should include: `booking_id`, `property_id`, `property_title`
- Additional fields as needed for specific notification types

---

## Conditional View Details Logic

### Notification Types That Don't Need "View Details"

The following notification types should **NOT** have `action_url` set (or set to `null`):

1. **`login_success`** - Login activity (no action needed)
2. **`welcome`** - Welcome message (no action needed)
3. **`system`** - System notifications (no action needed)
4. **`account_pending`** - Account pending approval (no action needed)
5. **`system_*`** (except errors) - General system notifications

**Backend Implementation**:
```python
# Don't set action_url for these types
NO_DETAILS_TYPES = [
    "login_success",
    "welcome",
    "system",
    "account_pending",
]

if notification_type in NO_DETAILS_TYPES:
    action_url = None
elif notification_type.startswith("system_") and "error" not in notification_type:
    action_url = None
else:
    # Set appropriate action_url for booking, payment, etc.
    action_url = f"/tenant/bookings"  # or appropriate URL
```

### Notification Types That Need "View Details"

The following notification types **SHOULD** have `action_url` set:

1. **`booking_*`** - All booking notifications → `/tenant/bookings` or `/landlord/bookings`
2. **`viewing_*`** - Viewing request notifications → `/landlord/bookings`
3. **`payment_*`** - Payment notifications → `/tenant/payments` or `/landlord/payments`
4. **`approval_*`** - Approval notifications → Appropriate approval page
5. **`maintenance_*`** - Maintenance notifications → `/tenant/maintenance` or `/landlord/maintenance`
6. **`system_error`** - System errors → Error details page

**Backend Implementation**:
```python
# Set action_url based on notification type
if notification_type.startswith("booking_") or notification_type.startswith("viewing_"):
    if recipient_role == "tenant":
        action_url = f"/tenant/bookings"
    else:
        action_url = f"/landlord/bookings?booking={booking_id}"
elif notification_type.startswith("payment_"):
    action_url = f"/tenant/payments"
# ... etc
```

---

## Pinned Notification Styling

### Visual Design Requirements

**Pinned Notifications**:
- Background: `bg-blue-50 dark:bg-blue-900/20`
- Border: `border-blue-300 dark:border-blue-700` (when applicable)
- Pin Icon: Blue filled pin icon visible
- Visual distinction makes pinned items easy to identify

**Unpinned Notifications**:
- Background: Normal (white/gray-900)
- Border: Normal (gray-200/gray-800)
- Pin Icon: Gray outline pin icon (or hidden)

### Backend Requirements

- **`is_pinned` field must be boolean** (`true`/`false`)
- **Default value**: `false`
- **Frontend reads**: `notification.is_pinned`
- **Frontend applies styling automatically** based on this field

**No additional backend work needed** - Frontend handles styling based on `is_pinned` field.

---

## Error Handling

### Standard Error Response Format

**400 Bad Request**:
```json
{
  "detail": "Invalid data.",
  "errors": {
    "is_pinned": ["This field must be a boolean."]
  }
}
```

**401 Unauthorized**:
```json
{
  "detail": "Authentication credentials were not provided."
}
```

**403 Forbidden**:
```json
{
  "detail": "You do not have permission to perform this action."
}
```

**404 Not Found**:
```json
{
  "detail": "Not found."
}
```

**500 Internal Server Error**:
```json
{
  "detail": "A server error occurred."
}
```

### Idempotent Operations

**Delete Notification**:
- Should return `204` or `200` even if notification already deleted
- Frontend expects success response for already-deleted notifications
- Do not return `404` for already-deleted items

**Pin/Archive**:
- Can be called multiple times safely
- Setting `is_pinned: true` when already pinned should succeed
- Setting `is_pinned: false` when already unpinned should succeed

---

## Testing Requirements

### Backend Testing Checklist

#### Pin/Unpin Endpoint
- [ ] `PATCH /api/notifications/{id}/` with `is_pinned: true` works
- [ ] `PATCH /api/notifications/{id}/` with `is_pinned: false` works
- [ ] Returns 404 if notification doesn't exist
- [ ] Returns 403 if user doesn't own notification
- [ ] Returns 400 if invalid data
- [ ] Returns 401 if not authenticated
- [ ] Idempotent (can call multiple times)

#### Archive/Unarchive Endpoint
- [ ] `PATCH /api/notifications/{id}/` with `is_archived: true` works
- [ ] `PATCH /api/notifications/{id}/` with `is_archived: false` works
- [ ] Archived notifications excluded from default queries
- [ ] Unarchived notifications appear in main list
- [ ] Error handling works correctly

#### Delete Endpoint
- [ ] `DELETE /api/notifications/{id}/` works
- [ ] Returns 204 No Content (preferred) or 200 OK
- [ ] Returns success even if already deleted (idempotent)
- [ ] Returns 404 only if notification never existed
- [ ] Returns 403 if user doesn't own notification
- [ ] Deletion is permanent

#### Get Archived Endpoint
- [ ] `GET /api/notifications/?is_archived=true` returns archived notifications
- [ ] `GET /api/notifications/?is_archived=false` returns non-archived (default)
- [ ] Filters work correctly (is_read, notification_type)
- [ ] Pagination works if many notifications

#### Email Notification Endpoint
- [ ] `POST /api/notifications/send-email/` sends email
- [ ] Returns 200 with `success: true` on success
- [ ] Returns 200 with `success: false` on failure (doesn't throw)
- [ ] Never throws errors (always returns 200)
- [ ] Handles invalid recipient_id gracefully

#### Auto-Create Notifications
- [ ] Booking approved → Creates tenant notification
- [ ] Booking rejected → Creates tenant notification
- [ ] Booking rescheduled → Creates landlord notification
- [ ] Booking cancelled → Creates landlord notification
- [ ] Viewing request created → Creates landlord notification
- [ ] All notifications include proper metadata
- [ ] `action_url` set correctly (conditional)
- [ ] `is_pinned` defaults to `false`
- [ ] `is_archived` defaults to `false`

---

## Integration Examples

### Example: Pin Notification

**Frontend Request**:
```javascript
await apiClient.patch('/api/notifications/123/', { is_pinned: true });
```

**Backend Response**:
```json
{
  "id": 123,
  "is_pinned": true,
  ...
}
```

**Frontend Result**:
- Notification background changes to blue
- Pin icon becomes filled blue
- Notification stays at top of list

---

### Example: Delete Notification

**Frontend Request**:
```javascript
await apiClient.delete('/api/notifications/123/');
```

**Backend Response**:
```
204 No Content
```

**Frontend Result**:
- Notification removed from UI
- Unread count decreases
- Toast notification: "Notification deleted"

---

### Example: Conditional View Details

**Backend Creates Notification**:
```python
# Login success - NO action_url
notification = {
    "notification_type": "login_success",
    "title": "Login Successful",
    "message": "You successfully logged in...",
    "action_url": None  # No "View Details" link
}

# Booking accepted - HAS action_url
notification = {
    "notification_type": "booking_accepted",
    "title": "Viewing Request Accepted",
    "message": "Your viewing request has been accepted...",
    "action_url": "/tenant/bookings"  # Shows "View Details" link
}
```

**Frontend Display**:
- Login success: No "View Details" link shown
- Booking accepted: "View Details →" link shown

---

## Summary

### Required Endpoints

1. ✅ `PATCH /api/notifications/{id}/` - Pin/Archive (update `is_pinned`, `is_archived`)
2. ✅ `DELETE /api/notifications/{id}/` - Delete notification
3. ✅ `GET /api/notifications/?is_archived=true` - Get archived
4. ✅ `GET /api/notifications/` - Get all (with filters)
5. ✅ `POST /api/notifications/send-email/` - Trigger email (non-blocking)

### Required Fields

- ✅ `is_pinned` (boolean) - For background styling
- ✅ `is_archived` (boolean) - For filtering
- ✅ `action_url` (string or null) - Conditional "View Details" display

### Auto-Create Requirements

- ✅ Booking approved → Tenant notification
- ✅ Booking rejected → Tenant notification
- ✅ Booking rescheduled → Landlord notification
- ✅ Booking cancelled → Landlord notification
- ✅ Viewing request created → Landlord notification

---

**Document Version**: 1.1  
**Last Updated**: January 26, 2026  
**Status**: Ready for Backend Implementation
