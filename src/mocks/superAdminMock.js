// src/mocks/superAdminMock.js
/**
 * Core mock data for Super Admin & Admin features.
 * - In-memory data store for development when backend is unavailable
 * - Realistic Ghanaian names, locations, and values
 * - Designed to persist during Vite dev server session
 */

import { genId, nowISO } from "./_utils";

const now = () => nowISO();

// ===================================================================
// SYSTEM-WIDE STATISTICS (Dashboard Overview)
// ===================================================================
export const mockSystemStats = {
  totalUsers: 1289,
  activeTenants: 878,
  activeLandlords: 336,
  artisans: 72,
  admins: 3,
  superAdmins: 2,

  activeProperties: 912,
  pendingProperties: 4,
  pendingUsers: 3,

  pendingMaintenanceRequests: 9,
  revenueThisMonth: 178900, // GHS
  revenueLast30Days: 178900,

  systemHealth: {
    cpu: 62, // %
    memory: 71, // %
    apiLatency: 92, // ms
    uptime: "99.97%",
  },

  // For role distribution pie/donut chart
  roleDistribution: {
    tenant: 878,
    landlord: 336,
    artisan: 72,
    admin: 3,
    "super-admin": 2,
  },

  lastUpdated: now(),
};

// ===================================================================
// FULL USER LIST (SA_UserTable / All Users endpoint)
// ===================================================================
export const mockUsers = [
  {
    id: genId("u"),
    fullName: "Kwame Asare",
    email: "kwame.asare@example.gh",
    role: "landlord",
    status: "active",
    phone: "+233 24 123 4567",
    createdAt: "2024-02-10T08:30:00Z",
    lastLogin: now(),
  },
  {
    id: genId("u"),
    fullName: "Adwoa Mensah",
    email: "adwoa.mensah@example.gh",
    role: "tenant",
    status: "active",
    phone: "+233 55 987 6543",
    createdAt: "2024-06-22T14:20:00Z",
    lastLogin: now(),
  },
  {
    id: genId("u"),
    fullName: "Ebo Plumbing",
    email: "ebo.plumb@example.gh",
    role: "artisan",
    status: "pending",
    phone: "+233 20 555 1122",
    createdAt: "2025-11-18T10:15:00Z",
  },
  {
    id: genId("u"),
    fullName: "Nana Yaa Admin",
    email: "nana.admin@system.com",
    role: "admin",
    status: "active",
    phone: "+233 50 000 9999",
    createdAt: "2023-08-01T09:00:00Z",
  },
  {
    id: genId("u"),
    fullName: "Super Emma Osei",
    email: "emma.super@system.com",
    role: "super-admin",
    status: "active",
    phone: "+233 54 111 2233",
    createdAt: "2023-01-01T00:00:00Z",
  },
  {
    id: genId("u"),
    fullName: "Yaw Boateng",
    email: "yaw.boateng@example.gh",
    role: "landlord",
    status: "inactive",
    phone: "+233 26 444 5566",
    createdAt: "2024-09-05T12:00:00Z",
  },
];

// ===================================================================
// PENDING USER APPROVALS
// ===================================================================
export const pendingUsers = [
  {
    id: genId("pu"),
    fullName: "Akosua Frimpong",
    email: "akosua.f@example.gh",
    role: "artisan",
    phone: "+233 27 888 7766",
    submittedAt: "2025-11-19T09:45:00Z",
    note: "Submitted National ID and trade certificate",
    documents: ["id_front.jpg", "certificate.pdf"],
  },
  {
    id: genId("pu"),
    fullName: "Kofi Owusu",
    email: "kofi.owusu@example.gh",
    role: "landlord",
    phone: "+233 54 222 3344",
    submittedAt: "2025-11-18T16:20:00Z",
    note: "Awaiting verification of property ownership documents",
    documents: ["deed.pdf", "utility_bill.jpg"],
  },
];

// ===================================================================
// PENDING PROPERTY APPROVALS
// ===================================================================
export const pendingProperties = [
  {
    id: genId("pp"),
    title: "3-Bedroom Executive House - East Legon",
    ownerName: "Kwame Asare",
    ownerId: mockUsers[0].id,
    address: "Trassaco Valley, East Legon, Accra",
    price: 4500, // GHS per month
    images: [], // would be URLs in real app
    submittedAt: "2025-11-19T11:30:00Z",
    status: "pending",
  },
  {
    id: genId("pp"),
    title: "Modern Studio Apartment - Osu",
    ownerName: "Abena Serwaa",
    ownerId: genId("u"),
    address: "Oxford Street, Osu, Accra",
    price: 1800,
    images: [],
    submittedAt: "2025-11-18T19:10:00Z",
    status: "pending",
  },
];

// ===================================================================
// PENDING MAINTENANCE / REPAIR REQUESTS
// ===================================================================
export const pendingMaintenance = [
  {
    id: genId("m"),
    propertyId: pendingProperties[0].id,
    propertyTitle: pendingProperties[0].title,
    tenantName: "Adwoa Mensah",
    tenantId: mockUsers[1].id,
    summary: "Air conditioner not cooling",
    details: "AC in master bedroom blows air but not cold. Started 2 days ago.",
    priority: "high",
    createdAt: "2025-11-19T08:15:00Z",
    status: "pending",
  },
  {
    id: genId("m"),
    propertyId: genId("prop"),
    propertyTitle: "2BR Apartment - Airport Residential",
    tenantName: "Efua Sackey",
    tenantId: genId("u"),
    summary: "Leaking pipe under kitchen sink",
    details: "Small leak has become worse after last night.",
    priority: "urgent",
    createdAt: "2025-11-19T06:40:00Z",
    status: "pending",
  },
];

// ===================================================================
// AUDIT LOGS
// ===================================================================
export const mockAuditLogs = [
  {
    id: genId("a"),
    actor: "emma.super@system.com",
    actorName: "Super Emma Osei",
    action: "approved_user",
    target: "akosua.f@example.gh",
    detail: "Approved artisan registration",
    level: "info",
    createdAt: "2025-11-19T10:05:00Z",
  },
  {
    id: genId("a"),
    actor: "system",
    action: "auto_reject_property",
    target: "Duplicate listing - Labone",
    detail: "Property already exists in system",
    level: "warn",
    createdAt: "2025-11-19T03:22:00Z",
  },
  {
    id: genId("a"),
    actor: "nana.admin@system.com",
    action: "banned_user",
    target: "spamuser123@example.com",
    detail: "Repeated fraudulent listings",
    level: "error",
    createdAt: "2025-11-18T14:50:00Z",
  },
];

// ===================================================================
// RECENT ACTIVITY FEED
// ===================================================================
export const recentActivity = [
  {
    id: genId("act"),
    user: "adwoa.mensah@example.gh",
    userName: "Adwoa Mensah",
    action: "Submitted maintenance request",
    target: "AC not cooling",
    time: "2 min ago",
    timestamp: Date.now() - 2 * 60 * 1000,
  },
  {
    id: genId("act"),
    user: "kwame.asare@example.gh",
    userName: "Kwame Asare",
    action: "Listed new property",
    target: "3-Bedroom House - East Legon",
    time: "8 min ago",
    timestamp: Date.now() - 8 * 60 * 1000,
  },
  {
    id: genId("act"),
    user: "emma.super@system.com",
    userName: "Super Emma Osei",
    action: "Approved artisan",
    target: "Akosua Frimpong",
    time: "15 min ago",
    timestamp: Date.now() - 15 * 60 * 1000,
  },
];

// ===================================================================
// REPORTS / FLAGS
// ===================================================================
export const mockReports = [
  {
    id: genId("r"),
    type: "fraud",
    reporter: "tenant123",
    summary: "Landlord asking for payment outside platform",
    status: "open",
    createdAt: "2025-11-19T07:30:00Z",
  },
  {
    id: genId("r"),
    type: "dispute",
    reporter: "landlord456",
    summary: "Tenant refusing to vacate after notice",
    status: "under_review",
    createdAt: "2025-11-18T22:10:00Z",
  },
];

// ===================================================================
// UTILITY: Simulated API delay
// ===================================================================
export const withDelay = (data, delay = 600) =>
  new Promise((resolve) => setTimeout(() => resolve({ data }), delay));

// ===================================================================
// DEFAULT EXPORT
// ===================================================================
export default {
  mockSystemStats,
  mockUsers,
  pendingUsers,
  pendingProperties,
  pendingMaintenance,
  mockAuditLogs,
  recentActivity,
  mockReports,
  withDelay,
};