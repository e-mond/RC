// src/components/auth/LoginHeader.jsx
import { motion } from "framer-motion";
import { Building2 } from "lucide-react";

export default function LoginHeader() {
  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
    >
      <div className="flex items-center gap-2 mb-2">
        <Building2 className="w-6 h-6 text-[#0b6e4f]" />
        <h1 className="text-2xl font-semibold text-[#0f1724]">
          Rental Connects
        </h1>
      </div>
      <p className="text-gray-600 text-base">
        Welcome back! Log in to access your dashboard.
      </p>
    </motion.div>
  );
}
