// utils/featureAccess.js

const PLAN_ORDER = ["free", "premium", "system"];

export const FEATURE_MATRIX = {
  PROPERTY_CRUD: { minPlan: "free", roles: ["landlord"] },
  BOOKING_CALENDAR: { minPlan: "free", roles: ["landlord"] },
  AMENITIES_LIST: { minPlan: "free", roles: ["landlord"] },
  BASIC_NOTIFICATIONS: { minPlan: "free", roles: ["tenant", "landlord", "artisan"] },

  TENANT_PAYMENTS: { minPlan: "premium", roles: ["tenant"] },
  TENANT_MAINTENANCE: { minPlan: "premium", roles: ["tenant"] },
  TENANT_HISTORY: { minPlan: "premium", roles: ["tenant"] },

  LANDLORD_ANALYTICS: { minPlan: "premium", roles: ["landlord"] },
  TENANT_SCREENING: { minPlan: "premium", roles: ["landlord"] },
  DIGITAL_RENT_COLLECTION: { minPlan: "premium", roles: ["landlord"] },
  AUTO_INVOICING: { minPlan: "premium", roles: ["landlord"] },
  REVENUE_ANALYTICS: { minPlan: "premium", roles: ["landlord"] },
  AUTO_RENEW_CONTRACT: { minPlan: "premium", roles: ["landlord"] },
  ADVERTISEMENT_MANAGER: { minPlan: "premium", roles: ["landlord"] },

  ARTISAN_EARNINGS: { minPlan: "free", roles: ["artisan"] },
  ARTISAN_MESSAGES: { minPlan: "free", roles: ["artisan"] },

  ADMIN_INSIGHTS: { minPlan: "system", roles: ["admin", "super-admin"] },
  ADMIN_APPROVALS: { minPlan: "system", roles: ["admin", "super-admin"] },
  SUPERADMIN_MOCK_EDITOR: { minPlan: "system", roles: ["super-admin"] },
};

const planRank = (plan) => {
  const idx = PLAN_ORDER.indexOf(plan);
  return idx === -1 ? 0 : idx;
};

export const canUseFeature = (plan = "free", role = "tenant", featureKey) => {
  const rule = FEATURE_MATRIX[featureKey];
  if (!rule) return true;

  const normalizedRole = role.toLowerCase();
  const allowedRoles = rule.roles?.map((r) => r.toLowerCase());
  if (allowedRoles && !allowedRoles.includes(normalizedRole)) {
    return false;
  }

  return planRank(plan) >= planRank(rule.minPlan || "free");
};

export const listFeaturesForRole = (role = "tenant", plan = "free") =>
  Object.keys(FEATURE_MATRIX).filter((feature) => canUseFeature(plan, role, feature));
