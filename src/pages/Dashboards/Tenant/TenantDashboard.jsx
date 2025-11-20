import { useEffect, useState } from "react";
import { fetchTenantRentals, getFavorites, getMaintenanceRequests } from "@/services/tenantService";
import TN_MyRentals from "./components/TN_MyRentals";
import { Heart, Wrench, History, DollarSign } from "lucide-react";
import { useFeatureAccess } from "@/context/FeatureAccessContext";
import PageHeader from "@/modules/dashboard/PageHeader";
import MetricGrid from "@/modules/dashboard/MetricGrid";
import ActionGrid from "@/modules/dashboard/ActionGrid";
import SectionCard from "@/modules/dashboard/SectionCard";

export default function TenantDashboard() {
  const { isPremium } = useFeatureAccess();
  const [summary, setSummary] = useState({
    upcomingDue: 0,
    dueCount: 0,
    favoritesCount: 0,
    maintenanceCount: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let isMounted = true;

    const loadSummary = async () => {
      try {
        setLoading(true);
        setError("");

        const [rentals, favorites, maintenance] = await Promise.all([
          fetchTenantRentals(),
          getFavorites().catch(() => []),
          isPremium ? getMaintenanceRequests().catch(() => []) : Promise.resolve([]),
        ]);

        if (!isMounted) return;

        const upcoming = rentals.reduce((acc, r) => acc + Number(r.nextDueAmount || 0), 0);
        const dueCount = rentals.filter((r) => Number(r.nextDueAmount || 0) > 0).length;

        setSummary({
          upcomingDue: upcoming,
          dueCount,
          favoritesCount: Array.isArray(favorites) ? favorites.length : 0,
          maintenanceCount: Array.isArray(maintenance) ? maintenance.length : 0,
        });
      } catch (err) {
        if (isMounted) setError(err.message || "Failed to load dashboard");
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    loadSummary();
    return () => {
      isMounted = false;
    };
  }, [isPremium]);

  const metricCards = [
    {
      label: "Upcoming Due",
      value: loading ? null : `₵${summary.upcomingDue.toFixed(2)}`,
      icon: DollarSign,
      accent: "emerald",
      isLoading: loading,
    },
    {
      label: "Payments Due",
      value: loading ? null : summary.dueCount,
      icon: DollarSign,
      accent: "blue",
      isLoading: loading,
    },
    {
      label: "Favorites",
      value: loading ? null : summary.favoritesCount,
      icon: Heart,
      accent: "rose",
      href: "/tenant/wishlist",
      isLoading: loading,
    },
    ...(isPremium
      ? [
          {
            label: "Maintenance",
            value: loading ? null : summary.maintenanceCount,
            icon: Wrench,
            accent: "amber",
            href: "/tenant/maintenance",
            isLoading: loading,
          },
        ]
      : []),
  ];

  const actions = [
    {
      title: "My Wishlist",
      description: "View your saved properties",
      icon: Heart,
      href: "/tenant/wishlist",
      tone: "rose",
    },
    {
      title: "Rental History",
      description: "Generate references & view past stays",
      icon: History,
      href: "/tenant/history",
      tone: "blue",
    },
    ...(isPremium
      ? [
          {
            title: "Maintenance",
            description: "Track premium maintenance requests",
            icon: Wrench,
            href: "/tenant/maintenance",
            tone: "amber",
          },
        ]
      : []),
  ];

  return (
    <div className="p-6 space-y-8">
      <PageHeader
        title="Welcome back"
        subtitle="Here’s your rental overview as of today."
        badge={isPremium ? "Premium Tenant" : null}
      />

      {error && (
        <div className="rounded-xl border border-red-200 dark:border-red-900/50 bg-red-50 dark:bg-red-900/20 p-4 text-sm text-red-700 dark:text-red-400">
          {error}
        </div>
      )}

      <MetricGrid items={metricCards} />

      <ActionGrid items={actions} />

      <SectionCard
        title="My Rentals"
        description="Active leases and upcoming payments"
        className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl shadow-sm dark:shadow-none"
      >
        <TN_MyRentals />
      </SectionCard>
    </div>
  );
}