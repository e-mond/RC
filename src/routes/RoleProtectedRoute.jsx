// // src/routes/RoleProtectedRoute.jsx
// import React, { useEffect, useRef } from "react";
// import { Navigate } from "react-router-dom";
// import { useAuth } from "@/context/useAuth";
// import { decodeToken } from "@/utils/tokenUtils";

// export default function RoleProtectedRoute({
//   allowedRoles,
//   fallback = "/",
//   children,
// }) {
//   const { user, loading, logout } = useAuth();
//   const hasCheckedToken = useRef(false);

//   // ================================
//   // TOKEN EXPIRATION CHECK (ONE-TIME!)
//   // ================================
//   useEffect(() => {
//     if (hasCheckedToken.current) return;
//     hasCheckedToken.current = true;

//     const rawToken = localStorage.getItem("token");
//     if (!rawToken) return;

//     const decoded = decodeToken(rawToken);
//     if (!decoded) {
//       logout();
//       return;
//     }

//     const now = Date.now() / 1000;
//     if (decoded.exp && decoded.exp < now) {
//       console.warn("Session expired");
//       logout();
//     }
//   }, [logout]); 

//   // ================================
//   // EARLY RETURNS
//   // ================================
//   if (loading) {
//     return (
//       <div className="flex items-center justify-center min-h-screen bg-gray-50">
//         <div className="w-10 h-10 border-4 border-[#0b6e4f] border-t-transparent animate-spin rounded-full"></div>
//       </div>
//     );
//   }

//   if (!user) {
//     return <Navigate to="/login" replace />;
//   }

//   // ================================
//   // ROLE VALIDATION
//   // ================================
//   const userRole = String(user.role || "").toLowerCase().trim();

//   const allowedList = Array.isArray(allowedRoles)
//     ? allowedRoles.map(r => String(r).toLowerCase().trim())
//     : [String(allowedRoles).toLowerCase().trim()];

//   if (!allowedList.includes(userRole)) {
//     return <Navigate to={fallback} replace />;
//   }

//   return <>{children}</>;
// }



/**
 * RoleProtectedRoute - Route Guard Component
 * 
 * Protects routes based on user role. Validates:
 * - User authentication status
 * - Token expiration (if token exists)
 * - User role matches allowed roles
 * 
 * Security Features:
 * - Token expiration validation
 * - Role normalization and validation
 * - Automatic redirect on unauthorized access
 * 
 * @module RoleProtectedRoute
 */

// src/routes/RoleProtectedRoute.jsx
import React, { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { useAuthStore } from "@/stores/authStore";
import { session } from "@/utils/session";

/**
 * Decode JWT token to check expiration
 * @param {string} token - JWT token
 * @returns {Object|null} Decoded token payload or null if invalid
 */
const decodeToken = (token) => {
  if (!token) return null;
  try {
    const base64Url = token.split('.')[1];
    if (!base64Url) return null;
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch {
    return null;
  }
};

/**
 * Check if token is expired
 * @param {string} token - JWT token
 * @returns {boolean} True if token is expired or invalid
 */
const isTokenExpired = (token) => {
  if (!token) return true;
  
  // Mock tokens don't expire - they start with "mock-jwt-"
  if (token.startsWith("mock-jwt-")) {
    return false;
  }
  
  const decoded = decodeToken(token);
  if (!decoded || !decoded.exp) return true;
  const now = Date.now() / 1000;
  return decoded.exp < now;
};

export default function RoleProtectedRoute({ 
  allowedRoles, 
  fallback = "/", 
  children 
}) {
  const { user, loading, logout } = useAuthStore();
  const [tokenValid, setTokenValid] = useState(true);

  // Validate token expiration on mount and periodically
  useEffect(() => {
    if (!loading && user) {
        const checkToken = () => {
        const token = session.getToken();
        if (token && isTokenExpired(token)) {
          if (import.meta.env.DEV) {
            console.warn("[RoleProtectedRoute] Token expired, logging out");
          }
          setTokenValid(false);
          logout();
        } else {
          setTokenValid(true);
        }
      };
      
      // Check immediately
      checkToken();
      
      // Check periodically (every 60 seconds)
      const interval = setInterval(checkToken, 60000);
      
      return () => clearInterval(interval);
    }
  }, [loading, user]); // Removed logout from dependencies to avoid re-renders

  // Still checking session
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="w-12 h-12 border-4 border-[#0b6e4f] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // Token expired or invalid → logout and redirect
  if (!tokenValid) {
    return <Navigate to="/login?session=expired" replace />;
  }

  // Not logged in → go to login
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Normalize roles
  const userRole = String(user.role || "").toLowerCase().trim();
  const allowedList = Array.isArray(allowedRoles)
    ? allowedRoles.map(r => String(r).toLowerCase().trim())
    : [String(allowedRoles).toLowerCase().trim()];

  // Role not allowed → redirect
  if (!allowedList.includes(userRole)) {
    if (import.meta.env.DEV) {
      console.warn(`[RoleProtectedRoute] Access denied: User role "${userRole}" not in allowed roles:`, allowedList);
    }
    return <Navigate to={fallback} replace />;
  }

  // All good → render children
  return <>{children}</>;
}