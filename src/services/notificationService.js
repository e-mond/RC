import apiClient from "./apiClient";

/**
 * Notification Service
 * Handles all notification-related API calls
 */

/**
 * Get all notifications for current user
 * @param {Object} filters - Filter options (is_read, notification_type, type)
 * @returns {Promise} Notification list with pagination
 */
export const getNotifications = async (filters = {}) => {
  try {
    const params = new URLSearchParams();
    
    // Map frontend-friendly field names to backend field names
    Object.keys(filters).forEach((key) => {
      if (filters[key] !== null && filters[key] !== undefined && filters[key] !== "") {
        // Backend accepts both 'type' and 'notification_type' aliases
        if (key === 'type') {
          params.append('notification_type', filters[key]);
          params.append('type', filters[key]); // Send both for compatibility
        } else {
          params.append(key, filters[key]);
        }
      }
    });
    
    const { data } = await apiClient.get(`/notifications/?${params.toString()}`);
    return data;
  } catch (err) {
    if (import.meta.env.DEV) {
      console.error("Get notifications error:", err);
    }
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
    if (import.meta.env.DEV) {
      console.error("Get notification error:", err);
    }
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
    // Backend accepts both is_read and read field aliases
    const { data } = await apiClient.patch(`/notifications/${id}/`, { is_read: true });
    return data;
  } catch (err) {
    if (import.meta.env.DEV) {
      console.error("Mark notification as read error:", err);
    }
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
    if (import.meta.env.DEV) {
      console.error("Mark all notifications as read error:", err);
    }
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
    if (import.meta.env.DEV) {
      console.error("Get unread count error:", err);
    }
    // Return 0 instead of throwing for unread count - fail gracefully
    return { unread: 0, count: 0 };
  }
};

/**
 * Create a new notification
 * 
 * Creates an in-app notification for the current user.
 * Used for welcome notifications, system alerts, etc.
 * 
 * Note: This is typically called by the backend automatically,
 * but can be used by frontend for client-side notifications.
 * 
 * @param {Object} notificationData - Notification data
 * @param {string} notificationData.type - Notification type (e.g., 'welcome', 'account_approved')
 * @param {string} notificationData.title - Notification title
 * @param {string} notificationData.message - Notification message/body
 * @param {string} [notificationData.action_url] - URL to navigate when clicked
 * @param {Object} [notificationData.metadata] - Additional metadata (JSON object)
 * @returns {Promise<Object>} Created notification
 */
export const createNotification = async (notificationData) => {
  try {
    const { data } = await apiClient.post("/notifications/", {
      notification_type: notificationData.type,
      type: notificationData.type, // Send both for compatibility
      title: notificationData.title,
      message: notificationData.message,
      action_url: notificationData.actionUrl || notificationData.action_url,
      metadata: notificationData.metadata || {},
    });
    return data;
  } catch (err) {
    if (import.meta.env.DEV) {
      console.error("Create notification error:", err);
    }
    // Don't throw - notification creation failure shouldn't break UX
    // Return a mock notification or null
    if (import.meta.env.DEV) {
      console.warn("Notification creation failed, continuing without notification");
    }
    return null;
  }
};

/**
 * Create welcome notification for new user
 * 
 * Creates a welcome notification after successful signup.
 * This provides an in-app welcome message to guide new users.
 * 
 * Should be called after successful signup, typically by the backend.
 * Frontend can call this if backend doesn't automatically create it.
 * 
 * @param {Object} user - User object
 * @param {string} user.id - User ID
 * @param {string} user.fullName - User's full name
 * @param {string} user.role - User role (tenant, landlord, artisan)
 * @returns {Promise<Object>} Created welcome notification
 */
export const createWelcomeNotification = async (user) => {
  const roleMessages = {
    tenant: "Welcome to RentalConnects! Start browsing properties and connect with landlords.",
    landlord: "Welcome to RentalConnects! Your account is pending approval. You'll receive an email once approved.",
    artisan: "Welcome to RentalConnects! Your account is pending approval. You'll receive an email once approved.",
  };

  const roleActions = {
    tenant: "/properties",
    landlord: "/landlord/dashboard",
    artisan: "/artisan/dashboard",
  };

  return createNotification({
    type: "welcome",
    title: "Welcome to RentalConnects!",
    message: roleMessages[user.role] || roleMessages.tenant,
    actionUrl: roleActions[user.role] || roleActions.tenant,
    metadata: {
      user_id: user.id,
      role: user.role,
      welcome_sent_at: new Date().toISOString(),
    },
  });
};

/**
 * Create login activity notification
 * 
 * Creates an in-app notification for login activity (successful login).
 * Provides security awareness by showing login details.
 * 
 * Should be called after successful login, typically by the backend.
 * Frontend can call this if backend doesn't automatically create it.
 * 
 * @param {Object} user - User object
 * @param {Object} loginData - Login activity data
 * @param {string} [loginData.loginTime] - Login timestamp (defaults to current time)
 * @param {string} [loginData.ipAddress] - IP address of login
 * @param {string} [loginData.device] - Device/browser information
 * @param {string} [loginData.location] - Geographic location
 * @param {boolean} [loginData.isNewDevice] - Whether this is a new device
 * @param {boolean} [loginData.isSuspicious] - Whether login is suspicious
 * @returns {Promise<Object>} Created login notification
 */
export const createLoginNotification = async (user, loginData = {}) => {
  const loginTime = loginData.loginTime || new Date().toLocaleString();
  const ipAddress = loginData.ipAddress || "Unknown";
  const device = loginData.device || "Unknown Device";
  const location = loginData.location || "Unknown Location";
  const isNewDevice = loginData.isNewDevice || false;
  const isSuspicious = loginData.isSuspicious || false;

  // Determine notification type and message based on context
  let notificationType = "login_success";
  let title = "Login Successful";
  let message = `You successfully logged in at ${loginTime}.`;

  if (isSuspicious) {
    notificationType = "login_suspicious";
    title = "🚨 Suspicious Login Detected";
    message = `Suspicious login activity detected at ${loginTime} from ${location}. If this wasn't you, please secure your account immediately.`;
  } else if (isNewDevice) {
    notificationType = "login_new_device";
    title = "Login from New Device";
    message = `You logged in from a new device (${device}) at ${loginTime} from ${location}. If this wasn't you, please secure your account.`;
  } else {
    // Regular successful login
    message = `You successfully logged in at ${loginTime}${device !== "Unknown Device" ? ` from ${device}` : ""}${location !== "Unknown Location" ? ` in ${location}` : ""}.`;
  }

  // Build detailed message with login info
  const detailedMessage = `${message}\n\nLogin Details:\n• Time: ${loginTime}\n• IP Address: ${ipAddress}\n• Device: ${device}\n• Location: ${location}`;

  return createNotification({
    type: notificationType,
    title: title,
    message: detailedMessage,
    actionUrl: "/profile/security",
    metadata: {
      user_id: user.id,
      login_time: loginTime,
      ip_address: ipAddress,
      device: device,
      location: location,
      is_new_device: isNewDevice,
      is_suspicious: isSuspicious,
      login_sent_at: new Date().toISOString(),
    },
  });
};

/**
 * Pin a notification
 * @param {number} id - Notification ID
 * @returns {Promise} Updated notification
 */
export const pinNotification = async (id) => {
  try {
    const { data } = await apiClient.patch(`/notifications/${id}/`, { is_pinned: true });
    return data;
  } catch (err) {
    if (import.meta.env.DEV) {
      console.error("Pin notification error:", err);
    }
    throw err.response?.data || { message: "Failed to pin notification" };
  }
};

/**
 * Unpin a notification
 * @param {number} id - Notification ID
 * @returns {Promise} Updated notification
 */
export const unpinNotification = async (id) => {
  try {
    const { data } = await apiClient.patch(`/notifications/${id}/`, { is_pinned: false });
    return data;
  } catch (err) {
    if (import.meta.env.DEV) {
      console.error("Unpin notification error:", err);
    }
    throw err.response?.data || { message: "Failed to unpin notification" };
  }
};

/**
 * Archive a notification
 * @param {number} id - Notification ID
 * @returns {Promise} Updated notification
 */
export const archiveNotification = async (id) => {
  try {
    const { data } = await apiClient.patch(`/notifications/${id}/`, { is_archived: true });
    return data;
  } catch (err) {
    if (import.meta.env.DEV) {
      console.error("Archive notification error:", err);
    }
    throw err.response?.data || { message: "Failed to archive notification" };
  }
};

/**
 * Unarchive a notification
 * @param {number} id - Notification ID
 * @returns {Promise} Updated notification
 */
export const unarchiveNotification = async (id) => {
  try {
    const { data } = await apiClient.patch(`/notifications/${id}/`, { is_archived: false });
    return data;
  } catch (err) {
    if (import.meta.env.DEV) {
      console.error("Unarchive notification error:", err);
    }
    throw err.response?.data || { message: "Failed to unarchive notification" };
  }
};

/**
 * Delete a notification
 * @param {number} id - Notification ID
 * @returns {Promise}
 */
export const deleteNotification = async (id) => {
  try {
    await apiClient.delete(`/notifications/${id}/`);
  } catch (err) {
    if (import.meta.env.DEV) {
      console.error("Delete notification error:", err);
    }
    throw err.response?.data || { message: "Failed to delete notification" };
  }
};

/**
 * Get archived notifications
 * @param {Object} filters - Filter options
 * @returns {Promise} Archived notification list
 */
export const getArchivedNotifications = async (filters = {}) => {
  try {
    const params = new URLSearchParams();
    params.append("is_archived", "true");
    
    Object.keys(filters).forEach((key) => {
      if (filters[key] !== null && filters[key] !== undefined && filters[key] !== "") {
        params.append(key, filters[key]);
      }
    });
    
    const { data } = await apiClient.get(`/notifications/?${params.toString()}`);
    return data;
  } catch (err) {
    if (import.meta.env.DEV) {
      console.error("Get archived notifications error:", err);
    }
    throw err.response?.data || { message: "Failed to fetch archived notifications" };
  }
};

/**
 * Trigger email notification
 * 
 * Sends an email notification in parallel with in-system notification.
 * This is a frontend helper that calls the backend email endpoint.
 * 
 * @param {Object} emailData - Email notification data
 * @param {string} emailData.type - Email type (e.g., 'booking_approved', 'booking_cancelled')
 * @param {string|number} emailData.recipientId - Recipient user ID
 * @param {Object} emailData.data - Email payload (subject, template data, etc.)
 * @returns {Promise<Object>} Email notification result
 */
export const triggerEmailNotification = async (emailData) => {
  try {
    // Call backend email notification endpoint
    // Backend should handle email sending and return success/failure
    const { data } = await apiClient.post("/notifications/send-email/", {
      notification_type: emailData.type,
      recipient_id: emailData.recipientId,
      email_data: emailData.data || {},
      metadata: emailData.metadata || {},
    });
    return data;
  } catch (err) {
    // Don't throw - email failure should not break UX
    if (import.meta.env.DEV) {
      console.warn("Email notification failed (non-blocking):", err);
    }
    return { success: false, error: err.response?.data || { message: "Email notification failed" } };
  }
};

/**
 * Trigger both in-system and email notifications
 * 
 * Creates an in-system notification and triggers email in parallel.
 * Email failure is handled gracefully and doesn't affect in-system notification.
 * 
 * @param {Object} notificationData - In-system notification data
 * @param {Object} emailData - Email notification data (optional)
 * @returns {Promise<Object>} Result with both notification and email status
 */
export const triggerNotifications = async (notificationData, emailData = null) => {
  try {
    // Create in-system notification
    const notification = await createNotification(notificationData);
    
    // Trigger email in parallel (non-blocking)
    let emailResult = null;
    if (emailData) {
      triggerEmailNotification({
        ...emailData,
        recipientId: emailData.recipientId || notificationData.recipientId,
      }).then((result) => {
        emailResult = result;
      }).catch((err) => {
        if (import.meta.env.DEV) {
          console.warn("Email notification failed (non-blocking):", err);
        }
        emailResult = { success: false, error: err };
      });
    }
    
    return {
      notification,
      email: emailResult,
    };
  } catch (err) {
    if (import.meta.env.DEV) {
      console.error("Failed to trigger notifications:", err);
    }
    throw err;
  }
};
