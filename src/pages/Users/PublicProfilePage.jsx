/**
 * PublicProfilePage Component
 * 
 * Displays a public user profile that can be viewed by other users.
 * Shows role, reviews, trust score, verification status, and activity summary.
 * 
 * Route: /users/:id
 * 
 * Features:
 * - Public profile view (accessible to authenticated users)
 * - Role display
 * - Reviews & ratings
 * - Trust/verification status
 * - Activity summary (listings, services, jobs)
 * - Message user button (with role-based validation)
 * - View properties/services button (if applicable)
 */

import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  User,
  Mail,
  Phone,
  MapPin,
  Star,
  Shield,
  CheckCircle,
  Building2,
  Wrench,
  MessageSquare,
  ArrowLeft,
  Loader2,
  Calendar,
  Award,
} from "lucide-react";
import { useAuthStore } from "@/stores/authStore";
import { getUserProfile } from "@/services/userService";
import { getUserReviews } from "@/services/reviewService";
import { canUserMessage, getMessagingRulesDescription } from "@/utils/messagingRules";
import { createConversation } from "@/services/messagesService";
import { ReviewsList, BackgroundStatusPanel } from "@/components/reviews";
import Button from "@/components/ui/Button";
import { toast } from "react-hot-toast";

export default function PublicProfilePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user: currentUser } = useAuthStore();
  
  const [profileUser, setProfileUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [reviews, setReviews] = useState([]);
  const [reviewsData, setReviewsData] = useState({
    average_rating: 0,
    total_reviews: 0,
    rating_breakdown: {},
  });
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [activitySummary, setActivitySummary] = useState({
    properties: 0,
    services: 0,
    jobs: 0,
    bookings: 0,
  });
  const [startingConversation, setStartingConversation] = useState(false);

  // Load user profile
  useEffect(() => {
    let mounted = true;
    
    const loadProfile = async () => {
      try {
        setLoading(true);
        const data = await getUserProfile(id);
        if (mounted) {
          setProfileUser(data);
          
          // Load reviews
          loadReviews(data.id);
          
          // Load activity summary (would come from API)
          // For now, using mock data structure
          setActivitySummary({
            properties: data.properties_count || 0,
            services: data.services_count || 0,
            jobs: data.jobs_completed || 0,
            bookings: data.bookings_count || 0,
          });
        }
      } catch (err) {
        console.error("Failed to load profile:", err);
        if (mounted) {
          setError(err.message || "Failed to load user profile");
        }
      } finally {
        if (mounted) setLoading(false);
      }
    };

    const loadReviews = async (userId) => {
      try {
        setReviewsLoading(true);
        const response = await getUserReviews(userId);
        if (mounted) {
          setReviews(response.reviews || response.data || []);
          setReviewsData({
            average_rating: response.average_rating || 0,
            total_reviews: response.total_reviews || response.count || 0,
            rating_breakdown: response.rating_breakdown || {},
          });
        }
      } catch (err) {
        console.error("Failed to load reviews:", err);
        if (mounted) {
          setReviews([]);
        }
      } finally {
        if (mounted) setReviewsLoading(false);
      }
    };

    if (id) {
      loadProfile();
    }

    return () => {
      mounted = false;
    };
  }, [id]);

  // Handle message user
  const handleMessageUser = async () => {
    if (!currentUser || !profileUser) return;

    // Check if user can message this profile user
    const canMessage = canUserMessage(currentUser, profileUser, {
      hasBooking: activitySummary.bookings > 0,
      hasViewedProperty: activitySummary.properties > 0,
    });

    if (!canMessage.canMessage) {
      toast.error(canMessage.reason || "You cannot message this user");
      return;
    }

    setStartingConversation(true);
    try {
      const conversation = await createConversation({
        recipient_id: profileUser.id,
      });
      
      // Navigate to messages with the new conversation
      navigate(`/messages?conversation=${conversation.id}`);
      toast.success("Conversation started!");
    } catch (err) {
      console.error("Failed to start conversation:", err);
      toast.error(err.message || "Failed to start conversation");
    } finally {
      setStartingConversation(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <Loader2 className="w-12 h-12 animate-spin text-[#0b6e4f]" />
      </div>
    );
  }

  if (error || !profileUser) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <p className="text-red-600 dark:text-red-400 mb-4">{error || "User not found"}</p>
          <Button onClick={() => navigate(-1)} variant="outline">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  const isOwnProfile = currentUser?.id === profileUser.id;
  const role = profileUser.role?.toLowerCase() || "tenant";
  const displayName = profileUser.full_name || profileUser.name || "User";
  const trustScore = profileUser.trust_score || 0;
  const isVerified = profileUser.is_verified || profileUser.verification_status === "verified";

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white mb-4"
          >
            <ArrowLeft className="w-5 h-5" />
            Back
          </button>
        </div>

        {/* Profile Header Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-6"
        >
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
            {/* Avatar */}
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-[#0b6e4f] to-emerald-600 flex items-center justify-center text-white text-3xl font-bold">
              {displayName[0]?.toUpperCase() || "U"}
            </div>

            {/* User Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
                  {displayName}
                </h1>
                {isVerified && (
                  <VerificationBadge
                    verified={isVerified}
                    trustScore={trustScore}
                    size="md"
                  />
                )}
              </div>

              <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4" />
                  <span className="capitalize">{role.replace("-", " ")}</span>
                </div>
                {profileUser.email && (
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4" />
                    <span>{profileUser.email}</span>
                  </div>
                )}
                {profileUser.phone && (
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4" />
                    <span>{profileUser.phone}</span>
                  </div>
                )}
                {profileUser.location && (
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    <span>{profileUser.location}</span>
                  </div>
                )}
              </div>

              {/* Trust Score */}
              {trustScore > 0 && (
                <div className="mt-4 flex items-center gap-2">
                  <Award className="w-5 h-5 text-amber-500" />
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Trust Score: {trustScore}/100
                  </span>
                </div>
              )}
            </div>

            {/* Actions */}
            {!isOwnProfile && currentUser && (
              <div className="flex flex-col sm:flex-row gap-3">
                <Button
                  onClick={handleMessageUser}
                  disabled={startingConversation}
                  className="flex items-center gap-2"
                >
                  {startingConversation ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Starting...
                    </>
                  ) : (
                    <>
                      <MessageSquare className="w-4 h-4" />
                      Message
                    </>
                  )}
                </Button>
                {role === "landlord" && (
                  <Link to={`/properties?landlord=${profileUser.id}`}>
                    <Button variant="outline" className="flex items-center gap-2">
                      <Building2 className="w-4 h-4" />
                      View Properties
                    </Button>
                  </Link>
                )}
                {role === "artisan" && (
                  <Link to={`/artisans/${profileUser.id}`}>
                    <Button variant="outline" className="flex items-center gap-2">
                      <Wrench className="w-4 h-4" />
                      View Services
                    </Button>
                  </Link>
                )}
              </div>
            )}
          </div>
        </motion.div>

        {/* Activity Summary */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6"
        >
          {role === "landlord" && activitySummary.properties > 0 && (
            <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-3">
                <Building2 className="w-8 h-8 text-[#0b6e4f]" />
                <div>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {activitySummary.properties}
                  </p>
                  <p className="text-xs text-gray-600 dark:text-gray-400">Properties</p>
                </div>
              </div>
            </div>
          )}
          {role === "artisan" && activitySummary.services > 0 && (
            <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-3">
                <Wrench className="w-8 h-8 text-[#0b6e4f]" />
                <div>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {activitySummary.services}
                  </p>
                  <p className="text-xs text-gray-600 dark:text-gray-400">Services</p>
                </div>
              </div>
            </div>
          )}
          {role === "artisan" && activitySummary.jobs > 0 && (
            <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-3">
                <CheckCircle className="w-8 h-8 text-green-500" />
                <div>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {activitySummary.jobs}
                  </p>
                  <p className="text-xs text-gray-600 dark:text-gray-400">Jobs Completed</p>
                </div>
              </div>
            </div>
          )}
          {activitySummary.bookings > 0 && (
            <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-3">
                <Calendar className="w-8 h-8 text-blue-500" />
                <div>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {activitySummary.bookings}
                  </p>
                  <p className="text-xs text-gray-600 dark:text-gray-400">Bookings</p>
                </div>
              </div>
            </div>
          )}
        </motion.div>

        {/* Verification Status */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-6"
        >
          <BackgroundStatusPanel
            userId={profileUser.id}
            userRole={role}
            verificationStatus={{
              identity_verified: isVerified,
              background_check_status: profileUser.background_check_status || "unverified",
              payment_verified: profileUser.payment_verified || false,
              document_verified: profileUser.document_verified || false,
              overall_status: isVerified ? "verified" : "unverified",
            }}
          />
        </motion.div>

        {/* Reviews Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6"
        >
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-6">
            Reviews & Ratings
          </h2>

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
              showModerationStatus={false}
            />
          )}
        </motion.div>
      </div>
    </div>
  );
}

