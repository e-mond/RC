# Property Issues Debug Guide

**Date:** January 2026  
**Status:** Active Debugging  
**Purpose:** Debug property edit/view and pending approval issues

---

## Issue 1: Properties Can't Be Viewed When Clicking Edit

### Problem
When clicking "Edit" on a property in the PropertiesPage, the property cannot be viewed/loaded.

### Root Cause Analysis

**Route Configuration:**
- Edit route: `/landlord/properties/:id/edit` → `PropertyForm`
- View route: `/landlord/properties/:id` → `PropertyDetailsPage`

**Potential Issues:**
1. **Authentication**: `fetchProperty` uses `publicApiClient` which might not work for landlord's own properties if they require authentication
2. **Property Status**: Properties with certain statuses (draft, pending_approval) might not be accessible via public endpoint
3. **Route Matching**: React Router might be matching the wrong route

### Fix Applied

**Updated `src/services/propertyService.js` - `fetchProperty()`:**
- Now tries authenticated `apiClient` first (for landlord's own properties)
- Falls back to `publicApiClient` if 401/403 (for public properties)
- Better error handling for 404 and other errors

**Code Change:**
```javascript
// Try authenticated client first (for landlord's own properties)
try {
  const { data } = await apiClient.get(API_ENDPOINTS.PROPERTIES.BY_ID(id));
  return data;
} catch (authErr) {
  // If 401/403, try public client (property might be public)
  if (authErr.response?.status === 401 || authErr.response?.status === 403) {
    const { data } = await publicApiClient.get(API_ENDPOINTS.PROPERTIES.BY_ID(id));
    return data;
  }
  throw authErr;
}
```

### Testing
1. Click "Edit" on a property in PropertiesPage
2. Property should load in PropertyForm
3. Check console for any errors
4. Verify property data is populated correctly

---

## Issue 2: Properties Don't Appear on Pending Approval Page

### Problem
Properties with `status='pending_approval'` don't appear on the Super Admin pending approval page. Response shows empty results: `{count: 0, results: []}`

### Root Cause Analysis

**Endpoint Called:**
- `GET /api/super-admin/properties/pending/`
- Expected: Properties with `status='pending_approval'`

**Potential Issues:**
1. **Status Mismatch**: Properties might have different status values:
   - `pending` instead of `pending_approval`
   - `draft` instead of `pending_approval`
   - `pending_review` instead of `pending_approval`
2. **Backend Filtering**: Backend might be filtering incorrectly
3. **Property Creation**: Properties might not be set to `pending_approval` when created

### Debugging Added

**Updated `src/pages/Dashboards/SuperAdmin/approvals/SA_PendingPropertyApprovals.jsx`:**
- Added logging to show property statuses
- Logs property IDs and statuses for debugging

**Code Change:**
```javascript
console.log("[SA_PendingPropertyApprovals] Property statuses:", 
  propertyList.map(p => ({ id: p.id, status: p.status, title: p.title }))
);
```

### Backend Requirements

**Backend Must:**
1. Return properties with `status='pending_approval'` from `/api/super-admin/properties/pending/`
2. Ensure properties are set to `pending_approval` when:
   - Landlord submits a new property
   - Landlord edits an approved property (requires re-approval)

**Status Values to Check:**
- `draft` - Initial state (should NOT appear in pending)
- `pending_approval` - Awaiting approval (SHOULD appear in pending)
- `pending` - Alternative status (might be used instead of `pending_approval`)
- `pending_review` - Alternative status (might be used instead of `pending_approval`)

### Testing Steps

1. **Check Property Statuses:**
   - Open browser console
   - Navigate to PropertiesPage
   - Check console logs for property statuses
   - Verify properties have `status='pending_approval'` or similar

2. **Check Backend Response:**
   - Open Network tab in browser DevTools
   - Navigate to Super Admin pending approvals page
   - Check response from `/api/super-admin/properties/pending/`
   - Verify response contains properties with correct status

3. **Check Property Creation:**
   - Create a new property as landlord
   - Check property status after creation
   - Verify status is `pending_approval` (not `draft`)

### Frontend Fix Options

If backend uses different status values, we can:

**Option 1: Update Frontend to Accept Multiple Status Values**
```javascript
// In SA_PendingPropertyApprovals.jsx
const pendingStatuses = ['pending_approval', 'pending', 'pending_review'];
const filteredProperties = properties.filter(p => 
  pendingStatuses.includes(p.status?.toLowerCase())
);
```

**Option 2: Normalize Status Values**
```javascript
// Normalize status values
const normalizeStatus = (status) => {
  if (['pending', 'pending_review'].includes(status?.toLowerCase())) {
    return 'pending_approval';
  }
  return status;
};
```

---

## Next Steps

1. **Test Edit Functionality:**
   - Click "Edit" on a property
   - Verify property loads correctly
   - Check console for errors

2. **Check Property Statuses:**
   - Review console logs for property statuses
   - Verify which status values are actually used

3. **Backend Coordination:**
   - Report status value mismatches to backend team
   - Request backend to ensure properties use `pending_approval` status
   - Verify backend endpoint filters correctly

4. **Update Documentation:**
   - Update `PROPERTY_STATUS_FLOW_DOCUMENTATION.md` if status values differ
   - Document actual status values used by backend

---

## Related Files

- `src/services/propertyService.js` - Property fetching logic
- `src/pages/Dashboards/Landlord/Properties/PropertyForm.jsx` - Property edit form
- `src/pages/Dashboards/Landlord/Properties/PropertiesPage.jsx` - Property list
- `src/pages/Dashboards/SuperAdmin/approvals/SA_PendingPropertyApprovals.jsx` - Pending approvals page
- `src/services/adminService.js` - Admin API calls
- `PROPERTY_STATUS_FLOW_DOCUMENTATION.md` - Property status documentation

---

**Last Updated:** January 2026  
**Status:** Active Debugging
