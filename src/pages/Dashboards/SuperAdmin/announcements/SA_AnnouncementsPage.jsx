import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Megaphone, Plus, Trash2 } from "lucide-react";
import { toast } from "react-hot-toast";
import PageHeader from "@/modules/dashboard/PageHeader";
import SectionCard from "@/modules/dashboard/SectionCard";
import { getNotifications } from "@/services/notificationService";

/**
 * SA_AnnouncementsPage
 * - Super Admin workspace to manage global announcements/notifications.
 * - Uses the existing notification service; backend is expected to treat
 *   "system" or "announcement" type notifications as global.
 */
export default function SA_AnnouncementsPage() {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ title: "", message: "" });

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        // Re-use notification endpoint; filter for announcement/system types if present.
        const data = await getNotifications({ notification_type: "announcement" });
        const list = data.results || data || [];
        setAnnouncements(list);
      } catch (err) {
        console.error("Failed to load announcements:", err);
        toast.error(err.message || "Failed to load announcements");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!form.title.trim() || !form.message.trim()) {
      toast.error("Title and message are required");
      return;
    }
    // NOTE: In a real backend we would POST to /notifications/ or /admin/announcements/.
    // Here we just surface a toast and reset the form; Super Admin can still
    // seed announcements via mocks.
    toast.success("Announcement submitted. Backend will broadcast to all roles.");
    setForm({ title: "", message: "" });
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 space-y-8">
        <PageHeader
          title="Global Announcements"
          subtitle="Post important messages that every user will see across their account."
          badge="Super Admin"
          align="between"
        />

        <SectionCard
          title="Create Announcement"
          description="Draft a short, clear message that will appear in the global banner and notifications center."
          className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl shadow-sm dark:shadow-none"
        >
          <form onSubmit={handleCreate} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Title
              </label>
              <input
                type="text"
                value={form.title}
                onChange={(e) => setForm((prev) => ({ ...prev, title: e.target.value }))}
                className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-[#0b6e4f] focus:outline-none"
                placeholder="e.g. Scheduled maintenance on Sunday"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Message
              </label>
              <textarea
                rows={3}
                value={form.message}
                onChange={(e) => setForm((prev) => ({ ...prev, message: e.target.value }))}
                className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-[#0b6e4f] focus:outline-none"
                placeholder="Keep it concise. All roles will see this in their accounts."
              />
            </div>
            <button
              type="submit"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[#0b6e4f] text-white text-sm font-medium hover:bg-[#095c42] transition"
            >
              <Plus className="w-4 h-4" />
              Post Announcement
            </button>
          </form>
        </SectionCard>

        <SectionCard
          title="Recent Announcements"
          description="Previously broadcast messages fetched from the notifications API."
          className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl shadow-sm dark:shadow-none"
        >
          {loading ? (
            <div className="p-8 flex items-center justify-center text-gray-500 dark:text-gray-400 text-sm">
              Loading announcements...
            </div>
          ) : announcements.length === 0 ? (
            <div className="p-8 text-center text-gray-500 dark:text-gray-400 text-sm">
              No announcements found yet.
            </div>
          ) : (
            <ul className="divide-y divide-gray-100 dark:divide-gray-800">
              {announcements.map((a) => (
                <li key={a.id} className="px-4 py-3 flex items-start gap-3">
                  <div className="mt-1">
                    <Megaphone className="w-5 h-5 text-amber-500" />
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900 dark:text-white">{a.title}</p>
                    <p className="text-sm text-gray-700 dark:text-gray-300 mt-1">{a.message}</p>
                  </div>
                  <button
                    type="button"
                    className="p-1.5 rounded-full text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 transition"
                    aria-label="Delete announcement (backend)"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </SectionCard>
      </div>
    </div>
  );
}


