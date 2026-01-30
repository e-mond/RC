/**
 * SA_PendingPropertyApprovals - Super Admin Pending Property Approvals Page
 * 
 * Dedicated full-page view for reviewing and approving/rejecting pending property listings.
 * Provides comprehensive property management with image preview, bulk actions, and filtering.
 * 
 * Features:
 * - List all pending properties
 * - View property details and images
 * - Approve/reject properties with reasons
 * - Bulk approval actions
 * - Filter by property type and search
 * - Export pending properties list
 */

import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { fetchPendingPropertiesSA, approvePropertySA, rejectPropertySA } from "@/services/adminService";
import Button from "@/components/ui/Button";
import PageHeader from "@/modules/dashboard/PageHeader";
import { CheckCircle, XCircle, Filter, Download, CheckSquare, Square, Loader2, Eye, Home, MapPin } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "react-hot-toast";

export default function SA_PendingPropertyApprovals() {
  const navigate = useNavigate();
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  const [error, setError] = useState("");
  const [selectedProperties, setSelectedProperties] = useState(new Set());
  const [filterType, setFilterType] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      setLoading(true);
      setError("");
      try {
        const res = await fetchPendingPropertiesSA();
        console.log("[SA_PendingPropertyApprovals] Response:", res);
        // Handle paginated response with 'results' array or direct array/object
        const propertyList = res.results || res.data || res.properties || (Array.isArray(res) ? res : []);
        console.log("[SA_PendingPropertyApprovals] Extracted properties:", propertyList);
        console.log("[SA_PendingPropertyApprovals] Property statuses:", propertyList.map(p => ({ id: p.id, status: p.status, title: p.title })));
        if (mounted) setProperties(Array.isArray(propertyList) ? propertyList : []);
      } catch (err) {
        console.error("fetchPendingProperties:", err);
        if (mounted) setError(err.message || "Failed to fetch pending properties");
        toast.error("Failed to load pending properties");
      } finally {
        if (mounted) setLoading(false);
      }
    };
    load();
    return () => {
      mounted = false;
    };
  }, []);

  const handleApprove = async (id) => {
    setActionLoading(id);
    try {
      await approvePropertySA(id);
      setProperties((s) => s.filter((p) => p.id !== id));
      setSelectedProperties((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
      toast.success("Property approved! Notification has been sent to the landlord.");
    } catch (err) {
      console.error("approvePropertySA:", err);
      toast.error(err.message || "Failed to approve property");
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (id) => {
    const reason = window.prompt("Reason for rejection (required):", "");
    if (reason === null || !reason.trim()) {
      toast.error("Rejection reason is required");
      return;
    }
    
    setActionLoading(id);
    try {
      await rejectPropertySA(id, reason.trim());
      setProperties((s) => s.filter((p) => p.id !== id));
      setSelectedProperties((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
      toast.success("Property rejected! Notification has been sent to the landlord.");
    } catch (err) {
      console.error("rejectProperty:", err);
      toast.error(err.message || "Failed to reject property");
    } finally {
      setActionLoading(null);
    }
  };

  const handleBulkApprove = async () => {
    if (selectedProperties.size === 0) return;
    const ids = Array.from(selectedProperties);
    setActionLoading("bulk");
    try {
      await Promise.all(ids.map((id) => approvePropertySA(id)));
      setProperties((s) => s.filter((p) => !ids.includes(p.id)));
      setSelectedProperties(new Set());
      toast.success(`Approved ${ids.length} property/properties successfully!`);
    } catch (err) {
      console.error("bulkApprove:", err);
      toast.error(err.message || "Bulk approve failed");
    } finally {
      setActionLoading(null);
    }
  };

  const handleSelectAll = () => {
    if (selectedProperties.size === filteredProperties.length) {
      setSelectedProperties(new Set());
    } else {
      setSelectedProperties(new Set(filteredProperties.map((p) => p.id)));
    }
  };

  const handleToggleSelect = (id) => {
    setSelectedProperties((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const handleExport = () => {
    const csv = [
      ["Title", "Address", "Price", "Type", "Landlord", "Submitted At"].join(","),
      ...filteredProperties.map((p) =>
        [
          p.title || "",
          p.address || "",
          p.price || p.priceGhs || 0,
          p.property_type || "",
          p.landlord?.full_name || p.landlord?.name || "",
          new Date(p.submittedAt || p.createdAt || Date.now()).toISOString(),
        ].join(",")
      ),
    ].join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `pending-properties-${new Date().toISOString().split("T")[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
    toast.success("Pending properties exported successfully");
  };

  // Filter properties
  const filteredProperties = properties.filter((p) => {
    const matchesType = filterType === "all" || p.property_type?.toLowerCase() === filterType.toLowerCase();
    const matchesSearch =
      !searchQuery ||
      p.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.address?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.landlord?.full_name?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesType && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <PageHeader
          title="Pending Property Approvals"
          subtitle={`${filteredProperties.length} property/properties awaiting approval`}
          badge="Super Admin"
          icon={<Home className="w-6 h-6" />}
        />

        {/* Error State */}
        {error && (
          <div className="mt-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl">
            {error}
          </div>
        )}

        {/* Main Content */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-6 bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 overflow-hidden"
        >
          {/* Header with Actions */}
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Pending Properties</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  Review and approve new property listings
                </p>
              </div>
              <div className="flex items-center gap-2">
                {selectedProperties.size > 0 && (
                  <Button
                    onClick={handleBulkApprove}
                    disabled={actionLoading === "bulk"}
                    className="flex items-center gap-2"
                  >
                    {actionLoading === "bulk" ? (
                      <>
                        <Loader2 size={16} className="animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <CheckCircle size={16} />
                        Approve Selected ({selectedProperties.size})
                      </>
                    )}
                  </Button>
                )}
                <Button variant="outline" onClick={handleExport} className="flex items-center gap-2">
                  <Download size={16} />
                  Export CSV
                </Button>
              </div>
            </div>

            {/* Filters */}
            <div className="flex items-center gap-3">
              <div className="flex-1 relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by title, address, or landlord..."
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-[#0b6e4f] dark:bg-gray-800 dark:text-white"
                />
              </div>
              <div className="flex items-center gap-2">
                <Filter size={18} className="text-gray-600 dark:text-gray-400" />
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-[#0b6e4f] dark:bg-gray-800 dark:text-white"
                >
                  <option value="all">All Types</option>
                  <option value="apartment">Apartments</option>
                  <option value="house">Houses</option>
                  <option value="commercial">Commercial</option>
                  <option value="studio">Studios</option>
                </select>
              </div>
            </div>
          </div>

          {/* Loading State */}
          {loading ? (
            <div className="p-12 flex items-center justify-center">
              <Loader2 className="w-8 h-8 animate-spin text-[#0b6e4f]" />
            </div>
          ) : filteredProperties.length === 0 ? (
            <div className="p-12 text-center text-gray-500 dark:text-gray-400">
              <Home className="w-12 h-12 mx-auto mb-4 text-gray-400" />
              <p className="text-lg font-medium">No pending properties found</p>
              <p className="text-sm mt-2">All property listings have been processed</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200 dark:divide-gray-700">
              {/* Select All */}
              <div className="p-4 bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                <button
                  onClick={handleSelectAll}
                  className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
                >
                  {selectedProperties.size === filteredProperties.length ? (
                    <CheckSquare size={18} className="text-[#0b6e4f]" />
                  ) : (
                    <Square size={18} />
                  )}
                  <span>Select All</span>
                </button>
              </div>

              {/* Property Items */}
              {filteredProperties.map((p) => (
                <motion.div
                  key={p.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-4 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                >
                  <div className="flex items-start gap-4">
                    <button
                      onClick={() => handleToggleSelect(p.id)}
                      className="shrink-0 mt-1"
                      aria-label={`Select ${p.title}`}
                    >
                      {selectedProperties.has(p.id) ? (
                        <CheckSquare size={20} className="text-[#0b6e4f]" />
                      ) : (
                        <Square size={20} className="text-gray-400" />
                      )}
                    </button>
                    
                    {/* Property Image */}
                    <div className="w-32 h-24 bg-gray-200 dark:bg-gray-700 rounded-lg overflow-hidden shrink-0">
                      {p.images?.[0] ? (
                        <img
                          src={p.images[0]}
                          alt={p.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Home className="w-8 h-8 text-gray-400" />
                        </div>
                      )}
                    </div>

                    {/* Property Details */}
                    <div className="flex-1">
                      <div className="font-medium text-gray-900 dark:text-white text-lg">
                        {p.title || "Untitled Property"}
                      </div>
                      <div className="flex items-center gap-2 mt-1 text-sm text-gray-600 dark:text-gray-400">
                        <MapPin size={14} />
                        {p.address || "No address provided"}
                      </div>
                      <div className="flex items-center gap-3 mt-2">
                        <span className="text-sm font-semibold text-[#0b6e4f]">
                          ₵{p.price || p.priceGhs || p.rent || "0"}
                        </span>
                        <span className="px-2 py-0.5 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded text-xs font-medium capitalize">
                          {p.property_type || "N/A"}
                        </span>
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          {p.bedrooms ? `${p.bedrooms} bed` : ""}
                          {p.bathrooms ? ` • ${p.bathrooms} bath` : ""}
                        </span>
                      </div>
                      <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                        <span>Landlord: {p.landlord?.full_name || p.landlord?.name || "Unknown"}</span>
                        <span className="ml-4">
                          Submitted: {new Date(p.submittedAt || p.createdAt || Date.now()).toLocaleDateString()}
                        </span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col gap-2 shrink-0">
                      <Button
                        variant="outline"
                        onClick={() => navigate(`/super-admin/properties/${p.id}`)}
                        className="flex items-center gap-2"
                        title="View property details"
                      >
                        <Eye size={16} />
                        View Details
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => handleReject(p.id)}
                        disabled={actionLoading === p.id}
                        className="flex items-center gap-2 text-red-600 hover:text-red-700 dark:text-red-400"
                      >
                        {actionLoading === p.id ? (
                          <Loader2 size={16} className="animate-spin" />
                        ) : (
                          <XCircle size={16} />
                        )}
                        Reject
                      </Button>
                      <Button
                        onClick={() => handleApprove(p.id)}
                        disabled={actionLoading === p.id}
                        className="flex items-center gap-2 bg-[#0b6e4f] hover:bg-[#095c42]"
                      >
                        {actionLoading === p.id ? (
                          <Loader2 size={16} className="animate-spin" />
                        ) : (
                          <CheckCircle size={16} />
                        )}
                        Approve
                      </Button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </motion.section>
      </div>
    </div>
  );
}
