import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { Upload, X } from "lucide-react";
import {
  createMaintenanceRequest,
  updateMaintenanceRequest,
  getMaintenanceRequest,
} from "@/services/maintenanceService";
import { getProperties } from "@/services/propertyService";
import { useAuth } from "@/context/AuthContext";
import Button from "@/components/ui/Button";

export default function MaintenanceRequestForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const isEdit = !!id;

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [properties, setProperties] = useState([]);
  const [formData, setFormData] = useState({
    property_id: "",
    artisan_id: "",
    title: "",
    description: "",
    priority: "medium",
    location_in_property: "",
    images: [],
  });

  useEffect(() => {
    loadProperties();
    if (isEdit) {
      loadRequest();
    }
  }, [id]);

  const loadProperties = async () => {
    try {
      if (user?.role === "tenant") {
        // Load user's booked properties - tenants see properties they've booked
        const data = await getProperties({ status: "rented" });
        setProperties(data.results || data);
      } else {
        // For landlords/artisans, load all properties or their own
        const data = await getProperties();
        setProperties(data.results || data);
      }
    } catch (err) {
      console.error("Failed to load properties:", err);
    }
  };

  const loadRequest = async () => {
    try {
      const data = await getMaintenanceRequest(id);
      setFormData({
        property_id: data.property?.id?.toString() || "",
        artisan_id: data.artisan?.id?.toString() || "",
        title: data.title || "",
        description: data.description || "",
        priority: data.priority || "medium",
        location_in_property: data.location_in_property || "",
        images: [],
      });
    } catch (err) {
      setError(err.message || "Failed to load maintenance request");
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    setFormData((prev) => ({
      ...prev,
      images: [...prev.images, ...files],
    }));
  };

  const removeImage = (index) => {
    setFormData((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const submitData = new FormData();
      submitData.append("property_id", formData.property_id);
      if (formData.artisan_id) submitData.append("artisan_id", formData.artisan_id);
      submitData.append("title", formData.title);
      submitData.append("description", formData.description);
      submitData.append("priority", formData.priority);
      if (formData.location_in_property) {
        submitData.append("location_in_property", formData.location_in_property);
      }

      formData.images.forEach((image) => {
        submitData.append("images", image);
      });

      if (isEdit) {
        await updateMaintenanceRequest(id, submitData);
      } else {
        await createMaintenanceRequest(submitData);
      }

      navigate("/maintenance");
    } catch (err) {
      setError(err.message || "Failed to save maintenance request");
    } finally {
      setLoading(false);
    }
  };

  if (user?.role !== "tenant" && !isEdit) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 text-lg">Only tenants can create maintenance requests</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          {isEdit ? "Edit Maintenance Request" : "New Maintenance Request"}
        </h1>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-sm p-6">
          {/* Property Selection */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Property *
            </label>
            <select
              name="property_id"
              value={formData.property_id}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
            >
              <option value="">Select Property</option>
              {properties.map((property) => (
                <option key={property.id} value={property.id}>
                  {property.title} - {property.address}
                </option>
              ))}
            </select>
          </div>

          {/* Title */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
              placeholder="e.g., Leaky faucet in kitchen"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
            />
          </div>

          {/* Description */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description *
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              required
              rows={4}
              placeholder="Describe the maintenance issue in detail..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
            />
          </div>

          {/* Priority and Location */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Priority *</label>
              <select
                name="priority"
                value={formData.priority}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Location in Property
              </label>
              <input
                type="text"
                name="location_in_property"
                value={formData.location_in_property}
                onChange={handleChange}
                placeholder="e.g., Kitchen, Bathroom"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
              />
            </div>
          </div>

          {/* Images */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Upload Images (Optional)
            </label>
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={handleImageChange}
              className="hidden"
              id="image-upload"
            />
            <label
              htmlFor="image-upload"
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 mb-4"
            >
              <Upload className="w-5 h-5 mr-2" />
              Choose Images
            </label>
            {formData.images.length > 0 && (
              <div className="grid grid-cols-4 gap-4">
                {formData.images.map((image, index) => (
                  <div key={index} className="relative">
                    <img
                      src={URL.createObjectURL(image)}
                      alt={`Preview ${index + 1}`}
                      className="w-full h-32 object-cover rounded-lg"
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="absolute top-2 right-2 bg-red-600 text-white rounded-full p-1"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Submit Buttons */}
          <div className="flex gap-4">
            <Button type="submit" loading={loading} className="flex-1">
              {isEdit ? "Update Request" : "Submit Request"}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate("/maintenance")}
            >
              Cancel
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

