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
 * Get a safe display name for the actor (who performed the action)
 * Backend may send: actor, actorName, user, userName, userId, created_by, performed_by
 */
const getActorDisplay = (log) => {
  // Priority order for actor name
  const actorName = 
    log.actorName ||           // Explicit actor name
    log.actor_name ||          // Snake case variant
    log.performed_by_name ||   // "Performed by" name
    log.userName ||            // Normalized field from fetchAuditLogs
    log.user?.name ||          // Nested: user.name
    log.user?.fullName ||      // Nested: user.fullName
    log.user?.full_name ||     // Nested: user.full_name (snake case)
    log.performer?.name ||     // Nested: performer.name
    log.performer?.fullName || // Nested: performer.fullName
    log.created_by?.name ||    // Nested: created_by.name
    log.created_by?.fullName;  // Nested: created_by.fullName
  
  // Try email/username as fallback  
  const actorEmail = 
    log.actor ||               // Backend field: actor (often email)
    log.actor_email ||         // Explicit actor email
    log.performed_by ||        // "Performed by" (may be email)
    log.user?.email ||         // Nested: user.email
    log.user?.username ||      // Nested: user.username
    log.performer?.email ||    // Nested: performer.email
    log.created_by?.email ||   // Nested: created_by.email
    log.created_by;            // Direct: created_by

  // Return name if available, otherwise email/username, otherwise "Unknown"
  if (actorName && actorName !== "Unknown" && actorName !== "System") {
    return actorName;
  }
  if (actorEmail && typeof actorEmail === "string" && actorEmail !== "Unknown") {
    return actorEmail;
  }
  
  // Check for system-initiated actions
  if (log.system || log.is_system || log.isSystem || log.actor === "system") {
    return "System";
  }
  
  return "Unknown User";
};

/**
 * Get the target entity display
 * Backend may send: target, targetName, resource, entity, detail
 */
const getTargetDisplay = (log) => {
  // Try to construct a meaningful target description
  const targetType = log.target_type || log.targetType || log.entity_type || log.entityType;
  const targetName = log.target_name || log.targetName || log.resource_name || log.resourceName;
  const targetId = log.target_id || log.targetId || log.resource_id || log.resourceId;
  
  // Try explicit target fields
  if (log.target && typeof log.target === "string" && log.target !== "Unknown") {
    return log.target;
  }
  
  // Try resource field
  if (log.resource && typeof log.resource === "string" && log.resource !== "Unknown") {
    return log.resource;
  }
  
  // Construct from type + name/id
  if (targetType || targetName) {
    let display = "";
    if (targetType) {
      display += targetType.charAt(0).toUpperCase() + targetType.slice(1);
    }
    if (targetName) {
      display += display ? `: ${targetName}` : targetName;
    } else if (targetId) {
      display += display ? ` #${targetId}` : `#${targetId}`;
    }
    if (display) return display;
  }
  
  // Try detail field
  if (log.detail && typeof log.detail === "string") {
    return log.detail;
  }
  
  // Try nested target object
  if (log.target && typeof log.target === "object") {
    return log.target.name || log.target.title || log.target.email || log.target.id || "Unknown";
  }
  
  return "—";
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
                        {formatGhanaTime(log.timestamp || log.createdAt || log.created_at)}
                      </div>
                    </td>

                    {/* User / Actor */}
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-700 dark:text-gray-300 font-medium">
                        {getActorDisplay(log)}
                      </div>
                      {/* Show email if different from display name and available */}
                      {(() => {
                        const actorDisplay = getActorDisplay(log);
                        const actorEmail = log.actor || log.actor_email || log.userEmail || log.user?.email;
                        if (actorEmail && typeof actorEmail === "string" && actorEmail !== actorDisplay && !actorDisplay.includes("@")) {
                          return (
                            <div className="text-xs text-gray-500 dark:text-gray-500 truncate max-w-[200px]">
                              {actorEmail}
                            </div>
                          );
                        }
                        return null;
                      })()}
                    </td>

                    {/* Action */}
                    <td className="px-6 py-4">
                      <span className="text-sm font-medium text-gray-900 dark:text-white">
                        {log.action || log.action_type || "—"}
                      </span>
                      {log.description && (
                        <div className="text-xs text-gray-500 dark:text-gray-500 truncate max-w-[200px]">
                          {log.description}
                        </div>
                      )}
                    </td>

                    {/* Target */}
                    <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                      {getTargetDisplay(log)}
                    </td>

                    {/* Level Badge - now with action for smart classification */}
                    <td className="px-6 py-4">
                      <LevelBadge level={log.level} action={log.action || log.action_type} />
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