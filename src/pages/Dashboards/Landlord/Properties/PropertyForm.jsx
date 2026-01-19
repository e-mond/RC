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
} from "@/services/propertyService";
import { propertySchema } from "@/utils/propertyValidation";
import { sanitizeImageUrls, filterValidImageUrls } from "@/utils/imageValidation";
import ImageUploader from "@/components/landlord/ImageUploader";
import MapPicker from "@/components/landlord/MapPicker";
import Button from "@/components/ui/Button";
import { AlertCircle, Loader2, X, UploadCloud, CheckCircle } from "lucide-react";
import { toast } from "react-hot-toast";

export default function PropertyForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = !!id;

  const [loading, setLoading] = useState(isEdit);
  const [submitting, setSubmitting] = useState(false);
  const [amenitiesList, setAmenitiesList] = useState([]);
  const [amenitiesLoading, setAmenitiesLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);

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
      status: "draft", // Initial form state, will change to pending_approval on submit
      amenities: [],
      images: [], // array of strings (URLs)
      lat: "",
      lng: "",
    },
    mode: "onChange",
  });

  const watchedImages = watch("images") || [];
  const watchedAmenities = watch("amenities") || [];
  // Ensure watchedAmenities is always an array of strings
  const normalizedWatchedAmenities = Array.isArray(watchedAmenities) 
    ? watchedAmenities.map(a => typeof a === "string" ? a : (a?.name || a?.amenity?.name || String(a)))
    : [];
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
        setLoadError(null);
        const res = await fetchProperty(id);
        const prop = res?.data ?? res;

        // Property data loaded successfully

        // Normalize amenities: extract names from objects or use strings directly
        // Backend may return amenities as: strings, {id, name} objects, or {id, amenity: {id, name}} nested objects
        const normalizedAmenities = (prop.amenities || []).map((a) => {
          // If already a string, return as-is
          if (typeof a === "string") {
            return a;
          }
          
          // If it's an object, extract the name
          if (a && typeof a === "object") {
            // Handle { name: "Parking" } format
            if (a.name && typeof a.name === "string") {
              return a.name;
            }
            // Handle { amenity: { name: "Parking" } } nested format
            if (a.amenity && typeof a.amenity === "object") {
              if (a.amenity.name && typeof a.amenity.name === "string") {
                return a.amenity.name;
              }
            }
          }
          
          // Fallback: log warning and return null
          console.warn("[PropertyForm] Unexpected amenity format, cannot extract name:", a);
          return null;
        }).filter((a) => a !== null && a !== undefined && typeof a === "string"); // Only keep valid strings

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
          status: prop.status || "draft", // Keep existing status, default to draft
          amenities: normalizedAmenities,
          images: filterValidImageUrls(prop.images || []),
          lat: prop.latitude || prop.lat || "",
          lng: prop.longitude || prop.lng || "",
        });
      } catch (err) {
        console.error("Failed to load property:", err);
        const errorMessage = err.message || "Could not load property details.";
        const isNotFound = errorMessage.includes("not found") || err.response?.status === 404;
        
        setLoadError(errorMessage);
        
        if (isNotFound) {
          toast.error(`Property with ID "${id}" not found. It may have been deleted.`);
          // Redirect to properties list after a short delay
          setTimeout(() => {
            navigate("/landlord/properties");
          }, 2000);
        } else {
          toast.error(errorMessage);
        }
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
        // Amenities list loaded successfully
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
    ({ address, lat, lng, city, region } = {}) => {
      if (address !== undefined) setValue("address", address || "", { shouldDirty: true });
      if (lat !== undefined) setValue("lat", lat || "", { shouldDirty: true });
      if (lng !== undefined) setValue("lng", lng || "", { shouldDirty: true });
      if (city !== undefined) setValue("city", city || "", { shouldDirty: true });
      if (region !== undefined) setValue("region", region || "", { shouldDirty: true });
    },
    [setValue]
  );

  // Handle image changes
  // ImageUploader component already handles file uploads internally
  // and passes an array of image URLs (strings) to this function
  const handleImageChange = (imageUrls) => {
    if (!imageUrls || !Array.isArray(imageUrls)) return;
    
    // Use shared validation utility to filter invalid URLs
    const validUrls = sanitizeImageUrls(imageUrls);
    
    setValue("images", validUrls, { shouldDirty: true });
    if (process.env.NODE_ENV === 'development') {
      console.log("[DEBUG] Images updated:", validUrls.length, "valid images");
    }
  };

  // Remove image by index
  const removeImage = (index) => {
    const newImages = watchedImages.filter((_, i) => i !== index);
    setValue("images", newImages, { shouldDirty: true });
    if (process.env.NODE_ENV === 'development') {
      console.log("[DEBUG] Image removed at index:", index, "New images count:", newImages.length);
    }
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
    if (process.env.NODE_ENV === 'development') {
      console.log("[DEBUG] Amenity toggled:", amenity.name, "Current amenities:", watchedAmenities);
    }
  };
const onSubmit = async (data) => {
  setSubmitting(true);

  console.log("[DEBUG] === SUBMIT STARTED ===");
  console.log("[DEBUG] Raw form data:", data);

  try {
    const payload = {
      title: (data.title || "").trim(),
      description: (data.description || "").trim() || null,
      property_type: data.property_type || "apartment",
      address: (data.address || "").trim(),
      city: (data.city || "").trim() || null,
      region: (data.region || "").trim() || null,
      country: "Ghana",

      // Numbers: only include if valid & positive
      price: data.price && !isNaN(data.price) && Number(data.price) > 0 
        ? Number(data.price) 
        : undefined,

      currency: data.currency || "GHS",

      deposit: data.deposit && !isNaN(data.deposit) && Number(data.deposit) >= 0 
        ? Number(data.deposit) 
        : undefined,

      bedrooms: data.bedrooms && !isNaN(data.bedrooms) 
        ? Number(data.bedrooms) 
        : 1,

      bathrooms: data.bathrooms && !isNaN(data.bathrooms) 
        ? Number(data.bathrooms) 
        : 1,

      area_sqm: data.area && !isNaN(data.area) && Number(data.area) > 0 
        ? Number(data.area) 
        : undefined,

      // Status: Backend-controlled workflow
      // - Create/Submit → pending_approval (submitted for approval immediately)
      // - Edit/Submit → pending_approval (requires re-approval)
      // - Admin approves → approved
      // - Admin rejects → rejected
      // Note: All property submissions (new or edit) go to pending_approval
      // This ensures properties appear in admin pending approvals immediately
      status: "pending_approval",  // All submissions require approval

      // Location: only send if both lat & lng are valid numbers
      // Backend requires max 6 decimal places for coordinates
      latitude: data.lat && !isNaN(Number(data.lat)) 
        ? parseFloat(Number(data.lat).toFixed(6)) 
        : null,
      longitude: data.lng && !isNaN(Number(data.lng)) 
        ? parseFloat(Number(data.lng).toFixed(6)) 
        : null,
    };

    // Amenities IDs
    // Convert amenity names to IDs before sending to backend
    // Backend expects array of strings (amenity IDs as strings)
    if (data.amenities?.length > 0) {
      const ids = data.amenities
        .map(name => {
          // Ensure name is a string
          if (typeof name !== "string") {
            console.warn("[PropertyForm] Invalid amenity name type:", typeof name, name);
            return null;
          }
          const amenity = amenitiesList.find(a => a.name === name);
          if (!amenity || !amenity.id) {
            console.warn("[PropertyForm] Amenity not found in list:", name);
            return null;
          }
          // Ensure ID is converted to string
          return String(amenity.id);
        })
        .filter(Boolean); // Remove nulls
      
      if (ids.length > 0) {
        payload.amenity_ids = ids;
      }
    }

    // Images: validate and sanitize before sending to backend
    if (data.images?.length > 0) {
      // Use shared validation utility to filter invalid URLs
      payload.images = sanitizeImageUrls(data.images);
    }

    // Remove undefined values from payload (backend validation doesn't like them)
    Object.keys(payload).forEach(key => {
      if (payload[key] === undefined) {
        delete payload[key];
      }
    });

    console.log("[DEBUG] Sending this payload:", payload);
    console.log("[DEBUG] Amenity IDs being sent:", payload.amenity_ids);

    if (isEdit) {
      await updateProperty(id, payload);
    } else {
      await createProperty(payload);
    }

    // Success notification
    toast.success(
      isEdit 
        ? "Property updated successfully! It will be reviewed before going live." 
        : "Property created successfully! It will be reviewed before going live.",
      {
        duration: 5000,
        icon: "✅",
        style: {
          borderRadius: "12px",
          background: "#10b981",
          color: "#fff",
        },
      }
    );

    console.log("[DEBUG] Success! Property created/updated");
    
    // Navigate after a short delay to show the success message
    setTimeout(() => {
      navigate("/landlord/properties");
    }, 1000);
  } catch (err) {
    console.error("[DEBUG] Submission error:", err);
    console.log("[DEBUG] Error details:", {
      message: err.message,
      response: err.response,
      responseData: err.response?.data,
      status: err.response?.status,
    });

    // Extract and format error message
    let errorMessage = err.message || "Failed to save property";
    let errorDetails = [];

    if (err.response?.data) {
      const errorData = err.response.data;
      
      // Handle Django validation errors
      if (typeof errorData === 'object' && !Array.isArray(errorData)) {
        errorDetails = Object.entries(errorData).map(([field, messages]) => {
          const msg = Array.isArray(messages) ? messages[0] : messages;
          // Format field name for display
          const fieldName = field.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
          return `${fieldName}: ${msg}`;
        });
        
        if (errorDetails.length > 0) {
          errorMessage = errorDetails.join('\n');
        } else if (errorData.detail) {
          errorMessage = errorData.detail;
        } else if (errorData.message) {
          errorMessage = errorData.message;
        }
      } else if (typeof errorData === 'string') {
        errorMessage = errorData;
      }
    }

    // Show error toast with details
    toast.error(
      errorDetails.length > 0 
        ? `Validation errors:\n${errorDetails.slice(0, 3).join('\n')}${errorDetails.length > 3 ? `\n...and ${errorDetails.length - 3} more` : ''}`
        : errorMessage,
      {
        duration: 6000,
        icon: "❌",
        style: {
          borderRadius: "12px",
          background: "#ef4444",
          color: "#fff",
          maxWidth: "500px",
          whiteSpace: "pre-line",
        },
      }
    );
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

  // Show error state if property failed to load
  if (loadError && isEdit) {
    const isNotFound = loadError.includes("not found") || loadError.includes("404");
    
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white dark:bg-gray-900 rounded-xl shadow-lg p-6 text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            {isNotFound ? "Property Not Found" : "Error Loading Property"}
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            {isNotFound 
              ? `The property with ID "${id}" could not be found. It may have been deleted or doesn't exist. Redirecting to properties list...`
              : loadError
            }
          </p>
          <Button 
            onClick={() => navigate("/landlord/properties")} 
            variant="outline"
          >
            Back to Properties
          </Button>
        </div>
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
              {isEdit ? "Edit Property" : "Create Property"}
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
              <label className="block text-base font-medium mb-3 text-gray-700 dark:text-gray-300">
                Status <span className="text-xs text-gray-500 dark:text-gray-400">(Read-only)</span>
              </label>
              <div className="w-full px-5 py-4 border-2 border-gray-300 dark:border-gray-600 rounded-xl dark:bg-gray-800 text-base bg-gray-50 dark:bg-gray-800/50">
                <span className={`inline-flex px-3 py-1 rounded-full text-sm font-medium ${
                  watch("status") === 'approved' || watch("status") === 'approved'
                    ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                    : watch("status") === 'pending' || watch("status") === 'pending_approval'
                    ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                    : watch("status") === 'rejected'
                    ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                    : 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400'
                }`}>
                  {watch("status") === 'pending_approval' ? 'Pending Approval' : 
                   watch("status") === 'approved' ? 'Approved' :
                   watch("status") === 'rejected' ? 'Rejected' :
                   watch("status") === 'draft' ? 'Draft' :
                   (watch("status") || 'Draft')}
                </span>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                  {isEdit 
                    ? "Editing this property will change status to 'Pending Approval' for admin review."
                    : "New properties start as 'Draft'. Submitting will change status to 'Pending Approval'."
                  }
                </p>
              </div>
              {/* Hidden input to maintain form state */}
              <input type="hidden" {...register("status")} />
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
            <div className="h-96 sm:h-125 lg:h-150 rounded-2xl overflow-hidden border-4 border-gray-200 dark:border-gray-700 shadow-2xl">
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
            value={watchedImages.filter(img => typeof img === 'string')}
            onChange={handleImageChange}
            multiple
          />

          {watchedImages.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-6">
              {watchedImages.map((img, i) => (
                <div key={i} className="relative group rounded-xl overflow-hidden shadow-lg bg-gray-100 dark:bg-gray-800">
                  {typeof img === 'object' && img.status === "uploading" ? (
                    <div className="h-48 flex flex-col items-center justify-center text-gray-500 dark:text-gray-400">
                      <UploadCloud size={32} className="animate-pulse mb-2" />
                      <span className="text-sm">Uploading...</span>
                    </div>
                  ) : typeof img === 'object' && img.status === "error" ? (
                    <div className="h-48 flex items-center justify-center text-red-500">
                      <AlertCircle size={32} />
                      <span className="text-sm mt-2">Failed</span>
                    </div>
                  ) : (
                    <>
                      <img
                        src={img}
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
                const isSelected = normalizedWatchedAmenities.includes(amenity.name);
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