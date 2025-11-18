// src/pages/Dashboards/SuperAdmin/components/SA_ActivityFeed.jsx
/**
 * SA_ActivityFeed
 * - Real-time recent activity with Ghana time
 * - Unique keys via _id or UUID
 * - Smooth animation, scrollable
 * - Accessible, dark mode, crash-proof
 */

import { motion } from "framer-motion";
import { formatDistanceToNow } from "date-fns";
import { toZonedTime } from "date-fns-tz";
import { v4 as uuidv4 } from "uuid";

const GHANA_TZ = "Africa/Accra";

export default function SA_ActivityFeed({ activity }) {
  if (!activity?.length) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white dark:bg-gray-900 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700"
    >
      <h3 className="text-lg font-semibold mb-4">Recent Activity</h3>
      <div className="space-y-3 max-h-96 overflow-y-auto">
        {activity.map((act, i) => {
          const uniqueKey = act._id || act.id || uuidv4();
          const rawTime = act.timestamp || new Date(); // ← FIXED: no typo
          const ghanaTime = toZonedTime(rawTime, GHANA_TZ);

          return (
            <motion.div
              key={uniqueKey}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
              className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition"
            >
              <div className="w-2 h-2 bg-green-500 rounded-full mt-2 shrink-0" />
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  {act.userName || act.user || "Unknown User"}
                </p>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  {act.action}{" "}
                  <span className="font-medium">{act.target || "—"}</span>
                </p>
                <p className="text-xs text-gray-500">
                  {formatDistanceToNow(ghanaTime, { addSuffix: true })}
                </p>
              </div>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}