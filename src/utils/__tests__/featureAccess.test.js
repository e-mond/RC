import { describe, it, expect } from "vitest";
import { FEATURE_MATRIX, canUseFeature, listFeaturesForRole } from "../featureAccess";

describe("featureAccess FEATURE_MATRIX", () => {
  it("exposes expected core feature keys", () => {
    expect(FEATURE_MATRIX.direct_messaging).toBeDefined();
    expect(FEATURE_MATRIX.landlord_advanced_analytics).toBeDefined();
    expect(FEATURE_MATRIX.advertisement_manager).toBeDefined();
  });
});

describe("canUseFeature", () => {
  it("allows free tenant to use basic notifications but not premium-only features", () => {
    expect(canUseFeature("free", "tenant", "basic_notifications")).toBe(true);
    expect(canUseFeature("free", "tenant", "tenant_payments")).toBe(false);
    expect(canUseFeature("free", "tenant", "direct_messaging")).toBe(false);
  });

  it("allows premium tenant to access tenant_payments and direct_messaging", () => {
    expect(canUseFeature("premium", "tenant", "tenant_payments")).toBe(true);
    expect(canUseFeature("premium", "tenant", "direct_messaging")).toBe(true);
  });

  it("allows landlord premium analytics only on premium plan", () => {
    expect(canUseFeature("free", "landlord", "landlord_advanced_analytics")).toBe(false);
    expect(canUseFeature("premium", "landlord", "landlord_advanced_analytics")).toBe(true);
  });

  it("treats unknown feature keys as non-blocking", () => {
    expect(canUseFeature("free", "tenant", "non_existent_feature")).toBe(true);
  });
});

describe("listFeaturesForRole", () => {
  it("returns a non-empty list for a known role/plan", () => {
    const tenantFree = listFeaturesForRole("tenant", "free");
    const tenantPremium = listFeaturesForRole("tenant", "premium");

    expect(Array.isArray(tenantFree)).toBe(true);
    expect(tenantFree.length).toBeGreaterThan(0);
    expect(tenantPremium.length).toBeGreaterThan(tenantFree.length);
  });
});


