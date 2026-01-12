# API Documentation - RentalConnects Frontend

**Version:** 1.0.0  
**Last Updated:** January 15, 2026  
**Purpose:** Complete reference of all API endpoints used by the frontend

---

## Table of Contents

1. [Authentication APIs](#authentication-apis)
2. [User Management APIs](#user-management-apis)
3. [Property APIs](#property-apis)
4. [Booking & Viewing APIs](#booking--viewing-apis)
5. [Wallet & Payment APIs](#wallet--payment-apis)
6. [Messaging APIs](#messaging-apis)
7. [Review & Rating APIs](#review--rating-apis)
8. [Admin APIs](#admin-apis)
9. [Super Admin APIs](#super-admin-apis)
10. [Marketing APIs](#marketing-apis)
11. [Ads APIs](#ads-apis)
12. [Announcement APIs](#announcement-apis)
13. [Analytics APIs](#analytics-apis)
14. [Preferences APIs](#preferences-apis)

---

## Authentication APIs

### Login
**Endpoint:** `POST /auth/login/`  
**Service:** `authService.js`  
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
  "access": "jwt_token",
  "refresh": "refresh_token",
  "user": { ... }
}
```

### Signup - Tenant
**Endpoint:** `POST /auth/signup/tenant/`  
**Service:** `tenantService.js`  
**Request:** `FormData` (multipart/form-data)
- `fullName`, `email`, `phone`, `password`, `confirmPassword`, `location`, `rentRange`, `idUpload`

### Signup - Landlord
**Endpoint:** `POST /auth/signup/landlord/`  
**Service:** `authService.js`  
**Request:** `FormData` (multipart/form-data)
- `fullName`, `email`, `phone`, `password`, `confirmPassword`, `businessType`, `location`, `idUpload`

### Signup - Artisan
**Endpoint:** `POST /auth/signup/artisan`  
**Service:** `artisanService.js`  
**Request:** `FormData` (multipart/form-data)
- `fullName`, `email`, `phone`, `password`, `confirmPassword`, `profession`, `experience`, `region`, `idUpload`

### Get Profile
**Endpoint:** `GET /auth/profile/`  
**Service:** `authService.js`, `userService.js`  
**Response:**
```json
{
  "id": 1,
  "email": "user@example.com",
  "full_name": "John Doe",
  "role": "tenant",
  ...
}
```

### Update Profile
**Endpoint:** `PATCH /auth/profile/`  
**Service:** `userService.js`  
**Request:** `FormData` (multipart/form-data)
- `full_name`, `phone`, `avatar`, etc.

### Forgot Password
**Endpoint:** `POST /auth/forgot-password/`  
**Service:** `authService.js`  
**Request:**
```json
{
  "email": "user@example.com"
}
```

### Reset Password
**Endpoint:** `POST /auth/reset-password/:token/`  
**Service:** `authService.js`  
**Request:**
```json
{
  "password": "new_password",
  "confirmPassword": "new_password"
}
```

---

## User Management APIs

### Get User Profile (Public)
**Endpoint:** `GET /users/:userId/`  
**Service:** `userService.js`  
**Response:**
```json
{
  "id": 1,
  "full_name": "John Doe",
  "email": "user@example.com",
  "role": "landlord",
  "ratings": { "average": 4.5, "total": 10 },
  "verification_status": { ... }
}
```

---

## Property APIs

### Get All Properties
**Endpoint:** `GET /properties`  
**Service:** `propertyService.js`  
**Query Params:** `search`, `min_price`, `max_price`, `city`, `property_type`, `bedrooms`, `bathrooms`  
**Response:**
```json
{
  "properties": [...],
  "count": 100
}
```
or
```json
{
  "results": [...],
  "count": 100
}
```

### Get Property by ID
**Endpoint:** `GET /properties/:id`  
**Service:** `propertyService.js`  
**Response:**
```json
{
  "id": 1,
  "title": "Beautiful Apartment",
  "address": "Accra, Ghana",
  "priceGhs": 1500,
  "images": [...],
  "landlord": { ... },
  ...
}
```

### Create Property
**Endpoint:** `POST /properties/`  
**Service:** `propertyService.js`, `landlordService.js`  
**Request:** `FormData` (multipart/form-data)
- `title`, `address`, `priceGhs`, `description`, `images[]`, `bedrooms`, `bathrooms`, etc.

### Update Property
**Endpoint:** `PUT /properties/:id/`  
**Service:** `propertyService.js`, `landlordService.js`  
**Request:** `FormData` (multipart/form-data)

### Delete Property
**Endpoint:** `DELETE /properties/:id/`  
**Service:** `propertyService.js`, `landlordService.js`  
**Response:**
```json
{
  "success": true
}
```

### Get Landlord's Properties
**Endpoint:** `GET /properties/landlord/:ownerId/`  
**Service:** `landlordService.js`  
**Response:**
```json
{
  "properties": [...],
  "count": 5
}
```

### Upload Property Images
**Endpoint:** `POST /properties/uploads/images/`  
**Service:** `propertyService.js`  
**Request:** `FormData` with `file` field

### Get Amenities
**Endpoint:** `GET /properties/amenities/`  
**Service:** `propertyService.js`  
**Response:**
```json
{
  "amenities": ["WiFi", "Parking", "Security", ...]
}
```

---

## Booking & Viewing APIs

### Create Viewing Request
**Endpoint:** `POST /tenant/viewing-requests`  
**Service:** `tenantService.js`  
**Request:**
```json
{
  "propertyId": 1,
  "preferredDate": "2026-01-20",
  "message": "Interested in viewing"
}
```

### Get Viewing Requests (Landlord)
**Endpoint:** `GET /bookings/`  
**Service:** `landlordService.js`  
**Query Params:** `status`, `page_size`  
**Response:**
```json
{
  "bookings": [...],
  "count": 10
}
```

### Update Booking Status
**Endpoint:** `PATCH /bookings/:id/`  
**Service:** `landlordService.js`  
**Request:**
```json
{
  "status": "confirmed"
}
```

### Get Tenant Rentals
**Endpoint:** `GET /tenant/rentals`  
**Service:** `tenantService.js`  
**Response:**
```json
{
  "rentals": [...]
}
```

### Get Rental by ID
**Endpoint:** `GET /tenant/rentals/:rentalId`  
**Service:** `tenantService.js`

### Pay Rent
**Endpoint:** `POST /tenant/rentals/:rentalId/pay`  
**Service:** `tenantService.js`  
**Request:**
```json
{
  "amount": 1500,
  "paymentMethod": "wallet"
}
```

---

## Wallet & Payment APIs

### Get Wallet
**Endpoint:** `GET /wallet/`  
**Service:** `walletService.js`  
**Response:**
```json
{
  "id": 1,
  "user_id": 1,
  "balance": 500.00,
  "currency": "GHS",
  "is_setup": true,
  "bank_account": { ... },
  "mobile_money": { ... }
}
```

### Setup Wallet
**Endpoint:** `POST /wallet/setup/`  
**Service:** `walletService.js`  
**Request:**
```json
{
  "bank_account": {
    "account_number": "1234567890",
    "bank_name": "GCB Bank",
    "account_name": "John Doe"
  }
}
```
or
```json
{
  "mobile_money": {
    "network": "MTN",
    "number": "+233XXXXXXXXX"
  }
}
```

### Update Wallet
**Endpoint:** `PATCH /wallet/`  
**Service:** `walletService.js`

### Get Wallet Balance
**Endpoint:** `GET /wallet/balance/`  
**Service:** `walletService.js`  
**Response:**
```json
{
  "balance": 500.00,
  "currency": "GHS"
}
```

### Top Up Wallet
**Endpoint:** `POST /wallet/top-up/`  
**Service:** `walletService.js`  
**Request:**
```json
{
  "amount": 100.00,
  "payment_reference": "paystack_ref_123"
}
```

### Get Transactions
**Endpoint:** `GET /wallet/transactions/`  
**Service:** `walletService.js`  
**Query Params:** `type`, `status`, `page`, `page_size`  
**Response:**
```json
{
  "results": [...],
  "count": 50
}
```

### Get Transaction by ID
**Endpoint:** `GET /wallet/transactions/:transactionId/`  
**Service:** `walletService.js`

### Withdraw from Wallet
**Endpoint:** `POST /wallet/withdraw/`  
**Service:** `walletService.js`  
**Request:**
```json
{
  "amount": 100.00,
  "account_type": "bank_account"
}
```

### Create Subscription Transaction
**Endpoint:** `POST /wallet/transactions/subscription/`  
**Service:** `walletService.js`  
**Request:**
```json
{
  "plan": "premium",
  "duration": "monthly",
  "amount": 49.00
}
```

### Create Ad Promotion Transaction
**Endpoint:** `POST /wallet/transactions/ad-promotion/`  
**Service:** `walletService.js`  
**Request:**
```json
{
  "ad_id": 1,
  "amount": 30.00,
  "duration_days": 7
}
```

### Create Booking Transaction
**Endpoint:** `POST /wallet/transactions/booking/`  
**Service:** `walletService.js`  
**Request:**
```json
{
  "booking_id": 1,
  "amount": 1500.00
}
```

### Verify Paystack Payment
**Endpoint:** `POST /payments/verify-paystack/`  
**Service:** `paystackService.js`  
**Request:**
```json
{
  "reference": "paystack_ref_123"
}
```

---

## Messaging APIs

### Get Conversations
**Endpoint:** `GET /messages/conversations/`  
**Service:** `messagesService.js`  
**Response:**
```json
{
  "conversations": [...],
  "count": 5
}
```

### Get Conversation by ID
**Endpoint:** `GET /messages/conversations/:conversationId/`  
**Service:** `messagesService.js`  
**Response:**
```json
{
  "id": 1,
  "participants": [...],
  "messages": [...],
  "unread_count": 2
}
```

### Create Conversation
**Endpoint:** `POST /messages/conversations/`  
**Service:** `messagesService.js`  
**Request:**
```json
{
  "participant_id": 2,
  "initial_message": "Hello"
}
```

### Send Message
**Endpoint:** `POST /messages/send/`  
**Service:** `messagesService.js`  
**Request:**
```json
{
  "conversation_id": 1,
  "content": "Message text",
  "encrypted": false,
  "attachments": []
}
```

### Mark Conversation as Read
**Endpoint:** `POST /messages/conversations/:conversationId/read/`  
**Service:** `messagesService.js`

### Get Unread Count
**Endpoint:** `GET /messages/unread-count/`  
**Service:** `messagesService.js`  
**Response:**
```json
{
  "unread_count": 5
}
```

---

## Review & Rating APIs

### Get Reviews
**Endpoint:** `GET /reviews/`  
**Service:** `reviewService.js`  
**Query Params:** `property_id`, `user_id`, `status`, `type`  
**Response:**
```json
{
  "results": [...],
  "count": 20
}
```

### Get Review by ID
**Endpoint:** `GET /reviews/:id/`  
**Service:** `reviewService.js`

### Create Review
**Endpoint:** `POST /reviews/`  
**Service:** `reviewService.js`  
**Request:**
```json
{
  "property_id": 1,
  "rating": 5,
  "comment": "Great property!",
  "type": "property"
}
```

### Update Review
**Endpoint:** `PATCH /reviews/:id/`  
**Service:** `reviewService.js`  
**Request:**
```json
{
  "status": "approved"
}
```

### Delete Review
**Endpoint:** `DELETE /reviews/:id/`  
**Service:** `reviewService.js`

### Get Property Reviews
**Endpoint:** `GET /reviews/property/:propertyId/`  
**Service:** `reviewService.js`  
**Response:**
```json
{
  "reviews": [...],
  "average_rating": 4.5,
  "total_reviews": 10,
  "rating_breakdown": { "5": 5, "4": 3, "3": 2 }
}
```

### Get User Reviews
**Endpoint:** `GET /reviews/user/:userId/`  
**Service:** `reviewService.js`  
**Response:**
```json
{
  "reviews": [...],
  "average_rating": 4.5,
  "total_reviews": 10
}
```

---

## Admin APIs

### Get System Insights
**Endpoint:** `GET /admin/insights`  
**Service:** `adminService.js`  
**Response:**
```json
{
  "total_users": 1000,
  "total_properties": 500,
  "pending_approvals": 10,
  ...
}
```

### Get Pending Users
**Endpoint:** `GET /admin/users/pending`  
**Service:** `adminService.js`  
**Response:**
```json
{
  "users": [...],
  "count": 5
}
```

### Approve User
**Endpoint:** `PATCH /admin/users/:id/approve`  
**Service:** `adminService.js`  
**Response:**
```json
{
  "success": true,
  "message": "User approved"
}
```

### Reject User
**Endpoint:** `PATCH /admin/users/:id/reject`  
**Service:** `adminService.js`  
**Request:**
```json
{
  "reason": "Incomplete documentation"
}
```

### Get Pending Properties
**Endpoint:** `GET /admin/properties/pending`  
**Service:** `adminService.js`  
**Response:**
```json
{
  "properties": [...],
  "count": 3
}
```

### Approve Property
**Endpoint:** `PATCH /admin/properties/:id/approve`  
**Service:** `adminService.js`

### Reject Property
**Endpoint:** `PATCH /admin/properties/:id/reject`  
**Service:** `adminService.js`  
**Request:**
```json
{
  "reason": "Incomplete information"
}
```

### Get Pending Maintenance
**Endpoint:** `GET /admin/maintenance/pending`  
**Service:** `adminService.js`

### Assign Maintenance
**Endpoint:** `PATCH /admin/maintenance/:id/assign`  
**Service:** `adminService.js`  
**Request:**
```json
{
  "assignedTo": 5
}
```

### Get Reports
**Endpoint:** `GET /admin/reports`  
**Service:** `adminService.js`  
**Query Params:** `type`, `start_date`, `end_date`  
**Response:**
```json
{
  "reports": [...],
  "summary": { ... }
}
```

---

## Super Admin APIs

### Get System Stats
**Endpoint:** `GET /super-admin/system/stats/`  
**Service:** `adminService.js`  
**Response:**
```json
{
  "total_users": 1000,
  "total_properties": 500,
  "total_bookings": 200,
  "revenue": 50000,
  ...
}
```

### Get All Users
**Endpoint:** `GET /super-admin/users/`  
**Service:** `adminService.js`  
**Query Params:** `role`, `status`, `page`, `page_size`  
**Response:**
```json
{
  "users": [...],
  "count": 1000
}
```

### Create User
**Endpoint:** `POST /super-admin/users/create/`  
**Service:** `adminService.js`  
**Request:**
```json
{
  "full_name": "John Doe",
  "email": "john@example.com",
  "role": "admin",
  "permissions": { ... }
}
```

### Delete User
**Endpoint:** `DELETE /super-admin/users/:userId/`  
**Service:** `adminService.js`

### Get Audit Logs
**Endpoint:** `GET /super-admin/audit/`  
**Service:** `adminService.js`  
**Query Params:** `action_type`, `user_id`, `start_date`, `end_date`, `page`, `page_size`  
**Response:**
```json
{
  "results": [...],
  "count": 500
}
```

### Assign Role with Permissions
**Endpoint:** `POST /super-admin/users/:userId/roles`  
**Service:** `adminService.js`  
**Request:**
```json
{
  "role": "admin",
  "permissions": {
    "canApproveUsers": true,
    "canApproveProperties": true,
    "canViewReports": true,
    ...
  }
}
}
```

### Update User Role
**Endpoint:** `PUT /super-admin/roles/:userId/`  
**Service:** `adminService.js`  
**Request:**
```json
{
  "role": "admin"
}
```

---

## Marketing APIs

### Send Marketing Email
**Endpoint:** `POST /admin/marketing/email/`  
**Service:** `marketingService.js`  
**Request:**
```json
{
  "subject": "Campaign Subject",
  "message": "Email message content",
  "user_ids": [1, 2, 3]
}
```
**Response:**
```json
{
  "success": true,
  "sent_to": 3,
  "message": "Email sent successfully"
}
```

### Send Marketing SMS
**Endpoint:** `POST /admin/marketing/sms/`  
**Service:** `marketingService.js`  
**Request:**
```json
{
  "message": "SMS message (max 160 characters)",
  "user_ids": [1, 2, 3]
}
```
**Response:**
```json
{
  "success": true,
  "sent_to": 3,
  "message": "SMS sent successfully"
}
```

### Get Campaign History
**Endpoint:** `GET /admin/marketing/history/`  
**Service:** `marketingService.js`  
**Response:**
```json
{
  "results": [
    {
      "id": 1,
      "type": "email",
      "subject": "Campaign Subject",
      "sent_to": 150,
      "created_at": "2026-01-15T10:00:00Z"
    }
  ],
  "count": 1
}
```

---

## Ads APIs

### Get Ads
**Endpoint:** `GET /ads/`  
**Service:** `adsService.js`  
**Query Params:** `placement`, `ad_type`, `target_roles`, `is_active`  
**Response:**
```json
{
  "results": [...],
  "count": 10
}
```

### Get Ad by ID
**Endpoint:** `GET /ads/:id/`  
**Service:** `adsService.js`

### Create Ad
**Endpoint:** `POST /ads/create/`  
**Service:** `adsService.js`  
**Request:** `FormData` (multipart/form-data)
- `title`, `description`, `image`, `placement`, `ad_type`, `target_roles[]`, `budget`, `duration_days`

### Update Ad
**Endpoint:** `PATCH /ads/:id/`  
**Service:** `adsService.js`  
**Request:** `FormData` (multipart/form-data)

### Delete Ad
**Endpoint:** `DELETE /ads/:id/`  
**Service:** `adsService.js`

### Track Ad Click
**Endpoint:** `POST /ads/:id/click/`  
**Service:** `adsService.js`

### Track Ad View
**Endpoint:** `POST /ads/:id/view/`  
**Service:** `adsService.js`

---

## Announcement APIs

### Get Announcements
**Endpoint:** `GET /announcements/`  
**Service:** `announcementService.js`  
**Response:**
```json
{
  "announcements": [
    {
      "id": 1,
      "title": "System Maintenance",
      "message": "Scheduled maintenance on...",
      "severity": "info",
      "is_active": true,
      "created_at": "2026-01-15T10:00:00Z"
    }
  ]
}
```

### Create Announcement (Super Admin)
**Endpoint:** `POST /super-admin/announcements/`  
**Service:** `adminAnnouncementService.js`  
**Request:**
```json
{
  "title": "Announcement Title",
  "message": "Announcement message",
  "severity": "info",
  "target_roles": ["tenant", "landlord"]
}
```

### Delete Announcement
**Endpoint:** `DELETE /super-admin/announcements/:id/`  
**Service:** `adminAnnouncementService.js`

### Get All Announcements (Super Admin)
**Endpoint:** `GET /super-admin/announcements/`  
**Service:** `adminAnnouncementService.js`

---

## Analytics APIs

### Get Dashboard Analytics
**Endpoint:** `GET /analytics/dashboard/`  
**Service:** `analyticsService.js`  
**Response:**
```json
{
  "revenue": 50000,
  "bookings": 200,
  "properties": 500,
  "trends": [...]
}
```

### Get Property Analytics
**Endpoint:** `GET /analytics/property/:propertyId/`  
**Service:** `analyticsService.js`

### Get Revenue Analytics
**Endpoint:** `GET /analytics/revenue/`  
**Service:** `analyticsService.js`  
**Query Params:** `start_date`, `end_date`, `group_by`

### Get Admin Analytics
**Endpoint:** `GET /analytics/admin/`  
**Service:** `analyticsService.js`

---

## Preferences APIs

### Get Preferences
**Endpoint:** `GET /auth/preferences/`  
**Service:** `preferencesService.js`  
**Response:**
```json
{
  "emailNotifications": true,
  "smsNotifications": false,
  "twoFactorAuth": false,
  "profileVisibility": "public",
  "marketingEmails": true,
  "dataSharing": false,
  "language": "en"
}
```

### Update Preferences
**Endpoint:** `PATCH /auth/preferences/`  
**Service:** `preferencesService.js`  
**Request:** (Partial updates supported)
```json
{
  "emailNotifications": false,
  "language": "fr"
}
```

---

## Tenant-Specific APIs

### Get Favorites
**Endpoint:** `GET /tenant/favorites`  
**Service:** `tenantService.js`  
**Response:**
```json
{
  "favorites": [...]
}
```

### Add to Favorites
**Endpoint:** `POST /tenant/favorites`  
**Service:** `tenantService.js`  
**Request:**
```json
{
  "propertyId": 1
}
```

### Remove from Favorites
**Endpoint:** `DELETE /tenant/favorites/:propertyId`  
**Service:** `tenantService.js`

### Check Favorite Status
**Endpoint:** `GET /tenant/favorites/:propertyId/check`  
**Service:** `tenantService.js`  
**Response:**
```json
{
  "is_favorited": true
}
```

### Get Maintenance Requests
**Endpoint:** `GET /tenant/maintenance`  
**Service:** `tenantService.js`

### Create Maintenance Request
**Endpoint:** `POST /tenant/maintenance`  
**Service:** `tenantService.js`  
**Request:** `FormData` (multipart/form-data)
- `property_id`, `title`, `description`, `priority`, `images[]`

### Get Maintenance Request
**Endpoint:** `GET /tenant/maintenance/:requestId`  
**Service:** `tenantService.js`

### Update Maintenance Request
**Endpoint:** `PATCH /tenant/maintenance/:requestId`  
**Service:** `tenantService.js`  
**Request:** `FormData` (multipart/form-data)

### Get Payments
**Endpoint:** `GET /tenant/payments`  
**Service:** `tenantService.js`

### Get Payment Receipt
**Endpoint:** `GET /tenant/payments/:paymentId/receipt`  
**Service:** `tenantService.js`  
**Response:** PDF file

### Get Rental History
**Endpoint:** `GET /tenant/rental-history`  
**Service:** `tenantService.js`

### Generate Payment Reference
**Endpoint:** `POST /tenant/rentals/:rentalId/reference`  
**Service:** `tenantService.js`

---

## Artisan-Specific APIs

### Get Artisan Bookings
**Endpoint:** `GET /artisan/bookings`  
**Service:** `artisanService.js`

### Get Artisan Tasks
**Endpoint:** `GET /artisan/tasks`  
**Service:** `artisanService.js`  
**Query Params:** `status`, `priority`

### Get Earnings Summary
**Endpoint:** `GET /artisan/earnings`  
**Service:** `artisanService.js`  
**Response:**
```json
{
  "totalEarnings": 5000,
  "pendingEarnings": 500,
  "completedJobs": 20
}
```

---

## Common Response Formats

### Success Response
```json
{
  "success": true,
  "data": { ... },
  "message": "Operation successful"
}
```

### Error Response
```json
{
  "success": false,
  "error": "Error message",
  "detail": "Detailed error description",
  "field_errors": {
    "field_name": ["Error message"]
  }
}
```

### Paginated Response
```json
{
  "results": [...],
  "count": 100,
  "next": "http://api.example.com/endpoint/?page=2",
  "previous": null,
  "page": 1,
  "page_size": 20
}
```

---

## Authentication

All authenticated endpoints require a JWT token in the Authorization header:
```
Authorization: Bearer <jwt_token>
```

Tokens are automatically injected by `apiClient.js` from session storage.

---

## Error Codes

- `400` - Bad Request (validation errors)
- `401` - Unauthorized (authentication required)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found
- `500` - Internal Server Error

---

## Rate Limiting

API endpoints may have rate limiting. Check response headers:
- `X-RateLimit-Limit`: Maximum requests per window
- `X-RateLimit-Remaining`: Remaining requests
- `X-RateLimit-Reset`: Reset time

---

**Last Updated:** January 15, 2026  
**For:** Backend Development Team  
**Status:** ✅ Complete API Reference

