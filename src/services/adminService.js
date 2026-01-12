// src/services/adminService.js
/**
 * Unified Admin & Super Admin API Service
 * Single source of truth for all admin-related API calls.
 * Supports real API + mock mode (controlled ONLY via VITE_USE_MOCK env variable).
 *
 * Features:
 * - Async mock loading (fire-and-forget)
 * - Consistent error extraction & toast notifications
 * - Frontend validation where appropriate
 * - Used across AdminDashboard, SuperAdminDashboard, and related widgets
 */

import apiClient from "./apiClient";
import { toast } from "react-hot-toast";

// ───────────────────────────────────────────────────────────────
// CONFIGURATION
// ───────────────────────────────────────────────────────────────
const USE_MOCK = String(import.meta.env.VITE_USE_MOCK || "").toLowerCase() === "true";

let mockImports = {};

/**
 * Load mock data asynchronously (non-blocking)
 * Only runs if USE_MOCK is explicitly true
 */
if (USE_MOCK) {
  (async () => {
    try {
      const [superAdminMock, axiosMock] = await Promise.all([
        import("@/mocks/superAdminMock"),
        import("@/mocks/axiosMock"),
      ]);

      mockImports = {
        ...(superAdminMock.default || superAdminMock),
        ...(axiosMock.default || axiosMock),
      };

      console.log("[AdminService] Mock data loaded successfully");
    } catch (err) {
      console.warn("[AdminService] Failed to load mocks → falling back to real API", err);
      // Continue silently — real API calls will be used
    }
  })();
}

// ───────────────────────────────────────────────────────────────
// SHARED UTILITIES
// ───────────────────────────────────────────────────────────────
/**
 * Extract meaningful error message from API errors
 * @param {Error} err - The caught error object
 * @param {string} [fallback="Server error"] - Default message
 * @returns {Error}
 */
function extractError(err, fallback = "Server error") {
  if (!err) return new Error(fallback);
  if (err.response?.data?.message) return new Error(err.response.data.message);
  if (err.response?.data?.detail) return new Error(err.response.data.detail);
  if (err.message) return new Error(err.message);
  return new Error(fallback);
}

/**
 * Apply artificial delay for mock responses (fallback if mock doesn't provide one)
 */
const withDelay = typeof mockImports.withDelay === "function"
  ? mockImports.withDelay
  : (result, ms = 600) => new Promise((resolve) => setTimeout(() => resolve(result), ms));

// ───────────────────────────────────────────────────────────────
// ADMIN ENDPOINTS
// ───────────────────────────────────────────────────────────────

export const fetchInsights = async () => {
  if (USE_MOCK && mockImports.fetchInsightsMock) {
    return withDelay(mockImports.fetchInsightsMock(), 800);
  }

  try {
    const { data } = await apiClient.get("/admin/insights");
    return data;
  } catch (err) {
    throw extractError(err, "Failed to fetch system insights");
  }
};

export const fetchPendingUsers = async () => {
  if (USE_MOCK && mockImports.fetchPendingUsersMock) {
    return withDelay(mockImports.fetchPendingUsersMock(), 600);
  }

  try {
    const { data } = await apiClient.get("/admin/users/pending");
    return data;
  } catch (err) {
    throw extractError(err, "Failed to fetch pending users");
  }
};

export const approveUser = async (id) => {
  if (!id) throw new Error("approveUser: id is required");

  if (USE_MOCK && mockImports.approveUserMock) {
    return withDelay(mockImports.approveUserMock(id), 500);
  }

  try {
    const { data } = await apiClient.patch(`/admin/users/${encodeURIComponent(id)}/approve`);
    return data;
  } catch (err) {
    throw extractError(err, "Failed to approve user");
  }
};

export const rejectUser = async (id, reason = "") => {
  if (!id) throw new Error("rejectUser: id is required");

  if (USE_MOCK && mockImports.rejectUserMock) {
    return withDelay(mockImports.rejectUserMock(id, reason), 500);
  }

  try {
    const { data } = await apiClient.patch(`/admin/users/${encodeURIComponent(id)}/reject`, { reason });
    return data;
  } catch (err) {
    throw extractError(err, "Failed to reject user");
  }
};

export const fetchPendingProperties = async () => {
  if (USE_MOCK && mockImports.fetchPendingPropertiesMock) {
    return withDelay(mockImports.fetchPendingPropertiesMock(), 700);
  }

  try {
    const { data } = await apiClient.get("/admin/properties/pending");
    return data;
  } catch (err) {
    throw extractError(err, "Failed to fetch pending properties");
  }
};

export const approveProperty = async (id) => {
  if (!id) throw new Error("approveProperty: id is required");

  if (USE_MOCK && mockImports.approvePropertyMock) {
    return withDelay(mockImports.approvePropertyMock(id), 500);
  }

  try {
    const { data } = await apiClient.patch(`/admin/properties/${encodeURIComponent(id)}/approve`);
    return data;
  } catch (err) {
    throw extractError(err, "Failed to approve property");
  }
};

export const rejectProperty = async (id, reason = "") => {
  if (!id) throw new Error("rejectProperty: id is required");

  if (USE_MOCK && mockImports.rejectPropertyMock) {
    return withDelay(mockImports.rejectPropertyMock(id, reason), 500);
  }

  try {
    const { data } = await apiClient.patch(`/admin/properties/${encodeURIComponent(id)}/reject`, { reason });
    return data;
  } catch (err) {
    throw extractError(err, "Failed to reject property");
  }
};

export const fetchMaintenance = async () => {
  if (USE_MOCK && mockImports.fetchMaintenanceMock) {
    return withDelay(mockImports.fetchMaintenanceMock(), 900);
  }

  try {
    const { data } = await apiClient.get("/admin/maintenance/pending");
    return data;
  } catch (err) {
    throw extractError(err, "Failed to fetch maintenance requests");
  }
};

export const assignMaintenance = async (id, assignedTo) => {
  if (!id || !assignedTo) throw new Error("assignMaintenance: id and assignedTo are required");

  if (USE_MOCK && mockImports.assignMaintenanceMock) {
    return withDelay(mockImports.assignMaintenanceMock(id, assignedTo), 600);
  }

  try {
    const { data } = await apiClient.patch(`/admin/maintenance/${encodeURIComponent(id)}/assign`, { assignedTo });
    return data;
  } catch (err) {
    throw extractError(err, "Failed to assign maintenance");
  }
};

export const fetchReports = async (start = "", end = "") => {
  if (USE_MOCK && mockImports.fetchReportsMock) {
    return withDelay(mockImports.fetchReportsMock(start, end), 1000);
  }

  try {
    const params = [];
    if (start) params.push(`start=${encodeURIComponent(start)}`);
    if (end) params.push(`end=${encodeURIComponent(end)}`);
    const query = params.length ? `?${params.join("&")}` : "";
    const { data } = await apiClient.get(`/admin/reports${query}`);
    return data;
  } catch (err) {
    throw extractError(err, "Failed to fetch reports");
  }
};

// ───────────────────────────────────────────────────────────────
// SUPER ADMIN ENDPOINTS
// ───────────────────────────────────────────────────────────────

export const fetchSystemStats = async () => {
  if (USE_MOCK && mockImports.mockSystemStats) {
    return withDelay(mockImports.mockSystemStats, 1000);
  }

  try {
    const { data } = await apiClient.get("/super-admin/system/stats/");
    return data;
  } catch (err) {
    throw extractError(err, "Failed to load system stats");
  }
};

export const fetchAllUsers = async () => {
  if (USE_MOCK && mockImports.mockUsers) {
    return withDelay({ users: mockImports.mockUsers }, 800);
  }

  try {
    const { data } = await apiClient.get("/super-admin/users/");
    return data;
  } catch (err) {
    throw extractError(err, "Failed to load all users");
  }
};

/**
 * Create a new user (Super Admin only)
 * @param {Object} payload - User creation payload
 * @param {string} payload.full_name - Required
 * @param {string} payload.email - Required
 * @param {string} [payload.phone_number]
 * @param {string} payload.role - Required (tenant, landlord, artisan, admin, super-admin)
 * @param {string} [payload.password]
 * @returns {Promise<Object>} Created user data
 */
export const createUser = async (payload) => {
  if (!payload) throw new Error("createUser: payload is required");

  if (USE_MOCK) {
    return withDelay(
      {
        success: true,
        user: { ...payload, id: `mock_${Date.now()}` },
      },
      600
    );
  }

  // Declare outside try block → fixes no-undef
  let cleanPayload = {};

  // Frontend validation + sanitization
  const validationErrors = [];

  if (!payload.full_name?.toString().trim()) validationErrors.push("Full name is required");
  if (!payload.email?.toString().trim()) validationErrors.push("Email is required");
  if (!payload.role?.trim()) validationErrors.push("Role is required");

  if (validationErrors.length > 0) {
    const message = validationErrors.join(" • ");
    toast.error(message, { duration: 5500, position: "top-center" });
    throw new Error(`Validation failed: ${message}`);
  }

  try {
    cleanPayload = {
      ...payload,
      full_name: payload.full_name.toString().trim(),
      email: payload.email.toString().trim(),
      phone_number: payload.phone_number?.toString().trim() || undefined,
      role: payload.role.trim(),
      ...(payload.password?.trim() ? { password: payload.password.trim() } : {}),
    };

    const { data } = await apiClient.post("/super-admin/users/create/", cleanPayload);

    toast.success("User created successfully!", {
      duration: 4000,
      position: "top-right",
    });

    return data;
  } catch (err) {
    let displayMessage = "Failed to create user";

    if (err.response?.data) {
      const errorData = err.response.data;

      if (errorData.full_name) displayMessage = `Full name: ${errorData.full_name.join(", ")}`;
      else if (errorData.email) displayMessage = `Email: ${errorData.email.join(", ")}`;
      else if (errorData.role) displayMessage = `Role: ${errorData.role.join(", ")}`;
      else if (errorData.non_field_errors) displayMessage = errorData.non_field_errors.join(" • ");
      else if (errorData.detail) displayMessage = errorData.detail;
      else if (typeof errorData === "object") {
        const firstKey = Object.keys(errorData).find(k => Array.isArray(errorData[k]));
        if (firstKey) displayMessage = `${firstKey}: ${errorData[firstKey].join(", ")}`;
      }
    }

    toast.error(displayMessage, {
      duration: 6500,
      position: "top-center",
      style: { maxWidth: "420px" },
    });

    // Debug info
    console.groupCollapsed("CREATE USER FAILED");
    console.log("Payload:", payload);
    console.log("Clean payload:", cleanPayload);
    console.log("Status:", err.response?.status);
    console.log("Response:", err.response?.data);
    console.log("Error:", err);
    console.groupEnd();

    throw new Error(displayMessage);
  }
};

export const deleteUser = async (userId) => {
  if (!userId) throw new Error("deleteUser: userId is required");

  if (USE_MOCK) return withDelay({ success: true }, 500);

  try {
    const { data } = await apiClient.delete(`/super-admin/users/${encodeURIComponent(userId)}/`);
    return data;
  } catch (err) {
    throw extractError(err, "Failed to delete user");
  }
};

export const fetchAuditLogs = async () => {
  if (USE_MOCK && mockImports.mockAuditLogs) {
    return withDelay(mockImports.mockAuditLogs, 900);
  }

  try {
    const { data } = await apiClient.get("/super-admin/audit/");
    return data.logs || data || [];
  } catch (err) {
    throw extractError(err, "Failed to load audit logs");
  }
};

/**
 * Assign role with granular permissions (Super Admin only)
 * @param {string} userId - User ID
 * @param {string} role - Role to assign
 * @param {Object} permissions - Granular permissions object (for admin role)
 * @returns {Promise<Object>} Updated user object
 */
export const assignRoleWithPermissions = async (userId, role, permissions = {}) => {
  if (!userId || !role) throw new Error("assignRoleWithPermissions: userId and role are required");

  if (USE_MOCK) {
    // Mock: Simulate role assignment with permissions
    return withDelay(
      {
        id: userId,
        role,
        permissions: role === "admin" || role === "super-admin" ? permissions : {},
        updated_at: new Date().toISOString(),
      },
      500
    );
  }

  try {
    const { data } = await apiClient.post(`/super-admin/users/${encodeURIComponent(userId)}/roles`, {
      role,
      permissions: role === "admin" || role === "super-admin" ? permissions : {},
    });
    return data;
  } catch (err) {
    throw extractError(err, "Failed to assign role with permissions");
  }
};

/**
 * Assign role (legacy function, kept for backward compatibility)
 * @param {string} userId - User ID
 * @param {string} role - Role to assign
 * @returns {Promise<Object>} Updated user object
 */
export const assignRole = async (userId, role) => {
  if (!userId || !role) throw new Error("assignRole: userId and role are required");

  if (USE_MOCK) return withDelay({ success: true }, 600);

  try {
    const { data } = await apiClient.put(`/super-admin/roles/${encodeURIComponent(userId)}/`, { role });
    return data;
  } catch (err) {
    throw extractError(err, "Failed to assign role");
  }
};

// ───────────────────────────────────────────────────────────────
// DEFAULT EXPORT (for convenient named imports)
// ───────────────────────────────────────────────────────────────
export default {
  // Admin endpoints
  fetchInsights,
  fetchPendingUsers,
  approveUser,
  rejectUser,
  fetchPendingProperties,
  approveProperty,
  rejectProperty,
  fetchMaintenance,
  assignMaintenance,
  fetchReports,

  // Super Admin endpoints
  fetchSystemStats,
  fetchAllUsers,
  createUser,
  deleteUser,
  fetchAuditLogs,
  assignRole,
  assignRoleWithPermissions,
};