import apiClient from "./apiClient";

/**
 * Maintenance Service
 * Handles all maintenance request-related API calls
 */

/**
 * Get maintenance requests with optional filters
 * @param {Object} filters - Filter options (status, priority, property_id)
 * @returns {Promise} Maintenance request list with pagination
 */
export const getMaintenanceRequests = async (filters = {}) => {
  try {
    const params = new URLSearchParams();
    Object.keys(filters).forEach((key) => {
      if (filters[key] !== null && filters[key] !== undefined && filters[key] !== "") {
        params.append(key, filters[key]);
      }
    });
    
    const { data } = await apiClient.get(`/maintenance/?${params.toString()}`);
    return data;
  } catch (err) {
    console.error("Get maintenance requests error:", err);
    throw err.response?.data || { message: "Failed to fetch maintenance requests" };
  }
};

/**
 * Get maintenance request by ID
 * @param {number} id - Maintenance request ID
 * @returns {Promise} Maintenance request details
 */
export const getMaintenanceRequest = async (id) => {
  try {
    const { data } = await apiClient.get(`/maintenance/${id}/`);
    return data;
  } catch (err) {
    console.error("Get maintenance request error:", err);
    throw err.response?.data || { message: "Failed to fetch maintenance request" };
  }
};

/**
 * Create a new maintenance request
 * @param {FormData} formData - Maintenance request data including images
 * @returns {Promise} Created maintenance request
 */
export const createMaintenanceRequest = async (formData) => {
  try {
    const { data } = await apiClient.post("/maintenance/", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return data;
  } catch (err) {
    console.error("Create maintenance request error:", err);
    throw err.response?.data || { message: "Failed to create maintenance request" };
  }
};

/**
 * Update a maintenance request
 * @param {number} id - Maintenance request ID
 * @param {FormData|Object} requestData - Updated maintenance request data
 * @returns {Promise} Updated maintenance request
 */
export const updateMaintenanceRequest = async (id, requestData) => {
  try {
    const isFormData = requestData instanceof FormData;
    const config = isFormData
      ? { headers: { "Content-Type": "multipart/form-data" } }
      : {};
    
    const { data } = await apiClient.patch(`/maintenance/${id}/`, requestData, config);
    return data;
  } catch (err) {
    console.error("Update maintenance request error:", err);
    throw err.response?.data || { message: "Failed to update maintenance request" };
  }
};

/**
 * Delete a maintenance request
 * @param {number} id - Maintenance request ID
 * @returns {Promise}
 */
export const deleteMaintenanceRequest = async (id) => {
  try {
    await apiClient.delete(`/maintenance/${id}/`);
  } catch (err) {
    console.error("Delete maintenance request error:", err);
    throw err.response?.data || { message: "Failed to delete maintenance request" };
  }
};

/**
 * Get current user's maintenance requests
 * @returns {Promise} List of user's maintenance requests
 */
export const getMyMaintenanceRequests = async () => {
  try {
    const { data } = await apiClient.get("/maintenance/my-requests/");
    return data;
  } catch (err) {
    console.error("Get my maintenance requests error:", err);
    throw err.response?.data || { message: "Failed to fetch your maintenance requests" };
  }
};

