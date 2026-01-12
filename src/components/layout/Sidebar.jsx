// components/layout/Sidebar.jsx
// This component renders the main navigation sidebar for all user roles
// It is responsive (mobile slide-in + desktop fixed/collapsible)
// Shows only features the current user has access to (via FeatureAccessContext)
// Locked features are marked as "Pro" and redirect to upgrade page

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
  Menu,
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
  Crown,          // Added for locked/premium features
} from "lucide-react";

// Store & context hooks
import { useAuthStore } from "@/stores/authStore";
import { useTheme } from "@/context/ThemeContext";
import { useTranslation } from "react-i18next";
import useLanguage from "@/hooks/useLanguage";
import { useFeatureAccess } from "@/context/FeatureAccessContext";

// Service for unread message count
import { getUnreadCount } from "@/services/messagesService";

// Static configuration for role badges (color + label + icon)
const roleConfig = {
  "super-admin": { color: "bg-purple-600", label: "Super Admin", icon: Shield },
  admin:         { color: "bg-red-600",     label: "Admin",       icon: Settings },
  landlord:      { color: "bg-blue-600",    label: "Landlord",    icon: Building2 },
  artisan:       { color: "bg-amber-600",   label: "Artisan",     icon: Hammer },
  tenant:        { color: "bg-emerald-600", label: "Tenant",      icon: Home },
};

// Menu structure - now includes optional requiredFeature for premium gating
const roleMenus = {
  "super-admin": [
    { to: "/super-admin/overview",       labelKey: "Overview",           icon: <Home size={18} /> },
    { to: "/super-admin/users",          labelKey: "Manage Users",        icon: <Users size={18} /> },
    { to: "/super-admin/roles",          labelKey: "Role Delegation",     icon: <Settings size={18} /> },
    { to: "/super-admin/pricing",        labelKey: "Premium Pricing",     icon: <Crown size={18} /> },
    { to: "/super-admin/marketing",     labelKey: "Marketing",           icon: <Megaphone size={18} /> },
    { to: "/super-admin/audit",          labelKey: "Audit Logs",          icon: <FileText size={18} /> },
    { to: "/super-admin/announcements",  labelKey: "Announcements",      icon: <Megaphone size={18} /> },
    { to: "/super-admin/messages",       labelKey: "Messages",           icon: <MessageSquare size={18} />, hasMessages: true },
    { to: "/profile",                   labelKey: "Profile",           icon: <Users size={18} /> },
  ],
  admin: [
    { to: "/admin/overview",             labelKey: "Overview",           icon: <Home size={18} /> },
    { to: "/admin/approvals",            labelKey: "Pending Approvals",   icon: <AlertCircle size={18} /> },
    { to: "/admin/assigned-roles",      labelKey: "Assigned Roles",      icon: <Shield size={18} /> },
    { to: "/admin/marketing",           labelKey: "Marketing",           icon: <Megaphone size={18} /> },
    { to: "/admin/reports",              labelKey: "Reports",            icon: <FileText size={18} /> },
    { to: "/admin/messages",             labelKey: "Messages",           icon: <MessageSquare size={18} />, hasMessages: true },
    { to: "/profile",                   labelKey: "Profile",           icon: <Users size={18} /> },
  ],
  tenant: [
    { to: "/tenant/overview",            labelKey: "Overview",           icon: <Home size={18} /> },
    { to: "/tenant/properties",          labelKey: "Browse Properties",   icon: <Building2 size={18} /> },
    { to: "/tenant/rentals",             labelKey: "My Rentals",          icon: <FileText size={18} /> },
    { to: "/tenant/payments",            labelKey: "Payments",           icon: <Receipt size={18} /> },
    { to: "/tenant/maintenance",         labelKey: "Maintenance",        icon: <Wrench size={18} /> },
    { to: "/tenant/wishlist",            labelKey: "Wishlist",           icon: <Heart size={18} /> },
    { to: "/tenant/history",             labelKey: "RentalHistory",      icon: <History size={18} /> },
    { to: "/tenant/messages",            labelKey: "Messages",           icon: <MessageSquare size={18} />, hasMessages: true },
    { to: "/profile",                   labelKey: "Profile",           icon: <Users size={18} /> },
  ],
  landlord: [
    { to: "/landlord/overview",          labelKey: "Overview",           icon: <Home size={18} /> },
    { to: "/landlord/properties",        labelKey: "My Properties",       icon: <Building2 size={18} /> },
    { to: "/landlord/bookings",          labelKey: "Bookings",           icon: <Calendar size={18} /> },
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
    { to: "/landlord/messages",          labelKey: "Messages",           icon: <MessageSquare size={18} />, hasMessages: true },
    {
      to: "/landlord/ads",
      labelKey: "Promoted Ads",
      icon: <Megaphone size={18} />,
      requiredFeature: "advertisement_manager",
      premium: true,
    },
    { to: "/profile",                   labelKey: "Profile",           icon: <Users size={18} /> },
  ],
  artisan: [
    { to: "/artisan/overview",           labelKey: "Overview",           icon: <Home size={18} /> },
    { to: "/artisan/tasks",              labelKey: "Assigned Tasks",     icon: <Wrench size={18} /> },
    { to: "/artisan/earnings",           labelKey: "Earnings",           icon: <Receipt size={18} /> },
    { to: "/artisan/schedule",           labelKey: "Schedule",           icon: <Calendar size={18} /> },
    { to: "/artisan/messages",           labelKey: "Messages",           icon: <MessageSquare size={18} />, hasMessages: true },
    {
      to: "/artisan/ads",
      labelKey: "Promoted Ads",
      icon: <Megaphone size={18} />,
      requiredFeature: "advertisement_manager",
      premium: true,
    },
    { to: "/profile",                   labelKey: "Profile",           icon: <Users size={18} /> },
  ],
};

export default function Sidebar() {
  // Translation, routing, theme, language & feature access hooks
  const { t } = useTranslation();
  const location = useLocation();
  const { user } = useAuthStore();
  const { isDark, toggleTheme } = useTheme();
  const { language, setLanguage, availableLanguages } = useLanguage();
  const { can: canAccessFeature } = useFeatureAccess();

  // State management
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [unreadMessages, setUnreadMessages] = useState(0);
  const [showLangMenu, setShowLangMenu] = useState(false);

  // Determine current user role (fallback to tenant)
  const role = user?.role?.toLowerCase() || "tenant";
  const config = roleConfig[role] || roleConfig.tenant;

  // Fetch unread message count (with polling)
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
    const interval = setInterval(updateCount, 60000); // every 1 minute
    return () => clearInterval(interval);
  }, []);

  // Helper to check if current route matches menu item
  const isActive = useCallback(
    (path) => {
      const current = location.pathname;

      if (current === path) return true;

      // Special case for overview pages
      if (path.endsWith("/overview")) {
        const base = path.replace("/overview", "");
        return current === base || current === `${base}/`;
      }

      return current.startsWith(path);
    },
    [location.pathname]
  );

  // Get menu items for current role
  const menuItems = roleMenus[role] || roleMenus.tenant;

  // Filter menu items based on feature access
  const visibleMenuItems = menuItems.filter(
    (item) => !item.requiredFeature || canAccessFeature(item.requiredFeature)
  );

  return (
    <>
      {/* Mobile menu toggle button - visible only on small screens */}
      <button
        className="fixed top-4 left-4 z-50 p-2.5 bg-white/90 dark:bg-gray-800/90 backdrop-blur-md rounded-xl shadow-lg md:hidden border border-gray-200/50 dark:border-gray-700/50"
        onClick={() => setIsMobileOpen(true)}
        aria-label={t("openMenu")}
      >
        <Menu size={24} />
      </button>

      {/* Mobile overlay backdrop */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 md:hidden"
          onClick={() => setIsMobileOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Main sidebar container */}
      <aside
        className={`
          fixed md:sticky md:top-0 md:h-screen
          inset-y-0 left-0 z-50 flex flex-col
          bg-white/95 dark:bg-gray-900/95 backdrop-blur-lg
          border-r border-gray-200/60 dark:border-gray-700/60
          transition-all duration-300 ease-in-out
          ${isMobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
          ${isCollapsed ? "w-20" : "w-72"}
        `}
      >
        {/* Sidebar Header - Logo + Role badge + Collapse button */}
        <div className="relative p-5 border-b border-gray-200/60 dark:border-gray-700/60 shrink-0">
          {/* Collapse/Expand toggle (desktop only) */}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="absolute -right-3 top-1/2 -translate-y-1/2 hidden md:flex items-center justify-center w-7 h-7 bg-white dark:bg-gray-800 rounded-full shadow-lg border border-gray-200 dark:border-gray-700 hover:scale-105 transition"
            aria-label={isCollapsed ? t("expandSidebar") : t("collapseSidebar")}
          >
            {isCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
          </button>

          {/* Mobile close button */}
          <button
            className="absolute right-4 top-5 md:hidden p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
            onClick={() => setIsMobileOpen(false)}
            aria-label={t("closeMenu")}
          >
            <X size={20} />
          </button>

          <div className={`flex items-center gap-3 ${isCollapsed ? "justify-center" : ""}`}>
            {/* App logo */}
            <div className="w-10 h-10 bg-linear-to-br from-emerald-600 to-emerald-700 rounded-xl flex items-center justify-center shadow-md shrink-0">
              <span className="text-white font-bold text-base">RC</span>
            </div>

            {/* App name + role badge (hidden when collapsed) */}
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

        {/* Scrollable navigation section */}
        <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600 scrollbar-track-transparent">
          <nav className="px-3 py-6 space-y-1">
            {visibleMenuItems.map((item) => {
              const active = isActive(item.to);
              const showBadge = item.hasMessages && unreadMessages > 0;
              const isLocked = item.requiredFeature && !canAccessFeature(item.requiredFeature);

              return (
                <Link
                  key={item.to}
                  to={isLocked ? "/upgrade" : item.to}
                  onClick={(e) => {
                    if (isLocked) {
                      e.preventDefault();
                      // You can add toast/notification here if desired
                      // e.g. toast.info("Upgrade to access this feature");
                    }
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
                  {/* Icon - shows lock when feature is premium-locked */}
                  <span className={`shrink-0 ${active ? "text-white" : "text-gray-500 dark:text-gray-400"}`}>
                    {isLocked ? <Lock size={18} /> : item.icon}
                  </span>

                  {/* Label + Premium badge (hidden when collapsed) */}
                  {!isCollapsed && (
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      <span className="truncate">
                        {t(item.labelKey)}
                      </span>

                      {isLocked && (
                        <span className="ml-auto text-xs font-semibold px-2 py-0.5 bg-amber-500/20 text-amber-700 dark:text-amber-400 rounded-full">
                          Pro
                        </span>
                      )}
                    </div>
                  )}

                  {/* Unread messages badge */}
                  {showBadge && !isLocked && (
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 bg-red-500 text-white text-xs font-bold rounded-full min-w-6 h-6 px-1.5 flex items-center justify-center shadow-md animate-pulse">
                      {unreadMessages > 99 ? "99+" : unreadMessages}
                    </span>
                  )}

                  {/* Tooltip when sidebar is collapsed */}
                  {isCollapsed && (
                    <div className="absolute left-full ml-3 px-3 py-2 bg-gray-900/95 text-white text-sm rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 pointer-events-none whitespace-nowrap shadow-xl border border-gray-700/50">
                      {t(item.labelKey)}
                      {isLocked && " (Premium)"}
                      {showBadge && ` (${unreadMessages})`}
                    </div>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Bottom section - Language & Theme controls */}
        <div className="p-4 border-t border-gray-200/60 dark:border-gray-700/60 shrink-0">
          {/* Language selector dropdown */}
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

            {/* Language menu popup */}
            {showLangMenu && !isCollapsed && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setShowLangMenu(false)}
                />
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
                      {language === lang.code && (
                        <span className="text-emerald-600 dark:text-emerald-400">✓</span>
                      )}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Theme toggle switch */}
          <button
            onClick={toggleTheme}
            className="w-full flex items-center justify-between p-3 rounded-xl bg-gray-100/80 dark:bg-gray-800/60 hover:bg-gray-200/80 dark:hover:bg-gray-700/60 transition"
          >
            <span className="flex items-center gap-3 text-sm font-medium text-gray-700 dark:text-gray-300">
              {isDark ? <Sun size={18} /> : <Moon size={18} />}
              {!isCollapsed && <span>{isDark ? t("Light Mode") : t("Dark Mode")}</span>}
            </span>

            {/* Toggle switch visual */}
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