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
    
    // Strategy 1: Try role-based endpoint (like dashboard uses /analytics/dashboard/)
    // Backend should automatically filter by authenticated landlord's role
    // This is the most consistent with how dashboard works
    let data;
    let endpoint;
    let usedEndpoint = "unknown";
    
    // CRITICAL FIX: Do NOT use /properties/ without explicit filters
    // This endpoint is public/tenant-accessible and should NOT be used for landlord-specific queries
    // Using it without filters would return ALL properties or filter incorrectly by role
    // Strategy 1: Try landlord-specific endpoint first (most reliable)
    try {
      endpoint = API_ENDPOINTS.PROPERTIES.LANDLORD_PROPERTIES(ownerId);
      const response = await apiClient.get(endpoint);
      data = response.data;
      usedEndpoint = `/properties/landlord/${ownerId}/`;
      console.log(`[fetchProperties] Successfully fetched properties using landlord-specific endpoint`);
    } catch (landlordEndpointErr) {
      try {
        // Strategy 2: Fallback to /properties/ with explicit ownerId query parameters
        console.log(`[fetchProperties] Landlord-specific endpoint failed, trying with ownerId query param:`, landlordEndpointErr.message);
        endpoint = API_ENDPOINTS.PROPERTIES.BASE;
        const response = await apiClient.get(endpoint, {
          params: {
            landlord: ownerId,
            owner: ownerId,
            owner_id: ownerId,
            // Explicitly filter by owner to avoid role-based filtering issues
          }
        });
        data = response.data;
        usedEndpoint = "/properties/ with ownerId query param";
        console.log(`[fetchProperties] Successfully fetched properties using query param approach`);
      } catch (queryParamErr) {
        // Strategy 3: Last resort - try without explicit filters (only if backend supports role-based filtering)
        // This is risky and should only be used if the backend guarantees role-based filtering
        console.warn(`[fetchProperties] Query param approach failed, trying role-based endpoint as last resort:`, queryParamErr.message);
        endpoint = API_ENDPOINTS.PROPERTIES.BASE;
        const response = await apiClient.get(endpoint, {
          params: {
            // No filters - relies on backend role-based filtering (risky)
          }
        });
        data = response.data;
        usedEndpoint = "role-based /properties/ (last resort)";
        console.warn(`[fetchProperties] Using role-based endpoint - this may return incorrect results`);
      }
    }
    
    // Handle different response formats from backend
    // Backend might return: { data: [...] }, { properties: [...] }, { results: [...] }, or direct array
    let propertiesList = [];
    if (Array.isArray(data)) {
      propertiesList = data;
    } else if (Array.isArray(data?.data)) {
      propertiesList = data.data;
    } else if (Array.isArray(data?.properties)) {
      propertiesList = data.properties;
    } else if (Array.isArray(data?.results)) {
      propertiesList = data.results;
    }
    
    console.log(`[fetchProperties] Extracted ${propertiesList.length} properties for ownerId: ${ownerId} using endpoint: ${usedEndpoint}`);
    
    // Filter properties to ensure they belong to this landlord (safety check)
    // This prevents showing properties from other landlords if backend filtering fails
    const filteredProperties = propertiesList.filter(p => {
      const propertyOwnerId = p.landlord?.id || p.owner?.id || p.owner_id || p.landlord_id;
      return !propertyOwnerId || propertyOwnerId.toString() === ownerId.toString();
    });
    
    if (filteredProperties.length !== propertiesList.length) {
      console.warn(`[fetchProperties] Filtered out ${propertiesList.length - filteredProperties.length} properties that didn't belong to ownerId: ${ownerId}`);
    }
    
    return { data: filteredProperties };
  } catch (err) {
    // Enhanced error logging for debugging
    console.error(`[fetchProperties] Error fetching properties for ownerId ${ownerId}:`, {
      message: err.message,
      status: err.response?.status,
      statusText: err.response?.statusText,
      data: err.response?.data,
      endpoint: err.config?.url,
    });
    
    // Handle 404 gracefully - landlord might not have properties yet
    if (err.response?.status === 404) {
      console.log(`[fetchProperties] 404 response - landlord ${ownerId} has no properties yet`);
      return { data: [] };
    }
    
    // Handle 403 - might be authorization issue
    if (err.response?.status === 403) {
      console.error(`[fetchProperties] 403 Forbidden - authorization issue for ownerId: ${ownerId}`);
      throw new Error("You do not have permission to view these properties");
    }
    
    // Handle 401 - authentication issue
    if (err.response?.status === 401) {
      console.error(`[fetchProperties] 401 Unauthorized - authentication issue`);
      throw new Error("Authentication required. Please log in again.");
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
    // - multipart/form-data with `images` as files or URLs
    // - amenity_ids[] for amenities
    const fd = new FormData();
    Object.entries(payload || {}).forEach(([k, v]) => {
      if (v === undefined || v === null) return;

      if (k === "images" && v && v.length) {
        // Handle both File objects and URL strings
        Array.from(v).forEach((item) => {
          if (item instanceof File) {
            // If it's a File object, append directly
            fd.append("images", item);
          } else if (typeof item === 'string' && item.startsWith('http')) {
            // If it's a URL string, append as URL
            // Backend should accept image URLs that were already uploaded
            fd.append("images", item);
          }
        });
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

    // Don't set Content-Type header manually - let apiClient interceptor handle it
    // The interceptor will automatically set the correct multipart/form-data with boundary
    const { data } = await apiClient.post("/properties/", fd);
    return data;
  } catch (err) {
    // Extract more detailed error message from backend
    if (err.response?.data) {
      const errorData = err.response.data;
      let errorMessage = "Failed to create property";
      
      // Handle Django validation errors
      if (typeof errorData === 'object') {
        const fieldErrors = Object.entries(errorData)
          .map(([field, messages]) => {
            const msg = Array.isArray(messages) ? messages[0] : messages;
            return `${field}: ${msg}`;
          })
          .join(', ');
        
        if (fieldErrors) {
          errorMessage = `Validation error: ${fieldErrors}`;
        } else if (errorData.detail) {
          errorMessage = errorData.detail;
        } else if (errorData.message) {
          errorMessage = errorData.message;
        }
      } else if (typeof errorData === 'string') {
        errorMessage = errorData;
      }
      
      throw new Error(errorMessage);
    }
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
        // Handle both File objects and URL strings
        Array.from(v).forEach((item) => {
          if (item instanceof File) {
            fd.append("images", item);
          } else if (typeof item === 'string' && item.startsWith('http')) {
            fd.append("images", item);
          }
        });
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
    // Try multiple endpoints to find viewing requests/bookings
    // Backend may use different endpoints: /bookings/, /properties/viewing-requests/, or /landlord/bookings/
    let list = [];
    
    try {
      // First try: /properties/viewing-requests/ (same as dashboard uses)
      const { data: viewingData } = await apiClient.get("/properties/viewing-requests/");
      list = viewingData?.results ?? viewingData?.data ?? (Array.isArray(viewingData) ? viewingData : []);
    } catch (err1) {
      // Fallback 1: /bookings/
      try {
        const { data: bookingsData } = await apiClient.get("/bookings/");
        list = bookingsData?.results ?? bookingsData?.data ?? (Array.isArray(bookingsData) ? bookingsData : []);
      } catch (err2) {
        // Fallback 2: /landlord/bookings/
        try {
          const { API_ENDPOINTS } = await import("@/config/apiEndpoints");
          const { data: landlordBookingsData } = await apiClient.get(API_ENDPOINTS.LANDLORD?.BOOKINGS || "/landlord/bookings/");
          list = landlordBookingsData?.results ?? landlordBookingsData?.data ?? (Array.isArray(landlordBookingsData) ? landlordBookingsData : []);
        } catch (err3) {
          // All endpoints failed, return empty array
          console.warn("All booking endpoints failed, returning empty list");
          list = [];
        }
      }
    }
    
    // Normalize booking data structure for consistent display
    return Array.isArray(list) ? list.map(normalizeBookingData) : [];
  } catch (err) {
    throw extractError(err, "Failed to fetch bookings");
  }
};

/**
 * Normalize booking data structure from various backend formats
 * Ensures consistent field names across different API responses
 */
function normalizeBookingData(booking) {
  if (!booking || typeof booking !== "object") return booking;
  
  return {
    id: booking.id,
    property_id: booking.property_id || booking.propertyId || booking.property?.id,
    propertyId: booking.property_id || booking.propertyId || booking.property?.id,
    propertyTitle: booking.propertyTitle || booking.property?.title || booking.property_title,
    tenant_id: booking.tenant_id || booking.tenantId || booking.tenant?.id,
    applicantId: booking.tenant_id || booking.tenantId || booking.applicantId || booking.tenant?.id,
    applicantName: booking.applicantName || booking.tenant_name || booking.tenant?.full_name || booking.tenant?.name || booking.tenantName,
    phone: booking.phone || booking.contact_phone || booking.contactPhone || booking.tenant?.phone,
    status: booking.status || "pending",
    preferred_date: booking.preferred_date || booking.preferredDate,
    dateRequested: booking.dateRequested || booking.requested_date || booking.preferred_date || booking.preferredDate || booking.created_at,
    requestedDate: booking.dateRequested || booking.requested_date || booking.preferred_date || booking.preferredDate || booking.created_at,
    message: booking.message || booking.notes,
    created_at: booking.created_at || booking.createdAt || booking.dateRequested,
  };
}

export const respondBooking = async (id, action) => {
  if (!id) {
    throw new Error("Booking ID is required");
  }

  // Map UI actions to backend booking statuses
  let status;
  if (action === "accept") status = "approved";
  else if (action === "decline") status = "rejected";
  else status = action;

  const encodedId = encodeURIComponent(id);
  let data;
  let lastError;

  // Try multiple endpoints in order of likelihood
  // Endpoint 1: /properties/viewing-requests/{id}/respond/ (most likely correct)
  try {
    const response = await apiClient.patch(`/properties/viewing-requests/${encodedId}/respond/`, { status });
    data = response.data;
  } catch (err1) {
    // Endpoint 2: /properties/viewing-requests/{id}/ (fallback, but backend has bug)
    try {
      const response = await apiClient.patch(`/properties/viewing-requests/${encodedId}/`, { status });
      data = response.data;
    } catch (err2) {
      // Endpoint 3: /landlord/bookings/{id}/respond/ (alternative)
      try {
        const { API_ENDPOINTS } = await import("@/config/apiEndpoints");
        const endpoint = API_ENDPOINTS.LANDLORD?.RESPOND_BOOKING?.(id) || `/landlord/bookings/${encodedId}/respond/`;
        const response = await apiClient.patch(endpoint, { status });
        data = response.data;
      } catch (err3) {
        // Endpoint 4: /bookings/{id}/ (last resort)
        try {
          const response = await apiClient.patch(`/bookings/${encodedId}/`, { status });
          data = response.data;
        } catch (err4) {
          // All endpoints failed
          lastError = err4;
          console.error("All booking response endpoints failed:", {
            endpoint1: err1.response?.status,
            endpoint2: err2.response?.status,
            endpoint3: err3.response?.status,
            endpoint4: err4.response?.status,
          });
        }
      }
    }
  }

  if (data) {
    return data;
  }

  // Provide user-friendly error message
  const errorMessage = lastError?.response?.status === 404
    ? "Booking not found. The booking may have been deleted or the ID is incorrect."
    : lastError?.response?.status === 500
    ? "Server error while processing your request. Please try again later."
    : lastError?.message || "Failed to respond to booking. Please try again.";

  throw extractError(lastError || new Error(errorMessage), errorMessage);
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