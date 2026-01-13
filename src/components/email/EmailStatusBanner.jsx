/**
 * EmailStatusBanner Component
 * 
 * Displays email notification status and confirmation messages with modern UI.
 * Used for password reset, account approval, payment confirmations, etc.
 * 
 * Props:
 * - type: 'password_reset' | 'account_approval' | 'account_suspension' | 'payment' | 'booking' | 'message'
 * - status: 'sent' | 'delivered' | 'failed' | 'pending'
 * - message: string (custom message)
 * - onResend: function (optional resend callback)
 * - className: string (additional classes)
 */

import { useState } from "react";
import { motion } from "framer-motion";
import {
  Mail,
  CheckCircle2,
  XCircle,
  Clock,
  AlertCircle,
  Send,
  RefreshCw,
} from "lucide-react";
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
      title: t("emailPasswordResetTitle", "Password Reset Link"),
      defaultMessage: t(
        "emailPasswordResetMessage",
        "We've sent a secure reset link to your email. Check inbox & spam folder."
      ),
      icon: Mail,
    },
    account_approval: {
      title: t("emailAccountApprovalTitle", "Account Approved"),
      defaultMessage: t(
        "emailAccountApprovalMessage",
        "Your account has been approved. Check your email for next steps."
      ),
      icon: CheckCircle2,
    },
    account_suspension: {
      title: t("emailAccountSuspensionTitle", "Account Suspended"),
      defaultMessage: t(
        "emailAccountSuspensionMessage",
        "Your account has been suspended. Review the email for details."
      ),
      icon: AlertCircle,
    },
    payment: {
      title: t("emailPaymentTitle", "Payment Confirmed"),
      defaultMessage: t(
        "emailPaymentMessage",
        "Payment successful! Confirmation sent to your email."
      ),
      icon: CheckCircle2,
    },
    booking: {
      title: t("emailBookingTitle", "Booking Confirmed"),
      defaultMessage: t(
        "emailBookingMessage",
        "Your booking is confirmed. Details sent to your email."
      ),
      icon: CheckCircle2,
    },
    message: {
      title: t("emailMessageTitle", "New Message Received"),
      defaultMessage: t(
        "emailMessageMessage",
        "You have a new message. Check your email for details."
      ),
      icon: Mail,
    },
  };

  const statusConfig = {
    sent: {
      icon: Send,
      color: "text-teal-600 dark:text-teal-400",
      bg: "bg-teal-50/90 dark:bg-teal-950/30",
      border: "border-teal-200/70 dark:border-teal-800/40",
      label: t("emailStatusSent", "Sent"),
    },
    delivered: {
      icon: CheckCircle2,
      color: "text-emerald-600 dark:text-emerald-400",
      bg: "bg-emerald-50/90 dark:bg-emerald-950/30",
      border: "border-emerald-200/70 dark:border-emerald-800/40",
      label: t("emailStatusDelivered", "Delivered"),
    },
    failed: {
      icon: XCircle,
      color: "text-rose-600 dark:text-rose-400",
      bg: "bg-rose-50/90 dark:bg-rose-950/30",
      border: "border-rose-200/70 dark:border-rose-800/40",
      label: t("emailStatusFailed", "Failed"),
    },
    pending: {
      icon: Clock,
      color: "text-amber-600 dark:text-amber-400",
      bg: "bg-amber-50/90 dark:bg-amber-950/30",
      border: "border-amber-200/70 dark:border-amber-800/40",
      label: t("emailStatusPending", "Pending"),
    },
  };

  const typeInfo = typeConfig[type] || typeConfig.password_reset;
  const statusInfo = statusConfig[status] || statusConfig.sent;

  const handleResend = async () => {
    if (!onResend || resending) return;
    setResending(true);
    try {
      await onResend();
    } catch (err) {
      console.error("Resend failed:", err);
    } finally {
      setResending(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className={`
        ${statusInfo.bg}
        ${statusInfo.border}
        border rounded-2xl p-5 flex items-start gap-4
        shadow-sm backdrop-blur-md transition-all
        ${className}
      `}
    >
      {/* Icon Container */}
      <div className={`p-3 rounded-xl ${statusInfo.bg.replace("50", "100").replace("950", "900")}`}>
        <typeInfo.icon className={`w-6 h-6 ${statusInfo.color}`} />
      </div>

      {/* Content */}
      <div className="flex-1">
        <div className="flex items-center justify-between gap-3 mb-2">
          <h4 className="font-semibold text-gray-900 dark:text-gray-100 text-base md:text-lg">
            {typeInfo.title}
          </h4>

          <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-white/60 dark:bg-black/30">
            <statusInfo.icon className={`w-4 h-4 ${statusInfo.color}`} />
            <span className={`text-xs font-medium ${statusInfo.color}`}>
              {statusInfo.label}
            </span>
          </div>
        </div>

        <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
          {message || typeInfo.defaultMessage}
        </p>

        {status === "failed" && onResend && (
          <div className="mt-5">
            <Button
              onClick={handleResend}
              disabled={resending}
              variant="outline"
              size="sm"
              className={`
                gap-2 border-rose-200 hover:bg-rose-50 
                dark:border-rose-800 dark:hover:bg-rose-950/50
                text-rose-700 dark:text-rose-300
              `}
            >
              {resending ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  {t("emailResending", "Resending...")}
                </>
              ) : (
                <>
                  <RefreshCw className="w-4 h-4" />
                  {t("emailResend", "Resend Email")}
                </>
              )}
            </Button>
          </div>
        )}
      </div>
    </motion.div>
  );
}