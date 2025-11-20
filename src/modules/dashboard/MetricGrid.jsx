// src/modules/dashboard/MetricGrid.jsx
import MetricCard from "./MetricCard";

export default function MetricGrid({ items = [], columns = "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4" }) {
  return (
    <div className={`grid gap-4 ${columns}`}>
      {items.map((item) => (
        <MetricCard key={item.label} {...item} />
      ))}
    </div>
  );
}

