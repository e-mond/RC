// src/pages/Dashboards/Tenant/TenantPayments.jsx
import React, { useEffect, useState } from "react";
import { fetchTenantRentals, getPaymentHistory, getPaymentReceipt } from "@/services/tenantService";
import RentPaymentModal from "@/components/tenant/RentPaymentModal";
import { motion } from "framer-motion";
import { Download, Receipt, CreditCard, Smartphone, CheckCircle, Clock, XCircle } from "lucide-react";
import { useFeatureStore } from "@/stores/featureStore";

/**
 * TenantPayments Page
 * - Payment history and quick payment actions
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
  const [activeTab, setActiveTab] = useState("due"); // 'due' or 'history'

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
      // Payment logic handled by modal
      setPaymentModalOpen(false);
      setActiveRental(null);
      // Refresh rentals
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
        <h2 className="text-2xl font-bold text-[#0f1724]">Payments</h2>
        <p className="text-sm text-gray-600">View and manage your rental payments</p>
      </header>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b">
        <button
          onClick={() => setActiveTab("due")}
          className={`px-4 py-2 font-medium transition-colors ${
            activeTab === "due"
              ? "text-[#0b6e4f] border-b-2 border-[#0b6e4f]"
              : "text-gray-600 hover:text-gray-900"
          }`}
        >
          Payments Due
        </button>
        {isPremium && (
          <button
            onClick={() => setActiveTab("history")}
            className={`px-4 py-2 font-medium transition-colors ${
              activeTab === "history"
                ? "text-[#0b6e4f] border-b-2 border-[#0b6e4f]"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            Payment History
          </button>
        )}
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
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

// Helper Components
function PaymentsSkeleton() {
  return (
    <div className="space-y-4">
      {[...Array(3)].map((_, i) => (
        <div key={i} className="border rounded-lg p-5 bg-white shadow-sm animate-pulse">
          <div className="flex justify-between">
            <div className="space-y-3 flex-1">
              <div className="h-5 bg-gray-200 rounded w-3/4" />
              <div className="h-4 bg-gray-200 rounded w-1/2" />
            </div>
            <div className="h-10 w-24 bg-gray-200 rounded" />
          </div>
        </div>
      ))}
    </div>
  );
}

function NoPaymentsState() {
  return (
    <div className="text-center py-20 bg-gray-50 rounded-xl border-2 border-dashed border-gray-300">
      <div className="mx-auto w-24 h-24 bg-gray-200 rounded-full mb-6" />
      <h3 className="text-xl font-semibold text-gray-900">No Payment History</h3>
      <p className="text-gray-600 mt-3 max-w-md mx-auto">
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
      className="border rounded-lg p-6 bg-white shadow-sm hover:shadow-lg transition-all"
    >
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h3 className="font-bold text-lg text-[#0f1724]">
            {rental.title || rental.propertyName || "Unnamed Property"}
          </h3>
          <p className="text-gray-600 text-sm mt-1">
            {rental.address || rental.location || "No location provided"}
          </p>
          <div className="mt-3 flex flex-wrap gap-4 text-sm">
            <span>
              <span className="font-semibold text-[#0b6e4f]">
                ₵{rental.nextDueAmount || rental.amount || "0.00"}
              </span>{" "}
              due on{" "}
              <span className="text-gray-500">
                {rental.nextDueDate || rental.dueDate || "N/A"}
              </span>
            </span>
            <span className="text-gray-500">
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

// Payment History Tab Component
function PaymentHistoryTab({ payments, onDownloadReceipt, isPremium }) {
  if (!isPremium) {
    return (
      <div className="bg-white rounded-xl shadow-sm p-12 text-center border border-gray-200">
        <div className="mx-auto w-24 h-24 bg-[#0b6e4f]/10 rounded-full flex items-center justify-center mb-6">
          <Receipt className="w-12 h-12 text-[#0b6e4f]" />
        </div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">Premium Feature</h3>
        <p className="text-gray-600 mb-6 max-w-md mx-auto">
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
      <div className="text-center py-20 bg-gray-50 rounded-xl border-2 border-dashed border-gray-300">
        <div className="mx-auto w-24 h-24 bg-gray-200 rounded-full mb-6" />
        <h3 className="text-xl font-semibold text-gray-900">No Payment History</h3>
        <p className="text-gray-600 mt-3 max-w-md mx-auto">
          Your payment history will appear here once you make your first payment.
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

// Payment History Card
function PaymentHistoryCard({ payment, onDownloadReceipt }) {
  const statusConfig = {
    completed: { color: "bg-green-100 text-green-700", icon: CheckCircle },
    pending: { color: "bg-yellow-100 text-yellow-700", icon: Clock },
    failed: { color: "bg-red-100 text-red-700", icon: XCircle },
  };

  const status = payment.status || "pending";
  const config = statusConfig[status] || statusConfig.pending;
  const StatusIcon = config.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <h3 className="font-semibold text-lg text-gray-900">
              {payment.propertyName || payment.propertyTitle || "Rental Payment"}
            </h3>
            <span className={`px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${config.color}`}>
              <StatusIcon size={14} />
              {status}
            </span>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600">
            <div>
              <span className="font-medium">Amount:</span>{" "}
              <span className="text-[#0b6e4f] font-semibold">
                ₵{payment.amount?.toLocaleString() || "0.00"}
              </span>
            </div>
            <div className="flex items-center gap-1">
              {payment.method === "card" ? (
                <CreditCard size={14} />
              ) : (
                <Smartphone size={14} />
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
            className="ml-4 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2 text-sm"
          >
            <Download size={16} />
            Receipt
          </button>
        )}
      </div>
    </motion.div>
  );
}

