import { createContext, useContext } from "react";

/**
 * Global authentication context.
 * Holds user info, loading state, and login/logout helpers.
 */
export const AuthContext = createContext(null);

/**
 * Custom hook for safely consuming AuthContext
 */
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
