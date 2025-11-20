// src/modules/dashboard/ActionCard.jsx
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

export default function ActionCard({ title, description, icon: Icon, href, tone = "emerald" }) {
  const tones = {
    emerald: "bg-emerald-600",
    blue: "bg-blue-600",
    amber: "bg-amber-600",
    purple: "bg-purple-600",
    slate: "bg-slate-800",
  };

  const card = (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className={`rounded-2xl p-5 text-white shadow-sm transition hover:shadow-lg ${tones[tone] ?? tones.emerald}`}
    >
      <div className="mb-4 flex items-center justify-between">
        {Icon && <Icon className="h-6 w-6 opacity-90" />}
        <ArrowRight className="h-5 w-5 opacity-70" aria-hidden />
      </div>
      <h3 className="text-lg font-semibold">{title}</h3>
      <p className="text-sm text-white/80">{description}</p>
    </motion.div>
  );

  if (href) {
    return <Link to={href}>{card}</Link>;
  }

  return card;
}

