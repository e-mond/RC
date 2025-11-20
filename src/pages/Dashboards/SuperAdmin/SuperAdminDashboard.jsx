// src/pages/Dashboards/SuperAdmin/SuperAdminDashboard.jsx
import { useEffect, useState, useCallback } from "react";
import DashboardSkeleton from "./components/DashboardSkeleton";
import SA_StatsOverview from "./components/SA_StatsOverview";
import SA_UserTable from "./components/SA_UserTable";
import SA_RoleDistributionChart from "./components/SA_RoleDistributionChart";
import SA_SystemHealth from "./components/SA_SystemHealth";
import SA_ActivityFeed from "./components/SA_ActivityFeed";
import SA_CreateUserModal from "./components/SA_CreateUserModal";
import SA_DeleteUserModal from "./components/SA_DeleteUserModal";
import { fetchAllUsers, fetchSystemStats } from "@/services/adminService";
import { AlertCircle } from "lucide-react";
import { format } from "date-fns";
import { toZonedTime } from "date-fns-tz";
import PageHeader from "@/modules/dashboard/PageHeader";
import SectionCard from "@/modules/dashboard/SectionCard";
import MockDataEditor from "./components/MockDataEditor";

/**
 * SUPER ADMIN DASHBOARD
 * - Ghana Time (GMT)
 * - No AnimatePresence warnings
 * - Unique keys
 * - Real + Mock API
 */
export default function SuperAdminDashboard() {
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [activity, setActivity] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [openCreateModal, setOpenCreateModal] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [currentTime, setCurrentTime] = useState(new Date());

  // Ghana Time (GMT) - Africa/Accra = GMT (no DST)
  const ghanaTime = toZonedTime(currentTime, "Africa/Accra");
  const timeStr = format(ghanaTime, "PPP 'at' ppp");

  const loadDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      const [statsRes, usersRes] = await Promise.all([
        fetchSystemStats(),
        fetchAllUsers(),
      ]);
      setStats(statsRes);
      setUsers(usersRes.users || []);
      setActivity(statsRes?.recentActivity || []);
    } catch (err) {
      console.error("Load Error:", err);
      setError("Failed to load dashboard data. Please try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDashboardData();
    const interval = setInterval(loadDashboardData, 30_000); // Refresh every 30s
    const timeInterval = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => {
      clearInterval(interval);
      clearInterval(timeInterval);
    };
  }, [loadDashboardData]);

  return (
    <div className="space-y-8">
      <PageHeader
        title="Super Admin Overview"
        subtitle={`Monitor platform health • ${timeStr}`}
        badge="Platform Control"
        actions={
          <button
            onClick={() => setOpenCreateModal(true)}
            className="rounded-full bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-500"
          >
            + Create User
          </button>
        }
      />

      {loading && <DashboardSkeleton />}

      {error && !loading && (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-center">
          <AlertCircle size={40} className="mx-auto mb-3 text-red-600" />
          <p className="text-red-800">{error}</p>
          <button
            onClick={loadDashboardData}
            className="mt-3 rounded-lg bg-red-600 px-5 py-2 text-white hover:bg-red-700"
          >
            Retry
          </button>
        </div>
      )}

      {!loading && !error && (
        <>
          <SectionCard title="System Statistics" description="Real-time KPIs">
            <SA_StatsOverview stats={stats} />
          </SectionCard>

          <SectionCard title="System Health" description="Latency, uptime & service map">
            <SA_SystemHealth stats={stats?.systemHealth} />
          </SectionCard>

          <SectionCard title="Role Distribution" description="Active accounts by role">
            <SA_RoleDistributionChart data={stats?.roles} />
          </SectionCard>

          <SectionCard title="User Directory" description="Manage admins, tenants and landlords">
            <SA_UserTable users={users} onCreate={() => setOpenCreateModal(true)} onDelete={setDeleteTarget} />
          </SectionCard>

          <SectionCard title="Recent Activity" description="Latest platform events">
            <SA_ActivityFeed activity={activity} />
          </SectionCard>

          <SectionCard title="Mock Data Editor" description="Curate the demo dataset before switching to live mode">
            <MockDataEditor />
          </SectionCard>
        </>
      )}

      <SA_CreateUserModal open={openCreateModal} onClose={() => setOpenCreateModal(false)} onSuccess={loadDashboardData} />
      <SA_DeleteUserModal user={deleteTarget} onClose={() => setDeleteTarget(null)} onSuccess={loadDashboardData} />
    </div>
  );
}