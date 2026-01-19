# API Consumption Guide

**Date:** January 2026  
**Status:** Production-Ready  
**Purpose:** Complete guide to consuming APIs in RentalConnects frontend

---

## Overview

This guide covers how to properly consume backend APIs in the RentalConnects frontend, including:
- API client usage
- Error handling patterns
- Request/response formats
- Authentication handling
- Mock mode integration

---

## API Client Architecture

### Centralized API Client

**Location:** `src/services/apiClient.js`

**Features:**
- Automatic JWT token injection
- Request/response interceptors
- Error handling and toast notifications
- Token refresh on 401
- Network error handling

**Usage:**
```javascript
import apiClient from '@/services/apiClient';
import { API_ENDPOINTS } from '@/config/apiEndpoints';

// GET request
const response = await apiClient.get(API_ENDPOINTS.PROPERTIES.BASE);
const properties = response.data;

// POST request
const response = await apiClient.post(API_ENDPOINTS.PROPERTIES.BASE, {
  title: 'Property Title',
  price: 1500,
  // ... other fields
});
```

---

## API Endpoint Configuration

### Centralized Endpoints

**Location:** `src/config/apiEndpoints.js`

**Benefits:**
- Single source of truth
- Easy to update
- Type-safe (with autocomplete)
- Consistent naming

**Usage:**
```javascript
import { API_ENDPOINTS } from '@/config/apiEndpoints';

// Use endpoint constants
apiClient.get(API_ENDPOINTS.PROPERTIES.BASE);
apiClient.get(API_ENDPOINTS.PROPERTIES.BY_ID(propertyId));
apiClient.post(API_ENDPOINTS.AUTH.LOGIN, credentials);
```

---

## Service Layer Pattern

### Service Abstraction

All API calls should go through service files:

**Pattern:**
```javascript
// services/propertyService.js
import apiClient from './apiClient';
import { API_ENDPOINTS } from '@/config/apiEndpoints';
import { isMockMode } from '@/mocks/mockManager';

const USE_MOCK = isMockMode();

export const getProperties = async (filters = {}) => {
  if (USE_MOCK) {
    // Return mock data
    return mockProperties;
  }
  
  try {
    const response = await apiClient.get(API_ENDPOINTS.PROPERTIES.BASE, {
      params: filters,
    });
    return response.data;
  } catch (error) {
    // Error handling
    throw error;
  }
};
```

**Benefits:**
- Single source of truth for API calls
- Easy to switch between mock and real API
- Centralized error handling
- Consistent response formatting

---

## Error Handling

### Standard Error Response

Backend returns errors in this format:

```json
{
  "detail": "Error message",
  "code": "ERROR_CODE",
  "field_errors": {
    "field_name": ["Error message"]
  }
}
```

### Error Handling Pattern

```javascript
try {
  const response = await apiClient.post(API_ENDPOINTS.PROPERTIES.BASE, data);
  // Success handling
  toast.success('Property created successfully');
  return response.data;
} catch (error) {
  // Error handling
  if (error.response?.status === 400) {
    // Validation error
    const fieldErrors = error.response.data.field_errors;
    // Handle field-specific errors
  } else if (error.response?.status === 403) {
    // Permission denied - apiClient already shows toast
    // Component can show additional UI if needed
  } else if (error.response?.status === 401) {
    // Unauthorized - apiClient handles token refresh
    // If refresh fails, user is logged out automatically
  } else {
    // Other errors
    toast.error(error.response?.data?.detail || 'An error occurred');
  }
  throw error;
}
```

### Automatic Error Handling

**apiClient.js automatically handles:**
- 401 Unauthorized → Token refresh attempt → Logout if refresh fails
- 403 Forbidden → Shows permission error toast
- Network errors → Shows user-friendly message (production only)
- 500+ Server errors → Logs to console

**Components should:**
- Handle 400 validation errors (field-specific)
- Handle business logic errors
- Show loading states
- Provide user feedback

---

## Authentication

### Token Injection

Tokens are automatically injected by apiClient:

```javascript
// No need to manually add token
const response = await apiClient.get(API_ENDPOINTS.AUTH.PROFILE);
// Token is automatically added from session storage
```

### Token Refresh

**Automatic refresh on 401:**
- apiClient detects 401 response
- Attempts token refresh using refresh token
- Retries original request with new token
- Logs out if refresh fails

**Manual refresh (if needed):**
```javascript
import { session } from '@/utils/session';

const refreshToken = session.getRefreshToken();
const response = await apiClient.post(API_ENDPOINTS.AUTH.REFRESH, {
  refresh: refreshToken,
});
```

---

## Public vs Authenticated APIs

### Public API Client

**Location:** `src/services/apiClient.js` (exported as `publicApiClient`)

**Use for:**
- Public endpoints (no authentication required)
- Property listings (public view)
- Public user profiles

**Usage:**
```javascript
import { publicApiClient } from '@/services/apiClient';
import { API_ENDPOINTS } from '@/config/apiEndpoints';

// Public endpoint - no auth token injected
const response = await publicApiClient.get(API_ENDPOINTS.PROPERTIES.BASE);
```

**Benefits:**
- No auth token injection
- No session-expired redirects on 401
- Works even with stale tokens

### Authenticated API Client

**Location:** `src/services/apiClient.js` (default export)

**Use for:**
- All authenticated endpoints
- User-specific data
- Admin operations

**Usage:**
```javascript
import apiClient from '@/services/apiClient';
import { API_ENDPOINTS } from '@/config/apiEndpoints';

// Authenticated endpoint - token automatically injected
const response = await apiClient.get(API_ENDPOINTS.AUTH.PROFILE);
```

---

## Request Patterns

### GET Request

```javascript
// Simple GET
const response = await apiClient.get(API_ENDPOINTS.PROPERTIES.BASE);

// GET with query parameters
const response = await apiClient.get(API_ENDPOINTS.PROPERTIES.BASE, {
  params: {
    page: 1,
    page_size: 20,
    search: 'apartment',
    min_price: 1000,
    max_price: 5000,
  },
});

// GET with dynamic ID
const response = await apiClient.get(API_ENDPOINTS.PROPERTIES.BY_ID(propertyId));
```

### POST Request

```javascript
// Simple POST
const response = await apiClient.post(API_ENDPOINTS.PROPERTIES.BASE, {
  title: 'Property Title',
  price: 1500,
  location: 'Accra',
  // ... other fields
});

// POST with FormData (file upload)
const formData = new FormData();
formData.append('title', 'Property Title');
formData.append('image', file);

const response = await apiClient.post(API_ENDPOINTS.PROPERTIES.BASE, formData);
// Content-Type is automatically set for FormData
```

### PUT/PATCH Request

```javascript
// Update resource
const response = await apiClient.patch(
  API_ENDPOINTS.PROPERTIES.BY_ID(propertyId),
  {
    price: 2000, // Only update price
  }
);
```

### DELETE Request

```javascript
// Delete resource
const response = await apiClient.delete(
  API_ENDPOINTS.PROPERTIES.BY_ID(propertyId)
);
```

---

## Response Handling

### Standard Response Format

**Paginated Response:**
```json
{
  "count": 100,
  "next": "http://api.../properties/?page=2",
  "previous": null,
  "results": [
    {
      "id": "prop_123",
      "title": "Property Title",
      // ... property data
    }
  ]
}
```

**Single Resource:**
```json
{
  "id": "prop_123",
  "title": "Property Title",
  "price": 1500,
  // ... property data
}
```

**Error Response:**
```json
{
  "detail": "Error message",
  "field_errors": {
    "field_name": ["Error message"]
  }
}
```

### Response Handling Pattern

```javascript
// Paginated response
const response = await apiClient.get(API_ENDPOINTS.PROPERTIES.BASE);
const { count, next, previous, results } = response.data;
setProperties(results);
setTotalCount(count);

// Single resource
const response = await apiClient.get(API_ENDPOINTS.PROPERTIES.BY_ID(id));
const property = response.data;
setProperty(property);

// Error handling
try {
  const response = await apiClient.post(API_ENDPOINTS.PROPERTIES.BASE, data);
  // Success
} catch (error) {
  if (error.response?.data?.field_errors) {
    // Handle field-specific errors
    setFieldErrors(error.response.data.field_errors);
  }
}
```

---

## Mock Mode Integration

### Mock Mode Detection

```javascript
import { isMockMode } from '@/mocks/mockManager';

const USE_MOCK = isMockMode();
```

### Mock Data Pattern

```javascript
// services/propertyService.js
const USE_MOCK = isMockMode();

export const getProperties = async () => {
  if (USE_MOCK) {
    // Return mock data
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(mockProperties);
      }, 300); // Simulate network delay
    });
  }
  
  // Real API call
  const response = await apiClient.get(API_ENDPOINTS.PROPERTIES.BASE);
  return response.data;
};
```

### Mock Services

**Services with mock support:**
- `propertyService.js`
- `walletService.js`
- `adsService.js`
- `paystackService.js`
- `announcementService.js`
- `reviewService.js`
- `messagesService.js`
- `notificationService.js`

---

## Loading States

### Pattern: useState + useEffect

```javascript
function PropertyList() {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    async function fetchProperties() {
      try {
        setLoading(true);
        setError(null);
        const data = await propertyService.getProperties();
        setProperties(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    
    fetchProperties();
  }, []);
  
  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage error={error} />;
  
  return <PropertyGrid properties={properties} />;
}
```

---

## Best Practices

### 1. Always Use Service Layer

```javascript
// ✅ Good - Use service
import { getProperties } from '@/services/propertyService';
const properties = await getProperties();

// ❌ Bad - Direct API call
import apiClient from '@/services/apiClient';
const response = await apiClient.get('/properties/');
```

### 2. Handle Errors Gracefully

```javascript
// ✅ Good - Comprehensive error handling
try {
  const data = await getProperties();
  setProperties(data);
} catch (error) {
  if (error.response?.status === 400) {
    // Handle validation errors
  } else if (error.response?.status === 403) {
    // Permission denied
  } else {
    // Other errors
    toast.error('Failed to load properties');
  }
}

// ❌ Bad - No error handling
const data = await getProperties();
setProperties(data);
```

### 3. Show Loading States

```javascript
// ✅ Good - Loading state
const [loading, setLoading] = useState(true);
// ... show spinner while loading

// ❌ Bad - No loading state
// User sees nothing while data loads
```

### 4. Use Endpoint Constants

```javascript
// ✅ Good - Use constants
apiClient.get(API_ENDPOINTS.PROPERTIES.BASE);

// ❌ Bad - Hardcoded strings
apiClient.get('/properties/');
```

### 5. Validate Responses

```javascript
// ✅ Good - Validate response
const response = await apiClient.get(API_ENDPOINTS.PROPERTIES.BASE);
if (response.data && Array.isArray(response.data.results)) {
  setProperties(response.data.results);
}

// ❌ Bad - Assume response format
const response = await apiClient.get(API_ENDPOINTS.PROPERTIES.BASE);
setProperties(response.data.results); // May be undefined
```

---

## Common Patterns

### Pattern 1: Fetch on Mount

```javascript
useEffect(() => {
  async function loadData() {
    try {
      const data = await fetchData();
      setData(data);
    } catch (error) {
      setError(error.message);
    }
  }
  loadData();
}, []);
```

### Pattern 2: Fetch on Action

```javascript
const handleSubmit = async (formData) => {
  try {
    setSubmitting(true);
    const response = await createResource(formData);
    toast.success('Created successfully');
    navigate('/success');
  } catch (error) {
    toast.error('Failed to create');
  } finally {
    setSubmitting(false);
  }
};
```

### Pattern 3: Optimistic Updates

```javascript
const handleDelete = async (id) => {
  // Optimistically remove from UI
  setItems(items.filter(item => item.id !== id));
  
  try {
    await deleteResource(id);
  } catch (error) {
    // Rollback on error
    setItems(items);
    toast.error('Failed to delete');
  }
};
```

---

## Security Considerations

### 1. Never Trust Frontend State

```javascript
// ✅ Good - Backend validates
const response = await apiClient.post(API_ENDPOINTS.ADMIN.APPROVE_USER(id));
// Backend returns 403 if no permission

// ❌ Bad - Frontend-only check
if (user.role === 'admin') {
  // Directly approve without backend check
}
```

### 2. Validate All Inputs

```javascript
// ✅ Good - Validate before sending
const validatedData = validatePropertyData(formData);
if (!validatedData.valid) {
  setErrors(validatedData.errors);
  return;
}
await createProperty(validatedData.data);

// ❌ Bad - Send invalid data
await createProperty(formData);
```

### 3. Handle Sensitive Data

```javascript
// ✅ Good - Don't log sensitive data
console.log('User action:', action); // Safe
// Don't log: passwords, tokens, personal data

// ❌ Bad - Log sensitive data
console.log('User data:', user); // May contain sensitive info
```

---

## Troubleshooting

### Issue: 401 Unauthorized

**Check:**
1. Token exists in session storage
2. Token is not expired
3. Backend is running and accessible
4. CORS is configured correctly

### Issue: 403 Forbidden

**Check:**
1. User has required permissions
2. Backend permissions are correct
3. Role is correctly assigned
4. Feature access is granted

### Issue: Network Error

**Check:**
1. Backend is running
2. API base URL is correct
3. Network connection is active
4. CORS is configured

### Issue: Mock Mode Not Working

**Check:**
1. `VITE_USE_MOCK=true` in `.env`
2. Mock data is loaded
3. Service checks `isMockMode()`
4. Dev server restarted after env change

---

**Last Updated:** January 2026  
**Maintained By:** Frontend Team
