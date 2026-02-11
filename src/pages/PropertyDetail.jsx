// src/pages/PropertyDetail.jsx
import React, { useEffect, useState, useMemo } from "react";
import { useParams, Link, useNavigate, useLocation } from "react-router-dom";
import { fetchProperty } from "@/services/propertyService";
import {
  addToFavorites,
  removeFromFavorites,
  isFavorited,
  createViewingRequest,
  hasViewedOrBookedProperty,
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
  ChevronLeft,
  ChevronRight,
  MessageSquare,
  Info,
  Lock,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-hot-toast";
import LandingNavbar from "@/pages/Landing/components/LandingNavbar";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { ReviewsList, ReviewForm } from "@/components/reviews";
import { getPropertyReviews, createReview } from "@/services/reviewService";
import PropertyMapView from "@/components/common/PropertyMapView";
import { getPlaceholderImage } from "@/utils/imageValidation";
import RecommendationsSection from "@/components/ai/RecommendationsSection";
import TrustScore from "@/components/ai/TrustScore";
import { getAmenityName, getAmenityId } from "@/utils/amenityUtils";

// ────────────────────────────────────────────────
// Fallback: getFirstValidImage (remove once import works)
// ────────────────────────────────────────────────
const getFirstValidImage = (images = []) => {
  if (!Array.isArray(images) || images.length === 0) return null;

  for (const img of images) {
    let url = null;
    if (typeof img === "string") url = img;
    else if (img?.image) url = img.image;
    else if (img?.url) url = img.url;
    else if (img?.image_url) url = img.image_url;

    if (url && typeof url === "string" && url.trim().length > 0) {
      // Quick sanity check (can be expanded)
      if (url.startsWith("http") || url.startsWith("data:")) {
        return url;
      }
    }
  }

  return null;
};

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
  const [canMessageLandlord, setCanMessageLandlord] = useState(false);
  const [checkingMessagePermission, setCheckingMessagePermission] = useState(false);

  const [showBookingModal, setShowBookingModal] = useState(false);
  const [bookingDate, setBookingDate] = useState("");
  const [bookingMessage, setBookingMessage] = useState("");
  const [bookingLoading, setBookingLoading] = useState(false);

  const [reviews, setReviews] = useState([]);
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [reviewsData, setReviewsData] = useState({
    average_rating: 0,
    total_reviews: 0,
    rating_breakdown: {},
  });
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [submittingReview, setSubmittingReview] = useState(false);

  const isAuthenticated = !!user;
  const isTenant = user?.role === "tenant";
  const isLandlord = user?.role === "landlord";
  const isAdmin = user?.role === "admin" || user?.role === "super-admin";
  const isOwner = isLandlord && property?.landlord?.id === user?.id;

  // ─── Image Gallery Setup ────────────────────────────────────────────────
  const images = useMemo(() => {
    if (!property?.images || !Array.isArray(property.images)) return [];

    return property.images
      .map((img) => {
        if (typeof img === "string") return img;
        if (img?.image) return img.image;
        if (img?.url) return img.url;
        if (img?.image_url) return img.image_url;
        return null;
      })
      .filter((url) => url && typeof url === "string" && url.trim().length > 0);
  }, [property?.images]);

  const hasImages = images.length > 0;

  const currentImage = useMemo(() => {
    if (!hasImages) return getPlaceholderImage("No Image", 800, 600);

    // Try to get first valid image (fallback implementation + imported one)
    const firstValid = getFirstValidImage(images) || images[0];
    return firstValid || getPlaceholderImage("Image not found", 800, 600);
  }, [images, hasImages]);

  const prevImage = () => {
    if (hasImages) {
      setCurrentImageIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
    }
  };

  const nextImage = () => {
    if (hasImages) {
      setCurrentImageIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
    }
  };

  useEffect(() => {
    if (hasImages && currentImageIndex >= images.length) {
      setCurrentImageIndex(0);
    }
  }, [images.length, currentImageIndex, hasImages]);

  // ─── Data Loading ───────────────────────────────────────────────────────
  useEffect(() => {
    let mounted = true;

    const loadProperty = async () => {
      try {
        setLoading(true);
        const data = await fetchProperty(id);
        if (mounted) {
          const propertyData = data?.data || data?.property || data;

          // Normalize images safely
          if (propertyData?.images && Array.isArray(propertyData.images)) {
            propertyData.images = propertyData.images
              .map((img) => {
                if (typeof img === "string") return img;
                if (img?.image) return img.image;
                if (img?.url) return img.url;
                if (img?.image_url) return img.image_url;
                return null;
              })
              .filter(Boolean);
          }

          setProperty(propertyData);
          setCurrentImageIndex(0);

          if (isTenant) {
            const favorited = await isFavorited(id);
            setIsFavorite(favorited);

            setCheckingMessagePermission(true);
            const canMessage = await hasViewedOrBookedProperty(id);
            setCanMessageLandlord(canMessage);
            setCheckingMessagePermission(false);
          }
        }
      } catch (err) {
        console.error("Error fetching property:", err);
        setError(err.message || "Failed to load property");
      } finally {
        setLoading(false);
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
        setReviews([]);
      } finally {
        setReviewsLoading(false);
      }
    };

    if (id) loadReviews();

    return () => {
      mounted = false;
    };
  }, [id]);

  // ─── Handlers ───────────────────────────────────────────────────────────
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
      toast.error(err.response?.data?.message || "Failed to update favorites");
    }
  };

  const handleSubmitReview = async (reviewData) => {
    if (!isTenant) {
      toast.error("Only tenants can leave reviews");
      return;
    }

    try {
      setSubmittingReview(true);
      const newReview = await createReview(reviewData);

      // Optimistic update
      setReviews((prev) => [newReview, ...prev]);
      setReviewsData((prev) => ({
        ...prev,
        total_reviews: prev.total_reviews + 1,
        average_rating:
          (prev.average_rating * prev.total_reviews + reviewData.rating) /
          (prev.total_reviews + 1),
      }));

      setShowReviewForm(false);
      toast.success("Review submitted! It will be visible after moderation.");
    } catch (err) {
      toast.error(err.message || "Failed to submit review");
    } finally {
      setSubmittingReview(false);
    }
  };

  const handleSubmitBooking = async (e) => {
    e.preventDefault();
    setBookingLoading(true);

    try {
      const payload = {
        propertyId: id,
        property_id: id,
      };

      if (bookingDate?.trim()) {
        payload.preferredDate = bookingDate.trim();
        payload.preferred_date = bookingDate.trim();
      }

      if (bookingMessage?.trim()) {
        payload.message = bookingMessage.trim();
      }

      await createViewingRequest(payload);

      toast.success("Viewing request sent successfully! 🎉");
      setShowBookingModal(false);
      setBookingDate("");
      setBookingMessage("");

      const canMessage = await hasViewedOrBookedProperty(id);
      setCanMessageLandlord(canMessage);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to send viewing request.");
    } finally {
      setBookingLoading(false);
    }
  };

  // ─── Render ─────────────────────────────────────────────────────────────
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

  if (error || !property) {
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
                  src={currentImage}
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
                      aria-label="Previous image"
                    >
                      <ChevronLeft size={24} className="text-gray-800 dark:text-gray-200" />
                    </button>
                    <button
                      onClick={nextImage}
                      className="absolute right-3 sm:right-4 top-1/2 -translate-y-1/2 p-2.5 sm:p-3 bg-white/90 dark:bg-gray-900/80 rounded-full hover:bg-white dark:hover:bg-gray-800 transition-colors shadow-md"
                      aria-label="Next image"
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
                          aria-label={`Go to image ${index + 1}`}
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
                      aria-label={`Select thumbnail ${index + 1}`}
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
                  {amenities.map((item, idx) => {
                    const amenityName = getAmenityName(item, idx);
                    const amenityId = getAmenityId(item);
                    
                    return (
                      <div
                        key={amenityId || idx}
                        className="flex items-center gap-2.5 text-gray-700 dark:text-gray-300"
                      >
                        <CheckCircle size={18} className="text-[#0b6e4f] dark:text-emerald-400 shrink-0" />
                        <span>{amenityName}</span>
                      </div>
                    );
                  })}
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
                  <p className="wrap-break-word">
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
                      {property.landlord?.id && (
                        <div className="mt-2">
                          <TrustScore userId={property.landlord.id} size="sm" />
                        </div>
                      )}
                    </div>
                  </div>
                  {isTenant && property.landlord?.id && (
                    <div className="relative">
                      {canMessageLandlord ? (
                        <Link to={`/tenant/messages?start=${property.landlord.id}`}>
                          <button className="px-4 py-2 bg-[#0b6e4f] text-white rounded-lg hover:bg-[#095c42] transition-colors flex items-center gap-2 text-sm font-medium">
                            <MessageSquare className="w-4 h-4" />
                            Message Landlord
                          </button>
                        </Link>
                      ) : (
                        <div className="relative group">
                          <button
                            disabled
                            className="px-4 py-2 bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 rounded-lg cursor-not-allowed flex items-center gap-2 text-sm font-medium"
                            title="You must view or book a property to message the landlord"
                          >
                            <Lock className="w-4 h-4" />
                            Message Landlord
                          </button>
                          <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block z-10">
                            <div className="bg-gray-900 dark:bg-gray-800 text-white text-xs rounded-lg py-2 px-3 shadow-lg whitespace-nowrap">
                              <div className="flex items-center gap-2">
                                <Info className="w-3 h-3" />
                                <span>You must view or book a property to message the landlord</span>
                              </div>
                              <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-900 dark:border-t-gray-800"></div>
                            </div>
                          </div>
                        </div>
                      )}
                      {checkingMessagePermission && (
                        <div className="absolute inset-0 flex items-center justify-center bg-white/50 dark:bg-gray-800/50 rounded-lg">
                          <Loader2 className="w-4 h-4 animate-spin text-[#0b6e4f]" />
                        </div>
                      )}
                    </div>
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
                    disabled={submittingReview}
                    className="px-4 py-2 text-sm font-medium text-[#0b6e4f] dark:text-emerald-400 hover:bg-[#0b6e4f]/10 dark:hover:bg-emerald-400/10 rounded-lg transition-colors disabled:opacity-50"
                  >
                    {submittingReview ? "Submitting..." : "Write Review"}
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
                    disabled={submittingReview}
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

              {/* Recommendations */}
              {isTenant && (
                <div className="mt-8">
                  <RecommendationsSection
                    type="properties"
                    title="Similar properties you may like"
                    context={{
                      preferences: {
                        property_type: property.property_type ? [property.property_type] : undefined,
                        bedrooms: property.bedrooms,
                        bathrooms: property.bathrooms,
                      },
                      past_activity: {
                        viewed_properties: [id],
                      },
                    }}
                    limit={3}
                  />
                </div>
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
                    Preferred Viewing Date <span className="text-gray-500 text-xs">(optional)</span>
                  </label>
                  <input
                    type="date"
                    min={new Date().toISOString().split("T")[0]}
                    value={bookingDate}
                    onChange={(e) => setBookingDate(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-[#0b6e4f] dark:focus:ring-emerald-500 focus:border-[#0b6e4f] dark:focus:border-emerald-500 outline-none"
                    placeholder="Select a preferred date (optional)"
                  />
                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                    You can specify a preferred date or leave blank to let the landlord suggest available times
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Message / Additional Notes <span className="text-gray-500 text-xs">(optional)</span>
                  </label>
                  <textarea
                    value={bookingMessage}
                    onChange={(e) => setBookingMessage(e.target.value)}
                    rows={4}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-[#0b6e4f] dark:focus:ring-emerald-500 focus:border-[#0b6e4f] dark:focus:border-emerald-500 outline-none resize-none"
                    placeholder="Preferred time of day, number of people viewing, any questions, or leave blank..."
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