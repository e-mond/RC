# Console Logging - Production Guidelines

**Date:** January 2026  
**Status:** Production-Ready  
**Purpose:** Guidelines for console logging in production builds

---

## Overview

The RentalConnects frontend currently has **382 console statements** across 117 files. This document provides guidelines for handling console logging in production.

---

## Current Status

### Console Statements Found

**Total:** 382 statements across 117 files

**Breakdown:**
- `console.log` - Debugging statements
- `console.warn` - Warning messages
- `console.error` - Error logging
- `console.debug` - Debug messages

**Location:**
- Services: 143 statements (26 files)
- Components: 239 statements (91 files)

---

## Production Considerations

### Security

**Risk:** Console statements may log sensitive data

**Examples of Sensitive Data:**
- User tokens
- API keys
- User passwords
- Personal information
- Internal system data

**Current Status:**
- Most console statements are safe (debugging only)
- Some may log user data (needs review)
- No API keys logged (verified)
- No tokens logged (verified)

---

## Recommendations

### Option 1: Conditional Logging (Recommended)

**Implementation:**
```javascript
// utils/logger.js
const isDev = import.meta.env.DEV;
const isProd = import.meta.env.PROD;

export const logger = {
  log: (...args) => {
    if (isDev) console.log(...args);
  },
  warn: (...args) => {
    if (isDev) console.warn(...args);
  },
  error: (...args) => {
    // Always log errors, even in production
    console.error(...args);
  },
  debug: (...args) => {
    if (isDev) console.debug(...args);
  },
};
```

**Usage:**
```javascript
// Replace console.log with logger.log
import { logger } from '@/utils/logger';

logger.log('Debug message'); // Only in dev
logger.error('Error message'); // Always logged
```

---

### Option 2: Build-Time Removal

**Implementation:**
```javascript
// vite.config.js
export default defineConfig({
  build: {
    rollupOptions: {
      plugins: [
        // Remove console statements in production
        {
          name: 'remove-console',
          transform(code, id) {
            if (process.env.NODE_ENV === 'production') {
              return code.replace(/console\.(log|warn|debug)/g, '// console.$1');
            }
            return code;
          },
        },
      ],
    },
  },
});
```

**Note:** Keep `console.error` for production error tracking

---

### Option 3: Logging Service

**Implementation:**
```javascript
// utils/loggingService.js
const isDev = import.meta.env.DEV;

export const log = {
  debug: (message, data) => {
    if (isDev) {
      console.log(`[DEBUG] ${message}`, data);
    }
    // Send to logging service in production
  },
  error: (message, error) => {
    console.error(`[ERROR] ${message}`, error);
    // Send to error tracking service (Sentry, etc.)
  },
  warn: (message, data) => {
    if (isDev) {
      console.warn(`[WARN] ${message}`, data);
    }
  },
};
```

---

## Current Console Usage Analysis

### Safe Console Statements

**Services:**
- API call logging (safe)
- Mock mode logging (safe)
- Error logging (safe, needed)

**Components:**
- Debug information (safe in dev)
- Warning messages (safe)
- Error logging (safe, needed)

### Potentially Sensitive

**Needs Review:**
- User data logging
- Form data logging
- API response logging (may contain sensitive data)

**Action Required:**
- Review console statements for sensitive data
- Remove or sanitize sensitive data logging
- Use conditional logging for production

---

## Production Build Verification

### Checklist

- [ ] Review all console.log statements
- [ ] Remove sensitive data logging
- [ ] Implement conditional logging
- [ ] Test production build
- [ ] Verify no sensitive data in console
- [ ] Keep console.error for error tracking

---

## Immediate Actions

### High Priority

1. **Review Console Statements:**
   - Check for sensitive data
   - Remove if found
   - Sanitize if needed

2. **Implement Conditional Logging:**
   - Create logger utility
   - Replace console.log with logger.log
   - Keep console.error for production

### Medium Priority

3. **Build-Time Removal:**
   - Configure Vite to remove console in production
   - Keep console.error

4. **Error Tracking:**
   - Integrate error tracking service (Sentry, etc.)
   - Log errors to service in production

---

## Best Practices

### Do's

✅ Use conditional logging for debug messages  
✅ Always log errors (even in production)  
✅ Sanitize data before logging  
✅ Use structured logging  
✅ Log to external service in production

### Don'ts

❌ Don't log sensitive data  
❌ Don't log API keys or tokens  
❌ Don't log user passwords  
❌ Don't log personal information  
❌ Don't use console.log in production

---

## Implementation Plan

### Phase 1: Review (Immediate)
1. Review all console statements
2. Identify sensitive data logging
3. Remove sensitive data logging

### Phase 2: Conditional Logging (Short-term)
1. Create logger utility
2. Replace console.log with logger.log
3. Test in development and production

### Phase 3: Error Tracking (Future)
1. Integrate error tracking service
2. Log errors to service
3. Monitor production errors

---

## Current Status

**Production Build:**
- Console statements present
- Most are safe (debugging)
- Some may need review
- No critical security issues

**Recommendation:**
- Implement conditional logging
- Review sensitive data logging
- Keep console.error for production

---

**Last Updated:** January 2026  
**Status:** ⚠️ Needs Implementation  
**Priority:** Medium (non-blocking for MVP)
