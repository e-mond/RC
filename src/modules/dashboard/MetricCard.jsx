// src/modules/dashboard/MetricCard.jsx
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

const ACCENTS = {
  emerald: { bg: "bg-emerald-50", text: "text-emerald-700", pill: "bg-emerald-100" },
  blue: { bg: "bg-blue-50", text: "text-blue-700", pill: "bg-blue-100" },
  amber: { bg: "bg-amber-50", text: "text-amber-700", pill: "bg-amber-100" },
  purple: { bg: "bg-purple-50", text: "text-purple-700", pill: "bg-purple-100" },
  rose: { bg: "bg-rose-50", text: "text-rose-700", pill: "bg-rose-100" },
};

export default function MetricCard({
  label,
  value,
  icon: Icon,
  accent = "emerald",
  href,
  isLoading = false,
  footer,
}) {
  const accentStyles = ACCENTS[accent] || ACCENTS.emerald;

  const card = (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm transition hover:shadow-md"
    >
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-sm text-gray-500">{label}</p>
          {isLoading ? (
            <div className="mt-2 h-8 w-24 animate-pulse rounded bg-gray-200" />
          ) : (
            <p className="text-2xl font-semibold text-gray-900">{value}</p>
          )}
        </div>
        {Icon && (
          <div className={`rounded-xl p-3 ${accentStyles.bg}`}>
            <Icon className={`h-6 w-6 ${accentStyles.text}`} aria-hidden />
          </div>
        )}
      </div>
      {footer && <p className="mt-3 text-xs text-gray-500">{footer}</p>}
    </motion.div>
  );

  if (href) {
    return <Link to={href}>{card}</Link>;
  }

  return card;
}

