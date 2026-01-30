import { createContext, useContext, useMemo } from "react";
import { useAuthStore } from "@/stores/authStore";
import { useFeatureStore } from "@/stores/featureStore";
import { canUseFeature, listFeaturesForRole } from "@/utils/featureAccess";

const FeatureAccessContext = createContext({
  plan: "free",
  role: "tenant",
  isPremium: false,
  features: [],
  can: () => false,
});

export const FeatureAccessProvider = ({ children }) => {
  const user = useAuthStore((state) => state.user);
  const plan = useFeatureStore((state) => state.plan);

  const derived = useMemo(() => {
    const role = user?.role?.toLowerCase() || "tenant";
    const subscription = (user?.subscription || plan || "free").toLowerCase();
    const managementOverride = role === "admin" || role === "super-admin";

    return {
      plan: subscription,
      role,
      isPremium: subscription === "premium" || managementOverride,
      features: listFeaturesForRole(role, subscription),
      can: (featureKey) => {
        if (!featureKey) return true; // safety for optional features
        return managementOverride || canUseFeature(subscription, role, featureKey);
      },
    };
  }, [user, plan]);

  return <FeatureAccessContext.Provider value={derived}>{children}</FeatureAccessContext.Provider>;
};

// eslint-disable-next-line react-refresh/only-export-components
export const useFeatureAccess = () => {
  const context = useContext(FeatureAccessContext);
  if (!context) {
    throw new Error("useFeatureAccess must be used within FeatureAccessProvider");
  }
  return context;
};

export default FeatureAccessContext;