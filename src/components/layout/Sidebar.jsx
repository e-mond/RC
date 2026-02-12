// src/components/layout/Sidebar.jsx
import React, { useState, useEffect, useCallback } from "react";
import { Link, useLocation } from "react-router-dom";

// Icons from lucide-react
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
  X,
  ChevronLeft,
  ChevronRight,
  Calendar,
  TrendingUp,
  MessageSquare,
  Heart,
  History,
  Megaphone,
  Languages,
  Sun,
  Moon,
  Lock,
  Crown,
  Book,
  Wallet,
} from "lucide-react";

// Store & context hooks
import { useAuthStore } from "@/stores/authStore";
import { useTheme } from "@/context/ThemeContext";
import { useTranslation } from "react-i18next";
import useLanguage from "@/hooks/useLanguage";
import { useFeatureAccess } from "@/context/FeatureAccessContext";

// Services
import { getUnreadCount } from "@/services/messagesService";
import { fetchAdminDashboardStats } from "@/services/adminService";

// Role configuration
const roleConfig = {
  "super-admin": { color: "bg-purple-600", label: "Super Admin", icon: Shield },
  admin:         { color: "bg-red-600",     label: "Admin",       icon: Settings },
  landlord:      { color: "bg-blue-600",    label: "Landlord",    icon: Building2 },
  artisan:       { color: "bg-amber-600",   label: "Artisan",     icon: Hammer },
  tenant:        { color: "bg-emerald-600", label: "Tenant",      icon: Home },
};

// Menu structure per role
const roleMenus = {
  "super-admin": [
    { to: "/super-admin/overview",       labelKey: "Overview",           icon: <Home size={18} /> },
    { to: "/super-admin/users",          labelKey: "Manage Users",        icon: <Users size={18} /> },
    { to: "/super-admin/users/pending",  labelKey: "Pending User Approvals", icon: <AlertCircle size={18} />, hasPendingBadge: "users" },
    { to: "/super-admin/properties/pending", labelKey: "Pending Property Approvals", icon: <Building2 size={18} />, hasPendingBadge: "properties" },
    { to: "/super-admin/roles",          labelKey: "Role Delegation",     icon: <Settings size={18} /> },
    { to: "/super-admin/pricing",        labelKey: "Premium Pricing",     icon: <Crown size={18} /> },
    { to: "/super-admin/marketing",      labelKey: "Marketing",           icon: <Megaphone size={18} /> },
    { to: "/super-admin/audit",          labelKey: "Audit Logs",          icon: <FileText size={18} /> },
    { to: "/super-admin/profession-change-requests", labelKey: "Profession Requests", icon: <Wrench size={18} />, hasPendingBadge: "professionRequests" },
    { to: "/super-admin/withdrawals",    labelKey: "Withdrawals",         icon: <Wallet size={18} /> },
    { to: "/super-admin/leases",         labelKey: "Lease Management",    icon: <FileText size={18} /> },
    { to: "/super-admin/announcements",  labelKey: "Announcements",       icon: <Megaphone size={18} /> },
    { to: "/super-admin/messages",       labelKey: "Messages",            icon: <MessageSquare size={18} />, hasMessages: true },
    { to: "/profile",                    labelKey: "Profile",             icon: <Users size={18} /> },
  ],

  admin: [
    { to: "/admin/overview",             labelKey: "Overview",            icon: <Home size={18} /> },
    { to: "/admin/approvals",            labelKey: "Pending Approvals",   icon: <AlertCircle size={18} />, hasPendingBadge: "all" },
    { to: "/admin/assigned-roles",       labelKey: "Assigned Roles",      icon: <Shield size={18} /> },
    { to: "/admin/marketing",            labelKey: "Marketing",           icon: <Megaphone size={18} /> },
    { to: "/admin/reports",              labelKey: "Reports",             icon: <FileText size={18} /> },
    { to: "/admin/leases",               labelKey: "Lease Management",    icon: <FileText size={18} /> },
    { to: "/admin/messages",             labelKey: "Messages",            icon: <MessageSquare size={18} />, hasMessages: true },
    { to: "/profile",                    labelKey: "Profile",             icon: <Users size={18} /> },
  ],

  tenant: [
    { to: "/tenant/overview",            labelKey: "Overview",            icon: <Home size={18} /> },
    { to: "/tenant/properties",          labelKey: "Browse Properties",   icon: <Building2 size={18} /> },
    { to: "/tenant/rentals",             labelKey: "My Rentals",          icon: <FileText size={18} /> },
    { to: "/tenant/payments",            labelKey: "Payments",            icon: <Receipt size={18} /> },
    { to: "/tenant/maintenance",         labelKey: "Maintenance",         icon: <Wrench size={18} /> },
    { to: "/tenant/wishlist",            labelKey: "Wishlist",            icon: <Heart size={18} /> },
    { to: "/tenant/history",             labelKey: "RentalHistory",       icon: <History size={18} /> },
    { to: "/tenant/leases",              labelKey: "Lease Agreements",    icon: <FileText size={18} /> },
    { to: "/tenant/messages",            labelKey: "Messages",            icon: <MessageSquare size={18} />, hasMessages: true },
    { to: "/profile",                    labelKey: "Profile",             icon: <Users size={18} /> },
  ],

  landlord: [
    { to: "/landlord/overview",          labelKey: "Overview",            icon: <Home size={18} /> },
    { to: "/landlord/properties",        labelKey: "My Properties",       icon: <Building2 size={18} /> },
    { to: "/landlord/bookings",          labelKey: "Bookings",            icon: <Calendar size={18} /> },
    { to: "/landlord/leases",            labelKey: "Lease Agreements",    icon: <FileText size={18} /> },
    {
      to: "/landlord/analytics",
      labelKey: "Analytics",
      icon: <TrendingUp size={18} />,
      requiredFeature: "landlord_advanced_analytics",
      premium: true,
    },
    {
      to: "/landlord/wallet",
      labelKey: "Wallet",
      icon: <Receipt size={18} />,
      requiredFeature: "digital_rent_collection",
      premium: true,
    },
    { to: "/landlord/messages",          labelKey: "Messages",            icon: <MessageSquare size={18} />, hasMessages: true },
    {
      to: "/landlord/ads",
      labelKey: "Promoted Ads",
      icon: <Megaphone size={18} />,
      requiredFeature: "advertisement_manager",
      premium: true,
    },
    { to: "/profile",                    labelKey: "Profile",             icon: <Users size={18} /> },
  ],

  artisan: [
    { to: "/artisan/overview",           labelKey: "Overview",            icon: <Home size={18} /> },
    { to: "/artisan/tasks",              labelKey: "Assigned Tasks",      icon: <Wrench size={18} /> },
    { to: "/artisan/earnings",           labelKey: "Earnings",            icon: <Receipt size={18} /> },
    { to: "/artisan/schedule",           labelKey: "Schedule",            icon: <Calendar size={18} /> },
    { to: "/artisan/messages",           labelKey: "Messages",            icon: <MessageSquare size={18} />, hasMessages: true },
    {
      to: "/artisan/ads",
      labelKey: "Promoted Ads",
      icon: <Megaphone size={18} />,
      requiredFeature: "advertisement_manager",
      premium: true,
    },
    { to: "/profile",                    labelKey: "Profile",             icon: <Users size={18} /> },
  ],
};

export default function Sidebar() {
  const { t } = useTranslation();
  const location = useLocation();
  const { user } = useAuthStore();
  const { isDark, toggleTheme } = useTheme();
  const { language, setLanguage, availableLanguages } = useLanguage();
  const { can: canAccessFeature } = useFeatureAccess();

  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [unreadMessages, setUnreadMessages] = useState(0);
  const [showLangMenu, setShowLangMenu] = useState(false);
  const [pendingCounts, setPendingCounts] = useState({
    users: 0,
    properties: 0,
    all: 0,
    professionRequests: 0,
  });

  // Safe role handling
  const rawRole = user?.role;
  const role = typeof rawRole === "string" ? rawRole.toLowerCase() : "tenant";
  const normalizedRole = role in roleMenus ? role : "tenant";

  // Development-only warning
  if (import.meta.env?.DEV && !(role in roleMenus)) {
    console.warn(`Sidebar: No menu config for role "${rawRole || 'unknown'}". Using tenant fallback.`);
  }

  const config = roleConfig[normalizedRole] || roleConfig.tenant;
  const isAdminRole = normalizedRole === "admin" || normalizedRole === "super-admin";

  // Always array – prevents undefined.filter crash
  const menuItems = roleMenus[normalizedRole] || roleMenus.tenant || [];

  const visibleMenuItems = menuItems.filter(
    (item) => !item.requiredFeature || canAccessFeature(item.requiredFeature)
  );

  // Fetch unread messages
  useEffect(() => {
    const updateCount = async () => {
      try {
        const count = await getUnreadCount();
        setUnreadMessages(count || 0);
      } catch (err) {
        console.error("Failed to fetch unread count:", err);
        setUnreadMessages(0);
      }
    };

    updateCount();
    const interval = setInterval(updateCount, 60000);
    return () => clearInterval(interval);
  }, []);

  // Fetch pending counts for admins
  useEffect(() => {
    if (!isAdminRole) return;

    const updatePendingCounts = async () => {
      try {
        const stats = await fetchAdminDashboardStats();
        setPendingCounts({
          users: stats?.pendingUsers || stats?.pending_users || 0,
          properties: stats?.pendingProperties || stats?.pending_properties || 0,
          all: (stats?.pendingUsers || 0) + (stats?.pendingProperties || 0),
          professionRequests: stats?.pendingProfessionRequests || stats?.pending_profession_requests || 0,
        });
      } catch (err) {
        console.warn("Failed to fetch pending counts:", err);
      }
    };

    updatePendingCounts();
    const interval = setInterval(updatePendingCounts, 60000);
    return () => clearInterval(interval);
  }, [isAdminRole]);

  // Route active check
  const isActive = useCallback(
    (path) => {
      const current = location.pathname;

      if (current === path) return true;

      if (path.endsWith("/overview")) {
        const base = path.replace("/overview", "");
        return current === base || current === `${base}/`;
      }

      if (current.startsWith(path)) {
        if (path.endsWith("/")) return true;

        const nextChar = current[path.length];
        return nextChar === undefined || nextChar === "/";
      }

      return false;
    },
    [location.pathname]
  );

  return (
    <>
      {/* Mobile Sidebar Toggle – subtle half-visible circle, no arrow */}
      <button
        className={`
          fixed left-0 top-1/2 -translate-y-1/2 z-50 
          pl-6 pr-4 py-6
          bg-emerald-600/60 hover:bg-emerald-700/75 
          text-transparent rounded-r-full 
          md:hidden 
          border-2 border-l-0 border-emerald-400/20 
          transition-all duration-300 
          active:scale-105 focus:outline-none focus:ring-2 focus:ring-emerald-300/40
          shadow-md
        `}
        onClick={() => setIsMobileOpen(true)}
        aria-label={t("open sidebar menu")}
        aria-expanded={isMobileOpen}
        aria-controls="mobile-sidebar"
      >
        {/* No icon – very subtle grab handle look */}
        <div className="w-1.5 h-10 bg-white/50 rounded-full opacity-60"></div>
      </button>

      {/* Backdrop */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 md:hidden transition-opacity duration-300"
          onClick={() => setIsMobileOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <aside
        id="mobile-sidebar"
        className={`
          fixed md:sticky md:top-0 md:h-screen
          inset-y-0 left-0 z-50 flex flex-col
          bg-white/95 dark:bg-gray-900/95 backdrop-blur-lg
          border-r border-gray-200/60 dark:border-gray-700/60
          transition-transform duration-300 ease-in-out
          ${isMobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
          ${isCollapsed ? "w-20" : "w-72"}
        `}
        aria-label={t("sidebarNavigation")}
      >
        {/* Header */}
        <div className="relative p-5 border-b border-gray-200/60 dark:border-gray-700/60 shrink-0">
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="absolute -right-3 top-1/2 -translate-y-1/2 hidden md:flex items-center justify-center w-7 h-7 bg-white dark:bg-gray-800 rounded-full shadow-lg border border-gray-200 dark:border-gray-700 hover:scale-105 transition"
            aria-label={isCollapsed ? t("expandSidebar") : t("collapseSidebar")}
          >
            {isCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
          </button>

          <button
            className="absolute right-4 top-5 md:hidden p-2.5 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition"
            onClick={() => setIsMobileOpen(false)}
            aria-label={t("closeSidebar")}
          >
            <X size={24} />
          </button>

          <div className={`flex items-center gap-3 ${isCollapsed ? "justify-center" : ""}`}>
            <div className="w-10 h-10 bg-linear-to-br from-emerald-600 to-emerald-700 rounded-xl flex items-center justify-center shadow-md shrink-0">
              <span className="text-white font-bold text-base">RC</span>
            </div>

            {!isCollapsed && (
              <div className="min-w-0">
                <h1 className="text-xl font-bold tracking-tight text-gray-900 dark:text-white">
                  Rental Connects
                </h1>
                <div className="flex items-center gap-2 mt-1">
                  <config.icon size={14} className="text-white" />
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold text-white ${config.color}`}>
                    {config.label}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Navigation */}
        <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600 scrollbar-track-transparent">
          <nav className="px-3 py-6 space-y-1">
            {visibleMenuItems.map((item) => {
              const active = isActive(item.to);
              const showMessageBadge = item.hasMessages && unreadMessages > 0;
              const isLocked = item.requiredFeature && !canAccessFeature(item.requiredFeature);
              const pendingBadgeCount = item.hasPendingBadge ? pendingCounts[item.hasPendingBadge] || 0 : 0;
              const showPendingBadge = item.hasPendingBadge && pendingBadgeCount > 0;

              return (
                <Link
                  key={item.to}
                  to={isLocked ? "/upgrade" : item.to}
                  onClick={(e) => {
                    if (isLocked) e.preventDefault();
                    setIsMobileOpen(false);
                  }}
                  className={`
                    group relative flex items-center gap-3 px-3.5 py-3 rounded-xl text-sm font-medium transition-all duration-200
                    ${active
                      ? "bg-emerald-600/90 text-white shadow-md"
                      : isLocked
                        ? "text-gray-400 dark:text-gray-600 opacity-70 cursor-not-allowed"
                        : "text-gray-700 dark:text-gray-300 hover:bg-gray-100/80 dark:hover:bg-gray-800/60"
                    }
                  `}
                >
                  <span className={`shrink-0 ${active ? "text-white" : "text-gray-500 dark:text-gray-400"}`}>
                    {isLocked ? <Lock size={18} /> : item.icon}
                  </span>

                  {!isCollapsed && (
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      <span className="truncate">{t(item.labelKey)}</span>
                      {isLocked && (
                        <span className="ml-auto text-xs font-semibold px-2 py-0.5 bg-amber-500/20 text-amber-700 dark:text-amber-400 rounded-full">
                          Pro
                        </span>
                      )}
                    </div>
                  )}

                  {showMessageBadge && !isLocked && (
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 bg-red-500 text-white text-xs font-bold rounded-full min-w-6 h-6 px-1.5 flex items-center justify-center shadow-md animate-pulse">
                      {unreadMessages > 99 ? "99+" : unreadMessages}
                    </span>
                  )}

                  {showPendingBadge && !isLocked && !showMessageBadge && (
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 bg-amber-500 text-white text-xs font-bold rounded-full min-w-6 h-6 px-1.5 flex items-center justify-center shadow-md">
                      {pendingBadgeCount > 99 ? "99+" : pendingBadgeCount}
                    </span>
                  )}

                  {isCollapsed && (
                    <div className="absolute left-full ml-3 px-3 py-2 bg-gray-900/95 text-white text-sm rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 pointer-events-none whitespace-nowrap shadow-xl border border-gray-700/50">
                      {t(item.labelKey)}
                      {isLocked && " (Premium)"}
                      {showMessageBadge && ` (${unreadMessages})`}
                      {showPendingBadge && ` (${pendingBadgeCount} pending)`}
                    </div>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Bottom controls */}
        <div className="p-4 border-t border-gray-200/60 dark:border-gray-700/60 shrink-0">
          {/* Language selector */}
          <div className="relative mb-2">
            <button
              onClick={() => setShowLangMenu(!showLangMenu)}
              className="w-full flex items-center justify-between p-3 rounded-xl bg-gray-100/80 dark:bg-gray-800/60 hover:bg-gray-200/80 dark:hover:bg-gray-700/60 transition"
            >
              <span className="flex items-center gap-3 text-sm font-medium text-gray-700 dark:text-gray-300">
                <Languages size={18} />
                {!isCollapsed && (
                  <span>
                    {availableLanguages.find((l) => l.code === language)?.label || t("language")}
                  </span>
                )}
              </span>
            </button>

            {showLangMenu && !isCollapsed && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setShowLangMenu(false)} />
                <div className="absolute bottom-full left-0 mb-2 w-full bg-white dark:bg-gray-900 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden z-50">
                  {availableLanguages.map((lang) => (
                    <button
                      key={lang.code}
                      onClick={() => {
                        setLanguage(lang.code);
                        setShowLangMenu(false);
                      }}
                      className={`w-full text-left px-4 py-3 text-sm hover:bg-gray-50 dark:hover:bg-gray-800/50 flex items-center justify-between ${
                        language === lang.code
                          ? "bg-emerald-600/10 text-emerald-700 dark:text-emerald-400"
                          : "text-gray-700 dark:text-gray-300"
                      }`}
                    >
                      <span>{lang.label}</span>
                      {language === lang.code && <span className="text-emerald-600 dark:text-emerald-400">✓</span>}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Theme toggle */}
          <button
            onClick={toggleTheme}
            className="w-full flex items-center justify-between p-3 rounded-xl bg-gray-100/80 dark:bg-gray-800/60 hover:bg-gray-200/80 dark:hover:bg-gray-700/60 transition"
          >
            <span className="flex items-center gap-3 text-sm font-medium text-gray-700 dark:text-gray-300">
              {isDark ? <Sun size={18} /> : <Moon size={18} />}
              {!isCollapsed && <span>{isDark ? t("Light Mode") : t("Dark Mode")}</span>}
            </span>

            <div
              className={`relative w-11 h-6 rounded-full ${
                isDark ? "bg-emerald-600" : "bg-gray-400"
              } transition-colors`}
            >
              <div
                className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow-sm transition-transform ${
                  isDark ? "translate-x-5" : "translate-x-0.5"
                }`}
              />
            </div>
          </button>
        </div>
      </aside>
    </>
  );
}