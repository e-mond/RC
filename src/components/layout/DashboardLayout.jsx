// src/components/layout/DashboardLayout.jsx
import React from "react";
import PropTypes from "prop-types";
import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import Navbar from "./Navbar";
import AdBanner from "@/pages/Ads/AdBanner";

/**
 * Main dashboard wrapper for all authenticated roles
 * - Responsive sidebar + sticky navbar
 * - Optional right aside panel (visible ≥xl)
 * - Contains global ad banner position
 */
export default function DashboardLayout({ children, aside }) {
  const content = children ?? <Outlet />;

  return (
    <div className="flex min-h-screen bg-gray-50/50 dark:bg-gray-950/50">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Column */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Navbar */}
        <Navbar />

        {/* Content */}
        <main
          className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 xl:p-10"
          role="main"
          aria-label="Dashboard main content"
        >
          <div className="max-w-7xl mx-auto w-full space-y-8">
            {content}
            <AdBanner position="bottom" />
          </div>
        </main>
      </div>

      {/* Optional Right Aside (large screens only) */}
      {aside && (
        <aside
          className="hidden xl:block w-80 2xl:w-96 border-l border-gray-200/60 dark:border-gray-700/60 bg-white/70 dark:bg-gray-900/70 backdrop-blur-sm overflow-y-auto"
          aria-label="Contextual information panel"
        >
          <div className="p-5 lg:p-6">{aside}</div>
        </aside>
      )}
    </div>
  );
}

DashboardLayout.propTypes = {
  children: PropTypes.node,
  aside: PropTypes.node,
};

DashboardLayout.defaultProps = {
  children: null,
  aside: null,
};