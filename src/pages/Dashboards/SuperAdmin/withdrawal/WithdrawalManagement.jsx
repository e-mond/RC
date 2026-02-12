// src/pages/Dashboards/SuperAdmin/withdrawal/WithdrawalManagement.jsx
import { useState, useEffect } from "react";
import SA_WithdrawalApprovals from "@/pages/Dashboards/SuperAdmin/components/SA_WithdrawalApprovals";
import SA_SystemWithdrawalModal from "@/pages/Dashboards/SuperAdmin/components/SA_SystemWithdrawalModal";
import { getWallet } from "@/services/walletService";
import { Wallet, Loader2 } from "lucide-react";
import PageHeader from "@/modules/dashboard/PageHeader";
import SectionCard from "@/modules/dashboard/SectionCard";

export default function WithdrawalManagement() {
  const [systemWithdrawOpen, setSystemWithdrawOpen] = useState(false);
  const [systemWallet, setSystemWallet] = useState(null);
  const [loadingWallet, setLoadingWallet] = useState(true);

  useEffect(() => {
    const fetchSystemWallet = async () => {
      try {
        setLoadingWallet(true);
        const wallet = await getWallet();
        setSystemWallet(wallet);
      } catch (err) {
        console.error("Failed to load system wallet:", err);
      } finally {
        setLoadingWallet(false);
      }
    };

    fetchSystemWallet();
  }, []);

  // Simple skeleton loader component
  const SkeletonLoader = () => (
    <div className="space-y-8 animate-pulse">
      {/* Header skeleton */}
      <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded-lg w-3/4 max-w-xs" />
      
      {/* Pending Withdrawals skeleton */}
      <div className="space-y-4">
        <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded-lg w-1/2" />
        <div className="space-y-3">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-28 bg-gray-200 dark:bg-gray-700 rounded-xl" />
          ))}
        </div>
      </div>

      {/* System Actions skeleton */}
      <div className="space-y-4">
        <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded-lg w-1/2" />
        <div className="h-32 bg-gray-200 dark:bg-gray-700 rounded-xl" />
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 pb-16 md:pb-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 md:py-10 space-y-8 md:space-y-10">
        {/* Page Header */}
        <PageHeader
          title="Withdrawal Management"
          subtitle="Review and process withdrawal requests • System wallet control"
          badge="Finance"
          align="between"
        />

        {loadingWallet ? (
          <SkeletonLoader />
        ) : (
          <>
            {/* Pending Withdrawals Section */}
            <SectionCard
              title="Pending Withdrawals"
              description="Review, approve or reject user withdrawal requests"
              className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl shadow-sm dark:shadow-none"
            >
              <div className="min-h-[300px]">
                <SA_WithdrawalApprovals />
              </div>
            </SectionCard>

            {/* System Actions Section */}
            <SectionCard
              title="System Actions"
              description="Perform manual system-level withdrawals or adjustments"
              className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl shadow-sm dark:shadow-none"
            >
              <div className="p-5 sm:p-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                      System Wallet Balance
                    </p>
                    <p className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
                      {systemWallet?.balance ?? "—"} {systemWallet?.currency || "GHS"}
                    </p>
                  </div>

                  <button
                    onClick={() => setSystemWithdrawOpen(true)}
                    disabled={!systemWallet}
                    className="inline-flex items-center justify-center gap-2 px-6 py-3 text-base font-medium text-red-700 dark:text-red-300 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl hover:bg-red-100 dark:hover:bg-red-900/40 transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed min-h-12 touch-manipulation w-full sm:w-auto"
                    aria-label="Initiate system withdrawal"
                  >
                    <Wallet className="w-5 h-5" />
                    Initiate System Withdrawal
                  </button>
                </div>

                <p className="mt-6 pt-4 text-sm text-gray-500 dark:text-gray-400 border-t border-gray-200 dark:border-gray-700">
                  Use this section only for emergency adjustments or manual transfers. All actions are logged and audited.
                </p>
              </div>
            </SectionCard>
          </>
        )}
      </div>

      {/* System Withdrawal Modal */}
      <SA_SystemWithdrawalModal
        isOpen={systemWithdrawOpen}
        onClose={() => setSystemWithdrawOpen(false)}
        onSuccess={() => {
          getWallet().then(setSystemWallet).catch(() => {});
        }}
        systemBalance={systemWallet?.balance || 0}
      />
    </div>
  );
}