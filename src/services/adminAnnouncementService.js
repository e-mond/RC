// src/services/adminAnnouncementService.js
// Super-admin only: CRUD for global announcements
import apiClient from "./apiClient";
import { toast } from "react-hot-toast";

/**
 * Create a new global announcement (super admin only)
 */
export const createAnnouncement = async (payload) => {
  try {
    const response = await apiClient.post("/super-admin/announcements/", {
      title: payload.title.trim(),
      message: payload.message.trim(),
      severity: payload.severity || "info",
      expires_at: payload.expires_at || null,
      is_active: payload.is_active !== false,
    });
    return response.data;
  } catch (err) {
    const msg = err.response?.data?.detail || err.message || "Failed to create announcement";
    toast.error(msg);
    throw new Error(msg);
  }
};

/**
 * Delete an announcement (super admin only)
 */
export const deleteAnnouncement = async (id) => {
  try {
    await apiClient.delete(`/super-admin/announcements/${id}/`);
  } catch (err) {
    const msg = err.response?.data?.detail || "Failed to delete announcement";
    toast.error(msg);
    throw new Error(msg);
  }
};

/**
 * Get full list of announcements for admin panel (unfiltered, newest first)
 */
export const getAllAnnouncementsAdmin = async () => {
  try {
    const response = await apiClient.get("/super-admin/announcements/");
    return Array.isArray(response.data)
      ? response.data
      : (response.data.results || response.data || []);
  } catch (err) {
    console.error("Failed to load admin announcements:", err);
    toast.error("Could not load announcements");
    return [];
  }
};