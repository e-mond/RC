// src/components/layout/Nabar.jsx
import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Bell, LogOut, ChevronDown, Home, User, Sun, Moon } from "lucide-react";
import { useAuthStore } from "@/stores/authStore";
import { useTheme } from "@/context/ThemeContext";

const roleConfig = {
  "super-admin": { color: "bg-purple-600", label: "Super Admin" },
  admin: { color: "bg-red-600", label: "Admin" },
  landlord: { color: "bg-blue-600", label: "Landlord" },
  artisan: { color: "bg-amber-600", label: "Artisan" },
  tenant: { color: "bg-green-600", label: "Tenant" },
};

export default function Navbar() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();
  const [showDropdown, setShowDropdown] = useState(false);
  const { isDark, toggleTheme } = useTheme();

  const role = user?.role || "tenant";
  const config = roleConfig[role] || roleConfig.tenant;

  const getPageTitle = () => {
    const path = location.pathname;
    if (path.includes("/admin")) return "Admin Panel";
    if (path.includes("/super-admin")) return "Super Admin";
    if (path.includes("/landlord")) return "Landlord Dashboard";
    if (path.includes("/artisan")) return "Artisan Dashboard";
    if (path.includes("/tenant")) return "Tenant Dashboard";
    return "Dashboard";
  };

  const handleLogout = () => {
    if (window.confirm("Are you sure you want to log out?")) {
      logout();
      navigate("/login", { replace: true });
    }
  };

  const initials = user?.fullName
    ? user.fullName.split(" ").map((n) => n[0]).join("").toUpperCase()
    : "RC";

  return (
    <header className="h-16 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between px-4 md:px-6 sticky top-0 z-40 shadow-sm">
      {/* Left: Home + Title */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate(-1)}
          className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition"
          aria-label="Go back"
        >
          <Home size={20} className="text-gray-600 dark:text-gray-400" />
        </button>
        <h1 className="text-lg font-semibold text-gray-900 dark:text-white">
          {getPageTitle()}
        </h1>
      </div>

      {/* Right: Notifications + User */}
      <div className="flex items-center gap-4">
        {/* Notifications */}
        <button
          className="relative p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition"
          onClick={() => navigate("/notifications")}
          aria-label="Open notifications"
        >
          <Bell size={20} className="text-gray-600 dark:text-gray-400" />
          <span className="absolute -top-1 -right-1">
            <span className="relative flex h-5 w-5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-5 w-5 bg-red-500 text-white text-xs font-bold items-center justify-center">
                3
              </span>
            </span>
          </span>
        </button>

        <button
          className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition"
          onClick={toggleTheme}
          aria-label="Toggle theme"
        >
          {isDark ? <Sun size={18} className="text-amber-400" /> : <Moon size={18} className="text-gray-600" />}
        </button>

        {/* User Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowDropdown(!showDropdown)}
            className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition"
          >
            <div className="w-10 h-10 rounded-full bg-linear-to-br from-[#0b6e4f] to-[#095c42] flex items-center justify-center text-white font-bold text-sm shadow-md">
              {initials}
            </div>
            <div className="hidden md:block text-left">
              <p className="text-sm font-medium text-gray-900 dark:text-white">
                {user?.fullName || "Guest User"}
              </p>
              <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium text-white ${config.color}`}>
                {config.label}
              </span>
            </div>
            <ChevronDown
              size={16}
              className={`text-gray-500 transition-transform ${showDropdown ? "rotate-180" : ""}`}
            />
          </button>

          {/* Dropdown Menu */}
          {showDropdown && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={() => setShowDropdown(false)}
                aria-hidden="true"
              />
              <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 z-50 overflow-hidden">
                <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                  <p className="font-semibold text-gray-900 dark:text-white">{user?.fullName}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400 truncate">{user?.email}</p>
                </div>
                <button
                  onClick={() => {
                    setShowDropdown(false);
                    navigate("/profile");
                  }}
                  className="w-full text-left px-4 py-3 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-3"
                >
                  <User size={16} />
                  View Profile
                </button>
                <button
                  onClick={handleLogout}
                  className="w-full text-left px-4 py-3 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 flex items-center gap-3"
                >
                  <LogOut size={16} />
                  Log Out
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}