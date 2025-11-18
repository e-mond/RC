import apiClient from "./apiClient";

/**
 * Property Service
 * Handles all property-related API calls
 */

/**
 * Get all properties with optional filters
 * @param {Object} filters - Filter options (city, region, property_type, min_price, max_price, bedrooms, status, search)
 * @returns {Promise} Property list with pagination
 */
export const getProperties = async (filters = {}) => {
  try {
    const params = new URLSearchParams();
    Object.keys(filters).forEach((key) => {
      if (filters[key] !== null && filters[key] !== undefined && filters[key] !== "") {
        params.append(key, filters[key]);
      }
    });
    
    const { data } = await apiClient.get(`/properties/?${params.toString()}`);
    return data;
  } catch (err) {
    console.error("Get properties error:", err);
    throw err.response?.data || { message: "Failed to fetch properties" };
  }
};

/**
 * Get property by ID
 * @param {number} id - Property ID
 * @returns {Promise} Property details
 */
export const getProperty = async (id) => {
  try {
    const { data } = await apiClient.get(`/properties/${id}/`);
    return data;
  } catch (err) {
    console.error("Get property error:", err);
    throw err.response?.data || { message: "Failed to fetch property" };
  }
};

/**
 * Create a new property
 * @param {FormData} formData - Property data including images
 * @returns {Promise} Created property
 */
export const createProperty = async (formData) => {
  try {
    const { data } = await apiClient.post("/properties/", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return data;
  } catch (err) {
    console.error("Create property error:", err);
    throw err.response?.data || { message: "Failed to create property" };
  }
};

/**
 * Update a property
 * @param {number} id - Property ID
 * @param {FormData|Object} propertyData - Updated property data
 * @returns {Promise} Updated property
 */
export const updateProperty = async (id, propertyData) => {
  try {
    const isFormData = propertyData instanceof FormData;
    const config = isFormData
      ? { headers: { "Content-Type": "multipart/form-data" } }
      : {};
    
    const { data } = await apiClient.patch(`/properties/${id}/`, propertyData, config);
    return data;
  } catch (err) {
    console.error("Update property error:", err);
    throw err.response?.data || { message: "Failed to update property" };
  }
};

/**
 * Delete a property
 * @param {number} id - Property ID
 * @returns {Promise}
 */
export const deleteProperty = async (id) => {
  try {
    await apiClient.delete(`/properties/${id}/`);
  } catch (err) {
    console.error("Delete property error:", err);
    throw err.response?.data || { message: "Failed to delete property" };
  }
};

/**
 * Get properties for a specific landlord
 * @param {number} landlordId - Landlord user ID
 * @returns {Promise} List of properties
 */
export const getLandlordProperties = async (landlordId) => {
  try {
    const { data } = await apiClient.get(`/properties/landlord/${landlordId}/`);
    return data;
  } catch (err) {
    console.error("Get landlord properties error:", err);
    throw err.response?.data || { message: "Failed to fetch landlord properties" };
  }
};

/**
 * Get current user's properties
 * @returns {Promise} List of user's properties
 */
export const getMyProperties = async () => {
  try {
    const { data } = await apiClient.get("/properties/my-properties/");
    return data;
  } catch (err) {
    console.error("Get my properties error:", err);
    throw err.response?.data || { message: "Failed to fetch your properties" };
  }
};

/**
 * Get all amenities
 * @returns {Promise} List of amenities
 */
export const getAmenities = async () => {
  try {
    const { data } = await apiClient.get("/properties/amenities/");
    return data;
  } catch (err) {
    console.error("Get amenities error:", err);
    throw err.response?.data || { message: "Failed to fetch amenities" };
  }
};

/**
 * Get viewing requests
 * @param {Object} params - Optional query parameters (status)
 * @returns {Promise} List of viewing requests
 */
export const getViewingRequests = async (params = {}) => {
  try {
    const { data } = await apiClient.get("/properties/viewing-requests/", { params });
    return data;
  } catch (err) {
    console.error("Get viewing requests error:", err);
    throw err.response?.data || { message: "Failed to fetch viewing requests" };
  }
};

/**
 * Get viewing request by ID
 * @param {number} id - Viewing request ID
 * @returns {Promise} Viewing request details
 */
export const getViewingRequest = async (id) => {
  try {
    const { data } = await apiClient.get(`/properties/viewing-requests/${id}/`);
    return data;
  } catch (err) {
    console.error("Get viewing request error:", err);
    throw err.response?.data || { message: "Failed to fetch viewing request" };
  }
};

/**
 * Create a viewing request
 * @param {Object} viewingData - Viewing request data
 * @returns {Promise} Created viewing request
 */
export const createViewingRequest = async (viewingData) => {
  try {
    const { data } = await apiClient.post("/properties/viewing-requests/", viewingData);
    return data;
  } catch (err) {
    console.error("Create viewing request error:", err);
    throw err.response?.data || { message: "Failed to create viewing request" };
  }
};

/**
 * Update a viewing request
 * @param {number} id - Viewing request ID
 * @param {Object} viewingData - Updated viewing request data
 * @returns {Promise} Updated viewing request
 */
export const updateViewingRequest = async (id, viewingData) => {
  try {
    const { data } = await apiClient.patch(`/properties/viewing-requests/${id}/`, viewingData);
    return data;
  } catch (err) {
    console.error("Update viewing request error:", err);
    throw err.response?.data || { message: "Failed to update viewing request" };
  }
};

/**
 * Delete a viewing request
 * @param {number} id - Viewing request ID
 * @returns {Promise}
 */
export const deleteViewingRequest = async (id) => {
  try {
    await apiClient.delete(`/properties/viewing-requests/${id}/`);
    return { message: "Viewing request deleted successfully" };
  } catch (err) {
    console.error("Delete viewing request error:", err);
    throw err.response?.data || { message: "Failed to delete viewing request" };
  }
};
