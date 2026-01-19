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
import { isMockMode } from "@/mocks/mockManager";

// ───────────────────────────────────────────────────────────────
// CONFIGURATION
// ───────────────────────────────────────────────────────────────
const USE_MOCK = isMockMode();

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

/**
 * Fetch Pending Users
 * 
 * Retrieves all users with pending_approval status for admin review.
 * 
 * @returns {Promise<Object>} { users: Array, count: number }
 * @throws {Error} If fetch fails
 */
export const fetchPendingUsers = async () => {
  if (USE_MOCK && mockImports.fetchPendingUsersMock) {
    return withDelay(mockImports.fetchPendingUsersMock(), 600);
  }

  try {
    const { API_ENDPOINTS } = await import("@/config/apiEndpoints");
    const { data } = await apiClient.get(API_ENDPOINTS.ADMIN.PENDING_USERS);
    return data;
  } catch (err) {
    throw extractError(err, "Failed to fetch pending users");
  }
};

/**
 * Approve User
 * 
 * Approves a pending user account. Backend will:
 * - Update user status to "approved"
 * - Send approval email to user
 * - Log action in audit log
 * 
 * @param {string|number} id - User ID to approve
 * @returns {Promise<Object>} Updated user object
 * @throws {Error} If approval fails
 */
export const approveUser = async (id, payload = {}) => {
  if (!id) throw new Error("approveUser: id is required");

  if (USE_MOCK && mockImports.approveUserMock) {
    return withDelay(mockImports.approveUserMock(id), 500);
  }

  try {
    const { API_ENDPOINTS } = await import("@/config/apiEndpoints");
    // Backend may accept optional notes in request body
    const { data } = await apiClient.patch(API_ENDPOINTS.ADMIN.APPROVE_USER(id), payload);
    return data;
  } catch (err) {
    throw extractError(err, "Failed to approve user");
  }
};

/**
 * Reject User
 * 
 * Rejects a pending user account. Backend will:
 * - Update user status to "rejected"
 * - Store rejection reason
 * - Send rejection email to user with reason
 * - Log action in audit log
 * 
 * @param {string|number} id - User ID to reject
 * @param {string} reason - Reason for rejection (optional but recommended)
 * @returns {Promise<Object>} Updated user object
 * @throws {Error} If rejection fails
 */
export const rejectUser = async (id, reason = "") => {
  if (!id) throw new Error("rejectUser: id is required");

  if (USE_MOCK && mockImports.rejectUserMock) {
    return withDelay(mockImports.rejectUserMock(id, reason), 500);
  }

  try {
    const { API_ENDPOINTS } = await import("@/config/apiEndpoints");
    const { data } = await apiClient.patch(API_ENDPOINTS.ADMIN.REJECT_USER(id), { reason });
    return data;
  } catch (err) {
    throw extractError(err, "Failed to reject user");
  }
};

/**
 * Suspend User
 * 
 * Suspends a user account (can be in any status). Backend will:
 * - Update user status to "suspended"
 * - Store suspension reason
 * - Revoke active sessions (optional)
 * - Send suspension email to user with reason
 * - Log action in audit log
 * 
 * @param {string|number} id - User ID to suspend
 * @param {string} reason - Reason for suspension (optional but recommended)
 * @returns {Promise<Object>} Updated user object
 * @throws {Error} If suspension fails
 */
export const suspendUser = async (id, suspensionData) => {
  if (!id) throw new Error("suspendUser: id is required");

  // Handle both old format (id, reason) and new format (id, { reason, duration_days })
  const payload = typeof suspensionData === "string" 
    ? { reason: suspensionData }
    : suspensionData || {};

  if (USE_MOCK && mockImports.suspendUserMock) {
    return withDelay(mockImports.suspendUserMock?.(id, payload.reason) || { id, status: "suspended" }, 500);
  }

  try {
    const { API_ENDPOINTS } = await import("@/config/apiEndpoints");
    // Backend expects POST method, not PATCH
    const { data } = await apiClient.post(API_ENDPOINTS.ADMIN.SUSPEND_USER(id), payload);
    return data;
  } catch (err) {
    throw extractError(err, "Failed to suspend user");
  }
};

/**
 * Suspend User (Super Admin)
 * 
 * Suspends a user account using Super Admin endpoint.
 * 
 * @param {string|number} id - User ID to suspend
 * @param {string|Object} suspensionData - Reason string or object with { reason, duration_days }
 * @returns {Promise<Object>} Updated user object
 * @throws {Error} If suspension fails
 */
export const suspendUserSA = async (id, suspensionData) => {
  if (!id) throw new Error("suspendUserSA: id is required");

  // Handle both old format (id, reason) and new format (id, { reason, duration_days })
  const payload = typeof suspensionData === "string" 
    ? { reason: suspensionData }
    : suspensionData || {};

  if (USE_MOCK && mockImports.suspendUserMock) {
    return withDelay(mockImports.suspendUserMock?.(id, payload.reason) || { id, status: "suspended" }, 500);
  }

  try {
    const { API_ENDPOINTS } = await import("@/config/apiEndpoints");
    // Backend expects POST method for Super Admin endpoint
    const { data } = await apiClient.post(API_ENDPOINTS.SUPER_ADMIN.SUSPEND_USER(id), payload);
    return data;
  } catch (err) {
    throw extractError(err, "Failed to suspend user");
  }
};

/**
 * Get User Details
 * 
 * Retrieves full user details including uploaded documents for admin review.
 * 
 * @param {string|number} id - User ID
 * @returns {Promise<Object>} { user: Object with full details and documents }
 * @throws {Error} If fetch fails
 */
export const getUserDetails = async (id) => {
  if (!id) throw new Error("getUserDetails: id is required");

  if (USE_MOCK && mockImports.getUserDetailsMock) {
    return withDelay(mockImports.getUserDetailsMock?.(id) || {}, 500);
  }

  try {
    const { API_ENDPOINTS } = await import("@/config/apiEndpoints");
    const { data } = await apiClient.get(API_ENDPOINTS.ADMIN.USER_DETAILS(id));
    return data;
  } catch (err) {
    throw extractError(err, "Failed to fetch user details");
  }
};

export const fetchPendingProperties = async () => {
  if (USE_MOCK && mockImports.fetchPendingPropertiesMock) {
    return withDelay(mockImports.fetchPendingPropertiesMock(), 700);
  }

  try {
    const { API_ENDPOINTS } = await import("@/config/apiEndpoints");
    const { data } = await apiClient.get(API_ENDPOINTS.ADMIN.PENDING_PROPERTIES);
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
    const { API_ENDPOINTS } = await import("@/config/apiEndpoints");
    const { data } = await apiClient.patch(API_ENDPOINTS.ADMIN.APPROVE_PROPERTY(id));
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
    const { API_ENDPOINTS } = await import("@/config/apiEndpoints");
    const { data } = await apiClient.patch(API_ENDPOINTS.ADMIN.REJECT_PROPERTY(id), { reason });
    return data;
  } catch (err) {
    throw extractError(err, "Failed to reject property");
  }
};

// ───────────────────────────────────────────────────────────────
// SUPER ADMIN SPECIFIC FUNCTIONS
// ───────────────────────────────────────────────────────────────

/**
 * Super Admin: Fetch pending users
 * Uses /super-admin/users/pending/ endpoint
 */
export const fetchPendingUsersSA = async () => {
  if (USE_MOCK && mockImports.fetchPendingUsersMock) {
    return withDelay(mockImports.fetchPendingUsersMock(), 500);
  }

  try {
    const { API_ENDPOINTS } = await import("@/config/apiEndpoints");
    const { data } = await apiClient.get(API_ENDPOINTS.SUPER_ADMIN.PENDING_USERS);
    return data;
  } catch (err) {
    throw extractError(err, "Failed to fetch pending users");
  }
};

/**
 * Super Admin: Get user details
 * Uses /super-admin/users/{id}/ endpoint
 */
export const getUserDetailsSA = async (id) => {
  if (!id) throw new Error("getUserDetailsSA: id is required");

  if (USE_MOCK && mockImports.getUserDetailsMock) {
    return withDelay(mockImports.getUserDetailsMock?.(id) || {}, 500);
  }

  try {
    const { API_ENDPOINTS } = await import("@/config/apiEndpoints");
    const { data } = await apiClient.get(API_ENDPOINTS.SUPER_ADMIN.USER_DETAILS(id));
    return data;
  } catch (err) {
    throw extractError(err, "Failed to fetch user details");
  }
};

/**
 * Super Admin: Approve user
 * Uses /super-admin/users/{id}/approve/ endpoint
 */
export const approveUserSA = async (id, payload = {}) => {
  if (!id) throw new Error("approveUserSA: id is required");

  if (USE_MOCK && mockImports.approveUserMock) {
    return withDelay(mockImports.approveUserMock(id), 500);
  }

  try {
    const { API_ENDPOINTS } = await import("@/config/apiEndpoints");
    const { data } = await apiClient.patch(API_ENDPOINTS.SUPER_ADMIN.APPROVE_USER(id), payload);
    return data;
  } catch (err) {
    throw extractError(err, "Failed to approve user");
  }
};

/**
 * Super Admin: Reject user
 * Uses /super-admin/users/{id}/reject/ endpoint
 */
export const rejectUserSA = async (id, reason = "") => {
  if (!id) throw new Error("rejectUserSA: id is required");

  if (USE_MOCK && mockImports.rejectUserMock) {
    return withDelay(mockImports.rejectUserMock(id, reason), 500);
  }

  try {
    const { API_ENDPOINTS } = await import("@/config/apiEndpoints");
    const { data } = await apiClient.patch(API_ENDPOINTS.SUPER_ADMIN.REJECT_USER(id), { reason });
    return data;
  } catch (err) {
    throw extractError(err, "Failed to reject user");
  }
};

/**
 * Super Admin: Fetch pending properties
 * Uses /super-admin/properties/pending/ endpoint
 */
export const fetchPendingPropertiesSA = async () => {
  if (USE_MOCK && mockImports.fetchPendingPropertiesMock) {
    return withDelay(mockImports.fetchPendingPropertiesMock(), 700);
  }

  try {
    const { API_ENDPOINTS } = await import("@/config/apiEndpoints");
    const { data } = await apiClient.get(API_ENDPOINTS.SUPER_ADMIN.PENDING_PROPERTIES);
    return data;
  } catch (err) {
    throw extractError(err, "Failed to fetch pending properties");
  }
};

/**
 * Super Admin: Approve property
 * Uses /super-admin/properties/{id}/approve/ endpoint
 */
export const approvePropertySA = async (id, payload = {}) => {
  if (!id) throw new Error("approvePropertySA: id is required");

  if (USE_MOCK && mockImports.approvePropertyMock) {
    return withDelay(mockImports.approvePropertyMock(id), 500);
  }

  try {
    const { API_ENDPOINTS } = await import("@/config/apiEndpoints");
    const { data } = await apiClient.patch(API_ENDPOINTS.SUPER_ADMIN.APPROVE_PROPERTY(id), payload);
    return data;
  } catch (err) {
    throw extractError(err, "Failed to approve property");
  }
};

/**
 * Super Admin: Reject property
 * Uses /super-admin/properties/{id}/reject/ endpoint
 */
export const rejectPropertySA = async (id, reason = "") => {
  if (!id) throw new Error("rejectPropertySA: id is required");

  if (USE_MOCK && mockImports.rejectPropertyMock) {
    return withDelay(mockImports.rejectPropertyMock(id, reason), 500);
  }

  try {
    const { API_ENDPOINTS } = await import("@/config/apiEndpoints");
    const { data } = await apiClient.patch(API_ENDPOINTS.SUPER_ADMIN.REJECT_PROPERTY(id), { reason });
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

/**
 * Get public pricing (no authentication required)
 * Used for landing page pricing display
 * @returns {Promise<Object>} Pricing configuration
 */
export const getPublicPricing = async () => {
  if (USE_MOCK) {
    // Mock pricing data for landing page
    return withDelay(
      {
        monthly: 49.0,
        yearly: 490.0,
        currency: "GHS",
        enabled: true,
        listingFee: 5.0,
        adPromotionFee: 10.0,
        featuredListingFee: 15.0,
        upgradeFee: 0.0,
      },
      300
    );
  }

  try {
    // Public endpoint - no auth required
    const { data } = await apiClient.get("/public/pricing/");
    return data;
  } catch (err) {
    // Fallback to default pricing if API fails
    console.warn("Failed to fetch public pricing, using defaults:", err);
    return {
      monthly: 49.0,
      yearly: 490.0,
      currency: "GHS",
      enabled: true,
      listingFee: 5.0,
      adPromotionFee: 10.0,
      featuredListingFee: 15.0,
      upgradeFee: 0.0,
    };
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

export const deleteUser = async (userId, options = {}) => {
  if (!userId) throw new Error("deleteUser: userId is required");

  if (USE_MOCK) return withDelay({ success: true }, 500);

  try {
    const { API_ENDPOINTS } = await import("@/config/apiEndpoints");
    const userEndpoint = API_ENDPOINTS.SUPER_ADMIN.DELETE_USER(userId);
    
    // Try DELETE method first (REST standard)
    // Note: DELETE typically doesn't accept request body, but some backends support it
    try {
      // Try DELETE without body first (standard REST)
      const { data } = await apiClient.delete(userEndpoint);
      return data;
    } catch (deleteErr) {
      // If DELETE returns 405 or 404, try POST to /delete/ endpoint
      if (deleteErr.response?.status === 405 || deleteErr.response?.status === 404) {
        try {
          const deleteEndpoint = `${userEndpoint}delete/`;
          const { data } = await apiClient.post(deleteEndpoint, options);
          return data;
        } catch (postErr) {
          // If POST also fails, try PATCH with action in body
          if (postErr.response?.status === 405 || postErr.response?.status === 404) {
            try {
              const { data } = await apiClient.patch(userEndpoint, {
                ...options,
                action: "delete",
                status: "deleted",
              });
              return data;
            } catch (patchErr) {
              // All methods failed - provide helpful error message
              const all405 = deleteErr.response?.status === 405 && 
                            postErr.response?.status === 405 && 
                            patchErr.response?.status === 405;
              
              if (all405) {
                const errorMsg = `Backend endpoint not implemented. Expected one of:
- DELETE /api/super-admin/users/${userId}/
- POST /api/super-admin/users/${userId}/delete/
- PATCH /api/super-admin/users/${userId}/`;
                console.error("Delete user - Backend endpoint missing:", {
                  attemptedMethods: ["DELETE", "POST", "PATCH"],
                  endpoint: userEndpoint,
                  userId,
                });
                throw new Error(errorMsg);
              }
              
              // For other errors, throw the most specific error
              throw patchErr;
            }
          }
          throw postErr;
        }
      }
      // Re-throw if it's not a 404/405
      throw deleteErr;
    }
  } catch (err) {
    // If error message already set, use it; otherwise extract from response
    if (err.message && err.message.includes("Backend endpoint")) {
      throw err;
    }
    throw extractError(err, "Failed to delete user");
  }
};

export const fetchAuditLogs = async () => {
  if (USE_MOCK && mockImports.mockAuditLogs) {
    return withDelay(mockImports.mockAuditLogs, 900);
  }

  try {
    const { data } = await apiClient.get("/super-admin/audit/");
    
    // Handle different backend response formats
    // Backend may return: { logs: [...] }, { results: [...] }, or directly [...]
    let logs = [];
    if (Array.isArray(data)) {
      logs = data;
    } else if (data && Array.isArray(data.logs)) {
      logs = data.logs;
    } else if (data && Array.isArray(data.results)) {
      logs = data.results;
    } else if (data && typeof data === 'object') {
      // If data is an object but not an array, try to extract logs
      logs = [];
      console.warn("Unexpected audit logs response format:", data);
    }
    
    // Ensure logs is always an array before mapping
    if (!Array.isArray(logs)) {
      console.warn("Audit logs is not an array, returning empty array:", logs);
      return [];
    }
    
    // Normalize audit log data to handle different backend response formats
    // Backend may send: actor, actorName, target, level, createdAt
    // Frontend expects: userName, target, level, timestamp
    return logs.map((log, index) => {
      // Ensure log is an object
      if (!log || typeof log !== 'object') {
        console.warn("Invalid log entry:", log);
        return {
          id: Date.now(),
          action: "unknown",
          level: "info",
          timestamp: new Date().toISOString(),
        };
      }
      
      // Debug: Log first few entries to see actual structure
      if (index < 3) {
        console.log(`🔍 Audit log entry ${index}:`, {
          allKeys: Object.keys(log),
          fullObject: JSON.parse(JSON.stringify(log)), // Deep clone for logging
          actor: log.actor,
          actorName: log.actorName,
          userName: log.userName,
          user: log.user,
          target: log.target,
          resource: log.resource,
          detail: log.detail,
          action: log.action,
          metadata: log.metadata,
          extra_data: log.extra_data,
          context: log.context,
        });
      }
      
      // Extract user name - check many possible fields
      const userName = 
        log.actorName ||           // Backend: actorName
        log.userName ||            // Alternative: userName
        log.user?.name ||          // Nested: user.name
        log.user?.fullName ||      // Nested: user.fullName
        log.user?.username ||      // Nested: user.username
        log.actor ||               // Backend: actor (email)
        log.user?.email ||         // Nested: user.email
        log.userId ||              // Alternative: userId
        log.user?.id ||            // Nested: user.id
        log.created_by?.name ||    // Nested: created_by.name
        log.created_by?.email ||   // Nested: created_by.email
        log.created_by ||          // Direct: created_by
        null;
      
      // Extract target - check many possible fields
      const target = 
        log.target ||              // Backend: target
        log.resource ||            // Alternative: resource
        log.detail ||              // Alternative: detail
        log.target_id ||           // Alternative: target_id
        log.target_user?.email ||  // Nested: target_user.email
        log.target_user?.name ||   // Nested: target_user.name
        log.target_user ||         // Direct: target_user
        log.object_id ||           // Alternative: object_id
        log.object_type ||         // Alternative: object_type
        log.description ||          // Alternative: description
        log.message ||             // Alternative: message
        null;
      
      // Format target - if still null, try to create meaningful fallback
      let finalTarget = target;
      if (!finalTarget && log.action) {
        // For user-related actions, try to extract info from action or metadata
        if (log.action.includes('user')) {
          finalTarget = log.metadata?.user_id || 
                       log.extra_data?.user_id || 
                       log.metadata?.email ||
                       log.extra_data?.email ||
                       `User action: ${log.action}`;
        } else {
          finalTarget = `Action: ${log.action}`;
        }
      }
      if (!finalTarget) {
        finalTarget = "—";
      }
      
      return {
        ...log,
        // Map actor/actorName to userName for display
        userName: userName || "Unknown User",
        // Ensure target exists with meaningful fallback
        target: finalTarget,
        // Normalize level (ensure lowercase)
        level: log.level ? String(log.level).toLowerCase() : "info",
        // Map createdAt to timestamp
        timestamp: log.timestamp || log.createdAt || log.created_at || new Date().toISOString(),
        // Preserve original fields for reference
        actor: log.actor,
        actorName: log.actorName,
        originalTarget: log.target,
        originalResource: log.resource,
        originalDetail: log.detail,
        // Preserve metadata for debugging
        _metadata: log.metadata,
        _extra_data: log.extra_data,
        _context: log.context,
      };
    });
  } catch (err) {
    console.error("Error fetching audit logs:", err);
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
    const { API_ENDPOINTS } = await import("@/config/apiEndpoints");
    
    // Try the standard backend endpoint first: POST /super-admin/roles/assign/
    try {
      const { data } = await apiClient.post(API_ENDPOINTS.SUPER_ADMIN.ASSIGN_ROLE_STANDARD, {
        user_id: userId,
        role,
        permissions: role === "admin" || role === "super-admin" ? permissions : {},
      });
      return data;
    } catch (standardErr) {
      // If 404, try alternative endpoint: POST /super-admin/users/{id}/roles/
      if (standardErr.response?.status === 404) {
        try {
          const endpoint = API_ENDPOINTS.SUPER_ADMIN.ASSIGN_ROLE_WITH_PERMISSIONS(userId);
          const { data } = await apiClient.post(endpoint, {
            role,
            permissions: role === "admin" || role === "super-admin" ? permissions : {},
          });
          return data;
        } catch (altErr) {
          // Both endpoints returned 404 - backend endpoint not implemented
          console.error("[assignRoleWithPermissions] Backend endpoint not found:", {
            standardEndpoint: API_ENDPOINTS.SUPER_ADMIN.ASSIGN_ROLE_STANDARD,
            alternativeEndpoint: API_ENDPOINTS.SUPER_ADMIN.ASSIGN_ROLE_WITH_PERMISSIONS(userId),
            userId,
            role,
          });
          
          // Provide a more helpful error message
          const errorMessage = standardErr.response?.data?.detail || 
                              standardErr.response?.data?.message ||
                              "The role assignment endpoint is not available. Please ensure the backend endpoint POST /api/super-admin/roles/assign/ is implemented.";
          throw new Error(errorMessage);
        }
      }
      throw standardErr;
    }
  } catch (err) {
    // If it's already an Error with a message, use it; otherwise extract from response
    if (err instanceof Error && err.message && !err.message.includes("Failed to assign")) {
      throw err;
    }
    throw extractError(err, "Failed to assign role with permissions. The backend endpoint may not be implemented.");
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
    const { API_ENDPOINTS } = await import("@/config/apiEndpoints");
    
    // Try the standard backend endpoint first: POST /super-admin/roles/assign/
    try {
      const { data } = await apiClient.post(API_ENDPOINTS.SUPER_ADMIN.ASSIGN_ROLE_STANDARD, {
        user_id: userId,
        role,
      });
      return data;
    } catch (standardErr) {
      // If 404, try alternative endpoint: POST /super-admin/users/{id}/roles/
      if (standardErr.response?.status === 404) {
        try {
          const endpoint = API_ENDPOINTS.SUPER_ADMIN.ASSIGN_ROLE_WITH_PERMISSIONS(userId);
          const { data } = await apiClient.post(endpoint, { role });
          return data;
        } catch (altErr) {
          // If still 404, try: PUT /super-admin/roles/{id}/
          if (altErr.response?.status === 404) {
            try {
              const { data } = await apiClient.put(API_ENDPOINTS.SUPER_ADMIN.ASSIGN_ROLE(userId), { role });
              return data;
            } catch (putErr) {
              // All endpoints failed, throw original error
              throw standardErr;
            }
          }
          throw altErr;
        }
      }
      throw standardErr;
    }
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
  suspendUser,
  getUserDetails,
  fetchPendingProperties,
  approveProperty,
  rejectProperty,
  fetchMaintenance,
  // Super Admin endpoints
  fetchPendingUsersSA,
  getUserDetailsSA,
  approveUserSA,
  rejectUserSA,
  fetchPendingPropertiesSA,
  approvePropertySA,
  rejectPropertySA,
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