// src/components/layout/DashboardLayout.jsx
import React from "react";
import PropTypes from "prop-types";
import Sidebar from "./Sidebar";
import Navbar from "./Navbar";

/**
 * DashboardLayout
 * - Shared layout for all role-based dashboards
 * - Includes Sidebar (collapsible), sticky Navbar, and optional aside
 * - Fully responsive, accessible, and dark-mode compatible
 */
export default function DashboardLayout({ children, aside }) {
  return (
    <div className="min-h-screen flex bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-gray-100">
      {/* Sidebar - Collapsible & Mobile Drawer */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col">
        {/* Sticky Navbar */}
        <Navbar />

        {/* Main Content */}
        <main
          className="flex-1 p-4 sm:p-6 lg:p-8 xl:p-10 overflow-y-auto"
          role="main"
          aria-label="Dashboard content"
        >
          <div className="max-w-7xl mx-auto w-full">
            {children}
          </div>
        </main>
      </div>

      {/* Optional Aside Panel - Hidden on <xl, visible on xl+ */}
      {aside && (
        <aside
          className="hidden xl:block w-80 border-l border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-4 lg:p-6 overflow-y-auto"
          aria-label="Additional information panel"
        >
          {aside}
        </aside>
      )}
    </div>
  );
}

// PropTypes
DashboardLayout.propTypes = {
  children: PropTypes.node.isRequired,
  aside: PropTypes.node,
};

DashboardLayout.defaultProps = {
  aside: null,
};