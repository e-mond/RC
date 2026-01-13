import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import PhoneInput from "react-phone-number-input/input";
import ProgressIndicator from "@/components/onboarding/ProgressIndicator";
import { signupUser } from "@/services/signupService";
import landlord_onboarding from "@/assets/images/landlord_onboarding.jpeg";

/**
 * Multi-step landlord signup form.
 */
export default function LandlordForm() {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    businessType: "",
    idUpload: null,
    location: "",
    agree: false,
  });
  const [passwordMatch, setPasswordMatch] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState(null);

  // === Form Handlers ===
  const handleChange = (e) => {
    const { name, value, type, checked, files } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : type === "file" ? files[0] : value,
    }));

    if (name === "password" || name === "confirmPassword") {
      setPasswordMatch(
        name === "password"
          ? value === form.confirmPassword
          : form.password === value
      );
    }
  };

  const handlePhoneChange = (value) => setForm((prev) => ({ ...prev, phone: value || "" }));

  const handleNext = () => {
    if (
      !form.fullName ||
      !form.email ||
      !form.phone ||
      !form.password ||
      !form.confirmPassword ||
      !passwordMatch
    )
      return alert("Please complete all required fields.");
    setStep(2);
  };

  const handlePrev = () => setStep(1);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage(null);

    try {
      // Map frontend field names to backend expected field names
      // Backend expects camelCase based on API reference
      const formData = new FormData();
      
      // Required fields
      if (!form.email || !form.password || !form.fullName || !form.phone || !form.confirmPassword) {
        setMessage({ type: "error", text: "Please fill in all required fields." });
        setIsSubmitting(false);
        return;
      }
      
      formData.append("email", form.email.trim());
      formData.append("password", form.password);
      formData.append("fullName", form.fullName.trim()); // Backend expects camelCase: fullName
      formData.append("phone", form.phone.trim());
      formData.append("confirmPassword", form.confirmPassword); // Backend expects confirmPassword
      
      // Optional fields
      if (form.businessType) {
        formData.append("businessType", form.businessType.trim()); // Keep camelCase: businessType
      }
      if (form.idUpload) {
        formData.append("idUpload", form.idUpload); // Keep camelCase: idUpload
      }
      
      // Debug logging (development only)
      if (import.meta.env.DEV) {
        console.log("Landlord signup data:", {
          email: form.email,
          fullName: form.fullName, // camelCase
          phone: form.phone,
          businessType: form.businessType,
          has_idUpload: !!form.idUpload
        });
      }
      
      // Note: location, agree are frontend-only and not sent to backend

      const data = await signupUser("landlord", formData);
      console.log("Signup success:", data);

      // Redirect to success page with role and email
      window.location.href = `/signup-success?role=landlord&email=${encodeURIComponent(form.email)}`;
    } catch (error) {
      console.error("Signup error:", error);
      setMessage({ type: "error", text: error.message || "Signup failed" });
    } finally {
      setIsSubmitting(false);
    }
  };

  // === Animation Variants ===
  const variants = {
    hidden: { opacity: 0, x: 30 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.4 } },
    exit: { opacity: 0, x: -30, transition: { duration: 0.3 } },
  };

  return (
    <div className="flex flex-col md:flex-row w-full max-w-6xl mx-auto bg-white shadow-lg rounded-2xl overflow-hidden">
      {/* LEFT IMAGE */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6 }}
        className="hidden md:flex md:w-1/2 relative bg-gray-100"
      >
        <img
          src={landlord_onboarding}
          alt="Landlord onboarding"
          className="object-cover w-full h-full"
        />
        <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
          <p className="text-white text-xl font-semibold text-center px-6">
            “Simplify your property management — secure, smart, and connected.”
          </p>
        </div>
      </motion.div>

      {/* RIGHT FORM */}
      <div className="w-full md:w-1/2 p-8 md:p-10">
        <ProgressIndicator step={step} label="Landlord Signup" totalSteps={2} />

        <AnimatePresence mode="wait">
          <motion.form
            key={step}
            onSubmit={handleSubmit}
            variants={variants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="space-y-8"
          >
            <header className="text-center space-y-2">
              <h2 className="text-3xl font-bold text-[#0f1724]">Landlord Signup</h2>
              <p className="text-base text-gray-600">
                Step {step} of 2 — {step === 1 ? "Personal Info" : "Verification"}
              </p>
            </header>

            {step === 1 && (
              <div className="space-y-6">
                <Input label="Full Name" name="fullName" value={form.fullName} onChange={handleChange} required />
                <Input label="Email" name="email" type="email" value={form.email} onChange={handleChange} required />

                <div className="flex flex-col gap-1">
                  <label className="text-sm font-medium text-gray-800">Phone Number</label>
                  <PhoneInput
                    country="GH"
                    placeholder="+233 24 123 4567"
                    value={form.phone}
                    onChange={handlePhoneChange}
                    className="border border-gray-300 rounded-lg p-2"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <Input
                    label="Password"
                    name="password"
                    type="password"
                    value={form.password}
                    onChange={handleChange}
                    required
                  />
                  <Input
                    label="Confirm Password"
                    name="confirmPassword"
                    type="password"
                    value={form.confirmPassword}
                    onChange={handleChange}
                    required
                    error={!passwordMatch && "Passwords do not match"}
                  />
                </div>

                <Button onClick={handleNext} type="button" className="w-full bg-[#0b6e4f] hover:bg-[#095c42] text-white text-base py-2.5 rounded-lg font-medium transition-colors">
                  Continue
                </Button>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-6">
                <Select
                  label="Business Type"
                  name="businessType"
                  value={form.businessType}
                  onChange={handleChange}
                  options={[
                    { label: "Select Type", value: "" },
                    { label: "Personal", value: "personal" },
                    { label: "Business", value: "business" },
                  ]}
                />

                <Input
                  label="Upload ID"
                  name="idUpload"
                  type="file"
                  onChange={handleChange}
                  required
                />

                <Input
                  label="Location"
                  name="location"
                  placeholder="Accra, Greater Accra"
                  value={form.location}
                  onChange={handleChange}
                  required
                />

                <label className="flex items-center gap-3 text-sm text-gray-700 cursor-pointer">
                  <input
                    type="checkbox"
                    name="agree"
                    checked={form.agree}
                    onChange={handleChange}
                    className="w-5 h-5 text-[#0b6e4f] border-gray-300 rounded focus:ring-[#0b6e4f]"
                    required
                  />
                  I agree to the{" "}
                  <a href="/terms" className="text-[#0b6e4f] underline hover:text-[#0a5d3f]">
                    Terms & Conditions
                  </a>
                </label>

                {message && (
                  <p className={`text-sm text-center ${message.type === "error" ? "text-red-600" : "text-green-600"}`}>
                    {message.text}
                  </p>
                )}

                <div className="flex items-center gap-4">
                  <Button onClick={handlePrev} type="button" variant="outline" className="w-1/2 border text-base py-2.5 rounded-lg font-medium transition-colors">
                    Back
                  </Button>
                  <Button type="submit" className="w-1/2 px-4 py-2.5 bg-[#0b6e4f] text-white text-nowrap font-medium rounded-lg hover:bg-[#095c42] transition" disabled={isSubmitting || !form.agree}>
                    {isSubmitting ? "Creating..." : "Create Account"}
                  </Button>
                </div>

                {/* Google Signup Button (Disabled) */}
                <div className="relative mt-4">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-300" />
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-white text-gray-500">Or sign up with</span>
                  </div>
                </div>

                <button
                  type="button"
                  disabled={true}
                  className="w-full bg-white border-2 border-gray-300 text-gray-700 hover:bg-gray-50 text-base py-2.5 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 mt-4"
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
                  Sign up with Google
                  <span className="ml-auto text-xs bg-gray-200 px-2 py-0.5 rounded">Coming Soon</span>
                </button>

                <p className="text-center text-sm text-gray-600 mt-6">
                  Already have an account?{" "}
                  <Link to="/login" className="font-medium text-[#0b6e4f] hover:underline">
                    Login
                  </Link>
                </p>
              </div>
            )}
          </motion.form>
        </AnimatePresence>
      </div>
    </div>
  );
}

/* === Helper Inputs === */
function Input({ label, error, ...props }) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-sm font-medium text-gray-800">{label}</label>
      <input
        {...props}
        className={`border border-gray-300 rounded-lg p-2 focus:border-[#0b6e4f] focus:ring-[#0b6e4f] focus:ring-1 ${
          error ? "border-red-500" : ""
        }`}
      />
      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  );
}

function Select({ label, options, ...props }) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-sm font-medium text-gray-800">{label}</label>
      <select
        {...props}
        className="border border-gray-300 rounded-lg p-2 focus:ring-[#0b6e4f] focus:border-[#0b6e4f]"
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
}
