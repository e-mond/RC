import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { signupArtisan } from "@/services/authService";
import ProgressIndicator from "@/components/onboarding/ProgressIndicator";
import { PrimaryButton, SecondaryButton } from "@/components/ui/Button";
import artisan_onboarding from "@/assets/images/artisan_onboarding.jpeg";
import TermsPrivacyModal from "@/components/legal/TermsPrivacyModal";

export default function ArtisanForm() {
  const navigate = useNavigate();

  // Form step control
  const [step, setStep] = useState(1);

  // State management
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    profession: "",
    otherProfession: "",
    experience: "",
    region: "",
    idUpload: null,
    agree: false,
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [termsAgreed, setTermsAgreed] = useState(false);
  const [privacyAgreed, setPrivacyAgreed] = useState(false);
  const [modalOpen, setModalOpen] = useState(null);

  /** Handle field changes */
  const handleChange = (e) => {
    const { name, value, type, checked, files } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]:
        type === "checkbox" ? checked : type === "file" ? files[0] : value,
    }));
  };

  /** Proceed to next step */
  const handleNext = (e) => {
    e.preventDefault();

    if (
      !form.fullName ||
      !form.email ||
      !form.phone ||
      !form.password ||
      !form.confirmPassword
    ) {
      setError("Please fill all required fields.");
      return;
    }

    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setError("");
    setStep(2);
  };

  /** Go back to step 1 */
  const handleBack = (e) => {
    e.preventDefault();
    setError("");
    setStep(1);
  };

  const handleModalAgree = (type) => {
    if (type === "terms") {
      setTermsAgreed(true);
    } else if (type === "privacy") {
      setPrivacyAgreed(true);
    }
    if ((type === "terms" && privacyAgreed) || (type === "privacy" && termsAgreed)) {
      setForm((prev) => ({ ...prev, agree: true }));
    }
  };

  /** Submit to API */
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!termsAgreed || !privacyAgreed) {
      setError("Please read and agree to both Terms & Conditions and Privacy Policy.");
      return;
    }
    setError("");
    setLoading(true);

    try {
      const finalProfession =
        form.profession === "other" ? form.otherProfession : form.profession;

      // Map frontend field names to backend expected field names
      // Backend expects camelCase based on API reference
      const formData = new FormData();
      
      // Required fields - backend expects camelCase
      formData.append("email", form.email.trim());
      formData.append("password", form.password);
      formData.append("fullName", form.fullName.trim()); // Backend expects camelCase: fullName
      formData.append("phone", form.phone.trim());
      formData.append("confirmPassword", form.confirmPassword); // Backend expects confirmPassword
      formData.append("profession", finalProfession); // Keep camelCase: profession
      
      // Optional fields
      if (form.experience) {
        formData.append("experience", form.experience); // Keep camelCase: experience
      }
      if (form.region) {
        formData.append("region", form.region.trim()); // Keep camelCase: region
      }
      if (form.idUpload) {
        formData.append("idUpload", form.idUpload); // Keep camelCase: idUpload
      }
      
      // Debug logging
      if (import.meta.env.DEV) {
        console.log("Artisan signup data:", {
          email: form.email,
          fullName: form.fullName,
          phone: form.phone,
          profession: finalProfession,
          experience: form.experience,
          region: form.region,
          has_idUpload: !!form.idUpload
        });
      }
      
      // Note: agree is frontend-only and not sent to backend

      await signupArtisan(formData);

      // Redirect to success page with role and email
      navigate(`/signup-success?role=artisan&email=${encodeURIComponent(form.email)}`);
    } catch (err) {
      // Extract user-friendly error message (handles field-specific errors like password validation)
      const errorMessage = err?.message || err?.response?.data?.message || "Signup failed. Please check your information and try again.";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    // ---------------------------------------------------------------
    // 2. WRAPPER – flex layout (image + form) 
    // ---------------------------------------------------------------
    <div className="flex flex-col md:flex-row w-full max-w-6xl mx-auto bg-white shadow-lg rounded-2xl overflow-hidden">
      {/* LEFT IMAGE – hidden on mobile */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6 }}
        className="hidden md:flex md:w-1/2 relative bg-gray-100"
      >
        <img
          src={artisan_onboarding}
          alt="Artisan onboarding"
          className="object-cover w-full h-full"
        />
        <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
          <p className="text-white text-xl font-semibold text-center px-6">
            “Connect with clients, showcase your skills, and grow your business.”
          </p>
        </div>
      </motion.div>

      {/* RIGHT FORM – unchanged */}
      <div className="w-full md:w-1/2 p-8 md:p-10">
           <ProgressIndicator step={step} label="Artisan Signup" totalSteps={2} />
        <h2 className="text-2xl font-semibold text-[#0f1724] mb-6 text-center">
          Artisan Signup
        </h2>


        {error && <p className="text-sm text-red-500 text-center mb-4">{error}</p>}

        {/* Animated steps */}
        <AnimatePresence mode="wait">
          <motion.form
            key={step}
            onSubmit={step === 1 ? handleNext : handleSubmit}
            className="space-y-4"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.3 }}
          >
            {step === 1 ? (
              <>
                <input
                  type="text"
                  name="fullName"
                  placeholder="Full Name (e.g., John Doe)"
                  value={form.fullName}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 bg-gray-100 text-gray-900 placeholder:text-gray-500 focus:ring-2 focus:ring-[#0b6e4f] focus:outline-none focus:bg-white"
                  required
                />
                <input
                  type="email"
                  name="email"
                  placeholder="Email Address"
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 bg-gray-100 text-gray-900 placeholder:text-gray-500 focus:ring-2 focus:ring-[#0b6e4f] focus:outline-none focus:bg-white"
                  required
                />
                <input
                  type="tel"
                  name="phone"
                  placeholder="Phone Number (e.g., +233241234567)"
                  value={form.phone}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 bg-gray-100 text-gray-900 placeholder:text-gray-500 focus:ring-2 focus:ring-[#0b6e4f] focus:outline-none focus:bg-white"
                  required
                />
                <input
                  type="password"
                  name="password"
                  placeholder="Password (min. 8 characters)"
                  value={form.password}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 bg-gray-100 text-gray-900 placeholder:text-gray-500 focus:ring-2 focus:ring-[#0b6e4f] focus:outline-none focus:bg-white"
                  required
                  minLength="8"
                />
                <input
                  type="password"
                  name="confirmPassword"
                  placeholder="Confirm Password"
                  value={form.confirmPassword}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 bg-gray-100 text-gray-900 placeholder:text-gray-500 focus:ring-2 focus:ring-[#0b6e4f] focus:outline-none focus:bg-white"
                  required
                  minLength="8"
                />

                <PrimaryButton
                  type="submit"
                  disabled={loading}
                  className="w-full bg-[#0b6e4f] hover:bg-[#095c42] text-white text-base py-2.5 rounded-lg font-medium transition-colors"
                >
                  {loading ? "Loading..." : "Continue"}
                </PrimaryButton>
              </>
            ) : (
              <>
                {/* Profession Selector */}
                <select
                  name="profession"
                  onChange={handleChange}
                  value={form.profession}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 bg-gray-100 text-gray-900 focus:ring-2 focus:ring-[#0b6e4f] focus:outline-none focus:bg-white"
                  required
                >
                  <option value="">Select Profession</option>
                  <option value="plumber">Plumber</option>
                  <option value="electrician">Electrician</option>
                  <option value="carpenter">Carpenter</option>
                  <option value="mason">Mason</option>
                  <option value="painter">Painter</option>
                  <option value="other">Other (Specify Below)</option>
                </select>

                {/* Show this only if user selects "Other" */}
                {form.profession === "other" && (
                  <motion.input
                    type="text"
                    name="otherProfession"
                    placeholder="Please specify your profession"
                    value={form.otherProfession}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 bg-gray-100 text-gray-900 placeholder:text-gray-500 focus:ring-2 focus:ring-[#0b6e4f] focus:outline-none focus:bg-white"
                    required
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.25 }}
                  />
                )}

                <input
                  type="number"
                  name="experience"
                  placeholder="Years of Experience (e.g., 5)"
                  value={form.experience}
                  onChange={handleChange}
                  min="0"
                  max="50"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 bg-gray-100 text-gray-900 placeholder:text-gray-500 focus:ring-2 focus:ring-[#0b6e4f] focus:outline-none focus:bg-white"
                  required
                />
                <input
                  type="text"
                  name="region"
                  placeholder="Service Region / City (e.g., Accra, Kumasi)"
                  value={form.region}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 bg-gray-100 text-gray-900 placeholder:text-gray-500 focus:ring-2 focus:ring-[#0b6e4f] focus:outline-none focus:bg-white"
                />
                <div className="flex flex-col gap-1">
                  <label className="text-sm font-medium text-gray-700">Upload ID Document (Optional)</label>
                  <input
                    type="file"
                    name="idUpload"
                    onChange={handleChange}
                    accept="image/*,.pdf"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 file:mr-3 file:px-4 file:py-2 file:border-0 file:bg-[#0b6e4f] file:text-white file:rounded-lg hover:file:bg-[#095b40]"
                  />
                  {form.idUpload && (
                    <p className="text-xs text-gray-600 mt-1">
                      Selected: <span className="font-medium">{form.idUpload.name}</span>
                    </p>
                  )}
                </div>

                <div className="space-y-3">
                  <label className="flex items-center gap-2 text-sm text-gray-700">
                    <input
                      type="checkbox"
                      name="agree"
                      checked={form.agree && termsAgreed && privacyAgreed}
                      onChange={(e) => {
                        if (!termsAgreed || !privacyAgreed) {
                          setError("Please read both Terms & Conditions and Privacy Policy first.");
                          return;
                        }
                        handleChange(e);
                      }}
                      className="w-5 h-5 text-[#0b6e4f] border-gray-300 rounded focus:ring-[#0b6e4f]"
                      required
                    />{" "}
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

                <div className="flex gap-3">
                  <SecondaryButton onClick={handleBack} className="w-1/2">
                    Back
                  </SecondaryButton>
                  <PrimaryButton
                    type="submit"
                    disabled={loading || !form.agree || !termsAgreed || !privacyAgreed}
                    className="w-1/2 bg-[#0b6e4f] hover:bg-[#095c42] text-white text-base py-2.5 text-nowrap rounded-lg font-medium transition-colors"
                  >
                    {loading ? "Creating..." : "Create Account"}
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

                <p className="text-center text-sm text-gray-600 mt-4">
                  Connect with verified clients and grow your business.
                  <span className="block text-gray-500 mt-1">
                    Your identity will be verified before your profile goes live.
                  </span>
                  <a
                    href="/login"
                    className="block mt-2 text-[#0b6e4f] hover:underline"
                  >
                    Already have an account? Login
                  </a>
                </p>
              </>
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