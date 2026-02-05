# RentalConnects

**RentalConnects** is a modern, scalable, and role-driven rental ecosystem built specifically for Ghana's housing market.  
It connects **Tenants**, **Landlords**, **Artisans**, **Admins**, and **Super Admins** in one secure, well-structured platform — enabling seamless renting, smooth communication, and digital trust.

**Status:** Production-Ready Frontend (January 2026)  
**Live Demo:** [https://rental-connects.vercel.app](https://rental-connects.vercel.app) *(coming soon)*  
**GitHub:** https://github.com/e-mond/RC  
**Documentation (current phase):**
- `docs/BACKEND_HANDOVER.md` - **⭐ NEW** Complete backend handover with all fixes, APIs, and requirements
- `docs/PLATFORM_ARCHITECTURE.md` - High-level architecture and component structure
- `docs/PLATFORM_SUMMARY.md` - Stakeholder-friendly summary
- `docs/API_REFERENCE.md` - Frontend-expected API contract for backend team
- `docs/NOTIFICATION_SYSTEM.md` - Notification types, lifecycle, and integration points
- `docs/ARTISAN_SYSTEM.md` - End-to-end artisan flows (signup, profession change, booking)
- `docs/AI_INTEGRATION.md` - Efie AI, Trust Score, recommendations (frontend + backend expectations)

**Legacy / Extended Documentation (historical but still valid where present):**
- `FRONTEND_DOCUMENTATION.md`
- `docs/README.md`
- `docs/SECURITY.md`
- `docs/PRODUCTION_READINESS.md`
- `BACKEND_IMPLEMENTATION_GUIDE.md`

---

## Project Status (January 2026)

### Completed Features

#### Core Infrastructure
- **Role-Based Access Control (RBAC)** - Full implementation for Tenant, Landlord, Artisan, Admin, Super Admin
- **JWT Authentication** - Secure token-based authentication with role-based redirection
- **Hybrid Mock/Real API System** - Seamless switching between mock and real backend APIs
- **PWA Support** - Progressive Web App with service worker, manifest, and offline capabilities
- **Multi-language Support (i18n)** - English and French translations
- **Dark/Light Mode** - Theme switching with persistence
- **Responsive Design** - Mobile-first, works across all screen sizes

#### Features
- **Property Management** - Create, edit, view properties with approval workflow
- **Viewing Requests** - Tenant booking system with landlord approval
- **Ratings & Reviews** - Tenant → Landlord & Property, Landlord → Tenant, Artisan reviews
- **Wallet System** - Wallet setup, balance, top-up, transaction history (Landlord, Artisan, Admin, Super Admin)
- **Payments** - Paystack integration for premium upgrades and wallet top-ups
- **Messaging & Chat** - End-to-end encrypted messaging with typing indicators and read receipts
- **Ads System** - Dynamic ad placements (banner, card, inline) with role-aware visibility
- **Announcements** - Global announcement system for Admin/Super Admin
- **Notifications** - Real-time notifications with type-specific styling and priority sorting
- **Email Handling** - Password reset, account approval/suspension, payment confirmations, booking notifications
- **Super Admin Delegation** - Role and permission management
- **Freemium/Premium Model** - Feature gating based on subscription tiers

---

## Tech Stack

| Category         | Technology                           |
|------------------|---------------------------------------|
| Framework        | React 19 + Vite                       |
| Styling          | Tailwind CSS                          |
| Animation        | Framer Motion                         |
| State Management | Zustand + React Context               |
| Routing          | React Router v7                       |
| Authentication   | JWT (stored in Zustand with persistence) |
| API Client       | Axios (with interceptors)            |
| API Mode         | Real + Mock (toggleable via `VITE_USE_MOCK`) |
| Payments         | Paystack                              |
| File Uploads     | Cloudinary                            |
| Encryption       | CryptoJS (AES-256 for chat)           |
| Maps             | Leaflet/OpenLayers                    |
| Testing          | Vitest + Testing Library              |
| Deployment       | Vercel                                |

---

## Project Structure

```
src/
├─ main.jsx                          # Entry point (registers service worker)
├─ App.jsx                           # Root component (routes, global logic)
├─ index.css                         # Global styles (includes OpenLayers CSS)

├─ routes/
│  ├─ secureRoutes.jsx               # Authenticated routes
│  ├─ RoleProtectedRoute.jsx        # Role-based route guard
│  ├─ FeatureProtectedRoute.jsx     # Premium feature gate
│  └─ PublicRoute.jsx                # Guest-only routes

├─ context/
│  ├─ AuthProvider.jsx                # Auth context (legacy, use authStore)
│  ├─ FeatureAccessContext.jsx      # Feature access (free/premium)
│  ├─ LanguageContext.jsx            # Language switching
│  └─ ThemeContext.jsx               # Dark/light mode

├─ stores/
│  ├─ authStore.js                   # Zustand auth store (JWT, user, roles)
│  └─ featureStore.js                # Premium plan state

├─ services/
│  ├─ apiClient.js                   # Axios instance with interceptors
│  ├─ authService.js                 # Authentication API calls
│  ├─ propertyService.js             # Property CRUD operations
│  ├─ landlordService.js             # Landlord-specific operations
│  ├─ tenantService.js               # Tenant-specific operations
│  ├─ artisanService.js              # Artisan operations
│  ├─ adminService.js                # Admin operations
│  ├─ walletService.js               # Wallet operations (with mock support)
│  ├─ paystackService.js             # Paystack payment integration (with mock)
│  ├─ adsService.js                  # Advertisement management (with mock)
│  ├─ messagesService.js             # Messaging/chat (with mock)
│  ├─ reviewService.js               # Ratings & reviews (with mock)
│  ├─ announcementService.js         # Announcements (with mock)
│  └─ [other services...]

├─ components/
│  ├─ layout/
│  │  ├─ DashboardLayout.jsx         # Main dashboard layout
│  │  ├─ Sidebar.jsx                 # Navigation sidebar
│  │  └─ Navbar.jsx                  # Top navigation bar
│  │
│  ├─ common/
│  │  ├─ WalletDisplay.jsx           # Wallet balance display
│  │  ├─ WalletSetupModal.jsx        # Wallet setup modal
│  │  ├─ WalletTopUpModal.jsx        # Wallet top-up modal
│  │  ├─ PremiumUpgradeModal.jsx     # Premium upgrade modal
│  │  └─ [other common components...]
│  │
│  ├─ email/
│  │  ├─ EmailStatusBanner.jsx       # Email notification status
│  │  └─ AccountStatusBanner.jsx      # Account status with email info
│  │
│  ├─ reviews/
│  │  ├─ ReviewCard.jsx              # Review display card
│  │  ├─ ReviewForm.jsx              # Review submission form
│  │  ├─ ReviewsList.jsx             # Reviews list with pagination
│  │  ├─ RatingDisplay.jsx           # Star rating display
│  │  ├─ VerificationBadge.jsx       # User verification badge
│  │  └─ BackgroundStatusPanel.jsx   # Background check status
│  │
│  ├─ ads/
│  │  ├─ AdBanner.jsx                # Horizontal banner ads
│  │  ├─ AdCard.jsx                  # Card-style ads
│  │  ├─ AdInline.jsx                # Inline ads
│  │  └─ AdPlacement.jsx             # Smart ad placement
│  │
│  └─ ui/
│     ├─ Button.jsx                  # Reusable button component
│     ├─ Card.jsx                    # Card component
│     └─ [other UI components...]

├─ pages/
│  ├─ Landing/
│  │  ├─ LandingPage.jsx             # Homepage
│  │  └─ PublicProperties.jsx        # Public property listings
│  │
│  ├─ Auth/
│  │  ├─ Login.jsx                   # Login page
│  │  ├─ Signup.jsx                  # Registration page
│  │  ├─ ForgotPassword.jsx           # Password reset request
│  │  └─ ResetPassword.jsx            # Password reset form
│  │
│  ├─ Dashboards/
│  │  ├─ Tenant/
│  │  │  └─ TenantDashboard.jsx      # Tenant dashboard
│  │  │
│  │  ├─ Landlord/
│  │  │  ├─ LandlordDashboard.jsx    # Landlord dashboard
│  │  │  ├─ Properties/              # Property management
│  │  │  ├─ Bookings/                # Booking requests
│  │  │  └─ Analytics/               # Analytics (Premium)
│  │  │
│  │  ├─ Artisan/
│  │  │  └─ ArtisanDashboard.jsx     # Artisan dashboard
│  │  │
│  │  ├─ Admin/
│  │  │  ├─ AdminDashboard.jsx       # Admin dashboard
│  │  │  └─ components/              # Admin components
│  │  │
│  │  └─ SuperAdmin/
│  │     ├─ SuperAdminDashboard.jsx  # Super Admin dashboard
│  │     └─ [admin management pages...]
│  │
│  ├─ Profile/
│  │  └─ ProfilePage.jsx              # User profile (all roles)
│  │
│  ├─ Messages/
│  │  └─ MessagesInbox.jsx            # Chat/messaging interface
│  │
│  └─ PropertyDetail.jsx              # Property detail page

├─ hooks/
│  ├─ useAds.js                      # Ads fetching hook
│  ├─ useTranslation.js              # i18n translation hook
│  ├─ useLanguage.js                 # Language switching hook
│  └─ [other hooks...]

├─ utils/
│  ├─ translations.js                # Translation keys (en, fr)
│  ├─ encryption.js                 # CryptoJS encryption utilities
│  ├─ notificationHelpers.js        # Notification styling helpers
│  ├─ registerServiceWorker.js       # PWA service worker registration
│  └─ [other utilities...]

├─ mocks/
│  ├─ mockManager.js                 # Mock mode detection
│  ├─ [mock data files...]            # Mock data for development

└─ public/
   ├─ manifest.json                  # PWA manifest
   ├─ sw.js                          # Service worker
   └─ [PWA icons...]
```

---

## Setup & Installation

### Prerequisites
- Node.js 18+ and npm/yarn
- Git

### Installation

```bash
# Clone the repository
git clone https://github.com/e-mond/RC.git
cd RC

# Install dependencies
npm install

# Create .env file
cp .env.example .env

# Configure environment variables (see below)
```

### Environment Variables

Create a `.env` file in the root directory:

```env
# API Configuration
VITE_API_BASE_URL=https://rc-backend-658461237694.europe-west1.run.app/api
VITE_USE_MOCK=true                    # Set to false for production

# Paystack (for payments)
VITE_PAYSTACK_PUBLIC_KEY=pk_test_your_key_here

# Cloudinary (for file uploads)
VITE_CLOUDINARY_CLOUD_NAME=your_cloud_name
VITE_CLOUDINARY_UPLOAD_PRESET=your_preset

# Feature Flags
VITE_ENABLE_PWA=true
```

### Development

```bash
# Start development server
npm run dev

# Open http://localhost:5173
```

### Production Build

```bash
# Build for production
npm run build

# Preview production build
npm run preview
```

### Testing

```bash
# Run tests
npm test

# Run tests in watch mode
npm test -- --watch

# Run tests with coverage
npm test -- --coverage
```

---

## Authentication & RBAC

### Roles
- **Tenant** - Browse properties, book viewings, manage rentals
- **Landlord** - Manage properties, approve bookings, receive payments
- **Artisan** - Manage tasks, track earnings, receive payments
- **Admin** - Approve users/properties, view reports (permission-based)
- **Super Admin** - Full system access, role delegation, audit logs

### Authentication Flow
1. User logs in via `Login.jsx`
2. JWT token stored in Zustand `authStore` (persisted to localStorage)
3. User profile loaded with role and permissions
4. Redirected to role-specific dashboard
5. Routes protected by `RoleProtectedRoute` component

### Permission System
- Admin permissions are toggleable by Super Admin
- Permissions stored in user object: `user.permissions.canApproveUsers`, etc.
- UI components check permissions before rendering

---

## Wallet & Payments

### Wallet Setup
- **Required for:** Landlord, Artisan, Admin, Super Admin
- **Location:** Profile page (`/profile`)
- **Features:**
  - Bank account setup
  - Mobile money setup (MTN, Vodafone, AirtelTigo)
  - Balance display
  - Transaction history
  - Top-up functionality

### Payment Integration
- **Paystack** for premium upgrades and wallet top-ups
- Mock mode available for development (`VITE_USE_MOCK=true`)
- Payment verification handled automatically

---

## Email Handling

The frontend handles email notification status and confirmations:

- **Password Reset** - Email status banner with resend functionality
- **Account Approval/Suspension** - Status banners with email confirmation
- **Payment Confirmations** - Toast notifications indicating email sent
- **Booking Confirmations** - Email notifications for accept/decline
- **Message Notifications** - Email alerts for new messages

All email components support i18n (English & French).

---

## Mock vs Real API Mode

Switch between mock and real backend:

```env
# Development (mock mode)
VITE_USE_MOCK=true

# Production (real API)
VITE_USE_MOCK=false
```

**Mock Mode Features:**
- In-memory data stores
- Simulated network delays
- No backend required for development
- Full feature parity with real API

**Services with Mock Support:**
- `walletService.js`
- `adsService.js`
- `paystackService.js`
- `announcementService.js`
- `messagesService.js`
- `reviewService.js`

---

## PWA (Progressive Web App)

The app is installable as a PWA:

- **Manifest:** `public/manifest.json`
- **Service Worker:** `public/sw.js`
- **Offline Support:** Cached assets for offline use
- **Install Prompt:** Available on supported browsers

---

## Internationalization (i18n)

Currently supports:
- **English** (en) - Default
- **French** (fr)

Translation keys in `src/utils/translations.js`.  
Switch language via sidebar language selector.

---

## Testing

Test suite uses Vitest and Testing Library:

```bash
# Run all tests
npm test

# Run specific test file
npm test -- MessagesInbox.encryption.test.jsx

# Watch mode
npm test -- --watch
```

**Test Coverage:**
- Service worker registration
- PWA configuration
- Authentication flows
- Component rendering
- Encryption functionality

---

## Documentation

### 📚 Master Index
**Start here:** **`DOCUMENTATION_MASTER_INDEX.md`** - Complete navigation guide to all documentation ⭐ NEW

### Core Documentation (New - January 2026)
- **`FRONTEND_ARCHITECTURE.md`** - Complete architecture and design patterns
- **`STATE_MANAGEMENT.md`** - State management guide (Zustand, Context, local state)
- **`ROUTING_GUIDE.md`** - Complete routing and navigation guide
- **`ROUTING_AND_ACCESS_CONTROL.md`** - Routing and access control guide ⭐ NEW
- **`THEMING_ACCESSIBILITY.md`** - Theming system and WCAG 2.1 AA compliance
- **`FRONTEND_API_MAP.md`** - Complete API endpoint reference
- **`API_CONSUMPTION_GUIDE.md`** - API consumption guide ⭐ NEW
- **`ERROR_HANDLING_AND_TOASTS.md`** - Error handling and toast notifications ⭐ NEW
- **`ENVIRONMENT_VARIABLES.md`** - Environment variable reference
- **`MVP_PRODUCTION_READINESS_SUMMARY.md`** - Production readiness checklist

### Testing & Security Documentation (New - January 2026)
- **`FRONTEND_TESTING_GUIDE.md`** - Comprehensive testing guide ⭐ NEW
- **`SECURITY_AND_ABUSE_TEST_NOTES.md`** - Security testing results ⭐ NEW
- **`MOBILE_ACCESSIBILITY_COMPLIANCE.md`** - Mobile & accessibility compliance ⭐ NEW
- **`MAP_FEATURES_DOCUMENTATION.md`** - Map features and 3D limitation ⭐ NEW
- **`CONSOLE_LOGGING_PRODUCTION.md`** - Console logging guidelines ⭐ NEW

### Deployment & Production (New - January 2026)
- **`HANDOFF_TO_PRODUCTION.md`** - Production handoff guide ⭐ NEW
- **`FINAL_PRODUCTION_READINESS_CHECKLIST.md`** - Production readiness checklist ⭐ NEW
- **`FINAL_STABILIZATION_SUMMARY.md`** - Complete stabilization summary ⭐ NEW

### Backend Coordination (New - January 2026)
- **`BACKEND_DEPENDENCY_CHANGES.md`** - Backend coordination log ⭐ NEW

### Existing Documentation
- **`FRONTEND_DOCUMENTATION.md`** - General frontend documentation
- **`MOCK_MODE_GUIDE.md`** - Mock mode usage guide
- **`docs/SECURITY.md`** - Security documentation
- **`docs/PRODUCTION_READINESS.md`** - Production readiness details

**For complete documentation navigation, see `DOCUMENTATION_MASTER_INDEX.md`**

---

## Roadmap

### Completed
- Authentication & RBAC
- Role-based dashboards & routing
- Property management
- Wallet & payments
- Messaging & chat
- Ratings & reviews
- Ads system
- Email handling
- PWA setup
- i18n support

### In Progress
- Enhanced analytics
- Advanced search filters
- Mobile app (React Native)

### Planned
- Real-time notifications (WebSocket)
- Advanced reporting
- Credit scoring for tenants
- Property verification with GPS

---

## Contributing

Contributions are welcome! Please:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## License

This project is licensed under the MIT License.

---

## Author

**E-Mond**  
**GitHub:** [@e-mond](https://github.com/e-mond)  
**Project:** RentalConnects – Solving Ghana's rental chaos, one connection at a time.

---

**Star this repo if you find it useful!**  
Contributions, issues, and feature requests are welcome!
