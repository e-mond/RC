import apiClient from "@/services/apiClient";
import normalizeApiError from "@/utils/apiError";

/**
 * Register an artisan. Accepts FormData (idUpload etc).
 * @param {FormData} formData
 */
export const registerArtisan = async (formData) => {
  try {
    const { data } = await apiClient.post("/auth/signup/artisan", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return data;
  } catch (err) {
    const error = normalizeApiError(err);
    throw new Error(error.message);
  }
};

/**
 * Fetch artisan service requests / bookings
 */
export const fetchBookings = async () => {
  try {
    const { data } = await apiClient.get("/artisan/bookings");
    return data;
  } catch (err) {
    const error = normalizeApiError(err);
    throw new Error(error.message);
  }
};

/**
 * Fetch artisan tasks
 */
export const fetchArtisanTasks = async (filters = {}) => {
  const { data } = await apiClient.get("/artisan/tasks", { params: filters });
  return data;
};

/**
 * Get task by ID
 */
export const getTask = async (taskId) => {
  const { data } = await apiClient.get(`/artisan/tasks/${taskId}`);
  return data;
};

/**
 * Update task status
 */
export const updateTaskStatus = async (id, status, notes = "") => {
  const { data } = await apiClient.patch(`/artisan/tasks/${id}`, { status, notes });
  return data;
};

/**
 * Upload task completion photos
 */
export const uploadTaskPhotos = async (taskId, photos) => {
  const formData = new FormData();
  photos.forEach((photo) => {
    formData.append("photos", photo);
  });

  try {
    const { data } = await apiClient.post(`/artisan/tasks/${taskId}/photos`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return data;
  } catch (err) {
    const error = normalizeApiError(err);
    throw new Error(error.message);
  }
};

/**
 * ============ EARNINGS ============
 */

/**
 * Get earnings summary
 */
export const getEarningsSummary = async () => {
  const { data } = await apiClient.get("/artisan/earnings/summary");
  return data;
};

/**
 * Get earnings history
 */
export const getEarningsHistory = async (filters = {}) => {
  const { data } = await apiClient.get("/artisan/earnings", { params: filters });
  return data;
};

/**
 * Generate invoice
 */
export const generateInvoice = async (taskId) => {
  try {
    const { data } = await apiClient.post(`/artisan/tasks/${taskId}/invoice`, {}, {
      responseType: "blob",
    });
    return data;
  } catch (err) {
    const error = normalizeApiError(err);
    throw new Error(error.message);
  }
};

/**
 * ============ SCHEDULING ============
 */

/**
 * Get artisan schedule/availability
 */
export const getSchedule = async (startDate, endDate) => {
  const { data } = await apiClient.get("/artisan/schedule", {
    params: { startDate, endDate },
  });
  return data;
};

/**
 * Update availability
 */
export const updateAvailability = async (availability) => {
  try {
    const { data } = await apiClient.put("/artisan/availability", availability);
    return data;
  } catch (err) {
    const error = normalizeApiError(err);
    throw new Error(error.message);
  }
};

/**
 * ============ MESSAGING ============
 */

/**
 * Get conversations for artisan
 */
export const getArtisanConversations = async () => {
  try {
    const { data } = await apiClient.get("/artisan/conversations");
    return data.conversations || data.data || data || [];
  } catch (err) {
    if (err.response?.status === 404) return [];
    const error = normalizeApiError(err);
    throw new Error(error.message);
  }
};

/**
 * Send message in conversation
 */
export const sendArtisanMessage = async (conversationId, message, files = []) => {
  const formData = new FormData();
  formData.append("message", message);
  files.forEach((file) => {
    formData.append("files", file);
  });

  try {
    const { data } = await apiClient.post(`/artisan/conversations/${conversationId}/messages`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return data;
  } catch (err) {
    const error = normalizeApiError(err);
    throw new Error(error.message);
  }
};
