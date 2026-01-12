# RentalConnects Frontend Overview

**Date:** 2026-01-11  
**Version:** Production-Ready  
**Status:** Complete Architecture Documentation

---

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Folder Structure](#folder-structure)
3. [State Management](#state-management)
4. [Hybrid Mock + Real API System](#hybrid-mock--real-api-system)
5. [Role Enforcement System](#role-enforcement-system)
6. [UI System](#ui-system)
7. [Routing & Navigation](#routing--navigation)
8. [Authentication & Authorization](#authentication--authorization)
9. [Payment & Wallet System](#payment--wallet-system)
10. [Chat & Messaging](#chat--messaging)
11. [File Uploads](#file-uploads)
12. [Theme & Localization](#theme--localization)
13. [Testing Strategy](#testing-strategy)
14. [Build & Deployment](#build--deployment)

---

## Architecture Overview

RentalConnects is a **Vite + React 19 Single Page Application (SPA)** targeting five user personas:
- **Tenant** - Property seekers and renters
- **Landlord** - Property owners and managers
- **Artisan** - Service providers (plumbers, electricians, etc.)
- **Admin** - Platform moderators with delegated permissions
- **Super Admin** - Platform administrators with full system access

### Core Technologies

- **Framework:** React 19 + Vite
- **Styling:** Tailwind CSS
- **State Management:** Zustand (persistent stores) + React Context
- **Routing:** React Router v7
- **HTTP Client:** Axios with interceptors
- **Charts:** Recharts
- **Forms:** React Hook Form + Zod
- **Payments:** Paystack (inline JS)
- **File Uploads:** Cloudinary
- **Encryption:** CryptoJS (AES-256 for chat)
- **Internationalization:** i18next + react-i18next
- **Animations:** Framer Motion
- **Testing:** Vitest + Testing Library

### Design Principles

1. **Hybrid Mock/Real API** - Seamless switching between mock and real backend
2. **Role-Based Access Control (RBAC)** - UI-level enforcement aligned with backend
3. **Freemium/Premium Model** - Feature gating based on subscription tier
4. **Progressive Web App (PWA)** - Installable, responsive, offline-capable
5. **Mobile-First** - Responsive design with touch-friendly interfaces
6. **Accessibility** - ARIA labels, keyboard navigation, screen reader support

---

## Folder Structure

```
src/
├── assets/                    # Static assets
│   ├── images/               # Image files
│   ├── icons/                # Icon files
│   └── illustrations/        # Illustration files
│
├── components/               # Reusable UI components
│   ├── admin/                # Admin-specific widgets
│   │   └── MockModeCard.jsx
│   ├── auth/                 # Authentication components
│   │   ├── LoginForm.jsx
│   │   ├── DemoLoginButtons.jsx
│   │   └── ...
│   ├── common/               # Shared components
│   │   ├── DemoModeBanner.jsx
│   │   ├── EmptyState.jsx
│   │   ├── UserAvatar.jsx
│   │   └── ...
│   ├── landlord/             # Landlord-specific components
│   │   ├── BookingsCalendar.jsx
│   │   ├── ImageUploader.jsx
│   │   └── MapPicker.jsx
│   ├── tenant/               # Tenant-specific components
│   │   └── RentPaymentModal.jsx
│   ├── layout/               # Layout components
│   │   ├── DashboardLayout.jsx
│   │   ├── Sidebar.jsx
│   │   ├── Navbar.jsx
│   │   └── ...
│   ├── ui/                   # Base UI primitives
│   │   ├── Button.jsx
│   │   ├── Card.jsx
│   │   ├── FormInput.jsx
│   │   ├── ConfirmModal.jsx
│   │   └── ...
│   └── ViewingRequest/       # Viewing request components
│       └── ScheduleViewingModal.jsx
│
├── config/                   # Configuration files
│   └── permissions.js        # Role permission definitions
│
├── context/                  # React Context providers
│   ├── AuthContext.jsx       # Auth context wrapper
│   ├── AuthProvider.jsx      # Auth provider (deprecated, use authStore)
│   ├── FeatureAccessContext.jsx  # Feature access provider
│   ├── LanguageContext.jsx   # i18n language context
│   ├── ThemeContext.jsx      # Theme (dark/light) context
│   └── useAuth.js            # Auth context hook
│
├── hooks/                    # Custom React hooks
│   ├── useAds.js             # Ads management hook
│   ├── useDebounce.js        # Debounce utility hook
│   ├── useDemoMode.js        # Demo mode state hook
│   ├── useFetch.js           # Data fetching hook
│   ├── useLanguage.js        # Language/i18n hook
│   ├── useLoginValidation.js # Login form validation
│   └── useRoleRedirect.js    # Role-based redirect hook
│
├── modules/                  # Composition-friendly modules
│   └── dashboard/            # Dashboard building blocks
│       ├── PageHeader.jsx
│       ├── MetricGrid.jsx
│       ├── MetricCard.jsx
│       ├── ActionGrid.jsx
│       ├── ActionCard.jsx
│       └── SectionCard.jsx
│
├── pages/                    # Route-level page components
│   ├── Auth/                 # Authentication pages
│   │   ├── Login.jsx
│   │   ├── Signup.jsx
│   │   └── ...
│   ├── Dashboards/           # Role-specific dashboards
│   │   ├── Tenant/
│   │   ├── Landlord/
│   │   ├── Artisan/
│   │   ├── Admin/
│   │   └── SuperAdmin/
│   ├── Landing/              # Landing page components
│   ├── Profile/              # User profile page
│   └── ...
│
├── routes/                   # Routing configuration
│   ├── secureRoutes.jsx      # Authenticated routes
│   ├── RoleProtectedRoute.jsx    # Role-based route guard
│   ├── FeatureProtectedRoute.jsx # Feature-based route guard
│   ├── PublicRoute.jsx       # Public route wrapper
│   └── index.jsx             # Route exports
│
├── services/                 # API service layer
│   ├── apiClient.js          # Axios instance with interceptors
│   ├── authService.js        # Authentication API
│   ├── propertyService.js    # Property management API
│   ├── landlordService.js    # Landlord-specific API
│   ├── tenantService.js      # Tenant-specific API
│   ├── artisanService.js     # Artisan-specific API
│   ├── adminService.js       # Admin API
│   ├── paymentService.js     # Payment processing API
│   ├── walletService.js      # Wallet management API
│   ├── chatService.js        # Chat/messaging API
│   ├── bookingService.js     # Booking/viewing API
│   ├── adsService.js         # Advertisement API
│   ├── cloudinary.js         # Cloudinary upload helper
│   └── ...
│
├── stores/                   # Zustand stores (persistent state)
│   ├── authStore.js          # Authentication state
│   └── featureStore.js       # Feature/subscription state
│
├── utils/                    # Utility functions
│   ├── encryption.js         # CryptoJS encryption utilities
│   ├── featureAccess.js      # Feature access matrix
│   ├── roles.js              # Role definitions
│   ├── session.js            # Session storage helper
│   ├── constants.js          # App constants
│   ├── format.js             # Formatting utilities
│   ├── formatDate.js         # Date formatting
│   ├── validationSchemas.js  # Zod validation schemas
│   └── ...
│
├── mocks/                    # Mock data and adapters
│   ├── axiosMock.js          # Axios mock adapter
│   ├── mockManager.js        # Mock mode manager
│   ├── mockData.js           # Centralized mock data
│   ├── adminMock.js          # Admin mock data
│   ├── landlordMock.js       # Landlord mock data
│   └── ...
│
├── testing/                  # Testing utilities
│   └── renderWithProviders.jsx  # Test render helper
│
├── App.jsx                   # Root app component
├── main.jsx                  # Entry point
└── index.css                 # Global styles
```

---

## State Management

### Zustand Stores (Persistent State)

#### `authStore` (`src/stores/authStore.js`)

Manages authentication state with localStorage persistence.

**State:**
- `user` - Current user object (null if not authenticated)
- `token` - JWT token
- `loading` - Initial hydration loading state
- `authLoading` - Login/signup operation loading
- `error` - Error message

**Methods:**
- `loadSession()` - Load existing session from localStorage
- `login(credentials)` - Login user
- `logout()` - Logout and clear session
- `updateUser(updates)` - Update user profile
- `isAuthenticated()` - Check if user is authenticated
- `getRole()` - Get current user role (lowercase)
- `hasRole(roles)` - Check if user has any of the specified roles
- `isTenant()`, `isLandlord()`, `isArtisan()`, `isAdmin()`, `isSuperAdmin()` - Role check helpers

**Persistence:**
- Stored in localStorage with key `auth-storage`
- Automatically rehydrates on app load
- Roles normalized to lowercase

#### `featureStore` (`src/stores/featureStore.js`)

Manages subscription/plan state.

**State:**
- `plan` - Current plan: `"free"` | `"premium"`

**Methods:**
- `setPlan(plan)` - Set subscription plan
- `isPremium()` - Check if plan is premium
- `togglePlan()` - Toggle between free and premium (dev/demo convenience)

**Persistence:**
- Stored in localStorage with key `rc-feature-storage`

### React Context (Global Providers)

#### `FeatureAccessContext` (`src/context/FeatureAccessContext.jsx`)

Derives feature access from `authStore` + `featureStore`.

**Provides:**
- `plan` - Current subscription plan
- `role` - Current user role
- `isPremium` - Boolean (true if premium or admin/super-admin)
- `features` - Array of available feature keys
- `can(featureKey)` - Check if feature is accessible

**Usage:**
```jsx
import { useFeatureAccess } from "@/context/FeatureAccessContext";

function MyComponent() {
  const { isPremium, can } = useFeatureAccess();
  
  if (!can("TENANT_PAYMENTS")) {
    return <UpgradeCTA />;
  }
  
  return <PaymentsUI />;
}
```

#### `ThemeContext` (`src/context/ThemeContext.jsx`)

Manages dark/light theme state.

**Provides:**
- `isDark` - Boolean for dark mode
- `toggleTheme()` - Toggle theme
- `setTheme(theme)` - Set specific theme

**Persistence:**
- Theme preference stored in localStorage

#### `LanguageContext` (`src/context/LanguageContext.jsx`)

Manages i18n language state.

**Provides:**
- `language` - Current language code
- `setLanguage(lang)` - Change language
- `t(key)` - Translation function

---

## Hybrid Mock + Real API System

### Overview

The frontend supports seamless switching between mock and real backend APIs. This enables:
- Development without backend dependency
- Demo mode for presentations
- Testing with controlled data
- Offline development

### Mock Mode Control

**Environment Variables:**
- `VITE_USE_MOCK=true` - Force mock mode (production-safe flag)
- `VITE_FORCE_MOCK=true` - Lock mock mode (prevents toggling)
- `localStorage.demoMockEnabled = "true"` - Runtime toggle (not persisted)

**Detection:**
- `import.meta.env.DEV` - Development mode
- `import.meta.env.VITE_USE_MOCK` - Explicit mock flag

### Mock System Architecture

#### `mockManager.js` (`src/mocks/mockManager.js`)

Central mock mode state manager.

**Responsibilities:**
- Toggle mock adapter on/off
- Broadcast mock mode changes
- Manage demo data isolation

#### `axiosMock.js` (`src/mocks/axiosMock.js`)

Axios mock adapter implementation.

**Features:**
- Intercepts HTTP requests
- Returns mock responses based on URL patterns
- Supports delays for realistic behavior
- Handles POST/PUT/PATCH mutations

#### Mock Data (`src/mocks/mockData.js`)

Centralized mock data registry.

**Data Sets:**
- Properties
- Users (all roles)
- Bookings/Viewing Requests
- Payments
- Artisan Tasks
- Analytics/Stats
- Ads

### Service Layer Pattern

Services check mock mode and route accordingly:

```javascript
// src/services/propertyService.js
const USE_MOCK = String(import.meta.env.VITE_USE_MOCK || "").toLowerCase() === "true";

export const fetchProperties = async (opts = {}) => {
  if (USE_MOCK) {
    return mockData.mockProperties;
  }
  
  try {
    const { data } = await apiClient.get("/properties", { params: opts });
    return data;
  } catch (err) {
    throw extractError(err, "Failed to fetch properties");
  }
};
```

### Demo Mode UX

#### `DemoModeBanner` (`src/components/common/DemoModeBanner.jsx`)

Visual indicator when mocks are active.

**Features:**
- Shows mock mode status
- Allows toggling (unless locked)
- Styled differently in dev vs production

#### `MockModeCard` (`src/components/admin/MockModeCard.jsx`)

Admin dashboard widget for mock toggle.

**Features:**
- Toggle mock mode
- View current mode
- Edit mock data (Super Admin only)

### Session Isolation

When mock mode is active, `session.js` prefixes localStorage keys with `demo.`:
- Production: `auth-storage`
- Demo: `demo.auth-storage`

This prevents demo data from affecting production sessions.

---

## Role Enforcement System

### Roles

1. **Tenant** (`tenant`)
   - Browse properties
   - Book viewings
   - Make payments (premium)
   - Request maintenance (premium)
   - Use wishlist
   - Chat with landlords/artisans

2. **Landlord** (`landlord`)
   - Manage properties
   - View/respond to booking requests
   - Receive payments
   - View analytics (premium)
   - Manage ads (premium)
   - Chat with tenants/artisans

3. **Artisan** (`artisan`)
   - View assigned tasks
   - Update task status
   - Receive payments
   - Chat with landlords/tenants
   - Manage portfolio (premium)

4. **Admin** (`admin`)
   - Approve/reject properties
   - Approve/reject users
   - Manage maintenance requests
   - View system insights (permissions)
   - Moderate ads
   - Manage wallets (permissions)

5. **Super Admin** (`super-admin`)
   - All Admin permissions
   - Delegate roles to Admins
   - Manage all users
   - System settings
   - Mock data editor
   - Audit logs
   - Payment monitoring

### Permission System

#### Role Permissions (`src/config/permissions.js`)

Static permission definitions:

```javascript
export const ROLE_PERMISSIONS = {
  "super-admin": {
    canCreateAdmins: true,
    canDeleteAdmins: true,
    canRevokeAdminAccess: true,
    canApproveListings: true,
    canApproveUsers: true,
  },
  "admin": {
    canCreateAdmins: false,
    canDeleteAdmins: false,
    canRevokeAdminAccess: false,
    canApproveListings: true,
    canApproveUsers: true,
  },
};
```

#### Feature Access Matrix (`src/utils/featureAccess.js`)

Feature gating based on plan + role:

```javascript
export const FEATURE_MATRIX = {
  TENANT_PAYMENTS: { minPlan: "premium", roles: ["tenant"] },
  LANDLORD_ANALYTICS: { minPlan: "premium", roles: ["landlord"] },
  ADMIN_INSIGHTS: { minPlan: "system", roles: ["admin", "super-admin"] },
  // ...
};
```

**Plan Levels:**
- `free` - Free tier
- `premium` - Premium subscription
- `system` - Admin/Super Admin (always have access)

### Route Protection

#### `RoleProtectedRoute` (`src/routes/RoleProtectedRoute.jsx`)

Guards routes based on user role.

**Usage:**
```jsx
<Route
  path="/landlord/properties"
  element={
    <RoleProtectedRoute allowedRoles={["landlord"]}>
      <PropertiesPage />
    </RoleProtectedRoute>
  }
/>
```

**Behavior:**
- Redirects to `/login` if not authenticated
- Redirects to `/unauthorized` if role not allowed
- Allows access if role matches

#### `FeatureProtectedRoute` (`src/routes/FeatureProtectedRoute.jsx`)

Guards routes based on feature access.

**Usage:**
```jsx
<Route
  path="/tenant/payments"
  element={
    <FeatureProtectedRoute feature="TENANT_PAYMENTS">
      <TenantPayments />
    </FeatureProtectedRoute>
  }
/>
```

**Behavior:**
- Checks feature access via `useFeatureAccess()`
- Shows upgrade CTA if feature not accessible
- Allows access if feature is available

#### `PermissionGuard` (`src/utils/PermissionGuard.jsx`)

Component-level permission check.

**Usage:**
```jsx
<PermissionGuard required="canApproveUsers" user={user}>
  <UserApprovals />
</PermissionGuard>
```

### UI-Level Enforcement

Components use hooks/helpers to conditionally render:

```jsx
import { useAuthStore } from "@/stores/authStore";
import { useFeatureAccess } from "@/context/FeatureAccessContext";

function MyComponent() {
  const { isLandlord } = useAuthStore();
  const { can, isPremium } = useFeatureAccess();
  
  if (!isLandlord()) return null;
  
  return (
    <div>
      {can("LANDLORD_ANALYTICS") ? (
        <AnalyticsDashboard />
      ) : (
        <UpgradeCTA feature="LANDLORD_ANALYTICS" />
      )}
    </div>
  );
}
```

---

## UI System

### Design System

**Color Palette:**
- Primary: `#0b6e4f` (Emerald green)
- Hover: `#095c42` (Darker emerald)
- Background: `#ffffff` (Light) / `#0f1724` (Dark)
- Text: `#0f1724` (Light) / `#f8fafc` (Dark)

**Typography:**
- Font family: System fonts (Inter, -apple-system, sans-serif)
- Headings: Semibold (600)
- Body: Regular (400)
- Small: Regular (400), 0.875rem

**Spacing:**
- Base unit: 4px (0.25rem)
- Common: 1rem (16px), 1.5rem (24px), 2rem (32px)

**Border Radius:**
- Small: `0.5rem` (8px)
- Medium: `0.75rem` (12px)
- Large: `1rem` (16px)
- XL: `1.5rem` (24px)

### Component Library

#### Base Components (`src/components/ui/`)

**Button** (`Button.jsx`)
- Variants: `primary`, `outline`, `ghost`
- Sizes: Responsive (mobile-first)
- States: `disabled`, `loading`
- Touch-friendly (44px min height)

**Card** (`Card.jsx`)
- Image support
- Hover effects
- Dark mode support
- Framer Motion integration

**FormInput** (`FormInput.jsx`)
- Label support
- Error display
- Type variants
- Auto-complete support

**ConfirmModal** (`ConfirmModal.jsx`)
- Simple confirmation dialogs
- Customizable title/message
- Callback support

#### Dashboard Modules (`src/modules/dashboard/`)

**PageHeader**
- Title + subtitle
- Badge support
- Action buttons
- Responsive layout

**MetricGrid / MetricCard**
- Stat cards with icons
- Loading states
- Links/onClick support
- Color accents

**ActionGrid / ActionCard**
- Quick action tiles
- Icons + descriptions
- Hover effects
- Responsive grid

**SectionCard**
- Wrapper for complex widgets
- Title + description
- Consistent spacing
- Dark mode support

### Layout Components

#### `DashboardLayout` (`src/components/layout/DashboardLayout.jsx`)

Main dashboard wrapper.

**Features:**
- Sidebar navigation
- Top navbar
- User menu
- Notifications
- Theme toggle
- Nested route rendering via `<Outlet />`

#### `Sidebar` (`src/components/layout/Sidebar.jsx`)

Navigation sidebar.

**Features:**
- Role-based menu items
- Active route highlighting
- Collapsible on mobile
- Icon + text labels

#### `Navbar` (`src/components/layout/Navbar.jsx`)

Top navigation bar.

**Features:**
- User avatar/menu
- Notifications dropdown
- Theme toggle
- Search (future)
- Mobile responsive

### Responsive Design

**Breakpoints (Tailwind):**
- `sm`: 640px
- `md`: 768px
- `lg`: 1024px
- `xl`: 1280px
- `2xl`: 1536px

**Mobile-First Approach:**
- Base styles target mobile
- Progressive enhancement for larger screens
- Touch-friendly targets (44px minimum)
- Readable text sizes (16px minimum)

---

## Routing & Navigation

### Route Structure

**Public Routes:**
- `/` - Landing page
- `/login` - Login page
- `/signup` - Signup page
- `/learn-more` - Learn more page
- `/blog` - Blog listing
- `/blog/:slug` - Blog post
- `/property/:id` - Property detail (public view)

**Authenticated Routes:**
- `/tenant/*` - Tenant dashboard
- `/landlord/*` - Landlord dashboard
- `/artisan/*` - Artisan dashboard
- `/admin/dashboard/*` - Admin dashboard
- `/super-admin/*` - Super Admin dashboard
- `/profile` - User profile
- `/notifications` - Notifications center

### Route Configuration (`src/routes/secureRoutes.jsx`)

All authenticated routes defined here with lazy loading:

```javascript
const TenantDashboard = lazy(() => import("@/pages/Dashboards/Tenant/TenantDashboard"));
// ...
```

Routes wrapped with:
1. `DashboardLayout` - Shared layout
2. `RoleProtectedRoute` - Role guard
3. `FeatureProtectedRoute` - Feature guard (where applicable)

### Navigation Flow

**After Login:**
1. User logs in via `/login`
2. `authStore.login()` stores token + user
3. `useRoleRedirect()` hook redirects to role-specific dashboard:
   - Tenant → `/tenant/overview`
   - Landlord → `/landlord/overview`
   - Artisan → `/artisan/overview`
   - Admin → `/admin/dashboard/overview`
   - Super Admin → `/super-admin/overview`

**Role Switching:**
- Not supported in production
- Dev-only `RoleSwitcher` component available

---

## Authentication & Authorization

### Authentication Flow

1. **Login** (`/login`)
   - User enters email/password
   - `authService.login()` calls `/auth/login`
   - Backend returns `{ token, user }`
   - `authStore.login()` stores token + user
   - Redirect to role-specific dashboard

2. **Session Persistence**
   - Token stored in localStorage (`auth-storage`)
   - `authStore.loadSession()` called on app mount
   - Token validated via `/auth/profile` endpoint
   - Invalid token → logout

3. **Logout**
   - `authStore.logout()` clears token + user
   - Redirect to `/login`
   - Clear all session data

### API Authentication

**Token Injection** (`src/services/apiClient.js`):
```javascript
apiClient.interceptors.request.use((config) => {
  const token = session.getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
```

**Auto Logout** (Production only):
```javascript
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && !import.meta.env.DEV) {
      session.clearAll();
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);
```

### Authorization

**Route-Level:**
- `RoleProtectedRoute` - Role-based access
- `FeatureProtectedRoute` - Feature-based access

**Component-Level:**
- `PermissionGuard` - Permission-based rendering
- `useAuthStore()` hooks - Role checks
- `useFeatureAccess()` hook - Feature checks

---

## Payment & Wallet System

### Wallet Service (`src/services/walletService.js`)

Wallet management API for roles that receive payments:
- Landlord
- Artisan
- Admin
- Super Admin

**Endpoints:**
- `GET /wallet/` - Get wallet information
- `POST /wallet/setup/` - Initialize wallet
- `PATCH /wallet/` - Update wallet
- `GET /wallet/balance/` - Get balance
- `POST /wallet/top-up/` - Top up wallet
- `GET /wallet/transactions/` - Transaction history
- `POST /wallet/withdraw/` - Withdraw funds

### Wallet Setup Flow

1. User accesses profile/settings
2. Check if wallet is set up (`walletService.isWalletSetup()`)
3. If not, show wallet setup form
4. User enters payment details (bank account, mobile money, etc.)
5. Submit to `POST /wallet/setup/`
6. Wallet activated, user can receive payments

### Payment Processing

**Paystack Integration:**
- Inline JS SDK loaded dynamically
- Payment popup for upgrades/top-ups
- Webhook verification (backend)
- Transaction recorded in wallet

**Payment Types:**
- Premium upgrades
- Wallet top-ups
- Rent payments (Tenant → Landlord)
- Service payments (Landlord → Artisan)

### Payment UI Components

- Wallet setup modal
- Wallet balance display
- Transaction history table
- Top-up form
- Payment success/failure notifications

---

## Chat & Messaging

### Chat Service (`src/services/chatService.js`)

Messaging API for all user-to-user communication.

**Endpoints:**
- `GET /chat/conversations/` - List conversations
- `GET /chat/conversations/:id/` - Get conversation
- `POST /chat/conversations/` - Create conversation
- `GET /chat/conversations/:id/messages/` - Get messages
- `POST /chat/conversations/:id/messages/` - Send message
- `POST /chat/messages/send/` - Send direct message

### Encryption (`src/utils/encryption.js`)

End-to-end encryption using CryptoJS (AES-256).

**Key Generation:**
- Keys derived from user IDs (conversation-specific)
- Stored in localStorage (per conversation)
- Keys cleared on logout

**Encryption Flow:**
1. User sends message
2. Message encrypted with conversation key
3. Encrypted message sent to backend
4. Backend stores encrypted message
5. Recipient receives encrypted message
6. Message decrypted with conversation key
7. Plain text displayed

**Functions:**
- `encryptMessageForConversation()` - Encrypt before send
- `decryptMessageFromConversation()` - Decrypt on receive
- `getEncryptionKey()` - Get/create conversation key

### Chat Features

- Real-time messaging (polling or WebSocket)
- Typing indicators
- Read receipts
- File attachments
- Message encryption
- Conversation list
- Search (future)

---

## File Uploads

### Cloudinary Integration (`src/services/cloudinary.js`)

Client-side image upload to Cloudinary.

**Features:**
- Direct upload from browser
- Image optimization
- Transformation support
- URL generation

**Upload Flow:**
1. User selects file
2. File preview shown
3. Upload to Cloudinary
4. Cloudinary returns URL
5. URL stored in backend

### Upload Components

**ImageUploader** (`src/components/landlord/ImageUploader.jsx`):
- Multi-file selection
- Preview grid
- Remove/delete
- Drag & drop
- Progress indicators

**Usage:**
- Property images
- Profile pictures
- Ad images
- Portfolio images
- Document uploads

### File Handling

- Preview before upload
- Edit/remove before submit
- Error handling
- Loading states
- Size validation
- Type validation (images, PDFs)

---

## Theme & Localization

### Theme System (`src/context/ThemeContext.jsx`)

Dark/Light mode support.

**Implementation:**
- CSS variables for colors
- Tailwind dark mode classes
- Persistent preference (localStorage)
- System preference detection

**Usage:**
```jsx
import { useTheme } from "@/context/ThemeContext";

function MyComponent() {
  const { isDark, toggleTheme } = useTheme();
  
  return (
    <div className={isDark ? "dark" : ""}>
      {/* Content */}
    </div>
  );
}
```

### Localization (`src/context/LanguageContext.jsx`)

Multi-language support via i18next.

**Supported Languages:**
- English (default)
- Additional languages via i18n config

**Usage:**
```jsx
import { useLanguage } from "@/hooks/useLanguage";

function MyComponent() {
  const { t } = useLanguage();
  
  return <h1>{t("welcome.title")}</h1>;
}
```

**Translation Files:**
- `public/locales/en/translation.json`
- Additional languages in `public/locales/[lang]/translation.json`

---

## Testing Strategy

### Unit Tests

**Stores:**
- `authStore` - Login, logout, role checks
- `featureStore` - Plan management

**Services:**
- API calls with mocks
- Error handling
- Response transformation

**Utilities:**
- Encryption/decryption
- Feature access logic
- Format helpers

### Integration Tests

**Routes:**
- Route protection
- Redirects
- Auth flows

**Components:**
- User interactions
- Form submissions
- State updates

### E2E Tests (Planned)

**Critical Flows:**
- Login/Logout
- Property viewing request
- Payment flow
- Wallet setup
- Premium upgrade

### Test Setup

**Tools:**
- Vitest - Test runner
- Testing Library - Component testing
- jsdom - DOM simulation

**Helpers:**
- `renderWithProviders` - Wrapper with Context + Router

---

## Build & Deployment

### Build Commands

```bash
# Development
npm run dev          # Start dev server (mock mode by default)

# Production
npm run build        # Build for production
npm run preview      # Preview production build

# Testing
npm run test         # Run unit/integration tests
npm run lint         # ESLint check
```

### Environment Variables

```env
# API Configuration
VITE_API_BASE_URL=http://localhost:8000/api

# Mock Mode
VITE_USE_MOCK=true           # Enable mock mode
VITE_FORCE_MOCK=false        # Lock mock mode (prevents toggling)

# Feature Flags
VITE_ENABLE_ANALYTICS=true
VITE_ENABLE_CHAT=true
```

### Deployment

**Target:** Vercel (recommended) or any static host

**Build Output:**
- `dist/` directory
- Static files (HTML, CSS, JS)
- Assets

**PWA Configuration:**
- `manifest.json` - App metadata
- Service worker (future)
- Offline support (future)

### Performance Optimizations

- Code splitting (lazy routes)
- Image optimization
- Tree shaking
- Minification
- Gzip compression

---

## Additional Resources

- [API Contracts](./FRONTEND_API_CONTRACTS.md) - Detailed API documentation
- [Changelog](./FRONTEND_CHANGELOG.md) - Change history
- [Backend Documentation](../docs/BACKEND.md) - Backend architecture
- [Phase Documentation](../docs/phases/) - Phase completion reports

---

**Last Updated:** 2026-01-11  
**Maintained By:** RentalConnects Development Team

