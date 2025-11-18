// src/components/onboarding/OnboardingFooter.jsx
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

export default function OnboardingFooter() {
  return (
    <motion.footer
      className="
        mt-12               /* space above the footer */
        w-full
        bg-[#f8f9f9]
        py-6                /* vertical padding (top + bottom) */
        px-4 sm:px-6 lg:px-8 /* horizontal padding – mobile → desktop */
        text-center
        text-sm
        text-gray-500
      "
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.3 }}
    >
      © {new Date().getFullYear()} Rental Connects ·{" "}
      <Link
        to="/terms"
        className="hover:text-[#0b6e4f] transition-colors"
      >
        Terms
      </Link>{" "}
      ·{" "}
      <Link
        to="/privacy"
        className="hover:text-[#0b6e4f] transition-colors"
      >
        Privacy
      </Link>
    </motion.footer>
  );
}