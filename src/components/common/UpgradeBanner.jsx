/**
 * UpgradeBanner Component
 * 
 * A subtle banner component that displays upgrade CTAs in dashboards and key pages.
 * Only shows for free plan users (admins/super-admins bypass).
 * 
 * Props:
 * - feature: string (optional) - Feature key to check access for
 * - message: string (optional) - Custom message
 * - position: 'top' | 'bottom' (default: 'top')
 * - dismissible: boolean (default: false) - Allow user to dismiss
 */

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Crown, X, Sparkles } from "lucide-react";
import { useFeatureAccess } from "@/context/FeatureAccessContext";
import { useAuthStore } from "@/stores/authStore";
import PremiumUpgradeModal from "./PremiumUpgradeModal";
import Button from "@/components/ui/Button";

export default function UpgradeBanner({
  feature,
  message,
  position = "top",
  dismissible = false,
  className = "",
}) {
  const { isPremium, can, role } = useFeatureAccess();
  const { user } = useAuthStore();
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  // Don't show for admins/super-admins or premium users
  if (role === "admin" || role === "super-admin" || isPremium) {
    return null;
  }

  // Check feature access if feature key provided
  if (feature && can(feature)) {
    return null;
  }

  // Don't show if dismissed
  if (dismissed) {
    return null;
  }

  const defaultMessage = message || "Unlock premium features and boost your productivity";

  return (
    <>
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0, y: position === "top" ? -20 : 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: position === "top" ? -20 : 20 }}
          className={`w-full ${className}`}
        >
          <div className="bg-linear-to-r from-[#0b6e4f] to-emerald-600 text-white rounded-lg p-4 shadow-lg relative overflow-hidden">
            {/* Background pattern */}
            <div className="absolute inset-0 opacity-10">
              <div className="absolute inset-0" style={{
                backgroundImage: "radial-gradient(circle, white 1px, transparent 1px)",
                backgroundSize: "20px 20px"
              }} />
            </div>

            <div className="relative flex items-center justify-between gap-4">
              <div className="flex items-center gap-3 flex-1">
                <div className="shrink-0">
                  <Crown className="w-6 h-6 text-amber-300" />
                </div>
                <div className="flex-1 ">
                  <p className="font-semibold  text-sm sm:text-base mb-1">
                    Upgrade to Premium
                  </p>
                  <p className="text-xs sm:text-sm text-white/90">
                    {defaultMessage}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  onClick={() => setShowUpgradeModal(true)}
                  size="sm"
                  className="bg-orange-500 text-[#0b6e4f] hover:bg-amber-300 font-semibold flex items-center gap-2 whitespace-nowrap"
                >
                  <Sparkles className="w-4 h-4" />
                  Upgrade Now
                </Button>
                {dismissible && (
                  <button
                    onClick={() => setDismissed(true)}
                    className="p-1 hover:bg-white/20 rounded transition-colors"
                    aria-label="Dismiss banner"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>

      <PremiumUpgradeModal
        isOpen={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
        onSuccess={() => {
          setShowUpgradeModal(false);
          setDismissed(true); // Auto-dismiss after successful upgrade
        }}
        user={user}
      />
    </>
  );
}

