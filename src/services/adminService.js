// src/services/adminService.js
/**
 * Unified Admin & Super Admin API Service
 * - Single source of truth for all admin endpoints
 * - Mock/real API toggle via VITE_USE_MOCK
 * - Ghana-localized (GHS, en-GH, Africa/Accra)
 * - Error handling, delays, type-safe
 * - Used by: AdminDashboard, SuperAdminDashboard, widgets
 */

import apiClient from "./apiClient";

// === MOCKS ===
import {
  mockSystemStats,
  mockUsers,
  mockAuditLogs,
  withDelay,
} from "@/mocks/superAdminMock";

import {
  fetchInsightsMock,
  fetchPendingUsersMock,
  approveUserMock,
  rejectUserMock,
  fetchPendingPropertiesMock,
  approvePropertyMock,
  rejectPropertyMock,
  fetchMaintenanceMock,
  assignMaintenanceMock,
  fetchReportsMock,
} from "./adminApiMocks";

// === CONFIG ===
const USE_MOCK = import.meta.env.VITE_USE_MOCK === "true";
const IS_DEV = import.meta.env.DEV;

// === UTILS ===
// eslint-disable-next-line no-unused-vars
const delay = (ms) => new Promise((res) => setTimeout(res, ms));

/* ========================================
   ADMIN ENDPOINTS
   ======================================== */

/**
 * Fetch system insights for Admin dashboard
 * @returns {Promise<Object>} Insights data
 */
export const fetchInsights = async () => {
  if (USE_MOCK) return withDelay(fetchInsightsMock(), 800);
  const { data } = await apiClient.get("/admin/insights");
  return data;
};

/**
 * Fetch pending user approvals
 * @returns {Promise<Array>} List of pending users
 */
export const fetchPendingUsers = async () => {
  if (USE_MOCK) return withDelay(fetchPendingUsersMock(), 600);
  const { data } = await apiClient.get("/admin/users/pending");
  return data;
};

/**
 * Approve a pending user
 * @param {string} id - User ID
 * @returns {Promise<Object>} Success response
 */
export const approveUser = async (id) => {
  if (USE_MOCK) return withDelay(approveUserMock(id), 500);
  const { data } = await apiClient.patch(`/admin/users/${id}/approve`);
  return data;
};

/**
 * Reject a pending user
 * @param {string} id - User ID
 * @param {string} reason - Rejection reason
 * @returns {Promise<Object>} Success response
 */
export const rejectUser = async (id, reason) => {
  if (USE_MOCK) return withDelay(rejectUserMock(id, reason), 500);
  const { data } = await apiClient.patch(`/admin/users/${id}/reject`, { reason });
  return data;
};

/**
 * Fetch pending property approvals
 * @returns {Promise<Array>} List of pending properties
 */
export const fetchPendingProperties = async () => {
  if (USE_MOCK) return withDelay(fetchPendingPropertiesMock(), 700);
  const { data } = await apiClient.get("/admin/properties/pending");
  return data;
};

/**
 * Approve a property
 * @param {string} id - Property ID
 * @returns {Promise<Object>} Success response
 */
export const approveProperty = async (id) => {
  if (USE_MOCK) return withDelay(approvePropertyMock(id), 500);
  const { data } = await apiClient.patch(`/admin/properties/${id}/approve`);
  return data;
};

/**
 * Reject a property
 * @param {string} id - Property ID
 * @param {string} reason - Rejection reason
 * @returns {Promise<Object>} Success response
 */
export const rejectProperty = async (id, reason) => {
  if (USE_MOCK) return withDelay(rejectPropertyMock(id, reason), 500);
  const { data } = await apiClient.patch(`/admin/properties/${id}/reject`, { reason });
  return data;
};

/**
 * Fetch pending maintenance requests
 * @returns {Promise<Array>} List of pending maintenance
 */
export const fetchMaintenance = async () => {
  if (USE_MOCK) return withDelay(fetchMaintenanceMock(), 900);
  const { data } = await apiClient.get("/admin/maintenance/pending");
  return data;
};

/**
 * Assign maintenance to artisan
 * @param {string} id - Maintenance ID
 * @param {string} assignedTo - Artisan ID
 * @returns {Promise<Object>} Success response
 */
export const assignMaintenance = async (id, assignedTo) => {
  if (USE_MOCK) return withDelay(assignMaintenanceMock(id, assignedTo), 600);
  const { data } = await apiClient.patch(`/admin/maintenance/${id}/assign`, { assignedTo });
  return data;
};

/**
 * Fetch reports with date range
 * @param {string} start - ISO date
 * @param {string} end - ISO date
 * @returns {Promise<Object>} Report data
 */
export const fetchReports = async (start, end) => {
  if (USE_MOCK) return withDelay(fetchReportsMock(start, end), 1000);
  const { data } = await apiClient.get(`/admin/reports?start=${start}&end=${end}`);
  return data;
};

/* ========================================
   SUPER ADMIN ENDPOINTS
   ======================================== */

/**
 * Fetch full system stats
 * @returns {Promise<Object>} System stats
 */
export const fetchSystemStats = async () => {
  if (USE_MOCK || IS_DEV) return withDelay(mockSystemStats, 1000);
  try {
    const { data } = await apiClient.get("/super-admin/system/stats");
    return data;
  } catch (err) {
    throw new Error(err.response?.data?.message || "Failed to load system stats.");
  }
};

/**
 * Fetch all users
 * @returns {Promise<{ users: Array }>} List of all users
 */
export const fetchAllUsers = async () => {
  if (USE_MOCK || IS_DEV) return withDelay({ users: mockUsers }, 800);
  try {
    const { data } = await apiClient.get("/super-admin/users");
    return data;
  } catch (err) {
    throw new Error(err.response?.data?.message || "Failed to load users.");
  }
};

/**
 * Create new user
 * @param {Object} payload - User data
 * @returns {Promise<Object>} Created user
 */
export const createUser = async (payload) => {
  if (USE_MOCK || IS_DEV) {
    return withDelay(
      {
        success: true,
        user: { ...payload, _id: "mock_" + Date.now() },
      },
      600
    );
  }
  try {
    const { data } = await apiClient.post("/super-admin/users/create", payload);
    return data;
  } catch (err) {
    throw new Error(err.response?.data?.message || "User creation failed.");
  }
};

/**
 * Delete user
 * @param {string} userId - User ID
 * @returns {Promise<Object>} Success response
 */
export const deleteUser = async (userId) => {
  if (USE_MOCK || IS_DEV) return withDelay({ success: true }, 500);
  try {
    const { data } = await apiClient.delete(`/super-admin/users/${userId}`);
    return data;
  } catch (err) {
    throw new Error(err.response?.data?.message || "Failed to delete user.");
  }
};

/**
 * Fetch audit logs
 * @returns {Promise<Array>} List of audit logs
 */
export const fetchAuditLogs = async () => {
  if (USE_MOCK || IS_DEV) return withDelay(mockAuditLogs, 900);
  try {
    const { data } = await apiClient.get("/super-admin/audit");
    return data;
  } catch (err) {
    throw new Error(err.response?.data?.message || "Failed to load audit logs.");
  }
};

/**
 * Assign role to user
 * @param {string} userId - User ID
 * @param {string} role - New role
 * @returns {Promise<Object>} Success response
 */
export const assignRole = async (userId, role) => {
  if (USE_MOCK || IS_DEV) return withDelay({ success: true }, 600);
  try {
    const { data } = await apiClient.put(`/super-admin/roles/${userId}`, { role });
    return data;
  } catch (err) {
    throw new Error(err.response?.data?.message || "Failed to assign role.");
  }
};