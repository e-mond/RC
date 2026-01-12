/**
 * VerificationBadge Component
 * 
 * Displays user verification/background check status.
 * Shows different badges for verified, pending, and unverified states.
 * 
 * Props:
 * - status: 'verified' | 'pending' | 'unverified' | 'rejected'
 * - type: 'background_check' | 'identity' | 'payment' (optional)
 * - size: 'sm' | 'md' | 'lg'
 * - showLabel: boolean (show text label)
 * - className: string (additional classes)
 */

import { Shield, CheckCircle, Clock, XCircle, AlertCircle } from "lucide-react";

export default function VerificationBadge({
  status = "unverified",
  type = "background_check",
  size = "md",
  showLabel = true,
  className = "",
}) {
  const statusConfig = {
    verified: {
      icon: CheckCircle,
      color: "text-green-600 dark:text-green-400",
      bg: "bg-green-50 dark:bg-green-900/20",
      border: "border-green-200 dark:border-green-800",
      label: "Verified",
    },
    pending: {
      icon: Clock,
      color: "text-amber-600 dark:text-amber-400",
      bg: "bg-amber-50 dark:bg-amber-900/20",
      border: "border-amber-200 dark:border-amber-800",
      label: "Pending Verification",
    },
    unverified: {
      icon: AlertCircle,
      color: "text-gray-500 dark:text-gray-400",
      bg: "bg-gray-50 dark:bg-gray-800",
      border: "border-gray-200 dark:border-gray-700",
      label: "Not Verified",
    },
    rejected: {
      icon: XCircle,
      color: "text-red-600 dark:text-red-400",
      bg: "bg-red-50 dark:bg-red-900/20",
      border: "border-red-200 dark:border-red-800",
      label: "Verification Rejected",
    },
  };

  const sizeClasses = {
    sm: "w-3 h-3",
    md: "w-4 h-4",
    lg: "w-5 h-5",
  };

  const paddingClasses = {
    sm: "px-1.5 py-0.5",
    md: "px-2 py-1",
    lg: "px-2.5 py-1.5",
  };

  const textSizeClasses = {
    sm: "text-xs",
    md: "text-sm",
    lg: "text-base",
  };

  const config = statusConfig[status] || statusConfig.unverified;
  const Icon = config.icon;
  const iconSize = sizeClasses[size] || sizeClasses.md;
  const padding = paddingClasses[size] || paddingClasses.md;
  const textSize = textSizeClasses[size] || textSizeClasses.md;

  return (
    <div
      className={`inline-flex items-center gap-1.5 ${padding} rounded-md border ${config.bg} ${config.border} ${config.color} ${className}`}
    >
      <Icon className={iconSize} />
      {showLabel && (
        <span className={`font-medium ${textSize}`}>{config.label}</span>
      )}
    </div>
  );
}

