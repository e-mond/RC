// src/services/preferencesService.js
/**
 * Preferences Service
 * Handles user account preferences (notifications, privacy, security, language, etc.)
 */

import apiClient from "./apiClient";
import { isMockMode } from "@/mocks/mockManager";

/**
 * Default preferences used in mock/demo mode
 */
const DEFAULT_PREFERENCES = {
  emailNotifications: true,
  smsNotifications: false,
  twoFactorAuth: false,
  profileVisibility: "public",
  marketingEmails: true,
  dataSharing: false,
  language: "en",
};

const MOCK_STORAGE_KEY = "demo.preferences";

/**
 * Get current user preferences
 * @returns {Promise<Object>} User preferences
 */
export const getPreferences = async () => {
  // Mock/Demo Mode: Use localStorage
  if (isMockMode()) {
    try {
      const stored = localStorage.getItem(MOCK_STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
      // Return defaults if nothing stored
      return { ...DEFAULT_PREFERENCES };
    } catch (err) {
      console.warn("Failed to parse mock preferences, using defaults", err);
      return { ...DEFAULT_PREFERENCES };
    }
  }

  // Production: Call API
  try {
    const { data } = await apiClient.get("/auth/preferences/");
    return data;
  } catch (err) {
    console.error("Failed to fetch preferences:", err);
    const errorMessage =
      err.response?.data?.detail ||
      err.response?.data?.message ||
      "Unable to load preferences";
    throw new Error(errorMessage);
  }
};

/**
 * Update user preferences (supports partial updates)
 * @param {Object} updates - Object with fields to update (e.g., { emailNotifications: false })
 * @returns {Promise<Object>} Updated full preferences object
 */
export const updatePreferences = async (updates) => {
  if (!updates || typeof updates !== "object" || Object.keys(updates).length === 0) {
    throw new Error("No preference updates provided");
  }

  // Mock/Demo Mode: Update localStorage
  if (isMockMode()) {
    try {
      const current = await getPreferences();
      const updated = { ...current, ...updates };

      localStorage.setItem(MOCK_STORAGE_KEY, JSON.stringify(updated));
      return updated;
    } catch (err) {
      console.error("Failed to save mock preferences", err);
      throw new Error("Failed to save settings (mock mode)");
    }
  }

  // Production: Send PATCH to backend
  try {
    const { data } = await apiClient.patch("/auth/preferences/", updates);
    return data;
  } catch (err) {
    console.error("Failed to update preferences:", err);
    const errorMessage =
      err.response?.data?.detail ||
      err.response?.data?.message ||
      err.response?.data ||
      "Failed to save preferences";
    throw new Error(errorMessage);
  }
};