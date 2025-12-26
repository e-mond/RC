// src/components/layout/Navbar.jsx
import React, { useState, useEffect } from "react";
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
  Languages,
  CheckCircle,
} from "lucide-react";
import { useAuthStore } from "@/stores/authStore";
import { useTheme } from "@/context/ThemeContext";
import useLanguage from "@/hooks/useLanguage";
import { useTranslation } from "@/hooks/useTranslation";
import apiClient from "@/services/apiClient";

const roleConfig = {
  "super-admin": { color: "bg-purple-600", label: "Super Admin" },
  admin: { color: "bg-red-600", label: "Admin" },
  landlord: { color: "bg-blue-600", label: "Landlord" },
  artisan: { color: "bg-amber-600", label: "Artisan" },
  tenant: { color: "bg-green-600", label: "Tenant" },
};

export default function Navbar() {
  const { t } = useTranslation();
  const { user, logout } = useAuthStore();
  const { isDark, toggleTheme } = useTheme();
  const { language, setLanguage, availableLanguages } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();

  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showDropdown, setShowDropdown] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [showLanguageMenu, setShowLanguageMenu] = useState(false);

  const role = user?.role || "tenant";
  const config = roleConfig[role] || roleConfig.tenant;

  useEffect(() => {
    const fetchUnreadCount = async () => {
      if (!user) {
        setUnreadCount(0);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const { data } = await apiClient.get("/notifications/unread-count/");
        setUnreadCount(data.unread_count || 0);
      } catch (err) {
        console.error("Failed to fetch unread count", err);
        setUnreadCount(0);
      } finally {
        setLoading(false);
      }
    };

    fetchUnreadCount();
    const interval = setInterval(fetchUnreadCount, 30000);
    return () => clearInterval(interval);
  }, [user]);

  const getPageTitle = () => {
    const path = location.pathname;
    if (path.includes("/admin")) return t("AdminPanel");
    if (path.includes("/super-admin")) return t("SuperAdmin");
    if (path.includes("/landlord")) return t("LandlordDashboard");
    if (path.includes("/artisan")) return t("ArtisanDashboard");
    if (path.includes("/tenant")) return t("TenantDashboard");
    return t("dashboard");
  };

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  const getDisplayName = (fullName = "") => {
    const parts = fullName.trim().split(/\s+/);
    if (parts.length === 0) return "";
    if (parts.length === 1) return parts[0];
    return `${parts[0]} ${parts[parts.length - 1]}`;
  };

  const displayName = getDisplayName(user?.full_name);

  const initials = user?.full_name
    ? user.full_name
        .trim()
        .split(/\s+/)
        .slice(0, 2)
        .map((n) => n[0])
        .join("")
        .toUpperCase()
    : "RC";

  return (
    <>
      <header className="h-16 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between px-4 md:px-6 sticky top-0 z-40 shadow-sm">
        {/* Left: Back + Title */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition"
            aria-label={t("goBack")}
          >
            <ArrowLeft size={20} className="text-gray-600 dark:text-gray-400" />
          </button>
          <h2 className="text-lg sm:text-xl lg:text-2xl font-semibold text-gray-900 dark:text-white truncate">
            {getPageTitle()}
          </h2>
        </div>

        {/* Right */}
        <div className="flex items-center gap-2">
          {/* Language Switch */}
          <div className="relative">
            <button
              onClick={() => setShowLanguageMenu(!showLanguageMenu)}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition"
              aria-label={t("changeLanguage")}
            >
              <Languages size={18} className="text-gray-600 dark:text-gray-400" />
            </button>
            {showLanguageMenu && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setShowLanguageMenu(false)}
                />
                <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 z-50 overflow-hidden">
                  {availableLanguages.map((lang) => (
                    <button
                      key={lang.code}
                      onClick={() => {
                        setLanguage(lang.code);
                        setShowLanguageMenu(false);
                      }}
                      className={`w-full text-left px-4 py-2.5 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center justify-between ${
                        language === lang.code
                          ? "bg-[#0b6e4f]/10 text-[#0b6e4f] dark:text-emerald-400"
                          : "text-gray-700 dark:text-gray-300"
                      }`}
                    >
                      <span>{lang.label}</span>
                      {language === lang.code && (
                        <CheckCircle size={16} className="text-[#0b6e4f] dark:text-emerald-400" />
                      )}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition"
            aria-label={t("toggleTheme")}
          >
            {isDark ? (
              <Sun size={18} className="text-amber-400" />
            ) : (
              <Moon size={18} className="text-gray-600 dark:text-gray-400" />
            )}
          </button>

          {/* Notifications Bell */}
          <button
            className="relative p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition"
            onClick={() => navigate("/notifications")}
            aria-label={t("openNotifications")}
          >
            <Bell size={20} className="text-gray-600 dark:text-gray-400" />
            {!loading && unreadCount > 0 && (
              <span className="absolute -top-1 -right-1">
                <span className="relative flex h-5 w-5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-5 w-5 bg-red-500 text-white text-xs font-bold items-center justify-center">
                    {unreadCount > 99 ? "99+" : unreadCount}
                  </span>
                </span>
              </span>
            )}
          </button>

          {/* User Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowDropdown(!showDropdown)}
              className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition"
            >
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#0b6e4f] to-[#095c42] flex items-center justify-center text-white font-bold text-sm shadow-md">
                {initials}
              </div>
              <div className="hidden md:block text-left">
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  {displayName || t("user")}
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

            {/* User Dropdown Menu */}
            {showDropdown && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setShowDropdown(false)}
                />
                <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 z-50 overflow-hidden">
                  <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                    <p className="font-semibold text-gray-900 dark:text-white">{displayName}</p>
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
                    {t("viewProfile")}
                  </button>
                  <button
                    onClick={() => {
                      setShowDropdown(false);
                      setShowLogoutConfirm(true);
                    }}
                    className="w-full text-left px-4 py-3 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 flex items-center gap-3"
                  >
                    <LogOut size={16} />
                    {t("logout")}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Custom Logout Confirmation Modal */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <div className="w-full max-w-sm bg-white dark:bg-gray-900 rounded-2xl shadow-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                {t("confirmLogout")}
              </h3>
              <button
                onClick={() => setShowLogoutConfirm(false)}
                className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                <X size={20} className="text-gray-500" />
              </button>
            </div>

            <p className="text-gray-600 dark:text-gray-400 mb-8">
              {t("logoutConfirmation")}
            </p>

            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowLogoutConfirm(false)}
                className="px-5 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800 transition"
              >
                {t("cancel")}
              </button>
              <button
                onClick={handleLogout}
                className="px-5 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
              >
                {t("yesLogout")}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}