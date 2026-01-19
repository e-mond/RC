# Frontend API Map

**Date:** January 2026  
**Status:** Production-Ready  
**Purpose:** Complete reference for all API endpoints used in RentalConnects frontend

---

## Overview

This document maps all API endpoints used in the frontend, including:
- Endpoint paths and methods
- Which pages/components use them
- Required roles and permissions
- Mock mode equivalents
- Expected request/response formats

---

## Base Configuration

**Base URL:** `VITE_API_BASE_URL` or `http://localhost:8000/api`  
**Authentication:** JWT Bearer token (injected via `apiClient` interceptors)  
**Content-Type:** `application/json` (multipart/form-data for file uploads)

---

## Authentication Endpoints

### POST `/auth/login/`

**Used By:**
- `src/pages/Auth/Login.jsx`
- `src/components/auth/LoginForm.jsx`

**Request:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "access": "jwt_access_token",
  "refresh": "jwt_refresh_token",
  "user": {
    "id": "user_123",
    "email": "user@example.com",
    "full_name": "John Doe",
    "role": "tenant",
    "subscription": "free"
  }
}
```

**Mock:** Yes (via `authService.js`)  
**Roles:** None (public endpoint)

---

### POST `/auth/signup/tenant/`

**Used By:**
- `src/pages/Auth/Signup.jsx`
- `src/pages/Auth/components/TenantForm.jsx`

**Request:**
```json
{
  "email": "user@example.com",
  "password": "password123",
  "full_name": "John Doe",
  "phone_number": "+233123456789"
}
```

**Response:**
```json
{
  "message": "User registered successfully",
  "user_id": "user_123"
}
```

**Mock:** Yes (via `authService.js`)  
**Roles:** None (public endpoint)

---

### POST `/auth/signup/landlord/`

**Used By:**
- `src/pages/Auth/Signup.jsx`
- `src/pages/Auth/components/LandlordForm.jsx`

**Request:** Similar to tenant signup + additional landlord fields  
**Mock:** Yes  
**Roles:** None

---

### POST `/auth/signup/artisan/`

**Used By:**
- `src/pages/Auth/Signup.jsx`
- `src/pages/Auth/components/ArtisanForm.jsx`

**Request:** Similar to tenant signup + artisan-specific fields  
**Mock:** Yes  
**Roles:** None

---

### POST `/auth/logout/`

**Used By:**
- `src/stores/authStore.js` (logout method)
- `src/components/layout/Navbar.jsx`

**Request:** None (token in header)  
**Response:** `{ "message": "Logged out successfully" }`  
**Mock:** Yes  
**Roles:** Authenticated users

---

### POST `/auth/refresh/`

**Used By:**
- `src/services/apiClient.js` (automatic token refresh on 401)

**Request:**
```json
{
  "refresh": "jwt_refresh_token"
}
```

**Response:**
```json
{
  "access": "new_jwt_access_token",
  "refresh": "new_jwt_refresh_token"
}
```

**Mock:** No (handled by backend)  
**Roles:** Authenticated users

---

### GET `/auth/profile/`

**Used By:**
- `src/stores/authStore.js` (loadSession)
- `src/pages/Profile/ProfilePage.jsx`

**Response:**
```json
{
  "id": "user_123",
  "email": "user@example.com",
  "full_name": "John Doe",
  "role": "tenant",
  "subscription": "free",
  "phone_number": "+233123456789"
}
```

**Mock:** Yes  
**Roles:** Authenticated users

---

### POST `/auth/forgot-password/`

**Used By:**
- `src/pages/Auth/ForgotPassword.jsx`

**Request:**
```json
{
  "email": "user@example.com"
}
```

**Response:**
```json
{
  "message": "Password reset email sent"
}
```

**Mock:** Yes  
**Roles:** None (public endpoint)

---

### POST `/auth/reset-password/`

**Used By:**
- `src/pages/Auth/ResetPassword.jsx`

**Request:**
```json
{
  "token": "reset_token",
  "password": "new_password123"
}
```

**Response:**
```json
{
  "message": "Password reset successfully"
}
```

**Mock:** Yes  
**Roles:** None (public endpoint with token)

---

## Property Endpoints

### GET `/properties/`

**Used By:**
- `src/pages/Landing/PublicProperties.jsx`
- `src/pages/Dashboards/Tenant/TenantProperties.jsx`

**Query Parameters:**
- `page`, `page_size`, `search`, `min_price`, `max_price`, `property_type`, `location`

**Response:**
```json
{
  "count": 100,
  "next": "http://api.../properties/?page=2",
  "previous": null,
  "results": [
    {
      "id": "prop_123",
      "title": "2 Bedroom Apartment",
      "price": 1500,
      "location": "Accra",
      "property_type": "apartment",
      "images": ["url1", "url2"]
    }
  ]
}
```

**Mock:** Yes (via `propertyService.js`)  
**Roles:** Public (some filters require auth)

---

### GET `/properties/:id/`

**Used By:**
- `src/pages/PropertyDetail.jsx`
- `src/pages/Dashboards/Landlord/Properties/PropertyDetailsPage.jsx`

**Response:**
```json
{
  "id": "prop_123",
  "title": "2 Bedroom Apartment",
  "description": "Beautiful apartment...",
  "price": 1500,
  "location": "Accra",
  "landlord": {
    "id": "landlord_123",
    "full_name": "Jane Smith"
  },
  "images": ["url1", "url2"],
  "amenities": ["wifi", "parking"]
}
```

**Mock:** Yes  
**Roles:** Public

---

### POST `/properties/`

**Used By:**
- `src/pages/Dashboards/Landlord/Properties/PropertyForm.jsx`

**Request:** FormData with property fields + images  
**Response:** Created property object  
**Mock:** Yes  
**Roles:** Landlord, Admin, Super Admin

---

### PUT/PATCH `/properties/:id/`

**Used By:**
- `src/pages/Dashboards/Landlord/Properties/PropertyForm.jsx` (edit mode)

**Request:** Property fields to update  
**Response:** Updated property object  
**Mock:** Yes  
**Roles:** Landlord (own properties), Admin, Super Admin

---

### DELETE `/properties/:id/`

**Used By:**
- `src/pages/Dashboards/Landlord/Properties/PropertyDetailsPage.jsx`

**Response:** `{ "message": "Property deleted" }`  
**Mock:** Yes  
**Roles:** Landlord (own properties), Admin, Super Admin

---

### GET `/properties/landlord/:ownerId/`

**Used By:**
- `src/pages/Dashboards/Landlord/Properties/LandlordPropertiesViewPage.jsx`

**Response:** List of properties for landlord  
**Mock:** Yes  
**Roles:** Landlord (own properties), Admin, Super Admin

---

### GET `/properties/pending/`

**Used By:**
- `src/pages/Dashboards/Admin/properties/AdminPropertyApprovalsPage.jsx`
- `src/pages/Dashboards/SuperAdmin/approvals/SA_PendingPropertyApprovals.jsx`

**Response:** List of pending properties  
**Mock:** Yes  
**Roles:** Admin, Super Admin

---

### POST `/properties/:id/approve/`

**Used By:**
- `src/pages/Dashboards/Admin/properties/AdminPropertyApprovalsPage.jsx`
- `src/pages/Dashboards/SuperAdmin/approvals/SA_PendingPropertyApprovals.jsx`

**Response:** `{ "message": "Property approved" }`  
**Mock:** Yes  
**Roles:** Admin, Super Admin

---

### POST `/properties/:id/reject/`

**Used By:**
- `src/pages/Dashboards/Admin/properties/AdminPropertyApprovalsPage.jsx`
- `src/pages/Dashboards/SuperAdmin/approvals/SA_PendingPropertyApprovals.jsx`

**Request:**
```json
{
  "reason": "Rejection reason"
}
```

**Response:** `{ "message": "Property rejected" }`  
**Mock:** Yes  
**Roles:** Admin, Super Admin

---

## User Management Endpoints

### GET `/users/:id/`

**Used By:**
- `src/pages/Users/PublicProfilePage.jsx`

**Response:** User profile object  
**Mock:** Yes (via `userService.js`)  
**Roles:** Authenticated users

---

### GET `/users/:id/profile/`

**Used By:**
- `src/pages/Users/PublicProfilePage.jsx`

**Response:** Public user profile  
**Mock:** Yes  
**Roles:** Authenticated users

---

### GET `/users/search/`

**Used By:**
- `src/components/messages/UserSearchAutocomplete.jsx`

**Query Parameters:** `q` (search query)  
**Response:** List of matching users  
**Mock:** Yes  
**Roles:** Authenticated users

---

## Admin Endpoints

### GET `/admin/insights/`

**Used By:**
- `src/pages/Dashboards/Admin/AdminDashboard.jsx`
- `src/pages/Dashboards/Admin/components/AD_SystemInsights.jsx`

**Response:**
```json
{
  "total_users": 1000,
  "total_properties": 500,
  "pending_approvals": 10
}
```

**Mock:** Yes (via `adminService.js`)  
**Roles:** Admin, Super Admin

---

### GET `/admin/users/pending/`

**Used By:**
- `src/pages/Dashboards/Admin/components/AD_UserApprovals.jsx`

**Response:** List of pending user approvals  
**Mock:** Yes  
**Roles:** Admin, Super Admin

---

### GET `/admin/users/:id/`

**Used By:**
- `src/pages/Dashboards/Admin/UserApprovalDetailPage.jsx`

**Response:** User detail with approval status  
**Mock:** Yes  
**Roles:** Admin, Super Admin

---

### POST `/admin/users/:id/approve/`

**Used By:**
- `src/pages/Dashboards/Admin/components/AD_UserApprovals.jsx`

**Response:** `{ "message": "User approved" }`  
**Mock:** Yes  
**Roles:** Admin, Super Admin

---

### POST `/admin/users/:id/reject/`

**Used By:**
- `src/pages/Dashboards/Admin/components/AD_UserApprovals.jsx`

**Request:**
```json
{
  "reason": "Rejection reason"
}
```

**Response:** `{ "message": "User rejected" }`  
**Mock:** Yes  
**Roles:** Admin, Super Admin

---

### POST `/admin/users/:id/suspend/`

**Used By:**
- `src/pages/Dashboards/Admin/components/AD_UserApprovals.jsx`

**Request:**
```json
{
  "reason": "Suspension reason"
}
```

**Response:** `{ "message": "User suspended" }`  
**Mock:** Yes  
**Roles:** Admin, Super Admin

---

## Super Admin Endpoints

### GET `/super-admin/system/stats/`

**Used By:**
- `src/pages/Dashboards/SuperAdmin/SuperAdminDashboard.jsx`
- `src/pages/Dashboards/SuperAdmin/components/SA_StatsOverview.jsx`

**Response:** System-wide statistics  
**Mock:** Yes (via `adminService.js`)  
**Roles:** Super Admin only

---

### GET `/super-admin/users/`

**Used By:**
- `src/pages/Dashboards/SuperAdmin/users/SA_UsersPage.jsx`

**Query Parameters:** `page`, `page_size`, `role`, `search`  
**Response:** Paginated list of all users  
**Mock:** Yes  
**Roles:** Super Admin only

---

### POST `/super-admin/users/`

**Used By:**
- `src/pages/Dashboards/SuperAdmin/components/SA_CreateUserModal.jsx`

**Request:** User creation data  
**Response:** Created user object  
**Mock:** Yes  
**Roles:** Super Admin only

---

### DELETE `/super-admin/users/:id/`

**Used By:**
- `src/pages/Dashboards/SuperAdmin/components/SA_DeleteUserModal.jsx`

**Response:** `{ "message": "User deleted" }`  
**Mock:** Yes  
**Roles:** Super Admin only

---

### GET `/super-admin/audit-logs/`

**Used By:**
- `src/pages/Dashboards/SuperAdmin/audit/SA_AuditPage.jsx`

**Query Parameters:** `page`, `page_size`, `action`, `user`, `date_from`, `date_to`  
**Response:** Paginated audit logs  
**Mock:** Yes  
**Roles:** Super Admin only

---

### GET `/super-admin/premium/pricing/`

**Used By:**
- `src/pages/Dashboards/SuperAdmin/pricing/SA_PremiumPricing.jsx`

**Response:**
```json
{
  "monthly_price": 49.00,
  "yearly_price": 490.00,
  "currency": "GHS"
}
```

**Mock:** Yes  
**Roles:** Super Admin only

---

### PUT `/super-admin/premium/pricing/`

**Used By:**
- `src/pages/Dashboards/SuperAdmin/pricing/SA_PremiumPricing.jsx`

**Request:**
```json
{
  "monthly_price": 49.00,
  "yearly_price": 490.00
}
```

**Response:** Updated pricing  
**Mock:** Yes  
**Roles:** Super Admin only

---

## Wallet Endpoints

### GET `/wallet/balance/`

**Used By:**
- `src/services/walletService.js`
- `src/components/common/WalletDisplay.jsx`

**Response:**
```json
{
  "balance": 1000.00,
  "currency": "GHS",
  "is_setup": true
}
```

**Mock:** Yes (in-memory storage)  
**Roles:** Landlord, Artisan, Admin, Super Admin

---

### POST `/wallet/top-up/`

**Used By:**
- `src/components/common/WalletTopUpModal.jsx`

**Request:**
```json
{
  "amount": 100.00,
  "payment_method": "paystack",
  "reference": "paystack_ref_123"
}
```

**Response:** Updated wallet balance  
**Mock:** Yes  
**Roles:** Landlord, Artisan, Admin, Super Admin

---

### GET `/wallet/transactions/`

**Used By:**
- `src/pages/Dashboards/Landlord/LandlordWallet.jsx`

**Response:** List of wallet transactions  
**Mock:** Yes  
**Roles:** Landlord, Artisan, Admin, Super Admin

---

## Notification Endpoints

### GET `/notifications/`

**Used By:**
- `src/pages/Notifications/NotificationsCenter.jsx`
- `src/services/notificationService.js`

**Query Parameters:** `page`, `page_size`, `unread_only`  
**Response:** Paginated notifications  
**Mock:** Yes (via `notificationService.js`)  
**Roles:** Authenticated users

---

### GET `/notifications/unread-count/`

**Used By:**
- `src/components/Notifications/NotificationDropdown.jsx`
- `src/components/layout/Navbar.jsx`

**Response:**
```json
{
  "count": 5
}
```

**Mock:** Yes  
**Roles:** Authenticated users

---

### POST `/notifications/:id/read/`

**Used By:**
- `src/pages/Notifications/NotificationsCenter.jsx`

**Response:** `{ "message": "Notification marked as read" }`  
**Mock:** Yes  
**Roles:** Authenticated users

---

### POST `/notifications/mark-all-read/`

**Used By:**
- `src/pages/Notifications/NotificationsCenter.jsx`

**Response:** `{ "message": "All notifications marked as read" }`  
**Mock:** Yes  
**Roles:** Authenticated users

---

## Messages Endpoints

### GET `/messages/conversations/`

**Used By:**
- `src/pages/Messages/MessagesInbox.jsx`

**Response:** List of conversations  
**Mock:** Yes (via `messagesService.js`)  
**Roles:** Authenticated users

---

### GET `/messages/conversations/:id/`

**Used By:**
- `src/pages/Messages/MessagesInbox.jsx`

**Response:** Conversation with messages  
**Mock:** Yes  
**Roles:** Authenticated users

---

### POST `/messages/send/`

**Used By:**
- `src/pages/Messages/MessagesInbox.jsx`

**Request:**
```json
{
  "conversation_id": "conv_123",
  "content": "Message text",
  "encrypted": false
}
```

**Response:** Created message object  
**Mock:** Yes  
**Roles:** Authenticated users

---

## Lease Endpoints

### GET `/leases/system/`

**Used By:**
- `src/pages/Dashboards/SuperAdmin/leases/SA_LeasesPage.jsx`

**Response:** List of system lease templates  
**Mock:** Yes (via `leaseService.js`)  
**Roles:** Admin, Super Admin

---

### GET `/leases/system/:id/download/`

**Used By:**
- `src/pages/Dashboards/SuperAdmin/leases/SA_LeasesPage.jsx`
- `src/components/lease/LeaseViewerModal.jsx`

**Response:** PDF file download  
**Mock:** Yes (returns mock PDF URL)  
**Roles:** Admin, Super Admin

---

### GET `/leases/signed/tenant/`

**Used By:**
- `src/pages/Dashboards/Tenant/Leases/TenantLeasesPage.jsx`

**Response:** List of signed leases for tenant  
**Mock:** Yes  
**Roles:** Tenant

---

## Mock Mode Equivalents

### Services with Mock Support

1. **authService.js** - Mock login, signup, profile
2. **propertyService.js** - Mock property CRUD
3. **walletService.js** - In-memory wallet data
4. **adsService.js** - Static ad data
5. **paystackService.js** - Simulated payments
6. **announcementService.js** - Mock announcements
7. **reviewService.js** - Mock reviews
8. **messagesService.js** - In-memory conversations
9. **notificationService.js** - Mock notifications

### Mock Data Location

- `src/mocks/mockManager.js` - Mock mode detection
- `src/mocks/axiosMock.js` - Axios mock adapter
- `src/mocks/*Mock.js` - Service-specific mocks

---

## Error Handling

### Standard Error Response

```json
{
  "detail": "Error message",
  "code": "ERROR_CODE",
  "field_errors": {
    "field_name": ["Error message"]
  }
}
```

### HTTP Status Codes

- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized (triggers token refresh)
- `403` - Forbidden (permission denied)
- `404` - Not Found
- `422` - Validation Error
- `500` - Server Error

---

## Rate Limiting

- **Authentication endpoints:** 5 requests/minute
- **Property endpoints:** 60 requests/minute
- **Admin endpoints:** 30 requests/minute
- **Wallet endpoints:** 20 requests/minute

---

## Testing Endpoints

### Mock Mode Testing

Set `VITE_USE_MOCK=true` in `.env` to test without backend.

### Real API Testing

1. Ensure backend is running
2. Set `VITE_USE_MOCK=false`
3. Use valid JWT tokens
4. Test with different user roles

---

**Last Updated:** January 2026  
**Maintained By:** Frontend Team
