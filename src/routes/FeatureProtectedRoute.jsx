import { Navigate, useLocation } from "react-router-dom";
import { useFeatureAccess } from "@/context/FeatureAccessContext";

export default function FeatureProtectedRoute({
  feature,
  requiredFeature,
  fallback = "/upgrade",
  children,
  redirectQuery = true, // preserve original path in query string
}) {
  const { can } = useFeatureAccess();
  const location = useLocation();

  const featureKey = feature || requiredFeature;

  // Development warning
  if (!featureKey) {
    console.warn("FeatureProtectedRoute used without a feature key");
    return children;
  }

  if (!can(featureKey)) {
    const searchParams = redirectQuery
      ? `?from=${encodeURIComponent(location.pathname + location.search)}&reason=${featureKey}`
      : "";

    return <Navigate to={fallback + searchParams} replace />;
  }

  return children;
}