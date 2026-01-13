/**
 * SignupSuccess Component
 * 
 * Displays post-signup status including:
 * - Email verification status
 * - Account approval status (for landlords/artisans)
 * - Next steps instructions
 * - Mock email flow simulation
 */

import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { Mail, CheckCircle, Clock, AlertCircle, Shield, ArrowRight } from "lucide-react";
import EmailStatusBanner from "@/components/email/EmailStatusBanner";
import Button from "@/components/ui/Button";

export default function SignupSuccess() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const role = searchParams.get("role") || "tenant";
  const email = searchParams.get("email") || "";
  
  const [emailVerified, setEmailVerified] = useState(false);
  const [accountApproved, setAccountApproved] = useState(role === "tenant"); // Tenants don't need approval
  const [emailStatus, setEmailStatus] = useState("sent"); // 'sent' | 'delivered' | 'failed' | 'pending'
  const [checkingStatus, setCheckingStatus] = useState(false);

  // Simulate email verification check (mock mode)
  useEffect(() => {
    // In real mode, this would poll the backend for verification status
    // In mock mode, simulate a delay then show verification
    const timer = setTimeout(() => {
      if (role === "tenant") {
        // Tenants can verify immediately in mock mode
        setEmailVerified(true);
        setEmailStatus("delivered");
      } else {
        // Landlords/Artisans need admin approval
        setEmailStatus("delivered");
      }
    }, 2000);

    return () => clearTimeout(timer);
  }, [role]);

  const handleResendEmail = async () => {
    setCheckingStatus(true);
    // Simulate resending email
    setTimeout(() => {
      setEmailStatus("sent");
      setCheckingStatus(false);
    }, 1000);
  };

  const handleCheckStatus = async () => {
    setCheckingStatus(true);
    // Simulate checking account status
    setTimeout(() => {
      if (role === "tenant") {
        setEmailVerified(true);
      } else {
        // Check if admin has approved
        // In real mode, this would call the backend
        setAccountApproved(true); // Mock: auto-approve after check
      }
      setCheckingStatus(false);
    }, 1500);
  };

  const canLogin = emailVerified && accountApproved;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-xl shadow-lg max-w-2xl w-full p-8"
      >
        {/* Header */}
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring" }}
            className="w-20 h-20 mx-auto mb-4 bg-green-100 rounded-full flex items-center justify-center"
          >
            <CheckCircle className="w-10 h-10 text-green-600" />
          </motion.div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Account Created Successfully!
          </h1>
          <p className="text-gray-600">
            We've sent a verification email to <strong>{email}</strong>
          </p>
        </div>

        {/* Email Verification Status */}
        <div className="mb-6">
          <EmailStatusBanner
            type="account_approval"
            status={emailStatus}
            message={
              emailVerified
                ? "Email verified successfully!"
                : "Please check your email and click the verification link."
            }
            onResend={handleResendEmail}
          />
        </div>

        {/* Status Cards */}
        <div className="space-y-4 mb-6">
          {/* Email Verification Card */}
          <div
            className={`p-4 rounded-lg border-2 ${
              emailVerified
                ? "border-green-200 bg-green-50"
                : "border-amber-200 bg-amber-50"
            }`}
          >
            <div className="flex items-start gap-3">
              {emailVerified ? (
                <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
              ) : (
                <Mail className="w-5 h-5 text-amber-600 mt-0.5" />
              )}
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900 mb-1">
                  Email Verification
                </h3>
                <p className="text-sm text-gray-600">
                  {emailVerified
                    ? "Your email has been verified. You can now log in."
                    : "Please check your inbox and click the verification link to activate your account."}
                </p>
              </div>
            </div>
          </div>

          {/* Account Approval Card (Landlords/Artisans only) */}
          {role !== "tenant" && (
            <div
              className={`p-4 rounded-lg border-2 ${
                accountApproved
                  ? "border-green-200 bg-green-50"
                  : "border-blue-200 bg-blue-50"
              }`}
            >
              <div className="flex items-start gap-3">
                {accountApproved ? (
                  <Shield className="w-5 h-5 text-green-600 mt-0.5" />
                ) : (
                  <Clock className="w-5 h-5 text-blue-600 mt-0.5" />
                )}
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 mb-1">
                    Account Approval
                  </h3>
                  <p className="text-sm text-gray-600">
                    {accountApproved
                      ? "Your account has been approved. You can now create listings."
                      : `Your account is pending admin approval. You'll receive an email once it's approved. This usually takes 24-48 hours.`}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Next Steps */}
        <div className="bg-gray-50 rounded-lg p-6 mb-6">
          <h3 className="font-semibold text-gray-900 mb-3">Next Steps:</h3>
          <ul className="space-y-2 text-sm text-gray-600">
            <li className="flex items-start gap-2">
              <span className="text-[#0b6e4f] font-bold">1.</span>
              <span>Check your email inbox (and spam folder) for the verification link</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-[#0b6e4f] font-bold">2.</span>
              <span>Click the verification link to activate your account</span>
            </li>
            {role !== "tenant" && (
              <li className="flex items-start gap-2">
                <span className="text-[#0b6e4f] font-bold">3.</span>
                <span>Wait for admin approval (you'll receive an email notification)</span>
              </li>
            )}
            <li className="flex items-start gap-2">
              <span className="text-[#0b6e4f] font-bold">{role !== "tenant" ? "4." : "3."}</span>
              <span>Once verified and approved, log in to access your dashboard</span>
            </li>
          </ul>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3">
          <Button
            variant="outline"
            onClick={handleCheckStatus}
            disabled={checkingStatus}
            className="flex-1"
          >
            {checkingStatus ? "Checking..." : "Check Status"}
          </Button>
          <Button
            onClick={() => navigate("/login")}
            disabled={!canLogin}
            className="flex-1 flex items-center justify-center gap-2"
          >
            {canLogin ? (
              <>
                Go to Login <ArrowRight className="w-4 h-4" />
              </>
            ) : (
              "Waiting for Verification..."
            )}
          </Button>
        </div>

        {/* Help Text */}
        <p className="text-center text-sm text-gray-500 mt-6">
          Didn't receive the email?{" "}
          <button
            onClick={handleResendEmail}
            className="text-[#0b6e4f] hover:underline font-medium"
          >
            Resend verification email
          </button>
        </p>
      </motion.div>
    </div>
  );
}

