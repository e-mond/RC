/**
 * AccountStatusBanner Component
 * 
 * Displays account approval/suspension status with email notification info.
 * Shows different states: pending, approved, suspended, rejected.
 * 
 * Props:
 * - status: 'pending' | 'approved' | 'suspended' | 'rejected'
 * - emailSent: boolean (whether email notification was sent)
 * - onCheckEmail: function (optional callback to check email)
 * - className: string (additional classes)
 */

import { CheckCircle, XCircle, Clock, AlertTriangle, Mail } from "lucide-react";
import Button from "@/components/ui/Button";
import { useTranslation } from "@/hooks/useTranslation";

export default function AccountStatusBanner({
  status = "pending",
  emailSent = false,
  onCheckEmail,
  className = "",
}) {
  const { t } = useTranslation();
  const statusConfig = {
    pending: {
      icon: Clock,
      color: "text-amber-600 dark:text-amber-400",
      bg: "bg-amber-50 dark:bg-amber-900/20",
      border: "border-amber-200 dark:border-amber-800",
      title: t("accountStatusPendingTitle", "Account Pending Approval"),
      message: t("accountStatusPendingMessage", "Your account is pending admin approval. You will receive an email notification once your account is reviewed."),
      action: t("accountStatusPendingAction", "We'll notify you via email when your account is approved."),
    },
    approved: {
      icon: CheckCircle,
      color: "text-green-600 dark:text-green-400",
      bg: "bg-green-50 dark:bg-green-900/20",
      border: "border-green-200 dark:border-green-800",
      title: t("accountStatusApprovedTitle", "Account Approved"),
      message: emailSent
        ? t("accountStatusApprovedMessageEmail", "Your account has been approved! Check your email for confirmation details.")
        : t("accountStatusApprovedMessage", "Your account has been approved! You can now access all features."),
      action: emailSent ? t("accountStatusApprovedActionEmail", "Confirmation email sent to your registered email address.") : null,
    },
    suspended: {
      icon: AlertTriangle,
      color: "text-red-600 dark:text-red-400",
      bg: "bg-red-50 dark:bg-red-900/20",
      border: "border-red-200 dark:border-red-800",
      title: t("accountStatusSuspendedTitle", "Account Suspended"),
      message: emailSent
        ? t("accountStatusSuspendedMessageEmail", "Your account has been suspended. Check your email for details and next steps.")
        : t("accountStatusSuspendedMessage", "Your account has been suspended. Please contact support for assistance."),
      action: emailSent ? t("accountStatusSuspendedActionEmail", "Suspension notice sent to your registered email address.") : t("accountStatusSuspendedAction", "Contact support to resolve this issue."),
    },
    rejected: {
      icon: XCircle,
      color: "text-red-600 dark:text-red-400",
      bg: "bg-red-50 dark:bg-red-900/20",
      border: "border-red-200 dark:border-red-800",
      title: t("accountStatusRejectedTitle", "Account Rejected"),
      message: emailSent
        ? t("accountStatusRejectedMessageEmail", "Your account application was rejected. Check your email for details.")
        : t("accountStatusRejectedMessage", "Your account application was rejected. Please contact support for more information."),
      action: emailSent ? t("accountStatusRejectedActionEmail", "Rejection notice sent to your registered email address.") : t("accountStatusRejectedAction", "Contact support for more information."),
    },
  };

  const config = statusConfig[status] || statusConfig.pending;
  const Icon = config.icon;

  return (
    <div
      className={`${config.bg} ${config.border} border rounded-lg p-4 sm:p-6 ${className}`}
    >
      <div className="flex items-start gap-3">
        <Icon className={`w-6 h-6 ${config.color} mt-0.5 shrink-0`} />
        <div className="flex-1 min-w-0">
          <h3 className={`font-semibold text-lg mb-2 ${config.color}`}>
            {config.title}
          </h3>
          <p className="text-sm text-gray-700 dark:text-gray-300 mb-3">
            {config.message}
          </p>
          {config.action && (
            <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400">
              <Mail className="w-4 h-4" />
              <span>{config.action}</span>
            </div>
          )}
          {onCheckEmail && emailSent && (
            <div className="mt-4">
              <Button
                onClick={onCheckEmail}
                variant="outline"
                size="sm"
              >
                {t("checkEmail", "Check Email")}
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

