// src/pages/Dashboards/SuperAdmin/AnnouncementsPage.jsx
import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { Megaphone, Plus, Trash2, AlertCircle, Loader2 } from "lucide-react";
import { toast } from "react-hot-toast";
import PageHeader from "@/modules/dashboard/PageHeader";
import SectionCard from "@/modules/dashboard/SectionCard";
import ConfirmModal from "@/components/ui/ConfirmModal";
import {
  getAllAnnouncementsAdmin as getAnnouncements,
  createAnnouncement,
  deleteAnnouncement,
} from "@/services/adminAnnouncementService";

const MAX_TITLE = 120;
const MAX_MESSAGE = 600;

const SEVERITY_OPTIONS = [
  { value: "info", label: "Info (Blue)" },
  { value: "warning", label: "Warning (Amber)" },
  { value: "critical", label: "Critical (Red)" },
];

const getSeverityBadge = (severity) => {
  const safeSeverity = (severity || "info").toLowerCase();
  const styles = {
    info: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300",
    warning: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300",
    critical: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300",
  };
  const labels = {
    info: "Info",
    warning: "Warning",
    critical: "Critical",
  };
  return {
    className: styles[safeSeverity] || styles.info,
    label: labels[safeSeverity] || labels.info,
  };
};

export default function SA_AnnouncementsPage() {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [form, setForm] = useState({
    title: "",
    message: "",
    severity: "info",
    expires_at: "", // ISO date string or empty (null means no expiration)
  });
  const [error, setError] = useState(null);

  const loadAnnouncements = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getAnnouncements();
      setAnnouncements(Array.isArray(data) ? data : []);
    } catch (err) {
      const msg = err?.message || "Could not load announcements";
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAnnouncements();
  }, [loadAnnouncements]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const title = form.title.trim();
    const message = form.message.trim();

    if (!title) return toast.error("Title is required");
    if (!message) return toast.error("Message is required");
    if (title.length > MAX_TITLE) return toast.error(`Title too long (max ${MAX_TITLE} chars)`);
    if (message.length > MAX_MESSAGE) return toast.error(`Message too long (max ${MAX_MESSAGE} chars)`);

    try {
      setSubmitting(true);
      await createAnnouncement({
        title,
        message,
        severity: form.severity,
        expires_at: form.expires_at || null, // null = never expire
      });
      toast.success("Announcement published successfully!");
      setForm({
        title: "",
        message: "",
        severity: "info",
        expires_at: "",
      });
      await loadAnnouncements();
    } catch (err) {
      const msg = err?.message || "Failed to publish announcement";
      toast.error(msg);
      setError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteRequest = (id) => {
    setConfirmDelete(id);
  };

  const handleConfirmDelete = async () => {
    if (!confirmDelete) return;

    try {
      setDeletingId(confirmDelete);
      await deleteAnnouncement(confirmDelete);
      toast.success("Announcement deleted successfully");
      setAnnouncements((prev) => prev.filter((item) => item.id !== confirmDelete));
    } catch (err) {
      toast.error(err?.message || "Failed to delete announcement");
    } finally {
      setDeletingId(null);
      setConfirmDelete(null);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 pb-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 space-y-10">
        <PageHeader
          title="Global Announcements"
          subtitle="Broadcast important messages to all users"
          badge="Super Admin"
        />

        {/* Create Form */}
        <SectionCard title="Create New Announcement">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                maxLength={MAX_TITLE}
                value={form.title}
                onChange={(e) => setForm((prev) => ({ ...prev, title: e.target.value }))}
                className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-600 focus:border-transparent transition"
                placeholder="e.g. Scheduled Maintenance - January 20, 2026"
                required
              />
              <div className="mt-1 text-xs text-gray-500 dark:text-gray-400 text-right">
                {form.title.length} / {MAX_TITLE}
              </div>
            </div>

            {/* Message */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                Message <span className="text-red-500">*</span>
              </label>
              <textarea
                rows={5}
                maxLength={MAX_MESSAGE}
                value={form.message}
                onChange={(e) => setForm((prev) => ({ ...prev, message: e.target.value }))}
                className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-600 focus:border-transparent transition resize-none"
                placeholder="Detailed information for all users..."
                required
              />
              <div className="mt-1 text-xs text-gray-500 dark:text-gray-400 text-right">
                {form.message.length} / {MAX_MESSAGE}
              </div>
            </div>

            {/* Severity Dropdown */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                Severity
              </label>
              <select
                value={form.severity}
                onChange={(e) => setForm((prev) => ({ ...prev, severity: e.target.value }))}
                className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-600 focus:border-transparent transition"
              >
                {SEVERITY_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Expiration Date (optional) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                Expires At (optional - leave blank for never expire)
              </label>
              <input
                type="date"
                value={form.expires_at}
                min={new Date().toISOString().split("T")[0]} // Prevent past dates
                onChange={(e) => setForm((prev) => ({ ...prev, expires_at: e.target.value }))}
                className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-600 focus:border-transparent transition"
              />
            </div>

            {error && (
              <div className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-950/30 text-red-700 dark:text-red-300 rounded-lg text-sm">
                <AlertCircle size={18} />
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={submitting || loading}
              className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-lg transition disabled:opacity-60"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Publishing...
                </>
              ) : (
                <>
                  <Plus size={18} />
                  Publish Announcement
                </>
              )}
            </button>
          </form>
        </SectionCard>

        {/* Announcements List */}
        <SectionCard title="Published Announcements" description="Newest first • Visible to everyone">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
            </div>
          ) : announcements.length === 0 ? (
            <div className="text-center py-12 text-gray-500 dark:text-gray-400">
              No announcements published yet.
            </div>
          ) : (
            <div className="divide-y divide-gray-100 dark:divide-gray-800">
              {announcements.map((item) => {
                const severityBadge = getSeverityBadge(item.severity);

                return (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="px-5 py-4 flex items-start gap-4 group hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors"
                  >
                    <div className="mt-1">
                      <Megaphone className="w-6 h-6 text-amber-500" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-gray-900 dark:text-white">
                        {item.title}
                      </div>
                      <p className="mt-1 text-sm text-gray-700 dark:text-gray-300 line-clamp-2">
                        {item.message}
                      </p>
                      <div className="mt-2 text-xs text-gray-500 dark:text-gray-400 flex flex-wrap items-center gap-3">
                        <span>{new Date(item.created_at).toLocaleString()}</span>
                        {item.created_by_name && <span>• {item.created_by_name}</span>}

                        {/* Severity Badge */}
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${severityBadge.className}`}>
                          {severityBadge.label}
                        </span>

                        {/* Expiration Date */}
                        {item.expires_at && (
                          <span className="text-gray-500 dark:text-gray-400">
                            Expires: {new Date(item.expires_at).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                    </div>

                    <button
                      onClick={() => handleDeleteRequest(item.id)}
                      disabled={deletingId === item.id}
                      className="p-2 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 opacity-0 group-hover:opacity-100 transition disabled:opacity-40"
                      title="Delete this announcement"
                    >
                      {deletingId === item.id ? (
                        <Loader2 className="w-5 h-5 animate-spin text-red-600" />
                      ) : (
                        <Trash2 className="w-5 h-5" />
                      )}
                    </button>
                  </motion.div>
                );
              })}
            </div>
          )}
        </SectionCard>
      </div>

      {/* Delete Confirmation */}
      <ConfirmModal
        open={!!confirmDelete}
        title="Delete Announcement"
        message="This will permanently remove the announcement for all users. This action cannot be undone."
        onClose={() => setConfirmDelete(null)}
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
}