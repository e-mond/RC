// src/pages/Dashboards/Tenant/TenantRentals.jsx
import React from "react";
import TN_MyRentals from "./components/TN_MyRentals";
import PageHeader from "@/modules/dashboard/PageHeader";

export default function TenantRentals() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <PageHeader
          title="My Rentals"
          subtitle="View and manage your active leases, upcoming payments, and rental history."
          align="start"
        />

        {/* Main Content */}
        <div className="mt-8">
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm dark:shadow-none border border-gray-200 dark:border-gray-800 overflow-hidden">
            <TN_MyRentals />
          </div>
        </div>
      </div>
    </div>
  );
}