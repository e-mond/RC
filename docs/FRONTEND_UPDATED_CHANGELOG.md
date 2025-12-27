## Frontend Changelog

> All notable frontend changes for RentalConnects are documented here. This file complements the per-phase reports in `docs/phases`.

###  Freemium Hardening, Encryption, Language, and Docs

- **Freemium & Feature Matrix**
  - Replaced the legacy `FEATURE_MATRIX` in `utils/featureAccess` with a normalized, lower_snake_case matrix.
  - Added explicit entries for:
    - `direct_messaging` (tenant-only, premium),
    - `landlord_advanced_analytics` (premium),
    - `advertisement_manager` (premium for landlord and artisan),
    - and clarified cross-role basics (`basic_notifications`, artisan earnings/messages, system-level admin features).
  - Ensured all feature checks are funneled through `canUseFeature(plan, role, featureKey)` and `listFeaturesForRole`.

- **Route-Level Premium Gating**
  - Updated `secureRoutes` to wrap:
    - `/landlord/analytics` with `FeatureProtectedRoute feature="landlord_advanced_analytics"`
    - `/landlord/ads` and `/artisan/ads` with `FeatureProtectedRoute feature="advertisement_manager"`.
  - This keeps basic landlord dashboards available on the free plan while reserving advanced analytics and ad management for premium accounts.

- **Secure Chat Encryption (CryptoJS)**
  - Implemented `utils/encryption` using AES-256 + PBKDF2 (CryptoJS) with a defensive envelope format: `rc::aes256::<ivBase64>::<cipherBase64>`.
  - Added helper functions:
    - `savePassphrase`, `loadPassphrase` for client-side passphrase persistence,
    - `deriveKey`, `encryptMessage`, and `decryptMessage` with safe fallbacks.
  - Wired `MessagesInbox` to:
    - Load/store a per-user passphrase and expose a small “Encryption: On/Off” badge + prompt in the chat header.
    - Encrypt outbound messages when a passphrase is set and decrypt inbound messages that use the RentalConnects prefix, while gracefully rendering legacy/plaintext content.

- **Language Context (i18n Readiness)**
  - Implemented `LanguageContext` with a `LanguageProvider` and `useLanguage` hook (`hooks/useLanguage` shim) to manage app language (`en` / `fr` for now).
  - Persisted language to `rc-language` and keep `document.documentElement.lang` in sync for accessibility and SEO.
  - Wrapped the root tree in `LanguageProvider` in `main.jsx`, alongside `ThemeProvider` and `FeatureAccessProvider` to make the language state globally available.

- **Chat UX Enhancements**
  - Extended `MessagesInbox` to:
    - Decrypt messages on load via `decryptMessage` when a passphrase is present.
    - Send structured payloads (`{ content }`) through `sendMessage`, preserving compatibility with the existing chat service API.
    - Maintain optimistic UI updates and message status badges even when encryption is enabled.

- **Documentation**
  - Added `docs/FRONTEND_UPDATED_OVERVIEW.md` summarizing architecture, state management, routing, freemium logic, role enforcement, and hybrid mock mode.
  - Added `docs/FRONTEND_API_UPDATED_CONTRACTS.md` outlining the high-level request/response shapes the frontend expects from Django/DRF services, grouped by role and domain (auth, tenant, landlord, artisan, admin, super-admin, payments, chat, ads).
  - Created this `docs/FRONTEND_UPDATED_CHANGELOG.md` file to track frontend evolution beyond the initial phase-specific reports.

### 2025-12-23 – Theme Fixes, Language Switch, Account Settings, and Enhanced Mock Data

- **Theme Implementation Fix**
  - Fixed `ThemeContext` to properly apply Tailwind's `dark` class
  - Theme now correctly toggles between light and dark modes across all components.
  - Theme persistence works correctly via localStorage.

- **Language Switch UI**
  - Added language switch icon/button to both `Navbar` and `Sidebar` components.
  - Language dropdown shows available languages (English, Français) with visual indicators.
  - Language selection persists and syncs with `LanguageContext`.
  - Language preference is also saved in account settings preferences.

- **Enhanced Account Settings**
  - Expanded `ProfilePage` with comprehensive account settings section:
    - Email notifications toggle (works in demo mode)
    - SMS notifications toggle (works in demo mode)
    - Two-factor authentication toggle (works in demo mode)
    - Profile visibility dropdown (Public/Private/Friends only)
    - Marketing emails toggle
    - Language selector (syncs with global language context)
  - Created `preferencesService.js` to handle user preferences API calls.
  - Preferences are stored in localStorage in demo mode (`demo.preferences`).
  - Added mock endpoints in `axiosMock.js` for `/auth/preferences/` GET and PATCH.
  - All settings work seamlessly in demo mode with immediate visual feedback.

- **Super Admin Announcements Page**
  - Created `SA_AnnouncementsPage` for Super Admin to post global announcements.
  - Route: `/super-admin/announcements` (already registered in secureRoutes).
  - Uses existing `notificationService` to fetch announcement-type notifications.
  - Form allows Super Admin to draft announcements that will appear for all roles.

- **Enhanced Mock Data**
  - Added mock data for:
    - Announcements (platform-wide notifications)
    - Wallet transactions (credits, debits, pending/completed statuses)
    - Ads (banner, card, inline types with different sizes and durations)
  - All mock data follows consistent structure and can be extended easily.

- **Route Verification**
  - Verified all routes are properly registered in `secureRoutes.jsx`.
  - Super Admin announcements route is accessible at `/super-admin/announcements`.
  - All role-based routes are protected with appropriate guards.

### 2025-12-23 – Demo Mode, Ads Coverage, Wallet UI, and Error Handling

- **Demo Mode Bootstrapping**
  - Updated `main.jsx` to call `enableAllMocks()` whenever `isMockMode()` is true before hydrating `authStore`, ensuring that `/auth/profile` and role dashboards load correctly in demo mode instead of redirecting to `/login`.
  - Kept `useDemoMode` and `DemoModeBanner` as the interactive toggles while guaranteeing persistence via `localStorage` and consistent behaviour across reloads.
- **Ads Coverage for Freemium Users**
  - Expanded `AdBanner` into a role-aware banner:
    - Tenants on the free plan see upgrade-focused messaging and an ad-free promise for Premium.
    - Landlords and artisans see promotion-focused copy encouraging use of the boost/ad manager flows.
  - Injected `AdBanner` into `DashboardLayout` so all tenant, landlord, and artisan dashboard pages surface ads where appropriate, while admins and super admins never see consumer ads.
- **Landlord Wallet & Payments**
  - Implemented a `LandlordWallet` page with a wallet-style overview for rent collections using `paymentService.getPaymentHistory()`:
    - Computes available balance, total received, and total pending from history.
    - Shows a “Recent Transactions” list with basic amounts, tenants/descriptions, dates, and statuses.
  - Registered `/landlord/wallet` under secure routes, gated by the `digital_rent_collection` feature flag so only premium landlords see the wallet UI.
- **Profile Upgrade in Demo Mode**
  - Updated `ProfilePage` `verifyPayment` logic to short-circuit in demo/mock mode using `isMockMode()`:
    - In demo, the plan is upgraded locally to `premium` without calling the real Paystack verification endpoint.
    - In live mode, the existing `/api/billing/verify-paystack/` flow remains unchanged.
- **Theme & Layout Polish**
  - Simplified `LandlordDashboard` by removing redundant manual dark-mode toggling and relying solely on `ThemeContext` for global theme state.
  - Extended landlord quick actions to include a direct link to the analytics route, improving discoverability in both live and demo modes.
