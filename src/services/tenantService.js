// src/services/tenantService.js
// Tenant-specific API calls – fully error-handled & Ghana-ready
import apiClient from "./apiClient";
import { session } from "@/utils/session";

/**
 * Register a new tenant with ID upload support
 */
export const registerTenant = async (formData) => {
  try {
    const { data } = await apiClient.post("/auth/signup/tenant/", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return data;
  } catch (err) {
    const message = err.response?.data?.message || "Tenant signup failed. Please try again.";
    throw new Error(message);
  }
};

/**
 * Fetch all rentals for the logged-in tenant
 * Handles 401 (expired), 404 (no rentals), and normalizes response
 */
export const fetchTenantRentals = async () => {
  try {
    const { data } = await apiClient.get("/tenant/rentals");

    // Normalize response: backend may return { rentals: [] }, { data: [] }, or direct array
    return data.rentals || data.data || data || [];
  } catch (err) {
    console.error("fetchTenantRentals error:", err.response || err);

    // Auto logout on expired session
    if (err.response?.status === 401) {
      session.clearAll();
      window.location.href = "/login?expired=true";
      throw new Error("Session expired. Logging you out...");
    }

    // No rentals yet → return empty array (not an error)
    if (err.response?.status === 404) {
      return [];
    }

    const message = err.response?.data?.message || "Unable to fetch your rentals";
    throw new Error(message);
  }
};

/**
 * Get full details of a specific rental
 */
export const fetchRentalDetails = async (rentalId) => {
  try {
    const { data } = await apiClient.get(`/tenant/rentals/${rentalId}`);
    return data.rental || data.data || data;
  } catch (err) {
    const message = err.response?.data?.message || "Unable to load rental details";
    throw new Error(message);
  }
};

/**
 * Initiate rent payment
 */
export const payRent = async (rentalId, payload) => {
  try {
    const { data } = await apiClient.post(`/tenant/rentals/${rentalId}/pay`, payload);
    return data;
  } catch (err) {
    const message = err.response?.data?.message || "Payment failed. Try again.";
    throw new Error(message);
  }
};

/**
 * ============ WISHLIST/FAVORITES ============
 */

/**
 * Get all favorited properties
 */
export const getFavorites = async () => {
  try {
    const { data } = await apiClient.get("/tenant/favorites");
    return data.favorites || data.data || data || [];
  } catch (err) {
    if (err.response?.status === 404) return [];
    const message = err.response?.data?.message || "Unable to fetch favorites";
    throw new Error(message);
  }
};

/**
 * Add property to favorites
 */
export const addToFavorites = async (propertyId) => {
  try {
    const { data } = await apiClient.post("/tenant/favorites", { propertyId });
    return data;
  } catch (err) {
    const message = err.response?.data?.message || "Failed to add to favorites";
    throw new Error(message);
  }
};

/**
 * Remove property from favorites
 */
export const removeFromFavorites = async (propertyId) => {
  try {
    const { data } = await apiClient.delete(`/tenant/favorites/${propertyId}`);
    return data;
  } catch (err) {
    const message = err.response?.data?.message || "Failed to remove from favorites";
    throw new Error(message);
  }
};

/**
 * Check if property is favorited
 */
export const isFavorited = async (propertyId) => {
  try {
    const { data } = await apiClient.get(`/tenant/favorites/${propertyId}/check`);
    return data.isFavorited || false;
  } catch {
    return false;
  }
};

/**
 * ============ MAINTENANCE REQUESTS (Premium) ============
 */

/**
 * Get all maintenance requests
 */
export const getMaintenanceRequests = async () => {
  try {
    const { data } = await apiClient.get("/tenant/maintenance");
    return data.requests || data.data || data || [];
  } catch (err) {
    if (err.response?.status === 404) return [];
    const message = err.response?.data?.message || "Unable to fetch maintenance requests";
    throw new Error(message);
  }
};

/**
 * Create a new maintenance request
 */
export const createMaintenanceRequest = async (formData) => {
  try {
    const { data } = await apiClient.post("/tenant/maintenance", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return data;
  } catch (err) {
    const message = err.response?.data?.message || "Failed to create maintenance request";
    throw new Error(message);
  }
};

/**
 * Get maintenance request details
 */
export const getMaintenanceRequest = async (requestId) => {
  try {
    const { data } = await apiClient.get(`/tenant/maintenance/${requestId}`);
    return data.request || data.data || data;
  } catch (err) {
    const message = err.response?.data?.message || "Unable to load maintenance request";
    throw new Error(message);
  }
};

/**
 * Update maintenance request (add photos, comments)
 */
export const updateMaintenanceRequest = async (requestId, formData) => {
  try {
    const { data } = await apiClient.patch(`/tenant/maintenance/${requestId}`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return data;
  } catch (err) {
    const message = err.response?.data?.message || "Failed to update maintenance request";
    throw new Error(message);
  }
};

/**
 * ============ PAYMENT HISTORY ============
 */

/**
 * Get payment history
 */
export const getPaymentHistory = async () => {
  try {
    const { data } = await apiClient.get("/tenant/payments");
    return data.payments || data.data || data || [];
  } catch (err) {
    if (err.response?.status === 404) return [];
    const message = err.response?.data?.message || "Unable to fetch payment history";
    throw new Error(message);
  }
};

/**
 * Get payment receipt
 */
export const getPaymentReceipt = async (paymentId) => {
  try {
    const { data } = await apiClient.get(`/tenant/payments/${paymentId}/receipt`, {
      responseType: "blob",
    });
    return data;
  } catch (err) {
    const message = err.response?.data?.message || "Unable to download receipt";
    throw new Error(message);
  }
};

/**
 * ============ RENTAL HISTORY ============
 */

/**
 * Get rental history timeline
 */
export const getRentalHistory = async () => {
  try {
    const { data } = await apiClient.get("/tenant/rental-history");
    return data.history || data.data || data || [];
  } catch (err) {
    if (err.response?.status === 404) return [];
    const message = err.response?.data?.message || "Unable to fetch rental history";
    throw new Error(message);
  }
};

/**
 * Generate rental reference
 */
export const generateRentalReference = async (rentalId) => {
  try {
    const { data } = await apiClient.post(`/tenant/rentals/${rentalId}/reference`);
    return data;
  } catch (err) {
    const message = err.response?.data?.message || "Failed to generate reference";
    throw new Error(message);
  }
};
