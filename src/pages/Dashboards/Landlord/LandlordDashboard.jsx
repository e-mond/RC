// src/pages/Dashboard/LandlordDashboard.jsx
import React from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import LL_PropertiesList from "./components/LL_PropertiesList";
import LL_MaintenanceRequests from "./components/LL_MaintenanceRequests";

export default function LandlordDashboard() {
  return (
    <DashboardLayout
      aside={
        <div className="space-y-4">
          <h3 className="font-semibold text-lg">Quick Stats</h3>
          <div className="bg-linear-to-r from-[#0b6e4f] to-[#095c42] text-white p-4 rounded-xl">
            <p className="text-2xl font-bold">12</p>
            <p className="text-sm opacity-90">Active Properties</p>
          </div>
          <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-xl">
            <p className="text-2xl font-bold text-[#0b6e4f]">GHS 8,500</p>
            <p className="text-sm text-gray-600 dark:text-gray-400">Monthly Revenue</p>
          </div>
        </div>
      }
    >
      <div className="space-y-8">
        <header>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
            Welcome back, Landlord
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Manage your properties and tenant requests
          </p>
        </header>

        <LL_PropertiesList />
        <LL_MaintenanceRequests />
      </div>
    </DashboardLayout>
  );
}