// src/pages/Notifications/NotificationsCenter.jsx
import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import {
  BellRing,
  CheckCircle,
  Clock,
  ArrowLeft,
  RefreshCw,
  Pin,
  Archive,
  Trash2,
  Filter,
  X,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import {
  getNotifications,
  markAllNotificationsAsRead,
  pinNotification,
  unpinNotification,
  archiveNotification,
  unarchiveNotification,
  deleteNotification,
  getArchivedNotifications,
} from "@/services/notificationService";
import { useAuthStore } from "@/stores/authStore";
import { formatNotification, getNotificationIcon } from "@/utils/notificationHelpers";
import { toast } from "react-hot-toast";
import DeleteNotificationModal from "@/components/Notifications/DeleteNotificationModal";

export default function NotificationsCenter() {
  const { user } = useAuthStore();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all"); // all, unread, pinned, archived
  const [showArchived, setShowArchived] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);

  // Memoize loadNotifications to avoid recreating on every render
  const loadNotifications = useCallback(async () => {
    if (!user) {
      setNotifications([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      let data;
      
      if (showArchived) {
        data = await getArchivedNotifications();
      } else {
        const filters = {};
        if (filter === "unread") filters.is_read = false;
        if (filter === "pinned") filters.is_pinned = true;
        data = await getNotifications(filters);
      }
      
      const list = data.results || data || [];
      // Sort: pinned first, then unread, then by date
      const sorted = list.sort((a, b) => {
        if (a.is_pinned && !b.is_pinned) return -1;
        if (!a.is_pinned && b.is_pinned) return 1;
        if (!a.is_read && b.is_read) return -1;
        if (a.is_read && !b.is_read) return 1;
        return new Date(b.created_at) - new Date(a.created_at);
      });
      setNotifications(sorted);
    } catch (err) {
      console.error("Failed to load notifications:", err);
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  }, [user, filter, showArchived]); // Depend on filter and showArchived

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

  const handlePin = async (id, isPinned) => {
    try {
      if (isPinned) {
        await unpinNotification(id);
        toast.success("Notification unpinned");
      } else {
        await pinNotification(id);
        toast.success("Notification pinned");
      }
      loadNotifications();
    } catch (err) {
      console.error("Failed to pin/unpin notification:", err);
      toast.error("Failed to update notification");
    }
  };

  const handleArchive = async (id, isArchived) => {
    try {
      if (isArchived) {
        await unarchiveNotification(id);
        toast.success("Notification unarchived");
      } else {
        await archiveNotification(id);
        toast.success("Notification archived");
      }
      loadNotifications();
    } catch (err) {
      console.error("Failed to archive/unarchive notification:", err);
      toast.error("Failed to update notification");
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteNotification(id);
      toast.success("Notification deleted");
      setNotifications((prev) => prev.filter((n) => n.id !== id));
      setDeleteTarget(null);
    } catch (err) {
      console.error("Failed to delete notification:", err);
      toast.error("Failed to delete notification");
      setDeleteTarget(null);
    }
  };

  const unreadCount = notifications.filter((n) => !n.is_read && !n.is_archived).length;
  const pinnedCount = notifications.filter((n) => n.is_pinned && !n.is_archived).length;

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

          {unreadCount > 0 && !showArchived && (
            <button
              onClick={handleMarkAllRead}
              className="px-6 py-3 bg-[#0b6e4f] text-white rounded-lg hover:bg-[#095c42] transition font-medium"
            >
              Mark all as read
            </button>
          )}

          <button
            onClick={() => setShowArchived(!showArchived)}
            className={`px-4 py-2 rounded-lg transition font-medium ${
              showArchived
                ? "bg-[#0b6e4f] text-white"
                : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
            }`}
          >
            {showArchived ? "Show Active" : "Show Archived"}
          </button>
        </div>
      </header>

      {/* Filters */}
      {!showArchived && (
        <div className="flex items-center gap-2 flex-wrap">
          <Filter size={18} className="text-gray-600 dark:text-gray-400" />
          <button
            onClick={() => setFilter("all")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filter === "all"
                ? "bg-[#0b6e4f] text-white"
                : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
            }`}
          >
            All
          </button>
          <button
            onClick={() => setFilter("unread")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filter === "unread"
                ? "bg-yellow-500 text-white"
                : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
            }`}
          >
            Unread ({unreadCount})
          </button>
          <button
            onClick={() => setFilter("pinned")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filter === "pinned"
                ? "bg-blue-500 text-white"
                : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
            }`}
          >
            Pinned ({pinnedCount})
          </button>
        </div>
      )}

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
            {notifications.map((notif) => {
              const formatted = formatNotification(notif);
              const Icon = formatted.Icon || BellRing;
              return (
                <div
                  key={notif.id}
                  className={`p-6 hover:bg-gray-50 dark:hover:bg-gray-800 transition ${
                    !notif.is_read ? formatted.colors.bg : ""
                  } ${formatted.colors.border} border-l-4 ${
                    notif.is_pinned
                      ? "bg-blue-50 dark:bg-blue-900/20 border-blue-300 dark:border-blue-700"
                      : ""
                  }`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3 flex-1 min-w-0">
                      <div className={`shrink-0 ${formatted.colors.icon}`}>
                        <Icon size={22} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className={`font-semibold ${formatted.colors.text} truncate`}>
                            {notif.title}
                          </h3>
                          {notif.is_pinned && (
                            <Pin size={14} className="text-blue-500 fill-blue-500" />
                          )}
                          {!notif.is_read && (
                            <span className="px-3 py-1 text-xs bg-[#0b6e4f] text-white rounded-full font-medium">
                              New
                            </span>
                          )}
                        </div>
                        <p className={`${formatted.colors.text} mb-3 leading-relaxed wrap-break-words`}>
                          {notif.message}
                        </p>
                        <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-500">
                          <span>
                            {formatDistanceToNow(new Date(notif.created_at), {
                              addSuffix: true,
                            })}
                          </span>
                          {formatted.showViewDetails && (
                            <Link
                              to={notif.action_url}
                              className="text-[#0b6e4f] hover:underline font-medium"
                            >
                              View Details →
                            </Link>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <div className="flex flex-col gap-1">
                        <button
                          onClick={() => handlePin(notif.id, notif.is_pinned)}
                          className="p-1.5 rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition"
                          title={notif.is_pinned ? "Unpin" : "Pin"}
                        >
                          <Pin
                            size={16}
                            className={notif.is_pinned ? "text-blue-500 fill-blue-500" : "text-gray-400"}
                          />
                        </button>
                        <button
                          onClick={() => handleArchive(notif.id, notif.is_archived)}
                          className="p-1.5 rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition"
                          title={notif.is_archived ? "Unarchive" : "Archive"}
                        >
                          <Archive
                            size={16}
                            className={notif.is_archived ? "text-amber-500" : "text-gray-400"}
                          />
                        </button>
                        <button
                          onClick={() => setDeleteTarget(notif)}
                          className="p-1.5 rounded hover:bg-red-100 dark:hover:bg-red-900/30 transition"
                          title="Delete"
                        >
                          <Trash2 size={16} className="text-red-500" />
                        </button>
                      </div>
                      <div>
                        {notif.is_read ? (
                          <CheckCircle size={22} className="text-emerald-500" />
                        ) : (
                          <Clock size={22} className="text-amber-500" />
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Delete Confirmation Modal */}
      <DeleteNotificationModal
        notification={deleteTarget}
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
      />
    </div>
  );
}