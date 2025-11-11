import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";

export default function RoleCard({ icon: Icon, title, description, onClick }) {
  return (
    <motion.div
      onClick={onClick}
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.97 }}
      className="cursor-pointer border border-gray-200 bg-white rounded-2xl shadow-sm hover:shadow-md transition p-6 flex flex-col justify-between"
    >
      <div>
        <div className="w-10 h-10 flex items-center justify-center bg-gray-100 rounded-lg mb-3">
          {Icon && <Icon className="w-5 h-5 text-gray-600" />}
        </div>

        <h3 className="text-lg font-semibold text-[#0f1724] mb-1">{title}</h3>
        <p className="text-gray-600 text-sm leading-relaxed">{description}</p>
      </div>

      <button className="mt-5 w-full bg-[#0b6e4f] hover:bg-[#095c42] text-white font-medium rounded-lg py-2.5 flex items-center justify-center gap-2 transition">
        Continue <ArrowRight size={16} />
      </button>
    </motion.div>
  );
}
