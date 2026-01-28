import { useEffect, useState } from "react";
import { fetchTenantRentals, getFavorites, getMaintenanceRequests, getScheduledBookings } from "@/services/tenantService";
import TN_MyRentals from "./components/TN_MyRentals";
import UpcomingBookingsList from "./components/UpcomingBookingsList";
import RecentNotificationsWidget from "@/components/Notifications/RecentNotificationsWidget";
import { Heart, Wrench, History, DollarSign, Calendar } from "lucide-react";
import { useFeatureAccess } from "@/context/FeatureAccessContext";
import PageHeader from "@/modules/dashboard/PageHeader";
import MetricGrid from "@/modules/dashboard/MetricGrid";
import ActionGrid from "@/modules/dashboard/ActionGrid";
import SectionCard from "@/modules/dashboard/SectionCard";
import UpgradeBanner from "@/components/common/UpgradeBanner";
import RecommendationsSection from "@/components/ai/RecommendationsSection";

export default function TenantDashboard() {
  const { isPremium } = useFeatureAccess();
  const [summary, setSummary] = useState({
    upcomingDue: 0,
    dueCount: 0,
    favoritesCount: 0,
    maintenanceCount: 0,
    scheduledBookingsCount: 0,
  });
  const [scheduledBookings, setScheduledBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let isMounted = true;

    const loadSummary = async () => {
      try {
        setLoading(true);
        setError("");

        const [rentals, favorites, maintenance, bookings] = await Promise.all([
          fetchTenantRentals(),
          getFavorites().catch(() => []),
          isPremium ? getMaintenanceRequests().catch(() => []) : Promise.resolve([]),
          getScheduledBookings().catch(() => []),
        ]);

        if (!isMounted) return;

        const upcoming = rentals.reduce((acc, r) => acc + Number(r.nextDueAmount || 0), 0);
        const dueCount = rentals.filter((r) => Number(r.nextDueAmount || 0) > 0).length;

        setSummary({
          upcomingDue: upcoming,
          dueCount,
          favoritesCount: Array.isArray(favorites) ? favorites.length : 0,
          maintenanceCount: Array.isArray(maintenance) ? maintenance.length : 0,
          scheduledBookingsCount: Array.isArray(bookings) ? bookings.length : 0,
        });
        setScheduledBookings(Array.isArray(bookings) ? bookings : []);
      } catch (err) {
        if (isMounted) {
          const { getErrorMessage } = await import("@/utils/errorMessages");
          setError(getErrorMessage(err, "Failed to load dashboard data. Please try again."));
        }
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
      label: "Scheduled Bookings",
      value: loading ? null : summary.scheduledBookingsCount,
      icon: Calendar,
      accent: "green",
      href: "/tenant/bookings",
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
      title: "My Bookings",
      description: "View and manage your scheduled viewings",
      icon: Calendar,
      href: "/tenant/bookings",
      tone: "green",
    },
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
      {/* Upgrade Banner */}
      <UpgradeBanner
        message="Unlock maintenance requests, payment tracking, and ad-free browsing"
        position="top"
        dismissible={true}
      />

      <PageHeader
        title="Welcome back"
        subtitle="Here's your rental overview as of today."
        badge={isPremium ? "Premium Tenant" : null}
      />

      {error && (
        <div className="rounded-xl border border-red-200 dark:border-red-900/50 bg-red-50 dark:bg-red-900/20 p-4 text-sm text-red-700 dark:text-red-400">
          {error}
        </div>
      )}

      <MetricGrid items={metricCards} />

      <ActionGrid items={actions} />

     

      {/* Scheduled Bookings Overview */}
      <SectionCard
        title="Upcoming Bookings"
        description="Your scheduled property viewings"
        className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl shadow-sm dark:shadow-none"
      >
        <UpcomingBookingsList bookings={scheduledBookings} loading={loading} />
      </SectionCard>

      <SectionCard
        title="My Rentals"
        description="Active leases and upcoming payments"
        className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl shadow-sm dark:shadow-none"
      >
        <TN_MyRentals />
      </SectionCard>

         {/* Recent Notifications */}
      <RecentNotificationsWidget limit={5} />
      {/* AI Recommendations */}
      <RecommendationsSection
        type="properties"
        title="Recommended for you"
        limit={6}
      />
    </div>
  );
}