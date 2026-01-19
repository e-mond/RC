# Routing Guide

**Date:** January 2026  
**Status:** Production-Ready  
**Purpose:** Complete guide to routing in RentalConnects frontend

---

## Overview

RentalConnects uses **React Router v7** for client-side routing with:
- **Public routes** - Accessible to all users
- **Auth routes** - Guest-only (login, signup)
- **Protected routes** - Require authentication
- **Role-protected routes** - Require specific role
- **Feature-protected routes** - Require premium subscription

---

## Route Structure

### Public Routes

Accessible to all users (authenticated and unauthenticated):

```
/                           # Landing page
/properties                 # Public property listings
/properties/:id            # Property detail page
/learn-more                # Learn more page
/role-selection            # Role selection (onboarding)
/documentation             # Documentation page
/documentation/lease-agreements # Lease agreements
/terms                     # Terms of Service
/privacy                   # Privacy Policy
/blog                      # Blog listing
/blog/:slug                # Blog post
```

### Auth Routes

Guest-only routes (redirect if authenticated):

```
/login                     # Login page
/signup                    # Registration page
/signup-success           # Signup success confirmation
/forgot-password          # Password reset request
/reset-password/:token    # Password reset form
```

### Protected Routes

Require authentication (all roles):

```
/profile                   # User profile
/notifications            # Notifications center
/users/:id                # Public user profile
/documentation            # Documentation (authenticated)
```

### Role-Specific Routes

#### Tenant Routes (`/tenant/*`)

```
/tenant                    # Tenant dashboard (overview)
/tenant/overview          # Tenant dashboard
/tenant/properties        # Browse properties
/tenant/properties/:id    # Property detail
/tenant/rentals           # My rentals
/tenant/payments          # Payment history
/tenant/maintenance       # Maintenance requests (Premium)
/tenant/wishlist         # Wishlist
/tenant/history          # Rental history
/tenant/leases           # Lease agreements
/tenant/messages         # Messages
```

#### Landlord Routes (`/landlord/*`)

```
/landlord                  # Landlord dashboard (overview)
/landlord/overview        # Landlord dashboard
/landlord/properties      # Property list
/landlord/properties/new  # Create property
/landlord/properties/view/:landlordId # View all properties
/landlord/properties/:id  # Property details
/landlord/properties/:id/edit # Edit property
/landlord/bookings        # Booking requests
/landlord/analytics       # Analytics dashboard (Premium)
/landlord/wallet          # Wallet (Premium)
/landlord/ads             # Ad management (Premium)
/landlord/messages        # Messages
```

#### Artisan Routes (`/artisan/*`)

```
/artisan                   # Artisan dashboard (overview)
/artisan/overview         # Artisan dashboard
/artisan/tasks            # Task management
/artisan/tasks/:id        # Task details
/artisan/earnings         # Earnings summary
/artisan/schedule         # Schedule
/artisan/ads              # Ad management (Premium)
/artisan/messages         # Messages
```

#### Admin Routes (`/admin/*`)

```
/admin                     # Admin dashboard (redirects to overview)
/admin/overview           # Admin dashboard
/admin/dashboard          # Admin dashboard (redirects to overview)
/admin/approvals          # User/property approvals
/admin/approvals/user/:id # User approval detail
/admin/approvals/properties # Property approvals
/admin/properties/:id     # Property detail (admin view)
/admin/assigned-roles     # Assigned roles
/admin/marketing          # Marketing campaigns
/admin/reports            # Reports
/admin/leases             # Lease management
/admin/messages           # Messages
```

#### Super Admin Routes (`/super-admin/*`)

```
/super-admin               # Super Admin dashboard (overview)
/super-admin/overview     # Super Admin dashboard
/super-admin/users        # User management
/super-admin/users/:id    # User detail
/super-admin/users/:id/profile # User profile
/super-admin/users/pending # Pending user approvals
/super-admin/users/pending/:id # User approval detail
/super-admin/properties/pending # Pending property approvals
/super-admin/properties/:id # Property detail
/super-admin/roles        # Role management
/super-admin/audit        # Audit logs
/super-admin/announcements # Announcements
/super-admin/pricing      # Premium pricing configuration
/super-admin/marketing    # Marketing campaigns
/super-admin/leases      # Lease management
/super-admin/messages    # Messages
/super-admin/documentation # Documentation
```

---

## Route Protection

### Role-Protected Routes

Protected by user role using `RoleProtectedRoute`:

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
  {/* Landlord routes */}
</Route>
```

**Features:**
- Validates authentication
- Checks token expiration
- Validates user role
- Redirects to login if unauthorized
- Redirects to fallback route if role mismatch

### Feature-Protected Routes

Protected by subscription plan using `FeatureProtectedRoute`:

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

**Features:**
- Checks subscription plan
- Validates feature access
- Redirects to upgrade page if not premium
- Preserves original path in query string

---

## Route Configuration

### Main Route File (`App.jsx`)

```javascript
// src/App.jsx
<Routes>
  {/* Public routes */}
  <Route element={<PublicLayout />}>
    <Route path="/" element={<LandingPage />} />
    <Route path="/properties" element={<PublicProperties />} />
    {/* ... */}
  </Route>
  
  {/* Auth routes */}
  <Route path="/login" element={<Login />} />
  <Route path="/signup" element={<Signup />} />
  {/* ... */}
  
  {/* Protected routes */}
  <Route path="/*" element={<SecureRoutes />} />
  
  {/* 404 */}
  <Route path="*" element={<NotFound />} />
</Routes>
```

### Secure Routes File (`secureRoutes.jsx`)

```javascript
// src/routes/secureRoutes.jsx
const dashboardRoutes = [
  {
    path: "tenant",
    role: "tenant",
    layout: DashboardLayout,
    children: [
      { index: true, element: <TenantDashboard /> },
      { path: "properties", element: <TenantProperties /> },
      // ...
    ],
  },
  // ...
];
```

---

## Lazy Loading

All dashboard routes are lazy-loaded for better performance:

```javascript
// src/routes/secureRoutes.jsx
const TenantDashboard = lazy(() => import("@/pages/Dashboards/Tenant/TenantDashboard"));
const LandlordDashboard = lazy(() => import("@/pages/Dashboards/Landlord/LandlordDashboard"));
// ...
```

**Benefits:**
- Smaller initial bundle
- Faster initial load
- Code splitting automatic

**Loading Fallback:**
```javascript
const PageLoader = ({ children }) => (
  <Suspense fallback={<LoadingSpinner />}>
    {children}
  </Suspense>
);
```

---

## Navigation

### Programmatic Navigation

```javascript
import { useNavigate } from 'react-router-dom';

function MyComponent() {
  const navigate = useNavigate();
  
  const handleClick = () => {
    navigate('/tenant/properties');
  };
  
  return <button onClick={handleClick}>Go to Properties</button>;
}
```

### Link Components

```javascript
import { Link } from 'react-router-dom';

function MyComponent() {
  return (
    <Link to="/tenant/properties">
      View Properties
    </Link>
  );
}
```

### Role-Based Redirects

```javascript
// hooks/useRoleRedirect.js
export default function useRoleRedirect() {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  
  useEffect(() => {
    if (user?.role) {
      const rolePath = {
        tenant: '/tenant',
        landlord: '/landlord',
        artisan: '/artisan',
        admin: '/admin',
        'super-admin': '/super-admin',
      };
      navigate(rolePath[user.role] || '/');
    }
  }, [user]);
}
```

---

## Route Parameters

### URL Parameters

```javascript
// Route definition
<Route path="/properties/:id" element={<PropertyDetail />} />

// Component
import { useParams } from 'react-router-dom';

function PropertyDetail() {
  const { id } = useParams();
  // id = property ID from URL
}
```

### Query Parameters

```javascript
// URL: /tenant/properties?category=apartment&minPrice=1000
import { useSearchParams } from 'react-router-dom';

function PropertyList() {
  const [searchParams] = useSearchParams();
  const category = searchParams.get('category');
  const minPrice = searchParams.get('minPrice');
}
```

### Validation

Always validate route parameters:

```javascript
// utils/validateParams.js
import { validateParams } from '@/utils/validateParams';

function PropertyDetail() {
  const { id } = useParams();
  
  useEffect(() => {
    if (!validateParams.id(id)) {
      navigate('/not-found');
    }
  }, [id]);
}
```

---

## Route Guards

### Authentication Guard

```javascript
// routes/RoleProtectedRoute.jsx
export default function RoleProtectedRoute({ allowedRoles, children }) {
  const { user, loading } = useAuthStore();
  
  if (loading) return <LoadingSpinner />;
  if (!user) return <Navigate to="/login" />;
  
  const userRole = user.role?.toLowerCase();
  if (!allowedRoles.includes(userRole)) {
    return <Navigate to="/" />;
  }
  
  return children;
}
```

### Feature Guard

```javascript
// routes/FeatureProtectedRoute.jsx
export default function FeatureProtectedRoute({ feature, children }) {
  const { can } = useFeatureAccess();
  
  if (!can(feature)) {
    return <Navigate to="/upgrade" />;
  }
  
  return children;
}
```

---

## Route Patterns

### Nested Routes

```javascript
<Route path="landlord" element={<DashboardLayout />}>
  <Route index element={<LandingDashboard />} />
  <Route path="properties" element={<PropertiesPage />} />
  <Route path="properties/:id" element={<PropertyDetailsPage />} />
</Route>
```

### Index Routes

```javascript
// /tenant and /tenant/overview both render TenantDashboard
<Route index element={<TenantDashboard />} />
<Route path="overview" element={<TenantDashboard />} />
```

### Redirect Routes

```javascript
<Route path="admin" element={<Navigate to="overview" replace />} />
```

### Catch-All Routes

```javascript
// 404 handler
<Route path="*" element={<NotFound />} />

// Role-specific 404
<Route path="*" element={<Navigate to="." replace />} />
```

---

## Sidebar Navigation

Sidebar automatically shows routes based on user role:

```javascript
// components/layout/Sidebar.jsx
const getRoutesForRole = (role) => {
  const routes = {
    tenant: [
      { path: '/tenant', label: 'Dashboard' },
      { path: '/tenant/properties', label: 'Properties' },
      // ...
    ],
    landlord: [
      { path: '/landlord', label: 'Dashboard' },
      { path: '/landlord/properties', label: 'Properties' },
      // ...
    ],
    // ...
  };
  return routes[role] || [];
};
```

---

## Best Practices

### 1. Use Lazy Loading

```javascript
// ✅ Good
const Dashboard = lazy(() => import('./Dashboard'));

// ❌ Bad
import Dashboard from './Dashboard';
```

### 2. Validate Route Parameters

```javascript
// ✅ Good
const { id } = useParams();
if (!validateParams.id(id)) {
  return <NotFound />;
}

// ❌ Bad
const { id } = useParams();
// Use id directly without validation
```

### 3. Handle Loading States

```javascript
// ✅ Good
<Suspense fallback={<LoadingSpinner />}>
  <LazyComponent />
</Suspense>
```

### 4. Use Protected Routes

```javascript
// ✅ Good
<RoleProtectedRoute allowedRoles={["landlord"]}>
  <LandlordDashboard />
</RoleProtectedRoute>

// ❌ Bad
{user?.role === 'landlord' && <LandlordDashboard />}
```

### 5. Consistent Route Naming

```javascript
// ✅ Good - Consistent patterns
/tenant/properties
/landlord/properties
/admin/properties

// ❌ Bad - Inconsistent
/tenant/properties
/landlord/my-properties
/admin/property-list
```

---

## Troubleshooting

### Issue: Route not found

**Check:**
- Route path matches exactly (case-sensitive)
- Route is defined in correct route file
- Route is not protected incorrectly

### Issue: Redirect loop

**Check:**
- Role validation is correct
- Fallback route is valid
- No circular redirects

### Issue: Lazy loading not working

**Check:**
- Component is wrapped in Suspense
- Import path is correct
- Component has default export

---

## Route Testing

### Test Route Protection

```javascript
// routes/__tests__/RoleProtectedRoute.test.jsx
test('redirects unauthenticated users', () => {
  render(
    <RoleProtectedRoute allowedRoles={["tenant"]}>
      <TenantDashboard />
    </RoleProtectedRoute>
  );
  expect(screen.getByText('Login')).toBeInTheDocument();
});
```

---

**Last Updated:** January 2026  
**Maintained By:** Frontend Team
