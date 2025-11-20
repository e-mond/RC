// src/pages/Dashboards/Landlord/Properties/PropertyDetailsPage.jsx
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { fetchProperty, deleteProperty } from "@/services/propertyService";
import Button from "@/components/ui/Button";
import ImageLightbox from "@/components/common/ImageLightbox";
import { ArrowLeft, Edit, Trash2, MapPin, Bed, Bath, Square, Loader2 } from "lucide-react";
import { motion } from "framer-motion";

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
    if (!confirm("Are you sure you want to delete this property? This action cannot be undone.")) {
      return;
    }

    setDeleting(true);
    try {
      await deleteProperty(id);
      navigate("/landlord/properties", { replace: true });
    } catch (err) {
      console.error("deleteProperty:", err);
      setError(err.message || "Failed to delete property");
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
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg">
          {error || "Property not found"}
        </div>
        <Button onClick={() => navigate("/landlord/properties")} className="mt-4">
          Back to Properties
        </Button>
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
            onClick={handleDelete}
            disabled={deleting}
            className="flex items-center gap-2 text-red-600 hover:text-red-700 disabled:opacity-50"
          >
            {deleting ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                Deleting...
              </>
            ) : (
              <>
                <Trash2 size={18} />
                Delete
              </>
            )}
          </Button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm p-6">
        <h1 className="text-3xl font-bold text-[#0f1724] mb-2">{property.title}</h1>
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
              {property.amenities.map((amenity, idx) => (
                <span
                  key={idx}
                  className="px-3 py-1 bg-[#0b6e4f]/10 text-[#0b6e4f] rounded-full text-sm"
                >
                  {amenity.name || amenity}
                </span>
              ))}
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
    </div>
  );
}

