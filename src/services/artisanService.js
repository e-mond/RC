import apiClient from "@/services/apiClient";
import normalizeApiError from "@/utils/apiError";

// --- Mock data for development ---
const mockTasks = [
  { id: 1, title: "Fix leaking faucet", address: "12 Main St", status: "pending" },
  { id: 2, title: "Install ceiling fan", address: "45 Oak Ave", status: "pending" },
  { id: 3, title: "Repair door lock", address: "78 Pine Rd", status: "completed" },
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
export const fetchArtisanTasks = async () => {
  if (import.meta.env.DEV) {
    // return mock tasks in dev
    return { tasks: devTasks };
  }

  const { data } = await apiClient.get("/artisan/tasks");
  return data;
};

/**
 * Update task status
 */
export const updateTaskStatus = async (id, status) => {
  if (import.meta.env.DEV) {
    // simulate updating task in dev
    devTasks = devTasks.map(t => t.id === id ? { ...t, status } : t);
    return { success: true };
  }

  const { data } = await apiClient.post(`/artisan/tasks/${id}/status`, { status });
  return data;
};
