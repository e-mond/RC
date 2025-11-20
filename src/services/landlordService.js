// src/services/landlordService.js
import apiClient from "./apiClient";

// Dynamically import mocks only in development/mock mode (Vite-friendly)
let mocks = {
  withDelay: (data, ms) => new Promise((res) => setTimeout(() => res(data), ms)),
  fetchPropertiesMock: () => ({ data: [] }),
  fetchPropertyByIdMock: () => ({ data: {} }),
  createPropertyMock: () => ({ property: { id: "mock_123", title: "Mock Prop" } }),
  updatePropertyMock: () => ({ property: { title: "Updated" } }),
  deletePropertyMock: () => ({ success: true }),
  fetchBookingsMock: () => ({ data: [] }),
  respondBookingMock: () => ({ success: true }),
};

if (import.meta.env.DEV || String(import.meta.env.VITE_USE_MOCK).toLowerCase() === "true") {
  import("@/mocks/landlordMock")
    .then((module) => {
      mocks = { ...mocks, ...(module.default || module) };
    })
    .catch(() => {
      // Mock file doesn't exist — stay with defaults (safe in prod)
      console.warn("landlordMock.js not found — using fallback mocks");
    });
}

const isMockEnvEnabled = () => String(import.meta.env.VITE_USE_MOCK || "").toLowerCase() === "true";

function extractError(err, fallback = "Server error") {
  if (!err) return new Error(fallback);
  if (err.response?.data?.message) return new Error(err.response.data.message);
  if (err.message) return new Error(err.message);
  return new Error(fallback);
}

/* ---------- Properties ---------- */

export const fetchProperties = async (ownerId) => {
  if (isMockEnvEnabled()) {
    return mocks.withDelay(mocks.fetchPropertiesMock?.() || { data: [] }, 400);
  }
  try {
    const { data } = await apiClient.get(`/landlord/${encodeURIComponent(ownerId)}/properties`);
    return data;
  } catch (err) {
    throw extractError(err, "Failed to fetch properties");
  }
};

export const fetchPropertyById = async (id) => {
  if (isMockEnvEnabled()) {
    return mocks.withDelay(mocks.fetchPropertyByIdMock?.(id) || { data: {} }, 300);
  }
  try {
    const { data } = await apiClient.get(`/properties/${encodeURIComponent(id)}`);
    return data;
  } catch (err) {
    throw extractError(err, "Failed to fetch property");
  }
};

export const createProperty = async (payload) => {
  if (isMockEnvEnabled()) {
    return mocks.withDelay(mocks.createPropertyMock?.(payload) || { property: { id: "new_mock" } }, 400);
  }
  try {
    const fd = new FormData();
    Object.entries(payload).forEach(([k, v]) => {
      if (k === "images" && v && v.length) {
        Array.from(v).forEach((file) => fd.append("images", file));
      } else if (v !== undefined && v !== null) {
        fd.append(k, v);
      }
    });
    const { data } = await apiClient.post("/landlord/properties", fd, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return data;
  } catch (err) {
    throw extractError(err, "Failed to create property");
  }
};

export const updateProperty = async (id, payload) => {
  if (isMockEnvEnabled()) {
    return mocks.withDelay(mocks.updatePropertyMock?.(id, payload) || { property: { id } }, 400);
  }
  try {
    const fd = new FormData();
    Object.entries(payload).forEach(([k, v]) => {
      if (k === "images" && v && v.length) {
        Array.from(v).forEach((file) => fd.append("images", file));
      } else if (v !== undefined && v !== null) {
        fd.append(k, v);
      }
    });
    const { data } = await apiClient.put(`/landlord/properties/${encodeURIComponent(id)}`, fd, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return data;
  } catch (err) {
    throw extractError(err, "Failed to update property");
  }
};

export const deleteProperty = async (id) => {
  if (isMockEnvEnabled()) {
    return mocks.withDelay(mocks.deletePropertyMock?.(id) || { success: true }, 300);
  }
  try {
    const { data } = await apiClient.delete(`/landlord/properties/${encodeURIComponent(id)}`);
    return data;
  } catch (err) {
    throw extractError(err, "Failed to delete property");
  }
};

/* ---------- Bookings ---------- */

export const fetchBookings = async (ownerId) => {
  if (isMockEnvEnabled()) {
    return mocks.withDelay(mocks.fetchBookingsMock?.() || { data: [] }, 350);
  }
  try {
    const { data } = await apiClient.get(`/landlord/${encodeURIComponent(ownerId)}/bookings`);
    return data;
  } catch (err) {
    throw extractError(err, "Failed to fetch bookings");
  }
};

export const respondBooking = async (id, action) => {
  if (isMockEnvEnabled()) {
    return mocks.withDelay(mocks.respondBookingMock?.(id, action) || { success: true }, 300);
  }
  try {
    const { data } = await apiClient.patch(`/landlord/bookings/${encodeURIComponent(id)}`, { action });
    return data;
  } catch (err) {
    throw extractError(err, "Failed to respond to booking");
  }
};

export async function getLandlordDashboardStats() {
  const { data } = await apiClient.get("/landlord/dashboard/stats");
  return data;
}

export async function getLandlordRecentActivity() {
  const { data } = await apiClient.get("/landlord/dashboard/activity");
  return data;
}

export default {
  fetchProperties,
  fetchPropertyById,
  createProperty,
  updateProperty,
  deleteProperty,
  fetchBookings,
  respondBooking,
};