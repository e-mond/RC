# Backend Property API Implementation Guide

**Date:** January 2026  
**Status:** Active  
**Purpose:** Complete backend implementation guide for property management API

---

## Overview

This document provides comprehensive specifications for backend property API endpoints, data formats, validation requirements, and status workflow. All endpoints must align with frontend expectations documented in `PROPERTY_STATUS_FLOW_DOCUMENTATION.md`.

---

## Property Status Workflow

### Status Values

**Supported Status Values:**
- `draft` - Initial state when property is created (not submitted)
- `pending_approval` - Property submitted for admin review
- `pending` - Alias for `pending_approval` (for backward compatibility)
- `approved` - Property approved by admin and visible to public
- `rejected` - Property rejected by admin
- `active` - Property is active/available
- `suspended` - Property temporarily suspended
- `rented` - Property currently rented
- `unavailable` - Property unavailable

### Status State Machine

**Valid Transitions:**
```
draft → pending_approval ✅ (on submit)
pending_approval → approved ✅ (on admin approval)
pending_approval → rejected ✅ (on admin rejection)
approved → pending_approval ✅ (on edit - requires re-approval)
rejected → pending_approval ✅ (on edit & resubmit)
```

**Invalid Transitions:**
```
draft → approved ❌ (must go through pending_approval)
approved → rejected ❌ (must go through pending_approval first)
rejected → approved ❌ (must go through pending_approval first)
```

### Status Behavior

**Draft (`draft`):**
- Property is visible only to the owner (landlord)
- Property can be edited freely
- Property can be deleted
- Property is NOT visible to public or tenants
- Property is NOT included in admin pending approvals list

**Pending Approval (`pending_approval`):**
- Property is visible to landlord (owner)
- Property is visible to admins and super-admins
- Property is NOT visible to public or tenants
- Property is included in admin pending properties list
- Property cannot be edited (must wait for approval/rejection)
- Backend should create notification: `property_pending` (optional)
- Backend should send email: "Property Submitted for Review" (optional)

**Approved (`approved`):**
- Property is visible to public
- Property is visible to tenants
- Property is visible to landlord (owner)
- Property is included in public property listings
- Property can be edited (but editing requires re-approval)
- Backend MUST create notification: `property_approved` (to landlord)
- Backend MUST send email: Property approval email (to landlord)

**Rejected (`rejected`):**
- Property is visible only to landlord (owner)
- Property is NOT visible to public or tenants
- Property can be edited and resubmitted
- Backend MUST create notification: `property_rejected` (to landlord)
- Backend MUST send email: Property rejection email (to landlord)
- Backend MUST provide rejection reason

---

## API Endpoints

### 1. Create Property

**Endpoint:** `POST /api/properties/`

**Authentication:** Required (Landlord, Admin, Super Admin)

**Request Format:** `multipart/form-data`

**Request Fields:**
```json
{
  "title": "string (required, min 3, max 200)",
  "description": "string (optional)",
  "address": "string (required, min 5, max 500)",
  "city": "string (optional, min 2)",
  "region": "string (optional)",
  "country": "string (default: 'Ghana')",
  "price": "number (required, positive)",
  "currency": "string (enum: 'GHS', 'USD', default: 'GHS')",
  "deposit": "number (optional, min 0)",
  "bedrooms": "number (required, int, min 0, max 20)",
  "bathrooms": "number (required, int, min 0, max 20)",
  "area_sqm": "number (optional, positive)",
  "property_type": "string (enum: 'apartment', 'house', 'studio', 'room', 'commercial', 'land', default: 'apartment')",
  "status": "string (enum: 'draft', 'pending', 'pending_approval', 'approved', 'rejected', 'active', 'suspended', 'rented', 'unavailable', default: 'pending_approval')",
  "latitude": "number (optional, -90 to 90, max 6 decimal places)",
  "longitude": "number (optional, -180 to 180, max 6 decimal places)",
  "amenity_ids": "array of strings (optional, amenity IDs as strings)",
  "images": "array of strings or files (required, min 1, valid Cloudinary URLs or File objects)"
}
```

**Important Notes:**
- Frontend sends `status: "pending_approval"` for all new property submissions
- Frontend sends `amenity_ids` as array of strings (not numbers)
- Frontend validates images before sending (only valid Cloudinary URLs)
- Coordinates must be rounded to max 6 decimal places

**Response Format:**
```json
{
  "id": "string or number",
  "title": "string",
  "description": "string",
  "address": "string",
  "city": "string",
  "region": "string",
  "country": "string",
  "price": "number",
  "currency": "string",
  "deposit": "number",
  "bedrooms": "number",
  "bathrooms": "number",
  "area_sqm": "number",
  "property_type": "string",
  "status": "pending_approval",
  "latitude": "number",
  "longitude": "number",
  "amenities": [
    {
      "id": "string",
      "name": "string"
    }
  ],
  "images": ["string (URLs)"],
  "landlord": {
    "id": "string or number",
    "full_name": "string"
  },
  "created_at": "ISO 8601 timestamp",
  "updated_at": "ISO 8601 timestamp"
}
```

**Backend Actions:**
1. Validate all required fields
2. Validate status transition (if property exists, check valid transition)
3. Validate amenity IDs exist in database
4. Process image uploads (if File objects) or validate Cloudinary URLs
5. Create property with `status='pending_approval'`
6. Associate amenities with property
7. Return created property object

---

### 2. Update Property

**Endpoint:** `PUT /api/properties/{id}/` or `PATCH /api/properties/{id}/`

**Authentication:** Required (Property owner, Admin, Super Admin)

**Request Format:** `multipart/form-data` (if images updated) or `application/json`

**Request Fields:** Same as Create Property (all fields optional for PATCH)

**Important Notes:**
- Frontend sends `status: "pending_approval"` when editing approved properties
- Editing an approved property requires re-approval
- Frontend sends `amenity_ids` as array of strings
- Frontend validates images before sending

**Response Format:** Same as Create Property

**Backend Actions:**
1. Verify user has permission to edit property
2. If property is `approved` and being edited, change status to `pending_approval`
3. Validate all provided fields
4. Update property with new values
5. Return updated property object

---

### 3. Get Property Details

**Endpoint:** `GET /api/properties/{id}/`

**Authentication:** Optional (public endpoint, but authenticated users may see more data)

**Response Format:**
```json
{
  "id": "string or number",
  "title": "string",
  "description": "string",
  "address": "string",
  "city": "string",
  "region": "string",
  "country": "string",
  "price": "number",
  "currency": "string",
  "deposit": "number",
  "bedrooms": "number",
  "bathrooms": "number",
  "area_sqm": "number",
  "property_type": "string",
  "status": "string",
  "latitude": "number",
  "longitude": "number",
  "amenities": [
    {
      "id": "string or number",
      "name": "string"
    }
    // OR nested format:
    // {
    //   "id": "string or number",
    //   "amenity": {
    //     "id": "string or number",
    //     "name": "string"
    //   }
    // }
  ],
  "images": ["string (URLs)"],
  "landlord": {
    "id": "string or number",
    "full_name": "string",
    "email": "string (if authenticated)"
  },
  "created_at": "ISO 8601 timestamp",
  "updated_at": "ISO 8601 timestamp"
}
```

**Visibility Rules:**
- Public users: Only see properties with `status='approved'`
- Landlord (owner): Can see all statuses for own properties
- Admin/Super Admin: Can see all properties

**Backend Actions:**
1. Check property status
2. Verify user has permission to view property
3. Return property with appropriate data based on user role
4. Include amenities in response (can be flat or nested format)

---

### 4. List Properties

**Endpoint:** `GET /api/properties/`

**Authentication:** Optional (public endpoint)

**Query Parameters:**
- `page` - Page number (default: 1)
- `page_size` - Items per page (default: 20, max: 100)
- `search` - Search query (searches title, description, address)
- `min_price` - Minimum price filter
- `max_price` - Maximum price filter
- `property_type` - Filter by type (apartment, house, etc.)
- `city` - Filter by city
- `region` - Filter by region
- `bedrooms` - Filter by number of bedrooms
- `bathrooms` - Filter by number of bathrooms

**Response Format:**
```json
{
  "count": 100,
  "next": "http://api.../properties/?page=2",
  "previous": null,
  "results": [
    {
      "id": "string or number",
      "title": "string",
      "address": "string",
      "price": "number",
      "property_type": "string",
      "status": "approved",
      "images": ["string (URLs)"],
      "bedrooms": "number",
      "bathrooms": "number"
    }
  ]
}
```

**Visibility Rules:**
- Public users: Only see properties with `status='approved'`
- Landlord: Can see own properties with any status
- Admin/Super Admin: Can see all properties (with status filter)

**Backend Actions:**
1. Filter properties based on user role and status
2. Apply search and filter parameters
3. Return paginated results
4. Only include approved properties for public users

---

### 5. Get Landlord Properties

**Endpoint:** `GET /api/properties/landlord/{ownerId}/`

**Authentication:** Required (Landlord can see own, Admin/Super Admin can see any)

**Response Format:** Same as List Properties

**Visibility Rules:**
- Landlord can only see own properties
- Admin/Super Admin can see any landlord's properties
- Returns all statuses (draft, pending_approval, approved, rejected, etc.)

---

### 6. List Pending Properties (Admin)

**Endpoint:** `GET /api/admin/properties/pending/`

**Authentication:** Required (Admin, Super Admin)

**Response Format:** Same as List Properties

**Backend Actions:**
1. Filter properties with `status='pending_approval'` or `status='pending'`
2. Return paginated list of pending properties
3. Include full property details

---

### 7. Approve Property (Admin)

**Endpoint:** `PATCH /api/admin/properties/{id}/approve/`

**Authentication:** Required (Admin, Super Admin)

**Request Body:** Optional
```json
{
  "notes": "string (optional)"
}
```

**Response Format:** Updated property object

**Backend Actions:**
1. Verify property status is `pending_approval` or `pending`
2. Change property status to `approved`
3. **MUST create notification:** `property_approved` (to landlord)
4. **MUST send email:** Property approval email (to landlord)
5. Return updated property object

**Notification Payload:**
```json
{
  "user": "landlord_user_id",
  "notification_type": "property_approved",
  "title": "Property Approved!",
  "message": "Your property \"{property.title}\" has been approved and is now live.",
  "action_url": "/properties/{property.id}",
  "metadata": {
    "property_id": "property.id",
    "property_title": "property.title",
    "approved_by": "admin_user_id",
    "approved_at": "ISO 8601 timestamp"
  }
}
```

**Email Template:** Use `generatePropertyApprovalEmail()` from frontend email templates

---

### 8. Reject Property (Admin)

**Endpoint:** `PATCH /api/admin/properties/{id}/reject/`

**Authentication:** Required (Admin, Super Admin)

**Request Body:** Required
```json
{
  "reason": "string (required)"
}
```

**Response Format:** Updated property object

**Backend Actions:**
1. Verify property status is `pending_approval` or `pending`
2. Validate rejection reason is provided
3. Change property status to `rejected`
4. **MUST create notification:** `property_rejected` (to landlord)
5. **MUST send email:** Property rejection email (to landlord)
6. Store rejection reason in property metadata or separate field
7. Return updated property object

**Notification Payload:**
```json
{
  "user": "landlord_user_id",
  "notification_type": "property_rejected",
  "title": "Property Rejected",
  "message": "Your property \"{property.title}\" was rejected. Reason: {reason}",
  "action_url": "/landlord/properties/{property.id}/edit",
  "metadata": {
    "property_id": "property.id",
    "property_title": "property.title",
    "rejection_reason": "reason",
    "rejected_by": "admin_user_id",
    "rejected_at": "ISO 8601 timestamp"
  }
}
```

**Email Template:** Use `generatePropertyRejectionEmail()` from frontend email templates

---

### 9. Delete Property

**Endpoint:** `DELETE /api/properties/{id}/`

**Authentication:** Required (Property owner, Admin, Super Admin)

**Response Format:**
```json
{
  "message": "Property deleted successfully"
}
```

**Backend Actions:**
1. Verify user has permission to delete property
2. Soft delete or hard delete based on backend policy
3. Return success message

---

## Data Format Requirements

### Amenities Format

**Frontend Sends:**
- `amenity_ids`: Array of strings (e.g., `["1", "2", "3"]`)
- IDs are always strings, not numbers

**Backend Should Accept:**
- Array of strings: `["1", "2", "3"]`
- Array of numbers (convert to strings): `[1, 2, 3]` → `["1", "2", "3"]`

**Backend Returns:**
- Can return flat format: `[{id: "1", name: "Parking"}]`
- Can return nested format: `[{id: "1", amenity: {id: "1", name: "Parking"}}]`
- Frontend handles both formats

**Important:** Frontend normalizes amenities to extract names, so backend can return either format.

**Example:**
```json
// Backend response (either format works):
"amenities": [
  {"id": "1", "name": "Parking"},
  {"id": "2", "name": "WiFi"}
]

// OR nested format:
"amenities": [
  {"id": "1", "amenity": {"id": "1", "name": "Parking"}},
  {"id": "2", "amenity": {"id": "2", "name": "WiFi"}}
]
```

---

### Images Format

**Frontend Sends:**
- Array of strings (Cloudinary URLs) or File objects
- Frontend validates URLs before sending
- Only valid Cloudinary URLs are sent

**Backend Should:**
- Accept Cloudinary URLs as strings
- Accept File objects for upload
- Validate image URLs
- Store as array of URLs

**Backend Returns:**
- Array of strings (image URLs) - **PREFERRED**
- OR array of objects: `[{image: "url"}, {url: "url"}]` (frontend handles both)
- Example: `["https://res.cloudinary.com/...", "https://res.cloudinary.com/..."]`

**Important:** Frontend normalizes images to extract URLs, so backend can return either format. However, **strings are preferred** for simplicity.

---

### Coordinates Format

**Frontend Sends:**
- `latitude`: Number (rounded to 6 decimal places)
- `longitude`: Number (rounded to 6 decimal places)
- Example: `latitude: 5.603717, longitude: -0.186964`

**Backend Should:**
- Accept numbers with max 6 decimal places
- Validate range: latitude (-90 to 90), longitude (-180 to 180)
- Store with appropriate precision

---

## Validation Requirements

### Required Fields

**Create Property:**
- `title` (string, min 3, max 200)
- `address` (string, min 5, max 500)
- `price` (number, positive)
- `bedrooms` (number, int, min 0, max 20)
- `bathrooms` (number, int, min 0, max 20)
- `property_type` (enum)
- `images` (array, min 1)

**Update Property:**
- All fields optional (PATCH)
- If provided, same validation as create

### Field Validation

**Title:**
- Type: string
- Length: 3-200 characters
- Required: Yes

**Address:**
- Type: string
- Length: 5-500 characters
- Required: Yes

**Price:**
- Type: number
- Must be positive (> 0)
- Required: Yes

**Bedrooms/Bathrooms:**
- Type: number (integer)
- Range: 0-20
- Required: Yes

**Property Type:**
- Type: string
- Enum: `["apartment", "house", "studio", "room", "commercial", "land"]`
- Default: `"apartment"`

**Status:**
- Type: string
- Enum: `["draft", "pending", "pending_approval", "approved", "rejected", "active", "suspended", "rented", "unavailable"]`
- Default: `"pending_approval"` (for new properties)

**Amenity IDs:**
- Type: array of strings
- Each ID must exist in amenities table
- Optional

**Images:**
- Type: array of strings (URLs) or File objects
- Min length: 1
- URLs must be valid Cloudinary URLs
- Required: Yes

---

## Error Responses

### Validation Errors

**Format:**
```json
{
  "field_name": ["Error message 1", "Error message 2"],
  "another_field": ["Error message"]
}
```

**Example:**
```json
{
  "title": ["This field is required."],
  "price": ["This field must be a positive number."],
  "amenity_ids": ["Invalid amenity ID: '999'"],
  "status": ["Invalid option: expected one of 'draft'|'pending'|'pending_approval'|'approved'|'rejected'|'active'|'suspended'|'rented'|'unavailable'"]
}
```

### Permission Errors

**403 Forbidden:**
```json
{
  "detail": "You do not have permission to perform this action."
}
```

### Not Found Errors

**404 Not Found:**
```json
{
  "detail": "Property not found."
}
```

---

## Notification Requirements

### Property Approval Notification

**When:** Property status changes from `pending_approval` to `approved`

**Required Actions:**
1. Create in-app notification
2. Send email notification

**Notification Type:** `property_approved`

**Email Template:** `generatePropertyApprovalEmail()`

**See:** `BACKEND_EMAIL_IMPLEMENTATION_GUIDE.md` for email implementation details

---

### Property Rejection Notification

**When:** Property status changes from `pending_approval` to `rejected`

**Required Actions:**
1. Create in-app notification
2. Send email notification

**Notification Type:** `property_rejected`

**Email Template:** `generatePropertyRejectionEmail()`

**See:** `BACKEND_EMAIL_IMPLEMENTATION_GUIDE.md` for email implementation details

---

## Testing Checklist

### Backend Testing

- [ ] Create property with all required fields
- [ ] Create property with `status='pending_approval'`
- [ ] Update property (status changes to `pending_approval` if was `approved`)
- [ ] Approve property (status changes to `approved`, notification + email sent)
- [ ] Reject property (status changes to `rejected`, notification + email sent)
- [ ] Validate status transitions (prevent invalid transitions)
- [ ] Validate amenity IDs (accept strings, validate existence)
- [ ] Validate images (accept Cloudinary URLs and File objects)
- [ ] Filter properties by status (public sees only `approved`)
- [ ] Pagination works correctly
- [ ] Search and filters work correctly
- [ ] Permission checks work (landlord can only edit own properties)

---

## Related Documentation

- `PROPERTY_STATUS_FLOW_DOCUMENTATION.md` - Complete status flow documentation
- `PROPERTY_DRAFT_TO_SUBMIT_FLOW.md` - Draft to submit transition details
- `BACKEND_EMAIL_IMPLEMENTATION_GUIDE.md` - Email notification implementation
- `FRONTEND_BACKEND_SYNC_STATUS.md` - Overall sync status
- `BACKEND_REMAINING_IMPLEMENTATIONS.md` - Remaining backend tasks

---

**Last Updated:** January 2026  
**Status:** Active  
**Maintained By:** Frontend Team (for Backend Team reference)
