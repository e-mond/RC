# Error Handling and Toast Notifications Guide

**Date:** January 2026  
**Status:** Production-Ready  
**Purpose:** Complete guide to error handling and toast notifications in RentalConnects frontend

---

## Overview

RentalConnects implements a comprehensive error handling system with user-friendly toast notifications. This guide covers:
- Error handling patterns
- Toast notification usage
- Error types and responses
- User feedback best practices

---

## Error Handling Architecture

### Layers of Error Handling

1. **API Client Level** - Automatic error handling in interceptors
2. **Service Level** - Service-specific error handling
3. **Component Level** - Component-specific error handling
4. **User Feedback** - Toast notifications and UI feedback

---

## API Client Error Handling

### Automatic Error Handling

**Location:** `src/services/apiClient.js`

**Handles:**
- 401 Unauthorized → Token refresh → Logout if refresh fails
- 403 Forbidden → Shows permission error toast
- Network errors → Shows user-friendly message (production)
- 500+ Server errors → Logs to console

**Example:**
```javascript
// apiClient automatically handles errors
try {
  const response = await apiClient.get(API_ENDPOINTS.PROPERTIES.BASE);
  // Success - no error handling needed
} catch (error) {
  // Error already handled by apiClient
  // Component can add additional handling if needed
}
```

---

## Toast Notification System

### Toast Library

**Library:** `react-hot-toast`

**Configuration:** `src/App.jsx`
```javascript
<Toaster position="top-right" toastOptions={{ duration: 4000 }} />
```

### Toast Usage

**Import:**
```javascript
import { toast } from 'react-hot-toast';
```

**Success Toast:**
```javascript
toast.success('Property created successfully');
```

**Error Toast:**
```javascript
toast.error('Failed to create property');
```

**Loading Toast:**
```javascript
const toastId = toast.loading('Creating property...');
// ... async operation
toast.success('Property created!', { id: toastId });
```

**Custom Toast:**
```javascript
toast('Custom message', {
  icon: '👋',
  duration: 3000,
});
```

---

## Error Types and Handling

### 400 Bad Request (Validation Errors)

**Response Format:**
```json
{
  "detail": "Validation error",
  "field_errors": {
    "title": ["This field is required."],
    "price": ["Price must be greater than 0."]
  }
}
```

**Handling Pattern:**
```javascript
try {
  await createProperty(data);
  toast.success('Property created successfully');
} catch (error) {
  if (error.response?.status === 400) {
    const fieldErrors = error.response.data.field_errors;
    
    // Show field-specific errors
    if (fieldErrors) {
      setFieldErrors(fieldErrors);
      toast.error('Please fix the errors in the form');
    } else {
      toast.error(error.response.data.detail || 'Validation error');
    }
  }
}
```

### 401 Unauthorized

**Automatic Handling:**
- apiClient attempts token refresh
- If refresh succeeds, retries original request
- If refresh fails, logs out user and redirects to login

**Component Handling:**
```javascript
try {
  await fetchData();
} catch (error) {
  if (error.response?.status === 401) {
    // Token refresh handled by apiClient
    // User will be logged out if refresh fails
    // Component can show loading state during refresh
  }
}
```

### 403 Forbidden

**Automatic Handling:**
- apiClient shows permission error toast
- Error is logged to console

**Component Handling:**
```javascript
try {
  await approveUser(userId);
} catch (error) {
  if (error.response?.status === 403) {
    // Toast already shown by apiClient
    // Component can show additional UI if needed
    setPermissionError(true);
  }
}
```

### 404 Not Found

**Handling Pattern:**
```javascript
try {
  const response = await apiClient.get(API_ENDPOINTS.PROPERTIES.BY_ID(id));
  setProperty(response.data);
} catch (error) {
  if (error.response?.status === 404) {
    toast.error('Property not found');
    navigate('/properties');
  }
}
```

### 422 Unprocessable Entity

**Response Format:**
```json
{
  "detail": "Unprocessable entity",
  "field_errors": {
    "field_name": ["Error message"]
  }
}
```

**Handling Pattern:**
```javascript
try {
  await updateProperty(id, data);
  toast.success('Property updated successfully');
} catch (error) {
  if (error.response?.status === 422) {
    const fieldErrors = error.response.data.field_errors;
    setFieldErrors(fieldErrors);
    toast.error('Please fix the errors');
  }
}
```

### 500+ Server Errors

**Automatic Handling:**
- Logged to console for debugging
- User-friendly message shown (production only)

**Component Handling:**
```javascript
try {
  await fetchData();
} catch (error) {
  if (error.response?.status >= 500) {
    toast.error('Server error. Please try again later.');
    // Log for debugging
    console.error('Server error:', error);
  }
}
```

### Network Errors

**Automatic Handling:**
- Production: Shows user-friendly message
- Development: Logs to console (backend might not be running)

**Component Handling:**
```javascript
try {
  await fetchData();
} catch (error) {
  if (!error.response) {
    // Network error
    toast.error('Unable to connect to server. Please check your connection.');
  }
}
```

---

## Toast Notification Patterns

### Pattern 1: Success Feedback

```javascript
const handleSubmit = async (formData) => {
  try {
    await createProperty(formData);
    toast.success('Property created successfully');
    navigate('/properties');
  } catch (error) {
    // Error handling
  }
};
```

### Pattern 2: Loading State with Toast

```javascript
const handleSubmit = async (formData) => {
  const toastId = toast.loading('Creating property...');
  
  try {
    await createProperty(formData);
    toast.success('Property created successfully!', { id: toastId });
    navigate('/properties');
  } catch (error) {
    toast.error('Failed to create property', { id: toastId });
  }
};
```

### Pattern 3: Field-Specific Errors

```javascript
const handleSubmit = async (formData) => {
  try {
    await createProperty(formData);
    toast.success('Property created successfully');
  } catch (error) {
    if (error.response?.status === 400) {
      const fieldErrors = error.response.data.field_errors;
      
      // Set field errors for form display
      setFieldErrors(fieldErrors);
      
      // Show general error toast
      toast.error('Please fix the errors in the form');
    } else {
      toast.error('Failed to create property');
    }
  }
};
```

### Pattern 4: Optimistic Updates with Toast

```javascript
const handleDelete = async (id) => {
  // Optimistically remove from UI
  const originalItems = items;
  setItems(items.filter(item => item.id !== id));
  
  const toastId = toast.loading('Deleting property...');
  
  try {
    await deleteProperty(id);
    toast.success('Property deleted successfully', { id: toastId });
  } catch (error) {
    // Rollback on error
    setItems(originalItems);
    toast.error('Failed to delete property', { id: toastId });
  }
};
```

---

## Error Message Best Practices

### 1. User-Friendly Messages

```javascript
// ✅ Good - User-friendly
toast.error('Unable to connect to server. Please check your connection.');

// ❌ Bad - Technical
toast.error('ERR_NETWORK: Connection refused');
```

### 2. Actionable Messages

```javascript
// ✅ Good - Actionable
toast.error('Please check your internet connection and try again.');

// ❌ Bad - Vague
toast.error('Error occurred');
```

### 3. Context-Specific Messages

```javascript
// ✅ Good - Context-specific
toast.error('Property not found. It may have been deleted.');

// ❌ Bad - Generic
toast.error('Not found');
```

### 4. Success Confirmation

```javascript
// ✅ Good - Clear success message
toast.success('Property created successfully');

// ❌ Bad - Vague
toast.success('Done');
```

---

## Error Handling in Components

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
        toast.error('Failed to load properties');
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

### Pattern: Form Submission

```javascript
function PropertyForm() {
  const [submitting, setSubmitting] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});
  
  const handleSubmit = async (formData) => {
    try {
      setSubmitting(true);
      setFieldErrors({});
      
      await propertyService.createProperty(formData);
      
      toast.success('Property created successfully');
      navigate('/properties');
    } catch (error) {
      if (error.response?.status === 400) {
        const errors = error.response.data.field_errors || {};
        setFieldErrors(errors);
        toast.error('Please fix the errors in the form');
      } else {
        toast.error('Failed to create property');
      }
    } finally {
      setSubmitting(false);
    }
  };
  
  return (
    <form onSubmit={handleSubmit}>
      {/* Form fields with error display */}
      <button disabled={submitting}>
        {submitting ? 'Creating...' : 'Create Property'}
      </button>
    </form>
  );
}
```

---

## Toast Configuration

### Global Configuration

**Location:** `src/App.jsx`

```javascript
<Toaster
  position="top-right"
  toastOptions={{
    duration: 4000,
    style: {
      borderRadius: '12px',
      background: '#333',
      color: '#fff',
    },
    success: {
      duration: 3000,
      iconTheme: {
        primary: '#10b981',
        secondary: '#fff',
      },
    },
    error: {
      duration: 5000,
      iconTheme: {
        primary: '#ef4444',
        secondary: '#fff',
      },
    },
  }}
/>
```

### Custom Toast Styles

```javascript
// Success toast
toast.success('Success message', {
  duration: 3000,
  style: {
    background: '#10b981',
    color: '#fff',
  },
});

// Error toast
toast.error('Error message', {
  duration: 5000,
  style: {
    background: '#ef4444',
    color: '#fff',
  },
});

// Custom toast
toast('Custom message', {
  icon: '👋',
  duration: 3000,
  style: {
    background: '#3b82f6',
    color: '#fff',
  },
});
```

---

## Error Boundaries (Future)

### Implementation Plan

Error boundaries will catch React errors and show fallback UI:

```javascript
// ErrorBoundary.jsx (to be implemented)
class ErrorBoundary extends React.Component {
  componentDidCatch(error, errorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
    toast.error('Something went wrong. Please refresh the page.');
  }
  
  render() {
    if (this.state.hasError) {
      return <ErrorFallback />;
    }
    return this.props.children;
  }
}
```

---

## Best Practices

### 1. Always Handle Errors

```javascript
// ✅ Good - Error handling
try {
  await performAction();
  toast.success('Action completed');
} catch (error) {
  toast.error('Action failed');
}

// ❌ Bad - No error handling
await performAction();
toast.success('Action completed');
```

### 2. Show Loading States

```javascript
// ✅ Good - Loading state
const [loading, setLoading] = useState(false);

const handleAction = async () => {
  setLoading(true);
  try {
    await performAction();
  } finally {
    setLoading(false);
  }
};

// ❌ Bad - No loading state
const handleAction = async () => {
  await performAction();
};
```

### 3. Provide User Feedback

```javascript
// ✅ Good - User feedback
toast.success('Property created successfully');
navigate('/properties');

// ❌ Bad - No feedback
await createProperty(data);
navigate('/properties');
```

### 4. Handle Field Errors

```javascript
// ✅ Good - Field-specific errors
if (error.response?.data?.field_errors) {
  setFieldErrors(error.response.data.field_errors);
  toast.error('Please fix the errors in the form');
}

// ❌ Bad - Generic error only
toast.error('Validation error');
```

---

## Common Issues & Solutions

### Issue: Toast Not Showing

**Solution:**
- Check Toaster is rendered in App.jsx
- Verify toast is called (not just console.log)
- Check toast position is visible

### Issue: Multiple Toasts for Same Error

**Solution:**
- Use toast ID to update existing toast
- Check if error is already handled by apiClient
- Avoid duplicate error handling

### Issue: Error Message Not User-Friendly

**Solution:**
- Map technical errors to user-friendly messages
- Use error.response.data.detail if available
- Provide actionable error messages

---

## Testing Error Handling

### Manual Testing

1. **Network Errors:**
   - Disconnect internet
   - Verify user-friendly message shown

2. **401 Errors:**
   - Use expired token
   - Verify token refresh attempt
   - Verify logout if refresh fails

3. **403 Errors:**
   - Access restricted resource
   - Verify permission error toast

4. **400 Errors:**
   - Submit invalid form data
   - Verify field-specific errors shown

5. **500 Errors:**
   - Trigger server error
   - Verify error logged and user notified

---

**Last Updated:** January 2026  
**Maintained By:** Frontend Team
