// // src/context/AuthProvider.jsx
// import { useState, useEffect, useCallback } from "react";
// import { useNavigate } from "react-router-dom";
// import { getUserProfile, loginUser } from "@/services/authService";
// import { AuthContext } from "./AuthContext";

// export const AuthProvider = ({ children }) => {
//   const navigate = useNavigate();
//   const [user, setUser] = useState(null);
//   const [loading, setLoading] = useState(true);

//   /** ROLE PERMISSIONS */
//   const assignPermissions = useCallback((role, serverPermissions = {}) => {
//     switch (role) {
//       case "super-admin":
//         return {
//           canViewInsights: true,
//           canApproveUsers: true,
//           canApproveProperties: true,
//           canManageMaintenance: true,
//           canViewReports: true,
//         };

//       case "admin":
//         return {
//           canViewInsights: true,
//           canApproveUsers: true,
//           canApproveProperties: true,
//           canManageMaintenance: false,
//           canViewReports: true,
//           ...serverPermissions,
//         };

//       default:
//         return {};
//     }
//   }, []);

//   const enrichUser = useCallback(
//     (rawUser) => {
//       if (!rawUser) return null;

//       const role = (rawUser.role || "").toLowerCase().trim();
//       return {
//         ...rawUser,
//         role,
//         permissions: assignPermissions(role, rawUser.permissions),
//       };
//     },
//     [assignPermissions]
//   );

//   /** SESSION RESTORE */
//   useEffect(() => {
//     const loadUser = async () => {
//       const token = localStorage.getItem("token");

//       if (!token) {
//         setLoading(false);
//         return;
//       }

//       try {
//         const profileUser = await getUserProfile();

//         if (!profileUser) {
//           localStorage.clear();
//           setUser(null);
//           return;
//         }

//         const enriched = enrichUser(profileUser);
//         setUser(enriched);

//         localStorage.setItem("user", JSON.stringify(enriched));
//         localStorage.setItem("userRole", enriched.role);
//       } catch {
//         localStorage.clear();
//         setUser(null);
//       } finally {
//         setLoading(false);
//       }
//     };

//     loadUser();
//   }, [enrichUser]);

//   /** LOGIN */
//   const handleLogin = async (credentials) => {
//     const data = await loginUser(credentials);

//     // Save token
//     localStorage.setItem("token", data.token);

//     // Prepare user
//     const enriched = enrichUser(data.user);
//     setUser(enriched);

//     localStorage.setItem("userRole", enriched.role);
//     localStorage.setItem("user", JSON.stringify(enriched));

//     const redirectMap = {
//       tenant: "/dashboard/tenant",
//       landlord: "/dashboard/landlord",
//       artisan: "/dashboard/artisan",
//       admin: "/admin/dashboard",
//       "super-admin": "/dashboard/super-admin",
//     };

//     navigate(redirectMap[enriched.role] || "/", { replace: true });
//   };

//   /** LOGOUT */
//   const logout = () => {
//     localStorage.clear();
//     setUser(null);
//     navigate("/login", { replace: true });
//   };

//   return (
//     <AuthContext.Provider value={{ user, loading, handleLogin, logout }}>
//       {children}
//     </AuthContext.Provider>
//   );
// };
import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { getUserProfile, loginUser } from "@/services/authService";
import { AuthContext } from "./AuthContext";

export const AuthProvider = ({ children }) => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const enrichUser = useCallback((rawUser) => {
    if (!rawUser) return null;
    const role = (rawUser.role || "").toLowerCase().trim();
    return { ...rawUser, role };
  }, []);

  // Restore session
  useEffect(() => {
    const loadUser = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const response = await getUserProfile();
        const profileUser = response?.user;
        if (!profileUser) {
          localStorage.clear();
          setUser(null);
        } else {
          const enriched = enrichUser(profileUser);
          setUser(enriched);
          localStorage.setItem("userRole", enriched.role);
          localStorage.setItem("user", JSON.stringify(enriched));
        }
      } catch {
        localStorage.clear();
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, [enrichUser]);

  const handleLogin = async (credentials) => {
    const data = await loginUser(credentials);
    localStorage.setItem("token", data.token);

    const enriched = enrichUser(data.user);
    setUser(enriched);
    localStorage.setItem("userRole", enriched.role);
    localStorage.setItem("user", JSON.stringify(enriched));

    const redirectMap = {
      tenant: "/dashboard/tenant",
      landlord: "/dashboard/landlord",
      artisan: "/dashboard/artisan",
      admin: "/admin/dashboard",
      "super-admin": "/dashboard/super-admin",
    };
    navigate(redirectMap[enriched.role] || "/", { replace: true });
  };

  const logout = () => {
    localStorage.clear();
    setUser(null);
    navigate("/login", { replace: true });
  };

  return (
    <AuthContext.Provider value={{ user, setUser, loading, handleLogin, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
