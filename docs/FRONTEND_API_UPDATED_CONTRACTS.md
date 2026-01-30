## RentalConnects Frontend API Contracts (High Level)

This document describes the _expected_ Django/DRF API shapes consumed by the current frontend. It is intentionally high-level: the backend may extend responses, but should not break these contracts.

### Conventions

- All endpoints are assumed to be prefixed consistently (e.g. `/api/...`) via `axios` base URL configuration in `apiClient`.
- Responses wrap primary data in `data` where appropriate, but some service modules already accept plain lists; both shapes are supported for mocks.
- Errors: services catch axios errors and surface `{ message, code, details }` through `normalizeApiError`, and UI components expect at least a `.message` field.

### Authentication & Users

- **POST `/auth/login/`**
  - Request: `{ email, password }`
  - Response: `{ token: string, user: { id, email, full_name, role, subscription?, ... } }`
- **GET `/auth/profile/`**
  - Response: `{ user: { id, email, full_name, role, subscription?, phone?, ... } }`
  - Used by `authStore.loadSession()` to re-hydrate the user.
- **PATCH `/auth/profile/`**
  - Request: `FormData` or `{ full_name?, phone?, ... }`
  - Response: `{ user: { ... } }`
  - Used by `userService.updateProfile()` for profile updates.

### User Preferences & Account Settings

- **GET `/auth/preferences/`**
  - Response: `{ emailNotifications: boolean, smsNotifications: boolean, twoFactorAuth: boolean, profileVisibility: "public" | "private" | "friends", marketingEmails: boolean, dataSharing: boolean, language: string }`
  - Used by `preferencesService.getPreferences()` to load user account settings.
- **PATCH `/auth/preferences/`**
  - Request: `{ emailNotifications?, smsNotifications?, twoFactorAuth?, profileVisibility?, marketingEmails?, dataSharing?, language? }`
  - Response: Updated preferences object (same shape as GET response).
  - Used by `preferencesService.updatePreferences()` to save account settings.
  - In demo mode, preferences are stored in localStorage (`demo.preferences`).

### Tenant APIs

- **GET `/tenant/rentals/`**
  - Response: `[{ id, propertyId, title, address, nextDueAmount, nextDueDate, status, ... }, ...]`
  - Used in `TenantDashboard`, `TenantRentals`, and payments.
- **GET `/tenant/favorites/`**
  - Response: `[{ id, propertyId, ... }, ...]`
  - Used by `getFavorites()` for wishlist.
- **POST `/tenant/favorites/`**
  - Request: `{ propertyId }`
  - Response: `{ success: true }`
- **DELETE `/tenant/favorites/:propertyId/`**
  - Response: `{ success: true }`
- **GET `/tenant/favorites/:propertyId/`**
  - Response: `{ is_favorited: boolean }`
- **GET `/tenant/maintenance/`**
  - Response: `[{ id, title, description, status, priority, createdAt, images: [url], landlordResponse? }, ...]`
- **POST `/tenant/maintenance/`**
  - Request: `FormData` with `title`, `description`, `priority`, `propertyId?`, `images[]`.
  - Response: `{ request: { ... } }` or plain request object.
- **GET `/tenant/payments/history/`**
  - Response: `[{ id, amount, method, status, paidAt, transactionId, propertyName, ... }, ...]`
  - Used by `TenantPayments` to render the history tab.
- **GET `/tenant/payments/receipt/:id/`**
  - Response: PDF blob; frontend triggers a file download.
- **GET `/tenant/rental-history/`**
  - Response: `[{ id, propertyName, startDate, endDate, status, documentsCount, ... }, ...]`
- **POST `/tenant/rental-history/:id/reference/`**
  - Response: `{ url }` or `{ pdf: <blob> }` for reference letter download.

### Landlord APIs

- **GET `/landlord/dashboard/`**
  - Response: `{ totalProperties, monthlyRevenue, occupancyRate, pendingViewRequests, revenueChart: [...], occupancyTrend: [...], recentActivity: [...] }`
  - Used by `LandlordDashboard` for KPIs and charts.
- **GET `/properties/`**
  - Response: `[{ id, title, address, location, images, priceGhs, bedrooms, bathrooms, status, isBoosted?, ... }, ...]`
  - Used by `PropertiesPage` (landlord) and `TenantProperties` (tenant browsing).
- **POST `/properties/`** & **PATCH `/properties/:id/`**
  - Request: `FormData` or JSON including title, address, pricing, images, amenities, etc.
  - Response: property object.
- **GET `/properties/:id/`**
  - Response: full property detail including gallery, description, stats.
- **DELETE `/properties/:id/`**
  - Response: `{ success: true }`
- **GET `/landlord/bookings/`**
  - Response: list of booking requests + calendar metadata used in booking calendar and list views.
- **PATCH `/landlord/bookings/:id/`**
  - Request: `{ status: "accepted" | "declined" }`
  - Response: booking object.
- **GET `/landlord/analytics/`**
  - Response: `{ stats: { total_properties, rented_properties, ... }, revenue: { total_revenue, monthly_revenue: { [month]: amount } }, inquiries?: [...], trust?: ... }`
  - Frontend gracefully handles missing optional arrays.

### Artisan APIs

- **GET `/artisan/tasks/`**
  - Query: `status?, priority?, search?`
  - Response: `{ tasks: [{ id, title, status, priority, property, dueDate, ... }], ... }`
- **GET `/artisan/tasks/:id/`**
  - Response: full task detail used by `TaskDetailsPage`.
- **PATCH `/artisan/tasks/:id/`**
  - Request: `{ status, notes? }`
  - Response: updated task.
- **POST `/artisan/tasks/:id/photos/`**
  - Request: `FormData` with `photos[]`.
  - Response: `{ success: true, task: { ... } }`
- **GET `/artisan/earnings/summary/`**
  - Response: `{ totalEarnings, pendingEarnings, completedTasks, totalTasks, chart: [...] }`
- **GET `/artisan/earnings/history/`**
  - Response: history list for `AR_EarningsPanel`.
- **POST `/artisan/invoices/:taskId/`**
  - Response: `{ url }` or PDF blob for invoice.
- **GET `/artisan/schedule/`**
  - Query: date range.
  - Response: schedule data keyed by day for `ArtisanSchedule` calendar UI.

### Admin & Super Admin APIs

- **Admin overview**: `GET /admin/overview/`
  - Response: summary stats for `AdminDashboard` cards.
- **Admin approvals**: `GET /admin/approvals/` and bulk actions:
  - Requests: `POST /admin/approvals/bulk/` with `{ ids: [], action: "approve" | "reject" }`.
  - Response: `{ updated: number }` or updated entries.
- **Admin reports**: `GET /admin/reports/` with filters.
  - Response: aggregated report data + series for Recharts.
- **Super Admin stats**: `GET /super-admin/system-stats/`
  - Response: `{ systemHealth, roles, recentActivity, ... }` for `SuperAdminDashboard`.
- **Super Admin users**: `GET /super-admin/users/`, `POST /super-admin/users/`, `DELETE /super-admin/users/:id/`
  - Response: `users: [...]` or specific user object.
- **Mock data editor**: endpoints under e.g. `/super-admin/mock-data/` (create/update mock properties, bookings, payments) as already used by `MockDataEditor` and `mockManager`.

### Ads & Promotions

- **GET `/ads/my-boosts/`**
  - Response: `{ data: [{ id, listingId, listingTitle, packageId, packageName, views, inquiries, expiresAt }, ...] }` or bare list.
- **POST `/ads/boost/`**
  - Request: `{ packageId, listingId, reference? }`
  - Response: `{ success: true, boost: { ... } }`
- **PATCH `/ads/boost/:id/renew/`**
  - Response: updated boost.
- **DELETE `/ads/boost/:id/`**
  - Response: `{ success: true }`

### Payments & Wallet

- **GET `/payments/`**
  - Query params: `status?, payment_type?, property_id?` (constructed via `getPayments(filters)`).
  - Response: paginated list `{ results, count, ... }` or simple array.
- **GET `/payments/:id/`**
  - Response: single payment.
- **POST `/payments/`**
  - Request: `{ recipient_id, property_id, booking_id?, payment_type, amount, metadata? }`
  - Response: created payment + gateway metadata as required.
- **PATCH `/payments/:id/`**
  - Request: e.g. `{ status }`.
- **GET `/payments/history/`**
  - Response: aggregated history object for dashboards and tables.
- **POST `/payments/:id/verify/`**
  - Response: `{ success, status, ... }` after Paystack callbacks.
- **GET `/payments/history/?role=landlord`** (optional filter)
  - Landlord wallet (`LandlordWallet` page) consumes history for the current landlord and computes:
    - available balance (completed – pending),
    - total received (completed),
    - total pending (pending/processing).
- **Billing verification**: `POST /billing/verify-paystack/`
  - Request: `{ reference, planId? }` from `ProfilePage` and `UpgradeCTA`.
  - Response: `{ success: boolean, message?, subscription? }`.
  - In **demo/mock mode**, the frontend short-circuits this call and upgrades the local plan immediately so upgrade flows can be exercised without a real gateway.

### Chat & Messages

- **GET `/chat/conversations/`**
  - Response: `[{ id, participantName, lastMessage, lastMessageTime, unreadCount, ... }, ...]`
- **GET `/chat/conversations/:id/messages/`**
  - Query: `page?, page_size?`
  - Response: `{ messages: [{ id, message | content, senderId, senderName, timestamp, status?, ... }], ... }`
  - Frontend will attempt to decrypt `message` strings that start with the `rc::aes256::` prefix.
- **POST `/chat/conversations/:id/messages/`**
  - Request: `{ content }` where `content` is either plain text or ciphertext from `encryptMessage`.
  - Response: created message, echoed back with `message` or `content` field.
- **POST `/chat/messages/send/`**
  - Request: `{ recipient_id, content }` for direct messaging helpers.
- **GET `/chat/messages/unread-count/`**
  - Response: `{ count }` or `{ unread_count }`; `Sidebar` normalizes either to a number.


