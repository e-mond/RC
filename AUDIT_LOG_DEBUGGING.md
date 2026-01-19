# Audit Log Debugging Guide

**Issue:** Audit logs showing "Unknown User" and "Action: user_deleted" instead of actual user names and targets.

---

## Current Status

The frontend is checking multiple field variations, but the backend may be sending data in a different format.

---

## Debug Steps

### 1. Check Browser Console

When you load the audit logs page, check the browser console for debug logs that show:

```
🔍 Audit log entry 0: { allKeys: [...], fullObject: {...}, ... }
```

This will show:
- All available fields in the audit log entry
- The complete object structure
- What fields contain user information
- What fields contain target information

### 2. Common Backend Field Variations

The frontend now checks for:

**User Name Fields:**
- `actorName`, `userName`, `actor`
- `user.name`, `user.fullName`, `user.email`
- `created_by.name`, `created_by.email`
- `metadata.user.name`, `metadata.actor.name`
- `extra_data.user.name`, `context.user.name`

**Target Fields:**
- `target`, `resource`, `detail`
- `target_id`, `target_user.email`, `target_user.name`
- `object_id`, `object_type`
- `metadata.target`, `metadata.target_id`
- `extra_data.target`, `context.target`

### 3. What to Look For

In the console logs, look for:
1. **User Information:**
   - Any field containing user name, email, or ID
   - Fields like `performed_by`, `action_by`, `user_id`, etc.

2. **Target Information:**
   - For "user_deleted" action, look for:
     - The deleted user's ID or email
     - Fields like `deleted_user_id`, `target_user_id`, etc.

3. **Metadata Fields:**
   - Check `metadata`, `extra_data`, `context` objects
   - These often contain additional information

---

## Next Steps

1. **Share Console Output:** Copy the console log output showing the audit log entry structure
2. **Backend Documentation:** Check backend API documentation for audit log response format
3. **Update Field Mapping:** Once we know the actual field names, update the frontend to use them

---

## Current Implementation

The frontend now:
- ✅ Logs full audit log structure for first 3 entries
- ✅ Checks 20+ field variations for user name
- ✅ Checks 15+ field variations for target
- ✅ Provides meaningful fallbacks
- ✅ Preserves original fields for debugging

---

**Last Updated:** January 2026  
**Status:** Waiting for backend response format confirmation
