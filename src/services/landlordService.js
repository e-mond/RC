import apiClient from "./apiClient";
import normalizeApiError from "@/utils/apiError";

/**
 * Landlord-related API calls
 * - Uses multipart/form-data for file uploads where needed
 */

/**
 * Register a landlord (FormData)
 * @param {FormData} formData
 */
export const registerLandlord = async (formData) => {
  try {
    const { data } = await apiClient.post("/auth/signup/landlord", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return data;
  } catch (err) {
    const error = normalizeApiError(err);
    throw new Error(error.message);
  }
};

/**
 * Fetch properties belonging to landlord
 * @param {string} landlordId
 */
export const fetchLandlordProperties = async (landlordId) => {
  try {
    const { data } = await apiClient.get(`/landlords/${landlordId}/properties`);
    return data;
  } catch (err) {
    const error = normalizeApiError(err);
    throw new Error(error.message);
  }
};

/**
 * Create a property listing (FormData)
 * @param {FormData} formData
 */
export const createProperty = async (formData) => {
  try {
    const { data } = await apiClient.post("/properties", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return data;
  } catch (err) {
    const error = normalizeApiError(err);
    throw new Error(error.message);
  }
};
