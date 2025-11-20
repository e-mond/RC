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

          set({
            user: {
              ...profile,
              role: normalizedRole,
            },
            token,
            loading: false,
            error: null,
          });
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

          const token = data.token;
          // Normalize role to lowercase for consistency
          const normalizedRole = data.user.role?.toLowerCase().trim() || "tenant";

          session.setToken(token);
          session.setRole(normalizedRole);

          set({
            user: { ...data.user, role: normalizedRole },
            token,
            authLoading: false,
            loading: false,
            error: null,
          });

          return { success: true, role: normalizedRole };
        } catch (err) {
          set({
            authLoading: false,
            error: err?.response?.data?.message || "Login failed",
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
