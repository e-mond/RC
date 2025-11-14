import apiClient from "./apiClient";

/**
 * Notification Service
 * Handles all notification-related API calls
 */

/**
 * Get all notifications for current user
 * @param {Object} filters - Filter options (is_read, notification_type)
 * @returns {Promise} Notification list with pagination
 */
export const getNotifications = async (filters = {}) => {
  try {
    const params = new URLSearchParams();
    Object.keys(filters).forEach((key) => {
      if (filters[key] !== null && filters[key] !== undefined && filters[key] !== "") {
        params.append(key, filters[key]);
      }
    });
    
    const { data } = await apiClient.get(`/notifications/?${params.toString()}`);
    return data;
  } catch (err) {
    console.error("Get notifications error:", err);
    throw err.response?.data || { message: "Failed to fetch notifications" };
  }
};

/**
 * Get notification by ID
 * @param {number} id - Notification ID
 * @returns {Promise} Notification details
 */
export const getNotification = async (id) => {
  try {
    const { data } = await apiClient.get(`/notifications/${id}/`);
    return data;
  } catch (err) {
    console.error("Get notification error:", err);
    throw err.response?.data || { message: "Failed to fetch notification" };
  }
};

/**
 * Mark notification as read
 * @param {number} id - Notification ID
 * @returns {Promise} Updated notification
 */
export const markNotificationAsRead = async (id) => {
  try {
    const { data } = await apiClient.patch(`/notifications/${id}/`, { is_read: true });
    return data;
  } catch (err) {
    console.error("Mark notification as read error:", err);
    throw err.response?.data || { message: "Failed to mark notification as read" };
  }
};

/**
 * Mark all notifications as read
 * @returns {Promise}
 */
export const markAllNotificationsAsRead = async () => {
  try {
    await apiClient.post("/notifications/mark-all-read/");
  } catch (err) {
    console.error("Mark all notifications as read error:", err);
    throw err.response?.data || { message: "Failed to mark all notifications as read" };
  }
};

/**
 * Get unread notifications count
 * @returns {Promise} Unread count
 */
export const getUnreadCount = async () => {
  try {
    const { data } = await apiClient.get("/notifications/unread-count/");
    return data;
  } catch (err) {
    console.error("Get unread count error:", err);
    throw err.response?.data || { message: "Failed to fetch unread count" };
  }
};
