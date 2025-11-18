// src/components/layout/Sidebar.jsx
/**
 * Sidebar
 * - Role-based navigation with collapse & mobile support
 * - Dark mode toggle with localStorage + OS preference
 * - Ghana-ready: icons, accessibility, smooth UX
 * - 100% unique keys via path + index + role
 */

import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  Home, Users, Wrench, FileText, Settings, Shield,
  Building2, Hammer, Receipt, AlertCircle,
  Menu, X, ChevronLeft, ChevronRight, Moon, Sun
} from "lucide-react";
import { useAuth } from "@/context/useAuth";

const roleConfig = {
  "super-admin": { color: "bg-purple-600", label: "Super Admin", icon: Shield },
  admin: { color: "bg-red-600", label: "Admin", icon: Settings },
  landlord: { color: "bg-blue-600", label: "Landlord", icon: Building2 },
  artisan: { color: "bg-amber-600", label: "Artisan", icon: Hammer },
  tenant: { color: "bg-green-600", label: "Tenant", icon: Home },
};

export default function Sidebar() {
  const location = useLocation();
  const { user } = useAuth() || {};
  const role = user?.role || localStorage.getItem("userRole") || "guest";
  const config = roleConfig[role] || roleConfig.tenant;

  // States
  const [isOpen, setIsOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [darkMode, setDarkMode] = useState(false);

  // Load theme
  useEffect(() => {
    const saved = localStorage.getItem("theme");
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const isDark = saved === "dark" || (!saved && prefersDark);
    setDarkMode(isDark);
    if (isDark) document.documentElement.classList.add("dark");
  }, []);

  // Apply theme
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [darkMode]);

  const common = [
    { to: "/dashboard", label: "Overview", icon: <Home size={18} /> },
  ];

  const roleMenus = {
    "super-admin": [
      { to: "/dashboard/super-admin/users", label: "Manage Users", icon: <Users size={18} /> },
      { to: "/dashboard/super-admin/roles", label: "Role Delegation", icon: <Settings size={18} /> },
      { to: "/dashboard/super-admin/audit", label: "Audit Logs", icon: <FileText size={18} /> },
    ],
    admin: [
      { to: "/dashboard/admin/approvals", label: "Pending Approvals", icon: <AlertCircle size={18} /> },
      { to: "/dashboard/admin/reports", label: "Reports", icon: <FileText size={18} /> },
    ],
    landlord: [
      { to: "/dashboard/landlord/properties", label: "My Properties", icon: <Building2 size={18} /> },
      { to: "/dashboard/landlord/tenants", label: "Tenants", icon: <Users size={18} /> },
      { to: "/dashboard/landlord/requests", label: "Maintenance", icon: <Wrench size={18} /> },
    ],
    artisan: [
      { to: "/dashboard/artisan/tasks", label: "Assigned Tasks", icon: <Wrench size={18} /> },
      { to: "/dashboard/artisan/earnings", label: "Earnings", icon: <Receipt size={18} /> },
    ],
    tenant: [
      { to: "/dashboard/tenant/rentals", label: "My Rentals", icon: <FileText size={18} /> },
      { to: "/dashboard/tenant/payments", label: "Payments", icon: <Receipt size={18} /> },
      { to: "/dashboard/tenant/maintenance", label: "Maintenance", icon: <Wrench size={18} /> },
    ],
  };

  const items = [...common, ...(roleMenus[role] || [])];
  const isActive = (path) => location.pathname === path || location.pathname.startsWith(path + "/");

  const closeSidebar = () => setIsOpen(false);

  return (
    <>
      {/* Mobile Hamburger */}
      <button
        onClick={() => setIsOpen(true)}
        aria-label="Open navigation menu"
        className="fixed top-4 left-4 z-50 p-2 bg-white dark:bg-gray-800 rounded-lg shadow-md md:hidden"
      >
        <Menu size={24} className="text-gray-700 dark:text-gray-200" />
      </button>

      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={closeSidebar}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed md:static inset-y-0 left-0 z-50 flex flex-col bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700
          transition-all duration-300 ease-in-out
          ${isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
          ${collapsed ? "w-20" : "w-72"}
        `}
        aria-label="Main navigation"
      >
        {/* Header */}
        <div className="relative p-4 border-b border-gray-200 dark:border-gray-700">
          {/* Collapse Button */}
          <button
            onClick={() => setCollapsed(!collapsed)}
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            className="absolute -right-3 top-1/2 -translate-y-1/2 hidden md:block p-1 bg-white dark:bg-gray-800 rounded-full shadow-md hover:scale-110 transition"
          >
            {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
          </button>

          {/* Close Button (Mobile) */}
          <button
            onClick={closeSidebar}
            aria-label="Close navigation menu"
            className="absolute right-4 top-4 p-1.5 rounded hover:bg-gray-100 dark:hover:bg-gray-800 md:hidden"
          >
            <X size={20} className="text-gray-600 dark:text-gray-300" />
          </button>

          <div className={`flex items-center gap-3 ${collapsed ? "justify-center" : ""}`}>
            <div className="w-9 h-9 bg-[#0b6e4f] rounded-lg flex items-center justify-center shrink-0">
              <span className="text-white font-bold text-sm">RC</span>
            </div>

            {!collapsed && (
              <div>
                <h1 className="text-lg font-bold text-gray-900 dark:text-white">Rental Connects</h1>
                <div className="flex items-center gap-1.5 mt-1">
                  <config.icon size={14} className="text-white" />
                  <span
                    className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium text-white ${config.color}`}
                  >
                    {config.label}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto" role="navigation" aria-label="Main menu">
          {items.map((item, index) => {
            const active = isActive(item.to);
            const uniqueKey = `${role}-${item.to}-${index}`; // ← 100% UNIQUE

            return (
              <Link
                key={uniqueKey}
                to={item.to}
                onClick={closeSidebar}
                className={`
                  group flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all
                  ${active
                    ? "bg-[#0b6e4f] text-white shadow-sm"
                    : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                  }
                `}
                aria-current={active ? "page" : undefined}
                title={collapsed ? item.label : undefined}
              >
                <span className={active ? "text-white" : "text-gray-500 dark:text-gray-400"}>
                  {item.icon}
                </span>
                {!collapsed && <span>{item.label}</span>}
                {active && !collapsed && <div className="ml-auto w-1 h-6 bg-white/30 rounded-full" />}
                {collapsed && (
                  <span className="absolute left-full ml-2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition whitespace-nowrap pointer-events-none">
                    {item.label}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-700 space-y-3">
          {collapsed && (
            <div className="flex justify-center">
              <div className="flex items-center gap-1.5">
                <config.icon size={16} className="text-gray-500 dark:text-gray-400" />
              </div>
            </div>
          )}

          {/* Dark Mode Toggle */}
          <button
            onClick={() => setDarkMode(!darkMode)}
            aria-label={`Switch to ${darkMode ? "light" : "dark"} mode`}
            className={`
              w-full flex items-center justify-between p-2.5 rounded-lg transition-all
              ${darkMode ? "bg-gray-800 hover:bg-gray-700" : "bg-gray-100 hover:bg-gray-200"}
            `}
          >
            <span className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
              {darkMode ? <Moon size={16} /> : <Sun size={16} />}
              <span className={collapsed ? "hidden" : "block"}>{darkMode ? "Dark" : "Light"}</span>
            </span>
            <div
              className={`relative w-10 h-5 rounded-full transition ${darkMode ? "bg-purple-600" : "bg-gray-400"}`}
            >
              <div
                className={`
                  absolute top-0.5 w-4 h-4 bg-white rounded-full shadow-md transition-transform
                  ${darkMode ? "translate-x-5" : "translate-x-0.5"}
                `}
              />
            </div>
          </button>

          {!collapsed && (
            <p className="text-center text-xs text-gray-500 dark:text-gray-400">
              © {new Date().getFullYear()} Rental Connects
            </p>
          )}
        </div>
      </aside>
    </>
  );
}