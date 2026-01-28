// src/pages/Dashboards/Tenant/TenantWishlist.jsx
import React, { useEffect, useState } from "react";
import { getFavorites, removeFromFavorites } from "@/services/tenantService";
import { fetchProperty } from "@/services/propertyService";
import { Heart, MapPin, Bed, Bath, DollarSign, Trash2, ExternalLink, Loader2 } from "lucide-react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useFeatureStore } from "@/stores/featureStore";
import PropertyCard from "@/components/shared/PropertyCard";

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
        if (mounted) {
          const favoritesList = Array.isArray(data) ? data : [];
          
          // Fetch full property details for each favorite to ensure complete data
          const enrichedFavorites = await Promise.all(
            favoritesList.map(async (fav) => {
              const propertyId = fav.id || fav.propertyId || fav.property?.id || fav.property_id;
              if (!propertyId) {
                console.warn("Favorite missing property ID:", fav);
                return fav;
              }
              
              try {
                // Fetch full property details using authenticated endpoint
                const fullProperty = await fetchProperty(propertyId);
                
                // Extract property data from various possible response structures
                let propertyData = fullProperty;
                if (fullProperty?.data) propertyData = fullProperty.data;
                else if (fullProperty?.property) propertyData = fullProperty.property;
                else if (fullProperty?.results?.[0]) propertyData = fullProperty.results[0];
                
                // Ensure propertyData is an object
                if (!propertyData || typeof propertyData !== 'object') {
                  console.warn(`Invalid property data for ID ${propertyId}:`, propertyData);
                  return {
                    ...fav,
                    id: propertyId,
                    title: fav.title || fav.name || "Untitled Property",
                    images: fav.images || (fav.image ? [fav.image] : []),
                  };
                }
                
                // Merge favorite metadata with full property data, ensuring required fields
                return {
                  ...propertyData,
                  id: propertyId,
                  // Ensure title exists
                  title: propertyData.title || propertyData.name || fav.title || fav.name || "Untitled Property",
                  // Ensure images exist
                  images: propertyData.images || (propertyData.image ? [propertyData.image] : []) || fav.images || (fav.image ? [fav.image] : []),
                  image: propertyData.image || propertyData.images?.[0] || fav.image || fav.images?.[0],
                  // Ensure address exists
                  address: propertyData.address || propertyData.location || fav.address || fav.location || "Location not specified",
                  // Preserve any favorite-specific fields
                  ...(fav.propertyId && { propertyId: fav.propertyId }),
                };
              } catch (err) {
                console.warn(`Failed to fetch property ${propertyId}:`, err);
                // Return original favorite data with normalized fields if fetch fails
                return {
                  ...fav,
                  id: propertyId,
                  title: fav.title || fav.name || fav.property?.title || fav.property?.name || "Untitled Property",
                  images: fav.images || (fav.image ? [fav.image] : []) || fav.property?.images || (fav.property?.image ? [fav.property.image] : []),
                  image: fav.image || fav.images?.[0] || fav.property?.image || fav.property?.images?.[0],
                  address: fav.address || fav.location || fav.property?.address || fav.property?.location || "Location not specified",
                };
              }
            })
          );
          
          setFavorites(enrichedFavorites);
        }
      } catch (err) {
        console.error("getFavorites:", err);
        if (mounted) {
          const { getErrorMessage } = await import("@/utils/errorMessages");
          setError(getErrorMessage(err, "Failed to load favorites. Please try again."));
        }
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
      const { getErrorMessage } = await import("@/utils/errorMessages");
      setError(getErrorMessage(err, "Failed to remove from favorites. Please try again."));
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
            {favorites.map((property) => {
              const propertyId = property.id || property.propertyId || property.property_id;
              
              // Ensure property has required fields for PropertyCard
              // Handle nested property objects from favorites API
              const baseProperty = property.property || property;
              
              const normalizedProperty = {
                ...baseProperty,
                ...property, // Spread property to override with any direct fields
                id: propertyId,
                // Title: try multiple sources
                title: property.title || property.name || baseProperty?.title || baseProperty?.name || "Untitled Property",
                // Address: try multiple sources
                address: property.address || property.location || baseProperty?.address || baseProperty?.location || "Location not specified",
                // Images: handle both array and single image, try multiple sources
                images: property.images || 
                       (property.image ? [property.image] : []) || 
                       baseProperty?.images || 
                       (baseProperty?.image ? [baseProperty.image] : []) ||
                       [],
                image: property.image || 
                      property.images?.[0] || 
                      baseProperty?.image || 
                      baseProperty?.images?.[0],
                status: property.status || baseProperty?.status || "active",
                price: property.price || property.priceGhs || property.rent || baseProperty?.price || baseProperty?.priceGhs || baseProperty?.rent || 0,
                currency: property.currency || baseProperty?.currency || "GHS",
                bedrooms: property.bedrooms ?? baseProperty?.bedrooms,
                bathrooms: property.bathrooms ?? baseProperty?.bathrooms,
                landlord: property.landlord || property.landlord_profile || baseProperty?.landlord || baseProperty?.landlord_profile,
              };
              
              // Debug logging in development
              if (import.meta.env.DEV && (!normalizedProperty.title || !normalizedProperty.images?.length)) {
                console.log(`[Wishlist] Property ${propertyId} normalization:`, {
                  original: property,
                  normalized: normalizedProperty,
                  hasTitle: !!normalizedProperty.title,
                  hasImages: !!normalizedProperty.images?.length,
                });
              }
              
              return (
                <motion.div
                  key={propertyId}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="relative"
                >
                  <PropertyCard 
                    property={normalizedProperty} 
                    showTrustScore={true}
                    linkTo={`/tenant/properties/${propertyId}`}
                    actions={
                      <div className="flex items-center justify-between mt-3">
                        <Link
                          to={`/tenant/properties/${propertyId}`}
                          className="text-sm text-[#0b6e4f] hover:underline font-medium"
                          onClick={(e) => e.stopPropagation()}
                        >
                          View Details
                        </Link>
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            handleRemove(propertyId);
                          }}
                          disabled={removingId === propertyId}
                          className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors disabled:opacity-50"
                          title="Remove from favorites"
                        >
                          {removingId === propertyId ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <Heart className="w-4 h-4 fill-red-600" />
                          )}
                        </button>
                      </div>
                    }
                  />
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}
    </div>
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