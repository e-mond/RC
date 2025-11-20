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
            className="bg-red-100 text-red-700 text-sm px-3 py-2 rounded-md border border-red-300"
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
          >
            {error}
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
