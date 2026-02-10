// src/pages/Dashboards/Artisan/ArtisanEarnings.jsx
import React, { useEffect, useState } from "react";
import { getWallet, getWalletTransactions } from "@/services/walletService";
import { Wallet, ArrowDownCircle, ArrowUpCircle, Loader2, AlertTriangle, Filter } from "lucide-react";
import WalletDisplay from "@/components/common/WalletDisplay";
import WalletTopUpModal from "@/components/common/WalletTopUpModal";
import WithdrawalModal from "@/components/common/WithdrawalModal";
import { useAuthStore } from "@/stores/authStore";

export default function ArtisanEarnings() {
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [wallet, setWallet] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [showTopUp, setShowTopUp] = useState(false);
  const [showWithdraw, setShowWithdraw] = useState(false);
  const [filter, setFilter] = useState("all");

  const loadData = async () => {
    try {
      setLoading(true);
      setError("");

      const [walletData, txnsData] = await Promise.all([
        getWallet(),
        getWalletTransactions()
      ]);

      setWallet(walletData);
      setTransactions(Array.isArray(txnsData?.results || txnsData) ? txnsData.results || txnsData : []);

    } catch (err) {
      console.error("ArtisanEarnings.loadData:", err);
      setError(err.message || "Failed to load wallet data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleTransactionSuccess = () => {
    loadData();
  };

  const filteredTransactions = transactions.filter(t => {
    if (filter === "all") return true;
    if (filter === "credit") return t.type === "credit" || t.type === "top_up" || t.type === "payment_received";
    if (filter === "debit") return t.type === "debit" || t.type === "withdrawal" || t.type === "subscription" || t.type === "ad_promotion";
    return true;
  });

  if (loading && !wallet) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-[#0b6e4f]" />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 max-w-5xl mx-auto">
      <header className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Earnings & Wallet</h2>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Track your job earnings and manage payouts.
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => setShowWithdraw(true)}
            className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
          >
            Withdraw
          </button>
          <button
            onClick={() => setShowTopUp(true)}
            className="px-4 py-2 text-sm font-medium text-white bg-[#0b6e4f] rounded-lg hover:bg-[#095c42]"
          >
            Top Up
          </button>
        </div>
      </header>

      {error && (
        <div className="flex items-center gap-2 rounded-lg border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20 px-4 py-3 text-sm text-red-700 dark:text-red-300">
          <AlertTriangle className="w-4 h-4" />
          <span>{error}</span>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          <WalletDisplay
            wallet={wallet}
            showSetupButton={true}
            onTopUpClick={() => setShowTopUp(true)}
            onSetupClick={() => { }}
          />
        </div>

        <div className="space-y-4">
          <div className="bg-emerald-50 dark:bg-emerald-900/20 p-4 rounded-xl border border-emerald-100 dark:border-emerald-800">
            <p className="text-sm font-medium text-emerald-800 dark:text-emerald-300">Total Job Earnings</p>
            <p className="text-2xl font-bold text-emerald-900 dark:text-emerald-100 mt-1">
              ₵{transactions
                .filter(t => t.type === 'payment_received')
                .reduce((acc, curr) => acc + Number(curr.amount), 0)
                .toLocaleString()}
            </p>
          </div>
          <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-xl border border-blue-100 dark:border-blue-800">
            <p className="text-sm font-medium text-blue-800 dark:text-blue-300">Net Withdrawals</p>
            <p className="text-2xl font-bold text-blue-900 dark:text-blue-100 mt-1">
              ₵{transactions
                .filter(t => t.type === 'withdrawal' && t.status === 'completed')
                .reduce((acc, curr) => acc + Number(curr.amount), 0)
                .toLocaleString()}
            </p>
          </div>
        </div>
      </div>

      <section className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
          <h3 className="font-semibold text-gray-900 dark:text-white">Transaction History</h3>
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-gray-400" />
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="text-sm border-none bg-transparent text-gray-600 dark:text-gray-300 focus:ring-0 cursor-pointer"
            >
              <option value="all">All Transactions</option>
              <option value="credit">Money In</option>
              <option value="debit">Money Out</option>
            </select>
          </div>
        </div>

        {filteredTransactions.length === 0 ? (
          <div className="p-12 text-center text-gray-500 dark:text-gray-400">
            <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
              <Wallet className="w-8 h-8 text-gray-400" />
            </div>
            <p>No transactions found.</p>
          </div>
        ) : (
          <ul className="divide-y divide-gray-100 dark:divide-gray-700">
            {filteredTransactions.map((t) => (
              <li key={t.id} className="px-6 py-4 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${['credit', 'top_up', 'payment_received'].includes(t.type)
                    ? "bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400"
                    : "bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400"
                    }`}>
                    {['credit', 'top_up', 'payment_received'].includes(t.type) ? (
                      <ArrowDownCircle className="w-5 h-5" />
                    ) : (
                      <ArrowUpCircle className="w-5 h-5" />
                    )}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {t.description || "Transaction"}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                      {new Date(t.created_at).toLocaleString()} • <span className="capitalize">{t.status}</span>
                    </p>
                  </div>
                </div>
                <div className={`text-right font-semibold ${['credit', 'top_up', 'payment_received'].includes(t.type)
                  ? "text-emerald-600 dark:text-emerald-400"
                  : "text-gray-900 dark:text-white"
                  }`}>
                  {['credit', 'top_up', 'payment_received'].includes(t.type) ? "+" : "-"}
                  ₵{Number(t.amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      <WalletTopUpModal
        isOpen={showTopUp}
        onClose={() => setShowTopUp(false)}
        onSuccess={handleTransactionSuccess}
        user={user}
        currentBalance={wallet?.balance || 0}
      />

      <WithdrawalModal
        isOpen={showWithdraw}
        onClose={() => setShowWithdraw(false)}
        onSuccess={handleTransactionSuccess}
        currentBalance={wallet?.balance || 0}
        user={user}
      />
    </div>
  );
}