import { Newspaper, Radio } from "lucide-react";
import { motion } from "framer-motion";
import mapPlaceholder from "@/assets/images/map-placeholder.jpg";

export default function ArticlesSection() {

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
    hidden: { opacity: 0, x: -50 },
    visible: {
      opacity: 1,
      x: 0,
      transition: { duration: 0.7, ease: "easeOut" },
    },
  };

  return (
    <section className="bg-[#d6f3f0] py-20">
      <div className="max-w-6xl mx-auto px-6">
        <motion.div
          className="grid md:grid-cols-3 gap-8 items-start"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          variants={container}
        >
          {/* --- Main Article Card --- */}
          <motion.div
            className="md:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100 p-6"
            variants={item}
            whileHover={{
              y: -6,
              boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1)",
              transition: { duration: 0.3 },
            }}
          >
            <motion.h3
              className="text-lg font-semibold text-gray-900 mb-1"
              variants={item}
            >
              Ghana Living, Modernized
            </motion.h3>
            <motion.p
              className="text-gray-600 text-sm mb-4"
              variants={item}
            >
              Built for the local rental market with trusted tools and culturally aware workflows.
            </motion.p>

            {/* Image – animated from left */}
            <motion.div
              className="rounded-lg overflow-hidden"
              variants={imageVariant}
            >
              <img
                src={mapPlaceholder}
                alt="Modern apartment building in Ghana"
                className="w-full h-56 object-cover transition-transform duration-500 hover:scale-105"
              />
            </motion.div>
          </motion.div>

          {/* --- Press Mentions Card --- */}
          <motion.div
            className="bg-white rounded-xl shadow-sm border border-gray-100 p-6"
            variants={item}
            whileHover={{
              y: -6,
              boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1)",
              transition: { duration: 0.3 },
            }}
          >
            <motion.h4
              className="text-md font-semibold text-gray-900 mb-4"
              variants={item}
            >
              In the Press
            </motion.h4>

            <motion.ul className="space-y-3 text-sm text-gray-700">
              {[
                {
                  icon: Newspaper,
                  text: "Featured in emerging proptech reports",
                  href: "https://example.com/proptech-report",
                },
                {
                  icon: Radio,
                  text: "Discussed on local business radio",
                  href: "https://example.com/radio-interview",
                },
              ].map((li, idx) => (
                <motion.li
                  key={idx}
                  className="flex items-center gap-2"
                  variants={item}
                >
                <li.icon className="text-teal-600 w-5 h-5 shrink-0" />
                  <a
                    href={li.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-teal-600 hover:underline transition"
                  >
                    {li.text}
                  </a>
                </motion.li>
              ))}
            </motion.ul>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}