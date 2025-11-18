import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { createBooking } from "@/services/bookingService";
import { getProperty } from "@/services/propertyService";
import { useAuth } from "@/context/AuthContext";
import Button from "@/components/ui/Button";

export default function BookingForm() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const propertyId = searchParams.get("property");
  const { user } = useAuth();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [property, setProperty] = useState(null);
  const [formData, setFormData] = useState({
    property_id: propertyId || "",
    start_date: "",
    end_date: "",
    monthly_rent: "",
    deposit: "",
    notes: "",
  });

  useEffect(() => {
    if (propertyId) {
      loadProperty();
    }
  }, [propertyId]);

  const loadProperty = async () => {
    try {
      const data = await getProperty(propertyId);
      setProperty(data);
      setFormData((prev) => ({
        ...prev,
        property_id: propertyId,
        monthly_rent: data.price?.toString() || "",
        deposit: data.deposit?.toString() || "",
      }));
    } catch (err) {
      setError(err.message || "Failed to load property");
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const bookingData = {
        property_id: parseInt(formData.property_id),
        start_date: formData.start_date,
        end_date: formData.end_date || null,
        monthly_rent: parseFloat(formData.monthly_rent),
        deposit: formData.deposit ? parseFloat(formData.deposit) : null,
        notes: formData.notes,
      };

      await createBooking(bookingData);
      navigate("/bookings");
    } catch (err) {
      setError(err.message || "Failed to create booking");
    } finally {
      setLoading(false);
    }
  };

  if (user?.role !== "tenant") {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 text-lg">Only tenants can create bookings</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Book Property</h1>

        {property && (
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">{property.title}</h2>
            <p className="text-gray-600">{property.address}, {property.city}</p>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-sm p-6">
          {!propertyId && (
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Property ID *
              </label>
              <input
                type="number"
                name="property_id"
                value={formData.property_id}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
              />
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Start Date *
              </label>
              <input
                type="date"
                name="start_date"
                value={formData.start_date}
                onChange={handleChange}
                required
                min={new Date().toISOString().split("T")[0]}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                End Date (Optional)
              </label>
              <input
                type="date"
                name="end_date"
                value={formData.end_date}
                onChange={handleChange}
                min={formData.start_date || new Date().toISOString().split("T")[0]}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Monthly Rent *
              </label>
              <input
                type="number"
                name="monthly_rent"
                value={formData.monthly_rent}
                onChange={handleChange}
                required
                min="0"
                step="0.01"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Deposit</label>
              <input
                type="number"
                name="deposit"
                value={formData.deposit}
                onChange={handleChange}
                min="0"
                step="0.01"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
              />
            </div>
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              rows={4}
              placeholder="Any additional information..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
            />
          </div>

          <div className="flex gap-4">
            <Button type="submit" loading={loading} className="flex-1">
              Submit Booking Request
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate("/bookings")}
            >
              Cancel
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

