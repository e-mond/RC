// src/components/common/PremiumUpgradeModal.jsx
/**
 * PremiumUpgradeModal
 * 
 * Modal component for upgrading to premium via Paystack.
 * Used across the app wherever premium upgrade is needed.
 * 
 * Props:
 * - isOpen: boolean
 * - onClose: function
 * - onSuccess: function (callback after successful upgrade)
 * - user: object (user data with email)
 */

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Crown, Loader2, AlertCircle, CheckCircle, Check } from "lucide-react";
import { initiatePremiumUpgrade, verifyPaystackPayment, initializePaystack, PREMIUM_PLANS } from "@/services/paystackService";
import { useFeatureStore } from "@/stores/featureStore";
import Button from "@/components/ui/Button";

const PREMIUM_FEATURES = [
  "Advanced analytics & insights",
  "Ad promotion & boosted listings",
  "Verified badges & priority support",
  "Unlimited property listings",
  "Tenant screening tools",
  "Digital rent collection",
  "Auto invoicing",
  "Revenue analytics",
  "Auto renew contracts",
];

export default function PremiumUpgradeModal({ isOpen, onClose, onSuccess, user }) {
  const [plan, setPlan] = useState("monthly"); // 'monthly' or 'yearly'
  const [loading, setLoading] = useState(false);
  const [paystackLoaded, setPaystackLoaded] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const { setPlan: setFeaturePlan } = useFeatureStore();

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
      setPlan("monthly");
      setError("");
      setSuccess(false);
      setLoading(false);
    }
  }, [isOpen]);

  const handleUpgrade = async () => {
    setError("");
    setSuccess(false);

    if (!paystackLoaded) {
      setError("Payment gateway not ready. Please wait...");
      return;
    }

    if (!user?.email) {
      setError("User email is required for payment");
      return;
    }

    setLoading(true);

    try {
      // Initiate Paystack payment
      await initiatePremiumUpgrade({
        email: user.email,
        plan,
        user,
        onSuccess: async (reference) => {
          try {
            // Verify payment on backend
            const verification = await verifyPaystackPayment(reference);

            if (verification.success) {
              // Update feature store
              setFeaturePlan("premium");
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
      console.error("Upgrade error:", err);
      setError(err.message || "Failed to initiate payment");
      setLoading(false);
    }
  };

  const monthlyPrice = PREMIUM_PLANS.monthly / 100; // Convert kobo to GHS
  const yearlyPrice = PREMIUM_PLANS.yearly / 100;

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
          className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-[#0b6e4f]/10 rounded-lg">
                <Crown className="w-5 h-5 text-[#0b6e4f]" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Upgrade to Premium</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">Unlock all premium features</p>
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
          <div className="p-6 space-y-6">
            {/* Success Message */}
            {success && (
              <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-green-800 dark:text-green-300">
                    Upgrade Successful!
                  </p>
                  <p className="text-xs text-green-700 dark:text-green-400 mt-1">
                    Welcome to Premium! You now have access to all premium features.
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

            {/* Plan Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                Choose Your Plan
              </label>
              <div className="grid grid-cols-2 gap-3">
                {/* Monthly Plan */}
                <button
                  type="button"
                  onClick={() => setPlan("monthly")}
                  disabled={loading}
                  className={`p-4 rounded-lg border-2 transition-all text-left ${
                    plan === "monthly"
                      ? "border-[#0b6e4f] bg-[#0b6e4f]/5 dark:bg-[#0b6e4f]/10"
                      : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600"
                  } disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-semibold text-gray-900 dark:text-white">Monthly</span>
                    {plan === "monthly" && (
                      <div className="w-5 h-5 rounded-full bg-[#0b6e4f] flex items-center justify-center">
                        <Check className="w-3 h-3 text-white" />
                      </div>
                    )}
                  </div>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    ₵{monthlyPrice.toFixed(2)}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">per month</p>
                </button>

                {/* Yearly Plan */}
                <button
                  type="button"
                  onClick={() => setPlan("yearly")}
                  disabled={loading}
                  className={`p-4 rounded-lg border-2 transition-all text-left relative ${
                    plan === "yearly"
                      ? "border-[#0b6e4f] bg-[#0b6e4f]/5 dark:bg-[#0b6e4f]/10"
                      : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600"
                  } disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  <div className="absolute top-2 right-2 bg-[#0b6e4f] text-white text-xs font-medium px-2 py-1 rounded">
                    Save 17%
                  </div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-semibold text-gray-900 dark:text-white">Yearly</span>
                    {plan === "yearly" && (
                      <div className="w-5 h-5 rounded-full bg-[#0b6e4f] flex items-center justify-center">
                        <Check className="w-3 h-3 text-white" />
                      </div>
                    )}
                  </div>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    ₵{yearlyPrice.toFixed(2)}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">per year</p>
                </button>
              </div>
            </div>

            {/* Features List */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                Premium Features
              </label>
              <div className="space-y-2">
                {PREMIUM_FEATURES.map((feature, index) => (
                  <div key={index} className="flex items-start gap-3 text-sm">
                    <Check className="w-4 h-4 text-[#0b6e4f] mt-0.5 flex-shrink-0" />
                    <span className="text-gray-700 dark:text-gray-300">{feature}</span>
                  </div>
                ))}
              </div>
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
                onClick={handleUpgrade}
                disabled={loading || !paystackLoaded}
                className="flex-1"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    Processing...
                  </>
                ) : (
                  `Upgrade to Premium - ₵${(plan === "monthly" ? monthlyPrice : yearlyPrice).toFixed(2)}`
                )}
              </Button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

