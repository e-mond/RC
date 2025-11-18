import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { PrimaryButton } from "@/components/ui/Button";

export default function CTABanner() {
  return (
    <section className="bg-[#f8f9f9]  border-t border-[#e6e8ea] text-[#0f1724] py-20 text-center">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
        className="max-w-2xl mx-auto px-6"
      >
        <h2 className="text-3xl font-bold mb-4">Join Ghana’s Most Trusted Rental Network</h2>
        <p className="text-gray-600 mb-8">
          Simplify your housing journey. Connect, rent, or offer services with verified people across Ghana.
        </p>
        <PrimaryButton
          as={Link}
          to="/role-selection"
          className="bg-[#0b6e4f]  text-teal-700 hover:bg-[#0b6e4f] font-semibold px-6 py-3 rounded-lg"
        >
          Sign Up Now
        </PrimaryButton>
      </motion.div>
    </section>
  );
}
