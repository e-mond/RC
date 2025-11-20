// src/pages/Dashboards/Admin/AdminDashboard.jsx
import React, { useEffect, useState } from "react";
import { useAuthStore } from "@/stores/authStore";
import { fetchPendingUsers, fetchPendingProperties } from "@/services/adminService";
import AD_UserApprovals from "./components/AD_UserApprovals";
import AD_PropertyApprovals from "./components/AD_PropertyApprovals";
import AD_SystemInsights from "./components/AD_SystemInsights";
import AD_MaintenanceOverview from "./components/AD_MaintenanceOverview";
import AD_ReportsPanel from "./components/AD_ReportsPanel";
import { Users, Home, Wrench, FileText, TrendingUp, CheckCircle, AlertCircle } from "lucide-react";
import PageHeader from "@/modules/dashboard/PageHeader";
import MetricGrid from "@/modules/dashboard/MetricGrid";
import ActionGrid from "@/modules/dashboard/ActionGrid";
import SectionCard from "@/modules/dashboard/SectionCard";
import MockModeCard from "@/components/admin/MockModeCard";

/**
 * AdminDashboard - Enhanced with stats and quick actions
 * - Renders widgets based on permissions
 * - Shows summary statistics
 * - Quick action cards
 */
export default function AdminDashboard() {
  const { user } = useAuthStore();
  const permissions = user?.permissions || {};
  const [stats, setStats] = useState({
    pendingUsers: 0,
    pendingProperties: 0,
    totalUsers: 0,
    totalProperties: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        const [usersRes, propertiesRes] = await Promise.all([
          fetchPendingUsers().catch(() => ({ users: [] })),
          fetchPendingProperties().catch(() => ({ properties: [] })),
        ]);
        if (mounted) {
          setStats({
            pendingUsers: Array.isArray(usersRes.users) ? usersRes.users.length : 0,
            pendingProperties: Array.isArray(propertiesRes.properties) ? propertiesRes.properties.length : 0,
            totalUsers: usersRes.total || 0,
            totalProperties: propertiesRes.total || 0,
          });
        }
      } catch (err) {
        console.error("loadStats:", err);
      } finally {
        if (mounted) setLoading(false);
      }
    };
    load();
    return () => {
      mounted = false;
    };
  }, []);

  const metricItems = [
    {
      label: "Pending Users",
      value: loading ? null : stats.pendingUsers,
      icon: Users,
      accent: "amber",
      href: "/admin/approvals",
      isLoading: loading,
    },
    {
      label: "Pending Properties",
      value: loading ? null : stats.pendingProperties,
      icon: Home,
      accent: "blue",
      href: "/admin/approvals",
      isLoading: loading,
    },
    {
      label: "Total Users",
      value: loading ? null : stats.totalUsers,
      icon: Users,
      accent: "emerald",
      isLoading: loading,
    },
    {
      label: "Total Properties",
      value: loading ? null : stats.totalProperties,
      icon: Home,
      accent: "purple",
      isLoading: loading,
    },
  ];

  const actions = [
    {
      title: "Approvals",
      description: "Review pending submissions",
      icon: CheckCircle,
      href: "/admin/approvals",
      tone: "blue",
    },
    {
      title: "Reports",
      description: "Generate compliance reports",
      icon: FileText,
      href: "/admin/reports",
      tone: "emerald",
    },
    {
      title: "System Insights",
      description: "Monitor performance",
      icon: TrendingUp,
      href: "/admin/overview",
      tone: "purple",
    },
  ];

  return (
    <div className="space-y-8">
      <PageHeader title="Admin Dashboard" subtitle="Moderate users, listings, and platform health" badge="Operations" />

      <MetricGrid items={metricItems} />
      <ActionGrid items={actions} />
      {(user?.role === "admin" || user?.role === "super-admin") && <MockModeCard />}

      <div className="space-y-6">
        {permissions.canViewInsights && (
          <SectionCard title="System Insights" description="Platform throughput, health & KPIs">
            <AD_SystemInsights />
          </SectionCard>
        )}

        {permissions.canApproveUsers && (
          <SectionCard title="User Approvals" description="Pending account verifications">
            <AD_UserApprovals />
          </SectionCard>
        )}

        {permissions.canApproveProperties && (
          <SectionCard title="Property Approvals" description="Listings awaiting moderation">
            <AD_PropertyApprovals />
          </SectionCard>
        )}

        {permissions.canManageMaintenance && (
          <SectionCard title="Maintenance Oversight" description="Critical maintenance statuses">
            <AD_MaintenanceOverview />
          </SectionCard>
        )}

        {permissions.canViewReports && (
          <SectionCard title="Reports Panel" description="System level reporting">
            <AD_ReportsPanel />
          </SectionCard>
        )}
      </div>
    </div>
  );
}
