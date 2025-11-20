// src/components/ui/ConfirmModal.jsx
import React from "react";
import Button from "./Button";

/**
 * Simple confirm modal
 * props: open, title, message, onClose, onConfirm
 */
export default function ConfirmModal({ open, title = "Confirm", message = "", onClose = () => {}, onConfirm = () => {} }) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="bg-white rounded-lg shadow-lg max-w-lg w-full p-6">
        <h3 className="text-lg font-semibold">{title}</h3>
        <p className="text-sm text-gray-600 mt-2">{message}</p>

        <div className="mt-4 flex justify-end gap-2">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button variant="primary" onClick={onConfirm}>Confirm</Button>
        </div>
      </div>
    </div>
  );
}
