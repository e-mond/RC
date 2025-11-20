// src/pages/Dashboards/Tenant/TenantRentalHistory.jsx
import React, { useEffect, useState } from "react";
import { getRentalHistory, generateRentalReference } from "@/services/tenantService";
import { Calendar, FileText, Download, MapPin, DollarSign, Clock, CheckCircle, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import { format, parseISO } from "date-fns";

/**
 * TenantRentalHistory - Rental history timeline
 * - Timeline view of all past and current rentals
 * - Document storage
 * - Reference generation
 */
export default function TenantRentalHistory() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [generatingRef, setGeneratingRef] = useState(null);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        setLoading(true);
        const data = await getRentalHistory();
        if (mounted) {
          // Sort by date (newest first)
          const sorted = Array.isArray(data) ? data.sort((a, b) => {
            const dateA = new Date(a.startDate || a.createdAt || 0);
            const dateB = new Date(b.startDate || b.createdAt || 0);
            return dateB - dateA;
          }) : [];
          setHistory(sorted);
        }
      } catch (err) {
        console.error("getRentalHistory:", err);
        if (mounted) setError(err.message || "Failed to load rental history");
      } finally {
        if (mounted) setLoading(false);
      }
    };
    load();
    return () => {
      mounted = false;
    };
  }, []);

  const handleGenerateReference = async (rentalId) => {
    setGeneratingRef(rentalId);
    try {
      const result = await generateRentalReference(rentalId);
      // Download or show reference
      if (result.referenceUrl) {
        window.open(result.referenceUrl, "_blank");
      } else {
        alert(`Reference generated: ${result.referenceId || result.id}`);
      }
    } catch (err) {
      console.error("generateRentalReference:", err);
      alert(err.message || "Failed to generate reference");
    } finally {
      setGeneratingRef(null);
    }
  };

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-[#0b6e4f]" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <header>
        <h2 className="text-2xl font-bold text-[#0f1724]">Rental History</h2>
        <p className="text-sm text-gray-600">Complete timeline of your rental agreements</p>
      </header>

      {history.length === 0 ? (
        <EmptyHistoryState />
      ) : (
        <div className="relative">
          {/* Timeline Line */}
          <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gray-200" />

          <div className="space-y-8">
            {history.map((rental, index) => (
              <RentalHistoryItem
                key={rental.id}
                rental={rental}
                index={index}
                onGenerateReference={handleGenerateReference}
                generatingRef={generatingRef === rental.id}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// Rental History Item Component
function RentalHistoryItem({ rental, index, onGenerateReference, generatingRef }) {
  const startDate = rental.startDate ? format(parseISO(rental.startDate), "MMM yyyy") : "N/A";
  const endDate = rental.endDate ? format(parseISO(rental.endDate), "MMM yyyy") : rental.status === "active" ? "Present" : "N/A";
  const status = rental.status || "completed";

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.1 }}
      className="relative flex gap-6"
    >
      {/* Timeline Dot */}
      <div className="relative z-10 flex-shrink-0">
        <div
          className={`w-16 h-16 rounded-full flex items-center justify-center border-4 border-white shadow-md ${
            status === "active"
              ? "bg-[#0b6e4f]"
              : status === "completed"
              ? "bg-green-500"
              : "bg-gray-400"
          }`}
        >
          {status === "active" ? (
            <Clock className="w-8 h-8 text-white" />
          ) : (
            <CheckCircle className="w-8 h-8 text-white" />
          )}
        </div>
      </div>

      {/* Content Card */}
      <div className="flex-1 bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h3 className="font-semibold text-lg text-gray-900 mb-1">
              {rental.propertyTitle || rental.propertyName || "Rental Property"}
            </h3>
            <p className="text-sm text-gray-600 flex items-center gap-1">
              <MapPin size={14} />
              {rental.address || rental.location || "Location not specified"}
            </p>
          </div>
          <span
            className={`px-3 py-1 rounded-full text-xs font-medium ${
              status === "active"
                ? "bg-green-100 text-green-700"
                : status === "completed"
                ? "bg-blue-100 text-blue-700"
                : "bg-gray-100 text-gray-700"
            }`}
          >
            {status}
          </span>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4 text-sm">
          <div>
            <span className="text-gray-600">Start:</span>{" "}
            <span className="font-medium">{startDate}</span>
          </div>
          <div>
            <span className="text-gray-600">End:</span>{" "}
            <span className="font-medium">{endDate}</span>
          </div>
          <div className="flex items-center gap-1">
            <DollarSign size={14} className="text-gray-600" />
            <span className="text-gray-600">Rent:</span>{" "}
            <span className="font-semibold text-[#0b6e4f]">
              ₵{rental.monthlyRent?.toLocaleString() || rental.rent?.toLocaleString() || "0"}
            </span>
          </div>
          {rental.deposit && (
            <div>
              <span className="text-gray-600">Deposit:</span>{" "}
              <span className="font-medium">₵{rental.deposit.toLocaleString()}</span>
            </div>
          )}
        </div>

        {/* Documents & Actions */}
        <div className="flex items-center justify-between pt-4 border-t">
          <div className="flex items-center gap-4">
            {rental.documents && rental.documents.length > 0 && (
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <FileText size={16} />
                <span>{rental.documents.length} document(s)</span>
              </div>
            )}
            {rental.landlordName && (
              <div className="text-sm text-gray-600">
                <span className="font-medium">Landlord:</span> {rental.landlordName}
              </div>
            )}
          </div>
          <div className="flex items-center gap-2">
            {rental.documents && rental.documents.length > 0 && (
              <button className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-1">
                <Download size={14} />
                Documents
              </button>
            )}
            <button
              onClick={() => onGenerateReference(rental.id)}
              disabled={generatingRef}
              className="px-3 py-1.5 text-sm bg-[#0b6e4f] text-white rounded-lg hover:bg-[#095c42] transition-colors disabled:opacity-50 flex items-center gap-1"
            >
              {generatingRef ? (
                <>
                  <Loader2 size={14} className="animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <FileText size={14} />
                  Reference
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// Empty State
function EmptyHistoryState() {
  return (
    <div className="bg-white rounded-xl shadow-sm p-12 text-center border border-gray-200">
      <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-6">
        <Calendar className="w-12 h-12 text-gray-400" />
      </div>
      <h3 className="text-xl font-semibold text-gray-900 mb-2">No Rental History</h3>
      <p className="text-gray-600 max-w-md mx-auto">
        Your rental history will appear here once you have active or completed rental agreements.
      </p>
    </div>
  );
}

