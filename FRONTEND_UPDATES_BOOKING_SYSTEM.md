# Frontend Updates: Booking System & User Profile Fixes

**Date**: January 26, 2026  
**Status**: Frontend Implementation Complete - Backend Action Required

---

## Summary

This document outlines all frontend updates made to the booking/viewing request system, calendar filtering, and user profile endpoints. It also specifies backend requirements that need to be addressed.

---

## Frontend Changes Made

### 1. Calendar Filter Integration ✅

**Files Modified:**
- `src/pages/Dashboards/Landlord/Bookings/LandingBookingPage.jsx`
- `src/components/landlord/BookingsCalendar.jsx`

**Changes:**
- Calendar now receives `filter` prop from parent component
- Calendar respects filter state (all, pending, accepted, declined)
- All booking statuses (pending, accepted, declined) appear on calendar when filter is "all"
- Color indicators work correctly:
  - Yellow for pending/requested
  - Green for accepted/approved
  - Red for declined/rejected
- Status normalization ensures consistent filtering across calendar and list views

**Status**: ✅ Complete - No backend changes needed

---

### 2. User Profile Endpoint Fix ✅

**Files Modified:**
- `src/services/userService.js`

**Changes:**
- Added fallback endpoint logic for user profile fetching
- Primary endpoint: `GET /api/users/{id}/profile/`
- Fallback endpoint: `GET /api/users/{id}/` (if primary returns 404)
- Improved error handling with detailed logging

**Current Implementation:**
```javascript
// Tries /api/users/{id}/profile/ first
// Falls back to /api/users/{id}/ if 404
```

**Backend Requirements:**
- **CRITICAL**: Backend must implement at least ONE of these endpoints:
  1. `GET /api/users/{id}/profile/` (preferred)
  2. `GET /api/users/{id}/` (alternative)

**Expected Response Format:**
```json
{
  "id": 4,
  "email": "user@example.com",
  "full_name": "John Doe",
  "role": "tenant",
  "phone": "+233241234567",
  "profile_picture": "url",
  "properties_count": 5,
  "services_count": 2,
  "verification_status": "verified"
}
```

**Status**: ✅ Frontend complete - ⚠️ Backend must implement endpoint

---

### 3. Booking Response Endpoint Fix ✅

**Files Modified:**
- `src/services/landlordService.js`
- `src/pages/Dashboards/Landlord/Bookings/LandingBookingPage.jsx`

**Changes:**
- Updated endpoint order to try most likely correct endpoint first
- Added comprehensive error handling
- Improved user-friendly error messages
- Added validation for booking ID

**Current Endpoint Order (Frontend tries in this sequence):**
1. `PATCH /api/properties/viewing-requests/{id}/respond/` ⭐ **PRIMARY (RECOMMENDED)**
2. `PATCH /api/properties/viewing-requests/{id}/` (fallback)
3. `PATCH /api/landlord/bookings/{id}/respond/` (alternative)
4. `PATCH /api/bookings/{id}/` (last resort)

**Request Payload:**
```json
{
  "status": "approved"  // or "rejected"
}
```

**Status Mapping:**
- Frontend "accept" → Backend "approved"
- Frontend "decline" → Backend "rejected"

**Backend Requirements:**

#### ⚠️ CRITICAL: Backend Must Implement ONE of These Endpoints

**Option 1 (RECOMMENDED):** `PATCH /api/properties/viewing-requests/{id}/respond/`
- **Endpoint**: `PATCH /api/properties/viewing-requests/{id}/respond/`
- **Authentication**: Required (Landlord role - must own the property)
- **Request Body**:
  ```json
  {
    "status": "approved"  // or "rejected"
  }
  ```
- **Response**: Updated viewing request object
- **Status Codes**:
  - `200 OK`: Success
  - `404 Not Found`: Viewing request doesn't exist
  - `403 Forbidden`: User doesn't own the property
  - `400 Bad Request`: Invalid status value

**Option 2 (Alternative):** Fix existing `PATCH /api/properties/viewing-requests/{id}/`
- **Current Issue**: Returns 500 error with `UnboundLocalError: cannot access local variable 'serializer'`
- **Backend Error Location**: `properties/views.py`, line 707 in `viewing_request_detail_view`
- **Fix Required**: Ensure `serializer` is properly initialized before use
- **Request Body**: Same as Option 1
- **Response**: Same as Option 1

**Option 3 (Alternative):** `PATCH /api/landlord/bookings/{id}/respond/`
- Currently returns 404
- If implementing, use same request/response format as Option 1

**Option 4 (Last Resort):** `PATCH /api/bookings/{id}/`
- Currently returns 404
- If implementing, use same request/response format as Option 1

**Expected Response Format:**
```json
{
  "id": 1,
  "property_id": 123,
  "tenant_id": 45,
  "status": "approved",
  "preferred_date": "2026-02-15T10:00:00Z",
  "message": "Interested in viewing",
  "created_at": "2026-01-25T10:00:00Z",
  "updated_at": "2026-01-26T00:58:11Z"
}
```

**Status**: ✅ Frontend complete - ⚠️ **BACKEND ACTION REQUIRED**

---

### 4. Error Handling Improvements ✅

**Files Modified:**
- `src/services/landlordService.js`
- `src/pages/Dashboards/Landlord/Bookings/LandingBookingPage.jsx`

**Changes:**
- User-friendly error messages based on HTTP status codes
- Detailed error logging for debugging
- Validation for required parameters
- Clear error state management

**Error Messages:**
- `404`: "Booking not found. The booking may have been deleted or the ID is incorrect."
- `500`: "Server error while processing your request. Please try again later."
- Generic: "Failed to respond to booking. Please try again."

**Status**: ✅ Complete - No backend changes needed

---

## Backend Action Items

### Priority 1: Booking Response Endpoint (CRITICAL)

**Issue**: All booking response endpoints currently fail:
- `PATCH /api/landlord/bookings/{id}/respond/` → 404
- `PATCH /api/properties/viewing-requests/{id}/` → 500 (UnboundLocalError)
- `PATCH /api/bookings/{id}/` → 404

**Required Action:**
1. **Implement** `PATCH /api/properties/viewing-requests/{id}/respond/` endpoint
   - OR
2. **Fix** the existing `PATCH /api/properties/viewing-requests/{id}/` endpoint
   - Fix the `UnboundLocalError` in `properties/views.py` line 707
   - Ensure serializer is properly initialized

**Implementation Details:**
- Accept `status` field in request body ("approved" or "rejected")
- Validate that the requesting user owns the property
- Update viewing request status
- Trigger notifications (in-app and email) to tenant
- Return updated viewing request object

**Backend Error to Fix:**
```
File "properties/views.py", line 707, in viewing_request_detail_view
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
                    ^^^^^^^^^^
UnboundLocalError: cannot access local variable 'serializer' where it is not associated with a value
```

---

### Priority 2: User Profile Endpoint

**Issue**: `GET /api/users/{id}/profile/` returns 404

**Required Action:**
1. **Implement** `GET /api/users/{id}/profile/` endpoint
   - OR
2. **Ensure** `GET /api/users/{id}/` returns complete profile data

**Implementation Details:**
- Return public user profile data
- Include: id, email, full_name, role, phone, profile_picture
- Include counts: properties_count, services_count, jobs_completed
- Include verification_status
- Respect privacy: only show approved properties/services for public users

---

## API Endpoint Summary

### Working Endpoints ✅
- `GET /api/properties/viewing-requests/` - Fetch bookings (works correctly)
- `GET /api/notifications/unread-count/` - Notification counts
- `GET /api/messages/unread-count/` - Message counts

### Needs Implementation/Fix ⚠️

1. **`PATCH /api/properties/viewing-requests/{id}/respond/`** (RECOMMENDED)
   - Status: Not implemented
   - Priority: CRITICAL
   - Action: Implement new endpoint

2. **`PATCH /api/properties/viewing-requests/{id}/`** (Alternative)
   - Status: Exists but broken (500 error)
   - Priority: CRITICAL
   - Action: Fix UnboundLocalError

3. **`GET /api/users/{id}/profile/`**
   - Status: Returns 404
   - Priority: HIGH
   - Action: Implement endpoint or ensure `/api/users/{id}/` works

---

## Testing Checklist for Backend

After implementing the endpoints, verify:

- [ ] `PATCH /api/properties/viewing-requests/{id}/respond/` accepts "approved" status
- [ ] `PATCH /api/properties/viewing-requests/{id}/respond/` accepts "rejected" status
- [ ] Endpoint validates landlord owns the property
- [ ] Endpoint returns 404 for non-existent booking IDs
- [ ] Endpoint returns 403 for unauthorized access
- [ ] Status update triggers in-app notification to tenant
- [ ] Status update triggers email notification to tenant
- [ ] `GET /api/users/{id}/profile/` returns user profile data
- [ ] User profile endpoint handles non-existent users (404)

---

## Frontend Files Modified

1. `src/pages/Dashboards/Landlord/Bookings/LandingBookingPage.jsx`
   - Enhanced error handling in `handleRespond`
   - Verified filter prop passing to calendar

2. `src/components/landlord/BookingsCalendar.jsx`
   - Added filter support
   - Status normalization for consistent filtering

3. `src/services/userService.js`
   - Added fallback endpoint logic for user profiles

4. `src/services/landlordService.js`
   - Updated booking response endpoint order
   - Improved error handling and messages

---

## Next Steps

1. **Backend Team**: Implement/fix booking response endpoint (Priority 1)
2. **Backend Team**: Implement/fix user profile endpoint (Priority 2)
3. **Frontend Team**: Test after backend implementation
4. **QA Team**: Verify end-to-end booking flow

---

## Contact

For questions about frontend implementation, refer to:
- `BACKEND_IMPLEMENTATION_COMPLETE.md` - Full API documentation
- Frontend code comments in modified files

---

**Document Version**: 1.0  
**Last Updated**: January 26, 2026
