// src/pages/Dashboards/SuperAdmin/SuperAdminDashboard.jsx
import { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import DashboardSkeleton from "./components/DashboardSkeleton";
import DashboardLayout from "@/components/layout/DashboardLayout";
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
import { toZonedTime } from "date-fns-tz"; // ← FIXED: toZonedTime

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

  const container = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.1 } },
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 },
  };

  return (
    <DashboardLayout
      aside={
        <div className="space-y-4">
          <h3 className="font-semibold text-lg">Platform Controls</h3>
          <button
            onClick={() => setOpenCreateModal(true)}
            className="w-full py-2.5 bg-[#0b6e4f] text-white rounded-lg hover:bg-[#095c42] transition"
          >
            + Create User
          </button>
        </div>
      }
    >
      <div className="space-y-8">
        {/* Header */}
        <motion.header
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-1"
        >
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
            Super Admin Overview
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Monitor platform health • {timeStr}
          </p>
        </motion.header>

        {/* Loading */}
        {loading && <DashboardSkeleton />}

        {/* Error */}
        {error && !loading && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-6 text-center"
          >
            <AlertCircle size={40} className="mx-auto text-red-600 dark:text-red-400 mb-3" />
            <p className="text-red-800 dark:text-red-300 font-medium">{error}</p>
            <button
              onClick={loadDashboardData}
              className="mt-3 px-5 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
            >
              Retry
            </button>
          </motion.div>
        )}

        {/* Main Content */}
        <AnimatePresence>
          {!loading && !error && (
            <motion.div
              key="dashboard-content"
              variants={container}
              initial="hidden"
              animate="show"
              exit="hidden"
              className="space-y-8"
            >
              <motion.div variants={item}>
                <SA_StatsOverview stats={stats} />
              </motion.div>

              <motion.div variants={item}>
                <SA_SystemHealth stats={stats?.systemHealth} />
              </motion.div>

              <motion.div variants={item}>
                <SA_RoleDistributionChart data={stats?.roles} />
              </motion.div>

              <motion.div variants={item}>
                <SA_UserTable
                  users={users}
                  onCreate={() => setOpenCreateModal(true)}
                  onDelete={setDeleteTarget}
                />
              </motion.div>

              <motion.div variants={item}>
                <SA_ActivityFeed activity={activity} />
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

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
    </DashboardLayout>
  );
}