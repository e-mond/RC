# Property Draft to Submit Flow

**Date:** January 2026  
**Status:** Issue Identified  
**Purpose:** Document how properties transition from draft to pending_approval

---

## Current Implementation Issue

### Problem

**Current Behavior:**
- New properties are created with `status: "draft"` ✅
- Editing a property sets `status: "pending_approval"` ✅
- **BUT:** There's no way to submit a `draft` property for approval ❌

**Code in PropertyForm.jsx:**
```javascript
status: isEdit 
  ? "pending_approval"  // Editing always requires re-approval
  : "draft",            // New properties start as draft
```

**Issue:**
- When a landlord creates a new property and clicks "Submit", it's saved as `draft`
- The property never transitions to `pending_approval` automatically
- There's no "Submit for Approval" button or action

---

## Expected Flow

### Option 1: Automatic Submission (Recommended)

**Behavior:**
- When landlord clicks "Submit" on a new property, it should automatically change to `pending_approval`
- Draft status should only be for "Save as Draft" functionality

**Implementation:**
```javascript
// In PropertyForm.jsx onSubmit
status: isEdit 
  ? "pending_approval"  // Editing always requires re-approval
  : "pending_approval", // New properties submitted for approval immediately
```

**Pros:**
- Simple, no UI changes needed
- Matches user expectation (submit = request approval)
- Properties appear in pending approvals immediately

**Cons:**
- No way to save as draft without submitting

---

### Option 2: Two-Step Process (Save Draft + Submit)

**Behavior:**
- "Save as Draft" button → `status: "draft"`
- "Submit for Approval" button → `status: "pending_approval"`

**Implementation:**
```javascript
// Add submitType state
const [submitType, setSubmitType] = useState("submit"); // "draft" or "submit"

// In onSubmit
status: submitType === "draft" ? "draft" : "pending_approval",
```

**UI Changes:**
- Add two buttons: "Save as Draft" and "Submit for Approval"
- Or toggle/checkbox: "Save as draft (don't submit for approval)"

**Pros:**
- Gives landlords flexibility
- Allows saving incomplete properties
- Clear separation of actions

**Cons:**
- More complex UI
- Requires backend to support both actions

---

### Option 3: Backend Auto-Transition

**Behavior:**
- Frontend always sends `status: "draft"` for new properties
- Backend automatically changes to `pending_approval` when property is "complete" (has required fields)

**Backend Logic:**
```python
# In backend property creation
if property.status == 'draft' and property.is_complete():
    property.status = 'pending_approval'
    property.save()
```

**Pros:**
- Frontend doesn't need to know about submission logic
- Backend controls workflow

**Cons:**
- Less transparent to user
- Requires backend changes

---

## Recommended Solution

### Option 1: Automatic Submission (Simplest)

**Change PropertyForm.jsx:**
```javascript
// Line 242-244: Change from
status: isEdit 
  ? "pending_approval"  // Editing always requires re-approval
  : "draft",            // New properties start as draft

// To:
status: "pending_approval", // All submissions go to pending_approval
```

**Rationale:**
- Simplest implementation
- Matches user expectation (submit = request approval)
- Properties appear in admin pending approvals immediately
- No UI changes needed

**Alternative:** If we want to keep draft functionality, add a checkbox:
```javascript
// Add state
const [saveAsDraft, setSaveAsDraft] = useState(false);

// In form
<label>
  <input 
    type="checkbox" 
    checked={saveAsDraft}
    onChange={(e) => setSaveAsDraft(e.target.checked)}
  />
  Save as draft (don't submit for approval)
</label>

// In onSubmit
status: saveAsDraft ? "draft" : "pending_approval",
```

---

## Current Workaround

**Landlords can:**
1. Create property (saved as `draft`)
2. Edit the property (changes to `pending_approval`)
3. Property appears in pending approvals

**This works but is not intuitive!**

---

## Backend Requirements

### If Using Option 1 (Automatic Submission)

**Backend Must:**
- Accept `status: "pending_approval"` for new properties
- Create property with `pending_approval` status
- Include property in `/api/super-admin/properties/pending/` endpoint
- Send notification to admins when property is created with `pending_approval`

### If Using Option 2 (Two-Step Process)

**Backend Must:**
- Accept both `status: "draft"` and `status: "pending_approval"` for new properties
- Provide endpoint to change status from `draft` to `pending_approval`:
  - `PATCH /api/properties/{id}/submit/` or
  - `PATCH /api/properties/{id}/` with `{ status: "pending_approval" }`

---

## Implementation Steps

### Step 1: Update PropertyForm.jsx

**Change status logic:**
```javascript
// Current (line 242-244)
status: isEdit 
  ? "pending_approval"
  : "draft",

// New (automatic submission)
status: "pending_approval", // All submissions go to pending_approval
```

### Step 2: Update Success Message

**Current:**
```javascript
toast.success(
  isEdit 
    ? "Property updated successfully! It will be reviewed before going live." 
    : "Property created successfully! It will be reviewed before going live.",
);
```

**Keep as is** - message is already correct.

### Step 3: Test

1. Create a new property
2. Click "Submit"
3. Verify property has `status: "pending_approval"`
4. Check that property appears in Super Admin pending approvals page

---

## Related Files

- `src/pages/Dashboards/Landlord/Properties/PropertyForm.jsx` - Property form (needs update)
- `src/services/propertyService.js` - Property API calls
- `PROPERTY_STATUS_FLOW_DOCUMENTATION.md` - Status flow documentation
- `PROPERTY_ISSUES_DEBUG.md` - Related debugging guide

---

## Summary

**Current Issue:**
- New properties are created as `draft` but never transition to `pending_approval`
- Landlords must edit the property to trigger `pending_approval` status

**Recommended Fix:**
- Change new property creation to set `status: "pending_approval"` directly
- This makes properties appear in pending approvals immediately upon creation

**Alternative:**
- Add "Save as Draft" vs "Submit for Approval" functionality
- Requires more UI changes but gives more flexibility

---

**Last Updated:** January 2026  
**Status:** Ready for Implementation
