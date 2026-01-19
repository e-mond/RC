import { useState } from "react";
import { PrimaryButton } from "@/components/ui/Button";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import ProgressIndicator from "@/components/onboarding/ProgressIndicator";
import { registerTenant } from "@/services/tenantService";
import tenant_onboarding from "@/assets/images/tenant_onboarding.jpg";
import TermsPrivacyModal from "@/components/legal/TermsPrivacyModal";

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
  const [termsAgreed, setTermsAgreed] = useState(false);
  const [privacyAgreed, setPrivacyAgreed] = useState(false);
  const [modalOpen, setModalOpen] = useState(null); // 'terms' | 'privacy' | null

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

  const handleModalAgree = (type) => {
    if (type === "terms") {
      setTermsAgreed(true);
    } else if (type === "privacy") {
      setPrivacyAgreed(true);
    }
    // Auto-check the main agree checkbox when both are agreed
    if ((type === "terms" && privacyAgreed) || (type === "privacy" && termsAgreed)) {
      setForm((prev) => ({ ...prev, agree: true }));
    }
  };

  /** Submit to API */
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!termsAgreed || !privacyAgreed) {
      return setMessage({ type: "error", text: "Please read and agree to both Terms & Conditions and Privacy Policy." });
    }
    if (!form.agree) return setMessage({ type: "error", text: "Please accept Terms & Conditions." });

    try {
      setIsSubmitting(true);
      setMessage(null);

      // Map frontend field names to backend expected field names
      // Based on backend error, it expects camelCase: fullName, confirmPassword
      const formData = new FormData();
      
      // Required fields - backend expects camelCase based on error response
      if (!form.email || !form.password || !form.fullName || !form.phone || !form.confirmPassword) {
        setMessage({ type: "error", text: "Please fill in all required fields." });
        setIsSubmitting(false);
        return;
      }
      
      // Backend expects camelCase field names (based on error response)
      formData.append("email", form.email.trim());
      formData.append("password", form.password);
      formData.append("fullName", form.fullName.trim()); // Backend expects camelCase: fullName
      formData.append("phone", form.phone.trim());
      formData.append("confirmPassword", form.confirmPassword); // Backend expects confirmPassword
      
      // Optional fields
      if (form.idUpload) {
        formData.append("idUpload", form.idUpload); // Keep camelCase: idUpload
      }
      
      // Debug: Log what we're sending (remove in production)
      console.log("Sending signup data:", {
        email: form.email.trim(),
        fullName: form.fullName.trim(), // camelCase
        phone: form.phone.trim(),
        has_password: !!form.password,
        has_confirmPassword: !!form.confirmPassword,
        has_idUpload: !!form.idUpload
      });
      
      // Verify FormData contents before sending
      if (import.meta.env.DEV) {
        console.log("FormData entries:");
        for (const [key, value] of formData.entries()) {
          console.log(`  ${key}:`, value instanceof File ? `File: ${value.name}` : value);
        }
      }
      
      // Note: location, rentRange are frontend-only and NOT sent to backend
      // Backend expects: email, password, fullName (camelCase), phone, confirmPassword, idUpload (optional)

      const res = await registerTenant(formData);
      
      // Redirect to success page with role and email
      window.location.href = `/signup-success?role=tenant&email=${encodeURIComponent(form.email)}`;
    } catch (err) {
      // Extract user-friendly error message
      const errorMessage = err?.message || err?.response?.data?.message || "Signup failed. Please try again.";
      setMessage({ type: "error", text: errorMessage });
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
            noValidate
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
                    className="border border-gray-300 rounded-lg p-2 bg-gray-100 text-gray-900 focus:ring-[#0b6e4f] focus:border-[#0b6e4f] focus:bg-white"
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

                <div className="space-y-3">
                  <label className="flex items-center gap-3 text-sm text-gray-700 cursor-pointer">
                    <input 
                      type="checkbox" 
                      name="agree" 
                      checked={form.agree && termsAgreed && privacyAgreed} 
                      onChange={(e) => {
                        if (!termsAgreed || !privacyAgreed) {
                          setMessage({ type: "error", text: "Please read both Terms & Conditions and Privacy Policy first." });
                          return;
                        }
                        handleChange(e);
                      }} 
                      className="w-5 h-5 text-[#0b6e4f] border-gray-300 rounded focus:ring-[#0b6e4f]" 
                      required 
                    />
                    <span>
                      I have read and agree to the{" "}
                      <button
                        type="button"
                        onClick={() => setModalOpen("terms")}
                        className="text-[#0b6e4f] underline hover:text-[#0a5d3f] font-medium"
                      >
                        Terms & Conditions
                      </button>
                      {" "}and{" "}
                      <button
                        type="button"
                        onClick={() => setModalOpen("privacy")}
                        className="text-[#0b6e4f] underline hover:text-[#0a5d3f] font-medium"
                      >
                        Privacy Policy
                      </button>
                    </span>
                  </label>
                  {(!termsAgreed || !privacyAgreed) && (
                    <p className="text-xs text-amber-600">
                      {!termsAgreed && !privacyAgreed 
                        ? "Please read both Terms & Conditions and Privacy Policy" 
                        : !termsAgreed 
                        ? "Please read Terms & Conditions" 
                        : "Please read Privacy Policy"}
                    </p>
                  )}
                </div>

                {message && (
                  <p className={`text-sm text-center ${message.type === "error" ? "text-red-600" : "text-green-600"}`}>{message.text}</p>
                )}

                <div className="flex items-center gap-4">
                  <PrimaryButton onClick={handlePrev} type="button"  variant="outline" className="w-1/2 border text-base py-2.5 rounded-lg font-medium transition-colors">
                    Back
                  </PrimaryButton>
                  <PrimaryButton type="submit" className="w-1/2 bg-[#0b6e4f] hover:bg-[#095c42] text-white text-nowrap text-base py-2.5 rounded-lg font-medium transition-colors" disabled={isSubmitting || !form.agree || !termsAgreed || !privacyAgreed}>
                    {isSubmitting ? "Creating..." : "Create Account"}
                  </PrimaryButton>
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

        {/* Terms & Privacy Modals */}
        <TermsPrivacyModal
          type="terms"
          isOpen={modalOpen === "terms"}
          onClose={() => setModalOpen(null)}
          onAgree={handleModalAgree}
        />
        <TermsPrivacyModal
          type="privacy"
          isOpen={modalOpen === "privacy"}
          onClose={() => setModalOpen(null)}
          onAgree={handleModalAgree}
        />
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
        className={`border border-gray-300 rounded-lg p-2 bg-gray-100 text-gray-900 placeholder:text-gray-500 focus:border-[#0b6e4f] focus:ring-[#0b6e4f] focus:ring-1 focus:bg-white ${
          error ? "border-red-500" : ""
        }`}
      />
      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  );
}
