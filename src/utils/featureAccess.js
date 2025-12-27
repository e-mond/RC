// utils/featureAccess.js
// Central feature matrix for freemium vs premium behaviour across roles.
// All gating decisions should flow through this file so that FeatureAccessContext
// and FeatureProtectedRoute remain the single source of truth.

const PLAN_ORDER = ["free", "premium", "system"];

/**
 * FEATURE_MATRIX
 * - Keys are stable feature identifiers consumed via useFeatureAccess().can(key)
 * - minPlan: lowest subscription required ("free" | "premium" | "system")
 * - roles: which roles the feature applies to
 *
 * NOTE: Keys are intentionally lower_snake_case so components can use
 * human‑readable strings like "direct_messaging" without worrying about
 * internal casing.
 */
export const FEATURE_MATRIX = {
  // ------- Cross‑role basics -------
  basic_notifications: { minPlan: "free", roles: ["tenant", "landlord", "artisan"] },

  // ------- Tenant -------
  tenant_payments: { minPlan: "premium", roles: ["tenant"] },
  tenant_maintenance: { minPlan: "premium", roles: ["tenant"] },
  tenant_history: { minPlan: "premium", roles: ["tenant"] },
  // Encrypted direct chat (tenants need Premium; other roles are always allowed)
  direct_messaging: { minPlan: "premium", roles: ["tenant"] },

  // ------- Landlord -------
  property_crud: { minPlan: "free", roles: ["landlord"] },
  booking_calendar: { minPlan: "free", roles: ["landlord"] },
  amenities_list: { minPlan: "free", roles: ["landlord"] },

  landlord_advanced_analytics: { minPlan: "premium", roles: ["landlord"] },
  tenant_screening: { minPlan: "premium", roles: ["landlord"] },
  digital_rent_collection: { minPlan: "premium", roles: ["landlord"] },
  auto_invoicing: { minPlan: "premium", roles: ["landlord"] },
  auto_renew_contract: { minPlan: "premium", roles: ["landlord"] },
  advertisement_manager: { minPlan: "premium", roles: ["landlord", "artisan"] },

  // ------- Artisan -------
  artisan_earnings: { minPlan: "free", roles: ["artisan"] },
  artisan_messages: { minPlan: "free", roles: ["artisan"] },

  // ------- Admin / Super Admin (system‑level, always on for those roles) -------
  admin_insights: { minPlan: "system", roles: ["admin", "super-admin"] },
  admin_approvals: { minPlan: "system", roles: ["admin", "super-admin"] },
  superadmin_mock_editor: { minPlan: "system", roles: ["super-admin"] },
};

const planRank = (plan) => {
  const idx = PLAN_ORDER.indexOf(plan);
  return idx === -1 ? 0 : idx;
};

/**
 * canUseFeature
 * - Returns true if the given role on the given plan may access featureKey.
 */
export const canUseFeature = (plan = "free", role = "tenant", featureKey) => {
  const rule = FEATURE_MATRIX[featureKey];
  if (!rule) return true; // unknown feature => do not block

  const normalizedRole = role.toLowerCase();
  const allowedRoles = rule.roles?.map((r) => r.toLowerCase());
  if (allowedRoles && !allowedRoles.includes(normalizedRole)) {
    return false;
  }

  return planRank(plan) >= planRank(rule.minPlan || "free");
};

/**
 * listFeaturesForRole
 * - Convenience helper used by FeatureAccessContext to surface
 *   all enabled features for a given role/plan.
 */
export const listFeaturesForRole = (role = "tenant", plan = "free") =>
  Object.keys(FEATURE_MATRIX).filter((feature) => canUseFeature(plan, role, feature));
