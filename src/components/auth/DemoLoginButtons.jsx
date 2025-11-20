// src/components/auth/DemoLoginButtons.jsx
import React from "react";
import { motion } from "framer-motion";

export default function DemoLoginButtons({ loading, onDemoLogin }) {
  const demoRoles = ["tenant", "landlord", "artisan", "admin", "super-admin"];

  const demoColors = {
    tenant: "bg-green-500 hover:bg-green-600",
    landlord: "bg-blue-500 hover:bg-blue-600",
    artisan: "bg-yellow-500 hover:bg-yellow-600",
    admin: "bg-red-500 hover:bg-red-600",
    "super-admin": "bg-purple-500 hover:bg-purple-600",
  };

  return (
    import.meta.env.DEV && (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="text-center mt-3 flex flex-wrap justify-center gap-2"
      >
        {demoRoles.map((role) => (
          <button
            key={role}
            type="button"
            onClick={() => onDemoLogin(role)}
            disabled={loading}
            className={`text-white text-sm px-3 py-1 rounded font-medium transition 
              ${demoColors[role]} disabled:opacity-50 
              focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-[#0b6e4f]`}
          >
            {role} Demo
          </button>
        ))}
      </motion.div>
    )
  );
}
