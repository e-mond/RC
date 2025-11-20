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
      can: (featureKey) => managementOverride || canUseFeature(subscription, role, featureKey),
    };
  }, [user, plan]);

  return <FeatureAccessContext.Provider value={derived}>{children}</FeatureAccessContext.Provider>;
};

export const useFeatureAccess = () => useContext(FeatureAccessContext);
export default FeatureAccessContext;
