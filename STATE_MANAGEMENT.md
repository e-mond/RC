# State Management Guide

**Date:** January 2026  
**Status:** Production-Ready  
**Purpose:** Complete guide to state management in RentalConnects frontend

---

## Overview

RentalConnects uses a **hybrid state management approach** combining:
- **Zustand** for global persistent state (auth, features)
- **React Context** for theme, language, and feature access
- **Local State** (useState/useReducer) for component-specific state

---

## State Management Strategy

### When to Use Each Approach

| State Type | Solution | Example |
|------------|----------|---------|
| **Global Persistent** | Zustand | User auth, subscription plan |
| **Global UI State** | Context | Theme, language |
| **Component State** | useState | Form inputs, modal visibility |
| **Derived State** | useMemo | Computed values, filtered lists |
| **Async State** | useState + useEffect | API data, loading states |

---

## Zustand Stores

### 1. Auth Store (`authStore.js`)

**Purpose:** Manages authentication state and user session.

**State:**
```javascript
{
  user: null | UserObject,      // Current authenticated user
  token: null | string,         // JWT access token
  loading: boolean,              // Initial session hydration
  authLoading: boolean,          // Login/signup operation state
  error: null | string           // Authentication error
}
```

**Key Methods:**
- `login(credentials)` - Authenticate user
- `logout()` - Clear session and redirect
- `loadSession()` - Restore session from localStorage
- `updateUser(userData)` - Update user profile
- `isTenant()`, `isLandlord()`, etc. - Role helpers

**Persistence:**
- Stored in localStorage as `rc-auth-storage`
- Automatically rehydrates on app load
- Token stored separately in session utils

**Usage:**
```javascript
import { useAuthStore } from '@/stores/authStore';

function MyComponent() {
  const { user, isAuthenticated, logout } = useAuthStore();
  
  if (!isAuthenticated) {
    return <LoginPrompt />;
  }
  
  return <div>Welcome, {user.full_name}</div>;
}
```

**Role Normalization:**
- All roles stored in lowercase: `"tenant"`, `"landlord"`, `"artisan"`, `"admin"`, `"super-admin"`
- Ensures consistent role comparison

---

### 2. Feature Store (`featureStore.js`)

**Purpose:** Manages subscription plan and feature access.

**State:**
```javascript
{
  plan: "free" | "premium"  // Current subscription plan
}
```

**Key Methods:**
- `setPlan(plan)` - Set subscription plan
- `isPremium()` - Check if user has premium
- `togglePlan()` - Toggle plan (dev/demo only)

**Persistence:**
- Stored in localStorage as `rc-feature-storage`
- Persists across page refreshes

**Usage:**
```javascript
import { useFeatureStore } from '@/stores/featureStore';

function PremiumFeature() {
  const { plan, isPremium } = useFeatureStore();
  
  if (!isPremium()) {
    return <UpgradePrompt />;
  }
  
  return <PremiumContent />;
}
```

**Integration with Auth:**
- Automatically synced when user logs in
- Updated when premium upgrade completes

---

## React Context

### 1. Theme Context (`ThemeContext.jsx`)

**Purpose:** Manages dark/light theme.

**State:**
```javascript
{
  theme: "light" | "dark",
  toggleTheme: () => void
}
```

**Usage:**
```javascript
import { useTheme } from '@/context/ThemeContext';

function MyComponent() {
  const { theme, toggleTheme } = useTheme();
  
  return (
    <button onClick={toggleTheme}>
      Switch to {theme === 'light' ? 'dark' : 'light'} mode
    </button>
  );
}
```

**Persistence:**
- Stored in localStorage
- Applied to `<html>` class on mount

---

### 2. Language Context (`LanguageContext.jsx`)

**Purpose:** Manages i18n language selection.

**State:**
```javascript
{
  language: "en" | "fr",
  setLanguage: (lang) => void,
  t: (key) => string  // Translation function
}
```

**Usage:**
```javascript
import { useLanguage } from '@/context/LanguageContext';

function MyComponent() {
  const { language, setLanguage, t } = useLanguage();
  
  return (
    <div>
      <p>{t('welcome.message')}</p>
      <button onClick={() => setLanguage('fr')}>Français</button>
    </div>
  );
}
```

**Persistence:**
- Stored in localStorage
- Loads translations on mount

---

### 3. Feature Access Context (`FeatureAccessContext.jsx`)

**Purpose:** Provides feature access checks based on subscription.

**State:**
```javascript
{
  can: (feature) => boolean,  // Check if feature is accessible
  features: FeatureMap       // Available features
}
```

**Usage:**
```javascript
import { useFeatureAccess } from '@/context/FeatureAccessContext';

function MyComponent() {
  const { can } = useFeatureAccess();
  
  if (!can('landlord_advanced_analytics')) {
    return <UpgradePrompt />;
  }
  
  return <AnalyticsDashboard />;
}
```

**Features:**
- `landlord_advanced_analytics` - Analytics dashboard
- `digital_rent_collection` - Wallet system
- `advertisement_manager` - Ad management
- `tenant_maintenance_tracker` - Maintenance requests

---

## Local State (useState/useReducer)

### When to Use Local State

- **Form inputs** - Controlled inputs
- **Modal visibility** - Show/hide modals
- **Dropdown state** - Open/closed state
- **UI interactions** - Button states, hover effects
- **Temporary data** - Search queries, filters

### Example: Form State

```javascript
import { useState } from 'react';
import { useForm } from 'react-hook-form';

function PropertyForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { register, handleSubmit } = useForm();
  
  const onSubmit = async (data) => {
    setIsSubmitting(true);
    try {
      await createProperty(data);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      {/* Form fields */}
      <button disabled={isSubmitting}>
        {isSubmitting ? 'Saving...' : 'Save'}
      </button>
    </form>
  );
}
```

---

## Async State Management

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

### Pattern: Custom Hook

```javascript
// hooks/useProperties.js
function useProperties() {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    propertyService.getProperties()
      .then(setProperties)
      .finally(() => setLoading(false));
  }, []);
  
  return { properties, loading };
}

// Component
function PropertyList() {
  const { properties, loading } = useProperties();
  // ...
}
```

---

## State Persistence

### Zustand Persist Middleware

```javascript
export const useAuthStore = create(
  persist(
    (set, get) => ({
      // State and methods
    }),
    {
      name: 'rc-auth-storage',  // localStorage key
      partialize: (state) => ({  // What to persist
        user: state.user,
        token: state.token,
      }),
    }
  )
);
```

**Benefits:**
- Automatic persistence
- Rehydration on app load
- Selective persistence (partialize)
- Custom storage (can use sessionStorage, etc.)

---

## State Updates

### Immutable Updates

Always create new objects/arrays when updating state:

```javascript
// ❌ Bad - Mutates state
const updateUser = (newData) => {
  user.name = newData.name;  // Mutation!
  setUser(user);
};

// ✅ Good - Immutable update
const updateUser = (newData) => {
  setUser({ ...user, ...newData });
};
```

### Batch Updates

React batches state updates automatically:

```javascript
// These are batched into one re-render
setLoading(true);
setError(null);
setData(newData);
```

---

## Best Practices

### 1. Keep State Local When Possible

```javascript
// ✅ Good - Local state for UI
const [isOpen, setIsOpen] = useState(false);

// ❌ Bad - Global state for UI
useAuthStore.setState({ isModalOpen: true });
```

### 2. Lift State Up When Needed

```javascript
// ✅ Good - Shared state in parent
function Parent() {
  const [selectedId, setSelectedId] = useState(null);
  return (
    <>
      <List onSelect={setSelectedId} />
      <Details id={selectedId} />
    </>
  );
}
```

### 3. Use Derived State

```javascript
// ✅ Good - Derived from props/state
const filteredItems = useMemo(
  () => items.filter(item => item.category === category),
  [items, category]
);
```

### 4. Normalize Complex State

```javascript
// ✅ Good - Normalized structure
const state = {
  users: {
    '1': { id: '1', name: 'John' },
    '2': { id: '2', name: 'Jane' },
  },
  selectedUserId: '1',
};
```

---

## Common Patterns

### 1. Loading States

```javascript
const [loading, setLoading] = useState(false);

const handleAction = async () => {
  setLoading(true);
  try {
    await performAction();
  } finally {
    setLoading(false);
  }
};
```

### 2. Error States

```javascript
const [error, setError] = useState(null);

const handleAction = async () => {
  try {
    setError(null);
    await performAction();
  } catch (err) {
    setError(err.message);
  }
};
```

### 3. Optimistic Updates

```javascript
const [items, setItems] = useState([]);

const addItem = async (newItem) => {
  // Optimistically add item
  setItems([...items, newItem]);
  
  try {
    await api.createItem(newItem);
  } catch (err) {
    // Rollback on error
    setItems(items);
    setError(err.message);
  }
};
```

---

## Debugging State

### Zustand DevTools

```javascript
import { devtools } from 'zustand/middleware';

export const useAuthStore = create(
  devtools(
    persist(/* ... */),
    { name: 'AuthStore' }
  )
);
```

### React DevTools

- Use React DevTools Profiler
- Check component state in Components tab
- Monitor re-renders

### Console Logging

```javascript
// Log state changes
useEffect(() => {
  console.log('User changed:', user);
}, [user]);
```

---

## Migration Guide

### From Context to Zustand

**Before (Context):**
```javascript
const { user } = useAuth();
```

**After (Zustand):**
```javascript
const { user } = useAuthStore();
```

**Benefits:**
- Less boilerplate
- Better performance
- Built-in persistence
- Simpler API

---

## Troubleshooting

### Issue: State not persisting

**Check:**
- Zustand persist middleware configured
- localStorage not disabled
- Storage key is correct

### Issue: State updates not triggering re-render

**Check:**
- Using immutable updates
- Zustand selector is correct
- Component is subscribed to store

### Issue: Stale state in closures

**Solution:**
```javascript
// Use functional update
setCount(count => count + 1);

// Or use current value from store
const count = useAuthStore(state => state.count);
```

---

**Last Updated:** January 2026  
**Maintained By:** Frontend Team
