import React from "react";

export default function StatCard({ label, value }) {
  return (
    <div className="p-4 bg-gray-50 dark:bg-gray-800/60 rounded-lg flex flex-col items-start border border-gray-200 dark:border-gray-700 transition-colors">
      <div className="text-xs text-gray-500 dark:text-gray-400">{label}</div>
      <div className="text-2xl font-bold text-[#0b6e4f] dark:text-[#0b6e4f]">
        {value != null ? value : "—"}
      </div>
    </div>
  );
}