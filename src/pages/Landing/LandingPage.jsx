import { motion as Motion } from "framer-motion";
import Navbar from "../../components/layout/Navbar";
import HeroSection from "./components/HeroSection";
import FeaturesSection from "./components/FeaturesSection";
import Benefits from "./components/Benefits";
import PricingSection from "./components/PricingSection";
import AdsSection from "./components/AdsSection";
import HowItWorksSection from "./components/HowItWorksSection";
import TrustSection from "./components/TrustSection";
import JoinBanner from "./components/JoinBanner";
import Footer from "../../components/layout/Footer";
import ArticlesSection from "./components/ArticlesSection";

// --- Animation variants ---
const fadeInUp = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
};

const fadeIn = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.6 } },
};

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen font-sans bg-white text-gray-800 overflow-x-hidden">
      <Navbar />

      {/* Hero Section - Immediate Fade In */}
      <Motion.div
        initial="hidden"
        animate="visible"
        variants={fadeIn}
      >
        <HeroSection />
      </Motion.div>

      {/* How It Works */}
      <Motion.section
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        variants={fadeInUp}
      >
        <HowItWorksSection />
      </Motion.section>

      {/* Features */}
      <Motion.section
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        variants={fadeInUp}
      >
        <FeaturesSection />
      </Motion.section>

      {/* Benefits */}
      <Motion.section
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        variants={fadeInUp}
      >
        <Benefits />
      </Motion.section>

      {/* Pricing */}
      <Motion.section
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        variants={fadeInUp}
      >
        <PricingSection />
      </Motion.section>

      {/* Trust */}
      <Motion.section
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        variants={fadeInUp}
      >
        <TrustSection />
      </Motion.section>

      {/* Ads */}
      <Motion.section
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        variants={fadeInUp}
      >
        <AdsSection />
      </Motion.section>

      {/* Join Banner */}
      <Motion.section
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        variants={fadeInUp}
      >
        <JoinBanner />
      </Motion.section>

      {/* Articles */}
      <Motion.section
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        variants={fadeInUp}
      >
        <ArticlesSection />
      </Motion.section>

      {/* Footer */}
      <Footer />
    </div>
  );
}
