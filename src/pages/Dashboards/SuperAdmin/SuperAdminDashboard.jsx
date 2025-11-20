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
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 space-y-10">
        
        {/* Enhanced Header with Live Time Badge */}
        <PageHeader
          title="Super Admin Overview"
          subtitle="Platform-wide monitoring & control"
          badge="Platform Control"
          align="between"
          actions={
            <button
              onClick={() => setOpenCreateModal(true)}
              className="inline-flex items-center gap-2.5 px-6 py-3 bg-emerald-600 text-white font-semibold rounded-xl hover:bg-emerald-700 transition-all shadow-lg hover:shadow-xl"
            >
              + Create User
            </button>
          }
        />

        {/* Live Ghana Time Badge */}
        <div className="flex justify-center">
          <div className="inline-flex items-center gap-3 px-6 py-3 bg-linear-to-r from-[#0b6e4f]/10 to-emerald-600/10 dark:from-emerald-900/30 dark:to-[#0b6e4f]/20 border border-emerald-600/30 dark:border-emerald-500/40 rounded-full backdrop-blur-sm">
            <div className="w-3 h-3 bg-emerald-500 rounded-full animate-pulse" />
            <span className="font-mono text-lg font-semibold text-emerald-700 dark:text-emerald-300">
              {timeStr}
            </span>
            <span className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">Ghana Time (GMT)</span>
          </div>
        </div>

        {/* Loading State */}
        {loading && <DashboardSkeleton />}

        {/* Error State */}
        {error && !loading && (
          <div className="rounded-2xl border border-red-200 dark:border-red-900/50 bg-red-50 dark:bg-red-900/20 p-8 text-center">
            <AlertCircle size={56} className="mx-auto mb-4 text-red-600 dark:text-red-400" />
            <p className="text-lg font-medium text-red-800 dark:text-red-300">{error}</p>
            <button
              onClick={loadDashboardData}
              className="mt-6 rounded-xl bg-red-600 px-8 py-3 text-white font-semibold hover:bg-red-700 transition"
            >
              Retry Loading
            </button>
          </div>
        )}

        {/* Main Content - All Sections with Dark Mode */}
        {!loading && !error && (
          <>
            <SectionCard
              title="System Statistics"
              description="Real-time platform KPIs and growth metrics"
              className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl shadow-sm dark:shadow-none"
            >
              <SA_StatsOverview stats={stats} />
            </SectionCard>

            <SectionCard
              title="System Health"
              description="Uptime, latency, and service status monitoring"
              className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl shadow-sm dark:shadow-none"
            >
              <SA_SystemHealth stats={stats?.systemHealth} />
            </SectionCard>

            <SectionCard
              title="Role Distribution"
              description="Breakdown of active accounts by user role"
              className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl shadow-sm dark:shadow-none"
            >
              <SA_RoleDistributionChart data={stats?.roles} />
            </SectionCard>

            <SectionCard
              title="User Directory"
              description="Full control over all platform users"
              className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl shadow-sm dark:shadow-none"
            >
              <SA_UserTable
                users={users}
                onCreate={() => setOpenCreateModal(true)}
                onDelete={setDeleteTarget}
              />
            </SectionCard>

            <SectionCard
              title="Recent Activity"
              description="Latest actions across the entire platform"
              className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl shadow-sm dark:shadow-none"
            >
              <SA_ActivityFeed activity={activity} />
            </SectionCard>

            <SectionCard
              title="Mock Data Editor"
              description="Safely curate demo data before going live"
              className="bg-amber-50/50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800 rounded-2xl"
            >
              <MockDataEditor />
            </SectionCard>
          </>
        )}

        {/* Modals */}
        <SA_CreateUserModal
          open={openCreateModal}
          onClose={() => setOpenCreateModal(false)}
          onSuccess={loadDashboardData}
        />
        <SA_DeleteUserModal
          user={deleteTarget}
          onClose={() => setDeleteTarget(null)}
          onSuccess={loadDashboardData}
        />
      </div>
    </div>
  );
}