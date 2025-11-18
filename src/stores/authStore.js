import { create } from "zustand";
import { persist } from "zustand/middleware";
import { loginUser, getUserProfile } from "@/services/authService";

// -----------------------------------------------------------------------------
// AUTH STORE (Zustand)
// -----------------------------------------------------------------------------
// Handles:
//  - User authentication state
//  - Persisting auth data
//  - Role + permission checks
//  - Auto-session restore on page refresh
//
// NOTE:
//  Only the `user` object is persisted via Zustand's persist middleware.
//  Token remains in localStorage manually.
// -----------------------------------------------------------------------------
export const useAuthStore = create(
  persist(
    (set, get) => ({
      // Currently authenticated user
      user: null,

      // True while checking for existing login (refresh scenarios)
      loading: true,

      // Flag to detect if auth came from refreshing the browser
      isFromRefresh: false,

      /**
       * Load profile on initial page load / refresh.
       * - Checks if a token exists
       * - Fetches user profile silently
       * - Validates session
       */
      loadSession: async () => {
        const token = localStorage.getItem("token");
        if (!token) {
          // No token → no authenticated user
          set({ loading: false });
          return;
        }

        try {
          // Try loading authenticated user's profile
          const profile = await getUserProfile();
          set({ user: profile, loading: false, isFromRefresh: true });
        } catch (err) {
          // If token is invalid / expired → clear session
          console.warn("Invalid session:", err);
          localStorage.removeItem("token");
          set({ user: null, loading: false });
        }
      },

      /**
       * Login handler
       * - Calls API
       * - Normalizes role to lowercase
       * - Stores permissions (admins only)
       * - Persists token
       *
       * Returns:
       *  → the user's role so caller can redirect appropriately
       */
      login: async (credentials) => {
        const data = await loginUser(credentials);

        const role = data.user.role?.toLowerCase();
        const permissions = data.user.permissions || {}; // Only admin users receive permissions

        // Store user data in Zustand
        set({
          user: {
            ...data.user,
            role,
            permissions,
          },
        });

        // Persist token manually
        localStorage.setItem("token", data.token);

        return role; // Allows redirect logic from login page
      },

      /**
       * Logout function
       * - Clears all auth data
       * - Removes token + user
       */
      logout: () => {
        localStorage.clear();
        set({ user: null });
      },

      /**
       * Role-check helper
       * Accepts:
       *  - String → "admin"
       *  - Array  → ["admin", "super-admin"]
       */
      hasRole: (roles) => {
        const user = get().user;
        if (!user) return false;

        if (Array.isArray(roles)) {
          return roles.includes(user.role);
        }
        return user.role === roles;
      },

      /**
       * Permission-check helper
       * (Only used for admin accounts)
       *
       * Example:
       *  hasPermission("canSuspendUsers")
       */
      hasPermission: (perm) => {
        const user = get().user;
        if (!user || !user.permissions) return false;
        return user.permissions[perm] === true;
      },

      /**
       * Super Admin functionality:
       * - Updates admin permissions (mock or real API)
       * - Only allowed for role: "super-admin"
       */
      updateAdminPermissions: (adminId, newPermissions) => {
        const user = get().user;

        // Validate role access
        if (user.role !== "super-admin") {
          console.warn("Only super-admin can modify permissions");
          return false;
        }

        // Real-world → send to server
        console.log("Updating admin permissions:", adminId, newPermissions);

        return true;
      },
    }),

    // -------------------------------------------------------------------------
    // ZUSTAND PERSIST CONFIG
    // -------------------------------------------------------------------------
    {
      name: "auth-storage", // localStorage key for Zustand store
      partialize: (state) => ({
        // Only persist the user object — prevents saving entire store
        user: state.user,
      }),
    }
  )
);
