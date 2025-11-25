import { useState } from "react";
import { Link } from "react-router-dom";
import { motion as Motion, AnimatePresence } from "framer-motion";


/**
 * Footer Component
 * - Animated with Framer Motion
 * - Scrolls to sections (Features, Pricing, Advertise)
 * - Modals for Legal, About, and Contact
 */
export default function Footer() {
  const [activeModal, setActiveModal] = useState(null);

  // Smooth scroll to section IDs
  const scrollToSection = (id) => {
    const section = document.getElementById(id);
    if (section) {
      section.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <Motion.footer
      className="bg-[#f8f9f9] border-t border-[#e6e8ea] mt-16 text-sm"
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.7, ease: "easeOut" }}
    >
      <div className="max-w-7xl mx-auto px-6 py-10 grid grid-cols-1 md:grid-cols-4 gap-8 text-[#0f1724]">
        {/* === LOGO + DESCRIPTION === */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <div className="w-7 h-7 bg-[#0b6e4f] rounded-md"></div>
            <span className="text-lg font-semibold">Rental Connects</span>
          </div>
          <p className="text-gray-600 leading-relaxed">
            A trusted rental platform for Ghana. © {new Date().getFullYear()}
          </p>
        </div>

        {/* === PRODUCT LINKS === */}
        <div>
          <h3 className="font-semibold text-[#0f1724] mb-3">Product</h3>
          <ul className="space-y-2 text-gray-700">
            <li>
              <button
                onClick={() => scrollToSection("features")}
                className="hover:text-[#0b6e4f] transition"
              >
                Features
              </button>
            </li>
            <li>
              <button
                onClick={() => scrollToSection("plans")}
                className="hover:text-[#0b6e4f] transition"
              >
                Pricing
              </button>
            </li>
            <li>
              <button
                onClick={() => scrollToSection("advertise")}
                className="hover:text-[#0b6e4f] transition"
              >
                Advertise
              </button>
            </li>
          </ul>
        </div>

        {/* === COMPANY LINKS === */}
        <div>
          <h3 className="font-semibold text-[#0f1724] mb-3">Company</h3>
          <ul className="space-y-2 text-gray-700">
            <li>
              <button
                onClick={() => setActiveModal("about")}
                className="hover:text-[#0b6e4f] transition"
              >
                About
              </button>
            </li>
            <li>
              <button
                onClick={() => setActiveModal("contact")}
                className="hover:text-[#0b6e4f] transition"
              >
                Contact
              </button>
            </li>
          </ul>
        </div>

        {/* === LEGAL LINKS === */}
        <div>
          <h3 className="font-semibold text-[#0f1724] mb-3">Legal</h3>
          <ul className="space-y-2 text-gray-700">
            <li>
              <button
                onClick={() => setActiveModal("privacy")}
                className="hover:text-[#0b6e4f] transition"
              >
                Privacy
              </button>
            </li>
            <li>
              <button
                onClick={() => setActiveModal("terms")}
                className="hover:text-[#0b6e4f] transition"
              >
                Terms
              </button>
            </li>
            <li>
              <button
                onClick={() => setActiveModal("trust")}
                className="hover:text-[#0b6e4f] transition"
              >
                Trust & Safety
              </button>
            </li>
          </ul>
        </div>
      </div>

      {/* === MODALS === */}
      <AnimatePresence>
        {activeModal && (
          <LegalModal
            type={activeModal}
            onClose={() => setActiveModal(null)}
          />
        )}
      </AnimatePresence>
    </Motion.footer>
  );
}

/**
 * LegalModal
 * - Used for Privacy, Terms, Trust, About, Contact
 * - Animated with Framer Motion
 */
function LegalModal({ type, onClose }) {
  const modalTitles = {
    privacy: "Privacy Policy",
    terms: "Terms of Service",
    trust: "Trust & Safety",
    about: "About Rental Connects",
    contact: "Contact Us",
  };

  const modalContent = {
    privacy:
      "We respect your privacy. This policy explains how we handle your data and protect your personal information.",
    terms:
      "By using Rental Connects, you agree to our terms outlining the platform’s usage, payments, and content policies.",
    trust:
      "Your safety is our priority. We verify users, listings, and maintain secure communication to build trust.",
    about:
      "Rental Connects bridges the gap between tenants, landlords, and artisans in Ghana. We’re simplifying rental management through technology and trust.",
    contact:
      "Need help or have questions? Reach out at contact@rentalconnects.com or call +233-234-567890.",
  };

  return (
    <Motion.div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <Motion.div
        className="bg-white rounded-2xl max-w-md w-full p-6 shadow-lg relative"
        initial={{ scale: 0.85, opacity: 0, y: 40 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.85, opacity: 0, y: 40 }}
        transition={{ type: "spring", stiffness: 200, damping: 25 }}
      >
        <h2 className="text-lg font-semibold text-[#0f1724] mb-3">
          {modalTitles[type]}
        </h2>
        <p className="text-gray-600 text-sm leading-relaxed mb-6">
          {modalContent[type]}
        </p>
        <button
          onClick={onClose}
          className="px-5 py-2.5 bg-[#0b6e4f] hover:bg-[#095c42] text-white rounded-lg font-medium transition-colors w-full"
        >
          Close
        </button>
      </Motion.div>
    </Motion.div>
  );
}
