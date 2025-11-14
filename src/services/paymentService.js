import apiClient from "./apiClient";

/**
 * Payment Service
 * Handles all payment-related API calls
 */

/**
 * Get payments with optional filters
 * @param {Object} filters - Filter options (status, payment_type, property_id)
 * @returns {Promise} Payment list with pagination
 */
export const getPayments = async (filters = {}) => {
  try {
    const params = new URLSearchParams();
    Object.keys(filters).forEach((key) => {
      if (filters[key] !== null && filters[key] !== undefined && filters[key] !== "") {
        params.append(key, filters[key]);
      }
    });
    
    const { data } = await apiClient.get(`/payments/?${params.toString()}`);
    return data;
  } catch (err) {
    console.error("Get payments error:", err);
    throw err.response?.data || { message: "Failed to fetch payments" };
  }
};

/**
 * Get payment by ID
 * @param {number} id - Payment ID
 * @returns {Promise} Payment details
 */
export const getPayment = async (id) => {
  try {
    const { data } = await apiClient.get(`/payments/${id}/`);
    return data;
  } catch (err) {
    console.error("Get payment error:", err);
    throw err.response?.data || { message: "Failed to fetch payment" };
  }
};

/**
 * Create a new payment
 * @param {Object} paymentData - Payment data (recipient_id, property_id, booking_id, payment_type, amount, etc.)
 * @returns {Promise} Created payment
 */
export const createPayment = async (paymentData) => {
  try {
    const { data } = await apiClient.post("/payments/", paymentData);
    return data;
  } catch (err) {
    console.error("Create payment error:", err);
    throw err.response?.data || { message: "Failed to create payment" };
  }
};

/**
 * Update payment status
 * @param {number} id - Payment ID
 * @param {Object} paymentData - Updated payment data (mainly status)
 * @returns {Promise} Updated payment
 */
export const updatePayment = async (id, paymentData) => {
  try {
    const { data } = await apiClient.patch(`/payments/${id}/`, paymentData);
    return data;
  } catch (err) {
    console.error("Update payment error:", err);
    throw err.response?.data || { message: "Failed to update payment" };
  }
};

/**
 * Get payment history with statistics
 * @returns {Promise} Payment history with stats
 */
export const getPaymentHistory = async () => {
  try {
    const { data } = await apiClient.get("/payments/history/");
    return data;
  } catch (err) {
    console.error("Get payment history error:", err);
    throw err.response?.data || { message: "Failed to fetch payment history" };
  }
};

/**
 * Verify payment status
 * @param {number} id - Payment ID
 * @returns {Promise} Payment verification result
 */
export const verifyPayment = async (id) => {
  try {
    const { data } = await apiClient.post(`/payments/${id}/verify/`);
    return data;
  } catch (err) {
    console.error("Verify payment error:", err);
    throw err.response?.data || { message: "Failed to verify payment" };
  }
};

