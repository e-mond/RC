import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { User, Mail, Phone, MapPin, Calendar, Star, Edit } from "lucide-react";
import { getUserReviews } from "@/services/reviewService";
import { useAuth } from "@/context/AuthContext";
import Button from "@/components/ui/Button";

export default function ProfileView() {
  const { userId } = useParams();
  const { user: currentUser } = useAuth();
  const [profile, setProfile] = useState(null);
  const [reviews, setReviews] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadProfile();
    if (userId) {
      loadReviews();
    }
  }, [userId]);

  const loadProfile = async () => {
    try {
      // If userId is provided, fetch that user's profile
      // Otherwise, show current user's profile
      if (userId && userId !== currentUser?.id?.toString()) {
        // Fetch other user's profile (would need a new endpoint)
        setError("Profile not found");
      } else {
        setProfile(currentUser);
      }
      setError("");
    } catch (err) {
      setError(err.message || "Failed to load profile");
    } finally {
      setLoading(false);
    }
  };

  const loadReviews = async () => {
    try {
      const data = await getUserReviews(userId);
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
          <p className="mt-4 text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 text-lg">{error || "Profile not found"}</p>
        </div>
      </div>
    );
  }

  const isOwnProfile = !userId || userId === currentUser?.id?.toString();

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-start justify-between">
            <div className="flex items-center">
              {profile.profile_picture_url ? (
                <img
                  src={profile.profile_picture_url}
                  alt={profile.full_name}
                  className="w-24 h-24 rounded-full mr-6"
                />
              ) : (
                <div className="w-24 h-24 rounded-full bg-teal-100 flex items-center justify-center mr-6">
                  <User className="w-12 h-12 text-teal-600" />
                </div>
              )}
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">{profile.full_name}</h1>
                <div className="flex items-center text-gray-600 mb-2">
                  <Mail className="w-4 h-4 mr-2" />
                  <span>{profile.email}</span>
                </div>
                {profile.phone && (
                  <div className="flex items-center text-gray-600 mb-2">
                    <Phone className="w-4 h-4 mr-2" />
                    <span>{profile.phone}</span>
                  </div>
                )}
                <div className="flex items-center text-gray-600">
                  <Calendar className="w-4 h-4 mr-2" />
                  <span>Joined {new Date(profile.date_joined).toLocaleDateString()}</span>
                </div>
              </div>
            </div>
            {isOwnProfile && (
              <Link to="/profile/edit">
                <Button variant="outline" className="flex items-center gap-2">
                  <Edit className="w-4 h-4" />
                  Edit Profile
                </Button>
              </Link>
            )}
          </div>
        </div>

        {/* Role-Specific Information */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Profile Information</h2>
          
          {profile.role === "tenant" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {profile.preferred_location && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Preferred Location
                  </label>
                  <div className="flex items-center text-gray-900">
                    <MapPin className="w-4 h-4 mr-2" />
                    <span>{profile.preferred_location}</span>
                  </div>
                </div>
              )}
              {profile.rent_range && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Rent Range
                  </label>
                  <p className="text-gray-900">{profile.rent_range}</p>
                </div>
              )}
            </div>
          )}

          {profile.role === "landlord" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {profile.business_type && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Business Type
                  </label>
                  <p className="text-gray-900">{profile.business_type}</p>
                </div>
              )}
              {profile.location && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                  <div className="flex items-center text-gray-900">
                    <MapPin className="w-4 h-4 mr-2" />
                    <span>{profile.location}</span>
                  </div>
                </div>
              )}
            </div>
          )}

          {profile.role === "artisan" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {profile.profession && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Profession
                  </label>
                  <p className="text-gray-900">{profile.profession}</p>
                </div>
              )}
              {profile.experience_years && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Experience
                  </label>
                  <p className="text-gray-900">{profile.experience_years} years</p>
                </div>
              )}
              {profile.service_region && (
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Service Region
                  </label>
                  <div className="flex items-center text-gray-900">
                    <MapPin className="w-4 h-4 mr-2" />
                    <span>{profile.service_region}</span>
                  </div>
                </div>
              )}
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
                {reviews.results.map((review) => (
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
                    {review.comment && <p className="text-gray-700">{review.comment}</p>}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-600">No reviews yet</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

