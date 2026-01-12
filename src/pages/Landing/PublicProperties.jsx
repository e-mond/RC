
import React, { useEffect, useState } from "react";
import { fetchProperties } from "@/services/propertyService";
import { MapPin, Bed, Bath, Search, Loader2, ArrowRight } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import LandingNavbar from "./components/LandingNavbar";
import Footer from "@/components/layout/Footer";

/* ======================================================
   PROPERTY CARD COMPONENT
====================================================== */
function PropertyCard({ property, index, onSignUpClick }) {
  const imageUrl =
    property.images?.[0] ||
    property.image ||
    "https://placehold.co/400x300?text=Property";

  const price = property.price || property.priceGhs || property.rent || 0;
  const currency = property.currency || "GHS";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.5, delay: index * 0.08 }}
      className="group overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm transition hover:shadow-xl"
    >
      {/* Image */}
      <div className="relative h-56 overflow-hidden bg-gray-200">
        <img
          src={imageUrl}
          alt={property.title || "Property"}
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110"
        />
      </div>

      {/* Content */}
      <div className="space-y-3 p-5">
        <div>
          <h3 className="line-clamp-1 text-xl font-bold text-gray-900 group-hover:text-[#0b6e4f] transition-colors">
            {property.title || "Untitled Property"}
          </h3>
          <p className="mt-1 flex items-center gap-1 text-sm text-gray-600">
            <MapPin size={14} />
            {property.address || property.location || "Location not specified"}
          </p>
        </div>

        {property.description && (
          <p className="line-clamp-2 text-sm text-gray-600">
            {property.description}
          </p>
        )}

        <div className="flex items-center gap-4 text-sm text-gray-600">
          {property.bedrooms !== undefined && (
            <span className="flex items-center gap-1">
              <Bed size={16} />
              {property.bedrooms} bed
            </span>
          )}
          {property.bathrooms !== undefined && (
            <span className="flex items-center gap-1">
              <Bath size={16} />
              {property.bathrooms} bath
            </span>
          )}
        </div>

        <div className="flex items-center justify-between border-t pt-3">
          <div>
            <span className="text-2xl font-bold text-[#0b6e4f]">
              {currency === "GHS" ? "₵" : "$"}
              {price.toLocaleString()}
            </span>
            <span className="ml-1 text-sm text-gray-500">
              /{property.period || "month"}
            </span>
          </div>
        </div>

        {/* CTA */}
        <button
          onClick={onSignUpClick}
          className="mt-2 flex w-full items-center justify-center gap-2 rounded-lg bg-[#0b6e4f] px-4 py-3 font-medium text-white transition hover:bg-[#095c42]"
        >
          Sign Up to Save
          <ArrowRight size={16} />
        </button>
      </div>
    </motion.div>
  );
}

/* ======================================================
   EMPTY STATE COMPONENT
====================================================== */
function EmptyState({ hasSearchTerm }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-xl border border-gray-200 bg-white p-12 text-center shadow-sm"
    >
      <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-gray-100">
        <Search className="h-12 w-12 text-gray-400" />
      </div>

      <h3 className="mb-2 text-2xl font-semibold text-gray-900">
        {hasSearchTerm ? "No Properties Found" : "No Properties Available"}
      </h3>

      <p className="mx-auto mb-6 max-w-md text-gray-600">
        {hasSearchTerm
          ? "Try adjusting your search to find what you're looking for."
          : "There are no properties available at the moment. Please check back later."}
      </p>
    </motion.div>
  );
}

/* ======================================================
   MAIN PAGE
====================================================== */
export default function PublicProperties() {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  const navigate = useNavigate();

  useEffect(() => {
    let mounted = true;

    const load = async () => {
      try {
        setLoading(true);
        const data = await fetchProperties();
        if (mounted) {
          setProperties(Array.isArray(data) ? data : []);
        }
      } catch (err) {
        console.error("fetchProperties:", err);
        if (mounted) setError(err.message || "Failed to load properties");
      } finally {
        if (mounted) setLoading(false);
      }
    };

    load();
    return () => {
      mounted = false;
    };
  }, []);

  const filteredProperties = properties.filter((property) => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return (
      property.title?.toLowerCase().includes(term) ||
      property.address?.toLowerCase().includes(term) ||
      property.location?.toLowerCase().includes(term) ||
      property.description?.toLowerCase().includes(term)
    );
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <LandingNavbar searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
        <div className="flex min-h-[400px] items-center justify-center pt-24">
          <Loader2 className="h-8 w-8 animate-spin text-[#0b6e4f]" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <LandingNavbar searchTerm={searchTerm} setSearchTerm={setSearchTerm} />

      {/* Page Header  */}
      <div className="bg-linear-to-br from-[#0b6e4f] to-[#095c42] pt-28 pb-14 text-white">
        <div className="mx-auto max-w-7xl px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="mb-4 text-4xl font-bold md:text-5xl">
              Find Your Perfect Home
            </h1>
            <p className="mx-auto max-w-2xl text-xl text-green-50">
              Browse our collection of quality rental properties across Ghana
            </p>
          </motion.div>
        </div>
      </div>

      {/* Content */}
      <div className="mx-auto max-w-7xl px-6 py-12">
        <p className="mb-6 text-sm text-gray-600">
          {filteredProperties.length}{" "}
          {filteredProperties.length === 1 ? "property" : "properties"} available
        </p>

        {error && (
          <div className="mb-8 rounded-xl border border-red-200 bg-red-50 p-4 text-red-700">
            {error}
          </div>
        )}

        {filteredProperties.length === 0 ? (
          <EmptyState hasSearchTerm={!!searchTerm} />
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
            className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3"
          >
            <AnimatePresence>
              {filteredProperties.map((property, index) => (
                <PropertyCard
                  key={property.id}
                  property={property}
                  index={index}
                  onSignUpClick={() => navigate("/signup?role=tenant")}
                />
              ))}
            </AnimatePresence>
          </motion.div>
        )}

        {/* CTA */}
        {filteredProperties.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="mt-16 rounded-2xl bg-linear-to-r from-[#0b6e4f] to-[#095c42] p-8 text-center text-white md:p-12"
          >
            <h2 className="mb-4 text-3xl font-bold">
              Ready to Find Your Home?
            </h2>
            <p className="mx-auto mb-6 max-w-2xl text-lg text-green-50">
              Create an account to save favorites, book viewings, and get
              personalized recommendations
            </p>
            <Link
              to="/signup?role=tenant"
              className="inline-flex items-center gap-2 rounded-lg bg-white px-8 py-4 text-lg font-semibold text-[#0b6e4f] transition hover:bg-green-50"
            >
              Get Started
              <ArrowRight size={20} />
            </Link>
          </motion.div>
        )}
      </div>

      <Footer />
    </div>
  );
}
