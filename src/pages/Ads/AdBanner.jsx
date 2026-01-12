// src/pages/Ads/AdBanner.jsx
// Role-aware ad banner used across dashboards.
// - Tenants on the free plan see upgrade messaging.
// - Landlords and artisans (both plans) see promotional copy for boost/ads.

import { useFeatureAccess } from "@/context/FeatureAccessContext";

export default function AdBanner({ position = "bottom" }) {
  const { role, isPremium } = useFeatureAccess();

  // Only show ads for frontline roles; admins/super-admins never see consumer ads
  if (!["tenant", "landlord", "artisan"].includes(role)) return null;

  const isTenant = role === "tenant";

  // Premium tenants get an ad-free experience
  if (isTenant && isPremium) return null;

  const heading = isTenant ? "Smart Matches Sponsored" : "Promote Your Listings";
  const body = isTenant
    ? "Some results are promoted. Upgrade to Premium for a fully ad‑free search experience."
    : "Boost visibility with sponsored placements and featured cards in search and dashboards.";

  return (
    <div className={`w-full my-6 ${position === "top" ? "mb-10" : "mt-10"}`} aria-label="Promotional banner">
      <div className="bg-linear-to-r from-purple-100 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30 rounded-2xl px-6 py-5 text-center border border-purple-200 dark:border-purple-700 shadow-sm">
        <h3 className="text-lg sm:text-xl font-bold text-purple-800 dark:text-purple-200 mb-2">
          {heading}
        </h3>
        <p className="text-sm sm:text-base text-purple-700 dark:text-purple-300 max-w-2xl mx-auto">
          {body}
        </p>
      </div>
    </div>
  );
}