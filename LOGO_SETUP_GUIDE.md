# Logo Setup Guide for Email Templates

**Created:** January 2026  
**Updated:** January 2026  
**Status:** ✅ Logo Configured  
**Purpose:** Guide for setting up the RentalConnects logo in email templates

---

## ✅ Current Setup

**Logo Location:** `src/assets/images/Logo.png` → `public/logo.png`  
**Status:** ✅ Logo copied to public folder and ready to use  
**URL:** Will be served at `{APP_URL}/logo.png` automatically

---

## Quick Setup

### ✅ Option 1: Local Logo (Currently Active)

**Status:** ✅ **ACTIVE** - Logo is already set up!

The logo from `src/assets/images/Logo.png` has been copied to `public/logo.png` and will be automatically used in email templates.

**How it works:**
- Logo is served at `/logo.png` when app is running
- Email templates automatically use: `{APP_URL}/logo.png`
- No additional configuration needed!

### Option 2: Environment Variable (Override)

If you want to use a different logo URL (e.g., CDN), add to your `.env` file:

```env
# Email Logo URL (overrides local logo)
VITE_EMAIL_LOGO_URL=https://rentalconnects.com/logo.png

# Or use CDN
VITE_EMAIL_LOGO_URL=https://cdn.rentalconnects.com/assets/logo.png
```

**Note:** If `VITE_EMAIL_LOGO_URL` is set, it takes priority over the local logo.

### Option 3: Use Default Placeholder

If no logo is configured, a placeholder will be used automatically.

---

## Logo Requirements

### Recommended Specifications

- **Format:** PNG with transparent background (preferred) or JPG
- **Dimensions:** 200px width (height auto, maintain aspect ratio)
- **Aspect Ratio:** 3:1 to 4:1 (wide format works best)
- **File Size:** < 50KB for fast email loading
- **Colors:** Works well on white background (teal #0b6e4f brand color)

### Example Sizes

- **Small:** 150px × 50px
- **Medium:** 200px × 67px (recommended)
- **Large:** 250px × 83px

---

## Logo File Locations

### Option 1: Public Folder (Static)

```
public/
  └── logo.png  (or logo.jpg)
```

**Access URL:** `https://your-domain.com/logo.png`

### Option 2: CDN (Recommended for Production)

Host on:
- AWS S3 + CloudFront
- Cloudinary
- Vercel Blob Storage
- Any CDN service

**Access URL:** `https://cdn.rentalconnects.com/assets/logo.png`

### Option 3: Backend Static Files

If your backend serves static files:

**Access URL:** `https://api.rentalconnects.com/static/logo.png`

---

## Environment Variables

### Development

```env
# .env.local (for local development)
VITE_EMAIL_LOGO_URL=http://localhost:5173/logo.png
```

### Production

```env
# .env.production
VITE_EMAIL_LOGO_URL=https://rentalconnects.com/logo.png
```

### Staging

```env
# .env.staging
VITE_EMAIL_LOGO_URL=https://staging.rentalconnects.com/logo.png
```

---

## Logo Design Guidelines

### Brand Colors

- **Primary Teal:** `#0b6e4f`
- **White:** `#ffffff`
- **Text:** `#111827`

### Logo Variations

Consider creating multiple logo variations:

1. **Full Logo:** With text "RentalConnects"
2. **Icon Only:** Just the icon/symbol
3. **Dark Mode:** For dark email clients (optional)

### Email-Safe Design

- **High Contrast:** Ensure logo is visible on white background
- **Simple:** Avoid fine details that may not render well
- **Readable:** Text in logo should be clear at small sizes
- **Scalable:** Should look good at 200px width

---

## Testing Your Logo

### 1. Check Logo URL

```javascript
// In browser console
console.log(import.meta.env.VITE_EMAIL_LOGO_URL);
```

### 2. Test in Email Template

```javascript
import { generateWelcomeEmail, getLogoUrl } from '@/utils/emailTemplates';

const logoUrl = getLogoUrl();
console.log('Logo URL:', logoUrl);

const html = generateWelcomeEmail({
  userName: 'Test User',
  loginUrl: 'https://rentalconnects.com/login',
  logoUrl,
});

// Save HTML to file and open in browser to preview
```

### 3. Test in Email Clients

- Send test email to yourself
- Check logo displays correctly in:
  - Gmail (Web, iOS, Android)
  - Outlook (Desktop, Web)
  - Apple Mail
  - Other email clients

---

## Troubleshooting

### Logo Not Showing

1. **Check URL is accessible:**
   ```bash
   curl https://your-domain.com/logo.png
   ```

2. **Verify CORS headers** (if using CDN):
   ```
   Access-Control-Allow-Origin: *
   ```

3. **Check file exists:**
   - Verify file is in `public/` folder
   - Check file name matches exactly (case-sensitive)

4. **Test in email client:**
   - Some email clients block external images
   - Users may need to "Load images" manually

### Logo Too Large/Small

- Adjust `max-width` in `src/utils/emailTemplates.js`:
  ```javascript
  style="max-width: 200px; height: auto;"
  ```

### Logo Not Loading in Emails

- Use absolute URL (not relative)
- Ensure HTTPS (not HTTP)
- Check image format (PNG/JPG, not SVG)
- Verify image is publicly accessible

---

## Example Logo Files

### Current Setup

The system will look for logo in this order:

1. `VITE_EMAIL_LOGO_URL` environment variable
2. `{APP_URL}/logo.png` (from `VITE_APP_URL` or `window.location.origin`)
3. Default placeholder (if none found)

### Recommended File Structure

```
public/
  ├── logo.png          # Main logo (200px width)
  ├── logo@2x.png       # Retina version (400px width, optional)
  └── logo-small.png    # Small version (150px width, optional)
```

---

## Integration with Backend

If backend sends emails, share logo URL:

```javascript
// Backend can use same logo URL
const logoUrl = process.env.EMAIL_LOGO_URL || 'https://rentalconnects.com/logo.png';
```

Or backend can generate HTML using the same template utilities.

---

## Quick Reference

### Get Logo URL Programmatically

```javascript
import { getLogoUrl } from '@/utils/emailTemplates';

const logoUrl = getLogoUrl();
// Returns: VITE_EMAIL_LOGO_URL or {APP_URL}/logo.png or null
```

### Use in Email Template

```javascript
import { generateWelcomeEmail, getLogoUrl } from '@/utils/emailTemplates';

const html = generateWelcomeEmail({
  userName: 'John Doe',
  loginUrl: 'https://rentalconnects.com/login',
  logoUrl: getLogoUrl(), // Automatically gets logo URL
});
```

---

## Next Steps

1. ✅ Create or obtain RentalConnects logo file
2. ✅ Add logo to `public/logo.png` or host on CDN
3. ✅ Set `VITE_EMAIL_LOGO_URL` in environment variables
4. ✅ Test logo displays in email templates
5. ✅ Verify logo works in major email clients

---

**Last Updated:** January 2026  
**Status:** Ready for Logo Setup
