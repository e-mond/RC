// src/routes/secureRoutes.jsx
import React, { lazy, Suspense } from "react";
import { useAuthStore } from "@/stores/authStore";
import { Routes, Route, Navigate } from "react-router-dom";

// Protection components
import RoleProtectedRoute from "@/routes/RoleProtectedRoute";
import FeatureProtectedRoute from "@/routes/FeatureProtectedRoute";

// Layout & shared pages (not lazy-loaded)
import DashboardLayout from "@/components/layout/DashboardLayout";
import ProfilePage from "@/pages/Profile/ProfilePage";
import NotificationsCenter from "@/pages/Notifications/NotificationsCenter";

// Lazy loaded dashboard pages
const TenantDashboard = lazy(() => import("@/pages/Dashboards/Tenant/TenantDashboard"));
const TenantRentals = lazy(() => import("@/pages/Dashboards/Tenant/TenantRentals"));
const TenantPayments = lazy(() => import("@/pages/Dashboards/Tenant/TenantPayments"));
const TenantMaintenance = lazy(() => import("@/pages/Dashboards/Tenant/TenantMaintenance"));
const TenantWishlist = lazy(() => import("@/pages/Dashboards/Tenant/TenantWishlist"));
const TenantRentalHistory = lazy(() => import("@/pages/Dashboards/Tenant/TenantRentalHistory"));
const TenantProperties = lazy(() => import("@/pages/Dashboards/Tenant/TenantProperties"));
const TenantLeasesPage = lazy(() => import("@/pages/Dashboards/Tenant/Leases/TenantLeasesPage"));
const TenantBookingsPage = lazy(() => import("@/pages/Dashboards/Tenant/Bookings/TenantBookingsPage"));
const TenantArtisansPage = lazy(() => import("@/pages/Dashboards/Tenant/TenantArtisansPage"));
const PropertyDetail = lazy(() => import("@/pages/PropertyDetail"));
const LandlordPropertiesViewPage = lazy(() => import("@/pages/Dashboards/Landlord/Properties/LandlordPropertiesViewPage"));

const LandlordDashboard = lazy(() => import("@/pages/Dashboards/Landlord/LandlordDashboard"));
const PropertiesPage = lazy(() => import("@/pages/Dashboards/Landlord/Properties/PropertiesPage"));
const PropertyDetailsPage = lazy(() => import("@/pages/Dashboards/Landlord/Properties/PropertyDetailsPage"));
const PropertyForm = lazy(() => import("@/pages/Dashboards/Landlord/Properties/PropertyForm"));
const LandingBookingPage = lazy(() => import("@/pages/Dashboards/Landlord/Bookings/LandingBookingPage"));
const AnalyticsDashboard = lazy(() => import("@/pages/Dashboards/Landlord/Analytics/AnalyticsDashboard"));
const LandlordWallet = lazy(() => import("@/pages/Dashboards/Landlord/LandlordWallet"));
const LandlordLeasesPage = lazy(() => import("@/pages/Dashboards/Landlord/Leases/LandlordLeasesPage"));

const ArtisanDashboard = lazy(() => import("@/pages/Dashboards/Artisan/ArtisanDashboard"));
const ArtisanTasks = lazy(() => import("@/pages/Dashboards/Artisan/ArtisanTasks"));
const ArtisanEarnings = lazy(() => import("@/pages/Dashboards/Artisan/ArtisanEarnings"));
const TaskDetailsPage = lazy(() => import("@/pages/Dashboards/Artisan/Tasks/TaskDetailsPage"));
const ArtisanSchedule = lazy(() => import("@/pages/Dashboards/Artisan/Schedule/ArtisanSchedule"));


const MessagesInbox = lazy(() => import("@/pages/Messages/MessagesInbox"));
const ManageAds = lazy(() => import("@/pages/Ads/ManageAds"));
const PublicProfilePage = lazy(() => import("@/pages/Users/PublicProfilePage"));
const DocumentationPage = lazy(() => import("@/pages/Documentation/DocumentationPage"));
const LeaseAgreementsPage = lazy(() => import("@/pages/Documentation/LeaseAgreementsPage"));

const AdminDashboard = lazy(() => import("@/pages/Dashboards/Admin/AdminDashboard"));
const AdminApprovals = lazy(() => import("@/pages/Dashboards/Admin/components/AdminApprovals"));
const UserApprovalDetailPage = lazy(() => import("@/pages/Dashboards/Admin/UserApprovalDetailPage"));
const AdminPropertyApprovalsPage = lazy(() => import("@/pages/Dashboards/Admin/properties/AdminPropertyApprovalsPage"));
const AdminReports = lazy(() => import("@/pages/Dashboards/Admin/components/AD_ReportsPanel"));
const AdminAssignedRoles = lazy(() => import("@/pages/Dashboards/Admin/AdminAssignedRoles"));
const AdminLeasesPage = lazy(() => import("@/pages/Dashboards/Admin/Leases/AdminLeasesPage"));
const AdminPropertyDetailPage = lazy(() => import("@/pages/Dashboards/Admin/properties/AdminPropertyDetailPage"));

const SuperAdminDashboard = lazy(() => import("@/pages/Dashboards/SuperAdmin/SuperAdminDashboard"));
const SA_UsersPage = lazy(() => import("@/pages/Dashboards/SuperAdmin/users/SA_UsersPage"));
const SA_UserDetailPage = lazy(() => import("@/pages/Dashboards/SuperAdmin/users/SA_UserDetailPage"));
const SA_RolesPage = lazy(() => import("@/pages/Dashboards/SuperAdmin/roles/SA_RolesPage"));
const SA_AuditPage = lazy(() => import("@/pages/Dashboards/SuperAdmin/audit/SA_AuditPage"));
const SA_AnnouncementsPage = lazy(() => import("@/pages/Dashboards/SuperAdmin/announcements/SA_AnnouncementsPage"));
const SA_PremiumPricing = lazy(() => import("@/pages/Dashboards/SuperAdmin/pricing/SA_PremiumPricing"));
const SA_PendingUserApprovals = lazy(() => import("@/pages/Dashboards/SuperAdmin/approvals/SA_PendingUserApprovals"));
const SA_UserApprovalDetailPage = lazy(() => import("@/pages/Dashboards/SuperAdmin/approvals/SA_UserApprovalDetailPage"));
const SA_PendingPropertyApprovals = lazy(() => import("@/pages/Dashboards/SuperAdmin/approvals/SA_PendingPropertyApprovals"));
const SA_LeasesPage = lazy(() => import("@/pages/Dashboards/SuperAdmin/leases/SA_LeasesPage"));
const SA_MarketingCampaigns = lazy(() => import("@/pages/Dashboards/SuperAdmin/marketing/SA_MarketingCampaigns"));

const ProfessionChangeRequestsPage = lazy(() => import("@/pages/Dashboards/SuperAdmin/professionchangerequests/ProfessionChangeRequestsPage"));
const WithdrawalManagement = lazy(() => import("@/pages/Dashboards/SuperAdmin/withdrawal/WithdrawalManagement"));

// ────────────────────────────────────────────────────────────────
// Components
// ────────────────────────────────────────────────────────────────
const PageLoader = ({ children }) => (
  <Suspense
    fallback={
      <div className="flex items-center justify-center min-h-[60vh] text-gray-500 dark:text-gray-400">
        Loading...
      </div>
    }
  >
    {children}
  </Suspense>
);

// ────────────────────────────────────────────────────────────────
// Route configuration
// ────────────────────────────────────────────────────────────────
const allRoles = ["tenant", "landlord", "artisan", "admin", "super-admin"];

const dashboardRoutes = [
  // Tenant section
  {
    path: "tenant",
    role: "tenant",
    layout: DashboardLayout,
    children: [
      { index: true, element: <TenantDashboard /> },
      { path: "overview", element: <TenantDashboard /> },
      { path: "properties", element: <TenantProperties /> },
      { path: "properties/:id", element: <PropertyDetail /> },
      { path: "rentals", element: <TenantRentals /> },
      { path: "payments", element: <TenantPayments /> },
      { path: "maintenance", element: <TenantMaintenance /> },
      { path: "bookings", element: <TenantBookingsPage /> },
      { path: "wishlist", element: <TenantWishlist /> },
      { path: "history", element: <TenantRentalHistory /> },
      { path: "leases", element: <TenantLeasesPage /> },
      { path: "artisans", element: <TenantArtisansPage /> },
      { path: "messages", element: <MessagesInbox /> },
    ],
  },

  // Landlord section
  {
    path: "landlord",
    role: "landlord",
    layout: DashboardLayout,
    children: [
      { index: true, element: <LandlordDashboard /> },
      { path: "overview", element: <LandlordDashboard /> },
      { path: "properties", element: <PropertiesPage /> },
      { path: "properties/new", element: <PropertyForm /> },
      { path: "properties/view/:landlordId", element: <LandlordPropertiesViewPage /> },
      { path: "properties/:id", element: <PropertyDetailsPage /> },
      { path: "properties/:id/edit", element: <PropertyForm /> },
      { path: "bookings", element: <LandingBookingPage /> },

      // Premium / feature-gated
      {
        path: "analytics",
        element: (
          <FeatureProtectedRoute feature="landlord_advanced_analytics">
            <AnalyticsDashboard />
          </FeatureProtectedRoute>
        ),
      },
      {
        path: "wallet",
        element: (
          <FeatureProtectedRoute feature="digital_rent_collection">
            <LandlordWallet />
          </FeatureProtectedRoute>
        ),
      },
      {
        path: "ads",
        element: (
          <FeatureProtectedRoute feature="advertisement_manager">
            <ManageAds />
          </FeatureProtectedRoute>
        ),
      },

      { path: "messages", element: <MessagesInbox /> },
    ],
  },

  // Artisan section
  {
    path: "artisan",
    role: "artisan",
    layout: DashboardLayout,
    children: [
      { index: true, element: <ArtisanDashboard /> },
      { path: "overview", element: <ArtisanDashboard /> },
      { path: "tasks", element: <ArtisanTasks /> },
      { path: "tasks/:id", element: <TaskDetailsPage /> },
      { path: "earnings", element: <ArtisanEarnings /> },
      { path: "schedule", element: <ArtisanSchedule /> },

      {
        path: "ads",
        element: (
          <FeatureProtectedRoute feature="advertisement_manager">
            <ManageAds />
          </FeatureProtectedRoute>
        ),
      },

      { path: "messages", element: <MessagesInbox /> },
    ],
  },

  // Super Admin section ──────────────────────────────────────────
  {
    path: "super-admin",
    role: "super-admin",
    layout: DashboardLayout,
    children: [
      { index: true, element: <SuperAdminDashboard /> },
      { path: "overview", element: <SuperAdminDashboard /> },
      { path: "users", element: <SA_UsersPage /> },
      { path: "users/:id", element: <PageLoader><SA_UserDetailPage /></PageLoader> },
      { path: "users/:id/profile", element: <PageLoader><PublicProfilePage /></PageLoader> },
      { path: "users/pending", element: <PageLoader><SA_PendingUserApprovals /></PageLoader> },
      { path: "users/pending/:id", element: <PageLoader><SA_UserApprovalDetailPage /></PageLoader> },
      { path: "properties/pending", element: <PageLoader><SA_PendingPropertyApprovals /></PageLoader> },
      { path: "properties/:id", element: <PageLoader><AdminPropertyDetailPage /></PageLoader> },
      { path: "roles", element: <SA_RolesPage /> },
      { 
      path: "profession-change-requests", 
      element: <PageLoader><ProfessionChangeRequestsPage /></PageLoader> 
    },
      { path: "audit", element: <SA_AuditPage /> },
      { path: "announcements", element: <SA_AnnouncementsPage /> },
      { path: "pricing", element: <SA_PremiumPricing /> },
      { path: "marketing", element: <SA_MarketingCampaigns /> },
      { path: "leases", element: <PageLoader><SA_LeasesPage /></PageLoader> },

      { path: "withdrawals", element: <PageLoader><WithdrawalManagement /></PageLoader> },

      { path: "messages", element: <MessagesInbox /> },
    ],
  },

  // Admin section (admin + super-admin)
  {
    path: "admin",
    role: ["admin", "super-admin"],
    layout: DashboardLayout,
    children: [
      { index: true, element: <Navigate to="overview" replace /> },
      { path: "overview", element: <AdminDashboard /> },
      { path: "dashboard", element: <Navigate to="overview" replace /> },
      { path: "approvals", element: <AdminApprovals /> },
      { path: "approvals/user/:id", element: <PageLoader><UserApprovalDetailPage /></PageLoader> },
      { path: "approvals/properties", element: <PageLoader><AdminPropertyApprovalsPage /></PageLoader> },
      { path: "properties/:id", element: <PageLoader><AdminPropertyDetailPage /></PageLoader> },
      { path: "assigned-roles", element: <AdminAssignedRoles /> },
      { path: "marketing", element: <SA_MarketingCampaigns /> },
      { path: "reports", element: <AdminReports /> },
      { path: "leases", element: <AdminLeasesPage /> },
      { path: "profession-change-requests", element: <ProfessionChangeRequestsPage /> },
      { path: "messages", element: <MessagesInbox /> },
    ],
  },
];

// Recursive route renderer
const renderRoutes = (routes) =>
  routes.map(({ path, role, layout: Layout, children = [] }) => (
    <Route
      key={path}
      path={path}
      element={
        <RoleProtectedRoute allowedRoles={role}>
          {Layout ? <Layout /> : null}
        </RoleProtectedRoute>
      }
    >
      {children.map((child, index) => (
        <Route
          key={child.path || `idx-${index}`}
          index={child.index}
          path={child.path}
          element={<PageLoader>{child.element}</PageLoader>}
        />
      ))}

      <Route path="*" element={<Navigate to="." replace />} />
    </Route>
  ));

// ────────────────────────────────────────────────────────────────
// Main exported component
// ────────────────────────────────────────────────────────────────
export default function SecureRoutes() {
  const loading = useAuthStore((state) => state.loading);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-950">
        <div className="animate-spin w-14 h-14 border-4 border-emerald-600 border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <Routes>
      {/* Dashboard sections */}
      {renderRoutes(dashboardRoutes)}

      {/* Global pages - available to all authenticated users */}
      <Route
        path="profile"
        element={
          <RoleProtectedRoute allowedRoles={allRoles}>
            <DashboardLayout />
          </RoleProtectedRoute>
        }
      >
        <Route index element={<PageLoader><ProfilePage /></PageLoader>} />
      </Route>

      <Route
        path="notifications"
        element={
          <RoleProtectedRoute allowedRoles={allRoles}>
            <DashboardLayout />
          </RoleProtectedRoute>
        }
      >
        <Route index element={<PageLoader><NotificationsCenter /></PageLoader>} />
      </Route>

      {/* Public User Profiles */}
      <Route
        path="users/:id"
        element={
          <RoleProtectedRoute allowedRoles={allRoles}>
            <DashboardLayout />
          </RoleProtectedRoute>
        }
      >
        <Route index element={<PageLoader><PublicProfilePage /></PageLoader>} />
      </Route>

      {/* Documentation Pages - Public route */}
      <Route
        path="documentation"
        element={
          <RoleProtectedRoute allowedRoles={allRoles}>
            <DashboardLayout />
          </RoleProtectedRoute>
        }
      >
        <Route index element={<PageLoader><DocumentationPage /></PageLoader>} />
        <Route path="lease-agreements" element={<PageLoader><LeaseAgreementsPage /></PageLoader>} />
      </Route>

      {/* Super Admin Documentation (dedicated route) */}
      <Route
        path="super-admin/documentation"
        element={
          <RoleProtectedRoute allowedRoles={["super-admin"]}>
            <DashboardLayout />
          </RoleProtectedRoute>
        }
      >
        <Route index element={<PageLoader><DocumentationPage /></PageLoader>} />
        <Route path="lease-agreements" element={<PageLoader><LeaseAgreementsPage /></PageLoader>} />
      </Route>

      {/* Global fallback */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}