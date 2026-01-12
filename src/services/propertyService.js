/**
 * propertyService.js - Property Management Service
 * 
 * Handles all property-related API calls for the public property listing system.
 * Used by: Public property pages, property search, property detail views.
 * 
 * Features:
 * - Fetch all properties (with filters)
 * - Fetch single property by ID
 * - Create new property (requires authentication)
 * - Update existing property (requires authentication)
 * - Delete property (requires authentication)
 * - Search and filter properties
 * 
 * Mock Mode:
 * - Supports hybrid mock/real API system
 * - Mock data loaded dynamically in development
 * - Production uses real API endpoints
 * 
 * API Endpoints:
 * - GET /properties - List all properties (public)
 * - GET /properties/:id - Get property details
 * - POST /properties/ - Create property (authenticated)
 * - PUT /properties/:id/ - Update property (authenticated)
 * - DELETE /properties/:id/ - Delete property (authenticated)
 * 
 * Response Normalization:
 * - Handles various backend response shapes (data.properties, data.results, data.data, data)
 * - Always returns consistent array/object format
 * 
 * @module propertyService
 * @requires ./apiClient
 */

// src/services/propertyService.js
import apiClient from "./apiClient";

/**
 * Default fallback mocks (always available)
 * Used when mock file is not found or in production fallback scenarios
 */
let mockData = {
  withData: null,
  mockProperties: [
    {
      id: "mock_1",
      title: "Beautiful Apartment in East Legon",
      address: "East Legon, Accra",
      priceGhs: 1500,
      images: ["https://placehold.co/600x400?text=Mock+1"],
      landlord: {
        id: "landlord_mock_1",
        full_name: "John Mensah",
        email: "john.mensah@example.com",
        phone: "+233241234567",
        business_type: "Real Estate Developer",
        ratings: {
          average: 4.5,
          total: 12
        },
        verification_status: {
          identity_verified: true,
          background_check_status: "verified",
          payment_verified: true,
          document_verified: true,
          overall_status: "verified"
        }
      },
      description: "A beautiful 3-bedroom apartment in the heart of East Legon with modern amenities.",
      bedrooms: 3,
      bathrooms: 2,
      property_type: "apartment",
      city: "Accra",
      region: "Greater Accra",
      country: "Ghana",
      amenities: ["WiFi", "Parking", "Security", "Gym", "Swimming Pool"],
      status: "approved"
    },
  ],
};

/**
 * Dynamically load real mocks only when needed (Vite-friendly)
 * Only loads in development or when VITE_USE_MOCK=true
 * Prevents mock code from being included in production builds
 */
if (import.meta.env.DEV || String(import.meta.env.VITE_USE_MOCK).toLowerCase() === "true") {
  import("@/mocks/propertyMock")
    .then((module) => {
      // Merge real mocks if file exists
      mockData = { ...mockData, ...module.default };
    })
    .catch(() => {
      console.warn("propertyMock.js not found — using built-in fallback mocks");
    });
}

/**
 * Mock Mode Detection
 * Checks if mock mode is enabled via environment variable
 */
const USE_MOCK = String(import.meta.env.VITE_USE_MOCK).toLowerCase() === "true";

/**
 * Simulate Network Delay
 * Helper function to add realistic delays in mock mode
 * 
 * @param {*} data - Data to return
 * @param {number} ms - Delay in milliseconds (default: 400ms)
 * @returns {Promise} Delayed promise
 */
const withDelay = (data, ms = 400) =>
  new Promise((resolve) => setTimeout(() => resolve(data), ms));

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

/* ========== Properties ========== */

/**
 * Fetch All Properties
 * 
 * Retrieves a list of all properties with optional filters.
 * Public endpoint - no authentication required.
 * 
 * API Contract (Django):
 * - GET /api/properties
 * - Query params: search, min_price, max_price, city, property_type, etc.
 * - Response: { properties: [], count: number } OR { results: [], count: number }
 * 
 * @param {Object} opts - Query parameters for filtering
 * @param {string} opts.search - Search query string
 * @param {number} opts.min_price - Minimum price filter
 * @param {number} opts.max_price - Maximum price filter
 * @param {string} opts.city - City filter
 * @param {string} opts.property_type - Property type filter
 * @returns {Promise<Array>} Array of property objects
 * @throws {Error} If fetch fails
 */
export const fetchProperties = async (opts = {}) => {
  if (USE_MOCK) {
    // Always return a plain array in mock mode
    const list = mockData.mockProperties || [];
    return withDelay(list, 450);
  }

  try {
    const { data } = await apiClient.get("/properties", { params: opts });
    // Normalize various possible backend shapes into a flat array
    // Handles: { properties: [] }, { results: [] }, { data: [] }, or direct array
    return (
      data?.properties ||
      data?.results ||
      data?.data ||
      data ||
      []
    );
  } catch (err) {
    throw extractError(err, "Failed to fetch properties");
  }
};

/**
 * Fetch Property By ID
 * 
 * Retrieves detailed information for a single property.
 * Public endpoint - no authentication required.
 * 
 * API Contract (Django):
 * - GET /api/properties/:id
 * - Response: { id, title, address, priceGhs, images, description, amenities, ... }
 * 
 * @param {string|number} id - Property ID
 * @returns {Promise<Object>} Property object with full details
 * @throws {Error} If property not found or fetch fails
 */
export const fetchProperty = async (id) => {
  if (!id) throw new Error("fetchProperty: id required");

  if (USE_MOCK) {
    const property = mockData.mockProperties?.find((p) => p.id === id);
    return withDelay({ data: property || null }, 300);
  }

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
 * Creates a new property listing. Requires authentication (Landlord role).
 * Property is created with status="pending" and requires admin approval.
 * 
 * API Contract (Django):
 * - POST /api/properties/
 * - Content-Type: multipart/form-data (for image uploads)
 * - Request: { title, address, priceGhs, description, images[], amenities[], ... }
 * - Response: { id, title, address, status: "pending", ... }
 * 
 * Note: Property status defaults to "pending" and requires admin/super-admin approval
 * before becoming publicly visible.
 * 
 * @param {Object|FormData} payload - Property data (can be FormData for file uploads)
 * @returns {Promise<Object>} Created property object
 * @throws {Error} If creation fails or validation errors
 */
export const createProperty = async (payload) => {
  if (USE_MOCK) {
    const newProp = {
      ...payload,
      id: `mock_${Date.now()}`,
      createdAt: new Date().toISOString(),
      status: "pending", // Properties require approval
    };
    mockData.mockProperties.unshift(newProp);
    return withDelay({ data: newProp }, 600);
  }

  try {
    const { data } = await apiClient.post("/properties/", payload);
    return data;
  } catch (err) {
    throw extractError(err, "Failed to create property");
  }
};

/**
 * Update Property
 * 
 * Updates an existing property. Requires authentication (property owner or admin).
 * Updated properties enter "pending" status and require re-approval.
 * 
 * API Contract (Django):
 * - PUT /api/properties/:id/
 * - Content-Type: multipart/form-data (if images are updated)
 * - Request: { title?, address?, priceGhs?, description?, images[], ... }
 * - Response: { id, title, address, status: "pending", ... }
 * 
 * Important: Property edits require re-approval before becoming publicly visible again.
 * This ensures data integrity and prevents unauthorized changes.
 * 
 * @param {string|number} id - Property ID
 * @param {Object|FormData} payload - Updated property data
 * @returns {Promise<Object>} Updated property object
 * @throws {Error} If property not found or update fails
 */
export const updateProperty = async (id, payload) => {
  if (!id) throw new Error("updateProperty: id required");

  if (USE_MOCK) {
    const idx = mockData.mockProperties.findIndex((p) => p.id === id);
    if (idx === -1) throw new Error("Mock: property not found");

    mockData.mockProperties[idx] = {
      ...mockData.mockProperties[idx],
      ...payload,
      status: "pending", // Re-approval required after edit
      updatedAt: new Date().toISOString(),
    };

    return withDelay({ data: mockData.mockProperties[idx] }, 500);
  }

  try {
    const { data } = await apiClient.put(`/properties/${encodeURIComponent(id)}/`, payload);
    return data;
  } catch (err) {
    throw extractError(err, "Failed to update property");
  }
};

/**
 * Delete Property
 * 
 * Deletes a property listing. Requires authentication (property owner or admin).
 * Deletion is permanent and tracked in audit logs.
 * 
 * API Contract (Django):
 * - DELETE /api/properties/:id/
 * - Response: { success: true } or 204 No Content
 * 
 * Note: Property deletion is logged in audit trail for compliance and tracking.
 * 
 * @param {string|number} id - Property ID
 * @returns {Promise<Object>} Success response { success: true }
 * @throws {Error} If property not found or deletion fails
 */
export const deleteProperty = async (id) => {
  if (!id) throw new Error("deleteProperty: id required");

  if (USE_MOCK) {
    mockData.mockProperties = mockData.mockProperties.filter((p) => p.id !== id);
    return withDelay({ success: true }, 400);
  }

  try {
    const { data } = await apiClient.delete(`/properties/${encodeURIComponent(id)}/`);
    return data;
  } catch (err) {
    throw extractError(err, "Failed to delete property");
  }
};

export const uploadImage = async (file) => {
  if (!file) throw new Error("uploadImage: file required");

  if (USE_MOCK) {
    const mockUrl = `https://placehold.co/800x600/orange/white?text=${encodeURIComponent(
      file.name.split(".")[0]
    )}`;
    return withDelay({ url: mockUrl }, 800);
  }

  try {
    const fd = new FormData();
    fd.append("file", file);
    // Backend: POST /api/properties/uploads/images/
    const { data } = await apiClient.post("/properties/uploads/images/", fd, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return data;
  } catch (err) {
    throw extractError(err, "Image upload failed");
  }
};

export const getAmenities = async () => {
  if (USE_MOCK) {
    // Import mock amenities
    try {
      const { mockAmenities } = await import("@/mocks/propertyMock");
      return withDelay(mockAmenities.map((name, idx) => ({ id: `amenity_${idx}`, name })), 300);
    } catch {
      // Fallback amenities
      const fallback = [
        "Parking",
        "Water",
        "Electricity",
        "Internet",
        "Kitchen",
        "Washing Machine",
        "Balcony",
        "Fenced Compound",
        "Air Conditioning",
        "Security",
      ];
      return withDelay(fallback.map((name, idx) => ({ id: `amenity_${idx}`, name })), 300);
    }
  }

  try {
    // Backend exposes amenities under /api/properties/amenities/
    const { data } = await apiClient.get("/properties/amenities/");

    // Normalize into array of { id, name }
    const list = Array.isArray(data?.amenities)
      ? data.amenities
      : Array.isArray(data?.results)
        ? data.results
        : Array.isArray(data)
          ? data
          : [];

    return list.map((item, idx) => {
      if (typeof item === "string") {
        return { id: `amenity_${idx}`, name: item };
      }
      return {
        id: item.id ?? `amenity_${idx}`,
        name: item.name ?? String(item),
      };
    });
  } catch (err) {
    throw extractError(err, "Failed to fetch amenities");
  }
};
/**
 * Create Viewing Request (Alternative Endpoint)
 * 
 * Creates a viewing request for a property (Tenant only).
 * Alternative to tenantService.createViewingRequest - uses property-scoped endpoint.
 * 
 * API Contract (Django):
 * - POST /api/properties/:id/viewing-request/
 * - Request: { preferred_date, alternative_date?, message?, contact_phone? }
 * - Response: { id, property_id, tenant_id, status: "pending", preferred_date, ... }
 * 
 * Important:
 * - Properties must be approved (status: "published"/"active") before viewing requests
 * - Viewing requests default to "pending" status
 * - Requires landlord acceptance before confirmation
 * 
 * @param {Object} requestData - Viewing request data
 * @param {string|number} requestData.property - Property ID
 * @param {string} requestData.preferred_date - ISO datetime string
 * @param {string} [requestData.alternative_date] - Optional alternative datetime
 * @param {string} [requestData.message] - Optional message to landlord
 * @param {string} [requestData.contact_phone] - Optional contact phone
 * @returns {Promise<Object>} Created viewing request
 * @throws {Error} If property not found, not approved, or request fails
 */
export const createViewingRequest = async (requestData) => {
  try {
    const { data } = await apiClient.post(`/properties/${requestData.property}/viewing-request/`, {
      preferred_date: requestData.preferred_date,
      alternative_date: requestData.alternative_date || null,
      message: requestData.message || "",
      contact_phone: requestData.contact_phone || "",
    });
    return data;
  } catch (err) {
    throw extractError(err, "Failed to create viewing request");
  }
};

export { fetchProperties as getAllProperties }

export default {
  fetchProperty,
  createProperty,
  updateProperty,
  deleteProperty,
  uploadImage,
  getAmenities,
  createViewingRequest,
  getAllProperties: fetchProperties,
};