/**
 * apiClient.js - Centralized HTTP Client Configuration
 * 
 * This module configures the Axios instance used for all API requests.
 * It handles:
 * - Base URL configuration (from environment variables)
 * - Request interceptors (JWT token injection, URL formatting)
 * - Response interceptors (error handling, 401 auto-logout, 403 permission errors)
 * - Network error handling
 * - Server error logging
 * 
 * Key Features:
 * - Automatic JWT token injection from session storage
 * - Trailing slash normalization for Django backend
 * - Auto-logout on 401 (production only)
 * - User-friendly error toasts
 * - Network timeout handling (12 seconds)
 * 
 * Environment Variables:
 * - VITE_API_BASE_URL: Backend API base URL (default: https://rc-backend-658461237694.europe-west1.run.app/api)
 * 
 * @module apiClient
 * @requires axios
 * @requires react-hot-toast
 * @requires @/utils/session
 */

// src/services/apiClient.js
import axios from "axios";
import { toast } from "react-hot-toast";
import { session } from "@/utils/session";

const isDev = import.meta.env.DEV;

/**
 * Separate axios instance for token refresh to avoid circular dependencies
 * This instance is used only for refresh token requests
 */
const refreshAxios = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:8000/api",
  withCredentials: true,
  timeout: 12000
});

/**
 * Public axios instance for unauthenticated requests
 * This instance does NOT have auth interceptors and will NOT trigger session expired redirects
 * Use this for public endpoints that should work without authentication
 */
export const publicApiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:8000/api",
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
  timeout: 12000
});

// Public client should NOT have request interceptor for auth tokens
// Public client should NOT have response interceptor for 401 handling
// This ensures public requests never trigger session expired redirects

// Minimal request interceptor for public client (only URL formatting, NO auth)
publicApiClient.interceptors.request.use(
  (config) => {
    // Add trailing slash for Django backend compatibility (no auth token injection)
    const method = config.method?.toLowerCase();
    if (['post', 'put', 'patch', 'delete'].includes(method)) {
      if (config.url && !config.url.endsWith('/')) {
        config.url += '/';
      }
    }

    // For multipart/form-data, let axios set Content-Type automatically
    if (config.data instanceof FormData) {
      delete config.headers['Content-Type'];
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// Minimal response interceptor for public client (only error logging, NO 401 handling)
publicApiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // Log errors but don't trigger session expired redirects
    if (error.response?.status >= 500) {
      console.error("[publicApiClient] Server error:", {
        status: error.response.status,
        url: error.config?.url,
        method: error.config?.method?.toUpperCase(),
      });
    }

    // Always reject so .catch() handlers work, but don't trigger auth flows
    return Promise.reject(error);
  }
);

/**
 * Axios Instance Configuration
 * 
 * Creates a configured Axios instance with:
 * - Base URL from environment or default localhost
 * - JSON content type headers
 * - Credentials enabled for CORS
 * - 12 second timeout for all requests
 */
const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:8000/api",
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
  timeout: 12000
});

/**
 * Request Interceptor
 * 
 * Runs before every API request to:
 * - Inject JWT token from session storage into Authorization header
 * - Normalize URLs with trailing slashes for Django backend compatibility
 * 
 * Django REST Framework expects trailing slashes for POST/PUT/PATCH/DELETE requests.
 */
apiClient.interceptors.request.use(
  (config) => {
    // Inject JWT token if available
    const token = session.getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    } else if (import.meta.env.DEV) {
      // Debug: Log when token is missing
      console.warn("[apiClient] No token found for request:", config.url);
    }

    // Add trailing slash for Django backend compatibility
    const method = config.method?.toLowerCase();
    if (['post', 'put', 'patch', 'delete'].includes(method)) {
      if (config.url && !config.url.endsWith('/')) {
        config.url += '/';
      }
    }

    // For multipart/form-data, let axios set Content-Type automatically
    // This is important - don't override Content-Type for FormData
    if (config.data instanceof FormData) {
      delete config.headers['Content-Type']; // Let browser set it with boundary
    }

    return config;
  },
  (error) => Promise.reject(error)
);

/**
 * Response Interceptor
 * 
 * Handles all API responses and errors:
 * - Success responses: Pass through unchanged
 * - 401 Unauthorized: Auto-logout and redirect to login (production only)
 * - 403 Forbidden: Show permission error toast
 * - Network errors: Show user-friendly error messages
 * - Server errors (500+): Log to console for debugging
 * 
 * Always rejects errors to ensure .catch() handlers receive the full error object.
 */
apiClient.interceptors.response.use(
  // Success: just return response
  (response) => response,

  // Error: REJECT on ALL non-2xx (including 400, 422, 403, 401, 500…)
  async (error) => {
    const status = error.response?.status;
    const originalRequest = error.config;

    // Handle 401 Unauthorized - Attempt token refresh before logout
    if (status === 401) {
      const refreshToken = session.getRefreshToken();

      // Check if refresh token exists and is not expired
      const isRefreshTokenValid = refreshToken && refreshToken.length > 0;

      // If we have a refresh token and this isn't a refresh request, try to refresh
      if (isRefreshTokenValid && originalRequest && !originalRequest._retry && !originalRequest.url?.includes('/auth/refresh/')) {
        originalRequest._retry = true; // Prevent infinite loop

        try {
          // Attempt to refresh the token
          const { API_ENDPOINTS } = await import("@/config/apiEndpoints");
          const refreshResponse = await refreshAxios.post(
            API_ENDPOINTS.AUTH.REFRESH,
            { refresh: refreshToken },
            {
              timeout: 10000, // 10 second timeout for refresh
              validateStatus: (status) => status < 500 // Don't throw on 400/401
            }
          );

          // Check if refresh was successful
          if (refreshResponse.status === 200 && refreshResponse.data?.access) {
            const newAccessToken = refreshResponse.data.access;
            const newRefreshToken = refreshResponse.data.refresh;

            // Store new tokens
            session.setToken(newAccessToken);
            if (newRefreshToken) {
              session.setRefreshToken(newRefreshToken);
            }

            // Update the original request with new token
            originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;

            // Retry the original request
            return apiClient(originalRequest);
          } else {
            // Refresh endpoint returned error (400, 401, etc.)
            throw new Error('Token refresh failed: Invalid response');
          }
        } catch (refreshError) {
          // Refresh failed - clear session and logout
          console.warn("[Token Refresh] Failed to refresh token:", refreshError);
          session.clearAll();

          // Logout in both dev and production
          const redirectUrl = new URL("/login", window.location.origin);
          redirectUrl.searchParams.set("session", "expired");
          window.location.replace(redirectUrl.toString());
          return new Promise(() => { }); // stop propagation
        }
      } else {
        // No refresh token or refresh failed - logout
        session.clearAll();

        // Logout in both dev and production
        const redirectUrl = new URL("/login", window.location.origin);
        redirectUrl.searchParams.set("session", "expired");
        window.location.replace(redirectUrl.toString());
        return new Promise(() => { }); // stop propagation
      }
    }

    // Handle 429 Rate Limit errors
    if (status === 429) {
      const message = "We're receiving too many requests right now. Please wait a moment and try again. This helps ensure everyone gets fast responses!";
      toast.error(message, {
        id: "rate-limit-error",
        duration: 6000,
        position: "top-center",
        style: {
          borderRadius: "12px",
          background: "#f59e0b",
          color: "#fff",
          maxWidth: "420px",
        },
      });
      console.warn("[429] Rate limit exceeded:", {
        url: error.config?.url,
        method: error.config?.method?.toUpperCase(),
      });
    }

    // Keep 403 toast
    if (status === 403) {
      let message =
        error.response?.data?.detail ||
        error.response?.data?.message ||
        error.response?.data?.non_field_errors?.[0] ||
        error.response?.data?.permission?.[0] ||
        "You don't have permission to perform this action.";

      if (message.includes("credentials") || message.includes("permission")) {
        message = "Access denied: Insufficient permissions";
      }

      toast.error(message, {
        id: "permission-error",
        duration: 5500,
        position: "top-center",
        style: {
          borderRadius: "12px",
          background: "#dc2626",
          color: "#fff",
          maxWidth: "420px",
        },
      });

      console.warn("[403] Permission denied:", {
        url: error.config?.url,
        method: error.config?.method?.toUpperCase(),
        data: error.response?.data,
      });
    }

    // Network errors (connection refused, network errors, etc.)
    if (!error.response) {
      let message = "Something went wrong";
      if (error.code === "ECONNABORTED") {
        message = "Request timed out. Please check your internet connection.";
      } else if (error.code === "ERR_NETWORK" || error.message?.toLowerCase().includes("network") || error.message?.toLowerCase().includes("connection refused")) {
        // Don't show toast for connection refused in development (backend might not be running)
        if (isDev) {
          console.warn("[Network Error] Backend not available:", error.config?.url);
          // Don't show toast in dev - backend might not be running
        } else {
          message = "Unable to connect to server. Please check your connection and try again.";
          toast.error(message, { duration: 4500, position: "top-right" });
        }
      } else {
        if (!isDev) {
          toast.error(message, { duration: 4500, position: "top-right" });
        }
      }
    }

    // 500+ server errors logging
    if (status >= 500) {
      console.error("[SERVER ERROR]", {
        status,
        url: error.config?.url,
        method: error.config?.method?.toUpperCase(),
        response: error.response?.data,
      });
    }

    // CRITICAL: Always reject the promise so .catch() gets the full error
    return Promise.reject(error);
  }
);

/**
 * Create Cancel Token
 * 
 * Utility function to create Axios cancel tokens for request cancellation.
 * Useful for canceling requests when components unmount or user navigates away.
 * 
 * @returns {CancelTokenSource} Axios cancel token source
 * @example
 * const cancelToken = createCancelToken();
 * apiClient.get('/endpoint', { cancelToken: cancelToken.token });
 * // Later: cancelToken.cancel('Request cancelled');
 */
export const createCancelToken = () => axios.CancelToken.source();

export default apiClient;