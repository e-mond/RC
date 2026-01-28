/**
 * PropertiesPage - Landlord's Property Management Page
 * 
 * Displays all properties owned by the current landlord.
 * Each landlord can only see their own unique listed properties.
 * 
 * Features:
 * - Lists all properties owned by the logged-in landlord
 * - Shows property details (name, location, rent)
 * - Quick edit access for each property
 * - Add new property button
 * 
 * @module PropertiesPage
 */

import { useEffect, useState } from "react";
import { fetchProperties, deleteProperty } from "@/services/landlordService";
import { useAuthStore } from "@/stores/authStore";
import { Button } from "@/components/ui/Button";
import { Link } from "react-router-dom";
import { Loader2, Trash2, AlertTriangle } from "lucide-react";
import { toast } from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";
import { getFirstValidImage, getPlaceholderImage } from "@/utils/imageValidation";

export default function PropertiesPage() {
  const { user } = useAuthStore();
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deletingId, setDeletingId] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [propertyToDelete, setPropertyToDelete] = useState(null);

  useEffect(() => {
    if (user?.id) {
      loadProperties();
    }
  }, [user?.id]);

  /**
   * Load landlord's properties
   * Fetches only properties owned by the current landlord
   */
  const loadProperties = async () => {
    if (!user?.id) {
      console.warn("[PropertiesPage] User ID not available, cannot load properties");
      setError("User not found. Please log in again.");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError("");
      
      console.log(`[PropertiesPage] Loading properties for landlord user.id: ${user.id}, role: ${user.role}`);
      
      // Fetch properties for this specific landlord
      const res = await fetchProperties(user.id);
      
      // Handle different response formats
      let propertiesList = [];
      if (Array.isArray(res)) {
        propertiesList = res;
      } else if (Array.isArray(res?.data)) {
        propertiesList = res.data;
      } else if (Array.isArray(res?.properties)) {
        propertiesList = res.properties;
      } else if (Array.isArray(res?.results)) {
        propertiesList = res.results;
      }
      
      console.log(`[PropertiesPage] Loaded ${propertiesList.length} properties for landlord ${user.id}`);
      
      // Log property details for debugging
      if (propertiesList.length > 0) {
        console.log(`[PropertiesPage] Property IDs:`, propertiesList.map(p => p.id));
        console.log(`[PropertiesPage] Property statuses:`, propertiesList.map(p => p.status));
      } else {
        console.warn(`[PropertiesPage] No properties found for landlord ${user.id}. This might indicate:`);
        console.warn(`  - Backend endpoint issue`);
        console.warn(`  - Properties not yet created`);
        console.warn(`  - Authorization/filtering issue`);
      }
      
      setProperties(propertiesList);
    } catch (err) {
      console.error("[PropertiesPage] Failed to load properties:", {
        error: err,
        message: err.message,
        status: err.response?.status,
        statusText: err.response?.statusText,
        userId: user?.id,
        userRole: user?.role,
      });
      const { getErrorMessage } = await import("@/utils/errorMessages");
      setError(getErrorMessage(err, "Failed to load properties. Please try again."));
      setProperties([]);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Get first valid image URL from property images
   * Uses shared image validation utility
   */
  const getThumbnailUrl = (property) => {
    return getFirstValidImage(property.images, getPlaceholderImage("No Image", 400, 300));
  };

  /**
   * Handle delete property with confirmation
   */
  const handleDeleteClick = (property) => {
    setPropertyToDelete(property);
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    if (!propertyToDelete) return;
    
    setDeletingId(propertyToDelete.id);
    try {
      await deleteProperty(propertyToDelete.id);
      toast.success("Property deleted successfully");
      // Remove from list
      setProperties(prev => prev.filter(p => p.id !== propertyToDelete.id));
      setShowDeleteModal(false);
      setPropertyToDelete(null);
    } catch (err) {
      console.error("Failed to delete property:", err);
      const { getToastErrorMessage } = await import("@/utils/errorMessages");
      toast.error(getToastErrorMessage(err, "Failed to delete property. Please try again."));
    } finally {
      setDeletingId(null);
    }
  };

  const handleDeleteCancel = () => {
    setShowDeleteModal(false);
    setPropertyToDelete(null);
  };

  // Loading state
  if (loading) {
    return (
      <div className="p-6 bg-transparent flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 animate-spin text-[#0b6e4f]" />
          <p className="text-gray-600 dark:text-gray-400">Loading your properties...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="p-6 bg-transparent">
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 p-5 rounded-xl">
          <p className="font-medium mb-2">Error loading properties</p>
          <p className="text-sm">{error}</p>
          <Button onClick={loadProperties} className="mt-4" variant="outline">
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-transparent">
      <div className="flex justify-between mb-4">
        <div>
          <h1 className="text-xl font-semibold text-gray-900 dark:text-white">My Properties</h1>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            {properties.length} {properties.length === 1 ? 'property' : 'properties'} listed
          </p>
        </div>
        <Link to="/landlord/properties/new">
          <Button>Add Property</Button>
        </Link>
      </div>

      {properties.length === 0 ? (
        <div className="bg-white dark:bg-gray-900 shadow rounded-lg border border-gray-200 dark:border-gray-800 p-12 text-center">
          <p className="text-gray-600 dark:text-gray-400 mb-4">No properties found</p>
          <Link to="/landlord/properties/new">
            <Button>Create Your First Property</Button>
          </Link>
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-900 shadow rounded-lg border border-gray-200 dark:border-gray-800 overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-gray-50 dark:bg-gray-800/60">
              <tr className="border-b border-gray-200 dark:border-gray-700">
                <th className="p-3 text-left text-sm font-medium text-gray-700 dark:text-gray-300">Image</th>
                <th className="p-3 text-left text-sm font-medium text-gray-700 dark:text-gray-300">Name</th>
                <th className="p-3 text-left text-sm font-medium text-gray-700 dark:text-gray-300">Location</th>
                <th className="p-3 text-left text-sm font-medium text-gray-700 dark:text-gray-300">Rent</th>
                <th className="p-3 text-left text-sm font-medium text-gray-700 dark:text-gray-300">Status</th>
                <th className="p-3 text-left text-sm font-medium text-gray-700 dark:text-gray-300">Actions</th>
              </tr>
            </thead>

            <tbody>
              {properties.map((p) => (
                <tr
                  key={p.id}
                  className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                >
                  <td className="p-3">
                    <img
                      src={getThumbnailUrl(p)}
                      alt={p.title || p.name || 'Property'}
                      className="h-12 w-16 object-cover rounded"
                      onError={(e) => {
                        e.currentTarget.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='300'%3E%3Crect fill='%23e5e7eb' width='400' height='300'/%3E%3Ctext fill='%239ca3af' font-family='sans-serif' font-size='16' x='50%25' y='50%25' text-anchor='middle' dy='.3em'%3ENo Image%3C/text%3E%3C/svg%3E";
                      }}
                    />
                  </td>
                  <td className="p-3 text-gray-900 dark:text-gray-100 font-medium">
                    {p.title || p.name || 'Untitled Property'}
                  </td>
                  <td className="p-3 text-gray-600 dark:text-gray-400">
                    {p.address || p.location || 'No address'}
                    {p.city ? `, ${p.city}` : ''}
                  </td>
                  <td className="p-3 font-medium text-gray-900 dark:text-gray-100">
                    ₵{p.price || p.priceGhs || p.rent || '0'}
                  </td>
                  <td className="p-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      p.status === 'approved' || p.status === 'approved'
                        ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                        : p.status === 'pending' || p.status === 'pending_approval'
                        ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                        : p.status === 'rejected'
                        ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                        : 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400'
                    }`}>
                      {p.status === 'pending_approval' ? 'pending' : (p.status || 'draft')}
                    </span>
                  </td>
                  <td className="p-3">
                    <div className="flex items-center gap-2">
                      <Link 
                        to={`/landlord/properties/${p.id}/edit`}
                        onClick={(e) => {
                          console.log("[PropertiesPage] Navigating to edit property:", p.id, "Status:", p.status);
                        }}
                      >
                        <Button variant="outline" size="sm">Edit</Button>
                      </Link>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteClick(p)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                      >
                        <Trash2 size={16} />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {showDeleteModal && propertyToDelete && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-gray-900 rounded-xl shadow-xl max-w-md w-full p-6"
            >
              <div className="flex items-center gap-4 mb-4">
                <div className="p-3 bg-red-100 dark:bg-red-900/30 rounded-full">
                  <AlertTriangle className="w-6 h-6 text-red-600 dark:text-red-400" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Delete Property
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    This action cannot be undone
                  </p>
                </div>
              </div>

              <p className="text-gray-700 dark:text-gray-300 mb-6">
                Are you sure you want to delete <strong>"{propertyToDelete.title || propertyToDelete.name || 'this property'}"</strong>? 
                This will permanently remove the property listing.
              </p>

              <div className="flex flex-col sm:flex-row gap-3">
                <Button
                  variant="outline"
                  onClick={handleDeleteCancel}
                  disabled={deletingId === propertyToDelete.id}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleDeleteConfirm}
                  disabled={deletingId === propertyToDelete.id}
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white"
                >
                  {deletingId === propertyToDelete.id ? (
                    <>
                      <Loader2 size={16} className="animate-spin mr-2" />
                      Deleting...
                    </>
                  ) : (
                    <>
                      <Trash2 size={16} className="mr-2" />
                      Delete Property
                    </>
                  )}
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}