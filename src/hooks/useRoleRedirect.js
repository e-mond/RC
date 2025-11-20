import { useCallback } from "react";
import { useNavigate } from "react-router-dom";

const redirectMap = {
  tenant: "/tenant/overview",
  landlord: "/landlord/overview",
  artisan: "/artisan/overview",
  admin: "/admin/overview",
  "super-admin": "/super-admin/overview",
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