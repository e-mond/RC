// src/components/common/PremiumGate.jsx
/**
 * PremiumGate Component
 * 
 * A reusable component for gating premium features with a consistent upgrade UI.
 * Shows upgrade prompt when user doesn't have premium access.
 * 
 * Props:
 * - feature: string (optional) - Feature key from FEATURE_MATRIX
 * - children: ReactNode - Content to show if user has access
 * - fallback: ReactNode (optional) - Custom fallback UI
 * - showUpgradeButton: boolean (default: true) - Show upgrade button
 * - className: string (optional) - Additional classes for container
 */

import { useFeatureAccess } from "@/context/FeatureAccessContext";
import { useState } from "react";
import { Crown, Lock, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import PremiumUpgradeModal from "./PremiumUpgradeModal";
import { useAuthStore } from "@/stores/authStore";

export default function PremiumGate({
  feature,
  children,
  fallback,
  showUpgradeButton = true,
  className = "",
}) {
  const { isPremium, can, plan } = useFeatureAccess();
  const { user } = useAuthStore();
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);

  // Check feature access if feature key provided
  const hasAccess = feature ? can(feature) : isPremium;

  // If user has access, render children
  if (hasAccess) {
    return <>{children}</>;
  }

  // If custom fallback provided, use it
  if (fallback) {
    return <>{fallback}</>;
  }

  // Default premium gate UI
  return (
    <>
      <div className={`flex flex-col items-center justify-center min-h-[400px] p-8 ${className}`}>
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-center max-w-md"
        >
          <div className="mx-auto w-20 h-20 bg-gradient-to-br from-[#0b6e4f] to-emerald-600 rounded-full flex items-center justify-center mb-6 shadow-lg">
            <Crown className="w-10 h-10 text-white" />
          </div>

          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
            Premium Feature
          </h2>

          <p className="text-gray-600 dark:text-gray-400 mb-2">
            This feature is available with a Premium subscription.
          </p>

          {feature && (
            <p className="text-sm text-gray-500 dark:text-gray-500 mb-6">
              Unlock advanced capabilities and insights.
            </p>
          )}

          {showUpgradeButton && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowUpgradeModal(true)}
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#0b6e4f] to-emerald-600 text-white font-semibold rounded-xl hover:from-[#095c42] hover:to-emerald-700 transition-all shadow-lg hover:shadow-xl"
            >
              <Sparkles className="w-5 h-5" />
              Upgrade to Premium
            </motion.button>
          )}

          <div className="mt-8 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl">
            <div className="flex items-start gap-3">
              <Lock className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
              <div className="text-left">
                <p className="text-sm font-medium text-blue-900 dark:text-blue-300 mb-1">
                  Current Plan: {plan === "free" ? "Free" : plan.charAt(0).toUpperCase() + plan.slice(1)}
                </p>
                <p className="text-xs text-blue-700 dark:text-blue-400">
                  Upgrade to unlock this and other premium features.
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {showUpgradeButton && (
        <PremiumUpgradeModal
          isOpen={showUpgradeModal}
          onClose={() => setShowUpgradeModal(false)}
          onSuccess={() => {
            setShowUpgradeModal(false);
            // Component will re-render and show children if upgrade successful
          }}
          user={user}
        />
      )}
    </>
  );
}

