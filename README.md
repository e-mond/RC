src/
│
├── assets/
│   ├── images/
│   ├── icons/
│   └── logo.svg
│
├── components/
│   ├── common/
│   │   ├── Navbar.jsx
│   │   ├── Sidebar.jsx
│   │   ├── Footer.jsx
│   │   ├── ProtectedRoute.jsx
│   │   ├── ErrorBoundary.jsx
│   │   ├── LoadingSpinner.jsx
│   │   ├── EmptyState.jsx
│   │   └── Modal.jsx
│   │
│   ├── forms/
│   │   ├── TextInput.jsx
│   │   ├── SelectInput.jsx
│   │   ├── FileUpload.jsx
│   │   ├── PasswordInput.jsx
│   │   └── ValidationError.jsx
│   │
│   ├── tenant/
│   │   ├── RentPaymentModal.jsx
│   │   ├── RentalCard.jsx
│   │   ├── TenantSummaryCard.jsx
│   │   └── TenantNotifications.jsx
│   │
│   ├── landlord/
│   │   ├── PropertyCard.jsx
│   │   ├── LandlordSummaryCard.jsx
│   │   ├── MaintenanceRequestCard.jsx
│   │   └── PayoutCard.jsx
│   │
│   ├── admin/
│   │   ├── UserManagementCard.jsx
│   │   ├── SystemStatsCard.jsx
│   │   ├── ReportsCard.jsx
│   │   └── AdminNotifications.jsx
│   │
│   ├── artisan/
│   │   ├── JobCard.jsx
│   │   ├── ArtisanSummaryCard.jsx
│   │   └── TaskStatusTag.jsx
│   │
│   └── superadmin/
│       ├── PlatformStatsCard.jsx
│       ├── AuditLogRow.jsx
│       └── SaaSConfigCard.jsx
│
│
├── layouts/
│   ├── AdminLayout.jsx
│   ├── TenantLayout.jsx
│   ├── LandlordLayout.jsx
│   ├── ArtisanLayout.jsx
│   ├── SuperAdminLayout.jsx
│   └── AuthLayout.jsx
│
│
├── pages/
│   ├── auth/
│   │   ├── Login.jsx
│   │   ├── RegisterTenant.jsx
│   │   ├── RegisterLandlord.jsx
│   │   └── ForgotPassword.jsx
│   │
│   ├── tenant/
│   │   ├── TenantDashboard.jsx
│   │   ├── TN_MyRentals.jsx
│   │   ├── TN_Payments.jsx
│   │   ├── TN_Support.jsx
│   │   └── TN_Profile.jsx
│   │
│   ├── landlord/
│   │   ├── LandlordDashboard.jsx
│   │   ├── Properties.jsx
│   │   ├── Tenants.jsx
│   │   ├── Maintenance.jsx
│   │   ├── Payouts.jsx
│   │   └── LandlordProfile.jsx
│   │
│   ├── artisan/
│   │   ├── ArtisanDashboard.jsx
│   │   ├── Jobs.jsx
│   │   ├── CompletedJobs.jsx
│   │   └── ArtisanProfile.jsx
│   │
│   ├── admin/
│   │   ├── AdminDashboard.jsx
│   │   ├── UsersManagement.jsx
│   │   ├── Reports.jsx
│   │   ├── SystemLogs.jsx
│   │   └── AdminProfile.jsx
│   │
│   └── superadmin/
│       ├── SuperAdminDashboard.jsx
│       ├── SaaSConfig.jsx
│       ├── PlatformAnalytics.jsx
│       ├── AllOrganizations.jsx
│       └── SuperAdminProfile.jsx
│ ├─ users/
             │   ├─ SA_UsersPage.jsx
             │   ├─ SA_UserTable.jsx
             │   ├─ SA_CreateUserModal.jsx
             │   └─ SA_DeleteUserModal.jsx
             ├─ roles/
             │   ├─ SA_RolesPage.jsx
             │   ├─ SA_RoleTable.jsx
             │   └─ SA_AssignRoleModal.jsx
             └─ audit/
                 ├─ SA_AuditPage.jsx
                 ├─ SA_AuditFilter.jsx
                 └─ SA_AuditTable.jsx
│
├── services/
│   ├── apiClient.js
│   │
│   ├── authService.js
│   ├── tenantService.js
│   ├── landlordService.js
│   ├── artisanService.js
│   ├── adminService.js
│   ├── superAdminService.js
│   └── fileUploadService.js
│
│
├── state/
│   ├── useAuthStore.js
│   ├── useUserStore.js
│   ├── useNotificationStore.js
│   └── store.js
│
│
├── hooks/
│   ├── useFetch.js
│   ├── useAuth.js
│   ├── useDebounce.js
│   ├── usePagination.js
│   ├── usePermissions.js
│   └── useOnlineStatus.js
│
│
├── context/
│   ├── ThemeContext.jsx
│   └── NotificationContext.jsx
│
│
├── router/
│   ├── index.jsx
│   ├── ProtectedRoutes.jsx
│   ├── TenantRoutes.jsx
│   ├── AdminRoutes.jsx
│   ├── LandlordRoutes.jsx
│   ├── ArtisanRoutes.jsx
│   └── SuperAdminRoutes.jsx
│
│
├── mocks/
│   ├── axiosMock.js
│   └── mockData/
│       ├── tenantRentals.json
│       ├── landlordProperties.json
│       └── systemAnalytics.json
│
│
├── utils/
│   ├── formatDate.js
│   ├── formatCurrency.js
│   ├── validators.js
│   ├── mergeClasses.js
│   ├── generateId.js
│   └── permissions.js
│
│
├── styles/
│   ├── globals.css
│   ├── variables.css
│   └── tailwind.css
│
│
├── App.jsx
├── main.jsx
└── index.html
