/**
 * DocumentationHeader Component
 * 
 * Reusable header for documentation pages
 */

import { motion } from "framer-motion";
import { Book } from "lucide-react";

export default function DocumentationHeader({ title = "Documentation", subtitle }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="text-center mb-12"
    >
      <div className="flex items-center justify-center gap-3 mb-4">
        <Book className="w-10 h-10 text-[#0b6e4f]" />
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
          {title}
        </h1>
      </div>
      {subtitle && (
        <p className="text-gray-600 dark:text-gray-400 text-lg max-w-2xl mx-auto">
          {subtitle}
        </p>
      )}
    </motion.div>
  );
}
