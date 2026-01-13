# RentalConnects Frontend Documentation

**Version:** 1.0.0  
**Date:** January 20, 2026  
**Status:** Production-Ready  
**Last Updated:** January 20, 2026

---

## Table of Contents

1. [Overview](#overview)
2. [Architecture](#architecture)
3. [Technology Stack](#technology-stack)
4. [Project Structure](#project-structure)
5. [Authentication & Authorization](#authentication--authorization)
6. [Security Implementation](#security-implementation)
7. [State Management](#state-management)
8. [Routing & Navigation](#routing--navigation)
9. [API Integration](#api-integration)
10. [Role-Based Access Control](#role-based-access-control)
11. [Feature Gating & Subscriptions](#feature-gating--subscriptions)
12. [Error Handling](#error-handling)
13. [Development Setup](#development-setup)
14. [Build & Deployment](#build--deployment)
15. [Testing](#testing)
16. [Production Readiness](#production-readiness)

---

## Overview

RentalConnects is a modern, scalable rental management platform built specifically for Ghana's housing market. The frontend is a Single Page Application (SPA) that connects Tenants, Landlords, Artisans, Admins, and Super Admins in one secure, well-structured platform.

### Key Features

- Role-based authentication and authorization
- Property management with approval workflows
- Secure messaging with end-to-end encryption
- Wallet system with Paystack integration
- Reviews and ratings system
- Real-time notifications
- Multi-language support (English, French)
- Dark/Light theme support
- Progressive Web App (PWA) capabilities

---

## Architecture

### Application Type

Single Page Application (SPA) built with React 19 and Vite 7.

### Design Patterns

- **Component-Based Architecture:** Reusable UI components
- **Container/Presentational Pattern:** Separation of logic and presentation
- **Custom Hooks:** Reusable business logic
- **Context API:** Global state for theme, language, feature access
- **Zustand Stores:** Persistent state management for auth and features

### Data Flow

1. User interactions trigger component events
2. Events call service functions
3. Services make API calls via `apiClient`
4. API responses update Zustand stores
5. Store updates trigger component re-renders
6. UI reflects new state

---

## Technology Stack

### Core Technologies

| Category | Technology | Version | Purpose |
|----------|-----------|---------|---------|
| Framework | React | 19.2.0 | UI library |
| Build Tool | Vite | 7.x | Development server and build |
| Styling | Tailwind CSS | 3.x | Utility-first CSS |
| State Management | Zustand | 4.x | Global state with persistence |
| Routing | React Router | v7 | Client-side routing |
| HTTP Client | Axios | 1.x | API communication |
| Forms | React Hook Form | 7.x | Form management |
| Validation | Zod | 3.x | Schema validation |
| Animations | Framer Motion | 11.x | UI animations |
| Charts | Recharts | 2.x | Data visualization |
| Rich Text | TinyMCE | 8.x | WYSIWYG editor |
| Maps | OpenLayers | 9.x | Interactive maps |
| Encryption | CryptoJS | 4.x | AES-256 encryption for chat |
| Sanitization | DOMPurify | 3.x | XSS protection |
| i18n | react-i18next | 15.x | Internationalization |
| Payments | Paystack | Inline JS | Payment processing |
| File Uploads | Cloudinary | API | Image/document storage |

### Development Tools

- **Testing:** Vitest + Testing Library
- **Linting:** ESLint
- **Code Formatting:** Prettier (via ESLint)
- **Type Checking:** Not applicable (JavaScript project)

---

## Project Structure

```
src/
├── main.jsx                          # Application entry point
├── App.jsx                           # Root component with routing
├── index.css                         # Global styles

├── routes/
│   ├── secureRoutes.jsx              # Authenticated route definitions
│   ├── RoleProtectedRoute.jsx        # Role-based route guard
│   ├── FeatureProtectedRoute.jsx     # Premium feature gate
│   └── PublicRoute.jsx               # Guest-only routes

├── stores/
│   ├── authStore.js                  # Authentication state (Zustand)
│   └── featureStore.js               # Subscription/feature state (Zustand)

├── context/
│   ├── AuthProvider.jsx               # Legacy auth context (deprecated)
│   ├── FeatureAccessContext.jsx      # Feature access provider
│   ├── LanguageContext.jsx           # Language switching
│   └── ThemeContext.jsx              # Dark/light mode

├── services/
│   ├── apiClient.js                  # Axios instance with interceptors
│   ├── authService.js                # Authentication API calls
│   ├── propertyService.js            # Property CRUD operations
│   ├── landlordService.js            # Landlord-specific operations
│   ├── tenantService.js              # Tenant-specific operations
│   ├── artisanService.js             # Artisan operations
│   ├── adminService.js               # Admin operations
│   ├── walletService.js              # Wallet operations
│   ├── paystackService.js            # Paystack integration
│   ├── messagesService.js            # Messaging/chat
│   ├── reviewService.js              # Ratings & reviews
│   ├── announcementService.js        # Announcements
│   └── [other services...]

├── components/
│   ├── layout/
│   │   ├── DashboardLayout.jsx       # Main dashboard layout
│   │   ├── Sidebar.jsx                # Navigation sidebar
│   │   └── Navbar.jsx                 # Top navigation bar
│   │
│   ├── common/
│   │   ├── WalletDisplay.jsx          # Wallet balance display
│   │   ├── WalletSetupModal.jsx      # Wallet setup modal
│   │   ├── WalletTopUpModal.jsx       # Wallet top-up modal
│   │   ├── PremiumUpgradeModal.jsx    # Premium upgrade modal
│   │   └── [other common components...]
│   │
│   ├── ui/
│   │   ├── Button.jsx                 # Reusable button component
│   │   ├── Card.jsx                   # Card component
│   │   └── [other UI components...]
│   │
│   └── [role-specific components...]

├── pages/
│   ├── Landing/
│   │   ├── LandingPage.jsx            # Homepage
│   │   └── PublicProperties.jsx       # Public property listings
│   │
│   ├── Auth/
│   │   ├── Login.jsx                  # Login page
│   │   ├── Signup.jsx                 # Registration page
│   │   ├── ForgotPassword.jsx         # Password reset request
│   │   └── ResetPassword.jsx          # Password reset form
│   │
│   ├── Dashboards/
│   │   ├── Tenant/                    # Tenant dashboard pages
│   │   ├── Landlord/                  # Landlord dashboard pages
│   │   ├── Artisan/                   # Artisan dashboard pages
│   │   ├── Admin/                     # Admin dashboard pages
│   │   └── SuperAdmin/                # Super Admin dashboard pages
│   │
│   └── [other pages...]

├── utils/
│   ├── session.js                     # Session management utilities
│   ├── sanitize.js                    # DOMPurify sanitization
│   ├── validateParams.js              # URL parameter validation
│   ├── encryption.js                  # CryptoJS encryption utilities
│   ├── translations.js                # i18n translation keys
│   └── [other utilities...]

├── config/
│   └── apiEndpoints.js                # Centralized API endpoint configuration

└── public/
    ├── manifest.json                  # PWA manifest
    ├── sw.js                          # Service worker
    └── [PWA icons...]
```

---

## Authentication & Authorization

### Authentication Flow

1. User submits credentials via login form
2. Frontend sends POST request to `/api/auth/login/`
3. Backend validates credentials and returns JWT tokens
4. Frontend receives response:
   ```json
   {
     "access": "eyJ0eXAiOiJKV1QiLCJhbGc...",
     "refresh": "eyJ0eXAiOiJKV1QiLCJhbGc...",
     "user": {
       "id": 1,
       "email": "user@example.com",
       "full_name": "John Doe",
       "role": "tenant",
       "subscription": "free",
       ...
     }
   }
   ```
5. Tokens stored in `localStorage` via `session.js`
6. User data stored in Zustand `authStore`
7. User redirected to role-specific dashboard

### Token Management

#### Token Storage

- **Access Token:** `localStorage.getItem("token")`
- **Refresh Token:** `localStorage.getItem("refreshToken")`
- **User Data:** `localStorage.getItem("user")` (JSON stringified)

**Security Note:** Tokens are stored in `localStorage`, which is vulnerable to XSS attacks. This is mitigated by:
- Content Security Policy (CSP) headers
- DOMPurify sanitization for all user-generated content
- Automatic token refresh mechanism
- Token expiration validation

#### Automatic Token Refresh

Implemented in `src/services/apiClient.js`:

1. API request returns 401 Unauthorized
2. Interceptor checks for refresh token
3. Attempts to refresh access token via `/api/auth/refresh/`
4. If successful, retries original request with new token
5. If refresh fails, clears session and redirects to login
6. Prevents infinite retry loops with `_retry` flag

**Code Pattern:**
```javascript
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      const refreshToken = session.getRefreshToken();
      if (refreshToken && !error.config._retry) {
        error.config._retry = true;
        try {
          const refreshResponse = await refreshAxios.post(
            API_ENDPOINTS.AUTH.REFRESH,
            { refresh: refreshToken }
          );
          session.setToken(refreshResponse.data.access);
          error.config.headers.Authorization = `Bearer ${refreshResponse.data.access}`;
          return apiClient(error.config);
        } catch (refreshError) {
          session.clearAll();
          window.location.href = '/login';
        }
      }
    }
    return Promise.reject(error);
  }
);
```

#### Token Expiration Validation

Implemented in `src/routes/RoleProtectedRoute.jsx`:

1. On component mount, validates token expiration
2. Checks JWT `exp` claim against current time
3. If expired, logs out user and redirects to login
4. Sets up periodic validation (every 60 seconds)
5. Cleans up interval on component unmount

**Code Pattern:**
```javascript
useEffect(() => {
  const checkToken = () => {
    const token = session.getToken();
    if (token && isTokenExpired(token)) {
      logout();
      navigate('/login?session=expired');
    }
  };
  checkToken();
  const interval = setInterval(checkToken, 60000);
  return () => clearInterval(interval);
}, [logout, navigate]);
```

### Signup Flow

1. User selects role (Tenant, Landlord, Artisan)
2. Fills out role-specific signup form
3. Uploads required documents (if applicable)
4. Submits form to `/api/auth/signup/{role}/`
5. Backend creates user with `status: "pending"` (for Landlord/Artisan)
6. Frontend receives same response format as login
7. User redirected based on role and approval status

**Backend Response Format:**
- Same as login: `{ access, refresh, user }`
- User object includes `status` field: `"pending"`, `"approved"`, `"rejected"`, `"suspended"`

---

## Security Implementation

### XSS Protection

All user-generated HTML content is sanitized using DOMPurify before rendering with `dangerouslySetInnerHTML`.

#### Implementation

**Utility:** `src/utils/sanitize.js`

```javascript
import DOMPurify from 'dompurify';

export const sanitizeHtml = (html, options = {}) => {
  if (typeof window === 'undefined' || !html) {
    return html || '';
  }
  try {
    const defaultOptions = {
      ALLOWED_TAGS: ['p', 'br', 'strong', 'em', 'u', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'ul', 'ol', 'li', 'a', 'img'],
      ALLOWED_ATTR: ['href', 'src', 'alt', 'title', 'class'],
      ALLOW_DATA_ATTR: false
    };
    const config = { ...defaultOptions, ...options };
    return DOMPurify.sanitize(html, config);
  } catch (error) {
    console.error('[sanitizeHtml] Error sanitizing HTML:', error);
    return '';
  }
};

export const sanitizeBlogContentSync = (html) => {
  return sanitizeHtml(html, {
    ALLOWED_TAGS: ['p', 'br', 'strong', 'em', 'u', 'h1', 'h2', 'h3', 'ul', 'ol', 'li', 'a', 'img'],
    ALLOWED_ATTR: ['href', 'src', 'alt', 'title']
  });
};

export const sanitizeLeaseContentSync = (html) => {
  return sanitizeHtml(html, {
    ALLOWED_TAGS: ['p', 'br', 'strong', 'em', 'u', 'h1', 'h2', 'h3', 'h4', 'ul', 'ol', 'li', 'table', 'tr', 'td', 'th'],
    ALLOWED_ATTR: ['class', 'colspan', 'rowspan']
  });
};
```

#### Usage

**Blog Posts:** `src/pages/BlogPost.jsx`
```javascript
import { sanitizeBlogContentSync } from '@/utils/sanitize';

<div
  className="prose prose-lg max-w-none"
  dangerouslySetInnerHTML={{
    __html: sanitizeBlogContentSync(post.content || '')
  }}
/>
```

**Lease Previews:** `src/components/lease/CustomizeLeaseModal.jsx`
```javascript
import { sanitizeLeaseContentSync } from '@/utils/sanitize';

<div
  className="bg-white rounded-lg p-4"
  dangerouslySetInnerHTML={{
    __html: sanitizeLeaseContentSync(previewHtml || '')
  }}
/>
```

### URL Parameter Validation

URL parameters are validated to prevent injection attacks.

#### Implementation

**Utility:** `src/utils/validateParams.js`

```javascript
export const validateNumericId = (id, min = 1, max = Number.MAX_SAFE_INTEGER) => {
  if (!id) return null;
  const numId = parseInt(id, 10);
  if (isNaN(numId) || numId < min || numId > max) return null;
  return numId;
};

export const validateUUID = (id) => {
  if (!id) return null;
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(id) ? id : null;
};

export const validateId = (id) => {
  return validateNumericId(id) || validateUUID(id);
};
```

#### Usage

```javascript
import { validateId } from '@/utils/validateParams';
import { useParams, useNavigate } from 'react-router-dom';

const { id: rawId } = useParams();
const navigate = useNavigate();
const id = validateId(rawId);

useEffect(() => {
  if (!id) {
    toast.error('Invalid ID provided.');
    navigate('/error');
    return;
  }
  loadData(id);
}, [id, navigate]);
```

### Content Security Policy

CSP headers configured in `index.html` to prevent XSS attacks:

```html
<meta http-equiv="Content-Security-Policy" content="
  default-src 'self';
  script-src 'self' 'unsafe-inline' 'unsafe-eval' https://js.paystack.co https://*.paystack.com https://cdn.tiny.cloud;
  style-src 'self' 'unsafe-inline' https://paystack.com https://*.paystack.com;
  img-src 'self' data: https: blob:;
  font-src 'self' data:;
  connect-src 'self' https://api.paystack.co https://*.cloudinary.com https://nominatim.openstreetmap.org;
  frame-src 'self' https://js.paystack.co;
">
```

---

## State Management

### Zustand Stores

#### Auth Store (`src/stores/authStore.js`)

Manages authentication state with persistence to `localStorage`.

**State:**
- `user`: Current user object
- `token`: Access token
- `refreshToken`: Refresh token
- `loading`: Loading state
- `isAuthenticated`: Boolean flag

**Actions:**
- `login(user, token, refreshToken)`: Set user and tokens
- `logout()`: Clear all auth state
- `updateUser(user)`: Update user object
- `loadSession()`: Load from localStorage on app start

**Persistence:**
- Automatically persists to `localStorage`
- Restored on application reload

#### Feature Store (`src/stores/featureStore.js`)

Manages subscription and feature access state.

**State:**
- `subscription`: Current subscription tier (`"free"` or `"premium"`)
- `features`: Available features based on subscription

**Actions:**
- `setSubscription(tier)`: Update subscription tier
- `hasFeature(featureName)`: Check if feature is available

### Context Providers

#### Feature Access Context (`src/context/FeatureAccessContext.jsx`)

Provides feature access checks based on subscription.

**Usage:**
```javascript
import { useFeatureAccess } from '@/context/FeatureAccessContext';

const { hasFeature } = useFeatureAccess();
if (hasFeature('analytics')) {
  // Show premium feature
}
```

#### Theme Context (`src/context/ThemeContext.jsx`)

Manages dark/light theme with persistence.

#### Language Context (`src/context/LanguageContext.jsx`)

Manages language switching (English/French) with persistence.

---

## Routing & Navigation

### Route Structure

**Public Routes:**
- `/` - Landing page
- `/login` - Login page
- `/signup` - Role selection
- `/signup/tenant` - Tenant signup
- `/signup/landlord` - Landlord signup
- `/signup/artisan` - Artisan signup
- `/forgot-password` - Password reset request
- `/reset-password/:token` - Password reset form
- `/properties` - Public property listings
- `/properties/:id` - Property detail page

**Protected Routes (require authentication):**
- `/tenant/*` - Tenant dashboard routes
- `/landlord/*` - Landlord dashboard routes
- `/artisan/*` - Artisan dashboard routes
- `/admin/*` - Admin dashboard routes
- `/super-admin/*` - Super Admin dashboard routes
- `/profile` - User profile (all roles)
- `/messages` - Messaging interface (all roles)

### Route Protection

#### Role-Protected Routes

**Component:** `src/routes/RoleProtectedRoute.jsx`

Validates user role before allowing access.

**Usage:**
```javascript
<Route
  path="/admin/*"
  element={
    <RoleProtectedRoute allowedRoles={['admin', 'super_admin']} fallback="/">
      <AdminRoutes />
    </RoleProtectedRoute>
  }
/>
```

**Behavior:**
1. Checks if user is authenticated
2. Validates token expiration
3. Checks if user role is in `allowedRoles` array
4. Redirects to `fallback` if unauthorized
5. Renders children if authorized

#### Feature-Protected Routes

**Component:** `src/routes/FeatureProtectedRoute.jsx`

Restricts access to premium features.

**Usage:**
```javascript
<Route
  path="/landlord/analytics"
  element={
    <FeatureProtectedRoute feature="analytics" fallback="/landlord">
      <AnalyticsPage />
    </FeatureProtectedRoute>
  }
/>
```

---

## API Integration

### API Client

**File:** `src/services/apiClient.js`

Centralized Axios instance with interceptors for:
- Token injection
- Automatic token refresh
- Error handling
- Request/response logging (development only)

**Base URL Configuration:**
- Development: `http://localhost:8000/api`
- Production: `VITE_API_BASE_URL` environment variable

### API Endpoints Configuration

**File:** `src/config/apiEndpoints.js`

Centralized endpoint definitions organized by feature:

```javascript
export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/auth/login/',
    SIGNUP: {
      TENANT: '/auth/signup/tenant/',
      LANDLORD: '/auth/signup/landlord/',
      ARTISAN: '/auth/signup/artisan/'
    },
    REFRESH: '/auth/refresh/',
    PROFILE: '/auth/profile/',
    FORGOT_PASSWORD: '/auth/forgot-password/',
    RESET_PASSWORD: (token) => `/auth/reset-password/${token}/`
  },
  PROPERTIES: {
    BASE: '/properties/',
    BY_ID: (id) => `/properties/${id}/`,
    SEARCH: '/properties/search/'
  },
  // ... more endpoints
};
```

### Request/Response Format

**Standard Request Headers:**
```
Authorization: Bearer <access_token>
Content-Type: application/json
```

**Standard Response Format:**
```json
{
  "data": { ... },
  "message": "Success message",
  "status": "success"
}
```

**Error Response Format:**
```json
{
  "error": "Error message",
  "detail": "Detailed error information",
  "status": "error"
}
```

### Error Handling

**HTTP Status Codes:**
- `200` - Success
- `201` - Created
- `400` - Bad Request (validation errors)
- `401` - Unauthorized (triggers token refresh)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found
- `500` - Internal Server Error

**Error Handling Pattern:**
```javascript
try {
  const response = await apiClient.get(API_ENDPOINTS.PROPERTIES.BASE);
  return response.data;
} catch (error) {
  if (error.response?.status === 401) {
    // Handled by interceptor
    throw error;
  } else if (error.response?.status === 403) {
    toast.error('You do not have permission to access this resource.');
  } else if (error.response?.status === 404) {
    toast.error('Resource not found.');
  } else {
    toast.error('An error occurred. Please try again.');
  }
  throw error;
}
```

---

## Role-Based Access Control

### User Roles

1. **Tenant** - Property seekers and renters
2. **Landlord** - Property owners and managers
3. **Artisan** - Service providers (plumbers, electricians, etc.)
4. **Admin** - Platform moderators with delegated permissions
5. **Super Admin** - Platform administrators with full system access

### Role Permissions

#### Tenant
- Browse and search properties
- Book property viewings
- Manage rental applications
- Submit reviews and ratings
- Send messages to landlords/artisans
- Manage profile and preferences

#### Landlord
- Create and manage property listings
- Approve/reject viewing requests
- Manage bookings and tenants
- Receive payments via wallet
- View analytics (premium feature)
- Send messages to tenants/artisans
- Manage profile and business information

#### Artisan
- Manage service profile
- Accept/reject service requests
- Track earnings via wallet
- Send messages to clients
- Manage profile and certifications

#### Admin
- Approve/reject user registrations
- Approve/reject property listings
- View system reports
- Manage announcements
- Send messages to all users
- Permissions delegated by Super Admin

#### Super Admin
- All Admin permissions
- Create and manage Admin accounts
- Delegate permissions to Admins
- View system-wide analytics
- Manage system settings
- Access audit logs

### Permission Checks

**Component-Level:**
```javascript
const { user } = useAuthStore();
if (user?.role === 'admin' || user?.role === 'super_admin') {
  // Show admin feature
}
```

**Route-Level:**
```javascript
<RoleProtectedRoute allowedRoles={['admin', 'super_admin']}>
  <AdminComponent />
</RoleProtectedRoute>
```

**Backend Validation:**
All protected endpoints validate user role and permissions on the backend. Frontend checks are for UX only and do not provide security.

---

## Feature Gating & Subscriptions

### Subscription Tiers

1. **Free** - Default tier for all new signups
2. **Premium** - Paid tier with additional features

### Premium Features

- Advanced analytics and reporting
- Priority property listings
- Enhanced messaging features
- Extended storage limits
- Custom branding options

### Feature Gating Implementation

**Store Check:**
```javascript
const { subscription } = useFeatureStore();
if (subscription === 'premium') {
  // Show premium feature
}
```

**Context Hook:**
```javascript
const { hasFeature } = useFeatureAccess();
if (hasFeature('analytics')) {
  // Show premium feature
}
```

**Route Protection:**
```javascript
<FeatureProtectedRoute feature="analytics">
  <AnalyticsPage />
</FeatureProtectedRoute>
```

### Subscription Management

**Upgrade Flow:**
1. User clicks "Upgrade to Premium" button
2. Modal displays pricing options (monthly/yearly)
3. User selects plan and initiates Paystack payment
4. Payment processed via Paystack
5. Backend updates user subscription
6. Frontend refreshes user data
7. Premium features become available

**Default Subscription:**
- All new signups default to `"free"` subscription
- Backend sets `subscription: "free"` on user creation
- Frontend `authStore` defaults to `"free"` if not provided

---

## Error Handling

### Global Error Handling

**API Interceptor:**
- Catches all API errors
- Handles 401 (automatic refresh)
- Displays user-friendly error messages
- Logs errors for debugging

**Error Boundaries:**
- React Error Boundaries catch component errors
- Display fallback UI instead of crashing
- Log errors for monitoring

### User-Facing Errors

**Toast Notifications:**
- Success: Green toast
- Error: Red toast
- Warning: Yellow toast
- Info: Blue toast

**Error Messages:**
- Clear, actionable messages
- No technical jargon
- Suggest next steps when possible

### Development Error Handling

**Console Logging:**
- Detailed error information in development
- Stack traces for debugging
- API request/response logging

**Production Error Handling:**
- Minimal error exposure
- Generic messages for users
- Detailed errors logged server-side

---

## Development Setup

### Prerequisites

- Node.js 18+ and npm/yarn
- Git
- Code editor (VS Code recommended)

### Installation

```bash
# Clone the repository
git clone https://github.com/e-mond/RC.git
cd RC

# Install dependencies
npm install

# Create .env file
cp .env.example .env
```

### Environment Variables

Create a `.env` file in the root directory:

```env
# API Configuration
VITE_API_BASE_URL=http://localhost:8000/api
VITE_USE_MOCK=false

# Paystack (for payments)
VITE_PAYSTACK_PUBLIC_KEY=pk_test_your_key_here

# Cloudinary (for file uploads)
VITE_CLOUDINARY_CLOUD_NAME=your_cloud_name
VITE_CLOUDINARY_UPLOAD_PRESET=your_preset

# Feature Flags
VITE_ENABLE_PWA=true
```

### Development Server

```bash
# Start development server
npm run dev

# Open http://localhost:5173
```

### Available Scripts

```bash
# Development
npm run dev              # Start dev server
npm run build           # Production build
npm run preview         # Preview production build

# Testing
npm test                # Run tests
npm test -- --watch     # Watch mode
npm test -- --coverage  # With coverage

# Code Quality
npm run lint            # Run ESLint
npm run lint:fix        # Fix linting errors
```

---

## Build & Deployment

### Production Build

```bash
# Build for production
npm run build

# Output: dist/ directory
```

### Build Output

- Optimized JavaScript bundles
- Minified CSS
- Compressed assets
- Source maps (for debugging)

### Deployment

**Recommended Platform:** Vercel

**Steps:**
1. Connect repository to Vercel
2. Configure environment variables
3. Set build command: `npm run build`
4. Set output directory: `dist`
5. Deploy

### Environment Configuration

**Production Environment Variables:**
- `VITE_API_BASE_URL` - Production API URL
- `VITE_USE_MOCK` - Set to `false`
- `VITE_PAYSTACK_PUBLIC_KEY` - Production Paystack key
- `VITE_CLOUDINARY_CLOUD_NAME` - Production Cloudinary name
- `VITE_CLOUDINARY_UPLOAD_PRESET` - Production preset

---

## Testing

### Test Framework

- **Vitest** - Test runner
- **Testing Library** - Component testing utilities
- **@testing-library/jest-dom** - DOM matchers

### Test Structure

```
src/
├── __tests__/
│   ├── components/
│   ├── pages/
│   ├── services/
│   └── utils/
```

### Running Tests

```bash
# Run all tests
npm test

# Run specific test file
npm test -- sanitize.test.js

# Watch mode
npm test -- --watch

# Coverage
npm test -- --coverage
```

### Test Coverage

**Current Coverage:**
- Security utilities (sanitize, validateParams)
- Store functions (authStore, featureStore)
- Route guards (RoleProtectedRoute)

**Target Coverage:**
- All utility functions
- All service functions
- Critical components
- Route protection logic

---

## Production Readiness

### Security Checklist

- [x] XSS Protection - DOMPurify implemented
- [x] Token Refresh - Automatic refresh on 401
- [x] Token Expiration - Periodic validation (60s)
- [x] URL Validation - Parameter validation utility
- [x] Route Protection - Role-based access control
- [x] API Security - Token injection & error handling
- [x] Content Security Policy - Configured in index.html

### Code Quality

- [x] No linting errors
- [x] No build errors
- [x] All imports resolved
- [x] No console errors in production build
- [x] npm audit clean (0 vulnerabilities)

### Documentation

- [x] Architecture documented
- [x] API contracts documented
- [x] Security implementation documented
- [x] Deployment guide available

### Testing

- [ ] Unit tests executed
- [ ] Integration tests executed
- [ ] Security tests executed
- [ ] All tests passing

### Deployment

- [ ] Staging deployment successful
- [ ] Production deployment successful
- [ ] Monitoring configured
- [ ] Error tracking configured

---

## API Contracts

### Authentication Endpoints

**Login:**
- `POST /api/auth/login/`
- Request: `{ email, password }`
- Response: `{ access, refresh, user }`

**Signup:**
- `POST /api/auth/signup/tenant/`
- `POST /api/auth/signup/landlord/`
- `POST /api/auth/signup/artisan/`
- Request: Role-specific form data
- Response: `{ access, refresh, user }`

**Token Refresh:**
- `POST /api/auth/refresh/`
- Request: `{ refresh: "<refresh_token>" }`
- Response: `{ access, refresh }`

**Profile:**
- `GET /api/auth/profile/`
- Response: `{ user }`

### Property Endpoints

**List Properties:**
- `GET /api/properties/`
- Query params: `?page=1&limit=10&search=...`
- Response: `{ results: [...], count, next, previous }`

**Property Detail:**
- `GET /api/properties/{id}/`
- Response: `{ property }`

**Create Property:**
- `POST /api/landlord/properties/`
- Request: Multipart form data
- Response: `{ property }`

### User Approval Endpoints

**Pending Users:**
- `GET /api/admin/users/pending/`
- Query params: `?role=landlord&page=1`
- Response: `{ results: [...], count }`

**User Detail:**
- `GET /api/admin/users/{id}/`
- Response: `{ user, documents: [...] }`

**Approve User:**
- `PATCH /api/admin/users/{id}/approve/`
- Request: `{ notes: "..." }` (optional)
- Response: `{ user }`

**Reject User:**
- `PATCH /api/admin/users/{id}/reject/`
- Request: `{ reason: "..." }`
- Response: `{ user }`

**Suspend User:**
- `PATCH /api/admin/users/{id}/suspend/`
- Request: `{ reason: "..." }`
- Response: `{ user }`

### Wallet Endpoints

**Get Wallet:**
- `GET /api/wallet/`
- Response: `{ wallet }`

**Setup Wallet:**
- `POST /api/wallet/setup/`
- Request: `{ account_type, account_number, bank_name, ... }`
- Response: `{ wallet }`

**Top Up:**
- `POST /api/wallet/top-up/`
- Request: `{ amount, payment_method }`
- Response: `{ transaction, payment_url }`

### Messaging Endpoints

**Conversations:**
- `GET /api/messages/conversations/`
- Response: `{ conversations: [...] }`

**Messages:**
- `GET /api/messages/conversations/{id}/messages/`
- Response: `{ messages: [...] }`

**Send Message:**
- `POST /api/messages/send/`
- Request: `{ recipient_id, content, encrypted }`
- Response: `{ message }`

---

## Backend Integration Requirements

### Required Backend Features

1. **JWT Authentication**
   - Access token (15-minute expiry)
   - Refresh token (7-day expiry)
   - Token refresh endpoint

2. **User Management**
   - Role-based user creation
   - User approval workflow
   - User suspension
   - Profile management

3. **Property Management**
   - Property CRUD operations
   - Property approval workflow
   - Property search and filtering
   - Image/document uploads

4. **Wallet System**
   - Wallet creation and management
   - Transaction history
   - Payment processing integration

5. **Messaging**
   - Conversation management
   - Message encryption support
   - Real-time message delivery

### Backend Response Formats

All endpoints should return consistent JSON responses:

**Success:**
```json
{
  "data": { ... },
  "message": "Success message",
  "status": "success"
}
```

**Error:**
```json
{
  "error": "Error message",
  "detail": "Detailed error information",
  "status": "error"
}
```

**Pagination:**
```json
{
  "results": [...],
  "count": 100,
  "next": "http://api.example.com/endpoint/?page=2",
  "previous": null
}
```

---

## Troubleshooting

### Common Issues

**Token Refresh Fails:**
- Check refresh token is valid
- Verify backend refresh endpoint is working
- Check network connectivity
- Review browser console for errors

**Route Protection Not Working:**
- Verify user role in authStore
- Check token expiration
- Ensure RoleProtectedRoute is correctly configured
- Review route definitions in secureRoutes.jsx

**XSS Protection Not Working:**
- Verify DOMPurify is installed: `npm list dompurify`
- Check sanitize function is imported correctly
- Ensure dangerouslySetInnerHTML uses sanitized content
- Review browser console for errors

**API Calls Failing:**
- Verify API base URL is correct
- Check CORS configuration on backend
- Review network tab for request details
- Ensure authentication token is valid

---

## Additional Resources

### Documentation Files

- `BACKEND_IMPLEMENTATION_GUIDE.md` - Backend integration guide
- `BACKEND_API_COMPLETE_REFERENCE.md` - Complete API reference
- `SECURITY_FIXES_IMPLEMENTED.md` - Security implementation details
- `SECURITY_TESTING.md` - Security testing guide
- `DEPLOYMENT_GUIDE.md` - Deployment instructions

### External Resources

- [React Documentation](https://react.dev/)
- [Vite Documentation](https://vitejs.dev/)
- [React Router Documentation](https://reactrouter.com/)
- [Zustand Documentation](https://zustand-demo.pmnd.rs/)
- [DOMPurify Documentation](https://github.com/cure53/DOMPurify)
- [Paystack Documentation](https://paystack.com/docs/)

---

**End of Frontend Documentation**
