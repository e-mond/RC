// src/mocks/axiosMock.js
/**
 * Complete Axios Mock Adapter for the entire app
 * - Handles Auth + ALL Super Admin / Admin endpoints
 * - Mutates shared mock data from superAdminMock.js → feels like a real backend
 * - Easy toggle: just call enableMock() in main.js during development
 */

import apiClient from "@/services/apiClient.js";
import MockAdapter from "axios-mock-adapter";
import {
  mockSystemStats,
  mockUsers,
  mockAuditLogs,
  pendingUsers,
  pendingProperties,
  pendingMaintenance,
  mockReports,
  recentActivity,
} from "./superAdminMock";
import { genId, nowISO } from "./_utils";

let mock = null;

const DELAY = 500; // ms – feels snappy but realistic

// Helper
const findById = (arr, id) => arr.find((item) => item.id === id);
const findIndexById = (arr, id) => arr.findIndex((item) => item.id === id);

export const enableMock = () => {
  if (mock) return;

  mock = new MockAdapter(apiClient, { delayResponse: DELAY });

  console.log("%c 🚀 MOCK ADAPTER ENABLED – intercepting all API calls", "color: #34d399; font-weight: bold");

  // ================================================================
  // AUTH ENDPOINTS
  // ================================================================
  mock.onPost("/auth/login").reply((config) => {
    const { email } = JSON.parse(config.data);

    const demoAccounts = {
      "tenant@demo.com": { role: "tenant", name: "Adwoa Mensah" },
      "landlord@demo.com": { role: "landlord", name: "Kwame Asare" },
      "artisan@demo.com": { role: "artisan", name: "Ebo Plumbing" },
      "admin@demo.com": { role: "admin", name: "Nana Yaa Admin" },
      "super@demo.com": { role: "super-admin", name: "Super Emma Osei" },
    };

    const account = demoAccounts[email];
    if (!account) {
      return [400, { message: "Invalid credentials" }];
    }

    localStorage.setItem("userRole", account.role);

    return [
      200,
      {
        token: `mock-jwt-${Date.now()}`,
        user: {
          id: genId("u"),
          email,
          role: account.role,
          name: account.name,
        },
      },
    ];
  });

  mock.onGet("/auth/profile").reply(() => {
    const role = localStorage.getItem("userRole") || "tenant";
    const profileMap = {
      tenant: mockUsers.find((u) => u.role === "tenant"),
      landlord: mockUsers.find((u) => u.role === "landlord"),
      artisan: mockUsers.find((u) => u.role === "artisan"),
      admin: mockUsers.find((u) => u.role === "admin"),
      "super-admin": mockUsers.find((u) => u.role === "super-admin"),
    };

    const user = profileMap[role] || mockUsers[0];

    return [200, { user }];
  });

  // ================================================================
  // SUPER ADMIN & ADMIN ENDPOINTS
  // ================================================================

  // Dashboard stats
  mock.onGet("/super-admin/stats").reply(() => [200, { data: mockSystemStats }]);

  // All users table
  mock.onGet("/super-admin/users").reply(() => [200, { users: mockUsers }]);

  // Recent activity
  mock.onGet("/super-admin/activity").reply(() => [200, { activity: recentActivity }]);

  // Audit logs
  mock.onGet("/super-admin/audit-logs").reply(() => [200, { logs: mockAuditLogs }]);

  // Pending users
  mock.onGet("/admin/pending-users").reply(() => [200, { users: pendingUsers }]);

  mock.onPost(/\/admin\/users\/(.+)\/approve/).reply((config) => {
    const userId = config.url.split("/").slice(-2)[0];
    const idx = findIndexById(pendingUsers, userId);
    if (idx === -1) return [404, { message: "User not found" }];

    const user = pendingUsers.splice(idx, 1)[0];
    const approvedUser = {
      id: genId("u"),
      fullName: user.fullName,
      email: user.email,
      role: user.role,
      phone: user.phone,
      status: "active",
      createdAt: nowISO(),
    };
    mockUsers.push(approvedUser);

    mockAuditLogs.push({
      id: genId("a"),
      actor: "admin",
      action: "approve_user",
      target: userId,
      detail: `Approved ${user.email}`,
      createdAt: nowISO(),
    });

    return [200, { success: true, user: approvedUser }];
  });

  mock.onPost(/\/admin\/users\/(.+)\/reject/).reply((config) => {
    const userId = config.url.split("/").slice(-2)[0];
    const idx = findIndexById(pendingUsers, userId);
    if (idx === -1) return [404, { message: "Not found" }];

    pendingUsers.splice(idx, 1);
    mockAuditLogs.push({
      id: genId("a"),
      actor: "admin",
      action: "reject_user",
      target: userId,
      detail: "Rejected pending user",
      createdAt: nowISO(),
    });

    return [200, { success: true }];
  });

  // Pending properties
  mock.onGet("/admin/pending-properties").reply(() => [200, { properties: pendingProperties }]);

  mock.onPost(/\/admin\/properties\/(.+)\/approve/).reply((config) => {
    const propId = config.url.split("/").slice(-2)[0];
    const prop = findById(pendingProperties, propId);
    if (!prop) return [404, { message: "Property not found" }];

    prop.status = "approved";
    pendingProperties.splice(findIndexById(pendingProperties, propId), 1);

    mockAuditLogs.push({
      id: genId("a"),
      actor: "admin",
      action: "approve_property",
      target: propId,
      detail: `Approved "${prop.title}"`,
      createdAt: nowISO(),
    });

    return [200, { success: true, property: prop }];
  });

  // Maintenance requests
  mock.onGet("/admin/maintenance").reply(() => [200, { requests: pendingMaintenance }]);

  // Reports / Flags
  mock.onGet("/admin/reports").reply(() => [200, { reports: mockReports }]);

  // Create new admin/user (super-admin only)
  mock.onPost("/super-admin/users").reply((config) => {
    const payload = JSON.parse(config.data);
    const newUser = {
      id: genId("u"),
      ...payload,
      createdAt: nowISO(),
      status: payload.status || "active",
    };
    mockUsers.push(newUser);

    mockAuditLogs.push({
      id: genId("a"),
      actor: "super-admin",
      action: "create_user",
      target: newUser.id,
      detail: `Created ${newUser.email}`,
      createdAt: nowISO(),
    });

    return [201, { success: true, user: newUser }];
  });

  // Delete user (super-admin)
  mock.onDelete(/\/super-admin\/users\/(.+)/).reply((config) => {
    const userId = config.url.split("/").pop();
    const idx = findIndexById(mockUsers, userId);
    if (idx === -1) return [404, { message: "User not found" }];

    const removed = mockUsers.splice(idx, 1)[0];
    mockAuditLogs.push({
      id: genId("a"),
      actor: "super-admin",
      action: "delete_user",
      target: userId,
      detail: `Deleted ${removed.email}`,
      createdAt: nowISO(),
    });

    return [200, { success: true }];
  });
};

export const disableMock = () => {
  if (!mock) return;
  mock.restore();
  mock = null;
  console.log("%c ❌ MOCK ADAPTER DISABLED – using real backend", "color: #f87171; font-weight: bold");
};

export const isMockEnabled = () => !!mock;

export default { enableMock, disableMock, isMockEnabled };