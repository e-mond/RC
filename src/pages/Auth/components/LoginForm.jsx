import { useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/context/AuthContext";

/**
 * Login form component
 * Handles email/password input, validation, and role-based navigation.
 */
export default function LoginForm() {
  const { handleLogin } = useAuth();
  const [form, setForm] = useState({ email: "", password: "", remember: false });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  /** Handle input changes */
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm({ ...form, [name]: type === "checkbox" ? checked : value });
  };

  /** Submit login form */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await handleLogin(form);
    } catch (err) {
      setError(err.message || "Invalid email or password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.form
      onSubmit={handleSubmit}
      className="bg-white w-full max-w-md rounded-2xl shadow-lg p-8 space-y-6 border border-gray-200 relative"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      {/* === Header === */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <div className="flex items-center gap-2 mb-2">
          <div className="w-6 h-6 bg-[#0b6e4f] rounded-md"></div>
          <h1 className="text-2xl font-semibold text-[#0f1724]">
            Rental Connects
          </h1>
        </div>
        <p className="text-gray-600 text-base">
          Welcome back! Log in to access your dashboard.
        </p>
      </motion.div>

      {/* === Error Message === */}
      <AnimatePresence>
        {error && (
          <motion.div
            key="error"
            className="bg-red-100 text-red-700 text-sm px-3 py-2 rounded-md border border-red-300"
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
          >
            {error}
          </motion.div>
        )}
      </AnimatePresence>

      {/* === Inputs === */}
      <div className="space-y-5">
        <div>
          <label className="block text-sm font-medium text-[#0f1724] mb-1">
            Email Address
          </label>
          <input
            type="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            placeholder="you@example.com"
            required
            className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-base focus:ring-2 focus:ring-[#0b6e4f] focus:outline-none"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-[#0f1724] mb-1">
            Password
          </label>
          <input
            type="password"
            name="password"
            value={form.password}
            onChange={handleChange}
            placeholder="********"
            required
            className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-base focus:ring-2 focus:ring-[#0b6e4f] focus:outline-none"
          />
        </div>

        <div className="flex justify-between items-center text-sm">
          <label className="flex items-center gap-2 text-gray-600">
            <input
              type="checkbox"
              name="remember"
              checked={form.remember}
              onChange={handleChange}
            />
            Remember me
          </label>
          <Link to="/forgot-password" className="text-[#0b6e4f] hover:underline">
            Forgot Password?
          </Link>
        </div>
      </div>

      {/* === Submit === */}
      <motion.div whileTap={{ scale: 0.97 }}>
        <Button
          type="submit"
          disabled={loading}
          className="w-full bg-[#0b6e4f] hover:bg-[#095c42] text-white text-base py-2.5 rounded-lg font-medium transition-colors"
        >
          {loading ? "Logging in..." : "Log In"}
        </Button>
      </motion.div>

      {/* === Footer === */}
      <p className="text-center text-sm text-gray-600">
        Don’t have an account?{" "}
        <Link
          to="/role-selection"
          className="text-[#0b6e4f] font-medium hover:underline"
        >
          Get Started
        </Link>
      </p>
    </motion.form>
  );
}
