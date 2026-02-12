// src/components/layout/Navbar.jsx
import React, { useState, useEffect, useCallback } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  Bell,
  LogOut,
  ChevronDown,
  User,
  Sun,
  Moon,
  ArrowLeft,
  X,
  Menu,
} from "lucide-react";
import { useAuthStore } from "@/stores/authStore";
import { useTheme } from "@/context/ThemeContext";
import { useTranslation } from "react-i18next";
import apiClient from "@/services/apiClient";

const roleConfig = {
  "super-admin": { color: "bg-purple-600", label: "Super Admin" },
  admin: { color: "bg-red-600", label: "Admin" },
  landlord: { color: "bg-blue-600", label: "Landlord" },
  artisan: { color: "bg-amber-600", label: "Artisan" },
  tenant: { color: "bg-emerald-600", label: "Tenant" },
};

export default function Navbar() {
  const { t } = useTranslation();
  const { user, logout } = useAuthStore();
  const { isDark, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();

  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const role = user?.role || "tenant";
  const config = roleConfig[role] || roleConfig.tenant;

  const initials =
    user?.full_name
      ?.trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((n) => n[0]?.toUpperCase() ?? "")
      .join("") || "RC";

  const displayName = user?.full_name?.trim() || t("User");

  const fetchUnreadNotifications = useCallback(async () => {
    if (!user) return;
    try {
      const { data } = await apiClient.get("/notifications/unread-count/");
      setUnreadCount(data.unread_count ?? 0);
    } catch {
      setUnreadCount(0);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchUnreadNotifications();
    const interval = setInterval(fetchUnreadNotifications, 40000);
    return () => clearInterval(interval);
  }, [fetchUnreadNotifications]);

  const getPageTitle = () => {
    const path = location.pathname;
    if (path.includes("/super-admin")) return t("Super Admin Dashboard");
    if (path.includes("/admin")) return t("Admin Panel");
    if (path.includes("/landlord")) return t("Landlord Dashboard");
    if (path.includes("/artisan")) return t("Artisan Dashboard");
    if (path.includes("/tenant")) return t("Tenant Dashboard");
    return t("Dashboard");
  };

  return (
    <>
      <header className="h-16 bg-white/95 dark:bg-gray-900/95 backdrop-blur-md border-b border-gray-200/60 dark:border-gray-700/60 sticky top-0 z-40 shadow-sm">
        <div className="h-full px-4 flex items-center justify-between">
          {/* Left: Back + Title */}
          <div className="flex items-center gap-3 sm:gap-4">
            <button
              onClick={() => navigate(-1)}
              className="p-2.5 -ml-2.5 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors min-w-11 min-h-11 flex items-center justify-center"
              aria-label={t("goBack")}
            >
              <ArrowLeft size={20} className="text-gray-600 dark:text-gray-400" />
            </button>

            <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 dark:text-white tracking-tight truncate max-w-[180px] sm:max-w-[300px] md:max-w-none">
              {getPageTitle()}
            </h1>
          </div>

          {/* Right side controls */}
          <div className="flex items-center gap-1.5 sm:gap-2 md:gap-3">
            {/* Theme toggle */}
            <button
              onClick={toggleTheme}
              className="p-2.5 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors min-w-11 min-h-11 flex items-center justify-center"
              aria-label={t("toggleTheme")}
            >
              {isDark ? (
                <Sun size={20} className="text-amber-400" />
              ) : (
                <Moon size={20} className="text-gray-600 dark:text-gray-400" />
              )}
            </button>

            {/* Notifications */}
            <button
              onClick={() => navigate("/notifications")}
              className="relative p-2.5 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors min-w-11 min-h-11 flex items-center justify-center"
              aria-label={`${t("notifications")}${unreadCount > 0 ? ` (${unreadCount} unread)` : ""}`}
            >
              <Bell size={20} className="text-gray-600 dark:text-gray-400" />
              {!isLoading && unreadCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 flex h-5 w-5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-70" />
                  <span className="relative inline-flex rounded-full h-5 w-5 bg-red-500 text-[10px] font-bold text-white items-center justify-center">
                    {unreadCount > 99 ? "99+" : unreadCount}
                  </span>
                </span>
              )}
            </button>

            {/* Mobile Hamburger */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2.5 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors min-w-11 min-h-11 flex items-center justify-center"
              aria-label={t("openMenu")}
              aria-expanded={isMobileMenuOpen}
              aria-controls="mobile-menu"
            >
              {isMobileMenuOpen ? (
                <X className="h-5 w-5 text-gray-700 dark:text-gray-300" />
              ) : (
                <Menu className="h-5 w-5 text-gray-700 dark:text-gray-300" />
              )}
            </button>

            {/* Desktop User Menu with Dropdown */}
            <div className="hidden md:block relative">
              <button
                onClick={() => setShowDropdown(!showDropdown)}
                className="flex items-center gap-3 p-1.5 pr-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                aria-expanded={showDropdown}
                aria-haspopup="true"
              >
                <div className="w-9 h-9 rounded-full bg-linear-to-br from-emerald-600 to-emerald-700 flex items-center justify-center text-white font-bold shadow-md text-sm">
                  {initials}
                </div>
                <div className="text-left">
                  <p className="text-sm font-semibold text-gray-900 dark:text-white truncate max-w-40">
                    {displayName}
                  </p>
                  <span
                    className={`text-xs font-medium px-2 py-0.5 rounded-full text-white ${config.color}`}
                  >
                    {config.label}
                  </span>
                </div>
                <ChevronDown
                  size={16}
                  className={`text-gray-500 dark:text-gray-400 transition-transform ${showDropdown ? "rotate-180" : ""}`}
                />
              </button>

              {showDropdown && (
                <>
                  <div
                    className="fixed inset-0 z-40 md:hidden"
                    onClick={() => setShowDropdown(false)}
                  />
                  <div className="absolute right-0 mt-3 w-72 bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-200/70 dark:border-gray-700/70 overflow-hidden z-50">
                    <div className="p-5 border-b border-gray-200 dark:border-gray-800">
                      <p className="font-semibold text-gray-900 dark:text-white">{displayName}</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400 truncate mt-0.5">
                        {user?.email}
                      </p>
                    </div>

                    <button
                      onClick={() => {
                        setShowDropdown(false);
                        navigate("/profile");
                      }}
                      className="w-full text-left px-5 py-3.5 text-sm hover:bg-gray-50 dark:hover:bg-gray-800/50 flex items-center gap-3 transition-colors"
                    >
                      <User size={18} />
                      {t("View Profile")}
                    </button>

                    <button
                      onClick={() => {
                        setShowDropdown(false);
                        setShowLogoutModal(true);
                      }}
                      className="w-full text-left px-5 py-3.5 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center gap-3 transition-colors"
                    >
                      <LogOut size={18} />
                      {t("Logout")}
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div
          id="mobile-menu"
          className="md:hidden fixed inset-0 z-30 bg-black/50 backdrop-blur-sm"
          onClick={() => setIsMobileMenuOpen(false)}
        >
          <div
            className="absolute right-0 top-16 w-72 max-w-[85%] h-[calc(100%-4rem)] bg-white dark:bg-gray-900 shadow-2xl border-l border-gray-200 dark:border-gray-700 overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6 border-b border-gray-200 dark:border-gray-800">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-full bg-linear-to-br from-emerald-600 to-emerald-700 flex items-center justify-center text-white font-bold text-xl shadow-md">
                  {initials}
                </div>
                <div>
                  <p className="font-semibold text-gray-900 dark:text-white">{displayName}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{user?.email}</p>
                  <span
                    className={`inline-block mt-1.5 text-xs font-medium px-3 py-1 rounded-full text-white ${config.color}`}
                  >
                    {config.label}
                  </span>
                </div>
              </div>
            </div>

            <nav className="flex flex-col py-2">
              <button
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  navigate("/profile");
                }}
                className="w-full text-left px-6 py-4 text-base hover:bg-gray-50 dark:hover:bg-gray-800/50 flex items-center gap-4"
              >
                <User size={22} />
                {t("View Profile")}
              </button>

              <button
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  setShowLogoutModal(true);
                }}
                className="w-full text-left px-6 py-4 text-base text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center gap-4"
              >
                <LogOut size={22} />
                {t("Logout")}
              </button>
            </nav>
          </div>
        </div>
      )}

      {/* Logout Confirmation Modal */}
      {showLogoutModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
          <div className="w-full max-w-md bg-white dark:bg-gray-900 rounded-2xl shadow-2xl p-6 border border-gray-200/50 dark:border-gray-700/50">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                {t("Confirm Logout")}
              </h3>
              <button
                onClick={() => setShowLogoutModal(false)}
                className="p-2.5 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 min-w-11 min-h-11 flex items-center justify-center"
                aria-label={t("close")}
              >
                <X size={20} />
              </button>
            </div>

            <p className="text-gray-600 dark:text-gray-400 mb-8">
              {t("Logout Confirmation Message")}
            </p>

            <div className="flex gap-4 justify-end">
              <button
                onClick={() => setShowLogoutModal(false)}
                className="px-6 py-3 rounded-xl border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800 transition min-w-[100px]"
              >
                {t("Cancel")}
              </button>
              <button
                onClick={() => {
                  logout();
                  navigate("/login", { replace: true });
                }}
                className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl transition shadow-sm min-w-[100px]"
              >
                {t("Yes Logout")}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}