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
        <h2 className="text-2xl font-bold text-[#0f1724]">Earnings Summary</h2>
        <p className="text-sm text-gray-600">View your earnings and payment history</p>
      </div>
      <AR_EarningsPanel />
    </div>
  );
}

