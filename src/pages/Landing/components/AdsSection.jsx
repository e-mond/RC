import { Sparkles, MapPin, Star } from "lucide-react";
import { motion } from "framer-motion";
import adsPromo from "@/assets/images/ads-promo.jpg";

export default function AdsSection() {

  const container = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.2,
      },
    },
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, ease: "easeOut" },
    },
  };

  const imageVariant = {
    hidden: { opacity: 0, x: 50 },
    visible: {
      opacity: 1,
      x: 0,
      transition: { duration: 0.7, ease: "easeOut" },
    },
  };

  return (
    <section id="advertise" className="bg-[#d6f3f0] py-20">
      <div className="max-w-6xl mx-auto px-6">
        <motion.div
          className="grid md:grid-cols-2 gap-10 items-center"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          variants={container}
        >
          {/* --- Left Text Content --- */}
          <motion.div variants={item}>
            <motion.h2
              className="text-2xl md:text-3xl font-semibold text-gray-900 mb-2"
              variants={item}
            >
              Advertisement
            </motion.h2>
            <motion.p
              className="text-gray-600 mb-8"
              variants={item}
            >
              Promote listings and services to the right audience.
            </motion.p>

            {/* --- Promotion Opportunities Card --- */}
            <motion.div
              className="bg-white p-6 rounded-xl shadow-sm border border-gray-100"
              variants={item}
              whileHover={{
                y: -6,
                boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1)",
                transition: { duration: 0.3 },
              }}
            >
              <motion.h3
                className="text-lg font-semibold text-gray-900 mb-2"
                variants={item}
              >
                Promotion Opportunities
              </motion.h3>
              <motion.p
                className="text-gray-600 text-sm mb-5 leading-relaxed"
                variants={item}
              >
                Boost visibility with sponsored listings, featured placements, and
                city-level highlights. Ideal for landlords and service providers
                growing their reach.
              </motion.p>

              <motion.ul className="space-y-3 text-sm text-gray-700">
                {[
                  { icon: Sparkles, text: "Sponsored spots in search" },
                  { icon: MapPin, text: "Featured on neighborhood maps" },
                  { icon: Star, text: "Top picks on the homepage" },
                ].map((li, idx) => (
                  <motion.li
                    key={idx}
                    className="flex items-center gap-2"
                    variants={item}
                  >
                    <li.icon className="text-teal-600 w-5 h-5 shrink-0" />

                    {li.text}
                  </motion.li>
                ))}
              </motion.ul>
            </motion.div>
          </motion.div>

          {/* --- Right Image --- */}
          <motion.div
            className="flex justify-center md:justify-end"
            variants={imageVariant}
          >
            <img
              src={adsPromo}
              alt="Advertisement promotion"
              className="rounded-xl w-full max-w-md object-cover shadow-md"
            />
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}