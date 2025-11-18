import { createContext } from "react";

/**
 * Global Auth Context
 * - Holds user, loading, login/logout
 * - Used by useAuth() hook
 */
export const AuthContext = createContext(null);