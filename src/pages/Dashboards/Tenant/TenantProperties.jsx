// src/pages/Dashboards/Tenant/TenantProperties.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { fetchProperties } from "@/services/propertyService";
import { addToFavorites, removeFromFavorites, isFavorited } from "@/services/tenantService";
import { Heart, MapPin, Bed, Bath, Search, Filter, Loader2, ExternalLink, Map as MapIcon, Grid, Trash2 } from "lucide-react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-hot-toast";
import EnhancedPropertyMapSearch from "@/components/property/EnhancedPropertyMapSearch";
import ConfirmModal from "@/components/ui/ConfirmModal";
import PropertyCard from "@/components/shared/PropertyCard";
import RecommendationsSection from "@/components/ai/RecommendationsSection";

/**
 * TenantProperties - Browse all available properties
 * - View all properties
 * - Search and filter properties
 * - Add/remove from favorites
 * - Navigate to property details
 */
export default function TenantProperties() {
    const navigate = useNavigate();
    const [properties, setProperties] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [searchTerm, setSearchTerm] = useState("");
    const [favorites, setFavorites] = useState(new Set());
    const [viewMode, setViewMode] = useState("grid"); // "grid" or "map"

    useEffect(() => {
        let mounted = true;
        const load = async () => {
            try {
                setLoading(true);
                const data = await fetchProperties();
                if (mounted) {
                    const propertyList = Array.isArray(data) ? data : [];
                    setProperties(propertyList);

                    // Check favorites for each property
                    const favoriteIds = new Set();
                    for (const property of propertyList) {
                        try {
                            const isFav = await isFavorited(property.id);
                            if (isFav) favoriteIds.add(property.id);
                        } catch (err) {
                            // Ignore individual check failures
                            console.warn("Failed to check favorite:", err);
                        }
                    }
                    if (mounted) setFavorites(favoriteIds);
                }
            } catch (err) {
                console.error("fetchProperties:", err);
                if (mounted) {
                  const { getErrorMessage } = await import("@/utils/errorMessages");
                  setError(getErrorMessage(err, "Failed to load properties. Please try again."));
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
            const { getToastErrorMessage } = await import("@/utils/errorMessages");
            toast.error(getToastErrorMessage(err, "Failed to update favorites. Please try again."));
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

            {/* Search Bar and View Toggle */}
            <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                    <input
                        type="text"
                        placeholder="Search by location, title, or description..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#0b6e4f] focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                    />
                </div>
                <div className="flex items-center gap-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg p-1">
                    <button
                        onClick={() => setViewMode("grid")}
                        className={`px-4 py-2 rounded-md transition-colors flex items-center gap-2 ${
                            viewMode === "grid"
                                ? "bg-[#0b6e4f] text-white"
                                : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
                        }`}
                    >
                        <Grid size={18} />
                        <span className="hidden sm:inline">Grid</span>
                    </button>
                    <button
                        onClick={() => setViewMode("map")}
                        className={`px-4 py-2 rounded-md transition-colors flex items-center gap-2 ${
                            viewMode === "map"
                                ? "bg-[#0b6e4f] text-white"
                                : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
                        }`}
                    >
                        <MapIcon size={18} />
                        <span className="hidden sm:inline">Map</span>
                    </button>
                </div>
            </div>

            {error && (
                <div className="p-4 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 rounded-lg">
                    {error}
                </div>
            )}

            {filteredProperties.length === 0 ? (
                <EmptyState hasSearchTerm={!!searchTerm} />
            ) : viewMode === "map" ? (
                <EnhancedPropertyMapSearch
                    properties={filteredProperties}
                    onPropertySelect={(property) => {
                        // Navigate to property detail
                        navigate(`/tenant/properties/${property.id}`);
                    }}
                />
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <AnimatePresence>
                        {filteredProperties.map((property) => (
                            <motion.div
                                key={property.id}
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.9 }}
                            >
                                <PropertyCard
                                    property={property}
                                    showTrustScore={true}
                                    linkTo={`/tenant/properties/${property.id}`}
                                    actions={
                                        <div className="flex items-center justify-between">
                                            <Link
                                                to={`/tenant/properties/${property.id}`}
                                                className="text-sm text-[#0b6e4f] hover:underline font-medium"
                                            >
                                                View Details
                                            </Link>
                                            <button
                                                onClick={() => handleToggleFavorite(property.id)}
                                                className={`p-2 rounded-lg transition-colors ${
                                                    favorites.has(property.id)
                                                        ? "text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30"
                                                        : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
                                                }`}
                                                aria-label={favorites.has(property.id) ? "Remove from favorites" : "Add to favorites"}
                                            >
                                                <Heart
                                                    className={`w-5 h-5 ${favorites.has(property.id) ? "fill-red-600" : ""}`}
                                                />
                                            </button>
                                        </div>
                                    }
                                />
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>
            )}

            {/* Artisan Recommendations Section */}
            <div className="mt-12">
                <RecommendationsSection
                    type="artisans"
                    title="Trusted Artisans Near You"
                    limit={6}
                />
            </div>
        </div>
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
