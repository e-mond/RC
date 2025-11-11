import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getUserProfile, loginUser } from "@/services/authService";
import { AuthContext } from "./AuthContext";

/**
 * Provides global authentication state and helpers.
 * Handles session persistence, login, and logout.
 */
export const AuthProvider = ({ children }) => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  /** Load user profile if a token exists */
  useEffect(() => {
    const fetchUser = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const profile = await getUserProfile();
        if (profile) setUser(profile);
      } catch (err) {
        console.warn("Session invalid or expired:", err);
        localStorage.removeItem("token");
        localStorage.removeItem("userRole");
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, []);

  /** Handles login flow and role-based redirects */
  const handleLogin = async (credentials) => {
    try {
      const data = await loginUser(credentials);

      if (!data?.user || !data?.token) {
        throw new Error("Invalid response from server");
      }

      setUser(data.user);
      localStorage.setItem("token", data.token);
      localStorage.setItem("userRole", data.user.role);

      // Role-based redirects
      const role = data.user.role?.toLowerCase();
      switch (role) {
        case "landlord":
          navigate("/dashboard/landlord");
          break;
        case "tenant":
          navigate("/dashboard/tenant");
          break;
        case "artisan":
          navigate("/dashboard/artisan");
          break;
        case "admin":
          navigate("/admin/dashboard");
          break;
        case "super-admin":
          navigate("/super-admin/overview");
          break;
        default:
          navigate("/");
      }
    } catch (err) {
      console.error("Login failed:", err);
      throw err;
    }
  };

  /** Logs out user and clears local storage */
  const logout = () => {
    setUser(null);
    localStorage.removeItem("token");
    localStorage.removeItem("userRole");
    navigate("/login");
  };

  return (
    <AuthContext.Provider value={{ user, loading, handleLogin, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
