import { motion } from "framer-motion";

export default function SummaryCard({ title, value, icon, gradient }) {
  return (
    <motion.div
      whileHover={{ y: -8, scale: 1.03 }}
      transition={{ type: "spring", stiffness: 380, damping: 22 }}
      className="relative group cursor-pointer overflow-hidden"
    >
      {/* Hover Glow */}
      <div className="absolute inset-0 rounded-3xl bg-linear-to-br from-white/30 to-white/5 dark:from-gray-900/10 dark:to-gray-900/5 opacity-60 blur-xl group-hover:blur-2xl transition-all duration-500" />

      {/* Card */}
      <div className="relative rounded-3xl backdrop-blur-2xl bg-white/80 dark:bg-gray-900/80 border border-white/40 dark:border-gray-800 shadow-lg group-hover:shadow-2xl transition-all duration-300 p-7">

        {/* Soft Gradient Overlay */}
        <div
          className={`absolute inset-0 ${gradient} opacity-15 group-hover:opacity-25 transition-opacity duration-300 rounded-3xl`}
        />

        <div className="relative flex items-center justify-between gap-6">
          {/* Text */}
          <div className="flex-1 min-w-0 space-y-2">
            <p className="text-xs font-semibold tracking-wide uppercase text-gray-500 dark:text-gray-400">
              {title}
            </p>

            <p className="text-4xl font-black bg-linear-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
              {value}
            </p>
          </div>

          {/* Smaller Icon */}
          <motion.div
            whileHover={{ scale: 1.15 }}
            transition={{ type: "spring", stiffness: 300, damping: 15 }}
            className={`p-3 rounded-xl ${gradient} text-white shadow-lg flex items-center justify-center`}
          >
            <div className="w-5 h-5 flex items-center justify-center">
              {icon}
            </div>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}
