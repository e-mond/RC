/**
 * apiEndpoints.js - Unified API Endpoints Configuration
 * 
 * This file centralizes all API endpoint paths used throughout the application.
 * All endpoints are relative to the base URL configured in apiClient.js.
 * 
 * Benefits:
 * - Single source of truth for all API paths
 * - Easy to update endpoints in one place
 * - Type safety and autocomplete support
 * - Consistent endpoint naming
 * 
 * Usage:
 * import { API_ENDPOINTS } from '@/config/apiEndpoints';
 * apiClient.get(API_ENDPOINTS.AUTH.LOGIN);
 * 
 * @module apiEndpoints
 */

/**
 * Unified API Endpoints Configuration
 * 
 * All endpoints are relative to the base URL (configured in apiClient.js).
 * Base URL: VITE_API_BASE_URL or https://rc-backend-658461237694.europe-west1.run.app/api
 */
export const API_ENDPOINTS = {
  // ───────────────────────────────────────────────────────────────
  // Authentication Endpoints
  // ───────────────────────────────────────────────────────────────
  AUTH: {
    LOGIN: '/auth/login/',
    SIGNUP_TENANT: '/auth/signup/tenant/',
    SIGNUP_LANDLORD: '/auth/signup/landlord/',
    SIGNUP_ARTISAN: '/auth/signup/artisan/',
    LOGOUT: '/auth/logout/',
    REFRESH: '/auth/refresh/',
    FORGOT_PASSWORD: '/auth/forgot-password/',
    RESET_PASSWORD: '/auth/reset-password/',
    PROFILE: '/auth/profile/',
  },

  // ───────────────────────────────────────────────────────────────
  // User Management Endpoints
  // ───────────────────────────────────────────────────────────────
  USERS: {
    BASE: '/users/',
    BY_ID: (id) => `/users/${id}/`,
    PROFILE: '/users/profile/',
    PUBLIC_PROFILE: (id) => `/users/${id}/profile/`, // New endpoint for public profiles
    SEARCH: '/users/search/',
    BY_EMAIL: (email) => `/users/by-email/${encodeURIComponent(email)}/`,
  },

  // ───────────────────────────────────────────────────────────────
  // Property Endpoints
  // ───────────────────────────────────────────────────────────────
  PROPERTIES: {
    BASE: '/properties/',
    BY_ID: (id) => `/properties/${id}/`,
    LANDLORD_PROPERTIES: (ownerId) => `/properties/landlord/${ownerId}/`,
    PENDING: '/properties/pending/',
    APPROVE: (id) => `/properties/${id}/approve/`,
    REJECT: (id) => `/properties/${id}/reject/`,
    VIEWING_REQUESTS: '/properties/viewing-requests/',
    CREATE_VIEWING_REQUEST: (propertyId) => `/properties/${propertyId}/viewing-request/`,
    AMENITIES: '/properties/amenities/',
    UPLOAD_IMAGE: '/properties/upload-image/',
  },

  // ───────────────────────────────────────────────────────────────
  // Admin Endpoints
  // ───────────────────────────────────────────────────────────────
  ADMIN: {
    BASE: '/admin/',
    DASHBOARD_STATS: '/admin/insights/',
    INSIGHTS: '/admin/insights/',
    PENDING_USERS: '/admin/users/pending/',
    USER_DETAILS: (id) => `/admin/users/${id}/`,
    APPROVE_USER: (id) => `/admin/users/${id}/approve/`,
    REJECT_USER: (id) => `/admin/users/${id}/reject/`,
    SUSPEND_USER: (id) => `/admin/users/${id}/suspend/`,
    PENDING_PROPERTIES: '/admin/properties/pending/',
    APPROVE_PROPERTY: (id) => `/admin/properties/${id}/approve/`,
    REJECT_PROPERTY: (id) => `/admin/properties/${id}/reject/`,
    MAINTENANCE: '/admin/maintenance/pending/',
    ASSIGN_MAINTENANCE: (id) => `/admin/maintenance/${id}/assign/`,
    REPORTS: '/admin/reports/',
  },

  // ───────────────────────────────────────────────────────────────
  // Super Admin Endpoints
  // ───────────────────────────────────────────────────────────────
  SUPER_ADMIN: {
    BASE: '/super-admin/',
    SYSTEM_STATS: '/super-admin/system/stats/',
    ALL_USERS: '/super-admin/users/',
    CREATE_USER: '/super-admin/users/',
    DELETE_USER: (id) => `/super-admin/users/${id}/`,
    AUDIT_LOGS: '/super-admin/audit-logs/',
    ASSIGN_ROLE: (userId) => `/super-admin/roles/${userId}/`,
    ASSIGN_ROLE_WITH_PERMISSIONS: (userId) => `/super-admin/users/${userId}/roles/`,
    ASSIGN_ROLE_STANDARD: '/super-admin/roles/assign/',
    PREMIUM_PRICING: '/super-admin/premium/pricing/',
    PENDING_USERS: '/super-admin/users/pending/',
    USER_DETAILS: (id) => `/super-admin/users/${id}/`,
    APPROVE_USER: (id) => `/super-admin/users/${id}/approve/`,
    REJECT_USER: (id) => `/super-admin/users/${id}/reject/`,
    SUSPEND_USER: (id) => `/super-admin/users/${id}/suspend/`,
    PENDING_PROPERTIES: '/super-admin/properties/pending/',
    APPROVE_PROPERTY: (id) => `/super-admin/properties/${id}/approve/`,
    REJECT_PROPERTY: (id) => `/super-admin/properties/${id}/reject/`,
  },

  // ───────────────────────────────────────────────────────────────
  // Tenant Endpoints
  // ───────────────────────────────────────────────────────────────
  TENANT: {
    BASE: '/tenant/',
    RENTALS: '/tenant/rentals/',
    FAVORITES: '/tenant/favorites/',
    RENTAL_HISTORY: '/tenant/rental-history/',
    PAYMENTS: '/tenant/payments/',
    MAINTENANCE: '/tenant/maintenance/',
    WISHLIST: '/tenant/wishlist/',
    VIEWING_REQUESTS: '/tenant/viewing-requests/',
    BOOKINGS: '/tenant/bookings/',
    BOOKINGS_SCHEDULED: '/tenant/bookings/scheduled/',
    RESCHEDULE_BOOKING: (id) => `/tenant/bookings/${id}/reschedule/`,
    CANCEL_BOOKING: (id) => `/tenant/bookings/${id}/cancel/`,
  },

  // ───────────────────────────────────────────────────────────────
  // Landlord Endpoints
  // ───────────────────────────────────────────────────────────────
  LANDLORD: {
    BASE: '/landlord/',
    DASHBOARD_STATS: '/landlord/dashboard/stats/',
    ACTIVITY: '/landlord/activity/',
    BOOKINGS: '/landlord/bookings/',
    RESPOND_BOOKING: (id) => `/landlord/bookings/${id}/respond/`,
  },

  // ───────────────────────────────────────────────────────────────
  // Lease Endpoints
  // ───────────────────────────────────────────────────────────────
  // Note: All endpoints are relative to baseURL configured in apiClient.js
  // Base URL includes /api (e.g., https://rc-backend-658461237694.europe-west1.run.app/api)
  // Endpoints should NOT include /api prefix to avoid duplication
  // Example: DOWNLOAD_SYSTEM_LEASE("standard-residential") 
  //   -> /leases/system/standard-residential/download/
  //   -> Full URL: {baseURL}/leases/system/standard-residential/download/
  LEASES: {
    BASE: '/leases/',
    SYSTEM_LEASES: '/leases/system/',
    SYSTEM_LEASE_BY_ID: (id) => `/leases/system/${id}/`,
    UPLOAD_SYSTEM_LEASE: '/leases/system/',
    DELETE_SYSTEM_LEASE: (id) => `/leases/system/${id}/`,
    DOWNLOAD_SYSTEM_LEASE: (id) => `/leases/system/${id}/download/`,
    CUSTOM_LEASES: '/leases/custom/',
    CUSTOM_LEASE_BY_ID: (id) => `/leases/custom/${id}/`,
    UPLOAD_CUSTOM_LEASE: '/leases/custom/',
    DOWNLOAD_CUSTOM_LEASE: (id) => `/leases/custom/${id}/download/`,
    SIGNED_LEASES_TENANT: '/leases/signed/tenant/',
    SIGNED_LEASES_BY_PROPERTY: (propertyId) => `/leases/property/${propertyId}/signed/`,
    SIGN_LEASE: (id) => `/leases/${id}/sign/`,
    GENERATE_CUSTOMIZED: '/leases/templates/generate/',
    PREVIEW_CUSTOMIZED: '/leases/templates/preview/',
  },

  // ───────────────────────────────────────────────────────────────
  // Analytics Endpoints
  // ───────────────────────────────────────────────────────────────
  ANALYTICS: {
    BASE: '/analytics/',
    DASHBOARD: '/analytics/dashboard/',
    LANDLORD_ANALYTICS: '/analytics/landlord/',
  },

  // ───────────────────────────────────────────────────────────────
  // Notification Endpoints
  // ───────────────────────────────────────────────────────────────
  NOTIFICATIONS: {
    BASE: '/notifications/',
    UNREAD_COUNT: '/notifications/unread-count/',
    MARK_READ: (id) => `/notifications/${id}/read/`,
    MARK_ALL_READ: '/notifications/mark-all-read/',
  },

  // ───────────────────────────────────────────────────────────────
  // Messages Endpoints
  // ───────────────────────────────────────────────────────────────
  MESSAGES: {
    BASE: '/messages/',
    CONVERSATIONS: '/messages/conversations/',
    CONVERSATION_BY_ID: (id) => `/messages/conversations/${id}/`,
    SEND_MESSAGE: '/messages/send/',
    UNREAD_COUNT: '/messages/unread-count/',
  },

  // ───────────────────────────────────────────────────────────────
  // Wallet & Payment Endpoints
  // ───────────────────────────────────────────────────────────────
  WALLET: {
    BASE: '/wallet/',
    BALANCE: '/wallet/balance/',
    TRANSACTIONS: '/wallet/transactions/',
    TOP_UP: '/wallet/top-up/',
    INITIATE_PAYMENT: '/wallet/initiate-payment/',
    VERIFY_PAYMENT: '/wallet/verify-payment/',
  },
  PAYMENTS: {
    BASE: '/payments/',
    VERIFY_PAYSTACK: '/payments/verify-paystack/',
    PREMIUM_UPGRADE: '/payments/premium/upgrade/',
  },

  // ───────────────────────────────────────────────────────────────
  // Preferences Endpoints
  // ───────────────────────────────────────────────────────────────
  PREFERENCES: {
    BASE: '/preferences/',
    GET: '/preferences/',
    UPDATE: '/preferences/',
  },

  // ───────────────────────────────────────────────────────────────
  // AI Endpoints
  // ───────────────────────────────────────────────────────────────
  AI: {
    BASE: '/ai/',
    RECOMMENDATIONS: {
      PROPERTIES: '/ai/recommendations/properties/',
      ARTISANS: '/ai/recommendations/artisans/',
    },
    CHAT: {
      MESSAGE: '/ai/chat/message/',
      CONVERSATIONS: '/ai/chat/conversations/',
    },
    TRUST_SCORE: (userId) => `/ai/trust-score/${userId}/`,
    TRUST_SCORE_BATCH: '/ai/trust-score/batch/',
  },
};

/**
 * External API Endpoints (Third-party services)
 * These are not relative to the base URL
 */
export const EXTERNAL_ENDPOINTS = {
  // ───────────────────────────────────────────────────────────────
  // Geocoding Services
  // ───────────────────────────────────────────────────────────────
  GEOCODING: {
    NOMINATIM_SEARCH: 'https://nominatim.openstreetmap.org/search',
    NOMINATIM_REVERSE: 'https://nominatim.openstreetmap.org/reverse',
  },

  // ───────────────────────────────────────────────────────────────
  // Cloudinary
  // ───────────────────────────────────────────────────────────────
  CLOUDINARY: {
    UPLOAD_URL: import.meta.env.VITE_CLOUDINARY_UPLOAD_URL || 'https://api.cloudinary.com/v1_1/demo/upload',
    UPLOAD_PRESET: import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET || 'default',
  },

  // ───────────────────────────────────────────────────────────────
  // Paystack
  // ───────────────────────────────────────────────────────────────
  PAYSTACK: {
    INITIALIZE: 'https://api.paystack.co/transaction/initialize',
    VERIFY: 'https://api.paystack.co/transaction/verify',
  },
};

export default API_ENDPOINTS;
