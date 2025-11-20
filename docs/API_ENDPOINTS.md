## API Reference (Real + Mock)

| Endpoint | Method | Auth | Description | Mock Source |
|----------|--------|------|-------------|-------------|
| `/auth/login` | POST | ❌ | Login with email/password. Returns `{ token, user }`. | `mocks/axiosMock.js` |
| `/auth/profile` | GET | ✅ | Current user profile + permissions. | `mocks/axiosMock.js` |
| `/tenant/rentals` | GET | ✅ (tenant) | Fetch active rentals. | `tenantService` fallback (real endpoint only – mock data lives in `mocks/mockData.js` when demo mode) |
| `/tenant/payments` | GET | ✅ (tenant premium) | Payment history with status + receipts. | `mockDataStore.payments` used when demo mode is active. |
| `/tenant/maintenance` | GET/POST | ✅ (premium) | Maintenance requests list + creation. | Use demo data via `mockDataStore.artisanJobs`. |
| `/landlord/properties` | GET/POST`multipart` | ✅ (landlord) | Property CRUD with image uploads. | `mocks/landlordMock.js` + `propertyService` helpers. |
| `/landlord/amenities` | GET | ✅ | Available amenities. | `propertyService.getAmenities()` (mock data provided inline). |
| `/landlord/dashboard/stats` | GET | ✅ (premium) | Revenue, occupancy, inquiries, trust score. | `mocks/dashboardMock.js`. |
| `/landlord/bookings` | GET | ✅ | Viewing requests for landlord. | `landlordMock.fetchBookingsMock`. |
| `/artisan/tasks` | GET | ✅ (artisan) | Task list with filters. | `services/artisanService` dev-mode arrays. |
| `/artisan/earnings/summary` | GET | ✅ | Earnings KPIs. | Calculated from `devTasks` in `artisanService`. |
| `/admin/users/pending` | GET | ✅ (admin) | Pending user approvals. | `mocks/adminMock.js`. |
| `/admin/users/<id>/approve` | PATCH | ✅ | Approve user. | `mocks/axiosMock` dynamic mutation. |
| `/admin/properties/pending` | GET | ✅ | Pending properties. | `mocks/adminMock.js`. |
| `/super-admin/system/stats` | GET | ✅ (super-admin) | Platform totals, uptime, revenue. | `mocks/superAdminMock.js`. |
| `/super-admin/users` | GET/POST/DELETE | ✅ | Manage admin accounts. | `mocks/axiosMock.js` mutates `mockUsers`. |
| `/super-admin/audit` | GET | ✅ | Audit logs feed. | `mocks/superAdminMock.js`. |

### Request / Response Examples

**POST `/tenant/maintenance`**
```json
Request (multipart):
{
  "title": "Leaking sink",
  "description": "Kitchen sink leaking at base",
  "priority": "high",
  "images": [File]
}

Response:
{
  "request": {
    "id": "mnt_123",
    "status": "pending",
    "priority": "high",
    "createdAt": "2025-01-10T12:00:00Z"
  }
}
```

**GET `/landlord/dashboard/stats`**
```json
{
  "totalProperties": 12,
  "monthlyRevenue": 8500,
  "occupancyRate": 86,
  "pendingViewRequests": 5,
  "revenueChart": [{ "month": "Jan", "revenue": 6000 }, ...],
  "occupancyTrend": [{ "month": "Jan", "rate": 72 }, ...]
}
```

**PATCH `/admin/users/<id>/approve`**
```json
Request:
{}

Response:
{
  "success": true,
  "user": {
    "id": "u_2001",
    "fullName": "Adjoa Demo",
    "role": "tenant",
    "status": "active"
  }
}
```

### Mock Integration Notes
- Set `localStorage.demoMockEnabled = "true"` or `VITE_FORCE_MOCK=true` to enable mocks globally. `mockManager` will attach the axios adapter and `authService` will short-circuit login/profile calls.
- When mocks are active, `session` keys are prefixed with `demo.` to isolate demo tokens.
- Super Admin’s Mock Data Editor manipulates `mockDataStore` and those changes immediately feed any service that consumes `getMockData()` (e.g., payments list, bookings, property cards in demo mode).

### Adding New Endpoints
1. **Backend**: Implement DRF serializer/viewset and document it in this file.
2. **Frontend service**: Update the relevant `src/services/<feature>Service.js` file.
3. **Mock data**: Extend `src/mocks/mockData.js` or `mocks/<feature>Mock.js`.
4. **UI**: Wire components/pages to the new service function.
5. **Tests**: Add unit tests or integration tests covering the new flow (`services/__tests__` or `routes/__tests__`).

