// src/components/tenant/RentPaymentModal.jsx
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

/**
 * RentPaymentModal
 * Props:
 * - open: boolean
 * - onClose: fn
 * - rental: object (selected rental)
 * - onPay: async fn({ rentalId, amount, method, metadata })
 * - loading: boolean
 *
 * Simple modal UI with quick payment options.
 */

export default function RentPaymentModal({ open, onClose, rental, onPay, loading }) {
  const [amount, setAmount] = useState("");
  const [method, setMethod] = useState("mobile_money");
  const [note, setNote] = useState("");

  useEffect(() => {
    if (rental) {
      // prefill amount with next due
      setAmount(rental.nextDueAmount ?? rental.amount ?? "");
    } else {
      setAmount("");
    }
  }, [rental]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!rental) return;
    if (!amount || Number(amount) <= 0) {
      return alert("Enter a valid amount");
    }
    await onPay({
      rentalId: rental.id ?? rental.rentalId,
      amount: Number(amount),
      method,
      metadata: { note },
    });
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center px-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <div className="absolute inset-0 bg-black/40" onClick={onClose} />
          <motion.div
            className="bg-white rounded-2xl w-full max-w-md p-6 z-10 shadow-lg"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 20, opacity: 0 }}
          >
            <h3 className="text-lg font-semibold mb-1">Pay Rent</h3>
            <p className="text-sm text-gray-600 mb-4">
              Pay rent for <span className="font-medium">{rental?.title ?? rental?.propertyName ?? "this rental"}</span>
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-sm text-gray-800 block mb-1">Amount (₵)</label>
                <input
                  type="number"
                  step="0.01"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg p-2"
                  required
                />
              </div>

              <div>
                <label className="text-sm text-gray-800 block mb-1">Payment Method</label>
                <select value={method} onChange={(e) => setMethod(e.target.value)} className="w-full border border-gray-300 rounded-lg p-2">
                  <option value="mobile_money">Mobile Money</option>
                  <option value="card">Card (Stripe)</option>
                  <option value="bank_transfer">Bank Transfer</option>
                </select>
              </div>

              <div>
                <label className="text-sm text-gray-800 block mb-1">Note (optional)</label>
                <input value={note} onChange={(e) => setNote(e.target.value)} className="w-full border border-gray-300 rounded-lg p-2" placeholder="Payment note" />
              </div>

              <div className="flex gap-3">
                <button type="button" onClick={onClose} className="flex-1 border rounded-lg px-4 py-2 text-gray-700 hover:bg-gray-50">Cancel</button>
                <button type="submit" disabled={loading} className="flex-1 bg-[#0b6e4f] text-white rounded-lg px-4 py-2 hover:bg-[#095c42]">
                  {loading ? "Processing..." : "Pay Now"}
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
