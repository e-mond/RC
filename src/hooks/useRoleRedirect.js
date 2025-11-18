import { useCallback } from "react";
import { useNavigate } from "react-router-dom";

const redirectMap = {
  tenant: "/dashboard/tenant",
  landlord: "/dashboard/landlord",
  artisan: "/dashboard/artisan",
  admin: "/admin/dashboard",
  "super-admin": "/dashboard/super-admin", 
};

export default function useRoleRedirect() {
  const navigate = useNavigate();

  return useCallback(
    (role) => {
      const normalizedRole = (role || "")
        .toString()
        .toLowerCase()
        .trim();

      const path = redirectMap[normalizedRole] || "/";

      navigate(path, { replace: true });
    },
    [navigate]
  );
}