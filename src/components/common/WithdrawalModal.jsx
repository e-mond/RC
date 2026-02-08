// src/components/common/WithdrawalModal.jsx
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Wallet, ArrowRight, Building2, Smartphone, AlertCircle, CheckCircle, Loader2 } from "lucide-react";
import Button from "@/components/ui/Button";
import { withdrawFromWallet } from "@/services/walletService";

export default function WithdrawalModal({ isOpen, onClose, onSuccess, currentBalance = 0, user }) {
    const [amount, setAmount] = useState("");
    const [method, setMethod] = useState("mobile_money"); // 'bank' or 'mobile_money'
    const [details, setDetails] = useState({
        bank_name: "",
        account_number: "",
        account_name: "",
        network: "",
        mobile_number: "",
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState(false);

    // Reset state when modal opens/closes
    if (!isOpen && (amount || error || success)) {
        setAmount("");
        setDetails({
            bank_name: "",
            account_number: "",
            account_name: "",
            network: "",
            mobile_number: "",
        });
        setError("");
        setSuccess(false);
        setLoading(false);
    }

    const handleDetailsChange = (e) => {
        const { name, value } = e.target;
        setDetails((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setSuccess(false);

        const amountValue = parseFloat(amount);
        if (!amount || isNaN(amountValue) || amountValue <= 0) {
            setError("Please enter a valid amount");
            return;
        }

        if (amountValue > currentBalance) {
            setError("Insufficient wallet balance");
            return;
        }

        if (method === "mobile_money") {
            if (!details.network || !details.mobile_number) {
                setError("Please fill in all mobile money details");
                return;
            }
        } else {
            if (!details.bank_name || !details.account_number || !details.account_name) {
                setError("Please fill in all bank details");
                return;
            }
        }

        setLoading(true);

        try {
            const withdrawalData = {
                amount: amountValue,
                method,
                destination: method === "mobile_money"
                    ? { network: details.network, number: details.mobile_number }
                    : { bank: details.bank_name, account: details.account_number, name: details.account_name }
            };

            await withdrawFromWallet(withdrawalData);
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
                    className="absolute inset-0 bg-black/50"
                    onClick={onClose}
                />

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
                            <div className="p-2 bg-amber-100 dark:bg-amber-900/30 rounded-lg">
                                <ArrowRight className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                            </div>
                            <div>
                                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Withdraw Funds</h2>
                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                    Available: <span className="font-medium">₵{currentBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
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

                    {/* Content */}
                    <form onSubmit={handleSubmit} className="p-6 space-y-6">
                        {success ? (
                            <div className="p-6 text-center">
                                <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-400" />
                                </div>
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Request Submitted</h3>
                                <p className="text-gray-600 dark:text-gray-400">
                                    Your withdrawal request has been submitted successfully and is pending approval.
                                </p>
                            </div>
                        ) : (
                            <>
                                {error && (
                                    <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-start gap-3">
                                        <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 mt-0.5 flex-shrink-0" />
                                        <div className="text-sm text-red-700 dark:text-red-300">{error}</div>
                                    </div>
                                )}

                                {/* Amount Input */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Withdrawal Amount (GHS)
                                    </label>
                                    <div className="relative">
                                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">₵</span>
                                        <input
                                            type="number"
                                            value={amount}
                                            onChange={(e) => setAmount(e.target.value)}
                                            placeholder="0.00"
                                            className="w-full pl-8 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#0b6e4f] bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                            disabled={loading}
                                        />
                                    </div>
                                </div>

                                {/* Method Selection */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                                        Destination
                                    </label>
                                    <div className="grid grid-cols-2 gap-3">
                                        <button
                                            type="button"
                                            onClick={() => setMethod("mobile_money")}
                                            className={`p-3 rounded-lg border flex flex-col items-center gap-2 transition-all ${method === "mobile_money"
                                                    ? "border-[#0b6e4f] bg-[#0b6e4f]/5 text-[#0b6e4f]"
                                                    : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600"
                                                }`}
                                        >
                                            <Smartphone className="w-6 h-6" />
                                            <span className="text-sm font-medium">Mobile Money</span>
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setMethod("bank")}
                                            className={`p-3 rounded-lg border flex flex-col items-center gap-2 transition-all ${method === "bank"
                                                    ? "border-[#0b6e4f] bg-[#0b6e4f]/5 text-[#0b6e4f]"
                                                    : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600"
                                                }`}
                                        >
                                            <Building2 className="w-6 h-6" />
                                            <span className="text-sm font-medium">Bank Transfer</span>
                                        </button>
                                    </div>
                                </div>

                                {/* Destination Details */}
                                <div className="space-y-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                                    {method === "mobile_money" ? (
                                        <>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Network</label>
                                                <select
                                                    name="network"
                                                    value={details.network}
                                                    onChange={handleDetailsChange}
                                                    className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                                    disabled={loading}
                                                >
                                                    <option value="">Select Network</option>
                                                    <option value="MTN">MTN Mobile Money</option>
                                                    <option value="Vodafone">Telecel Cash</option>
                                                    <option value="AirtelTigo">AT Money</option>
                                                </select>
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Mobile Number</label>
                                                <input
                                                    type="tel"
                                                    name="mobile_number"
                                                    value={details.mobile_number}
                                                    onChange={handleDetailsChange}
                                                    placeholder="0xxxxxxxxx"
                                                    className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                                    disabled={loading}
                                                />
                                            </div>
                                        </>
                                    ) : (
                                        <>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Bank Name</label>
                                                <input
                                                    type="text"
                                                    name="bank_name"
                                                    value={details.bank_name}
                                                    onChange={handleDetailsChange}
                                                    placeholder="e.g. EcoBank"
                                                    className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                                    disabled={loading}
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Account Number</label>
                                                <input
                                                    type="text"
                                                    name="account_number"
                                                    value={details.account_number}
                                                    onChange={handleDetailsChange}
                                                    className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                                    disabled={loading}
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Account Name</label>
                                                <input
                                                    type="text"
                                                    name="account_name"
                                                    value={details.account_name}
                                                    onChange={handleDetailsChange}
                                                    className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                                    disabled={loading}
                                                />
                                            </div>
                                        </>
                                    )}
                                </div>

                                <div className="pt-4">
                                    <Button type="submit" disabled={loading} className="w-full">
                                        {loading ? (
                                            <>
                                                <Loader2 className="w-4 h-4 animate-spin mr-2" />
                                                Processing...
                                            </>
                                        ) : (
                                            "Confirm Withdrawal"
                                        )}
                                    </Button>
                                </div>
                            </>
                        )}
                    </form>
                </motion.div>
            </div>
        </AnimatePresence>
    );
}
