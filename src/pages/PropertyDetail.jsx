// src/pages/PropertyDetail.jsx
import React, { useEffect, useState, useMemo } from "react";
import { useParams, Link, useNavigate, useLocation } from "react-router-dom";
import { fetchProperty } from "@/services/propertyService";
import {
  addToFavorites,
  removeFromFavorites,
  isFavorited,
  createViewingRequest,
} from "@/services/tenantService";
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
  Edit,
  Trash2,
  ChevronLeft,
  ChevronRight,
  MessageSquare,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-hot-toast";
import LandingNavbar from "@/pages/Landing/components/LandingNavbar";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { ReviewsList, ReviewForm } from "@/components/reviews";
import { getPropertyReviews, createReview } from "@/services/reviewService";
import PropertyMapView from "@/components/common/PropertyMapView";
import { getFirstValidImage, getPlaceholderImage } from "@/utils/imageValidation";

export default function PropertyDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuthStore();

  const isInDashboard =
    location.pathname.startsWith("/tenant/") ||
    location.pathname.startsWith("/landlord/") ||
    location.pathname.startsWith("/artisan/") ||
    location.pathname.startsWith("/admin/");

  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isFavorite, setIsFavorite] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Booking modal states
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [bookingDate, setBookingDate] = useState("");
  const [bookingMessage, setBookingMessage] = useState("");
  const [bookingLoading, setBookingLoading] = useState(false);

  // Reviews states
  const [reviews, setReviews] = useState([]);
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [reviewsData, setReviewsData] = useState({
    average_rating: 0,
    total_reviews: 0,
    rating_breakdown: {},
  });
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [submittingReview, setSubmittingReview] = useState(false); // kept & will be used

  const isAuthenticated = !!user;
  const isTenant = user?.role === "tenant";
  const isLandlord = user?.role === "landlord";
  const isAdmin = user?.role === "admin" || user?.role === "super-admin";
  const isOwner = isLandlord && property?.landlord?.id === user?.id;

  // ─── Image Gallery Setup ────────────────────────────────────────────────
  // Normalize images: handle both string URLs and objects with image property
  // Use image validation utility to ensure only valid URLs are used
  // Use useMemo to recalculate when property changes
  const images = useMemo(() => {
    if (!property?.images || !Array.isArray(property.images)) return [];
    
    const normalizeImage = (img) => {
      if (typeof img === "string") return img;
      if (img?.image) return img.image;
      if (img?.url) return img.url;
      if (img?.image_url) return img.image_url;
      return null;
    };
    
    const rawImages = property.images.map(normalizeImage).filter(Boolean);
    return rawImages.filter(img => img && typeof img === "string" && img.length > 0);
  }, [property?.images]);
  
  const hasImages = images.length > 0;
  const currentImage = images[currentImageIndex] || images[0] || getPlaceholderImage("No Image", 800, 600);

  const prevImage = () => {
    if (images.length > 0) {
      setCurrentImageIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
    }
  };

  const nextImage = () => {
    if (images.length > 0) {
      setCurrentImageIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
    }
  };
  
  // Reset image index when images change
  useEffect(() => {
    if (images.length > 0 && currentImageIndex >= images.length) {
      setCurrentImageIndex(0);
    }
  }, [images.length, currentImageIndex]);

  useEffect(() => {
    let mounted = true;

    const loadProperty = async () => {
      try {
        setLoading(true);
        const data = await fetchProperty(id);
        if (mounted) {
          const propertyData = data?.data || data?.property || data;
          
          // Normalize images if needed - handle both string URLs and objects
          if (propertyData?.images && Array.isArray(propertyData.images)) {
            propertyData.images = propertyData.images.map(img => {
              if (typeof img === "string") return img;
              if (img?.image) return img.image;
              if (img?.url) return img.url;
              if (img?.image_url) return img.image_url;
              if (img?.amenity?.image) return img.amenity.image; // Handle nested amenity images
              return null;
            }).filter(img => img && typeof img === "string" && img.length > 0);
          }

          if (propertyData && !propertyData.landlord && import.meta.env.VITE_USE_MOCK === "true") {
            propertyData.landlord = {
              id: "landlord_mock_1",
              full_name: "John Mensah",
              email: "john.mensah@example.com",
              phone: "+233241234567",
              business_type: "Real Estate Developer",
              ratings: { average: 4.5, total: 12 },
              verification_status: {
                identity_verified: true,
                background_check_status: "verified",
                payment_verified: true,
                document_verified: true,
                overall_status: "verified",
              },
            };
          }

          setProperty(propertyData);
          setCurrentImageIndex(0); // Reset image index when property loads

          if (isTenant) {
            try {
              const favorited = await isFavorited(id);
              if (mounted) setIsFavorite(favorited);
            } catch (err) {
              console.warn("Could not check favorite status:", err);
            }
          }
        }
      } catch (err) {
        console.error("Error fetching property:", err);
        if (mounted) {
          setError(err.message || "Failed to load property");
        }
      } finally {
        if (mounted) setLoading(false);
      }
    };

    loadProperty();

    return () => {
      mounted = false;
    };
  }, [id, isTenant]);

  useEffect(() => {
    let mounted = true;

    const loadReviews = async () => {
      try {
        setReviewsLoading(true);
        const data = await getPropertyReviews(id);
        if (mounted) {
          setReviews(data.reviews || []);
          setReviewsData({
            average_rating: data.average_rating || 0,
            total_reviews: data.total_reviews || 0,
            rating_breakdown: data.rating_breakdown || {},
          });
        }
      } catch (err) {
        console.error("Failed to load reviews:", err);
        if (mounted) setReviews([]);
      } finally {
        if (mounted) setReviewsLoading(false);
      }
    };

    if (id) loadReviews();

    return () => {
      mounted = false;
    };
  }, [id]);

  const handleToggleFavorite = async () => {
    if (!isAuthenticated) {
      toast.error("Please login to save to favorites");
      navigate("/login");
      return;
    }

    if (!isTenant) {
      toast.error("Only tenants can add properties to favorites");
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
        toast.success("Added to favorites ❤️");
      }
    } catch (err) {
      console.error("Favorite toggle failed:", err);
      toast.error(err.response?.data?.message || err.message || "Failed to update favorites");
    }
  };

  const handleSubmitReview = async (reviewData) => {
    try {
      setSubmittingReview(true);
      const newReview = await createReview(reviewData); // kept & assigned

      // Refresh reviews after submission
      const data = await getPropertyReviews(id);
      setReviews(data.reviews || []);
      setReviewsData({
        average_rating: data.average_rating || 0,
        total_reviews: data.total_reviews || 0,
        rating_breakdown: data.rating_breakdown || {},
      });

      setShowReviewForm(false);
      toast.success("Review submitted! It will be visible after moderation.");
    } catch (err) {
      console.error("Failed to submit review:", err);
      toast.error(err.message || "Failed to submit review");
      throw err;
    } finally {
      setSubmittingReview(false);
    }
  };

  const handleSubmitBooking = async (e) => {
    e.preventDefault();

    if (!bookingDate) {
      toast.error("Please select a preferred viewing date");
      return;
    }

    setBookingLoading(true);

    try {
      await createViewingRequest({
        propertyId: id,
        property_id: id, // Also send snake_case for backend compatibility
        preferredDate: bookingDate,
        preferred_date: bookingDate, // Also send snake_case for backend compatibility
        message: bookingMessage.trim() || "Interested in viewing this property",
      });

      toast.success("Viewing request sent successfully! 🎉");
      setShowBookingModal(false);
      setBookingDate("");
      setBookingMessage("");
    } catch (err) {
      console.error("Viewing request failed:", err);
      toast.error(err.response?.data?.message || "Failed to send viewing request.");
    } finally {
      setBookingLoading(false);
    }
  };

  if (loading) {
    return (
      <div className={isInDashboard ? "" : "min-h-screen bg-gray-50 dark:bg-gray-950"}>
        {!isInDashboard && (isAuthenticated ? <Navbar /> : <LandingNavbar />)}
        <div className={`flex items-center justify-center min-h-[80vh] ${isInDashboard ? "" : "pt-20"}`}>
          <Loader2 className="w-8 h-8 animate-spin text-[#0b6e4f] dark:text-emerald-400" />
        </div>
      </div>
    );
  }

  if (error || (!property && !loading)) {
    return (
      <div className={isInDashboard ? "" : "min-h-screen bg-gray-50 dark:bg-gray-950"}>
        {!isInDashboard && (isAuthenticated ? <Navbar /> : <LandingNavbar />)}
        <div className={`max-w-4xl mx-auto px-6 ${isInDashboard ? "py-12" : "py-20"} text-center`}>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Property Not Found</h1>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            {error || "The property you're looking for doesn't exist."}
          </p>
          <Link
            to={isAuthenticated ? "/tenant/properties" : "/properties"}
            className="inline-flex items-center gap-2 px-6 py-3 bg-[#0b6e4f] text-white rounded-lg hover:bg-[#095c42] dark:bg-emerald-600 dark:hover:bg-emerald-700 transition-colors"
          >
            <ArrowLeft size={20} />
            Back to Properties
          </Link>
        </div>
      </div>
    );
  }

  const amenities = property.amenities || [];

  return (
    <div className={isInDashboard ? "" : "min-h-screen bg-gray-50 dark:bg-gray-950 transition-colors duration-300"}>
      {!isInDashboard && (isAuthenticated ? <Navbar /> : <LandingNavbar />)}

      <div className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 ${isInDashboard ? "" : "pt-20"}`}>
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 mb-6">
          <Link to="/dashboard" className="hover:text-[#0b6e4f] dark:hover:text-emerald-400">
            <Home size={16} />
          </Link>
          <span>/</span>
          <Link
            to={isAuthenticated ? "/tenant/properties" : "/properties"}
            className="hover:text-[#0b6e4f] dark:hover:text-emerald-400"
          >
            Properties
          </Link>
          <span>/</span>
          <span className="text-gray-900 dark:text-white font-medium truncate max-w-[200px] sm:max-w-none">
            {property.title}
          </span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Image Gallery */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden">
              <div className="relative h-80 sm:h-96 bg-gray-200 dark:bg-gray-700">
                <img
                  src={currentImage || getPlaceholderImage("No Image", 800, 600)}
                  alt={property?.title || "Property image"}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.src = getPlaceholderImage("Image not found", 800, 600);
                  }}
                />

                {hasImages && images.length > 1 && (
                  <>
                    <button
                      onClick={prevImage}
                      className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 p-2.5 sm:p-3 bg-white/90 dark:bg-gray-900/80 rounded-full hover:bg-white dark:hover:bg-gray-800 transition-colors shadow-md"
                    >
                      <ChevronLeft size={24} className="text-gray-800 dark:text-gray-200" />
                    </button>
                    <button
                      onClick={nextImage}
                      className="absolute right-3 sm:right-4 top-1/2 -translate-y-1/2 p-2.5 sm:p-3 bg-white/90 dark:bg-gray-900/80 rounded-full hover:bg-white dark:hover:bg-gray-800 transition-colors shadow-md"
                    >
                      <ChevronRight size={24} className="text-gray-800 dark:text-gray-200" />
                    </button>

                    <div className="absolute bottom-3 sm:bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                      {images.map((_, index) => (
                        <button
                          key={index}
                          onClick={() => setCurrentImageIndex(index)}
                          className={`w-2.5 h-2.5 rounded-full transition-all ${
                            index === currentImageIndex
                              ? "bg-[#0b6e4f] dark:bg-emerald-400 scale-125"
                              : "bg-gray-400 dark:bg-gray-600 hover:bg-gray-500 dark:hover:bg-gray-400"
                          }`}
                        />
                      ))}
                    </div>
                  </>
                )}
              </div>

              {/* Thumbnails */}
              {hasImages && images.length > 1 && (
                <div className="p-3 sm:p-4 flex gap-2 sm:gap-3 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600">
                  {images.map((img, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentImageIndex(index)}
                      className={`shrink-0 w-20 sm:w-24 h-20 sm:h-24 rounded-lg overflow-hidden border-2 transition-all ${
                        index === currentImageIndex
                          ? "border-[#0b6e4f] dark:border-emerald-400 shadow-md"
                          : "border-transparent hover:border-gray-300 dark:hover:border-gray-500"
                      }`}
                    >
                      <img
                        src={img || getPlaceholderImage("?", 96, 96)}
                        alt={`Thumbnail ${index + 1}`}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.src = getPlaceholderImage("?", 96, 96);
                        }}
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Description */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-4">
                About this property
              </h2>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-line">
                {property.description || "No description provided."}
              </p>
            </div>

            {/* Amenities */}
            {amenities.length > 0 && (
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-4">
                  Amenities
                </h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {amenities.map((item) => (
                    <div
                      key={item.id || item.name}
                      className="flex items-center gap-2.5 text-gray-700 dark:text-gray-300"
                    >
                      <CheckCircle size={18} className="text-[#0b6e4f] dark:text-emerald-400 shrink-0" />
                      <span>{item.amenity?.name || item.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Location with Interactive Map */}
            {property.latitude && property.longitude ? (
              <PropertyMapView
                latitude={property.latitude}
                longitude={property.longitude}
                address={`${property.address}${property.city ? `, ${property.city}` : ""}${property.region ? `, ${property.region}` : ""}`}
                propertyTitle={property.title}
              />
            ) : (
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-4">
                  Location
                </h2>
                <div className="flex items-start gap-3 text-gray-700 dark:text-gray-300">
                  <MapPin size={22} className="text-[#0b6e4f] dark:text-emerald-400 mt-1 shrink-0" />
                  <p>
                    {property.address}
                    {property.city && `, ${property.city}`}
                    {property.region && `, ${property.region}`}
                    {property.country && `, ${property.country}`}
                  </p>
                </div>
              </div>
            )}

            {/* Landlord Info */}
            {property.landlord && (
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
                    Property Owner
                  </h2>
                  {isTenant && property.landlord.id && (
                    <Link
                      to={`/users/${property.landlord.id}`}
                      className="text-sm text-[#0b6e4f] dark:text-emerald-400 hover:underline"
                    >
                      View Profile
                    </Link>
                  )}
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-[#0b6e4f] dark:bg-emerald-600 flex items-center justify-center text-white text-xl font-bold">
                      {property.landlord.full_name?.charAt(0)?.toUpperCase() || "L"}
                    </div>
                    <div>
                      <p className="font-semibold text-lg text-gray-900 dark:text-white">
                        {property.landlord.full_name}
                      </p>
                      {property.landlord.business_type && (
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {property.landlord.business_type}
                        </p>
                      )}
                    </div>
                  </div>
                  {isTenant && property.landlord?.id && (
                    <Link to={`/tenant/messages?start=${property.landlord.id}`}>
                      <button className="px-4 py-2 bg-[#0b6e4f] text-white rounded-lg hover:bg-[#095c42] transition-colors flex items-center gap-2 text-sm font-medium">
                        <MessageSquare className="w-4 h-4" />
                        Message Landlord
                      </button>
                    </Link>
                  )}
                </div>
              </div>
            )}

            {/* Reviews Section */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
                  Reviews & Ratings
                </h2>
                {isTenant && !showReviewForm && (
                  <button
                    onClick={() => setShowReviewForm(true)}
                    className="px-4 py-2 text-sm font-medium text-[#0b6e4f] dark:text-emerald-400 hover:bg-[#0b6e4f]/10 dark:hover:bg-emerald-400/10 rounded-lg transition-colors"
                  >
                    Write Review
                  </button>
                )}
              </div>

              {showReviewForm && isTenant && (
                <div className="mb-6">
                  <ReviewForm
                    reviewType="property"
                    targetId={id}
                    targetName={property.title}
                    onSubmit={handleSubmitReview}
                    onCancel={() => setShowReviewForm(false)}
                  />
                </div>
              )}

              {reviewsLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-8 h-8 animate-spin text-[#0b6e4f] dark:text-emerald-400" />
                </div>
              ) : (
                <ReviewsList
                  reviews={reviews}
                  averageRating={reviewsData.average_rating}
                  totalReviews={reviewsData.total_reviews}
                  ratingBreakdown={reviewsData.rating_breakdown}
                  showModerationStatus={isOwner || isAdmin}
                />
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 sticky top-20 lg:top-24 space-y-6">
              {/* Price */}
              <div>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl sm:text-4xl font-bold text-[#0b6e4f] dark:text-emerald-400">
                    {property.currency === "GHS" ? "₵" : "$"}
                    {parseFloat(property.price).toLocaleString(undefined, {
                      minimumFractionDigits: 0,
                    })}
                  </span>
                  <span className="text-gray-600 dark:text-gray-400 text-lg sm:text-xl">/month</span>
                </div>
                {property.deposit && (
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1.5">
                    Deposit: {property.currency === "GHS" ? "₵" : "$"}
                    {parseFloat(property.deposit).toLocaleString()}
                  </p>
                )}
              </div>

              {/* Specs */}
              <div className="grid grid-cols-3 gap-4 py-6 border-t border-b border-gray-200 dark:border-gray-700">
                <div className="text-center">
                  <Bed size={28} className="mx-auto text-gray-400 dark:text-gray-500 mb-2" />
                  <p className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white">
                    {property.bedrooms}
                  </p>
                  <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Bedrooms</p>
                </div>
                <div className="text-center">
                  <Bath size={28} className="mx-auto text-gray-400 dark:text-gray-500 mb-2" />
                  <p className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white">
                    {property.bathrooms}
                  </p>
                  <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Bathrooms</p>
                </div>
                {property.area_sqm && (
                  <div className="text-center">
                    <Maximize size={28} className="mx-auto text-gray-400 dark:text-gray-500 mb-2" />
                    <p className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white">
                      {property.area_sqm}
                    </p>
                    <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">sqm</p>
                  </div>
                )}
              </div>

              {/* Status */}
              <div>
                <span
                  className={`inline-block px-4 py-1.5 rounded-full text-sm font-medium ${
                    property.status === "available"
                      ? "bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300"
                      : "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300"
                  }`}
                >
                  {property.status === "available" ? "Available Now" : "Occupied"}
                </span>
              </div>

              {/* Action Buttons */}
              <div className="space-y-4 pt-2">
                {!isAuthenticated ? (
                  <Link
                    to="/role-selection"
                    className="block w-full px-6 py-3.5 bg-[#0b6e4f] dark:bg-emerald-600 text-white rounded-lg hover:bg-[#095c42] dark:hover:bg-emerald-700 transition-colors text-center font-medium text-base sm:text-lg"
                  >
                    Sign Up to Book
                  </Link>
                ) : isTenant ? (
                  <>
                    <button
                      onClick={handleToggleFavorite}
                      className={`w-full px-6 py-3.5 rounded-lg font-medium flex items-center justify-center gap-2 transition-colors text-base sm:text-lg ${
                        isFavorite
                          ? "bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 border-2 border-red-200 dark:border-red-800 hover:bg-red-100 dark:hover:bg-red-950/60"
                          : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-2 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700"
                      }`}
                    >
                      <Heart
                        size={20}
                        className={isFavorite ? "fill-current" : ""}
                      />
                      {isFavorite ? "Remove from Favorites" : "Add to Favorites"}
                    </button>

                    <button
                      onClick={() => setShowBookingModal(true)}
                      className="w-full px-6 py-3.5 bg-[#0b6e4f] dark:bg-emerald-600 text-white rounded-lg hover:bg-[#095c42] dark:hover:bg-emerald-700 transition-colors font-medium flex items-center justify-center gap-2 text-base sm:text-lg"
                    >
                      <Calendar size={20} />
                      Book Viewing
                    </button>
                  </>
                ) : isOwner ? (
                  <Link
                    to={`/landlord/properties/${id}/edit`}
                    className="block w-full px-6 py-3.5 bg-[#0b6e4f] dark:bg-emerald-600 text-white rounded-lg hover:bg-[#095c42] dark:hover:bg-emerald-700 transition-colors text-center font-medium text-base sm:text-lg"
                  >
                    Edit Property
                  </Link>
                ) : null}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Booking Modal */}
      <AnimatePresence>
        {showBookingModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 dark:bg-black/70 flex items-center justify-center z-50 p-4"
            onClick={() => setShowBookingModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              className="bg-white dark:bg-gray-800 rounded-2xl max-w-lg w-full p-6 sm:p-8 shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <h2 className="text-2xl sm:text-3xl font-bold mb-6 text-gray-900 dark:text-white">
                Request Property Viewing
              </h2>

              <form onSubmit={handleSubmitBooking} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Preferred Viewing Date <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    min={new Date().toISOString().split("T")[0]}
                    value={bookingDate}
                    onChange={(e) => setBookingDate(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-[#0b6e4f] dark:focus:ring-emerald-500 focus:border-[#0b6e4f] dark:focus:border-emerald-500 outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Message / Additional Notes (optional)
                  </label>
                  <textarea
                    value={bookingMessage}
                    onChange={(e) => setBookingMessage(e.target.value)}
                    rows={4}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-[#0b6e4f] dark:focus:ring-emerald-500 focus:border-[#0b6e4f] dark:focus:border-emerald-500 outline-none resize-none"
                    placeholder="Preferred time of day, number of people viewing, any questions..."
                  />
                </div>

                <div className="flex flex-col sm:flex-row gap-4 pt-6">
                  <button
                    type="button"
                    onClick={() => setShowBookingModal(false)}
                    className="flex-1 px-6 py-3.5 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors font-medium text-gray-700 dark:text-gray-300"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={bookingLoading}
                    className="flex-1 px-6 py-3.5 bg-[#0b6e4f] dark:bg-emerald-600 text-white rounded-lg hover:bg-[#095c42] dark:hover:bg-emerald-700 disabled:opacity-60 disabled:cursor-not-allowed transition-colors font-medium flex items-center justify-center gap-2"
                  >
                    {bookingLoading && <Loader2 className="w-5 h-5 animate-spin" />}
                    Send Request
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {!isInDashboard && <Footer />}
    </div>
  );
}