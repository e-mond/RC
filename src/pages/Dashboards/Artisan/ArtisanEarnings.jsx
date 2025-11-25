// src/pages/Dashboards/Artisan/ArtisanEarnings.jsx
import React from "react";
import AR_EarningsPanel from "./components/AR_EarningsPanel";

export default function ArtisanEarnings() {
  return (
    <div className="p-6 sm:p-8 max-w-7xl mx-auto">
      {/* Premium Page Header */}
      <header className="mb-10">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
          Earnings Summary
        </h2>
        <p className="mt-2 text-base text-gray-600 dark:text-gray-400">
          Track your income, completed jobs, and payout history
        </p>
      </header>

      {/* Content Card */}
      <div
        className="
          bg-white/80 dark:bg-gray-800/70 
          backdrop-blur-xl 
          rounded-2xl 
          shadow-xl dark:shadow-2xl 
          border border-gray-200 dark:border-gray-700 
          overflow-hidden 
          ring-1 ring-black/5 dark:ring-white/10
        "
      >
        <AR_EarningsPanel />
      </div>
    </div>
  );
}