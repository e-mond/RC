// src/pages/Dashboards/SuperAdmin/components/SA_StatsOverview.jsx
/**
 * SA_StatsOverview
 * - Animated stat cards for Super Admin
 * - Ghana currency (GH₵)
 * - Unique keys via index + label
 * - Accessible, responsive, dark mode
 */

import { motion } from "framer-motion";
import { FiUsers, FiHome, FiDollarSign, FiAlertCircle } from "react-icons/fi";
import { formatGHS } from "@/utils/format"; // ← We'll create this

export default function SA_StatsOverview({ stats }) {
  if (!stats) return null;

  const cards = [
    {
      id: "users",
      label: "Total Users",
      value: stats.totalUsers.toLocaleString(),
      icon: <FiUsers className="w-5 h-5" />,
      trend: "+12%",
      color: "text-blue-600",
    },
    {
      id: "properties",
      label: "Active Properties",
      value: stats.activeProperties.toLocaleString(),
      icon: <FiHome className="w-5 h-5" />,
      trend: "+8%",
      color: "text-green-600",
    },
    {
      id: "revenue",
      label: "Revenue (30d)",
      value: formatGHS(stats.revenueThisMonth),
      icon: <FiDollarSign className="w-5 h-5" />,
      trend: "+15%",
      color: "text-purple-600",
    },
    {
      id: "pending",
      label: "Pending Requests",
      value: stats.pendingRequests,
      icon: <FiAlertCircle className="w-5 h-5" />,
      trend: stats.pendingRequests > 30 ? "-5%" : "+2%",
      color: stats.pendingRequests > 30 ? "text-red-600" : "text-yellow-600",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card, i) => (
        <motion.div
          key={card.id} // ← 100% UNIQUE
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.1 }}
          whileHover={{ scale: 1.02 }}
          className="bg-white dark:bg-gray-900 p-5 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 cursor-default"
        >
          <div className="flex items-center justify-between mb-3">
            <div className={`p-2 rounded-lg ${card.color.replace("text-", "bg-").replace("600", "100")}`}>
              <div className={card.color}>{card.icon}</div>
            </div>
            <span className={`text-sm font-medium ${card.trend.startsWith("+") ? "text-green-600" : "text-red-600"}`}>
              {card.trend}
            </span>
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{card.value}</p>
          <p className="text-sm text-gray-600 dark:text-gray-400">{card.label}</p>
        </motion.div>
      ))}
    </div>
  );
}