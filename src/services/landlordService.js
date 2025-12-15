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

/* ---------- Properties (landlord-scoped helpers) ---------- */

/**
 * Fetch properties for a specific landlord.
 * NOTE: Backend exposes this under `/api/properties/landlord/<id>/`.
 */
export const fetchProperties = async (ownerId) => {
  if (!ownerId) {
    throw new Error("fetchProperties: ownerId is required");
  }

  if (isMockEnvEnabled()) {
    return mocks.withDelay(mocks.fetchPropertiesMock?.() || { data: [] }, 400);
  }

  try {
    const { data } = await apiClient.get(
      `/properties/landlord/${encodeURIComponent(ownerId)}/`
    );
    return data;
  } catch (err) {
    throw extractError(err, "Failed to fetch properties");
  }
};

export const fetchPropertyById = async (id) => {
  // Always use real API for property details to keep landlord views accurate.
  try {
    const { data } = await apiClient.get(`/properties/${encodeURIComponent(id)}`);
    return data;
  } catch (err) {
    throw extractError(err, "Failed to fetch property");
  }
};

export const createProperty = async (payload) => {
  // Always create real properties against the backend (no mocks).
  try {
    // Backend PropertyCreateSerializer expects:
    // - multipart/form-data with `images` as files
    // - amenity_ids[] for amenities
    const fd = new FormData();
    Object.entries(payload || {}).forEach(([k, v]) => {
      if (v === undefined || v === null) return;

      if (k === "images" && v && v.length) {
        Array.from(v).forEach((file) => fd.append("images", file));
      } else if (k === "amenity_ids" && Array.isArray(v)) {
        v.forEach((id) => fd.append("amenity_ids", id));
      } else if (k === "lat") {
        fd.append("latitude", v);
      } else if (k === "lng") {
        fd.append("longitude", v);
      } else if (k === "area" || k === "area_sqm") {
        // Normalise to area_sqm which backend expects
        fd.append("area_sqm", v);
      } else {
        fd.append(k, v);
      }
    });

    const { data } = await apiClient.post("/properties/", fd, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return data;
  } catch (err) {
    throw extractError(err, "Failed to create property");
  }
};

export const updateProperty = async (id, payload) => {
  // Always update real properties against the backend (no mocks).
  try {
    const fd = new FormData();
    Object.entries(payload || {}).forEach(([k, v]) => {
      if (v === undefined || v === null) return;

      if (k === "images" && v && v.length) {
        Array.from(v).forEach((file) => fd.append("images", file));
      } else if (k === "amenity_ids" && Array.isArray(v)) {
        v.forEach((aid) => fd.append("amenity_ids", aid));
      } else if (k === "lat") {
        fd.append("latitude", v);
      } else if (k === "lng") {
        fd.append("longitude", v);
      } else if (k === "area" || k === "area_sqm") {
        fd.append("area_sqm", v);
      } else {
        fd.append(k, v);
      }
    });

    const { data } = await apiClient.put(`/properties/${encodeURIComponent(id)}/`, fd, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return data;
  } catch (err) {
    throw extractError(err, "Failed to update property");
  }
};

export const deleteProperty = async (id) => {
  // Always delete real properties against the backend (no mocks).
  try {
    const { data } = await apiClient.delete(`/properties/${encodeURIComponent(id)}/`);
    return data;
  } catch (err) {
    throw extractError(err, "Failed to delete property");
  }
};

/* ---------- Bookings (landlord-scoped via auth) ---------- */

export const fetchBookings = async () => {
  try {
    // Backend filters by role: landlords automatically see their own bookings
    const { data } = await apiClient.get("/bookings/");
    const list = data?.results ?? data ?? [];
    return Array.isArray(list) ? list : [];
  } catch (err) {
    throw extractError(err, "Failed to fetch bookings");
  }
};

export const respondBooking = async (id, action) => {
  try {
    // Map UI actions to backend booking statuses
    let status;
    if (action === "accept") status = "approved";
    else if (action === "decline") status = "rejected";
    else status = action;

    const { data } = await apiClient.patch(`/bookings/${encodeURIComponent(id)}/`, { status });
    return data;
  } catch (err) {
    throw extractError(err, "Failed to respond to booking");
  }
};

/* ---------- Dashboard helpers ---------- */

export async function getLandlordDashboardStats() {
  try {
    // Use generic analytics dashboard + viewing requests to build landlord dashboard view
    const [analyticsRes, viewingRes] = await Promise.all([
      apiClient.get("/analytics/dashboard/"),
      apiClient.get("/properties/viewing-requests/", { params: { status: "pending" } }),
    ]);

    const analytics = analyticsRes.data || analyticsRes || {};
    const viewingRequests = viewingRes.data ?? viewingRes ?? [];

    const totalProperties = analytics.total_properties ?? 0;
    const rentedProperties = analytics.rented_properties ?? 0;
    const totalRevenue = analytics.total_revenue ?? 0;

    const occupancyRate =
      totalProperties > 0 ? Math.round((rentedProperties / totalProperties) * 100) : 0;

    const pendingViewRequests = Array.isArray(viewingRequests)
      ? viewingRequests.length
      : viewingRequests.count ?? 0;

    // Simple derived charts to keep UI happy (can be refined later)
    const revenueChart = [
      { month: "This Month", revenue: totalRevenue },
    ];
    const occupancyTrend = [
      { month: "Now", rate: occupancyRate },
    ];

    return {
      totalProperties,
      monthlyRevenue: totalRevenue,
      occupancyRate,
      pendingViewRequests,
      revenueChart,
      occupancyTrend,
    };
  } catch (err) {
    throw extractError(err, "Failed to load landlord dashboard stats");
  }
}

export async function getLandlordRecentActivity() {
  try {
    // Very lightweight activity feed from recent bookings
    const { data } = await apiClient.get("/bookings/", { params: { page_size: 5 } });
    const results = data?.results ?? data ?? [];

    return (Array.isArray(results) ? results : []).map((b) => ({
      message: `Booking ${b.status || "update"} for property ${b.property?.title || `#${b.property_id || b.id}`}`,
      time: b.created_at || b.updated_at || "",
    }));
  } catch (err) {
    throw extractError(err, "Failed to load landlord activity");
  }
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