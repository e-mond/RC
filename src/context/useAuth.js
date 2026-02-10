import { useAuthStore } from "@/stores/authStore";

/**
 * useAuth Hook (Legacy Adapter)
 * 
 * This hook provides backward compatibility for components using the old AuthContext.
 * It maps the Zustand authStore state and actions to the interface expected by legacy code.
 */
export const useAuth = () => {
  const { user, loading, login, logout, setUser, error, register, updateUser } = useAuthStore();

  // Derived state to match AuthContext
  const isAuthenticated = !!user;

  // Login adapter if signatures differ significantly (handled in authStore usually)
  // AuthContext login: (userData, tokens)
  // AuthStore login: async (credentials) -> but we might
  console.trace("useAuth adapter called"); // Adapter: map store state to expected context shape
  return {
    user,
    loading: false, // Store is initialized
    isAuthenticated: !!user,
    login,
    logout,
    register,
    updateUser,
  };
};