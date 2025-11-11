import {
  FaCheckCircle,
  FaMoneyBillWave,
  FaTools,
  FaComments,
  FaMapMarkedAlt,
  FaBell,
} from "react-icons/fa";
import { motion } from "framer-motion";

// Animation Variants
const container = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.15, delayChildren: 0.2 },
  },
};

const cardVariant = {
  hidden: { opacity: 0, y: 40 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: "easeOut" },
  },
};

export default function FeaturesSection() {
  return (
    <section id="features" className="bg-[#f5f0f0] py-16 overflow-hidden">
      <div className="max-w-7xl mx-auto px-6">
        {/* === SECTION HEADER === */}
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <h4 className="text-sm font-semibold text-[#0b6e4f] mb-2 uppercase tracking-wide">
            Features
          </h4>
          <h2 className="text-2xl md:text-3xl font-bold text-[#0f1724] mb-2">
            Core Features
          </h2>
          <p className="text-gray-600">
            Tools that make renting straightforward for everyone.
          </p>
        </motion.div>

        {/* === TOP ROW: FOUR SMALL FEATURES === */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6"
          variants={container}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
        >
          <FeatureCard
            icon={<FaCheckCircle className="text-[#0b6e4f] text-2xl" />}
            title="Verified Listings"
            description="Every listing is checked for accuracy with badges that build trust."
          />
          <FeatureCard
            icon={<FaMoneyBillWave className="text-[#0b6e4f] text-2xl" />}
            title="Digital Rent Payments"
            description="Pay with secure digital channels and get instant receipts."
          />
          <FeatureCard
            icon={<FaTools className="text-[#0b6e4f] text-2xl" />}
            title="Maintenance Tracking"
            description="Log issues, assign artisans, and follow progress to resolution."
          />
          <FeatureCard
            icon={<FaComments className="text-[#0b6e4f] text-2xl" />}
            title="In-App Messaging"
            description="Keep conversations and documents organized in one thread."
          />
        </motion.div>

        {/* === SECOND ROW: MAP PREVIEW + SMART ALERTS === */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 gap-6"
          variants={container}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
        >
          <motion.div
            variants={cardVariant}
            whileHover={{
              y: -10,
              scale: 1.02,
              transition: { type: "spring", stiffness: 220, damping: 15 },
            }}
            className="bg-[#ffffff] border border-[#e6e8ea] rounded-2xl p-6 shadow-sm hover:shadow-lg transition flex flex-col"
          >
            <div className="flex items-center gap-3 mb-3">
              <FaMapMarkedAlt className="text-[#0b6e4f] text-2xl" />
              <h3 className="text-lg font-semibold text-[#0f1724]">
                Map-Based Search
              </h3>
            </div>
            <p className="text-gray-600 text-sm mb-4">
              Explore neighborhoods visually and discover rentals near transit,
              schools, and work.
            </p>
            <img
              src="/assets/images/map-placeholder.jpg"
              alt="Map preview showing rental locations"
              className="rounded-lg object-cover w-full h-48 md:h-60"
            />
          </motion.div>

          <motion.div
            variants={cardVariant}
            whileHover={{
              y: -10,
              scale: 1.02,
              transition: { type: "spring", stiffness: 220, damping: 15 },
            }}
            className="bg-[#ffffff] border border-[#e6e8ea] rounded-2xl p-6 shadow-sm hover:shadow-lg transition flex flex-col"
          >
            <div className="flex items-center gap-3 mb-3">
              <FaBell className="text-[#0b6e4f] text-2xl" />
              <h3 className="text-lg font-semibold text-[#0f1724]">
                Smart Alerts
              </h3>
            </div>
            <p className="text-gray-600 text-sm">
              Get notified when new listings match your preferences.
            </p>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}

/* === Reusable FeatureCard with Framer Motion === */
function FeatureCard({ icon, title, description }) {
  return (
    <motion.div
      variants={cardVariant}
      whileHover={{
        y: -10,
        scale: 1.03,
        transition: { type: "spring", stiffness: 200, damping: 12 },
      }}
      className="bg-[#ffffff] border border-[#e6e8ea] rounded-2xl p-6 shadow-sm hover:shadow-lg transition flex flex-col"
    >
      <div className="flex items-center gap-3 mb-3">
        {icon}
        <h3 className="text-lg font-semibold text-[#0f1724]">{title}</h3>
      </div>
      <p className="text-gray-600 text-sm">{description}</p>
    </motion.div>
  );
}
