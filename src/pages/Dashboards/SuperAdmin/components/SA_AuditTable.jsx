// src/pages/Dashboards/SuperAdmin/components/SA_AuditTable.jsx
/**
 * SA_AuditTable
 * - Responsive audit log table with Ghana time (Africa/Accra)
 * - Animated rows with proper exit transitions
 * - Unique keys guaranteed (UUID fallback)
 * - Loading & empty states
 * - Accessible, dark mode, Ghana-localized
 * 
 * @param {Object} props
 * @param {Array} props.logs - List of audit logs
 * @param {boolean} props.loading - Loading state
 * @param {Function} props.onRefresh - Refresh callback
 */

import { motion, AnimatePresence } from "framer-motion";
import { format } from "date-fns";
import { toZonedTime } from "date-fns-tz";
import { RefreshCw } from "lucide-react";
import { LevelBadge, TableSkeleton, EmptyState } from "./SA_AuditTableHelpers";
import { v4 as uuidv4 } from "uuid"; // ← Add: npm install uuid

// Ghana time zone
const GHANA_TZ = "Africa/Accra";

export default function SA_AuditTable({ logs = [], loading, onRefresh }) {
  if (loading) return <TableSkeleton />;
  if (!logs.length) return <EmptyState />;

  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
        <p className="text-sm text-gray-600 dark:text-gray-400">
          {logs.length} log{logs.length !== 1 ? "s" : ""}
        </p>
        <button
          onClick={onRefresh}
          className="p-2 text-gray-600 hover:text-[#0b6e4f] dark:text-gray-400 dark:hover:text-[#0b6e4f] transition rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"
          aria-label="Refresh audit logs"
          type="button"
        >
          <RefreshCw size={18} />
        </button>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 dark:bg-gray-800">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Timestamp
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                User
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Action
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Target
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Level
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            <AnimatePresence>
              {logs.map((log) => {
                const ghanaTime = toZonedTime(log.timestamp, GHANA_TZ);
                const uniqueKey = log._id || log.id || uuidv4(); 

                return (
                  <motion.tr
                    key={uniqueKey}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                    className="hover:bg-gray-50 dark:hover:bg-gray-800 transition"
                  >
                    <td className="px-4 py-3 text-sm text-gray-900 dark:text-white whitespace-nowrap">
                      {format(ghanaTime, "PPP 'at' p")}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                      {log.userName || log.user || "Unknown"}
                    </td>
                    <td className="px-4 py-3 text-sm font-medium text-gray-900 dark:text-white">
                      {log.action}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                      {log.target || "—"}
                    </td>
                    <td className="px-4 py-3">
                      <LevelBadge level={log.level} />
                    </td>
                  </motion.tr>
                );
              })}
            </AnimatePresence>
          </tbody>
        </table>
      </div>
    </div>
  );
}