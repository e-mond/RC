import React, { useEffect, useState } from "react";
import { fetchArtisanTasks, getEarningsSummary } from "@/services/artisanService";
import { Wrench, DollarSign, Calendar, MessageSquare, Clock, CheckCircle } from "lucide-react";
import PageHeader from "@/modules/dashboard/PageHeader";
import MetricGrid from "@/modules/dashboard/MetricGrid";
import ActionGrid from "@/modules/dashboard/ActionGrid";
import SectionCard from "@/modules/dashboard/SectionCard";

export default function ArtisanDashboard() {
  const [stats, setStats] = useState({
    pendingTasks: 0,
    inProgressTasks: 0,
    completedTasks: 0,
    totalEarnings: 0,
    pendingEarnings: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        setLoading(true);
        const [tasksRes, earningsRes] = await Promise.all([
          fetchArtisanTasks().catch(() => ({ tasks: [] })),
          getEarningsSummary().catch(() => ({ totalEarnings: 0, pendingEarnings: 0 })),
        ]);

        if (mounted) {
          const tasks = tasksRes.tasks || [];
          setStats({
            pendingTasks: tasks.filter((t) => t.status === "pending").length,
            inProgressTasks: tasks.filter((t) => t.status === "in_progress").length,
            completedTasks: tasks.filter((t) => t.status === "completed").length,
            totalEarnings: earningsRes.totalEarnings || 0,
            pendingEarnings: earningsRes.pendingEarnings || 0,
          });
        }
      } catch (err) {
        console.error("loadDashboard:", err);
        if (mounted) setError(err.message || "Failed to load dashboard");
      } finally {
        if (mounted) setLoading(false);
      }
    };
    load();
    return () => {
      mounted = false;
    };
  }, []);

  const metrics = [
    {
      label: "Pending Tasks",
      value: stats.pendingTasks,
      icon: Clock,
      href: "/artisan/tasks?status=pending",
      accent: "amber",
      isLoading: loading,
    },
    {
      label: "In Progress",
      value: stats.inProgressTasks,
      icon: Wrench,
      href: "/artisan/tasks?status=in_progress",
      accent: "blue",
      isLoading: loading,
    },
    {
      label: "Completed",
      value: stats.completedTasks,
      icon: CheckCircle,
      href: "/artisan/tasks?status=completed",
      accent: "emerald",
      isLoading: loading,
    },
    {
      label: "Total Earnings",
      value: loading ? null : `₵${stats.totalEarnings.toLocaleString(undefined, { minimumFractionDigits: 2 })}`,
      icon: DollarSign,
      href: "/artisan/earnings",
      accent: "emerald",
      isLoading: loading,
    },
    {
      label: "Pending Payout",
      value: loading ? null : `₵${stats.pendingEarnings.toLocaleString(undefined, { minimumFractionDigits: 2 })}`,
      icon: DollarSign,
      href: "/artisan/earnings",
      accent: "amber",
      isLoading: loading,
    },
  ];

  const actions = [
    { title: "My Tasks", description: "View and manage active jobs", icon: Wrench, href: "/artisan/tasks", tone: "blue" },
    { title: "Schedule", description: "Your upcoming bookings", icon: Calendar, href: "/artisan/schedule", tone: "purple" },
    { title: "Messages", description: "Chat with clients", icon: MessageSquare, href: "/artisan/messages", tone: "emerald" },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 space-y-10">
        {/* Hero Header */}
        <PageHeader
          title="Artisan Dashboard"
          subtitle="Manage jobs, track earnings, and stay connected with clients"
          badge="Service Partner"
          align="start"
        />

        {/* Error Alert */}
        {error && (
          <div className="rounded-2xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 p-6 text-red-700 dark:text-red-300 flex items-center gap-3">
            <AlertCircle className="w-6 h-6 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Metrics Grid - Fully Responsive */}
        <MetricGrid
          items={metrics}
          columns="grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5"
          className="gap-6"
        />

        {/* Primary Actions */}
        <SectionCard
          title="Quick Actions"
          description="Jump straight into your daily workflow"
          className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl shadow-sm dark:shadow-none"
        >
          <ActionGrid
            items={actions}
            columns="grid-cols-1 sm:grid-cols-3"
          />
        </SectionCard>

        {/* Quick Links Grid */}
        <SectionCard
          title="Tools & Resources"
          description="Everything you need in one place"
          className="bg-linear-to-br from-[#0b6e4f]/5 to-emerald-600/5 dark:from-[#0b6e4f]/10 dark:to-emerald-900/10 border border-emerald-200/50 dark:border-emerald-800/50 rounded-2xl"
        >
          <ActionGrid
            columns="grid-cols-2 sm:grid-cols-2 lg:grid-cols-4"
            items={[
              { title: "All Tasks", description: "Full task queue", icon: Wrench, href: "/artisan/tasks", tone: "blue" },
              { title: "Earnings", description: "Payouts & history", icon: DollarSign, href: "/artisan/earnings", tone: "emerald" },
              { title: "Calendar", description: "Booked dates", icon: Calendar, href: "/artisan/schedule", tone: "purple" },
              { title: "Inbox", description: "Client messages", icon: MessageSquare, href: "/artisan/messages", tone: "slate" },
            ]}
          />
        </SectionCard>
      </div>
    </div>
  );
}