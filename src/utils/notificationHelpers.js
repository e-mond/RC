// src/utils/notificationHelpers.js
/**
 * Notification Helper Utilities
 * 
 * Provides helper functions for notification type handling,
 * icon selection, color schemes, and action URL routing.
 * 
 * Notification Types:
 * - booking_*: Booking/viewing request notifications
 * - payment_*: Payment and wallet notifications
 * - approval_*: Property/role approval notifications
 * - maintenance_*: Maintenance request notifications
 * - system_*: System-level notifications
 */

import {
  Calendar,
  CheckCircle,
  XCircle,
  DollarSign,
  Wallet,
  Home,
  Shield,
  Wrench,
  Bell,
  AlertCircle,
  Info,
} from "lucide-react";

/**
 * Get notification type category
 * @param {string} type - Notification type (e.g., 'booking_accepted', 'payment_received')
 * @returns {string} Category (booking, payment, approval, maintenance, system)
 */
export const getNotificationCategory = (type) => {
  if (!type) return "system";
  if (type.startsWith("booking_") || type.startsWith("viewing_")) return "booking";
  if (type.startsWith("payment_") || type.startsWith("wallet_")) return "payment";
  if (type.startsWith("approval_") || type.startsWith("property_")) return "approval";
  if (type.startsWith("maintenance_")) return "maintenance";
  return "system";
};

/**
 * Get icon for notification type
 * @param {string} type - Notification type
 * @returns {React.Component} Icon component
 */
export const getNotificationIcon = (type) => {
  const category = getNotificationCategory(type);

  switch (category) {
    case "booking":
      if (type?.includes("accepted") || type?.includes("confirmed")) {
        return CheckCircle;
      }
      if (type?.includes("declined") || type?.includes("rejected")) {
        return XCircle;
      }
      return Calendar;

    case "payment":
      if (type?.includes("received") || type?.includes("success")) {
        return CheckCircle;
      }
      if (type?.includes("wallet") || type?.includes("topup")) {
        return Wallet;
      }
      return DollarSign;

    case "approval":
      if (type?.includes("approved") || type?.includes("accepted")) {
        return CheckCircle;
      }
      if (type?.includes("rejected") || type?.includes("declined")) {
        return XCircle;
      }
      return Shield;

    case "maintenance":
      return Wrench;

    default:
      return type?.includes("error") || type?.includes("warning") ? AlertCircle : Bell;
  }
};

/**
 * Get color scheme for notification type
 * @param {string} type - Notification type
 * @returns {Object} Color scheme { bg, text, border, icon }
 */
export const getNotificationColors = (type) => {
  const category = getNotificationCategory(type);
  const isPositive = type?.includes("accepted") || type?.includes("approved") || type?.includes("received") || type?.includes("success");
  const isNegative = type?.includes("declined") || type?.includes("rejected") || type?.includes("failed");
  const isWarning = type?.includes("pending") || type?.includes("warning");

  switch (category) {
    case "booking":
      if (isPositive) {
        return {
          bg: "bg-green-50 dark:bg-green-900/20",
          text: "text-green-800 dark:text-green-300",
          border: "border-green-200 dark:border-green-800",
          icon: "text-green-600 dark:text-green-400",
        };
      }
      if (isNegative) {
        return {
          bg: "bg-red-50 dark:bg-red-900/20",
          text: "text-red-800 dark:text-red-300",
          border: "border-red-200 dark:border-red-800",
          icon: "text-red-600 dark:text-red-400",
        };
      }
      return {
        bg: "bg-blue-50 dark:bg-blue-900/20",
        text: "text-blue-800 dark:text-blue-300",
        border: "border-blue-200 dark:border-blue-800",
        icon: "text-blue-600 dark:text-blue-400",
      };

    case "payment":
      if (isPositive) {
        return {
          bg: "bg-emerald-50 dark:bg-emerald-900/20",
          text: "text-emerald-800 dark:text-emerald-300",
          border: "border-emerald-200 dark:border-emerald-800",
          icon: "text-emerald-600 dark:text-emerald-400",
        };
      }
      if (isNegative) {
        return {
          bg: "bg-red-50 dark:bg-red-900/20",
          text: "text-red-800 dark:text-red-300",
          border: "border-red-200 dark:border-red-800",
          icon: "text-red-600 dark:text-red-400",
        };
      }
      return {
        bg: "bg-amber-50 dark:bg-amber-900/20",
        text: "text-amber-800 dark:text-amber-300",
        border: "border-amber-200 dark:border-amber-800",
        icon: "text-amber-600 dark:text-amber-400",
      };

    case "approval":
      if (isPositive) {
        return {
          bg: "bg-green-50 dark:bg-green-900/20",
          text: "text-green-800 dark:text-green-300",
          border: "border-green-200 dark:border-green-800",
          icon: "text-green-600 dark:text-green-400",
        };
      }
      if (isNegative) {
        return {
          bg: "bg-red-50 dark:bg-red-900/20",
          text: "text-red-800 dark:text-red-300",
          border: "border-red-200 dark:border-red-800",
          icon: "text-red-600 dark:text-red-400",
        };
      }
      return {
        bg: "bg-purple-50 dark:bg-purple-900/20",
        text: "text-purple-800 dark:text-purple-300",
        border: "border-purple-200 dark:border-purple-800",
        icon: "text-purple-600 dark:text-purple-400",
      };

    case "maintenance":
      return {
        bg: "bg-orange-50 dark:bg-orange-900/20",
        text: "text-orange-800 dark:text-orange-300",
        border: "border-orange-200 dark:border-orange-800",
        icon: "text-orange-600 dark:text-orange-400",
      };

    default:
      if (isWarning) {
        return {
          bg: "bg-amber-50 dark:bg-amber-900/20",
          text: "text-amber-800 dark:text-amber-300",
          border: "border-amber-200 dark:border-amber-800",
          icon: "text-amber-600 dark:text-amber-400",
        };
      }
      return {
        bg: "bg-gray-50 dark:bg-gray-800",
        text: "text-gray-800 dark:text-gray-300",
        border: "border-gray-200 dark:border-gray-700",
        icon: "text-gray-600 dark:text-gray-400",
      };
  }
};

/**
 * Get notification priority (for sorting)
 * @param {string} type - Notification type
 * @returns {number} Priority (higher = more important)
 */
export const getNotificationPriority = (type) => {
  if (type?.includes("error") || type?.includes("failed")) return 5;
  if (type?.includes("payment") || type?.includes("wallet")) return 4;
  if (type?.includes("approval")) return 3;
  if (type?.includes("booking") || type?.includes("viewing")) return 2;
  return 1;
};

/**
 * Format notification for display
 * @param {Object} notification - Notification object
 * @returns {Object} Formatted notification with helper properties
 */
export const formatNotification = (notification) => {
  const type = notification.type || notification.notification_type || "system";
  const category = getNotificationCategory(type);
  const Icon = getNotificationIcon(type);
  const colors = getNotificationColors(type);
  const priority = getNotificationPriority(type);

  return {
    ...notification,
    type,
    category,
    Icon,
    colors,
    priority,
    isRead: notification.is_read ?? notification.read ?? false,
    createdAt: notification.created_at || notification.createdAt,
    actionUrl: notification.action_url || notification.actionUrl,
  };
};

/**
 * Sort notifications by priority and date
 * @param {Array} notifications - Array of notifications
 * @returns {Array} Sorted notifications
 */
export const sortNotifications = (notifications) => {
  return [...notifications].sort((a, b) => {
    // Unread first
    const aRead = a.is_read ?? a.read ?? false;
    const bRead = b.is_read ?? b.read ?? false;
    if (aRead !== bRead) {
      return aRead ? 1 : -1;
    }

    // Then by priority
    const aPriority = getNotificationPriority(a.type || a.notification_type);
    const bPriority = getNotificationPriority(b.type || b.notification_type);
    if (aPriority !== bPriority) {
      return bPriority - aPriority;
    }

    // Then by date (newest first)
    const aDate = new Date(a.created_at || a.createdAt || 0);
    const bDate = new Date(b.created_at || b.createdAt || 0);
    return bDate - aDate;
  });
};

export default {
  getNotificationCategory,
  getNotificationIcon,
  getNotificationColors,
  getNotificationPriority,
  formatNotification,
  sortNotifications,
};

