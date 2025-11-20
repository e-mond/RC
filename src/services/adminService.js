// src/services/adminService.js
/**
 * Unified Admin & Super Admin API Service
 * - Single source of truth for all admin endpoints
 * - Mock/real API toggle via VITE_USE_MOCK or DEV mode
 * - Used by: AdminDashboard, SuperAdminDashboard, widgets
 */

import apiClient from "./apiClient";

/* =====================
   CONFIGURATION (only once!)
   ===================== */
const USE_MOCK = String(import.meta.env.VITE_USE_MOCK || "").toLowerCase() === "true";
const IS_DEV = import.meta.env.DEV === true;

let mockImports = {};

/* =====================
   LOAD MOCKS ASYNCHRONOUSLY (fire & forget)
   Only attempt to load if we're in dev or mock mode
   ===================== */
if (USE_MOCK || IS_DEV) {
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
      console.log("Admin service mocks loaded successfully");
    } catch (err) {
      console.warn("Mock files not found → using real API", err);
      // Silently continue — real API will be used
    }
  })();
}

/* =====================
   HELPERS
   ===================== */
function extractError(err, fallback = "Server error") {
  if (!err) return new Error(fallback);
  if (err.response?.data?.message) return new Error(err.response.data.message);
  if (err.message) return new Error(err.message);
  return new Error(fallback);
}

// Fallback delay if mock doesn't provide one
const withDelay =
  typeof mockImports.withDelay === "function"
    ? mockImports.withDelay
    : (result, ms = 600) =>
        new Promise((res) => setTimeout(() => res(result), ms));

/* ========================================
   ADMIN ENDPOINTS
   ======================================== */

export const fetchInsights = async () => {
  const useMock = USE_MOCK || IS_DEV;

  if (useMock && mockImports.fetchInsightsMock) {
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
  const useMock = USE_MOCK || IS_DEV;

  if (useMock && mockImports.fetchPendingUsersMock) {
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
  const useMock = USE_MOCK || IS_DEV;

  if (useMock && mockImports.approveUserMock) {
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
  const useMock = USE_MOCK || IS_DEV;

  if (useMock && mockImports.rejectUserMock) {
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
  const useMock = USE_MOCK || IS_DEV;

  if (useMock && mockImports.fetchPendingPropertiesMock) {
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
  const useMock = USE_MOCK || IS_DEV;

  if (useMock && mockImports.approvePropertyMock) {
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
  const useMock = USE_MOCK || IS_DEV;

  if (useMock && mockImports.rejectPropertyMock) {
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
  const useMock = USE_MOCK || IS_DEV;

  if (useMock && mockImports.fetchMaintenanceMock) {
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
  const useMock = USE_MOCK || IS_DEV;

  if (useMock && mockImports.assignMaintenanceMock) {
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
  const useMock = USE_MOCK || IS_DEV;

  if (useMock && mockImports.fetchReportsMock) {
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

/* ========================================
   SUPER ADMIN ENDPOINTS
   ======================================== */

export const fetchSystemStats = async () => {
  const useMock = USE_MOCK || IS_DEV;

  if (useMock && mockImports.mockSystemStats) {
    return withDelay(mockImports.mockSystemStats, 1000);
  }

  try {
    const { data } = await apiClient.get("/super-admin/system/stats");
    return data;
  } catch (err) {
    throw extractError(err, "Failed to load system stats");
  }
};

export const fetchAllUsers = async () => {
  const useMock = USE_MOCK || IS_DEV;

  if (useMock && mockImports.mockUsers) {
    return withDelay({ users: mockImports.mockUsers }, 800);
  }

  try {
    const { data } = await apiClient.get("/super-admin/users");
    return data;
  } catch (err) {
    throw extractError(err, "Failed to load users");
  }
};

export const createUser = async (payload) => {
  if (!payload) throw new Error("createUser: payload is required");
  const useMock = USE_MOCK || IS_DEV;

  if (useMock) {
    return withDelay(
      {
        success: true,
        user: { ...payload, id: "mock_" + Date.now() },
      },
      600
    );
  }

  try {
    const { data } = await apiClient.post("/super-admin/users/create", payload);
    return data;
  } catch (err) {
    throw extractError(err, "User creation failed");
  }
};

export const deleteUser = async (userId) => {
  if (!userId) throw new Error("deleteUser: userId is required");
  const useMock = USE_MOCK || IS_DEV;

  if (useMock) return withDelay({ success: true }, 500);

  try {
    const { data } = await apiClient.delete(`/super-admin/users/${encodeURIComponent(userId)}`);
    return data;
  } catch (err) {
    throw extractError(err, "Failed to delete user");
  }
};

export const fetchAuditLogs = async () => {
  const useMock = USE_MOCK || IS_DEV;

  if (useMock && mockImports.mockAuditLogs) {
    return withDelay(mockImports.mockAuditLogs, 900);
  }

  try {
    const { data } = await apiClient.get("/super-admin/audit");
    return data;
  } catch (err) {
    throw extractError(err, "Failed to load audit logs");
  }
};

export const assignRole = async (userId, role) => {
  if (!userId || !role) throw new Error("assignRole: userId and role are required");
  const useMock = USE_MOCK || IS_DEV;

  if (useMock) return withDelay({ success: true }, 600);

  try {
    const { data } = await apiClient.put(`/super-admin/roles/${encodeURIComponent(userId)}`, { role });
    return data;
  } catch (err) {
    throw extractError(err, "Failed to assign role");
  }
};

/* ========================================
   DEFAULT EXPORT
   ======================================== */
export default {
  // Admin
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

  // Super Admin
  fetchSystemStats,
  fetchAllUsers,
  createUser,
  deleteUser,
  fetchAuditLogs,
  assignRole,
};