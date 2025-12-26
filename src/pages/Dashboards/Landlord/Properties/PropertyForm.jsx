// src/pages/Dashboards/Landlord/Properties/PropertyForm.jsx
import React, { useEffect, useState, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  fetchProperty,
  createProperty,
  updateProperty,
  getAmenities,
  uploadImage,
} from "@/services/propertyService";
import { propertySchema } from "@/utils/propertyValidation";
import ImageUploader from "@/components/landlord/ImageUploader";
import MapPicker from "@/components/landlord/MapPicker";
import Button from "@/components/ui/Button";
import { AlertCircle, Loader2, X, UploadCloud } from "lucide-react";

export default function PropertyForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = !!id;

  const [loading, setLoading] = useState(isEdit);
  const [submitting, setSubmitting] = useState(false);
  const [amenitiesList, setAmenitiesList] = useState([]);
  const [amenitiesLoading, setAmenitiesLoading] = useState(true);

  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
    setValue,
    watch,
    reset,
  } = useForm({
    resolver: zodResolver(propertySchema),
    defaultValues: {
      title: "",
      description: "",
      address: "",
      city: "",
      region: "",
      price: "",
      currency: "GHS",
      deposit: "",
      bedrooms: 1,
      bathrooms: 1,
      area: "",
      property_type: "apartment",
      status: "draft",
      amenities: [],
      images: [], // Will hold { url: string } or { status: "uploading" | "error" }
      lat: "",
      lng: "",
    },
    mode: "onChange",
  });

  const watchedImages = watch("images") || [];
  const watchedAmenities = watch("amenities");
  const watchedAddress = watch("address");
  const watchedLat = watch("lat");
  const watchedLng = watch("lng");

  // Load property for editing
  useEffect(() => {
    if (!id) {
      setLoading(false);
      return;
    }

    const load = async () => {
      try {
        setLoading(true);
        const res = await fetchProperty(id);
        const prop = res?.data ?? res;

        reset({
          title: prop.title || "",
          description: prop.description || "",
          address: prop.address || "",
          city: prop.city || "",
          region: prop.region || "",
          price: prop.price || "",
          currency: prop.currency || "GHS",
          deposit: prop.deposit || "",
          bedrooms: prop.bedrooms ?? 1,
          bathrooms: prop.bathrooms ?? 1,
          area: prop.area_sqm || "",
          property_type: prop.property_type || "apartment",
          status: prop.status === "available" ? "active" : prop.status || "draft",
          amenities: prop.amenities?.map((a) => a.name || a) || [],
          images: prop.images?.map((img) => ({ url: img.image_url || img.image || img })) || [],
          lat: prop.latitude || prop.lat || "",
          lng: prop.longitude || prop.lng || "",
        });
      } catch (err) {
        console.error("Failed to load property:", err);
        alert("Could not load property details.");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [id, reset]);

  // Load amenities
  useEffect(() => {
    const loadAmenities = async () => {
      try {
        setAmenitiesLoading(true);
        const data = await getAmenities();
        setAmenitiesList(data);
      } catch (err) {
        console.error("Failed to load amenities:", err);
      } finally {
        setAmenitiesLoading(false);
      }
    };

    loadAmenities();
  }, []);

  // Sync map changes
  const handleLocationChange = useCallback(
    ({ address, lat, lng } = {}) => {
      if (address !== undefined) setValue("address", address || "", { shouldDirty: true });
      if (lat !== undefined) setValue("lat", lat || "", { shouldDirty: true });
      if (lng !== undefined) setValue("lng", lng || "", { shouldDirty: true });
    },
    [setValue]
  );

  // Handle image uploads with progress
  const handleImageChange = async (files) => {
    if (files.length === 0) return;

    const currentImages = watchedImages.filter((img) => img.url); // Keep only uploaded ones
    const uploadingPlaceholders = files.map(() => ({ status: "uploading" }));
    setValue("images", [...currentImages, ...uploadingPlaceholders], { shouldDirty: true });

    const uploadPromises = files.map(async (file) => {
      try {
        const res = await uploadImage(file);
        return { url: res.url };
      } catch (err) {
        console.error("Image upload failed:", err);
        return { status: "error", message: "Upload failed" };
      }
    });

    const results = await Promise.all(uploadPromises);

    const finalImages = [
      ...currentImages,
      ...results,
    ];

    setValue("images", finalImages, { shouldDirty: true });
  };

  // Remove image by index
  const removeImage = (index) => {
    const newImages = watchedImages.filter((_, i) => i !== index);
    setValue("images", newImages, { shouldDirty: true });
  };

  // Toggle amenity
  const toggleAmenity = (amenityId) => {
    const amenity = amenitiesList.find((a) => a.id === amenityId);
    if (!amenity) return;

    const current = watchedAmenities || [];
    setValue(
      "amenities",
      current.includes(amenity.name)
        ? current.filter((n) => n !== amenity.name)
        : [...current, amenity.name],
      { shouldDirty: true }
    );
  };

  // Submit
  const onSubmit = async (data) => {
    setSubmitting(true);
    try {
      const payload = {
        title: data.title.trim(),
        description: data.description?.trim() || "",
        property_type: data.property_type,
        address: data.address.trim(),
        city: data.city?.trim() || "",
        region: data.region?.trim() || "",
        country: "Ghana",
        price: Number(data.price),
        currency: data.currency,
        bedrooms: Number(data.bedrooms),
        bathrooms: Number(data.bathrooms),
        status: data.status === "active" ? "available" : data.status,
      };

      if (data.deposit) payload.deposit = Number(data.deposit);
      if (data.area) payload.area_sqm = Number(data.area);
      if (data.lat) payload.latitude = Number(data.lat);
      if (data.lng) payload.longitude = Number(data.lng);

      // Amenities: send IDs
      if (data.amenities.length > 0) {
        const ids = data.amenities
          .map((name) => amenitiesList.find((a) => a.name === name)?.id)
          .filter(Boolean);
        if (ids.length > 0) payload.amenity_ids = ids;
      }

      // Images: send only successful URLs
      const imageUrls = watchedImages
        .filter((img) => img.url)
        .map((img) => img.url);
      if (imageUrls.length > 0) {
        payload.images = imageUrls;
      }

      if (isEdit) {
        await updateProperty(id, payload);
      } else {
        await createProperty(payload);
      }

      navigate("/landlord/properties");
    } catch (err) {
      console.error("Submission failed:", err.response?.data || err);
      alert("Failed to save property. Check console for details.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
        <Loader2 className="w-16 h-16 animate-spin text-[#0b6e4f]" />
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-10 bg-white dark:bg-gray-900 rounded-3xl shadow-2xl p-8 lg:p-12">
        {/* Header */}
        <header className="relative border-b dark:border-gray-700 pb-8">
          <div className="absolute top-0 right-0">
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 px-4 py-2 rounded-full">
              Draft mode until published
            </p>
          </div>

          <h3 className="text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white">
            {isEdit ? "Edit Property" : "Create Property"}
          </h3>
          <p className="text-base text-gray-600 dark:text-gray-400 mt-3 max-w-3xl">
            Provide accurate details, location, pricing, and photos to create a complete listing.
          </p>
        </header>

        {/* Validation Errors */}
        {Object.keys(errors).length > 0 && (
          <div className="p-6 bg-red-50 dark:bg-red-900/20 border border-red-300 dark:border-red-800 rounded-2xl">
            <div className="flex items-center gap-3 text-red-700 dark:text-red-400 font-semibold mb-3">
              <AlertCircle size={20} />
              Please fix the following:
            </div>
            <ul className="space-y-1 text-sm text-red-600 dark:text-red-400 list-disc pl-6">
              {Object.entries(errors).map(([field, err]) => (
                <li key={field}>
                  <strong>{field.charAt(0).toUpperCase() + field.slice(1)}:</strong> {err.message}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Basic Information */}
        <section className="space-y-8">
          <h4 className="text-2xl font-semibold text-gray-900 dark:text-white">Basic Information</h4>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="lg:col-span-2">
              <label className="block text-base font-medium mb-3 text-gray-700 dark:text-gray-300">
                Title <span className="text-red-500">*</span>
              </label>
              <input
                {...register("title")}
                placeholder="e.g., Modern 3-Bedroom Apartment in East Legon"
                className="w-full px-5 py-4 border-2 border-gray-300 dark:border-gray-600 rounded-xl focus:ring-4 focus:ring-[#0b6e4f]/20 dark:bg-gray-800 text-base transition"
              />
              {errors.title && <p className="text-red-600 dark:text-red-400 text-sm mt-2">{errors.title.message}</p>}
            </div>

            <div className="lg:col-span-2">
              <label className="block text-base font-medium mb-3 text-gray-700 dark:text-gray-300">Description</label>
              <textarea
                {...register("description")}
                rows={6}
                placeholder="Describe the property, neighborhood, nearby amenities..."
                className="w-full px-5 py-4 border-2 border-gray-300 dark:border-gray-600 rounded-xl dark:bg-gray-800 resize-none text-base transition"
              />
            </div>

            <div>
              <label className="block text-base font-medium mb-3 text-gray-700 dark:text-gray-300">
                Property Type <span className="text-red-500">*</span>
              </label>
              <select
                {...register("property_type")}
                className="w-full px-5 py-4 border-2 border-gray-300 dark:border-gray-600 rounded-xl dark:bg-gray-800 text-base"
              >
                <option value="apartment">Apartment</option>
                <option value="house">House</option>
                <option value="studio">Studio</option>
                <option value="room">Single Room</option>
                <option value="commercial">Commercial</option>
                <option value="land">Land</option>
              </select>
            </div>

            <div>
              <label className="block text-base font-medium mb-3 text-gray-700 dark:text-gray-300">Listing Status</label>
              <select
                {...register("status")}
                className="w-full px-5 py-4 border-2 border-gray-300 dark:border-gray-600 rounded-xl dark:bg-gray-800 text-base"
              >
                <option value="draft">Draft</option>
                <option value="pending">Pending Approval</option>
                <option value="active">Publish Now</option>
                <option value="suspended">Suspended</option>
              </select>
            </div>
          </div>
        </section>

        {/* Location */}
        <section className="space-y-8">
          <h4 className="text-2xl font-semibold text-gray-900 dark:text-white">Property Location</h4>

          <div>
            <label className="block text-base font-medium mb-3 text-gray-700 dark:text-gray-300">
              Address <span className="text-red-500">*</span>
            </label>
            <input
              {...register("address")}
              placeholder="Auto-filled from map • You can edit"
              className="w-full px-5 py-4 border-2 border-gray-300 dark:border-gray-600 rounded-xl focus:ring-4 focus:ring-[#0b6e4f]/20 dark:bg-gray-800 text-base"
            />
            {errors.address && <p className="text-red-600 dark:text-red-400 text-sm mt-2">{errors.address.message}</p>}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
            <input
              {...register("city")}
              placeholder="City"
              className="px-5 py-4 border-2 border-gray-300 dark:border-gray-600 rounded-xl dark:bg-gray-800 text-base"
            />
            <input
              {...register("region")}
              placeholder="Region"
              className="px-5 py-4 border-2 border-gray-300 dark:border-gray-600 rounded-xl dark:bg-gray-800 text-base"
            />
          </div>

          <div>
            <p className="text-base text-gray-600 dark:text-gray-400 mb-5">
              Search address, use current location, or tap/drag on map
            </p>
            <div className="h-96 sm:h-[500px] lg:h-[600px] rounded-2xl overflow-hidden border-4 border-gray-200 dark:border-gray-700 shadow-2xl">
              <MapPicker
                value={{
                  address: watchedAddress || "",
                  lat: watchedLat || null,
                  lng: watchedLng || null,
                }}
                onChange={handleLocationChange}
              />
            </div>
          </div>
        </section>

        {/* Pricing & Details */}
        <section className="grid lg:grid-cols-2 gap-12">
          <div className="space-y-8">
            <h4 className="text-2xl font-semibold text-gray-900 dark:text-white">Pricing</h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div>
                <label className="block text-base font-medium mb-3 text-gray-700 dark:text-gray-300">Monthly Rent *</label>
                <input
                  type="number"
                  {...register("price")}
                  placeholder="0.00"
                  className="w-full px-5 py-4 border-2 border-gray-300 dark:border-gray-600 rounded-xl dark:bg-gray-800 text-base"
                />
              </div>
              <div>
                <label className="block text-base font-medium mb-3 text-gray-700 dark:text-gray-300">Currency</label>
                <select
                  {...register("currency")}
                  className="w-full px-5 py-4 border-2 border-gray-300 dark:border-gray-600 rounded-xl dark:bg-gray-800 text-base"
                >
                  <option value="GHS">GHS (₵)</option>
                  <option value="USD">USD ($)</option>
                </select>
              </div>
              <div>
                <label className="block text-base font-medium mb-3 text-gray-700 dark:text-gray-300">Deposit</label>
                <input
                  type="number"
                  {...register("deposit")}
                  placeholder="Optional"
                  className="w-full px-5 py-4 border-2 border-gray-300 dark:border-gray-600 rounded-xl dark:bg-gray-800 text-base"
                />
              </div>
            </div>
          </div>

          <div className="space-y-8">
            <h4 className="text-2xl font-semibold text-gray-900 dark:text-white">Property Details</h4>
            <div className="grid grid-cols-3 gap-6">
              <div>
                <label className="block text-base font-medium mb-3 text-gray-700 dark:text-gray-300">Bedrooms *</label>
                <input
                  type="number"
                  {...register("bedrooms")}
                  min="0"
                  className="w-full px-5 py-4 border-2 border-gray-300 dark:border-gray-600 rounded-xl dark:bg-gray-800 text-base"
                />
              </div>
              <div>
                <label className="block text-base font-medium mb-3 text-gray-700 dark:text-gray-300">Bathrooms *</label>
                <input
                  type="number"
                  {...register("bathrooms")}
                  min="0"
                  className="w-full px-5 py-4 border-2 border-gray-300 dark:border-gray-600 rounded-xl dark:bg-gray-800 text-base"
                />
              </div>
              <div>
                <label className="block text-base font-medium mb-3 text-gray-700 dark:text-gray-300">Area (sqm)</label>
                <input
                  type="number"
                  {...register("area")}
                  placeholder="Optional"
                  className="w-full px-5 py-4 border-2 border-gray-300 dark:border-gray-600 rounded-xl dark:bg-gray-800 text-base"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Images */}
        <section className="space-y-8">
          <h4 className="text-2xl font-semibold text-gray-900 dark:text-white">
            Property Photos <span className="text-red-500">*</span>
          </h4>

          <ImageUploader
            value={watchedImages.filter((img) => img.url)?.map((img) => img.url) || []}
            onChange={handleImageChange}
            multiple
          />

          {watchedImages.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-6">
              {watchedImages.map((img, i) => (
                <div key={i} className="relative group rounded-xl overflow-hidden shadow-lg bg-gray-100 dark:bg-gray-800">
                  {img.status === "uploading" ? (
                    <div className="h-48 flex flex-col items-center justify-center text-gray-500 dark:text-gray-400">
                      <UploadCloud size={32} className="animate-pulse mb-2" />
                      <span className="text-sm">Uploading...</span>
                    </div>
                  ) : img.status === "error" ? (
                    <div className="h-48 flex items-center justify-center text-red-500">
                      <AlertCircle size={32} />
                      <span className="text-sm mt-2">Failed</span>
                    </div>
                  ) : (
                    <>
                      <img
                        src={img.url}
                        alt={`Property ${i + 1}`}
                        className="w-full h-48 object-cover transition group-hover:scale-105"
                      />
                      <button
                        type="button"
                        onClick={() => removeImage(i)}
                        className="absolute top-2 right-2 bg-red-600 text-white rounded-full p-2 opacity-0 group-hover:opacity-100 transition hover:bg-red-700"
                        aria-label="Remove image"
                      >
                        <X size={16} />
                      </button>
                      <div className="absolute bottom-0 left-0 right-0 bg--to-t from-black/70 to-transparent opacity-0 group-hover:opacity-100 transition p-3">
                        <p className="text-white text-sm font-medium">Photo {i + 1}</p>
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Amenities */}
        <section className="space-y-6">
          <h4 className="text-2xl font-semibold text-gray-900 dark:text-white">Amenities & Features</h4>
          {amenitiesLoading ? (
            <div className="flex items-center gap-3 text-gray-500 dark:text-gray-400">
              <Loader2 className="w-5 h-5 animate-spin" />
              Loading amenities...
            </div>
          ) : amenitiesList.length === 0 ? (
            <p className="text-gray-500 dark:text-gray-400">No amenities available.</p>
          ) : (
            <div className="flex flex-wrap gap-3">
              {amenitiesList.map((amenity) => {
                const isSelected = watchedAmenities.includes(amenity.name);
                return (
                  <button
                    key={amenity.id}
                    type="button"
                    onClick={() => toggleAmenity(amenity.id)}
                    className={`px-5 py-3 rounded-2xl text-base font-medium transition-all shadow-md ${
                      isSelected
                        ? "bg-[#0b6e4f] text-white shadow-[#0b6e4f]/30"
                        : "bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
                    }`}
                  >
                    {amenity.name}
                  </button>
                );
              })}
            </div>
          )}
        </section>

        {/* Submit */}
        <div className="flex flex-col sm:flex-row gap-6 justify-end pt-10 border-t-2 dark:border-gray-700">
          <Button type="button" variant="outline" onClick={() => navigate("/landlord/properties")}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" disabled={submitting || !isDirty}>
            {submitting ? (
              <>
                <Loader2 className="w-6 h-6 animate-spin mr-3" />
                Saving...
              </>
            ) : isEdit ? (
              "Save Changes"
            ) : (
              "Create Property"
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}