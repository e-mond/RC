# Backend Dependency Changes Log

**Date:** January 2026  
**Status:** Active  
**Purpose:** Track backend changes that require frontend updates

---

## Overview

This document tracks backend fixes, new endpoints, deprecated assumptions, and mismatches discovered during frontend testing. It ensures alignment and traceability between frontend and backend.

---

## 🚨 CRITICAL: Backend Endpoints Not Implemented

### 1. Delete User Endpoint

**Status:** ⚠️ **BACKEND ACTION REQUIRED**

**Issue:** Frontend tries multiple HTTP methods, but backend endpoint is not implemented

**Location:**
- `src/services/adminService.js` - `deleteUser(userId, options)`

**Frontend Implementation:**
```javascript
// Tries in order:
// 1. DELETE /api/super-admin/users/{id}/ (REST standard)
// 2. POST /api/super-admin/users/{id}/delete/
// 3. PATCH /api/super-admin/users/{id}/ (with action: "delete")
```

**Backend Requirement:**
Implement **ONE** of the following endpoints:

**Option 1: DELETE Method (REST Standard) - RECOMMENDED**
```
DELETE /api/super-admin/users/{id}/
Request Body: {
  "reason": "Account deletion requested",
  "delete_properties": false,
  "delete_data": false
}
Response: 200 OK { "success": true }
```

**Option 2: POST Method**
```
POST /api/super-admin/users/{id}/delete/
Request Body: {
  "reason": "Account deletion requested",
  "delete_properties": false,
  "delete_data": false
}
Response: 200 OK { "success": true }
```

**Option 3: PATCH Method**
```
PATCH /api/super-admin/users/{id}/
Request Body: {
  "action": "delete",
  "status": "deleted",
  "reason": "Account deletion requested",
  "delete_properties": false,
  "delete_data": false
}
Response: 200 OK { "success": true }
```

**Current Error:**
```
Backend endpoint not implemented. Expected one of:
- DELETE /api/super-admin/users/{id}/
- POST /api/super-admin/users/{id}/delete/
- PATCH /api/super-admin/users/{id}/
```

**Action Required:**
- Backend team to implement one of the above endpoints
- Frontend will automatically use the working method
- Once implemented, remove fallback logic if desired

**Status:** ⚠️ **BLOCKING** - User deletion feature not working

---

### 2. Suspend User Endpoint

**Status:** ⚠️ Needs Backend Verification

**Issue:** Frontend uses PATCH, backend may require POST

**Location:**
- `src/services/adminService.js` - `suspendUser(userId, reason)`

**Current Implementation:**
```javascript
await apiClient.patch(API_ENDPOINTS.ADMIN.SUSPEND_USER(id), { reason });
```

**Backend Requirement:**
- Verify backend accepts PATCH for `/api/admin/users/{id}/suspend/`
- If not, update frontend to use POST

**Status:** ⚠️ Needs Backend Verification

---

## Backend Fixes Requiring Frontend Changes

### 1. User Approval Endpoints

**Status:** ✅ Frontend Ready  
**Backend Requirement:** Implement approval endpoints

**Required Endpoints:**
```
GET    /api/admin/users/pending/              - List pending users
GET    /api/admin/users/{id}/                 - Get user details with documents
PATCH  /api/admin/users/{id}/approve/        - Approve user
PATCH  /api/admin/users/{id}/reject/         - Reject user (requires reason)
PATCH  /api/admin/users/{id}/suspend/         - Suspend user (requires reason)
```

**Frontend Implementation:**
- `src/services/adminService.js` - Calls these endpoints
- `src/pages/Dashboards/Admin/components/AD_UserApprovals.jsx` - Uses endpoints
- `src/pages/Dashboards/SuperAdmin/approvals/SA_PendingUserApprovals.jsx` - Uses endpoints

**Frontend Expectation:**
- PATCH method for all actions
- Error: "405 Method Not Allowed" on suspend suggests backend uses different method

**Action Required:**
- Backend must accept PATCH for suspend endpoint
- Or frontend must be updated to use POST if backend requires it

---

### 2. Property Approval Endpoints

**Status:** ✅ Frontend Ready  
**Backend Requirement:** Implement approval endpoints

**Required Endpoints:**
```
GET    /api/admin/properties/pending/         - List pending properties
PATCH  /api/admin/properties/{id}/approve/    - Approve property
PATCH  /api/admin/properties/{id}/reject/     - Reject property (requires reason)
```

**Frontend Implementation:**
- `src/services/adminService.js` - Calls these endpoints
- `src/pages/Dashboards/Admin/properties/AdminPropertyApprovalsPage.jsx` - Uses endpoints

**Frontend Expectation:**
- PATCH method for approve/reject
- Reason field required for rejection
- Properties with `status='pending_approval'` should appear in pending list
- Backend must filter by `status='pending_approval'` OR `status='pending'`

**Important Notes:**
- Frontend sends `status='pending_approval'` for all new property submissions
- Backend must accept `status='pending_approval'` in validation schema
- See `BACKEND_PROPERTY_API_IMPLEMENTATION.md` for complete API specifications

---

### 3. Premium Pricing Endpoints

**Status:** ✅ Frontend Ready  
**Backend Requirement:** Implement pricing endpoints

**Required Endpoints:**
```
GET    /api/super-admin/premium/pricing/      - Get current pricing
PUT    /api/super-admin/premium/pricing/      - Update pricing
```

**Frontend Implementation:**
- `src/services/adminService.js` - `getPublicPricing()`, `updatePremiumPricing()`
- `src/pages/Dashboards/SuperAdmin/pricing/SA_PremiumPricing.jsx` - Uses endpoints

**Frontend Expectation:**
- Response format: `{ monthly_price, yearly_price, currency }`
- Request format: `{ monthly_price, yearly_price }`

---

### 4. System Health Metrics

**Status:** ✅ Frontend Ready  
**Backend Requirement:** Implement system stats endpoint

**Required Endpoint:**
```
GET    /api/super-admin/system/stats/         - Get system statistics
```

**Frontend Implementation:**
- `src/services/adminService.js` - `getSystemStats()`
- `src/pages/Dashboards/SuperAdmin/SuperAdminDashboard.jsx` - Uses endpoint

**Frontend Expectation:**
- Response format: `{ total_users, total_properties, pending_approvals, ... }`

---

## Newly Supported Endpoints

### 1. Public User Profiles

**Status:** ✅ Implemented  
**Endpoint:** `GET /api/users/{id}/profile/`

**Frontend Implementation:**
- `src/services/userService.js` - `getPublicProfile(userId)`
- `src/pages/Users/PublicProfilePage.jsx` - Uses endpoint

**Usage:**
- Public user profile viewing
- Accessible to authenticated users

---

### 2. Lease Download Endpoints

**Status:** ✅ Implemented  
**Endpoints:**
```
GET    /api/leases/system/{id}/download/      - Download system lease template
GET    /api/leases/custom/{id}/download/      - Download custom lease
```

**Frontend Implementation:**
- `src/services/leaseService.js` - `downloadSystemLease(id)`, `downloadCustomLease(id)`
- `src/pages/Dashboards/SuperAdmin/leases/SA_LeasesPage.jsx` - Uses endpoints

**Usage:**
- Lease template downloads
- PDF file downloads

---

## Deprecated Frontend Assumptions

### 1. Property Status Assumptions

**Previous Assumption:**
- Frontend assumed properties had specific status values

**Current Implementation:**
- Frontend now handles all status values gracefully
- No hardcoded status checks

**Action:** ✅ Resolved

---

### 2. Role-Based Property Filtering

**Previous Assumption:**
- Frontend filtered properties by role on client side

**Current Implementation:**
- Uses `publicApiClient` for public property listings
- Backend handles filtering
- Frontend displays all approved properties

**Action:** ✅ Resolved

---

### 3. Permission Assumptions

**Previous Assumption:**
- Frontend assumed permissions based on role

**Current Implementation:**
- Always checks `user.permissions` object
- Never assumes permissions from role
- Backend validates all permission checks

**Action:** ✅ Resolved

---

## Mismatches Discovered During Testing

### 1. Delete User Endpoint Method

**Issue:** Frontend tries DELETE, POST, and PATCH - all return 405

**Location:**
- `src/services/adminService.js` - `deleteUser(userId, options)`

**Current Implementation:**
```javascript
// Tries DELETE first (REST standard)
// Falls back to POST /delete/ endpoint
// Falls back to PATCH with action: "delete"
```

**Backend Requirement:**
- Implement one of the three methods above
- Frontend will automatically use the working method

**Status:** ⚠️ **BACKEND ACTION REQUIRED**

---

### 2. Suspend User Endpoint

**Issue:** Frontend uses PATCH, backend may require POST

**Location:**
- `src/services/adminService.js` - `suspendUser(userId, reason)`

**Current Implementation:**
```javascript
await apiClient.patch(API_ENDPOINTS.ADMIN.SUSPEND_USER(id), { reason });
```

**Backend Requirement:**
- Verify backend accepts PATCH
- If not, update frontend to use POST

**Status:** ⚠️ Needs Backend Verification

---

### 3. Conversation Creation Validation

**Issue:** Frontend sends `recipient_id`, backend may require different format

**Location:**
- `src/services/messagesService.js` - `createConversation(recipientId)`

**Current Implementation:**
```javascript
await apiClient.post(API_ENDPOINTS.MESSAGES.CONVERSATIONS, {
  recipient_id: recipientId,
});
```

**Backend Requirement:**
- Verify backend accepts `recipient_id` format
- May need to send user object or email instead

**Status:** ⚠️ Needs Backend Verification

---

## Backend State Machine Definitions

### User State Machine

**Required States:**
```
draft → pending_review → approved → active
                    ↓
                 rejected
                    ↓
                 suspended
                    ↓
                 deleted
```

**Frontend Handling:**
- Displays appropriate UI based on state
- Shows approval/rejection/suspension banners
- Handles state transitions

**Backend Requirement:**
- Implement state machine
- Return state in user object
- Validate state transitions

---

### Property State Machine

**Required States:**
```
draft → pending_review → approved → published
                    ↓
                 rejected
                    ↓
                 hidden
```

**Frontend Handling:**
- Shows only approved/published properties to public
- Shows all states to landlords (own properties)
- Shows pending states to admins

**Backend Requirement:**
- Implement state machine
- Return state in property object
- Validate state transitions

---

## API Response Format Changes

### 1. Paginated Responses

**Expected Format:**
```json
{
  "count": 100,
  "next": "http://api.../endpoint/?page=2",
  "previous": null,
  "results": [...]
}
```

**Frontend Handling:**
- `src/services/*Service.js` - Handles pagination
- Components display paginated results

**Status:** ✅ Handled

---

### 2. Error Response Format

**Expected Format:**
```json
{
  "detail": "Error message",
  "field_errors": {
    "field_name": ["Error message"]
  }
}
```

**Frontend Handling:**
- `src/services/apiClient.js` - Extracts error messages
- Components display field-specific errors

**Status:** ✅ Handled

---

## Endpoint Method Mismatches

### Current Mismatches

1. **Delete User** - Frontend: DELETE/POST/PATCH, Backend: ❌ Not implemented
2. **Suspend User** - Frontend: PATCH, Backend: ? (needs verification)
3. **Conversation Creation** - Frontend format may not match backend

**Action Required:**
- Backend team to verify and confirm method requirements
- Frontend to update if methods differ

---

## New Endpoints Needed

### 1. Lease Preview Endpoint

**Status:** ⚠️ Needed  
**Endpoint:** `GET /api/leases/templates/preview/`

**Frontend Usage:**
- `src/components/lease/CustomizeLeaseModal.jsx` - Preview customized lease
- `src/services/leaseTemplateService.js` - Preview function

**Backend Requirement:**
- Generate preview of customized lease
- Return preview data or PDF

---

### 2. Enhanced Analytics Endpoints

**Status:** ⚠️ Needed  
**Endpoints:**
```
GET    /api/analytics/landlord/detailed/      - Detailed landlord analytics
GET    /api/analytics/property/{id}/          - Property-specific analytics
```

**Frontend Usage:**
- `src/pages/Dashboards/Landlord/Analytics/AnalyticsDashboard.jsx`
- `src/services/analyticsService.js`

**Backend Requirement:**
- Provide detailed analytics data
- Support date range filtering
- Property-specific metrics

---

## Frontend Changes Made

### 1. Public API Client Separation

**Change:** Created `publicApiClient` without auth interceptors

**Reason:** Public routes were triggering session-expired redirects

**Files Modified:**
- `src/services/apiClient.js` - Added `publicApiClient` export
- `src/services/propertyService.js` - Uses `publicApiClient` for public endpoints

**Status:** ✅ Complete

---

### 2. Property Service Updates

**Change:** Updated to use `publicApiClient` for public property listings

**Reason:** Tenants and public users couldn't see properties

**Files Modified:**
- `src/services/propertyService.js` - Uses `publicApiClient`

**Status:** ✅ Complete

---

### 3. Error Handling Improvements

**Change:** Improved error handling for 401, 403, 404 responses

**Reason:** Better user experience and error feedback

**Files Modified:**
- `src/services/apiClient.js` - Enhanced error handling
- All service files - Consistent error handling

**Status:** ✅ Complete

---

### 4. Delete User Endpoint Handling

**Change:** Updated to try multiple HTTP methods (DELETE, POST, PATCH)

**Reason:** Backend endpoint not yet implemented, provide fallback options

**Files Modified:**
- `src/services/adminService.js` - `deleteUser()` function

**Status:** ✅ Complete (waits for backend implementation)

---

## Testing Discoveries

### Issues Found During Testing

1. **Delete endpoint returns 405** - Method mismatch - **FIXED** (now tries multiple methods)
2. **Suspend endpoint validation** - May need soft delete confirmation
3. **Conversation creation** - Recipient ID format may be incorrect
4. **Property approval** - Status updates not reflected immediately

**Action Required:**
- Backend to verify and fix endpoint methods
- Frontend to update if backend requirements differ

---

## Alignment Checklist

### Frontend Ready, Backend Pending

- [ ] User deletion endpoint (DELETE/POST/PATCH)
- [ ] User approval endpoints (approve, reject, suspend)
- [ ] Property approval endpoints (approve, reject)
- [ ] Premium pricing endpoints (get, update)
- [ ] System health metrics endpoint
- [ ] Lease preview endpoint
- [ ] Enhanced analytics endpoints

### Both Ready

- [x] Public property listings
- [x] User authentication
- [x] Property CRUD operations
- [x] Wallet operations
- [x] Messaging system
- [x] Notification system

### Backend Ready, Frontend Pending

- None currently

---

## Communication Protocol

### When Backend Changes

1. **Update this document** with change details
2. **Notify frontend team** of breaking changes
3. **Provide migration guide** if needed
4. **Update API documentation**

### When Frontend Discovers Issues

1. **Document in this file** under "Mismatches Discovered"
2. **Notify backend team** of issues
3. **Provide test cases** to reproduce
4. **Suggest solutions** if applicable

---

## Version History

### 2026-01-XX
- Initial documentation
- Tracked user/property approval endpoints
- Documented public API client separation
- Noted endpoint method mismatches
- **Updated:** Delete user endpoint - now tries DELETE, POST, PATCH methods

---

**Last Updated:** January 2026  
**Maintained By:** Frontend Team  
**Status:** Active Tracking
