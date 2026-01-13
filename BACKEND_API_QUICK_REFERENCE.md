# Backend API Quick Reference

**Date:** January 20, 2026  
**Quick lookup for all API endpoints**

---

## User Approval System

### Get Pending Users
```
GET /api/admin/users/pending/
Query: ?role=landlord&page=1
Auth: Admin/Super Admin
```

### Get User Details
```
GET /api/admin/users/{id}/
Auth: Admin/Super Admin
```

### Approve User
```
PATCH /api/admin/users/{id}/approve/
Body: { "notes": "..." } (optional)
Auth: Admin/Super Admin
Actions: Update status, log audit, send email
```

### Reject User
```
PATCH /api/admin/users/{id}/reject/
Body: { "reason": "..." }
Auth: Admin/Super Admin
Actions: Update status, log audit, send email
```

### Suspend User
```
PATCH /api/admin/users/{id}/suspend/
Body: { "reason": "..." }
Auth: Admin/Super Admin
Actions: Update status, revoke sessions, log audit, send email
```

---

## Email Notifications Required

1. **New User Signup** → Email to Super Admin
2. **User Approved** → Email to User
3. **User Rejected** → Email to User (with reason)
4. **User Suspended** → Email to User (with reason)

---

## Audit Logging Required

All actions must log:
- Action type (`user_approved`, `user_rejected`, `user_suspended`)
- User ID (being acted upon)
- Performed by (Admin ID)
- Timestamp
- Details (reason, notes, status changes)

---

## Document Security

- Only Admin/Super Admin can access documents
- Use signed Cloudinary URLs
- Verify document ownership
- Include document type/name in responses

---

## Status Flow

```
pending_approval → approved (via Approve)
pending_approval → rejected (via Reject)
any → suspended (via Suspend)
```

---

**For complete documentation, see:**
- `BACKEND_USER_APPROVAL_API_REFERENCE.md` - Detailed API reference
- `BACKEND_IMPLEMENTATION_GUIDE.md` - Full implementation guide
- `BACKEND_API_COMPLETE_REFERENCE.md` - Complete API reference
