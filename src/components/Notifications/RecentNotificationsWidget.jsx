// src/components/Notifications/RecentNotificationsWidget.jsx
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Bell, ArrowRight, Pin } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { getNotifications } from "@/services/notificationService";
import { formatNotification } from "@/utils/notificationHelpers";

/**
 * RecentNotificationsWidget - Displays recent notifications on dashboards
 * Shows up to 5 recent unread notifications with links to full notification center
 */
export default function RecentNotificationsWidget({ limit = 5 }) {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const data = await getNotifications({ is_read: false });
        const list = data.results || data || [];
        const recent = list.slice(0, limit);
        setNotifications(recent);
        setUnreadCount(list.length);
      } catch (err) {
        console.error("Failed to load recent notifications:", err);
        setNotifications([]);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [limit]);

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 p-6">
        <div className="animate-pulse space-y-3">
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/3"></div>
          <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded"></div>
          <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-2/3"></div>
        </div>
      </div>
    );
  }

  if (notifications.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            <Bell size={20} className="text-[#0b6e4f]" />
            Recent Notifications
          </h3>
          <Link
            to="/notifications"
            className="text-sm text-[#0b6e4f] hover:underline font-medium"
          >
            View All
          </Link>
        </div>
        <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">
          No new notifications
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
          <Bell size={20} className="text-[#0b6e4f]" />
          Recent Notifications
          {unreadCount > 0 && (
            <span className="px-2 py-0.5 text-xs bg-red-500 text-white rounded-full">
              {unreadCount}
            </span>
          )}
        </h3>
        <Link
          to="/notifications"
          className="text-sm text-[#0b6e4f] hover:underline font-medium flex items-center gap-1"
        >
          View All
          <ArrowRight size={14} />
        </Link>
      </div>

      <div className="space-y-3">
        {notifications.map((notif) => {
          const formatted = formatNotification(notif);
          const Icon = formatted.Icon || Bell;
          return (
            <Link
              key={notif.id}
              to={formatted.showViewDetails ? (notif.action_url || "/notifications") : "/notifications"}
              className={`block p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors border ${
                notif.is_pinned
                  ? "bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800"
                  : "border-gray-100 dark:border-gray-800"
              }`}
            >
              <div className="flex items-start gap-3">
                <div className={`shrink-0 ${formatted.colors.icon}`}>
                  <Icon size={18} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="font-medium text-sm text-gray-900 dark:text-white truncate">
                      {notif.title}
                    </p>
                    {notif.is_pinned && (
                      <Pin size={12} className="text-blue-500 fill-blue-500 shrink-0" />
                    )}
                  </div>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mt-1 line-clamp-2">
                    {notif.message}
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <p className="text-xs text-gray-500 dark:text-gray-500">
                      {formatDistanceToNow(new Date(notif.created_at), { addSuffix: true })}
                    </p>
                    {formatted.showViewDetails && (
                      <span className="text-xs text-[#0b6e4f] font-medium">
                        View Details →
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
