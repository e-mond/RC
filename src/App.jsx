/**
 * App.jsx - Main Application Component
 * 
 * This is the root component of the RentalConnects application. It handles:
 * - Route configuration (public, auth, protected routes)
 * - Global notification polling and audio alerts
 * - Page transitions with Framer Motion
 * - Development tools (DebugToggle, RoleSwitcher) in dev mode
 * - Global announcement banner display
 * 
 * Architecture:
 * - Uses React Router v7 for client-side routing
 * - Implements route protection via SecureRoutes component
 * - Polls notifications/announcements every 45 seconds when authenticated
 * - Plays audio alerts for new notifications/announcements
 * 
 * @module App
 * @requires react
 * @requires react-router-dom
 * @requires framer-motion
 * @requires react-hot-toast
 */

// src/App.jsx
import React, { Suspense, useEffect, useState } from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import { Toaster } from "react-hot-toast";


// Public Pages
import LandingPage from "@/pages/Landing/LandingPage";
import LearnMore from "@/pages/LearnMore/LearnMore";
import RoleSelection from "@/components/onboarding/RoleSelection";
import PublicProperties from "@/pages/Landing/PublicProperties";
import PropertyDetail from "@/pages/PropertyDetail";
import Blog from "@/pages/Blog";
import BlogPost from "@/pages/BlogPost";

// Auth Pages
import Login from "@/pages/Auth/Login";
import Signup from "@/pages/Auth/Signup";
import SignupSuccess from "@/pages/Auth/SignupSuccess";
import ForgotPassword from "@/pages/Auth/ForgotPassword";
import ResetPassword from "@/pages/Auth/ResetPassword";

// Secure Routes (all protected dashboard & app pages)
import SecureRoutes from "@/routes/secureRoutes";

// Layouts
import PublicLayout from "@/components/layout/PublicLayout";

// 404
import NotFound from "@/pages/NotFound";

// Dev Tools (only in development)
import DebugToggle from "@/components/DebugToggle";
import RoleSwitcher from "@/components/RoleSwitcher";

// NEW: Global Announcement Banner + Audio Notifications
import AnnouncementBanner from "@/components/AnnouncementBanner";
import { getNotifications } from "@/services/notificationService";
import { getAnnouncements } from "@/services/announcementService";
import { useAuthStore } from "@/stores/authStore";

/**
 * Audio notification URLs
 * These are external MP3 files used for audio alerts when new notifications
 * or announcements arrive. Can be replaced with local assets if needed.
 */
const NOTIFICATION_SOUND = "https://notificationsounds.com/storage/sounds/file-sounds-1141-unconvinced.mp3"; // Soft modern ding
const ANNOUNCEMENT_SOUND = "https://orangefreesounds.com/wp-content/uploads/2023/07/Announcement-chime-sound-effect.mp3"; // Elegant chime

/**
 * AnimatedRoutes Component
 * 
 * Handles route rendering with page transitions and global features:
 * - Notification/announcement polling (every 45 seconds)
 * - Audio alerts for new content
 * - Global announcement banner
 * - Toast notifications
 * - Development tools (dev mode only)
 * 
 * @returns {JSX.Element} Application routes with animations
 */
function AnimatedRoutes() {
  const location = useLocation();
  const { user, isAuthenticated } = useAuthStore();

  const [lastNotifCount, setLastNotifCount] = useState(0);
  const [lastAnnounceCount, setLastAnnounceCount] = useState(0);

  /**
   * Polling Effect: Check for new notifications and announcements
   * 
   * Runs every 45 seconds when user is authenticated:
   * - Fetches notifications and announcements
   * - Compares counts with previous check
   * - Plays audio alert if new items detected
   * - Updates state for next comparison
   * 
   * @effect Runs on mount and when authentication state changes
   */
  useEffect(() => {
    if (!isAuthenticated || !user) return;

    const playSound = (url) => {
      const audio = new Audio(url);
      audio.volume = 0.7;
      audio.play().catch((e) => console.log("Audio play failed:", e));
    };

    const checkForUpdates = async () => {
      try {
        const [notifs, announces] = await Promise.all([
          getNotifications(),
          getAnnouncements(),
        ]);

        const newNotifCount = notifs?.results?.length || notifs?.length || 0;
        const newAnnounceCount = announces?.length || 0;

        // Play different sounds based on type
        if (newNotifCount > lastNotifCount) {
          playSound(NOTIFICATION_SOUND);
        }
        if (newAnnounceCount > lastAnnounceCount) {
          playSound(ANNOUNCEMENT_SOUND);
        }

        setLastNotifCount(newNotifCount);
        setLastAnnounceCount(newAnnounceCount);
      } catch (err) {
        console.warn("Failed to poll notifications/announcements:", err);
      }
    };

    // Initial check + polling every 45 seconds
    checkForUpdates();
    const interval = setInterval(checkForUpdates, 45000);

    return () => clearInterval(interval);
  }, [isAuthenticated, user, lastNotifCount, lastAnnounceCount]);

  return (
    <>
      <Toaster position="top-right" toastOptions={{ duration: 4000 }} />

      {/* Global Announcement Banner - high priority, shows on login for new announcements */}
      {isAuthenticated && <AnnouncementBanner />}

      {/* Page transitions */}
      <AnimatePresence mode="wait" initial={false}>
        <Routes location={location} key={location.pathname || location.key || "route"}>
          {/* ====================== PUBLIC ROUTES ====================== */}
          <Route element={<PublicLayout />}>
            <Route path="/" element={<LandingPage />} />
            <Route path="/properties" element={<PublicProperties />} />
            <Route path="/properties/:id" element={<PropertyDetail />} />
            <Route path="/learn-more" element={<LearnMore />} />
            <Route path="/role-selection" element={<RoleSelection />} />
            {/* Blog - public */}
            <Route path="/blog" element={<Blog />} />
            <Route path="/blog/:slug" element={<BlogPost />} />
          </Route>

          {/* ====================== AUTH ROUTES ====================== */}
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/signup-success" element={<SignupSuccess />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password/:token" element={<ResetPassword />} />

          {/* ====================== PROTECTED ROUTES ====================== */}
          <Route path="/*" element={<SecureRoutes />} />

          {/* ====================== 404 ====================== */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </AnimatePresence>

      {/* Dev tools only in development */}
      {import.meta.env.DEV && (
        <div className="fixed bottom-4 left-4 z-50 flex flex-col gap-2">
          <DebugToggle key="debug-toggle" />
          <RoleSwitcher key="role-switcher" />
        </div>
      )}
    </>
  );
}

/**
 * App Component (Root)
 * 
 * Main application wrapper with Suspense boundary for code splitting.
 * Provides loading fallback during lazy route loading.
 * 
 * @returns {JSX.Element} Suspense-wrapped application routes
 */
export default function App() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-gray-900">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-[#0b6e4f] border-t-transparent" />
        </div>
      }
    >
      <AnimatedRoutes />
    </Suspense>
  );
}