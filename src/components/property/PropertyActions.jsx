/**
 * PropertyActions Component
 * 
 * Displays action buttons for property detail page (favorite, book viewing, edit, delete).
 * Extracted from PropertyDetail.jsx for better code organization.
 */

import { Link, useNavigate } from "react-router-dom";
import { Heart, Calendar, Edit, Trash2 } from "lucide-react";
import { toast } from "react-hot-toast";
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

  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this property? This action cannot be undone.")) {
      return;
    }
    try {
      await deleteProperty(propertyId);
      toast.success("Property deleted successfully");
      navigate("/landlord/properties");
    } catch (err) {
      toast.error(err.message || "Failed to delete property");
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
          onClick={handleDelete}
          disabled={isLoading}
          className="flex-1 flex items-center justify-center gap-2 px-6 py-3.5 bg-red-600 dark:bg-red-700 text-white rounded-lg hover:bg-red-700 dark:hover:bg-red-800 transition-colors text-center font-medium text-base sm:text-lg disabled:opacity-50"
        >
          <Trash2 size={18} />
          Delete Property
        </button>
      </div>
    );
  }

  return null;
}

