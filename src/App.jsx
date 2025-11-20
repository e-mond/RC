import React, { Suspense } from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import { Toaster } from "react-hot-toast";
import DemoModeBanner from "@/components/common/DemoModeBanner";

// Public Pages
import LandingPage from "@/pages/Landing/LandingPage";
import LearnMore from "@/pages/LearnMore/LearnMore";
import RoleSelection from "@/components/onboarding/RoleSelection";

import Blog from "@/pages/Blog";
import BlogPost from "@/pages/BlogPost";

// Auth Pages
import Login from "@/pages/Auth/Login";
import Signup from "@/pages/Auth/Signup";
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

function AnimatedRoutes() {
  const location = useLocation();

  return (
    <>
      <Toaster position="top-right" toastOptions={{ duration: 4000 }} />
      <DemoModeBanner />

      {/* Only wrap page transitions with AnimatePresence */}
      <AnimatePresence mode="wait" initial={false}>
        <Routes location={location} key={location.pathname || location.key || "route"}>
          {/* ====================== PUBLIC ROUTES ====================== */}
          <Route element={<PublicLayout />}>
            <Route path="/" element={<LandingPage />} />
            <Route path="/learn-more" element={<LearnMore />} />
            <Route path="/role-selection" element={<RoleSelection />} />

            {/* Blog - public */}
            <Route path="/blog" element={<Blog />} />
            <Route path="/blog/:slug" element={<BlogPost />} />
          </Route>

          {/* ====================== AUTH ROUTES ====================== */}
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
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

export default function App() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-gray-50">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-[#0b6e4f] border-t-transparent" />
        </div>
      }
    >
      <AnimatedRoutes />
    </Suspense>
  );
}
