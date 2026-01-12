/**
 * messagingRules.js - Role-Based Messaging Rules
 * 
 * Enforces strict role-based messaging rules as specified:
 * - Super Admin and Admin can message any individual user or all users (platform announcements)
 * - Landlord can message their tenants and booked artisans
 * - Artisan can message landlords only
 * - Tenant can message landlords of viewed/booked properties, booked artisans, and fellow tenants within the same property context
 * 
 * @module messagingRules
 */

/**
 * Check if a user can message another user based on their roles
 * @param {Object} currentUser - Current user object with role
 * @param {Object} targetUser - Target user object with role
 * @param {Object} context - Additional context (property, booking, etc.)
 * @returns {Object} { canMessage: boolean, reason: string }
 */
export function canUserMessage(currentUser, targetUser, context = {}) {
  if (!currentUser || !targetUser) {
    return { canMessage: false, reason: "User information missing" };
  }

  const currentRole = currentUser.role?.toLowerCase();
  const targetRole = targetUser.role?.toLowerCase();

  // Super Admin and Admin can message anyone
  if (currentRole === "super-admin" || currentRole === "admin") {
    return { canMessage: true, reason: null };
  }

  // Landlord can message their tenants and booked artisans
  if (currentRole === "landlord") {
    if (targetRole === "tenant") {
      // Check if tenant has viewed/booked landlord's properties
      const hasBooking = context.hasBooking || context.hasViewedProperty;
      if (hasBooking) {
        return { canMessage: true, reason: null };
      }
      return { canMessage: false, reason: "Tenant must have viewed or booked your property" };
    }
    if (targetRole === "artisan") {
      // Check if artisan is booked for landlord's property
      const isBooked = context.isBookedArtisan || context.hasBooking;
      if (isBooked) {
        return { canMessage: true, reason: null };
      }
      return { canMessage: false, reason: "Artisan must be booked for your property" };
    }
    return { canMessage: false, reason: "Landlords can only message tenants and booked artisans" };
  }

  // Artisan can message landlords only
  if (currentRole === "artisan") {
    if (targetRole === "landlord") {
      return { canMessage: true, reason: null };
    }
    return { canMessage: false, reason: "Artisans can only message landlords" };
  }

  // Tenant can message landlords of viewed/booked properties, booked artisans, and fellow tenants
  if (currentRole === "tenant") {
    if (targetRole === "landlord") {
      // Check if tenant has viewed/booked landlord's properties
      const hasBooking = context.hasBooking || context.hasViewedProperty;
      if (hasBooking) {
        return { canMessage: true, reason: null };
      }
      return { canMessage: false, reason: "You must view or book a property to message the landlord" };
    }
    if (targetRole === "artisan") {
      // Check if artisan is booked for tenant's property
      const isBooked = context.isBookedArtisan || context.hasBooking;
      if (isBooked) {
        return { canMessage: true, reason: null };
      }
      return { canMessage: false, reason: "Artisan must be booked for your property" };
    }
    if (targetRole === "tenant") {
      // Check if both tenants are in the same property context
      const sameProperty = context.sameProperty || context.propertyId;
      if (sameProperty) {
        return { canMessage: true, reason: null };
      }
      return { canMessage: false, reason: "You can only message tenants in the same property context" };
    }
    return { canMessage: false, reason: "Tenants can only message landlords, booked artisans, and fellow tenants" };
  }

  return { canMessage: false, reason: "Unknown role or messaging not allowed" };
}

/**
 * Check if user can send platform announcements (Super Admin and Admin only)
 * @param {Object} user - User object with role
 * @returns {boolean} Whether user can send announcements
 */
export function canSendAnnouncements(user) {
  if (!user) return false;
  const role = user.role?.toLowerCase();
  return role === "super-admin" || role === "admin";
}

/**
 * Get messaging rules description for a role
 * @param {string} role - User role
 * @returns {string} Description of messaging rules for the role
 */
export function getMessagingRulesDescription(role) {
  const normalizedRole = role?.toLowerCase();
  
  switch (normalizedRole) {
    case "super-admin":
    case "admin":
      return "You can message any individual user or send platform announcements to all users.";
    case "landlord":
      return "You can message your tenants and artisans booked for your properties.";
    case "artisan":
      return "You can message landlords only.";
    case "tenant":
      return "You can message landlords of properties you've viewed or booked, artisans booked for your property, and fellow tenants in the same property context.";
    default:
      return "Messaging rules not defined for your role.";
  }
}

