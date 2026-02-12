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
import { AlertCircle, FileText, Book, ChevronDown, ChevronUp } from "lucide-react";
import { format } from "date-fns";
import { toZonedTime } from "date-fns-tz";
import { Link } from "react-router-dom";
import PageHeader from "@/modules/dashboard/PageHeader";
import SectionCard from "@/modules/dashboard/SectionCard";
import MockDataEditor from "./components/MockDataEditor";
import { useFeatureAccess } from "@/context/FeatureAccessContext";
import { isMockMode } from "@/mocks/mockManager";

export default function SuperAdminDashboard() {
  const { can } = useFeatureAccess();

  // Load collapse states from localStorage (default: true = collapsed)
  const [isUserDirectoryCollapsed, setIsUserDirectoryCollapsed] = useState(() => {
    const saved = localStorage.getItem("superadmin_userdir_collapsed");
    return saved !== null ? JSON.parse(saved) : true;
  });

  const [isRecentActivityCollapsed, setIsRecentActivityCollapsed] = useState(() => {
    const saved = localStorage.getItem("superadmin_activity_collapsed");
    return saved !== null ? JSON.parse(saved) : true;
  });

  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [activity, setActivity] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [openCreateModal, setOpenCreateModal] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [currentTime, setCurrentTime] = useState(new Date());

  // Auto-detect timezone (fallback to Accra)
  const userTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone || "Africa/Accra";
  const zonedTime = toZonedTime(currentTime, userTimezone);

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
      const { getErrorMessage } = await import("@/utils/errorMessages");
      setError(getErrorMessage(err, "Failed to load dashboard data. Please try again."));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDashboardData();
    const interval = setInterval(loadDashboardData, 30000); // 30s refresh
    const timeInterval = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => {
      clearInterval(interval);
      clearInterval(timeInterval);
    };
  }, [loadDashboardData]);

  // Save collapse states to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem("superadmin_userdir_collapsed", JSON.stringify(isUserDirectoryCollapsed));
  }, [isUserDirectoryCollapsed]);

  useEffect(() => {
    localStorage.setItem("superadmin_activity_collapsed", JSON.stringify(isRecentActivityCollapsed));
  }, [isRecentActivityCollapsed]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 md:py-10 space-y-8 md:space-y-10">

        {/* Page Header */}
        <PageHeader
          title="Platform Control Center"
          subtitle="Full system oversight, user management, and platform health monitoring"
          badge="Super Admin"
          badgeColor="bg-purple-600"
          align="between"
          actions={
            <button
              onClick={() => setOpenCreateModal(true)}
              className="inline-flex items-center gap-2 px-5 py-2.5 md:px-6 md:py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-lg transition-all shadow-md hover:shadow-lg active:scale-95"
            >
              Create User
            </button>
          }
        />

        {/* Live Timezone Badge */}
        <div className="flex justify-center md:justify-end w-full mb-6">
          <div className="flex items-center gap-2.5 px-4 py-2.5 md:px-5 md:py-3 bg-gradient-to-r from-emerald-950/20 to-emerald-900/10 dark:from-emerald-950/30 dark:to-emerald-900/20 border border-emerald-700/30 dark:border-emerald-600/40 rounded-full backdrop-blur-md shadow-sm">
            <div className="relative flex h-2.5 w-2.5">
              <div className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-500 opacity-40"></div>
              <div className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-500"></div>
            </div>
            <span className="font-mono font-semibold text-emerald-800 dark:text-emerald-200 text-sm md:text-base">
              {format(zonedTime, "HH:mm:ss")}
              <span className="hidden sm:inline text-emerald-600 dark:text-emerald-400 font-normal ml-1.5">
                • {format(zonedTime, "MMM d, yyyy")}
              </span>
            </span>
            <span className="text-xs md:text-sm font-medium text-emerald-700/90 dark:text-emerald-400/90">
              {userTimezone}
            </span>
          </div>
        </div>

        {/* Loading / Error states */}
        {loading && <DashboardSkeleton />}
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

        {/* Main Content – original vertical arrangement */}
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

            {/* Collapsible User Directory */}
            <SectionCard
              title="User Directory"
              description="Full control over all platform users"
              className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl shadow-sm dark:shadow-none"
            >
              <div className="flex items-center justify-between mb-4">
                <button
                  onClick={() => setIsUserDirectoryCollapsed(!isUserDirectoryCollapsed)}
                  className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  aria-label={isUserDirectoryCollapsed ? "Expand User Directory" : "Collapse User Directory"}
                >
                  {isUserDirectoryCollapsed ? <ChevronDown size={20} /> : <ChevronUp size={20} />}
                </button>
              </div>

              <div 
                className={`transition-all duration-300 ease-in-out overflow-hidden ${
                  isUserDirectoryCollapsed ? "max-h-0" : "max-h-[2000px]"
                }`}
              >
                <SA_UserTable
                  users={users}
                  onCreate={() => setOpenCreateModal(true)}
                  onDelete={setDeleteTarget}
                />
              </div>
            </SectionCard>

            {/* Collapsible Recent Activity */}
            <SectionCard
              title="Recent Activity"
              description="Latest actions across the entire platform"
              className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl shadow-sm dark:shadow-none"
            >
              <div className="flex items-center justify-between mb-4">
                <button
                  onClick={() => setIsRecentActivityCollapsed(!isRecentActivityCollapsed)}
                  className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  aria-label={isRecentActivityCollapsed ? "Expand Recent Activity" : "Collapse Recent Activity"}
                >
                  {isRecentActivityCollapsed ? <ChevronDown size={20} /> : <ChevronUp size={20} />}
                </button>
              </div>

              <div 
                className={`transition-all duration-300 ease-in-out overflow-hidden ${
                  isRecentActivityCollapsed ? "max-h-0" : "max-h-[2000px]"
                }`}
              >
                <SA_ActivityFeed activity={activity} />
              </div>
            </SectionCard>

            {isMockMode() && (
              <SectionCard
                title="Mock Data Editor"
                description="Safely curate demo data before going live"
                className="bg-amber-50/50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800 rounded-2xl"
              >
                <MockDataEditor />
              </SectionCard>
            )}

            {/* Documentation & Lease Management */}
            <div className="grid md:grid-cols-2 gap-6">
              {can("LEASE_MANAGEMENT") && (
                <SectionCard
                  title="Lease Management"
                  description="Manage system lease templates and documents"
                  className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl shadow-sm dark:shadow-none"
                >
                  <div className="space-y-4">
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Create, edit, and manage system-wide lease templates. Control admin access to lease management.
                    </p>
                    <Link
                      to="/super-admin/leases"
                      className="inline-flex items-center gap-2 px-4 py-2 bg-[#0b6e4f] text-white rounded-lg hover:bg-[#095c42] transition-colors"
                    >
                      <FileText className="w-4 h-4" />
                      Manage Leases
                    </Link>
                  </div>
                </SectionCard>
              )}

              {can("DOCUMENT_MANAGEMENT") && (
                <SectionCard
                  title="Documentation Management"
                  description="Manage platform documentation and help content"
                  className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl shadow-sm dark:shadow-none"
                >
                  <div className="space-y-4">
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Create and manage platform documentation, help articles, and user guides.
                    </p>
                    <Link
                      to="/super-admin/documentation"
                      className="inline-flex items-center gap-2 px-4 py-2 bg-[#0b6e4f] text-white rounded-lg hover:bg-[#095c42] transition-colors"
                    >
                      <Book className="w-4 h-4" />
                      Manage Documentation
                    </Link>
                  </div>
                </SectionCard>
              )}
            </div>
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