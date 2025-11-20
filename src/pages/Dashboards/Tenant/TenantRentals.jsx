// src/pages/Dashboards/Tenant/TenantRentals.jsx
import React from "react";
import TN_MyRentals from "./components/TN_MyRentals";

/**
 * TenantRentals Page
 * - Full page wrapper for rental management
 */
export default function TenantRentals() {
  return (
    <div className="p-6">
      <TN_MyRentals />
    </div>
  );
}

