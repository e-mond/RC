import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { PrimaryButton } from "@/components/ui/Button";
import heroBg from "@/assets/images/hero2.jpg";

export default function HeroLearn() {
  return (
    <section
      className="relative bg-cover bg-center text-white"
      style={{ backgroundImage: `url(${heroBg})` }}
    >
      <div className="absolute inset-0 bg-gradient-to-r from-black/70 to-teal-800/50"></div>
      <div className="relative z-10 max-w-6xl mx-auto py-28 px-6 text-center">
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
          to="/signup"
          className="bg-[#0b]6e4f text-teal-700 hover:bg-gray-100 font-semibold px-6 py-3 rounded-lg"
        >
          Get Started
        </PrimaryButton>
      </div>
    </section>
  );
}
