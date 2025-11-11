// src/components/onboarding/OnboardingFooter.jsx
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

export default function OnboardingFooter() {
  return (
    <motion.footer
      className="mt-12 text-gray-500 text-sm text-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.3 }}
    >
      © {new Date().getFullYear()} Rental Connects ·{" "}
      <Link to="/terms" className="hover:text-[#0b6e4f]">
        Terms
      </Link>{" "}
      ·{" "}
      <Link to="/privacy" className="hover:text-[#0b6e4f]">
        Privacy
      </Link>
    </motion.footer>
  );
}
