# Complete Environment Variables & API Keys Reference

**Created:** January 2026  
**Status:** Production Ready  
**Purpose:** Comprehensive list of all files that need keys, URLs, and configuration

---

## 📋 Quick Reference

### Required for Production
- ✅ `VITE_API_BASE_URL` - Backend API URL
- ✅ `VITE_PAYSTACK_PUBLIC_KEY` - Payment processing
- ✅ `VITE_CLOUDINARY_CLOUD_NAME` - Image uploads
- ✅ `VITE_CLOUDINARY_UPLOAD_PRESET` - Image uploads
- ✅ `VITE_EMAIL_LOGO_URL` - Email templates (optional but recommended)
- ✅ `VITE_APP_URL` - Base URL for email links

### Optional but Recommended
- `VITE_WS_URL` - WebSocket for real-time features
- `VITE_TINYMCE_API_KEY` - Rich text editor
- `VITE_GOOGLE_MAPS_API_KEY` - Maps (if using Google Maps)

---

## 🔑 Files That Need Keys/URLs

### 1. API Configuration

#### `src/services/apiClient.js`
**Needs:**
- `VITE_API_BASE_URL` - Backend API base URL

**Usage:**
```javascript
baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:8000/api"
```

**Required:** ✅ Yes (for production)

---

### 2. Payment Processing

#### `src/services/paystackService.js`
**Needs:**
- `VITE_PAYSTACK_PUBLIC_KEY` - Paystack public key

**Usage:**
```javascript
const publicKey = import.meta.env.VITE_PAYSTACK_PUBLIC_KEY || 'pk_test_your_key_here';
```

**Required:**  Yes (for payments)

**Files Using Paystack:**
- `src/services/paystackService.js`
- `src/pages/Profile/ProfilePage.jsx` (wallet top-up)
- `src/components/common/PremiumUpgradeModal.jsx` (premium upgrades)

**Key Types:**
- Test: `pk_test_xxxxxxxxxxxxx`
- Live: `pk_live_xxxxxxxxxxxxx`

---

### 3. Image Uploads (Cloudinary)

#### `src/config/apiEndpoints.js`
**Needs:**
- `VITE_CLOUDINARY_CLOUD_NAME` - Cloudinary cloud name
- `VITE_CLOUDINARY_UPLOAD_PRESET` - Upload preset name
- `VITE_CLOUDINARY_UPLOAD_URL` - Full upload URL (optional)

**Usage:**
```javascript
CLOUDINARY: {
  UPLOAD_URL: import.meta.env.VITE_CLOUDINARY_UPLOAD_URL || 'https://api.cloudinary.com/v1_1/demo/upload',
  UPLOAD_PRESET: import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET || 'default',
}
```

**Required:** ✅ Yes (for image uploads)

**Files Using Cloudinary:**
- `src/config/apiEndpoints.js`
- `src/components/landlord/ImageUploader.jsx`
- `src/services/propertyService.js` (property images)
- `src/pages/Dashboards/Landlord/Properties/PropertyForm.jsx`
- `src/pages/Profile/ProfilePage.jsx` (profile picture)

**Cloudinary Setup:**
1. Create account at cloudinary.com
2. Get cloud name from dashboard
3. Create upload preset (unsigned recommended)
4. Configure in `.env`

---

### 4. Email Templates

#### `src/utils/emailTemplates.js`
**Needs:**
- `VITE_EMAIL_LOGO_URL` - Logo URL for email headers (optional)
- `VITE_APP_URL` - Base URL for email links

**Usage:**
```javascript
const logoUrl = import.meta.env.VITE_EMAIL_LOGO_URL;
const appUrl = import.meta.env.VITE_APP_URL || window.location.origin;
```

**Required:** ⚠️ Optional (but recommended)

**Files Using Email Templates:**
- `src/utils/emailTemplates.js`
- `src/services/emailService.js`

**Logo Options:**
1. Place logo at `public/logo.png` (auto-detected)
2. Set `VITE_EMAIL_LOGO_URL` in `.env`
3. Host on CDN and use URL

---

### 5. WebSocket (Real-time Features)

#### `src/services/websocketService.js`
**Needs:**
- `VITE_WS_URL` - WebSocket server URL

**Usage:**
```javascript
const wsUrl = import.meta.env.VITE_WS_URL || 'ws://localhost:8000';
```

**Required:** ⚠️ Optional (falls back to mock mode)

**Files Using WebSocket:**
- `src/services/websocketService.js`
- `src/pages/Messages/MessagesInbox.jsx` (real-time messaging)
- `src/pages/Notifications/NotificationsCenter.jsx` (real-time notifications)

**URL Formats:**
- Development: `ws://localhost:8000`
- Production: `wss://api.rentalconnects.com` (secure)

---

### 6. Rich Text Editor (TinyMCE)

#### `src/pages/Dashboards/SuperAdmin/marketing/SA_MarketingCampaigns.jsx`
**Needs:**
- `VITE_TINYMCE_API_KEY` - TinyMCE API key

**Usage:**
```javascript
const apiKey = import.meta.env.VITE_TINYMCE_API_KEY || 'no-api-key';
```

**Required:** ⚠️ Optional (falls back gracefully)

**Files Using TinyMCE:**
- `src/pages/Dashboards/SuperAdmin/marketing/SA_MarketingCampaigns.jsx`
- `src/pages/Dashboards/Admin/AdminDashboard.jsx` (if using announcements)

**Get Key:**
1. Sign up at tiny.cloud
2. Get API key from dashboard
3. Add to `.env`

---

### 7. Maps (Google Maps - Optional)

#### `src/components/property/EnhancedPropertyMapSearch.jsx`
**Needs:**
- `VITE_GOOGLE_MAPS_API_KEY` - Google Maps API key

**Usage:**
```javascript
const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
```

**Required:** ❌ No (currently using OpenLayers/OpenStreetMap)

**Files That May Use Google Maps:**
- `src/components/property/EnhancedPropertyMapSearch.jsx` (if migrating to Google Maps)
- `src/components/common/PropertyMapView.jsx` (if migrating to Google Maps)

**Note:** Currently using OpenLayers with OpenStreetMap (no API key needed)

---

### 8. Mock Mode Configuration

#### `src/mocks/mockManager.js`
**Needs:**
- `VITE_USE_MOCK` - Enable/disable mock mode
- `VITE_FORCE_MOCK` - Force mock mode (cannot disable)

**Usage:**
```javascript
const useMock = import.meta.env.VITE_USE_MOCK === 'true';
const forceMock = import.meta.env.VITE_FORCE_MOCK === 'true';
```

**Required:** ⚠️ Optional (for development/demo)

**Files Using Mock Mode:**
- `src/mocks/mockManager.js`
- All service files (conditional mock support)

---

### 9. PWA Configuration

#### `src/utils/registerServiceWorker.js`
**Needs:**
- `VITE_ENABLE_PWA` - Enable Progressive Web App features

**Usage:**
```javascript
const enablePWA = import.meta.env.VITE_ENABLE_PWA !== 'false';
```

**Required:** ⚠️ Optional (defaults to true)

**Files Using PWA:**
- `src/utils/registerServiceWorker.js`
- `src/main.jsx` (service worker registration)
- `public/sw.js` (service worker)
- `public/manifest.json` (PWA manifest)

---

## 📝 Complete Environment Variables List

### Required for Production

```env
# Backend API
VITE_API_BASE_URL=https://api.rentalconnects.com/api

# Payments
VITE_PAYSTACK_PUBLIC_KEY=pk_live_xxxxxxxxxxxxx

# Image Uploads
VITE_CLOUDINARY_CLOUD_NAME=your-cloud-name
VITE_CLOUDINARY_UPLOAD_PRESET=rentalconnects_upload

# Email Templates (Optional but Recommended)
VITE_EMAIL_LOGO_URL=https://rentalconnects.com/logo.png
VITE_APP_URL=https://rentalconnects.com
```

### Optional Configuration

```env
# WebSocket (Real-time)
VITE_WS_URL=wss://api.rentalconnects.com

# Rich Text Editor
VITE_TINYMCE_API_KEY=your-tinymce-api-key

# Maps (Future)
VITE_GOOGLE_MAPS_API_KEY=AIzaSyxxxxxxxxxxxxx

# Mock Mode (Development)
VITE_USE_MOCK=false
VITE_FORCE_MOCK=false

# PWA
VITE_ENABLE_PWA=true
```

---

## 📂 Files by Category

### Payment-Related Files
1. `src/services/paystackService.js` - **VITE_PAYSTACK_PUBLIC_KEY**
2. `src/components/common/PremiumUpgradeModal.jsx` - Uses paystackService
3. `src/pages/Profile/ProfilePage.jsx` - Wallet top-up with Paystack

### Upload-Related Files
1. `src/config/apiEndpoints.js` - **VITE_CLOUDINARY_CLOUD_NAME**, **VITE_CLOUDINARY_UPLOAD_PRESET**
2. `src/components/landlord/ImageUploader.jsx` - Uses Cloudinary
3. `src/services/propertyService.js` - Property image uploads
4. `src/pages/Dashboards/Landlord/Properties/PropertyForm.jsx` - Property images
5. `src/pages/Profile/ProfilePage.jsx` - Profile picture upload

### Email-Related Files
1. `src/utils/emailTemplates.js` - **VITE_EMAIL_LOGO_URL**, **VITE_APP_URL**
2. `src/services/emailService.js` - Uses email templates

### API-Related Files
1. `src/services/apiClient.js` - **VITE_API_BASE_URL**
2. All service files - Use apiClient (inherit base URL)

### WebSocket-Related Files
1. `src/services/websocketService.js` - **VITE_WS_URL**
2. `src/pages/Messages/MessagesInbox.jsx` - Real-time messaging
3. `src/pages/Notifications/NotificationsCenter.jsx` - Real-time notifications

### Editor-Related Files
1. `src/pages/Dashboards/SuperAdmin/marketing/SA_MarketingCampaigns.jsx` - **VITE_TINYMCE_API_KEY**

### Maps-Related Files
1. `src/components/property/EnhancedPropertyMapSearch.jsx` - **VITE_GOOGLE_MAPS_API_KEY** (optional)
2. `src/components/common/PropertyMapView.jsx` - **VITE_GOOGLE_MAPS_API_KEY** (optional)

---

## 🔧 Setup Instructions

### Step 1: Create `.env` File

```bash
cp .env.example .env
```

### Step 2: Configure Required Variables

```env
# Backend API
VITE_API_BASE_URL=https://api.rentalconnects.com/api

# Payments (Get from Paystack Dashboard)
VITE_PAYSTACK_PUBLIC_KEY=pk_test_d65265c22e808ed0152c6834d8e11b65cdbc2d0d

# Cloudinary (Get from Cloudinary Dashboard)
VITE_CLOUDINARY_CLOUD_NAME=your-cloud-name
VITE_CLOUDINARY_UPLOAD_PRESET=rentalconnects_upload

# Email (Optional)
VITE_EMAIL_LOGO_URL=https://rentalconnects.com/logo.png
VITE_APP_URL=https://rentalconnects.com
```

### Step 3: Get API Keys

#### Paystack
1. Sign up at paystack.com
2. Go to Settings → API Keys & Webhooks
3. Copy Public Key
4. Use test key for development, live key for production

#### Cloudinary
1. Sign up at cloudinary.com
2. Get cloud name from dashboard
3. Create upload preset:
   - Go to Settings → Upload
   - Create unsigned preset
   - Set folder (optional)
   - Copy preset name

#### TinyMCE (Optional)
1. Sign up at tiny.cloud
2. Get API key from account dashboard
3. Add to `.env`

---

## ✅ Verification Checklist

- [ ] `VITE_API_BASE_URL` - Backend API working
- [ ] `VITE_PAYSTACK_PUBLIC_KEY` - Payments working
- [ ] `VITE_CLOUDINARY_CLOUD_NAME` - Image uploads working
- [ ] `VITE_CLOUDINARY_UPLOAD_PRESET` - Image uploads working
- [ ] `VITE_EMAIL_LOGO_URL` - Logo displays in emails
- [ ] `VITE_APP_URL` - Email links work correctly
- [ ] `VITE_WS_URL` - Real-time features working (if enabled)
- [ ] `VITE_TINYMCE_API_KEY` - Rich text editor working (if used)
- [ ] `VITE_USE_MOCK` - Set to `false` for production

---

## 🚨 Security Notes

### Never Commit Keys
- ✅ Add `.env` to `.gitignore`
- ✅ Use `.env.example` for documentation
- ✅ Use environment variables in CI/CD
- ✅ Rotate keys regularly

### Key Storage
- **Development:** `.env.local` (gitignored)
- **Production:** Environment variables in hosting platform
- **CI/CD:** Secure environment variable storage

---

## 📚 Related Documentation

- **`ENVIRONMENT_VARIABLES.md`** - Detailed variable reference
- **`LOGO_SETUP_GUIDE.md`** - Logo configuration
- **`EMAIL_TEMPLATES_GUIDE.md`** - Email template setup
- **`BACKEND_EMAIL_IMPLEMENTATION_GUIDE.md`** - Backend email setup

---

**Last Updated:** January 2026  
**Status:** Production Ready
