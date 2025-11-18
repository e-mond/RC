import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Upload, X } from "lucide-react";
import { getProfile, updateProfile } from "@/services/userService";
import { useAuth } from "@/context/AuthContext";
import Button from "@/components/ui/Button";

export default function ProfileEdit() {
  const navigate = useNavigate();
  const { user: currentUser, handleLogin } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    full_name: "",
    phone: "",
    profile_picture: null,
    // Tenant fields
    preferred_location: "",
    rent_range: "",
    // Landlord fields
    business_type: "",
    location: "",
    // Artisan fields
    profession: "",
    experience_years: "",
    service_region: "",
  });
  const [previewImage, setPreviewImage] = useState(null);

  useEffect(() => {
    if (currentUser) {
      setFormData({
        full_name: currentUser.full_name || "",
        phone: currentUser.phone || "",
        profile_picture: null,
        preferred_location: currentUser.preferred_location || "",
        rent_range: currentUser.rent_range || "",
        business_type: currentUser.business_type || "",
        location: currentUser.location || "",
        profession: currentUser.profession || "",
        experience_years: currentUser.experience_years?.toString() || "",
        service_region: currentUser.service_region || "",
      });
      setPreviewImage(currentUser.profile_picture_url);
    }
  }, [currentUser]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData((prev) => ({ ...prev, profile_picture: file }));
      setPreviewImage(URL.createObjectURL(file));
    }
  };

  const removeImage = () => {
    setFormData((prev) => ({ ...prev, profile_picture: null }));
    setPreviewImage(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const submitData = new FormData();
      submitData.append("full_name", formData.full_name);
      if (formData.phone) submitData.append("phone", formData.phone);
      if (formData.profile_picture) {
        submitData.append("profile_picture", formData.profile_picture);
      }

      // Role-specific fields
      if (currentUser?.role === "tenant") {
        if (formData.preferred_location) {
          submitData.append("preferred_location", formData.preferred_location);
        }
        if (formData.rent_range) {
          submitData.append("rent_range", formData.rent_range);
        }
      } else if (currentUser?.role === "landlord") {
        if (formData.business_type) {
          submitData.append("business_type", formData.business_type);
        }
        if (formData.location) {
          submitData.append("location", formData.location);
        }
      } else if (currentUser?.role === "artisan") {
        if (formData.profession) {
          submitData.append("profession", formData.profession);
        }
        if (formData.experience_years) {
          submitData.append("experience_years", formData.experience_years);
        }
        if (formData.service_region) {
          submitData.append("service_region", formData.service_region);
        }
      }

      const updatedProfile = await updateProfile(submitData);
      
      // Update auth context if needed
      if (handleLogin) {
        // Refresh user data
        const profile = await getProfile();
        // Update context would be handled by AuthProvider
      }

      navigate("/profile");
    } catch (err) {
      setError(err.message || "Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 text-lg">Please log in to edit your profile</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Edit Profile</h1>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-sm p-6">
          {/* Profile Picture */}
          <div className="mb-8">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Profile Picture
            </label>
            <div className="flex items-center gap-4">
              {previewImage ? (
                <div className="relative">
                  <img
                    src={previewImage}
                    alt="Profile preview"
                    className="w-24 h-24 rounded-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={removeImage}
                    className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full p-1"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div className="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center">
                  <span className="text-gray-400">No Image</span>
                </div>
              )}
              <div>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                  id="profile-picture-upload"
                />
                <label
                  htmlFor="profile-picture-upload"
                  className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50"
                >
                  <Upload className="w-5 h-5 mr-2" />
                  {previewImage ? "Change Picture" : "Upload Picture"}
                </label>
              </div>
            </div>
          </div>

          {/* Basic Information */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Basic Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  name="full_name"
                  value={formData.full_name}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                />
              </div>
            </div>
          </div>

          {/* Role-Specific Fields */}
          {currentUser.role === "tenant" && (
            <div className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Tenant Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Preferred Location
                  </label>
                  <input
                    type="text"
                    name="preferred_location"
                    value={formData.preferred_location}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Rent Range
                  </label>
                  <input
                    type="text"
                    name="rent_range"
                    value={formData.rent_range}
                    onChange={handleChange}
                    placeholder="e.g., 500-1000 GHS"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                  />
                </div>
              </div>
            </div>
          )}

          {currentUser.role === "landlord" && (
            <div className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Landlord Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Business Type
                  </label>
                  <input
                    type="text"
                    name="business_type"
                    value={formData.business_type}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                  <input
                    type="text"
                    name="location"
                    value={formData.location}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                  />
                </div>
              </div>
            </div>
          )}

          {currentUser.role === "artisan" && (
            <div className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Artisan Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Profession
                  </label>
                  <input
                    type="text"
                    name="profession"
                    value={formData.profession}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Experience (Years)
                  </label>
                  <input
                    type="number"
                    name="experience_years"
                    value={formData.experience_years}
                    onChange={handleChange}
                    min="0"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Service Region
                  </label>
                  <input
                    type="text"
                    name="service_region"
                    value={formData.service_region}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Submit Buttons */}
          <div className="flex gap-4">
            <Button type="submit" loading={loading} className="flex-1">
              Save Changes
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate("/profile")}
            >
              Cancel
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

