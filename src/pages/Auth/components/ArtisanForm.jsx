import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { signupArtisan } from "@/services/authService";
import ProgressIndicator from "@/components/onboarding/ProgressIndicator";
import { PrimaryButton, SecondaryButton } from "@/components/ui/Button";
import artisan_onboarding from "@/assets/images/artisan_onboarding.jpeg";

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

  /** Submit to API */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const finalProfession =
        form.profession === "other" ? form.otherProfession : form.profession;

      const formData = new FormData();
      formData.append("fullName", form.fullName);
      formData.append("email", form.email);
      formData.append("phone", form.phone);
      formData.append("password", form.password);
      formData.append("confirmPassword", form.confirmPassword);
      formData.append("profession", finalProfession);
      formData.append("experience", form.experience);
      formData.append("region", form.region);
      if (form.idUpload) {
        formData.append("idUpload", form.idUpload);
      }
      formData.append("agree", String(form.agree));

      await signupArtisan(formData);

      // After successful signup, send artisan to login so they authenticate
      navigate("/login");
    } catch (err) {
      setError(
        err.response?.data?.message || "Signup failed. Please try again."
      );
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
                  name="fullName"
                  placeholder="Full Name"
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#0b6e4f] focus:outline-none"
                  required
                />
                <input
                  type="email"
                  name="email"
                  placeholder="Email Address"
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#0b6e4f] focus:outline-none"
                  required
                />
                <input
                  name="phone"
                  placeholder="Phone Number"
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#0b6e4f] focus:outline-none"
                  required
                />
                <input
                  type="password"
                  name="password"
                  placeholder="Password"
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#0b6e4f] focus:outline-none"
                  required
                />
                <input
                  type="password"
                  name="confirmPassword"
                  placeholder="Confirm Password"
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#0b6e4f] focus:outline-none"
                  required
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
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#0b6e4f] focus:outline-none"
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
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#0b6e4f] focus:outline-none"
                    required
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.25 }}
                  />
                )}

                <input
                  name="experience"
                  placeholder="Years of Experience"
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#0b6e4f] focus:outline-none"
                  required
                />
                <input
                  name="region"
                  placeholder="Service Region / City"
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#0b6e4f] focus:outline-none"
                  required
                />
                <input
                  type="file"
                  name="idUpload"
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 file:mr-3 file:px-4 file:py-2 file:border-0 file:bg-[#0b6e4f] file:text-white file:rounded-lg hover:file:bg-[#095b40]"
                  required
                />

                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    name="agree"
                    onChange={handleChange}
                    required
                  />{" "}
                  I agree to the Terms & Conditions
                </label>

                <div className="flex gap-3">
                  <SecondaryButton onClick={handleBack} className="w-1/2">
                    Back
                  </SecondaryButton>
                  <PrimaryButton
                    type="submit"
                    disabled={loading}
                    className="w-1/2 bg-[#0b6e4f] hover:bg-[#095c42] text-white text-base py-2.5 rounded-lg font-medium transition-colors"
                  >
                    {loading ? "Creating..." : "Create Account"}
                  </PrimaryButton>
                </div>

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
      </div>
    </div>
  );
}