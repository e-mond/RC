// src/pages/Dashboards/Admin/AdminApprovals.jsx
import AD_UserApprovals from "./AD_UserApprovals";
import AD_PropertyApprovals from "./AD_PropertyApprovals";
import { useAuthStore } from "@/stores/authStore";
import PageHeader from "@/modules/dashboard/PageHeader";
import SectionCard from "@/modules/dashboard/SectionCard";

/**
 * AdminApprovals
 * Single workspace for all approvals (users + properties)
 * - Shows sections based on permissions
 */
export default function AdminApprovals() {
  const { user } = useAuthStore();
  const permissions = user?.permissions || {};

  return (
    <div className="space-y-6">
      <PageHeader title="Approvals" subtitle="Review new users and property listings awaiting approval." />

      {permissions.canApproveUsers ? (
        <SectionCard title="User Approvals" description="Pending account verifications">
          <AD_UserApprovals />
        </SectionCard>
      ) : (
        <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-4 text-sm text-yellow-800">
          You don't have permission to approve users.
        </div>
      )}

      {permissions.canApproveProperties ? (
        <SectionCard title="Property Approvals" description="Listings awaiting moderation">
          <AD_PropertyApprovals />
        </SectionCard>
      ) : (
        <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-4 text-sm text-yellow-800">
          You don't have permission to approve properties.
        </div>
      )}
    </div>
  );
}
