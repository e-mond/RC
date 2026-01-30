/**
 * Admin Leases Page
 * 
 * Allows admin/super admin to:
 * - View all system lease templates
 * - Edit system lease templates
 * - Upload new system lease templates
 * - Delete system lease templates
 * - Download leases in multiple formats (PDF, DOCX, DOC)
 */

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  FileText,
  Download,
  Edit,
  Trash2,
  Plus,
  Loader2,
  Save,
  X,
  Eye,
} from "lucide-react";
import { toast } from "react-hot-toast";
import Button from "@/components/ui/Button";
import PageHeader from "@/modules/dashboard/PageHeader";
import SectionCard from "@/modules/dashboard/SectionCard";
import {
  getSystemLeases,
  downloadSystemLease,
  updateSystemLease,
} from "@/services/leaseService";
import { useAuthStore } from "@/stores/authStore";
import LeaseViewerModal from "@/components/lease/LeaseViewerModal";

export default function AdminLeasesPage() {
  const { user } = useAuthStore();
  const [leases, setLeases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingLease, setEditingLease] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editFile, setEditFile] = useState(null);
  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [saving, setSaving] = useState(false);
  const [viewingLease, setViewingLease] = useState(null);
  const [deletingLease, setDeletingLease] = useState(null);

  const isSuperAdmin = user?.role === "super-admin";

  useEffect(() => {
    loadLeases();
  }, []);

  const loadLeases = async () => {
    try {
      setLoading(true);
      const data = await getSystemLeases();
      const leasesList = data.leases || [];
      setLeases(leasesList);
      
      // Debug logging for Super Admin
      if (isSuperAdmin && import.meta.env.DEV) {
        console.log("Super Admin - Loaded leases:", leasesList.length, leasesList);
      }
      
      if (leasesList.length === 0) {
        console.warn("No leases found. This may be expected if no leases have been uploaded yet.");
      }
    } catch (err) {
      console.error("Failed to load leases:", err);
      toast.error(err.response?.data?.message || "Failed to load leases");
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadLease = async (leaseId, format = "pdf") => {
    try {
      // Validate blob before download
      const blob = await downloadSystemLease(leaseId, format);
      
      if (!blob || blob.size === 0) {
        throw new Error("Downloaded file is empty");
      }
      
      // Create download link
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `lease-${leaseId}.${format}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      
      // Clean up after a delay to ensure download starts
      setTimeout(() => {
        window.URL.revokeObjectURL(url);
      }, 100);
      
      toast.success(`Lease downloaded as ${format.toUpperCase()}`);
    } catch (err) {
      console.error("Download error:", err);
      const errorMessage = err.message || "Failed to download lease";
      toast.error(errorMessage);
    }
  };

  const openEditModal = (lease) => {
    setEditingLease(lease);
    setEditTitle(lease.title);
    setEditDescription(lease.description);
    setEditFile(null);
    setShowEditModal(true);
  };

  const handleSaveLease = async () => {
    if (!editingLease) return;

    try {
      setSaving(true);
      await updateSystemLease(
        editingLease.id,
        editFile,
        editTitle,
        editDescription
      );
      await loadLeases();
      setShowEditModal(false);
      setEditingLease(null);
      toast.success("Lease updated successfully");
    } catch (err) {
      console.error("Update error:", err);
      toast.error(err.message || "Failed to update lease");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteLease = async (leaseId) => {
    if (!window.confirm("Are you sure you want to delete this lease template? This action cannot be undone.")) {
      return;
    }

    try {
      await deleteSystemLease(leaseId);
      await loadLeases();
      toast.success("Lease deleted successfully");
    } catch (err) {
      console.error("Delete error:", err);
      toast.error(err.message || "Failed to delete lease");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-[#0b6e4f]" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="System Lease Management"
        subtitle="Manage system-wide lease templates"
        badge={isSuperAdmin ? "Super Admin" : "Admin"}
      />

      {/* Add New Lease Button (Super Admin only) */}
      {isSuperAdmin && (
        <div className="flex justify-end">
          <Button onClick={() => {
            setEditingLease(null);
            setEditTitle("");
            setEditDescription("");
            setEditFile(null);
            setShowEditModal(true);
          }}>
            <Plus className="w-4 h-4 mr-2" />
            Add New Lease Template
          </Button>
        </div>
      )}

      {/* System Leases */}
      <SectionCard
        title="System Lease Templates"
        description="Manage lease templates available to all users"
      >
        {leases.length === 0 ? (
          <div className="text-center py-12 text-gray-500 dark:text-gray-400">
            <FileText className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>No system leases configured</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {leases.map((lease) => (
              <motion.div
                key={lease.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:shadow-md transition"
              >
                <div className="flex items-start gap-3 mb-3">
                  <FileText className="w-6 h-6 text-[#0b6e4f] flex-shrink-0" />
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                      {lease.title}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                      {lease.description}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-500">
                      Version {lease.version || "1.0"} • Updated{" "}
                      {new Date(lease.updated_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                {/* View and Download Options */}
                <div className="mb-3">
                  <p className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Actions:
                  </p>
                  <div className="flex gap-2 flex-wrap">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setViewingLease(lease)}
                    >
                      <Eye className="w-4 h-4 mr-1" />
                      View
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDownloadLease(lease.id, "pdf")}
                    >
                      PDF
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDownloadLease(lease.id, "docx")}
                    >
                      DOCX
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDownloadLease(lease.id, "doc")}
                    >
                      DOC
                    </Button>
                  </div>
                </div>

                {/* Edit and Delete Buttons (Admin/Super Admin) */}
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => openEditModal(lease)}
                    className="flex-1"
                  >
                    <Edit className="w-4 h-4 mr-1" />
                    Edit
                  </Button>
                  {isSuperAdmin && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeleteLease(lease.id)}
                      className="flex-1 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30"
                    >
                      <Trash2 className="w-4 h-4 mr-1" />
                      Delete
                    </Button>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </SectionCard>

      {/* Lease Viewer Modal */}
      {viewingLease && (
        <LeaseViewerModal
          isOpen={!!viewingLease}
          onClose={() => setViewingLease(null)}
          lease={viewingLease}
          isSystem={true}
        />
      )}

      {/* Edit/Add Modal */}
      {showEditModal && (
        <EditLeaseModal
          lease={editingLease}
          onClose={() => {
            setShowEditModal(false);
            setEditingLease(null);
            setEditFile(null);
            setEditTitle("");
            setEditDescription("");
          }}
          onSave={handleSaveLease}
          file={editFile}
          setFile={setEditFile}
          title={editTitle}
          setTitle={setEditTitle}
          description={editDescription}
          setDescription={setEditDescription}
          saving={saving}
        />
      )}
    </div>
  );
}

function EditLeaseModal({
  lease,
  onClose,
  onSave,
  file,
  setFile,
  title,
  setTitle,
  description,
  setDescription,
  saving,
}) {
  const isNew = !lease;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 w-full max-w-md"
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            {isNew ? "Add New Lease Template" : "Edit Lease Template"}
          </h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Title *
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Lease Agreement Title"
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Description *
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe this lease template..."
              rows="3"
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Lease File {isNew ? "*" : "(Optional - leave empty to keep current)"}
            </label>
            <input
              type="file"
              accept=".pdf,.docx,.doc"
              onChange={(e) => setFile(e.target.files[0])}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
            {file && (
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Selected: {file.name}
              </p>
            )}
            {!isNew && !file && (
              <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                Current file will be kept if no new file is selected
              </p>
            )}
          </div>
        </div>

        <div className="flex gap-3 mt-6">
          <Button variant="outline" onClick={onClose} className="flex-1" disabled={saving}>
            Cancel
          </Button>
          <Button
            onClick={onSave}
            className="flex-1"
            disabled={saving || !title || !description || (isNew && !file)}
          >
            {saving ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                {isNew ? "Create" : "Save Changes"}
              </>
            )}
          </Button>
        </div>
      </motion.div>
    </div>
  );
}
