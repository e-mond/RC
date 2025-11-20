// src/services/propertyService.js
import apiClient from "./apiClient";

// Default fallback mocks (always available)
let mockData = {
  withData: null,
  mockProperties: [
    {
      id: "mock_1",
      title: "Beautiful Apartment in East Legon",
      address: "East Legon, Accra",
      priceGhs: 1500,
      images: ["https://placehold.co/600x400?text=Mock+1"],
    },
  ],
};

// Dynamically load real mocks only when needed (Vite-friendly)
if (import.meta.env.DEV || String(import.meta.env.VITE_USE_MOCK).toLowerCase() === "true") {
  import("@/mocks/propertyMock")
    .then((module) => {
      // Merge real mocks if file exists
      mockData = { ...mockData, ...module.default };
    })
    .catch(() => {
      console.warn("propertyMock.js not found — using built-in fallback mocks");
    });
}

const USE_MOCK = String(import.meta.env.VITE_USE_MOCK).toLowerCase() === "true";

// Helper: simulate network delay
const withDelay = (data, ms = 400) =>
  new Promise((resolve) => setTimeout(() => resolve(data), ms));

function extractError(err, fallback = "Server error") {
  if (!err) return new Error(fallback);
  if (err.response?.data?.message) return new Error(err.response.data.message);
  if (err.message) return new Error(err.message);
  return new Error(fallback);
}

/* ========== Properties ========== */

export const fetchProperties = async (opts = {}) => {
  if (USE_MOCK) {
    const result = { data: mockData.mockProperties || [] };
    return withDelay(result, 450);
  }

  try {
    const { data } = await apiClient.get("/properties", { params: opts });
    return data;
  } catch (err) {
    throw extractError(err, "Failed to fetch properties");
  }
};

export const fetchProperty = async (id) => {
  if (!id) throw new Error("fetchProperty: id required");

  if (USE_MOCK) {
    const property = mockData.mockProperties?.find((p) => p.id === id);
    return withDelay({ data: property || null }, 300);
  }

  try {
    const { data } = await apiClient.get(`/properties/${encodeURIComponent(id)}`);
    return data;
  } catch (err) {
    throw extractError(err, "Failed to fetch property");
  }
};

export const createProperty = async (payload) => {
  if (USE_MOCK) {
    const newProp = {
      ...payload,
      id: `mock_${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    mockData.mockProperties.unshift(newProp);
    return withDelay({ data: newProp }, 600);
  }

  try {
    const { data } = await apiClient.post("/properties", payload);
    return data;
  } catch (err) {
    throw extractError(err, "Failed to create property");
  }
};

export const updateProperty = async (id, payload) => {
  if (!id) throw new Error("updateProperty: id required");

  if (USE_MOCK) {
    const idx = mockData.mockProperties.findIndex((p) => p.id === id);
    if (idx === -1) throw new Error("Mock: property not found");

    mockData.mockProperties[idx] = {
      ...mockData.mockProperties[idx],
      ...payload,
      updatedAt: new Date().toISOString(),
    };

    return withDelay({ data: mockData.mockProperties[idx] }, 500);
  }

  try {
    const { data } = await apiClient.put(`/properties/${encodeURIComponent(id)}`, payload);
    return data;
  } catch (err) {
    throw extractError(err, "Failed to update property");
  }
};

export const deleteProperty = async (id) => {
  if (!id) throw new Error("deleteProperty: id required");

  if (USE_MOCK) {
    mockData.mockProperties = mockData.mockProperties.filter((p) => p.id !== id);
    return withDelay({ success: true }, 400);
  }

  try {
    const { data } = await apiClient.delete(`/properties/${encodeURIComponent(id)}`);
    return data;
  } catch (err) {
    throw extractError(err, "Failed to delete property");
  }
};

export const uploadImage = async (file) => {
  if (!file) throw new Error("uploadImage: file required");

  if (USE_MOCK) {
    const mockUrl = `https://placehold.co/800x600/orange/white?text=${encodeURIComponent(
      file.name.split(".")[0]
    )}`;
    return withDelay({ url: mockUrl }, 800);
  }

  try {
    const fd = new FormData();
    fd.append("file", file);
    const { data } = await apiClient.post("/uploads/images", fd, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return data;
  } catch (err) {
    throw extractError(err, "Image upload failed");
  }
};

export const getAmenities = async () => {
  if (USE_MOCK) {
    // Import mock amenities
    try {
      const { mockAmenities } = await import("@/mocks/propertyMock");
      return withDelay(mockAmenities.map((name, idx) => ({ id: `amenity_${idx}`, name })), 300);
    } catch {
      // Fallback amenities
      const fallback = [
        "Parking",
        "Water",
        "Electricity",
        "Internet",
        "Kitchen",
        "Washing Machine",
        "Balcony",
        "Fenced Compound",
        "Air Conditioning",
        "Security",
      ];
      return withDelay(fallback.map((name, idx) => ({ id: `amenity_${idx}`, name })), 300);
    }
  }

  try {
    const { data } = await apiClient.get("/amenities");
    return data;
  } catch (err) {
    throw extractError(err, "Failed to fetch amenities");
  }
};
export { fetchProperties as getAllProperties }

export default {
  fetchProperty,
  createProperty,
  updateProperty,
  deleteProperty,
  uploadImage,
  getAmenities,
  getAllProperties: fetchProperties,
};