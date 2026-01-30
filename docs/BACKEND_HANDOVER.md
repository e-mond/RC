# RentalConnects Frontend → Backend Handover Document

> **Final Hardening & Validation Phase - January 2026**  
> Complete summary of frontend implementation, fixes, and backend requirements

---

## Executive Summary

This document provides a comprehensive handover from the frontend team to the backend team, including:
- **All fixes and improvements** made during the final hardening phase
- **Complete API endpoint reference** with request/response formats
- **Mock mode implementation** details for development
- **Security hardening** measures implemented
- **Pending backend implementations** required for full functionality

---

## 1. Critical Fixes Implemented (January 2026)

### 1.1 Demo Mode & Mock Login Fixes

**Issue**: Demo mode toggle wasn't working, and demo login was failing.

**Root Causes**:
- Mock adapter wasn't being initialized when `VITE_FORCE_MOCK` or `VITE_USE_MOCK` environment variables were set
- Token expiration checks were failing for mock tokens
- Missing mock handlers for notification endpoints causing 404 errors

**Fixes Applied**:

1. **Mock Manager Initialization** (`src/mocks/mockManager.js`):
   - Added auto-initialization of mock adapter when `FORCE_ENV` is true
   - Ensures mock adapter is enabled before any API calls

2. **Token Expiration Check** (`src/routes/RoleProtectedRoute.jsx`):
   - Added special handling for mock tokens (tokens starting with `mock-jwt-`)
   - Mock tokens never expire, preventing false logout triggers

3. **Notification Mock Handlers** (`src/mocks/axiosMock.js`):
   - Added complete mock handlers for all notification endpoints:
     - `GET /notifications/` - List notifications
     - `GET /notifications/{id}/` - Get notification by ID
     - `POST /notifications/` - Create notification
     - `PATCH /notifications/{id}/` - Update notification (mark as read, etc.)
     - `POST /notifications/mark-all-read/` - Mark all as read
     - `GET /notifications/unread-count/` - Get unread count
   - Added mock handlers for message endpoints:
     - `GET /messages/unread-count/` - Get unread message count
     - `GET /messages/conversations/` - List conversations
     - `GET /messages/conversations/{id}/` - Get conversation messages

### 1.2 Security Hardening

**Issue**: Console logs containing sensitive information were exposed in production builds.

**Fixes Applied**:
- Wrapped all `console.log`, `console.warn`, and `console.error` statements with `if (import.meta.env.DEV)` checks
- Files hardened:
  - `src/services/notificationService.js`
  - `src/services/messagesService.js`
  - `src/services/adminService.js` (previously completed)
  - `src/services/paystackService.js` (previously completed)
  - `src/mocks/mockManager.js` (previously completed)
  - `src/App.jsx`
  - `src/stores/authStore.js`
  - `src/routes/RoleProtectedRoute.jsx`

**Result**: No sensitive information is logged in production builds.

### 1.3 Error Handling Improvements

**Changes**:
- Notification service `getUnreadCount()` now returns `{ unread: 0, count: 0 }` instead of throwing errors
- Notification service `createNotification()` now returns `null` instead of throwing (non-blocking)
- All error logging is now development-only

---

## 2. Complete API Endpoint Reference

### 2.1 Authentication Endpoints

#### Login
```http
POST /auth/login/
Content-Type: application/json

Request Body:
{
  "email": "user@example.com",
  "password": "password123"
}

Response: 200 OK
{
  "access": "jwt_access_token",
  "refresh": "refresh_token",
  "token": "jwt_access_token",  // Backward compatibility
  "user": {
    "id": "user_id",
    "email": "user@example.com",
    "fullName": "User Name",
    "role": "tenant|landlord|artisan|admin|super-admin",
    "status": "active|pending|suspended|banned"
  }
}

Error Responses:
- 400: Invalid credentials
- 403 (AccountPendingError): Account pending approval
- 403 (AccountRejectedError): Account rejected
- 403 (AccountSuspendedError): Account suspended
  {
    "error": "AccountSuspendedError",
    "message": "Your account has been suspended.",
    "reason": "Violation reason",
    "suspended_at": "2026-01-01T00:00:00Z",
    "suspended_until": "2026-02-01T00:00:00Z"
  }
- 403 (AccountBannedError): Account banned
  {
    "error": "AccountBannedError",
    "message": "Your account has been permanently banned.",
    "reason": "Ban reason",
    "banned_at": "2026-01-01T00:00:00Z"
  }
```

#### Refresh Token
```http
POST /auth/token/refresh/
Content-Type: application/json

Request Body:
{
  "refresh": "refresh_token"
}

Response: 200 OK
{
  "access": "new_jwt_access_token",
  "refresh": "new_refresh_token"  // Optional
}
```

#### Get User Profile
```http
GET /auth/profile/
Authorization: Bearer {access_token}

Response: 200 OK
{
  "user": {
    "id": "user_id",
    "email": "user@example.com",
    "fullName": "User Name",
    "role": "tenant|landlord|artisan|admin|super-admin",
    "status": "active|pending|suspended|banned",
    "subscription": "free|premium"
  }
}
```

#### Signup (Tenant)
```http
POST /auth/signup/tenant/
Content-Type: multipart/form-data

Form Fields:
- email: string (required)
- password: string (required, min 8 chars)
- confirmPassword: string (required)
- fullName: string (required)
- phone: string (required)

Response: 201 Created
{
  "message": "Registration successful",
  "user": {
    "id": "user_id",
    "email": "user@example.com",
    "fullName": "User Name",
    "role": "tenant",
    "status": "pending"
  }
}
```

#### Signup (Landlord)
```http
POST /auth/signup/landlord/
Content-Type: multipart/form-data

Form Fields:
- email: string (required)
- password: string (required, min 8 chars)
- confirmPassword: string (required)
- fullName: string (required)
- phone: string (required)
- idUpload: File (required)

Response: 201 Created
{
  "message": "Registration successful",
  "user": {
    "id": "user_id",
    "email": "user@example.com",
    "fullName": "User Name",
    "role": "landlord",
    "status": "pending"
  }
}
```

#### Signup (Artisan)
```http
POST /auth/signup/artisan/
Content-Type: multipart/form-data

Form Fields:
- email: string (required)
- password: string (required, min 8 chars)
- confirmPassword: string (required)
- fullName: string (required)
- phone: string (required)
- profession: string (required)
- experience: number (required)
- region: string (required)
- profilePhoto: File (required)
- workSamples: File[] (optional, max 5)
- idUpload: File (required)

Response: 201 Created
{
  "message": "Registration successful",
  "user": {
    "id": "user_id",
    "email": "user@example.com",
    "fullName": "User Name",
    "role": "artisan",
    "status": "pending",
    "profession": "plumber",
    "experience": 5,
    "region": "Greater Accra"
  }
}
```

#### Forgot Password
```http
POST /auth/forgot-password/
Content-Type: application/json

Request Body:
{
  "email": "user@example.com"
}

Response: 200 OK
{
  "message": "Password reset email sent"
}
```

#### Reset Password
```http
POST /auth/reset-password/{token}/
Content-Type: application/json

Request Body:
{
  "password": "new_password",
  "confirmPassword": "new_password"
}

Response: 200 OK
{
  "message": "Password reset successful"
}
```

### 2.2 Notification Endpoints

#### Get Notifications
```http
GET /notifications/?is_read=false&type=welcome&notification_type=welcome
Authorization: Bearer {access_token}

Query Parameters:
- is_read: boolean (optional)
- type: string (optional, alias for notification_type)
- notification_type: string (optional)
- page: number (optional, for pagination)
- page_size: number (optional, for pagination)

Response: 200 OK
{
  "results": [
    {
      "id": "notification_id",
      "type": "welcome",
      "notification_type": "welcome",
      "title": "Welcome to RentalConnects!",
      "message": "Notification message",
      "is_read": false,
      "is_pinned": false,
      "is_archived": false,
      "action_url": "/properties",
      "metadata": {},
      "created_at": "2026-01-01T00:00:00Z"
    }
  ],
  "count": 10,
  "next": "url_to_next_page",
  "previous": "url_to_previous_page"
}
```

#### Get Notification by ID
```http
GET /notifications/{id}/
Authorization: Bearer {access_token}

Response: 200 OK
{
  "id": "notification_id",
  "type": "welcome",
  "notification_type": "welcome",
  "title": "Welcome to RentalConnects!",
  "message": "Notification message",
  "is_read": false,
  "is_pinned": false,
  "is_archived": false,
  "action_url": "/properties",
  "metadata": {},
  "created_at": "2026-01-01T00:00:00Z"
}
```

#### Create Notification
```http
POST /notifications/
Authorization: Bearer {access_token}
Content-Type: application/json

Request Body:
{
  "type": "welcome",
  "notification_type": "welcome",  // Send both for compatibility
  "title": "Notification Title",
  "message": "Notification message",
  "action_url": "/properties",
  "metadata": {}
}

Response: 201 Created
{
  "id": "notification_id",
  "type": "welcome",
  "notification_type": "welcome",
  "title": "Notification Title",
  "message": "Notification message",
  "is_read": false,
  "is_pinned": false,
  "is_archived": false,
  "action_url": "/properties",
  "metadata": {},
  "created_at": "2026-01-01T00:00:00Z"
}
```

#### Mark Notification as Read
```http
PATCH /notifications/{id}/
Authorization: Bearer {access_token}
Content-Type: application/json

Request Body:
{
  "is_read": true
}

Response: 200 OK
{
  "id": "notification_id",
  "is_read": true,
  ...
}
```

#### Mark All Notifications as Read
```http
POST /notifications/mark-all-read/
Authorization: Bearer {access_token}

Response: 200 OK
{
  "success": true
}
```

#### Get Unread Count
```http
GET /notifications/unread-count/
Authorization: Bearer {access_token}

Response: 200 OK
{
  "unread": 5,
  "count": 5
}
```

#### Pin/Unpin Notification
```http
PATCH /notifications/{id}/
Authorization: Bearer {access_token}
Content-Type: application/json

Request Body:
{
  "is_pinned": true  // or false to unpin
}

Response: 200 OK
{
  "id": "notification_id",
  "is_pinned": true,
  ...
}
```

#### Archive/Unarchive Notification
```http
PATCH /notifications/{id}/
Authorization: Bearer {access_token}
Content-Type: application/json

Request Body:
{
  "is_archived": true  // or false to unarchive
}

Response: 200 OK
{
  "id": "notification_id",
  "is_archived": true,
  ...
}
```

#### Delete Notification
```http
DELETE /notifications/{id}/
Authorization: Bearer {access_token}

Response: 204 No Content
```

#### Get Archived Notifications
```http
GET /notifications/?is_archived=true
Authorization: Bearer {access_token}

Response: 200 OK
{
  "results": [...],
  "count": 10
}
```

#### Send Email Notification
```http
POST /notifications/send-email/
Authorization: Bearer {access_token}
Content-Type: application/json

Request Body:
{
  "notification_type": "booking_approved",
  "recipient_id": "user_id",
  "email_data": {
    "subject": "Email Subject",
    "template": "template_name",
    "data": {}
  },
  "metadata": {}
}

Response: 200 OK
{
  "success": true,
  "message": "Email sent successfully"
}
```

### 2.3 Message Endpoints

#### Get Conversations
```http
GET /messages/conversations/
Authorization: Bearer {access_token}

Response: 200 OK
{
  "data": [
    {
      "id": "conversation_id",
      "participant": {
        "id": "user_id",
        "name": "User Name",
        "avatar": "avatar_url"
      },
      "last_message": {
        "text": "Last message text",
        "created_at": "2026-01-01T00:00:00Z"
      },
      "unread_count": 2,
      "updated_at": "2026-01-01T00:00:00Z"
    }
  ],
  "conversations": [...]  // Alternative format
}
```

#### Get Conversation Messages
```http
GET /messages/conversations/{conversation_id}/
Authorization: Bearer {access_token}

Response: 200 OK
{
  "messages": [
    {
      "id": "message_id",
      "sender": {
        "id": "user_id",
        "name": "User Name"
      },
      "text": "Message text",
      "created_at": "2026-01-01T00:00:00Z",
      "is_read": false
    }
  ],
  "data": {...}  // Alternative format
}
```

#### Send Message
```http
POST /messages/send/
Authorization: Bearer {access_token}
Content-Type: application/json

Request Body:
{
  "conversation_id": "conversation_id",
  "message": "Message text"
}

Response: 200 OK
{
  "data": {
    "id": "message_id",
    "text": "Message text",
    "created_at": "2026-01-01T00:00:00Z"
  }
}
```

#### Create Conversation
```http
POST /messages/conversations/
Authorization: Bearer {access_token}
Content-Type: application/json

Request Body:
{
  "recipient_id": 123,  // Must be integer
  "initial_message": "Hello"  // Optional
}

Response: 201 Created
{
  "data": {
    "id": "conversation_id",
    "participant": {...},
    "messages": [...]
  }
}

Error Responses:
- 400: Invalid recipient_id format
- 404: Recipient user not found
- 403: Permission denied
```

#### Mark Conversation as Read
```http
POST /messages/conversations/{conversation_id}/read/
Authorization: Bearer {access_token}

Response: 200 OK
{
  "success": true
}
```

#### Get Unread Message Count
```http
GET /messages/unread-count/
Authorization: Bearer {access_token}

Response: 200 OK
{
  "unread": 5,
  "count": 5
}
```

### 2.4 Artisan Endpoints

#### Get Artisans
```http
GET /artisans/?profession=plumber&location=Accra&min_rating=4&page=1
Authorization: Bearer {access_token}  // Optional for public listing

Query Parameters:
- profession: string (optional)
- location: string (optional)
- min_rating: number (optional)
- page: number (optional)
- page_size: number (optional)

Response: 200 OK
{
  "results": [
    {
      "id": "artisan_id",
      "fullName": "Artisan Name",
      "email": "artisan@example.com",
      "profession": "plumber",
      "experience": 5,
      "region": "Greater Accra",
      "rating": 4.5,
      "review_count": 10,
      "profilePhoto": "photo_url",
      "workSamples": ["sample1_url", "sample2_url"],
      "status": "active"
    }
  ],
  "count": 50,
  "next": "url_to_next_page",
  "previous": "url_to_previous_page"
}
```

#### Book Artisan
```http
POST /artisans/{artisan_id}/book/
Authorization: Bearer {access_token}
Content-Type: application/json

Request Body:
{
  "service_type": "repair|installation|maintenance",
  "description": "Service description",
  "preferred_date": "2026-02-01",
  "preferred_time": "10:00",
  "address": "Service address"
}

Response: 201 Created
{
  "id": "booking_id",
  "artisan": {...},
  "service_type": "repair",
  "description": "Service description",
  "preferred_date": "2026-02-01",
  "preferred_time": "10:00",
  "address": "Service address",
  "status": "pending",
  "created_at": "2026-01-01T00:00:00Z"
}
```

#### Request Profession Change (Artisan)
```http
POST /artisans/profession-change-request/
Authorization: Bearer {access_token}
Content-Type: application/json

Request Body:
{
  "new_profession": "electrician",
  "reason": "Reason for change"
}

Response: 201 Created
{
  "id": "request_id",
  "new_profession": "electrician",
  "reason": "Reason for change",
  "status": "pending",
  "created_at": "2026-01-01T00:00:00Z"
}
```

### 2.5 Admin Endpoints

#### Get Pending Users
```http
GET /admin/pending-users/
Authorization: Bearer {access_token}  // Admin/Super Admin only

Response: 200 OK
{
  "users": [
    {
      "id": "user_id",
      "email": "user@example.com",
      "fullName": "User Name",
      "role": "landlord|artisan",
      "phone": "phone_number",
      "status": "pending",
      "created_at": "2026-01-01T00:00:00Z"
    }
  ]
}
```

#### Approve User
```http
POST /admin/users/{user_id}/approve/
Authorization: Bearer {access_token}  // Admin/Super Admin only

Response: 200 OK
{
  "success": true,
  "user": {
    "id": "user_id",
    "status": "active",
    ...
  }
}
```

#### Reject User
```http
POST /admin/users/{user_id}/reject/
Authorization: Bearer {access_token}  // Admin/Super Admin only

Response: 200 OK
{
  "success": true
}
```

#### Get Pending Properties
```http
GET /admin/pending-properties/
Authorization: Bearer {access_token}  // Admin/Super Admin only

Response: 200 OK
{
  "properties": [...]
}
```

#### Approve Property
```http
POST /admin/properties/{property_id}/approve/
Authorization: Bearer {access_token}  // Admin/Super Admin only

Response: 200 OK
{
  "success": true,
  "property": {...}
}
```

#### Get Admin Dashboard Stats
```http
GET /admin/dashboard/stats/
Authorization: Bearer {access_token}  // Admin/Super Admin only

Response: 200 OK
{
  "pending_users": 5,
  "pending_properties": 3,
  "pending_profession_requests": 2,
  "pending_maintenance": 10
}
```

### 2.6 Super Admin Endpoints

#### Get System Stats
```http
GET /super-admin/stats/
Authorization: Bearer {access_token}  // Super Admin only

Response: 200 OK
{
  "data": {
    "total_users": 1000,
    "total_properties": 500,
    "total_bookings": 2000,
    ...
  }
}
```

#### Get All Users
```http
GET /super-admin/users/
Authorization: Bearer {access_token}  // Super Admin only

Response: 200 OK
{
  "users": [...]
}
```

#### Create User
```http
POST /super-admin/users/
Authorization: Bearer {access_token}  // Super Admin only
Content-Type: application/json

Request Body:
{
  "email": "user@example.com",
  "fullName": "User Name",
  "role": "admin",
  "status": "active"
}

Response: 201 Created
{
  "success": true,
  "user": {...}
}
```

#### Delete User
```http
DELETE /super-admin/users/{user_id}/
Authorization: Bearer {access_token}  // Super Admin only

Response: 200 OK
{
  "success": true
}
```

#### Get Audit Logs
```http
GET /super-admin/audit-logs/
Authorization: Bearer {access_token}  // Super Admin only

Response: 200 OK
{
  "logs": [
    {
      "id": "log_id",
      "actor": "admin",
      "action": "approve_user",
      "target": "user_id",
      "detail": "Approved user@example.com",
      "created_at": "2026-01-01T00:00:00Z"
    }
  ]
}
```

---

## 3. Mock Mode Implementation

### 3.1 Environment Variables

The frontend supports mock mode for development:

- `VITE_FORCE_MOCK=true` - Forces mock mode (cannot be disabled via UI)
- `VITE_USE_MOCK=true` - Enables mock mode (can be toggled via UI)

### 3.2 Mock Mode Features

- **Demo Accounts**: Pre-configured demo accounts for all roles:
  - `tenant@demo.com` → Tenant role
  - `landlord@demo.com` → Landlord role
  - `artisan@demo.com` → Artisan role
  - `admin@demo.com` → Admin role
  - `super@demo.com` → Super Admin role

- **Mock Tokens**: Mock JWT tokens are generated (format: `mock-jwt-{timestamp}`)
  - Mock tokens never expire
  - Special handling in `RoleProtectedRoute` to prevent false expiration

- **Mock Data**: All endpoints return mock data when mock mode is enabled
  - Mock data is stored in memory (not persisted)
  - Mock adapter intercepts all API calls via `axios-mock-adapter`

### 3.3 Mock Endpoints Implemented

All endpoints listed in Section 2 have mock handlers implemented in `src/mocks/axiosMock.js`.

---

## 4. Security Measures

### 4.1 Production Logging

- All `console.log`, `console.warn`, and `console.error` statements are wrapped with `if (import.meta.env.DEV)` checks
- No sensitive information is logged in production builds

### 4.2 Token Handling

- JWT tokens stored in localStorage via `session` utility
- Refresh token mechanism implemented for automatic token renewal
- Mock tokens have special handling to prevent false expiration

### 4.3 Error Handling

- Graceful degradation for non-critical endpoints (notifications, messages)
- User-friendly error messages
- Network errors handled with appropriate user feedback

---

## 5. Frontend Implementation Status

### 5.1 Fully Implemented (Frontend)

✅ **Authentication**
- Login/logout
- Signup (Tenant, Landlord, Artisan)
- Password reset flow
- Session persistence
- Role-based access control

✅ **Notifications**
- In-system notifications
- Email notifications (triggered)
- Notification polling
- Mark as read/unread
- Archive/unarchive
- Pin/unpin

✅ **Artisan System**
- Artisan signup with profile photo and work samples
- Artisan listing with search/filter
- Artisan booking flow
- Profession change request flow

✅ **Admin Features**
- Pending user approval
- Pending property approval
- Dashboard stats
- Audit logs viewing

✅ **UI Components**
- Responsive design
- Dark mode support
- Loading states
- Error handling
- Form validation

### 5.2 Backend Required

⚠️ **All API endpoints** listed in Section 2 require backend implementation.

**Priority Endpoints**:
1. Authentication endpoints (`/auth/login/`, `/auth/signup/{role}/`, etc.)
2. Notification endpoints (`/notifications/`, `/notifications/unread-count/`, etc.)
3. Message endpoints (`/messages/conversations/`, `/messages/unread-count/`, etc.)
4. Artisan endpoints (`/artisans/`, `/artisans/{id}/book/`, etc.)
5. Admin endpoints (`/admin/pending-users/`, `/admin/dashboard/stats/`, etc.)

---

## 6. Testing & Validation

### 6.1 Development Testing

- Mock mode enabled for all development testing
- Demo accounts available for all roles
- Mock data persists during session (not across page refreshes)

### 6.2 Production Readiness

- All console logs hardened for production
- Error handling implemented
- Graceful degradation for missing endpoints
- Security measures in place

---

## 7. Next Steps for Backend Team

1. **Implement Authentication Endpoints**
   - `/auth/login/` - Must return `access`, `refresh`, and `user` fields
   - `/auth/signup/{role}/` - Must handle multipart/form-data for file uploads
   - `/auth/token/refresh/` - Token refresh mechanism
   - `/auth/profile/` - User profile retrieval

2. **Implement Notification System**
   - `/notifications/` - CRUD operations
   - `/notifications/unread-count/` - Unread count (critical for badges)
   - `/notifications/send-email/` - Email notification trigger

3. **Implement Messaging System**
   - `/messages/conversations/` - Conversation listing
   - `/messages/unread-count/` - Unread message count (critical for badges)
   - `/messages/send/` - Send message

4. **Implement Artisan System**
   - `/artisans/` - Artisan listing with filters
   - `/artisans/{id}/book/` - Booking creation
   - `/artisans/profession-change-request/` - Profession change requests

5. **Implement Admin System**
   - `/admin/pending-users/` - Pending user listing
   - `/admin/users/{id}/approve/` - User approval
   - `/admin/dashboard/stats/` - Dashboard statistics

6. **Test Integration**
   - Test all endpoints with frontend
   - Verify error responses match expected formats
   - Ensure CORS is configured correctly
   - Verify file upload handling (multipart/form-data)

---

## 8. Contact & Support

For questions or clarifications about the frontend implementation:
- Review `docs/API_REFERENCE.md` for detailed API specifications
- Review `docs/PLATFORM_ARCHITECTURE.md` for system architecture
- Check service files in `src/services/` for implementation details

---

**Document Version**: 1.0  
**Last Updated**: January 28, 2026  
**Status**: Final Hardening Phase Complete
