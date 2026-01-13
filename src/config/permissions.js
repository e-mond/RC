export const ROLE_PERMISSIONS = {
  "super-admin": {
    canCreateAdmins: true,
    canDeleteAdmins: true,
    canRevokeAdminAccess: true,
    canApproveListings: true,
    canApproveUsers: true,
    // Lease Management Permissions
    canViewAllLeases: true,
    canCreateLeaseTemplates: true,
    canEditLeaseTemplates: true,
    canDeactivateLeaseTemplates: true,
    canAssignLeasesToProperties: true,
    canAssignLeasesToUsers: true,
    canDeleteLeaseTemplates: true,
    // Document Management Permissions
    canViewAllDocuments: true,
    canCreateDocuments: true,
    canEditDocuments: true,
    canDeleteDocuments: true,
  },

  admin: {
    canCreateAdmins: false,
    canDeleteAdmins: false,
    canRevokeAdminAccess: false,
    canApproveListings: true,
    canApproveUsers: true,
    // Lease Management Permissions (can be controlled by Super Admin)
    canViewAllLeases: true,
    canCreateLeaseTemplates: true,
    canEditLeaseTemplates: true,
    canDeactivateLeaseTemplates: true,
    canAssignLeasesToProperties: true,
    canAssignLeasesToUsers: true,
    canDeleteLeaseTemplates: false, // Only Super Admin can delete
    // Document Management Permissions (can be controlled by Super Admin)
    canViewAllDocuments: true,
    canCreateDocuments: true,
    canEditDocuments: true,
    canDeleteDocuments: false, // Only Super Admin can delete
  },
};
