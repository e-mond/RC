// src/services/tenantService.js
/**
 * Tenant-specific API service layer
 * All tenant-related API calls with proper error handling
 * Designed for Ghanaian rental market (mobile money, maintenance, etc.)
 */

import apiClient from "./apiClient";
import { session } from "@/utils/session";

// ──────────────────────────────────────────────────────────────────────────────
// Helper to extract meaningful error messages from API responses
// ──────────────────────────────────────────────────────────────────────────────
const getErrorMessage = (err, defaultMsg) => {
  return (
    err?.response?.data?.message ||
    err?.response?.data?.error ||
    err?.message ||
    defaultMsg ||
    "An unexpected error occurred. Please try again."
  );
};

// ──────────────────────────────────────────────────────────────────────────────
// AUTHENTICATION / REGISTRATION
// ──────────────────────────────────────────────────────────────────────────────

/**
 * Register a new tenant (with Ghana Card / ID upload support)
 * @param {FormData} formData - Contains profile info + ID documents
 * @returns {Promise<Object>} Registration response data
 */
export const registerTenant = async (formData) => {
  try {
    // Debug: Log FormData contents (for development only)
    if (import.meta.env.DEV) {
      console.log("FormData being sent:");
      const entries = [];
      for (const [key, value] of formData.entries()) {
        const displayValue = value instanceof File 
          ? `File: ${value.name} (${value.size} bytes, type: ${value.type})` 
          : value;
        console.log(`  ${key}:`, displayValue);
        entries.push({ key, value: displayValue });
      }
      console.log("FormData entries array:", entries);
    }
    
    // IMPORTANT: Don't set Content-Type header manually for FormData
    // Let axios/browser set it automatically with the correct boundary
    const { data } = await apiClient.post("/auth/signup/tenant/", formData, {
      // Remove Content-Type header - let axios handle it for FormData
      timeout: 45000, // 45s timeout for file uploads
    });
    return data;
  } catch (err) {
    // Enhanced error logging
    console.error("Tenant registration error:", err);
    if (err.response?.data) {
      console.error("Backend error response:", err.response.data);
      // Try to extract detailed error messages
      const errorData = err.response.data;
      
      // Handle Django REST Framework validation errors
      if (errorData.details) {
        const errorMessages = Object.entries(errorData.details)
          .map(([field, messages]) => `${field}: ${Array.isArray(messages) ? messages.join(", ") : messages}`)
          .join("; ");
        throw new Error(errorMessages || errorData.message || "Registration failed");
      }
      
      // Handle direct field errors (Django serializer format)
      if (typeof errorData === 'object' && !errorData.message && !errorData.error) {
        const fieldErrors = Object.entries(errorData)
          .map(([field, messages]) => {
            const msg = Array.isArray(messages) ? messages.join(", ") : messages;
            return `${field}: ${msg}`;
          })
          .join("; ");
        if (fieldErrors) {
          throw new Error(fieldErrors);
        }
      }
      
      if (errorData.message) {
        throw new Error(errorData.message);
      }
      
      if (errorData.error) {
        throw new Error(errorData.error);
      }
    }
    throw new Error(getErrorMessage(err, "Tenant registration failed"));
  }
};

// ──────────────────────────────────────────────────────────────────────────────
// RENTALS
// ──────────────────────────────────────────────────────────────────────────────

/**
 * Fetch all active/current rentals for the logged-in tenant
 * @returns {Promise<Array>} List of rental objects
 */
export const fetchTenantRentals = async () => {
  try {
    const { data } = await apiClient.get("/tenant/rentals");

    // Handle different possible response shapes
    return data.rentals || data.data || data || [];
  } catch (err) {
    console.error("fetchTenantRentals failed:", err);

    if (err?.response?.status === 401) {
      session.clearAll();
      window.location.href = "/login?expired=true";
      throw new Error("Session expired. Redirecting to login...");
    }

    if (err?.response?.status === 404) {
      return []; // No rentals yet - not an error
    }

    throw new Error(getErrorMessage(err, "Could not load your rentals"));
  }
};

/**
 * Get detailed information about a specific rental agreement
 * @param {string|number} rentalId
 * @returns {Promise<Object>} Rental details
 */
export const fetchRentalDetails = async (rentalId) => {
  try {
    const { data } = await apiClient.get(`/tenant/rentals/${rentalId}`);
    return data.rental || data.data || data;
  } catch (err) {
    throw new Error(getErrorMessage(err, "Could not load rental details"));
  }
};

/**
 * Initiate rent payment (supports mobile money, bank transfer, etc.)
 * @param {string|number} rentalId
 * @param {Object} payload - Payment details (amount, method, reference, etc.)
 * @returns {Promise<Object>} Payment initiation response
 */
export const payRent = async (rentalId, payload) => {
  try {
    const { data } = await apiClient.post(`/tenant/rentals/${rentalId}/pay`, payload);
    return data;
  } catch (err) {
    throw new Error(getErrorMessage(err, "Rent payment initiation failed"));
  }
};

// ──────────────────────────────────────────────────────────────────────────────
// FAVORITES / WISHLIST
// ──────────────────────────────────────────────────────────────────────────────

/**
 * Get all properties favorited by the current tenant
 * @returns {Promise<Array>} List of favorited properties
 */
export const getFavorites = async () => {
  try {
    const { data } = await apiClient.get("/tenant/favorites");
    return data.favorites || data.data || data || [];
  } catch (err) {
    if (err?.response?.status === 404) return [];
    throw new Error(getErrorMessage(err, "Could not load favorites"));
  }
};

/**
 * Add a property to tenant's favorites
 * @param {string|number} propertyId
 * @returns {Promise<Object>} Success response
 */
export const addToFavorites = async (propertyId) => {
  try {
    // Try multiple endpoint formats for backend compatibility
    try {
      const { data } = await apiClient.post("/tenant/favorites/", { property_id: propertyId });
      return data;
    } catch (err1) {
      // Fallback: try with propertyId field name
      try {
        const { data } = await apiClient.post("/tenant/favorites/", { propertyId });
        return data;
      } catch (err2) {
        // Fallback: try without trailing slash
        const { data } = await apiClient.post("/tenant/favorites", { property_id: propertyId });
        return data;
      }
    }
  } catch (err) {
    throw new Error(getErrorMessage(err, "Could not add property to favorites"));
  }
};

/**
 * Remove a property from tenant's favorites
 * @param {string|number} propertyId
 * @returns {Promise<Object>} Success response
 */
export const removeFromFavorites = async (propertyId) => {
  try {
    const { data } = await apiClient.delete(`/tenant/favorites/${propertyId}`);
    return data;
  } catch (err) {
    throw new Error(getErrorMessage(err, "Could not remove property from favorites"));
  }
};

/**
 * Check if a specific property is in tenant's favorites
 * @param {string|number} propertyId
 * @returns {Promise<boolean>}
 */
export const isFavorited = async (propertyId) => {
  try {
    const { data } = await apiClient.get(`/tenant/favorites/${propertyId}/check`);
    return !!data.isFavorited;
  } catch {
    // Silent fail → assume not favorited if check fails
    return false;
  }
};

// ──────────────────────────────────────────────────────────────────────────────
// VIEWING REQUESTS (new - connects to PropertyDetail.jsx)
// ──────────────────────────────────────────────────────────────────────────────

/**
 * Create Viewing Request
 * 
 * Submits a request to view a property (Tenant only).
 * Creates a viewing request that requires landlord approval.
 * 
 * API Contract (Django):
 * - POST /api/tenant/viewing-requests
 * - Alternative endpoint: POST /api/properties/:id/viewing-request (see propertyService.js)
 * - Request: { propertyId, preferredDate, message?, contact_phone? }
 * - Response: { id, property_id, tenant_id, status: "pending", preferred_date, ... }
 * 
 * Note: Viewing requests default to "pending" status and require landlord acceptance.
 * Status flow: pending → accepted/declined → completed/no-show
 * 
 * @param {Object} payload - Viewing request data
 * @param {string|number} payload.propertyId - Property ID
 * @param {string} payload.preferredDate - ISO date string (YYYY-MM-DD) or ISO datetime
 * @param {string} [payload.message] - Optional message to landlord
 * @param {string} [payload.contact_phone] - Optional contact phone number
 * @returns {Promise<Object>} Created viewing request data
 * @throws {Error} If request fails or validation errors
 */
export const createViewingRequest = async (payload) => {
  try {
    // Normalize payload format for backend compatibility
    const propertyId = payload.propertyId || payload.property_id || payload.property;
    const preferredDate = payload.preferredDate || payload.preferred_date || payload.preferredDate;
    
    const normalizedPayload = {
      property_id: propertyId,
      preferred_date: preferredDate,
      message: payload.message || "",
      contact_phone: payload.contact_phone || payload.contactPhone || null,
    };

    // Try property-scoped endpoint first (more RESTful)
    try {
      const { API_ENDPOINTS } = await import("@/config/apiEndpoints");
      const { data } = await apiClient.post(
        API_ENDPOINTS.PROPERTIES.CREATE_VIEWING_REQUEST(propertyId),
        {
          preferred_date: normalizedPayload.preferred_date,
          message: normalizedPayload.message,
          contact_phone: normalizedPayload.contact_phone,
        }
      );
      return data;
    } catch (err1) {
      // Fallback: try tenant-scoped endpoint
      try {
        const { data } = await apiClient.post("/tenant/viewing-requests/", normalizedPayload);
        return data;
      } catch (err2) {
        // Fallback: try without trailing slash
        const { data } = await apiClient.post("/tenant/viewing-requests", normalizedPayload);
        return data;
      }
    }
  } catch (err) {
    throw new Error(
      getErrorMessage(err, "Failed to submit property viewing request")
    );
  }
};

// ──────────────────────────────────────────────────────────────────────────────
// MAINTENANCE REQUESTS
// ──────────────────────────────────────────────────────────────────────────────

/**
 * Get all maintenance requests submitted by the tenant
 * @returns {Promise<Array>}
 */
export const getMaintenanceRequests = async () => {
  try {
    const { data } = await apiClient.get("/tenant/maintenance");
    return data.requests || data.data || data || [];
  } catch (err) {
    if (err?.response?.status === 404) return [];
    throw new Error(getErrorMessage(err, "Could not load maintenance requests"));
  }
};

/**
 * Create new maintenance request (with photo upload support)
 * @param {FormData} formData
 * @returns {Promise<Object>}
 */
export const createMaintenanceRequest = async (formData) => {
  try {
    const { data } = await apiClient.post("/tenant/maintenance", formData, {
      headers: { "Content-Type": "multipart/form-data" },
      timeout: 60000,
    });
    return data;
  } catch (err) {
    throw new Error(getErrorMessage(err, "Failed to submit maintenance request"));
  }
};

/**
 * Get details of a specific maintenance request
 * @param {string|number} requestId
 * @returns {Promise<Object>}
 */
export const getMaintenanceRequest = async (requestId) => {
  try {
    const { data } = await apiClient.get(`/tenant/maintenance/${requestId}`);
    return data.request || data.data || data;
  } catch (err) {
    throw new Error(getErrorMessage(err, "Could not load maintenance request details"));
  }
};

/**
 * Update existing maintenance request (add photos, status update, comments)
 * @param {string|number} requestId
 * @param {FormData} formData
 * @returns {Promise<Object>}
 */
export const updateMaintenanceRequest = async (requestId, formData) => {
  try {
    const { data } = await apiClient.patch(`/tenant/maintenance/${requestId}`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return data;
  } catch (err) {
    throw new Error(getErrorMessage(err, "Failed to update maintenance request"));
  }
};

// ──────────────────────────────────────────────────────────────────────────────
// PAYMENT HISTORY
// ──────────────────────────────────────────────────────────────────────────────

/**
 * Get complete payment history for the tenant
 * @returns {Promise<Array>}
 */
export const getPaymentHistory = async () => {
  try {
    const { data } = await apiClient.get("/tenant/payments");
    return data.payments || data.data || data || [];
  } catch (err) {
    if (err?.response?.status === 404) return [];
    throw new Error(getErrorMessage(err, "Could not load payment history"));
  }
};

/**
 * Download payment receipt as Blob (PDF/image)
 * @param {string|number} paymentId
 * @returns {Promise<Blob>}
 */
export const getPaymentReceipt = async (paymentId) => {
  try {
    const { data } = await apiClient.get(`/tenant/payments/${paymentId}/receipt`, {
      responseType: "blob",
    });
    return data;
  } catch (err) {
    throw new Error(getErrorMessage(err, "Could not download payment receipt"));
  }
};

// ──────────────────────────────────────────────────────────────────────────────
// RENTAL HISTORY / REFERENCES
// ──────────────────────────────────────────────────────────────────────────────

/**
 * Get full rental history timeline (past + current)
 * @returns {Promise<Array>}
 */
export const getRentalHistory = async () => {
  try {
    const { data } = await apiClient.get("/tenant/rental-history");
    return data.history || data.data || data || [];
  } catch (err) {
    if (err?.response?.status === 404) return [];
    throw new Error(getErrorMessage(err, "Could not load rental history"));
  }
};

/**
 * Generate official rental reference letter/document
 * @param {string|number} rentalId
 * @returns {Promise<Object>}
 */
export const generateRentalReference = async (rentalId) => {
  try {
    const { data } = await apiClient.post(`/tenant/rentals/${rentalId}/reference`);
    return data;
  } catch (err) {
    throw new Error(getErrorMessage(err, "Failed to generate rental reference"));
  }
};