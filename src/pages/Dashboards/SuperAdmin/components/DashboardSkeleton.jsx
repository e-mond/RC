// src/pages/Dashboards/SuperAdmin/components/DashboardSkeleton.jsx
/**
 * DashboardSkeleton
 * - Full loading skeleton for Super Admin dashboard
 * - Ghana-ready, dark mode, accessible
 * - 100% unique keys using static strings
 * - No React warnings in dev
 */

import React from "react";

export default function DashboardSkeleton() {
  return (
    <div className="space-y-8 animate-pulse">
      {/* Header */}
      <div className="space-y-2">
        <div className=" h-8 bg-gray-200 dark:bg-gray-700 rounded w-64" />
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-96" />
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {["users", "properties", "revenue", "requests"].map((id) => (
          <div
            key={id}
            className="bg-white dark:bg-gray-900 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700"
          >
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24 mb-2" />
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-32" />
          </div>
        ))}
      </div>

      {/* System Health */}
      <div className="bg-white dark:bg-gray-900 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-48 mb-4" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {["cpu", "memory", "latency", "uptime"].map((id) => (
            <div key={id}>
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-20 mb-2" />
              <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-16" />
            </div>
          ))}
        </div>
      </div>

      {/* Chart */}
      <div className="bg-white dark:bg-gray-900 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-64 mb-4" />
        <div className="h-64 bg-gray-100 dark:bg-gray-800 rounded-lg" />
      </div>

      {/* User Table */}
      <div className="bg-white dark:bg-gray-900 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-48 mb-4" />
        <div className="space-y-3">
          {["user1", "user2", "user3", "user4", "user5"].map((id) => (
            <div
              key={id}
              className="flex items-center justify-between py-3 border-b border-gray-200 dark:border-gray-700 last:border-0"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-full" />
                <div>
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-32 mb-1" />
                  <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-40" />
                </div>
              </div>
              <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-20" />
            </div>
          ))}
        </div>
      </div>

      {/* Activity Feed */}
      <div className="bg-white dark:bg-gray-900 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-48 mb-4" />
        <div className="space-y-4">
          {["act1", "act2", "act3"].map((id) => (
            <div key={id} className="flex items-start gap-3">
              <div className="w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded-full" />
              <div className="flex-1">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-64 mb-2" />
                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-32" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}