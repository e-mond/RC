// src/pages/Dashboards/SuperAdmin/components/SA_ActivityFeed.jsx
import { memo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { formatDistanceToNow } from "date-fns";
import { toZonedTime, formatInTimeZone } from "date-fns-tz";
import { v4 as uuidv4 } from "uuid";

const GHANA_TZ = "Africa/Accra";
const FALLBACK_DATE = new Date(); // used when timestamp is invalid

/**
 * Displays recent platform activity with Ghana-local time
 * @param {Object} props
 * @param {Array} props.activity - Array of activity objects
 */
function SA_ActivityFeed({ activity = [] }) {
  if (!Array.isArray(activity) || activity.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-900 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 text-center">
        <p className="text-gray-500 dark:text-gray-400">
          No recent activity to display
        </p>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-white dark:bg-gray-900 rounded-2xl shadow-md border border-gray-200 dark:border-gray-700 overflow-hidden"
    >
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-800">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Recent Activity
        </h3>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
          Last 10 platform events • GMT (Accra)
        </p>
      </div>

      {/* Scrollable Feed */}
      <div className="max-h-105 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-700 scrollbar-track-transparent">
        <AnimatePresence>
          {activity.map((act, index) => {
            // Robust key: prefer backend id → fallback to uuid
            const key = act.id || act._id || uuidv4();

            // Timestamp handling - very defensive
            let timestamp;
            try {
              timestamp = act.timestamp
                ? new Date(act.timestamp)
                : FALLBACK_DATE;
              if (isNaN(timestamp.getTime())) throw new Error("Invalid date");
            } catch {
              timestamp = FALLBACK_DATE;
            }

            const ghanaTime = toZonedTime(timestamp, GHANA_TZ);

            // Human-friendly time
            const timeAgo = formatDistanceToNow(ghanaTime, {
              addSuffix: true,
              includeSeconds: true,
            });

            // Full local time for tooltip
            const fullTime = formatInTimeZone(
              ghanaTime,
              GHANA_TZ,
              "MMM d, yyyy • h:mm:ss a"
            );

            return (
              <motion.div
                key={key}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.4, delay: index * 0.06 }}
                className="flex items-start gap-4 px-6 py-4 border-b border-gray-100 dark:border-gray-800 last:border-b-0 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                role="listitem"
                aria-label={`Activity: ${act.action || "Unknown action"}`}
              >
                {/* Status dot */}
                <div className="mt-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  {/* User / Action */}
                  <div className="flex items-baseline gap-2 flex-wrap">
                    <p className="font-medium text-gray-900 dark:text-white truncate">
                      {act.userName || act.user || "System"}
                    </p>
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      {act.action || "Performed action"}
                    </span>
                  </div>

                  {/* Target */}
                  {act.target && (
                    <p className="mt-0.5 text-sm text-gray-700 dark:text-gray-300">
                      <span className="font-medium">{act.target}</span>
                    </p>
                  )}

                  {/* Time */}
                  <p
                    className="mt-1.5 text-xs text-gray-500 dark:text-gray-400"
                    title={fullTime}
                  >
                    {timeAgo}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

export default memo(SA_ActivityFeed);