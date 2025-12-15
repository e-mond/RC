// src/pages/Dashboards/Landlord/Properties/PropertyForm.jsx
import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { fetchProperty, createProperty, updateProperty, getAmenities } from "@/services/propertyService";
import { propertySchema } from "@/utils/propertyValidation";
import ImageUploader from "@/components/landlord/ImageUploader";
import MapPicker from "@/components/landlord/MapPicker";
import Button from "@/components/ui/Button";
import { AlertCircle, Loader2 } from "lucide-react";

/**
 * PropertyForm - Enhanced with react-hook-form + zod validation
 * Supports Create and Edit modes + Full Dark Mode Support
 */
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
      address: "",
      price: "",
      currency: "GHS",
      bedrooms: 1,
      bathrooms: 1,
      property_type: "apartment",
      status: "draft",
      amenities: [],
      images: [],
      country: "Ghana",
    },
    mode: "onChange",
  });

  const watchedImages = watch("images");
  const watchedAmenities = watch("amenities");
  const watchedLocation = watch(["lat", "lng", "address"]);

  // Load property data for edit mode
  useEffect(() => {
    let mounted = true;
    const load = async () => {
      if (!id) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const res = await fetchProperty(id);
        const prop = res?.data ?? res;
        if (!mounted) return;

        reset({
          title: prop.title || "",
          description: prop.description || "",
          address: prop.address || "",
          city: prop.city || "",
          region: prop.region || "",
          country: prop.country || "Ghana",
          price: prop.price || prop.priceGhs || "",
          currency: prop.currency || "GHS",
          deposit: prop.deposit || "",
          bedrooms: prop.bedrooms ?? 1,
          bathrooms: prop.bathrooms ?? 1,
          area: prop.area || prop.area_sqm || "",
          area_sqm: prop.area_sqm || prop.area || "",
          property_type: prop.property_type || "apartment",
          status: prop.status || "draft",
          amenities: prop.amenities?.map((a) => (typeof a === "string" ? a : a.name || a)) || [],
          images: prop.images || [],
          lat: prop.lat || prop.latitude || "",
          lng: prop.lng || prop.longitude || "",
        });
      } catch (err) {
        console.error("fetchProperty:", err);
      } finally {
        if (mounted) setLoading(false);
      }
    };
    load();
    return () => {
      mounted = false;
    };
  }, [id, reset]);

  // Load amenities list
  useEffect(() => {
    let mounted = true;
    const loadAmenities = async () => {
      try {
        setAmenitiesLoading(true);
        const data = await getAmenities();
        if (mounted) {
          setAmenitiesList(Array.isArray(data) ? data : []);
        }
      } catch (err) {
        console.error("Failed to load amenities:", err);
      } finally {
        if (mounted) setAmenitiesLoading(false);
      }
    };
    loadAmenities();
    return () => {
      mounted = false;
    };
  }, []);

  const onSubmit = async (data) => {
    setSubmitting(true);
    try {
      const payload = {
        title: data.title,
        description: data.description || "",
        address: data.address,
        city: data.city || "",
        region: data.region || "",
        country: data.country || "Ghana",
        price: Number(data.price),
        currency: data.currency,
        bedrooms: Number(data.bedrooms),
        bathrooms: Number(data.bathrooms),
        property_type: data.property_type,
        status: data.status,
        amenities: data.amenities.map((a) => (typeof a === "string" ? a : a.name)),
        images: data.images.filter((img) => typeof img === "string"),
        lat: data.lat ? String(data.lat) : "",
        lng: data.lng ? String(data.lng) : "",
      };

      // Optional fields - only include if provided
      if (data.deposit) payload.deposit = Number(data.deposit);
      if (data.area || data.area_sqm) payload.area_sqm = Number(data.area || data.area_sqm);
      if (data.lat) payload.latitude = String(data.lat);
      if (data.lng) payload.longitude = String(data.lng);

      // Convert amenity names to IDs
      if (data.amenities && data.amenities.length > 0) {
        const amenityIds = data.amenities
          .map((amenityName) => {
            const found = amenitiesList.find(
              (a) => a.name === amenityName || a.id === amenityName
            );
            return found?.id;
          })
          .filter((id) => id !== undefined);
        if (amenityIds.length > 0) payload.amenity_ids = amenityIds;
      }

      if (id) {
        await updateProperty(id, payload);
      } else {
        await createProperty(payload);
      }

      navigate("/landlord/properties", { replace: true });
    } catch (err) {
      console.error("submitProperty:", err);
    } finally {
      setSubmitting(false);
    }
  };

  const toggleAmenity = (amenityIdOrName) => {
    const current = watchedAmenities || [];
    const isSelected = current.some(
      (a) => (typeof a === "string" ? a : a.id || a.name) === amenityIdOrName
    );

    if (isSelected) {
      setValue(
        "amenities",
        current.filter((a) => (typeof a === "string" ? a : a.id || a.name) !== amenityIdOrName),
        { shouldDirty: true }
      );
    } else {
      const amenity = amenitiesList.find((a) => a.id === amenityIdOrName || a.name === amenityIdOrName);
      setValue("amenities", [...current, amenity?.name || amenityIdOrName], { shouldDirty: true });
    }
  };

  const handleLocationChange = ({ address, lat, lng } = {}) => {
    if (address !== undefined) setValue("address", address, { shouldDirty: true });
    if (lat !== undefined) setValue("lat", lat, { shouldDirty: true });
    if (lng !== undefined) setValue("lng", lng, { shouldDirty: true });
  };

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[400px] bg-gray-50 dark:bg-gray-900">
        <Loader2 className="w-8 h-8 animate-spin text-[#0b6e4f]" />
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700">
        <header className="flex items-center justify-between border-b border-gray-200 dark:border-gray-700 pb-4">
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
            {isEdit ? "Edit Property" : "Create Property"}
          </h3>
          <div className="text-sm text-gray-500 dark:text-gray-400">
            {isEdit ? `ID: ${id}` : "Draft mode until published"}
          </div>
        </header>

        {/* Form Errors Summary */}
        {Object.keys(errors).length > 0 && (
          <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <div className="flex items-center gap-2 text-red-700 dark:text-red-400 font-medium mb-2">
              <AlertCircle size={18} />
              <span>Please fix the following errors:</span>
            </div>
            <ul className="list-disc list-inside text-sm text-red-600 dark:text-red-300 space-y-1">
              {Object.entries(errors).map(([key, fieldError]) => (
                <li key={key}>
                  {key}: {fieldError?.message || ""}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Basic Information */}
        <section className="space-y-4">
          <h4 className="text-lg font-semibold text-gray-900 dark:text-white">Basic Information</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Title <span className="text-red-500">*</span>
              </label>
              <input
                {...register("title")}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#0b6e4f] focus:border-[#0b6e4f] transition-colors
                  ${errors.title 
                    ? "border-red-500 dark:border-red-500 bg-red-50 dark:bg-red-900/10" 
                    : "border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700"
                  } text-gray-900 dark:text-white`}
                placeholder="e.g., 3BR Apartment in East Legon"
              />
              {errors.title && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.title.message}</p>
              )}
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
              <textarea
                {...register("description")}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#0b6e4f] bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                placeholder="Describe your property..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Property Type <span className="text-red-500">*</span>
              </label>
              <select
                {...register("property_type")}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#0b6e4f] bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
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
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Status</label>
              <select
                {...register("status")}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#0b6e4f] bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="draft">Draft</option>
                <option value="pending">Pending Approval</option>
                <option value="active">Active</option>
                <option value="suspended">Suspended</option>
              </select>
            </div>
          </div>
        </section>

        {/* Location */}
        <section className="space-y-4">
          <h4 className="text-lg font-semibold text-gray-900 dark:text-white">Location</h4>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Address <span className="text-red-500">*</span>
            </label>
            <input
              {...register("address")}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#0b6e4f] focus:border-[#0b6e4f] transition-colors
                ${errors.address 
                  ? "border-red-500 dark:border-red-500 bg-red-50 dark:bg-red-900/10" 
                  : "border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700"
                } text-gray-900 dark:text-white`}
              placeholder="Full address"
            />
            {errors.address && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.address.message}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">City</label>
              <input
                {...register("city")}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#0b6e4f] bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                placeholder="e.g., Accra"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Region</label>
              <input
                {...register("region")}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#0b6e4f] bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                placeholder="e.g., Greater Accra"
              />
            </div>
          </div>

          <MapPicker
            value={{
              address: watchedLocation[2] || "",
              lat: watchedLocation[0] || "",
              lng: watchedLocation[1] || "",
            }}
            onChange={handleLocationChange}
          />
        </section>

        {/* Pricing */}
        <section className="space-y-4">
          <h4 className="text-lg font-semibold text-gray-900 dark:text-white">Pricing</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Price <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                step="0.01"
                {...register("price")}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#0b6e4f] transition-colors
                  ${errors.price 
                    ? "border-red-500 dark:border-red-500 bg-red-50 dark:bg-red-900/10" 
                    : "border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700"
                  } text-gray-900 dark:text-white`}
                placeholder="0.00"
              />
              {errors.price && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.price.message}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Currency</label>
              <select
                {...register("currency")}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#0b6e4f] bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="GHS">GHS (₵)</option>
                <option value="USD">USD ($)</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Deposit</label>
              <input
                type="number"
                step="0.01"
                {...register("deposit")}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#0b6e4f] bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                placeholder="Optional"
              />
            </div>
          </div>
        </section>

        {/* Property Details */}
        <section className="space-y-4">
          <h4 className="text-lg font-semibold text-gray-900 dark:text-white">Property Details</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Bedrooms <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                {...register("bedrooms")}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#0b6e4f] transition-colors
                  ${errors.bedrooms 
                    ? "border-red-500 dark:border-red-500 bg-red-50 dark:bg-red-900/10" 
                    : "border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700"
                  } text-gray-900 dark:text-white`}
                min="0"
                max="20"
              />
              {errors.bedrooms && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.bedrooms.message}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Bathrooms <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                {...register("bathrooms")}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#0b6e4f] transition-colors
                  ${errors.bathrooms 
                    ? "border-red-500 dark:border-red-500 bg-red-50 dark:bg-red-900/10" 
                    : "border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700"
                  } text-gray-900 dark:text-white`}
                min="0"
                max="20"
              />
              {errors.bathrooms && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.bathrooms.message}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Area (sqm)</label>
              <input
                type="number"
                step="0.01"
                {...register("area")}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#0b6e4f] bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                placeholder="Optional"
              />
            </div>
          </div>
        </section>

        {/* Images */}
        <section className="space-y-4">
          <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
            Images <span className="text-red-500">*</span>
          </h4>
          <ImageUploader
            value={watchedImages || []}
            onChange={(images) => setValue("images", images, { shouldDirty: true })}
            multiple
          />
          {errors.images && (
            <p className="text-sm text-red-600 dark:text-red-400">{errors.images.message}</p>
          )}
        </section>

        {/* Amenities */}
        <section className="space-y-4">
          <h4 className="text-lg font-semibold text-gray-900 dark:text-white">Amenities</h4>
          {amenitiesLoading ? (
            <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span className="text-sm">Loading amenities...</span>
            </div>
          ) : (
            <div className="flex flex-wrap gap-2">
              {amenitiesList.map((amenity) => {
                const isSelected = watchedAmenities?.some(
                  (a) => (typeof a === "string" ? a : a.name) === amenity.name
                );
                return (
                  <button
                    type="button"
                    key={amenity.id}
                    onClick={() => toggleAmenity(amenity.id)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200
                      ${isSelected
                        ? "bg-[#0b6e4f] text-white ring-2 ring-[#0b6e4f]/50"
                        : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600"
                      }`}
                  >
                    {amenity.name}
                  </button>
                );
              })}
            </div>
          )}
        </section>

        {/* Actions */}
        <div className="flex items-center gap-3 justify-end pt-4 border-t border-gray-200 dark:border-gray-700">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate("/landlord/properties")}
          >
            Cancel
          </Button>
          <Button type="submit" variant="primary" disabled={submitting || !isDirty}>
            {submitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
                {isEdit ? "Saving…" : "Creating…"}
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