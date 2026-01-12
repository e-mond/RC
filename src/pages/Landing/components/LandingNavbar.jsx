// src/pages/Landing/components/LandingNavbar.jsx
import { Link, useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import { Search, Menu, X } from "lucide-react";

export default function LandingNavbar({
  searchTerm = "",
  setSearchTerm,
}) {
  const location = useLocation();
  const navigate = useNavigate();

  const isPropertiesPage = location.pathname.startsWith("/properties");

  const [activeSection, setActiveSection] = useState("hero");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const scrollToSection = (id) => {
    setMobileMenuOpen(false);

    if (isPropertiesPage) {
      navigate("/");
      return;
    }

    const section = document.getElementById(id);
    if (section) {
      section.scrollIntoView({ behavior: "smooth", block: "start" });
      setActiveSection(id);
    }
  };

  // Close mobile menu on scroll
  useEffect(() => {
    if (!mobileMenuOpen) return;

    const handleScroll = () => {
      setMobileMenuOpen(false);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [mobileMenuOpen]);

  // Scroll spy for active section highlighting
  useEffect(() => {
    if (isPropertiesPage) return;

    const sections = [
      "hero",
      "how-it-works",
      "features",
      "benefits",
      "plans",
      "trust",
      "advertise",
    ];

    const handleScroll = () => {
      let current = "hero";

      for (const id of sections) {
        const el = document.getElementById(id);
        if (!el) continue;

        const rect = el.getBoundingClientRect();
        if (rect.top <= 120 && rect.bottom >= 120) {
          current = id;
          break;
        }
      }

      setActiveSection(current);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [isPropertiesPage]);

  const navItems = [
    { id: "how-it-works", label: "How it works" },
    { id: "features", label: "Features" },
    { id: "benefits", label: "Benefits" },
    { id: "plans", label: "Pricing" },
    { id: "trust", label: "Trust" },
    { id: "advertise", label: "Advertise" },
    { id: "properties", label: "Browse Properties", route: true },
  ];

  const navVariants = {
    hidden: { opacity: 0, y: -20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, ease: "easeOut" },
    },
  };

  const mobileMenuVariants = {
    closed: { opacity: 0, x: "100%" },
    open: { opacity: 1, x: 0, transition: { duration: 0.35, ease: "easeOut" } },
  };

  return (
    <motion.nav
      variants={navVariants}
      initial="hidden"
      animate="visible"
      className="fixed top-0 left-0 right-0 z-50 border-b border-gray-200 bg-white/95 backdrop-blur-lg"
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 md:px-6">
        {/* Logo */}
        <motion.div
          whileHover={{ scale: 1.05 }}
          onClick={() => (isPropertiesPage ? navigate("/") : scrollToSection("hero"))}
          className="flex cursor-pointer items-center gap-2.5"
        >
          <motion.div
            className="h-7 w-7 rounded-md bg-[#0b6e4f]"
            whileHover={{ rotate: 12 }}
            transition={{ type: "spring", stiffness: 200 }}
          />
          <span className="text-lg font-semibold text-[#0f1724] sm:block">
            Rental Connects
          </span>
        </motion.div>

        {/* Search - Properties only */}
        {isPropertiesPage && setSearchTerm && (
          <div className="hidden flex-1 justify-center px-2 md:flex">
            <div className="relative w-full max-w-xl">
              <Search
                size={18}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
              />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by location, title, or description..."
                className="w-full rounded-xl border border-gray-300 bg-white py-2.5 pl-11 pr-4 text-sm shadow-sm focus:border-transparent focus:ring-2 focus:ring-[#0b6e4f] focus:outline-none"
              />
            </div>
          </div>
        )}

        {/* Desktop navigation */}
        {!isPropertiesPage && (
          <div className="hidden flex-1 items-center justify-center gap-8 text-sm font-medium text-[#0f1724] md:flex">
            {navItems.map((item) =>
              item.route ? (
                <Link
                  key={item.id}
                  to="/properties"
                  className="transition-colors hover:text-[#0b6e4f]"
                >
                  {item.label}
                </Link>
              ) : (
                <button
                  key={item.id}
                  onClick={() => scrollToSection(item.id)}
                  className={`relative transition-colors ${
                    activeSection === item.id
                      ? "font-semibold text-[#0b6e4f]"
                      : "hover:text-[#0b6e4f]"
                  }`}
                >
                  {item.label}
                  {activeSection === item.id && (
                    <motion.span
                      layoutId="nav-underline"
                      className="absolute -bottom-2 left-0 right-0 h-0.5 rounded-full bg-[#0b6e4f]"
                    />
                  )}
                </button>
              )
            )}
          </div>
        )}

        {/* Right side */}
        <div className="flex items-center gap-3">
          <Link
            to="/login"
            className="hidden rounded-lg border border-gray-200 px-4 py-2 text-sm text-[#0f1724] transition hover:bg-gray-50 md:block"
          >
            Log in
          </Link>

          <Link
            to="/role-selection"
            className="hidden rounded-lg bg-[#0b6e4f] px-4 py-2 text-sm font-medium text-white transition hover:bg-[#095c42] md:block"
          >
            Get started
          </Link>

          {!isPropertiesPage && (
            <button
              className="ml-1 p-2 md:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? (
                <X size={24} className="text-gray-700" />
              ) : (
                <Menu size={24} className="text-gray-700" />
              )}
            </button>
          )}
        </div>
      </div>

      {/* ── MOBILE MENU ── */}
      <AnimatePresence>
        {!isPropertiesPage && mobileMenuOpen && (
          <motion.div
            initial="closed"
            animate="open"
            exit="closed"
            variants={mobileMenuVariants}
            className="fixed inset-0 z-40 md:hidden"
            onClick={() => setMobileMenuOpen(false)}
          >
            {/* Overlay */}
            <div className="absolute inset-0 bg-black/10 backdrop-blur-sm" />

            {/* Glass panel */}
            <div
              className="
                absolute right-0 top-0 h-full
                w-[68%] max-w-[280px]
                bg-white/65 backdrop-blur-2xl
                border-l border-white/30
                shadow-2xl
              "
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex flex-col items-end  bg-white/90 backdrop-blur-2xl gap-1 px-4 pt-16 pb-10">
                {navItems.map((item) => {
                  const isActive = !item.route && activeSection === item.id;

                  const baseClasses =
                    "block w-full text-right px-6 py-3.5 rounded-xl " +
                    "text-gray-800 font-medium transition-all duration-250 " +
                    "hover:bg-[#0b6e4f]/10 hover:text-[#0b6e4f] hover:shadow-md " +
                    "active:bg-[#0b6e4f]/15 active:text-[#0b6e4f] active:shadow-md";

                  const activeClasses = isActive
                    ? "bg-[#0b6e4f]/15 text-[#0b6e4f] font-semibold shadow-md"
                    : "";

                  return item.route ? (
                    <Link
                      key={item.id}
                      to="/properties"
                      className={`${baseClasses} ${activeClasses}`}
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      {item.label}
                    </Link>
                  ) : (
                    <button
                      key={item.id}
                      onClick={() => scrollToSection(item.id)}
                      className={`${baseClasses} ${activeClasses}`}
                    >
                      {item.label}
                    </button>
                  );
                })}

                <Link
                  to="/login"
                  className="
                    mt-6 w-full text-right px-6 py-3.5 rounded-xl
                    text-sm text-gray-700 font-medium
                    transition-all duration-250
                    hover:bg-gray-100/70 hover:text-[#0b6e4f] hover:shadow-sm
                    active:bg-gray-200/50
                  "
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Log in
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
}