import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Search, Filter, MapPin, Bed, Bath, DollarSign } from "lucide-react";
import { getProperties, getAmenities } from "@/services/propertyService";
import Button from "@/components/ui/Button";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

export default function PropertyList() {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filters, setFilters] = useState({
    city: "",
    region: "",
    property_type: "",
    min_price: "",
    max_price: "",
    bedrooms: "",
    status: "available",
    search: "",
  });
  const [showFilters, setShowFilters] = useState(false);
  const [amenities, setAmenities] = useState([]);

  useEffect(() => {
    loadProperties();
    loadAmenities();
  }, [filters]);

  const loadProperties = async () => {
    try {
      setLoading(true);
      const data = await getProperties(filters);
      setProperties(data.results || data);
      setError("");
    } catch (err) {
      setError(err.message || "Failed to load properties");
      setProperties([]);
    } finally {
      setLoading(false);
    }
  };

  const loadAmenities = async () => {
    try {
      const data = await getAmenities();
      setAmenities(data);
    } catch (err) {
      console.error("Failed to load amenities:", err);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setFilters({
      city: "",
      region: "",
      property_type: "",
      min_price: "",
      max_price: "",
      bedrooms: "",
      status: "available",
      search: "",
    });
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Navbar />
      <div className="flex-1 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Browse Properties</h1>
          <p className="text-gray-600">Find your perfect rental property</p>
        </div>

        {/* Search and Filter Bar */}
        <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search properties..."
                value={filters.search}
                onChange={(e) => handleFilterChange("search", e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              />
            </div>
            <Button
              onClick={() => setShowFilters(!showFilters)}
              variant="outline"
              className="flex items-center gap-2"
            >
              <Filter className="w-4 h-4" />
              Filters
            </Button>
          </div>

          {/* Advanced Filters */}
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-4 pt-4 border-t border-gray-200 grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4"
            >
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                <input
                  type="text"
                  value={filters.city}
                  onChange={(e) => handleFilterChange("city", e.target.value)}
                  placeholder="City"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Region</label>
                <input
                  type="text"
                  value={filters.region}
                  onChange={(e) => handleFilterChange("region", e.target.value)}
                  placeholder="Region"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                <select
                  value={filters.property_type}
                  onChange={(e) => handleFilterChange("property_type", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                >
                  <option value="">All Types</option>
                  <option value="apartment">Apartment</option>
                  <option value="house">House</option>
                  <option value="studio">Studio</option>
                  <option value="room">Room</option>
                  <option value="commercial">Commercial</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Min Price</label>
                <input
                  type="number"
                  value={filters.min_price}
                  onChange={(e) => handleFilterChange("min_price", e.target.value)}
                  placeholder="Min"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Max Price</label>
                <input
                  type="number"
                  value={filters.max_price}
                  onChange={(e) => handleFilterChange("max_price", e.target.value)}
                  placeholder="Max"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Bedrooms</label>
                <input
                  type="number"
                  value={filters.bedrooms}
                  onChange={(e) => handleFilterChange("bedrooms", e.target.value)}
                  placeholder="Bedrooms"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                />
              </div>
              <div className="md:col-span-2 lg:col-span-3 flex items-end gap-2">
                <Button onClick={clearFilters} variant="outline" className="flex-1">
                  Clear Filters
                </Button>
              </div>
            </motion.div>
          )}
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600"></div>
            <p className="mt-4 text-gray-600">Loading properties...</p>
          </div>
        )}

        {/* Properties Grid */}
        {!loading && !error && (
          <>
            {properties.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-600 text-lg">No properties found</p>
                <p className="text-gray-500 mt-2">Try adjusting your filters</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {properties.map((property) => (
                  <motion.div
                    key={property.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow overflow-hidden"
                  >
                    <Link to={`/properties/${property.id}`}>
                      {/* Property Image */}
                      <div className="relative h-48 bg-gray-200">
                        {property.primary_image ? (
                          <img
                            src={property.primary_image}
                            alt={property.title}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-400">
                            No Image
                          </div>
                        )}
                        {property.is_featured && (
                          <span className="absolute top-2 right-2 bg-teal-600 text-white px-2 py-1 rounded text-xs font-semibold">
                            Featured
                          </span>
                        )}
                      </div>

                      {/* Property Details */}
                      <div className="p-4">
                        <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-1">
                          {property.title}
                        </h3>
                        <div className="flex items-center text-gray-600 text-sm mb-3">
                          <MapPin className="w-4 h-4 mr-1" />
                          <span>{property.city}, {property.region}</span>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                          <div className="flex items-center">
                            <Bed className="w-4 h-4 mr-1" />
                            <span>{property.bedrooms}</span>
                          </div>
                          <div className="flex items-center">
                            <Bath className="w-4 h-4 mr-1" />
                            <span>{property.bathrooms}</span>
                          </div>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <DollarSign className="w-4 h-4 text-teal-600" />
                            <span className="text-xl font-bold text-teal-600">
                              {property.price.toLocaleString()}
                            </span>
                            <span className="text-gray-600 ml-1">/{property.currency}</span>
                          </div>
                          <span className={`px-2 py-1 rounded text-xs font-medium ${
                            property.status === 'available' ? 'bg-green-100 text-green-800' :
                            property.status === 'rented' ? 'bg-gray-100 text-gray-800' :
                            'bg-yellow-100 text-yellow-800'
                          }`}>
                            {property.status}
                          </span>
                        </div>
                      </div>
                    </Link>
                  </motion.div>
                ))}
              </div>
            )}
          </>
        )}
        </div>
      </div>
      <Footer />
    </div>
  );
}

