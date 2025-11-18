import React from "react";
import { Navigate } from "react-router-dom";

/**
 * PermissionGuard
 * - Blocks access to routes the admin isn't permitted to use.
 *
 * @param {string|string[]} required - single permission or list of required permissions
 * @param {object} user - authenticated user object
 * @param {ReactNode} children - protected page component
 */
export default function PermissionGuard({ required, user, children }) {
  if (!user) return <Navigate to="/auth/login" replace />;

  const permissions = user?.permissions || {};

  // Allow arrays or single values
  const requiredArray = Array.isArray(required) ? required : [required];

  const hasAccess = requiredArray.every((perm) => permissions[perm] === true);

  if (!hasAccess) return <Navigate to="/unauthorized" replace />;

  return <>{children}</>;
}
