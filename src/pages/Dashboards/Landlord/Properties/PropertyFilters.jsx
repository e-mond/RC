// src/pages/Dashboards/Landlord/Properties/PropertyFilters.jsx
import React from "react";
import Button from "@/components/ui/Button";

/**
 * PropertyFilters
 * - Controlled; receives `value` and `onChange`
 * - Designed minimal but extensible (amenities, map, more filters)
 */
export default function PropertyFilters({ value = {}, onChange = () => {} }) {
  const update = (patch) => onChange({ ...value, ...patch });

  return (
    <div className="bg-white p-4 rounded shadow-sm flex flex-col md:flex-row items-start md:items-center gap-3">
      <input
        type="search"
        value={value.q || ""}
        onChange={(e) => update({ q: e.target.value })}
        placeholder="Search title or address..."
        className="flex-1 border rounded p-2"
      />

      <select value={value.status || ""} onChange={(e) => update({ status: e.target.value })} className="border rounded p-2">
        <option value="">All statuses</option>
        <option value="pending">Pending</option>
        <option value="approved">Approved</option>
        <option value="rejected">Rejected</option>
      </select>

      <input type="number" placeholder="Min price" value={value.minPrice || ""} onChange={(e) => update({ minPrice: e.target.value })} className="w-28 border rounded p-2" />
      <input type="number" placeholder="Max price" value={value.maxPrice || ""} onChange={(e) => update({ maxPrice: e.target.value })} className="w-28 border rounded p-2" />

      <Button variant="primary" onClick={() => update({ page: 1 })}>Apply</Button>
      <Button variant="outline" onClick={() => onChange({ q: "", status: "", minPrice: "", maxPrice: "", page: 1 })}>Reset</Button>
    </div>
  );
}
