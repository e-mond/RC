// src/components/tenant/RentPaymentModal.jsx
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CreditCard, Smartphone, X, Loader2 } from "lucide-react";

/**
 * RentPaymentModal - Enhanced with mobile money and card payment options
 * Props:
 * - open: boolean
 * - onClose: fn
 * - rental: object (selected rental)
 * - onPay: async fn({ rentalId, amount, method, metadata })
 * - loading: boolean
 */
export default function RentPaymentModal({ open, onClose, rental, onPay, loading }) {
  const [amount, setAmount] = useState("");
  const [method, setMethod] = useState("mobile_money");
  const [note, setNote] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardCVC, setCardCVC] = useState("");

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
    const metadata = {
      note,
      ...(method === "mobile_money" && { phoneNumber }),
      ...(method === "card" && { cardNumber, cardExpiry, cardCVC }),
    };

    await onPay({
      rentalId: rental.id ?? rental.rentalId,
      amount: Number(amount),
      method,
      metadata,
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
                  className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-[#0b6e4f]"
                  required
                />
              </div>

              <div>
                <label className="text-sm text-gray-800 block mb-1">Payment Method</label>
                <select
                  value={method}
                  onChange={(e) => setMethod(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-[#0b6e4f]"
                >
                  <option value="mobile_money">Mobile Money (MTN/Vodafone/AirtelTigo)</option>
                  <option value="card">Credit/Debit Card</option>
                  <option value="bank_transfer">Bank Transfer</option>
                </select>
              </div>

              {/* Mobile Money Fields */}
              {method === "mobile_money" && (
                <div>
                  <label className="text-sm text-gray-800 block mb-1">Phone Number</label>
                  <input
                    type="tel"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-[#0b6e4f]"
                    placeholder="0244 123 456"
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">Enter your mobile money number</p>
                </div>
              )}

              {/* Card Fields */}
              {method === "card" && (
                <div className="space-y-3">
                  <div>
                    <label className="text-sm text-gray-800 block mb-1">Card Number</label>
                    <input
                      type="text"
                      value={cardNumber}
                      onChange={(e) => setCardNumber(e.target.value.replace(/\s/g, "").slice(0, 16))}
                      className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-[#0b6e4f]"
                      placeholder="1234 5678 9012 3456"
                      maxLength={16}
                      required
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-sm text-gray-800 block mb-1">Expiry</label>
                      <input
                        type="text"
                        value={cardExpiry}
                        onChange={(e) => {
                          const val = e.target.value.replace(/\D/g, "").slice(0, 4);
                          setCardExpiry(val.length === 4 ? `${val.slice(0, 2)}/${val.slice(2)}` : val);
                        }}
                        className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-[#0b6e4f]"
                        placeholder="MM/YY"
                        maxLength={5}
                        required
                      />
                    </div>
                    <div>
                      <label className="text-sm text-gray-800 block mb-1">CVC</label>
                      <input
                        type="text"
                        value={cardCVC}
                        onChange={(e) => setCardCVC(e.target.value.replace(/\D/g, "").slice(0, 3))}
                        className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-[#0b6e4f]"
                        placeholder="123"
                        maxLength={3}
                        required
                      />
                    </div>
                  </div>
                </div>
              )}

              <div>
                <label className="text-sm text-gray-800 block mb-1">Note (optional)</label>
                <input
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-[#0b6e4f]"
                  placeholder="Payment note"
                />
              </div>

              <div className="flex gap-3">
                <button type="button" onClick={onClose} className="flex-1 border rounded-lg px-4 py-2 text-gray-700 hover:bg-gray-50">Cancel</button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-[#0b6e4f] text-white rounded-lg px-4 py-2 hover:bg-[#095c42] disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    "Pay Now"
                  )}
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
