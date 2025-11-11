import { User, Building2, Wrench } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

/**
 * JoinBanner
 * ------------------------------------------------------------------
 * Landing CTA with three entry points:
 * Tenant → /signup?role=tenant
 * Landlord → /signup?role=landlord
 * Artisan → /signup?role=artisan
 */

export default function JoinBanner() {
  const navigate = useNavigate();

  /** Navigate directly to signup with the selected role */
  const handleJoin = (role) => {
    localStorage.setItem("userRole", role); // persist role for signup
    navigate(`/signup?role=${role}`);
  };

  return (
    <section className="py-20 bg-white">
      <div className="max-w-3xl mx-auto px-6 text-center">
        {/* --- Headings --- */}
        <motion.h2
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-2xl md:text-3xl font-semibold text-gray-900 mb-3"
        >
          Get started with Rental Connects
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.5 }}
          className="text-gray-600 mb-8"
        >
          Join the trusted community simplifying rentals across Ghana.
        </motion.p>

        {/* --- Action Buttons --- */}
        <motion.div
          className="flex flex-wrap justify-center gap-4"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          {/* Tenant */}
          <button
            onClick={() => handleJoin("tenant")}
            className="flex items-center gap-2 px-5 py-2.5 bg-teal-500 text-white rounded-lg text-sm font-medium hover:bg-teal-600 transition"
          >
            <User size={16} />
            Join as Tenant
          </button>

          {/* Landlord */}
          <button
            onClick={() => handleJoin("landlord")}
            className="flex items-center gap-2 px-5 py-2.5 border border-gray-300 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-100 transition"
          >
            <Building2 size={16} />
            List as Landlord
          </button>

          {/* Artisan */}
          <button
            onClick={() => handleJoin("artisan")}
            className="flex items-center gap-2 px-5 py-2.5 border border-gray-300 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-100 transition"
          >
            <Wrench size={16} />
            Offer Services as Artisan
          </button>
        </motion.div>
      </div>
    </section>
  );
}
