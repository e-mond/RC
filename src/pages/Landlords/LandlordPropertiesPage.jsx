/**
 * LandlordPropertiesPage Component
 * 
 * Public page showing all properties listed by a specific landlord/property owner.
 * 
 * Route: /landlords/:id/properties
 * 
 * Features:
 * - Property listing (approved only for public)
 * - Map view toggle
 * - List view / Map view
 * - Property cards (no Save/Favorite/Signup CTAs - informational only)
 * - Responsive design
 * 
 * @module LandlordPropertiesPage
 */

import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { MapPin, List, Map, Loader2, Building2, ArrowLeft } from "lucide-react";
import { motion } from "framer-motion";
import { fetchProperties } from "@/services/propertyService";
import { getUserProfile } from "@/services/userService";
import PropertyCard from "@/components/shared/PropertyCard";
import EnhancedPropertyMapSearch from "@/components/property/EnhancedPropertyMapSearch";
import TrustScore from "@/components/ai/TrustScore";
import LandingNavbar from "@/pages/Landing/components/LandingNavbar";
import Footer from "@/components/layout/Footer";

export default function LandlordPropertiesPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [properties, setProperties] = useState([]);
  const [landlord, setLandlord] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [viewMode, setViewMode] = useState("list"); // "list" | "map"

  useEffect(() => {
    loadData();
  }, [id]);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Load landlord profile
      try {
        const landlordData = await getUserProfile(id);
        setLandlord(landlordData);
      } catch (err) {
        console.warn("Failed to load landlord profile:", err);
      }

      // Load properties by landlord
      const allProperties = await fetchProperties({ landlord_id: id });
      
      // Filter to only approved properties for public view
      const approvedProperties = allProperties.filter(
        (p) => p.status === "approved" || p.status === "active" || p.status === "published"
      );

      setProperties(approvedProperties);
    } catch (err) {
      console.error("Failed to load properties:", err);
      setError(err.message || "Failed to load properties");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
        <LandingNavbar />
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="w-8 h-8 animate-spin text-[#0b6e4f] dark:text-emerald-400" />
        </div>
        <Footer />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
        <LandingNavbar />
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-2xl mx-auto text-center">
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-6">
              <p className="text-red-700 dark:text-red-400">{error}</p>
              <button
                onClick={() => navigate(-1)}
                className="mt-4 px-4 py-2 bg-[#0b6e4f] hover:bg-[#095c42] text-white rounded-lg transition-colors"
              >
                Go Back
              </button>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <LandingNavbar />

      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate(-1)}
            className="mb-4 flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-[#0b6e4f] dark:hover:text-emerald-400 transition-colors"
          >
            <ArrowLeft size={20} />
            <span>Back</span>
          </button>

          <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6 shadow-sm">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <Building2 size={24} className="text-[#0b6e4f] dark:text-emerald-400" />
                  <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                    {landlord?.full_name || landlord?.username || "Property Owner"}
                  </h1>
                  {landlord?.id && (
                    <TrustScore userId={landlord.id} size="md" />
                  )}
                </div>
                {landlord?.business_type && (
                  <p className="text-gray-600 dark:text-gray-400">{landlord.business_type}</p>
                )}
                <p className="text-sm text-gray-500 dark:text-gray-500 mt-2">
                  {properties.length} {properties.length === 1 ? "property" : "properties"} listed
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* View Toggle */}
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Properties
          </h2>
          <div className="flex items-center gap-2 bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-1">
            <button
              onClick={() => setViewMode("list")}
              className={`px-4 py-2 rounded-md transition-colors flex items-center gap-2 ${
                viewMode === "list"
                  ? "bg-[#0b6e4f] text-white"
                  : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
              }`}
            >
              <List size={18} />
              <span>List</span>
            </button>
            <button
              onClick={() => setViewMode("map")}
              className={`px-4 py-2 rounded-md transition-colors flex items-center gap-2 ${
                viewMode === "map"
                  ? "bg-[#0b6e4f] text-white"
                  : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
              }`}
            >
              <Map size={18} />
              <span>Map</span>
            </button>
          </div>
        </div>

        {/* Content */}
        {properties.length === 0 ? (
          <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-12 text-center">
            <Building2 size={48} className="mx-auto text-gray-400 dark:text-gray-500 mb-4" />
            <p className="text-gray-600 dark:text-gray-400">
              No approved properties available for this landlord.
            </p>
          </div>
        ) : viewMode === "map" ? (
          <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden" style={{ height: "600px" }}>
            <EnhancedPropertyMapSearch
              properties={properties}
              onPropertySelect={(property) => {
                navigate(`/properties/${property.id}`);
              }}
            />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {properties.map((property, idx) => (
              <motion.div
                key={property.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: idx * 0.05 }}
              >
                <div
                  onClick={() => navigate(`/properties/${property.id}`)}
                  className="cursor-pointer"
                >
                  <PropertyCard property={property} showTrustScore={true} />
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}
