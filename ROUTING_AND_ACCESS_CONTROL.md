# Routing and Access Control Guide

**Date:** January 2026  
**Status:** Production-Ready  
**Purpose:** Complete guide to routing and access control in RentalConnects frontend

---

## Overview

RentalConnects implements a comprehensive routing and access control system that ensures:
- **Role-based route protection** - Users can only access routes for their role
- **Feature-based access control** - Premium features are gated
- **Permission-based UI rendering** - UI respects backend permissions
- **Security-first approach** - Frontend never assumes permissions

---

## Route Protection Architecture

### Protection Layers

1. **Route Level** - `RoleProtectedRoute` component
2. **Feature Level** - `FeatureProtectedRoute` component
3. **Component Level** - Permission checks in components
4. **Service Level** - Backend validation (always enforced)

---

## Role-Based Route Protection

### RoleProtectedRoute Component

**Location:** `src/routes/RoleProtectedRoute.jsx`

**Functionality:**
- Validates user authentication
- Checks token expiration
- Validates user role against allowed roles
- Redirects unauthorized users
- Handles token refresh on 401

**Usage:**
```javascript
<Route
  path="landlord"
  element={
    <RoleProtectedRoute allowedRoles={["landlord"]}>
      <DashboardLayout />
    </RoleProtectedRoute>
  }
>
  {/* Landlord routes */}
</Route>
```

**Security Features:**
- Token expiration validation (every 60 seconds)
- Automatic logout on expired token
- Role normalization (lowercase comparison)
- Fallback redirect on unauthorized access

---

## Feature-Based Access Control

### FeatureProtectedRoute Component

**Location:** `src/routes/FeatureProtectedRoute.jsx`

**Functionality:**
- Checks subscription plan (free/premium)
- Validates feature access
- Redirects to upgrade page if not premium
- Preserves original path in query string

**Usage:**
```javascript
<Route
  path="analytics"
  element={
    <FeatureProtectedRoute feature="landlord_advanced_analytics">
      <AnalyticsDashboard />
    </FeatureProtectedRoute>
  }
/>
```

**Features:**
- `landlord_advanced_analytics` - Analytics dashboard
- `digital_rent_collection` - Wallet system
- `advertisement_manager` - Ad management
- `tenant_maintenance_tracker` - Maintenance requests

---

## Route Structure

### Public Routes

Accessible to all users (authenticated and unauthenticated):

```
/                           # Landing page
/properties                 # Public property listings
/properties/:id            # Property detail page
/learn-more                # Learn more page
/blog                      # Blog listing
/blog/:slug               # Blog post
/terms                     # Terms of Service
/privacy                   # Privacy Policy
```

### Auth Routes

Guest-only routes (redirect if authenticated):

```
/login                     # Login page
/signup                    # Registration page
/signup-success           # Signup success
/forgot-password          # Password reset request
/reset-password/:token    # Password reset form
```

### Protected Routes

Require authentication (all roles):

```
/profile                   # User profile
/notifications            # Notifications center
/users/:id                # Public user profile
/documentation            # Documentation
```

### Role-Specific Routes

#### Tenant Routes (`/tenant/*`)
- `/tenant` - Dashboard
- `/tenant/properties` - Browse properties
- `/tenant/rentals` - My rentals
- `/tenant/payments` - Payment history
- `/tenant/maintenance` - Maintenance (Premium)
- `/tenant/wishlist` - Wishlist
- `/tenant/leases` - Lease agreements

#### Landlord Routes (`/landlord/*`)
- `/landlord` - Dashboard
- `/landlord/properties` - Property management
- `/landlord/bookings` - Booking requests
- `/landlord/analytics` - Analytics (Premium)
- `/landlord/wallet` - Wallet (Premium)
- `/landlord/ads` - Ad management (Premium)

#### Artisan Routes (`/artisan/*`)
- `/artisan` - Dashboard
- `/artisan/tasks` - Task management
- `/artisan/earnings` - Earnings summary
- `/artisan/ads` - Ad management (Premium)

#### Admin Routes (`/admin/*`)
- `/admin` - Dashboard
- `/admin/approvals` - User/property approvals
- `/admin/reports` - Reports
- `/admin/leases` - Lease management

#### Super Admin Routes (`/super-admin/*`)
- `/super-admin` - Dashboard
- `/super-admin/users` - User management
- `/super-admin/roles` - Role management
- `/super-admin/audit` - Audit logs
- `/super-admin/pricing` - Premium pricing config

---

## Access Control Patterns

### Pattern 1: Route-Level Protection

```javascript
// routes/secureRoutes.jsx
<Route
  path="landlord"
  element={
    <RoleProtectedRoute allowedRoles={["landlord"]}>
      <DashboardLayout />
    </RoleProtectedRoute>
  }
>
  {/* Only landlords can access these routes */}
</Route>
```

### Pattern 2: Feature-Level Protection

```javascript
// routes/secureRoutes.jsx
{
  path: "analytics",
  element: (
    <FeatureProtectedRoute feature="landlord_advanced_analytics">
      <AnalyticsDashboard />
    </FeatureProtectedRoute>
  ),
}
```

### Pattern 3: Component-Level Protection

```javascript
// components/MyComponent.jsx
import { useFeatureAccess } from '@/context/FeatureAccessContext';

function MyComponent() {
  const { can } = useFeatureAccess();
  
  if (!can('landlord_advanced_analytics')) {
    return <UpgradePrompt />;
  }
  
  return <AnalyticsContent />;
}
```

### Pattern 4: Permission-Based Rendering

```javascript
// components/AdminPanel.jsx
import { useAuthStore } from '@/stores/authStore';

function AdminPanel() {
  const { user } = useAuthStore();
  
  // Always check backend permissions, never assume
  if (!user?.permissions?.canApproveUsers) {
    return null; // Don't render if no permission
  }
  
  return <UserApprovalPanel />;
}
```

---

## Security Best Practices

### 1. Never Assume Permissions

```javascript
// ❌ Bad - Assumes permission from role
if (user.role === 'admin') {
  return <AdminPanel />;
}

// ✅ Good - Checks actual permission
if (user?.permissions?.canApproveUsers) {
  return <AdminPanel />;
}
```

### 2. Always Validate on Backend

```javascript
// Frontend can hide UI, but backend must enforce
// Service layer always validates with backend
const approveUser = async (userId) => {
  // Backend will return 403 if user lacks permission
  const response = await apiClient.post(`/admin/users/${userId}/approve/`);
  return response.data;
};
```

### 3. Handle 403 Errors Gracefully

```javascript
// apiClient.js automatically shows toast on 403
// Components should handle gracefully
try {
  await approveUser(userId);
} catch (error) {
  if (error.response?.status === 403) {
    // Permission denied - toast already shown by apiClient
    // Component can show additional UI if needed
  }
}
```

### 4. Token Expiration Handling

```javascript
// RoleProtectedRoute automatically handles token expiration
// Components should handle 401 errors gracefully
try {
  await fetchData();
} catch (error) {
  if (error.response?.status === 401) {
    // Token expired - apiClient will attempt refresh
    // If refresh fails, user will be logged out automatically
  }
}
```

---

## Route Guard Implementation

### RoleProtectedRoute Details

**Security Checks:**
1. Authentication check (user exists)
2. Token expiration check (every 60 seconds)
3. Role validation (normalized lowercase comparison)
4. Automatic redirect on failure

**Token Expiration:**
- Checks token expiration on mount
- Periodically validates (every 60 seconds)
- Automatically logs out on expired token
- Redirects to login with `?session=expired` query

**Role Normalization:**
- All roles stored in lowercase
- Comparison is case-insensitive
- Handles variations: "Admin" → "admin"

### FeatureProtectedRoute Details

**Access Checks:**
1. Subscription plan check (free/premium)
2. Feature availability check
3. Automatic redirect to upgrade page
4. Preserves original path in query string

**Upgrade Flow:**
- Redirects to `/profile` (upgrade page)
- Adds `?from=/original/path&reason=feature_name`
- Upgrade page can redirect back after upgrade

---

## URL Manipulation Protection

### Frontend Protection

```javascript
// RoleProtectedRoute prevents direct URL access
// User trying to access /super-admin/users as tenant:
// 1. Route guard checks role
// 2. Role doesn't match → redirect to /
// 3. User cannot access unauthorized route
```

### Backend Validation

```javascript
// Backend must always validate permissions
// Even if frontend allows access, backend enforces:
// GET /api/super-admin/users/
// → Backend checks user role
// → Returns 403 if not super-admin
// → Frontend shows error toast
```

---

## Route Testing

### Manual Testing Checklist

**Role-Based Access:**
- [ ] Tenant cannot access `/landlord/*` routes
- [ ] Landlord cannot access `/tenant/*` routes
- [ ] Admin cannot access `/super-admin/*` routes
- [ ] Unauthenticated users redirected to login

**Feature-Based Access:**
- [ ] Free users see upgrade prompt on premium routes
- [ ] Premium users can access premium features
- [ ] Upgrade redirect preserves original path

**Token Expiration:**
- [ ] Expired token triggers logout
- [ ] Refresh token attempt on 401
- [ ] Session expired message shown

**URL Manipulation:**
- [ ] Direct URL access to unauthorized route → redirect
- [ ] Role change after login → redirect to correct dashboard
- [ ] Permission change → UI updates accordingly

---

## Common Issues & Solutions

### Issue: Route Not Protected

**Solution:**
```javascript
// Ensure route is wrapped in RoleProtectedRoute
<Route
  path="admin"
  element={
    <RoleProtectedRoute allowedRoles={["admin", "super-admin"]}>
      <AdminDashboard />
    </RoleProtectedRoute>
  }
/>
```

### Issue: Feature Not Gated

**Solution:**
```javascript
// Wrap component in FeatureProtectedRoute
<FeatureProtectedRoute feature="landlord_advanced_analytics">
  <AnalyticsDashboard />
</FeatureProtectedRoute>
```

### Issue: Permission Check Not Working

**Solution:**
```javascript
// Always check user.permissions, not just role
if (user?.permissions?.canApproveUsers) {
  // Show admin panel
}
```

---

## Best Practices

### 1. Use Route Guards

```javascript
// ✅ Good - Route-level protection
<RoleProtectedRoute allowedRoles={["landlord"]}>
  <LandlordDashboard />
</RoleProtectedRoute>

// ❌ Bad - Component-level check only
{user?.role === 'landlord' && <LandlordDashboard />}
```

### 2. Check Permissions, Not Just Roles

```javascript
// ✅ Good - Checks actual permission
if (user?.permissions?.canApproveUsers) {
  return <UserApprovalPanel />;
}

// ❌ Bad - Assumes permission from role
if (user?.role === 'admin') {
  return <UserApprovalPanel />;
}
```

### 3. Handle Errors Gracefully

```javascript
// ✅ Good - Handles 403 gracefully
try {
  await adminAction();
} catch (error) {
  if (error.response?.status === 403) {
    // Permission denied - already handled by apiClient
    return;
  }
}

// ❌ Bad - No error handling
await adminAction(); // May throw 403
```

### 4. Never Trust Frontend State

```javascript
// ✅ Good - Backend validates
const response = await apiClient.post('/admin/users/approve/');
// Backend returns 403 if no permission

// ❌ Bad - Frontend-only check
if (user.role === 'admin') {
  // Directly approve without backend check
}
```

---

## Security Considerations

### Frontend Limitations

- Frontend protection is for UX only
- Backend must always enforce permissions
- Token expiration is validated, but backend is source of truth
- Role checks can be bypassed by direct API calls

### Backend Requirements

- All endpoints must validate permissions
- Token validation on every request
- Role-based access control enforced
- Permission checks for all admin actions

---

## Troubleshooting

### Issue: User Can Access Unauthorized Route

**Check:**
1. Route is wrapped in RoleProtectedRoute
2. Allowed roles include user's role
3. Token is valid and not expired
4. Backend returns 403 for unauthorized access

### Issue: Premium Feature Not Gated

**Check:**
1. Feature is wrapped in FeatureProtectedRoute
2. Feature key matches subscription check
3. User subscription is checked correctly
4. Upgrade redirect works

### Issue: Permission Check Fails

**Check:**
1. User object has permissions property
2. Permission key matches backend
3. Backend returns correct permissions
4. Permission check uses correct syntax

---

**Last Updated:** January 2026  
**Maintained By:** Frontend Team
