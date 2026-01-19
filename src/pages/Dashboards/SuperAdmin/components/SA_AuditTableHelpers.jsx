// src/pages/Dashboards/SuperAdmin/components/SA_AuditTableHelpers.jsx
import { FileText } from "lucide-react";

export function LevelBadge({ level }) {
  const styles = {
    info: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300",
    warn: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300",
    error: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300",
    warning: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300", // Alias for warn
  };
  // Normalize level: convert to lowercase, handle aliases
  const normalizedLevel = level ? level.toLowerCase() : "info";
  const safeLevel = normalizedLevel === "warning" ? "warn" : normalizedLevel;
  return (
    <span className={`px-2 py-1 text-xs rounded-full font-medium ${styles[safeLevel] || styles.info}`}>
      {safeLevel.toUpperCase()}
    </span>
  );
}

export function TableSkeleton() {
  return (
    <div className="animate-pulse space-y-3">
      {[1, 2, 3, 4, 5].map((i) => (
        <div key={i} className="h-12 bg-gray-200 dark:bg-gray-700 rounded" />
      ))}
    </div>
  );
}

export function EmptyState() {
  return (
    <div className="text-center py-12 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700">
      <FileText size={48} className="mx-auto text-gray-400 mb-3" />
      <p className="text-gray-600 dark:text-gray-400">No audit logs found.</p>
    </div>
  );
}