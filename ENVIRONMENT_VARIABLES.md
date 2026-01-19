# Environment Variables Reference

**Date:** January 2026  
**Status:** Production-Ready  
**Purpose:** Complete reference for all environment variables used in RentalConnects frontend

---

## Required Environment Variables

### API Configuration

#### `VITE_API_BASE_URL`
- **Type:** String (URL)
- **Required:** Yes (for production)
- **Default:** `http://localhost:8000/api`
- **Description:** Base URL for the backend API
- **Usage:** Used in `apiClient.js` to configure Axios base URL
- **Example:**
  ```env
  VITE_API_BASE_URL=http://localhost:8000/api
  # Production:
  VITE_API_BASE_URL=https://api.rentalconnects.com/api
  ```
- **Notes:**
  - Must include `/api` suffix if backend serves API under `/api` path
  - No trailing slash required
  - Used by all service files making API calls

---

### Mock/Demo Mode

#### `VITE_USE_MOCK`
- **Type:** Boolean (string: "true" | "false")
- **Required:** No
- **Default:** `false`
- **Description:** Enables mock mode for development/demo
- **Usage:** Used across services to switch between mock and real API
- **Example:**
  ```env
  # Development/Demo mode
  VITE_USE_MOCK=true
  
  # Production (real API)
  VITE_USE_MOCK=false
  ```
- **Services Using This:**
  - `propertyService.js`
  - `landlordService.js`
  - `walletService.js`
  - `adsService.js`
  - `paystackService.js`
  - `announcementService.js`
  - `reviewService.js`
  - `billingService.js`
  - `websocketService.js`
- **Notes:**
  - When `true`, services use in-memory mock data
  - Mock mode works without backend connection
  - Useful for demos and development

#### `VITE_FORCE_MOCK`
- **Type:** Boolean (string: "true" | "false")
- **Required:** No
- **Default:** `false`
- **Description:** Forces mock mode (cannot be disabled via UI)
- **Usage:** Used in `mockManager.js` and `useDemoMode.js`
- **Example:**
  ```env
  VITE_FORCE_MOCK=true
  ```
- **Notes:**
  - When enabled, mock mode toggle in UI is disabled
  - Useful for demo deployments
  - Overrides localStorage settings

---

### Payment Integration

#### `VITE_PAYSTACK_PUBLIC_KEY`
- **Type:** String
- **Required:** Yes (for production payments)
- **Default:** `pk_test_your_key_here` (fallback)
- **Description:** Paystack public key for payment processing
- **Usage:** Used in `paystackService.js` and `ProfilePage.jsx`
- **Example:**
  ```env
  # Test key
  VITE_PAYSTACK_PUBLIC_KEY=pk_test_xxxxxxxxxxxxx
  
  # Production key
  VITE_PAYSTACK_PUBLIC_KEY=pk_live_xxxxxxxxxxxxx
  ```
- **Notes:**
  - Required for premium upgrades and wallet top-ups
  - Test keys work in development
  - Production keys required for live payments
  - Falls back gracefully if missing (shows warning)

---

### Cloudinary (Image Uploads)

#### `VITE_CLOUDINARY_CLOUD_NAME`
- **Type:** String
- **Required:** Yes (for image uploads)
- **Default:** None
- **Description:** Cloudinary cloud name
- **Usage:** Used in `apiEndpoints.js` for Cloudinary configuration
- **Example:**
  ```env
  VITE_CLOUDINARY_CLOUD_NAME=your-cloud-name
  ```
- **Notes:**
  - Required for property image uploads
  - Used to construct Cloudinary URLs

#### `VITE_CLOUDINARY_UPLOAD_PRESET`
- **Type:** String
- **Required:** Yes (for image uploads)
- **Default:** `default` (fallback)
- **Description:** Cloudinary upload preset name
- **Usage:** Used in `apiEndpoints.js` for upload configuration
- **Example:**
  ```env
  VITE_CLOUDINARY_UPLOAD_PRESET=rentalconnects_upload
  ```
- **Notes:**
  - Must be configured in Cloudinary dashboard
  - Unsigned presets recommended for security

#### `VITE_CLOUDINARY_BASE`
- **Type:** String (URL)
- **Required:** No
- **Default:** `https://res.cloudinary.com/demo`
- **Description:** Base URL for Cloudinary image transformations
- **Usage:** Used in `cloudinary.js` for building image URLs
- **Example:**
  ```env
  VITE_CLOUDINARY_BASE=https://res.cloudinary.com/your-cloud-name
  ```
- **Notes:**
  - Automatically constructed from cloud name if not provided
  - Used for image optimization and transformations

#### `VITE_CLOUDINARY_UPLOAD_URL`
- **Type:** String (URL)
- **Required:** No
- **Default:** `https://api.cloudinary.com/v1_1/demo/upload`
- **Description:** Full Cloudinary upload API URL
- **Usage:** Used in `apiEndpoints.js` as fallback
- **Example:**
  ```env
  VITE_CLOUDINARY_UPLOAD_URL=https://api.cloudinary.com/v1_1/your-cloud-name/upload
  ```
- **Notes:**
  - Usually not needed (constructed from cloud name)
  - Only set if using custom Cloudinary setup

---

### WebSocket

#### `VITE_WS_URL`
- **Type:** String (WebSocket URL)
- **Required:** No
- **Default:** `ws://localhost:8000`
- **Description:** WebSocket server URL for real-time features
- **Usage:** Used in `websocketService.js`
- **Example:**
  ```env
  # Development
  VITE_WS_URL=ws://localhost:8000
  
  # Production
  VITE_WS_URL=wss://api.rentalconnects.com
  ```
- **Notes:**
  - Used for real-time messaging and notifications
  - Falls back to mock mode if not configured
  - Use `wss://` for production (secure WebSocket)

---

### Third-Party Services

#### `VITE_GOOGLE_MAPS_API_KEY`
- **Type:** String
- **Required:** No
- **Default:** None
- **Description:** Google Maps API key for map features
- **Usage:** Currently not actively used (Leaflet/OpenLayers used instead)
- **Example:**
  ```env
  VITE_GOOGLE_MAPS_API_KEY=AIzaSyxxxxxxxxxxxxx
  ```
- **Notes:**
  - Reserved for future Google Maps integration
  - Currently using OpenStreetMap/Nominatim for geocoding

#### `VITE_TINYMCE_API_KEY`
- **Type:** String
- **Required:** No
- **Default:** `no-api-key` (fallback)
- **Description:** TinyMCE API key for rich text editor
- **Usage:** Used in `SA_MarketingCampaigns.jsx` for announcement editor
- **Example:**
  ```env
  VITE_TINYMCE_API_KEY=your-tinymce-api-key
  ```
- **Notes:**
  - Required for rich text editing in marketing campaigns
  - Falls back gracefully if missing

---

### PWA Configuration

#### `VITE_ENABLE_PWA`
- **Type:** Boolean (string: "true" | "false")
- **Required:** No
- **Default:** `true`
- **Description:** Enables Progressive Web App features
- **Usage:** Used in `main.jsx` to conditionally register service worker
- **Example:**
  ```env
  VITE_ENABLE_PWA=true
  ```
- **Notes:**
  - When enabled, registers service worker for offline support
  - Disable for development if service worker causes issues

---

## Environment File Setup

### Development (.env.development)

```env
# API
VITE_API_BASE_URL=http://localhost:8000/api

# Mock Mode
VITE_USE_MOCK=true
VITE_FORCE_MOCK=false

# Payments (Test Keys)
VITE_PAYSTACK_PUBLIC_KEY=pk_test_your_test_key_here

# Cloudinary
VITE_CLOUDINARY_CLOUD_NAME=your-cloud-name
VITE_CLOUDINARY_UPLOAD_PRESET=rentalconnects_upload

# WebSocket
VITE_WS_URL=ws://localhost:8000

# PWA
VITE_ENABLE_PWA=true
```

### Production (.env.production)

```env
# API
VITE_API_BASE_URL=https://api.rentalconnects.com/api

# Mock Mode (DISABLED)
VITE_USE_MOCK=false
VITE_FORCE_MOCK=false

# Payments (Live Keys)
VITE_PAYSTACK_PUBLIC_KEY=pk_live_your_live_key_here

# Cloudinary
VITE_CLOUDINARY_CLOUD_NAME=your-production-cloud-name
VITE_CLOUDINARY_UPLOAD_PRESET=rentalconnects_production

# WebSocket
VITE_WS_URL=wss://api.rentalconnects.com

# PWA
VITE_ENABLE_PWA=true
```

### Demo Mode (.env.demo)

```env
# API (not used in demo)
VITE_API_BASE_URL=http://localhost:8000/api

# Mock Mode (FORCED)
VITE_USE_MOCK=true
VITE_FORCE_MOCK=true

# Payments (Test Keys)
VITE_PAYSTACK_PUBLIC_KEY=pk_test_demo_key

# Cloudinary (optional for demo)
VITE_CLOUDINARY_CLOUD_NAME=demo-cloud
VITE_CLOUDINARY_UPLOAD_PRESET=demo_preset

# WebSocket (not used in demo)
VITE_WS_URL=ws://localhost:8000

# PWA
VITE_ENABLE_PWA=true
```

---

## Validation & Error Handling

### Missing Variables

The application handles missing environment variables gracefully:

1. **API Base URL:** Falls back to `http://localhost:8000/api`
2. **Paystack Key:** Shows warning toast, payments disabled
3. **Cloudinary:** Falls back to demo cloud, uploads may fail
4. **Mock Mode:** Defaults to `false` (real API mode)

### Console Warnings

The app logs warnings when:
- API keys are missing (non-critical)
- Mock mode is enabled in production
- Backend connection fails (dev mode only)

### Error Messages

Users see friendly error messages when:
- Payment keys missing: "Payment processing unavailable"
- Cloudinary missing: "Image upload failed"
- Backend unavailable: "Unable to connect to server"

---

## Security Notes

### ⚠️ Never Commit Secrets

1. **`.env` files are in `.gitignore`**
2. **Never commit:**
   - Production API keys
   - Paystack live keys
   - Cloudinary credentials
   - Any sensitive tokens

3. **Use environment-specific files:**
   - `.env.development` - Local development
   - `.env.production` - Production build
   - `.env.local` - Local overrides (gitignored)

### Best Practices

1. **Use different keys for dev/prod**
2. **Rotate keys regularly**
3. **Use test keys in development**
4. **Validate all env vars on app startup**
5. **Log warnings for missing optional vars**

---

## Verification Checklist

Before deploying, verify:

- [ ] `VITE_API_BASE_URL` points to correct backend
- [ ] `VITE_USE_MOCK` is `false` in production
- [ ] `VITE_PAYSTACK_PUBLIC_KEY` is set (production key for live)
- [ ] `VITE_CLOUDINARY_CLOUD_NAME` is set
- [ ] `VITE_CLOUDINARY_UPLOAD_PRESET` is set
- [ ] All required keys are present
- [ ] No test keys in production env file
- [ ] `.env` files are not committed to git

---

## Troubleshooting

### Issue: API calls failing
- **Check:** `VITE_API_BASE_URL` is correct
- **Check:** Backend is running and accessible
- **Check:** CORS is configured on backend

### Issue: Images not uploading
- **Check:** `VITE_CLOUDINARY_CLOUD_NAME` is set
- **Check:** `VITE_CLOUDINARY_UPLOAD_PRESET` exists in Cloudinary
- **Check:** Preset allows unsigned uploads

### Issue: Payments not working
- **Check:** `VITE_PAYSTACK_PUBLIC_KEY` is set
- **Check:** Key matches environment (test vs live)
- **Check:** Browser console for Paystack errors

### Issue: Mock mode not working
- **Check:** `VITE_USE_MOCK=true` in `.env`
- **Check:** Restart dev server after changing `.env`
- **Check:** `VITE_FORCE_MOCK` is not blocking toggle

---

**Last Updated:** January 2026  
**Maintained By:** Frontend Team
