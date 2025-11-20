// src/modules/dashboard/ActionGrid.jsx
import ActionCard from "./ActionCard";

export default function ActionGrid({ items = [], columns = "grid-cols-1 md:grid-cols-3" }) {
  if (!items.length) return null;
  return (
    <div className={`grid gap-4 ${columns}`}>
      {items.map((item) => (
        <ActionCard key={item.title} {...item} />
      ))}
    </div>
  );
}

