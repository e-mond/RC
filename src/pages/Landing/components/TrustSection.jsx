import { useState } from "react";
import { Link } from "react-router-dom"; 
import { ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
// import { Link } from "react-router-dom";
import verificationImg from "@/assets/images/verifications.jpg";
import backgroundChecksImg from "@/assets/images/background-checks.jpg";
import fraudPreventionImg from "@/assets/images/fraud-prevention.jpg";


const tabs = [
  {
    id: "verification",
    label: "User verification",
    title: "Comprehensive user background checks",
    subtitle: "Verification",
    description:
      "Every user undergoes detailed screening to ensure platform integrity.",
    image: verificationImg,
    primaryAction: "Verify",
    secondaryAction: "Explore",
  },
  {
    id: "background",
    label: "Background checks",
    title: "Reliable screening for all tenants and landlords",
    subtitle: "Screening",
    description:
      "We use trusted verification partners to ensure safe and secure rentals.",
    image: backgroundChecksImg,
    primaryAction: "Start check",
    secondaryAction: "Learn more",
  },
  {
    id: "fraud",
    label: "Fraud prevention",
    title: "Proactive fraud monitoring and prevention",
    subtitle: "Security",
    description:
      "Advanced detection systems protect your identity and transactions in real-time.",
    image: fraudPreventionImg,
    primaryAction: "Protect now",
    secondaryAction: "Discover",
  },
];

export default function TrustSection() {
  const [activeTab, setActiveTab] = useState("verification");

  const activeContent = tabs.find((t) => t.id === activeTab) || tabs[0];

  /* ---------------- Animation Variants ----------------------- */
  const container = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1, delayChildren: 0.2 },
    },
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  };

  const imageVariant = {
    hidden: { opacity: 0, scale: 1.1 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: { duration: 0.8, ease: "easeOut" },
    },
  };

  return (
    <section id="trust" className="bg-[#fafafa] py-24">
      <div className="max-w-6xl mx-auto px-6">
        {/* --- Header --- */}
        <motion.div
          className="text-center mb-12"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          variants={container}
        >
          <motion.h4
            className="text-sm font-semibold text-[#0b6e4f] mb-2 uppercase tracking-wide"
            variants={item}
          >
            Trust
          </motion.h4>
          <motion.h2
            className="text-4xl font-semibold text-gray-900 mb-3"
            variants={item}
          >
            Secure rental ecosystem
          </motion.h2>
          <motion.p className="text-gray-600 mb-6" variants={item}>
            We protect your interests through rigorous verification and transparent processes.
          </motion.p>
          <motion.div className="flex justify-center gap-3" variants={item}>
            <Link
              to="/learn-more"
              className="px-5 py-2 text-sm border border-gray-300 rounded-full hover:bg-gray-100 transition"
            >
              Learn
            </Link>
            <Link
              to="/role-selection"
              className="px-5 py-2 text-sm bg-black text-white rounded-full hover:bg-gray-800 transition flex items-center gap-1"
            >
            </Link>
            <Link
              to="/role-selection"
              className="px-5 py-2 text-sm bg-black text-white rounded-full hover:bg-gray-800 transition flex items-center gap-1"
            >
              Explore <ArrowRight size={16} />
            </Link>
          </motion.div>
        </motion.div>

        {/* --- Tabs --- */}
        <div className="flex justify-center gap-8 mb-10 border-b border-gray-200">
          {tabs.map((tab) => (
            <motion.button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`pb-3 text-sm font-medium transition-colors relative ${
                activeTab === tab.id
                  ? "text-black"
                  : "text-gray-500 hover:text-gray-800"
              }`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {tab.label}
              {activeTab === tab.id && (
                <motion.span
                  layoutId="tab-underline"
                  className="absolute left-0 right-0 -bottom-px mx-auto h-0.5 bg-black rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: "75%" }}
                  exit={{ width: 0 }}
                  transition={{ duration: 0.3 }}
                />
              )}
            </motion.button>
          ))}
        </div>

        {/* --- Content Card --- */}
        <motion.div
          className="flex flex-col md:flex-row bg-white rounded-2xl overflow-hidden shadow-sm"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          variants={container}
        >
          {/* Text Section */}
          <motion.div
            className="w-full md:w-1/2 p-10 flex flex-col justify-center"
            variants={item}
            key={activeTab}
          >
            <motion.p
              className="text-xs uppercase text-gray-500 font-semibold mb-2"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.1 }}
            >
              {activeContent.subtitle}
            </motion.p>
            <motion.h3
              className="text-2xl font-bold text-gray-900 mb-4"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              {activeContent.title}
            </motion.h3>
            <motion.p
              className="text-gray-600 mb-8"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              {activeContent.description}
            </motion.p>
            <motion.div
              className="flex gap-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              <Link
                to="/role-selection"
                className="px-5 py-2 border border-gray-300 rounded-full text-sm hover:bg-gray-100 transition"
              >
                {activeContent.primaryAction}
              </Link>
              <Link
                to="/role-selection"
                className="flex items-center gap-1 text-sm font-medium text-gray-900 hover:underline"
              >
                {activeContent.secondaryAction} <ArrowRight size={14} />
              </Link>
            </motion.div>
          </motion.div>

          {/* Image Section */}
          <motion.div
            className="w-full md:w-1/2 h-80 md:h-auto relative overflow-hidden"
            variants={imageVariant}
            key={`img-${activeTab}`}
          >
            <img
              src={activeContent.image}
              alt={activeContent.title}
              className="w-full h-full object-cover"
              loading="lazy"
            />
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}