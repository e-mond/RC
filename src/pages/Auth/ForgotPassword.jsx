import { useState } from "react";
import { forgotPassword } from "@/services/authService";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // === Handle form submission ===
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const res = await forgotPassword(email);
      setMessage(res.message || "If your email exists, a reset link has been sent.");
    } catch (err) {
      setMessage(err.message || "Error sending reset link.");
    } finally {
      setLoading(false);
    }
  };

  return (
    // Full page container with a soft gradient background
    <div className="min-h-screen flex items-center justify-center bg-white p-6">
      <motion.div
        className="bg-white p-8 rounded-2xl shadow-md border border-gray-100 w-full max-w-md text-center relative overflow-hidden"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        {/*  Illustration  */}
        <div className="flex justify-center mb-4">
          <img
            src="https://cdn.dribbble.com/users/1187836/screenshots/16128537/media/233df33218704d18b4b6f4c99e94972a.png?resize=400x300&vertical=center"
            alt="Reset password illustration"
            className="w-40 h-40 object-contain rounded-lg"
          />
        </div>

        {/* Heading and subtitle  */}
        <h2 className="text-2xl font-semibold text-[#0f1724] mb-2">
          Forgot Password?
        </h2>
        <p className="text-gray-600 mb-6 text-sm">
          No worries — just enter your registered email, and we’ll send you a link to reset your password.
        </p>

        {/*  Forgot Password Form  */}
        <form onSubmit={handleSubmit} className="space-y-4 text-left">
          <input
            type="email"
            placeholder="Enter your registered email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#0b6e4f] focus:outline-none"
            required
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#0b6e4f] text-white py-2 rounded-lg hover:bg-[#095b40] transition disabled:opacity-70"
          >
            {loading ? "Sending..." : "Send Reset Link"}
          </button>
        </form>

        {/*  Display message feedback  */}
        {message && (
          <motion.p
            className="text-center text-sm text-gray-600 mt-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            {message}
          </motion.p>
        )}

        {/* Back to Login link */}
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-500">
            Changed your mind?{" "}
            <button
              onClick={() => navigate("/login")}
              className="text-[#0b6e4f] font-medium hover:underline"
            >
              Back to Login
            </button>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
