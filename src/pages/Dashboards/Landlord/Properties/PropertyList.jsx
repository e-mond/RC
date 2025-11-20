// src/pages/Dashboards/Landlord/PropertiesList.jsx
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import PropertyCard from "@/components/shared/PropertyCard";
import { fetchProperties, deleteProperty } from "@/services/propertyService";
import Button from "@/components/ui/Button";

export default function PropertiesList() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = async () => {
    setLoading(true);
    try {
      const res = await fetchProperties();
      // service returns { data: ... } in mock or direct array
      const props = res?.data ?? res;
      setItems(props);
    } catch (err) {
      console.error("fetchProperties:", err);
      setError(err.message || "Failed to load properties");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleDelete = async (id) => {
    // confirm
    if (!confirm("Delete this property? This action cannot be undone.")) return;
    try {
      await deleteProperty(id);
      setItems((s) => s.filter((p) => p.id !== id));
    } catch (err) {
      console.error("deleteProperty:", err);
      alert(err.message || "Delete failed");
    }
  };

  return (
    <div className="space-y-6">
      <header className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">My Properties</h2>
        <div className="flex items-center gap-3">
          <Link to="/landlord/properties/new">
            <Button variant="primary">Create Property</Button>
          </Link>
          <Button variant="ghost" onClick={load}>
            Refresh
          </Button>
        </div>
      </header>

      {loading && <div className="rounded bg-white p-6 shadow-sm">Loading properties…</div>}
      {error && <div className="rounded bg-red-50 p-4 text-red-700">{error}</div>}

      {!loading && !items?.length && <div className="rounded bg-white p-6">No properties yet. Create your first listing.</div>}

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((p) => (
          <PropertyCard
            key={p.id}
            property={p}
            actions={
              <div className="flex gap-2">
                <Link to={`/landlord/properties/${p.id}/edit`} className="text-sm text-[#0b6e4f] hover:underline">
                  Edit
                </Link>
                <button onClick={() => handleDelete(p.id)} className="text-sm text-red-600 hover:underline">
                  Delete
                </button>
              </div>
            }
          />
        ))}
      </div>
    </div>
  );
}
