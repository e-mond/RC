// src/pages/Dashboards/Tenant/TenantRentalHistory.jsx
import React, { useEffect, useState } from "react";
import {
  getRentalHistory,
  generateRentalReference,
} from "@/services/tenantService";
import {
  Calendar,
  FileText,
  Download,
  MapPin,
  DollarSign,
  Clock,
  CheckCircle,
  Loader2,
} from "lucide-react";
import { motion } from "framer-motion";
import { format, parseISO } from "date-fns";

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
          const sorted = Array.isArray(data)
            ? data.sort((a, b) => {
                const dateA = new Date(a.startDate || a.createdAt || 0);
                const dateB = new Date(b.startDate || b.createdAt || 0);
                return dateB - dateA;
              })
            : [];
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
        <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 p-4 rounded-lg">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
            Rental History
          </h2>
          <p className="mt-2 text-sm sm:text-base text-gray-600 dark:text-gray-400">
            Complete timeline of your rental agreements and past tenancies
          </p>
        </div>
      </header>

      {history.length === 0 ? (
        <EmptyHistoryState />
      ) : (
        <div className="relative">
          {/* Timeline Line */}
          <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gray-200 dark:bg-gray-700" />

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
  const startDate = rental.startDate
    ? format(parseISO(rental.startDate), "MMM yyyy")
    : "N/A";
  const endDate = rental.endDate
    ? format(parseISO(rental.endDate), "MMM yyyy")
    : rental.status === "active"
    ? "Present"
    : "N/A";
  const status = rental.status || "completed";

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.1 }}
      className="relative flex gap-6"
    >
      {/* Timeline Dot */}
      <div className="relative z-10 shrink-0">
        <div
          className={`w-16 h-16 rounded-full flex items-center justify-center border-4 border-white dark:border-gray-900 shadow-md ${
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
      <div className="flex-1 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 hover:shadow-md dark:hover:shadow-lg transition-shadow">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h3 className="font-semibold text-lg text-gray-900 dark:text-white mb-1">
              {rental.propertyTitle || rental.propertyName || "Rental Property"}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-1">
              <MapPin size={14} />
              {rental.address || rental.location || "Location not specified"}
            </p>
          </div>
          <span
            className={`px-3 py-1 rounded-full text-xs font-medium ${
              status === "active"
                ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300"
                : status === "completed"
                ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300"
                : "bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-300"
            }`}
          >
            {status}
          </span>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4 text-sm text-gray-600 dark:text-gray-400">
          <div>
            <span className="text-gray-600 dark:text-gray-400">Start:</span>{" "}
            <span className="font-medium text-gray-900 dark:text-white">{startDate}</span>
          </div>
          <div>
            <span className="text-gray-600 dark:text-gray-400">End:</span>{" "}
            <span className="font-medium text-gray-900 dark:text-white">{endDate}</span>
          </div>
          <div className="flex items-center gap-1">
            <DollarSign size={14} className="text-gray-600 dark:text-gray-400" />
            <span className="text-gray-600 dark:text-gray-400">Rent:</span>{" "}
            <span className="font-semibold text-[#0b6e4f]">
              ₵{rental.monthlyRent?.toLocaleString() || rental.rent?.toLocaleString() || "0"}
            </span>
          </div>
          {rental.deposit && (
            <div>
              <span className="text-gray-600 dark:text-gray-400">Deposit:</span>{" "}
              <span className="font-medium text-gray-900 dark:text-white">
                ₵{rental.deposit.toLocaleString()}
              </span>
            </div>
          )}
        </div>

        {/* Documents & Actions */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
            {rental.documents && rental.documents.length > 0 && (
              <div className="flex items-center gap-2">
                <FileText size={16} />
                <span>{rental.documents.length} document(s)</span>
              </div>
            )}
            {rental.landlordName && (
              <div>
                <span className="font-medium">Landlord:</span> {rental.landlordName}
              </div>
            )}
          </div>
          <div className="flex items-center gap-2">
            {rental.documents && rental.documents.length > 0 && (
              <button className="px-3 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors flex items-center gap-1">
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
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-12 text-center border border-gray-200 dark:border-gray-700">
      <div className="mx-auto w-24 h-24 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mb-6">
        <Calendar className="w-12 h-12 text-gray-400 dark:text-gray-500" />
      </div>
      <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
        No Rental History
      </h3>
      <p className="text-gray-600 dark:text-gray-400 max-w-md mx-auto">
        Your rental history will appear here once you have active or completed rental agreements.
      </p>
    </div>
  );
}