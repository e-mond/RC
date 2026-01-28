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
    
    // Normalize payload - don't include contact_phone if it's null/empty
    const normalizedPayload = {
      property_id: propertyId,
      preferred_date: preferredDate,
      message: payload.message || "",
    };
    
    // Only include contact_phone if provided and not empty
    const contactPhone = payload.contact_phone || payload.contactPhone;
    if (contactPhone && contactPhone.trim() !== "") {
      normalizedPayload.contact_phone = contactPhone.trim();
    }

    // Validate required fields
    if (!propertyId) {
      throw new Error("Property ID is required");
    }
    if (!normalizedPayload.preferred_date) {
      throw new Error("Preferred date is required");
    }

    // Try property-scoped endpoint first (more RESTful)
    try {
      const { API_ENDPOINTS } = await import("@/config/apiEndpoints");
      
      // Build request payload - only include contact_phone if it has a value
      const requestPayload = {
        preferred_date: normalizedPayload.preferred_date,
        message: normalizedPayload.message || "",
      };
      
      // Only include contact_phone if it's provided and not empty
      const contactPhone = payload.contact_phone || payload.contactPhone;
      if (contactPhone && contactPhone.trim() !== "") {
        requestPayload.contact_phone = contactPhone.trim();
      }
      
      const { data } = await apiClient.post(
        API_ENDPOINTS.PROPERTIES.CREATE_VIEWING_REQUEST(propertyId),
        requestPayload
      );
      return data;
    } catch (err1) {
      // If 400 error, provide more specific error message
      if (err1.response?.status === 400) {
        const errorMsg = err1.response?.data?.message || 
                        err1.response?.data?.detail || 
                        err1.response?.data?.error ||
                        "Invalid viewing request data. Please check your input.";
        throw new Error(errorMsg);
      }
      
      // Fallback: try tenant-scoped endpoint
      try {
        // Build request payload - only include contact_phone if it has a value
        const fallbackPayload = {
          property_id: normalizedPayload.property_id,
          preferred_date: normalizedPayload.preferred_date,
          message: normalizedPayload.message || "",
        };
        
        // Only include contact_phone if it's provided and not empty
        const contactPhone = payload.contact_phone || payload.contactPhone;
        if (contactPhone && contactPhone.trim() !== "") {
          fallbackPayload.contact_phone = contactPhone.trim();
        }
        
        const { data } = await apiClient.post("/tenant/viewing-requests/", fallbackPayload);
        return data;
      } catch (err2) {
        // If 400 error, provide more specific error message
        if (err2.response?.status === 400) {
          const errorMsg = err2.response?.data?.message || 
                          err2.response?.data?.detail || 
                          err2.response?.data?.error ||
                          "Invalid viewing request data. Please check your input.";
          throw new Error(errorMsg);
        }
        
        // Fallback: try without trailing slash
        try {
          // Build request payload - only include contact_phone if it has a value
          const finalPayload = {
            property_id: normalizedPayload.property_id,
            preferred_date: normalizedPayload.preferred_date,
            message: normalizedPayload.message || "",
          };
          
          // Only include contact_phone if it's provided and not empty
          const contactPhone = payload.contact_phone || payload.contactPhone;
          if (contactPhone && contactPhone.trim() !== "") {
            finalPayload.contact_phone = contactPhone.trim();
          }
          
          const { data } = await apiClient.post("/tenant/viewing-requests", finalPayload);
          return data;
        } catch (err3) {
          // If 400 error, provide more specific error message
          if (err3.response?.status === 400) {
            const errorMsg = err3.response?.data?.message || 
                            err3.response?.data?.detail || 
                            err3.response?.data?.error ||
                            "Invalid viewing request data. Please check your input.";
            throw new Error(errorMsg);
          }
          throw err3;
        }
      }
    }
  } catch (err) {
    throw new Error(
      getErrorMessage(err, "Failed to submit property viewing request")
    );
  }
};

/**
 * Get all viewing requests for the current tenant
 * @returns {Promise<Array>} Array of viewing requests
 */
export const getViewingRequests = async () => {
  try {
    const { data } = await apiClient.get("/tenant/viewing-requests/");
    return data.results || data.data || data || [];
  } catch (err) {
    if (err?.response?.status === 404) return [];
    throw new Error(getErrorMessage(err, "Could not load viewing requests"));
  }
};

/**
 * Get all bookings for the current tenant (all statuses)
 * Includes: pending, approved, scheduled, rescheduled, cancelled, completed, no-show
 * @returns {Promise<Array>} Array of booking objects
 */
export const getTenantBookings = async () => {
  try {
    const { API_ENDPOINTS } = await import("@/config/apiEndpoints");
    let bookings = [];
    
    // Try primary endpoint: /tenant/bookings/
    try {
      const { data } = await apiClient.get(API_ENDPOINTS.TENANT.BOOKINGS);
      bookings = data.results || data.data || (Array.isArray(data) ? data : []);
    } catch (err1) {
      // Fallback: try viewing-requests endpoint
      try {
        const { data } = await apiClient.get(API_ENDPOINTS.TENANT.VIEWING_REQUESTS);
        bookings = data.results || data.data || (Array.isArray(data) ? data : []);
      } catch (err2) {
        // If both fail, return empty array (not an error - tenant may have no bookings)
        if (err2.response?.status === 404) return [];
        throw err2;
      }
    }
    
    // Normalize booking data structure
    return Array.isArray(bookings) ? bookings.map(normalizeBookingData) : [];
  } catch (err) {
    if (err?.response?.status === 404) return [];
    throw new Error(getErrorMessage(err, "Could not load bookings"));
  }
};

/**
 * Get scheduled/approved bookings only (for dashboard overview)
 * @returns {Promise<Array>} Array of scheduled booking objects
 */
export const getScheduledBookings = async () => {
  try {
    const { API_ENDPOINTS } = await import("@/config/apiEndpoints");
    let bookings = [];
    
    // Try scheduled bookings endpoint
    try {
      const { data } = await apiClient.get(API_ENDPOINTS.TENANT.BOOKINGS_SCHEDULED);
      bookings = data.results || data.data || (Array.isArray(data) ? data : []);
    } catch (err1) {
      // Fallback: get all bookings and filter
      try {
        const allBookings = await getTenantBookings();
        bookings = allBookings.filter((b) => {
          const status = String(b.status || "").toLowerCase();
          return ["approved", "scheduled", "accepted"].includes(status);
        });
      } catch (err2) {
        if (err2.response?.status === 404) return [];
        throw err2;
      }
    }
    
    // Sort by date (upcoming first)
    return Array.isArray(bookings)
      ? bookings
          .map(normalizeBookingData)
          .sort((a, b) => {
            const dateA = new Date(a.preferred_date || a.scheduled_date || a.dateRequested || 0);
            const dateB = new Date(b.preferred_date || b.scheduled_date || b.dateRequested || 0);
            return dateA - dateB;
          })
      : [];
  } catch (err) {
    if (err?.response?.status === 404) return [];
    throw new Error(getErrorMessage(err, "Could not load scheduled bookings"));
  }
};

/**
 * Reschedule a booking
 * @param {string|number} bookingId - Booking ID
 * @param {string} newDate - New date (ISO format: YYYY-MM-DD)
 * @param {string} [newTime] - New time (optional, format: HH:MM)
 * @param {string} [message] - Optional message to landlord
 * @returns {Promise<Object>} Updated booking object
 */
export const rescheduleBooking = async (bookingId, newDate, newTime = null, message = null) => {
  if (!bookingId) throw new Error("Booking ID is required");
  if (!newDate) throw new Error("New date is required");

  try {
    const { API_ENDPOINTS } = await import("@/config/apiEndpoints");
    
    const payload = {
      new_date: newDate,
    };
    
    if (newTime) payload.new_time = newTime;
    if (message) payload.message = message;
    
    const { data } = await apiClient.patch(API_ENDPOINTS.TENANT.RESCHEDULE_BOOKING(bookingId), payload);
    return normalizeBookingData(data.booking || data);
  } catch (err) {
    throw new Error(getErrorMessage(err, "Failed to reschedule booking"));
  }
};

/**
 * Cancel a booking
 * @param {string|number} bookingId - Booking ID
 * @param {string} [reason] - Optional cancellation reason
 * @returns {Promise<Object>} Updated booking object
 */
export const cancelBooking = async (bookingId, reason = null) => {
  if (!bookingId) throw new Error("Booking ID is required");

  try {
    const { API_ENDPOINTS } = await import("@/config/apiEndpoints");
    
    const payload = {};
    if (reason) payload.reason = reason;
    
    const { data } = await apiClient.patch(API_ENDPOINTS.TENANT.CANCEL_BOOKING(bookingId), payload);
    return normalizeBookingData(data.booking || data);
  } catch (err) {
    throw new Error(getErrorMessage(err, "Failed to cancel booking"));
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
    property: booking.property || {},
    tenant_id: booking.tenant_id || booking.tenantId || booking.tenant?.id,
    status: booking.status || "pending",
    preferred_date: booking.preferred_date || booking.preferredDate,
    scheduled_date: booking.scheduled_date || booking.scheduledDate || booking.preferred_date,
    scheduled_time: booking.scheduled_time || booking.scheduledTime,
    dateRequested: booking.dateRequested || booking.requested_date || booking.preferred_date || booking.created_at,
    message: booking.message || booking.notes,
    contact_phone: booking.contact_phone || booking.contactPhone || booking.phone,
    landlord: booking.landlord || booking.landlord_profile || booking.property?.landlord,
    created_at: booking.created_at || booking.createdAt,
    updated_at: booking.updated_at || booking.updatedAt,
  };
}

/**
 * Check if tenant has a viewing request or booking for a specific property
 * @param {string|number} propertyId - Property ID to check
 * @returns {Promise<boolean>} True if tenant has viewed or booked the property
 */
export const hasViewedOrBookedProperty = async (propertyId) => {
  try {
    const viewingRequests = await getViewingRequests();
    // Check if any viewing request exists for this property (any status)
    const hasViewingRequest = viewingRequests.some(
      (request) => 
        (request.property_id?.toString() === propertyId?.toString()) ||
        (request.property?.id?.toString() === propertyId?.toString())
    );
    
    // Also check for bookings/rentals if that endpoint exists
    // For now, viewing request is sufficient
    return hasViewingRequest;
  } catch (err) {
    console.warn("Could not check viewing/booking status:", err);
    return false; // Fail closed - don't allow messaging if check fails
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