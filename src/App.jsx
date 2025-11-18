import React, { Suspense } from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import { AnimatePresence } from "framer-motion";

// Public
import LandingPage from "@/pages/Landing/LandingPage";
import LearnMore from "@/pages/LearnMore/LearnMore";
import RoleSelection from "@/components/onboarding/RoleSelection";

// Auth
import Login from "@/pages/Auth/Login";
import Signup from "@/pages/Auth/Signup";
import ForgotPassword from "@/pages/Auth/ForgotPassword";
import ResetPassword from "@/pages/Auth/ResetPassword";

// Secure
import SecureRoutes from "@/routes/secureRoutes";

// Layouts
import PublicLayout from "@/components/layout/PublicLayout";

// 404
import NotFound from "@/pages/NotFound";

// Toast
import { Toaster } from "react-hot-toast";

// Dev Tools
import DebugToggle from "@/components/DebugToggle";
import RoleSwitcher from "@/components/RoleSwitcher";

        {/* Animate Wrapper */}
function AnimatedRoutes() {
  const location = useLocation();

  return (
    <AnimatePresence mode="popLayout" initial={false}>
      <Toaster position="top-right" />

      {/* Routes each has a unique key */}
      <Routes location={location} key={location.pathname}>
        {/* PUBLIC */}
        <Route element={<PublicLayout />}>
          <Route path="/" element={<LandingPage />} />
          <Route path="/learn-more" element={<LearnMore />} />
          <Route path="/role-selection" element={<RoleSelection />} />
        </Route>

        {/* AUTH */}
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />

        {/* SECURE */}
        <Route path="/dashboard/*" element={<SecureRoutes />} />
        <Route path="/admin/*" element={<SecureRoutes />} />

        {/* 404 */}
        <Route path="*" element={<NotFound />} />
      </Routes>

      {import.meta.env.DEV && (
        <div key="dev-tools-wrapper">
          <DebugToggle />
          <RoleSwitcher />
        </div>
      )}
    </AnimatePresence>
  );
}


        {/* App Root */}
export default function App() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-screen bg-[#f9fafb]">
          <div className="animate-spin w-10 h-10 border-4 border-[#0b6e4f] border-t-transparent rounded-full" />
        </div>
      }
    >
      <AnimatedRoutes />
    </Suspense>
  );
}
