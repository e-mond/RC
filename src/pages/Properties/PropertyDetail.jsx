import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { MapPin, Bed, Bath, DollarSign, Calendar, User, Star, MessageCircle } from "lucide-react";
import { getProperty } from "@/services/propertyService";
import { getPropertyReviews } from "@/services/reviewService";
import { useAuth } from "@/context/AuthContext";
import Button from "@/components/ui/Button";
import ScheduleViewingModal from "@/components/ViewingRequest/ScheduleViewingModal";

export default function PropertyDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [property, setProperty] = useState(null);
  const [reviews, setReviews] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [showViewingModal, setShowViewingModal] = useState(false);

  useEffect(() => {
    loadProperty();
    loadReviews();
  }, [id]);

  const loadProperty = async () => {
    try {
      setLoading(true);
      const data = await getProperty(id);
      setProperty(data);
      setError("");
    } catch (err) {
      setError(err.message || "Failed to load property");
    } finally {
      setLoading(false);
    }
  };

  const loadReviews = async () => {
    try {
      const data = await getPropertyReviews(id);
      setReviews(data);
    } catch (err) {
      console.error("Failed to load reviews:", err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600"></div>
          <p className="mt-4 text-gray-600">Loading property...</p>
        </div>
      </div>
    );
  }

  if (error || !property) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 text-lg mb-4">{error || "Property not found"}</p>
          <Button onClick={() => navigate("/properties")}>Back to Properties</Button>
        </div>
      </div>
    );
  }

  const images = property.images || [];
  const currentImage = images[activeImageIndex]?.image_url || property.primary_image;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back Button */}
        <Link
          to="/properties"
          className="inline-flex items-center text-teal-600 hover:text-teal-700 mb-6"
        >
          ← Back to Properties
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Image Gallery */}
            <div className="bg-white rounded-lg shadow-sm overflow-hidden mb-6">
              <div className="relative h-96 bg-gray-200">
                {currentImage ? (
                  <img
                    src={currentImage}
                    alt={property.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400">
                    No Image Available
                  </div>
                )}
              </div>
              {images.length > 1 && (
                <div className="p-4 grid grid-cols-4 gap-2">
                  {images.slice(0, 4).map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setActiveImageIndex(idx)}
                      className={`relative h-20 rounded overflow-hidden border-2 ${
                        activeImageIndex === idx ? "border-teal-600" : "border-transparent"
                      }`}
                    >
                      <img
                        src={img.image_url}
                        alt={`${property.title} ${idx + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Property Details */}
            <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">{property.title}</h1>
                  <div className="flex items-center text-gray-600">
                    <MapPin className="w-5 h-5 mr-1" />
                    <span>{property.address}, {property.city}, {property.region}</span>
                  </div>
                </div>
                {property.is_featured && (
                  <span className="bg-teal-600 text-white px-3 py-1 rounded text-sm font-semibold">
                    Featured
                  </span>
                )}
              </div>

              <div className="flex items-center gap-6 mb-6">
                <div className="flex items-center text-gray-700">
                  <Bed className="w-5 h-5 mr-2" />
                  <span>{property.bedrooms} Bedrooms</span>
                </div>
                <div className="flex items-center text-gray-700">
                  <Bath className="w-5 h-5 mr-2" />
                  <span>{property.bathrooms} Bathrooms</span>
                </div>
                {property.area_sqm && (
                  <div className="text-gray-700">
                    <span>{property.area_sqm} sqm</span>
                  </div>
                )}
              </div>

              <div className="mb-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-3">Description</h2>
                <p className="text-gray-700 leading-relaxed">{property.description}</p>
              </div>

              {/* Amenities */}
              {property.amenities && property.amenities.length > 0 && (
                <div className="mb-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-3">Amenities</h2>
                  <div className="flex flex-wrap gap-2">
                    {property.amenities.map((item, idx) => (
                      <span
                        key={idx}
                        className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm"
                      >
                        {item.amenity?.name || item}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Landlord Info */}
              {property.landlord && (
                <div className="border-t border-gray-200 pt-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-3">Landlord</h2>
                  <div className="flex items-center">
                    {property.landlord.profile_picture_url ? (
                      <img
                        src={property.landlord.profile_picture_url}
                        alt={property.landlord.full_name}
                        className="w-12 h-12 rounded-full mr-3"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-teal-100 flex items-center justify-center mr-3">
                        <User className="w-6 h-6 text-teal-600" />
                      </div>
                    )}
                    <div>
                      <p className="font-medium text-gray-900">{property.landlord.full_name}</p>
                      <p className="text-sm text-gray-600">{property.landlord.email}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Reviews Section */}
            {reviews && (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold text-gray-900">Reviews</h2>
                  {reviews.average_rating && (
                    <div className="flex items-center">
                      <Star className="w-5 h-5 text-yellow-400 fill-current mr-1" />
                      <span className="text-lg font-semibold">{reviews.average_rating}</span>
                      <span className="text-gray-600 ml-1">
                        ({reviews.total_reviews} reviews)
                      </span>
                    </div>
                  )}
                </div>
                {reviews.results && reviews.results.length > 0 ? (
                  <div className="space-y-4">
                    {reviews.results.slice(0, 5).map((review) => (
                      <div key={review.id} className="border-b border-gray-200 pb-4 last:border-0">
                        <div className="flex items-center mb-2">
                          <div className="flex items-center mr-2">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`w-4 h-4 ${
                                  i < review.rating
                                    ? "text-yellow-400 fill-current"
                                    : "text-gray-300"
                                }`}
                              />
                            ))}
                          </div>
                          <span className="text-sm text-gray-600">
                            {review.reviewer?.full_name || "Anonymous"}
                          </span>
                        </div>
                        {review.comment && (
                          <p className="text-gray-700">{review.comment}</p>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-600">No reviews yet</p>
                )}
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm p-6 sticky top-4">
              <div className="mb-6">
                <div className="flex items-center mb-2">
                  <DollarSign className="w-6 h-6 text-teal-600 mr-2" />
                  <span className="text-3xl font-bold text-teal-600">
                    {property.price.toLocaleString()}
                  </span>
                  <span className="text-gray-600 ml-2">/{property.currency}</span>
                </div>
                {property.deposit && (
                  <p className="text-sm text-gray-600">
                    Deposit: {property.deposit.toLocaleString()} {property.currency}
                  </p>
                )}
              </div>

              <div className="mb-6">
                <span
                  className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                    property.status === "available"
                      ? "bg-green-100 text-green-800"
                      : property.status === "rented"
                      ? "bg-gray-100 text-gray-800"
                      : "bg-yellow-100 text-yellow-800"
                  }`}
                >
                  {property.status.charAt(0).toUpperCase() + property.status.slice(1)}
                </span>
              </div>

              {user && user.role === "tenant" && property.status === "available" && (
                <>
                  <Button
                    onClick={() => setShowViewingModal(true)}
                    className="w-full mb-3"
                    variant="outline"
                  >
                    <Calendar className="w-4 h-4 mr-2" />
                    Schedule Viewing
                  </Button>
                  <Button
                    onClick={() => navigate(`/bookings/create?property=${property.id}`)}
                    className="w-full mb-4"
                  >
                    Book This Property
                  </Button>
                </>
              )}

              {user && user.role === "landlord" && property.landlord?.id === user.id && (
                <Button
                  onClick={() => navigate(`/properties/${property.id}/edit`)}
                  variant="outline"
                  className="w-full mb-4"
                >
                  Edit Property
                </Button>
              )}

              {user && (
                <Button
                  onClick={() => navigate(`/chat?user=${property.landlord?.id}`)}
                  variant="outline"
                  className="w-full"
                >
                  <MessageCircle className="w-4 h-4 mr-2" />
                  Message Landlord
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Schedule Viewing Modal */}
      {property && (
        <ScheduleViewingModal
          property={property}
          isOpen={showViewingModal}
          onClose={() => setShowViewingModal(false)}
          onSuccess={() => {
            // Optionally reload property or show success message
            loadProperty();
          }}
        />
      )}
    </div>
  );
}

