
import { useEffect, useState } from "react";
import { getAllProperties } from "@/services/propertyService";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

export default function PropertiesPage() {
  const [properties, setProperties] = useState([]);

  useEffect(() => {
    load();
  }, []);

  const load = async () => {
    const res = await getAllProperties();
    setProperties(res);
  };

  return (
    <div className="p-6">
      <div className="flex justify-between mb-4">
        <h1 className="text-xl font-semibold">Properties</h1>
        <Button asChild>
          <Link to="/landlord/properties/new">Add Property</Link>
        </Button>
      </div>

      <div className="bg-white shadow rounded-lg">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b">
              <th className="p-3">Name</th>
              <th className="p-3">Location</th>
              <th className="p-3">Rent</th>
              <th className="p-3">Actions</th>
            </tr>
          </thead>

          <tbody>
            {properties.map((p) => (
              <tr key={p.id} className="border-b">
                <td className="p-3">{p.name}</td>
                <td className="p-3">{p.location}</td>
                <td className="p-3">${p.rent}</td>
                <td className="p-3 flex gap-2">
                  <Button variant="outline" size="sm" asChild>
                    <Link to={`/landlord/properties/${p.id}/edit`}>Edit</Link>
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

