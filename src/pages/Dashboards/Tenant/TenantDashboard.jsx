import { useEffect, useState } from "react";
import { fetchTenantRentals } from "@/services/tenantService";
import TN_MyRentals from "./components/TN_MyRentals";
import DashboardLayout from "@/components/layout/DashboardLayout";

export default function TenantDashboard() {
  const [summary, setSummary] = useState({ upcomingDue: 0, dueCount: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let isMounted = true;

    const loadSummary = async () => {
      try {
        setLoading(true);
        setError("");

        const rentals = await fetchTenantRentals(); // Now returns [] on 404

        if (!isMounted) return;

        const upcoming = rentals.reduce((acc, r) => acc + Number(r.nextDueAmount || 0), 0);
        const dueCount = rentals.filter(r => Number(r.nextDueAmount || 0) > 0).length;

        setSummary({ upcomingDue: upcoming, dueCount });
      } catch (err) {
        if (isMounted) setError(err.message || "Failed to load dashboard");
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    loadSummary();
    return () => { isMounted = false; };
  }, []);

  return (
    <DashboardLayout>
    <div className="p-6 max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <header>
        <h1 className="text-2xl font-bold text-[#0f1724]">Welcome Back!</h1>
        <p className="text-gray-600 mt-1">Here’s your rental overview as of today.</p>
      </header>

      {/* Error Alert */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
          {error}
        </div>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        <SummaryCard title="Upcoming Due" value={loading ? null : `₵${summary.upcomingDue.toFixed(2)}`} loading={loading} />
        <SummaryCard title="Payments Due" value={loading ? null : summary.dueCount} loading={loading} />
        <SupportCard />
      </div>

      {/* My Rentals */}
      <section>
        <TN_MyRentals />
      </section>
    </div>
    </DashboardLayout>
  );
}

// Reusable Card Components
function SummaryCard({ title, value, loading }) {
  return (
    <div className="bg-white border rounded-lg p-5 shadow-sm">
      <p className="text-sm text-gray-500">{title}</p>
      {loading ? (
        <div className="mt-2 h-8 w-28 bg-gray-200 rounded animate-pulse" />
      ) : (
        <p className="text-2xl font-bold text-[#0f1724]">{value}</p>
      )}
    </div>
  );
}

function SupportCard() {
  return (
    <div className="bg-linear-to-r from-[#0b6e4f] to-[#095c42] text-white rounded-lg p-5 shadow-sm flex items-center justify-between">
      <div>
        <p className="text-sm opacity-90">Need Help?</p>
        <p className="text-lg font-medium">Contact Support</p>
      </div>
      <span className="text-3xl">Help</span>
    </div>
  );
}