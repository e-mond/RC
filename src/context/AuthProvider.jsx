// // // src/context/AuthProvider.jsx
// // import { useState, useEffect, useCallback } from "react";
// // import { useNavigate } from "react-router-dom";
// // import { getUserProfile, loginUser } from "@/services/authService";
// // import { AuthContext } from "./AuthContext";

// // export const AuthProvider = ({ children }) => {
// //   const navigate = useNavigate();
// //   const [user, setUser] = useState(null);
// //   const [loading, setLoading] = useState(true);

// //   /** ROLE PERMISSIONS */
// //   const assignPermissions = useCallback((role, serverPermissions = {}) => {
// //     switch (role) {
// //       case "super-admin":
// //         return {
// //           canViewInsights: true,
// //           canApproveUsers: true,
// //           canApproveProperties: true,
// //           canManageMaintenance: true,
// //           canViewReports: true,
// //         };

// //       case "admin":
// //         return {
// //           canViewInsights: true,
// //           canApproveUsers: true,
// //           canApproveProperties: true,
// //           canManageMaintenance: false,
// //           canViewReports: true,
// //           ...serverPermissions,
// //         };

// //       default:
// //         return {};
// //     }
// //   }, []);

// //   const enrichUser = useCallback(
// //     (rawUser) => {
// //       if (!rawUser) return null;

// //       const role = (rawUser.role || "").toLowerCase().trim();
// //       return {
// //         ...rawUser,
// //         role,
// //         permissions: assignPermissions(role, rawUser.permissions),
// //       };
// //     },
// //     [assignPermissions]
// //   );

// //   /** SESSION RESTORE */
// //   useEffect(() => {
// //     const loadUser = async () => {
// //       const token = localStorage.getItem("token");

// //       if (!token) {
// //         setLoading(false);
// //         return;
// //       }

// //       try {
// //         const profileUser = await getUserProfile();

// //         if (!profileUser) {
// //           localStorage.clear();
// //           setUser(null);
// //           return;
// //         }

// //         const enriched = enrichUser(profileUser);
// //         setUser(enriched);

// //         localStorage.setItem("user", JSON.stringify(enriched));
// //         localStorage.setItem("userRole", enriched.role);
// //       } catch {
// //         localStorage.clear();
// //         setUser(null);
// //       } finally {
// //         setLoading(false);
// //       }
// //     };

// //     loadUser();
// //   }, [enrichUser]);

// //   /** LOGIN */
// //   const handleLogin = async (credentials) => {
// //     const data = await loginUser(credentials);

// //     // Save token
// //     localStorage.setItem("token", data.token);

// //     // Prepare user
// //     const enriched = enrichUser(data.user);
// //     setUser(enriched);

// //     localStorage.setItem("userRole", enriched.role);
// //     localStorage.setItem("user", JSON.stringify(enriched));

// //     const redirectMap = {
// //       tenant: "/dashboard/tenant",
// //       landlord: "/dashboard/landlord",
// //       artisan: "/dashboard/artisan",
// //       admin: "/admin/dashboard",
// //       "super-admin": "/dashboard/super-admin",
// //     };

// //     navigate(redirectMap[enriched.role] || "/", { replace: true });
// //   };

// //   /** LOGOUT */
// //   const logout = () => {
// //     localStorage.clear();
// //     setUser(null);
// //     navigate("/login", { replace: true });
// //   };

// //   return (
// //     <AuthContext.Provider value={{ user, loading, handleLogin, logout }}>
// //       {children}
// //     </AuthContext.Provider>
// //   );
// // };

// // src/context/AuthProvider.jsx
// import { useState, useEffect, useCallback } from "react";
// import { useNavigate } from "react-router-dom";
// import { getUserProfile, loginUser } from "@/services/authService";
// import { AuthContext } from "./AuthContext";
// import { isMockMode } from "@/mocks/mockManager";

// /* -----------------------------------------------------------
//    Normalize user object
// ----------------------------------------------------------- */
// const normalizeUser = (raw) => {
//   if (!raw) return null;

//   const normalized = {
//     id: raw.id || raw._id || "",
//     name: raw.name || raw.fullName || raw.username || "",
//     email: raw.email || "",
//     role: (raw.role || "").toLowerCase().trim(),

//     // -------------------------------------------------------
//     // Permissions (super important)
//     // If backend provides perms, use them.
//     // If not, fallback to defaults.
//     // -------------------------------------------------------
//     permissions: {
//       canViewInsights: raw.permissions?.canViewInsights ?? false,
//       canApproveUsers: raw.permissions?.canApproveUsers ?? false,
//       canApproveProperties: raw.permissions?.canApproveProperties ?? false,
//       canManageMaintenance: raw.permissions?.canManageMaintenance ?? false,
//       canViewReports: raw.permissions?.canViewReports ?? false,
//     },
//   };

//   // Auto-grant full permissions for admin and super-admin
//   if (normalized.role === "admin" || normalized.role === "super-admin") {
//     normalized.permissions = {
//       canViewInsights: true,
//       canApproveUsers: true,
//       canApproveProperties: true,
//       canManageMaintenance: true,
//       canViewReports: true,
//     };
//   }

//   return normalized;
// };

// /* -----------------------------------------------------------
//    Redirects for each role
// ----------------------------------------------------------- */
// const REDIRECTS = {
//   tenant: "/dashboard/tenant",
//   landlord: "/dashboard/landlord",
//   artisan: "/dashboard/artisan",
//   admin: "/admin/dashboard",
//   "super-admin": "/dashboard/super-admin",
// };

// export const AuthProvider = ({ children }) => {
//   const navigate = useNavigate();
//   const [user, setUser] = useState(null);
//   const [loading, setLoading] = useState(true);

//   /* -----------------------------------------------------------
//      Restore session from localStorage
//   ----------------------------------------------------------- */
//   const restoreSession = useCallback(async () => {
//     let token = localStorage.getItem("token");

//     // In dev + mock mode, auto-generate token
//     if (import.meta.env.DEV && isMockMode() && !token) {
//       token = "dev-jwt-demo";
//       localStorage.setItem("token", token);
//     }

//     if (!token) {
//       setLoading(false);
//       return;
//     }

//     try {
//       const profile = await getUserProfile();
//       const normalized = normalizeUser(profile);

//       setUser(normalized);
//       localStorage.setItem("user", JSON.stringify(normalized));
//       localStorage.setItem("userRole", normalized.role);
//     } catch (err) {
//       console.error("Auth restore failed:", err);

//       if (!isMockMode()) {
//         localStorage.removeItem("token");
//         localStorage.removeItem("user");
//         localStorage.removeItem("userRole");
//       }

//       setUser(null);
//     } finally {
//       setLoading(false);
//     }
//   }, []);

//   useEffect(() => {
//     restoreSession();
//   }, [restoreSession]);

//   /* -----------------------------------------------------------
//      Login handler
//   ----------------------------------------------------------- */
//   const handleLogin = async (credentials) => {
//     const data = await loginUser(credentials);

//     const token = data.token || data.access_token;
//     const normalized = normalizeUser(data.user || data);

//     localStorage.setItem("token", token);
//     localStorage.setItem("user", JSON.stringify(normalized));
//     localStorage.setItem("userRole", normalized.role);

//     setUser(normalized);
//     navigate(REDIRECTS[normalized.role] || "/", { replace: true });
//   };

//   /* -----------------------------------------------------------
//      Logout handler
//   ----------------------------------------------------------- */
//   const logout = () => {
//     localStorage.removeItem("token");
//     localStorage.removeItem("user");
//     localStorage.setItem("userRole", ""); // keep empty for dev role switcher
//     setUser(null);

//     navigate("/login", { replace: true });
//   };

//   return (
//     <AuthContext.Provider
//       value={{
//         user,
//         setUser,
//         loading,
//         handleLogin,
//         logout,
//       }}
//     >
//       {children}
//     </AuthContext.Provider>
//   );
// };
