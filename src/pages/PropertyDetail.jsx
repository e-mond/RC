// src/pages/PropertyDetail.jsx
import React, { useEffect, useState } from "react";
import { useParams, Link, useNavigate, useLocation } from "react-router-dom";
import { fetchProperty } from "@/services/propertyService";
import { addToFavorites, removeFromFavorites, isFavorited } from "@/services/tenantService";
import { useAuthStore } from "@/stores/authStore";
import {
    MapPin,
    Bed,
    Bath,
    Maximize,
    Heart,
    ArrowLeft,
    Calendar,
    Loader2,
    Home,
    CheckCircle,
    ChevronLeft,
    ChevronRight,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-hot-toast";
import LandingNavbar from "@/pages/Landing/components/LandingNavbar";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

export default function PropertyDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const { user } = useAuthStore();

    // Detect if we're inside a dashboard layout (to avoid duplicate navbars)
    const isInDashboard = location.pathname.startsWith('/tenant/') ||
        location.pathname.startsWith('/landlord/') ||
        location.pathname.startsWith('/artisan/') ||
        location.pathname.startsWith('/admin/');
    const [property, setProperty] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [isFavorite, setIsFavorite] = useState(false);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);

    const isAuthenticated = !!user;
    const isTenant = user?.role === "tenant";
    const isLandlord = user?.role === "landlord";
    const isOwner = isLandlord && property?.landlord?.id === user?.id;

    useEffect(() => {
        let mounted = true;
        const load = async () => {
            try {
                setLoading(true);
                const data = await fetchProperty(id);
                if (mounted) {
                    setProperty(data);

                    // Check if favorited (only for authenticated tenants)
                    if (isTenant) {
                        try {
                            const favorited = await isFavorited(id);
                            if (mounted) setIsFavorite(favorited);
                        } catch (err) {
                            console.warn("Failed to check favorite status:", err);
                        }
                    }
                }
            } catch (err) {
                console.error("fetchProperty:", err);
                if (mounted) setError(err.message || "Property not found");
            } finally {
                if (mounted) setLoading(false);
            }
        };
        load();
        return () => {
            mounted = false;
        };
    }, [id, isTenant]);

    const handleToggleFavorite = async () => {
        if (!isAuthenticated) {
            toast.error("Please login to save favorites");
            navigate("/login");
            return;
        }

        try {
            if (isFavorite) {
                await removeFromFavorites(id);
                setIsFavorite(false);
                toast.success("Removed from favorites");
            } else {
                await addToFavorites(id);
                setIsFavorite(true);
                toast.success("Added to favorites");
            }
        } catch (err) {
            toast.error(err.message || "Failed to update favorites");
        }
    };

    const nextImage = () => {
        if (property?.images?.length > 0) {
            setCurrentImageIndex((prev) => (prev + 1) % property.images.length);
        }
    };

    const prevImage = () => {
        if (property?.images?.length > 0) {
            setCurrentImageIndex((prev) => (prev - 1 + property.images.length) % property.images.length);
        }
    };

    if (loading) {
        return (
            <div className={isInDashboard ? "" : "min-h-screen bg-gray-50"}>
                {!isInDashboard && (isAuthenticated ? <Navbar /> : <LandingNavbar />)}
                <div className={`flex items-center justify-center min-h-[400px] ${isInDashboard ? '' : 'pt-20'}`}>
                    <Loader2 className="w-8 h-8 animate-spin text-[#0b6e4f]" />
                </div>
            </div>
        );
    }

    if (error || !property) {
        return (
            <div className={isInDashboard ? "" : "min-h-screen bg-gray-50"}>
                {!isInDashboard && (isAuthenticated ? <Navbar /> : <LandingNavbar />)}
                <div className={`max-w-4xl mx-auto px-6 ${isInDashboard ? 'py-12' : 'py-20'} text-center`}>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Property Not Found</h1>
                    <p className="text-gray-600 dark:text-gray-400 mb-6">{error || "The property you're looking for doesn't exist."}</p>
                    <Link
                        to={isAuthenticated ? "/tenant/properties" : "/properties"}
                        className="inline-flex items-center gap-2 px-6 py-3 bg-[#0b6e4f] text-white rounded-lg hover:bg-[#095c42] transition-colors"
                    >
                        <ArrowLeft size={20} />
                        Back to Properties
                    </Link>
                </div>
            </div>
        );
    }

    const images = property.images || [];
    const hasImages = images.length > 0;
    const currentImage = hasImages ? images[currentImageIndex]?.image : "https://placehold.co/800x600?text=No+Image";
    const amenities = property.amenities || [];

    return (
        <div className={isInDashboard ? "" : "min-h-screen bg-gray-50"}>
            {!isInDashboard && (isAuthenticated ? <Navbar /> : <LandingNavbar />)}

            <div className={`max-w-7xl mx-auto px-6 py-6 ${isInDashboard ? '' : 'pt-20'}`}>
                {/* Breadcrumb */}
                <nav className="flex items-center gap-2 text-sm text-gray-600 mb-6">
                    <Link to="/" className="hover:text-[#0b6e4f]">
                        <Home size={16} />
                    </Link>
                    <span>/</span>
                    <Link
                        to={isAuthenticated ? "/tenant/properties" : "/properties"}
                        className="hover:text-[#0b6e4f]"
                    >
                        Properties
                    </Link>
                    <span>/</span>
                    <span className="text-gray-900 font-medium">{property.title}</span>
                </nav>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Main Content */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Image Gallery */}
                        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                            <div className="relative h-96 bg-gray-200">
                                <img
                                    src={currentImage}
                                    alt={property.title}
                                    className="w-full h-full object-cover"
                                />
                                {hasImages && images.length > 1 && (
                                    <>
                                        <button
                                            onClick={prevImage}
                                            className="absolute left-4 top-1/2 -translate-y-1/2 p-2 bg-white/90 rounded-full hover:bg-white transition-colors"
                                        >
                                            <ChevronLeft size={24} />
                                        </button>
                                        <button
                                            onClick={nextImage}
                                            className="absolute right-4 top-1/2 -translate-y-1/2 p-2 bg-white/90 rounded-full hover:bg-white transition-colors"
                                        >
                                            <ChevronRight size={24} />
                                        </button>
                                        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                                            {images.map((_, index) => (
                                                <button
                                                    key={index}
                                                    onClick={() => setCurrentImageIndex(index)}
                                                    className={`w-2 h-2 rounded-full transition-colors ${index === currentImageIndex ? "bg-white" : "bg-white/50"
                                                        }`}
                                                />
                                            ))}
                                        </div>
                                    </>
                                )}
                            </div>

                            {/* Thumbnails */}
                            {hasImages && images.length > 1 && (
                                <div className="p-4 flex gap-2 overflow-x-auto">
                                    {images.map((img, index) => (
                                        <button
                                            key={index}
                                            onClick={() => setCurrentImageIndex(index)}
                                            className={`shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-colors ${index === currentImageIndex
                                                ? "border-[#0b6e4f]"
                                                : "border-gray-200 hover:border-gray-300"
                                                }`}
                                        >
                                            <img
                                                src={img.image || "https://placehold.co/80x80"}
                                                alt={`Thumbnail ${index + 1}`}
                                                className="w-full h-full object-cover"
                                            />
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Description */}
                        <div className="bg-white rounded-xl shadow-sm p-6">
                            <h2 className="text-xl font-bold text-gray-900 mb-4">About this property</h2>
                            <p className="text-gray-700 leading-relaxed">
                                {property.description || "No description available."}
                            </p>
                        </div>

                        {/* Amenities */}
                        {amenities.length > 0 && (
                            <div className="bg-white rounded-xl shadow-sm p-6">
                                <h2 className="text-xl font-bold text-gray-900 mb-4">Amenities</h2>
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                    {amenities.map((item) => (
                                        <div key={item.id} className="flex items-center gap-2 text-gray-700">
                                            <CheckCircle size={18} className="text-[#0b6e4f]" />
                                            <span>{item.amenity?.name || item.name}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Location */}
                        <div className="bg-white rounded-xl shadow-sm p-6">
                            <h2 className="text-xl font-bold text-gray-900 mb-4">Location</h2>
                            <div className="space-y-2 text-gray-700">
                                <p className="flex items-start gap-2">
                                    <MapPin size={20} className="text-[#0b6e4f] shrink-0 mt-0.5" />
                                    <span>
                                        {property.address}
                                        {property.city && `, ${property.city}`}
                                        {property.region && `, ${property.region}`}
                                        {property.country && `, ${property.country}`}
                                    </span>
                                </p>
                            </div>
                        </div>

                        {/* Landlord Info */}
                        {property.landlord && (
                            <div className="bg-white rounded-xl shadow-sm p-6">
                                <h2 className="text-xl font-bold text-gray-900 mb-4">Property Owner</h2>
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-full bg-[#0b6e4f] flex items-center justify-center text-white font-bold">
                                        {property.landlord.full_name?.charAt(0) || "L"}
                                    </div>
                                    <div>
                                        <p className="font-semibold text-gray-900">{property.landlord.full_name}</p>
                                        {property.landlord.business_type && (
                                            <p className="text-sm text-gray-600">{property.landlord.business_type}</p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Sidebar */}
                    <div className="lg:col-span-1">
                        <div className="bg-white rounded-xl shadow-sm p-6 sticky top-24 space-y-6">
                            {/* Price */}
                            <div>
                                <div className="flex items-baseline gap-2">
                                    <span className="text-4xl font-bold text-[#0b6e4f]">
                                        {property.currency === "GHS" ? "₵" : "$"}
                                        {parseFloat(property.price).toLocaleString()}
                                    </span>
                                    <span className="text-gray-600">/month</span>
                                </div>
                                {property.deposit && (
                                    <p className="text-sm text-gray-600 mt-1">
                                        Deposit: {property.currency === "GHS" ? "₵" : "$"}
                                        {parseFloat(property.deposit).toLocaleString()}
                                    </p>
                                )}
                            </div>

                            
                            {property.isBoosted && (
                            <div className="mb-6 p-4 bg-linear-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 rounded-xl border border-amber-200 dark:border-amber-800">
                                <div className="flex items-center gap-3 text-amber-800 dark:text-amber-400 font-semibold">
                                <Zap className="w-6 h-6 animate-pulse" />
                                <div>
                                    <p className="font-bold">Boosted Listing</p>
                                    <p className="text-sm">This property is promoted for maximum visibility</p>
                                </div>
                                </div>
                            </div>
                            )}

                            {/* Specs */}
                            <div className="grid grid-cols-3 gap-4 py-4 border-t border-b border-gray-200">
                                <div className="text-center">
                                    <Bed size={24} className="mx-auto text-gray-400 mb-1" />
                                    <p className="text-sm font-semibold text-gray-900">{property.bedrooms}</p>
                                    <p className="text-xs text-gray-600">Bedrooms</p>
                                </div>
                                <div className="text-center">
                                    <Bath size={24} className="mx-auto text-gray-400 mb-1" />
                                    <p className="text-sm font-semibold text-gray-900">{property.bathrooms}</p>
                                    <p className="text-xs text-gray-600">Bathrooms</p>
                                </div>
                                {property.area_sqm && (
                                    <div className="text-center">
                                        <Maximize size={24} className="mx-auto text-gray-400 mb-1" />
                                        <p className="text-sm font-semibold text-gray-900">{property.area_sqm}</p>
                                        <p className="text-xs text-gray-600">sqm</p>
                                    </div>
                                )}
                            </div>

                            {/* Status */}
                            <div>
                                <span
                                    className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${property.status === "available"
                                        ? "bg-green-100 text-green-800"
                                        : "bg-gray-100 text-gray-800"
                                        }`}
                                >
                                    {property.status === "available" ? "Available" : "Occupied"}
                                </span>
                            </div>

                            {/* Action Buttons */}
                            <div className="space-y-3">
                                {!isAuthenticated ? (
                                    // Public Users - Sign Up CTA
                                    <Link
                                        to="/role-selection"
                                        className="w-full px-6 py-3 bg-[#0b6e4f] text-white rounded-lg hover:bg-[#095c42] transition-colors font-medium text-center block"
                                    >
                                        Sign Up to Book
                                    </Link>
                                ) : isTenant ? (
                                    // Authenticated Tenants - Favorites & Booking
                                    <>
                                        <button
                                            onClick={handleToggleFavorite}
                                            className={`w-full px-6 py-3 rounded-lg transition-colors font-medium flex items-center justify-center gap-2 ${isFavorite
                                                ? "bg-red-50 text-red-600 border-2 border-red-200 hover:bg-red-100"
                                                : "bg-white text-gray-700 border-2 border-gray-300 hover:bg-gray-50"
                                                }`}
                                        >
                                            <Heart
                                                size={20}
                                                className={isFavorite ? "fill-current" : ""}
                                            />
                                            {isFavorite ? "Remove from Favorites" : "Add to Favorites"}
                                        </button>
                                        <button className="w-full px-6 py-3 bg-[#0b6e4f] text-white rounded-lg hover:bg-[#095c42] transition-colors font-medium flex items-center justify-center gap-2">
                                            <Calendar size={20} />
                                            Book Viewing
                                        </button>
                                    </>
                                ) : isOwner ? (
                                    // Property Owner - Edit Button
                                    <Link
                                        to={`/landlord/properties/${id}/edit`}
                                        className="w-full px-6 py-3 bg-[#0b6e4f] text-white rounded-lg hover:bg-[#095c42] transition-colors font-medium text-center block"
                                    >
                                        Edit Property
                                    </Link>
                                ) : null}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {!isInDashboard && <Footer />}
        </div>
    );
}
