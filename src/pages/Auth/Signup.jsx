import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import SignUpForm from "./components/SignUpForm";
import OnboardingHeader from "@/components/onboarding/OnboardingHeader";
import OnboardingFooter from "@/components/onboarding/OnboardingFooter";


export default function Signup() {
  const [role, setRole] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const storedRole = localStorage.getItem("userRole");
    if (!storedRole) navigate("/role-selection");
    else setRole(storedRole);
  }, [navigate]);

  if (!role) return null;

  return (
    
      <div className="flex flex-col justify-between min-h-screen bg-white px-6 py-10">
        {/* === HEADER === */}
        <OnboardingHeader backTo="/role-selection" backLabel="Back" />

        {/* === MAIN FORM === */}
        <main className="flex flex-col flex-1 items-center mt-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={role}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4 }}
              className="w-full max-w-3xl"
            >
              <SignUpForm role={role} />
            </motion.div>
          </AnimatePresence>
        </main>

        {/* === FOOTER === */}
        <div className="mt-12">
          <OnboardingFooter />
        </div>
      </div>
    );
}
