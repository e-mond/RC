// src/pages/Dashboards/Admin/AdminDashboard.jsx
import React from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";

import AD_UserApprovals from "./components/AD_UserApprovals";
import AD_ReportsPanel from "./components/AD_ReportsPanel";
import AD_SystemInsights from "./components/AD_SystemInsights";
import AD_MaintenanceOverview from "./components/AD_MaintenanceOverview";
import AD_PropertyApprovals from "./components/AD_PropertyApprovals";

import { useAuth } from "@/context/useAuth";


/**
 * AdminDashboard
 * - Dynamically renders admin widgets based on user.permissions
 * - Permissions are assigned in AuthProvider:
 *     • super-admin: full access
 *     • admin: configurable via backend or defaults
 * - Route-level guards should block unauthorized access,
 *   but this component hides widgets even if somehow accessed.
 */
export default function AdminDashboard() {
  const { user } = useAuth();
  const permissions = user?.permissions || {};

  return (
    <DashboardLayout>
      <div className="space-y-6">

        {/* System Insights */}
        {permissions.canViewInsights && <AD_SystemInsights />}

        {/* User Approvals */}
        {permissions.canApproveUsers && <AD_UserApprovals />}

        {/* Property Approvals */}
        {permissions.canApproveProperties && <AD_PropertyApprovals />}

        {/* Maintenance Overview */}
        {permissions.canManageMaintenance && <AD_MaintenanceOverview />}

        {/* Reports Panel */}
        {permissions.canViewReports && <AD_ReportsPanel />}

      </div>
    </DashboardLayout>
  );
}