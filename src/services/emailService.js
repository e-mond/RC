/**
 * Email Service
 * 
 * Handles sending emails using professional templates.
 * Integrates with backend email API or can be used to generate HTML for backend.
 * 
 * All emails use the professional template system with:
 * - Logo and branding
 * - Header and footer
 * - System colors (white and teal)
 * - Responsive design
 */

import apiClient from "./apiClient";
import { isMockMode } from "@/mocks/mockManager";
import {
  generateWelcomeEmail,
  generatePasswordResetEmail,
  generateAccountApprovalEmail,
  generateAccountRejectionEmail,
  generateAccountSuspensionEmail,
  generatePaymentConfirmationEmail,
  generateBookingConfirmationEmail,
  generateNewMessageEmail,
  generatePropertyApprovalEmail,
  generatePropertyRejectionEmail,
  generateViewingRequestEmail,
  generatePremiumUpgradeEmail,
  generateSuccessfulLoginEmail,
  generateFailedLoginEmail,
  generateNewDeviceLoginEmail,
  generateSuspiciousLoginEmail,
  generateEmailTemplate,
  getLogoUrl,
} from "@/utils/emailTemplates";

/**
 * Get base URL for email links
 */
const getBaseUrl = () => {
  let appUrl = import.meta.env.VITE_APP_URL;
  // Only use window.location if in browser environment
  if (!appUrl && typeof window !== 'undefined' && window.location) {
    appUrl = window.location.origin;
  }
  return appUrl || 'https://rentalconnects.com';
};

/**
 * Send email via backend API
 * @param {Object} emailData - Email data
 * @param {string} emailData.to - Recipient email
 * @param {string} emailData.subject - Email subject
 * @param {string} emailData.html - HTML content
 * @param {string} emailData.text - Plain text content (optional)
 * @returns {Promise<Object>} Success response
 */
const sendEmail = async ({ to, subject, html, text = null }) => {
  if (isMockMode()) {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 800));
    console.log('📧 Mock Email Sent:', { to, subject });
    return {
      success: true,
      message_id: `mock_${Date.now()}`,
      sent_at: new Date().toISOString(),
    };
  }

  try {
    const { data } = await apiClient.post("/admin/send-email/", {
      to,
      subject,
      html,
      text: text || html.replace(/<[^>]*>/g, ''), // Strip HTML for text version
    });
    return data;
  } catch (err) {
    const errorMessage =
      err.response?.data?.detail ||
      err.response?.data?.message ||
      "Failed to send email";
    throw new Error(errorMessage);
  }
};

/**
 * Send welcome email to new user
 */
export const sendWelcomeEmail = async (user) => {
  const logoUrl = getLogoUrl();
  const html = generateWelcomeEmail({
    userName: user.fullName || user.name || user.email,
    loginUrl: `${getBaseUrl()}/login`,
    logoUrl,
  });

  return sendEmail({
    to: user.email,
    subject: 'Welcome to RentalConnects!',
    html,
  });
};

/**
 * Send password reset email
 */
export const sendPasswordResetEmail = async (user, resetToken) => {
  const logoUrl = getLogoUrl();
  const resetUrl = `${getBaseUrl()}/reset-password?token=${resetToken}`;
  const html = generatePasswordResetEmail({
    userName: user.fullName || user.name || user.email,
    resetUrl,
    logoUrl,
  });

  return sendEmail({
    to: user.email,
    subject: 'Reset Your RentalConnects Password',
    html,
  });
};

/**
 * Send account approval email
 */
export const sendAccountApprovalEmail = async (user) => {
  const logoUrl = getLogoUrl();
  const html = generateAccountApprovalEmail({
    userName: user.fullName || user.name || user.email,
    loginUrl: `${getBaseUrl()}/login`,
    logoUrl,
  });

  return sendEmail({
    to: user.email,
    subject: 'Your RentalConnects Account Has Been Approved',
    html,
  });
};

/**
 * Send account rejection email
 */
export const sendAccountRejectionEmail = async (user, reason) => {
  const logoUrl = getLogoUrl();
  const html = generateAccountRejectionEmail({
    userName: user.fullName || user.name || user.email,
    reason,
    supportUrl: `${getBaseUrl()}/support`,
    logoUrl,
  });

  return sendEmail({
    to: user.email,
    subject: 'RentalConnects Account Application Update',
    html,
  });
};

/**
 * Send account suspension email
 */
export const sendAccountSuspensionEmail = async (user, reason) => {
  const logoUrl = getLogoUrl();
  const html = generateAccountSuspensionEmail({
    userName: user.fullName || user.name || user.email,
    reason,
    supportUrl: `${getBaseUrl()}/support`,
    logoUrl,
  });

  return sendEmail({
    to: user.email,
    subject: 'Important: Your RentalConnects Account Has Been Suspended',
    html,
  });
};

/**
 * Send payment confirmation email
 */
export const sendPaymentConfirmationEmail = async (user, paymentData) => {
  const logoUrl = getLogoUrl();
  const html = generatePaymentConfirmationEmail({
    userName: user.fullName || user.name || user.email,
    amount: paymentData.amount,
    transactionId: paymentData.transactionId || paymentData.reference,
    logoUrl,
  });

  return sendEmail({
    to: user.email,
    subject: 'Payment Confirmation - RentalConnects',
    html,
  });
};

/**
 * Send booking confirmation email
 */
export const sendBookingConfirmationEmail = async (user, bookingData) => {
  const logoUrl = getLogoUrl();
  const html = generateBookingConfirmationEmail({
    userName: user.fullName || user.name || user.email,
    propertyTitle: bookingData.propertyTitle,
    bookingDate: bookingData.bookingDate || bookingData.date,
    landlordName: bookingData.landlordName,
    logoUrl,
  });

  return sendEmail({
    to: user.email,
    subject: 'Viewing Request Confirmed - RentalConnects',
    html,
  });
};

/**
 * Send new message notification email
 */
export const sendNewMessageEmail = async (user, messageData) => {
  const logoUrl = getLogoUrl();
  const html = generateNewMessageEmail({
    userName: user.fullName || user.name || user.email,
    senderName: messageData.senderName,
    messagePreview: messageData.messagePreview || messageData.message?.substring(0, 100),
    conversationUrl: `${getBaseUrl()}/messages?conversation=${messageData.conversationId}`,
    logoUrl,
  });

  return sendEmail({
    to: user.email,
    subject: `New Message from ${messageData.senderName} - RentalConnects`,
    html,
  });
};

/**
 * Send property approval email
 */
export const sendPropertyApprovalEmail = async (user, propertyData) => {
  const logoUrl = getLogoUrl();
  const html = generatePropertyApprovalEmail({
    userName: user.fullName || user.name || user.email,
    propertyTitle: propertyData.propertyTitle || propertyData.title,
    propertyUrl: `${getBaseUrl()}/properties/${propertyData.propertyId || propertyData.id}`,
    logoUrl,
  });

  return sendEmail({
    to: user.email,
    subject: 'Your Property Has Been Approved - RentalConnects',
    html,
  });
};

/**
 * Send property rejection email
 */
export const sendPropertyRejectionEmail = async (user, propertyData) => {
  const logoUrl = getLogoUrl();
  const html = generatePropertyRejectionEmail({
    userName: user.fullName || user.name || user.email,
    propertyTitle: propertyData.propertyTitle || propertyData.title,
    reason: propertyData.reason,
    supportUrl: `${getBaseUrl()}/support`,
    logoUrl,
  });

  return sendEmail({
    to: user.email,
    subject: 'Property Listing Update - RentalConnects',
    html,
  });
};

/**
 * Send viewing request email (to landlord)
 */
export const sendViewingRequestEmail = async (user, requestData) => {
  const logoUrl = getLogoUrl();
  const html = generateViewingRequestEmail({
    userName: user.fullName || user.name || user.email,
    tenantName: requestData.tenantName,
    propertyTitle: requestData.propertyTitle || requestData.title,
    requestDate: requestData.requestDate || requestData.date,
    viewRequestUrl: `${getBaseUrl()}/landlord/bookings/${requestData.requestId || requestData.id}`,
    logoUrl,
  });

  return sendEmail({
    to: user.email,
    subject: `New Viewing Request for ${requestData.propertyTitle || 'Your Property'} - RentalConnects`,
    html,
  });
};

/**
 * Send premium upgrade confirmation email
 */
export const sendPremiumUpgradeEmail = async (user, upgradeData) => {
  const logoUrl = getLogoUrl();
  const html = generatePremiumUpgradeEmail({
    userName: user.fullName || user.name || user.email,
    planType: upgradeData.planType || upgradeData.plan,
    amount: upgradeData.amount,
    features: upgradeData.features || [
      'Unlimited property listings',
      'Advanced analytics',
      'Priority support',
      'Featured listings',
    ],
    logoUrl,
  });

  return sendEmail({
    to: user.email,
    subject: 'Welcome to Premium - RentalConnects',
    html,
  });
};

/**
 * Send custom email with template
 */
export const sendCustomEmail = async (user, emailOptions) => {
  const logoUrl = getLogoUrl();
  const html = generateEmailTemplate({
    title: emailOptions.title,
    content: emailOptions.content,
    buttonText: emailOptions.buttonText,
    buttonUrl: emailOptions.buttonUrl,
    preheader: emailOptions.preheader,
    logoUrl,
  });

  return sendEmail({
    to: user.email,
    subject: emailOptions.subject,
    html,
  });
};

/**
 * Send successful login notification email
 * 
 * Sends email notification to user after successful login.
 * Includes login details (time, IP, device, location) for security awareness.
 * 
 * Usage:
 *   await sendSuccessfulLoginEmail(user, {
 *     loginTime: new Date().toLocaleString(),
 *     ipAddress: '192.168.1.1',
 *     device: 'Chrome on Windows',
 *     location: 'Accra, Ghana'
 *   });
 * 
 * @param {Object} user - User object with email and name
 * @param {Object} loginData - Login activity data
 * @param {string} [loginData.loginTime] - Login timestamp (defaults to current time)
 * @param {string} [loginData.ipAddress] - IP address of login
 * @param {string} [loginData.device] - Device/browser information
 * @param {string} [loginData.location] - Geographic location
 * @returns {Promise<Object>} Email send response
 */
export const sendSuccessfulLoginEmail = async (user, loginData) => {
  const logoUrl = getLogoUrl();
  const html = generateSuccessfulLoginEmail({
    userName: user.fullName || user.name || user.email,
    loginTime: loginData.loginTime || new Date().toLocaleString(),
    ipAddress: loginData.ipAddress,
    device: loginData.device,
    location: loginData.location,
    logoUrl,
  });

  return sendEmail({
    to: user.email,
    subject: 'New Login Detected - RentalConnects',
    html,
  });
};

/**
 * Send failed login attempt email
 */
export const sendFailedLoginEmail = async (user, loginData) => {
  const logoUrl = getLogoUrl();
  const html = generateFailedLoginEmail({
    userName: user.fullName || user.name || user.email,
    loginTime: loginData.loginTime || new Date().toLocaleString(),
    ipAddress: loginData.ipAddress,
    device: loginData.device,
    location: loginData.location,
    logoUrl,
  });

  return sendEmail({
    to: user.email,
    subject: 'Failed Login Attempt - RentalConnects Security Alert',
    html,
  });
};

/**
 * Send new device login email
 * 
 * Sends notification when user logs in from a device/location not seen before.
 * Helps users identify and verify new device access.
 * 
 * Should only be sent once per new device (track devices in backend).
 * 
 * Usage:
 *   await sendNewDeviceLoginEmail(user, {
 *     loginTime: new Date().toLocaleString(),
 *     ipAddress: '192.168.1.1',
 *     device: 'Chrome on Windows',
 *     location: 'Accra, Ghana'
 *   });
 * 
 * @param {Object} user - User object with email and name
 * @param {Object} loginData - New device login data
 * @param {string} [loginData.loginTime] - Login timestamp
 * @param {string} [loginData.ipAddress] - IP address of new device
 * @param {string} [loginData.device] - Device/browser information
 * @param {string} [loginData.location] - Geographic location
 * @returns {Promise<Object>} Email send response
 */
export const sendNewDeviceLoginEmail = async (user, loginData) => {
  const logoUrl = getLogoUrl();
  const html = generateNewDeviceLoginEmail({
    userName: user.fullName || user.name || user.email,
    loginTime: loginData.loginTime || new Date().toLocaleString(),
    ipAddress: loginData.ipAddress,
    device: loginData.device,
    location: loginData.location,
    logoUrl,
  });

  return sendEmail({
    to: user.email,
    subject: 'Login from New Device - RentalConnects',
    html,
  });
};

/**
 * Send suspicious login activity email
 * 
 * Sends urgent security alert when suspicious login activity is detected:
 * - Login from unusual location (different country)
 * - Multiple failed attempts from same IP
 * - Login from known malicious IP ranges
 * - Unusual login time patterns
 * 
 * Includes urgent action required notice and account security instructions.
 * 
 * Usage:
 *   await sendSuspiciousLoginEmail(user, {
 *     loginTime: new Date().toLocaleString(),
 *     ipAddress: '192.168.1.1',
 *     device: 'Chrome on Windows',
 *     location: 'Unknown Location',
 *     reason: 'Login from unusual location'
 *   });
 * 
 * @param {Object} user - User object with email and name
 * @param {Object} loginData - Suspicious login activity data
 * @param {string} [loginData.loginTime] - Login timestamp
 * @param {string} [loginData.ipAddress] - IP address of suspicious login
 * @param {string} [loginData.device] - Device/browser information
 * @param {string} [loginData.location] - Geographic location
 * @param {string} [loginData.reason] - Reason for suspicious activity flag
 * @returns {Promise<Object>} Email send response
 */
export const sendSuspiciousLoginEmail = async (user, loginData) => {
  const logoUrl = getLogoUrl();
  const html = generateSuspiciousLoginEmail({
    userName: user.fullName || user.name || user.email,
    loginTime: loginData.loginTime || new Date().toLocaleString(),
    ipAddress: loginData.ipAddress,
    device: loginData.device,
    location: loginData.location,
    reason: loginData.reason,
    logoUrl,
  });

  return sendEmail({
    to: user.email,
    subject: '🚨 Suspicious Login Activity - RentalConnects Security Alert',
    html,
  });
};

/**
 * Generate email HTML only (for backend use)
 * Returns HTML string that can be sent to backend
 */
export const generateEmailHTML = {
  welcome: (user) => {
    return generateWelcomeEmail({
      userName: user.fullName || user.name || user.email,
      loginUrl: `${getBaseUrl()}/login`,
      logoUrl: getLogoUrl(),
    });
  },
  passwordReset: (user, resetToken) => {
    return generatePasswordResetEmail({
      userName: user.fullName || user.name || user.email,
      resetUrl: `${getBaseUrl()}/reset-password?token=${resetToken}`,
      logoUrl: getLogoUrl(),
    });
  },
  accountApproval: (user) => {
    return generateAccountApprovalEmail({
      userName: user.fullName || user.name || user.email,
      loginUrl: `${getBaseUrl()}/login`,
      logoUrl: getLogoUrl(),
    });
  },
  accountRejection: (user, reason) => {
    return generateAccountRejectionEmail({
      userName: user.fullName || user.name || user.email,
      reason,
      supportUrl: `${getBaseUrl()}/support`,
      logoUrl: getLogoUrl(),
    });
  },
  accountSuspension: (user, reason) => {
    return generateAccountSuspensionEmail({
      userName: user.fullName || user.name || user.email,
      reason,
      supportUrl: `${getBaseUrl()}/support`,
      logoUrl: getLogoUrl(),
    });
  },
  paymentConfirmation: (user, paymentData) => {
    return generatePaymentConfirmationEmail({
      userName: user.fullName || user.name || user.email,
      amount: paymentData.amount,
      transactionId: paymentData.transactionId,
      logoUrl: getLogoUrl(),
    });
  },
  bookingConfirmation: (user, bookingData) => {
    return generateBookingConfirmationEmail({
      userName: user.fullName || user.name || user.email,
      propertyTitle: bookingData.propertyTitle,
      bookingDate: bookingData.bookingDate,
      landlordName: bookingData.landlordName,
      logoUrl: getLogoUrl(),
    });
  },
  newMessage: (user, messageData) => {
    return generateNewMessageEmail({
      userName: user.fullName || user.name || user.email,
      senderName: messageData.senderName,
      messagePreview: messageData.messagePreview,
      conversationUrl: `${getBaseUrl()}/messages`,
      logoUrl: getLogoUrl(),
    });
  },
  propertyApproval: (user, propertyData) => {
    return generatePropertyApprovalEmail({
      userName: user.fullName || user.name || user.email,
      propertyTitle: propertyData.propertyTitle,
      propertyUrl: `${getBaseUrl()}/properties/${propertyData.propertyId}`,
      logoUrl: getLogoUrl(),
    });
  },
  propertyRejection: (user, propertyData) => {
    return generatePropertyRejectionEmail({
      userName: user.fullName || user.name || user.email,
      propertyTitle: propertyData.propertyTitle,
      reason: propertyData.reason,
      supportUrl: `${getBaseUrl()}/support`,
      logoUrl: getLogoUrl(),
    });
  },
  viewingRequest: (user, requestData) => {
    return generateViewingRequestEmail({
      userName: user.fullName || user.name || user.email,
      tenantName: requestData.tenantName,
      propertyTitle: requestData.propertyTitle,
      requestDate: requestData.requestDate,
      viewRequestUrl: `${getBaseUrl()}/landlord/bookings`,
      logoUrl: getLogoUrl(),
    });
  },
  premiumUpgrade: (user, upgradeData) => {
    return generatePremiumUpgradeEmail({
      userName: user.fullName || user.name || user.email,
      planType: upgradeData.planType,
      amount: upgradeData.amount,
      features: upgradeData.features,
      logoUrl: getLogoUrl(),
    });
  },
  successfulLogin: (user, loginData) => {
    return generateSuccessfulLoginEmail({
      userName: user.fullName || user.name || user.email,
      loginTime: loginData.loginTime || new Date().toLocaleString(),
      ipAddress: loginData.ipAddress,
      device: loginData.device,
      location: loginData.location,
      logoUrl: getLogoUrl(),
    });
  },
  failedLogin: (user, loginData) => {
    return generateFailedLoginEmail({
      userName: user.fullName || user.name || user.email,
      loginTime: loginData.loginTime || new Date().toLocaleString(),
      ipAddress: loginData.ipAddress,
      device: loginData.device,
      location: loginData.location,
      logoUrl: getLogoUrl(),
    });
  },
  newDeviceLogin: (user, loginData) => {
    return generateNewDeviceLoginEmail({
      userName: user.fullName || user.name || user.email,
      loginTime: loginData.loginTime || new Date().toLocaleString(),
      ipAddress: loginData.ipAddress,
      device: loginData.device,
      location: loginData.location,
      logoUrl: getLogoUrl(),
    });
  },
  suspiciousLogin: (user, loginData) => {
    return generateSuspiciousLoginEmail({
      userName: user.fullName || user.name || user.email,
      loginTime: loginData.loginTime || new Date().toLocaleString(),
      ipAddress: loginData.ipAddress,
      device: loginData.device,
      location: loginData.location,
      reason: loginData.reason,
      logoUrl: getLogoUrl(),
    });
  },
};
