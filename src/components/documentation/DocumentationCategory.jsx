/**
 * DocumentationCategory Component
 * 
 * Reusable component for displaying documentation category items
 */

import { motion } from "framer-motion";
import { ExternalLink } from "lucide-react";
import { Link } from "react-router-dom";

export default function DocumentationCategory({ category, items, onItemClick }) {
  return (
    <motion.div
      key={category.id}
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6"
    >
      <div className={`inline-flex items-center gap-3 px-4 py-2 rounded-lg mb-6 ${category.bgColor}`}>
        <category.icon className={`w-6 h-6 ${category.color}`} />
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          {category.title}
        </h2>
      </div>

      <div className="space-y-4">
        {items.map((item, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:border-[#0b6e4f] dark:hover:border-[#0b6e4f] transition"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                  {item.title}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {item.description}
                </p>
              </div>
              {item.link && item.link !== "#" ? (
                <Link
                  to={item.link}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition"
                >
                  <ExternalLink size={20} className="text-gray-400" />
                </Link>
              ) : (
                <button
                  onClick={() => onItemClick?.(item)}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition"
                >
                  <ExternalLink size={20} className="text-gray-400" />
                </button>
              )}
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
