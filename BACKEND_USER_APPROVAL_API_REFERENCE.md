# Backend User Approval API Reference

**Date:** January 20, 2026  
**Version:** 1.0  
**Status:** Production Ready

---

## Overview

This document provides complete API reference for the User Approval System, including endpoints for fetching pending users, viewing user details, approving/rejecting/suspending users, and handling document access.

---

## Base URL

```
/api/admin/
```

All endpoints require authentication with `Authorization: Bearer <access_token>` header.

---

## Endpoints

### 1. Get Pending Users

**Endpoint:** `GET /api/admin/users/pending/`

**Authentication:** Required (Admin, Super Admin)

**Query Parameters:**
- `role` (string, optional) - Filter by role: `"landlord"`, `"artisan"`, `"tenant"`
- `page` (integer, optional) - Page number for pagination (default: 1)
- `page_size` (integer, optional) - Items per page (default: 20)

**Response (200 OK):**
```json
{
  "count": 15,
  "next": "http://api.example.com/api/admin/users/pending/?page=2",
  "previous": null,
  "users": [
    {
      "id": 125,
      "email": "landlord@example.com",
      "fullName": "Jane Landlord",
      "phone": "+233241234567",
      "role": "landlord",
      "status": "pending_approval",
      "businessType": "Individual",
      "createdAt": "2026-01-15T00:00:00Z",
      "submittedAt": "2026-01-15T00:00:00Z",
      "documents": {
        "id_document": "https://res.cloudinary.com/.../id_doc.pdf",
        "business_registration": "https://res.cloudinary.com/.../business_reg.pdf",
        "profile_picture": "https://res.cloudinary.com/.../profile.jpg"
      }
    },
    {
      "id": 126,
      "email": "artisan@example.com",
      "fullName": "Mike Artisan",
      "phone": "+233241234568",
      "role": "artisan",
      "status": "pending_approval",
      "profession": "plumber",
      "experience": 5,
      "createdAt": "2026-01-16T00:00:00Z",
      "submittedAt": "2026-01-16T00:00:00Z",
      "documents": {
        "id_document": "https://res.cloudinary.com/.../id_doc.pdf",
        "certifications": [
          "https://res.cloudinary.com/.../cert1.pdf",
          "https://res.cloudinary.com/.../cert2.pdf"
        ],
        "profile_picture": "https://res.cloudinary.com/.../profile.jpg"
      }
    }
  ]
}
```

**Error Responses:**
- `401 Unauthorized` - Missing or invalid token
- `403 Forbidden` - User doesn't have permission to approve users
- `500 Internal Server Error` - Server error

**Backend Implementation Notes:**
- Filter by `status = "pending_approval"` by default
- Include all uploaded documents in response
- Sort by `created_at` descending (newest first)
- Only return users that admin has permission to view
- Pagination should use cursor-based or offset-based pagination

---

### 2. Get User Details

**Endpoint:** `GET /api/admin/users/{id}/`

**Authentication:** Required (Admin, Super Admin)

**Path Parameters:**
- `id` (integer, required) - User ID

**Response (200 OK):**
```json
{
  "user": {
    "id": 125,
    "email": "landlord@example.com",
    "fullName": "Jane Landlord",
    "phone": "+233241234567",
    "role": "landlord",
    "status": "pending_approval",
    "businessType": "Individual",
    "businessName": "ABC Properties Ltd",
    "createdAt": "2026-01-15T00:00:00Z",
    "submittedAt": "2026-01-15T00:00:00Z",
    "documents": {
      "id_document": "https://res.cloudinary.com/.../id_doc.pdf",
      "business_registration": "https://res.cloudinary.com/.../business_reg.pdf",
      "profile_picture": "https://res.cloudinary.com/.../profile.jpg"
    },
    "address": {
      "street": "123 Main Street",
      "city": "Accra",
      "region": "Greater Accra",
      "country": "Ghana"
    }
  }
}
```

**For Artisan Users:**
```json
{
  "user": {
    "id": 126,
    "email": "artisan@example.com",
    "fullName": "Mike Artisan",
    "phone": "+233241234568",
    "role": "artisan",
    "status": "pending_approval",
    "profession": "plumber",
    "experience": 5,
    "specialization": "Residential plumbing",
    "createdAt": "2026-01-16T00:00:00Z",
    "submittedAt": "2026-01-16T00:00:00Z",
    "documents": {
      "id_document": "https://res.cloudinary.com/.../id_doc.pdf",
      "certifications": [
        "https://res.cloudinary.com/.../cert1.pdf",
        "https://res.cloudinary.com/.../cert2.pdf"
      ],
      "profile_picture": "https://res.cloudinary.com/.../profile.jpg"
    }
  }
}
```

**Error Responses:**
- `401 Unauthorized` - Missing or invalid token
- `403 Forbidden` - User doesn't have permission
- `404 Not Found` - User not found
- `500 Internal Server Error` - Server error

**Backend Implementation Notes:**
- Return full user details including all documents
- Ensure documents are accessible (Cloudinary URLs)
- Include role-specific fields (businessType for landlord, profession for artisan)
- Verify user has permission to view this user's details

---

### 3. Approve User

**Endpoint:** `PATCH /api/admin/users/{id}/approve/`

**Authentication:** Required (Admin, Super Admin)

**Path Parameters:**
- `id` (integer, required) - User ID

**Request Body (optional):**
```json
{
  "notes": "User approved after document verification. All documents verified."
}
```

**Response (200 OK):**
```json
{
  "id": 125,
  "email": "landlord@example.com",
  "status": "approved",
  "approvedBy": 789,
  "approvedAt": "2026-01-20T10:00:00Z",
  "notes": "User approved after document verification. All documents verified."
}
```

**Backend Actions Required:**
1. Update user status to `"approved"`
2. Set `approved_by` to current admin/super admin ID
3. Set `approved_at` to current timestamp
4. Store `notes` if provided
5. **Log action in AuditLog:**
   - Action: `"user_approved"`
   - User ID: `{id}`
   - Performed by: Current admin ID
   - Timestamp: Current time
   - Notes: Request notes (if provided)
6. **Send email notification to user:**
   - Subject: "Account Approved - Welcome to RentalConnects"
   - Body: Include welcome message, next steps, login instructions
   - Include approval notes if provided

**Error Responses:**
- `400 Bad Request` - User is not in pending status
- `401 Unauthorized` - Missing or invalid token
- `403 Forbidden` - User doesn't have permission
- `404 Not Found` - User not found
- `500 Internal Server Error` - Server error

**Backend Implementation Notes:**
- Only allow approval if user status is `"pending_approval"` or `"pending"`
- Prevent duplicate approvals
- Ensure email notification is sent asynchronously
- Audit log entry is mandatory

---

### 4. Reject User

**Endpoint:** `PATCH /api/admin/users/{id}/reject/`

**Authentication:** Required (Admin, Super Admin)

**Path Parameters:**
- `id` (integer, required) - User ID

**Request Body:**
```json
{
  "reason": "Incomplete documentation. Please resubmit with valid ID document."
}
```

**Response (200 OK):**
```json
{
  "id": 125,
  "email": "landlord@example.com",
  "status": "rejected",
  "rejectedBy": 789,
  "rejectedAt": "2026-01-20T10:00:00Z",
  "rejectionReason": "Incomplete documentation. Please resubmit with valid ID document."
}
```

**Backend Actions Required:**
1. Update user status to `"rejected"`
2. Set `rejected_by` to current admin/super admin ID
3. Set `rejected_at` to current timestamp
4. Store `rejection_reason` from request
5. **Log action in AuditLog:**
   - Action: `"user_rejected"`
   - User ID: `{id}`
   - Performed by: Current admin ID
   - Timestamp: Current time
   - Reason: Request reason
6. **Send email notification to user:**
   - Subject: "Account Application Status - Action Required"
   - Body: Include rejection reason, steps to resubmit (if applicable)
   - Include rejection reason prominently

**Error Responses:**
- `400 Bad Request` - User is not in pending status or missing reason
- `401 Unauthorized` - Missing or invalid token
- `403 Forbidden` - User doesn't have permission
- `404 Not Found` - User not found
- `500 Internal Server Error` - Server error

**Backend Implementation Notes:**
- Only allow rejection if user status is `"pending_approval"` or `"pending"`
- Reason is optional but recommended
- Email must include rejection reason
- Audit log entry is mandatory

---

### 5. Suspend User

**Endpoint:** `PATCH /api/admin/users/{id}/suspend/`

**Authentication:** Required (Admin, Super Admin)

**Path Parameters:**
- `id` (integer, required) - User ID

**Request Body:**
```json
{
  "reason": "Violation of terms of service. Multiple complaints received."
}
```

**Response (200 OK):**
```json
{
  "id": 125,
  "email": "landlord@example.com",
  "status": "suspended",
  "suspendedBy": 789,
  "suspendedAt": "2026-01-20T10:00:00Z",
  "suspensionReason": "Violation of terms of service. Multiple complaints received."
}
```

**Backend Actions Required:**
1. Update user status to `"suspended"`
2. Set `suspended_by` to current admin/super admin ID
3. Set `suspended_at` to current timestamp
4. Store `suspension_reason` from request
5. **Optionally:** Revoke user's active sessions/tokens
6. **Log action in AuditLog:**
   - Action: `"user_suspended"`
   - User ID: `{id}`
   - Performed by: Current admin ID
   - Timestamp: Current time
   - Reason: Request reason
7. **Send email notification to user:**
   - Subject: "Account Suspension Notice"
   - Body: Include suspension reason, appeal process (if applicable)
   - Include suspension reason prominently

**Error Responses:**
- `400 Bad Request` - User is already suspended or missing reason
- `401 Unauthorized` - Missing or invalid token
- `403 Forbidden` - User doesn't have permission
- `404 Not Found` - User not found
- `500 Internal Server Error` - Server error

**Backend Implementation Notes:**
- Can suspend users in any status (not just pending)
- Reason is optional but recommended
- Consider revoking active sessions for security
- Email must include suspension reason
- Audit log entry is mandatory
- Suspended users should not be able to log in

---

## Email Notifications

### New User Signup Notification (to Super Admin)

**Trigger:** When a new user signs up with status `pending_approval`

**Recipient:** All Super Admin users

**Email Template:**
```
Subject: New User Registration - Action Required

Dear Super Admin,

A new user has registered on RentalConnects and requires approval.

User Details:
- Name: {fullName}
- Email: {email}
- Phone: {phone}
- Role: {role}
- Submitted At: {submittedAt}

Documents Submitted:
{List of document types}

Please review and approve/reject this user:
{Direct link to approval page: /admin/approvals/user/{id}}

Best regards,
RentalConnects System
```

**Backend Implementation:**
- Send email asynchronously (use Celery or background task)
- Include all user details
- Include document count/types
- Provide direct link to approval page
- Send to all Super Admin users

---

### User Approval Notification (to User)

**Trigger:** When user is approved

**Recipient:** Approved user

**Email Template:**
```
Subject: Account Approved - Welcome to RentalConnects!

Dear {fullName},

Congratulations! Your account has been approved.

You can now:
- Log in to your dashboard
- Start listing properties (if landlord)
- Accept service requests (if artisan)
- Browse and rent properties (if tenant)

Login: {login_url}

{If notes provided:}
Approval Notes: {notes}

Welcome aboard!
RentalConnects Team
```

---

### User Rejection Notification (to User)

**Trigger:** When user is rejected

**Recipient:** Rejected user

**Email Template:**
```
Subject: Account Application Status - Action Required

Dear {fullName},

We regret to inform you that your account application has been rejected.

Reason: {rejectionReason}

{If resubmission allowed:}
You can resubmit your application with the required corrections:
{resubmission_url}

If you have questions, please contact support:
{support_email}

Best regards,
RentalConnects Team
```

---

### User Suspension Notification (to User)

**Trigger:** When user is suspended

**Recipient:** Suspended user

**Email Template:**
```
Subject: Account Suspension Notice

Dear {fullName},

Your account has been suspended.

Reason: {suspensionReason}

Effective Date: {suspendedAt}

{If appeal process exists:}
You may appeal this decision:
{appeal_url}

For questions, contact support:
{support_email}

Best regards,
RentalConnects Team
```

---

## Audit Logging

### Required Audit Log Fields

All user approval actions must be logged with the following fields:

```python
{
    "action": "user_approved" | "user_rejected" | "user_suspended",
    "user_id": 125,  # The user being acted upon
    "performed_by": 789,  # Admin/Super Admin ID
    "timestamp": "2026-01-20T10:00:00Z",
    "details": {
        "reason": "...",  # For reject/suspend
        "notes": "...",  # For approve
        "previous_status": "pending_approval",
        "new_status": "approved"
    },
    "ip_address": "192.168.1.1",  # Optional but recommended
    "user_agent": "Mozilla/5.0..."  # Optional but recommended
}
```

### Audit Log Endpoint

**Endpoint:** `GET /api/super-admin/audit-logs/`

**Query Parameters:**
- `action` (string, optional) - Filter by action type
- `user_id` (integer, optional) - Filter by user ID
- `performed_by` (integer, optional) - Filter by admin ID
- `start_date` (datetime, optional) - Start date filter
- `end_date` (datetime, optional) - End date filter
- `page` (integer, optional) - Page number

**Response:**
```json
{
  "count": 100,
  "results": [
    {
      "id": 1,
      "action": "user_approved",
      "user_id": 125,
      "performed_by": 789,
      "timestamp": "2026-01-20T10:00:00Z",
      "details": {
        "reason": null,
        "notes": "All documents verified",
        "previous_status": "pending_approval",
        "new_status": "approved"
      }
    }
  ]
}
```

---

## Document Access Security

### Requirements

1. **Authorization Check:**
   - Only Admin and Super Admin roles can access user documents
   - Verify user has `canApproveUsers` permission
   - Check if document belongs to user being reviewed

2. **Cloudinary Integration:**
   - Documents stored in Cloudinary
   - URLs should be signed URLs for security
   - Expire signed URLs after reasonable time (e.g., 1 hour)

3. **Document Types:**
   - `id_document` - ID card/passport
   - `business_registration` - Business registration document (landlord)
   - `certifications` - Professional certifications (artisan, array)
   - `profile_picture` - Profile photo

4. **Response Format:**
   - All document URLs should be full Cloudinary URLs
   - Include document type/name in response
   - Support both single documents and arrays (for certifications)

---

## Database Schema Updates

### User Model

```python
class User(models.Model):
    # ... existing fields ...
    
    status = models.CharField(
        max_length=20,
        choices=[
            ('pending', 'Pending'),
            ('pending_approval', 'Pending Approval'),
            ('approved', 'Approved'),
            ('rejected', 'Rejected'),
            ('suspended', 'Suspended'),
        ],
        default='pending_approval'
    )
    
    approved_by = models.ForeignKey(
        'self',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='approved_users'
    )
    approved_at = models.DateTimeField(null=True, blank=True)
    
    rejected_by = models.ForeignKey(
        'self',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='rejected_users'
    )
    rejected_at = models.DateTimeField(null=True, blank=True)
    rejection_reason = models.TextField(null=True, blank=True)
    
    suspended_by = models.ForeignKey(
        'self',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='suspended_users'
    )
    suspended_at = models.DateTimeField(null=True, blank=True)
    suspension_reason = models.TextField(null=True, blank=True)
    
    submitted_at = models.DateTimeField(auto_now_add=True)
```

### AuditLog Model

```python
class AuditLog(models.Model):
    action = models.CharField(max_length=50)
    user_id = models.IntegerField()  # User being acted upon
    performed_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True)
    timestamp = models.DateTimeField(auto_now_add=True)
    details = models.JSONField(default=dict)
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    user_agent = models.TextField(null=True, blank=True)
    
    class Meta:
        ordering = ['-timestamp']
        indexes = [
            models.Index(fields=['action', 'timestamp']),
            models.Index(fields=['user_id', 'timestamp']),
        ]
```

---

## Error Handling

### Standard Error Response Format

```json
{
  "error": "Error message",
  "code": "ERROR_CODE",
  "details": {
    "field": ["Error message for field"]
  }
}
```

### Common Error Codes

- `USER_NOT_FOUND` - User ID doesn't exist
- `INVALID_STATUS` - User is not in correct status for action
- `PERMISSION_DENIED` - User doesn't have permission
- `ALREADY_APPROVED` - User is already approved
- `ALREADY_SUSPENDED` - User is already suspended
- `MISSING_REASON` - Reason required but not provided

---

## Testing Checklist

### API Endpoints
- [ ] Get pending users returns correct data
- [ ] Get user details returns full information
- [ ] Approve user updates status and sends email
- [ ] Reject user updates status and sends email
- [ ] Suspend user updates status and sends email
- [ ] All actions are logged in audit log
- [ ] Permission checks work correctly
- [ ] Error handling returns proper status codes

### Email Notifications
- [ ] New user signup email sent to Super Admin
- [ ] Approval email sent to user
- [ ] Rejection email sent to user with reason
- [ ] Suspension email sent to user with reason
- [ ] All emails include correct information

### Security
- [ ] Only authorized roles can access endpoints
- [ ] Document URLs are secure
- [ ] Audit logs are created for all actions
- [ ] Suspended users cannot log in

---

## Implementation Priority

1. **High Priority:**
   - Get pending users endpoint
   - Get user details endpoint
   - Approve/Reject/Suspend endpoints
   - Basic audit logging

2. **Medium Priority:**
   - Email notifications
   - Document security enhancements
   - Detailed audit log queries

3. **Low Priority:**
   - Advanced filtering
   - Bulk operations
   - Analytics/reporting

---

**Document Version:** 1.0  
**Last Updated:** January 20, 2026  
**Maintained By:** Backend Team
