/**
 * Marketing Service
 * 
 * Handles marketing email and SMS campaigns.
 * Used by Admin and Super Admin for sending bulk communications.
 */

import apiClient from "./apiClient";
import { isMockMode } from "@/mocks/mockManager";

/**
 * Send marketing email to selected users
 * @param {Object} campaign - Campaign data
 * @param {string} campaign.subject - Email subject
 * @param {string} campaign.message - Email message
 * @param {Array<number|string>} campaign.user_ids - Array of user IDs to send to
 * @returns {Promise<Object>} Success response
 */
export const sendMarketingEmail = async (campaign) => {
  if (!campaign.subject || !campaign.message || !campaign.user_ids?.length) {
    throw new Error("Subject, message, and user_ids are required");
  }

  if (isMockMode()) {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 1000));
    return {
      success: true,
      sent_to: campaign.user_ids.length,
      message: `Mock: Email sent to ${campaign.user_ids.length} user(s)`,
    };
  }

  try {
    const { data } = await apiClient.post("/admin/marketing/email/", campaign);
    return data;
  } catch (err) {
    const errorMessage =
      err.response?.data?.detail ||
      err.response?.data?.message ||
      "Failed to send marketing email";
    throw new Error(errorMessage);
  }
};

/**
 * Send marketing SMS to selected users
 * @param {Object} campaign - Campaign data
 * @param {string} campaign.message - SMS message (max 160 characters)
 * @param {Array<number|string>} campaign.user_ids - Array of user IDs to send to
 * @returns {Promise<Object>} Success response
 */
export const sendMarketingSMS = async (campaign) => {
  if (!campaign.message || !campaign.user_ids?.length) {
    throw new Error("Message and user_ids are required");
  }

  if (campaign.message.length > 160) {
    throw new Error("SMS message cannot exceed 160 characters");
  }

  if (isMockMode()) {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 1000));
    return {
      success: true,
      sent_to: campaign.user_ids.length,
      message: `Mock: SMS sent to ${campaign.user_ids.length} user(s)`,
    };
  }

  try {
    const { data } = await apiClient.post("/admin/marketing/sms/", campaign);
    return data;
  } catch (err) {
    const errorMessage =
      err.response?.data?.detail ||
      err.response?.data?.message ||
      "Failed to send marketing SMS";
    throw new Error(errorMessage);
  }
};

/**
 * Get marketing campaign history
 * @returns {Promise<Array>} Array of past campaigns
 */
export const getCampaignHistory = async () => {
  if (isMockMode()) {
    return [
      {
        id: 1,
        type: "email",
        subject: "Welcome to RentalConnects",
        sent_to: 150,
        created_at: new Date().toISOString(),
      },
    ];
  }

  try {
    const { data } = await apiClient.get("/admin/marketing/history/");
    return data.results || data.campaigns || data || [];
  } catch (err) {
    throw new Error(err.response?.data?.detail || "Failed to load campaign history");
  }
};

