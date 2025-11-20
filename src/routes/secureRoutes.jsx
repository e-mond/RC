import React, { lazy, Suspense } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import RoleProtectedRoute from "@/routes/RoleProtectedRoute";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { useAuth } from "@/context/useAuth";

// Lazy-loaded dashboards
const SuperAdminDashboard = lazy(() => import("@/pages/Dashboards/SuperAdmin/SuperAdminDashboard"));
const SA_UsersPage = lazy(() => import("@/pages/Dashboards/SuperAdmin/users/SA_UsersPage"));
const SA_RolesPage = lazy(() => import("@/pages/Dashboards/SuperAdmin/roles/SA_RolesPage"));
const SA_AuditPage = lazy(() => import("@/pages/Dashboards/SuperAdmin/audit/SA_AuditPage"));

const TenantDashboard = lazy(() => import("@/pages/Dashboards/Tenant/TenantDashboard"));
const LandlordDashboard = lazy(() => import("@/pages/Dashboards/Landlord/LandlordDashboard"));
const ArtisanDashboard = lazy(() => import("@/pages/Dashboards/Artisan/ArtisanDashboard"));
const AdminDashboard = lazy(() => import("@/pages/Dashboards/Admin/AdminDashboard"));

// Page loader wrapper for Suspense
function PageLoader({ children }) {
  return <Suspense fallback={<div className="p-6">Loading...</div>}>{children}</Suspense>;
}

export default function SecureRoutes() {
  const { loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin w-10 h-10 border-4 border-[#0b6e4f] border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <Routes>
      {/* ====================== TENANT ROUTES ====================== */}
      <Route
        path="tenant"
        element={
          <RoleProtectedRoute allowedRoles="tenant">
            <DashboardLayout />
          </RoleProtectedRoute>
        }
      >
        <Route index element={<PageLoader><TenantDashboard /></PageLoader>} />
        {/* <Route path="profile" element={<PageLoader><ProfilePage /></PageLoader>} /> */}
        {/* <Route path="rentals" element={<PageLoader><TenantRentals /></PageLoader>} /> */}
        {/* <Route path="payments" element={<PageLoader><TenantPayments /></PageLoader>} /> */}
        {/* <Route path="maintenance" element={<PageLoader><TenantMaintenance /></PageLoader>} /> */}
        <Route path="*" element={<Navigate to="." replace />} />
      </Route>

      {/* ====================== LANDLORD ROUTES ====================== */}
      <Route
        path="landlord"
        element={
          <RoleProtectedRoute allowedRoles="landlord">
            <DashboardLayout />
          </RoleProtectedRoute>
        }
      >
        <Route index element={<PageLoader><LandlordDashboard /></PageLoader>} />
        {/* <Route path="profile" element={<PageLoader><ProfilePage /></PageLoader>} /> */}
        {/* <Route path="properties" element={<PageLoader><LandlordProperties /></PageLoader>} /> */}
        {/* <Route path="tenants" element={<PageLoader><LandlordTenants /></PageLoader>} /> */}
        {/* <Route path="maintenance" element={<PageLoader><LandlordMaintenance /></PageLoader>} /> */}
        <Route path="*" element={<Navigate to="." replace />} />
      </Route>

      {/* ====================== ARTISAN ROUTES ====================== */}
      <Route
        path="artisan"
        element={
          <RoleProtectedRoute allowedRoles="artisan">
            <DashboardLayout />
          </RoleProtectedRoute>
        }
      >
        <Route index element={<PageLoader><ArtisanDashboard /></PageLoader>} />
        {/* <Route path="profile" element={<PageLoader><ProfilePage /></PageLoader>} /> */}
        {/* <Route path="tasks" element={<PageLoader><ArtisanTasks /></PageLoader>} /> */}
        {/* <Route path="earnings" element={<PageLoader><ArtisanEarnings /></PageLoader>} /> */}
        <Route path="*" element={<Navigate to="." replace />} />
      </Route>

      {/* ====================== ADMIN ROUTES ====================== */}
      <Route
        path="/admin/dashboard"
        element={
          <RoleProtectedRoute allowedRoles={["admin", "super-admin"]}>
            <PageLoader><AdminDashboard /></PageLoader>
          </RoleProtectedRoute>
        }
      />

      {/* ====================== SUPER ADMIN ROUTES ====================== */}
      <Route
        path="super-admin"
        element={
          <RoleProtectedRoute allowedRoles="super-admin">
            <DashboardLayout />
          </RoleProtectedRoute>
        }
      >
        <Route index element={<PageLoader><SuperAdminDashboard /></PageLoader>} />
        <Route path="overview" element={<PageLoader><SuperAdminDashboard /></PageLoader>} />
        <Route path="users" element={<PageLoader><SA_UsersPage /></PageLoader>} />
        <Route path="roles" element={<PageLoader><SA_RolesPage /></PageLoader>} />
        <Route path="audit" element={<PageLoader><SA_AuditPage /></PageLoader>} />
        <Route path="*" element={<Navigate to="." replace />} />
      </Route>

      {/* ====================== FALLBACK ====================== */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}
