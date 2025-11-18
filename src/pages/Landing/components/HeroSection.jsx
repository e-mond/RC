import { Link } from "react-router-dom";
import { motion } from "framer-motion";
void motion; 
import { PrimaryButton, SecondaryButton } from "@/components/ui/Button"; 
import heroImage from "../../../assets/images/hero2.jpg";

export default function HeroSection() {
  // Animation variants for parent and children
  const container = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.7,
        ease: "easeOut",
        when: "beforeChildren",
        staggerChildren: 0.15, // each child fades slightly after the previous
      },
    },
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
  };

  const imageVariant = {
    hidden: { opacity: 0, x: 50 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.8, ease: "easeOut" } },
  };

  return (
    <section className="bg-[#f5f0f0] py-32 overflow-hidden pt-10 md:pt-16">
      <div className="max-w-7xl mx-auto px-10 flex flex-col md:flex-row items-center justify-between gap-10">

        {/* LEFT SIDE: text content */}
        <motion.div
          className="md:w-1/2 space-y-5"
          variants={container}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          <motion.span
            className="inline-block px-3 py-1 text-xs font-medium text-gray-600 bg-gray-100 rounded-full"
            variants={item}
          >
             Trust • Transparency • Efficiency
          </motion.span>

          <motion.h1
            className="text-4xl font-bold text-[#0f1724] leading-tight"
            variants={item}
          >
            Rent Smarter. <br /> Live Better.
          </motion.h1>

          <motion.p
            className="text-gray-600 text-base leading-relaxed"
            variants={item}
          >
            Rental Connects streamlines Ghana’s rental ecosystem with verified listings,
            secure payments, and seamless communication for tenants, landlords, and artisans.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div 
          className="flex flex-wrap gap-4 pt-2 sm:flex-row sm:gap-4" variants={item}>
            
            <PrimaryButton  className="px-6  bg-[#0b6e4f] hover:bg-[#095c42] text-white text-base py-2.5 rounded-lg font-medium transition-colors" as={Link} to="/role-selection">
              Get Started
            </PrimaryButton>

            <SecondaryButton  variant="outline" className="px-6  border text-base py-2.5 rounded-lg font-medium transition-colors" as={Link} to="/learn-more">
              Learn More
            </SecondaryButton>
          </motion.div>
        </motion.div>

        {/* RIGHT SIDE: hero image */}
        <motion.div
          className="md:w-1/2 flex justify-center"
          variants={imageVariant}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          <img
            src={heroImage}
            alt="Modern rental apartments"
            className="rounded-xl shadow-sm w-full max-w-md object-cover"
          />
        </motion.div>
      </div>
    </section>
  );
}
