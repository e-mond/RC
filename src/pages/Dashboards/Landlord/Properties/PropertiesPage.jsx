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
  setProperties(res?.data || res || []);
};


  return (
    <div className="p-6">
      <div className="flex justify-between mb-4">
        <h1 className="text-xl font-semibold text-gray-900 dark:text-white">Properties</h1>
        <Button asChild>
          <Link to="/landlord/properties/new">Add Property</Link>
        </Button>
      </div>

      <div className="bg-white dark:bg-gray-900 shadow rounded-lg border border-gray-200 dark:border-gray-800 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50 dark:bg-gray-800/60">
            <tr className="border-b border-gray-200 dark:border-gray-700">
              <th className="p-3 text-left text-sm font-medium text-gray-700 dark:text-gray-300">Name</th>
              <th className="p-3 text-left text-sm font-medium text-gray-700 dark:text-gray-300">Location</th>
              <th className="p-3 text-left text-sm font-medium text-gray-700 dark:text-gray-300">Rent</th>
              <th className="p-3 text-left text-sm font-medium text-gray-700 dark:text-gray-300">Actions</th>
            </tr>
          </thead>

          <tbody>
            {Array.isArray(properties) && properties.map((p) => (
              <tr
                key={p.id}
                className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
              >
                <td className="p-3 text-gray-900 dark:text-gray-100">{p.title}</td>
                <td className="p-3 text-gray-600 dark:text-gray-400">{p.address}{p.city ? `, ${p.city}` : ''}</td>
                <td className="p-3 font-medium text-gray-900 dark:text-gray-100">₵{p.price}</td>
                <td className="p-3">
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