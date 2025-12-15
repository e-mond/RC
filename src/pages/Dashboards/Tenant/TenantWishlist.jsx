// src/pages/Dashboards/Tenant/TenantWishlist.jsx
import React, { useEffect, useState } from "react";
import { getFavorites, removeFromFavorites } from "@/services/tenantService";
import { Heart, MapPin, Bed, Bath, DollarSign, Trash2, ExternalLink, Loader2 } from "lucide-react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useFeatureStore } from "@/stores/featureStore";

/**
 * TenantWishlist - Fully Dark Mode Compatible
 */
export default function TenantWishlist() {
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [removingId, setRemovingId] = useState(null);
  const isPremium = useFeatureStore((state) => state.isPremium());

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        setLoading(true);
        const data = await getFavorites();
        if (mounted) setFavorites(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("getFavorites:", err);
        if (mounted) setError(err.message || "Failed to load favorites");
      } finally {
        if (mounted) setLoading(false);
      }
    };
    load();
    return () => {
      mounted = false;
    };
  }, []);

  const handleRemove = async (propertyId) => {
    setRemovingId(propertyId);
    try {
      await removeFromFavorites(propertyId);
      setFavorites((prev) => prev.filter((p) => p.id !== propertyId && p.propertyId !== propertyId));
    } catch (err) {
      console.error("removeFromFavorites:", err);
      setError(err.message || "Failed to remove from favorites");
    } finally {
      setRemovingId(null);
    }
  };

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[400px] bg-gray-50 dark:bg-gray-900">
        <Loader2 className="w-8 h-8 animate-spin text-[#0b6e4f]" />
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <header className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">My Wishlist</h2>
          <p className="text-sm text-gray-600 dark:text-gray-400">Your saved favorite properties</p>
        </div>
        {favorites.length > 0 && (
          <div className="text-sm text-gray-600 dark:text-gray-400">
            {favorites.length} {favorites.length === 1 ? "property" : "properties"} saved
          </div>
        )}
      </header>

      {error && (
        <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 rounded-lg">
          {error}
        </div>
      )}

      {favorites.length === 0 ? (
        <EmptyWishlistState />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence>
            {favorites.map((property) => (
              <PropertyCard
                key={property.id || property.propertyId}
                property={property}
                onRemove={handleRemove}
                removing={removingId === (property.id || property.propertyId)}
                isPremium={isPremium}
              />
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}

// Property Card - Dark Mode Ready
function PropertyCard({ property, onRemove, removing, isPremium }) {
  const propertyId = property.id || property.propertyId;
  const imageUrl = property.images?.[0] || property.image || "https://placehold.co/400x300?text=Property";
  const price = property.price || property.priceGhs || 0;
  const currency = property.currency || "GHS";

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-xl dark:hover:shadow-2xl transition-all duration-300"
    >
      {/* Image */}
      <div className="relative h-48 bg-gray-200 dark:bg-gray-700">
        <img
          src={imageUrl}
          alt={property.title || "Property"}
          className="w-full h-full object-cover"
        />
        <button
          onClick={() => onRemove(propertyId)}
          disabled={removing}
          className="absolute top-3 right-3 p-2 bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm rounded-full shadow-md hover:bg-red-50 dark:hover:bg-red-900/50 transition-all disabled:opacity-50"
          aria-label="Remove from favorites"
        >
          {removing ? (
            <Loader2 className="w-5 h-5 text-red-600 animate-spin" />
          ) : (
            <Heart className="w-5 h-5 text-red-600 fill-red-600" />
          )}
        </button>
        {isPremium && property.priceChanged && (
          <div className="absolute top-3 left-3 px-3 py-1 bg-yellow-500 text-white text-xs font-medium rounded-full shadow-lg">
            Price Changed
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4 space-y-3">
        <div>
          <h3 className="font-semibold text-lg text-gray-900 dark:text-white line-clamp-1">
            {property.title || "Untitled Property"}
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-1 mt-1">
            <MapPin size={14} />
            {property.address || property.location || "Location not specified"}
          </p>
        </div>

        <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
          {property.bedrooms !== undefined && (
            <span className="flex items-center gap-1">
              <Bed size={16} />
              {property.bedrooms} bed
            </span>
          )}
          {property.bathrooms !== undefined && (
            <span className="flex items-center gap-1">
              <Bath size={16} />
              {property.bathrooms} bath
            </span>
          )}
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-gray-200 dark:border-gray-700">
          <div>
            <span className="text-2xl font-bold text-[#0b6e4f]">
              {currency === "GHS" ? "₵" : "$"}
              {price.toLocaleString()}
            </span>
            <span className="text-sm text-gray-500 dark:text-gray-400 ml-1">
              /{property.period || "month"}
            </span>
          </div>
          <Link
            to={`/tenant/properties/${propertyId}`}
            className="px-4 py-2 bg-[#0b6e4f] text-white rounded-lg hover:bg-[#095c42] transition-colors flex items-center gap-2 text-sm font-medium"
          >
            View
            <ExternalLink size={14} />
          </Link>
        </div>
      </div>
    </motion.div>
  );
}

// Empty State - Dark Mode Enhanced
function EmptyWishlistState() {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-12 text-center border border-gray-200 dark:border-gray-700">
      <div className="mx-auto w-24 h-24 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mb-6">
        <Heart className="w-12 h-12 text-gray-400 dark:text-gray-500" />
      </div>
      <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">No Favorites Yet</h3>
      <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-md mx-auto">
        Start exploring properties and save your favorites to view them here later.
      </p>
      <Link
        to="/tenant/properties"
        className="inline-flex items-center gap-2 px-6 py-3 bg-[#0b6e4f] text-white rounded-lg hover:bg-[#095c42] transition-colors font-medium"
      >
        Browse Properties
        <ExternalLink size={18} />
      </Link>
    </div>
  );
}