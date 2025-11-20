// src/pages/Dashboards/SuperAdmin/components/SA_AuditTable.jsx
/**
 * SA_AuditTable – Super Admin Audit Log Table
 * 
 * Features:
 * ✓ Ghana timezone (Africa/Accra) with safe date handling
 * ✓ Never crashes on invalid/missing timestamps
 * ✓ Smooth Framer Motion row animations with proper exit
 * ✓ Unique keys guaranteed (MongoDB _id → UUID fallback)
 * ✓ Loading skeleton & beautiful empty state
 * ✓ Dark mode + accessible + responsive
 * ✓ Visual feedback for bad data issues
 * 
 * Dependencies:
 *   npm install framer-motion date-fns date-fns-tz lucide-react uuid
 */

import { motion, AnimatePresence } from "framer-motion";
import { format } from "date-fns";
import { toZonedTime } from "date-fns-tz";
import { RefreshCw } from "lucide-react";
import { v4 as uuidv4 } from "uuid";

import { LevelBadge, TableSkeleton, EmptyState } from "./SA_AuditTableHelpers";

// Ghana Standard Time
const GHANA_TZ = "Africa/Accra";

/**
 * Safely formats a timestamp to Ghana local time
 * Returns JSX element so we can style invalid dates
 */
const formatGhanaTime = (timestamp) => {
  // Handle null, undefined, empty string
  if (!timestamp) {
    return <span className="text-gray-400 italic text-xs">No timestamp</span>;
  }

  let date;

  // Handle string, number, or Date object
  try {
    date = new Date(timestamp);
  } catch {
    return <span className="text-red-500 text-xs font-medium">Invalid date format</span>;
  }

  // Check if date is valid
  if (isNaN(date.getTime())) {
    return <span className="text-red-500 text-xs font-medium">Invalid date</span>;
  }

  try {
    const ghanaTime = toZonedTime(date, GHANA_TZ);
    // Example: 15 Apr 2025 at 3:45 PM
    return <span className="font-medium">{format(ghanaTime, "dd MMM yyyy")} <span className="text-gray-500">at</span> {format(ghanaTime, "h:mm a")}</span>;
  } catch {
    return <span className="text-red-500 text-xs font-medium">Timezone error</span>;
  }
};

/**
 * Get a safe display name for the user
 */
const getUserDisplay = (log) => {
  return log.userName || log.user?.name || log.user?.email || log.userId || "Unknown User";
};

export default function SA_AuditTable({ logs = [], loading = false, onRefresh = () => {} }) {
  // Loading state
  if (loading) {
    return <TableSkeleton />;
  }

  // Empty state
  if (!logs || logs.length === 0) {
    return <EmptyState />;
  }

  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Showing <span className="font-semibold text-gray-900 dark:text-white">{logs.length}</span> audit log{logs.length !== 1 ? "s" : ""}
        </p>
        <button
          onClick={onRefresh}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-[#0b6e4f] bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-900/20 dark:hover:bg-emerald-900/40 rounded-lg transition"
          type="button"
          aria-label="Refresh audit logs"
        >
          <RefreshCw size={16} className="transition-transform group-hover:rotate-180" />
          Refresh
        </button>
      </div>

      {/* Scrollable Table */}
      <div className="overflow-x-auto">
        <table className="w-full min-w-[800px]">
          <thead className="bg-gray-50 dark:bg-gray-800/50">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                Timestamp (GMT)
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                User
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                Action
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                Target
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                Level
              </th>
            </tr>
          </thead>

          <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
            <AnimatePresence initial={false}>
              {logs.map((log) => {
                // Ensure unique key even if _id is missing
                const uniqueKey = log._id || log.id || uuidv4();

                return (
                  <motion.tr
                    key={uniqueKey}
                    layout
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.25, ease: "easeOut" }}
                    className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                  >
                    {/* Timestamp */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 dark:text-gray-100">
                        {formatGhanaTime(log.timestamp)}
                      </div>
                    </td>

                    {/* User */}
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-700 dark:text-gray-300">
                        {getUserDisplay(log)}
                      </div>
                      {log.userEmail && log.userEmail !== getUserDisplay(log) && (
                        <div className="text-xs text-gray-500 dark:text-gray-500">
                          {log.userEmail}
                        </div>
                      )}
                    </td>

                    {/* Action */}
                    <td className="px-6 py-4">
                      <span className="text-sm font-medium text-gray-900 dark:text-white">
                        {log.action || "—"}
                      </span>
                    </td>

                    {/* Target */}
                    <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                      {log.target || log.resource || "—"}
                    </td>

                    {/* Level Badge */}
                    <td className="px-6 py-4">
                      <LevelBadge level={log.level} />
                    </td>
                  </motion.tr>
                );
              })}
            </AnimatePresence>
          </tbody>
        </table>
      </div>

      {/* Optional Footer */}
      <div className="px-6 py-3 bg-gray-50 dark:bg-gray-800/50 border-t border-gray-gray-200 dark:border-gray-700">
        <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
          All times shown in Ghana Time (GMT{new Date().toLocaleTimeString('en-us',{timeZoneName:'short', timeZone: GHANA_TZ}).split(' ')[2]})
        </p>
      </div>
    </div>
  );
}