/**
 * TenantArtisansPage
 * 
 * Page for tenants to browse, search, and book artisans.
 * Features:
 * - Search by name/profession
 * - Filter by location, rating, profession
 * - Grid of artisan cards
 * - Pagination
 * - Book artisan modal
 */

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Search, 
  Filter, 
  Loader2, 
  Wrench, 
  MapPin, 
  Star,
  ChevronDown,
  X
} from "lucide-react";
import { toast } from "react-hot-toast";
import PageHeader from "@/modules/dashboard/PageHeader";
import ArtisanCard from "@/components/artisan/ArtisanCard";
import BookArtisanModal from "@/components/artisan/BookArtisanModal";
import AdPlacement from "@/components/ads/AdPlacement";
import { getArtisans } from "@/services/tenantService";

const PROFESSION_OPTIONS = [
  { value: "", label: "All Professions" },
  { value: "plumber", label: "Plumber" },
  { value: "electrician", label: "Electrician" },
  { value: "carpenter", label: "Carpenter" },
  { value: "mason", label: "Mason" },
  { value: "painter", label: "Painter" },
  { value: "welder", label: "Welder" },
  { value: "tiler", label: "Tiler" },
  { value: "roofer", label: "Roofer" },
  { value: "hvac", label: "HVAC Technician" },
  { value: "landscaper", label: "Landscaper" },
  { value: "handyman", label: "General Handyman" },
];

const LOCATION_OPTIONS = [
  { value: "", label: "All Locations" },
  { value: "accra", label: "Greater Accra" },
  { value: "ashanti", label: "Ashanti Region" },
  { value: "western", label: "Western Region" },
  { value: "central", label: "Central Region" },
  { value: "eastern", label: "Eastern Region" },
  { value: "northern", label: "Northern Region" },
  { value: "volta", label: "Volta Region" },
];

const RATING_OPTIONS = [
  { value: "", label: "Any Rating" },
  { value: "4", label: "4+ Stars" },
  { value: "3", label: "3+ Stars" },
  { value: "2", label: "2+ Stars" },
];

export default function TenantArtisansPage() {
  const [artisans, setArtisans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [showFilters, setShowFilters] = useState(false);
  
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState({
    profession: "",
    location: "",
    minRating: "",
  });
  
  const [bookingArtisan, setBookingArtisan] = useState(null);

  const loadArtisans = useCallback(async () => {
    try {
      setLoading(true);
      const result = await getArtisans({
        search: search.trim(),
        profession: filters.profession,
        location: filters.location,
        minRating: filters.minRating,
        page,
        limit: 12,
      });
      setArtisans(result.artisans);
      setTotal(result.total);
    } catch (err) {
      console.error("Failed to load artisans:", err);
      toast.error(err.message || "Failed to load artisans");
    } finally {
      setLoading(false);
    }
  }, [search, filters, page]);

  useEffect(() => {
    loadArtisans();
  }, [loadArtisans]);

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    loadArtisans();
  };

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setPage(1);
  };

  const clearFilters = () => {
    setFilters({ profession: "", location: "", minRating: "" });
    setSearch("");
    setPage(1);
  };

  const hasActiveFilters = filters.profession || filters.location || filters.minRating || search;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 pb-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 space-y-6">
        <PageHeader
          title="Find Artisans"
          subtitle="Browse verified service providers for your home maintenance needs"
          badge="Tenant"
        />

        {/* Search and Filters */}
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
          {/* Search Bar */}
          <form onSubmit={handleSearch} className="flex gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by name or profession..."
                className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-[#0b6e4f] focus:border-transparent"
              />
            </div>
            <button
              type="submit"
              className="px-6 py-3 bg-[#0b6e4f] text-white rounded-lg font-medium hover:bg-[#095c42] transition"
            >
              Search
            </button>
            <button
              type="button"
              onClick={() => setShowFilters(!showFilters)}
              className={`px-4 py-3 border rounded-lg font-medium transition flex items-center gap-2 ${
                showFilters || hasActiveFilters
                  ? "border-[#0b6e4f] text-[#0b6e4f] bg-[#0b6e4f]/5"
                  : "border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300"
              }`}
            >
              <Filter className="w-5 h-5" />
              Filters
              {hasActiveFilters && (
                <span className="w-2 h-2 bg-[#0b6e4f] rounded-full"></span>
              )}
            </button>
          </form>

          {/* Filter Panel */}
          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <div className="pt-4 mt-4 border-t border-gray-200 dark:border-gray-700 grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {/* Profession Filter */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                      Profession
                    </label>
                    <select
                      value={filters.profession}
                      onChange={(e) => handleFilterChange("profession", e.target.value)}
                      className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-[#0b6e4f] focus:border-transparent"
                    >
                      {PROFESSION_OPTIONS.map((opt) => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                      ))}
                    </select>
                  </div>

                  {/* Location Filter */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                      Location
                    </label>
                    <select
                      value={filters.location}
                      onChange={(e) => handleFilterChange("location", e.target.value)}
                      className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-[#0b6e4f] focus:border-transparent"
                    >
                      {LOCATION_OPTIONS.map((opt) => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                      ))}
                    </select>
                  </div>

                  {/* Rating Filter */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                      Minimum Rating
                    </label>
                    <select
                      value={filters.minRating}
                      onChange={(e) => handleFilterChange("minRating", e.target.value)}
                      className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-[#0b6e4f] focus:border-transparent"
                    >
                      {RATING_OPTIONS.map((opt) => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Clear Filters */}
                {hasActiveFilters && (
                  <div className="mt-4 flex justify-end">
                    <button
                      onClick={clearFilters}
                      className="text-sm text-[#0b6e4f] hover:underline flex items-center gap-1"
                    >
                      <X className="w-4 h-4" />
                      Clear all filters
                    </button>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Results Info */}
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {loading ? "Loading..." : `${total} artisan${total !== 1 ? "s" : ""} found`}
          </p>
        </div>

        {/* Ad Placement */}
        <AdPlacement placement="banner" limit={1} className="rounded-xl overflow-hidden" />

        {/* Artisans Grid */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-[#0b6e4f]" />
          </div>
        ) : artisans.length === 0 ? (
          <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 p-12 text-center">
            <Wrench className="w-16 h-16 mx-auto mb-4 text-gray-300 dark:text-gray-600" />
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              No Artisans Found
            </h3>
            <p className="text-gray-600 dark:text-gray-400 max-w-md mx-auto">
              {hasActiveFilters
                ? "Try adjusting your search or filters to find artisans."
                : "There are no verified artisans available at the moment. Please check back later."}
            </p>
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="mt-4 px-6 py-2 bg-[#0b6e4f] text-white rounded-lg font-medium hover:bg-[#095c42] transition"
              >
                Clear Filters
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <AnimatePresence>
              {artisans.map((artisan, index) => (
                <motion.div
                  key={artisan.id || artisan._id || index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                >
                  <ArtisanCard
                    artisan={artisan}
                    onBook={(a) => setBookingArtisan(a)}
                  />
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}

        {/* Pagination */}
        {!loading && total > 12 && (
          <div className="flex justify-center gap-2 pt-6">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              Previous
            </button>
            <span className="px-4 py-2 text-gray-600 dark:text-gray-400">
              Page {page} of {Math.ceil(total / 12)}
            </span>
            <button
              onClick={() => setPage((p) => p + 1)}
              disabled={page >= Math.ceil(total / 12)}
              className="px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              Next
            </button>
          </div>
        )}
      </div>

      {/* Book Artisan Modal */}
      {bookingArtisan && (
        <BookArtisanModal
          artisan={bookingArtisan}
          open={!!bookingArtisan}
          onClose={() => setBookingArtisan(null)}
          onSuccess={() => {
            setBookingArtisan(null);
            toast.success("Artisan booked successfully!");
          }}
        />
      )}
    </div>
  );
}
