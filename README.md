
# Rental Connects (RC)

**Rental Connects (RC)** is a modern, scalable, and role-driven rental ecosystem built specifically for Ghana’s housing market.  
It connects **Tenants**, **Landlords**, **Artisans**, **Admins**, and **Super Admins** in one secure, well-structured platform — enabling seamless renting, smooth communication, and digital trust.

Live Demo: [https://rental-connects.vercel.app](https://rental-connects.vercel.app) *(coming soon)*  
GitHub: https://github.com/e-mond/RC  
Docs: `docs/FRONTEND.md` · `docs/BACKEND.md` · `docs/API_ENDPOINTS.md`

---

##  Project Status (November 2025)

### Completed 
- Fully implemented role system:
  - Tenant
  - Landlord
  - Artisan
  - Admin
  - Super Admin (highest authority)
- Role-specific dashboards
- JWT authentication with role-based redirection
- Robust RBAC (Role-Based Access Control)
- Admin permission system (toggleable by Super Admin)
- Mock + Real API toggle for development/production
- Clean, scalable folder structure

---

##  Tech Stack

| Category         | Technology                           |
|------------------|---------------------------------------|
| Framework        | React 19 + Vite                       |
| Styling          | Tailwind CSS                          |
| Animation        | Framer Motion                         |
| State Management | React Context + Zustand               |
| Routing          | React Router v7                       |
| Authentication   | JWT                                   |
| API Client       | Axios                                 |
| API Mode         | Real + Mock (toggleable)              |
| Deployment       | Vercel                                |

---

##  Folder Structure

```bash
src/
├─ main.jsx
├─ App.jsx
├─ index.css

│
├─ routes/
│  ├─ index.jsx                         # All routes exported here
│  ├─ secureRoutes.jsx                  # Authenticated routes group
│  ├─ RoleProtectedRoute.jsx            # Role-based guard
│  ├─ FeatureProtectedRoute.jsx         # Free vs Premium gate
│  └─ PublicRoute.jsx                   # Guest-only routes
│
├─ context/
│  ├─ AuthProvider.jsx                  # Auth + permissions + plan
│  ├─ PermissionsContext.js             # Optional extra layer
│  └─ FeatureAccessContext.js           # NEW (clean gate system)
│
├─ stores/
│  ├─ authStore.js                      # Zustand store for auth
│  ├─ uiStore.js                        # Sidebar state, theme, modals
│  └─ notificationStore.js              # Real-time notifications stash
│
├─ services/
│  ├─ apiClient.js                      # Axios config + interceptors
│  ├─ authService.js
│  ├─ userService.js
│  ├─ adminService.js
│  ├─ superAdminService.js
│  ├─ propertyService.js
│  ├─ landlordService.js                # NEW (landlord domain)
│  ├─ notificationService.js            # For FCM / polling
│  ├─ financeService.js                 # Rent collection, invoices
│  └─ mock/                             # Mock mode lives here
│     ├─ mockAuth.js
│     ├─ mockUsers.js
│     ├─ mockAdmin.js
│     ├─ mockLandlord.js                # NEW mock data domain
│     ├─ mockFinance.js                 # NEW mock payments
│     ├─ mockAnalytics.js               # NEW mock insights
│     └─ mockToggle.js                  # DEV/PROD switch
│
├─ components/
│  ├─ layout/
│  │  ├─ DashboardLayout.jsx
│  │  ├─ Sidebar.jsx
│  │  └─ Navbar.jsx
│  │
│  ├─ widgets/                          # Dashboard widgets
│  │  ├─ ChartWidget.jsx
│  │  ├─ StatsCard.jsx
│  │  ├─ RevenueWidget.jsx
│  │  ├─ ScreeningWidget.jsx
│  │  ├─ BookingWidget.jsx
│  │  └─ PropertiesWidget.jsx
│  │
│  │
│  ├─ auth/                          # Dashboard widgets
│  │  ├─ DemoLoginButton.jsx
│  │  ├─ LoginForm.jsx
│  │  ├─ LoginHeader.jsx
│  │  └─ LoginIllustration.jsx
│  │
│  │
│  ├─ common/                          # Dashboard widgets
│  │  ├─ ChartCard.jsx
│  │  ├─ ConfirmModal.jsx
│  │  ├─ DataTable.jsx
│  │  ├─ EmptyState.jsx
│  │  └─ Sidebar.jsx
│  │
│  │
│  ├─ widgets/                          # Dashboard widgets
│  │  ├─ ChartWidget.jsx
│  │  ├─ StatsCard.jsx
│  │  ├─ RevenueWidget.jsx
│  │  ├─ ScreeningWidget.jsx
│  │  ├─ BookingWidget.jsx
│  │  └─ PropertiesWidget.jsx
│  │
│  └─ ui/                               # Reusable UI kit
│     ├─ Button.jsx
│     ├─ Card.jsx
│     ├─ Modal.jsx
│     ├─ Badge.jsx
│     ├─ Tabs.jsx
│     ├─ Select.jsx
│     └─ Spinner.jsx
│
├─ pages/
│  ├─ Landing/
│  │  ├─ HomePage.jsx
│  │  └─ PricingPage.jsx
│  │
│  ├─ Auth/
│  │  ├─ Login.jsx
│  │  ├─ Register.jsx
│  │  └─ ForgotPassword.jsx
│  │
│  ├─ Dashboards/
│  │  ├─ Tenant/
│  │  │  └─ TenantDashboard.jsx
│  │  │
│  │  ├─ Landlord/
│  │  │  ├─ LandlordDashboard.jsx
│  │  │  ├─ analytics/
│  │  │  │  ├─ LL_AnalyticsDashboard.jsx
│  │  │  │  └─ components/
│  │  │  │     ├─ RevenueChart.jsx
│  │  │  │     ├─ OccupancyCard.jsx
│  │  │  │     └─ TrustScoreChart.jsx
│  │  │  │
│  │  │  ├─ properties/
│  │  │  │  ├─ LL_PropertyList.jsx
│  │  │  │  ├─ LL_AddProperty.jsx
│  │  │  │  ├─ LL_EditProperty.jsx
│  │  │  │  └─ LL_PropertyDetails.jsx
│  │  │  │
│  │  │  ├─ bookings/
│  │  │  │  ├─ LL_BookingCalendar.jsx
│  │  │  │  └─ LL_BookingRequests.jsx
│  │  │  │
│  │  │  ├─ screening/                  # premium
│  │  │  │  ├─ LL_ScreeningDashboard.jsx
│  │  │  │  ├─ LL_TenantInsights.jsx
│  │  │  │  └─ LL_PaymentBehavior.jsx
│  │  │  │
│  │  │  ├─ finance/                    # premium
│  │  │  │  ├─ LL_PaymentsDashboard.jsx
│  │  │  │  ├─ LL_Invoices.jsx
│  │  │  │  ├─ LL_CreateInvoice.jsx
│  │  │  │  └─ LL_Payouts.jsx
│  │  │  │
│  │  │  ├─ ads/                        # premium
│  │  │  │  ├─ LL_AdvertisementManager.jsx
│  │  │  │  └─ LL_CampaignAnalytics.jsx
│  │  │  │
│  │  │  ├─ notifications/
│  │  │  │  └─ LL_Notifications.jsx
│  │  │  │
│  │  │  └─ settings/
│  │  │     ├─ LL_ProfileSettings.jsx
│  │  │     ├─ LL_LanguageSwitcher.jsx
│  │  │     └─ LL_SecuritySettings.jsx
│  │  │
│  │  ├─ Artisan/
│  │  │  └─ ArtisanDashboard.jsx
│  │  │
│  │  ├─ Admin/
│  │  │  ├─ AdminDashboard.jsx
│  │  │  └─ components/
│  │  │     ├─ AD_UserApprovals.jsx
│  │  │     ├─ AD_PropertyApprovals.jsx
│  │  │     ├─ AD_SystemInsights.jsx
│  │  │     ├─ AD_MaintenanceOverview.jsx
│  │  │     └─ AD_ReportsPanel.jsx
│  │  │
│  │  └─ SuperAdmin/
│  │     ├─ SuperAdminDashboard.jsx
│  │     ├─ users/
│  │     ├─ roles/
│  │     └─ audit/
│
└─ utils/
   ├─ constants.js
   ├─ roles.js
   ├─ featureAccess.js                  #  free/premium gating
   ├─ helpers.js
   └─ devtools.js

```

---

##  Authentication & RBAC

- **AuthProvider**: Handles JWT, loads user profile, redirects by role
- **AuthStore (Zustand)**: Caches role & permission flags
- **RoleProtectedRoute**: Route-level access control (supports single or multiple roles)
- **Permission-based UI**: Admin widgets appear only if Super Admin grants permission

### Admin Permissions (Toggleable by Super Admin)

| Widget                  | Permission Flag            |
|-------------------------|----------------------------|
| User approvals          | `canApproveUsers`          |
| Property approvals      | `canApproveProperties`     |
| System insights         | `canViewInsights`          |
| Reports dashboard       | `canViewReports`           |
| Maintenance overview    | `canManageMaintenance`     |

---

##  Mock vs Real API Mode

Switch between mock and real backend easily:

```env
# .env
VITE_USE_MOCK_API=true   # Development (uses mock data)
VITE_USE_MOCK_API=false  # Production (real backend)
```

Controlled via `services/mock/mockToggle.js`

---

##  Setup & Installation

```bash
git clone https://github.com/e-mond/RC.git
cd RC
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173)

---

##  Roadmap

### Done 
- Authentication & RBAC
- Role-based dashboards & routing
- Super Admin panel (Users, Roles, Audit)
- Admin dynamic permissions
- Mock/Real API toggle

### In Progress 
- Landlord–Tenant rent payment workflow
- Maintenance request system
- Payment integration (Flutterwave / MTN MoMo)
- Real-time chat & notifications

### Planned
- Mobile app (React Native / Expo)
- Property verification with GPS & photos
- Credit scoring for tenants

---

##  Contact & Author

**Author**: E-Mond  
**GitHub**: [@e-mond](https://github.com/e-mond)  
**Project**: Rental Connects (RC) – Solving Ghana’s rental chaos, one connection at a time.

---

 **Star this repo if you find it useful!**  
Contributions, issues, and feature requests are welcome!
```
