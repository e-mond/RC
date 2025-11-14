import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { Upload, X, Plus } from "lucide-react";
import { createProperty, updateProperty, getProperty, getAmenities } from "@/services/propertyService";
import { useAuth } from "@/context/AuthContext";
import Button from "@/components/ui/Button";

export default function AddProperty() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const isEdit = !!id;

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [amenities, setAmenities] = useState([]);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    property_type: "apartment",
    address: "",
    city: "",
    region: "",
    country: "Ghana",
    latitude: "",
    longitude: "",
    price: "",
    currency: "GHS",
    deposit: "",
    bedrooms: "1",
    bathrooms: "1",
    area_sqm: "",
    status: "available",
    images: [],
    amenity_ids: [],
  });

  useEffect(() => {
    loadAmenities();
    if (isEdit) {
      loadProperty();
    }
  }, [id]);

  const loadProperty = async () => {
    try {
      const data = await getProperty(id);
      setFormData({
        title: data.title || "",
        description: data.description || "",
        property_type: data.property_type || "apartment",
        address: data.address || "",
        city: data.city || "",
        region: data.region || "",
        country: data.country || "Ghana",
        latitude: data.latitude || "",
        longitude: data.longitude || "",
        price: data.price || "",
        currency: data.currency || "GHS",
        deposit: data.deposit || "",
        bedrooms: data.bedrooms?.toString() || "1",
        bathrooms: data.bathrooms?.toString() || "1",
        area_sqm: data.area_sqm || "",
        status: data.status || "available",
        images: [],
        amenity_ids: data.amenities?.map((a) => a.amenity?.id || a.amenity_id) || [],
      });
    } catch (err) {
      setError(err.message || "Failed to load property");
    }
  };

  const loadAmenities = async () => {
    try {
      const data = await getAmenities();
      setAmenities(data);
    } catch (err) {
      console.error("Failed to load amenities:", err);
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

  const toggleAmenity = (amenityId) => {
    setFormData((prev) => ({
      ...prev,
      amenity_ids: prev.amenity_ids.includes(amenityId)
        ? prev.amenity_ids.filter((id) => id !== amenityId)
        : [...prev.amenity_ids, amenityId],
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const submitData = new FormData();
      submitData.append("title", formData.title);
      submitData.append("description", formData.description);
      submitData.append("property_type", formData.property_type);
      submitData.append("address", formData.address);
      submitData.append("city", formData.city);
      submitData.append("region", formData.region);
      submitData.append("country", formData.country);
      if (formData.latitude) submitData.append("latitude", formData.latitude);
      if (formData.longitude) submitData.append("longitude", formData.longitude);
      submitData.append("price", formData.price);
      submitData.append("currency", formData.currency);
      if (formData.deposit) submitData.append("deposit", formData.deposit);
      submitData.append("bedrooms", formData.bedrooms);
      submitData.append("bathrooms", formData.bathrooms);
      if (formData.area_sqm) submitData.append("area_sqm", formData.area_sqm);
      submitData.append("status", formData.status);

      // Add images
      formData.images.forEach((image) => {
        submitData.append("images", image);
      });

      // Add amenities
      formData.amenity_ids.forEach((amenityId) => {
        submitData.append("amenity_ids", amenityId);
      });

      if (isEdit) {
        await updateProperty(id, submitData);
      } else {
        await createProperty(submitData);
      }

      navigate("/properties/my-properties");
    } catch (err) {
      setError(err.message || "Failed to save property");
    } finally {
      setLoading(false);
    }
  };

  if (user?.role !== "landlord") {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 text-lg">Only landlords can add properties</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          {isEdit ? "Edit Property" : "Add New Property"}
        </h1>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-sm p-6">
          {/* Basic Information */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Basic Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Title *
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description *
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  required
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Property Type *
                </label>
                <select
                  name="property_type"
                  value={formData.property_type}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                >
                  <option value="apartment">Apartment</option>
                  <option value="house">House</option>
                  <option value="studio">Studio</option>
                  <option value="room">Room</option>
                  <option value="commercial">Commercial</option>
                  <option value="land">Land</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status *</label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                >
                  <option value="available">Available</option>
                  <option value="pending">Pending</option>
                  <option value="rented">Rented</option>
                  <option value="unavailable">Unavailable</option>
                </select>
              </div>
            </div>
          </div>

          {/* Location */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Location</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Address *
                </label>
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">City *</label>
                <input
                  type="text"
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Region *</label>
                <input
                  type="text"
                  name="region"
                  value={formData.region}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Latitude</label>
                <input
                  type="number"
                  step="any"
                  name="latitude"
                  value={formData.latitude}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Longitude</label>
                <input
                  type="number"
                  step="any"
                  name="longitude"
                  value={formData.longitude}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                />
              </div>
            </div>
          </div>

          {/* Pricing */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Pricing</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Price *</label>
                <input
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={handleChange}
                  required
                  min="0"
                  step="0.01"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Currency *</label>
                <select
                  name="currency"
                  value={formData.currency}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                >
                  <option value="GHS">GHS</option>
                  <option value="USD">USD</option>
                </select>
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
          </div>

          {/* Property Details */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Property Details</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Bedrooms *
                </label>
                <input
                  type="number"
                  name="bedrooms"
                  value={formData.bedrooms}
                  onChange={handleChange}
                  required
                  min="0"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Bathrooms *
                </label>
                <input
                  type="number"
                  name="bathrooms"
                  value={formData.bathrooms}
                  onChange={handleChange}
                  required
                  min="0"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Area (sqm)
                </label>
                <input
                  type="number"
                  name="area_sqm"
                  value={formData.area_sqm}
                  onChange={handleChange}
                  min="0"
                  step="0.01"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                />
              </div>
            </div>
          </div>

          {/* Images */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Images</h2>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Upload Images
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
                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50"
              >
                <Upload className="w-5 h-5 mr-2" />
                Choose Images
              </label>
            </div>
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

          {/* Amenities */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Amenities</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {amenities.map((amenity) => (
                <label
                  key={amenity.id}
                  className="flex items-center cursor-pointer p-3 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  <input
                    type="checkbox"
                    checked={formData.amenity_ids.includes(amenity.id)}
                    onChange={() => toggleAmenity(amenity.id)}
                    className="mr-2"
                  />
                  <span className="text-sm text-gray-700">{amenity.name}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Submit Buttons */}
          <div className="flex gap-4">
            <Button type="submit" loading={loading} className="flex-1">
              {isEdit ? "Update Property" : "Create Property"}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate("/properties/my-properties")}
            >
              Cancel
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
