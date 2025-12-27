// src/components/premium/UpgradePrompt.jsx
// Reusable component shown when a feature is premium-locked (e.g., tenant messaging)

import { Lock, Star, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Link } from "react-router-dom";

export default function UpgradePrompt({ featureName = "this feature" }) {
  return (
    <div className="flex-1 flex items-center justify-center p-8">
      <div className="max-w-md w-full text-center bg-linear-to-br from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 rounded-2xl p-10 border border-amber-200 dark:border-amber-800">
        <div className="w-20 h-20 bg-amber-500 rounded-full mx-auto mb-6 flex items-center justify-center">
          <Lock className="w-10 h-10 text-white" />
        </div>

        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
          Unlock {featureName}
        </h2>

        <p className="text-gray-600 dark:text-gray-300 mb-8 leading-relaxed">
          This feature is exclusive to <span className="font-semibold text-amber-600 dark:text-amber-400">Premium members</span>.
          Upgrade now to send direct messages, remove ads, and access advanced tools.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link to="/profile" className="flex-1">
            <Button size="lg" className="w-full flex items-center justify-center gap-2">
              <Star className="w-5 h-5" />
              Upgrade to Premium
              <ArrowRight className="w-5 h-5" />
            </Button>
          </Link>
        </div>

        <p className="text-xs text-gray-500 dark:text-gray-400 mt-8">
          Starting at GHS 29/month • Cancel anytime
        </p>
      </div>
    </div>
  );
}