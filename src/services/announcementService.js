/**
 * announcementService.js - Announcement Service
 * 
 * Handles all announcement-related API calls.
 * Supports both mock and real API modes.
 * 
 * Mock Mode:
 * - Returns sample announcements for different severities
 * - Works without backend connection
 * - Production uses real API endpoints
 * 
 * @module announcementService
 * @requires ./apiClient
 */

// src/services/announcementService.js
import apiClient from "./apiClient";

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
 * Mock Announcements Data
 */
const mockAnnouncements = [
  {
    id: "ann_001",
    title: "Welcome to RentalConnects!",
    message: "We're excited to have you on board. Explore our features and start connecting with landlords, tenants, and artisans.",
    severity: "info",
    is_active: true,
    created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days ago
    updated_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "ann_002",
    title: "System Maintenance Scheduled",
    message: "We'll be performing scheduled maintenance on January 15th from 2:00 AM to 4:00 AM GMT. Services may be temporarily unavailable.",
    severity: "warning",
    is_active: true,
    created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
    updated_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "ann_003",
    title: "New Feature: Enhanced Messaging",
    message: "We've upgraded our messaging system with end-to-end encryption. Your conversations are now more secure than ever.",
    severity: "info",
    is_active: true,
    created_at: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(), // 3 hours ago
    updated_at: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
  },
];

/**
 * Get all active announcements
 * 
 * API Contract (Django):
 * - GET /api/announcements/
 * - Response: Array of announcements OR { results: [], count: number }
 * 
 * @returns {Promise<Array>} Array of announcement objects
 */
export const getAnnouncements = async () => {
  if (USE_MOCK) {
    // Return only active announcements
    const activeAnnouncements = mockAnnouncements.filter((ann) => ann.is_active !== false);
    return withDelay(activeAnnouncements, 300);
  }

  try {
    // ONLY this path — baseURL already has /api
    const response = await apiClient.get("/announcements/");
    
    return Array.isArray(response.data)
      ? response.data
      : (response.data.results || response.data || []);
  } catch (err) {
    console.error("Failed to fetch announcements:", err);
    return [];
  }
};