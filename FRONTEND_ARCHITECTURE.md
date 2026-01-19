# Frontend Architecture

**Date:** January 2026  
**Status:** Production-Ready  
**Purpose:** Complete architecture documentation for RentalConnects frontend

---

## Overview

RentalConnects frontend is a **Single Page Application (SPA)** built with **React 19** and **Vite 7**. It follows a component-based architecture with clear separation of concerns, role-based access control, and a hybrid mock/real API system.

---

## Architecture Principles

### 1. Component-Based Design
- **Reusable Components:** UI components are modular and reusable
- **Container/Presentational Pattern:** Logic separated from presentation
- **Composition over Inheritance:** Components composed from smaller pieces

### 2. Separation of Concerns
- **Services Layer:** All API calls abstracted into service files
- **State Management:** Global state in Zustand stores, local state in components
- **Routing:** Route definitions centralized in `secureRoutes.jsx`

### 3. Security First
- **JWT Authentication:** Token-based auth with automatic refresh
- **Role-Based Access Control (RBAC):** Routes and features protected by role
- **XSS Protection:** DOMPurify sanitization for user-generated content
- **URL Validation:** Parameter validation to prevent injection attacks

### 4. Performance Optimization
- **Lazy Loading:** Routes loaded on-demand
- **Code Splitting:** Automatic via React.lazy()
- **Memoization:** React.memo and useMemo where appropriate
- **PWA Support:** Service worker for offline capabilities

---

## Technology Stack

### Core Framework
- **React 19.2.0** - UI library
- **Vite 7.2.2** - Build tool and dev server
- **React Router v7** - Client-side routing

### State Management
- **Zustand 5.0.8** - Global state (auth, features)
- **React Context** - Theme, language, feature access
- **Local State** - useState/useReducer for component state

### Styling
- **Tailwind CSS 4.1.17** - Utility-first CSS
- **Framer Motion 12.23.24** - Animations
- **CSS Modules** - Component-scoped styles (where needed)

### Data Fetching
- **Axios 1.13.2** - HTTP client
- **Custom Services** - API abstraction layer
- **Mock System** - Development/demo mode support

### Forms & Validation
- **React Hook Form 7.66.1** - Form management
- **Zod 4.1.12** - Schema validation
- **@hookform/resolvers 5.2.2** - Form validation integration

### Additional Libraries
- **react-hot-toast 2.6.0** - Toast notifications
- **date-fns 4.1.0** - Date formatting
- **crypto-js 4.2.0** - Encryption (chat messages)
- **dompurify 3.3.1** - XSS protection
- **react-i18next 25.6.1** - Internationalization

---

## Project Structure

```
src/
├── main.jsx                    # Entry point (registers service worker)
├── App.jsx                     # Root component (routing, global logic)
├── index.css                   # Global styles

├── routes/                      # Routing configuration
│   ├── secureRoutes.jsx        # Authenticated route definitions
│   ├── RoleProtectedRoute.jsx  # Role-based route guard
│   ├── FeatureProtectedRoute.jsx # Premium feature gate
│   └── PublicRoute.jsx         # Guest-only routes

├── stores/                     # Zustand state stores
│   ├── authStore.js           # Authentication state (persisted)
│   └── featureStore.js        # Subscription/feature state (persisted)

├── context/                     # React Context providers
│   ├── AuthProvider.jsx        # Legacy (deprecated, use authStore)
│   ├── FeatureAccessContext.jsx # Feature access (free/premium)
│   ├── LanguageContext.jsx    # Language switching
│   └── ThemeContext.jsx        # Dark/light mode

├── services/                    # API service layer
│   ├── apiClient.js           # Axios instance with interceptors
│   ├── authService.js         # Authentication API calls
│   ├── propertyService.js     # Property CRUD operations
│   ├── landlordService.js     # Landlord-specific operations
│   ├── tenantService.js       # Tenant-specific operations
│   ├── artisanService.js      # Artisan operations
│   ├── adminService.js        # Admin operations
│   ├── walletService.js       # Wallet operations (with mock)
│   ├── paystackService.js     # Paystack integration (with mock)
│   ├── messagesService.js     # Messaging/chat (with mock)
│   ├── reviewService.js       # Ratings & reviews (with mock)
│   ├── announcementService.js # Announcements (with mock)
│   └── [other services...]

├── components/                 # Reusable UI components
│   ├── layout/                 # Layout components
│   │   ├── DashboardLayout.jsx # Main dashboard layout
│   │   ├── Sidebar.jsx        # Navigation sidebar
│   │   ├── Navbar.jsx         # Top navigation bar
│   │   └── Footer.jsx         # Footer component
│   │
│   ├── common/                 # Shared components
│   │   ├── WalletDisplay.jsx  # Wallet balance display
│   │   ├── WalletSetupModal.jsx # Wallet setup modal
│   │   ├── PremiumUpgradeModal.jsx # Premium upgrade modal
│   │   ├── UpgradeBanner.jsx  # Upgrade prompt banner
│   │   └── [other common components...]
│   │
│   ├── ui/                     # Base UI components
│   │   ├── Button.jsx         # Reusable button
│   │   ├── Card.jsx           # Card component
│   │   ├── FormInput.jsx      # Form input wrapper
│   │   └── [other UI components...]
│   │
│   ├── auth/                   # Authentication components
│   │   ├── LoginForm.jsx      # Login form
│   │   ├── DemoLoginButtons.jsx # Demo login buttons
│   │   └── [other auth components...]
│   │
│   └── [role-specific components...]

├── pages/                      # Page components
│   ├── Landing/               # Public landing pages
│   │   ├── LandingPage.jsx   # Homepage
│   │   ├── PublicProperties.jsx # Public property listings
│   │   └── components/        # Landing page components
│   │
│   ├── Auth/                   # Authentication pages
│   │   ├── Login.jsx          # Login page
│   │   ├── Signup.jsx        # Registration page
│   │   ├── ForgotPassword.jsx # Password reset request
│   │   └── ResetPassword.jsx  # Password reset form
│   │
│   ├── Dashboards/             # Role-specific dashboards
│   │   ├── Tenant/              # Tenant dashboard pages
│   │   ├── Landlord/          # Landlord dashboard pages
│   │   ├── Artisan/           # Artisan dashboard pages
│   │   ├── Admin/             # Admin dashboard pages
│   │   └── SuperAdmin/        # Super Admin dashboard pages
│   │
│   └── [other pages...]

├── hooks/                       # Custom React hooks
│   ├── useAds.js              # Ads fetching hook
│   ├── useTranslation.js      # i18n translation hook
│   ├── useLanguage.js         # Language switching hook
│   ├── useDemoMode.js         # Mock mode toggle hook
│   └── [other hooks...]

├── utils/                       # Utility functions
│   ├── session.js             # Session management
│   ├── sanitize.js            # DOMPurify sanitization
│   ├── validateParams.js      # URL parameter validation
│   ├── encryption.js          # CryptoJS encryption utilities
│   ├── translations.js        # i18n translation keys
│   ├── roles.js               # Role constants and helpers
│   └── [other utilities...]

├── config/                      # Configuration files
│   └── apiEndpoints.js        # Centralized API endpoint configuration

├── mocks/                       # Mock data and utilities
│   ├── mockManager.js         # Mock mode detection
│   ├── axiosMock.js           # Axios mock adapter
│   └── [mock data files...]

└── public/                      # Static assets
    ├── manifest.json           # PWA manifest
    ├── sw.js                   # Service worker
    └── [PWA icons...]
```

---

## Design Patterns

### 1. Service Layer Pattern

All API calls are abstracted into service files:

```javascript
// services/propertyService.js
export const getProperties = async () => {
  if (USE_MOCK) {
    return mockProperties;
  }
  const response = await apiClient.get(API_ENDPOINTS.PROPERTIES.BASE);
  return response.data;
};
```

**Benefits:**
- Single source of truth for API calls
- Easy to switch between mock and real API
- Centralized error handling
- Consistent response formatting

### 2. Store Pattern (Zustand)

Global state managed in Zustand stores:

```javascript
// stores/authStore.js
export const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      login: async (credentials) => { /* ... */ },
      logout: () => { /* ... */ },
    }),
    { name: 'rc-auth-storage' }
  )
);
```

**Benefits:**
- Persistent state (localStorage)
- Simple API (no boilerplate)
- Type-safe (with TypeScript)
- DevTools support

### 3. Protected Route Pattern

Routes protected by role and feature:

```javascript
// routes/secureRoutes.jsx
<Route
  path="analytics"
  element={
    <FeatureProtectedRoute feature="landlord_advanced_analytics">
      <AnalyticsDashboard />
    </FeatureProtectedRoute>
  }
/>
```

**Benefits:**
- Declarative route protection
- Automatic redirects
- Clear access control

### 4. Custom Hooks Pattern

Reusable business logic in hooks:

```javascript
// hooks/useAds.js
export default function useAds(options) {
  const [ads, setAds] = useState([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    fetchAds(options).then(setAds);
  }, []);
  
  return { ads, loading };
}
```

**Benefits:**
- Reusable logic
- Separation of concerns
- Easy testing

---

## Data Flow

### 1. Authentication Flow

```
User Login
  ↓
LoginForm.jsx (UI)
  ↓
authService.login() (Service)
  ↓
apiClient.post() (HTTP)
  ↓
Backend API
  ↓
Response → authStore.login() (Store)
  ↓
State Update → Component Re-render
  ↓
Redirect to Dashboard
```

### 2. Property Creation Flow

```
Landlord clicks "Add Property"
  ↓
PropertyForm.jsx (UI)
  ↓
propertyService.createProperty() (Service)
  ↓
apiClient.post() (HTTP)
  ↓
Backend API
  ↓
Response → Toast Notification
  ↓
Redirect to Properties List
```

### 3. Mock Mode Flow

```
Component calls service
  ↓
Service checks VITE_USE_MOCK
  ↓
If true → Return mock data
If false → Make real API call
  ↓
Return data to component
```

---

## State Management

### Global State (Zustand)

**authStore.js:**
- User authentication state
- JWT token
- Role information
- Session persistence

**featureStore.js:**
- Subscription plan (free/premium)
- Feature access flags
- Plan persistence

### Context State

**ThemeContext:**
- Dark/light mode
- Theme persistence

**LanguageContext:**
- Current language (en/fr)
- Language persistence

**FeatureAccessContext:**
- Feature access checks
- Premium restrictions

### Local State

- Component-specific state (useState)
- Form state (React Hook Form)
- UI state (modals, dropdowns, etc.)

---

## Routing Architecture

### Route Types

1. **Public Routes:** Accessible to all (landing, login, signup)
2. **Auth Routes:** Guest-only (login, signup)
3. **Protected Routes:** Require authentication
4. **Role-Protected Routes:** Require specific role
5. **Feature-Protected Routes:** Require premium subscription

### Route Protection

```javascript
// Role-based protection
<RoleProtectedRoute allowedRoles={["landlord"]}>
  <LandlordDashboard />
</RoleProtectedRoute>

// Feature-based protection
<FeatureProtectedRoute feature="landlord_advanced_analytics">
  <AnalyticsDashboard />
</FeatureProtectedRoute>
```

---

## Security Architecture

### 1. Authentication
- JWT tokens stored in localStorage
- Automatic token refresh on 401
- Token expiration validation
- Session cleanup on logout

### 2. Authorization
- Role-based route protection
- Feature-based component gating
- Permission checks in services
- Backend validation (always verify)

### 3. XSS Protection
- DOMPurify sanitization
- URL parameter validation
- Input validation (Zod schemas)
- Content Security Policy (CSP)

### 4. API Security
- CORS configuration
- Credentials included in requests
- Token injection via interceptors
- Error handling (no sensitive data exposed)

---

## Performance Optimization

### 1. Code Splitting
- Lazy loading routes
- Dynamic imports for heavy components
- Automatic code splitting via Vite

### 2. Caching
- Service worker for offline support
- Browser caching for static assets
- API response caching (where appropriate)

### 3. Optimization Techniques
- React.memo for expensive components
- useMemo for expensive calculations
- useCallback for stable function references
- Debouncing for search inputs

---

## Error Handling

### 1. API Errors
- Centralized error handling in `apiClient.js`
- User-friendly error messages
- Toast notifications for errors
- Automatic retry for network errors

### 2. Component Errors
- Error boundaries (future implementation)
- Try-catch in async operations
- Fallback UI for errors

### 3. Validation Errors
- Form validation (Zod schemas)
- URL parameter validation
- Input sanitization

---

## Testing Strategy

### Unit Tests
- Service functions
- Utility functions
- Store actions

### Integration Tests
- API integration
- Authentication flows
- Route protection

### Component Tests
- UI component rendering
- User interactions
- Form submissions

---

## Development Workflow

### 1. Local Development
```bash
npm run dev          # Start dev server
npm run lint         # Run ESLint
npm test             # Run tests
```

### 2. Mock Mode
```env
VITE_USE_MOCK=true   # Enable mock mode
```

### 3. Production Build
```bash
npm run build        # Build for production
npm run preview      # Preview production build
```

---

## Best Practices

### 1. Component Structure
- Keep components small and focused
- Extract reusable logic to hooks
- Use composition over inheritance

### 2. State Management
- Use Zustand for global state
- Use Context for theme/language
- Use local state for UI state

### 3. API Calls
- Always use service layer
- Handle errors gracefully
- Show loading states

### 4. Code Organization
- Group related files together
- Use consistent naming conventions
- Document complex logic

---

## Future Enhancements

- [ ] Error boundaries for better error handling
- [ ] React Query for advanced data fetching
- [ ] TypeScript migration
- [ ] Storybook for component documentation
- [ ] E2E testing with Playwright

---

**Last Updated:** January 2026  
**Maintained By:** Frontend Team
