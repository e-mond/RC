// src/components/common/PropertyApprovalBanner.jsx
/**
 * PropertyApprovalBanner
 * 
 * Banner component to show property approval status and pending approval message.
 * Used in: PropertyDetailsPage, PropertiesPage (for landlords)
 * 
 * Props:
 * - status: string (pending, published, rejected, etc.)
 * - isLandlord: boolean (whether current user is the property owner)
 */

import { AlertCircle, CheckCircle, XCircle, Clock } from "lucide-react";

export default function PropertyApprovalBanner({ status, isLandlord = false }) {
  if (!status || status === "published" || status === "active" || status === "available") {
    return null; // Don't show banner for approved/published properties
  }

  const statusConfig = {
    pending: {
      icon: Clock,
      bgColor: "bg-amber-50 dark:bg-amber-900/20",
      borderColor: "border-amber-200 dark:border-amber-800",
      textColor: "text-amber-800 dark:text-amber-300",
      iconColor: "text-amber-600 dark:text-amber-400",
      title: "Pending Approval",
      message: isLandlord
        ? "Your property is pending admin approval. It will be visible to tenants once approved."
        : "This property is pending admin approval.",
    },
    rejected: {
      icon: XCircle,
      bgColor: "bg-red-50 dark:bg-red-900/20",
      borderColor: "border-red-200 dark:border-red-800",
      textColor: "text-red-800 dark:text-red-300",
      iconColor: "text-red-600 dark:text-red-400",
      title: "Rejected",
      message: isLandlord
        ? "Your property listing was rejected. Please review the feedback and update your listing."
        : "This property listing was rejected.",
    },
    draft: {
      icon: AlertCircle,
      bgColor: "bg-gray-50 dark:bg-gray-800",
      borderColor: "border-gray-200 dark:border-gray-700",
      textColor: "text-gray-800 dark:text-gray-300",
      iconColor: "text-gray-600 dark:text-gray-400",
      title: "Draft",
      message: isLandlord
        ? "This property is saved as a draft. Submit it for approval when ready."
        : "This property is a draft.",
    },
  };

  const config = statusConfig[status] || statusConfig.pending;
  const Icon = config.icon;

  return (
    <div
      className={`${config.bgColor} ${config.borderColor} ${config.textColor} border rounded-lg p-4 flex items-start gap-3`}
    >
      <Icon className={`w-5 h-5 ${config.iconColor} mt-0.5 flex-shrink-0`} />
      <div className="flex-1">
        <p className="font-medium mb-1">{config.title}</p>
        <p className="text-sm">{config.message}</p>
      </div>
    </div>
  );
}

