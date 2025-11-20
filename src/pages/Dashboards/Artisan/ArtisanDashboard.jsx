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
    { label: "Pending Tasks", value: stats.pendingTasks, icon: Clock, href: "/artisan/tasks?status=pending", accent: "amber", isLoading: loading },
    { label: "In Progress", value: stats.inProgressTasks, icon: Wrench, href: "/artisan/tasks?status=in_progress", accent: "blue", isLoading: loading },
    { label: "Completed", value: stats.completedTasks, icon: CheckCircle, href: "/artisan/tasks?status=completed", accent: "emerald", isLoading: loading },
    {
      label: "Total Earnings",
      value: loading ? null : `₵${stats.totalEarnings.toLocaleString()}`,
      icon: DollarSign,
      href: "/artisan/earnings",
      accent: "emerald",
      isLoading: loading,
    },
    {
      label: "Pending",
      value: loading ? null : `₵${stats.pendingEarnings.toLocaleString()}`,
      icon: DollarSign,
      href: "/artisan/earnings",
      accent: "amber",
      isLoading: loading,
    },
  ];

  const actions = [
    { title: "My Tasks", description: "Manage active assignments", icon: Wrench, href: "/artisan/tasks", tone: "blue" },
    { title: "Schedule", description: "Upcoming bookings", icon: Calendar, href: "/artisan/schedule", tone: "purple" },
    { title: "Messages", description: "Chat with clients", icon: MessageSquare, href: "/artisan/messages", tone: "emerald" },
  ];

  return (
    <div className="space-y-8">
      <PageHeader title="Artisan Dashboard" subtitle="Stay on top of jobs, finances, and availability" badge="Service Partner" />

      {error && <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</div>}

      <MetricGrid items={metrics} columns="grid-cols-1 sm:grid-cols-2 xl:grid-cols-5" />
      <ActionGrid items={actions} />

      <SectionCard title="Quick Links" description="Jump directly into frequent tools">
        <ActionGrid
          columns="grid-cols-1 sm:grid-cols-2 lg:grid-cols-4"
          items={[
            { title: "Tasks", description: "Manage queue", icon: Wrench, href: "/artisan/tasks", tone: "blue" },
            { title: "Earnings", description: "View payouts", icon: DollarSign, href: "/artisan/earnings", tone: "emerald" },
            { title: "Schedule", description: "Upcoming work", icon: Calendar, href: "/artisan/schedule", tone: "purple" },
            { title: "Messages", description: "Chat center", icon: MessageSquare, href: "/artisan/messages", tone: "slate" },
          ]}
        />
      </SectionCard>
    </div>
  );
}
