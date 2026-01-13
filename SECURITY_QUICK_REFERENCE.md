# Security Quick Reference Guide

**Date:** January 20, 2026  
**Purpose:** Quick reference for security implementation and maintenance

---

## 🔒 Security Features Overview

### ✅ Implemented Security Features

1. **XSS Protection** - DOMPurify sanitization
2. **Token Refresh** - Automatic refresh on 401
3. **Token Expiration** - Periodic validation (60s)
4. **Route Protection** - Role-based access control
5. **API Security** - Token injection & error handling
6. **URL Validation** - Parameter validation utility

---

## 📝 Code Patterns

### XSS Protection Pattern

```javascript
// ✅ CORRECT: Sanitize before rendering
import { sanitizeBlogContentSync, sanitizeLeaseContentSync } from '@/utils/sanitize';

<div dangerouslySetInnerHTML={{ 
  __html: sanitizeBlogContentSync(userContent) 
}} />
```

```javascript
// ❌ WRONG: Unsanitized HTML
<div dangerouslySetInnerHTML={{ __html: userContent }} />
```

---

### Token Refresh Pattern

**Automatic:** Handled by `apiClient.js` interceptor

```javascript
// ✅ Automatic refresh on 401
// No manual code needed - handled automatically
```

**Manual Refresh (if needed):**
```javascript
import { session } from '@/utils/session';
import apiClient from '@/services/apiClient';
import { API_ENDPOINTS } from '@/config/apiEndpoints';

const refreshToken = session.getRefreshToken();
const response = await apiClient.post(API_ENDPOINTS.AUTH.REFRESH, {
  refresh: refreshToken
});
session.setToken(response.data.access);
```

---

### Token Expiration Pattern

**Automatic:** Handled by `RoleProtectedRoute.jsx`

```javascript
// ✅ Automatic validation on route access
// Checks every 60 seconds while on page
```

**Manual Check (if needed):**
```javascript
import { session } from '@/utils/session';
import { jwtDecode } from 'jwt-decode';

const token = session.getToken();
if (token) {
  const decoded = jwtDecode(token);
  const isExpired = decoded.exp < Date.now() / 1000;
  if (isExpired) {
    // Handle expired token
  }
}
```

---

### URL Parameter Validation Pattern

```javascript
// ✅ CORRECT: Validate URL parameters
import { validateId, validateNumericId, validateUUID } from '@/utils/validateParams';
import { useParams, Navigate } from 'react-router-dom';

export default function MyPage() {
  const { id: rawId } = useParams();
  const id = validateId(rawId);
  
  if (!id) {
    return <Navigate to="/error" replace />;
  }
  
  // Use validated id
  const data = await fetchData(id);
}
```

```javascript
// ❌ WRONG: Direct use without validation
const { id } = useParams();
const data = await fetchData(id); // Unsafe!
```

---

## 🛡️ Security Utilities

### Available Utilities

**Location:** `src/utils/`

1. **`sanitize.js`** - HTML sanitization
   - `sanitizeHtml(html, options)`
   - `sanitizeBlogContent(html)`
   - `sanitizeLeaseContent(html)`
   - `sanitizeBlogContentSync(html)` - For dangerouslySetInnerHTML
   - `sanitizeLeaseContentSync(html)` - For dangerouslySetInnerHTML

2. **`validateParams.js`** - URL parameter validation
   - `validateNumericId(id, min, max)`
   - `validateUUID(id)`
   - `validateId(id)` - Numeric or UUID
   - `validateStringParam(param, maxLength, pattern)`
   - `validateEnumParam(param, allowedValues)`

3. **`session.js`** - Session management
   - `session.getToken()`
   - `session.setToken(token)`
   - `session.getRefreshToken()`
   - `session.setRefreshToken(token)`
   - `session.clearAll()`

---

## 🔍 Security Checklist

### Before Adding New Features

- [ ] **User Input:** Sanitize all user-generated HTML
- [ ] **URL Parameters:** Validate all URL parameters
- [ ] **API Calls:** Use `apiClient` (automatic token injection)
- [ ] **Protected Routes:** Use `RoleProtectedRoute`
- [ ] **Error Handling:** Provide user-friendly messages
- [ ] **Sensitive Data:** Never store in localStorage
- [ ] **File Uploads:** Validate file types and sizes

### Code Review Checklist

- [ ] No `dangerouslySetInnerHTML` without sanitization
- [ ] No direct use of `useParams()` without validation
- [ ] No hardcoded API keys or secrets
- [ ] No direct `fetch()` calls (use `apiClient`)
- [ ] No sensitive data in console.log
- [ ] All API calls use unified endpoints
- [ ] Error messages don't expose sensitive info

---

## 🚨 Common Security Mistakes

### ❌ Don't Do This

```javascript
// ❌ Unsanitized HTML
<div dangerouslySetInnerHTML={{ __html: userContent }} />

// ❌ Direct URL parameter use
const { id } = useParams();
apiClient.get(`/users/${id}/`);

// ❌ Hardcoded secrets
const API_KEY = "sk_live_1234567890";

// ❌ Direct fetch without token
fetch('/api/protected-endpoint');

// ❌ Sensitive data in logs
console.log('User password:', password);
```

### ✅ Do This Instead

```javascript
// ✅ Sanitized HTML
<div dangerouslySetInnerHTML={{ 
  __html: sanitizeBlogContentSync(userContent) 
}} />

// ✅ Validated URL parameters
const { id: rawId } = useParams();
const id = validateId(rawId);
if (!id) return <Navigate to="/error" />;
apiClient.get(`/users/${id}/`);

// ✅ Environment variables
const API_KEY = import.meta.env.VITE_API_KEY;

// ✅ Use apiClient (automatic token injection)
apiClient.get('/api/protected-endpoint');

// ✅ Safe logging
console.log('User login attempt:', { email, timestamp });
```

---

## 📚 Related Documentation

1. **`SECURITY_TESTING_GUIDE.md`** - Complete testing instructions
2. **`SECURITY_VALIDATION_REPORT.md`** - Detailed validation report
3. **`PRODUCTION_READINESS_CHECKLIST.md`** - Deployment checklist
4. **`SECURITY_IMPLEMENTATION_COMPLETE.md`** - Implementation summary

---

## 🔧 Maintenance

### Regular Tasks

1. **Weekly:**
   - Review security logs
   - Check for new vulnerabilities
   - Update dependencies: `npm audit`

2. **Monthly:**
   - Review security documentation
   - Test security features
   - Update security policies

3. **Quarterly:**
   - Full security audit
   - Dependency updates
   - Security training review

### Dependency Updates

```bash
# Check for vulnerabilities
npm audit

# Fix vulnerabilities
npm audit fix

# Update dependencies
npm update

# Check outdated packages
npm outdated
```

---

## 🆘 Troubleshooting

### Issue: XSS Protection Not Working

**Symptoms:**
- Scripts execute in blog posts
- Console errors about DOMPurify

**Solutions:**
1. Verify package installed: `npm list dompurify`
2. Check import: `import DOMPurify from 'dompurify'`
3. Verify sanitization function is called
4. Check browser console for errors

---

### Issue: Token Refresh Not Working

**Symptoms:**
- User logged out immediately on 401
- No refresh request in network tab

**Solutions:**
1. Verify refresh token exists: `session.getRefreshToken()`
2. Check network tab for refresh request
3. Verify refresh endpoint: `/auth/refresh/`
4. Check console for refresh errors

---

### Issue: Token Expiration Not Detected

**Symptoms:**
- User can access routes with expired token
- No periodic validation

**Solutions:**
1. Verify token expiration check in `RoleProtectedRoute.jsx`
2. Check console for validation warnings
3. Verify interval is set (60 seconds)
4. Check token format in localStorage

---

## 📞 Support

For security questions or issues:
1. Review `SECURITY_TESTING_GUIDE.md`
2. Check `SECURITY_VALIDATION_REPORT.md`
3. Consult security team

---

**End of Security Quick Reference Guide**

*Last Updated: January 20, 2026*
