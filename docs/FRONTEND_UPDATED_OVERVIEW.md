## RentalConnects Frontend Updated  Overview

### Architecture & Stack

- **Tech stack**: React + Vite, React Router, Zustand, Tailwind utility classes, Recharts, react-hook-form + zod, CryptoJS, axios.
- **App type**: Single Page Application with role-based dashboards for **tenant**, **landlord**, **artisan**, **admin**, and **super-admin**.
- **Environments**: Hybrid _real API_ + _mock/demo_ mode controlled via the mock manager and UI toggles.

### Folder Structure (High Level)

- **`src/components`**: Reusable UI and feature-specific atoms (layout, landlord, tenant, artisan, admin widgets, common UI).
- **`src/pages`**: Route-level screens, grouped by domain (`Landing`, `Auth`, `Dashboards/*`, `Ads`, `Messages`, etc.).
- **`src/routes`**: Routing configuration (`secureRoutes`, `PublicRoute`, `RoleProtectedRoute`, `FeatureProtectedRoute`).
- **`src/stores`**: Zustand stores (`authStore`, `featureStore`) for auth and freemium/premium plan state.
- **`src/context`**: Cross-cutting providers (`ThemeContext`, `FeatureAccessContext`, `LanguageContext`, auth wrappers).
- **`src/services`**: API modules (tenant, landlord, artisan, admin, super-admin, payments, chat, notifications, cloudinary).
- **`src/mocks`**: Mock data registry + axios-mock-adapter configuration and demo utilities.
- **`src/utils`**: Utilities (roles, feature matrix, formatting, session, encryption, validation schemas, API error normalization).
- **`src/modules/dashboard`**: Shared dashboard composition pieces (`PageHeader`, `MetricGrid`, `ActionGrid`, `SectionCard`).

### State Management & Role Enforcement

- **`authStore`** (Zustand):
  - Persists `user` and `token` via `session` helpers.
  - Normalizes roles to lowercase (`tenant`, `landlord`, `artisan`, `admin`, `super-admin`).
  - Exposes helpers (`isTenant`, `isLandlord`, `isArtisan`, `isAdmin`, `isSuperAdmin`, `getRole`, `isAuthenticated`).
- **`featureStore`** (Zustand):
  - Tracks current subscription plan (`free` | `premium`), with helpers `setPlan`, `togglePlan`, `isPremium`.
  - Persists plan in `rc-feature-storage` so freemium/premium choice survives reloads.
- **`FeatureAccessContext`**:
  - Merges `authStore` role + `featureStore` plan with the centralized `FEATURE_MATRIX` in `utils/featureAccess`.
  - Exposes `role`, `plan`, `isPremium`, `features[]`, and `can(featureKey)` for fine-grained gating.
  - Admin and super-admin are implicitly treated as _system_ plan and bypass normal freemium limits.
- **Role enforcement**:
  - **`RoleProtectedRoute`** wraps entire dashboard trees per base path (`/tenant`, `/landlord`, `/artisan`, `/admin`, `/super-admin`).
  - **`FeatureProtectedRoute`** is layered inside dashboards to gate premium-only pages such as:
    - Landlord advanced analytics (`feature="landlord_advanced_analytics"`).
    - Ad manager for landlords and artisans (`feature="advertisement_manager"`).
    - Tenant premium maintenance and other flows where `TENANT_*` feature flags are used.

### Routing & Layout

- **`App.jsx`** defines public routes and points all authenticated traffic to `SecureRoutes`.
- **`SecureRoutes`**:
  - Declares a structured `dashboardRoutes` array keyed by role and base path.
  - Wraps each role section with `DashboardLayout` via nested routing and `<Outlet />`.
  - Re-uses a unified `MessagesInbox` for role chat at paths like `/tenant/messages`, `/landlord/messages`, `/artisan/messages`, `/admin/messages`, `/super-admin/messages`.
  - Wraps advanced landlord analytics and ads manager routes with `FeatureProtectedRoute` to enforce premium access.
- **`DashboardLayout`**:
  - Shared sidebar + navbar shell across all dashboards.
  - Ensures consistent padding, scrolling, and ARIA labels for main content.

### Freemium vs Premium Behaviour

- **Tenant**:
  - Free: Property search, booking requests, wishlist, dashboard summaries, and visible ads (`AdBanner` in properties listing).
  - Premium:
    - No tenant-side ads (`AdBanner` auto-hides when `isPremium` is true).
    - Advanced flows: Payment history, maintenance requests, rental history, and encrypted direct messaging (`MessagesInbox` gated via `direct_messaging` feature).
- **Landlord**:
  - Free: Core property CRUD, bookings list/calendar, basic KPIs on `LandlordDashboard`.
  - Premium:
    - Full analytics route (`/landlord/analytics`) gated by `landlord_advanced_analytics` feature.
    - Ad manager (`/landlord/ads`) gated by `advertisement_manager` feature.
    - More advanced rent collection and invoicing flows (prepared in the API and UI but enforced as premium in the feature matrix).
- **Artisan**:
  - Free: Task management, basic earnings view, messaging.
  - Premium:
    - Promoted ads (`/artisan/ads`) through the shared `ManageAds` UI gated by `advertisement_manager` feature.
    - Extended earnings and lead dashboards (current UI is ready to be wired to plan-aware checks as needed).
- **Admin & Super Admin**:
  - Treated as system level and not billed via freemium.
  - Access to approvals, reports, feature/mocks, and system health is controlled via `ROLE_PERMISSIONS` and the system-level features in the matrix.

### Ads, Payments, Chat, and Uploads

- **Ads**:
  - Tenant-side ads: `AdBanner` and landing page `AdsSection` show promotional surfaces for non-premium tenants.
  - Self-serve promotions: `ManageAds` (+ `AdsList` and `AdCard`) provide Paystack-powered boost flows, renewable packages, and metrics for landlords/artisans with premium plans.
- **Payments**:
  - Tenant payments: `TenantPayments` + `RentPaymentModal` support mobile money, card, and bank transfer UI flows and integrate with tenant service/payment history APIs.
  - Profile upgrades: `ProfilePage` and `UpgradeCTA` use the Paystack inline widget for subscription upgrades and call the `/api/billing/verify-paystack/` endpoint for verification.
- **Chat (encrypted)**:
  - `MessagesInbox` centralises role chat with a responsive, accessible UI, typing indicators, and optimistic sends.
  - CryptoJS-backed helpers in `utils/encryption` transparently encrypt messages when a user-configured passphrase is set; ciphertext is prefixed and safely decrypted on load when the passphrase is available.
  - Tenants require a premium plan (`direct_messaging` feature) to access this screen; other roles are always allowed.
- **File uploads (Cloudinary)**:
  - `cloudinary.js` builds Cloudinary URLs on the client.
  - Property and maintenance forms use `ImageUploader` to manage selection, preview, and removal before upload; integration with backend URLs is handled by property and tenant services.

### Theming, Language, and Accessibility

- **Theme**:
  - `ThemeContext` manages `light`/`dark` mode, persisting to `rc-preferred-theme` and reflecting into `<html>` classes.
  - Navbar and sidebar both surface theme toggles for quick switches.
- **Language (i18n-ready)**:
  - `LanguageContext` and `useLanguage` expose the active language code and a setter.
  - The provider persists the language to `rc-language` and updates `document.documentElement.lang` for accessibility and SEO.
  - Full translation wiring (e.g. i18next) is prepared but not required to consume this context.
- **Accessibility**:
  - Main layout uses semantic `header`, `nav`, and `main` roles, plus ARIA labels on interactive areas.
  - Messages, dashboard cards, and menus are keyboard-friendly, and many components include `aria-label` attributes for assistive technologies.

### Hybrid Mock System

- **`mocks/mockManager`** controls demo mode, including:
  - Enabling/disabling axios-mock-adapter via simple toggles.
  - Exposing `isMockMode()` used by the `session` helper to namespace tokens for demo vs real sessions.
- **UI controls**:
  - `DemoModeBanner` surfaces mock mode status globally.
  - `MockModeCard` in the admin dashboard allows operations teams to flip demo mode (unless locked by `VITE_FORCE_MOCK`).
  - Super Admin’s `MockDataEditor` lets platform owners seed and edit mock data used across dashboards.

### Testing & Build Readiness

- **Testing**:
  - Vitest + Testing Library are configured via `test-setup.js` and `testing/renderWithProviders`.
  - Store and guard tests exist for `authStore`, `featureStore`, and `RoleProtectedRoute` to stabilize regressions.
- **Build**:
  - `npm run lint` for ESLint.
  - `npm run test` for the unit/integration suite.
  - `npm run build` to generate the production bundle and `npm run preview` to locally inspect it.


