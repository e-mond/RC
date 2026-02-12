// src/pages/Dashboards/SuperAdmin/components/SA_SystemWithdrawalModal.jsx
import React, { useState, useEffect } from "react";
import { systemWithdrawal } from "@/services/walletService";
import { motion, AnimatePresence } from "framer-motion";
import { X, Shield, AlertTriangle, Loader2, CheckCircle, Lock, DollarSign } from "lucide-react";
import Button from "@/components/ui/Button";

export default function SA_SystemWithdrawalModal({ isOpen, onClose, onSuccess, systemBalance = 0 }) {
  const [step, setStep] = useState(1); // 1: input, 2: confirm, 3: verify, 4: success
  const [form, setForm] = useState({
    amount: "",
    destination: "bank_account",
    reason: "",
    verificationCode: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!isOpen) {
      // Reset form when modal closes
      setStep(1);
      setForm({ amount: "", destination: "bank_account", reason: "", verificationCode: "" });
      setError("");
      setLoading(false);
    }
  }, [isOpen]);

  const validateStep1 = () => {
    const amt = parseFloat(form.amount);
    if (!form.amount || isNaN(amt) || amt <= 0) return "Please enter a valid amount greater than 0";
    if (amt > systemBalance) return "Amount exceeds available system balance";
    if (!form.reason.trim()) return "Reason is required";
    return null;
  };

  const handleNext = () => {
    setError("");

    if (step === 1) {
      const validationError = validateStep1();
      if (validationError) {
        setError(validationError);
        return;
      }
      setStep(2);
    } else if (step === 2) {
      setStep(3);
    }
  };

  const handleSubmit = async () => {
    setError("");
    if (!form.verificationCode.trim() || form.verificationCode.length < 4) {
      setError("Please enter a valid verification code");
      return;
    }

    setLoading(true);

    try {
      await systemWithdrawal({
        amount: parseFloat(form.amount),
        destination: form.destination,
        reason: form.reason.trim(),
        verification_code: form.verificationCode.trim(),
      });

      setStep(4); // success
      setTimeout(() => {
        onSuccess?.();
        onClose();
      }, 2200);
    } catch (err) {
      setError(err.message || "Withdrawal failed. Please check your details and try again.");
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
          className="absolute inset-0 bg-black/65 backdrop-blur-sm"
          onClick={onClose}
        />

        <motion.div
          initial={{ opacity: 0, scale: 0.92, y: 30 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.92, y: 30 }}
          className="relative bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-lg max-h-[92vh] overflow-y-auto border border-gray-200 dark:border-gray-800"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-800">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-red-100 dark:bg-red-900/30 rounded-xl">
                <Shield className="w-6 h-6 text-red-600 dark:text-red-400" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">System Withdrawal</h2>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  Current balance: <strong>₵{systemBalance.toLocaleString(undefined, { minimumFractionDigits: 2 })}</strong>
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition"
              aria-label="Close modal"
            >
              <X className="w-6 h-6 text-gray-500 dark:text-gray-400" />
            </button>
          </div>

          <div className="p-6 space-y-8">
            {/* Steps indicator */}
            <div className="flex justify-center items-center gap-4">
              {[1, 2, 3, 4].map((s) => (
                <React.Fragment key={s}>
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold transition-all ${
                      step >= s
                        ? step === 4 && s === 4
                          ? "bg-green-600 text-white ring-2 ring-green-400/40"
                          : "bg-emerald-600 text-white"
                        : "bg-gray-200 dark:bg-gray-700 text-gray-500"
                    }`}
                  >
                    {s}
                  </div>
                  {s < 4 && (
                    <div className={`h-1 w-10 rounded-full ${step > s ? "bg-emerald-600" : "bg-gray-200 dark:bg-gray-700"}`} />
                  )}
                </React.Fragment>
              ))}
            </div>

            {/* Success state */}
            {step === 4 && (
              <div className="text-center py-12">
                <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
                  <CheckCircle className="w-12 h-12 text-green-600 dark:text-green-400" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">Withdrawal Successful</h3>
                <p className="text-lg text-gray-600 dark:text-gray-400">
                  ₵{parseFloat(form.amount).toLocaleString(undefined, { minimumFractionDigits: 2 })} has been withdrawn.
                </p>
              </div>
            )}

            {/* Error */}
            {error && step !== 4 && (
              <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-red-700 dark:text-red-300 flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 mt-0.5 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Step 1: Input */}
            {step === 1 && (
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Amount (GHS)
                  </label>
                  <div className="relative">
                    <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      inputMode="decimal"
                      value={form.amount}
                      onChange={(e) => /^\d*\.?\d{0,2}$/.test(e.target.value) && setForm({ ...form, amount: e.target.value })}
                      placeholder="0.00"
                      className="w-full pl-12 pr-4 py-3.5 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-lg"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Destination
                  </label>
                  <select
                    value={form.destination}
                    onChange={(e) => setForm({ ...form, destination: e.target.value })}
                    className="w-full px-4 py-3.5 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="bank_account">Bank Account</option>
                    <option value="mobile_money">Mobile Money</option>
                    <option value="internal_adjustment">Internal Adjustment</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Reason for Withdrawal *
                  </label>
                  <textarea
                    value={form.reason}
                    onChange={(e) => setForm({ ...form, reason: e.target.value })}
                    placeholder="Enter detailed reason (audit purpose)..."
                    rows={3}
                    className="w-full px-4 py-3.5 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 resize-none"
                  />
                </div>
              </div>
            )}

            {/* Step 2: Confirm */}
            {step === 2 && (
              <div className="space-y-6">
                <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-xl p-6">
                  <div className="flex items-start gap-4">
                    <AlertTriangle className="w-7 h-7 text-amber-600 dark:text-amber-400 mt-1 shrink-0" />
                    <div className="space-y-4">
                      <h4 className="font-bold text-amber-800 dark:text-amber-300 text-lg">
                        Confirm System Withdrawal
                      </h4>
                      <div className="space-y-3 text-sm">
                        <div className="flex justify-between">
                          <span className="text-amber-700 dark:text-amber-400">Amount:</span>
                          <strong className="text-amber-900 dark:text-amber-200">
                            ₵{parseFloat(form.amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                          </strong>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-amber-700 dark:text-amber-400">Destination:</span>
                          <span className="font-medium capitalize">{form.destination.replace("_", " ")}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-amber-700 dark:text-amber-400">Reason:</span>
                          <span className="text-right max-w-[65%]">{form.reason}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-xl p-5 text-center">
                  <p className="text-red-800 dark:text-red-300 font-medium">
                    This action is irreversible and will be permanently logged.
                  </p>
                </div>
              </div>
            )}

            {/* Step 3: Verification */}
            {step === 3 && (
              <div className="space-y-6">
                <div className="text-center">
                  <div className="w-20 h-20 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center mx-auto mb-5">
                    <Lock className="w-10 h-10 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <h4 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                    Security Verification
                  </h4>
                  <p className="text-gray-600 dark:text-gray-400">
                    Enter your 2FA / verification code to authorize this withdrawal
                  </p>
                </div>

                <input
                  type="text"
                  value={form.verificationCode}
                  onChange={(e) => setForm({ ...form, verificationCode: e.target.value.replace(/\D/g, "") })}
                  placeholder="Enter code"
                  maxLength={8}
                  autoFocus
                  className="w-full text-center text-2xl tracking-[0.5em] py-5 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 font-mono focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                />
              </div>
            )}

            {/* Buttons */}
            {step !== 4 && (
              <div className="flex gap-4 pt-6 border-t border-gray-200 dark:border-gray-800">
                <Button
                  variant="outline"
                  onClick={step === 1 ? onClose : () => setStep(step - 1)}
                  disabled={loading}
                  className="flex-1"
                >
                  {step === 1 ? "Cancel" : "Back"}
                </Button>

                {step < 3 ? (
                  <Button onClick={handleNext} className="flex-1 bg-emerald-600 hover:bg-emerald-700">
                    {step === 1 ? "Review & Confirm" : "Proceed to Verification"}
                  </Button>
                ) : (
                  <Button
                    onClick={handleSubmit}
                    disabled={loading || !form.verificationCode.trim()}
                    className="flex-1 bg-red-600 hover:bg-red-700"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin mr-3" />
                        Processing...
                      </>
                    ) : (
                      "Confirm & Withdraw"
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