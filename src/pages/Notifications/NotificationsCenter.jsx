// src/pages/Notifications/NotificationsCenter.jsx
import { useState, useEffect, useCallback, useMemo } from "react";
import { Link } from "react-router-dom";
import {
  BellRing,
  CheckCircle,
  Clock,
  RefreshCw,
  Pin,
  Archive,
  Trash2,
  Filter,
  ArrowRight,
} from "lucide-react";
import { formatDistanceToNow, isToday, isYesterday, subDays } from "date-fns";
import { useSwipeable } from "react-swipeable";
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
import { formatNotification } from "@/utils/notificationHelpers";
import { toast } from "react-hot-toast";
import DeleteNotificationModal from "@/components/Notifications/DeleteNotificationModal";

// New memoized Notification Card component (hooks are allowed here)
const NotificationCard = ({ notif, onPin, onArchive, onDelete, swipeDirection, setSwipeDirection, setDeleteTarget }) => {
  const formatted = formatNotification(notif);
  const Icon = formatted.Icon || BellRing;

  const handlers = useSwipeable({
    onSwipedLeft: () => {
      setSwipeDirection((prev) => ({ ...prev, [notif.id]: "left" }));
      onArchive(notif.id, notif.is_archived);
      setTimeout(() => setSwipeDirection((prev) => ({ ...prev, [notif.id]: null })), 400);
    },
    onSwipedRight: () => {
      setSwipeDirection((prev) => ({ ...prev, [notif.id]: "right" }));
      onDelete(notif.id);
      setTimeout(() => setSwipeDirection((prev) => ({ ...prev, [notif.id]: null })), 400);
    },
    delta: 70,
    preventScrollOnSwipe: true,
    trackMouse: true,
    trackTouch: true,
  });

  const swipeDir = swipeDirection[notif.id];

  return (
    <div
      {...handlers}
      className={`
        relative overflow-hidden p-5 sm:p-6 transition-all duration-300
        hover:bg-gray-50 dark:hover:bg-gray-800/60
        border-l-4 ${formatted.colors.border}
        ${!notif.is_read ? "bg-emerald-50/60 dark:bg-emerald-950/30" : ""}
        ${notif.is_pinned ? "bg-blue-50/70 dark:bg-blue-950/40 border-blue-400" : ""}
        ${swipeDir === "left" ? "-translate-x-full opacity-0" : ""}
        ${swipeDir === "right" ? "translate-x-full opacity-0" : ""}
      `}
    >
      {/* Swipe background hints */}
      <div className="absolute inset-0 flex items-center justify-between px-8 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        <div className="flex items-center gap-3 text-red-600 dark:text-red-400 font-medium">
          <Trash2 size={22} /> Delete
        </div>
        <div className="flex items-center gap-3 text-amber-600 dark:text-amber-400 font-medium">
          <Archive size={22} /> Archive
        </div>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-start gap-5 relative z-10">
        <div className="flex items-start gap-4 flex-1">
          <div className={`shrink-0 p-3 rounded-full ${formatted.colors.iconBg}`}>
            <Icon size={26} className={formatted.colors.icon} />
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2.5 mb-2.5">
              <h3 className={`font-semibold text-base md:text-lg ${formatted.colors.text} truncate max-w-[75%]`}>
                {notif.title}
              </h3>
              {notif.is_pinned && <Pin size={16} className="text-blue-500 fill-blue-500 shrink-0" />}
              {!notif.is_read && (
                <span className="px-2.5 py-1 text-xs bg-emerald-600 text-white rounded-full font-medium">
                  New
                </span>
              )}
            </div>

            <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-3 wrap-break-word">
              {notif.message}
            </p>

            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
              <span>{formatDistanceToNow(new Date(notif.created_at), { addSuffix: true })}</span>
              {formatted.showViewDetails && notif.action_url && (
                <Link
                  to={notif.action_url}
                  className="text-emerald-600 dark:text-emerald-500 hover:underline font-medium flex items-center gap-1"
                >
                  View <ArrowRight size={14} />
                </Link>
              )}
            </div>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex sm:flex-col gap-3 sm:gap-2 shrink-0 mt-4 sm:mt-0">
          <button
            onClick={() => onPin(notif.id, notif.is_pinned)}
            className="p-3.5 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-800 transition"
            title={notif.is_pinned ? "Unpin" : "Pin"}
          >
            <Pin
              size={22}
              className={notif.is_pinned ? "text-blue-500 fill-blue-500" : "text-gray-500 dark:text-gray-400"}
            />
          </button>

          <button
            onClick={() => onArchive(notif.id, notif.is_archived)}
            className="p-3.5 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-800 transition"
            title={notif.is_archived ? "Unarchive" : "Archive"}
          >
            <Archive
              size={22}
              className={notif.is_archived ? "text-amber-500" : "text-gray-500 dark:text-gray-400"}
            />
          </button>

          <button
            onClick={() => setDeleteTarget(notif)}
            className="p-3.5 rounded-xl hover:bg-red-100 dark:hover:bg-red-900/30 transition text-red-600 dark:text-red-500"
            title="Delete"
          >
            <Trash2 size={22} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default function NotificationsCenter() {
  const { user } = useAuthStore();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [showArchived, setShowArchived] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [swipeDirection, setSwipeDirection] = useState({});

  const loadNotifications = useCallback(async () => {
    if (!user) {
      setNotifications([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
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
      const sorted = list.sort((a, b) => {
        if (a.is_pinned !== b.is_pinned) return a.is_pinned ? -1 : 1;
        if (a.is_read !== b.is_read) return a.is_read ? 1 : -1;
        return new Date(b.created_at) - new Date(a.created_at);
      });

      setNotifications(sorted);
    } catch {
      toast.error("Could not load notifications");
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  }, [user, filter, showArchived]);

  useEffect(() => {
    loadNotifications();
  }, [loadNotifications]);

  const groupedNotifications = useMemo(() => {
    const groups = {
      Today: [],
      Yesterday: [],
      "This Week": [],
      Earlier: [],
    };

    notifications.forEach((notif) => {
      const date = new Date(notif.created_at);
      if (isToday(date)) groups.Today.push(notif);
      else if (isYesterday(date)) groups.Yesterday.push(notif);
      else if (date > subDays(new Date(), 7)) groups["This Week"].push(notif);
      else groups.Earlier.push(notif);
    });

    return Object.entries(groups).filter(([, items]) => items.length > 0);
  }, [notifications]);

  const handleMarkAllRead = async () => {
    try {
      await markAllNotificationsAsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
      toast.success("All marked as read");
    } catch {
      toast.error("Failed to mark all read");
    }
  };

  const handleRefresh = () => {
    loadNotifications();
  };

  const handlePin = async (id, isPinned) => {
    try {
      if (isPinned) await unpinNotification(id);
      else await pinNotification(id);
      toast.success(isPinned ? "Unpinned" : "Pinned");
      loadNotifications();
    } catch {
      toast.error("Failed to update pin");
    }
  };

  const handleArchive = async (id, isArchived) => {
    try {
      if (isArchived) await unarchiveNotification(id);
      else await archiveNotification(id);
      toast.success(isArchived ? "Restored" : "Archived");
      loadNotifications();
      if (navigator.vibrate) navigator.vibrate([50]);
    } catch {
      toast.error("Failed to update archive");
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteNotification(id);
      toast.success("Deleted");
      setNotifications((prev) => prev.filter((n) => n.id !== id));
      setDeleteTarget(null);
      if (navigator.vibrate) navigator.vibrate([80]);
    } catch {
      toast.error("Failed to delete");
    }
  };

  const unreadCount = notifications.filter((n) => !n.is_read && !n.is_archived).length;
  const pinnedCount = notifications.filter((n) => n.is_pinned && !n.is_archived).length;

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] px-4 text-center">
        <BellRing className="h-16 w-16 text-gray-300 dark:text-gray-700 mb-6" />
        <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">Login Required</h2>
        <p className="text-gray-600 dark:text-gray-400 mt-3 max-w-md">
          Please sign in to see your notifications.
        </p>
        <Link to="/login" className="mt-6 px-6 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700">
          Sign In
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 pb-24 md:pb-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-10 space-y-6 md:space-y-8">
        {/* Header */}
        <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-5 sticky top-0 z-10 bg-gray-50 dark:bg-gray-950 py-4 border-b border-gray-200 dark:border-gray-800 backdrop-blur-md">
          <div className="flex items-center gap-4">
            <BellRing className="h-9 w-9 text-emerald-600 dark:text-emerald-500" />
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
                Notifications
              </h1>
              <p className="text-sm md:text-base text-gray-600 dark:text-gray-400">
                Stay updated with important updates
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={handleRefresh}
              disabled={loading}
              className="p-3 rounded-full hover:bg-gray-200 dark:hover:bg-gray-800 disabled:opacity-50 transition"
              aria-label="Refresh"
            >
              <RefreshCw size={20} className={`${loading ? "animate-spin" : ""}`} />
            </button>

            {unreadCount > 0 && !showArchived && (
              <button
                onClick={handleMarkAllRead}
                className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-medium transition shadow-sm"
              >
                Mark all read
              </button>
            )}

            <button
              onClick={() => setShowArchived(!showArchived)}
              className={`px-4 py-2.5 rounded-lg font-medium transition ${
                showArchived ? "bg-emerald-600 text-white" : "bg-gray-200 dark:bg-gray-800 hover:bg-gray-300 dark:hover:bg-gray-700"
              }`}
            >
              {showArchived ? "Active" : "Archived"}
            </button>
          </div>
        </header>

        {/* Filters */}
        {!showArchived && (
          <div className="flex flex-wrap items-center gap-x-2 gap-y-3">
            <Filter size={18} className="text-gray-600 dark:text-gray-400" />
            {["all", "unread", "pinned"].map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  filter === f
                    ? f === "unread"
                      ? "bg-amber-500 text-white"
                      : f === "pinned"
                      ? "bg-blue-600 text-white"
                      : "bg-emerald-600 text-white"
                    : "bg-gray-200 dark:bg-gray-800 hover:bg-gray-300 dark:hover:bg-gray-700"
                }`}
              >
                {f === "all" ? "All" : f.charAt(0).toUpperCase() + f.slice(1)}
                {f === "unread" && unreadCount > 0 && ` (${unreadCount})`}
                {f === "pinned" && pinnedCount > 0 && ` (${pinnedCount})`}
              </button>
            ))}
          </div>
        )}

        {/* Grouped Notifications */}
        {loading ? (
          <div className="flex flex-col items-center py-20">
            <div className="w-12 h-12 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="text-gray-600 dark:text-gray-400">Loading notifications...</p>
          </div>
        ) : notifications.length === 0 ? (
          <div className="flex flex-col items-center py-24 text-center px-4">
            <BellRing className="h-20 w-20 text-gray-300 dark:text-gray-700 mb-6 opacity-60" />
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
              {showArchived ? "No archived items" : "No notifications"}
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mt-3 max-w-md">
              {showArchived ? "Archived items will appear here." : "You're all caught up!"}
            </p>
          </div>
        ) : (
          <div className="space-y-10">
            {groupedNotifications.map(([groupName, items]) => (
              <div key={groupName} className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white px-2">
                  {groupName}
                </h3>
                <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 overflow-hidden divide-y divide-gray-200 dark:divide-gray-800">
                  {items.map((notif) => (
                    <NotificationCard
                      key={notif.id}
                      notif={notif}
                      onPin={handlePin}
                      onArchive={handleArchive}
                      onDelete={() => setDeleteTarget(notif)}
                      swipeDirection={swipeDirection}
                      setSwipeDirection={setSwipeDirection}
                      setDeleteTarget={setDeleteTarget}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <DeleteNotificationModal
        notification={deleteTarget}
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
      />
    </div>
  );
}