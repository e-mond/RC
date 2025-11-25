import { useState } from "react";
import { PrimaryButton } from "@/components/ui/Button";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import ProgressIndicator from "@/components/onboarding/ProgressIndicator";
import { registerTenant } from "@/services/tenantService";
import tenant_onboarding from "@/assets/images/tenant_onboarding.jpg";

export default function TenantSignup() {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    location: "",
    rentRange: "",
    idUpload: null,
    agree: false,
  });
  const [passwordMatch, setPasswordMatch] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState(null);

  /** Handle all field changes */
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

  /** Step transition validation */
  const handleNext = () => {
    if (
      !form.fullName ||
      !form.email ||
      !form.phone ||
      !form.password ||
      !form.confirmPassword ||
      !passwordMatch
    )
      return alert("Please fill out all required fields correctly.");
    setStep(2);
  };
  const handlePrev = () => setStep(1);

  /** Submit to API */
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.agree) return setMessage({ type: "error", text: "Please accept Terms & Conditions." });

    try {
      setIsSubmitting(true);
      setMessage(null);

      const formData = new FormData();
      Object.entries(form).forEach(([key, value]) => {
        if (value !== null) formData.append(key, value);
      });

      const res = await registerTenant(formData);
      setMessage({ type: "success", text: res.message || "Account created successfully!" });

      // Optional: redirect to login after delay
      setTimeout(() => (window.location.href = "/login"), 1800);
    } catch (err) {
      setMessage({ type: "error", text: err.message });
    } finally {
      setIsSubmitting(false);
    }
  };

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
             src={tenant_onboarding}
          alt="Tenant onboarding"
          className="object-cover w-full h-full"
        />
        <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
          <p className="text-white text-xl font-semibold text-center px-6">
            “Find your next home with trusted landlords and verified listings.”
          </p>
        </div>
      </motion.div>

      {/* RIGHT FORM */}
      <div className="w-full md:w-1/2 p-8 md:p-10">
        <ProgressIndicator step={2} label="Tenant Signup" totalSteps={2} />

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
              <h2 className="text-3xl font-bold text-[#0f1724]">Tenant Signup</h2>
              <p className="text-base text-gray-600">
                Step {step} of 2 — {step === 1 ? "Personal Info" : "Rental Preferences"}
              </p>
            </header>

            {/* STEP 1 */}
            {step === 1 && (
              <div className="space-y-6">
                <LabelInput label="Full Name" name="fullName" value={form.fullName} onChange={handleChange} required />
                <LabelInput label="Email Address" name="email" type="email" value={form.email} onChange={handleChange} required />
                <LabelInput label="Phone Number" name="phone" value={form.phone} onChange={handleChange} required />

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <LabelInput label="Password" name="password" type="password" value={form.password} onChange={handleChange} required />
                  <LabelInput
                    label="Confirm Password"
                    name="confirmPassword"
                    type="password"
                    value={form.confirmPassword}
                    onChange={handleChange}
                    required
                    error={!passwordMatch ? "Passwords do not match" : ""}
                  />
                </div>

                <PrimaryButton onClick={handleNext} type="button" className="w-full bg-[#0b6e4f] hover:bg-[#095c42] text-white text-base py-2.5 rounded-lg font-medium transition-colors">
                  Continue
                </PrimaryButton>
              </div>
            )}

            {/* STEP 2 */}
            {step === 2 && (
              <div className="space-y-6">
                <LabelInput label="Preferred Location / Region" name="location" value={form.location} onChange={handleChange} required />
                <div className="flex flex-col gap-1">
                  <label htmlFor="rentRange" className="text-sm font-medium text-gray-800">
                    Monthly Rent Range
                  </label>
                  <select
                    id="rentRange"
                    name="rentRange"
                    value={form.rentRange}
                    onChange={handleChange}
                    className="border border-gray-300 rounded-lg p-2 focus:ring-[#0b6e4f] focus:border-[#0b6e4f]"
                    required
                  >
                    <option value="">Select Range</option>
                    <option value="below_1000">Below ₵1000</option>
                    <option value="1000_3000">₵1000 - ₵3000</option>
                    <option value="above_3000">Above ₵3000</option>
                  </select>
                </div>

                <div className="flex flex-col gap-1">
                  <label htmlFor="idUpload" className="text-sm font-medium text-gray-800">
                    Upload ID (Driver’s License / Voter ID / Passport)
                  </label>
                  <input
                    id="idUpload"
                    name="idUpload"
                    type="file"
                    accept="image/*,.pdf"
                    onChange={handleChange}
                    className="border border-gray-300 rounded-lg p-2 file:py-2 file:px-4 file:rounded-lg file:border file:border-gray-300 file:bg-gray-50 hover:file:bg-gray-100"
                  />
                  {form.idUpload && (
                    <p className="text-sm text-gray-600 mt-1">
                      Selected: <span className="font-medium">{form.idUpload.name}</span>
                    </p>
                  )}
                </div>

                <label className="flex items-center gap-3 text-sm text-gray-700 cursor-pointer">
                  <input type="checkbox" name="agree" checked={form.agree} onChange={handleChange} className="w-5 h-5 text-[#0b6e4f] border-gray-300 rounded focus:ring-[#0b6e4f]" required />
                  <span>
                    I agree to the{" "}
                    <a href="/terms" target="_blank" rel="noopener noreferrer" className="text-[#0b6e4f] underline hover:text-[#0a5d3f]">
                      Terms & Conditions
                    </a>
                  </span>
                </label>

                {message && (
                  <p className={`text-sm text-center ${message.type === "error" ? "text-red-600" : "text-green-600"}`}>{message.text}</p>
                )}

                <div className="flex items-center gap-4">
                  <PrimaryButton onClick={handlePrev} type="button"  variant="outline" className="w-1/2 border text-base py-2.5 rounded-lg font-medium transition-colors">
                    Back
                  </PrimaryButton>
                  <PrimaryButton type="submit" className="w-1/2 bg-[#0b6e4f] hover:bg-[#095c42] text-white text-nowrap text-base py-2.5 rounded-lg font-medium transition-colors" disabled={isSubmitting || !form.agree}>
                    {isSubmitting ? "Creating..." : "Create Account"}
                  </PrimaryButton>
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

/* Helper Input */
function LabelInput({ label, name, type = "text", value, onChange, required, error }) {
  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={name} className="text-sm font-medium text-gray-800">
        {label}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        required={required}
        className={`border border-gray-300 rounded-lg p-2 focus:border-[#0b6e4f] focus:ring-[#0b6e4f] focus:ring-1 ${
          error ? "border-red-500" : ""
        }`}
      />
      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  );
}
