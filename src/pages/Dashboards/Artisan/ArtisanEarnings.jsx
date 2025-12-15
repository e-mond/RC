// src/pages/Dashboards/Artisan/ArtisanEarnings.jsx
import React from "react";
import AR_EarningsPanel from "./components/AR_EarningsPanel";

/**
 * ArtisanEarnings Page
 * - Full page wrapper for earnings summary
 */
export default function ArtisanEarnings() {
  return (
    <div className="p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Earnings Summary</h2>
        <p className="text-sm text-gray-600 dark:text-gray-400">View your earnings and payment history</p>
      </div>
      <AR_EarningsPanel />
    </div>
  );
}

