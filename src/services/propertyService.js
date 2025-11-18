import apiClient from "./apiClient";
import {
  mockFetchPendingProperties,
  mockApproveProperty,
  mockRejectProperty,
} from "../mocks/propertyMock";

/* -------------------------------------------------
   LANDLORD ENDPOINTS 
   ------------------------------------------------- */

/**
 * Fetch all properties that belong to the logged-in landlord.
 * @returns {Promise<Array>} List of property objects.
 */
export const fetchProperties = async () => {
  const { data } = await apiClient.get("/landlord/properties");
  return data;
};

/**
 * Toggle a property’s active / inactive status.
 * @param {string|number} id - Property ID.
 * @returns {Promise<Object>} Updated property.
 */
export const togglePropertyStatus = async (id) => {
  const { data } = await apiClient.patch(`/properties/${id}/toggle`);
  return data;
};

/* -------------------------------------------------
   ADMIN ENDPOINTS 
   ------------------------------------------------- */

/**
 * Fetch pending property listings (server-backed).
 * Falls back to mock data when API unavailable (useful during dev).
 *
 * @param {Object} [opts]
 * @param {number} [opts.page=1]
 * @param {number} [opts.perPage=10]
 * @param {string} [opts.search=""]
 * @param {string} [opts.statusFilter="pending"]
 *
 * @returns {Promise<{items: Array, total: number}>}
 */
export const fetchPendingProperties = async (opts = {}) => {
  const {
    page = 1,
    perPage = 10,
    search = "",
    statusFilter = "pending",
  } = opts;

  try {
    const { data } = await apiClient.get("/admin/properties", {
      params: { status: statusFilter, page, perPage, search },
    });
    return data; // expected shape: { items: [], total: number }
  } catch (err) {
    console.warn(
      "fetchPendingProperties: API failed, falling back to mock",
      err?.message ?? err
    );
    return mockFetchPendingProperties({ page, perPage, search, statusFilter });
  }
};

/**
 * Approve a property listing.
 *
 * @param {string|number} propertyId
 * @param {Object} [payload={}] - optional metadata, e.g. { note: "..." }
 * @returns {Promise<Object>} Approved property data.
 */
export const approveProperty = async (propertyId, payload = {}) => {
  try {
    const { data } = await apiClient.post(
      `/admin/properties/${propertyId}/approve`,
      payload
    );
    return data;
  } catch (err) {
    console.warn(
      "approveProperty: API failed, falling back to mock",
      err?.message ?? err
    );
    return mockApproveProperty(propertyId, payload);
  }
};

/**
 * Reject a property listing.
 *
 * @param {string|number} propertyId
 * @param {Object} [payload={}] - required reason, e.g. { reason: "..." }
 * @returns {Promise<Object>} Rejection response.
 */
export const rejectProperty = async (propertyId, payload = {}) => {
  try {
    const { data } = await apiClient.post(
      `/admin/properties/${propertyId}/reject`,
      payload
    );
    return data;
  } catch (err) {
    console.warn(
      "rejectProperty: API failed, falling back to mock",
      err?.message ?? err
    );
    return mockRejectProperty(propertyId, payload);
  }
};