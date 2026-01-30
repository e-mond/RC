import { User, Building2, Wrench } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { PrimaryButton, SecondaryButton } from "@/components/ui/Button";

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
          <PrimaryButton
            onClick={() => handleJoin("tenant")}
            className="flex items-center gap-2"
          >
            <User size={18} />
            Join as Tenant
          </PrimaryButton>

          {/* Landlord */}
          <SecondaryButton
            onClick={() => handleJoin("landlord")}
            className="flex items-center gap-2"
          >
            <Building2 size={18} />
            List as Landlord
          </SecondaryButton>

          {/* Artisan */}
          <SecondaryButton
            onClick={() => handleJoin("artisan")}
            className="flex items-center gap-2"
          >
            <Wrench size={18} />
            Offer Services as Artisan
          </SecondaryButton>
        </motion.div>
      </div>
    </section>
  );
}
