// src/pages/Dashboards/Landlord/Properties/PropertyDetailsPage.jsx
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { fetchProperty, deleteProperty } from "@/services/propertyService";
import { useAuthStore } from "@/stores/authStore";
import Button from "@/components/ui/Button";
import ImageLightbox from "@/components/common/ImageLightbox";
import PropertyApprovalBanner from "@/components/common/PropertyApprovalBanner";
import { ArrowLeft, Edit, Trash2, MapPin, Bed, Bath, Square, Loader2, AlertTriangle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-hot-toast";
import { getAmenityName, getAmenityId } from "@/utils/amenityUtils";

/**
 * PropertyDetailsPage
 * - View property details with full information
 * - Edit and delete actions
 */
export default function PropertyDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deleting, setDeleting] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        setLoading(true);
        const res = await fetchProperty(id);
        const prop = res?.data ?? res;
        if (!mounted) return;
        setProperty(prop);
      } catch (err) {
        console.error("fetchProperty:", err);
        if (mounted) setError(err.message || "Could not load property");
      } finally {
        if (mounted) setLoading(false);
      }
    };
    if (id) load();
    return () => { mounted = false; };
  }, [id]);

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await deleteProperty(id);
      toast.success("Property deleted successfully");
      navigate("/landlord/properties", { replace: true });
    } catch (err) {
      console.error("deleteProperty:", err);
      toast.error(err.message || "Failed to delete property");
      setDeleting(false);
    }
  };

  const openLightbox = (index) => {
    setLightboxIndex(index);
    setLightboxOpen(true);
  };

  const getImageUrl = (img) => {
    if (typeof img === "string") return img;
    if (img?.url) return img.url;
    return null;
  };

  if (loading) {
    return (
      <div className="p-6">
        <p className="sr-only" role="status">
          Loading property...
        </p>
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/3" />
          <div className="h-64 bg-gray-200 rounded" />
          <div className="h-4 bg-gray-200 rounded w-2/3" />
        </div>
      </div>
    );
  }

  if (error || !property) {
    const isNotFound = error?.includes("not found") || error?.includes("404");
    
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white dark:bg-gray-900 rounded-xl shadow-lg p-6 text-center">
          <AlertTriangle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            {isNotFound ? "Property Not Found" : "Error Loading Property"}
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            {isNotFound 
              ? `The property with ID "${id}" could not be found. It may have been deleted or doesn't exist.`
              : error || "An error occurred while loading the property."
            }
          </p>
          <div className="flex gap-3 justify-center">
            <Button 
              onClick={() => navigate("/landlord/properties")} 
              variant="outline"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Properties
            </Button>
            {!isNotFound && (
              <Button onClick={() => window.location.reload()}>
                Retry
              </Button>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          onClick={() => navigate("/landlord/properties")}
          className="flex items-center gap-2"
        >
          <ArrowLeft size={18} />
          Back
        </Button>
        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={() => navigate(`/landlord/properties/${id}/edit`)}
            className="flex items-center gap-2"
          >
            <Edit size={18} />
            Edit
          </Button>
          <Button
            variant="outline"
            onClick={() => setShowDeleteModal(true)}
            disabled={deleting}
            className="flex items-center gap-2 text-red-600 hover:text-red-700 disabled:opacity-50"
          >
            <Trash2 size={18} />
            Delete
          </Button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm p-6">
        {property.status && property.status !== "published" && property.status !== "active" && property.status !== "available" && (
          <PropertyApprovalBanner status={property.status} isLandlord={true} />
        )}
        <h1 className="text-3xl font-bold text-[#0f1724] mb-2 mt-4">{property.title}</h1>
        <p className="text-gray-600 flex items-center gap-2">
          <MapPin size={16} />
          {property.address || "Address not specified"}
        </p>

        <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="flex items-center gap-2 text-gray-700">
            <Bed size={20} />
            <span>{property.bedrooms || 0} Bedrooms</span>
          </div>
          <div className="flex items-center gap-2 text-gray-700">
            <Bath size={20} />
            <span>{property.bathrooms || 0} Bathrooms</span>
          </div>
          {property.area && (
            <div className="flex items-center gap-2 text-gray-700">
              <Square size={20} />
              <span>{property.area} sqm</span>
            </div>
          )}
          <div className="text-gray-700">
            <span className="font-semibold text-[#0b6e4f] text-lg">
              ₵
              {Number(property.priceGhs ?? property.price ?? 0).toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </span>
            <span className="text-sm text-gray-500">/{property.currency || "GHS"}</span>
          </div>
        </div>

        {property.description && (
          <div className="mt-6">
            <h3 className="text-lg font-semibold mb-2">Description</h3>
            <p className="text-gray-700">{property.description}</p>
          </div>
        )}

        {(property.ownerName || property.ownerEmail) && (
          <div className="mt-6">
            <h3 className="text-lg font-semibold mb-2">Owner</h3>
            <p className="text-gray-700 font-medium">{property.ownerName || "Owner"}</p>
            {property.ownerEmail && <p className="text-sm text-gray-500">{property.ownerEmail}</p>}
          </div>
        )}

        {property.amenities && property.amenities.length > 0 && (
          <div className="mt-6">
            <h3 className="text-lg font-semibold mb-2">Amenities</h3>
            <div className="flex flex-wrap gap-2">
              {property.amenities.map((amenity, idx) => {
                const amenityName = getAmenityName(amenity, idx);
                const amenityId = getAmenityId(amenity);
                
                return (
                  <span
                    key={amenityId || idx}
                    className="px-3 py-1 bg-[#0b6e4f]/10 text-[#0b6e4f] rounded-full text-sm"
                  >
                    {amenityName}
                  </span>
                );
              })}
            </div>
          </div>
        )}

        {property.images && property.images.length > 0 && (
          <div className="mt-6">
            <h3 className="text-lg font-semibold mb-4">Images ({property.images.length})</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {property.images.map((img, idx) => {
                const url = getImageUrl(img);
                if (!url) return null;
                return (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="relative group cursor-pointer rounded-lg overflow-hidden border border-gray-200 aspect-square"
                    onClick={() => openLightbox(idx)}
                  >
                    <img
                      src={url}
                      alt={`${property.title} - Image ${idx + 1}`}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      onError={(e) => {
                        console.error(`Failed to load image: ${url}`);
                        e.target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='400'%3E%3Crect fill='%23e5e7eb' width='400' height='400'/%3E%3Ctext fill='%239ca3af' font-family='sans-serif' font-size='18' x='50%25' y='50%25' text-anchor='middle' dy='.3em'%3EImage not found%3C/text%3E%3C/svg%3E";
                      }}
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
                    {idx === 0 && (
                      <div className="absolute top-2 left-2 px-2 py-1 bg-[#0b6e4f] text-white text-xs rounded">
                        Main
                      </div>
                    )}
                  </motion.div>
                );
              })}
            </div>
          </div>
        )}

        <div className="mt-6 pt-6 border-t">
          <div className="flex items-center gap-4 text-sm text-gray-600">
            <span>
              Status:{" "}
              <span className="font-semibold capitalize">{property.status || "unknown"}</span>
            </span>
            {property.createdAt && (
              <span>Created: {new Date(property.createdAt).toLocaleDateString()}</span>
            )}
          </div>
        </div>
      </div>

      {/* Image Lightbox */}
      {lightboxOpen && property.images && (
        <ImageLightbox
          images={property.images}
          currentIndex={lightboxIndex}
          onClose={() => setLightboxOpen(false)}
          onNavigate={setLightboxIndex}
        />
      )}

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
                      <Loader2 size={18} className="animate-spin" />
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
    </div>
  );
}
