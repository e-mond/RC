# Email Templates Guide

**Created:** January 2026  
**Purpose:** Professional email templates with logo, headers, footers, and system colors

---

## Overview

The email template utilities provide professional, branded HTML email templates for RentalConnects. All templates use:

- **System Colors:** White and Teal (#0b6e4f)
- **Logo:** Configurable logo in header
- **Header & Footer:** Professional branding
- **Responsive Design:** Works on all email clients
- **Readable Typography:** Clean, modern fonts

---

## Usage

### Basic Template

```javascript
import { generateEmailTemplate } from '@/utils/emailTemplates';

const html = generateEmailTemplate({
  title: 'Welcome to RentalConnects',
  content: '<p>Your account has been created...</p>',
  buttonText: 'Get Started',
  buttonUrl: 'https://rentalconnects.com/login',
  logoUrl: 'https://your-domain.com/logo.png', // Optional
  preheader: 'Welcome to the platform', // Optional preview text
});
```

### Pre-built Templates

#### Welcome Email

```javascript
import { generateWelcomeEmail } from '@/utils/emailTemplates';

const html = generateWelcomeEmail({
  userName: 'John Doe',
  loginUrl: 'https://rentalconnects.com/login',
  logoUrl: 'https://your-domain.com/logo.png', // Optional
});
```

#### Password Reset Email

```javascript
import { generatePasswordResetEmail } from '@/utils/emailTemplates';

const html = generatePasswordResetEmail({
  userName: 'John Doe',
  resetUrl: 'https://rentalconnects.com/reset-password?token=xxx',
  logoUrl: 'https://your-domain.com/logo.png', // Optional
});
```

#### Account Approval Email

```javascript
import { generateAccountApprovalEmail } from '@/utils/emailTemplates';

const html = generateAccountApprovalEmail({
  userName: 'John Doe',
  loginUrl: 'https://rentalconnects.com/login',
  logoUrl: 'https://your-domain.com/logo.png', // Optional
});
```

#### Account Rejection Email

```javascript
import { generateAccountRejectionEmail } from '@/utils/emailTemplates';

const html = generateAccountRejectionEmail({
  userName: 'John Doe',
  reason: 'Incomplete documentation',
  supportUrl: 'https://rentalconnects.com/support',
  logoUrl: 'https://your-domain.com/logo.png', // Optional
});
```

#### Payment Confirmation Email

```javascript
import { generatePaymentConfirmationEmail } from '@/utils/emailTemplates';

const html = generatePaymentConfirmationEmail({
  userName: 'John Doe',
  amount: 'GHS 500.00',
  transactionId: 'TXN-123456789',
  logoUrl: 'https://your-domain.com/logo.png', // Optional
});
```

#### Booking Confirmation Email

```javascript
import { generateBookingConfirmationEmail } from '@/utils/emailTemplates';

const html = generateBookingConfirmationEmail({
  userName: 'John Doe',
  propertyTitle: '3 Bedroom Apartment in Accra',
  bookingDate: 'January 25, 2026 at 2:00 PM',
  landlordName: 'Jane Smith',
  logoUrl: 'https://your-domain.com/logo.png', // Optional
});
```

#### Account Suspension Email

```javascript
import { generateAccountSuspensionEmail } from '@/utils/emailTemplates';

const html = generateAccountSuspensionEmail({
  userName: 'John Doe',
  reason: 'Terms of service violation',
  supportUrl: 'https://rentalconnects.com/support',
  logoUrl: 'https://your-domain.com/logo.png', // Optional
});
```

#### New Message Email

```javascript
import { generateNewMessageEmail } from '@/utils/emailTemplates';

const html = generateNewMessageEmail({
  userName: 'John Doe',
  senderName: 'Jane Smith',
  messagePreview: 'Hi, I\'m interested in your property...',
  conversationUrl: 'https://rentalconnects.com/messages',
  logoUrl: 'https://your-domain.com/logo.png', // Optional
});
```

#### Property Approval Email

```javascript
import { generatePropertyApprovalEmail } from '@/utils/emailTemplates';

const html = generatePropertyApprovalEmail({
  userName: 'John Doe',
  propertyTitle: '3 Bedroom Apartment in Accra',
  propertyUrl: 'https://rentalconnects.com/properties/123',
  logoUrl: 'https://your-domain.com/logo.png', // Optional
});
```

#### Property Rejection Email

```javascript
import { generatePropertyRejectionEmail } from '@/utils/emailTemplates';

const html = generatePropertyRejectionEmail({
  userName: 'John Doe',
  propertyTitle: '3 Bedroom Apartment in Accra',
  reason: 'Incomplete property information',
  supportUrl: 'https://rentalconnects.com/support',
  logoUrl: 'https://your-domain.com/logo.png', // Optional
});
```

#### Viewing Request Email (for Landlords)

```javascript
import { generateViewingRequestEmail } from '@/utils/emailTemplates';

const html = generateViewingRequestEmail({
  userName: 'John Doe',
  tenantName: 'Jane Smith',
  propertyTitle: '3 Bedroom Apartment in Accra',
  requestDate: 'January 25, 2026 at 2:00 PM',
  viewRequestUrl: 'https://rentalconnects.com/landlord/bookings/123',
  logoUrl: 'https://your-domain.com/logo.png', // Optional
});
```

#### Premium Upgrade Email

```javascript
import { generatePremiumUpgradeEmail } from '@/utils/emailTemplates';

const html = generatePremiumUpgradeEmail({
  userName: 'John Doe',
  planType: 'Monthly',
  amount: 'GHS 50.00',
  features: [
    'Unlimited property listings',
    'Advanced analytics',
    'Priority support',
  ],
  logoUrl: 'https://your-domain.com/logo.png', // Optional
});
```

---

## Design Features

### Colors

- **Primary Teal:** `#0b6e4f` (buttons, accents, borders)
- **Primary Light:** `#0d8a66` (hover states)
- **Primary Dark:** `#095c42` (active states)
- **White:** `#ffffff` (background, text on teal)
- **Gray:** `#6b7280` (secondary text)
- **Gray Light:** `#f3f4f6` (backgrounds, sections)
- **Text:** `#111827` (main text)

### Typography

- **Font Family:** System fonts (-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial)
- **Headings:** 28px, bold, dark text
- **Body:** 16px, regular, readable line-height (1.6)
- **Footer:** 12px, lighter text

### Layout

- **Max Width:** 600px (optimal for email clients)
- **Padding:** 30-40px for content areas
- **Border Radius:** 8px for main container
- **Shadow:** Subtle shadow for depth

### Header

- **Logo:** Centered, max 200px width
- **Background:** White
- **Padding:** 30px top, 20px sides

### Footer

- **Background:** Light gray (#f3f4f6)
- **Border Top:** 3px solid teal
- **Links:** Teal color, hover states
- **Copyright:** Current year, light text
- **Footer Text:** Small, informational

---

## Using Email Service

### Recommended: Use Email Service

The `emailService.js` provides ready-to-use functions:

```javascript
import {
  sendWelcomeEmail,
  sendPasswordResetEmail,
  sendAccountApprovalEmail,
  sendAccountRejectionEmail,
  sendAccountSuspensionEmail,
  sendPaymentConfirmationEmail,
  sendBookingConfirmationEmail,
  sendNewMessageEmail,
  sendPropertyApprovalEmail,
  sendPropertyRejectionEmail,
  sendViewingRequestEmail,
  sendPremiumUpgradeEmail,
  sendCustomEmail,
} from '@/services/emailService';

// Send welcome email
await sendWelcomeEmail(user);

// Send password reset
await sendPasswordResetEmail(user, resetToken);

// Send account approval
await sendAccountApprovalEmail(user);

// Send custom email
await sendCustomEmail(user, {
  title: 'Custom Email Title',
  subject: 'Custom Subject',
  content: '<p>Your custom content here...</p>',
  buttonText: 'Click Here',
  buttonUrl: 'https://rentalconnects.com/action',
});
```

### Generate HTML Only (for Backend)

If backend sends emails, generate HTML and send to backend:

```javascript
import { generateEmailHTML } from '@/services/emailService';

// Generate HTML for backend
const html = generateEmailHTML.welcome(user);
const passwordResetHtml = generateEmailHTML.passwordReset(user, token);

// Send to backend API
await apiClient.post('/admin/send-email/', {
  to: user.email,
  subject: 'Welcome to RentalConnects',
  html,
});
```

## Integration with Backend

### Option 1: Frontend Generates HTML

Frontend generates HTML and sends to backend:

```javascript
import { generateWelcomeEmail } from '@/utils/emailTemplates';

const html = generateWelcomeEmail({
  userName: user.name,
  loginUrl: `${window.location.origin}/login`,
});

await apiClient.post('/admin/send-email/', {
  to: user.email,
  subject: 'Welcome to RentalConnects',
  html,
});
```

### Option 2: Backend Uses Template

Share the template structure with backend team:

1. **Template Structure:** Documented in this file
2. **Color Constants:** Available via `EMAIL_COLORS` export
3. **HTML Structure:** Standard email-safe HTML

Backend can:
- Use the same template structure
- Replace variables server-side
- Add logo URL from environment variables

---

## Customization

### Custom Logo

```javascript
const html = generateEmailTemplate({
  title: 'Custom Email',
  content: '<p>Content here</p>',
  logoUrl: 'https://your-cdn.com/logo.png', // Your logo URL
});
```

### Custom Colors

Modify `COLORS` object in `src/utils/emailTemplates.js`:

```javascript
const COLORS = {
  primary: '#0b6e4f', // Your brand color
  // ... other colors
};
```

### Custom Footer Links

Modify `generateFooter()` function to add/remove links:

```javascript
<a href="your-link" style="color: ${COLORS.primary}; text-decoration: none;">Your Link</a>
```

---

## Email Client Compatibility

Templates are tested and compatible with:

- ✅ Gmail (Web, iOS, Android)
- ✅ Outlook (Desktop, Web, Mobile)
- ✅ Apple Mail (macOS, iOS)
- ✅ Yahoo Mail
- ✅ Thunderbird
- ✅ Other major email clients

### Best Practices

1. **Inline Styles:** All styles are inline for maximum compatibility
2. **Table Layout:** Uses tables for layout (email standard)
3. **Web Safe Fonts:** System fonts with fallbacks
4. **Responsive:** Max-width ensures mobile compatibility
5. **Preheader Text:** Hidden preview text for better open rates

---

## Testing

### Test Your Emails

1. **Use Email Testing Tools:**
   - Litmus
   - Email on Acid
   - Mailtrap (for development)

2. **Test in Real Clients:**
   - Send to multiple email addresses
   - Test on mobile devices
   - Check dark mode rendering

3. **Validate HTML:**
   - Use W3C HTML Validator
   - Check for broken links
   - Verify images load correctly

---

## Logo Requirements

### Recommended Logo Specs

- **Format:** PNG with transparent background
- **Size:** 200px width (height auto)
- **Aspect Ratio:** 3:1 or 4:1 (wide format)
- **File Size:** < 50KB for fast loading
- **Hosting:** Use CDN or reliable hosting

### Logo URL Examples

```javascript
// Production
logoUrl: 'https://rentalconnects.com/logo.png'

// CDN
logoUrl: 'https://cdn.rentalconnects.com/assets/logo.png'

// Environment variable
logoUrl: import.meta.env.VITE_EMAIL_LOGO_URL
```

---

## Examples

### Example 1: Using Email Service (Recommended)

```javascript
// Simple and clean
import { sendWelcomeEmail } from '@/services/emailService';

await sendWelcomeEmail(user);
```

### Example 2: Custom Email with Service

```javascript
import { sendCustomEmail } from '@/services/emailService';

await sendCustomEmail(user, {
  title: 'Special Announcement',
  subject: 'New Features Available',
  content: '<p>We\'ve added exciting new features...</p>',
  buttonText: 'Explore Features',
  buttonUrl: 'https://rentalconnects.com/features',
  preheader: 'Check out our latest updates',
});
```

### Example 3: Generate HTML for Backend

```javascript
import { generateEmailHTML } from '@/services/emailService';

// Generate HTML
const html = generateEmailHTML.welcome(user);

// Send to backend
await apiClient.post('/admin/send-email/', {
  to: user.email,
  subject: 'Welcome to RentalConnects!',
  html,
});
```

### Example 4: Direct Template Usage

```javascript
import { generateWelcomeEmail, getLogoUrl } from '@/utils/emailTemplates';

const html = generateWelcomeEmail({
  userName: user.fullName || user.name,
  loginUrl: `${window.location.origin}/login`,
  logoUrl: getLogoUrl(), // Automatically gets logo from env or defaults
});
```

---

## Environment Variables

Add to `.env`:

```env
# Email Logo URL (optional)
VITE_EMAIL_LOGO_URL=https://rentalconnects.com/logo.png

# Base URL for email links
VITE_APP_URL=https://rentalconnects.com
```

---

## Support

For questions or issues:
- Check email client compatibility
- Verify logo URL is accessible
- Test HTML in email testing tools
- Review email service provider logs

---

**Last Updated:** January 2026  
**Status:** Production Ready
