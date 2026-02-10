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
    Filter,
    AlertTriangle,
    RefreshCw,
    User,
    DollarSign,
} from "lucide-react";

const STATUS_CONFIG = {
    pending: { color: "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300", icon: Clock, label: "Pending" },
    approved: { color: "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300", icon: CheckCircle, label: "Approved" },
    completed: { color: "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300", icon: CheckCircle, label: "Completed" },
    rejected: { color: "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300", icon: XCircle, label: "Rejected" },
    processing: { color: "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300", icon: Loader2, label: "Processing" },
};

/**
 * SA_WithdrawalApprovals
 * Admin/Super Admin component for managing withdrawal requests.
 * Lists pending, approved, and rejected withdrawals with approve/reject actions.
 */
export default function SA_WithdrawalApprovals() {
    const [withdrawals, setWithdrawals] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [filter, setFilter] = useState("pending");
    const [processingId, setProcessingId] = useState(null);
    const [confirmAction, setConfirmAction] = useState(null); // { id, action, reason }
    const [rejectReason, setRejectReason] = useState("");

    const loadWithdrawals = async () => {
        try {
            setLoading(true);
            setError("");
            const data = await listWithdrawals(filter !== "all" ? { status: filter } : {});
            setWithdrawals(Array.isArray(data?.results || data) ? data.results || data : []);
        } catch (err) {
            console.error("SA_WithdrawalApprovals:", err);
            setError("Unable to load withdrawal requests.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadWithdrawals();
    }, [filter]);

    const handleProcess = async (id, action) => {
        try {
            setProcessingId(id);
            await processWithdrawal(id, action, action === "reject" ? rejectReason : "");
            setConfirmAction(null);
            setRejectReason("");
            await loadWithdrawals();
        } catch (err) {
            console.error("Process withdrawal:", err);
            setError(err.message || "Failed to process withdrawal.");
        } finally {
            setProcessingId(null);
        }
    };

    const pendingCount = withdrawals.filter((w) => w.status === "pending").length;

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                        <ArrowDownCircle className="w-5 h-5 text-[#0b6e4f]" />
                        Withdrawal Requests
                        {pendingCount > 0 && (
                            <span className="ml-2 px-2.5 py-0.5 text-xs font-medium bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 rounded-full">
                                {pendingCount} pending
                            </span>
                        )}
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        Review and process user withdrawal requests
                    </p>
                </div>
                <button
                    onClick={loadWithdrawals}
                    disabled={loading}
                    className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors disabled:opacity-50"
                    aria-label="Refresh"
                >
                    <RefreshCw className={`w-4 h-4 text-gray-500 ${loading ? "animate-spin" : ""}`} />
                </button>
            </div>

            {/* Filter Tabs */}
            <div className="flex gap-1 bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
                {["pending", "approved", "rejected", "all"].map((tab) => (
                    <button
                        key={tab}
                        onClick={() => setFilter(tab)}
                        className={`flex-1 px-3 py-1.5 text-sm font-medium rounded-md transition-colors capitalize ${filter === tab
                                ? "bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm"
                                : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
                            }`}
                    >
                        {tab}
                    </button>
                ))}
            </div>

            {/* Error */}
            {error && (
                <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 rounded-lg text-sm flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                    {error}
                </div>
            )}

            {/* Withdrawals List */}
            {loading ? (
                <div className="flex items-center justify-center py-16">
                    <Loader2 className="w-8 h-8 animate-spin text-[#0b6e4f]" />
                </div>
            ) : withdrawals.length === 0 ? (
                <div className="text-center py-16 bg-gray-50 dark:bg-gray-800/50 rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-600">
                    <DollarSign className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                    <p className="text-gray-500 dark:text-gray-400 font-medium">
                        No {filter !== "all" ? filter : ""} withdrawal requests
                    </p>
                </div>
            ) : (
                <div className="space-y-3">
                    <AnimatePresence>
                        {withdrawals.map((w) => {
                            const statusCfg = STATUS_CONFIG[w.status] || STATUS_CONFIG.pending;
                            const StatusIcon = statusCfg.icon;
                            return (
                                <motion.div
                                    key={w.id}
                                    initial={{ opacity: 0, y: 8 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -8 }}
                                    className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow"
                                >
                                    <div className="flex items-start justify-between gap-4">
                                        <div className="flex items-start gap-4 flex-1">
                                            <div className="w-10 h-10 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center flex-shrink-0">
                                                <User className="w-5 h-5 text-gray-500" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2 flex-wrap">
                                                    <p className="font-semibold text-gray-900 dark:text-white">
                                                        {w.user_name || w.user?.full_name || "User"}
                                                    </p>
                                                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${statusCfg.color}`}>
                                                        <StatusIcon className="w-3 h-3" />
                                                        {statusCfg.label}
                                                    </span>
                                                </div>
                                                <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                                                    {w.user_email || w.user?.email || ""}
                                                </p>
                                                <div className="flex items-center gap-4 mt-2 text-sm">
                                                    <span className="font-semibold text-gray-900 dark:text-white">
                                                        ₵{Number(w.amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                                    </span>
                                                    <span className="text-gray-500 dark:text-gray-400">
                                                        {new Date(w.requested_at || w.created_at).toLocaleDateString()}
                                                    </span>
                                                    {w.destination && (
                                                        <span className="text-gray-500 dark:text-gray-400 capitalize">
                                                            → {w.destination}
                                                        </span>
                                                    )}
                                                </div>
                                                {w.admin_note && (
                                                    <p className="mt-2 text-xs text-gray-500 dark:text-gray-400 italic">
                                                        Note: {w.admin_note}
                                                    </p>
                                                )}
                                            </div>
                                        </div>

                                        {/* Actions */}
                                        {w.status === "pending" && (
                                            <div className="flex gap-2 flex-shrink-0">
                                                {confirmAction?.id === w.id ? (
                                                    <div className="flex flex-col gap-2">
                                                        {confirmAction.action === "reject" && (
                                                            <input
                                                                type="text"
                                                                value={rejectReason}
                                                                onChange={(e) => setRejectReason(e.target.value)}
                                                                placeholder="Reason for rejection..."
                                                                className="text-xs px-3 py-1.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                                            />
                                                        )}
                                                        <div className="flex gap-2">
                                                            <button
                                                                onClick={() => handleProcess(w.id, confirmAction.action)}
                                                                disabled={processingId === w.id}
                                                                className="px-3 py-1.5 text-xs font-medium text-white bg-[#0b6e4f] rounded-lg hover:bg-[#095c42] disabled:opacity-50 flex items-center gap-1"
                                                            >
                                                                {processingId === w.id ? (
                                                                    <Loader2 className="w-3 h-3 animate-spin" />
                                                                ) : (
                                                                    "Confirm"
                                                                )}
                                                            </button>
                                                            <button
                                                                onClick={() => { setConfirmAction(null); setRejectReason(""); }}
                                                                className="px-3 py-1.5 text-xs font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600"
                                                            >
                                                                Cancel
                                                            </button>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <>
                                                        <button
                                                            onClick={() => setConfirmAction({ id: w.id, action: "approve" })}
                                                            className="px-3 py-1.5 text-xs font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 flex items-center gap-1"
                                                        >
                                                            <CheckCircle className="w-3 h-3" />
                                                            Approve
                                                        </button>
                                                        <button
                                                            onClick={() => setConfirmAction({ id: w.id, action: "reject" })}
                                                            className="px-3 py-1.5 text-xs font-medium text-red-700 dark:text-red-300 bg-red-100 dark:bg-red-900/30 rounded-lg hover:bg-red-200 dark:hover:bg-red-900/50 flex items-center gap-1"
                                                        >
                                                            <XCircle className="w-3 h-3" />
                                                            Reject
                                                        </button>
                                                    </>
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
