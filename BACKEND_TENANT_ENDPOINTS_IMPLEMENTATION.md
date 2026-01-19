# Backend Tenant Endpoints Implementation Guide

**Date:** January 2026  
**Status:** Active  
**Purpose:** Complete backend implementation guide for tenant-specific API endpoints

---

## Overview

This document provides specifications for tenant-specific API endpoints that are currently returning 404 errors or need implementation. All endpoints must align with frontend expectations.

---

## 1. Favorites Endpoints

### Add to Favorites

**Endpoint:** `POST /api/tenant/favorites/` (with trailing slash) OR `POST /api/tenant/favorites` (without trailing slash)

**Authentication:** Required (Tenant role)

**Request Format:**
```json
{
  "property_id": "string or number"
}
```

**OR (for backward compatibility):**
```json
{
  "propertyId": "string or number"
}
```

**Response Format:**
```json
{
  "id": "favorite_id",
  "property_id": "property_id",
  "tenant_id": "tenant_id",
  "created_at": "ISO 8601 timestamp"
}
```

**Frontend Implementation:**
- `src/services/tenantService.js` - `addToFavorites(propertyId)`
- Tries multiple formats for compatibility

**Backend Requirements:**
- Accept `property_id` or `propertyId` field name
- Validate property exists
- Validate tenant is authenticated
- Prevent duplicate favorites
- Return created favorite object

---

### Remove from Favorites

**Endpoint:** `DELETE /api/tenant/favorites/{propertyId}/`

**Authentication:** Required (Tenant role)

**Response Format:**
```json
{
  "message": "Removed from favorites",
  "success": true
}
```

**Frontend Implementation:**
- `src/services/tenantService.js` - `removeFromFavorites(propertyId)`

**Backend Requirements:**
- Validate favorite exists
- Validate tenant owns the favorite
- Delete favorite record
- Return success message

---

### Check if Favorited

**Endpoint:** `GET /api/tenant/favorites/{propertyId}/check/`

**Authentication:** Required (Tenant role)

**Response Format:**
```json
{
  "isFavorited": true
}
```

**Frontend Implementation:**
- `src/services/tenantService.js` - `isFavorited(propertyId)`

**Backend Requirements:**
- Check if property is in tenant's favorites
- Return boolean status

---

### Get All Favorites

**Endpoint:** `GET /api/tenant/favorites/`

**Authentication:** Required (Tenant role)

**Response Format:**
```json
{
  "results": [
    {
      "id": "favorite_id",
      "property": {
        "id": "property_id",
        "title": "Property title",
        "images": ["url1", "url2"],
        "price": 1500
      },
      "created_at": "ISO 8601 timestamp"
    }
  ],
  "count": 10
}
```

**Frontend Implementation:**
- `src/services/tenantService.js` - `getFavorites()`

**Backend Requirements:**
- Return all favorites for current tenant
- Include property details in response
- Support pagination if needed

---

## 2. Viewing Request Endpoints

### Create Viewing Request

**Option 1: Property-Scoped (RECOMMENDED)**

**Endpoint:** `POST /api/properties/{propertyId}/viewing-request/`

**Authentication:** Required (Tenant role)

**Request Format:**
```json
{
  "preferred_date": "ISO date string (YYYY-MM-DD) or ISO datetime",
  "message": "string (optional)",
  "contact_phone": "string (optional)"
}
```

**Response Format:**
```json
{
  "id": "viewing_request_id",
  "property_id": "property_id",
  "tenant_id": "tenant_id",
  "status": "pending",
  "preferred_date": "ISO datetime",
  "message": "string",
  "contact_phone": "string",
  "created_at": "ISO 8601 timestamp"
}
```

**Option 2: Tenant-Scoped**

**Endpoint:** `POST /api/tenant/viewing-requests/` (with trailing slash) OR `POST /api/tenant/viewing-requests` (without trailing slash)

**Authentication:** Required (Tenant role)

**Request Format:**
```json
{
  "property_id": "string or number",
  "preferred_date": "ISO date string (YYYY-MM-DD) or ISO datetime",
  "message": "string (optional)",
  "contact_phone": "string (optional)"
}
```

**Response Format:** Same as Option 1

**Frontend Implementation:**
- `src/services/tenantService.js` - `createViewingRequest(payload)`
- Tries property-scoped endpoint first, then tenant-scoped
- Sends both camelCase and snake_case field names for compatibility

**Backend Requirements:**
- Accept either endpoint format (property-scoped preferred)
- Validate property exists and is approved
- Validate tenant is authenticated
- Create viewing request with `status='pending'`
- **MUST create notification:** `booking_created` (to landlord)
- **MUST send email:** Viewing request email (to landlord)
- Return created viewing request object

**Notification Payload:**
```json
{
  "user": "landlord_user_id",
  "notification_type": "booking_created",
  "title": "New Viewing Request",
  "message": "{tenant.name} requested a viewing for \"{property.title}\"",
  "action_url": "/landlord/bookings/{viewing_request.id}",
  "metadata": {
    "viewing_request_id": "viewing_request.id",
    "property_id": "property.id",
    "property_title": "property.title",
    "tenant_id": "tenant.id",
    "tenant_name": "tenant.name",
    "preferred_date": "ISO datetime"
  }
}
```

**Email Template:** Use `generateViewingRequestEmail()` from frontend email templates

---

### Get Viewing Requests

**Endpoint:** `GET /api/tenant/viewing-requests/`

**Authentication:** Required (Tenant role)

**Response Format:**
```json
{
  "results": [
    {
      "id": "viewing_request_id",
      "property": {
        "id": "property_id",
        "title": "Property title",
        "images": ["url1"]
      },
      "status": "pending",
      "preferred_date": "ISO datetime",
      "created_at": "ISO 8601 timestamp"
    }
  ],
  "count": 5
}
```

**Frontend Implementation:**
- `src/services/tenantService.js` - `getViewingRequests()`

**Backend Requirements:**
- Return all viewing requests for current tenant
- Include property details
- Support pagination

---

## 3. Messages Endpoint

### Messages Route

**Route:** `/tenant/messages`

**Authentication:** Required (Tenant role)

**Query Parameters:**
- `start={userId}` - Start conversation with specific user (optional)

**Frontend Implementation:**
- `src/pages/Messages/MessagesInbox.jsx`
- Route: `/tenant/messages` (protected)

**Backend Requirements:**
- Messages endpoint should be accessible to authenticated tenants
- Query parameter `start` should initiate conversation with specified user
- If user is not authenticated, redirect to login (handled by frontend route protection)

**Note:** This is primarily a frontend route issue. Backend messages API should already exist.

---

## Implementation Priority

### 🔴 High Priority (Blocking Features)

1. **Favorites Endpoint** - `POST /api/tenant/favorites/`
   - Required for "Add to Favorites" feature
   - Currently returns 404

2. **Viewing Request Endpoint** - `POST /api/properties/{id}/viewing-request/` OR `POST /api/tenant/viewing-requests/`
   - Required for "Request Viewing" feature
   - Currently returns 404

### 🟡 Medium Priority

3. **Remove from Favorites** - `DELETE /api/tenant/favorites/{id}/`
4. **Check if Favorited** - `GET /api/tenant/favorites/{id}/check/`
5. **Get All Favorites** - `GET /api/tenant/favorites/`
6. **Get Viewing Requests** - `GET /api/tenant/viewing-requests/`

---

## Testing Checklist

### Favorites
- [ ] Add to favorites works
- [ ] Remove from favorites works
- [ ] Check if favorited works
- [ ] Get all favorites works
- [ ] Duplicate favorites prevented
- [ ] Proper error handling

### Viewing Requests
- [ ] Create viewing request works (property-scoped)
- [ ] Create viewing request works (tenant-scoped)
- [ ] Notification created for landlord
- [ ] Email sent to landlord
- [ ] Get viewing requests works
- [ ] Proper error handling

---

## Related Documentation

- `BACKEND_PROPERTY_API_IMPLEMENTATION.md` - Property API specifications
- `BACKEND_EMAIL_IMPLEMENTATION_GUIDE.md` - Email notification implementation
- `FRONTEND_BACKEND_SYNC_STATUS.md` - Overall sync status
- `TENANT_SIDE_FIXES.md` - Frontend fixes applied

---

**Last Updated:** January 2026  
**Status:** Active  
**Maintained By:** Frontend Team (for Backend Team reference)
