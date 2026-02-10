// src/pages/Dashboards/SuperAdmin/components/SA_SystemWithdrawalModal.jsx
import React, { useState, useEffect } from "react";
import { systemWithdrawal } from "@/services/walletService";
import { motion, AnimatePresence } from "framer-motion";
import {
    X,
    Shield,
    AlertTriangle,
    Loader2,
    CheckCircle,
    Lock,
    DollarSign,
} from "lucide-react";
import Button from "@/components/ui/Button";

/**
 * SA_SystemWithdrawalModal
 * Super Admin modal for system wallet withdrawals.
 * Requires verification code and displays confirmation warnings.
 */
export default function SA_SystemWithdrawalModal({ isOpen, onClose, onSuccess, systemBalance = 0 }) {
    const [step, setStep] = useState(1); // 1: form, 2: confirm, 3: verify
    const [amount, setAmount] = useState("");
    const [destination, setDestination] = useState("bank_account");
    const [reason, setReason] = useState("");
    const [verificationCode, setVerificationCode] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState(false);

    useEffect(() => {
        if (!isOpen) {
            setStep(1);
            setAmount("");
            setDestination("bank_account");
            setReason("");
            setVerificationCode("");
            setError("");
            setSuccess(false);
            setLoading(false);
        }
    }, [isOpen]);

    const handleNext = () => {
        setError("");
        const amountVal = parseFloat(amount);

        if (step === 1) {
            if (!amount || isNaN(amountVal) || amountVal <= 0) {
                setError("Please enter a valid amount");
                return;
            }
            if (amountVal > systemBalance) {
                setError("Amount exceeds available system balance");
                return;
            }
            if (!reason.trim()) {
                setError("Please provide a reason for this withdrawal");
                return;
            }
            setStep(2);
        } else if (step === 2) {
            setStep(3);
        }
    };

    const handleSubmit = async () => {
        setError("");

        if (!verificationCode || verificationCode.length < 4) {
            setError("Please enter a valid verification code");
            return;
        }

        setLoading(true);
        try {
            await systemWithdrawal({
                amount: parseFloat(amount),
                destination,
                reason,
                verification_code: verificationCode,
            });
            setSuccess(true);
            setTimeout(() => {
                onSuccess?.();
                onClose();
            }, 2000);
        } catch (err) {
            setError(err.message || "Withdrawal failed. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 bg-black/60"
                    onClick={onClose}
                />
                <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 20 }}
                    className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto"
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Header */}
                    <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-lg">
                                <Shield className="w-5 h-5 text-red-600 dark:text-red-400" />
                            </div>
                            <div>
                                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                                    System Withdrawal
                                </h2>
                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                    System balance: ₵{systemBalance.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                        >
                            <X className="w-5 h-5 text-gray-500" />
                        </button>
                    </div>

                    <div className="p-6 space-y-6">
                        {/* Progress Steps */}
                        <div className="flex items-center justify-center gap-2">
                            {[1, 2, 3].map((s) => (
                                <div key={s} className="flex items-center gap-2">
                                    <div
                                        className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${step >= s
                                                ? "bg-[#0b6e4f] text-white"
                                                : "bg-gray-200 dark:bg-gray-700 text-gray-500"
                                            }`}
                                    >
                                        {s}
                                    </div>
                                    {s < 3 && (
                                        <div className={`w-12 h-0.5 ${step > s ? "bg-[#0b6e4f]" : "bg-gray-200 dark:bg-gray-700"}`} />
                                    )}
                                </div>
                            ))}
                        </div>

                        {/* Success */}
                        {success && (
                            <div className="text-center py-8">
                                <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-400" />
                                </div>
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Withdrawal Processed</h3>
                                <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                                    ₵{parseFloat(amount).toLocaleString(undefined, { minimumFractionDigits: 2 })} has been withdrawn from the system wallet.
                                </p>
                            </div>
                        )}

                        {/* Error */}
                        {error && !success && (
                            <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-sm text-red-700 dark:text-red-300 flex items-center gap-2">
                                <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                                {error}
                            </div>
                        )}

                        {/* Step 1: Amount & Details */}
                        {step === 1 && !success && (
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Withdrawal Amount
                                    </label>
                                    <div className="relative">
                                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">₵</span>
                                        <input
                                            type="text"
                                            inputMode="decimal"
                                            value={amount}
                                            onChange={(e) => /^\d*\.?\d*$/.test(e.target.value) && setAmount(e.target.value)}
                                            placeholder="0.00"
                                            className="w-full pl-8 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-[#0b6e4f]"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Destination
                                    </label>
                                    <select
                                        value={destination}
                                        onChange={(e) => setDestination(e.target.value)}
                                        className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-[#0b6e4f]"
                                    >
                                        <option value="bank_account">Bank Account</option>
                                        <option value="mobile_money">Mobile Money</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Reason *
                                    </label>
                                    <textarea
                                        value={reason}
                                        onChange={(e) => setReason(e.target.value)}
                                        placeholder="Provide a reason for this withdrawal..."
                                        rows={3}
                                        className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-[#0b6e4f] resize-none"
                                    />
                                </div>
                            </div>
                        )}

                        {/* Step 2: Confirmation Warning */}
                        {step === 2 && !success && (
                            <div className="space-y-4">
                                <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-5">
                                    <div className="flex items-start gap-3">
                                        <AlertTriangle className="w-6 h-6 text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" />
                                        <div>
                                            <h4 className="font-semibold text-amber-800 dark:text-amber-300 mb-2">
                                                Confirm System Withdrawal
                                            </h4>
                                            <p className="text-sm text-amber-700 dark:text-amber-400 mb-3">
                                                You are about to withdraw funds from the system wallet. This action will be logged and audited.
                                            </p>
                                            <div className="space-y-2 text-sm">
                                                <div className="flex justify-between">
                                                    <span className="text-amber-700 dark:text-amber-400">Amount:</span>
                                                    <span className="font-semibold text-amber-900 dark:text-amber-200">
                                                        ₵{parseFloat(amount || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                                    </span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-amber-700 dark:text-amber-400">Destination:</span>
                                                    <span className="font-medium text-amber-900 dark:text-amber-200 capitalize">
                                                        {destination.replace("_", " ")}
                                                    </span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-amber-700 dark:text-amber-400">Reason:</span>
                                                    <span className="font-medium text-amber-900 dark:text-amber-200 text-right max-w-[60%]">
                                                        {reason}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 text-center">
                                    <p className="text-sm font-medium text-red-800 dark:text-red-300">
                                        ⚠️ This action cannot be undone. Proceed with caution.
                                    </p>
                                </div>
                            </div>
                        )}

                        {/* Step 3: Verification Code */}
                        {step === 3 && !success && (
                            <div className="space-y-4">
                                <div className="text-center mb-4">
                                    <div className="w-16 h-16 bg-[#0b6e4f]/10 rounded-full flex items-center justify-center mx-auto mb-3">
                                        <Lock className="w-8 h-8 text-[#0b6e4f]" />
                                    </div>
                                    <h4 className="font-semibold text-gray-900 dark:text-white">Verification Required</h4>
                                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                        Enter your verification code to complete this withdrawal
                                    </p>
                                </div>

                                <input
                                    type="text"
                                    value={verificationCode}
                                    onChange={(e) => setVerificationCode(e.target.value)}
                                    placeholder="Enter verification code"
                                    maxLength={8}
                                    className="w-full px-4 py-3 text-center text-lg tracking-widest border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-[#0b6e4f] font-mono"
                                    autoFocus
                                />
                            </div>
                        )}

                        {/* Actions */}
                        {!success && (
                            <div className="flex gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                                <Button
                                    type="button"
                                    onClick={step === 1 ? onClose : () => setStep(step - 1)}
                                    disabled={loading}
                                    variant="outline"
                                    className="flex-1"
                                >
                                    {step === 1 ? "Cancel" : "Back"}
                                </Button>

                                {step < 3 ? (
                                    <Button type="button" onClick={handleNext} className="flex-1">
                                        {step === 1 ? "Review" : "Proceed to Verification"}
                                    </Button>
                                ) : (
                                    <Button
                                        type="button"
                                        onClick={handleSubmit}
                                        disabled={loading || !verificationCode}
                                        className="flex-1 !bg-red-600 hover:!bg-red-700"
                                    >
                                        {loading ? (
                                            <>
                                                <Loader2 className="w-4 h-4 animate-spin mr-2" />
                                                Processing...
                                            </>
                                        ) : (
                                            "Confirm Withdrawal"
                                        )}
                                    </Button>
                                )}
                            </div>
                        )}
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
}
