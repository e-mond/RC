// src/pages/Dashboards/Tenant/TenantPayments.jsx
import React, { useEffect, useState } from "react";
import { fetchTenantRentals, getPaymentHistory, getPaymentReceipt } from "@/services/tenantService";
import RentPaymentModal from "@/components/tenant/RentPaymentModal";
import { motion } from "framer-motion";
import { Download, Receipt, CreditCard, Smartphone, CheckCircle, Clock, XCircle } from "lucide-react";
import { useFeatureStore } from "@/stores/featureStore";

/**
 * TenantPayments Page - Full Dark Mode Support
 */
export default function TenantPayments() {
  const isPremium = useFeatureStore((state) => state.isPremium());
  const [rentals, setRentals] = useState([]);
  const [paymentHistory, setPaymentHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeRental, setActiveRental] = useState(null);
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [processingPayment, setProcessingPayment] = useState(false);
  const [activeTab, setActiveTab] = useState("due");

  useEffect(() => {
    let isMounted = true;
    const loadData = async () => {
      try {
        setLoading(true);
        setError("");
        const [rentalsData, historyData] = await Promise.all([
          fetchTenantRentals(),
          isPremium ? getPaymentHistory().catch(() => []) : Promise.resolve([]),
        ]);
        if (isMounted) {
          setRentals(Array.isArray(rentalsData) ? rentalsData : []);
          setPaymentHistory(Array.isArray(historyData) ? historyData : []);
        }
      } catch (err) {
        if (isMounted) setError(err.message || "Failed to load payments");
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    loadData();
    return () => { isMounted = false; };
  }, [isPremium]);

  const openPayment = (rental) => {
    setActiveRental(rental);
    setPaymentModalOpen(true);
  };

  const handleMakePayment = async () => {
    setProcessingPayment(true);
    try {
      setPaymentModalOpen(false);
      setActiveRental(null);
      const updated = await fetchTenantRentals();
      setRentals(Array.isArray(updated) ? updated : []);
    } catch (err) {
      setError(err.message || "Payment failed");
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
      <header>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Payments</h2>
        <p className="text-sm text-gray-600 dark:text-gray-400">View and manage your rental payments</p>
      </header>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-gray-200 dark:border-gray-700">
        <button
          onClick={() => setActiveTab("due")}
          className={`px-4 py-2 font-medium transition-colors border-b-2 ${
            activeTab === "due"
              ? "text-[#0b6e4f] border-[#0b6e4f]"
              : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white border-transparent"
          }`}
        >
          Payments Due
        </button>
        {isPremium && (
          <button
            onClick={() => setActiveTab("history")}
            className={`px-4 py-2 font-medium transition-colors border-b-2 ${
              activeTab === "history"
                ? "text-[#0b6e4f] border-[#0b6e4f]"
                : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white border-transparent"
            }`}
          >
            Payment History
          </button>
        )}
      </div>

      {error && (
        <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 rounded-lg text-sm">
          {error}
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
      ) : (
        <PaymentHistoryTab
          payments={paymentHistory}
          onDownloadReceipt={handleDownloadReceipt}
          isPremium={isPremium}
        />
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
    </div>
  );
}

// Helper Components - All Dark Mode Ready
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
      <h3 className="text-xl font-semibold text-gray-900 dark:text-white">No Payment History</h3>
      <p className="text-gray-600 dark:text-gray-400 mt-3 max-w-md mx-auto">
        Your payment history will appear here once you make your first payment.
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
    return <NoPaymentsState />;
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