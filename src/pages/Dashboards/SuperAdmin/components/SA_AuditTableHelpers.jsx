// src/pages/Dashboards/SuperAdmin/components/SA_AuditTableHelpers.jsx
import { FileText, AlertTriangle, Info, AlertCircle } from "lucide-react";

/**
 * Log level classification constants
 * Use these when creating audit logs to ensure consistency
 */
export const LOG_LEVELS = {
  CRITICAL: "critical",
  WARNING: "warning",
  INFO: "info",
};

/**
 * Actions that should be classified as critical
 * - User bans
 * - Role promotions to super-admin
 * - System configuration changes
 */
export const CRITICAL_ACTIONS = [
  "user_banned",
  "ban_user",
  "role_promotion_super_admin",
  "promote_to_super_admin",
  "system_config_change",
  "config_update",
  "delete_user_permanent",
  "purge_data",
  "reset_system",
];

/**
 * Actions that should be classified as warning
 * - Suspensions
 * - Rejections
 * - Failed logins
 */
export const WARNING_ACTIONS = [
  "user_suspended",
  "suspend_user",
  "user_rejected",
  "reject_user",
  "failed_login",
  "login_failed",
  "password_reset_requested",
  "unauthorized_access_attempt",
  "api_rate_limited",
];

/**
 * Determines the appropriate log level based on action type
 * @param {string} action - The action performed
 * @param {string} [existingLevel] - The level from backend (if any)
 * @returns {string} The appropriate log level
 */
export const getLogLevel = (action, existingLevel) => {
  // If backend already provided a valid level, use it
  if (existingLevel) {
    const normalizedLevel = existingLevel.toLowerCase();
    if (["critical", "warning", "info", "error", "warn"].includes(normalizedLevel)) {
      // Map error/warn to our standard levels
      if (normalizedLevel === "error") return LOG_LEVELS.CRITICAL;
      if (normalizedLevel === "warn") return LOG_LEVELS.WARNING;
      return normalizedLevel;
    }
  }
  
  // Classify based on action type
  const normalizedAction = (action || "").toLowerCase().replace(/[^a-z_]/g, "_");
  
  if (CRITICAL_ACTIONS.some(a => normalizedAction.includes(a))) {
    return LOG_LEVELS.CRITICAL;
  }
  
  if (WARNING_ACTIONS.some(a => normalizedAction.includes(a))) {
    return LOG_LEVELS.WARNING;
  }
  
  return LOG_LEVELS.INFO;
};

export function LevelBadge({ level, action }) {
  const styles = {
    info: {
      bg: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300",
      icon: Info,
    },
    warning: {
      bg: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300",
      icon: AlertTriangle,
    },
    warn: {
      bg: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300",
      icon: AlertTriangle,
    },
    critical: {
      bg: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300",
      icon: AlertCircle,
    },
    error: {
      bg: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300",
      icon: AlertCircle,
    },
  };
  
  // Use smart level detection if action is provided
  const determinedLevel = action ? getLogLevel(action, level) : (level || "info");
  const normalizedLevel = determinedLevel.toLowerCase();
  
  // Map aliases
  let safeLevel = normalizedLevel;
  if (normalizedLevel === "warn") safeLevel = "warning";
  if (normalizedLevel === "error") safeLevel = "critical";
  
  const style = styles[safeLevel] || styles.info;
  const IconComponent = style.icon;
  
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs rounded-full font-medium ${style.bg}`}>
      <IconComponent size={12} />
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