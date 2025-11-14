"use client";

import { Link, useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { Menu, X, Home } from "lucide-react";
import NotificationDropdown from "@/components/Notifications/NotificationDropdown";

export default function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const isLandingPage = location.pathname === "/";
  const [activeSection, setActiveSection] = useState("hero");
  const [mobileOpen, setMobileOpen] = useState(false);

  const scrollToSection = (id) => {
    if (isLandingPage) {
      const section = document.getElementById(id);
      if (section) {
        section.scrollIntoView({ behavior: "smooth", block: "start" });
        setActiveSection(id);
        setMobileOpen(false);
        // Update URL hash
        window.history.pushState(null, "", `#${id}`);
      }
    } else {
      // Navigate to landing page, then set hash and scroll
      navigate("/");
      // Use setTimeout to ensure navigation completes before scrolling
      setTimeout(() => {
        window.location.hash = id;
        const section = document.getElementById(id);
        if (section) {
          section.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      }, 100);
      setMobileOpen(false);
    }
  };

  useEffect(() => {
    if (!isLandingPage) return;

    const handleScroll = () => {
      const sections = ["hero", "how-it-works", "features", "benefits", "plans", "trust", "advertise"];
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
  }, [activeSection, isLandingPage]);

  const navVariants = {
    hidden: { opacity: 0, y: -30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
  };

  const mobileMenuVariants = {
    closed: { opacity: 0, x: 100 },
    open: { opacity: 1, x: 0, transition: { duration: 0.3, ease: "easeOut" } },
  };

  return (
    <>
      <motion.nav
        className="bg-[#ffffff] border-b border-[#e6e8ea] shadow-sm fixed top-0 w-full z-50 backdrop-blur-lg bg-opacity-95"
        variants={navVariants}
        initial="hidden"
        animate="visible"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 sm:py-4 flex justify-between items-center">
          {/* Logo */}
          {isLandingPage ? (
            <motion.div
              className="flex items-center gap-2 cursor-pointer"
              whileHover={{ scale: 1.05 }}
              onClick={() => scrollToSection("hero")}
            >
              <motion.div
                className="w-6 h-6 bg-[#0b6e4f] rounded-md"
                whileHover={{ rotate: 15 }}
                transition={{ type: "spring", stiffness: 200 }}
              />
              <span className="text-lg font-semibold text-[#0f1724]">
                Rental Connects
              </span>
            </motion.div>
          ) : (
            <Link to="/" className="flex items-center gap-2">
              <motion.div
                className="w-6 h-6 bg-[#0b6e4f] rounded-md"
                whileHover={{ rotate: 15, scale: 1.05 }}
                transition={{ type: "spring", stiffness: 200 }}
              />
              <span className="text-lg font-semibold text-[#0f1724]">
                Rental Connects
              </span>
            </Link>
          )}

          {/* Desktop Nav */}
          <div className="hidden lg:flex items-center gap-6 text-sm font-medium text-[#0f1724]">
            {/* Properties Link */}
            <motion.div whileHover={{ scale: 1.05 }}>
              <Link
                to="/properties"
                className={`flex items-center gap-1.5 transition-colors ${
                  location.pathname === "/properties"
                    ? "text-[#0b6e4f] font-semibold"
                    : "text-[#0f1724] hover:text-[#0b6e4f]"
                }`}
              >
                <Home className="w-4 h-4" />
                Properties
              </Link>
            </motion.div>
            
            {[
              { id: "how-it-works", label: "How it works" },
              { id: "features", label: "Features" },
              { id: "benefits", label: "Benefits" },
              { id: "plans", label: "Pricing" },
              { id: "trust", label: "Trust" },
              { id: "advertise", label: "Advertise" },
            ].map((item) => (
              <motion.button
                key={item.id}
                onClick={() => scrollToSection(item.id)}
                className={`relative pb-1 transition-colors ${
                  activeSection === item.id
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
            ))}
          </div>

          {/* Desktop Buttons */}
          <div className="hidden md:flex items-center gap-3">
            {location.pathname !== "/" && (
              <NotificationDropdown />
            )}
            <motion.div whileHover={{ scale: 1.05 }}>
              <Link
                to="/login"
                className="px-3 py-1.5 text-sm border border-[#e6e8ea] text-[#0f1724] rounded-lg hover:bg-[#f1f3f5] transition"
              >
                Log in
              </Link>
            </motion.div>
            <motion.div whileHover={{ scale: 1.05 }}>
              <Link
                to="/role-selection"
                className="px-3 py-1.5 text-sm bg-[#0b6e4f] text-white font-medium rounded-lg hover:bg-[#095c42] transition"
              >
                Get started
              </Link>
            </motion.div>
          </div>

          {/* Mobile Hamburger */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="lg:hidden p-2 rounded-md hover:bg-gray-100 transition"
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {/* HALF-WIDTH MOBILE MENU – RIGHT SIDE */}
        <motion.div
          className="lg:hidden fixed top-[76px] right-0 w-full max-w-[50%] bg-white border-l border-b border-gray-200 shadow-lg"
          variants={mobileMenuVariants}
          initial="closed"
          animate={mobileOpen ? "open" : "closed"}
          style={{ originX: 1, originY: 0 }} // Slide from right
        >
          <div className="px-4 py-3 space-y-1">
            {/* Properties Link */}
            <Link
              to="/properties"
              onClick={() => setMobileOpen(false)}
              className={`flex items-center justify-end gap-1.5 w-full text-right py-2.5 px-3 rounded-md text-sm font-medium transition-colors ${
                location.pathname === "/properties"
                  ? "bg-[#e6f4ef] text-[#0b6e4f]"
                  : "text-[#0f1724] hover:bg-gray-50"
              }`}
            >
              <Home className="w-4 h-4" />
              Properties
            </Link>
            
            {[
              { id: "how-it-works", label: "How it works" },
              { id: "features", label: "Features" },
              { id: "benefits", label: "Benefits" },
              { id: "plans", label: "Pricing" },
              { id: "trust", label: "Trust" },
              { id: "advertise", label: "Advertise" },
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => scrollToSection(item.id)}
                className={`block w-full text-right py-2.5 px-3 rounded-md text-sm font-medium transition-colors ${
                  activeSection === item.id
                    ? "bg-[#e6f4ef] text-[#0b6e4f]"
                    : "text-[#0f1724] hover:bg-gray-50"
                }`}
              >
                {item.label}
              </button>
            ))}

            <div className="pt-3 mt-2 border-t border-gray-200 space-y-2">
              <Link
                to="/login"
                onClick={() => setMobileOpen(false)}
                className="block w-full text-right py-2.5 px-3 text-sm border border-[#e6e8ea] text-[#0f1724] rounded-lg hover:bg-[#f1f3f5] transition"
              >
                Log in
              </Link>
              <Link
                to="/role-selection"
                onClick={() => setMobileOpen(false)}
                className="block w-full text-right py-2.5 px-3 text-sm bg-[#0b6e4f] text-white font-medium rounded-lg hover:bg-[#095c42] transition"
              >
                Get started
              </Link>
            </div>
          </div>
        </motion.div>
      </motion.nav>

      {/* Spacer */}
      <div className="h-[76px] lg:h-[84px]" />
    </>
  );
}