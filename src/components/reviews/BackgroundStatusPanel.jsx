/**
 * BackgroundStatusPanel Component
 * 
 * Displays comprehensive background check and verification status for a user.
 * Shows multiple verification types (identity, background check, payment, etc.)
 * 
 * Props:
 * - userId: string|number (user ID)
 * - userRole: string (user role)
 * - verificationStatus: object (verification status data)
 * - className: string (additional classes)
 */

import { Shield, CheckCircle, Clock, XCircle, AlertCircle, User, CreditCard, FileCheck } from "lucide-react";
import VerificationBadge from "./VerificationBadge";

export default function BackgroundStatusPanel({
  userId,
  userRole = "tenant",
  verificationStatus = {},
  className = "",
}) {
  const {
    identity_verified = false,
    background_check_status = "unverified",
    payment_verified = false,
    document_verified = false,
    overall_status = "unverified",
  } = verificationStatus;

  const verificationTypes = [
    {
      id: "identity",
      label: "Identity Verification",
      status: identity_verified ? "verified" : "unverified",
      icon: User,
      description: "Government-issued ID verified",
    },
    {
      id: "background",
      label: "Background Check",
      status: background_check_status,
      icon: Shield,
      description: "Criminal and credit background check",
    },
    {
      id: "payment",
      label: "Payment Verification",
      status: payment_verified ? "verified" : "unverified",
      icon: CreditCard,
      description: "Payment method verified",
    },
    {
      id: "documents",
      label: "Document Verification",
      status: document_verified ? "verified" : "unverified",
      icon: FileCheck,
      description: "Supporting documents verified",
    },
  ];

  const getOverallStatus = () => {
    const verifiedCount = verificationTypes.filter(
      (v) => v.status === "verified"
    ).length;
    const totalCount = verificationTypes.length;

    if (verifiedCount === totalCount) return "verified";
    if (verifiedCount > 0) return "pending";
    return "unverified";
  };

  const overallStatusValue = overall_status || getOverallStatus();

  return (
    <div className={`bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 sm:p-6 ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Shield className="w-5 h-5 text-[#0b6e4f]" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Verification Status
          </h3>
        </div>
        <VerificationBadge
          status={overallStatusValue}
          size="md"
          showLabel={true}
        />
      </div>

      <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
        Verification status helps build trust in the RentalConnects community.
      </p>

      {/* Verification Types */}
      <div className="space-y-3">
        {verificationTypes.map((type) => {
          const Icon = type.icon;
          return (
            <div
              key={type.id}
              className="flex items-start justify-between p-3 bg-gray-50 dark:bg-gray-900/50 rounded-lg border border-gray-200 dark:border-gray-700"
            >
              <div className="flex items-start gap-3 flex-1">
                <Icon className="w-5 h-5 text-gray-600 dark:text-gray-400 mt-0.5 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-1">
                    {type.label}
                  </h4>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {type.description}
                  </p>
                </div>
              </div>
              <div className="flex-shrink-0 ml-3">
                <VerificationBadge
                  status={type.status}
                  size="sm"
                  showLabel={false}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* Status Legend */}
      <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
        <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
          Status Legend:
        </p>
        <div className="flex flex-wrap gap-2">
          <VerificationBadge status="verified" size="sm" showLabel={true} />
          <VerificationBadge status="pending" size="sm" showLabel={true} />
          <VerificationBadge status="unverified" size="sm" showLabel={true} />
        </div>
      </div>
    </div>
  );
}

