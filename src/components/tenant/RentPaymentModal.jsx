// src/components/tenant/RentPaymentModal.jsx
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Smartphone, X, Loader2 } from "lucide-react";

/**
 * RentPaymentModal – Paystack-powered rent payment
 *
 * Fully compatible with your Django Payment model & PaymentCreateSerializer
 * • Uses Paystack for Mobile Money, Card, Bank Transfer
 * • Sends reference to backend for verification
 * • Clean, secure, no card data on frontend
 */
export default function RentPaymentModal({ open, onClose, rental, onPay, loading: externalLoading }) {
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  const [paystackLoaded, setPaystackLoaded] = useState(false);
  const [internalLoading, setInternalLoading] = useState(false);

  const isLoading = externalLoading || internalLoading;

  // Prefill amount from rental
  useEffect(() => {
    if (rental && open) {
      setAmount(rental.nextDueAmount ?? rental.amount ?? "");
      setNote("");
    }
  }, [rental, open]);

  // Load Paystack script once
  useEffect(() => {
    if (paystackLoaded) return;

    const script = document.createElement("script");
    script.src = "https://js.paystack.co/v1/inline.js";
    script.async = true;
    script.onload = () => setPaystackLoaded(true);
    script.onerror = () => alert("Failed to load payment gateway. Check your connection.");
    document.body.appendChild(script);

    return () => {
      if (document.body.contains(script)) {
        document.body.removeChild(script);
      }
    };
  }, [paystackLoaded]);

  // Initiate Paystack payment
  const handlePayment = () => {
    if (!paystackLoaded) {
      alert("Payment gateway is loading...");
      return;
    }

    if (!amount || Number(amount) <= 0) {
      alert("Please enter a valid amount");
      return;
    }

    const tenantEmail = rental?.tenantEmail || rental?.email || "tenant@rentalconnects.gh";

    setInternalLoading(true);

    const handler = window.PaystackPop.setup({
      key: import.meta.env.VITE_PAYSTACK_PUBLIC_KEY,
      email: tenantEmail,
      amount: Math.round(Number(amount) * 100), // Convert to pesewas (GHS)
      currency: "GHS",
      ref: `rent_${rental.id || rental.rentalId}_${Date.now()}`,
      metadata: {
        rental_id: rental.id || rental.rentalId,
        property_title: rental.title || rental.propertyName,
        note: note.trim(),
        payment_type: "rent",
      },
      channels: ["card", "mobile_money", "bank"], // All available in Ghana
      callback: async (response) => {
        // Send reference to backend for verification
        await onPay({
          rentalId: rental.id || rental.rentalId,
          amount: Number(amount),
          payment_method: "paystack", // matches PAYMENT_METHOD_CHOICES
          transaction_id: response.reference, // will be verified on backend
          reference_number: response.reference,
          payment_provider: "Paystack",
          description: note.trim() || "Rent payment",
        });
        setInternalLoading(false);
      },
      onClose: () => {
        setInternalLoading(false);
      },
    });

    handler.openIframe();
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-black/50"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            className="bg-white dark:bg-gray-900 rounded-2xl w-full max-w-md p-6 shadow-2xl"
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex justify-between items-start mb-5">
              <div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">Pay Rent</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  For <span className="font-medium">{rental?.title || rental?.propertyName || "property"}</span>
                </p>
              </div>
              <button
                onClick={onClose}
                disabled={isLoading}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-5">
              {/* Amount */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Amount (GHS ₵)
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-[#0b6e4f] focus:border-transparent dark:bg-gray-800"
                  placeholder="0.00"
                  required
                  disabled={isLoading}
                />
              </div>

              {/* Paystack Info Card */}
              <div className="bg-linear-to-r from-[#0b6e4f]/5 to-emerald-50 dark:from-[#0b6e4f]/10 dark:to-gray-800 border border-emerald-200 dark:border-emerald-700 rounded-xl p-5">
                <div className="flex items-center gap-3">
                  <Smartphone className="w-7 h-7 text-[#0b6e4f]" />
                  <div>
                    <p className="font-semibold text-gray-900 dark:text-white">Pay with Paystack</p>
                    <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                      Mobile Money • Credit/Debit Card • Bank Transfer
                    </p>
                  </div>
                </div>
              </div>

              {/* Note */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Note (optional)
                </label>
                <textarea
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  rows={3}
                  placeholder="e.g., Rent payment for December 2025"
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-[#0b6e4f] dark:bg-gray-800 resize-none"
                  disabled={isLoading}
                />
              </div>

              {/* Actions */}
              <div className="flex gap-4 pt-3">
                <button
                  type="button"
                  onClick={onClose}
                  disabled={isLoading}
                  className="flex-1 px-6 py-3 border border-gray-300 dark:border-gray-600 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition font-medium"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handlePayment}
                  disabled={isLoading || !paystackLoaded}
                  className="flex-1 px-6 py-3 bg-[#0b6e4f] text-white rounded-xl hover:bg-[#095c42] disabled:opacity-60 transition font-semibold flex items-center justify-center gap-2"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    "Pay with Paystack"
                  )}
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}