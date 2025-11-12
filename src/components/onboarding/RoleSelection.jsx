import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Home, Building2, Wrench } from "lucide-react";
import RoleCard from "./RoleCard";
import InfoBanner from "./InfoBanner";
import ProgressIndicator from "./ProgressIndicator";
import OnboardingHeader from "./OnboardingHeader";
import OnboardingFooter from "./OnboardingFooter";

export default function RoleSelection() {
  const navigate = useNavigate();

  const handleRoleSelect = (role) => {
    localStorage.setItem("userRole", role);
    navigate("/signup");
  };

  const container = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: "easeOut",
        when: "beforeChildren",
        staggerChildren: 0.15,
      },
    },
  };

  const item = {
    hidden: { opacity: 0, y: 15 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
  };

  return (
    <motion.div
      className="min-h-screen bg-white flex flex-col items-center px-4 sm:px-6 pt-10 md:pt-16"
      variants={container}
      initial="hidden"
      animate="visible"
      exit="exit"
    >
      <OnboardingHeader />

      <motion.main className="w-full max-w-6xl text-center" variants={item}>
        <h1 className="text-2xl md:text-3xl font-semibold text-[#0f1724] mb-3">
          Join Rental Connects — Choose your role to get started
        </h1>
        <p className="text-gray-600 mb-6 text-sm md:text-base">
          Pick the role that fits how you’ll use the platform. You can add more roles later in settings.
        </p>

        <ProgressIndicator step={1} total={3} label="Choose your role" />

        <motion.div
          className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5 md:gap-6 mt-8"
          variants={container}
        >
          <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
            <RoleCard
              icon={Home}
              title="Tenant"
              description="Find verified homes, pay rent online, and track your rental history."
              onClick={() => handleRoleSelect("tenant")}
            />
          </motion.div>

          <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
            <RoleCard
              icon={Building2}
              title="Landlord"
              description="List properties, collect rent securely, and connect with trusted tenants."
              onClick={() => handleRoleSelect("landlord")}
            />
          </motion.div>

          <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
            <RoleCard
              icon={Wrench}
              title="Artisan"
              description="Offer maintenance and repair services to verified tenants and landlords."
              onClick={() => handleRoleSelect("artisan")}
            />
          </motion.div>
        </motion.div>

        <motion.div className="max-w-3xl mx-auto mt-10" variants={item}>
          <InfoBanner type="secure" />
        </motion.div>
      </motion.main>

      <OnboardingFooter />
    </motion.div>
  );
}