/**
 * authService.js - Authentication Service
 * 
 * Handles all authentication-related API calls:
 * - User login (with mock mode support for development)
 * - User signup (tenant, landlord, artisan)
 * - Password reset flows
 * - User profile management
 * 
 * Mock Mode:
 * - Enabled in development when VITE_USE_MOCK=true or localStorage.demoMockEnabled=true
 * - Provides demo users for all roles (tenant@demo.com, landlord@demo.com, etc.)
 * - Returns mock JWT tokens and user data
 * 
 * Real API:
 * - Uses apiClient for authenticated requests
 * - Handles JWT token responses
 * - Normalizes user roles to lowercase
 * 
 * @module authService
 * @requires ./apiClient
 * @requires @/mocks/mockManager
 * @requires @/utils/session
 */

// src/services/authService.js
import apiClient from "./apiClient";
import { isMockMode } from "@/mocks/mockManager";
import { session } from "@/utils/session";

/**
 * Extract Error Message
 * 
 * Utility function to consistently extract error messages from API responses.
 * Handles various error response formats from Django backend.
 * 
 * @param {Error} err - Error object from API call
 * @param {string} fallback - Default error message if extraction fails
 * @returns {string} Error message
 */
const extractError = (err, fallback = "Request failed") =>
  err?.response?.data?.message || err?.response?.data?.error || err?.message || fallback;

/**
 * Login User
 * 
 * Authenticates user with email and password.
 * Supports both mock mode (development) and real API (production).
 * 
 * Mock Mode:
 * - Maps demo emails to roles (tenant@demo.com → tenant, etc.)
 * - Returns mock JWT token and user data
 * - Stores token in session
 * 
 * Real API:
 * - POST /auth/login/
 * - Expects: { email, password }
 * - Returns: { token, user }
 * 
 * @param {Object} credentials - Login credentials
 * @param {string} credentials.email - User email
 * @param {string} credentials.password - User password
 * @returns {Promise<Object>} { token, user }
 * @throws {Error} If login fails
 */
export const loginUser = async (credentials) => {
  // ----- MOCK MODE -----
  if (import.meta.env.DEV && isMockMode()) {
    const roleMap = {
      "tenant@demo.com": "tenant",
      "landlord@demo.com": "landlord",
      "artisan@demo.com": "artisan",
      "admin@demo.com": "admin",
      "super@demo.com": "super-admin",
    };

    const role = roleMap[credentials.email] || "tenant";
    const user = {
      id: `u${Date.now()}`,
      name: credentials.email.split("@")[0],
      email: credentials.email,
      role,
    };

    session.setToken("dev-jwt-demo");
    session.setRole(role);

    return { token: "dev-jwt-demo", user };
  }

  // ----- REAL API -----
  try {
    // Use unified API endpoint configuration
    const { API_ENDPOINTS } = await import("@/config/apiEndpoints");
    const { data } = await apiClient.post(API_ENDPOINTS.AUTH.LOGIN, credentials);
    
    // Backend returns: { access, refresh, user } (Django JWT format)
    // Extract tokens - backend uses 'access' not 'token'
    const accessToken = data.access || data.token || data.access_token;
    const refreshToken = data.refresh;
    
    // Store refresh token if provided
    if (refreshToken) {
      session.setRefreshToken(refreshToken);
    }
    
    // Debug logging
    if (import.meta.env.DEV) {
      console.log("Login response:", {
        hasAccess: !!data.access,
        hasToken: !!data.token,
        hasRefresh: !!refreshToken,
        hasUser: !!data.user
      });
    }
    
    return {
      token: accessToken, // Use 'access' token for Authorization header
      refresh: refreshToken,
      user: data.user || data,
    };
  } catch (err) {
    throw new Error(extractError(err, "Login failed"));
  }
};

/* ------------------------------------------------------------
   SIGNUP (Tenant / Landlord / Artisan)
------------------------------------------------------------ */
const signup = async (endpoint, formData) => {
  try {
    const { data } = await apiClient.post(endpoint, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return data;
  } catch (err) {
    throw new Error(extractError(err, "Signup failed"));
  }
};

/**
 * Signup Functions
 * 
 * All signup functions use multipart/form-data for file uploads.
 * Backend expects trailing slashes for Django compatibility.
 */
const getSignupEndpoint = async (role) => {
  const { API_ENDPOINTS } = await import("@/config/apiEndpoints");
  const endpoints = {
    tenant: API_ENDPOINTS.AUTH.SIGNUP_TENANT,
    landlord: API_ENDPOINTS.AUTH.SIGNUP_LANDLORD,
    artisan: API_ENDPOINTS.AUTH.SIGNUP_ARTISAN,
  };
  return endpoints[role] || API_ENDPOINTS.AUTH.SIGNUP_TENANT;
};

export const signupTenant = async (formData) => {
  const endpoint = await getSignupEndpoint("tenant");
  return signup(endpoint, formData);
};

export const signupLandlord = async (formData) => {
  const endpoint = await getSignupEndpoint("landlord");
  return signup(endpoint, formData);
};

export const signupArtisan = async (formData) => {
  const endpoint = await getSignupEndpoint("artisan");
  return signup(endpoint, formData);
};

/* ------------------------------------------------------------
   PROFILE
   Returns ONLY the user object
------------------------------------------------------------ */
export const getUserProfile = async () => {
  if (import.meta.env.DEV && isMockMode()) {
    const role = session.getRole() || "tenant";
    const profiles = {
      tenant: { id: "u1", name: "Kofi Mensah", email: "tenant@demo.com", role: "tenant" },
      landlord: { id: "u2", name: "Ama Owusu", email: "landlord@demo.com", role: "landlord" },
      artisan: { id: "u3", name: "Kwame Electrician", email: "artisan@demo.com", role: "artisan" },
      admin: { id: "u4", name: "Efua Admin", email: "admin@demo.com", role: "admin" },
      "super-admin": { id: "u5", name: "Nana Super", email: "super@demo.com", role: "super-admin" },
    };
    return profiles[role];
  }

  try {
    // Backend profile endpoint: /api/auth/profile/
    const { data } = await apiClient.get("/auth/profile/");
    return data.user || data.profile || data;
  } catch (err) {
    throw new Error(extractError(err, "Unable to load profile"));
  }
};

/* ------------------------------------------------------------
   PASSWORD RESET
------------------------------------------------------------ */
export const forgotPassword = async (email) => {
  try {
    // Backend forgot password endpoint: /api/auth/forgot-password/
    const { data } = await apiClient.post("/auth/forgot-password/", { email });
    return data;
  } catch (err) {
    throw new Error(extractError(err, "Unable to send reset email"));
  }
};

export const resetPassword = async (token, payload) => {
  try {
    // Backend reset endpoint: /api/auth/reset-password/<token>/
    const { data } = await apiClient.post(`/auth/reset-password/${token}/`, payload);
    return data;
  } catch (err) {
    throw new Error(extractError(err, "Password reset failed"));
  }
};
