// routes/FeatureProtectedRoute.jsx
import { Navigate } from "react-router-dom";
import { useFeatureAccess } from "@/context/FeatureAccessContext";

export default function FeatureProtectedRoute({ feature, requiredFeature, fallback = "/upgrade", children }) {
  const { can } = useFeatureAccess();
  const key = feature || requiredFeature;

  if (key && !can(key)) {
    return <Navigate to={fallback} replace />;
  }

  return children;
}
