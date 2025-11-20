// src/components/layout/Sidebar.jsx
import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  Home,
  Users,
  Wrench,
  FileText,
  Settings,
  Shield,
  Building2,
  Hammer,
  Receipt,
  AlertCircle,
  Menu,
  X,
  ChevronLeft,
  ChevronRight,
  Moon,
  Sun,
  Calendar,
  TrendingUp,
  MessageSquare,
  Heart,
  History,
  User,
} from "lucide-react";
import { useAuthStore } from "@/stores/authStore";
import { useTheme } from "@/context/ThemeContext";

// Role configurations: colors + icons
const roleConfig = {
  "super-admin": { color: "bg-purple-600", label: "Super Admin", icon: Shield },
  admin: { color: "bg-red-600", label: "Admin", icon: Settings },
  landlord: { color: "bg-blue-600", label: "Landlord", icon: Building2 },
  artisan: { color: "bg-amber-600", label: "Artisan", icon: Hammer },
  tenant: { color: "bg-green-600", label: "Tenant", icon: Home },
};

// Sidebar menu items
const roleMenus = {
  "super-admin": [
    { to: "/super-admin/overview", label: "Overview", icon: <Home size={18} /> },
    { to: "/super-admin/users", label: "Manage Users", icon: <Users size={18} /> },
    { to: "/super-admin/roles", label: "Role Delegation", icon: <Settings size={18} /> },
    { to: "/super-admin/audit", label: "Audit Logs", icon: <FileText size={18} /> },
  ],
  admin: [
    { to: "/admin/overview", label: "Overview", icon: <Home size={18} /> },
    { to: "/admin/approvals", label: "Pending Approvals", icon: <AlertCircle size={18} /> },
    { to: "/admin/reports", label: "Reports", icon: <FileText size={18} /> },
  ],
  landlord: [
    { to: "/landlord/overview", label: "Overview", icon: <Home size={18} /> },
    { to: "/landlord/properties", label: "My Properties", icon: <Building2 size={18} /> },
    { to: "/landlord/bookings", label: "Bookings", icon: <Calendar size={18} /> },
    { to: "/landlord/analytics", label: "Analytics", icon: <TrendingUp size={18} /> },
  ],
  artisan: [
    { to: "/artisan/overview", label: "Overview", icon: <Home size={18} /> },
    { to: "/artisan/tasks", label: "Assigned Tasks", icon: <Wrench size={18} /> },
    { to: "/artisan/earnings", label: "Earnings", icon: <Receipt size={18} /> },
    { to: "/artisan/schedule", label: "Schedule", icon: <Calendar size={18} /> },
    { to: "/artisan/messages", label: "Messages", icon: <MessageSquare size={18} /> },
  ],
  tenant: [
    { to: "/tenant/overview", label: "Overview", icon: <Home size={18} /> },
    { to: "/tenant/rentals", label: "My Rentals", icon: <FileText size={18} /> },
    { to: "/tenant/payments", label: "Payments", icon: <Receipt size={18} /> },
    { to: "/tenant/maintenance", label: "Maintenance", icon: <Wrench size={18} /> },
    { to: "/tenant/wishlist", label: "Wishlist", icon: <Heart size={18} /> },
    { to: "/tenant/history", label: "Rental History", icon: <History size={18} /> },
  ],
};

export default function Sidebar() {
  const location = useLocation();
  const { user } = useAuthStore();
  const role = user?.role || "tenant";
  const config = roleConfig[role] || roleConfig.tenant;
  const { isDark, toggleTheme } = useTheme();

  const [isOpen, setIsOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

  const isActive = (path) => {
    const current = location.pathname;
    if (path.endsWith("/overview") && current === path.replace("/overview", "")) return true;
    return current.startsWith(path);
  };

  const baseItems = roleMenus[role] || roleMenus.tenant;
  const items = [
    ...baseItems,
    { to: "/profile", label: "Profile", icon: <User size={18} /> },
  ];

  return (
    <>
      {/* Mobile menu button */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed top-4 left-4 z-50 p-2 bg-white dark:bg-gray-800 rounded-lg shadow-md md:hidden"
      >
        <Menu size={24} />
      </button>

      {/* Overlay */}
      {isOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 md:hidden" onClick={() => setIsOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed md:static inset-y-0 left-0 z-50 flex flex-col bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700
        transition-all duration-300
        ${isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
        ${collapsed ? "w-20" : "w-72"}
      `}>
        {/* Header */}
        <div className="relative p-4 border-b border-gray-200 dark:border-gray-700">
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="absolute -right-3 top-1/2 -translate-y-1/2 hidden md:block p-1 bg-white dark:bg-gray-800 rounded-full shadow-md"
          >
            {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
          </button>

          <button
            onClick={() => setIsOpen(false)}
            className="absolute right-4 top-4 p-1.5 rounded hover:bg-gray-100 dark:hover:bg-gray-800 md:hidden"
          >
            <X size={20} />
          </button>

          <div className={`flex items-center gap-3 ${collapsed ? "justify-center" : ""}`}>
            <div className="w-9 h-9 bg-[#0b6e4f] rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">RC</span>
            </div>
            {!collapsed && (
              <div>
                <h1 className="text-lg font-bold">Rental Connects</h1>
                <div className="flex items-center gap-1.5 mt-1">
                  <config.icon size={14} className="text-white" />
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium text-white ${config.color}`}>
                    {config.label}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1">
          {items.map((item) => {
            const active = isActive(item.to);
            return (
              <Link
                key={item.to}
                to={item.to}
                onClick={() => setIsOpen(false)}
                className={`
                  group flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all
                  ${active
                    ? "bg-[#0b6e4f] text-white shadow-sm"
                    : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                  }
                `}
              >
                <span className={active ? "text-white" : "text-gray-500 dark:text-gray-400"}>
                  {item.icon}
                </span>
                {!collapsed && <span>{item.label}</span>}
                {collapsed && (
                  <span className="absolute left-full ml-2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition">
                    {item.label}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Dark mode toggle */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={toggleTheme}
            className="w-full flex items-center justify-between p-2.5 rounded-lg bg-gray-100 dark:bg-gray-800"
          >
            <span className="flex items-center gap-2 text-sm">
              {isDark ? <Moon size={16} /> : <Sun size={16} />}
              {!collapsed && <span>{isDark ? "Dark" : "Light"}</span>}
            </span>
            <div className={`relative w-10 h-5 rounded-full ${isDark ? "bg-purple-600" : "bg-gray-400"}`}>
              <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full transition-transform ${isDark ? "translate-x-5" : "translate-x-0.5"}`} />
            </div>
          </button>
        </div>
      </aside>
    </>
  );
}