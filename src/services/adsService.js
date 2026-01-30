import apiClient from "./apiClient";

/**
 * Ads Service
 * Handles all advertisement-related API calls
 * 
 * Mock Mode:
 * - Supports hybrid mock/real API system
 * - Mock data provided when VITE_USE_MOCK=true
 * - Production uses real API endpoints
 */

/**
 * Mock Mode Detection
 */
const USE_MOCK = String(import.meta.env.VITE_USE_MOCK || "").toLowerCase() === "true";

/**
 * Simulate Network Delay
 */
const withDelay = (data, ms = 400) =>
  new Promise((resolve) => setTimeout(() => resolve(data), ms));

/**
 * Mock Ads Data
 */
const mockAds = [
  {
    id: "ad_001",
    title: "Premium Property Listing",
    description: "Get your property featured at the top of search results",
    image_url: "https://placehold.co/800x400?text=Premium+Listing+Ad",
    placement: "banner",
    ad_type: "promotional",
    target_roles: ["landlord"],
    is_active: true,
    click_url: "/landlord/properties",
    views: 0,
    clicks: 0,
  },
  {
    id: "ad_002",
    user_id: "user_mock_002",
    title: "Upgrade to Premium",
    description: "Enjoy ad-free browsing and premium features",
    image_url: "https://placehold.co/800x400?text=Premium+Upgrade+Ad",
    placement: "card",
    ad_type: "upgrade",
    target_roles: ["tenant"],
    is_active: true,
    click_url: "/profile?tab=subscription",
    views: 0,
    clicks: 0,
    budget: 30,
    duration_days: 7,
    created_at: new Date().toISOString(),
  },
  {
    id: "ad_003",
    user_id: "user_mock_003",
    title: "Artisan Services Promotion",
    description: "Promote your services and get more bookings",
    image_url: "https://placehold.co/800x400?text=Artisan+Services+Ad",
    placement: "inline",
    ad_type: "promotional",
    target_roles: ["artisan"],
    is_active: true,
    click_url: "/artisan/services",
    views: 0,
    clicks: 0,
    budget: 20,
    duration_days: 7,
    created_at: new Date().toISOString(),
  },
  {
    id: "ad_004",
    title: "Find Your Dream Home",
    description: "Browse thousands of verified rental properties",
    image_url: "https://placehold.co/800x400?text=Find+Your+Dream+Home",
    placement: "banner",
    ad_type: "promotional",
    target_roles: ["tenant"],
    is_active: true,
    click_url: "/tenant/properties",
    views: 0,
    clicks: 0,
    created_at: new Date().toISOString(),
  },
  {
    id: "ad_005",
    title: "Premium Listing Boost",
    description: "Get 3x more views with premium placement",
    image_url: "https://placehold.co/800x400?text=Premium+Listing+Boost",
    placement: "card",
    ad_type: "promotional",
    target_roles: ["landlord"],
    is_active: true,
    click_url: "/landlord/properties",
    views: 0,
    clicks: 0,
    created_at: new Date().toISOString(),
  },
];

/**
 * Get all active ads
 * @param {Object} filters - Filter options (ad_type, role, region, is_active, placement)
 * @returns {Promise} Ad list with pagination
 */
export const getAds = async (filters = {}) => {
  if (USE_MOCK) {
    let filteredAds = [...mockAds];
    
    // Apply filters
    if (filters.is_active !== undefined) {
      filteredAds = filteredAds.filter((ad) => ad.is_active === filters.is_active);
    }
    if (filters.placement) {
      filteredAds = filteredAds.filter((ad) => ad.placement === filters.placement);
    }
    if (filters.ad_type) {
      filteredAds = filteredAds.filter((ad) => ad.ad_type === filters.ad_type);
    }
    if (filters.target_roles) {
      filteredAds = filteredAds.filter((ad) => 
        ad.target_roles?.includes(filters.target_roles)
      );
    }
    
    return withDelay({
      results: filteredAds,
      count: filteredAds.length,
      next: null,
      previous: null,
    }, 300);
  }

  try {
    const params = new URLSearchParams();
    Object.keys(filters).forEach((key) => {
      if (filters[key] !== null && filters[key] !== undefined && filters[key] !== "") {
        params.append(key, filters[key]);
      }
    });
    
    const { data } = await apiClient.get(`/ads/?${params.toString()}`);
    return data;
  } catch (err) {
    console.error("Get ads error:", err);
    throw err.response?.data || { message: "Failed to fetch ads" };
  }
};

/**
 * Get ad by ID (admin only)
 * @param {number} id - Ad ID
 * @returns {Promise} Ad details
 */
export const getAd = async (id) => {
  try {
    const { data } = await apiClient.get(`/ads/${id}/`);
    return data;
  } catch (err) {
    console.error("Get ad error:", err);
    throw err.response?.data || { message: "Failed to fetch ad" };
  }
};

/**
 * Create a new ad (landlord/artisan premium feature)
 * @param {FormData|Object} adData - Ad data including image
 * @returns {Promise} Created ad
 */
export const createAd = async (adData) => {
  if (USE_MOCK) {
    const newAd = {
      id: `ad_${Date.now()}`,
      ...adData,
      is_active: true,
      views: 0,
      clicks: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    mockAds.push(newAd);
    return withDelay(newAd, 500);
  }

  try {
    const isFormData = adData instanceof FormData;
    const config = isFormData
      ? { headers: { "Content-Type": "multipart/form-data" } }
      : {};
    
    const { data } = await apiClient.post("/ads/create/", adData, config);
    return data;
  } catch (err) {
    console.error("Create ad error:", err);
    throw err.response?.data || { message: "Failed to create ad" };
  }
};

/**
 * Update an ad (landlord/artisan - owner only)
 * @param {number} id - Ad ID
 * @param {FormData|Object} adData - Updated ad data
 * @returns {Promise} Updated ad
 */
export const updateAd = async (id, adData) => {
  if (USE_MOCK) {
    const adIndex = mockAds.findIndex((a) => a.id === id || a.id === String(id));
    if (adIndex !== -1) {
      mockAds[adIndex] = {
        ...mockAds[adIndex],
        ...adData,
        updated_at: new Date().toISOString(),
      };
      return withDelay(mockAds[adIndex], 400);
    }
    throw new Error("Ad not found");
  }

  try {
    const isFormData = adData instanceof FormData;
    const config = isFormData
      ? { headers: { "Content-Type": "multipart/form-data" } }
      : {};
    
    const { data } = await apiClient.patch(`/ads/${id}/`, adData, config);
    return data;
  } catch (err) {
    console.error("Update ad error:", err);
    throw err.response?.data || { message: "Failed to update ad" };
  }
};

/**
 * Delete an ad (landlord/artisan - owner only, or admin)
 * @param {number} id - Ad ID
 * @returns {Promise}
 */
export const deleteAd = async (id) => {
  if (USE_MOCK) {
    const adIndex = mockAds.findIndex((a) => a.id === id || a.id === String(id));
    if (adIndex !== -1) {
      mockAds.splice(adIndex, 1);
      return Promise.resolve();
    }
    throw new Error("Ad not found");
  }

  try {
    await apiClient.delete(`/ads/${id}/`);
  } catch (err) {
    console.error("Delete ad error:", err);
    throw err.response?.data || { message: "Failed to delete ad" };
  }
};

/**
 * Track ad click (public)
 * @param {number|string} id - Ad ID
 * @returns {Promise}
 */
export const trackAdClick = async (id) => {
  if (USE_MOCK) {
    // Update mock ad click count
    const ad = mockAds.find((a) => a.id === id || a.id === String(id));
    if (ad) {
      ad.clicks = (ad.clicks || 0) + 1;
    }
    return Promise.resolve();
  }

  try {
    await apiClient.post(`/ads/${id}/click/`);
  } catch (err) {
    console.error("Track ad click error:", err);
    // Don't throw error for tracking - it's not critical
  }
};

/**
 * Track ad view (public)
 * @param {number|string} id - Ad ID
 * @returns {Promise}
 */
export const trackAdView = async (id) => {
  if (USE_MOCK) {
    // Update mock ad view count
    const ad = mockAds.find((a) => a.id === id || a.id === String(id));
    if (ad) {
      ad.views = (ad.views || 0) + 1;
    }
    return Promise.resolve();
  }

  try {
    await apiClient.post(`/ads/${id}/view/`);
  } catch (err) {
    console.error("Track ad view error:", err);
    // Don't throw error for tracking - it's not critical
  }
};
