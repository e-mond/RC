// src/routes/secureRoutes.jsx
import React, { lazy, Suspense } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import RoleProtectedRoute from "@/routes/RoleProtectedRoute";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { useAuthStore } from "@/stores/authStore";
import ProfilePage from "@/pages/Profile/ProfilePage";
import NotificationsCenter from "@/pages/Notifications/NotificationsCenter";

// ---------------------------
// Lazy Imports
// ---------------------------

// Tenant
const TenantDashboard = lazy(() => import("@/pages/Dashboards/Tenant/TenantDashboard"));
const TenantRentals = lazy(() => import("@/pages/Dashboards/Tenant/TenantRentals"));
const TenantPayments = lazy(() => import("@/pages/Dashboards/Tenant/TenantPayments"));
const TenantMaintenance = lazy(() => import("@/pages/Dashboards/Tenant/TenantMaintenance"));
const TenantWishlist = lazy(() => import("@/pages/Dashboards/Tenant/TenantWishlist"));
const TenantRentalHistory = lazy(() => import("@/pages/Dashboards/Tenant/TenantRentalHistory"));
const TenantProperties = lazy(() => import("@/pages/Dashboards/Tenant/TenantProperties"));
const PropertyDetail = lazy(() => import("@/pages/PropertyDetail"));

// Landlord
const LandlordDashboard = lazy(() => import("@/pages/Dashboards/Landlord/LandlordDashboard"));
const PropertiesPage = lazy(() => import("@/pages/Dashboards/Landlord/Properties/PropertiesPage"));
const PropertyDetailsPage = lazy(() => import("@/pages/Dashboards/Landlord/Properties/PropertyDetailsPage"));
const PropertyForm = lazy(() => import("@/pages/Dashboards/Landlord/Properties/PropertyForm"));
const LandingBookingPage = lazy(() => import("@/pages/Dashboards/Landlord/Bookings/LandingBookingPage"));
const AnalyticsDashboard = lazy(() => import("@/pages/Dashboards/Landlord/Analytics/AnalyticsDashboard"));

// Artisan
const ArtisanDashboard = lazy(() => import("@/pages/Dashboards/Artisan/ArtisanDashboard"));
const ArtisanTasks = lazy(() => import("@/pages/Dashboards/Artisan/ArtisanTasks"));
const ArtisanEarnings = lazy(() => import("@/pages/Dashboards/Artisan/ArtisanEarnings"));
const TaskDetailsPage = lazy(() => import("@/pages/Dashboards/Artisan/Tasks/TaskDetailsPage"));
const ArtisanSchedule = lazy(() => import("@/pages/Dashboards/Artisan/Schedule/ArtisanSchedule"));
const ArtisanMessages = lazy(() => import("@/pages/Dashboards/Artisan/Messages/ArtisanMessages"));

// Admin
const AdminDashboard = lazy(() => import("@/pages/Dashboards/Admin/AdminDashboard"));
const AdminApprovals = lazy(() => import("@/pages/Dashboards/Admin/components/AdminApprovals"));
const AdminReports = lazy(() => import("@/pages/Dashboards/Admin/components/AD_ReportsPanel"));

// Super Admin
const SuperAdminDashboard = lazy(() => import("@/pages/Dashboards/SuperAdmin/SuperAdminDashboard"));
const SA_UsersPage = lazy(() => import("@/pages/Dashboards/SuperAdmin/users/SA_UsersPage"));
const SA_RolesPage = lazy(() => import("@/pages/Dashboards/SuperAdmin/roles/SA_RolesPage"));
const SA_AuditPage = lazy(() => import("@/pages/Dashboards/SuperAdmin/audit/SA_AuditPage"));

// ---------------------------
// Suspense Loader
// ---------------------------
const PageLoader = ({ children }) => (
  <Suspense fallback={<div className="p-6">Loading...</div>}>
    {children}
  </Suspense>
);

// ---------------------------
// Route Config Definitions
// ---------------------------

const allRoles = ["tenant", "landlord", "artisan", "admin", "super-admin"];

const dashboardRoutes = [
  // ---------------- Tenant ----------------
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
      { path: "wishlist", element: <TenantWishlist /> },
      { path: "history", element: <TenantRentalHistory /> },
    ],
  },

  // ---------------- Landlord ----------------
  {
    path: "landlord",
    role: "landlord",
    layout: DashboardLayout,
    children: [
      { index: true, element: <LandlordDashboard /> },
      { path: "overview", element: <LandlordDashboard /> },

      // Property CRUD
      { path: "properties", element: <PropertiesPage /> },
      { path: "properties/new", element: <PropertyForm /> },
      { path: "properties/:id", element: <PropertyDetailsPage /> },
      { path: "properties/:id/edit", element: <PropertyForm /> },

      // Bookings
      { path: "bookings", element: <LandingBookingPage /> },

      // Analytics (Premium)
      { path: "analytics", element: <AnalyticsDashboard /> },
    ],
  },

  // ---------------- Artisan ----------------
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
      { path: "messages", element: <ArtisanMessages /> },
    ],
  },

  // ---------------- Super Admin ----------------
  {
    path: "super-admin",
    role: "super-admin",
    layout: DashboardLayout,
    children: [
      { index: true, element: <SuperAdminDashboard /> },
      { path: "overview", element: <SuperAdminDashboard /> },
      { path: "users", element: <SA_UsersPage /> },
      { path: "roles", element: <SA_RolesPage /> },
      { path: "audit", element: <SA_AuditPage /> },
    ],
  },

  // ---------------- Admin ----------------
  {
    path: "admin",
    role: ["admin", "super-admin"],
    layout: DashboardLayout,
    children: [
      { index: true, element: <Navigate to="overview" replace /> },
      { path: "overview", element: <AdminDashboard /> },
      { path: "dashboard", element: <Navigate to="overview" replace /> }, // Redirect for backward compatibility
      { path: "approvals", element: <AdminApprovals /> },
      { path: "reports", element: <AdminReports /> },
    ],
  },
];

// ---------------------------
// Recursive Renderer
// ---------------------------
const renderRoutes = (routes) =>
  routes.map(({ path, role, layout: Layout, children = [] }) => (
    <Route
      key={path}
      path={path}
      element={
        <RoleProtectedRoute allowedRoles={role}>
          {Layout ? <Layout /> : <></>}
        </RoleProtectedRoute>
      }
    >
      {children.map((child, index) => (
        <Route
          key={child.path || index}
          index={child.index}
          path={child.path}
          element={<PageLoader>{child.element}</PageLoader>}
        />
      ))}

      <Route path="*" element={<Navigate to="." replace />} />
    </Route>
  ));

// ---------------------------
// Secure Route Wrapper
// ---------------------------
export default function SecureRoutes() {
  const loading = useAuthStore((state) => state.loading);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin w-10 h-10 border-4 border-[#0b6e4f] border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <Routes>
      {renderRoutes(dashboardRoutes)}
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

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}
