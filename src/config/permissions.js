export const ROLE_PERMISSIONS = {
  "super-admin": {
    canCreateAdmins: true,
    canDeleteAdmins: true,
    canRevokeAdminAccess: true,
    canApproveListings: true,
    canApproveUsers: true,
  },

  admin: {
    canCreateAdmins: false,
    canDeleteAdmins: false,
    canRevokeAdminAccess: false,
    canApproveListings: true,
    canApproveUsers: true,
  },
};
