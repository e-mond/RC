// src/pages/Dashboard/components/LL_PropertiesList.jsx
import React, { useEffect, useState } from "react";
import { fetchProperties, togglePropertyStatus } from "@/services/propertyService";
import { Home, ToggleLeft, ToggleRight, AlertCircle } from "lucide-react";

/**
 * Landlord Properties List
 * - Responsive cards
 * - Loading skeleton
 * - Error state
 * - Toggle with confirmation
 * - Dark mode
 */
export default function LL_PropertiesList() {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadProperties();
  }, []);

  const loadProperties = async () => {
    try {
      setLoading(true);
      setError("");
      const res = await fetchProperties();
      setProperties(res.properties || []);
    } catch (err) {
      setError("Failed to load properties. Please try again.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = async (id, current) => {
    if (!window.confirm(`Are you sure you want to ${current ? "deactivate" : "activate"} this property?`)) {
      return;
    }

    try {
      await togglePropertyStatus(id);
      setProperties((prev) =>
        prev.map((p) => (p.id === id ? { ...p, active: !p.active } : p))
      );
    } catch (err) {
      alert("Could not update property status.");
      console.error(err);
    }
  };

  if (loading) {
    return <PropertiesSkeleton />;
  }

  if (error) {
    return <ErrorState message={error} onRetry={loadProperties} />;
  }

  if (properties.length === 0) {
    return <EmptyState />;
  }

  return (
    <section
      className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden"
      aria-labelledby="properties-heading"
    >
      <div className="p-4 md:p-6 border-b border-gray-200 dark:border-gray-700">
        <h3 id="properties-heading" className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
          <Home size={20} />
          My Properties
        </h3>
      </div>

      <div className="divide-y divide-gray-200 dark:divide-gray-700">
        {properties.map((property) => (
          <div
            key={property.id}
            className="p-4 md:p-6 hover:bg-gray-50 dark:hover:bg-gray-800 transition"
          >
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              {/* Property Info */}
              <div className="flex-1">
                <h4 className="font-medium text-gray-900 dark:text-white">{property.title}</h4>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{property.location}</p>
                <div className="flex items-center gap-3 mt-2 text-xs">
                  <span className="text-gray-600 dark:text-gray-400">
                    {property.bedrooms} beds • {property.bathrooms} baths
                  </span>
                  <span className="text-gray-400">•</span>
                  <span className="text-gray-600 dark:text-gray-400">
                    GHS {property.rent}/month
                  </span>
                </div>
              </div>

              {/* Status + Toggle */}
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  {property.active ? (
                    <>
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                      <span className="text-sm font-medium text-green-600 dark:text-green-400">Active</span>
                    </>
                  ) : (
                    <>
                      <div className="w-2 h-2 bg-gray-400 rounded-full" />
                      <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Draft</span>
                    </>
                  )}
                </div>

                <button
                  onClick={() => handleToggle(property.id, property.active)}
                  className={`
                    flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition
                    ${property.active
                      ? "bg-green-100 text-green-700 hover:bg-green-200 dark:bg-green-900/30 dark:text-green-400"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300"
                    }
                  `}
                  aria-label={`Toggle property status: ${property.active ? "deactivate" : "activate"}`}
                >
                  {property.active ? <ToggleRight size={18} /> : <ToggleLeft size={18} />}
                  <span className="hidden sm:inline">
                    {property.active ? "Deactivate" : "Activate"}
                  </span>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

/**
 * Loading Skeleton
 */
/* eslint-disable react-refresh/only-export-components */
function PropertiesSkeleton() {
  return (
    <section className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
      <div className="animate-pulse">
        <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-48 mb-4" />
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex items-center justify-between py-4 border-b border-gray-200 dark:border-gray-700 last:border-0">
            <div className="flex-1">
              <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-64 mb-2" />
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-48" />
            </div>
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-24" />
          </div>
        ))}
      </div>
    </section>
  );
}

/**
 * Error State
 */
function ErrorState({ message, onRetry }) {
  return (
    <section className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-6 text-center">
      <AlertCircle size={40} className="mx-auto text-red-600 dark:text-red-400 mb-3" />
      <p className="text-red-800 dark:text-red-300 font-medium">{message}</p>
      <button
        onClick={onRetry}
        className="mt-3 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
      >
        Try Again
      </button>
    </section>
  );
}

/**
 * Empty State
 */
function EmptyState() {
  return (
    <section className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-12 text-center">
      <div className="w-20 h-20 mx-auto bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-4">
        <Home size={36} className="text-gray-400 dark:text-gray-600" />
      </div>
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
        No Properties Yet
      </h3>
      <p className="text-gray-600 dark:text-gray-400">
        Add your first property to get started.
      </p>
      <button className="mt-4 px-5 py-2 bg-[#0b6e4f] text-white rounded-lg hover:bg-[#095c42] transition">
        Add Property
      </button>
    </section>
  );
}