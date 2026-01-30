import { useState } from "react";
import { forgotPassword } from "@/services/authService";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { EmailStatusBanner } from "@/components/email";
import { Mail, ArrowLeft, Loader2 } from "lucide-react"; // ← Add lucide-react icons

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState("idle"); // 'idle' | 'loading' | 'success' | 'error'
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus("loading");
    setMessage("");

    try {
      const res = await forgotPassword(email.trim());
      setMessage(res.message || "Reset link sent! Check your email (including spam).");
      setStatus("success");
    } catch (err) {
      setMessage(err.message || "Something went wrong. Please try again.");
      setStatus("error");
    }
  };

  const isLoading = status === "loading";
  const isSuccess = status === "success";
  const isError = status === "error";

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 p-6">
      <motion.div
        className="bg-white p-8 md:p-10 rounded-2xl shadow-xl border border-gray-100 w-full max-w-md relative overflow-hidden"
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: "easeOut" }}
      >
        {/* Decorative top accent */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#0b6e4f] to-[#0d8a63]" />

        {/* Illustration / Icon */}
        <div className="flex justify-center mb-6">
          {isSuccess ? (
            <div className="w-24 h-24 rounded-full bg-green-100 flex items-center justify-center">
              <Mail className="w-12 h-12 text-green-600" />
            </div>
          ) : (
            <div className="w-40 h-40 rounded-full bg-gray-100 flex items-center justify-center">
              <Mail className="w-12 h-12 text-gray-400" />
            </div>
          )}
        </div>

        {/* Title & Subtitle */}
        <h2 className="text-3xl font-bold text-gray-800 text-center mb-3">
          Forgot Password?
        </h2>
        <p className="text-gray-600 text-center mb-8 text-base leading-relaxed">
          No worries! Enter your registered email and we'll send you a password reset link.
        </p>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700 mb-1.5"
            >
              Email address
            </label>
            <input
              id="email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={`w-full px-4 py-3 border rounded-xl bg-gray-100 text-gray-900 placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:bg-white transition-all ${
                isError
                  ? "border-red-500 focus:ring-red-200"
                  : "border-gray-300 focus:ring-[#0b6e4f]/30 focus:border-[#0b6e4f]"
              }`}
              required
              disabled={isLoading || isSuccess}
              aria-invalid={isError}
              aria-describedby={isError ? "email-error" : undefined}
            />
          </div>

          <button
            type="submit"
            disabled={isLoading || isSuccess}
            className={`w-full py-3.5 px-4 rounded-xl font-medium text-white transition-all flex items-center justify-center gap-2 shadow-md ${
              isSuccess
                ? "bg-green-600 hover:bg-green-700"
                : isLoading
                ? "bg-[#0b6e4f]/70 cursor-wait"
                : "bg-[#0b6e4f] hover:bg-[#095b40]"
            } disabled:opacity-70`}
          >
            {isLoading && <Loader2 className="w-5 h-5 animate-spin" />}
            {isLoading
              ? "Sending..."
              : isSuccess
              ? "Email Sent ✓"
              : "Send Reset Link"}
          </button>
        </form>

        {/* Status Banner (only shows after attempt) */}
        {(isSuccess || isError) && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-6"
          >
            <EmailStatusBanner
              type="password_reset"
              status={isSuccess ? "sent" : "failed"}
              message={message}
              onResend={isError ? handleSubmit : undefined}
            />
          </motion.div>
        )}

        {/* Back to Login */}
        <div className="mt-8 text-center">
          <button
            onClick={() => navigate("/login")}
            className="inline-flex items-center gap-2 text-[#0b6e4f] hover:text-[#095b40] font-medium transition-colors group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            Back to Login
          </button>
        </div>
      </motion.div>
    </div>
  );
}