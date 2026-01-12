# Backend Documentation Guide - RentalConnects

**Version:** 1.0.0  
**Last Updated:** January 11, 2026  
**Purpose:** Guide for backend developers integrating with RentalConnects frontend

---

## Table of Contents

1. [Overview](#overview)
2. [API Contract Requirements](#api-contract-requirements)
3. [Authentication](#authentication)
4. [Complete API Endpoints Reference](#complete-api-endpoints-reference)
5. [Request/Response Formats](#requestresponse-formats)
6. [Error Handling](#error-handling)
7. [File Uploads](#file-uploads)
8. [Webhooks & Notifications](#webhooks--notifications)
9. [Testing Integration](#testing-integration)
10. [Deployment Considerations](#deployment-considerations)

**Note:** For complete API documentation, see `API_DOCUMENTATION.md` which contains all endpoints used by the frontend.

---

## Overview

This guide provides backend developers with all the information needed to integrate with the RentalConnects frontend. The frontend expects a Django REST Framework backend with specific endpoints, authentication, and response formats.

### Key Requirements

- **Django REST Framework** - Recommended backend framework
- **JWT Authentication** - Token-based auth
- **CORS Enabled** - For frontend domain
- **Trailing Slash Support** - Django-style URLs
- **Pagination** - For list endpoints
- **File Upload Support** - For images and documents

---

## API Contract Requirements

### Base URL

The frontend expects the API base URL to be configurable via environment variable:
```
VITE_API_BASE_URL=http://localhost:8000/api
```

### URL Format

- **Trailing Slashes:** All endpoints should support trailing slashes
- **Consistent Naming:** Use kebab-case for endpoints
- **Versioning:** Optional, but recommended (`/api/v1/`)

### Example Endpoints

```
POST   /api/auth/login/
POST   /api/auth/signup/
GET    /api/properties/
POST   /api/properties/
GET    /api/properties/{id}/
PATCH  /api/properties/{id}/
DELETE /api/properties/{id}/
```

---

## Authentication

### JWT Token Format

The frontend expects JWT tokens in the following format:

**Request Header:**
```
Authorization: Bearer <token>
```

**Token Structure:**
```json
{
  "user_id": 1,
  "email": "user@example.com",
  "role": "landlord",
  "exp": 1234567890
}
```

### Token Endpoints

**Login:**
```
POST /api/auth/login/
Request: { "email": "...", "password": "..." }
Response: { "access": "<jwt_token>", "refresh": "<refresh_token>", "user": {...} }
```

**Refresh:**
```
POST /api/auth/token/refresh/
Request: { "refresh": "<refresh_token>" }
Response: { "access": "<new_jwt_token>" }
```

**Logout:**
```
POST /api/auth/logout/
Request: { "refresh": "<refresh_token>" }
Response: { "message": "Successfully logged out" }
```

---

## Endpoints Reference

### Authentication Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/login/` | User login |
| POST | `/api/auth/signup/` | User registration |
| POST | `/api/auth/logout/` | User logout |
| POST | `/api/auth/token/refresh/` | Refresh JWT token |
| POST | `/api/auth/password/reset/` | Request password reset |
| POST | `/api/auth/password/reset/confirm/` | Confirm password reset |

### Property Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/properties/` | List properties (with filters) |
| POST | `/api/properties/` | Create property |
| GET | `/api/properties/{id}/` | Get property details |
| PATCH | `/api/properties/{id}/` | Update property |
| DELETE | `/api/properties/{id}/` | Delete property |
| POST | `/api/properties/uploads/images/` | Upload property image |

**Property Filters:**
- `city`, `region`, `property_type`, `min_price`, `max_price`, `bedrooms`, `bathrooms`
- `status` (pending, approved, rejected)
- `page`, `page_size` (pagination)

### Wallet Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/wallet/` | Get wallet details |
| POST | `/api/wallet/setup/` | Setup wallet |
| PATCH | `/api/wallet/` | Update wallet |
| POST | `/api/wallet/top-up/` | Top up wallet |
| GET | `/api/wallet/transactions/` | Get transaction history |
| POST | `/api/wallet/transactions/booking/` | Create booking transaction |
| POST | `/api/wallet/transactions/subscription/` | Create subscription transaction |
| POST | `/api/wallet/transactions/ad/` | Create ad promotion transaction |

### Messaging Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/messages/conversations/` | List conversations |
| POST | `/api/messages/conversations/` | Create conversation |
| GET | `/api/messages/conversations/{id}/messages/` | Get messages |
| POST | `/api/messages/send/` | Send message |

### Review Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/reviews/` | List reviews (with filters) |
| POST | `/api/reviews/` | Create review |
| PATCH | `/api/reviews/{id}/` | Update review |
| DELETE | `/api/reviews/{id}/` | Delete review |
| POST | `/api/reviews/{id}/approve/` | Approve review |
| POST | `/api/reviews/{id}/reject/` | Reject review |

### Ad Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/ads/` | List ads |
| POST | `/api/ads/` | Create ad |
| PATCH | `/api/ads/{id}/` | Update ad |
| DELETE | `/api/ads/{id}/` | Delete ad |
| GET | `/api/ads/pricing/` | Get ad pricing (Super Admin) |

### Admin Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/admin/users/` | List users |
| POST | `/api/admin/users/{id}/approve/` | Approve user |
| POST | `/api/admin/users/{id}/suspend/` | Suspend user |
| POST | `/api/admin/users/{id}/assign-role/` | Assign role with permissions |
| GET | `/api/admin/properties/pending/` | Get pending properties |
| POST | `/api/admin/properties/{id}/approve/` | Approve property |
| POST | `/api/admin/properties/{id}/reject/` | Reject property |

---

## Request/Response Formats

### Standard Response Format

**Success Response:**
```json
{
  "data": { ... },
  "message": "Success message (optional)"
}
```

**List Response (Paginated):**
```json
{
  "results": [...],
  "count": 100,
  "next": "http://api.example.com/api/endpoint/?page=2",
  "previous": null
}
```

**Error Response:**
```json
{
  "detail": "Error message",
  "errors": {
    "field_name": ["Error message"]
  }
}
```

### Property Request Example

**Create Property:**
```json
POST /api/properties/
Content-Type: multipart/form-data

{
  "title": "Beautiful Apartment",
  "description": "...",
  "address": "...",
  "city": "...",
  "region": "...",
  "priceGhs": 5000,
  "bedrooms": 2,
  "bathrooms": 1,
  "area_sqm": 80,
  "property_type": "apartment",
  "latitude": 5.6037,
  "longitude": -0.1870,
  "amenity_ids": [1, 2, 3],
  "images": [File, File, ...]
}
```

**Response:**
```json
{
  "id": 1,
  "title": "Beautiful Apartment",
  "status": "pending",
  "landlord": {
    "id": 1,
    "full_name": "John Doe"
  },
  "images": [
    {
      "id": 1,
      "image_url": "https://..."
    }
  ],
  "created_at": "2026-01-11T10:00:00Z"
}
```

---

## Error Handling

### HTTP Status Codes

- **200 OK** - Success
- **201 Created** - Resource created
- **400 Bad Request** - Validation errors
- **401 Unauthorized** - Authentication required
- **403 Forbidden** - Permission denied
- **404 Not Found** - Resource not found
- **500 Internal Server Error** - Server error

### Error Response Format

```json
{
  "detail": "Error message",
  "errors": {
    "field_name": ["Error message 1", "Error message 2"]
  },
  "code": "ERROR_CODE"
}
```

### Frontend Error Handling

The frontend automatically handles:
- 401 errors → Redirect to login
- 403 errors → Show permission denied message
- 404 errors → Show not found message
- 500 errors → Show server error message
- Validation errors → Display field-specific errors

---

## File Uploads

### Image Upload Endpoint

```
POST /api/properties/uploads/images/
Content-Type: multipart/form-data

Form Data:
- file: <image file>
```

**Response:**
```json
{
  "url": "https://cloudinary.com/image.jpg",
  "public_id": "properties/image_123"
}
```

### Cloudinary Integration

The frontend can upload directly to Cloudinary or through backend:
- **Backend Upload:** Recommended for security
- **Direct Upload:** Optional, requires Cloudinary credentials

### Supported Formats

- Images: JPG, PNG, WebP
- Max Size: 5MB per file
- Multiple files supported

---

## Webhooks & Notifications

### Email Notifications

The backend should send emails for:
- Account verification
- Password reset
- Account approval/suspension
- Payment confirmations (with receipts)
- Booking confirmations
- Message notifications

### Webhook Events (Optional)

If implementing webhooks:
- `payment.completed`
- `booking.confirmed`
- `property.approved`
- `user.approved`

---

## Testing Integration

### Mock Mode

The frontend has a full mock mode for testing:
- Set `VITE_USE_MOCK=true`
- All API calls return mock data
- No backend required for frontend development

### Integration Testing

To test with real backend:
1. Start Django backend
2. Set `VITE_USE_MOCK=false`
3. Set `VITE_API_BASE_URL` to backend URL
4. Run frontend: `npm run dev`

### Test Data Requirements

Backend should provide:
- Test users for each role
- Sample properties
- Sample bookings
- Sample reviews

---

## Deployment Considerations

### CORS Configuration

Allow frontend domain:
```python
CORS_ALLOWED_ORIGINS = [
    "https://rentalconnects.com",
    "https://www.rentalconnects.com",
]
```

### Environment Variables

Backend should use:
- `DEBUG=False` in production
- `ALLOWED_HOSTS` configured
- `SECRET_KEY` secure
- Database credentials
- Email service credentials
- Paystack keys
- Cloudinary credentials

### Security

- Use HTTPS in production
- Validate all inputs
- Rate limiting for API endpoints
- SQL injection prevention
- XSS protection

---

## Complete API Endpoints Reference

For a comprehensive list of all API endpoints used by the frontend, see:
- **`API_DOCUMENTATION.md`** - Complete API reference with all endpoints, request/response formats, and examples

The frontend uses the following service files, each containing specific API calls:
- `authService.js` - Authentication endpoints
- `propertyService.js` - Property CRUD operations
- `landlordService.js` - Landlord-specific operations
- `tenantService.js` - Tenant-specific operations
- `artisanService.js` - Artisan operations
- `adminService.js` - Admin operations
- `walletService.js` - Wallet and payment operations
- `paystackService.js` - Paystack payment integration
- `messagesService.js` - Messaging and chat
- `reviewService.js` - Reviews and ratings
- `adsService.js` - Advertisement management
- `announcementService.js` - Announcements
- `marketingService.js` - Marketing campaigns (email/SMS)
- `preferencesService.js` - User preferences
- `userService.js` - User profile operations
- `analyticsService.js` - Analytics and reporting

## Additional Resources

### Frontend Documentation

- **API Documentation:** `API_DOCUMENTATION.md` - Complete API reference
- **API Contracts:** `FRONTEND_API_CONTRACTS.md` - Detailed endpoint specs
- **Complete Documentation:** `COMPLETE_DOCUMENTATION.md` - Full system documentation
- **Changelog:** `FRONTEND_CHANGELOG.md` - Change history
- **Commit Documentation:** `COMMIT_DOCUMENTATION.md` - Latest changes
- **PR Documentation:** `PR_DOCUMENTATION.md` - Pull request details

### Contact

For backend integration questions:
- Review `API_DOCUMENTATION.md` for complete endpoint reference
- Check `FRONTEND_API_CONTRACTS.md` for detailed endpoint specs
- Check frontend service files in `src/services/` for expected formats
- Test with mock mode first, then integrate with real backend

---

## Marketing Campaigns API

### Email Campaigns
**Endpoint:** `POST /admin/marketing/email/`  
**Authentication:** Required (Admin/Super Admin)  
**Request Body:**
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

### SMS Campaigns
**Endpoint:** `POST /admin/marketing/sms/`  
**Authentication:** Required (Admin/Super Admin)  
**Request Body:**
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

### Campaign History
**Endpoint:** `GET /admin/marketing/history/`  
**Authentication:** Required (Admin/Super Admin)  
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

## Account Settings API

### Get Preferences
**Endpoint:** `GET /auth/preferences/`  
**Authentication:** Required  
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
**Authentication:** Required  
**Request Body:** (Partial updates supported)
```json
{
  "emailNotifications": false,
  "language": "fr"
}
```
**Response:** Updated preferences object

---

**Last Updated:** January 15, 2026  
**For:** Backend Development Team  
**Status:** ✅ Ready for Integration

