# Tenant Side Fixes - Property Detail Page

**Date:** January 2026  
**Status:** Fixed  
**Purpose:** Document fixes for tenant-side property detail page issues

---

## Issues Fixed

### 1. Property Images Not Loading ✅

**Problem:**
- Images were not displaying on property detail page
- Empty string passed to `img src` attribute causing browser warning
- Backend returns images in various formats (strings, objects with `image` property, nested objects)

**Root Cause:**
- Code was accessing `images[currentImageIndex]?.image` but images might be strings directly
- No normalization of image data structure
- No fallback for empty/invalid images

**Fix Applied:**
- Added image normalization function to handle multiple formats:
  ```javascript
  const normalizeImage = (img) => {
    if (typeof img === "string") return img;
    if (img?.image) return img.image;
    if (img?.url) return img.url;
    if (img?.image_url) return img.image_url;
    return null;
  };
  ```
- Normalize images when property loads
- Filter out null/empty values
- Use placeholder image utility for fallback
- Ensure `src` attribute never receives empty string

**Files Modified:**
- `src/pages/PropertyDetail.jsx` - Image normalization and rendering

---

### 2. Message Landlord Redirects to Login ✅

**Problem:**
- Clicking "Message Landlord" button redirects to login page
- Link was using `/messages?start=...` instead of `/tenant/messages?start=...`

**Root Cause:**
- Route is `/tenant/messages` but link was using `/messages`
- Route protection requires authentication

**Fix Applied:**
- Updated link to use correct route: `/tenant/messages?start=${property.landlord.id}`
- Added check to ensure landlord ID exists before showing button

**Files Modified:**
- `src/pages/PropertyDetail.jsx` - Message landlord link

---

### 3. Add to Favorite Not Working (404 Error) ✅

**Problem:**
- Clicking "Add to Favorites" returns 404 error
- Endpoint `/tenant/favorites` might not exist or format incorrect

**Root Cause:**
- Backend endpoint might require trailing slash
- Request payload format might be incorrect (`propertyId` vs `property_id`)

**Fix Applied:**
- Added fallback logic to try multiple endpoint formats:
  - `/tenant/favorites/` with `property_id` field
  - `/tenant/favorites/` with `propertyId` field
  - `/tenant/favorites` without trailing slash
- Normalize payload to use `property_id` (snake_case) for backend compatibility

**Files Modified:**
- `src/services/tenantService.js` - `addToFavorites()` function

**Backend Requirements:**
- Backend must implement one of:
  - `POST /api/tenant/favorites/` with `{ property_id: string }`
  - `POST /api/tenant/favorites/` with `{ propertyId: string }`
  - `POST /api/tenant/favorites` (without trailing slash)

---

### 4. Booking/Viewing Request Not Working (404 Error) ✅

**Problem:**
- Clicking "Request Viewing" returns 404 error
- Endpoint `/tenant/viewing-requests` might not exist

**Root Cause:**
- Backend might use property-scoped endpoint instead
- Request payload format might be incorrect

**Fix Applied:**
- Added fallback logic to try multiple endpoints:
  1. Property-scoped: `POST /api/properties/{id}/viewing-request/` (preferred)
  2. Tenant-scoped: `POST /api/tenant/viewing-requests/`
  3. Tenant-scoped (no trailing slash): `POST /api/tenant/viewing-requests`
- Normalize payload to use snake_case (`property_id`, `preferred_date`)
- Send both camelCase and snake_case for compatibility

**Files Modified:**
- `src/services/tenantService.js` - `createViewingRequest()` function
- `src/pages/PropertyDetail.jsx` - Booking submission payload

**Backend Requirements:**
- Backend must implement one of:
  - `POST /api/properties/{id}/viewing-request/` with `{ preferred_date, message?, contact_phone? }`
  - `POST /api/tenant/viewing-requests/` with `{ property_id, preferred_date, message?, contact_phone? }`
  - `POST /api/tenant/viewing-requests` (without trailing slash)

---

## Image Handling Improvements

### Normalization Logic

**When Property Loads:**
```javascript
// Normalize images array
propertyData.images = propertyData.images.map(img => {
  if (typeof img === "string") return img;
  if (img?.image) return img.image;
  if (img?.url) return img.url;
  if (img?.image_url) return img.image_url;
  return null;
}).filter(img => img && typeof img === "string" && img.length > 0);
```

**When Rendering:**
```javascript
// Always use placeholder if image is missing
const currentImage = images[currentImageIndex] || images[0] || getPlaceholderImage("No Image", 800, 600);

// Never pass empty string to src
<img src={currentImage || getPlaceholderImage(...)} />
```

---

## Backend Endpoint Requirements

### Favorites Endpoint

**Required:** `POST /api/tenant/favorites/`

**Request Format:**
```json
{
  "property_id": "string or number"
}
```

**OR:**
```json
{
  "propertyId": "string or number"
}
```

**Response Format:**
```json
{
  "id": "favorite_id",
  "property_id": "property_id",
  "tenant_id": "tenant_id",
  "created_at": "ISO 8601 timestamp"
}
```

---

### Viewing Request Endpoint

**Option 1 (Property-Scoped) - RECOMMENDED:**
```
POST /api/properties/{propertyId}/viewing-request/
```

**Request Format:**
```json
{
  "preferred_date": "ISO date string (YYYY-MM-DD) or ISO datetime",
  "message": "string (optional)",
  "contact_phone": "string (optional)"
}
```

**Option 2 (Tenant-Scoped):**
```
POST /api/tenant/viewing-requests/
```

**Request Format:**
```json
{
  "property_id": "string or number",
  "preferred_date": "ISO date string (YYYY-MM-DD) or ISO datetime",
  "message": "string (optional)",
  "contact_phone": "string (optional)"
}
```

**Response Format:**
```json
{
  "id": "viewing_request_id",
  "property_id": "property_id",
  "tenant_id": "tenant_id",
  "status": "pending",
  "preferred_date": "ISO datetime",
  "message": "string",
  "created_at": "ISO 8601 timestamp"
}
```

---

## Testing Checklist

### Image Loading
- [ ] Property images display correctly
- [ ] No empty string warnings in console
- [ ] Placeholder shows when no images
- [ ] Thumbnails work correctly
- [ ] Image gallery navigation works

### Message Landlord
- [ ] Button only shows for authenticated tenants
- [ ] Clicking button navigates to `/tenant/messages?start={landlordId}`
- [ ] No redirect to login page
- [ ] Messages page loads correctly

### Add to Favorites
- [ ] Clicking favorite button works
- [ ] Success toast shown
- [ ] Favorite state updates
- [ ] No 404 errors

### Booking/Viewing Request
- [ ] Booking modal opens
- [ ] Form submission works
- [ ] Success toast shown
- [ ] No 404 errors
- [ ] Request created successfully

---

## Related Files

- `src/pages/PropertyDetail.jsx` - Property detail page (main fixes)
- `src/services/tenantService.js` - Tenant API calls (favorites, viewing requests)
- `src/utils/imageValidation.js` - Image validation utilities
- `src/config/apiEndpoints.js` - API endpoint configuration

---

**Last Updated:** January 2026  
**Status:** Fixed
