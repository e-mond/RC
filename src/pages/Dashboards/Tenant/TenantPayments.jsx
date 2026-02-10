// src/pages/Dashboards/Tenant/TenantPayments.jsx
import React, { useEffect, useState } from "react";
import { fetchTenantRentals, getPaymentHistory, getPaymentReceipt } from "@/services/tenantService";
import { getWallet } from "@/services/walletService";
import RentPaymentModal from "@/components/tenant/RentPaymentModal";
import WalletDisplay from "@/components/common/WalletDisplay";
import WalletTopUpModal from "@/components/common/WalletTopUpModal";
import { motion } from "framer-motion";
import { Download, Receipt, CreditCard, Smartphone, CheckCircle, Clock, XCircle, Wallet, AlertTriangle, RefreshCw } from "lucide-react";
import { useFeatureAccess } from "@/context/FeatureAccessContext";
import { useAuthStore } from "@/stores/authStore";

/**
 * TenantPayments Page
 * - Displays pending rent and payment history.
 * - Now includes Wallet Balance and Top-up functionality.
 */
export default function TenantPayments() {
  const { user } = useAuthStore();
  const { isPremium } = useFeatureAccess();

  const [rentals, setRentals] = useState([]);
  const [paymentHistory, setPaymentHistory] = useState([]);
  const [wallet, setWallet] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Modal states
  const [activeRental, setActiveRental] = useState(null);
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [topUpModalOpen, setTopUpModalOpen] = useState(false);
  const [processingPayment, setProcessingPayment] = useState(false);

  const [activeTab, setActiveTab] = useState("due"); // 'due', 'history', 'wallet'

  const loadData = async () => {
    try {
      setLoading(true);
      setError("");

      const [rentalsData, historyData, walletData] = await Promise.all([
        fetchTenantRentals(),
        isPremium ? getPaymentHistory().catch(() => []) : Promise.resolve([]),
        getWallet().catch(() => null)
      ]);

      setRentals(Array.isArray(rentalsData) ? rentalsData : []);
      setPaymentHistory(Array.isArray(historyData) ? historyData : []);
      setWallet(walletData);

    } catch (err) {
      console.error("TenantPayments.loadData:", err);
      setError("We're having trouble loading your payment information. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [isPremium]);

  const handleTransactionSuccess = () => {
    loadData();
  };

  const openPayment = (rental) => {
    setActiveRental(rental);
    setPaymentModalOpen(true);
  };

  const handleMakePayment = async () => {
    setProcessingPayment(true);
    try {
      setPaymentModalOpen(false);
      setActiveRental(null);
      await loadData(); // Refresh data
    } catch (err) {
      setError("Your payment couldn't be processed right now. Please try again shortly.");
    } finally {
      setProcessingPayment(false);
    }
  };

  const handleDownloadReceipt = async (paymentId) => {
    try {
      const blob = await getPaymentReceipt(paymentId);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `receipt-${paymentId}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      console.error("Download receipt:", err);
      alert("Failed to download receipt");
    }
  };

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Payments & Wallet</h2>
          <p className="text-sm text-gray-600 dark:text-gray-400">View rent, history, and manage your wallet</p>
        </div>
        {wallet && (
          <div className="flex items-center gap-3 bg-white dark:bg-gray-800 p-2 pr-4 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm">
            <div className="p-2 bg-[#0b6e4f]/10 rounded-full">
              <Wallet className="w-5 h-5 text-[#0b6e4f]" />
            </div>
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400">Wallet Balance</p>
              <p className="font-bold text-gray-900 dark:text-white">
                ₵{(wallet.balance || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </p>
            </div>
            <button
              onClick={() => setTopUpModalOpen(true)}
              className="ml-2 text-xs font-medium text-[#0b6e4f] hover:underline"
            >
              Top Up
            </button>
          </div>
        )}
      </header>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-gray-200 dark:border-gray-700 overflow-x-auto">
        <button
          onClick={() => setActiveTab("due")}
          className={`px-4 py-2 font-medium transition-colors border-b-2 whitespace-nowrap ${activeTab === "due"
            ? "text-[#0b6e4f] border-[#0b6e4f]"
            : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white border-transparent"
            }`}
        >
          Payments Due
        </button>
        {isPremium && (
          <button
            onClick={() => setActiveTab("history")}
            className={`px-4 py-2 font-medium transition-colors border-b-2 whitespace-nowrap ${activeTab === "history"
              ? "text-[#0b6e4f] border-[#0b6e4f]"
              : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white border-transparent"
              }`}
          >
            Payment History
          </button>
        )}
        <button
          onClick={() => setActiveTab("wallet")}
          className={`px-4 py-2 font-medium transition-colors border-b-2 whitespace-nowrap ${activeTab === "wallet"
            ? "text-[#0b6e4f] border-[#0b6e4f]"
            : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white border-transparent"
            }`}
        >
          Wallet Settings
        </button>
      </div>

      {error && (
        <div className="p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-300 rounded-lg text-sm flex items-center gap-3">
          <AlertTriangle className="w-5 h-5 flex-shrink-0" />
          <div className="flex-1">
            <p className="font-medium">Something went wrong</p>
            <p className="text-xs text-amber-700 dark:text-amber-400 mt-0.5">{error}</p>
          </div>
          <button
            onClick={loadData}
            className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium bg-amber-100 dark:bg-amber-800/30 rounded-lg hover:bg-amber-200 dark:hover:bg-amber-800/50 transition-colors"
          >
            <RefreshCw className="w-3 h-3" />
            Retry
          </button>
        </div>
      )}

      {loading ? (
        <PaymentsSkeleton />
      ) : activeTab === "due" ? (
        rentals.length === 0 ? (
          <NoPaymentsState />
        ) : (
          <motion.div className="space-y-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            {rentals.map((rental) => (
              <PaymentCard key={rental.id || rental.rentalId} rental={rental} onPay={openPayment} />
            ))}
          </motion.div>
        )
      ) : activeTab === "history" ? (
        <PaymentHistoryTab
          payments={paymentHistory}
          onDownloadReceipt={handleDownloadReceipt}
          isPremium={isPremium}
        />
      ) : (
        <div className="max-w-2xl">
          <WalletDisplay
            wallet={wallet}
            showSetupButton={true}
            onTopUpClick={() => setTopUpModalOpen(true)}
            onSetupClick={() => { }}
          />
        </div>
      )}

      <RentPaymentModal
        open={paymentModalOpen}
        onClose={() => {
          setPaymentModalOpen(false);
          setActiveRental(null);
          setError("");
        }}
        rental={activeRental}
        onPay={handleMakePayment}
        loading={processingPayment}
      />

      <WalletTopUpModal
        isOpen={topUpModalOpen}
        onClose={() => setTopUpModalOpen(false)}
        onSuccess={handleTransactionSuccess}
        user={user}
        currentBalance={wallet?.balance || 0}
      />
    </div>
  );
}

// Helper Components
function PaymentsSkeleton() {
  return (
    <div className="space-y-4">
      {[...Array(3)].map((_, i) => (
        <div key={i} className="border border-gray-200 dark:border-gray-700 rounded-lg p-5 bg-white dark:bg-gray-800 shadow-sm animate-pulse">
          <div className="flex justify-between">
            <div className="space-y-3 flex-1">
              <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-3/4" />
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2" />
            </div>
            <div className="h-10 w-24 bg-gray-200 dark:bg-gray-700 rounded" />
          </div>
        </div>
      ))}
    </div>
  );
}

function NoPaymentsState() {
  return (
    <div className="text-center py-20 bg-gray-50 dark:bg-gray-800/50 rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-600">
      <div className="mx-auto w-24 h-24 bg-gray-200 dark:bg-gray-700 rounded-full mb-6" />
      <h3 className="text-xl font-semibold text-gray-900 dark:text-white">No Payments Due</h3>
      <p className="text-gray-600 dark:text-gray-400 mt-3 max-w-md mx-auto">
        You're all caught up! No pending rent payments found.
      </p>
    </div>
  );
}

function PaymentCard({ rental, onPay }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      className="border border-gray-200 dark:border-gray-700 rounded-lg p-6 bg-white dark:bg-gray-800 shadow-sm hover:shadow-lg dark:hover:shadow-2xl transition-all"
    >
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h3 className="font-bold text-lg text-gray-900 dark:text-white">
            {rental.title || rental.propertyName || "Unnamed Property"}
          </h3>
          <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">
            {rental.address || rental.location || "No location provided"}
          </p>
          <div className="mt-3 flex flex-wrap gap-4 text-sm">
            <span>
              <span className="font-semibold text-[#0b6e4f]">
                ₵{rental.nextDueAmount || rental.amount || "0.00"}
              </span>{" "}
              due on{" "}
              <span className="text-gray-500 dark:text-gray-400">
                {rental.nextDueDate || rental.dueDate || "N/A"}
              </span>
            </span>
            <span className="text-gray-500 dark:text-gray-400">
              Status: <span className="font-medium">{rental.status || "Active"}</span>
            </span>
          </div>
        </div>
        <button
          onClick={() => onPay(rental)}
          className="px-5 py-2.5 bg-[#0b6e4f] text-white rounded-lg hover:bg-[#095c42] font-medium transition whitespace-nowrap"
        >
          Make Payment
        </button>
      </div>
    </motion.div>
  );
}

function PaymentHistoryTab({ payments, onDownloadReceipt, isPremium }) {
  if (!isPremium) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-12 text-center border border-gray-200 dark:border-gray-700">
        <div className="mx-auto w-24 h-24 bg-[#0b6e4f]/10 dark:bg-[#0b6e4f]/20 rounded-full flex items-center justify-center mb-6">
          <Receipt className="w-12 h-12 text-[#0b6e4f]" />
        </div>
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Premium Feature</h3>
        <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-md mx-auto">
          Payment history is available with a Premium subscription. Upgrade to access this feature.
        </p>
        <button className="px-6 py-3 bg-[#0b6e4f] text-white rounded-lg hover:bg-[#095c42] transition-colors font-medium">
          Upgrade to Premium
        </button>
      </div>
    );
  }

  if (payments.length === 0) {
    return (
      <div className="text-center py-20 bg-gray-50 dark:bg-gray-800/50 rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-600">
        <div className="mx-auto w-24 h-24 bg-gray-200 dark:bg-gray-700 rounded-full mb-6" />
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white">No Payment History</h3>
        <p className="text-gray-600 dark:text-gray-400 mt-3 max-w-md mx-auto">
          Any payments you make will appear here.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {payments.map((payment) => (
        <PaymentHistoryCard
          key={payment.id}
          payment={payment}
          onDownloadReceipt={onDownloadReceipt}
        />
      ))}
    </div>
  );
}

function PaymentHistoryCard({ payment, onDownloadReceipt }) {
  const statusConfig = {
    completed: { color: "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300", icon: CheckCircle },
    pending: { color: "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300", icon: Clock },
    failed: { color: "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300", icon: XCircle },
    processing: { color: "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300", icon: Clock },
  };

  const status = payment.status || "pending";
  const config = statusConfig[status] || statusConfig.pending;
  const StatusIcon = config.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 hover:shadow-md dark:hover:shadow-2xl transition-shadow"
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <h3 className="font-semibold text-lg text-gray-900 dark:text-white">
              {payment.propertyName || payment.propertyTitle || "Rental Payment"}
            </h3>
            <span className={`px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${config.color}`}>
              <StatusIcon size={14} />
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </span>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600 dark:text-gray-400">
            <div>
              <span className="font-medium">Amount:</span>{" "}
              <span className="text-[#0b6e4f] font-semibold">
                ₵{payment.amount?.toLocaleString() || "0.00"}
              </span>
            </div>
            <div className="flex items-center gap-1">
              {payment.method === "card" ? (
                <CreditCard size={14} className="text-gray-500 dark:text-gray-400" />
              ) : (
                <Smartphone size={14} className="text-gray-500 dark:text-gray-400" />
              )}
              <span className="font-medium capitalize">{payment.method || "Unknown"}</span>
            </div>
            <div>
              <span className="font-medium">Date:</span>{" "}
              {payment.paidAt ? new Date(payment.paidAt).toLocaleDateString() : "N/A"}
            </div>
            {payment.transactionId && (
              <div>
                <span className="font-medium">Transaction:</span> {payment.transactionId.slice(0, 8)}...
              </div>
            )}
          </div>
        </div>
        {payment.status === "completed" && (
          <button
            onClick={() => onDownloadReceipt(payment.id)}
            className="ml-4 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300"
          >
            <Download size={16} />
            Receipt
          </button>
        )}
      </div>
    </motion.div>
  );
}