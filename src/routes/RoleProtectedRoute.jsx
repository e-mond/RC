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



// src/routes/RoleProtectedRoute.jsx
import React from "react";
import { Navigate } from "react-router-dom";
import { useAuthStore } from "@/stores/authStore"; 

export default function RoleProtectedRoute({ 
  allowedRoles, 
  fallback = "/", 
  children 
}) {
  const { user, loading } = useAuthStore();   // From Zustand

  // Still checking session
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="w-12 h-12 border-4 border-[#0b6e4f] border-t-transparent rounded-full animate-spin" />
      </div>
    );
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
    return <Navigate to={fallback} replace />;
  }

  // All good → render children
  return <>{children}</>;
}