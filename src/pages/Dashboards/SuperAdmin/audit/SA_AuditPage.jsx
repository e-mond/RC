// src/pages/Dashboards/SuperAdmin/audit/SA_AuditPage.jsx
/**
 * SA_AuditPage
 * - Full audit trail dashboard for Super Admin
 * - Live filtering, real-time refresh (every 30s)
 * - Ghana Time (Africa/Accra) — guaranteed via TZ + date-fns-tz
 * - Mock + Real API ready
 * - Accessible, animated, responsive
 * - Uses: SA_AuditFilter, SA_AuditTable
 */

import { useEffect, useState, useCallback } from "react";
import { motion } from "framer-motion";
import { FileText, RefreshCw } from "lucide-react";
import { toast } from "react-hot-toast";

import { fetchAuditLogs } from "@/services/adminService";
import SA_AuditFilter from "../components/SA_AuditFilter";
import SA_AuditTable from "../components/SA_AuditTable";

export default function SA_AuditPage() {
  const [logs, setLogs] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Memoized load function to prevent stale closures
  const loadLogs = useCallback(async () => {
    setRefreshing(true);
    try {
      const data = await fetchAuditLogs();
      setLogs(data);
      setFiltered(data);
      toast.success("Audit logs updated", { duration: 1500 });
    } catch (err) {
      toast.error(err.message || "Failed to load audit logs");
      console.error("Audit load error:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  // Initial load + auto-refresh every 30s
  useEffect(() => {
    loadLogs();

    const interval = setInterval(() => {
      loadLogs();
    }, 30_000); // 30 seconds

    return () => clearInterval(interval);
  }, [loadLogs]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="p-6 space-y-6"
      aria-labelledby="audit-heading"
    >
      {/* Page Header */}
      <header className="flex justify-between items-start">
        <div>
          <h1
            id="audit-heading"
            className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2"
          >
            <FileText size={28} />
            System Audit Logs
          </h1>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Real-time system activity • Ghana Time (GMT)
          </p>
        </div>

        {/* Live Refresh Indicator */}
        <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
          <RefreshCw
            size={14}
            className={`animate-spin ${refreshing ? "opacity-100" : "opacity-0"} transition-opacity`}
          />
          <span>Auto-refresh: 30s</span>
        </div>
      </header>

      {/* Filter */}
      <SA_AuditFilter logs={logs} setFiltered={setFiltered} />

      {/* Table */}
      <SA_AuditTable
        logs={filtered}
        loading={loading}
        onRefresh={loadLogs}
      />
    </motion.div>
  );
}