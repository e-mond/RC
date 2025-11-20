## Frontend Architecture

### Overview
RentalConnects is a Vite + React 19 SPA that targets five personas (tenant, landlord, artisan, admin, super admin). The production build uses real Django/DRF endpoints but the UI can instantly switch into demo/mock mode for workshops or offline demos. Core libraries: React Router v7, Zustand, Tailwind utility classes (via authored CSS), react-hook-form + zod, Recharts, axios.

### Layered Structure
```
src/
├── assets/              // images, icons
├── components/          // reusable UI + feature atoms
│   ├── admin/           // admin only widgets (mock toggle, approvals)
│   ├── auth/            // login form, demo buttons
│   ├── common/          // layout primitives, demo banner
│   ├── landlord/, tenant/, artisan/…
│   └── ui/              // Button, Card, FormInput, Modal
├── context/             // global providers (auth store wrapper, feature access)
├── hooks/               // reusable logic (role redirect, demo mode)
├── modules/             // composition-friendly building blocks (dashboard PageHeader, MetricGrid, ActionGrid, SectionCard)
├── pages/               // route-level screens (per role + public pages)
├── routes/              // routing + protection helpers
├── services/            // API layer with hybrid mock/real logic
├── stores/              // Zustand stores (authStore, featureStore)
├── testing/             // renderWithProviders helper
├── mocks/               // axios mock adapter + structured mock data registry
└── utils/               // formatters, feature matrix, session helper
```

### State Management
- **Zustand stores**: `authStore` (session, role helpers) and `featureStore` (plan/premium flag) handle durable state. All dashboard pages subscribe via hooks to avoid prop drilling.
- **Context providers**: `FeatureAccessProvider` derives entitlements from `authStore` + `featureStore` so components can call `useFeatureAccess()` to gate premium features.
- **Session utility**: `src/utils/session.js` abstracts token/user storage and automatically prefixes keys when demo mode is active to keep demo data isolated from production credentials.

### Routing & Guards
- `App.jsx` wires public routes (`/`, `/login`, `/learn-more`, etc.) and defers all authenticated sections to `SecureRoutes`.
- `SecureRoutes` describes each role’s base path and wraps children with `DashboardLayout` via `<Outlet/>` so dashboards share sidebar/nav.
- `RoleProtectedRoute` reads `authStore` and redirects unauthenticated users to `/login` or to a supplied fallback when their role is not permitted.
- `FeatureProtectedRoute` (and the convenience hook `useFeatureAccess`) enforces premium/free features using a centralized `FEATURE_MATRIX`.
- `useRoleRedirect` provides consistent redirects after login/demo switching.

### UI Composition
- Dashboard surfaces are built from `modules/dashboard`:
  - `PageHeader` renders consistent titles/badges/actions.
  - `MetricGrid` + `MetricCard` standardize stat cards with icon accents.
  - `ActionGrid` + `ActionCard` provide uniform quick-link tiles.
  - `SectionCard` wraps complex widgets (tables, charts) in a consistent chrome.
- Shared layout lives in `components/layout` (`DashboardLayout`, `Sidebar`, `Navbar`). `DashboardLayout` now renders nested routes via `<Outlet/>`, so route components only return their content nodes.
- Role-specific widgets (e.g., `AD_UserApprovals`, `TN_MyRentals`) stay under their feature folders to keep concerns localized.

### Hybrid Mock + Real API
- `src/mocks/mockManager.js` owns demo mode state, toggling the axios-mock-adapter (`axiosMock.js`) and broadcasting changes. A new `useDemoMode` hook + `DemoModeBanner` surface the status everywhere.
- `main.jsx` calls `enableAllMocks()` whenever demo mode is active (DEV or force flag) before hydrating the app.
- `services/apiClient.js` injects JWTs via the session helper and performs auto logout on 401s (production only). Service modules gate endpoints with `isMockMode()` checks or dedicated mock implementations.
- `docs/mockData.js` centralizes seed data (properties, artisan jobs, bookings, payments, background checks, analytics). Super Admins can edit this dataset live via the new Mock Data Editor.
- The admin dashboard now includes an in-app mock toggle card so operations teams can switch between demo and live data without opening devtools.

### Demo Mode UX
- `DemoModeBanner` appears whenever mocks are active (dev or forced) and allows toggling unless `VITE_FORCE_MOCK` locks it.
- Login supports one-click role demos via `DemoLoginButtons`; the buttons call `authStore.login` with demo credentials and `useRoleRedirect` automatically navigates to the correct dashboard.
- `RoleSwitcher` (dev-only) continues to exist but now uses the corrected `/role/overview` paths and the updated auth store.

### Testing Readiness
- Configured Vitest + Testing Library via `package.json test` script and `src/test-setup.js`.
- Added `renderWithProviders` to wrap components with `FeatureAccessProvider` + `MemoryRouter`.
- Store unit tests (`authStore`, `featureStore`) ensure mutations behave deterministically.
- Routing test (`RoleProtectedRoute`) validates guard behavior and fallbacks.
- Existing service/page tests remain under `src/services/__tests__`.

### Folder Hygiene & Patterns
- Removed legacy double layout usage (pages no longer nest their own `DashboardLayout`).
- Sidebar paths, role redirects, and admin quick links now match the canonical `/tenant/...`, `/landlord/...`, `/admin/...` routes.
- Dashboard content (tenant, admin, artisan, super-admin) now leverages the dashboard module components for consistent spacing, typography, and reusability.
- Mock utilities and dataset live under `src/mocks` with clear helper functions so Phase 6 mock expansion is isolated from UI logic.

### Build & Scripts
- `npm run dev` – Vite dev server (mock mode enabled by default unless disabled).
- `npm run build` – Production build (Tree-shaken React + code splitting).
- `npm run preview` – Preview build.
- `npm run lint` – ESLint over the repo.
- `npm run test` – Vitest unit/integration suite (runs in JSDOM).

### Debug Utilities
- `DebugToggle` + `RoleSwitcher` only render in development.
- `DemoModeBanner` is environment agnostic and always visible when mocks run.
- Admin dashboard exposes `MockModeCard` for operational toggling, and Super Admin dashboard ships with the mock data editor to prep demos before launching Phase 7 E2E tests.

