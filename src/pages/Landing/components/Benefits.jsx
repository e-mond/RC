import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import secureRental from "@/assets/images/secure-rental.jpg";
import easyPayment from "@/assets/images/easy-payment.jpg";
import artisanNetwork from "@/assets/images/artisan-network.jpg";

const container = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.15, delayChildren: 0.2 },
  },
};

const cardVariant = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: "easeOut" },
  },
};

export default function Benefits() {
  return (
    <section
      id="benefits"
      className="bg-sectionBg py-20 px-6 md:px-12 lg:px-24 text-center"
    >
      {/* === HEADER === */}
      <motion.div
        className="max-w-3xl mx-auto mb-16"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        variants={container}
      >
        <motion.h4
          className="text-sm font-semibold text-[#0b6e4f] mb-2 uppercase tracking-wide"
          variants={cardVariant}
        >
          Benefits
        </motion.h4>
        <motion.h2
          className="text-3xl md:text-4xl font-bold text-[#0f1724] mb-4 leading-snug"
          variants={cardVariant}
        >
          Designed for tenants, landlords, <br /> and service providers
        </motion.h2>
        <motion.p className="text-gray-600 text-base" variants={cardVariant}>
          Empowering every participant in Ghana’s rental ecosystem.
        </motion.p>
      </motion.div>

      {/* === BENEFIT CARDS === */}
      <motion.div
        className="grid gap-8 md:grid-cols-3 max-w-6xl mx-auto"
        variants={container}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.3 }}
      >
        {/* Secure rental search */}
        <motion.div
          className="bg-[#f5f0f0] rounded-2xl shadow-sm hover:shadow-md transition p-6"
          variants={cardVariant}
          whileHover={{ y: -8, transition: { duration: 0.3 } }}
        >
          <div className="w-full h-48 rounded-xl mb-6 overflow-hidden">
            <img
              src={secureRental}
              alt="Secure rental search"
              className="w-full h-full object-cover"
            />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Secure rental search
          </h3>
          <p className="text-gray-600 text-sm">
            Find verified properties with comprehensive background checks.
          </p>
        </motion.div>

        {/* Easy payment solutions */}
        <motion.div
          className="bg-[#f5f0f0] rounded-2xl shadow-sm hover:shadow-md transition p-6"
          variants={cardVariant}
          whileHover={{ y: -8, transition: { duration: 0.3 } }}
        >
          <div className="w-full h-48 rounded-xl mb-6 overflow-hidden">
            <img
              src={easyPayment}
              alt="Easy payment solutions"
              className="w-full h-full object-cover"
            />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Easy payment solutions
          </h3>
          <p className="text-gray-600 text-sm">
            Digital transactions with transparent fee structures.
          </p>
        </motion.div>

        {/* Artisan network */}
        <motion.div
          className="bg-[#f5f0f0] rounded-2xl shadow-sm hover:shadow-md transition p-6"
          variants={cardVariant}
          whileHover={{ y: -8, transition: { duration: 0.3 } }}
        >
          <div className="w-full h-48 rounded-xl mb-6 overflow-hidden">
            <img
              src={artisanNetwork}
              alt="Artisan network"
              className="w-full h-full object-cover"
            />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Artisan network
          </h3>
          <p className="text-gray-600 text-sm">
            Access trusted maintenance professionals for property needs.
          </p>
        </motion.div>
      </motion.div>

      {/* === CTA BUTTONS === */}
      <motion.div
        className="mt-12 flex justify-center gap-4"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        viewport={{ once: true }}
      >
        <Link
          to="/role-selection"
          className="px-6 py-3 bg-[#0b6e4f] text-white font-medium rounded-lg hover:bg-[#095c42] transition"
        >
          Join now
        </Link>
        <Link
          to="/learn-more"
          className="px-6 py-3 border border-gray-300 text-gray-800 font-medium rounded-lg hover:bg-gray-100 transition flex items-center gap-2"
        >
          Learn more
        </Link>
      </motion.div>
    </section>
  );
}