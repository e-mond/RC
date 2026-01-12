/**
 * EmailStatusBanner Component
 * 
 * Displays email notification status and confirmation messages.
 * Used for password reset, account approval, payment confirmations, etc.
 * 
 * Props:
 * - type: 'password_reset' | 'account_approval' | 'account_suspension' | 'payment' | 'booking' | 'message'
 * - status: 'sent' | 'delivered' | 'failed' | 'pending'
 * - message: string (custom message)
 * - onResend: function (optional resend callback)
 * - className: string (additional classes)
 */

import { Mail, CheckCircle, XCircle, Clock, AlertCircle, Send } from "lucide-react";
import { useState } from "react";
import Button from "@/components/ui/Button";
import { useTranslation } from "@/hooks/useTranslation";

export default function EmailStatusBanner({
  type = "password_reset",
  status = "sent",
  message,
  onResend,
  className = "",
}) {
  const { t } = useTranslation();
  const [resending, setResending] = useState(false);

  const typeConfig = {
    password_reset: {
      title: t("emailPasswordResetTitle", "Password Reset Email"),
      defaultMessage: t("emailPasswordResetMessage", "A password reset link has been sent to your email address."),
      icon: Mail,
    },
    account_approval: {
      title: t("emailAccountApprovalTitle", "Account Approval"),
      defaultMessage: t("emailAccountApprovalMessage", "Your account approval status has been updated. Check your email for details."),
      icon: CheckCircle,
    },
    account_suspension: {
      title: t("emailAccountSuspensionTitle", "Account Suspension"),
      defaultMessage: t("emailAccountSuspensionMessage", "Your account has been suspended. Check your email for details."),
      icon: AlertCircle,
    },
    payment: {
      title: t("emailPaymentTitle", "Payment Confirmation"),
      defaultMessage: t("emailPaymentMessage", "Payment confirmation email has been sent to your email address."),
      icon: CheckCircle,
    },
    booking: {
      title: t("emailBookingTitle", "Booking Confirmation"),
      defaultMessage: t("emailBookingMessage", "Booking confirmation email has been sent to your email address."),
      icon: CheckCircle,
    },
    message: {
      title: t("emailMessageTitle", "Message Notification"),
      defaultMessage: t("emailMessageMessage", "You have a new message. Check your email for details."),
      icon: Mail,
    },
  };

  const statusConfig = {
    sent: {
      icon: Send,
      color: "text-blue-600 dark:text-blue-400",
      bg: "bg-blue-50 dark:bg-blue-900/20",
      border: "border-blue-200 dark:border-blue-800",
      label: t("emailStatusSent", "Email Sent"),
    },
    delivered: {
      icon: CheckCircle,
      color: "text-green-600 dark:text-green-400",
      bg: "bg-green-50 dark:bg-green-900/20",
      border: "border-green-200 dark:border-green-800",
      label: t("emailStatusDelivered", "Email Delivered"),
    },
    failed: {
      icon: XCircle,
      color: "text-red-600 dark:text-red-400",
      bg: "bg-red-50 dark:bg-red-900/20",
      border: "border-red-200 dark:border-red-800",
      label: t("emailStatusFailed", "Email Failed"),
    },
    pending: {
      icon: Clock,
      color: "text-amber-600 dark:text-amber-400",
      bg: "bg-amber-50 dark:bg-amber-900/20",
      border: "border-amber-200 dark:border-amber-800",
      label: t("emailStatusPending", "Email Pending"),
    },
  };

  const typeInfo = typeConfig[type] || typeConfig.password_reset;
  const statusInfo = statusConfig[status] || statusConfig.sent;
  const TypeIcon = typeInfo.icon;
  const StatusIcon = statusInfo.icon;

  const handleResend = async () => {
    if (!onResend) return;
    setResending(true);
    try {
      await onResend();
    } catch (err) {
      console.error("Failed to resend email:", err);
    } finally {
      setResending(false);
    }
  };

  return (
    <div
      className={`${statusInfo.bg} ${statusInfo.border} border rounded-lg p-4 flex items-start gap-3 ${className}`}
    >
      <TypeIcon className={`w-5 h-5 ${statusInfo.color} mt-0.5 flex-shrink-0`} />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <h4 className="font-medium text-gray-900 dark:text-white">{typeInfo.title}</h4>
          <StatusIcon className={`w-4 h-4 ${statusInfo.color}`} />
          <span className={`text-xs font-medium ${statusInfo.color}`}>
            {statusInfo.label}
          </span>
        </div>
        <p className="text-sm text-gray-700 dark:text-gray-300">
          {message || typeInfo.defaultMessage}
        </p>
        {status === "failed" && onResend && (
          <div className="mt-3">
            <Button
              onClick={handleResend}
              disabled={resending}
              variant="outline"
              size="sm"
            >
              {resending ? t("emailResending", "Resending...") : t("emailResend", "Resend Email")}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

