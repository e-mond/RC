/**
 * Email Template Utilities
 * 
 * Generates professional HTML email templates with:
 * - Logo and branding
 * - Header and footer
 * - System colors (white and teal #0b6e4f)
 * - Responsive design
 * - Readable typography
 * 
 * Usage:
 * import { generateEmailTemplate } from '@/utils/emailTemplates';
 * const html = generateEmailTemplate({
 *   title: 'Welcome to RentalConnects',
 *   content: '<p>Your account has been created...</p>',
 *   type: 'welcome'
 * });
 */

// System colors
const COLORS = {
  primary: '#0b6e4f', // Teal
  primaryLight: '#0d8a66',
  primaryDark: '#095c42',
  white: '#ffffff',
  gray: '#6b7280',
  grayLight: '#f3f4f6',
  grayDark: '#1f2937',
  text: '#111827',
  textLight: '#6b7280',
};

/**
 * Generate email header HTML with circular logo
 * 
 * Creates a professional email header with:
 * - Circular logo (80px × 80px) with teal border
 * - Centered alignment
 * - Responsive design for all email clients
 * 
 * Logo resolution priority:
 * 1. Provided logoUrl parameter
 * 2. VITE_EMAIL_LOGO_URL environment variable
 * 3. App URL + /logo.png (from public folder)
 * 4. Placeholder image (fallback)
 * 
 * @param {string|null} logoUrl - Optional custom logo URL
 * @returns {string} HTML string for email header
 */
const generateHeader = (logoUrl = null) => {
  // Get logo URL - try provided, then environment, then local logo, then default placeholder
  let logo = logoUrl;
  
  if (!logo) {
    // Priority 1: Environment variable (VITE_EMAIL_LOGO_URL)
    // Allows override via .env file (e.g., CDN URL)
    const envLogo = import.meta.env.VITE_EMAIL_LOGO_URL;
    
    // Priority 2: App URL + /logo.png (local logo from public folder)
    // Automatically uses logo from public/logo.png when app is running
    let appUrl = import.meta.env.VITE_APP_URL;
    // Only use window.location if in browser environment (SSR compatibility)
    if (!appUrl && typeof window !== 'undefined' && window.location) {
      appUrl = window.location.origin;
    }
    const localLogo = appUrl ? `${appUrl}/logo.png` : null;
    
    // Use environment logo first, then local logo
    logo = envLogo || localLogo;
  }
  
  // Fallback to placeholder if still no logo
  // Ensures email always has a logo, even if none configured
  if (!logo) {
    logo = 'https://via.placeholder.com/200x60/0b6e4f/ffffff?text=RentalConnects';
  }
  
  // Generate header HTML with circular logo styling
  // Logo: 80px × 80px, circular (50% border-radius), 3px teal border
  return `
    <tr>
      <td style="background-color: ${COLORS.white}; padding: 30px 20px 20px; text-align: center;">
        <table width="100%" cellpadding="0" cellspacing="0" border="0">
          <tr>
            <td style="text-align: center;">
              <img 
                src="${logo}" 
                alt="RentalConnects Logo" 
                style="width: 80px; height: 80px; border-radius: 50%; border: 3px solid ${COLORS.primary}; display: block; margin: 0 auto; object-fit: cover;"
                width="80"
                height="80"
              />
            </td>
          </tr>
        </table>
      </td>
    </tr>
  `;
};

/**
 * Generate email footer HTML
 */
const generateFooter = () => {
  const currentYear = new Date().getFullYear();
  
  return `
    <tr>
      <td style="background-color: ${COLORS.grayLight}; padding: 30px 20px; border-top: 3px solid ${COLORS.primary};">
        <table width="100%" cellpadding="0" cellspacing="0" border="0">
          <tr>
            <td style="text-align: center; padding-bottom: 20px;">
              <p style="margin: 0; font-size: 14px; color: ${COLORS.text}; font-weight: 600; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
                RentalConnects
              </p>
              <p style="margin: 8px 0 0; font-size: 12px; color: ${COLORS.textLight}; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
                Connecting Ghana's Rental Community
              </p>
            </td>
          </tr>
          <tr>
            <td style="text-align: center; padding: 20px 0; border-top: 1px solid #e5e7eb;">
              <p style="margin: 0 0 10px; font-size: 12px; color: ${COLORS.textLight}; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
                <a href="#" style="color: ${COLORS.primary}; text-decoration: none; margin: 0 10px;">Help Center</a>
                <span style="color: ${COLORS.textLight};">|</span>
                <a href="#" style="color: ${COLORS.primary}; text-decoration: none; margin: 0 10px;">Contact Us</a>
                <span style="color: ${COLORS.textLight};">|</span>
                <a href="#" style="color: ${COLORS.primary}; text-decoration: none; margin: 0 10px;">Privacy Policy</a>
              </p>
              <p style="margin: 0; font-size: 11px; color: ${COLORS.textLight}; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
                © ${currentYear} RentalConnects. All rights reserved.
              </p>
              <p style="margin: 10px 0 0; font-size: 11px; color: ${COLORS.textLight}; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
                This email was sent to you because you have an account with RentalConnects.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  `;
};

/**
 * Generate email template
 * @param {Object} options - Email template options
 * @param {string} options.title - Email title/heading
 * @param {string} options.content - Main email content (HTML)
 * @param {string} options.type - Email type (welcome, password_reset, account_approval, etc.)
 * @param {string} options.logoUrl - Optional custom logo URL
 * @param {string} options.buttonText - Optional CTA button text
 * @param {string} options.buttonUrl - Optional CTA button URL
 * @param {string} options.preheader - Optional preheader text (shown in email preview)
 * @returns {string} Complete HTML email template
 */
export const generateEmailTemplate = ({
  title,
  content,
  type = 'default',
  logoUrl = null,
  buttonText = null,
  buttonUrl = null,
  preheader = null,
}) => {
  // Preheader text (shown in email client preview)
  const preheaderHtml = preheader
    ? `
      <div style="display: none; font-size: 1px; color: ${COLORS.white}; line-height: 1px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; max-height: 0px; max-width: 0px; opacity: 0; overflow: hidden;">
        ${preheader}
      </div>
    `
    : '';

  // CTA Button HTML
  const buttonHtml = buttonText && buttonUrl
    ? `
      <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin: 30px 0;">
        <tr>
          <td style="text-align: center;">
            <a 
              href="${buttonUrl}" 
              style="display: inline-block; padding: 14px 32px; background-color: ${COLORS.primary}; color: ${COLORS.white}; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 16px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;"
            >
              ${buttonText}
            </a>
          </td>
        </tr>
      </table>
    `
    : '';

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <title>${title || 'RentalConnects'}</title>
  ${preheaderHtml}
  <!--[if mso]>
  <style type="text/css">
    body, table, td {font-family: Arial, sans-serif !important;}
  </style>
  <![endif]-->
</head>
<body style="margin: 0; padding: 0; background-color: ${COLORS.grayLight}; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; -webkit-font-smoothing: antialiased; -moz-osx-font-smoothing: grayscale;">
  <table 
    width="100%" 
    cellpadding="0" 
    cellspacing="0" 
    border="0" 
    style="background-color: ${COLORS.grayLight}; padding: 20px 0;"
  >
    <tr>
      <td align="center" style="padding: 20px 0;">
        <!-- Main Email Container -->
        <table 
          width="600" 
          cellpadding="0" 
          cellspacing="0" 
          border="0" 
          style="max-width: 600px; width: 100%; background-color: ${COLORS.white}; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);"
        >
          ${generateHeader(logoUrl)}
          
          <!-- Main Content -->
          <tr>
            <td style="background-color: ${COLORS.white}; padding: 40px 30px;">
              <table width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td>
                    <h1 style="margin: 0 0 20px; font-size: 28px; font-weight: 700; color: ${COLORS.text}; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.3;">
                      ${title || 'RentalConnects'}
                    </h1>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 0 0 20px;">
                    <div style="font-size: 16px; line-height: 1.6; color: ${COLORS.text}; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
                      ${content || ''}
                    </div>
                  </td>
                </tr>
                ${buttonHtml}
              </table>
            </td>
          </tr>
          
          ${generateFooter()}
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
};

/**
 * Generate specific email templates for common use cases
 */

/**
 * Welcome email template
 */
export const generateWelcomeEmail = ({ userName, loginUrl, logoUrl = null }) => {
  return generateEmailTemplate({
    title: 'Welcome to RentalConnects!',
    preheader: 'Get started with your rental journey',
    content: `
      <p style="margin: 0 0 16px;">Hello ${userName || 'there'},</p>
      <p style="margin: 0 0 16px;">Welcome to RentalConnects! We're excited to have you join Ghana's premier rental platform.</p>
      <p style="margin: 0 0 16px;">Your account has been successfully created. You can now:</p>
      <ul style="margin: 16px 0; padding-left: 24px; color: ${COLORS.text};">
        <li style="margin-bottom: 8px;">Browse and search properties</li>
        <li style="margin-bottom: 8px;">Connect with landlords and tenants</li>
        <li style="margin-bottom: 8px;">Manage your rental journey</li>
        <li style="margin-bottom: 8px;">Access exclusive features</li>
      </ul>
      <p style="margin: 16px 0 0;">Get started by logging into your account.</p>
    `,
    buttonText: 'Log In to Your Account',
    buttonUrl: loginUrl || '#',
    logoUrl,
    type: 'welcome',
  });
};

/**
 * Password reset email template
 */
export const generatePasswordResetEmail = ({ userName, resetUrl, logoUrl = null }) => {
  return generateEmailTemplate({
    title: 'Reset Your Password',
    preheader: 'Click the link to reset your password',
    content: `
      <p style="margin: 0 0 16px;">Hello ${userName || 'there'},</p>
      <p style="margin: 0 0 16px;">We received a request to reset your password for your RentalConnects account.</p>
      <p style="margin: 0 0 16px;">Click the button below to create a new password. This link will expire in 1 hour for security reasons.</p>
      <p style="margin: 16px 0 0; font-size: 14px; color: ${COLORS.textLight};">
        If you didn't request this password reset, please ignore this email or contact support if you have concerns.
      </p>
    `,
    buttonText: 'Reset Password',
    buttonUrl: resetUrl || '#',
    logoUrl,
    type: 'password_reset',
  });
};

/**
 * Account approval email template
 */
export const generateAccountApprovalEmail = ({ userName, loginUrl, logoUrl = null }) => {
  return generateEmailTemplate({
    title: 'Account Approved!',
    preheader: 'Your account has been approved',
    content: `
      <p style="margin: 0 0 16px;">Hello ${userName || 'there'},</p>
      <p style="margin: 0 0 16px;">Great news! Your RentalConnects account has been approved by our team.</p>
      <p style="margin: 0 0 16px;">You can now access all features and start using the platform.</p>
      <p style="margin: 16px 0 0;">Log in to get started with your rental journey.</p>
    `,
    buttonText: 'Log In Now',
    buttonUrl: loginUrl || '#',
    logoUrl,
    type: 'account_approval',
  });
};

/**
 * Account rejection email template
 */
export const generateAccountRejectionEmail = ({ userName, reason, supportUrl, logoUrl = null }) => {
  return generateEmailTemplate({
    title: 'Account Application Update',
    preheader: 'Important update about your account',
    content: `
      <p style="margin: 0 0 16px;">Hello ${userName || 'there'},</p>
      <p style="margin: 0 0 16px;">We regret to inform you that your RentalConnects account application was not approved at this time.</p>
      ${reason ? `<p style="margin: 0 0 16px; padding: 12px; background-color: ${COLORS.grayLight}; border-left: 4px solid ${COLORS.primary}; border-radius: 4px;"><strong>Reason:</strong> ${reason}</p>` : ''}
      <p style="margin: 16px 0 0;">If you have questions or would like to appeal this decision, please contact our support team.</p>
    `,
    buttonText: 'Contact Support',
    buttonUrl: supportUrl || '#',
    logoUrl,
    type: 'account_rejection',
  });
};

/**
 * Payment confirmation email template
 */
export const generatePaymentConfirmationEmail = ({ userName, amount, transactionId, logoUrl = null }) => {
  return generateEmailTemplate({
    title: 'Payment Confirmed',
    preheader: 'Your payment has been processed successfully',
    content: `
      <p style="margin: 0 0 16px;">Hello ${userName || 'there'},</p>
      <p style="margin: 0 0 16px;">Your payment has been successfully processed.</p>
      <table style="width: 100%; margin: 20px 0; border-collapse: collapse;">
        <tr>
          <td style="padding: 12px; background-color: ${COLORS.grayLight}; border-bottom: 1px solid #e5e7eb;"><strong>Amount:</strong></td>
          <td style="padding: 12px; background-color: ${COLORS.grayLight}; border-bottom: 1px solid #e5e7eb; text-align: right;">${amount || 'N/A'}</td>
        </tr>
        <tr>
          <td style="padding: 12px; border-bottom: 1px solid #e5e7eb;"><strong>Transaction ID:</strong></td>
          <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; text-align: right; font-family: monospace; font-size: 12px;">${transactionId || 'N/A'}</td>
        </tr>
        <tr>
          <td style="padding: 12px;"><strong>Date:</strong></td>
          <td style="padding: 12px; text-align: right;">${new Date().toLocaleDateString()}</td>
        </tr>
      </table>
      <p style="margin: 16px 0 0;">Thank you for your payment. A receipt has been attached to this email.</p>
    `,
    logoUrl,
    type: 'payment_confirmation',
  });
};

/**
 * Booking confirmation email template
 */
export const generateBookingConfirmationEmail = ({ userName, propertyTitle, bookingDate, landlordName, logoUrl = null }) => {
  return generateEmailTemplate({
    title: 'Viewing Request Confirmed',
    preheader: 'Your property viewing has been confirmed',
    content: `
      <p style="margin: 0 0 16px;">Hello ${userName || 'there'},</p>
      <p style="margin: 0 0 16px;">Your viewing request has been confirmed!</p>
      <table style="width: 100%; margin: 20px 0; border-collapse: collapse;">
        <tr>
          <td style="padding: 12px; background-color: ${COLORS.grayLight}; border-bottom: 1px solid #e5e7eb;"><strong>Property:</strong></td>
          <td style="padding: 12px; background-color: ${COLORS.grayLight}; border-bottom: 1px solid #e5e7eb;">${propertyTitle || 'N/A'}</td>
        </tr>
        <tr>
          <td style="padding: 12px; border-bottom: 1px solid #e5e7eb;"><strong>Date & Time:</strong></td>
          <td style="padding: 12px; border-bottom: 1px solid #e5e7eb;">${bookingDate || 'N/A'}</td>
        </tr>
        <tr>
          <td style="padding: 12px;"><strong>Landlord:</strong></td>
          <td style="padding: 12px;">${landlordName || 'N/A'}</td>
        </tr>
      </table>
      <p style="margin: 16px 0 0;">We look forward to helping you find your perfect rental property!</p>
    `,
    logoUrl,
    type: 'booking_confirmation',
  });
};

/**
 * Account suspension email template
 */
export const generateAccountSuspensionEmail = ({ userName, reason, supportUrl, logoUrl = null }) => {
  return generateEmailTemplate({
    title: 'Account Suspended',
    preheader: 'Important notice about your account',
    content: `
      <p style="margin: 0 0 16px;">Hello ${userName || 'there'},</p>
      <p style="margin: 0 0 16px;">We regret to inform you that your RentalConnects account has been suspended.</p>
      ${reason ? `<p style="margin: 0 0 16px; padding: 12px; background-color: ${COLORS.grayLight}; border-left: 4px solid ${COLORS.primary}; border-radius: 4px;"><strong>Reason:</strong> ${reason}</p>` : ''}
      <p style="margin: 16px 0 0;">If you believe this is an error or would like to appeal this decision, please contact our support team.</p>
    `,
    buttonText: 'Contact Support',
    buttonUrl: supportUrl || '#',
    logoUrl,
    type: 'account_suspension',
  });
};

/**
 * New message notification email template
 */
export const generateNewMessageEmail = ({ userName, senderName, messagePreview, conversationUrl, logoUrl = null }) => {
  return generateEmailTemplate({
    title: 'New Message Received',
    preheader: `New message from ${senderName}`,
    content: `
      <p style="margin: 0 0 16px;">Hello ${userName || 'there'},</p>
      <p style="margin: 0 0 16px;">You have received a new message from <strong>${senderName || 'another user'}</strong>.</p>
      ${messagePreview ? `
        <div style="margin: 20px 0; padding: 16px; background-color: ${COLORS.grayLight}; border-radius: 6px; border-left: 4px solid ${COLORS.primary};">
          <p style="margin: 0; font-style: italic; color: ${COLORS.text}; font-size: 14px;">"${messagePreview}"</p>
        </div>
      ` : ''}
      <p style="margin: 16px 0 0;">Log in to view and respond to your messages.</p>
    `,
    buttonText: 'View Message',
    buttonUrl: conversationUrl || '#',
    logoUrl,
    type: 'new_message',
  });
};

/**
 * Property approval email template
 */
export const generatePropertyApprovalEmail = ({ userName, propertyTitle, propertyUrl, logoUrl = null }) => {
  return generateEmailTemplate({
    title: 'Property Approved!',
    preheader: 'Your property listing has been approved',
    content: `
      <p style="margin: 0 0 16px;">Hello ${userName || 'there'},</p>
      <p style="margin: 0 0 16px;">Great news! Your property listing has been approved and is now live on RentalConnects.</p>
      <table style="width: 100%; margin: 20px 0; border-collapse: collapse;">
        <tr>
          <td style="padding: 12px; background-color: ${COLORS.grayLight}; border-bottom: 1px solid #e5e7eb;"><strong>Property:</strong></td>
          <td style="padding: 12px; background-color: ${COLORS.grayLight}; border-bottom: 1px solid #e5e7eb;">${propertyTitle || 'N/A'}</td>
        </tr>
      </table>
      <p style="margin: 16px 0 0;">Your property is now visible to tenants and ready to receive viewing requests.</p>
    `,
    buttonText: 'View Property',
    buttonUrl: propertyUrl || '#',
    logoUrl,
    type: 'property_approval',
  });
};

/**
 * Property rejection email template
 */
export const generatePropertyRejectionEmail = ({ userName, propertyTitle, reason, supportUrl, logoUrl = null }) => {
  return generateEmailTemplate({
    title: 'Property Listing Update',
    preheader: 'Important update about your property listing',
    content: `
      <p style="margin: 0 0 16px;">Hello ${userName || 'there'},</p>
      <p style="margin: 0 0 16px;">We regret to inform you that your property listing was not approved at this time.</p>
      <table style="width: 100%; margin: 20px 0; border-collapse: collapse;">
        <tr>
          <td style="padding: 12px; background-color: ${COLORS.grayLight}; border-bottom: 1px solid #e5e7eb;"><strong>Property:</strong></td>
          <td style="padding: 12px; background-color: ${COLORS.grayLight}; border-bottom: 1px solid #e5e7eb;">${propertyTitle || 'N/A'}</td>
        </tr>
      </table>
      ${reason ? `<p style="margin: 0 0 16px; padding: 12px; background-color: ${COLORS.grayLight}; border-left: 4px solid ${COLORS.primary}; border-radius: 4px;"><strong>Reason:</strong> ${reason}</p>` : ''}
      <p style="margin: 16px 0 0;">You can update your listing and resubmit it for review. If you have questions, please contact support.</p>
    `,
    buttonText: 'Contact Support',
    buttonUrl: supportUrl || '#',
    logoUrl,
    type: 'property_rejection',
  });
};

/**
 * Viewing request received email template (for landlords)
 */
export const generateViewingRequestEmail = ({ userName, tenantName, propertyTitle, requestDate, viewRequestUrl, logoUrl = null }) => {
  return generateEmailTemplate({
    title: 'New Viewing Request',
    preheader: `Viewing request for ${propertyTitle}`,
    content: `
      <p style="margin: 0 0 16px;">Hello ${userName || 'there'},</p>
      <p style="margin: 0 0 16px;">You have received a new viewing request for your property.</p>
      <table style="width: 100%; margin: 20px 0; border-collapse: collapse;">
        <tr>
          <td style="padding: 12px; background-color: ${COLORS.grayLight}; border-bottom: 1px solid #e5e7eb;"><strong>Property:</strong></td>
          <td style="padding: 12px; background-color: ${COLORS.grayLight}; border-bottom: 1px solid #e5e7eb;">${propertyTitle || 'N/A'}</td>
        </tr>
        <tr>
          <td style="padding: 12px; border-bottom: 1px solid #e5e7eb;"><strong>Tenant:</strong></td>
          <td style="padding: 12px; border-bottom: 1px solid #e5e7eb;">${tenantName || 'N/A'}</td>
        </tr>
        <tr>
          <td style="padding: 12px;"><strong>Requested Date:</strong></td>
          <td style="padding: 12px;">${requestDate || 'N/A'}</td>
        </tr>
      </table>
      <p style="margin: 16px 0 0;">Review and respond to this viewing request.</p>
    `,
    buttonText: 'View Request',
    buttonUrl: viewRequestUrl || '#',
    logoUrl,
    type: 'viewing_request',
  });
};

/**
 * Premium upgrade confirmation email template
 */
export const generatePremiumUpgradeEmail = ({ userName, planType, amount, features, logoUrl = null }) => {
  return generateEmailTemplate({
    title: 'Welcome to Premium!',
    preheader: 'Your premium upgrade is complete',
    content: `
      <p style="margin: 0 0 16px;">Hello ${userName || 'there'},</p>
      <p style="margin: 0 0 16px;">Congratulations! Your account has been upgraded to <strong>Premium ${planType || 'Plan'}</strong>.</p>
      <table style="width: 100%; margin: 20px 0; border-collapse: collapse;">
        <tr>
          <td style="padding: 12px; background-color: ${COLORS.grayLight}; border-bottom: 1px solid #e5e7eb;"><strong>Plan:</strong></td>
          <td style="padding: 12px; background-color: ${COLORS.grayLight}; border-bottom: 1px solid #e5e7eb;">Premium ${planType || 'Plan'}</td>
        </tr>
        ${amount ? `
          <tr>
            <td style="padding: 12px; border-bottom: 1px solid #e5e7eb;"><strong>Amount:</strong></td>
            <td style="padding: 12px; border-bottom: 1px solid #e5e7eb;">${amount}</td>
          </tr>
        ` : ''}
      </table>
      ${features ? `
        <p style="margin: 16px 0 8px; font-weight: 600; color: ${COLORS.text};"><strong>Premium Features Unlocked:</strong></p>
        <ul style="margin: 8px 0 16px; padding-left: 24px; color: ${COLORS.text};">
          ${features.map(feature => `<li style="margin-bottom: 8px;">${feature}</li>`).join('')}
        </ul>
      ` : ''}
      <p style="margin: 16px 0 0;">Start exploring your new premium features today!</p>
    `,
    buttonText: 'Go to Dashboard',
    buttonUrl: '#',
    logoUrl,
    type: 'premium_upgrade',
  });
};

/**
 * Login activity email templates
 */

/**
 * Successful login notification email template
 */
export const generateSuccessfulLoginEmail = ({ userName, loginTime, ipAddress, device, location, logoUrl = null }) => {
  return generateEmailTemplate({
    title: 'New Login Detected',
    preheader: 'We noticed a new login to your account',
    content: `
      <p style="margin: 0 0 16px;">Hello ${userName || 'there'},</p>
      <p style="margin: 0 0 16px;">We detected a successful login to your RentalConnects account.</p>
      <table style="width: 100%; margin: 20px 0; border-collapse: collapse;">
        <tr>
          <td style="padding: 12px; background-color: ${COLORS.grayLight}; border-bottom: 1px solid #e5e7eb;"><strong>Time:</strong></td>
          <td style="padding: 12px; background-color: ${COLORS.grayLight}; border-bottom: 1px solid #e5e7eb;">${loginTime || 'Just now'}</td>
        </tr>
        ${ipAddress ? `
          <tr>
            <td style="padding: 12px; border-bottom: 1px solid #e5e7eb;"><strong>IP Address:</strong></td>
            <td style="padding: 12px; border-bottom: 1px solid #e5e7eb;">${ipAddress}</td>
          </tr>
        ` : ''}
        ${device ? `
          <tr>
            <td style="padding: 12px; border-bottom: 1px solid #e5e7eb;"><strong>Device:</strong></td>
            <td style="padding: 12px; border-bottom: 1px solid #e5e7eb;">${device}</td>
          </tr>
        ` : ''}
        ${location ? `
          <tr>
            <td style="padding: 12px;"><strong>Location:</strong></td>
            <td style="padding: 12px;">${location}</td>
          </tr>
        ` : ''}
      </table>
      <p style="margin: 16px 0 0; padding: 12px; background-color: #fef3c7; border-left: 4px solid #f59e0b; border-radius: 4px; color: ${COLORS.text};">
        <strong>⚠️ Security Notice:</strong> If you didn't make this login, please secure your account immediately by changing your password.
      </p>
    `,
    buttonText: 'View Account Security',
    buttonUrl: '#',
    logoUrl,
    type: 'login_success',
  });
};

/**
 * Generate failed login attempt email
 * 
 * Sent after failed login attempt (wrong password) to alert users
 * of potential unauthorized access attempts.
 * 
 * Includes urgent security alert with instructions to secure account.
 * 
 * @param {Object} params - Email parameters
 * @param {string} params.userName - User's full name or email
 * @param {string} [params.loginTime] - Login attempt timestamp
 * @param {string} [params.ipAddress] - IP address of failed attempt
 * @param {string} [params.device] - Device/browser information
 * @param {string} [params.location] - Geographic location
 * @param {string} [params.logoUrl] - Optional custom logo URL
 * @returns {string} Complete HTML email template
 */
export const generateFailedLoginEmail = ({ userName, loginTime, ipAddress, device, location, logoUrl = null }) => {
  return generateEmailTemplate({
    title: 'Failed Login Attempt',
    preheader: 'We detected a failed login attempt',
    content: `
      <p style="margin: 0 0 16px;">Hello ${userName || 'there'},</p>
      <p style="margin: 0 0 16px;">We detected a failed login attempt on your RentalConnects account.</p>
      <table style="width: 100%; margin: 20px 0; border-collapse: collapse;">
        <tr>
          <td style="padding: 12px; background-color: ${COLORS.grayLight}; border-bottom: 1px solid #e5e7eb;"><strong>Time:</strong></td>
          <td style="padding: 12px; background-color: ${COLORS.grayLight}; border-bottom: 1px solid #e5e7eb;">${loginTime || 'Just now'}</td>
        </tr>
        ${ipAddress ? `
          <tr>
            <td style="padding: 12px; border-bottom: 1px solid #e5e7eb;"><strong>IP Address:</strong></td>
            <td style="padding: 12px; border-bottom: 1px solid #e5e7eb;">${ipAddress}</td>
          </tr>
        ` : ''}
        ${device ? `
          <tr>
            <td style="padding: 12px; border-bottom: 1px solid #e5e7eb;"><strong>Device:</strong></td>
            <td style="padding: 12px; border-bottom: 1px solid #e5e7eb;">${device}</td>
          </tr>
        ` : ''}
        ${location ? `
          <tr>
            <td style="padding: 12px;"><strong>Location:</strong></td>
            <td style="padding: 12px;">${location}</td>
          </tr>
        ` : ''}
      </table>
      <p style="margin: 16px 0 0; padding: 12px; background-color: #fee2e2; border-left: 4px solid #ef4444; border-radius: 4px; color: ${COLORS.text};">
        <strong>🔒 Security Alert:</strong> If this wasn't you, your account may be at risk. Please change your password immediately and review your account security settings.
      </p>
    `,
    buttonText: 'Secure My Account',
    buttonUrl: '#',
    logoUrl,
    type: 'login_failed',
  });
};

/**
 * New device login email template
 */
export const generateNewDeviceLoginEmail = ({ userName, loginTime, ipAddress, device, location, logoUrl = null }) => {
  return generateEmailTemplate({
    title: 'Login from New Device',
    preheader: 'We noticed a login from a new device',
    content: `
      <p style="margin: 0 0 16px;">Hello ${userName || 'there'},</p>
      <p style="margin: 0 0 16px;">We detected a login to your RentalConnects account from a new device or location.</p>
      <table style="width: 100%; margin: 20px 0; border-collapse: collapse;">
        <tr>
          <td style="padding: 12px; background-color: ${COLORS.grayLight}; border-bottom: 1px solid #e5e7eb;"><strong>Time:</strong></td>
          <td style="padding: 12px; background-color: ${COLORS.grayLight}; border-bottom: 1px solid #e5e7eb;">${loginTime || 'Just now'}</td>
        </tr>
        ${device ? `
          <tr>
            <td style="padding: 12px; border-bottom: 1px solid #e5e7eb;"><strong>Device:</strong></td>
            <td style="padding: 12px; border-bottom: 1px solid #e5e7eb;">${device}</td>
          </tr>
        ` : ''}
        ${ipAddress ? `
          <tr>
            <td style="padding: 12px; border-bottom: 1px solid #e5e7eb;"><strong>IP Address:</strong></td>
            <td style="padding: 12px; border-bottom: 1px solid #e5e7eb;">${ipAddress}</td>
          </tr>
        ` : ''}
        ${location ? `
          <tr>
            <td style="padding: 12px;"><strong>Location:</strong></td>
            <td style="padding: 12px;">${location}</td>
          </tr>
        ` : ''}
      </table>
      <p style="margin: 16px 0 0; padding: 12px; background-color: #dbeafe; border-left: 4px solid ${COLORS.primary}; border-radius: 4px; color: ${COLORS.text};">
        <strong>ℹ️ Information:</strong> If this was you, no action is needed. If you don't recognize this login, please secure your account immediately.
      </p>
    `,
    buttonText: 'Review Account Activity',
    buttonUrl: '#',
    logoUrl,
    type: 'new_device_login',
  });
};

/**
 * Generate suspicious login activity email
 * 
 * Sent when login activity matches suspicious patterns:
 * - Login from unusual location (different country)
 * - Multiple failed attempts from same IP
 * - Login from known malicious IP ranges
 * - Unusual login time patterns
 * 
 * Includes urgent security alert with immediate action required notice.
 * 
 * @param {Object} params - Email parameters
 * @param {string} params.userName - User's full name or email
 * @param {string} [params.loginTime] - Login timestamp
 * @param {string} [params.ipAddress] - IP address of suspicious login
 * @param {string} [params.device] - Device/browser information
 * @param {string} [params.location] - Geographic location
 * @param {string} [params.reason] - Reason for suspicious activity flag
 * @param {string} [params.logoUrl] - Optional custom logo URL
 * @returns {string} Complete HTML email template
 */
export const generateSuspiciousLoginEmail = ({ userName, loginTime, ipAddress, device, location, reason, logoUrl = null }) => {
  return generateEmailTemplate({
    title: 'Suspicious Login Activity Detected',
    preheader: 'Security alert: Unusual login activity',
    content: `
      <p style="margin: 0 0 16px;">Hello ${userName || 'there'},</p>
      <p style="margin: 0 0 16px;">We detected suspicious login activity on your RentalConnects account that may indicate unauthorized access.</p>
      <table style="width: 100%; margin: 20px 0; border-collapse: collapse;">
        <tr>
          <td style="padding: 12px; background-color: ${COLORS.grayLight}; border-bottom: 1px solid #e5e7eb;"><strong>Time:</strong></td>
          <td style="padding: 12px; background-color: ${COLORS.grayLight}; border-bottom: 1px solid #e5e7eb;">${loginTime || 'Just now'}</td>
        </tr>
        ${ipAddress ? `
          <tr>
            <td style="padding: 12px; border-bottom: 1px solid #e5e7eb;"><strong>IP Address:</strong></td>
            <td style="padding: 12px; border-bottom: 1px solid #e5e7eb;">${ipAddress}</td>
          </tr>
        ` : ''}
        ${device ? `
          <tr>
            <td style="padding: 12px; border-bottom: 1px solid #e5e7eb;"><strong>Device:</strong></td>
            <td style="padding: 12px; border-bottom: 1px solid #e5e7eb;">${device}</td>
          </tr>
        ` : ''}
        ${location ? `
          <tr>
            <td style="padding: 12px; border-bottom: 1px solid #e5e7eb;"><strong>Location:</strong></td>
            <td style="padding: 12px; border-bottom: 1px solid #e5e7eb;">${location}</td>
          </tr>
        ` : ''}
        ${reason ? `
          <tr>
            <td style="padding: 12px;"><strong>Reason:</strong></td>
            <td style="padding: 12px;">${reason}</td>
          </tr>
        ` : ''}
      </table>
      <p style="margin: 16px 0 0; padding: 12px; background-color: #fee2e2; border-left: 4px solid #ef4444; border-radius: 4px; color: ${COLORS.text};">
        <strong>🚨 URGENT:</strong> If this wasn't you, please change your password immediately and contact support. Your account security may be compromised.
      </p>
    `,
    buttonText: 'Secure Account Now',
    buttonUrl: '#',
    logoUrl,
    type: 'suspicious_login',
  });
};

/**
 * Get logo URL from environment or use local logo
 * Priority:
 * 1. VITE_EMAIL_LOGO_URL (environment variable)
 * 2. App URL + /logo.png (local logo from public folder)
 * 3. null (will use placeholder in generateHeader)
 */
export const getLogoUrl = () => {
  // Priority 1: Environment variable (custom logo URL)
  if (import.meta.env.VITE_EMAIL_LOGO_URL) {
    return import.meta.env.VITE_EMAIL_LOGO_URL;
  }
  
  // Priority 2: Local logo from public folder (src/assets/images/Logo.png copied to public/logo.png)
  let appUrl = import.meta.env.VITE_APP_URL;
  // Only use window.location if in browser environment
  if (!appUrl && typeof window !== 'undefined' && window.location) {
    appUrl = window.location.origin;
  }
  if (appUrl) {
    return `${appUrl}/logo.png`;
  }
  
  // Fallback: null (will use default placeholder in generateHeader)
  return null;
};

/**
 * Export color constants for use in other components
 */
export const EMAIL_COLORS = COLORS;
