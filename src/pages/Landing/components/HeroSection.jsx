import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { PrimaryButton, SecondaryButton } from "@/components/ui/Button";
import heroImage from "@/assets/images/hero2.jpg";

export default function HeroSection() {
  /**
   * Parent animation container
   * - Fades in
   * - Slight upward motion
   * - Staggers children for smooth entrance
   */
  const container = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.7,
        ease: "easeOut",
        when: "beforeChildren",
        staggerChildren: 0.15,
      },
    },
  };

  /**
   * Individual item animation
   */
  const item = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, ease: "easeOut" },
    },
  };

  /**
   * Hero image animation (slides in from right)
   */
  const imageVariant = {
    hidden: { opacity: 0, x: 50 },
    visible: {
      opacity: 1,
      x: 0,
      transition: { duration: 0.8, ease: "easeOut" },
    },
  };

  return (
    <section
      className="
        bg-[#f5f0f0]
        pt-24 md:pt-32
        pb-32
      "
    >
      <div className="max-w-7xl mx-auto px-6 md:px-10 flex flex-col md:flex-row items-center justify-between gap-12">

        {/* LEFT SIDE: Text Content */}
        <motion.div
          className="md:w-1/2 space-y-6"
          variants={container}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.4 }}
        >
          {/* Trust Badge */}
          <motion.span
            className="inline-block px-3 py-1 text-xs font-medium text-gray-600 bg-gray-100 rounded-full"
            variants={item}
          >
            Trust • Transparency • Efficiency
          </motion.span>

          {/* Headline */}
          <motion.h1
            className="text-4xl md:text-5xl font-bold text-[#0f1724] leading-tight"
            variants={item}
          >
            Rent Smarter. <br /> Live Better.
          </motion.h1>

          {/* Description */}
          <motion.p
            className="text-gray-600 text-base md:text-lg leading-relaxed"
            variants={item}
          >
            Rental Connects streamlines Ghana’s rental ecosystem with verified
            listings, secure payments, and seamless communication for tenants,
            landlords, and artisans.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            className="flex flex-wrap gap-4 pt-4"
            variants={item}
          >
            <PrimaryButton as={Link} to="/role-selection">
              Get Started
            </PrimaryButton>

            <SecondaryButton as={Link} to="/learn-more">
              Learn More
            </SecondaryButton>
          </motion.div>
        </motion.div>

        {/* RIGHT SIDE: Hero Image */}
        <motion.div
          className="md:w-1/2 flex justify-center"
          variants={imageVariant}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.4 }}
        >
          <img
            src={heroImage}
            alt="Modern rental apartments"
            className="rounded-xl shadow-md w-full max-w-md object-cover"
          />
        </motion.div>
      </div>
    </section>
  );
}
