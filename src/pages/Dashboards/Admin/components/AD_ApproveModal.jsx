import React, { useState } from "react";
import { motion } from "framer-motion";

/**
 * Simple modal to confirm approval and optionally add a note.
 * Props:
 * - property: object
 * - onClose: () => void
 * - onConfirm: (payload) => Promise
 */
export default function AD_ApproveModal({ property, onClose, onConfirm }) {
  const [loading, setLoading] = useState(false);
  const [note, setNote] = useState("");

  const confirm = async () => {
    setLoading(true);
    try {
      await onConfirm({ note });
    } catch (err) {
      // bubble up
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40 px-4">
      <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="max-w-lg w-full bg-white rounded-lg p-6 shadow-lg">
        <h3 className="text-lg font-semibold">Approve Listing</h3>
        <p className="text-sm text-gray-600 mt-2">You're about to approve <strong>{property.title}</strong> listed by {property.ownerName}.</p>

        <label className="block mt-4 text-sm">
          Optional note for owner / audit:
          <textarea value={note} onChange={(e) => setNote(e.target.value)} className="w-full mt-2 border rounded p-2 h-24" placeholder="Add a note (optional)"/>
        </label>

        <div className="mt-4 flex justify-end gap-3">
          <button onClick={onClose} className="px-4 py-2 border rounded">Cancel</button>
          <button onClick={confirm} disabled={loading} className="px-4 py-2 bg-[#0b6e4f] text-white rounded">
            {loading ? "Approving..." : "Approve"}
          </button>
        </div>
      </motion.div>
    </div>
  );
}
