// src/utils/bookingNotifications.js
/**
 * Booking Notification Helpers
 * 
 * Provides helper functions for creating booking-related notifications
 * (in-system and email) for both tenants and landlords.
 */

import { createNotification, triggerEmailNotification, triggerNotifications } from "@/services/notificationService";
import { toast } from "react-hot-toast";

/**
 * Create notification when landlord approves booking
 * @param {Object} params - Notification parameters
 * @param {Object} params.booking - Booking object
 * @param {Object} params.tenant - Tenant user object
 * @param {Object} params.property - Property object
 * @param {boolean} [params.sendEmail=true] - Whether to send email notification
 * @returns {Promise<Object>} Notification result
 */
export const notifyBookingApproved = async ({ booking, tenant, property, sendEmail = true }) => {
  const propertyTitle = property?.title || property?.name || "Property";
  const propertyId = property?.id || booking?.property_id || booking?.propertyId;
  const scheduledDate = booking?.scheduled_date || booking?.preferred_date;
  const scheduledTime = booking?.scheduled_time;

  // Format date for display
  const dateStr = scheduledDate
    ? new Date(scheduledDate).toLocaleDateString("en-GB", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "TBD";

  const timeStr = scheduledTime ? ` at ${scheduledTime}` : "";

  // In-system notification for tenant
  const notificationData = {
    type: "booking_accepted",
    title: "Viewing Request Accepted",
    message: `Your viewing request for "${propertyTitle}" has been accepted. Scheduled for ${dateStr}${timeStr}.`,
    actionUrl: `/tenant/bookings${propertyId ? `?property=${propertyId}` : ""}`,
    metadata: {
      booking_id: booking?.id,
      property_id: propertyId,
      property_title: propertyTitle,
      tenant_id: tenant?.id,
      scheduled_date: scheduledDate,
      scheduled_time: scheduledTime,
    },
  };

  // Email notification data
  const emailData = sendEmail
    ? {
        type: "booking_approved",
        recipientId: tenant?.id,
        data: {
          subject: `Viewing Request Accepted - ${propertyTitle}`,
          property_title: propertyTitle,
          property_address: property?.address || property?.location,
          scheduled_date: dateStr,
          scheduled_time: scheduledTime,
          landlord_name: property?.landlord?.full_name || property?.landlord?.name || "Landlord",
          booking_id: booking?.id,
        },
        metadata: {
          booking_id: booking?.id,
          property_id: propertyId,
        },
      }
    : null;

  try {
    const result = await triggerNotifications(notificationData, emailData);
    
    // Show success toast (non-blocking)
    if (result.notification) {
      toast.success("Notification sent to tenant");
    }
    
    return result;
  } catch (err) {
    console.error("Failed to notify booking approved:", err);
    // Don't throw - notification failure shouldn't break booking flow
    toast.error("Failed to send notification");
    return { notification: null, email: { success: false } };
  }
};

/**
 * Create notification when landlord rejects booking
 * @param {Object} params - Notification parameters
 * @param {Object} params.booking - Booking object
 * @param {Object} params.tenant - Tenant user object
 * @param {Object} params.property - Property object
 * @param {string} [params.reason] - Rejection reason
 * @param {boolean} [params.sendEmail=true] - Whether to send email notification
 * @returns {Promise<Object>} Notification result
 */
export const notifyBookingRejected = async ({ booking, tenant, property, reason, sendEmail = true }) => {
  const propertyTitle = property?.title || property?.name || "Property";
  const propertyId = property?.id || booking?.property_id || booking?.propertyId;

  // In-system notification for tenant
  const notificationData = {
    type: "booking_declined",
    title: "Viewing Request Declined",
    message: `Your viewing request for "${propertyTitle}" was declined.${reason ? ` Reason: ${reason}` : ""}`,
    actionUrl: `/tenant/bookings${propertyId ? `?property=${propertyId}` : ""}`,
    metadata: {
      booking_id: booking?.id,
      property_id: propertyId,
      property_title: propertyTitle,
      tenant_id: tenant?.id,
      reason: reason || null,
    },
  };

  // Email notification data
  const emailData = sendEmail
    ? {
        type: "booking_rejected",
        recipientId: tenant?.id,
        data: {
          subject: `Viewing Request Update - ${propertyTitle}`,
          property_title: propertyTitle,
          property_address: property?.address || property?.location,
          reason: reason || "No reason provided",
          booking_id: booking?.id,
        },
        metadata: {
          booking_id: booking?.id,
          property_id: propertyId,
        },
      }
    : null;

  try {
    const result = await triggerNotifications(notificationData, emailData);
    return result;
  } catch (err) {
    console.error("Failed to notify booking rejected:", err);
    return { notification: null, email: { success: false } };
  }
};

/**
 * Create notification when tenant reschedules booking
 * @param {Object} params - Notification parameters
 * @param {Object} params.booking - Booking object
 * @param {Object} params.landlord - Landlord user object
 * @param {Object} params.property - Property object
 * @param {string} params.newDate - New date
 * @param {string} [params.newTime] - New time
 * @param {string} [params.message] - Reschedule message
 * @param {boolean} [params.sendEmail=true] - Whether to send email notification
 * @returns {Promise<Object>} Notification result
 */
export const notifyBookingRescheduled = async ({
  booking,
  landlord,
  property,
  newDate,
  newTime,
  message,
  sendEmail = true,
}) => {
  const propertyTitle = property?.title || property?.name || "Property";
  const propertyId = property?.id || booking?.property_id || booking?.propertyId;
  const tenantName = booking?.tenant?.full_name || booking?.tenant?.name || "Tenant";

  // Format new date for display
  const dateStr = newDate
    ? new Date(newDate).toLocaleDateString("en-GB", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "TBD";

  const timeStr = newTime ? ` at ${newTime}` : "";

  // In-system notification for landlord
  const notificationData = {
    type: "booking_rescheduled",
    title: "Booking Rescheduled",
    message: `${tenantName} has requested to reschedule viewing for "${propertyTitle}" to ${dateStr}${timeStr}.${message ? ` Message: ${message}` : ""}`,
    actionUrl: `/landlord/bookings${booking?.id ? `?booking=${booking.id}` : ""}`,
    metadata: {
      booking_id: booking?.id,
      property_id: propertyId,
      property_title: propertyTitle,
      landlord_id: landlord?.id,
      tenant_name: tenantName,
      new_date: newDate,
      new_time: newTime,
      message: message || null,
    },
  };

  // Email notification data
  const emailData = sendEmail
    ? {
        type: "booking_rescheduled",
        recipientId: landlord?.id,
        data: {
          subject: `Booking Rescheduled - ${propertyTitle}`,
          property_title: propertyTitle,
          property_address: property?.address || property?.location,
          tenant_name: tenantName,
          old_date: booking?.scheduled_date || booking?.preferred_date,
          new_date: dateStr,
          new_time: newTime,
          message: message || null,
          booking_id: booking?.id,
        },
        metadata: {
          booking_id: booking?.id,
          property_id: propertyId,
        },
      }
    : null;

  try {
    const result = await triggerNotifications(notificationData, emailData);
    return result;
  } catch (err) {
    console.error("Failed to notify booking rescheduled:", err);
    return { notification: null, email: { success: false } };
  }
};

/**
 * Create notification when tenant cancels booking
 * @param {Object} params - Notification parameters
 * @param {Object} params.booking - Booking object
 * @param {Object} params.landlord - Landlord user object
 * @param {Object} params.property - Property object
 * @param {string} [params.reason] - Cancellation reason
 * @param {boolean} [params.sendEmail=true] - Whether to send email notification
 * @returns {Promise<Object>} Notification result
 */
export const notifyBookingCancelled = async ({ booking, landlord, property, reason, sendEmail = true }) => {
  const propertyTitle = property?.title || property?.name || "Property";
  const propertyId = property?.id || booking?.property_id || booking?.propertyId;
  const tenantName = booking?.tenant?.full_name || booking?.tenant?.name || "Tenant";

  // In-system notification for landlord
  const notificationData = {
    type: "booking_cancelled",
    title: "Booking Cancelled",
    message: `${tenantName} has cancelled viewing request for "${propertyTitle}".${reason ? ` Reason: ${reason}` : ""}`,
    actionUrl: `/landlord/bookings`,
    metadata: {
      booking_id: booking?.id,
      property_id: propertyId,
      property_title: propertyTitle,
      landlord_id: landlord?.id,
      tenant_name: tenantName,
      reason: reason || null,
    },
  };

  // Email notification data
  const emailData = sendEmail
    ? {
        type: "booking_cancelled",
        recipientId: landlord?.id,
        data: {
          subject: `Booking Cancelled - ${propertyTitle}`,
          property_title: propertyTitle,
          property_address: property?.address || property?.location,
          tenant_name: tenantName,
          reason: reason || "No reason provided",
          booking_id: booking?.id,
        },
        metadata: {
          booking_id: booking?.id,
          property_id: propertyId,
        },
      }
    : null;

  try {
    const result = await triggerNotifications(notificationData, emailData);
    return result;
  } catch (err) {
    console.error("Failed to notify booking cancelled:", err);
    return { notification: null, email: { success: false } };
  }
};

/**
 * Create notification when tenant creates viewing request
 * @param {Object} params - Notification parameters
 * @param {Object} params.booking - Booking object
 * @param {Object} params.landlord - Landlord user object
 * @param {Object} params.property - Property object
 * @param {boolean} [params.sendEmail=true] - Whether to send email notification
 * @returns {Promise<Object>} Notification result
 */
export const notifyViewingRequestCreated = async ({ booking, landlord, property, sendEmail = true }) => {
  const propertyTitle = property?.title || property?.name || "Property";
  const propertyId = property?.id || booking?.property_id || booking?.propertyId;
  const tenantName = booking?.tenant?.full_name || booking?.tenant?.name || "A tenant";
  const preferredDate = booking?.preferred_date;

  // Format date for display
  const dateStr = preferredDate
    ? new Date(preferredDate).toLocaleDateString("en-GB", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "No date specified";

  // In-system notification for landlord
  const notificationData = {
    type: "viewing_request",
    title: "New Viewing Request",
    message: `${tenantName} has requested to view "${propertyTitle}".${preferredDate ? ` Preferred date: ${dateStr}` : ""}`,
    actionUrl: `/landlord/bookings${booking?.id ? `?booking=${booking.id}` : ""}`,
    metadata: {
      booking_id: booking?.id,
      property_id: propertyId,
      property_title: propertyTitle,
      landlord_id: landlord?.id,
      tenant_name: tenantName,
      preferred_date: preferredDate,
    },
  };

  // Email notification data
  const emailData = sendEmail
    ? {
        type: "viewing_request",
        recipientId: landlord?.id,
        data: {
          subject: `New Viewing Request for ${propertyTitle}`,
          property_title: propertyTitle,
          property_address: property?.address || property?.location,
          tenant_name: tenantName,
          preferred_date: dateStr,
          booking_id: booking?.id,
        },
        metadata: {
          booking_id: booking?.id,
          property_id: propertyId,
        },
      }
    : null;

  try {
    const result = await triggerNotifications(notificationData, emailData);
    return result;
  } catch (err) {
    console.error("Failed to notify viewing request created:", err);
    return { notification: null, email: { success: false } };
  }
};
