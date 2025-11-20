## Backend Architecture (Django + DRF Blueprint)

Although the backend lives in a separate repository, the frontend expects a Django REST API with the following structure.

### Core Services
1. **Authentication**
   - Token-based (JWT) auth via `POST /auth/login`, `GET /auth/profile`, `POST /auth/forgot-password`, `POST /auth/reset-password/<token>`.
   - Roles: tenant, landlord, artisan, admin, super-admin.
   - Subscription tiers stored on the user model (`subscription` field).
2. **Property Management**
   - `Property` model with owner FK, amenities (M2M), geo fields (lat/lng), status (`draft|pending|published|archived`).
   - DRF viewsets under `/landlord/properties/` support CRUD + media uploads (multipart).
   - Amenities endpoint `/landlord/amenities/`.
3. **Bookings & Viewings**
   - `BookingRequest` model linking tenant + property + desired date/time.
   - Landlord endpoints `/landlord/bookings/` & `/landlord/bookings/<id>/respond`.
4. **Payments**
   - `PaymentIntent` + `Payment` models supporting mobile money and card channels.
   - Tenant endpoints `/tenant/payments` (list/history), `/tenant/rentals/<id>/pay`.
5. **Maintenance & Artisan Jobs**
   - `MaintenanceRequest` (tenant initiated) + `ArtisanTask`.
   - Admin oversight endpoints `/admin/maintenance`, artisan endpoints `/artisan/tasks`, `/artisan/tasks/<id>/photos`.
6. **Analytics**
   - Aggregated metrics served via `/landlord/dashboard/stats`, `/super-admin/system/stats`, `/admin/insights`.
   - Pipeline can be Celery + PostgreSQL materialized views.

### Model Sketch
```
class User(AbstractUser):
    role = models.CharField(choices=RoleChoices)
    subscription = models.CharField(choices=[("free","Free"),("premium","Premium")], default="free")
    permissions = JSONField(default=dict)  # additional admin flags

class Property(models.Model):
    owner = models.ForeignKey(User, related_name="properties")
    title = models.CharField(max_length=255)
    address = models.CharField(max_length=255)
    price_ghs = models.DecimalField(max_digits=12, decimal_places=2)
    status = models.CharField(choices=StatusChoices)
    bedrooms = models.PositiveSmallIntegerField(default=1)
    bathrooms = models.PositiveSmallIntegerField(default=1)
    amenities = models.ManyToManyField("Amenity")
    geo_point = gis_models.PointField(null=True, blank=True)
    media = ArrayField(models.CharField(max_length=255), default=list)

class BookingRequest(models.Model):
    property = models.ForeignKey(Property)
    tenant = models.ForeignKey(User, limit_choices_to={"role": "tenant"})
    status = models.CharField(choices=["requested","approved","declined"])
    viewing_at = models.DateTimeField()
```

### Permissions & Guards
- DRF custom permission classes mirror the frontend’s `RoleProtectedRoute`.
- Example: `IsAdminUser` extends `BasePermission` and checks `request.user.role in ("admin", "super-admin")`.
- Premium-only endpoints (tenant maintenance, landlord analytics) enforce `request.user.subscription == "premium"` unless the role is admin/super-admin.
- Soft delete (status flags) is preferred over hard deletes so the analytics pipeline can continue referencing old rows.

### Background Jobs
- **Notifications**: Celery tasks send SMS/email on booking approvals, maintenance assignment, payment receipts.
- **Analytics ETL**: nightly tasks aggregate occupancy, revenue, trust scores into reporting tables consumed by `/super-admin/system/stats`.
- **Mock Seeder**: management command reads `docs/mockData.json` (mirrors `src/mocks/mockData.js`) to seed staging/demo environments.

### Payment Workflow
1. Tenant selects rental => frontend calls `/tenant/rentals/<id>/pay`.
2. Backend creates `PaymentIntent` with provider metadata (Stripe, Paystack, MTN MoMo).
3. Client completes payment → webhook updates `Payment` + `Rental` status.
4. Receipt generated via Celery task (PDF) and stored in S3; frontend downloads via `/tenant/payments/<id>/receipt`.

### Admin & Super Admin Endpoints
- `/admin/users/pending`, `/admin/users/<id>/approve`, `/admin/users/<id>/reject`.
- `/admin/properties/pending`, `/admin/properties/<id>/approve`.
- `/super-admin/users`, `/super-admin/users/<id>`, `/super-admin/audit`.
- Feature flag endpoints `/super-admin/feature-flags` for future phases.

### Hybrid Mock Alignment
- The frontend mock data adheres to these endpoint contracts. When adding a backend endpoint, update:
  - `src/services/<feature>Service.js`
  - `src/mocks/mockData.js` or `mocks/<feature>Mock.js`
  - `docs/API_ENDPOINTS.md`
- Keep serializers aligned with the fields that the UI renders (e.g., `ownerName`, `priceGhs`, `status`). Maintaining this contract avoids ad-hoc mapping logic in the UI.

