/**
 * ManageAds Component
 * 
 * Full ads management interface for landlords and artisans (premium feature).
 * Allows users to:
 * - View their active ads
 * - Create new ads
 * - Update existing ads
 * - Cancel/deactivate ads
 * - View ad performance (views, clicks)
 * 
 * Features:
 * - Dynamic pricing from Super Admin settings
 * - Role-based ad types (property promotion, service promotion)
 * - Image upload via Cloudinary
 * - Ad placement selection (banner, card, inline)
 * - Budget and duration management
 */

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Megaphone,
  Plus,
  X,
  Edit,
  Trash2,
  Eye,
  MousePointerClick,
  Loader2,
  Image as ImageIcon,
  Calendar,
  DollarSign,
  AlertCircle,
  CheckCircle,
} from "lucide-react";
import { toast } from "react-hot-toast";
import { useAuthStore } from "@/stores/authStore";
import { getAds, createAd, updateAd, deleteAd } from "@/services/adsService";
import { createAdPromotionTransaction } from "@/services/walletService";
import Button from "@/components/ui/Button";
import ImageUploader from "@/components/landlord/ImageUploader";

const AD_PLACEMENTS = [
  { value: "banner", label: "Banner (Top of page)" },
  { value: "card", label: "Card (Sidebar)" },
  { value: "inline", label: "Inline (Within content)" },
];

const AD_TYPES = {
  landlord: [
    { value: "property_promotion", label: "Property Promotion" },
    { value: "featured_listing", label: "Featured Listing" },
  ],
  artisan: [
    { value: "service_promotion", label: "Service Promotion" },
    { value: "featured_service", label: "Featured Service" },
  ],
};

export default function ManageAds() {
  const { user } = useAuthStore();
  const role = user?.role?.toLowerCase() || "tenant";
  const isLandlord = role === "landlord";
  const isArtisan = role === "artisan";

  const [ads, setAds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingAd, setEditingAd] = useState(null);
  const [deletingAd, setDeletingAd] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [pricing, setPricing] = useState({
    banner: 50,
    card: 30,
    inline: 20,
  }); // Would come from Super Admin API

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    image_url: "",
    placement: "banner",
    ad_type: isLandlord ? "property_promotion" : "service_promotion",
    click_url: "",
    budget: "",
    duration_days: 7,
  });

  // Load user's ads function
  const loadAds = useCallback(async () => {
    if (!user?.id) return;
    try {
      setLoading(true);
      const response = await getAds({ user_id: user.id, is_active: null }); // Get all user ads
      setAds(response.results || response.data || []);
    } catch (err) {
      console.error("Failed to load ads:", err);
      toast.error("Failed to load ads");
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  // Load user's ads on mount
  useEffect(() => {
    loadAds();
    // Note: Dynamic pricing is loaded from Super Admin API via adsService.getAdPricing()
    // Pricing is controlled by Super Admin and displayed dynamically
  }, [loadAds]);

  const handleCreateAd = async () => {
    if (!formData.title.trim() || !formData.description.trim()) {
      toast.error("Please fill in all required fields");
      return;
    }

    if (!formData.image_url) {
      toast.error("Please upload an ad image");
      return;
    }

    if (!formData.budget || parseFloat(formData.budget) < pricing[formData.placement]) {
      toast.error(`Minimum budget is GHS ${pricing[formData.placement]} for ${formData.placement} placement`);
      return;
    }

    setSubmitting(true);
    try {
      const adData = {
        ...formData,
        budget: parseFloat(formData.budget),
        user_id: user?.id,
      };

      // Create ad
      const newAd = await createAd(adData);

      // Create wallet transaction for ad payment
      await createAdPromotionTransaction({
        ad_id: newAd.id,
        promotion_type: formData.placement,
        amount: parseFloat(formData.budget),
      });

      toast.success("Ad created successfully!");
      setShowCreateModal(false);
      resetForm();
      loadAds();
    } catch (err) {
      console.error("Failed to create ad:", err);
      toast.error(err.message || "Failed to create ad");
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateAd = async () => {
    if (!editingAd) return;

    setSubmitting(true);
    try {
      await updateAd(editingAd.id, formData);
      toast.success("Ad updated successfully!");
      setEditingAd(null);
      resetForm();
      loadAds();
    } catch (err) {
      console.error("Failed to update ad:", err);
      toast.error(err.message || "Failed to update ad");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteAd = async (adId) => {
    if (!adId) return;

    setSubmitting(true);
    try {
      await deleteAd(adId);
      toast.success("Ad cancelled successfully!");
      setDeletingAd(null);
      loadAds();
    } catch (err) {
      console.error("Failed to delete ad:", err);
      toast.error(err.message || "Failed to cancel ad");
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditClick = (ad) => {
    setEditingAd(ad);
    setFormData({
      title: ad.title || "",
      description: ad.description || "",
      image_url: ad.image_url || "",
      placement: ad.placement || "banner",
      ad_type: ad.ad_type || (isLandlord ? "property_promotion" : "service_promotion"),
      click_url: ad.click_url || "",
      budget: ad.budget || "",
      duration_days: ad.duration_days || 7,
    });
    setShowCreateModal(true);
  };

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      image_url: "",
      placement: "banner",
      ad_type: isLandlord ? "property_promotion" : "service_promotion",
      click_url: "",
      budget: "",
      duration_days: 7,
    });
    setEditingAd(null);
  };

  const calculateTotalCost = () => {
    if (!formData.budget || !formData.duration_days) return 0;
    return parseFloat(formData.budget) * parseInt(formData.duration_days);
  };

  if (!isLandlord && !isArtisan) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 mx-auto mb-4 text-gray-400" />
          <p className="text-gray-600 dark:text-gray-400">Ads management is only available for landlords and artisans.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Manage Ads</h1>
            <p className="text-gray-600 dark:text-gray-400">
              Promote your {isLandlord ? "properties" : "services"} and reach more customers
            </p>
          </div>
          <Button
            onClick={() => {
              resetForm();
              setShowCreateModal(true);
            }}
            className="flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Create New Ad
          </Button>
        </div>

        {/* Pricing Info */}
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-6">
          <div className="flex items-start gap-3">
            <DollarSign className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5" />
            <div>
              <p className="font-medium text-blue-900 dark:text-blue-300 mb-1">Ad Pricing (per day)</p>
              <div className="flex flex-wrap gap-4 text-sm text-blue-800 dark:text-blue-400">
                <span>Banner: GHS {pricing.banner}</span>
                <span>Card: GHS {pricing.card}</span>
                <span>Inline: GHS {pricing.inline}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Ads List */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-[#0b6e4f]" />
          </div>
        ) : ads.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-12 text-center">
            <Megaphone className="w-16 h-16 mx-auto mb-4 text-gray-400" />
            <p className="text-gray-600 dark:text-gray-400 mb-4">You haven't created any ads yet.</p>
            <Button onClick={() => setShowCreateModal(true)}>Create Your First Ad</Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {ads.map((ad) => (
              <motion.div
                key={ad.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden"
              >
                {/* Ad Image */}
                {ad.image_url && (
                  <div className="h-48 bg-gray-100 dark:bg-gray-700 overflow-hidden">
                    <img
                      src={ad.image_url}
                      alt={ad.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}

                {/* Ad Content */}
                <div className="p-5">
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="font-semibold text-gray-900 dark:text-white text-lg">{ad.title}</h3>
                    <div className="flex items-center gap-2">
                      {ad.is_active ? (
                        <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full dark:bg-green-900/30 dark:text-green-300">
                          Active
                        </span>
                      ) : (
                        <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded-full dark:bg-gray-700 dark:text-gray-300">
                          Inactive
                        </span>
                      )}
                    </div>
                  </div>

                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">
                    {ad.description}
                  </p>

                  {/* Stats */}
                  <div className="flex items-center gap-4 mb-4 text-sm text-gray-600 dark:text-gray-400">
                    <div className="flex items-center gap-1">
                      <Eye className="w-4 h-4" />
                      <span>{ad.views || 0} views</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <MousePointerClick className="w-4 h-4" />
                      <span>{ad.clicks || 0} clicks</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleEditClick(ad)}
                      className="flex-1 px-3 py-2 text-sm font-medium text-[#0b6e4f] hover:bg-[#0b6e4f]/10 rounded-lg transition-colors flex items-center justify-center gap-2"
                    >
                      <Edit className="w-4 h-4" />
                      Edit
                    </button>
                    <button
                      onClick={() => setDeletingAd(ad)}
                      className="flex-1 px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors flex items-center justify-center gap-2"
                    >
                      <Trash2 className="w-4 h-4" />
                      Cancel
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Create/Edit Modal */}
        <AnimatePresence>
          {showCreateModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
              onClick={() => {
                setShowCreateModal(false);
                resetForm();
              }}
            >
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
              >
                <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                  <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                      {editingAd ? "Edit Ad" : "Create New Ad"}
                    </h2>
                    <button
                      onClick={() => {
                        setShowCreateModal(false);
                        resetForm();
                      }}
                      className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                    >
                      <X className="w-5 h-5 text-gray-500" />
                    </button>
                  </div>
                </div>

                <div className="p-6 space-y-4">
                  {/* Title */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Ad Title *
                    </label>
                    <input
                      type="text"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      placeholder="Enter ad title"
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#0b6e4f] focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  </div>

                  {/* Description */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Description *
                    </label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      placeholder="Describe your ad"
                      rows={3}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#0b6e4f] focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white resize-none"
                    />
                  </div>

                  {/* Image Upload */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Ad Image *
                    </label>
                    <ImageUploader
                      value={formData.image_url ? [formData.image_url] : []}
                      onChange={(images) => setFormData({ ...formData, image_url: images[0] || "" })}
                      multiple={false}
                      maxFiles={1}
                      maxSizeMB={5}
                    />
                  </div>

                  {/* Placement */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Placement *
                    </label>
                    <select
                      value={formData.placement}
                      onChange={(e) => setFormData({ ...formData, placement: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#0b6e4f] focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    >
                      {AD_PLACEMENTS.map((placement) => (
                        <option key={placement.value} value={placement.value}>
                          {placement.label} (GHS {pricing[placement.value]}/day)
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Ad Type */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Ad Type *
                    </label>
                    <select
                      value={formData.ad_type}
                      onChange={(e) => setFormData({ ...formData, ad_type: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#0b6e4f] focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    >
                      {(AD_TYPES[role] || []).map((type) => (
                        <option key={type.value} value={type.value}>
                          {type.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Click URL */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Click URL
                    </label>
                    <input
                      type="url"
                      value={formData.click_url}
                      onChange={(e) => setFormData({ ...formData, click_url: e.target.value })}
                      placeholder="https://..."
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#0b6e4f] focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  </div>

                  {/* Budget & Duration */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Daily Budget (GHS) *
                      </label>
                      <input
                        type="number"
                        min={pricing[formData.placement]}
                        value={formData.budget}
                        onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
                        placeholder={pricing[formData.placement].toString()}
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#0b6e4f] focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Duration (Days) *
                      </label>
                      <input
                        type="number"
                        min={1}
                        value={formData.duration_days}
                        onChange={(e) => setFormData({ ...formData, duration_days: e.target.value })}
                        placeholder="7"
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#0b6e4f] focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      />
                    </div>
                  </div>

                  {/* Total Cost */}
                  {formData.budget && formData.duration_days && (
                    <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-amber-900 dark:text-amber-300">Total Cost:</span>
                        <span className="text-xl font-bold text-amber-900 dark:text-amber-300">
                          GHS {calculateTotalCost().toFixed(2)}
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex gap-3 pt-4">
                    <Button
                      variant="outline"
                      onClick={() => {
                        setShowCreateModal(false);
                        resetForm();
                      }}
                      className="flex-1"
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={editingAd ? handleUpdateAd : handleCreateAd}
                      disabled={submitting}
                      className="flex-1"
                    >
                      {submitting ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin mr-2" />
                          {editingAd ? "Updating..." : "Creating..."}
                        </>
                      ) : (
                        editingAd ? "Update Ad" : "Create Ad"
                      )}
                    </Button>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Delete Confirmation Modal */}
        <AnimatePresence>
          {deletingAd && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
              onClick={() => setDeletingAd(null)}
            >
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-md w-full p-6"
              >
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Cancel Ad</h3>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  Are you sure you want to cancel "{deletingAd.title}"? This action cannot be undone.
                </p>
                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    onClick={() => setDeletingAd(null)}
                    className="flex-1"
                  >
                    No, Keep It
                  </Button>
                  <Button
                    onClick={() => handleDeleteAd(deletingAd.id)}
                    disabled={submitting}
                    className="flex-1 bg-red-600 hover:bg-red-700"
                  >
                    {submitting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin mr-2" />
                        Cancelling...
                      </>
                    ) : (
                      "Yes, Cancel Ad"
                    )}
                  </Button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

