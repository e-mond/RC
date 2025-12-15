import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import Logo from "@/assets/images/Logo.png";
import { Menu, X } from "lucide-react";

export default function Navbar() {
  const [activeSection, setActiveSection] = useState("hero");
  const [isOpen, setIsOpen] = useState(false);

  const scrollToSection = (id) => {
    const section = document.getElementById(id);
    if (section) {
      section.scrollIntoView({ behavior: "smooth", block: "start" });
      setActiveSection(id);
      setIsOpen(false);
    }
  };

  useEffect(() => {
    const handleScroll = () => {
      const sections = ["hero", "how-it-works", "features", "benefits", "plans", "trust", "advertise"];
      let current = "hero";

      for (const id of sections) {
        const el = document.getElementById(id);
        if (el) {
          const rect = el.getBoundingClientRect();
          if (rect.top <= 150 && rect.bottom >= 150) {
            current = id;
            break;
          }
        }
      }
      setActiveSection(current);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navItems = [
    { id: "how-it-works", label: "How it works" },
    { id: "features", label: "Features" },
    { id: "benefits", label: "Benefits" },
    { id: "plans", label: "Pricing" },
    { id: "trust", label: "Trust" },
    { id: "advertise", label: "Advertise" },
  ];

  return (
    <>
      {/* Main Navbar */}
      <motion.nav
        className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-lg border-b border-gray-200 shadow-sm"
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <motion.div
              className="flex items-center gap-3 cursor-pointer"
              whileHover={{ scale: 1.05 }}
              onClick={() => scrollToSection("hero")}
            >
              <div className="w-10 h-10 rounded-lg overflow-hidden bg-linear-to-br from-[#0b6e4f] to-[#095c42] p-1">
                <img src={Logo} alt="Rental Connects" className="w-full h-full object-cover rounded-md" />
              </div>
              <span className="text-xl font-bold text-[#0f1724] hidden sm:block">
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

        {/* Action Buttons */}
        <div className="mt-8 space-y-3 border-t border-gray-300/50 pt-6">
          <Link
            to="/login"
            onClick={() => setIsOpen(false)}
            className="block w-full text-center py-3.5 border border-gray-400/60 rounded-xl font-medium bg-white/70 hover:bg-white transition shadow-sm"
          >
            Log in
          </Link>
          <Link
            to="/role-selection"
            onClick={() => setIsOpen(false)}
            className="block w-full text-center py-3.5 bg-linear-to-r from-[#0b6e4f] to-[#095c42] text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition transform hover:scale-105"
          >
            Get Started
          </Link>
        </div>
      </div>
    </motion.div>
  </>
)}
    </>
  );
}