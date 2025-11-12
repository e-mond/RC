import { useState } from "react";
import { Link } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { motion } from "framer-motion";

export default function OnboardingHeader({
  backTo = "/",
  backLabel = "Back to Home",
}) {
  const [mobileOpen, setMobileOpen] = useState(false);

  const mobileMenuVariants = {
    closed: { opacity: 0, x: 100 },
    open: { opacity: 1, x: 0, transition: { duration: 0.3, ease: "easeOut" } },
  };

  return (
    <>
      <header className="bg-[#ffffff] border-b pt-4 pb-3.5 md:pt-4 md:pb-5 sm:px-6 lg:px-8 border-[#e6e8ea] shadow-sm fixed top-0 w-full z-50 backdrop-blur-lg bg-opacity-95">
        <div className="max-w-6xl mx-auto flex justify-between items-center px-5 sm:px-0">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-[#0b6e4f] rounded-md" />
            <span className="font-semibold text-[#0f1724] text-lg">
              Rental Connects
            </span>
          </div>

          {/* Desktop Buttons */}
          <nav className="hidden sm:flex items-center gap-4">
            <Link
              to={backTo}
              className="px-4 py-2 border border-[#e6e8ea] text-[#0f1724] rounded-lg hover:bg-[#f1f3f5] transition text-sm font-medium"
            >
              {backLabel}
            </Link>
            <Link
              to="/login"
              className="px-4 py-2 bg-[#0b6e4f] text-white font-medium rounded-lg hover:bg-[#095c42] transition text-sm"
            >
              Login
            </Link>
          </nav>

          {/* Mobile Hamburger */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="sm:hidden p-1.5 rounded-md hover:bg-gray-100 transition"
            aria-label="Toggle menu"
          >
            {mobileOpen ? (
              <X className="w-5 h-5 text-[#0f1724]" />
            ) : (
              <Menu className="w-5 h-5 text-[#0f1724]" />
            )}
          </button>
        </div>

        {/* HALF-WIDTH MOBILE MENU – RIGHT SIDE */}
        <motion.div
          className="sm:hidden fixed top-[76px] right-0 w-full max-w-[50%] bg-white border-l border-b border-gray-200 shadow-lg"
          variants={mobileMenuVariants}
          initial="closed"
          animate={mobileOpen ? "open" : "closed"}
          style={{ originX: 1, originY: 0 }}
        >
          <nav className="flex flex-col gap-2 px-4 py-3">
            <Link
              to={backTo}
              onClick={() => setMobileOpen(false)}
              className="w-full text-right px-3 py-2 text-xs font-medium border border-[#e6e8ea] text-[#0f1724] rounded-md hover:bg-[#f1f3f5] transition"
            >
              {backLabel}
            </Link>
            <Link
              to="/login"
              onClick={() => setMobileOpen(false)}
              className="w-full text-right px-3 py-2 text-xs font-medium bg-[#0b6e4f] text-white rounded-md hover:bg-[#095c42] transition"
            >
              Login
            </Link>
          </nav>
        </motion.div>
      </header>

      {/* Spacer to prevent content overlap */}
      <div className="h-[76px] md:h-[84px]" />
    </>
  );
}