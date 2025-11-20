import apiClient from "@/services/apiClient";
import normalizeApiError from "@/utils/apiError";

// --- Mock data for development ---
const mockTasks = [
  {
    id: 1,
    title: "Fix leaking faucet",
    address: "12 Main St, Accra",
    status: "pending",
    priority: "high",
    propertyId: "prop_1",
    propertyTitle: "3BR Apartment",
    assignedDate: new Date().toISOString(),
    dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    description: "Kitchen faucet is leaking continuously",
    estimatedHours: 2,
    payment: 150,
  },
  {
    id: 2,
    title: "Install ceiling fan",
    address: "45 Oak Ave, Kumasi",
    status: "in_progress",
    priority: "medium",
    propertyId: "prop_2",
    propertyTitle: "2BR House",
    assignedDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
    description: "Install new ceiling fan in living room",
    estimatedHours: 3,
    payment: 200,
  },
  {
    id: 3,
    title: "Repair door lock",
    address: "78 Pine Rd, Accra",
    status: "completed",
    priority: "low",
    propertyId: "prop_3",
    propertyTitle: "Studio Apartment",
    assignedDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
    completedDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    description: "Front door lock mechanism needs repair",
    estimatedHours: 1.5,
    payment: 100,
  },
];

// In-memory copy for updating mock tasks
let devTasks = [...mockTasks];

/**
 * Register an artisan. Accepts FormData (idUpload etc).
 * @param {FormData} formData
 */
export const registerArtisan = async (formData) => {
  try {
    if (import.meta.env.DEV) {
      // simulate successful registration in dev
      return { success: true, message: "Mock artisan registered" };
    }

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
    if (import.meta.env.DEV) {
      // return empty mock bookings in dev
      return { bookings: [] };
    }

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
  if (import.meta.env.DEV) {
    // Filter mock tasks
    let filtered = [...devTasks];
    if (filters.status) {
      filtered = filtered.filter((t) => t.status === filters.status);
    }
    if (filters.priority) {
      filtered = filtered.filter((t) => t.priority === filters.priority);
    }
    return { tasks: filtered };
  }

  const { data } = await apiClient.get("/artisan/tasks", { params: filters });
  return data;
};

/**
 * Get task by ID
 */
export const getTask = async (taskId) => {
  if (import.meta.env.DEV) {
    const task = devTasks.find((t) => t.id === taskId);
    if (!task) throw new Error("Task not found");
    return { task };
  }

  const { data } = await apiClient.get(`/artisan/tasks/${taskId}`);
  return data;
};

/**
 * Update task status
 */
export const updateTaskStatus = async (id, status, notes = "") => {
  if (import.meta.env.DEV) {
    // simulate updating task in dev
    devTasks = devTasks.map((t) =>
      t.id === id ? { ...t, status, notes, updatedAt: new Date().toISOString() } : t
    );
    return { success: true, task: devTasks.find((t) => t.id === id) };
  }

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
  if (import.meta.env.DEV) {
    const completed = devTasks.filter((t) => t.status === "completed");
    const totalEarnings = completed.reduce((sum, t) => sum + (t.payment || 0), 0);
    const pendingEarnings = devTasks
      .filter((t) => t.status === "in_progress" || t.status === "pending")
      .reduce((sum, t) => sum + (t.payment || 0), 0);

    return {
      totalEarnings,
      pendingEarnings,
      completedTasks: completed.length,
      totalTasks: devTasks.length,
    };
  }

  const { data } = await apiClient.get("/artisan/earnings/summary");
  return data;
};

/**
 * Get earnings history
 */
export const getEarningsHistory = async (filters = {}) => {
  if (import.meta.env.DEV) {
    const completed = devTasks.filter((t) => t.status === "completed");
    return {
      earnings: completed.map((t) => ({
        id: t.id,
        taskTitle: t.title,
        amount: t.payment || 0,
        date: t.completedDate || t.assignedDate,
        status: "paid",
      })),
    };
  }

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
  if (import.meta.env.DEV) {
    // Mock schedule data
    return {
      schedule: devTasks.map((t) => ({
        id: t.id,
        title: t.title,
        start: t.assignedDate,
        end: t.dueDate,
        status: t.status,
      })),
    };
  }

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
