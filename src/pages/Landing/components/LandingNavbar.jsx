// src/pages/Landing/components/LandingNavbar.jsx
import { Link, useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { Search } from "lucide-react";

export default function LandingNavbar({
  searchTerm = "",
  setSearchTerm,
}) {
  const location = useLocation();
  const navigate = useNavigate();

  const isPropertiesPage = location.pathname.startsWith("/properties");
  const [activeSection, setActiveSection] = useState("hero");

  /* ------------------ SCROLL TO SECTION (LANDING ONLY) ------------------ */
  const scrollToSection = (id) => {
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

  /* ------------------ SCROLL SPY (LANDING ONLY) ------------------ */
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

  /* ------------------ ANIMATION ------------------ */
  const navVariants = {
    hidden: { opacity: 0, y: -24 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, ease: "easeOut" },
    },
  };

  return (
    <motion.nav
      variants={navVariants}
      initial="hidden"
      animate="visible"
      className="fixed top-0 z-50 w-full border-b border-[#e6e8ea] bg-white/95 backdrop-blur-lg"
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-4 px-4 md:px-6">
        {/* ------------------ LEFT: LOGO ------------------ */}
        <motion.div
          whileHover={{ scale: 1.05 }}
          onClick={() => (isPropertiesPage ? navigate("/") : scrollToSection("hero"))}
          className="flex cursor-pointer items-center gap-2"
        >
          <motion.div
            className="h-6 w-6 rounded-md bg-[#0b6e4f]"
            whileHover={{ rotate: 12 }}
            transition={{ type: "spring", stiffness: 200 }}
          />
          <span className="hidden text-lg font-semibold text-[#0f1724] sm:block">
            Rental Connects
          </span>
        </motion.div>

        {/* ------------------ CENTER: SEARCH (PROPERTIES ONLY) ------------------ */}
        {isPropertiesPage && setSearchTerm && (
          <div className="flex flex-1 justify-center px-2">
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
                className="w-full rounded-xl border border-gray-300 bg-white py-2.5 pl-11 pr-4 text-sm shadow-sm focus:border-transparent focus:ring-2 focus:ring-[#0b6e4f]"
              />
            </div>
          </div>
        )}

        {/* ------------------ LANDING NAV LINKS ------------------ */}
        {!isPropertiesPage && (
          <div className="hidden flex-1 items-center justify-center gap-8 text-sm font-medium text-[#0f1724] md:flex">
            {[
              { id: "how-it-works", label: "How it works" },
              { id: "features", label: "Features" },
              { id: "benefits", label: "Benefits" },
              { id: "plans", label: "Pricing" },
              { id: "trust", label: "Trust" },
              { id: "advertise", label: "Advertise" },
              { id: "properties", label: "Browse Properties", route: true },
            ].map((item) =>
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

        {/* ------------------ RIGHT: ACTIONS ------------------ */}
        <div className="flex items-center gap-3">
          <Link
            to="/login"
            className="hidden rounded-lg border border-[#e6e8ea] px-4 py-2 text-sm text-[#0f1724] transition hover:bg-gray-100 sm:block"
          >
            Log in
          </Link>

          <Link
            to="/role-selection"
            className="rounded-lg bg-[#0b6e4f] px-4 py-2 text-sm font-medium text-white transition hover:bg-[#095c42]"
          >
            Get started
          </Link>
        </div>
      </div>
    </motion.nav>
  );
}
