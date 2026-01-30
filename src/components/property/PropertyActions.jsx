/**
 * PropertyActions Component
 * 
 * Displays action buttons for property detail page (favorite, book viewing, edit, delete).
 * Extracted from PropertyDetail.jsx for better code organization.
 */

import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Heart, Calendar, Edit, Trash2, AlertTriangle } from "lucide-react";
import { toast } from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";
import { deleteProperty } from "@/services/propertyService";

export default function PropertyActions({
  propertyId,
  isFavorite,
  onToggleFavorite,
  onBookViewing,
  isTenant,
  isOwner,
  isLoading = false,
}) {
  const navigate = useNavigate();
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await deleteProperty(propertyId);
      toast.success("Property deleted successfully");
      navigate("/landlord/properties");
    } catch (err) {
      toast.error(err.message || "Failed to delete property");
      setDeleting(false);
    }
  };

  if (isTenant) {
    return (
      <>
        <button
          onClick={onToggleFavorite}
          disabled={isLoading}
          className="w-full px-6 py-3.5 border-2 border-[#0b6e4f] dark:border-emerald-600 text-[#0b6e4f] dark:text-emerald-400 rounded-lg hover:bg-[#0b6e4f]/10 dark:hover:bg-emerald-600/10 transition-colors font-medium flex items-center justify-center gap-2 text-base sm:text-lg disabled:opacity-50"
        >
          <Heart size={20} className={isFavorite ? "fill-current" : ""} />
          {isFavorite ? "Remove from Favorites" : "Add to Favorites"}
        </button>

        <button
          onClick={onBookViewing}
          disabled={isLoading}
          className="w-full px-6 py-3.5 bg-[#0b6e4f] dark:bg-emerald-600 text-white rounded-lg hover:bg-[#095c42] dark:hover:bg-emerald-700 transition-colors font-medium flex items-center justify-center gap-2 text-base sm:text-lg disabled:opacity-50"
        >
          <Calendar size={20} />
          Book Viewing
        </button>
      </>
    );
  }

  if (isOwner) {
    return (
      <div className="flex flex-col sm:flex-row gap-3">
        <Link
          to={`/landlord/properties/${propertyId}/edit`}
          className="flex-1 flex items-center justify-center gap-2 px-6 py-3.5 bg-[#0b6e4f] dark:bg-emerald-600 text-white rounded-lg hover:bg-[#095c42] dark:hover:bg-emerald-700 transition-colors text-center font-medium text-base sm:text-lg"
        >
          <Edit size={18} />
          Edit Property
        </Link>
        <button
          onClick={() => setShowDeleteModal(true)}
          disabled={isLoading}
          className="flex-1 flex items-center justify-center gap-2 px-6 py-3.5 bg-red-600 dark:bg-red-700 text-white rounded-lg hover:bg-red-700 dark:hover:bg-red-800 transition-colors text-center font-medium text-base sm:text-lg disabled:opacity-50"
        >
          <Trash2 size={18} />
          Delete Property
        </button>
      </div>
    );
  }

  return (
    <>
      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {showDeleteModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 dark:bg-black/70 flex items-center justify-center z-50 p-4"
            onClick={() => !deleting && setShowDeleteModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              className="bg-white dark:bg-gray-800 rounded-2xl max-w-md w-full p-6 sm:p-8 shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                  <AlertTriangle className="w-6 h-6 text-red-600 dark:text-red-400" />
                </div>
                <div>
                  <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
                    Delete Property
                  </h2>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    This action cannot be undone
                  </p>
                </div>
              </div>

              <p className="text-gray-700 dark:text-gray-300 mb-6">
                Are you sure you want to delete this property? All associated data, including images, bookings, and reviews, will be permanently removed. This action will be logged in the audit trail.
              </p>

              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  type="button"
                  onClick={() => setShowDeleteModal(false)}
                  disabled={deleting}
                  className="flex-1 px-6 py-3 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors font-medium text-gray-700 dark:text-gray-300 disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDelete}
                  disabled={deleting}
                  className="flex-1 px-6 py-3 bg-red-600 dark:bg-red-700 text-white rounded-lg hover:bg-red-700 dark:hover:bg-red-800 transition-colors font-medium disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {deleting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Deleting...
                    </>
                  ) : (
                    <>
                      <Trash2 size={18} />
                      Delete Property
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

