// src/services/tenantService.js
// Tenant-specific API calls – fully error-handled & Ghana-ready
import apiClient from "./apiClient";

/**
 * Register a new tenant with ID upload support
 */
export const registerTenant = async (formData) => {
  try {
    const { data } = await apiClient.post("/auth/signup/tenant", formData, {
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
      localStorage.removeItem("token");
      localStorage.removeItem("user");
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