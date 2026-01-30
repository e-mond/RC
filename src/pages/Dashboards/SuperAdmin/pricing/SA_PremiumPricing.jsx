/**
 * SA_PremiumPricing Page
 * 
 * Super Admin page for managing premium subscription pricing.
 * Allows Super Admin to:
 * - View current premium pricing
 * - Update monthly/yearly subscription prices
 * - Enable/disable premium plans
 * - Set pricing for different roles (if applicable)
 * 
 * Features:
 * - Dynamic pricing management
 * - Real-time price updates
 * - Plan enable/disable toggle
 * - Pricing history (optional)
 */

import { useEffect, useState } from "react";
import { Crown, DollarSign, Save, RefreshCw, AlertCircle } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "react-hot-toast";
import Button from "@/components/ui/Button";
import PageHeader from "@/modules/dashboard/PageHeader";
import SectionCard from "@/modules/dashboard/SectionCard";
import { isMockMode } from "@/mocks/mockManager";

export default function SA_PremiumPricing() {
  const [pricing, setPricing] = useState({
    monthly: 49.0,
    yearly: 490.0,
    currency: "GHS",
    enabled: true,
    // Additional pricing options
    listingFee: 5.0, // Fee per property listing
    adPromotionFee: 10.0, // Fee for ad promotion
    featuredListingFee: 15.0, // Fee for featured property listing
    upgradeFee: 0.0, // One-time upgrade fee (if any)
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    loadPricing();
  }, []);

  const loadPricing = async () => {
    try {
      setLoading(true);
      setError("");

      if (isMockMode()) {
        // Mock pricing data
        setPricing({
          monthly: 49.0,
          yearly: 490.0,
          currency: "GHS",
          enabled: true,
          listingFee: 5.0,
          adPromotionFee: 10.0,
          featuredListingFee: 15.0,
          upgradeFee: 0.0,
        });
      } else {
        // Real API call - use apiClient for proper error handling
        const { default: apiClient } = await import("@/services/apiClient");
        const { API_ENDPOINTS } = await import("@/config/apiEndpoints");
        const { data } = await apiClient.get(API_ENDPOINTS.SUPER_ADMIN.PREMIUM_PRICING);
        // Merge with defaults to ensure all fields exist
        setPricing({
          monthly: 49.0,
          yearly: 490.0,
          currency: "GHS",
          enabled: true,
          listingFee: 5.0,
          adPromotionFee: 10.0,
          featuredListingFee: 15.0,
          upgradeFee: 0.0,
          ...data, // Override with API data if present
        });
      }
    } catch (err) {
      console.error("Load pricing error:", err);
      setError(err.message || "Failed to load pricing");
      toast.error("Failed to load premium pricing");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setError("");

      if (isMockMode()) {
        // Mock save
        await new Promise((resolve) => setTimeout(resolve, 500));
        toast.success("Pricing updated successfully (mock mode)");
      } else {
        // Real API call - use apiClient for proper error handling
        const { default: apiClient } = await import("@/services/apiClient");
        const { API_ENDPOINTS } = await import("@/config/apiEndpoints");
        const { data } = await apiClient.patch(API_ENDPOINTS.SUPER_ADMIN.PREMIUM_PRICING, pricing);
        setPricing(data);
        toast.success("Pricing updated successfully");
      }
    } catch (err) {
      console.error("Save pricing error:", err);
      setError(err.message || "Failed to save pricing");
      toast.error("Failed to update pricing");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin w-8 h-8 border-4 border-[#0b6e4f] border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Premium Pricing Management"
        subtitle="Configure subscription pricing for premium plans"
        badge="Super Admin"
        actions={
          <div className="flex gap-2">
            <Button variant="outline" onClick={loadPricing} disabled={loading}>
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
            <Button onClick={handleSave} disabled={saving}>
              <Save className="w-4 h-4 mr-2" />
              {saving ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        }
      />

      {error && (
        <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 mt-0.5" />
          <div>
            <p className="font-medium text-red-800 dark:text-red-300">Error</p>
            <p className="text-sm text-red-700 dark:text-red-400">{error}</p>
          </div>
        </div>
      )}

      <SectionCard
        title="Premium Plan Pricing"
        description="Set monthly and yearly subscription prices for premium plans"
      >
        <div className="space-y-6">
          {/* Monthly Plan */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-br from-emerald-50 to-blue-50 dark:from-emerald-900/20 dark:to-blue-900/20 rounded-xl p-6 border border-emerald-200 dark:border-emerald-800"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <Crown className="w-6 h-6 text-amber-500" />
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Monthly Plan</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Billed monthly</p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <span className="text-gray-700 dark:text-gray-300 font-medium">{pricing.currency}</span>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={pricing.monthly}
                  onChange={(e) => setPricing({ ...pricing, monthly: parseFloat(e.target.value) || 0 })}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-lg font-semibold w-32"
                />
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Per month • {pricing.yearly / 12 < pricing.monthly ? "Save with yearly" : ""}
              </p>
            </div>
          </motion.div>

          {/* Yearly Plan */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-xl p-6 border border-blue-200 dark:border-blue-800"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <Crown className="w-6 h-6 text-purple-500" />
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Yearly Plan</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Billed annually (save {Math.round((1 - pricing.yearly / (pricing.monthly * 12)) * 100)}%)</p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <span className="text-gray-700 dark:text-gray-300 font-medium">{pricing.currency}</span>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={pricing.yearly}
                  onChange={(e) => setPricing({ ...pricing, yearly: parseFloat(e.target.value) || 0 })}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-lg font-semibold w-32"
                />
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Per year • {pricing.yearly && pricing.monthly && pricing.yearly / 12 < pricing.monthly ? `₵${(pricing.monthly - pricing.yearly / 12).toFixed(2)} savings/month` : ""}
              </p>
            </div>
          </motion.div>

          {/* Enable/Disable Toggle */}
          <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <div>
              <p className="font-medium text-gray-900 dark:text-white">Enable Premium Plans</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Allow users to subscribe to premium plans</p>
            </div>
            <button
              onClick={() => setPricing({ ...pricing, enabled: !pricing.enabled })}
              className={`w-14 h-7 rounded-full transition-colors relative ${
                pricing.enabled ? "bg-emerald-600" : "bg-gray-300 dark:bg-gray-600"
              }`}
            >
              <div
                className={`absolute top-0.5 left-0.5 w-6 h-6 bg-white rounded-full transition-transform ${
                  pricing.enabled ? "translate-x-7" : ""
                }`}
              />
            </button>
          </div>

          {/* Currency Selector */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Currency</label>
            <select
              value={pricing.currency}
              onChange={(e) => setPricing({ ...pricing, currency: e.target.value })}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="GHS">GHS (Ghana Cedis)</option>
              <option value="USD">USD (US Dollars)</option>
              <option value="NGN">NGN (Nigerian Naira)</option>
            </select>
          </div>
        </div>
      </SectionCard>

      {/* Additional Pricing Options */}
      <SectionCard
        title="Additional Pricing Options"
        description="Configure fees for listings, ads, and featured placements"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Listing Fee */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Property Listing Fee
            </label>
            <div className="flex items-center gap-2">
              <span className="text-gray-700 dark:text-gray-300 font-medium">{pricing.currency}</span>
              <input
                type="number"
                step="0.01"
                min="0"
                value={pricing.listingFee}
                onChange={(e) => setPricing({ ...pricing, listingFee: parseFloat(e.target.value) || 0 })}
                className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400">Fee charged per property listing</p>
          </div>

          {/* Ad Promotion Fee */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Ad Promotion Fee
            </label>
            <div className="flex items-center gap-2">
              <span className="text-gray-700 dark:text-gray-300 font-medium">{pricing.currency}</span>
              <input
                type="number"
                step="0.01"
                min="0"
                value={pricing.adPromotionFee}
                onChange={(e) => setPricing({ ...pricing, adPromotionFee: parseFloat(e.target.value) || 0 })}
                className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400">Fee for promoting ads</p>
          </div>

          {/* Featured Listing Fee */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Featured Listing Fee
            </label>
            <div className="flex items-center gap-2">
              <span className="text-gray-700 dark:text-gray-300 font-medium">{pricing.currency}</span>
              <input
                type="number"
                step="0.01"
                min="0"
                value={pricing.featuredListingFee}
                onChange={(e) => setPricing({ ...pricing, featuredListingFee: parseFloat(e.target.value) || 0 })}
                className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400">Fee for featured property placement</p>
          </div>

          {/* Upgrade Fee */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              One-Time Upgrade Fee
            </label>
            <div className="flex items-center gap-2">
              <span className="text-gray-700 dark:text-gray-300 font-medium">{pricing.currency}</span>
              <input
                type="number"
                step="0.01"
                min="0"
                value={pricing.upgradeFee}
                onChange={(e) => setPricing({ ...pricing, upgradeFee: parseFloat(e.target.value) || 0 })}
                className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400">One-time fee when upgrading to premium (optional)</p>
          </div>
        </div>
      </SectionCard>

      {/* Pricing Summary */}
      <SectionCard title="Pricing Summary" description="Current pricing configuration">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          <div className="p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
            <p className="text-sm text-gray-600 dark:text-gray-400">Monthly Price</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {pricing.currency} {(pricing.monthly ?? 0).toFixed(2)}
            </p>
          </div>
          <div className="p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
            <p className="text-sm text-gray-600 dark:text-gray-400">Yearly Price</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {pricing.currency} {(pricing.yearly ?? 0).toFixed(2)}
            </p>
          </div>
          <div className="p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
            <p className="text-sm text-gray-600 dark:text-gray-400">Listing Fee</p>
            <p className="text-xl font-bold text-gray-900 dark:text-white">
              {pricing.currency} {(pricing.listingFee ?? 0).toFixed(2)}
            </p>
          </div>
          <div className="p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
            <p className="text-sm text-gray-600 dark:text-gray-400">Ad Fee</p>
            <p className="text-xl font-bold text-gray-900 dark:text-white">
              {pricing.currency} {(pricing.adPromotionFee ?? 0).toFixed(2)}
            </p>
          </div>
          <div className="p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
            <p className="text-sm text-gray-600 dark:text-gray-400">Status</p>
            <p className={`text-xl font-bold ${pricing.enabled ? "text-emerald-600" : "text-gray-400"}`}>
              {pricing.enabled ? "Active" : "Disabled"}
            </p>
          </div>
        </div>
      </SectionCard>
    </div>
  );
}

