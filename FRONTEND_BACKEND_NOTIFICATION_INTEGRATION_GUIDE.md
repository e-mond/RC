# Frontend-Backend Notification Integration Guide

**Date:** January 2026  
**Status:** ✅ Backend Implementation Complete  
**Purpose:** Complete documentation for frontend team on backend notification system and signup approval flow

---

## Table of Contents

1. [Overview](#overview)
2. [Notification System](#notification-system)
3. [Signup Approval Flow](#signup-approval-flow)
4. [API Endpoints](#api-endpoints)
5. [Notification Payload Structure](#notification-payload-structure)
6. [Notification Types](#notification-types)
7. [Integration Examples](#integration-examples)
8. [Testing Guide](#testing-guide)
9. [Error Handling](#error-handling)
10. [Important Notes](#important-notes)

---

## Overview

The backend notification system is fully implemented and integrated across the application. All notification types from `FRONTEND_NOTIFICATION_UI_DOCUMENTATION.md` are supported, and notifications are automatically created at key trigger points.

### Key Features

- ✅ **27 notification types** supported
- ✅ **Automatic notification creation** on key events
- ✅ **Email notifications** sent alongside in-app notifications
- ✅ **Admin alerts** for pending approvals
- ✅ **Frontend-compatible payload structure** with field aliases
- ✅ **Pagination and filtering** support
- ✅ **Read/unread state management**

---

## Notification System

### Database Model

The notification model includes all required fields:

- `id` - Unique notification ID
- `type` / `notification_type` - Notification type (27 types supported)
- `title` - Notification title
- `message` - Notification message/body
- `is_read` / `read` - Read status (boolean)
- `created_at` / `createdAt` - ISO 8601 timestamp
- `action_url` / `actionUrl` - URL to navigate when clicked
- `email_sent` - Whether email notification was sent
- `metadata` - Additional context (JSON object)

### Automatic Notification Creation

Notifications are automatically created when:

1. **Account Management:**
   - User signs up (pending approval) → `account_pending`
   - Account approved → `account_approved`
   - First login after approval → `welcome`

2. **Property Management:**
   - Property approved → `property_approved`
   - Property rejected → `property_rejected`

3. **Booking Management:**
   - Booking created → `booking_created`
   - Booking approved → `booking_approved`
   - Booking rejected → `booking_rejected`

4. **Viewing Requests:**
   - Viewing request created → `booking_created` (to landlord)
   - Viewing confirmed → `viewing_scheduled` (to tenant)
   - Viewing rejected → `booking_rejected` (to tenant)

5. **Maintenance:**
   - Maintenance request created → `maintenance_requested`
   - Maintenance completed → `maintenance_completed`

6. **Payments:**
   - Wallet top-up → `wallet_topup`

7. **Admin Alerts:**
   - New user pending approval → `system` (to all admins)

---

## Signup Approval Flow

### User Signup (Landlord/Artisan)

**When:** User completes signup form for Landlord or Artisan role

**Backend Actions:**
1. Account created with `status='pending_approval'`
2. **Email sent** to user: "Account Under Review"
3. **In-app notification created** for user: `account_pending` type
4. **System notifications created** for all admins/super-admins
5. Tokens generated (but login is blocked until approval)

**User Notification:**
```json
{
  "id": 123,
  "type": "account_pending",
  "title": "Account Under Review",
  "message": "Your account is currently under review and pending admin approval. You will receive an email notification once your account has been approved. You cannot log in until your account is approved.",
  "is_read": false,
  "read": false,
  "created_at": "2026-01-20T10:00:00Z",
  "createdAt": "2026-01-20T10:00:00Z",
  "email_sent": true,
  "action_url": null,
  "actionUrl": null,
  "metadata": {
    "user_role": "landlord",
    "signup_date": "2026-01-20T10:00:00Z",
    "status": "pending_approval"
  }
}
```

**Admin Notification (sent to all admins/super-admins):**
```json
{
  "id": 124,
  "type": "system",
  "title": "New User Awaiting Approval",
  "message": "A new Landlord account (John Doe - john@example.com) is awaiting approval.",
  "is_read": false,
  "read": false,
  "created_at": "2026-01-20T10:00:00Z",
  "createdAt": "2026-01-20T10:00:00Z",
  "email_sent": false,
  "action_url": "http://localhost:5173/admin/users/123",
  "actionUrl": "http://localhost:5173/admin/users/123",
  "metadata": {
    "pending_user_id": "123",
    "pending_user_name": "John Doe",
    "pending_user_email": "john@example.com",
    "pending_user_role": "landlord",
    "signup_date": "2026-01-20T10:00:00Z",
    "notification_type": "pending_user_alert"
  }
}
```

### Login Blocking

**Important:** Users with `status='pending_approval'` **cannot log in**.

**Login API Response (403 Forbidden):**
```json
{
  "error": "AccountPendingError",
  "message": "Your account is pending admin approval. You will receive an email notification once approved.",
  "status": "pending_approval"
}
```

**Frontend Should:**
- Display error message clearly
- Show "Account Under Review" state
- Prevent access to protected routes
- Display pending approval notification if user somehow has access

### Post-Approval Flow

**When:** Admin approves user account

**Backend Actions:**
1. **Email sent** to user: "Account Approved"
2. **In-app notification created** for user: `account_approved` type
3. User status changed to `approved`
4. User can now log in

**On First Login After Approval:**
1. User logs in successfully
2. **Welcome notification created** automatically: `welcome` type
3. User sees welcome notification in notification center

**Approval Notification:**
```json
{
  "id": 125,
  "type": "account_approved",
  "title": "Account Approved",
  "message": "Your account has been approved! Welcome to Rental Connects. You can now access all features.",
  "is_read": false,
  "read": false,
  "created_at": "2026-01-20T11:00:00Z",
  "createdAt": "2026-01-20T11:00:00Z",
  "email_sent": true,
  "action_url": "http://localhost:5173/dashboard",
  "actionUrl": "http://localhost:5173/dashboard",
  "metadata": {
    "approved_by": 789,
    "approved_by_name": "Admin User",
    "approved_at": "2026-01-20T11:00:00Z"
  }
}
```

**Welcome Notification:**
```json
{
  "id": 126,
  "type": "welcome",
  "title": "Welcome to Rental Connects!",
  "message": "Welcome to the platform! Your account is now active. Start by exploring your dashboard.",
  "is_read": false,
  "read": false,
  "created_at": "2026-01-20T11:05:00Z",
  "createdAt": "2026-01-20T11:05:00Z",
  "email_sent": false,
  "action_url": "http://localhost:5173/dashboard",
  "actionUrl": "http://localhost:5173/dashboard",
  "metadata": {
    "welcome_type": "first_login_after_approval"
  }
}
```

---

## API Endpoints

### Base URL
All notification endpoints are under: `/api/notifications/`

### 1. Get Notifications

**Endpoint:** `GET /api/notifications/`

**Authentication:** Required (JWT Bearer Token)

**Query Parameters:**
- `is_read` (boolean, optional) - Filter by read status
- `notification_type` or `type` (string, optional) - Filter by notification type
- `page` (integer, optional) - Page number for pagination
- `page_size` (integer, optional) - Items per page (default: 20, max: 100)

**Response (200 OK):**
```json
{
  "count": 50,
  "next": "http://localhost:8000/api/notifications/?page=2",
  "previous": null,
  "results": [
    {
      "id": 123,
      "type": "account_pending",
      "notification_type": "account_pending",
      "title": "Account Under Review",
      "message": "Your account is currently under review...",
      "is_read": false,
      "read": false,
      "created_at": "2026-01-20T10:00:00Z",
      "createdAt": "2026-01-20T10:00:00Z",
      "action_url": null,
      "actionUrl": null,
      "email_sent": true,
      "metadata": {}
    }
  ]
}
```

**Example Requests:**
```javascript
// Get all notifications
GET /api/notifications/

// Get unread notifications only
GET /api/notifications/?is_read=false

// Get notifications by type
GET /api/notifications/?type=account_approved

// Get paginated results
GET /api/notifications/?page=2&page_size=10
```

### 2. Get Unread Count

**Endpoint:** `GET /api/notifications/unread-count/`

**Authentication:** Required

**Response (200 OK):**
```json
{
  "unread_count": 5
}
```

**Use Case:** Update notification badge in navbar

### 3. Mark Notification as Read

**Endpoint:** `PATCH /api/notifications/{id}/`

**Authentication:** Required

**Request Body:**
```json
{
  "is_read": true
}
```

**Response (200 OK):**
```json
{
  "id": 123,
  "type": "account_pending",
  "title": "Account Under Review",
  "message": "...",
  "is_read": true,
  "read": true,
  "created_at": "2026-01-20T10:00:00Z",
  "createdAt": "2026-01-20T10:00:00Z",
  "read_at": "2026-01-20T12:00:00Z"
}
```

### 4. Mark All as Read

**Endpoint:** `POST /api/notifications/mark-all-read/`

**Authentication:** Required

**Response (200 OK):**
```json
{
  "message": "All notifications marked as read."
}
```

### 5. Get Single Notification

**Endpoint:** `GET /api/notifications/{id}/`

**Authentication:** Required

**Response (200 OK):**
```json
{
  "id": 123,
  "type": "account_pending",
  "title": "Account Under Review",
  "message": "...",
  "is_read": false,
  "read": false,
  "created_at": "2026-01-20T10:00:00Z",
  "createdAt": "2026-01-20T10:00:00Z",
  "action_url": null,
  "actionUrl": null,
  "email_sent": true,
  "metadata": {}
}
```

---

## Notification Payload Structure

### Standard Fields

All notifications include these fields (with aliases for compatibility):

| Field | Alias | Type | Description |
|-------|-------|------|-------------|
| `id` | - | integer | Unique notification ID |
| `notification_type` | `type` | string | Notification type (see types below) |
| `title` | - | string | Notification title |
| `message` | - | string | Notification message/body |
| `is_read` | `read` | boolean | Read status |
| `created_at` | `createdAt` | string | ISO 8601 timestamp |
| `action_url` | `actionUrl` | string/null | URL to navigate when clicked |
| `email_sent` | - | boolean | Whether email was sent |
| `metadata` | - | object | Additional context data |

### Field Aliases

The backend returns both field names for maximum compatibility:

```json
{
  "notification_type": "account_approved",  // Original field
  "type": "account_approved",              // Alias (preferred by frontend)
  
  "is_read": false,                         // Original field
  "read": false,                           // Alias
  
  "created_at": "2026-01-20T10:00:00Z",   // Original field
  "createdAt": "2026-01-20T10:00:00Z",     // Alias
  
  "action_url": "/dashboard",              // Original field
  "actionUrl": "/dashboard"                // Alias
}
```

**Frontend Recommendation:** Use the aliases (`type`, `read`, `createdAt`, `actionUrl`) for consistency with frontend naming conventions.

---

## Notification Types

### Complete List (27 Types)

#### System Notifications
- `system` - General system messages
- `welcome` - Welcome message on first login after approval
- `account_approved` - Account approval notification
- `account_pending` - Account pending approval (NEW)
- `account_rejected` - Account rejection notification
- `account_suspended` - Account suspension notification
- `system_update` - Platform updates

#### Approval Notifications
- `property_approved` - Property listing approved
- `booking_approved` - Booking request approved

#### Rejection Notifications
- `property_rejected` - Property listing rejected
- `booking_rejected` - Booking request rejected

#### Booking Notifications
- `booking` - General booking notification
- `booking_created` - New booking request created
- `booking_accepted` - Booking accepted
- `viewing_scheduled` - Viewing request confirmed/scheduled

#### Payment Notifications
- `payment` - General payment notification
- `payment_received` - Payment received successfully
- `payment_failed` - Payment failed
- `wallet_topup` - Wallet top-up successful

#### Maintenance Notifications
- `maintenance` - General maintenance notification
- `maintenance_requested` - Maintenance request created
- `maintenance_completed` - Maintenance request completed

#### Info Notifications
- `info` - General information
- `info_maintenance` - Maintenance announcements

#### Legacy Types (Backward Compatibility)
- `message` - Message notification
- `review` - Review notification
- `service_request` - Service request notification
- `property` - Property notification

---

## Integration Examples

### Example 1: Fetch Notifications on Page Load

```javascript
// Fetch notifications when notification center opens
async function fetchNotifications() {
  try {
    const response = await fetch('/api/notifications/', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    const data = await response.json();
    
    // Handle paginated response
    const notifications = data.results || data;
    
    // Use field aliases for consistency
    notifications.forEach(notification => {
      console.log(notification.type);        // Use 'type' alias
      console.log(notification.read);        // Use 'read' alias
      console.log(notification.createdAt);  // Use 'createdAt' alias
      console.log(notification.actionUrl);   // Use 'actionUrl' alias
    });
    
    return notifications;
  } catch (error) {
    console.error('Error fetching notifications:', error);
    return [];
  }
}
```

### Example 2: Update Unread Count Badge

```javascript
// Poll for unread count (every 45 seconds as per frontend docs)
async function updateUnreadCount() {
  try {
    const response = await fetch('/api/notifications/unread-count/', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    const data = await response.json();
    const count = data.unread_count || 0;
    
    // Update badge
    document.getElementById('notification-badge').textContent = 
      count > 99 ? '99+' : count.toString();
    
    return count;
  } catch (error) {
    console.error('Error fetching unread count:', error);
    return 0;
  }
}

// Poll every 45 seconds
setInterval(updateUnreadCount, 45000);
```

### Example 3: Mark Notification as Read

```javascript
async function markAsRead(notificationId) {
  try {
    const response = await fetch(`/api/notifications/${notificationId}/`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        is_read: true
      })
    });
    
    if (response.ok) {
      // Update local state
      updateNotificationReadState(notificationId);
      // Refresh unread count
      updateUnreadCount();
    }
  } catch (error) {
    console.error('Error marking notification as read:', error);
  }
}
```

### Example 4: Handle Notification Click

```javascript
function handleNotificationClick(notification) {
  // Mark as read
  if (!notification.read) {
    markAsRead(notification.id);
  }
  
  // Navigate to action URL if provided
  if (notification.actionUrl) {
    window.location.href = notification.actionUrl;
  } else if (notification.action_url) {
    window.location.href = notification.action_url;
  }
}
```

### Example 5: Filter Notifications by Type

```javascript
// Get only account approval notifications
async function getApprovalNotifications() {
  const response = await fetch('/api/notifications/?type=account_approved', {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  
  const data = await response.json();
  return data.results || [];
}
```

### Example 6: Handle Signup Success

```javascript
// After successful signup (Landlord/Artisan)
async function handleSignupSuccess(userData) {
  // Check if account is pending approval
  if (userData.status === 'pending_approval') {
    // Show pending approval message
    showPendingApprovalMessage();
    
    // Note: User cannot log in yet, but notification will be created
    // When they try to log in, they'll see the error message
    // Once approved, they'll receive account_approved notification
  } else {
    // Tenant - auto-approved, can proceed
    redirectToDashboard();
  }
}
```

### Example 7: Handle Login with Pending Approval

```javascript
// Handle login response
async function handleLogin(credentials) {
  try {
    const response = await fetch('/api/auth/login/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(credentials)
    });
    
    const data = await response.json();
    
    // Check for pending approval error
    if (response.status === 403 && data.error === 'AccountPendingError') {
      // Show pending approval UI
      showAccountPendingUI();
      // Display message
      showMessage(data.message);
      return;
    }
    
    // Successful login
    if (response.ok) {
      // Store tokens
      localStorage.setItem('token', data.access);
      localStorage.setItem('refreshToken', data.refresh);
      
      // Check for welcome notification on first load
      checkForWelcomeNotification();
      
      // Redirect to dashboard
      redirectToDashboard();
    }
  } catch (error) {
    console.error('Login error:', error);
  }
}
```

---

## Testing Guide

### Manual Testing Checklist

#### Signup Flow
- [ ] **Landlord Signup:**
  - [ ] Complete signup form
  - [ ] Verify email received: "Account Under Review"
  - [ ] Verify `account_pending` notification created (check via API)
  - [ ] Verify admin notifications created (check admin account)
  - [ ] Attempt login → should be blocked with clear error

- [ ] **Artisan Signup:**
  - [ ] Complete signup form
  - [ ] Verify email received: "Account Under Review"
  - [ ] Verify `account_pending` notification created
  - [ ] Verify admin notifications created
  - [ ] Attempt login → should be blocked

- [ ] **Tenant Signup:**
  - [ ] Complete signup form
  - [ ] Verify NO pending notifications created
  - [ ] Verify can log in immediately

#### Approval Flow
- [ ] **Admin Approves User:**
  - [ ] Admin approves landlord/artisan account
  - [ ] Verify approval email sent to user
  - [ ] Verify `account_approved` notification created
  - [ ] User can now log in successfully

- [ ] **First Login After Approval:**
  - [ ] User logs in after approval
  - [ ] Verify `welcome` notification created automatically
  - [ ] Verify notification appears in notification center

#### Notification API
- [ ] **List Notifications:**
  - [ ] GET `/api/notifications/` returns correct format
  - [ ] Pagination works correctly
  - [ ] Filtering by `type` works
  - [ ] Filtering by `is_read` works

- [ ] **Unread Count:**
  - [ ] GET `/api/notifications/unread-count/` returns correct count
  - [ ] Count updates when notifications marked as read

- [ ] **Mark as Read:**
  - [ ] PATCH `/api/notifications/{id}/` marks notification as read
  - [ ] Unread count decreases

- [ ] **Mark All as Read:**
  - [ ] POST `/api/notifications/mark-all-read/` works
  - [ ] All notifications marked as read
  - [ ] Unread count becomes 0

### API Testing Examples

#### Test Signup and Check Notifications

```bash
# 1. Sign up as landlord
curl -X POST http://localhost:8000/api/auth/landlord/signup/ \
  -H "Content-Type: application/json" \
  -d '{
    "email": "landlord@test.com",
    "fullName": "Test Landlord",
    "phone": "1234567890",
    "password": "SecurePass123!",
    "confirmPassword": "SecurePass123!"
  }'

# 2. Check user notifications (use token from signup)
curl http://localhost:8000/api/notifications/ \
  -H "Authorization: Bearer <token>"

# 3. Check admin notifications (login as admin first)
curl http://localhost:8000/api/notifications/ \
  -H "Authorization: Bearer <admin_token>"
```

---

## Error Handling

### API Error Responses

#### 401 Unauthorized
```json
{
  "detail": "Authentication credentials were not provided."
}
```
**Action:** Redirect to login

#### 403 Forbidden
```json
{
  "error": "AccountPendingError",
  "message": "Your account is pending admin approval...",
  "status": "pending_approval"
}
```
**Action:** Show pending approval UI, block access

#### 404 Not Found
```json
{
  "message": "Notification not found."
}
```
**Action:** Remove from local state, show error message

#### 500 Internal Server Error
```json
{
  "detail": "An error occurred while processing the request."
}
```
**Action:** Log error, show user-friendly message, retry if appropriate

### Frontend Error Handling Best Practices

1. **Graceful Degradation:**
   - If notification API fails, app should still function
   - Show empty state in notification center
   - Don't block user actions

2. **Retry Logic:**
   - Retry failed requests with exponential backoff
   - Especially important for unread count polling

3. **User Feedback:**
   - Show loading states
   - Display error messages clearly
   - Provide retry options

4. **Offline Handling:**
   - Cache notifications locally
   - Queue read/unread actions
   - Sync when connection restored

---

## Important Notes

### 1. Field Aliases

The backend returns both original field names and aliases. **Frontend should use aliases** for consistency:

- ✅ Use `type` (not `notification_type`)
- ✅ Use `read` (not `is_read`)
- ✅ Use `createdAt` (not `created_at`)
- ✅ Use `actionUrl` (not `action_url`)

### 2. Pagination

The API returns paginated responses with this structure:
```json
{
  "count": 50,
  "next": "http://...",
  "previous": "http://...",
  "results": [...]
}
```

**Frontend should:**
- Handle pagination for large notification lists
- Load more notifications when user scrolls
- Display total count if needed

### 3. Notification Ordering

Notifications are ordered by:
1. **Unread first** (when frontend sorts)
2. **Newest first** (backend default: `-created_at`)

**Backend returns:** Newest first (unread and read mixed)

**Frontend should:** Sort to show unread first, then newest first

### 4. Polling Interval

**Recommended:** Poll unread count every 45 seconds (as per frontend docs)

**Endpoints to poll:**
- `/api/notifications/unread-count/` - For badge count
- `/api/notifications/?is_read=false` - For notification list (if dropdown open)

### 5. Login Blocking

**Critical:** Users with `status='pending_approval'` **cannot log in**.

**Frontend must:**
- Handle `AccountPendingError` from login endpoint
- Show clear "Account Under Review" message
- Prevent access to protected routes
- Display signup success message with approval status

### 6. Email Notifications

**Backend sends emails for:**
- Account pending approval (on signup)
- Account approved (on approval)
- Property approved/rejected
- Booking created/approved/rejected
- Payment received
- Maintenance completed

**Frontend doesn't need to:**
- Send emails (backend handles this)
- Track email status (use `email_sent` flag if needed for UI hints)

### 7. Action URLs

**Action URLs are provided for:**
- Navigation to relevant pages
- Direct links to properties, bookings, etc.
- Admin user management pages

**Frontend should:**
- Use `actionUrl` or `action_url` when notification is clicked
- Navigate to URL if provided
- Fallback to default page if not provided

### 8. Metadata Field

**Metadata contains:**
- Additional context (user IDs, property IDs, etc.)
- Timestamps
- Approval/rejection reasons
- Related object information

**Frontend can use metadata for:**
- Displaying additional details
- Custom notification rendering
- Deep linking to related objects

### 9. Notification Types Mapping

**Backend uses:** Full type names (e.g., `account_approved`, `property_approved`)

**Frontend should:** Map to display labels and icons as per `FRONTEND_NOTIFICATION_UI_DOCUMENTATION.md`

### 10. Admin Notifications

**Admin notifications are created:**
- When new user signs up and needs approval
- Type: `system`
- Sent to all active admins and super-admins

**Frontend should:**
- Show these in admin notification center
- Provide action URL to user management page
- Display user details from metadata

---

## Notification Type Reference

### Complete Type List with Descriptions

| Type | Description | When Created | Recipient |
|------|-------------|--------------|-----------|
| `account_pending` | Account pending approval | On signup (landlord/artisan) | User |
| `account_approved` | Account approved | On admin approval | User |
| `welcome` | Welcome message | First login after approval | User |
| `property_approved` | Property approved | On property approval | Landlord |
| `property_rejected` | Property rejected | On property rejection | Landlord |
| `booking_created` | New booking/viewing request | On booking/viewing creation | Landlord |
| `booking_approved` | Booking approved | On booking approval | Tenant |
| `booking_rejected` | Booking rejected | On booking rejection | Tenant |
| `viewing_scheduled` | Viewing confirmed | On viewing confirmation | Tenant |
| `maintenance_requested` | Maintenance request created | On maintenance request | Landlord |
| `maintenance_completed` | Maintenance completed | On maintenance completion | Tenant |
| `wallet_topup` | Wallet top-up | On wallet top-up | User |
| `system` | System/admin alert | New pending user, admin actions | Admin/Super-Admin |

---

## Quick Reference

### Common API Calls

```javascript
// Get all notifications
GET /api/notifications/

// Get unread notifications
GET /api/notifications/?is_read=false

// Get notifications by type
GET /api/notifications/?type=account_approved

// Get unread count
GET /api/notifications/unread-count/

// Mark as read
PATCH /api/notifications/{id}/
Body: { "is_read": true }

// Mark all as read
POST /api/notifications/mark-all-read/
```

### Notification Flow Summary

```
Signup (Landlord/Artisan)
  ↓
Email: "Account Under Review"
  ↓
Notification: account_pending (user)
  ↓
Notification: system (all admins)
  ↓
[User cannot log in]
  ↓
Admin Approves
  ↓
Email: "Account Approved"
  ↓
Notification: account_approved (user)
  ↓
[User can log in]
  ↓
First Login
  ↓
Notification: welcome (user)
```

---

## Support

For questions or issues:
- Check `FRONTEND_NOTIFICATION_UI_DOCUMENTATION.md` for UI requirements
- Check `NOTIFICATION_SYSTEM_IMPLEMENTATION_SUMMARY.md` for backend details
- Check `SIGNUP_APPROVAL_NOTIFICATIONS_IMPLEMENTATION.md` for signup flow details

**Last Updated:** January 2026  
**Backend Status:** ✅ Complete and Ready for Integration
