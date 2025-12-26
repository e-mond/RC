// src/pages/Notifications/NotificationsCenter.jsx
import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import {
  BellRing,
  CheckCircle,
  Clock,
  ArrowLeft,
  RefreshCw,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import {
  getNotifications,
  markAllNotificationsAsRead,
} from "@/services/notificationService";
import { useAuthStore } from "@/stores/authStore";

export default function NotificationsCenter() {
  const { user } = useAuthStore();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  // Memoize loadNotifications to avoid recreating on every render
  const loadNotifications = useCallback(async () => {
    if (!user) {
      setNotifications([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const data = await getNotifications(); // Gets all (read + unread)
      const list = data.results || data || [];
      setNotifications(list);
    } catch (err) {
      console.error("Failed to load notifications:", err);
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  }, [user]); // Only depends on user

  // Load on mount and when user changes
  useEffect(() => {
    loadNotifications();
  }, [loadNotifications]); // Now safe: loadNotifications is stable

  const handleMarkAllRead = async () => {
    try {
      await markAllNotificationsAsRead();
      setNotifications((prev) =>
        prev.map((n) => ({ ...n, is_read: true }))
      );
    } catch (err) {
      console.error("Failed to mark all as read:", err);
    }
  };

  const handleRefresh = () => {
    loadNotifications();
  };

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  if (!user) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-gray-500 dark:text-gray-400">
          Please log in to view notifications.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 py-8 px-4">
      <header className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
              <BellRing className="h-8 w-8 text-[#0b6e4f]" />
              Notifications
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Stay updated with bookings, payments, maintenance, and more.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleRefresh}
            disabled={loading}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition disabled:opacity-50"
            aria-label="Refresh notifications"
          >
            <RefreshCw
              size={20}
              className={`text-gray-600 dark:text-gray-400 ${loading ? "animate-spin" : ""}`}
            />
          </button>

          {unreadCount > 0 && (
            <button
              onClick={handleMarkAllRead}
              className="px-6 py-3 bg-[#0b6e4f] text-white rounded-lg hover:bg-[#095c42] transition font-medium"
            >
              Mark all as read
            </button>
          )}
        </div>
      </header>

      <section className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-800 overflow-hidden">
        {loading ? (
          <div className="p-12 text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-[#0b6e4f] border-t-transparent"></div>
          </div>
        ) : notifications.length === 0 ? (
          <div className="p-20 text-center">
            <BellRing size={64} className="mx-auto text-gray-300 dark:text-gray-700 mb-6 opacity-50" />
            <p className="text-xl text-gray-500 dark:text-gray-400">
              No notifications yet.
            </p>
            <p className="text-gray-500 dark:text-gray-400 mt-2">
              You're all caught up!
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200 dark:divide-gray-800">
            {notifications.map((notif) => (
              <div
                key={notif.id}
                className={`p-6 hover:bg-gray-50 dark:hover:bg-gray-800 transition ${
                  !notif.is_read ? "bg-blue-50/50 dark:bg-blue-900/20" : ""
                }`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-semibold text-gray-900 dark:text-white truncate">
                        {notif.title}
                      </h3>
                      {!notif.is_read && (
                        <span className="px-3 py-1 text-xs bg-[#0b6e4f] text-white rounded-full font-medium">
                          New
                        </span>
                      )}
                    </div>
                    <p className="text-gray-700 dark:text-gray-300 mb-3 leading-relaxed wrap-break-words">
                      {notif.message}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-500">
                      {formatDistanceToNow(new Date(notif.created_at), {
                        addSuffix: true,
                      })}
                    </p>
                  </div>
                  <div className="shrink-0">
                    {notif.is_read ? (
                      <CheckCircle size={22} className="text-emerald-500" />
                    ) : (
                      <Clock size={22} className="text-amber-500" />
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}