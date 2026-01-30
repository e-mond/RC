/**
 * LandlordPropertiesViewPage - View Properties by Landlord ID
 * 
 * Authenticated page for viewing all properties owned by a specific landlord.
 * Used by admins/super admins to view a landlord's properties.
 * 
 * Route: /landlord/properties/view/:landlordId
 */

import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { fetchProperties } from "@/services/landlordService";
import { Button } from "@/components/ui/Button";
import { Loader2, ArrowLeft, Home, MapPin, Bed, Bath } from "lucide-react";
import { toast } from "react-hot-toast";
import { motion } from "framer-motion";
import { getFirstValidImage, getPlaceholderImage } from "@/utils/imageValidation";
import PageHeader from "@/modules/dashboard/PageHeader";

export default function LandlordPropertiesViewPage() {
  const { landlordId } = useParams();
  const navigate = useNavigate();
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [landlordInfo, setLandlordInfo] = useState(null);

  useEffect(() => {
    if (landlordId) {
      loadProperties();
    } else {
      setError("Landlord ID is required");
      setLoading(false);
    }
  }, [landlordId]);

  const loadProperties = async () => {
    try {
      setLoading(true);
      setError("");
      
      const res = await fetchProperties(landlordId);
      
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
      
      setProperties(propertiesList);
      
      // Extract landlord info from first property if available
      if (propertiesList.length > 0 && propertiesList[0].landlord) {
        setLandlordInfo(propertiesList[0].landlord);
      }
    } catch (err) {
      console.error("Failed to load properties:", err);
      setError(err.message || "Failed to load properties");
      toast.error(err.message || "Failed to load properties");
    } finally {
      setLoading(false);
    }
  };

  const getThumbnailUrl = (property) => {
    return getFirstValidImage(property.images, getPlaceholderImage("No Image", 400, 300));
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <Loader2 className="w-12 h-12 animate-spin text-[#0b6e4f]" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <p className="text-red-600 dark:text-red-400 mb-4">{error}</p>
          <Button onClick={() => navigate(-1)} variant="outline">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <PageHeader
          title={`Properties by ${landlordInfo?.full_name || landlordInfo?.name || "Landlord"}`}
          subtitle={`${properties.length} property/properties found`}
          badge="Property View"
          align="between"
          actions={
            <Button
              onClick={() => navigate(-1)}
              variant="outline"
              className="flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </Button>
          }
        />

        {properties.length === 0 ? (
          <div className="mt-8 text-center py-12 bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800">
            <Home className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-lg font-medium text-gray-900 dark:text-white">No properties found</p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
              This landlord hasn't listed any properties yet.
            </p>
          </div>
        ) : (
          <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {properties.map((property) => (
              <motion.div
                key={property.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 overflow-hidden hover:shadow-lg transition-shadow"
              >
                {/* Property Image */}
                <Link to={`/properties/${property.id}`}>
                  <div className="h-48 bg-gray-200 dark:bg-gray-800 overflow-hidden">
                    <img
                      src={getThumbnailUrl(property)}
                      alt={property.title}
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                </Link>

                {/* Property Details */}
                <div className="p-5">
                  <Link to={`/properties/${property.id}`}>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white hover:text-[#0b6e4f] transition mb-2">
                      {property.title || "Untitled Property"}
                    </h3>
                  </Link>
                  
                  <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 mb-3">
                    <MapPin className="w-4 h-4" />
                    <span className="truncate">{property.address || "No address"}</span>
                  </div>

                  <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400 mb-4">
                    {property.bedrooms && (
                      <div className="flex items-center gap-1">
                        <Bed className="w-4 h-4" />
                        <span>{property.bedrooms} bed</span>
                      </div>
                    )}
                    {property.bathrooms && (
                      <div className="flex items-center gap-1">
                        <Bath className="w-4 h-4" />
                        <span>{property.bathrooms} bath</span>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-2xl font-bold text-[#0b6e4f]">
                        ₵{Number(property.price || property.priceGhs || 0).toLocaleString()}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {property.currency || "GHS"} / month
                      </p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      property.status === 'approved' 
                        ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                        : property.status === 'pending_approval'
                        ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                        : property.status === 'rejected'
                        ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                        : 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400'
                    }`}>
                      {property.status?.replace('_', ' ') || 'draft'}
                    </span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
