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
import { fetchProperties } from "@/services/landlordService";
import { useAuthStore } from "@/stores/authStore";
import { Button } from "@/components/ui/Button";
import { Link } from "react-router-dom";
import { Loader2 } from "lucide-react";

export default function PropertiesPage() {
  const { user } = useAuthStore();
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

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
      setError("User not found");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError("");
      
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
      
      setProperties(propertiesList);
    } catch (err) {
      console.error("Failed to load properties:", err);
      setError(err.message || "Failed to load properties");
      setProperties([]);
    } finally {
      setLoading(false);
    }
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
                      p.status === 'approved' 
                        ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                        : p.status === 'pending'
                        ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                        : p.status === 'rejected'
                        ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                        : 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400'
                    }`}>
                      {p.status || 'pending'}
                    </span>
                  </td>
                  <td className="p-3">
                    <Link to={`/landlord/properties/${p.id}/edit`}>
                      <Button variant="outline" size="sm">Edit</Button>
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}