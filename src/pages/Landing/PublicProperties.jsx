// src/pages/Landing/PublicProperties.jsx
import React, { useEffect, useState } from "react";
import { fetchProperties } from "@/services/propertyService";
import { MapPin, Bed, Bath, Search, Loader2, ArrowRight } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import LandingNavbar from "./components/LandingNavbar";
import Footer from "@/components/layout/Footer";

/**
 * PublicProperties - Browse properties without authentication
 * - View all available properties
 * - Search properties
 * - Sign up CTA for each property
 * - No favorites or booking (requires login)
 */
export default function PublicProperties() {
    const [properties, setProperties] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [searchTerm, setSearchTerm] = useState("");
    const navigate = useNavigate();

    useEffect(() => {
        let mounted = true;
        const load = async () => {
            try {
                setLoading(true);
                const data = await fetchProperties();
                if (mounted) {
                    const propertyList = Array.isArray(data) ? data : [];
                    setProperties(propertyList);
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
            <div className="min-h-screen bg-gray-50">
                <LandingNavbar />
                <div className="flex items-center justify-center min-h-[400px] pt-20">
                    <Loader2 className="w-8 h-8 animate-spin text-[#0b6e4f]" />
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <LandingNavbar />

            {/* Page Header */}
            <div className="bg-gradient-to-br from-[#0b6e4f] to-[#095c42] text-white pt-24 pb-12">
                <div className="max-w-7xl mx-auto px-6">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                    >
                        <h1 className="text-4xl md:text-5xl font-bold mb-4">
                            Find Your Perfect Home
                        </h1>
                        <p className="text-xl text-green-50 max-w-2xl">
                            Browse our collection of quality rental properties across Ghana
                        </p>
                    </motion.div>
                </div>
            </div>

            {/* Content */}
            <div className="max-w-7xl mx-auto px-6 py-12">
                {/* Search Bar */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                    className="mb-8"
                >
                    <div className="relative max-w-2xl">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                        <input
                            type="text"
                            placeholder="Search by location, title, or description..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-12 pr-4 py-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#0b6e4f] focus:border-transparent bg-white shadow-sm"
                        />
                    </div>
                    <p className="mt-3 text-sm text-gray-600">
                        {filteredProperties.length} {filteredProperties.length === 1 ? "property" : "properties"} available
                    </p>
                </motion.div>

                {error && (
                    <div className="mb-8 p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl">
                        {error}
                    </div>
                )}

                {filteredProperties.length === 0 ? (
                    <EmptyState hasSearchTerm={!!searchTerm} />
                ) : (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.6, delay: 0.3 }}
                        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                    >
                        <AnimatePresence>
                            {filteredProperties.map((property, index) => (
                                <PropertyCard
                                    key={property.id}
                                    property={property}
                                    index={index}
                                    onSignUpClick={() => navigate("/role-selection")}
                                />
                            ))}
                        </AnimatePresence>
                    </motion.div>
                )}

                {/* CTA Banner */}
                {filteredProperties.length > 0 && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.6 }}
                        className="mt-16 bg-gradient-to-r from-[#0b6e4f] to-[#095c42] text-white rounded-2xl p-8 md:p-12 text-center"
                    >
                        <h2 className="text-3xl font-bold mb-4">Ready to Find Your Home?</h2>
                        <p className="text-lg text-green-50 mb-6 max-w-2xl mx-auto">
                            Create an account to save favorites, book viewings, and get personalized recommendations
                        </p>
                        <Link
                            to="/role-selection"
                            className="inline-flex items-center gap-2 px-8 py-4 bg-white text-[#0b6e4f] rounded-lg hover:bg-green-50 transition-colors font-semibold text-lg"
                        >
                            Get Started
                            <ArrowRight size={20} />
                        </Link>
                    </motion.div>
                )}
            </div>

            <Footer />
        </div>
    );
}

// Property Card Component
function PropertyCard({ property, index, onSignUpClick }) {
    const imageUrl = property.images?.[0] || property.image || "https://placehold.co/400x300?text=Property";
    const price = property.price || property.priceGhs || property.rent || 0;
    const currency = property.currency || "GHS";

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-xl transition-all group"
        >
            {/* Image */}
            <div className="relative h-56 bg-gray-200 overflow-hidden">
                <img
                    src={imageUrl}
                    alt={property.title || "Property"}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                />
                {property.status && (
                    <div
                        className={`absolute top-3 left-3 px-3 py-1 rounded-full text-xs font-medium ${property.status === "available" ? "bg-green-500" : "bg-gray-500"
                            } text-white shadow-md`}
                    >
                        {property.status}
                    </div>
                )}
            </div>

            {/* Content */}
            <div className="p-5 space-y-3">
                <div>
                    <h3 className="font-bold text-xl text-gray-900 line-clamp-1 group-hover:text-[#0b6e4f] transition-colors">
                        {property.title || "Untitled Property"}
                    </h3>
                    <p className="text-sm text-gray-600 flex items-center gap-1 mt-1">
                        <MapPin size={14} />
                        {property.address || property.location || "Location not specified"}
                    </p>
                </div>

                {property.description && (
                    <p className="text-sm text-gray-600 line-clamp-2">{property.description}</p>
                )}

                <div className="flex items-center gap-4 text-sm text-gray-600">
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

                <div className="pt-3 border-t border-gray-200 flex items-center justify-between">
                    <div>
                        <span className="text-2xl font-bold text-[#0b6e4f]">
                            {currency === "GHS" ? "₵" : "$"}
                            {price.toLocaleString()}
                        </span>
                        <span className="text-sm text-gray-500 ml-1">/{property.period || "month"}</span>
                    </div>
                </div>

                {/* Sign Up CTA */}
                <button
                    onClick={onSignUpClick}
                    className="w-full mt-2 px-4 py-3 bg-[#0b6e4f] text-white rounded-lg hover:bg-[#095c42] transition-colors flex items-center justify-center gap-2 font-medium"
                >
                    Sign Up to Save
                    <ArrowRight size={16} />
                </button>
            </div>
        </motion.div>
    );
}

// Empty State
function EmptyState({ hasSearchTerm }) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-xl shadow-sm p-12 text-center border border-gray-200"
        >
            <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-6">
                <Search className="w-12 h-12 text-gray-400" />
            </div>
            <h3 className="text-2xl font-semibold text-gray-900 mb-2">
                {hasSearchTerm ? "No Properties Found" : "No Properties Available"}
            </h3>
            <p className="text-gray-600 mb-6 max-w-md mx-auto">
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
        </motion.div>
    );
}
