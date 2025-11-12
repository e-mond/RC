import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { PrimaryButton } from "@/components/ui/Button";
import heroBg from "@/assets/images/hero2.jpg";

export default function HeroLearn() {
  return (
    <section
      className="relative bg-cover bg-center text-white pt-20 md:pt-24"
      style={{ backgroundImage: `url(${heroBg})` }}
    >
      {/* Dark gradient overlay */}
      <div className="absolute inset-0 bg-linear-to-r from-black/70 to-teal-800/50" />

      {/* Content */}
      <div className="relative z-10 max-w-6xl mx-auto py-20 px-6 text-center">
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-4xl md:text-5xl font-bold mb-4 leading-tight"
        >
          Transforming the Way Ghana Rents, Lives, and Works
        </motion.h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="max-w-3xl mx-auto text-gray-100 text-lg mb-8"
        >
          Learn how Rental Connects empowers tenants, landlords, and artisans with trust,
          transparency, and smarter digital tools.
        </motion.p>

        <PrimaryButton
          as={Link}
          to="/role-selection"
          className="px-6 py-3 bg-[#0b6e4f] text-white font-medium rounded-lg hover:bg-[#095c42] transition"
        >
          Get Started
        </PrimaryButton>
      </div>
    </section>
  );
}