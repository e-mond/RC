import apiClient from "./apiClient";

/**
 * Booking Service
 * Handles all booking and service request-related API calls
 */

// ============ BOOKING METHODS ============

/**
 * Get bookings with optional filters
 * @param {Object} filters - Filter options (status, property_id)
 * @returns {Promise} Booking list with pagination
 */
export const getBookings = async (filters = {}) => {
  try {
    const params = new URLSearchParams();
    Object.keys(filters).forEach((key) => {
      if (filters[key] !== null && filters[key] !== undefined && filters[key] !== "") {
        params.append(key, filters[key]);
      }
    });
    
    const { data } = await apiClient.get(`/bookings/?${params.toString()}`);
    return data;
  } catch (err) {
    console.error("Get bookings error:", err);
    throw err.response?.data || { message: "Failed to fetch bookings" };
  }
};

/**
 * Get booking by ID
 * @param {number} id - Booking ID
 * @returns {Promise} Booking details
 */
export const getBooking = async (id) => {
  try {
    const { data } = await apiClient.get(`/bookings/${id}/`);
    return data;
  } catch (err) {
    console.error("Get booking error:", err);
    throw err.response?.data || { message: "Failed to fetch booking" };
  }
};

/**
 * Create a new booking
 * @param {Object} bookingData - Booking data (property_id, start_date, end_date, monthly_rent, deposit, notes)
 * @returns {Promise} Created booking
 */
export const createBooking = async (bookingData) => {
  try {
    const { data } = await apiClient.post("/bookings/", bookingData);
    return data;
  } catch (err) {
    console.error("Create booking error:", err);
    throw err.response?.data || { message: "Failed to create booking" };
  }
};

/**
 * Update a booking
 * @param {number} id - Booking ID
 * @param {Object} bookingData - Updated booking data
 * @returns {Promise} Updated booking
 */
export const updateBooking = async (id, bookingData) => {
  try {
    const { data } = await apiClient.patch(`/bookings/${id}/`, bookingData);
    return data;
  } catch (err) {
    console.error("Update booking error:", err);
    throw err.response?.data || { message: "Failed to update booking" };
  }
};

/**
 * Delete a booking
 * @param {number} id - Booking ID
 * @returns {Promise}
 */
export const deleteBooking = async (id) => {
  try {
    await apiClient.delete(`/bookings/${id}/`);
  } catch (err) {
    console.error("Delete booking error:", err);
    throw err.response?.data || { message: "Failed to delete booking" };
  }
};

/**
 * Approve a booking (landlord only)
 * @param {number} id - Booking ID
 * @returns {Promise} Approved booking
 */
export const approveBooking = async (id) => {
  try {
    const { data } = await apiClient.post(`/bookings/${id}/approve/`);
    return data;
  } catch (err) {
    console.error("Approve booking error:", err);
    throw err.response?.data || { message: "Failed to approve booking" };
  }
};

// ============ SERVICE REQUEST METHODS ============

/**
 * Get service requests with optional filters
 * @param {Object} filters - Filter options (status, artisan_id)
 * @returns {Promise} Service request list with pagination
 */
export const getServiceRequests = async (filters = {}) => {
  try {
    const params = new URLSearchParams();
    Object.keys(filters).forEach((key) => {
      if (filters[key] !== null && filters[key] !== undefined && filters[key] !== "") {
        params.append(key, filters[key]);
      }
    });
    
    const { data } = await apiClient.get(`/bookings/service-requests/?${params.toString()}`);
    return data;
  } catch (err) {
    console.error("Get service requests error:", err);
    throw err.response?.data || { message: "Failed to fetch service requests" };
  }
};

/**
 * Get service request by ID
 * @param {number} id - Service request ID
 * @returns {Promise} Service request details
 */
export const getServiceRequest = async (id) => {
  try {
    const { data } = await apiClient.get(`/bookings/service-requests/${id}/`);
    return data;
  } catch (err) {
    console.error("Get service request error:", err);
    throw err.response?.data || { message: "Failed to fetch service request" };
  }
};

/**
 * Create a new service request
 * @param {Object} requestData - Service request data (artisan_id, property_id, title, description, service_type, etc.)
 * @returns {Promise} Created service request
 */
export const createServiceRequest = async (requestData) => {
  try {
    const { data } = await apiClient.post("/bookings/service-requests/", requestData);
    return data;
  } catch (err) {
    console.error("Create service request error:", err);
    throw err.response?.data || { message: "Failed to create service request" };
  }
};

/**
 * Update a service request
 * @param {number} id - Service request ID
 * @param {Object} requestData - Updated service request data
 * @returns {Promise} Updated service request
 */
export const updateServiceRequest = async (id, requestData) => {
  try {
    const { data } = await apiClient.patch(`/bookings/service-requests/${id}/`, requestData);
    return data;
  } catch (err) {
    console.error("Update service request error:", err);
    throw err.response?.data || { message: "Failed to update service request" };
  }
};

/**
 * Delete a service request
 * @param {number} id - Service request ID
 * @returns {Promise}
 */
export const deleteServiceRequest = async (id) => {
  try {
    await apiClient.delete(`/bookings/service-requests/${id}/`);
  } catch (err) {
    console.error("Delete service request error:", err);
    throw err.response?.data || { message: "Failed to delete service request" };
  }
};

