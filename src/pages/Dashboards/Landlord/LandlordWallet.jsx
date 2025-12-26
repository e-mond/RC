import React, { useEffect, useState } from "react";
import { getPaymentHistory } from "@/services/paymentService";
import { Wallet, ArrowDownCircle, ArrowUpCircle, Loader2, AlertTriangle } from "lucide-react";
import { motion } from "framer-motion";

/**
 * LandlordWallet
 * - Simple wallet-style overview for landlord payments.
 * - Computes total received vs pending from payment history.
 * - Works in both real and mock modes as long as /payments/history/ is wired.
 */
export default function LandlordWallet() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [payments, setPayments] = useState([]);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        setLoading(true);
        setError("");
        const data = await getPaymentHistory();
        const history = Array.isArray(data?.results || data) ? data.results || data : [];
        if (mounted) setPayments(history);
      } catch (err) {
        console.error("LandlordWallet.getPaymentHistory:", err);
        if (mounted) {
          setError(err.message || "Failed to load wallet history");
        }
      } finally {
        if (mounted) setLoading(false);
      }
    };
    load();
    return () => {
      mounted = false;
    };
  }, []);

  const totalReceived = payments
    .filter((p) => p.status === "completed")
    .reduce((sum, p) => sum + Number(p.amount || 0), 0);

  const totalPending = payments
    .filter((p) => p.status === "pending")
    .reduce((sum, p) => sum + Number(p.amount || 0), 0);

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[260px]">
        <Loader2 className="w-8 h-8 animate-spin text-[#0b6e4f]" />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 max-w-5xl mx-auto">
      <header className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-[#0b6e4f]/10 flex items-center justify-center">
          <Wallet className="w-5 h-5 text-[#0b6e4f]" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Wallet Overview</h2>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Track rent collections and upcoming payouts in one place.
          </p>
        </div>
      </header>

      {error && (
        <div className="flex items-center gap-2 rounded-lg border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20 px-4 py-3 text-sm text-red-700 dark:text-red-300">
          <AlertTriangle className="w-4 h-4" />
          <span>{error}</span>
        </div>
      )}

      <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <SummaryCard
          label="Available Balance"
          amount={totalReceived - totalPending}
          tone="emerald"
        />
        <SummaryCard label="Received" amount={totalReceived} tone="blue" />
        <SummaryCard label="Pending" amount={totalPending} tone="amber" />
      </section>

      <section className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between">
          <p className="font-semibold text-gray-900 dark:text-white">Recent Transactions</p>
        </div>
        {payments.length === 0 ? (
          <div className="p-8 text-center text-gray-500 dark:text-gray-400 text-sm">
            No payments have been recorded yet.
          </div>
        ) : (
          <ul className="divide-y divide-gray-100 dark:divide-gray-800">
            {payments.slice(0, 10).map((p) => (
              <li key={p.id} className="px-4 py-3 flex items-center justify-between gap-3 text-sm">
                <div className="flex items-center gap-3">
                  {p.status === "completed" ? (
                    <ArrowDownCircle className="w-5 h-5 text-emerald-500" />
                  ) : (
                    <ArrowUpCircle className="w-5 h-5 text-amber-500" />
                  )}
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">
                      ₵{Number(p.amount || 0).toLocaleString()}
                    </p>
                    <p className="text-gray-500 dark:text-gray-400">
                      {p.tenantName || p.description || "Rental payment"}
                    </p>
                  </div>
                </div>
                <div className="text-right text-xs text-gray-500 dark:text-gray-400">
                  <p>
                    {p.paidAt
                      ? new Date(p.paidAt).toLocaleDateString()
                      : new Date(p.createdAt || Date.now()).toLocaleDateString()}
                  </p>
                  <p className="capitalize">{p.status || "pending"}</p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

function SummaryCard({ label, amount, tone }) {
  const toneClasses = {
    emerald: "bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300",
    blue: "bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300",
    amber: "bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-300",
  }[tone];

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`rounded-xl px-4 py-3 ${toneClasses}`}
    >
      <p className="text-xs font-medium uppercase tracking-wide opacity-80">{label}</p>
      <p className="mt-2 text-2xl font-bold">
        ₵{Number(amount || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
      </p>
    </motion.div>
  );
}


