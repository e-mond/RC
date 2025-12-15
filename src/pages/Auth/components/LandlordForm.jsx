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
      const formData = new FormData();
      Object.entries(form).forEach(([key, value]) => {
        // Backend serializer does not expect "agree" for landlords; avoid sending it
        if (key === "agree") return;
        if (value !== null) formData.append(key, value);
      });

      const data = await signupUser("landlord", formData);
      console.log("Signup success:", data);

      setMessage({ type: "success", text: "Account created successfully!" });
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
