// src/components/NotificationDropdown.jsx
import { useState, useEffect, useRef } from "react";
import { Bell, CheckCircle, Pin, Archive, Trash2 } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { Link } from "react-router-dom";
import {
  getNotifications,
  getUnreadCount,
  markNotificationAsRead,
  pinNotification,
  unpinNotification,
  archiveNotification,
  deleteNotification,
} from "@/services/notificationService";
import { useAuth } from "@/context/AuthContext";
import { toast } from "react-hot-toast";
import { formatNotification } from "@/utils/notificationHelpers";
import DeleteNotificationModal from "./DeleteNotificationModal";

export default function NotificationDropdown() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const dropdownRef = useRef(null);

  // Load unread count on mount and when user changes
  useEffect(() => {
    if (user) loadUnreadCount();
  }, [user]);

  // Load notifications only when dropdown opens
  useEffect(() => {
    if (isOpen && user) {
      loadNotifications();
    }
  }, [isOpen, user]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const loadUnreadCount = async () => {
    try {
      const data = await getUnreadCount();
      setUnreadCount(data.unread_count || 0);
    } catch (err) {
      console.error("Failed to load unread count:", err);
    }
  };

  const loadNotifications = async () => {
    try {
      setLoading(true);
      const data = await getNotifications({ is_read: false });
      const list = data.results || data || [];
      setNotifications(list.slice(0, 10)); // Show max 10 recent
    } catch (err) {
      console.error("Failed to load notifications:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (id) => {
    try {
      await markNotificationAsRead(id);
      setNotifications((prev) => prev.filter((n) => n.id !== id));
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (err) {
      console.error("Failed to mark as read:", err);
    }
  };

  const handlePin = async (e, id, isPinned) => {
    e.stopPropagation();
    try {
      if (isPinned) {
        await unpinNotification(id);
      } else {
        await pinNotification(id);
      }
      loadNotifications();
    } catch (err) {
      console.error("Failed to pin/unpin:", err);
      toast.error("Failed to update notification");
    }
  };

  const handleArchive = async (e, id) => {
    e.stopPropagation();
    try {
      await archiveNotification(id);
      setNotifications((prev) => prev.filter((n) => n.id !== id));
      setUnreadCount((prev) => Math.max(0, prev - 1));
      toast.success("Notification archived");
    } catch (err) {
      console.error("Failed to archive:", err);
      toast.error("Failed to archive notification");
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteNotification(id);
      setNotifications((prev) => prev.filter((n) => n.id !== id));
      setUnreadCount((prev) => Math.max(0, prev - 1));
      toast.success("Notification deleted");
      setDeleteTarget(null);
    } catch (err) {
      console.error("Failed to delete:", err);
      toast.error("Failed to delete notification");
    }
  };

  if (!user) return null;

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
        aria-label="Notifications"
      >
        <Bell size={22} className="text-gray-600 dark:text-gray-300" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 flex h-5 w-5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-5 w-5 bg-red-500 text-white text-xs font-bold items-center justify-center">
              {unreadCount > 99 ? "99+" : unreadCount}
            </span>
          </span>
        )}
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute right-0 mt-3 w-96 bg-white dark:bg-gray-900 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 z-50 overflow-hidden">
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Notifications
              </h3>
              {unreadCount > 0 && (
                <span className="text-sm text-primary font-medium">
                  {unreadCount} new
                </span>
              )}
            </div>
          </div>

          <div className="max-h-96 overflow-y-auto">
            {loading ? (
              <div className="p-8 text-center">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-primary border-t-transparent"></div>
              </div>
            ) : notifications.length === 0 ? (
              <div className="p-12 text-center text-gray-500 dark:text-gray-400">
                <Bell size={48} className="mx-auto mb-3 opacity-30" />
                <p>No new notifications</p>
              </div>
            ) : (
              notifications.map((notif) => {
                const formatted = formatNotification(notif);
                const Icon = formatted.Icon || Bell;
                return (
                  <div
                    key={notif.id}
                    className={`w-full p-4 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors border-b border-gray-100 dark:border-gray-800 last:border-0 ${
                      notif.is_pinned
                        ? "bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800"
                        : ""
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${
                        formatted.colors.bg || "bg-primary/10"
                      }`}>
                        <Icon size={18} className={formatted.colors.icon || "text-primary"} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="font-medium text-gray-900 dark:text-white truncate">
                            {notif.title}
                          </p>
                          {notif.is_pinned && (
                            <Pin size={12} className="text-blue-500 fill-blue-500 shrink-0" />
                          )}
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 line-clamp-2">
                          {notif.message}
                        </p>
                        <div className="flex items-center gap-3 mt-2">
                          <p className="text-xs text-gray-500 dark:text-gray-500">
                            {formatDistanceToNow(new Date(notif.created_at), { addSuffix: true })}
                          </p>
                          {formatted.showViewDetails && (
                            <Link
                              to={notif.action_url}
                              onClick={() => setIsOpen(false)}
                              className="text-xs text-[#0b6e4f] hover:underline font-medium"
                            >
                              View Details →
                            </Link>
                          )}
                        </div>
                      </div>
                      <div className="flex flex-col gap-1 shrink-0">
                        <button
                          onClick={() => handleMarkAsRead(notif.id)}
                          className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded"
                          title="Mark as read"
                        >
                          <CheckCircle size={16} className="text-blue-500" />
                        </button>
                        <button
                          onClick={(e) => handlePin(e, notif.id, notif.is_pinned)}
                          className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded"
                          title={notif.is_pinned ? "Unpin" : "Pin"}
                        >
                          <Pin
                            size={16}
                            className={notif.is_pinned ? "text-blue-500 fill-blue-500" : "text-gray-400"}
                          />
                        </button>
                        <button
                          onClick={(e) => handleArchive(e, notif.id)}
                          className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded"
                          title="Archive"
                        >
                          <Archive size={16} className="text-gray-400" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setDeleteTarget(notif);
                          }}
                          className="p-1 hover:bg-red-100 dark:hover:bg-red-900/30 rounded"
                          title="Delete"
                        >
                          <Trash2 size={16} className="text-red-500" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          <div className="p-3 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
            <Link
              to="/notifications"
              onClick={() => setIsOpen(false)}
              className="block text-center text-sm font-medium text-primary hover:text-primary/80"
            >
              View all notifications →
            </Link>
          </div>
        </div>
      )}

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