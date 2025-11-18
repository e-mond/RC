
/**
 * MOCK DATA FOR SUPER ADMIN DASHBOARD
 * - Used in development when API is not available
 * - Simulates real backend responses
 * - Consistent schema across all components
 * - Realistic values for demo/testing
 */

/**
 * SYSTEM-WIDE STATISTICS
 * Used by: SA_StatsOverview, SA_SystemHealth, SA_RoleDistributionChart
 */
export const mockSystemStats = {
  // User counts
  totalUsers: 1247,
  activeTenants: 842,
  activeLandlords: 312,
  artisans: 78,
  admins: 12,
  superAdmins: 3,

  // Property & request stats
  activeProperties: 892,
  pendingRequests: 34,

  // Financial
  revenueThisMonth: 125000, // GHS

  // System health metrics
  systemHealth: {
    cpu: 68, // %
    memory: 74, // %
    apiLatency: 89, // ms
    uptime: "99.98%", // string
  },

  // Role distribution for chart
  roles: {
    tenant: 842,
    landlord: 312,
    artisan: 78,
    admin: 12,
    "super-admin": 3,
  },



  // Recent activity feed
  recentActivity: [
    {
      id: "act1",
      user: "john@landlord.com",
      userName: "John Landlord",
      action: "Created property",
      target: "Sunny Hills Apartment",
      time: "2 min ago",
      timestamp: Date.now() - 2 * 60 * 1000,
    },
    {
      id: "act2",
      user: "mike@artisan.com",
      userName: "Mike Artisan",
      action: "Completed task",
      target: "Plumbing Repair #124",
      time: "5 min ago",
      timestamp: Date.now() - 5 * 60 * 1000,
    },
    {
      id: "act3",
      user: "admin@system.com",
      userName: "Alex Admin",
      action: "Approved user",
      target: "Sarah Tenant",
      time: "12 min ago",
      timestamp: Date.now() - 12 * 60 * 1000,
    },
    {
      id: "act4",
      user: "sarah@tenant.com",
      userName: "Sarah Tenant",
      action: "Submitted payment",
      target: "GHS 850 rent",
      time: "18 min ago",
      timestamp: Date.now() - 18 * 60 * 1000,
    },
  ],
};


export const mockAuditLogs = [
  {
    id: "log1",
    user: "john@landlord.com",
    action: "Created property",
    target: "Apartment #12",
    timestamp: Date.now() - 2 * 60 * 1000,
    level: "info",
  },
  {
    id: "log2",
    user: "admin@system.com",
    action: "Deleted user",
    target: "user123",
    timestamp: Date.now() - 10 * 60 * 1000,
    level: "warn",
  },
  {
    id: "log3",
    user: "mike@artisan.com",
    action: "Failed login",
    target: "3 attempts",
    timestamp: Date.now() - 30 * 60 * 1000,
    level: "error",
  },
];
/**
 * FULL USER LIST
 * Used by: SA_UserTable
 * Schema: _id, fullName, email, role, status, joined
 */
export const mockUsers = [
  {
    _id: "u1",
    fullName: "John Landlord",
    email: "john@landlord.com",
    role: "landlord",
    status: "active",
    joined: "2024-01-15",
    avatar: null,
  },
  {
    _id: "u2",
    fullName: "Sarah Tenant",
    email: "sarah@tenant.com",
    role: "tenant",
    status: "active",
    joined: "2024-03-22",
    avatar: null,
  },
  {
    _id: "u3",
    fullName: "Mike Artisan",
    email: "mike@artisan.com",
    role: "artisan",
    status: "pending",
    joined: "2025-11-01",
    avatar: null,
  },
  {
    _id: "u4",
    fullName: "Alex Admin",
    email: "alex@admin.com",
    role: "admin",
    status: "active",
    joined: "2023-06-10",
    avatar: null,
  },
  {
    _id: "u5",
    fullName: "Emma Super",
    email: "emma@super.com",
    role: "super-admin",
    status: "active",
    joined: "2023-01-01",
    avatar: null,
  },
  {
    _id: "u6",
    fullName: "David Brown",
    email: "david@landlord.com",
    role: "landlord",
    status: "inactive",
    joined: "2024-07-19",
    avatar: null,
  },
  {
    _id: "u7",
    fullName: "Lisa Green",
    email: "lisa@tenant.com",
    role: "tenant",
    status: "active",
    joined: "2025-02-28",
    avatar: null,
  },
  {
    _id: "u8",
    fullName: "Paul Fixer",
    email: "paul@artisan.com",
    role: "artisan",
    status: "active",
    joined: "2024-09-05",
    avatar: null,
  },
];

export const withDelay = (data, time = 500) =>
  new Promise((resolve) => setTimeout(() => resolve(data), time));

/**
 * EXPORT FOR EASY MOCK SWITCHING
 */
export default {
  mockSystemStats,
  mockUsers,
  mockAuditLogs,
  withDelay,
};
