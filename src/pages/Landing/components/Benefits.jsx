import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/Card";
import img1 from "../../../assets/images/secure-rental.jpg";
import img2 from "../../../assets/images/easy-payment.jpg";
import img3 from "../../../assets/images/artisan-network.jpg";

export default function Benefits() {
  const container = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
      },
    },
  };

  const headerItem = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
  };

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
          variants={headerItem}
        >
          Benefits
        </motion.h4>
        <motion.h2
          className="text-3xl md:text-4xl font-bold text-[#0f1724] mb-4 leading-snug"
          variants={headerItem}
        >
          Designed for tenants, landlords, <br /> and service providers
        </motion.h2>
        <motion.p
          className="text-gray-600 text-base"
          variants={headerItem}
        >
          Empowering every participant in Ghana’s rental ecosystem.
        </motion.p>
      </motion.div>

      {/* === BENEFIT CARDS (Using <Card />) === */}
      <motion.div
        className="grid gap-8 md:grid-cols-3 max-w-6xl mx-auto"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        variants={container}
      >
        <Card
         imageSrc={img1}
          title="Secure rental search"
          description="Find verified properties with comprehensive background checks."
          index={0}
        />

        <Card
           imageSrc={img2}
          title="Easy payment solutions"
          description="Digital transactions with transparent fee structures."
          index={1}
        />

        <Card
          imageSrc={img3}
          title="Artisan network"
          description="Access trusted maintenance professionals for property needs."
          index={2}
        />
      </motion.div>

      {/* === CTA BUTTONS === */}
      <motion.div
        className="mt-12 flex justify-center gap-4 sm:gap-4 w-full px-4"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay: 0.4 }}
      >
        <Link
          to="/role-selection"
          className="px-6 py-3 bg-[#0b6e4f] text-white font-medium rounded-lg hover:bg-[#095c42] transition text-center w-full sm:w-auto"
        >
          Join Now
        </Link>

        <Link
          to="/learn-more"
          className="px-6 py-3 border border-gray-300 text-gray-800 font-medium rounded-lg hover:bg-gray-100 transition flex items-center justify-center gap-2 text-center w-full sm:w-auto"
        >
          Learn More
        </Link>
      </motion.div>
    </section>
  );
}