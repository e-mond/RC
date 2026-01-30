// src/components/common/WalletSetupModal.jsx
/**
 * WalletSetupModal
 * 
 * Modal component for setting up wallet for receiving payments.
 * Used by: Landlord, Artisan, Admin, Super Admin
 * 
 * Props:
 * - isOpen: boolean
 * - onClose: function
 * - onSuccess: function (callback after successful setup)
 */

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Wallet, CreditCard, Smartphone, Building2, Loader2 } from "lucide-react";
import { setupWallet } from "@/services/walletService";
import Button from "@/components/ui/Button";

export default function WalletSetupModal({ isOpen, onClose, onSuccess }) {
  const [formData, setFormData] = useState({
    bank_account: {
      account_number: "",
      bank_name: "",
      account_name: "",
    },
    mobile_money: {
      network: "MTN",
      number: "",
    },
  });
  const [activeTab, setActiveTab] = useState("bank"); // "bank" | "mobile"
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    // Validate based on active tab
    if (activeTab === "bank") {
      if (!formData.bank_account.account_number || !formData.bank_account.bank_name || !formData.bank_account.account_name) {
        setError("Please fill in all bank account details");
        return;
      }
    } else {
      if (!formData.mobile_money.number || !formData.mobile_money.network) {
        setError("Please fill in mobile money details");
        return;
      }
    }

    setLoading(true);
    try {
      const walletData = {
        ...(activeTab === "bank" && { bank_account: formData.bank_account }),
        ...(activeTab === "mobile" && { mobile_money: formData.mobile_money }),
      };

      await setupWallet(walletData);
      onSuccess?.();
      onClose();
      // Reset form
      setFormData({
        bank_account: {
          account_number: "",
          bank_name: "",
          account_name: "",
        },
        mobile_money: {
          network: "MTN",
          number: "",
        },
      });
    } catch (err) {
      setError(err.message || "Failed to setup wallet");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e, section = null) => {
    const { name, value } = e.target;
    
    if (section) {
      setFormData((prev) => ({
        ...prev,
        [section]: {
          ...prev[section],
          [name]: value,
        },
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
        >
          {/* Header */}
          <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4 flex items-center justify-between z-10">
            <div className="flex items-center gap-3">
              <Wallet className="w-6 h-6 text-[#0b6e4f]" />
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                Setup Wallet
              </h2>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition"
              disabled={loading}
            >
              <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
            </button>
          </div>

          {/* Content */}
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {error && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded-lg">
                {error}
              </div>
            )}

            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                Set up your wallet to receive payments. You can add bank account or mobile money details.
              </p>

              {/* Tabs */}
              <div className="flex gap-2 mb-4 border-b border-gray-200 dark:border-gray-700">
                <button
                  type="button"
                  onClick={() => setActiveTab("bank")}
                  className={`px-4 py-2 text-sm font-medium transition ${
                    activeTab === "bank"
                      ? "text-[#0b6e4f] border-b-2 border-[#0b6e4f]"
                      : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                  }`}
                >
                  <Building2 className="w-4 h-4 inline mr-2" />
                  Bank Account
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab("mobile")}
                  className={`px-4 py-2 text-sm font-medium transition ${
                    activeTab === "mobile"
                      ? "text-[#0b6e4f] border-b-2 border-[#0b6e4f]"
                      : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                  }`}
                >
                  <Smartphone className="w-4 h-4 inline mr-2" />
                  Mobile Money
                </button>
              </div>

              {/* Bank Account Form */}
              {activeTab === "bank" && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Bank Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="bank_name"
                      value={formData.bank_account.bank_name}
                      onChange={(e) => handleChange(e, "bank_account")}
                      placeholder="e.g., GCB Bank, Ecobank"
                      required
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#0b6e4f] focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Account Number <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="account_number"
                      value={formData.bank_account.account_number}
                      onChange={(e) => handleChange(e, "bank_account")}
                      placeholder="Enter account number"
                      required
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#0b6e4f] focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Account Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="account_name"
                      value={formData.bank_account.account_name}
                      onChange={(e) => handleChange(e, "bank_account")}
                      placeholder="Enter account holder name"
                      required
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#0b6e4f] focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  </div>
                </div>
              )}

              {/* Mobile Money Form */}
              {activeTab === "mobile" && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Network <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="network"
                      value={formData.mobile_money.network}
                      onChange={(e) => handleChange(e, "mobile_money")}
                      required
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#0b6e4f] focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    >
                      <option value="MTN">MTN Mobile Money</option>
                      <option value="Vodafone">Vodafone Cash</option>
                      <option value="AirtelTigo">AirtelTigo Money</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Mobile Money Number <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="tel"
                      name="number"
                      value={formData.mobile_money.number}
                      onChange={(e) => handleChange(e, "mobile_money")}
                      placeholder="+233XXXXXXXXX"
                      required
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#0b6e4f] focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      Enter your mobile money number with country code
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                className="flex-1"
                disabled={loading}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="flex-1"
                disabled={loading}
                loading={loading}
              >
                {loading ? "Setting up..." : "Setup Wallet"}
              </Button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

