// src/components/common/WalletTopUpModal.jsx
/**
 * WalletTopUpModal
 * 
 * Modal component for topping up wallet via Paystack.
 * Used by: Landlord, Artisan, Admin, Super Admin (roles that have wallets)
 * 
 * Props:
 * - isOpen: boolean
 * - onClose: function
 * - onSuccess: function (callback after successful top-up)
 * - user: object (user data with email)
 * - currentBalance: number (current wallet balance for display)
 */

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Wallet, Loader2, AlertCircle, CheckCircle } from "lucide-react";
import { initiateWalletTopUp, verifyPaystackPayment, initializePaystack } from "@/services/paystackService";
import Button from "@/components/ui/Button";

const PRESET_AMOUNTS = [50, 100, 200, 500, 1000]; // GHS amounts

export default function WalletTopUpModal({ isOpen, onClose, onSuccess, user, currentBalance = 0 }) {
  const [amount, setAmount] = useState("");
  const [customAmount, setCustomAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const [paystackLoaded, setPaystackLoaded] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  // Load Paystack script when modal opens
  useEffect(() => {
    if (isOpen && !paystackLoaded) {
      initializePaystack()
        .then(() => setPaystackLoaded(true))
        .catch((err) => {
          console.error("Failed to load Paystack:", err);
          setError("Failed to load payment gateway. Please refresh the page.");
        });
    }
  }, [isOpen, paystackLoaded]);

  // Reset state when modal closes
  useEffect(() => {
    if (!isOpen) {
      setAmount("");
      setCustomAmount("");
      setError("");
      setSuccess(false);
      setLoading(false);
    }
  }, [isOpen]);

  const handlePresetAmount = (presetAmount) => {
    setAmount(presetAmount.toString());
    setCustomAmount("");
    setError("");
  };

  const handleCustomAmount = (e) => {
    const value = e.target.value;
    // Only allow numbers and one decimal point
    if (value === "" || /^\d*\.?\d*$/.test(value)) {
      setCustomAmount(value);
      setAmount(value);
      setError("");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess(false);

    if (!paystackLoaded) {
      setError("Payment gateway not ready. Please wait...");
      return;
    }

    const amountValue = parseFloat(amount);
    if (!amount || isNaN(amountValue) || amountValue <= 0) {
      setError("Please enter a valid amount");
      return;
    }

    if (amountValue < 1) {
      setError("Minimum top-up amount is GHS 1.00");
      return;
    }

    if (amountValue > 50000) {
      setError("Maximum top-up amount is GHS 50,000.00");
      return;
    }

    if (!user?.email) {
      setError("User email is required for payment");
      return;
    }

    setLoading(true);

    try {
      // Initiate Paystack payment
      await initiateWalletTopUp({
        email: user.email,
        amount: amountValue,
        user,
        onSuccess: async (reference) => {
          try {
            // Verify payment on backend
            const verification = await verifyPaystackPayment(reference);

            if (verification.success) {
              setSuccess(true);
              
              // Email confirmation with receipt is sent by backend
              // Call onSuccess callback after a short delay
              setTimeout(() => {
                onSuccess?.();
                onClose();
              }, 1500);
            } else {
              setError(verification.message || "Payment verification failed");
              setLoading(false);
            }
          } catch (err) {
            console.error("Payment verification error:", err);
            setError(err.message || "Failed to verify payment. Please contact support.");
            setLoading(false);
          }
        },
        onCancel: () => {
          setLoading(false);
          setError("Payment cancelled");
        },
        onError: (err) => {
          console.error("Payment error:", err);
          setError(err.message || "Payment failed. Please try again.");
          setLoading(false);
        },
      });
    } catch (err) {
      console.error("Top-up error:", err);
      setError(err.message || "Failed to initiate payment");
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/50"
          onClick={onClose}
        />

        {/* Modal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-[#0b6e4f]/10 rounded-lg">
                <Wallet className="w-5 h-5 text-[#0b6e4f]" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Top Up Wallet</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Current balance: <span className="font-medium">₵{currentBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              aria-label="Close"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>

          {/* Content */}
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Success Message */}
            {success && (
              <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-green-800 dark:text-green-300">
                    Top-up Successful!
                  </p>
                  <p className="text-xs text-green-700 dark:text-green-400 mt-1">
                    Your wallet has been topped up successfully.
                  </p>
                </div>
              </div>
            )}

            {/* Error Message */}
            {error && !success && (
              <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-red-800 dark:text-red-300">Error</p>
                  <p className="text-xs text-red-700 dark:text-red-400 mt-1">{error}</p>
                </div>
              </div>
            )}

            {/* Preset Amounts */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                Quick Select Amount
              </label>
              <div className="grid grid-cols-5 gap-2">
                {PRESET_AMOUNTS.map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => handlePresetAmount(preset)}
                    disabled={loading}
                    className={`px-3 py-2 text-sm font-medium rounded-lg border transition-colors ${
                      amount === preset.toString()
                        ? "bg-[#0b6e4f] text-white border-[#0b6e4f]"
                        : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:border-[#0b6e4f]"
                    } disabled:opacity-50 disabled:cursor-not-allowed`}
                  >
                    ₵{preset}
                  </button>
                ))}
              </div>
            </div>

            {/* Custom Amount */}
            <div>
              <label htmlFor="custom-amount" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Custom Amount (GHS)
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400">
                  ₵
                </span>
                <input
                  id="custom-amount"
                  type="text"
                  inputMode="decimal"
                  value={customAmount}
                  onChange={handleCustomAmount}
                  placeholder="Enter amount"
                  disabled={loading}
                  className="w-full pl-8 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#0b6e4f] focus:border-[#0b6e4f] bg-white dark:bg-gray-700 text-gray-900 dark:text-white disabled:opacity-50 disabled:cursor-not-allowed"
                />
              </div>
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                Minimum: ₵1.00 • Maximum: ₵50,000.00
              </p>
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
              <Button
                type="button"
                onClick={onClose}
                disabled={loading}
                variant="outline"
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={loading || !amount || parseFloat(amount) <= 0 || !paystackLoaded}
                className="flex-1"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    Processing...
                  </>
                ) : (
                  `Top Up ₵${amount || "0.00"}`
                )}
              </Button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

