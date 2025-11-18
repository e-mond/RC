import React from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import AR_AssignedTasks from "./components/AR_AssignedTasks";
import AR_EarningsPanel from "./components/AR_EarningsPanel";

/**
 * ArtisanDashboard
 */
export default function ArtisanDashboard(){
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <AR_AssignedTasks />
        <AR_EarningsPanel />
      </div>
    </DashboardLayout>
  );
}
