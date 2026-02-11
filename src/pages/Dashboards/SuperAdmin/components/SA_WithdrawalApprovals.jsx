// src/pages/Dashboards/SuperAdmin/components/SA_WithdrawalApprovals.jsx
import React, { useEffect, useState } from "react";
import { listWithdrawals, processWithdrawal } from "@/services/walletService";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowDownCircle,
  CheckCircle,
  XCircle,
  Clock,
  Loader2,
  RefreshCw,
  User,
  DollarSign,
  AlertTriangle,
} from "lucide-react";

const STATUS_CONFIG = {
  pending: { color: "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300", icon: Clock, label: "Pending" },
  approved: { color: "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300", icon: CheckCircle, label: "Approved" },
  completed: { color: "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300", icon: CheckCircle, label: "Completed" },
  rejected: { color: "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300", icon: XCircle, label: "Rejected" },
  processing: { color: "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300", icon: Loader2, label: "Processing" },
};

export default function SA_WithdrawalApprovals() {
  const [withdrawals, setWithdrawals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("pending");
  const [processingId, setProcessingId] = useState(null);
  const [confirmAction, setConfirmAction] = useState(null); // { id, action: "approve" | "reject" }
  const [rejectReason, setRejectReason] = useState("");

  const loadWithdrawals = React.useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      const params = filter !== "all" ? { status: filter } : {};
      const data = await listWithdrawals(params);
      setWithdrawals(Array.isArray(data) ? data : data?.results || []);
    } catch (err) {
      console.error("Failed to load withdrawals:", err);
      setError("Unable to load withdrawal requests. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    loadWithdrawals();
  }, [filter, loadWithdrawals]);

  const handleProcess = async (id, action) => {
    if (action === "reject" && !rejectReason.trim()) {
      setError("Rejection reason is required");
      return;
    }

    setProcessingId(id);
    setError("");

    try {
      await processWithdrawal(id, action, action === "reject" ? rejectReason.trim() : "");
      setConfirmAction(null);
      setRejectReason("");
      await loadWithdrawals();
    } catch (err) {
      setError(err.message || "Failed to process withdrawal.");
    } finally {
      setProcessingId(null);
    }
  };

  const pendingCount = withdrawals.filter((w) => w.status === "pending").length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center gap-3">
            <ArrowDownCircle className="w-6 h-6 text-emerald-600" />
            Withdrawal Requests
            {pendingCount > 0 && (
              <span className="ml-3 px-3 py-1 text-sm font-medium bg-amber-100 dark:bg-amber-900/40 text-amber-800 dark:text-amber-300 rounded-full">
                {pendingCount} pending
              </span>
            )}
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Review and process user withdrawal requests
          </p>
        </div>

        <button
          onClick={loadWithdrawals}
          disabled={loading}
          className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition disabled:opacity-50"
          aria-label="Refresh list"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap gap-2">
        {["pending", "approved", "rejected", "all"].map((tab) => (
          <button
            key={tab}
            onClick={() => setFilter(tab)}
            className={`px-4 py-2 text-sm font-medium rounded-full transition-all ${
              filter === tab
                ? "bg-emerald-600 text-white shadow-md"
                : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
            }`}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {/* Error Message */}
      {error && (
        <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-red-700 dark:text-red-300 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 mt-0.5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Content */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20">
          <Loader2 className="w-10 h-10 animate-spin text-emerald-600 mb-4" />
          <p className="text-gray-500 dark:text-gray-400">Loading withdrawal requests...</p>
        </div>
      ) : withdrawals.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 bg-gray-50 dark:bg-gray-800/40 rounded-xl border border-dashed border-gray-300 dark:border-gray-600">
          <DollarSign className="w-16 h-16 text-gray-300 dark:text-gray-600 mb-4" />
          <h4 className="text-lg font-medium text-gray-700 dark:text-gray-300">
            No {filter !== "all" ? filter : "withdrawal"} requests found
          </h4>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
            {filter === "pending" ? "New requests will appear here" : "Try changing the filter"}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          <AnimatePresence mode="popLayout">
            {withdrawals.map((w) => {
              const cfg = STATUS_CONFIG[w.status] || STATUS_CONFIG.pending;
              const StatusIcon = cfg.icon;

              return (
                <motion.div
                  key={w.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                  className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-5 shadow-sm hover:shadow transition-shadow"
                >
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-5">
                    {/* User & Info */}
                    <div className="flex items-start gap-4 flex-1 min-w-0">
                      <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center shrink-0">
                        <User className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2 mb-1">
                          <h4 className="font-semibold text-gray-900 dark:text-white truncate max-w-60">
                            {w.user_name || w.user?.full_name || "Unknown User"}
                          </h4>
                          <span
                            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${cfg.color}`}
                          >
                            <StatusIcon className="w-3.5 h-3.5" />
                            {cfg.label}
                          </span>
                        </div>

                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-2 truncate">
                          {w.user_email || w.user?.email || "—"}
                        </p>

                        <div className="flex flex-wrap gap-x-5 gap-y-1 text-sm">
                          <div>
                            <span className="font-semibold text-gray-900 dark:text-white">
                              ₵{Number(w.amount).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </span>
                          </div>
                          <div className="text-gray-500 dark:text-gray-400">
                            Requested: {new Date(w.requested_at || w.created_at).toLocaleString([], {
                              year: "numeric",
                              month: "short",
                              day: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </div>
                          {w.destination && (
                            <div className="text-gray-500 dark:text-gray-400 capitalize">
                              → {w.destination.replace("_", " ")}
                            </div>
                          )}
                        </div>

                        {w.admin_note && (
                          <p className="mt-3 text-xs italic text-gray-500 dark:text-gray-400 border-l-2 border-gray-300 dark:border-gray-600 pl-3">
                            Admin note: {w.admin_note}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Actions - only for pending */}
                    {w.status === "pending" && (
                      <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 mt-4 sm:mt-0 shrink-0">
                        {confirmAction?.id === w.id ? (
                          <div className="flex flex-col gap-3 w-full sm:w-auto min-w-60">
                            {confirmAction.action === "reject" && (
                              <textarea
                                value={rejectReason}
                                onChange={(e) => setRejectReason(e.target.value)}
                                placeholder="Enter reason for rejection (required)"
                                rows={2}
                                className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 focus:ring-2 focus:ring-red-500"
                              />
                            )}

                            <div className="flex gap-3">
                              <button
                                onClick={() => handleProcess(w.id, confirmAction.action)}
                                disabled={processingId === w.id || (confirmAction.action === "reject" && !rejectReason.trim())}
                                className={`flex-1 px-4 py-2 text-sm font-medium rounded-lg transition flex items-center justify-center gap-2 ${
                                  confirmAction.action === "approve"
                                    ? "bg-green-600 hover:bg-green-700 text-white"
                                    : "bg-red-600 hover:bg-red-700 text-white"
                                } disabled:opacity-60`}
                              >
                                {processingId === w.id ? (
                                  <Loader2 className="w-4 h-4 animate-spin" />
                                ) : confirmAction.action === "approve" ? (
                                  "Confirm Approve"
                                ) : (
                                  "Confirm Reject"
                                )}
                              </button>

                              <button
                                onClick={() => {
                                  setConfirmAction(null);
                                  setRejectReason("");
                                }}
                                className="flex-1 px-4 py-2 text-sm font-medium bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 rounded-lg transition"
                              >
                                Cancel
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div className="flex gap-3">
                            <button
                              onClick={() => setConfirmAction({ id: w.id, action: "approve" })}
                              className="px-5 py-2 text-sm font-medium bg-green-600 hover:bg-green-700 text-white rounded-lg transition flex items-center gap-2"
                            >
                              <CheckCircle className="w-4 h-4" />
                              Approve
                            </button>
                            <button
                              onClick={() => setConfirmAction({ id: w.id, action: "reject" })}
                              className="px-5 py-2 text-sm font-medium bg-red-100 dark:bg-red-900/30 hover:bg-red-200 dark:hover:bg-red-800/40 text-red-700 dark:text-red-300 rounded-lg transition flex items-center gap-2"
                            >
                              <XCircle className="w-4 h-4" />
                              Reject
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}