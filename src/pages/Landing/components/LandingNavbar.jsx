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

            {/* Desktop Nav */}
            <div className="hidden lg:flex items-center gap-10">
              {navItems.map((item) => (
                <motion.button
                  key={item.id}
                  onClick={() => scrollToSection(item.id)}
                  className={`relative text-sm font-medium pb-1 transition-colors ${
                    activeSection === item.id ? "text-[#0b6e4f] font-semibold" : "text-gray-700 hover:text-[#0b6e4f]"
                  }`}
                  whileHover={{ scale: 1.05 }}
                >
                  {item.label}
                  {activeSection === item.id && (
                    <motion.div
                      layoutId="underline"
                      className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#0b6e4f] rounded-full"
                    />
                  )}
                </motion.button>
              ))}
            </div>

            {/* Desktop Buttons */}
            <div className="hidden md:flex items-center gap-4">
              <Link
                to="/login"
                className="px-5 py-2.5 text-gray-700 font-medium rounded-lg border border-gray-300 hover:bg-gray-100 transition"
              >
                Log in
              </Link>
              <Link
                to="/role-selection"
                className="px-6 py-2.5 bg-linear-to-r from-[#0b6e4f] to-[#095c42] text-white font-semibold rounded-lg hover:from-[#095c42] hover:to-[#074d38] shadow-lg transition hover:scale-105"
              >
                Get Started
              </Link>
            </div>

            {/* Mobile Hamburger */}
            <button
              onClick={() => setIsOpen(true)}
              className="lg:hidden p-2 rounded-lg hover:bg-gray-100 transition"
            >
              <Menu size={28} />
            </button>
          </div>
        </div>
      </motion.nav>

{isOpen && (
  <>
    {/* Backdrop */}
    <div
      className="fixed inset-0 bg-black/30 z-50 lg:hidden"
      onClick={() => setIsOpen(false)}
    />

    <motion.div
      initial={{ x: "100%" }}
      animate={{ x: 0 }}
      exit={{ x: "100%" }}
      transition={{ type: "spring", stiffness: 320, damping: 32 }}
      className="fixed top-0 right-0 w-80 max-w-[90vw] h-fit max-h-screen bg-white/80 backdrop-blur-xl shadow-2xl z-50 border-l border-gray-200 overflow-y-auto"
    >
      <div className="p-6 pt-20">
        {/* Close Button */}
        <button
          onClick={() => setIsOpen(false)}
          className="absolute top-6 right-6 p-2 rounded-full bg-white/70 backdrop-blur shadow-md hover:bg-white transition"
        >
          <X size={24} className="text-gray-700" />
        </button>

        {/* Navigation Links – Right aligned, compact */}
        <div className="space-y-2 text-right">
          {navItems.map((item) => (
            <motion.button
              key={item.id}
              onClick={() => scrollToSection(item.id)}
              className={`block w-full py-3.5 px-6 rounded-lg text-lg font-medium transition-all ${
                activeSection === item.id
                  ? "bg-[#0b6e4f]/15 text-[#0b6e4f] font-bold border-r-4 border-[#0b6e4f]"
                  : "text-gray-700 hover:bg-white/70"
              }`}
              whileTap={{ scale: 0.96 }}
            >
              {item.label}
            </motion.button>
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