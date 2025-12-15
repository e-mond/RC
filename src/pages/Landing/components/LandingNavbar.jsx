import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";

export default function Navbar() {
  const [activeSection, setActiveSection] = useState("hero");

  // Smooth scroll to section
  const scrollToSection = (id) => {
    const section = document.getElementById(id);
    if (section) {
      section.scrollIntoView({ behavior: "smooth", block: "start" });
      setActiveSection(id);
    }
  };

  // Track scroll position to highlight current section
  useEffect(() => {
    const handleScroll = () => {
      const sections = ["hero", "how-it-works", "features", "plans", "trust", "advertise"];
      let current = activeSection;

      for (const id of sections) {
        const el = document.getElementById(id);
        if (el) {
          const rect = el.getBoundingClientRect();
          if (rect.top <= 120 && rect.bottom >= 120) {
            current = id;
            break;
          }
        }
      }
      if (current !== activeSection) setActiveSection(current);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [activeSection]);

  // Animation Variants
  const navVariants = {
    hidden: { opacity: 0, y: -30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: "easeOut" },
    },
  };

  return (
    <motion.nav
      className="bg-[#ffffff] border-b border-[#e6e8ea] shadow-sm fixed top-0 w-full z-50 backdrop-blur-lg bg-opacity-95"
      variants={navVariants}
      initial="hidden"
      animate="visible"
    >
      <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
        {/* === LOGO / BRAND === */}
        <motion.div
          className="flex items-center gap-2 cursor-pointer"
          whileHover={{ scale: 1.05 }}
          onClick={() => scrollToSection("hero")}
        >
          <motion.div
            className="w-6 h-6 bg-[#0b6e4f] rounded-md"
            whileHover={{ rotate: 15 }}
            transition={{ type: "spring", stiffness: 200 }}
          ></motion.div>
          <span className="text-lg font-semibold text-[#0f1724]">
            Rental Connects
          </span>
        </motion.div>

        {/* === NAV LINKS === */}
        <div className="hidden md:flex items-center gap-8 text-sm font-medium text-[#0f1724]">
          {[
            { id: "properties", label: "Properties", isRoute: true },
            { id: "how-it-works", label: "How it works" },
            { id: "features", label: "Features" },
            { id: "benefits", label: "Benefits" },
            { id: "plans", label: "Pricing" },
            { id: "trust", label: "Trust" },
            { id: "advertise", label: "Advertise" },
          ].map((item) => (
            item.isRoute ? (
              <motion.div key={item.id} whileHover={{ scale: 1.05 }}>
                <Link
                  to="/properties"
                  className="relative pb-1 transition-colors hover:text-[#0b6e4f]"
                >
                  {item.label}
                </Link>
              </motion.div>
            ) : (
              <motion.button
                key={item.id}
                onClick={() => scrollToSection(item.id)}
                className={`relative pb-1 transition-colors ${activeSection === item.id
                    ? "text-[#0b6e4f] font-semibold"
                    : "hover:text-[#0b6e4f]"
                  }`}
                whileHover={{ scale: 1.05 }}
              >
                {item.label}
                {activeSection === item.id && (
                  <motion.div
                    layoutId="nav-underline"
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#0b6e4f] rounded-full"
                    transition={{ type: "spring", stiffness: 250, damping: 20 }}
                  />
                )}
              </motion.button>
            )
          ))}
        </div>

        {/* === RIGHT ACTION BUTTONS === */}
        <div className="flex items-center gap-4">
          <motion.div whileHover={{ scale: 1.05 }}>
            <Link
              to="/login"
              className="px-4 py-2 border border-[#e6e8ea] text-[#0f1724] rounded-lg hover:bg-[#f1f3f5] transition"
            >
              Log in
            </Link>
          </motion.div>
          <motion.div whileHover={{ scale: 1.05 }}>
            <Link
              to="/role-selection"
              className="px-4 py-2 bg-[#0b6e4f] text-white font-medium rounded-lg hover:bg-[#095c42] transition"
            >
              Get started
            </Link>
          </motion.div>
        </div>
      </div>
    </motion.nav>
  );
}
