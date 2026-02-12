/**
 * SA_MarketingCampaigns Page
 * 
 * Super Admin and Admin page for creating and managing marketing campaigns.
 * Allows sending emails and SMS to selected users or all users.
 * 
 * Features:
 * - User selection (individual, by role, or all users)
 * - Email campaign creation (with rich text fallback)
 * - SMS campaign creation
 * - Campaign preview modal (dark mode supported)
 * - Sent campaigns history
 * - Responsive design & mobile accessibility
 */

import { useEffect, useState } from "react";
import { Mail, MessageSquare, Users, Send, History, Search, Loader2, Eye } from "lucide-react";
import { toast } from "react-hot-toast";
import Button from "@/components/ui/Button";
import PageHeader from "@/modules/dashboard/PageHeader";
import SectionCard from "@/modules/dashboard/SectionCard";
import { fetchAllUsers } from "@/services/adminService";
import { sendMarketingEmail, sendMarketingSMS } from "@/services/marketingService";

export default function SA_MarketingCampaigns() {
  const [users, setUsers] = useState([]);
  const [selectedUsers, setSelectedUsers] = useState(new Set());
  const [sending, setSending] = useState(false);
  const [campaignType, setCampaignType] = useState("email"); // 'email' or 'sms'
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [targetType, setTargetType] = useState("selected"); // 'selected', 'role', 'all'
  const [roleFilter, setRoleFilter] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [showPreview, setShowPreview] = useState(false);
  const [sentCampaigns, setSentCampaigns] = useState([]); // history

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      const data = await fetchAllUsers();
      setUsers(data.users || data || []);
    } catch (err) {
      console.error("Failed to load users:", err);
      toast.error(err.message || "Failed to load users");
    }
  };

  const filteredUsers = users.filter((u) => {
    const searchLower = searchQuery.toLowerCase().trim();
    const matchesSearch =
      (u.full_name || u.fullName || u.name || "").toLowerCase().includes(searchLower) ||
      (u.email || "").toLowerCase().includes(searchLower);
    const matchesRole = !roleFilter || u.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const getTargetUsers = () => {
    if (targetType === "all") return users;
    if (targetType === "role") return users.filter((u) => u.role === roleFilter);
    return Array.from(selectedUsers)
      .map((id) => users.find((u) => u.id === id || u._id === id))
      .filter(Boolean);
  };

  const handleSend = async () => {
    if (!message.trim()) {
      toast.error("Message content is required");
      return;
    }

    if (campaignType === "email" && !subject.trim()) {
      toast.error("Subject is required for emails");
      return;
    }

    const targets = getTargetUsers();
    if (targets.length === 0) {
      toast.error("Select at least one recipient");
      return;
    }

    if (!window.confirm(`Send ${campaignType.toUpperCase()} to ${targets.length} user(s)?`)) return;

    setSending(true);
    try {
      if (campaignType === "email") {
        await sendMarketingEmail({
          subject: subject.trim(),
          message: message.trim(),
          user_ids: targets.map((u) => u.id || u._id),
        });
        toast.success(`Email sent to ${targets.length} users`);
      } else {
        await sendMarketingSMS({
          message: message.trim(),
          user_ids: targets.map((u) => u.id || u._id),
        });
        toast.success(`SMS sent to ${targets.length} users`);
      }

      // Add to history
      setSentCampaigns((prev) => [
        {
          id: Date.now(),
          type: campaignType,
          subject: campaignType === "email" ? subject : "(SMS)",
          recipients: targets.length,
          timestamp: new Date().toLocaleString(),
          status: "Sent",
        },
        ...prev,
      ]);

      // Reset form
      setSubject("");
      setMessage("");
      setSelectedUsers(new Set());
    } catch (err) {
      console.error("Send failed:", err);
      toast.error(err.message || `Failed to send ${campaignType.toUpperCase()}`);
    } finally {
      setSending(false);
    }
  };

  const toggleUserSelection = (userId) => {
    setSelectedUsers((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(userId)) newSet.delete(userId);
      else newSet.add(userId);
      return newSet;
    });
  };

  const selectAll = () => {
    if (selectedUsers.size === filteredUsers.length) {
      setSelectedUsers(new Set());
    } else {
      setSelectedUsers(new Set(filteredUsers.map((u) => u.id || u._id)));
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 pb-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6 space-y-8">
        <PageHeader
          title="Marketing Campaigns"
          subtitle="Create and send targeted emails & SMS to users"
          badge="Marketing"
        />

        {/* Campaign Type */}
        <SectionCard title="Campaign Type" className="p-5 sm:p-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
            <button
              onClick={() => setCampaignType("email")}
              disabled={sending}
              className={`flex flex-col items-center justify-center gap-3 p-5 sm:p-6 rounded-xl border-2 transition-all text-center touch-manipulation focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 ${
                campaignType === "email"
                  ? "border-emerald-600 bg-emerald-50 dark:bg-emerald-950/30 shadow-sm text-emerald-700 dark:text-emerald-300"
                  : "border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500"
              }`}
              aria-pressed={campaignType === "email"}
              aria-label="Select Email Campaign"
            >
              <Mail className="w-7 h-7 sm:w-8 sm:h-8" />
              <span className="font-semibold text-base sm:text-lg">Email</span>
            </button>

            <button
              onClick={() => setCampaignType("sms")}
              disabled={sending}
              className={`flex flex-col items-center justify-center gap-3 p-5 sm:p-6 rounded-xl border-2 transition-all text-center touch-manipulation focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 ${
                campaignType === "sms"
                  ? "border-emerald-600 bg-emerald-50 dark:bg-emerald-950/30 shadow-sm text-emerald-700 dark:text-emerald-300"
                  : "border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500"
              }`}
              aria-pressed={campaignType === "sms"}
              aria-label="Select SMS Campaign"
            >
              <MessageSquare className="w-7 h-7 sm:w-8 sm:h-8" />
              <span className="font-semibold text-base sm:text-lg">SMS</span>
            </button>
          </div>
        </SectionCard>

        {/* Campaign Content */}
        <SectionCard title="Campaign Content" className="p-4 sm:p-5">
          <div className="space-y-4">
            {campaignType === "email" && (
              <div>
                <label className="block text-sm font-medium mb-1.5">
                  Subject <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="Campaign subject line..."
                  disabled={sending}
                  className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  required
                  aria-required="true"
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium mb-1.5">
                Message <span className="text-red-500">*</span>
              </label>

              {campaignType === "email" ? (
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Write your email message here..."
                  rows={8}
                  disabled={sending}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent resize-y min-h-[140px]"
                  aria-required="true"
                />
              ) : (
                <div className="relative">
                  <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="SMS message (plain text only)"
                    rows={4}
                    maxLength={160}
                    disabled={sending}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent resize-none"
                    aria-required="true"
                  />
                  <p className="absolute bottom-2 right-3 text-xs text-gray-500 dark:text-gray-400">
                    {message.length}/160
                  </p>
                </div>
              )}
            </div>

            <div className="flex flex-col sm:flex-row justify-end gap-3 pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowPreview(true)}
                disabled={sending || !message.trim()}
                className="w-full sm:w-auto"
                aria-label="Preview campaign before sending"
              >
                <Eye className="w-4 h-4 mr-2" />
                Preview
              </Button>
            </div>
          </div>
        </SectionCard>

        {/* Target Audience */}
        <SectionCard title="Target Audience" className="p-4 sm:p-5">
          <div className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <button
                onClick={() => setTargetType("selected")}
                disabled={sending}
                className={`p-4 rounded-xl border-2 text-center transition-all touch-manipulation focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 ${
                  targetType === "selected"
                    ? "border-emerald-600 bg-emerald-50 dark:bg-emerald-950/30 shadow-sm text-emerald-700 dark:text-emerald-300"
                    : "border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500"
                }`}
                aria-pressed={targetType === "selected"}
                aria-label="Select individual users"
              >
                Selected ({selectedUsers.size})
              </button>

              <button
                onClick={() => setTargetType("role")}
                disabled={sending}
                className={`p-4 rounded-xl border-2 text-center transition-all touch-manipulation focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 ${
                  targetType === "role"
                    ? "border-emerald-600 bg-emerald-50 dark:bg-emerald-950/30 shadow-sm text-emerald-700 dark:text-emerald-300"
                    : "border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500"
                }`}
                aria-pressed={targetType === "role"}
                aria-label="Select by user role"
              >
                By Role
              </button>

              <button
                onClick={() => setTargetType("all")}
                disabled={sending}
                className={`p-4 rounded-xl border-2 text-center transition-all touch-manipulation focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 ${
                  targetType === "all"
                    ? "border-emerald-600 bg-emerald-50 dark:bg-emerald-950/30 shadow-sm text-emerald-700 dark:text-emerald-300"
                    : "border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500"
                }`}
                aria-pressed={targetType === "all"}
                aria-label="Send to all users"
              >
                All ({users.length})
              </button>
            </div>

            {targetType === "role" && (
              <div>
                <label className="block text-sm font-medium mb-1.5">
                  Select Role
                </label>
                <select
                  value={roleFilter}
                  onChange={(e) => setRoleFilter(e.target.value)}
                  disabled={sending}
                  className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  aria-label="Filter users by role"
                >
                  <option value="">Select role...</option>
                  <option value="tenant">Tenant</option>
                  <option value="landlord">Landlord</option>
                  <option value="artisan">Artisan</option>
                  <option value="admin">Admin</option>
                  <option value="super-admin">Super Admin</option>
                </select>
              </div>
            )}

            {targetType === "selected" && (
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                    <input
                      type="text"
                      placeholder="Search users by name or email..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      disabled={sending}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                      aria-label="Search users"
                    />
                  </div>

                  <select
                    value={roleFilter}
                    onChange={(e) => setRoleFilter(e.target.value)}
                    disabled={sending}
                    className="w-full sm:w-48 px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                    aria-label="Filter by role"
                  >
                    <option value="">All Roles</option>
                    <option value="tenant">Tenant</option>
                    <option value="landlord">Landlord</option>
                    <option value="artisan">Artisan</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>

                <div className="border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden max-h-80">
                  <div className="p-4 bg-gray-50 dark:bg-gray-800 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      {filteredUsers.length} user{filteredUsers.length !== 1 ? "s" : ""}
                    </span>
                    <button
                      onClick={selectAll}
                      disabled={sending}
                      className="text-sm text-emerald-600 dark:text-emerald-400 hover:underline disabled:opacity-50"
                    >
                      {selectedUsers.size === filteredUsers.length ? "Deselect All" : "Select All"}
                    </button>
                  </div>

                  <div className="divide-y divide-gray-200 dark:divide-gray-700 max-h-64 overflow-y-auto">
                    {filteredUsers.length === 0 ? (
                      <div className="py-8 text-center text-gray-500 dark:text-gray-400">
                        No users match your search/filter
                      </div>
                    ) : (
                      filteredUsers.map((u) => {
                        const id = u.id || u._id;
                        const selected = selectedUsers.has(id);
                        return (
                          <label
                            key={id}
                            className="flex items-center gap-3 p-3 hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer transition-colors focus-within:bg-gray-100 dark:focus-within:bg-gray-700"
                            tabIndex={0}
                          >
                            <input
                              type="checkbox"
                              checked={selected}
                              onChange={() => toggleUserSelection(id)}
                              disabled={sending}
                              className="w-5 h-5 text-emerald-600 rounded border-gray-300 dark:border-gray-600 focus:ring-emerald-500"
                            />
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-gray-900 dark:text-white truncate">
                                {u.full_name || u.name || "Unknown User"}
                              </p>
                              <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                                {u.email || "No email"}
                              </p>
                            </div>
                            <span className="px-2.5 py-1 text-xs font-medium bg-gray-100 dark:bg-gray-700 rounded-full capitalize">
                              {u.role || "unknown"}
                            </span>
                          </label>
                        );
                      })
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </SectionCard>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row justify-end gap-4 pt-6 border-t border-gray-200 dark:border-gray-700">
          <Button
            variant="outline"
            size="md"
            onClick={() => setShowPreview(true)}
            disabled={sending || !message.trim()}
            className="w-full sm:w-auto"
            aria-label="Preview campaign before sending"
          >
            <Eye className="w-4 h-4 mr-2" />
            Preview
          </Button>

          <Button
            size="md"
            onClick={handleSend}
            disabled={sending || !message.trim() || (campaignType === "email" && !subject.trim())}
            className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm"
          >
            {sending ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Sending...
              </>
            ) : (
              <>
                <Send className="w-5 h-5 mr-2" />
                Send {campaignType.toUpperCase()} ({getTargetUsers().length})
              </>
            )}
          </Button>
        </div>

        {/* Preview Modal – full dark mode support */}
        {showPreview && (
          <div
            className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4"
            onClick={() => setShowPreview(false)}
            role="dialog"
            aria-modal="true"
            aria-labelledby="preview-title"
          >
            <div
              className="bg-white dark:bg-gray-900 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="sticky top-0 bg-white dark:bg-gray-900 px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
                <h2 id="preview-title" className="text-xl font-bold text-gray-900 dark:text-white">
                  Campaign Preview
                </h2>
                <button
                  onClick={() => setShowPreview(false)}
                  className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-gray-600 dark:text-gray-400"
                  aria-label="Close preview"
                >
                  ✕
                </button>
              </div>

              <div className="p-6 space-y-6 text-gray-800 dark:text-gray-200">
                <div>
                  <h3 className="font-semibold mb-2 text-gray-900 dark:text-white">Type:</h3>
                  <p className="capitalize">{campaignType}</p>
                </div>

                {campaignType === "email" && (
                  <div>
                    <h3 className="font-semibold mb-2 text-gray-900 dark:text-white">Subject:</h3>
                    <p className="p-4 bg-gray-50 dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-700">
                      {subject || "(No subject)"}
                    </p>
                  </div>
                )}

                <div>
                  <h3 className="font-semibold mb-2 text-gray-900 dark:text-white">Message:</h3>
                  <div
                    className="p-4 bg-gray-50 dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-700 prose dark:prose-invert max-w-none"
                    dangerouslySetInnerHTML={{ __html: message || "(No message)" }}
                  />
                </div>

                <div>
                  <h3 className="font-semibold mb-2 text-gray-900 dark:text-white">Recipients:</h3>
                  <p className="font-medium">{getTargetUsers().length} users</p>
                  {targetType === "selected" && (
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      {Array.from(selectedUsers).length} manually selected
                    </p>
                  )}
                </div>
              </div>

              <div className="sticky bottom-0 bg-white dark:bg-gray-900 px-6 py-4 border-t border-gray-200 dark:border-gray-700 flex justify-end">
                <Button
                  variant="outline"
                  onClick={() => setShowPreview(false)}
                  className="border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                >
                  Close Preview
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* History */}
        <SectionCard title="Sent Campaigns History" className="p-4 sm:p-5">
          {sentCampaigns.length === 0 ? (
            <div className="text-center py-10 text-gray-500 dark:text-gray-400">
              No campaigns sent yet
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 dark:bg-gray-800">
                  <tr>
                    <th className="px-4 py-3 text-left font-medium text-gray-700 dark:text-gray-300">Type</th>
                    <th className="px-4 py-3 text-left font-medium text-gray-700 dark:text-gray-300">Subject/Message</th>
                    <th className="px-4 py-3 text-left font-medium text-gray-700 dark:text-gray-300">Recipients</th>
                    <th className="px-4 py-3 text-left font-medium text-gray-700 dark:text-gray-300">Sent At</th>
                    <th className="px-4 py-3 text-left font-medium text-gray-700 dark:text-gray-300">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {sentCampaigns.map((camp) => (
                    <tr key={camp.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                      <td className="px-4 py-3 capitalize text-gray-900 dark:text-gray-200">{camp.type}</td>
                      <td className="px-4 py-3 truncate max-w-xs text-gray-900 dark:text-gray-200">{camp.subject}</td>
                      <td className="px-4 py-3 text-gray-900 dark:text-gray-200">{camp.recipients}</td>
                      <td className="px-4 py-3 text-gray-600 dark:text-gray-400">{camp.timestamp}</td>
                      <td className="px-4 py-3">
                        <span className="px-2 py-1 text-xs bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 rounded-full">
                          {camp.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </SectionCard>
      </div>
    </div>
  );
}