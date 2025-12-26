// src/config/subscriptionConfig.js
export const SUBSCRIPTION_CONFIG = {
  premiumPrice: {
    monthly: 29, // GHS
    currency: "GHS",
    display: "GHS 29 / month",
  },

  featuresByRole: {
    tenant: [
      "Unlimited property searches & saved searches",
      "Priority listing in search results",
      "Advanced filters (price range, amenities, etc.)",
      "Direct chat with landlords/artisans",
      "View landlord ratings & reviews",
      "No ads",
    ],
    landlord: [
      "Unlimited property listings",
      "Featured listings (top of search)",
      "Advanced analytics & visitor insights",
      "Priority support",
      "Custom branding on listings",
      "Bulk upload properties",
      "No commission fees on inquiries",
    ],
    artisan: [
      "Unlimited service listings",
      "Featured in artisan directory",
      "Lead generation dashboard",
      "Customer reviews & ratings system",
      "Priority job requests",
      "Portfolio showcase with multiple photos",
      "Direct booking calendar",
    ],
    // admin & super-admin get everything for free — no premium needed
  },
};