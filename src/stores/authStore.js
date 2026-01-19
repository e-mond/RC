/**
 * authStore.js - Authentication State Management
 * 
 * Zustand store with persistence for managing authentication state.
 * 
 * Features:
 * - User authentication state (user, token, loading, error)
 * - Session persistence via Zustand persist middleware
 * - Automatic session restoration on app load
 * - Role normalization (all roles stored in lowercase)
 * - Role-based helper functions (isTenant, isLandlord, etc.)
 * - Centralized logout with cleanup
 * 
 * State Structure:
 * - user: Current authenticated user object
 * - token: JWT authentication token
 * - loading: Initial session hydration state
 * - authLoading: Login/signup operation state
 * - error: Authentication error message
 * 
 * Persistence:
 * - Uses Zustand persist middleware
 * - Stores state in localStorage
 * - Automatically rehydrates on app load
 * 
 * Role Normalization:
 * - All roles normalized to lowercase: "tenant", "landlord", "artisan", "admin", "super-admin"
 * - Ensures consistent role comparison throughout the app
 * 
 * @module authStore
 * @requires zustand
 * @requires zustand/middleware
 * @requires @/services/authService
 * @requires @/utils/session
 */

// src/stores/authStore.js
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { loginUser, getUserProfile } from "@/services/authService";
import { session } from "@/utils/session";

/**
 * Auth Store (Zustand + Persist)
 * 
 * Manages:
 * - User authentication state
 * - Session persistence
 * - Role-based access helpers
 * 
 * Role normalization: All roles stored in lowercase (tenant, landlord, artisan, admin, super-admin)
 */
export const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      token: null,            // JWT token stored in localStorage
      loading: true,          // Initial hydration loading
      authLoading: false,     // Login/signup operation loading
      error: null,

      // =========================
      // LOAD EXISTING SESSION
      // =========================
      loadSession: async () => {
        const token = session.getToken();

        if (!token) {
          set({ user: null, token: null, loading: false });
          return;
        }

        try {
          const profile = await getUserProfile();

          // Normalize role to lowercase
          const normalizedRole = profile.role?.toLowerCase().trim() || "tenant";
          
          // Ensure subscription defaults to "free" if not provided
          const userData = {
            ...profile,
            role: normalizedRole,
            subscription: profile?.subscription || "free", // Default to "free" plan
          };

          set({
            user: userData,
            token,
            loading: false,
            error: null,
          });
          
          // Sync subscription to feature store
          const { useFeatureStore } = await import("@/stores/featureStore");
          const subscription = userData.subscription?.toLowerCase() || "free";
          if (subscription === "free" || subscription === "premium") {
            useFeatureStore.getState().setPlan(subscription);
          }
        } catch (err) {
          console.warn("Session invalid or expired:", err);
          get().logout(); // Centralized cleanup
          set({ loading: false });
        }
      },

      // =========================
      // LOGIN USER
      // =========================
      login: async (credentials) => {
        set({ authLoading: true, error: null });

        try {
          const data = await loginUser(credentials);

          const token = data.token || data.access; // Backend returns 'access' token
          const refreshToken = data.refresh;
          
          // Normalize role to lowercase for consistency
          const normalizedRole = data.user?.role?.toLowerCase().trim() || "tenant";

          // Store tokens
          if (token) {
            session.setToken(token);
          }
          if (refreshToken) {
            session.setRefreshToken(refreshToken);
          }
          session.setRole(normalizedRole);
          if (data.user) {
            session.setUser(data.user);
          }

          // Ensure subscription defaults to "free" if not provided
          const userData = {
            ...data.user,
            role: normalizedRole,
            subscription: data.user?.subscription || "free", // Default to "free" plan
          };

          set({
            user: userData,
            token,
            authLoading: false,
            loading: false,
            error: null,
          });
          
          // Sync subscription to feature store
          const { useFeatureStore } = await import("@/stores/featureStore");
          const subscription = userData.subscription?.toLowerCase() || "free";
          if (subscription === "free" || subscription === "premium") {
            useFeatureStore.getState().setPlan(subscription);
          }

          // Check for welcome notification on first login after approval
          // This is handled by the backend sending a notification, but we can check here
          // The backend should send a "welcome" or "account_approved" notification
          if (data.user?.status === "approved" && data.user?.role !== "tenant") {
            // Check if this is likely first login after approval
            // Backend should handle creating the welcome notification
            // Frontend will display it when notifications are fetched
          }

          // Create in-app login notification
          // Note: Backend should typically create this automatically, but frontend can create it as fallback
          try {
            const { createLoginNotification } = await import("@/services/notificationService");
            
            // Extract login information from request (if available)
            // In production, backend should provide this in the login response
            const loginData = {
              loginTime: new Date().toLocaleString(),
              // IP address and device info should come from backend
              // Frontend can't reliably get IP address, so backend should provide it
              ipAddress: data.login_ip || null,
              device: data.login_device || navigator.userAgent || "Unknown Device",
              location: data.login_location || null,
              isNewDevice: data.is_new_device || false,
              isSuspicious: data.is_suspicious || false,
            };

            // Only create notification if backend didn't already create it
            // Backend should create login notifications automatically
            // This is a fallback for cases where backend doesn't create it
            if (!data.login_notification_created) {
              await createLoginNotification(userData, loginData);
            }
          } catch (notifErr) {
            // Don't fail login if notification creation fails
            // Log error but continue with login flow
            console.warn("Failed to create login notification:", notifErr);
          }

          // Debug logging
          if (import.meta.env.DEV) {
            console.log("Login successful:", {
              hasToken: !!token,
              tokenLength: token?.length,
              role: normalizedRole,
              userId: data.user?.id,
              status: data.user?.status
            });
          }

          return { success: true, role: normalizedRole };
        } catch (err) {
          // Handle AccountPendingError - Account pending approval
          if (err?.name === 'AccountPendingError' || err?.response?.data?.error === 'AccountPendingError') {
            const errorMessage = err?.response?.data?.message || err?.message || "Your account is pending admin approval. You will receive an email notification once approved.";
            set({
              authLoading: false,
              error: errorMessage,
              pendingApproval: true,
            });
            return { 
              success: false, 
              error: errorMessage,
              pendingApproval: true,
              status: 'pending_approval'
            };
          }
          
          // Handle AccountRejectedError - Account rejected
          if (err?.name === 'AccountRejectedError' || err?.response?.data?.error === 'AccountRejectedError') {
            const errorMessage = err?.response?.data?.message || err?.message || "Your account has been rejected. Please contact support for more information.";
            set({
              authLoading: false,
              error: errorMessage,
              accountRejected: true,
            });
            return { 
              success: false, 
              error: errorMessage,
              accountRejected: true,
              status: 'rejected'
            };
          }
          
          set({
            authLoading: false,
            error: err?.response?.data?.message || err?.message || "Login failed",
          });
          return { success: false, error: get().error };
        }
      },

      // =========================
      // LOGOUT USER
      // =========================
      logout: () => {
        session.clearAll();
        set({
          user: null,
          token: null,
          loading: false,
          authLoading: false,
          error: null,
        });
      },

      // =========================
      // UPDATE USER PROFILE
      // =========================
      updateUser: (updates) => {
        const currentUser = get().user;
        if (!currentUser) return;

        set({
          user: {
            ...currentUser,
            ...updates,
            // Ensure role remains normalized if updated
            role: updates.role ? updates.role.toLowerCase().trim() : currentUser.role,
          },
        });
      },

      // =========================
      // ROLE CHECK HELPERS
      // =========================
      hasRole: (roles) => {
        const user = get().user;
        if (!user || !user.role) return false;

        const userRole = user.role.toLowerCase();
        const allowed = Array.isArray(roles)
          ? roles.map((r) => r.toLowerCase().trim())
          : [roles.toLowerCase().trim()];

        return allowed.includes(userRole);
      },

      isTenant: () => get().hasRole("tenant"),
      isLandlord: () => get().hasRole("landlord"),
      isArtisan: () => get().hasRole("artisan"),
      isAdmin: () => get().hasRole(["admin", "super-admin"]),
      isSuperAdmin: () => get().hasRole("super-admin"),

      // =========================
      // GET CURRENT ROLE
      // =========================
      getRole: () => {
        const user = get().user;
        return user?.role?.toLowerCase() || null;
      },

      // =========================
      // CHECK IF AUTHENTICATED
      // =========================
      isAuthenticated: () => {
        const user = get().user;
        const token = get().token;
        return !!(user && token);
      },
    }),
    {
      name: "auth-storage",
      partialize: (state) => ({
        user: state.user,
        token: state.token,
      }),
    }
  )
);
