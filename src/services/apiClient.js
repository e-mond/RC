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
 * - VITE_API_BASE_URL: Backend API base URL (default: http://localhost:8000/api)
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
    }

    // Add trailing slash for Django backend compatibility
    const method = config.method?.toLowerCase();
    if (['post', 'put', 'patch', 'delete'].includes(method)) {
      if (config.url && !config.url.endsWith('/')) {
        config.url += '/';
      }
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
  (error) => {
    const status = error.response?.status;

    if (status === 401 && !isDev) {
      session.clearAll();
      const redirectUrl = new URL("/login", window.location.origin);
      redirectUrl.searchParams.set("session", "expired");
      window.location.replace(redirectUrl.toString());
      return new Promise(() => {}); // stop propagation
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

    // Network errors
    if (!error.response) {
      let message = "Something went wrong";
      if (error.code === "ECONNABORTED") {
        message = "Request timed out. Please check your internet connection.";
      } else if (error.message?.toLowerCase().includes("network")) {
        message = "Network error. Please check your connection and try again.";
      }

      toast.error(message, { duration: 4500, position: "top-right" });
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