import React from "react";

export default function StatCard({ label, value }) {
  return (
    <div className="p-4 bg-gray-50 rounded-lg flex flex-col items-start">
      <div className="text-xs text-gray-500">{label}</div>
      <div className="text-2xl font-bold text-[#0b6e4f]">
        {value != null ? value : "—"}
      </div>
    </div>
  );
}