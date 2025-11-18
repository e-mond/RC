import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Bell, LogOut, ChevronDown, Home, User } from "lucide-react";
import { useAuth } from "@/context/useAuth";

const roleConfig = {
  "super-admin": { color: "bg-purple-600", label: "Super Admin" },
  admin: { color: "bg-red-600", label: "Admin" },
  landlord: { color: "bg-blue-600", label: "Landlord" },
  artisan: { color: "bg-amber-600", label: "Artisan" },
  tenant: { color: "bg-green-600", label: "Tenant" },
};

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [showDropdown, setShowDropdown] = useState(false);

  const role = user?.role || localStorage.getItem("userRole") || "guest";
  const config = roleConfig[role] || roleConfig.tenant;

  // Get page title from path
  const getPageTitle = () => {
    const path = location.pathname;
    if (path === "/dashboard") return "Overview";
    if (path.includes("/dashboard/tenant")) return "Tenant Dashboard";
    if (path.includes("/dashboard/landlord")) return "Landlord Dashboard";
    if (path.includes("/dashboard/artisan")) return "Artisan Dashboard";
    if (path.includes("/admin")) return "Admin Panel";
    if (path.includes("/super-admin")) return "Super Admin";
    return "Dashboard";
  };

  const handleLogout = () => {
    if (window.confirm("Are you sure you want to log out?")) {
      logout();
      navigate("/login");
    }
  };

  const initials = user?.fullName
    ? user.fullName
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
    : "G";

  return (
    <header className="h-16 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between px-4 md:px-6 sticky top-0 z-40 shadow-sm">
      {/* Left: Breadcrumb + Title */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate("/dashboard")}
          className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition"
          aria-label="Go to dashboard overview"
        >
          <Home size={18} className="text-gray-600 dark:text-gray-400" />
        </button>
        <div className="hidden sm:block">
          <nav aria-label="breadcrumb" className="flex items-center gap-2 text-sm">
            <span className="text-gray-500 dark:text-gray-400">/</span>
            <span className="font-medium text-gray-900 dark:text-white">{getPageTitle()}</span>
          </nav>
        </div>
      </div>

      {/* Right: Notifications + User */}
      <div className="flex items-center gap-3">
        {/* Notifications */}
        <button
          className="relative p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition group"
          aria-label="Notifications (3 unread)"
        >
          <Bell size={18} className="text-gray-600 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white" />
          <span className="absolute -top-1 -right-1 animate-pulse">
            <span className="relative flex h-5 w-5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-5 w-5 bg-red-500 text-white text-xs font-bold items-center justify-center">
                3
              </span>
            </span>
          </span>
        </button>

        {/* User Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowDropdown(!showDropdown)}
            className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition"
            aria-label="User menu"
            aria-expanded={showDropdown}
            aria-haspopup="true"
          >
            {/* Avatar */}
            <div className="w-9 h-9 rounded-full bg-linear-to-br from-[#0b6e4f] to-[#095c42] flex items-center justify-center text-white font-semibold text-sm shadow-sm">
            {initials}
            </div>

            {/* Info (desktop only) */}
            <div className="hidden md:block text-left">
              <p className="text-sm font-medium text-gray-900 dark:text-white">
                {user?.fullName || "Guest User"}
              </p>
              <div className="flex items-center gap-1.5">
                <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium text-white ${config.color}`}>
                  {config.label}
                </span>
              </div>
            </div>

            <ChevronDown
              size={16}
              className={`text-gray-500 transition-transform ${showDropdown ? "rotate-180" : ""}`}
            />
          </button>

          {/* Dropdown */}
          {showDropdown && (
            <>
              {/* Backdrop */}
              <div
                className="fixed inset-0 z-40"
                onClick={() => setShowDropdown(false)}
                aria-hidden="true"
              />
              {/* Menu */}
              <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden z-50">
                <div className="p-3 border-b border-gray-200 dark:border-gray-700">
                  <p className="text-sm font-semibold text-gray-900 dark:text-white">
                    {user?.fullName || "Guest"}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{user?.email || ""}</p>
                </div>

                <button
                  onClick={() => {
                    setShowDropdown(false);
                    navigate("/profile");
                  }}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition"
                >
                  <User size={16} />
                  <span>View Profile</span>
                </button>

                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition"
                >
                  <LogOut size={16} />
                  <span>Log Out</span>
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}