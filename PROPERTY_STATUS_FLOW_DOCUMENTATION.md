# Property Status Flow Documentation

**Date:** January 2026  
**Status:** Complete  
**Purpose:** Comprehensive documentation of property status states, transitions, and frontend/backend handling

---

## Overview

Properties in RentalConnects follow a state machine workflow from creation to publication. This document details all property states, transitions, frontend handling, and backend requirements.

---

## Property States

### 1. Draft (`draft`)

**Description:** Initial state when a property is first created. Property is not visible to public or tenants.

**When Created:**
- User creates a new property via PropertyForm
- Property is saved but not yet submitted for approval

**Frontend Behavior:**
- Property is visible only to the landlord (owner)
- Property can be edited freely
- Property can be deleted
- Property cannot be viewed by public or tenants
- Status badge shows "Draft" in gray

**Backend Requirements:**
- Property is saved with `status='draft'`
- Property is excluded from public property listings
- Property is only visible to the owner

**UI Components:**
- `PropertyApprovalBanner` shows draft status
- `PropertyForm` sets initial status to `draft`
- `PropertiesPage` filters draft properties for landlord view

---

### 2. Pending Approval (`pending_approval`)

**Description:** Property has been submitted for admin review. Awaiting admin approval or rejection.

**When Created:**
- Landlord submits a new property for approval
- Landlord edits an approved property (requires re-approval)
- Property status changes from `draft` to `pending_approval`

**Frontend Behavior:**
- Property is visible to landlord (owner)
- Property is visible to admins and super-admins
- Property is NOT visible to public or tenants
- Property cannot be edited (must wait for approval/rejection)
- Status badge shows "Pending Approval" in yellow/amber

**Backend Requirements:**
- Property is saved with `status='pending_approval'`
- Property is excluded from public property listings
- Property is included in admin pending properties list
- Backend should create notification: `property_pending` (optional)
- Backend should send email to landlord: "Property Submitted for Review"

**UI Components:**
- `PropertyApprovalBanner` shows pending status
- `PropertyForm` sets status to `pending_approval` on submit
- `AdminPropertyApprovalsPage` displays pending properties
- `SA_PendingPropertyApprovals` displays pending properties (super-admin)

**State Transition:**
```
draft → pending_approval (on submit)
approved → pending_approval (on edit)
```

---

### 3. Approved (`approved`)

**Description:** Property has been approved by admin and is now visible to public and tenants.

**When Created:**
- Admin approves a pending property
- Property status changes from `pending_approval` to `approved`

**Frontend Behavior:**
- Property is visible to public
- Property is visible to tenants
- Property is visible to landlord (owner)
- Property can be viewed in public property listings
- Property can be edited (but editing requires re-approval)
- Status badge shows "Approved" in green

**Backend Requirements:**
- Property is saved with `status='approved'`
- Property is included in public property listings
- Backend MUST create notification: `property_approved` (to landlord)
- Backend MUST send email: Property approval email (to landlord)
- Backend should update property visibility flags

**UI Components:**
- `PropertyApprovalBanner` does NOT show for approved properties (they're live)
- `PropertyDetailsPage` shows approved property to public
- `PublicProperties` includes approved properties
- `PropertyForm` allows editing (but sets status back to `pending_approval`)

**State Transition:**
```
pending_approval → approved (on admin approval)
```

**Notifications Required:**
- ✅ In-app notification: `property_approved` (backend creates)
- ⚠️ Email notification: Property approval email (backend needs to implement)

---

### 4. Rejected (`rejected`)

**Description:** Property has been rejected by admin. Not visible to public.

**When Created:**
- Admin rejects a pending property
- Property status changes from `pending_approval` to `rejected`

**Frontend Behavior:**
- Property is visible only to landlord (owner)
- Property is NOT visible to public or tenants
- Property can be edited and resubmitted
- Status badge shows "Rejected" in red
- Rejection reason should be displayed (if provided by backend)

**Backend Requirements:**
- Property is saved with `status='rejected'`
- Property is excluded from public property listings
- Backend MUST provide rejection reason
- Backend MUST create notification: `property_rejected` (to landlord)
- Backend MUST send email: Property rejection email (to landlord)

**UI Components:**
- `PropertyApprovalBanner` shows rejected status
- `PropertyForm` allows editing rejected properties
- `AdminPropertyApprovalsPage` shows rejected properties in history

**State Transition:**
```
pending_approval → rejected (on admin rejection)
```

**Notifications Required:**
- ✅ In-app notification: `property_rejected` (backend creates)
- ⚠️ Email notification: Property rejection email (backend needs to implement)

---

## State Machine Diagram

```
┌─────────┐
│  draft  │
└────┬────┘
     │ (submit)
     ↓
┌─────────────────┐
│ pending_approval│
└────┬────────────┘
     │
     ├─── (admin approves) ───→ ┌──────────┐
     │                          │ approved │
     │                          └────┬─────┘
     │                               │ (edit)
     │                               ↓
     │                          ┌─────────────────┐
     │                          │ pending_approval│
     │                          └─────────────────┘
     │
     └─── (admin rejects) ───→ ┌──────────┐
                                │ rejected  │
                                └────┬──────┘
                                     │ (edit & resubmit)
                                     ↓
                                ┌─────────────────┐
                                │ pending_approval│
                                └─────────────────┘
```

---

## Frontend Implementation Details

### Property Form (`PropertyForm.jsx`)

**Status Handling:**
```javascript
// New property: starts as draft
status: isEdit 
  ? "pending_approval"  // Editing always requires re-approval
  : "draft",            // New properties start as draft
```

**Key Behaviors:**
- New properties default to `draft`
- Editing an approved property sets status to `pending_approval` (requires re-approval)
- Status field is read-only (displayed but not editable)
- Status badge shows current state with appropriate colors

**Location:** `src/pages/Dashboards/Landlord/Properties/PropertyForm.jsx`

---

### Property Approval Banner (`PropertyApprovalBanner.jsx`)

**Purpose:** Display property status to users

**Statuses Displayed:**
- `pending` / `pending_approval` - Yellow/amber banner
- `rejected` - Red banner
- `draft` - Gray banner
- `approved` / `published` - No banner (property is live)

**Location:** `src/components/common/PropertyApprovalBanner.jsx`

---

### Admin Property Approvals (`AdminPropertyApprovalsPage.jsx`)

**Purpose:** Allow admins to approve/reject pending properties

**Features:**
- Lists all properties with `status='pending_approval'`
- Shows property details
- Provides approve/reject actions
- Requires reason for rejection

**API Endpoints Used:**
- `GET /api/admin/properties/pending/` - List pending properties
- `PATCH /api/admin/properties/{id}/approve/` - Approve property
- `PATCH /api/admin/properties/{id}/reject/` - Reject property (with reason)

**Location:** `src/pages/Dashboards/Admin/properties/AdminPropertyApprovalsPage.jsx`

---

### Property Service (`propertyService.js`)

**Status Handling:**
- `createProperty()` - Creates property with `status='draft'`
- `updateProperty()` - Updates property (status handled by backend)
- `fetchProperty()` - Returns property with current status
- `fetchProperties()` - Filters properties based on status (public vs admin)

**Location:** `src/services/propertyService.js`

---

## Backend Requirements

### State Machine Implementation

**Required:**
- Backend must implement state machine
- Backend must validate state transitions
- Backend must return status in property object
- Backend must prevent invalid transitions

**Valid Transitions:**
- `draft` → `pending_approval` ✅
- `pending_approval` → `approved` ✅
- `pending_approval` → `rejected` ✅
- `approved` → `pending_approval` ✅ (on edit)
- `rejected` → `pending_approval` ✅ (on edit & resubmit)

**Invalid Transitions:**
- `draft` → `approved` ❌ (must go through pending_approval)
- `approved` → `rejected` ❌ (must go through pending_approval first)
- `rejected` → `approved` ❌ (must go through pending_approval first)

---

### Notification Requirements

**On Property Approval:**
```python
# Backend must create:
Notification.objects.create(
    user=property.landlord,
    notification_type='property_approved',
    title='Property Approved!',
    message=f'Your property "{property.title}" has been approved and is now live.',
    action_url=f'/properties/{property.id}',
)

# Backend must send email:
send_property_approval_email(property.landlord, {
    'propertyTitle': property.title,
    'propertyId': property.id,
})
```

**On Property Rejection:**
```python
# Backend must create:
Notification.objects.create(
    user=property.landlord,
    notification_type='property_rejected',
    title='Property Rejected',
    message=f'Your property "{property.title}" was rejected. Reason: {reason}',
    action_url=f'/landlord/properties/{property.id}/edit',
    metadata={'rejection_reason': reason},
)

# Backend must send email:
send_property_rejection_email(property.landlord, {
    'propertyTitle': property.title,
    'reason': reason,
    'propertyId': property.id,
})
```

**Email Templates Available (Frontend):**
- `generatePropertyApprovalEmail()` - Ready to use
- `generatePropertyRejectionEmail()` - Ready to use

**See:** `BACKEND_EMAIL_IMPLEMENTATION_GUIDE.md` for implementation details

---

### API Endpoints

**Required Endpoints:**
- `GET /api/admin/properties/pending/` - List pending properties
- `PATCH /api/admin/properties/{id}/approve/` - Approve property
- `PATCH /api/admin/properties/{id}/reject/` - Reject property (with reason)

**Request Format (Reject):**
```json
{
  "reason": "Property images are not clear. Please upload higher quality images."
}
```

**Response Format:**
```json
{
  "id": 123,
  "title": "2 Bedroom Apartment",
  "status": "approved",
  "landlord": {
    "id": 456,
    "full_name": "John Doe"
  }
}
```

---

## Testing Checklist

### Frontend Testing

- [x] Property form creates property with `draft` status
- [x] Property form sets `pending_approval` on submit
- [x] Property form sets `pending_approval` when editing approved property
- [x] Property approval banner displays correct status
- [x] Admin can view pending properties
- [x] Admin can approve properties
- [x] Admin can reject properties with reason
- [x] Landlord can see all statuses for own properties
- [x] Public can only see approved properties
- [x] Rejected properties can be edited and resubmitted

### Backend Testing

- [ ] Backend validates state transitions
- [ ] Backend creates `property_approved` notification
- [ ] Backend creates `property_rejected` notification
- [ ] Backend sends property approval email
- [ ] Backend sends property rejection email
- [ ] Backend returns status in property object
- [ ] Backend filters properties by status correctly
- [ ] Backend prevents invalid state transitions

---

## Related Documentation

- `FRONTEND_BACKEND_SYNC_STATUS.md` - Overall sync status
- `BACKEND_REMAINING_IMPLEMENTATIONS.md` - Remaining backend tasks
- `BACKEND_EMAIL_IMPLEMENTATION_GUIDE.md` - Email implementation
- `FRONTEND_BACKEND_NOTIFICATION_INTEGRATION_GUIDE.md` - Notification system

---

**Last Updated:** January 2026  
**Status:** Complete  
**Maintained By:** Frontend Team
