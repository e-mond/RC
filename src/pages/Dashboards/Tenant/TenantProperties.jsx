// src/pages/Dashboards/Tenant/TenantProperties.jsx
import React, { useEffect, useState } from "react";
import { fetchProperties } from "@/services/propertyService";
import { addToFavorites, removeFromFavorites, isFavorited } from "@/services/tenantService";
import { Heart, MapPin, Bed, Bath, Search, Loader2, ExternalLink, Zap } from "lucide-react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-hot-toast";
import { useFeatureAccess } from "@/context/FeatureAccessContext";
import AdBanner from "@/pages/Ads/AdBanner";

/**
 * TenantProperties - Browse all available properties
 * - View all properties
 * - Search and filter properties
 * - Add/remove from favorites
 * - Navigate to property details
 * - Boosted/Promoted properties appear first with visual indicators
 * - Premium users see no ads
 */
export default function TenantProperties() {
    const { isPremium } = useFeatureAccess(); // For ad-free experience
    const [properties, setProperties] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [searchTerm, setSearchTerm] = useState("");
    const [favorites, setFavorites] = useState(new Set());

    useEffect(() => {
        let mounted = true;
        const load = async () => {
            try {
                setLoading(true);
                const data = await fetchProperties();
                if (mounted) {
                    const propertyList = Array.isArray(data) ? data : [];

                    // Sort: Boosted properties first
                    const sortedProperties = propertyList.sort((a, b) => {
                        if (a.isBoosted && !b.isBoosted) return -1;
                        if (!a.isBoosted && b.isBoosted) return 1;
                        return 0;
                    });

                    setProperties(sortedProperties);

                    // Check favorites for each property
                    const favoriteIds = new Set();
                    for (const property of propertyList) {
                        try {
                            const isFav = await isFavorited(property.id);
                            if (isFav) favoriteIds.add(property.id);
                        } catch (err) {
                            console.warn("Failed to check favorite:", err);
                        }
                    }
                    if (mounted) setFavorites(favoriteIds);
                }
            } catch (err) {
                console.error("fetchProperties:", err);
                if (mounted) setError(err.message || "Failed to load properties");
            } finally {
                if (mounted) setLoading(false);
            }
        };
        load();
        return () => {
            mounted = false;
        };
    }, []);

    const handleToggleFavorite = async (propertyId) => {
        const isFavorited = favorites.has(propertyId);

        try {
            if (isFavorited) {
                await removeFromFavorites(propertyId);
                setFavorites((prev) => {
                    const newSet = new Set(prev);
                    newSet.delete(propertyId);
                    return newSet;
                });
                toast.success("Removed from favorites");
            } else {
                await addToFavorites(propertyId);
                setFavorites((prev) => new Set(prev).add(propertyId));
                toast.success("Added to favorites");
            }
        } catch (err) {
            console.error("toggleFavorite:", err);
            toast.error(err.message || "Failed to update favorites");
        }
    };

    const filteredProperties = properties.filter((property) => {
        if (!searchTerm) return true;
        const term = searchTerm.toLowerCase();
        return (
            property.title?.toLowerCase().includes(term) ||
            property.address?.toLowerCase().includes(term) ||
            property.location?.toLowerCase().includes(term) ||
            property.description?.toLowerCase().includes(term)
        );
    });

    if (loading) {
        return (
            <div className="p-6 flex items-center justify-center min-h-[400px]">
                <Loader2 className="w-8 h-8 animate-spin text-[#0b6e4f]" />
            </div>
        );
    }

    return (
        <div className="p-6 max-w-7xl mx-auto space-y-6">
            <header className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Browse Properties</h2>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Find your perfect rental home</p>
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                    {filteredProperties.length} {filteredProperties.length === 1 ? "property" : "properties"} available
                </div>
            </header>

            {/* Search Bar */}
            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                <input
                    type="text"
                    placeholder="Search by location, title, or description..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#0b6e4f] focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                />
            </div>

            {/* Ad Banner - Only for non-premium tenants */}
            {!isPremium && <AdBanner position="top" />}

            {error && (
                <div className="p-4 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 rounded-lg">
                    {error}
                </div>
            )}

            {filteredProperties.length === 0 ? (
                <EmptyState hasSearchTerm={!!searchTerm} />
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <AnimatePresence>
                        {filteredProperties.map((property) => (
                            <PropertyCard
                                key={property.id}
                                property={property}
                                isFavorited={favorites.has(property.id)}
                                onToggleFavorite={handleToggleFavorite}
                                isBoosted={!!property.isBoosted} // Pass boosted status
                            />
                        ))}
                    </AnimatePresence>
                </div>
            )}

            {/* Bottom Ad Banner */}
            {!isPremium && <AdBanner position="bottom" />}
        </div>
    );
}

// Enhanced Property Card with Boosted Ribbon
function PropertyCard({ property, isFavorited, onToggleFavorite, isBoosted = false }) {
    const imageUrl = property.images?.[0]?.image || property.images?.[0] || property.image || "https://placehold.co/400x300?text=Property";
    const price = property.price || property.priceGhs || property.rent || 0;
    const currency = property.currency || "GHS";

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className={`relative bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-lg transition-all ${isBoosted ? "ring-4 ring-amber-400/40" : ""
                }`}
        >
            {/* Boosted Ribbon Badge */}
            {isBoosted && (
                <div className="absolute top-0 left-0 z-10">
                    <div className="relative">
                        <div className="bg-linear-to-br from-amber-500 to-orange-600 text-white px-6 py-2 rounded-br-2xl font-bold text-sm flex items-center gap-2 shadow-lg">
                            <Zap className="w-5 h-5 animate-pulse" />
                            BOOSTED
                        </div>
                        <div className="absolute top-full left-0 w-0 h-0 border-l-10 border-l-amber-600 border-b-10 border-b-transparent" />
                    </div>
                </div>
            )}

            {/* Image */}
            <div className="relative h-48 bg-gray-200 dark:bg-gray-700">
                <img
                    src={imageUrl}
                    alt={property.title || "Property"}
                    className="w-full h-full object-cover"
                />
                <button
                    onClick={() => onToggleFavorite(property.id)}
                    className={`absolute top-3 right-3 p-2 rounded-full shadow-md transition-colors ${isFavorited
                        ? "bg-red-50 dark:bg-red-900/30 hover:bg-red-100 dark:hover:bg-red-900/50"
                        : "bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700"
                        }`}
                    aria-label={isFavorited ? "Remove from favorites" : "Add to favorites"}
                >
                    <Heart
                        className={`w-5 h-5 transition-colors ${isFavorited ? "text-red-600 fill-red-600" : "text-gray-600 dark:text-gray-400"
                            }`}
                    />
                </button>
                {property.status && (
                    <div className={`absolute top-3 left-3 px-3 py-1 rounded-full text-xs font-medium ${property.status === 'available' ? 'bg-green-500' : 'bg-gray-500'
                        } text-white`}>
                        {property.status}
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

                {property.description && (
                    <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                        {property.description}
                    </p>
                )}

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
                        <span className="text-sm text-gray-500 dark:text-gray-400 ml-1">/{property.period || "month"}</span>
                    </div>
                    <Link
                        to={`/tenant/properties/${property.id}`}
                        className="px-4 py-2 bg-[#0b6e4f] text-white rounded-lg hover:bg-[#095c42] transition-colors flex items-center gap-2 text-sm font-medium"
                    >
                        View
                        <ExternalLink size={14} />
                    </Link>
                </div>

                {/* Boosted Footer Note */}
                {isBoosted && (
                    <div className="flex items-center gap-2 text-amber-700 dark:text-amber-400 text-xs font-medium pt-2">
                        <Zap className="w-4 h-4" />
                        <span>Promoted • Appears at the top of search results</span>
                    </div>
                )}
            </div>
        </motion.div>
    );
}

// Empty State
function EmptyState({ hasSearchTerm }) {
    return (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-12 text-center border border-gray-200 dark:border-gray-700">
            <div className="mx-auto w-24 h-24 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mb-6">
                <Search className="w-12 h-12 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                {hasSearchTerm ? "No Properties Found" : "No Properties Available"}
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-md mx-auto">
                {hasSearchTerm
                    ? "Try adjusting your search to find what you're looking for."
                    : "There are no properties available at the moment. Please check back later."}
            </p>
            {hasSearchTerm && (
                <button
                    onClick={() => window.location.reload()}
                    className="inline-flex items-center gap-2 px-6 py-3 bg-[#0b6e4f] text-white rounded-lg hover:bg-[#095c42] transition-colors font-medium"
                >
                    Clear Search
                </button>
            )}
        </div>
    );
}