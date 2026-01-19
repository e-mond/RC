// src/components/auth/LoginForm.jsx
import { useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/Button";
import { useAuthStore } from "@/stores/authStore";
import useRoleRedirect from "@/hooks/useRoleRedirect";

import LoginHeader from "./LoginHeader";
import DemoLoginButtons from "./DemoLoginButtons";
import FormInput from "@/components/ui/FormInput";
import useLoginValidation from "@/hooks/useLoginValidation";

export default function LoginForm() {
  const login = useAuthStore((state) => state.login);
  const redirectToRole = useRoleRedirect();

  const [form, setForm] = useState({
    email: "",
    password: "",
    remember: false,
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});
  const { validate } = useLoginValidation();

  const demoEmails = {
    tenant: "tenant@demo.com",
    landlord: "landlord@demo.com",
    artisan: "artisan@demo.com",
    admin: "admin@demo.com",
    "super-admin": "super@demo.com",
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    const errors = validate(form);
    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) return;

    setLoading(true);
    try {
      const result = await login({ email: form.email, password: form.password });
      if (result?.success) {
        redirectToRole(result.role);
      } else if (result?.error) {
        setError(result.error);
      }
    } catch (err) {
      setError(err.message || "Invalid email or password");
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async (role) => {
    setLoading(true);
    setError("");
    try {
      const result = await login({ email: demoEmails[role], password: "any" });
      if (result?.success) {
        redirectToRole(result.role);
      }
    } catch (err) {
      console.error("Demo login error:", err);
      setError("Demo login failed. Is mock mode enabled?");
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.form
      onSubmit={handleSubmit}
      className="bg-white w-full max-w-md rounded-2xl shadow-lg p-8 space-y-6 border border-gray-200"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <LoginHeader />

      {/* Error (global) */}
      <AnimatePresence>
        {error && (
          <motion.div
            key="error"
            className={`text-sm px-4 py-3 rounded-md border ${
              error.includes("pending") || error.includes("approval")
                ? "bg-amber-50 dark:bg-amber-900/20 text-amber-800 dark:text-amber-300 border-amber-200 dark:border-amber-800"
                : error.includes("rejected")
                ? "bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-300 border-red-200 dark:border-red-800"
                : "bg-red-100 text-red-700 border-red-300"
            }`}
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
          >
            <div className="flex items-start gap-2">
              <span className="font-medium">
                {error.includes("pending") || error.includes("approval")
                  ? "Account Under Review"
                  : error.includes("rejected")
                  ? "Account Rejected"
                  : "Login Error"}
              </span>
            </div>
            <p className="mt-1 text-sm">{error}</p>
            {(error.includes("pending") || error.includes("approval")) && (
              <p className="mt-2 text-xs opacity-90">
                You will receive an email notification once your account has been approved.
              </p>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Fields */}
      <div className="space-y-5">
        <FormInput
          id="email"
          label="Email Address"
          type="email"
          name="email"
          value={form.email}
          placeholder="you@example.com"
          onChange={handleChange}
          error={fieldErrors.email}
        />

        <FormInput
          id="password"
          label="Password"
          type="password"
          name="password"
          value={form.password}
          placeholder="********"
          onChange={handleChange}
          error={fieldErrors.password}
        />

        <div className="flex justify-between items-center text-sm">
          <label
            htmlFor="remember"
            className="flex items-center gap-2 text-gray-700 cursor-pointer"
          >
            <input
              id="remember"
              type="checkbox"
              name="remember"
              checked={form.remember}
              onChange={handleChange}
              className="w-4 h-4 text-[#0b6e4f] rounded"
            />
            Remember me
          </label>

          <Link
            to="/forgot-password"
            className="text-[#0b6e4f] hover:underline"
          >
            Forgot Password?
          </Link>
        </div>
      </div>

      {/* Login button */}
      <motion.div whileTap={{ scale: 0.97 }}>
        <Button
          type="submit"
          disabled={loading}
          className="w-full bg-[#0b6e4f] hover:bg-[#095c42] text-white text-base py-2.5 rounded-lg font-medium transition-colors disabled:opacity-70 focus:ring-2 focus:ring-[#0b6e4f]"
        >
          {loading ? "Logging in..." : "Log In"}
        </Button>
      </motion.div>

      {/* Google Login Button (Disabled) */}
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-300 dark:border-gray-600" />
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-2 bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400">Or continue with</span>
        </div>
      </div>

      <motion.div whileTap={{ scale: 0.97 }}>
        <Button
          type="button"
          disabled={true}
          className="w-full bg-white dark:bg-gray-800 border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 text-base py-2.5 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path
              fill="currentColor"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="currentColor"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="currentColor"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
            />
            <path
              fill="currentColor"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            />
          </svg>
          Sign in with Google
          <span className="ml-auto text-xs bg-gray-200 dark:bg-gray-700 px-2 py-0.5 rounded">Coming Soon</span>
        </Button>
      </motion.div>

      {/* Demo buttons */}
      <DemoLoginButtons loading={loading} onDemoLogin={handleDemoLogin} />

      {/* Signup redirect */}
      <p className="text-center text-sm text-gray-600 mt-4">
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
