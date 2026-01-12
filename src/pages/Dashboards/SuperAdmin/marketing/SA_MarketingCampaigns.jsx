/**
 * SA_MarketingCampaigns Page
 * 
 * Super Admin and Admin page for creating and managing marketing campaigns.
 * Allows sending emails and SMS to selected users or all users.
 * 
 * Features:
 * - User selection (individual, by role, or all users)
 * - Email campaign creation
 * - SMS campaign creation
 * - Campaign history
 * - Template management
 */

import { useEffect, useState } from "react";
import { Mail, MessageSquare, Users, Send, History, Filter, Search } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "react-hot-toast";
import Button from "@/components/ui/Button";
import PageHeader from "@/modules/dashboard/PageHeader";
import SectionCard from "@/modules/dashboard/SectionCard";
import { fetchAllUsers } from "@/services/adminService";
import { sendMarketingEmail, sendMarketingSMS } from "@/services/marketingService";
import { isMockMode } from "@/mocks/mockManager";

export default function SA_MarketingCampaigns() {
  const [users, setUsers] = useState([]);
  const [selectedUsers, setSelectedUsers] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [campaignType, setCampaignType] = useState("email"); // 'email' or 'sms'
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [targetType, setTargetType] = useState("selected"); // 'selected', 'role', 'all'
  const [roleFilter, setRoleFilter] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const data = await fetchAllUsers();
      setUsers(data.users || []);
    } catch (err) {
      toast.error(err.message || "Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      (u.full_name || u.fullName || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (u.email || "").toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = !roleFilter || u.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const getTargetUsers = () => {
    if (targetType === "all") return users;
    if (targetType === "role") return users.filter((u) => u.role === roleFilter);
    return Array.from(selectedUsers).map((id) => users.find((u) => u.id === id || u._id === id)).filter(Boolean);
  };

  const handleSend = async () => {
    if (!subject.trim() || !message.trim()) {
      toast.error("Please fill in subject and message");
      return;
    }

    const targetUsers = getTargetUsers();
    if (targetUsers.length === 0) {
      toast.error("Please select at least one user");
      return;
    }

    if (!window.confirm(`Send ${campaignType.toUpperCase()} to ${targetUsers.length} user(s)?`)) {
      return;
    }

    setSending(true);
    try {
      if (campaignType === "email") {
        await sendMarketingEmail({
          subject,
          message,
          user_ids: targetUsers.map((u) => u.id || u._id),
        });
        toast.success(`Email sent to ${targetUsers.length} user(s)`);
      } else {
        await sendMarketingSMS({
          message,
          user_ids: targetUsers.map((u) => u.id || u._id),
        });
        toast.success(`SMS sent to ${targetUsers.length} user(s)`);
      }

      // Reset form
      setSubject("");
      setMessage("");
      setSelectedUsers(new Set());
    } catch (err) {
      toast.error(err.message || `Failed to send ${campaignType.toUpperCase()}`);
    } finally {
      setSending(false);
    }
  };

  const toggleUserSelection = (userId) => {
    const newSelected = new Set(selectedUsers);
    if (newSelected.has(userId)) {
      newSelected.delete(userId);
    } else {
      newSelected.add(userId);
    }
    setSelectedUsers(newSelected);
  };

  const selectAll = () => {
    if (selectedUsers.size === filteredUsers.length) {
      setSelectedUsers(new Set());
    } else {
      setSelectedUsers(new Set(filteredUsers.map((u) => u.id || u._id)));
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Marketing Campaigns"
        subtitle="Send emails and SMS to users"
        badge="Marketing"
      />

      {/* Campaign Type Selection */}
      <SectionCard title="Campaign Type" description="Choose email or SMS campaign">
        <div className="flex gap-4">
          <button
            onClick={() => setCampaignType("email")}
            className={`flex-1 flex items-center justify-center gap-3 px-6 py-4 rounded-xl border-2 transition-colors ${
              campaignType === "email"
                ? "border-[#0b6e4f] bg-[#0b6e4f]/10 dark:bg-[#0b6e4f]/20"
                : "border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500"
            }`}
          >
            <Mail className="w-5 h-5" />
            <span className="font-medium">Email Campaign</span>
          </button>
          <button
            onClick={() => setCampaignType("sms")}
            className={`flex-1 flex items-center justify-center gap-3 px-6 py-4 rounded-xl border-2 transition-colors ${
              campaignType === "sms"
                ? "border-[#0b6e4f] bg-[#0b6e4f]/10 dark:bg-[#0b6e4f]/20"
                : "border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500"
            }`}
          >
            <MessageSquare className="w-5 h-5" />
            <span className="font-medium">SMS Campaign</span>
          </button>
        </div>
      </SectionCard>

      {/* Campaign Form */}
      <SectionCard title="Campaign Details" description="Compose your message">
        <div className="space-y-4">
          {campaignType === "email" && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Subject *
              </label>
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Email subject"
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>
          )}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Message *
            </label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder={campaignType === "email" ? "Email message" : "SMS message"}
              rows={8}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
            {campaignType === "sms" && (
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                {message.length}/160 characters (SMS limit)
              </p>
            )}
          </div>
        </div>
      </SectionCard>

      {/* Target Selection */}
      <SectionCard title="Target Audience" description="Select who will receive this campaign">
        <div className="space-y-4">
          <div className="flex gap-4">
            <button
              onClick={() => setTargetType("selected")}
              className={`px-4 py-2 rounded-lg border transition-colors ${
                targetType === "selected"
                  ? "border-[#0b6e4f] bg-[#0b6e4f]/10 dark:bg-[#0b6e4f]/20"
                  : "border-gray-300 dark:border-gray-600"
              }`}
            >
              Selected Users ({selectedUsers.size})
            </button>
            <button
              onClick={() => setTargetType("role")}
              className={`px-4 py-2 rounded-lg border transition-colors ${
                targetType === "role"
                  ? "border-[#0b6e4f] bg-[#0b6e4f]/10 dark:bg-[#0b6e4f]/20"
                  : "border-gray-300 dark:border-gray-600"
              }`}
            >
              By Role
            </button>
            <button
              onClick={() => setTargetType("all")}
              className={`px-4 py-2 rounded-lg border transition-colors ${
                targetType === "all"
                  ? "border-[#0b6e4f] bg-[#0b6e4f]/10 dark:bg-[#0b6e4f]/20"
                  : "border-gray-300 dark:border-gray-600"
              }`}
            >
              All Users ({users.length})
            </button>
          </div>

          {targetType === "role" && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Select Role
              </label>
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="">All Roles</option>
                <option value="tenant">Tenant</option>
                <option value="landlord">Landlord</option>
                <option value="artisan">Artisan</option>
                <option value="admin">Admin</option>
              </select>
            </div>
          )}

          {targetType === "selected" && (
            <>
              {/* Search and Filter */}
              <div className="flex gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input
                    type="text"
                    placeholder="Search users..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
                <select
                  value={roleFilter}
                  onChange={(e) => setRoleFilter(e.target.value)}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="">All Roles</option>
                  <option value="tenant">Tenant</option>
                  <option value="landlord">Landlord</option>
                  <option value="artisan">Artisan</option>
                  <option value="admin">Admin</option>
                </select>
              </div>

              {/* User List */}
              <div className="border border-gray-200 dark:border-gray-700 rounded-lg max-h-96 overflow-y-auto">
                <div className="p-3 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    {filteredUsers.length} user(s)
                  </span>
                  <button
                    onClick={selectAll}
                    className="text-sm text-[#0b6e4f] dark:text-emerald-400 hover:underline"
                  >
                    {selectedUsers.size === filteredUsers.length ? "Deselect All" : "Select All"}
                  </button>
                </div>
                <div className="divide-y divide-gray-200 dark:divide-gray-700">
                  {filteredUsers.map((u) => {
                    const userId = u.id || u._id;
                    const isSelected = selectedUsers.has(userId);
                    return (
                      <label
                        key={userId}
                        className="flex items-center gap-3 p-3 hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleUserSelection(userId)}
                          className="w-4 h-4 text-[#0b6e4f] rounded"
                        />
                        <div className="flex-1">
                          <p className="font-medium text-gray-900 dark:text-white">{u.full_name || u.fullName}</p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">{u.email}</p>
                        </div>
                        <span className="text-xs px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded capitalize">
                          {u.role}
                        </span>
                      </label>
                    );
                  })}
                </div>
              </div>
            </>
          )}
        </div>
      </SectionCard>

      {/* Send Button */}
      <div className="flex justify-end gap-4">
        <Button variant="outline" onClick={() => {
          setSubject("");
          setMessage("");
          setSelectedUsers(new Set());
        }}>
          Clear
        </Button>
        <Button onClick={handleSend} disabled={sending || !subject.trim() || !message.trim()}>
          <Send className="w-4 h-4 mr-2" />
          {sending ? "Sending..." : `Send ${campaignType.toUpperCase()} to ${getTargetUsers().length} User(s)`}
        </Button>
      </div>
    </div>
  );
}

