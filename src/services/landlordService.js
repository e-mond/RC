/**
 * landlordService.js - Landlord-Specific Service
 * 
 * Handles all landlord-scoped API calls for property and booking management.
 * Used by: Landlord dashboard, property management, booking management.
 * 
 * Features:
 * - Fetch landlord's properties
 * - Create/update/delete properties (landlord-scoped)
 * - Manage viewing requests/bookings
 * - Dashboard statistics and analytics
 * - Recent activity feed
 * 
 * Mock Mode:
 * - Supports hybrid mock/real API system
 * - Mock data loaded dynamically in development
 * - Production uses real API endpoints
 * 
 * API Endpoints:
 * - GET /properties/landlord/:ownerId/ - Get landlord's properties
 * - GET /properties/:id - Get property details
 * - POST /properties/ - Create property (multipart/form-data)
 * - PUT /properties/:id/ - Update property (multipart/form-data)
 * - DELETE /properties/:id/ - Delete property
 * - GET /landlord/bookings/ - Get viewing requests
 * - POST /landlord/bookings/:id/respond/ - Accept/decline viewing
 * - GET /landlord/dashboard/stats/ - Dashboard statistics
 * - GET /landlord/activity/ - Recent activity feed
 * 
 * Property Approval Flow:
 * - New properties default to "pending" status
 * - Require admin/super-admin approval before public visibility
 * - Property edits also require re-approval
 * 
 * @module landlordService
 * @requires ./apiClient
 */

// src/services/landlordService.js
import apiClient from "./apiClient";
import { isMockMode } from "@/mocks/mockManager";

/**
 * Default fallback mocks (always available)
 * Used when mock file is not found or in production fallback scenarios
 */
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

/**
 * Dynamically load real mocks only in development/mock mode (Vite-friendly)
 * Only loads in development or when VITE_USE_MOCK=true
 * Prevents mock code from being included in production builds
 */
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

/**
 * Mock Mode Detection
 * Checks if mock mode is enabled via environment variable or localStorage
 * 
 * @returns {boolean} True if mock mode is enabled
 */
const isMockEnvEnabled = () => isMockMode();

/**
 * Extract Error Message
 * Utility to consistently extract error messages from API responses
 * 
 * @param {Error} err - Error object
 * @param {string} fallback - Fallback error message
 * @returns {Error} Normalized error object
 */
function extractError(err, fallback = "Server error") {
  if (!err) return new Error(fallback);
  if (err.response?.data?.message) return new Error(err.response.data.message);
  if (err.message) return new Error(err.message);
  return new Error(fallback);
}

/* ---------- Properties (landlord-scoped helpers) ---------- */

/**
 * Fetch Properties for Landlord
 * 
 * Retrieves all properties owned by a specific landlord.
 * Used in landlord dashboard and property management pages.
 * 
 * API Contract (Django):
 * - GET /api/properties/landlord/:ownerId/
 * - Response: { data: [{ id, title, address, priceGhs, status, ... }] }
 * 
 * @param {string|number} ownerId - Landlord user ID
 * @returns {Promise<Object>} { data: Array<Property> }
 * @throws {Error} If ownerId is missing or fetch fails
 */
export const fetchProperties = async (ownerId) => {
  if (!ownerId) {
    throw new Error("fetchProperties: ownerId is required");
  }

  if (isMockEnvEnabled()) {
    return mocks.withDelay(mocks.fetchPropertiesMock?.() || { data: [] }, 400);
  }

  try {
    // Use unified API endpoint configuration
    const { API_ENDPOINTS } = await import("@/config/apiEndpoints");
    const endpoint = API_ENDPOINTS.PROPERTIES.LANDLORD_PROPERTIES(ownerId);
    
    const { data } = await apiClient.get(endpoint);
    
    // Handle different response formats from backend
    // Backend might return: { data: [...] }, { properties: [...] }, { results: [...] }, or direct array
    if (Array.isArray(data)) {
      return { data };
    } else if (Array.isArray(data?.data)) {
      return data;
    } else if (Array.isArray(data?.properties)) {
      return { data: data.properties };
    } else if (Array.isArray(data?.results)) {
      return { data: data.results };
    } else {
      // Return empty array if no properties found
      return { data: [] };
    }
  } catch (err) {
    // Handle 404 gracefully - landlord might not have properties yet
    if (err.response?.status === 404) {
      return { data: [] };
    }
    throw extractError(err, "Failed to fetch properties");
  }
};

/**
 * Fetch Property By ID
 * 
 * Retrieves detailed information for a single property.
 * Always uses real API (no mocks) to ensure landlord views are accurate.
 * 
 * API Contract (Django):
 * - GET /api/properties/:id
 * - Response: { id, title, address, priceGhs, status, images, amenities, ... }
 * 
 * @param {string|number} id - Property ID
 * @returns {Promise<Object>} Property object with full details
 * @throws {Error} If property not found or fetch fails
 */
export const fetchPropertyById = async (id) => {
  // Always use real API for property details to keep landlord views accurate.
  try {
    const { data } = await apiClient.get(`/properties/${encodeURIComponent(id)}`);
    return data;
  } catch (err) {
    throw extractError(err, "Failed to fetch property");
  }
};

/**
 * Create Property
 * 
 * Creates a new property listing for the authenticated landlord.
 * Property is created with status="pending" and requires admin approval.
 * 
 * API Contract (Django):
 * - POST /api/properties/
 * - Content-Type: multipart/form-data
 * - Request: FormData with title, address, priceGhs, description, images[], amenity_ids[], ...
 * - Response: { id, title, address, status: "pending", ... }
 * 
 * Important:
 * - Properties default to "pending" status
 * - Require admin/super-admin approval before public visibility
 * - Images must be uploaded as files in FormData
 * - Amenities passed as amenity_ids[] array
 * 
 * @param {Object} payload - Property data (will be converted to FormData)
 * @returns {Promise<Object>} Created property object
 * @throws {Error} If creation fails or validation errors
 */
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