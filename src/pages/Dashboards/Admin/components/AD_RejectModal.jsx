import React, { useState } from "react";
import { motion } from "framer-motion";

/**
 * Modal to capture rejection reason.
 * Props:
 * - property: object
 * - onClose: () => void
 * - onConfirm: (payload) => Promise
 */
export default function AD_RejectModal({ property, onClose, onConfirm }) {
  const [loading, setLoading] = useState(false);
  const [reason, setReason] = useState("");

  const confirm = async () => {
    if (!reason.trim()) return alert("Please provide a reason for rejection.");
    setLoading(true);
    try {
      await onConfirm({ reason });
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40 px-4">
      <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="max-w-lg w-full bg-white rounded-lg p-6 shadow-lg">
        <h3 className="text-lg font-semibold">Reject Listing</h3>
        <p className="text-sm text-gray-600 mt-2">You're rejecting <strong>{property.title}</strong>. Provide a reason so the owner can act.</p>

        <label className="block mt-4 text-sm">
          Rejection reason:
          <textarea value={reason} onChange={(e) => setReason(e.target.value)} className="w-full mt-2 border rounded p-2 h-28" placeholder="Explain why this listing is not allowed or needs fixes."/>
        </label>

        <div className="mt-4 flex justify-end gap-3">
          <button onClick={onClose} className="px-4 py-2 border rounded">Cancel</button>
          <button onClick={confirm} disabled={loading} className="px-4 py-2 bg-red-600 text-white rounded">
            {loading ? "Rejecting..." : "Reject"}
          </button>
        </div>
      </motion.div>
    </div>
  );
}
