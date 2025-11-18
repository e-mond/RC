/**
 * SA_SystemHealth
 * - Real-time system metrics with status indicators
 * - Unique keys via label + value
 */

import { motion } from "framer-motion";
import { CheckCircle, AlertCircle } from "lucide-react";

export default function SA_SystemHealth({ stats }) {
  if (!stats) return null;

  const metrics = [
    { id: "cpu", label: "CPU Usage", value: `${stats.cpu}%`, status: stats.cpu > 80 ? "warn" : "good" },
    { id: "memory", label: "Memory", value: `${stats.memory}%`, status: stats.memory > 85 ? "warn" : "good" },
    { id: "latency", label: "API Latency", value: `${stats.apiLatency}ms`, status: stats.apiLatency > 150 ? "warn" : "good" },
    { id: "uptime", label: "Uptime", value: stats.uptime, status: "good" },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white dark:bg-gray-900 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700"
    >
      <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
        <AlertCircle size={20} />
        System Health
      </h3>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {metrics.map((m) => (
          <div key={m.id} className="text-center">
            <p className="text-xs text-gray-600 dark:text-gray-400">{m.label}</p>
            <p className="text-xl font-bold text-gray-900 dark:text-white flex items-center justify-center gap-1 mt-1">
              {m.status === "good" ? (
                <CheckCircle className="w-4 h-4 text-green-600" />
              ) : (
                <AlertCircle className="w-4 h-4 text-yellow-600" />
              )}
              {m.value}
            </p>
          </div>
        ))}
      </div>
    </motion.div>
  );
}