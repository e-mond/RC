# Security Test Execution Worksheet

**Date:** _______________  
**Tester:** _______________  
**Environment:** [ ] Development [ ] Staging [ ] Production  
**Build Version:** _______________

---

## Test Execution Instructions

1. **Before Starting:**
   - [ ] Backend API is running and accessible
   - [ ] Test user accounts created for each role
   - [ ] Browser developer tools enabled
   - [ ] Network tab open for monitoring

2. **During Testing:**
   - Check each test case
   - Document results (✅ PASS / ❌ FAIL)
   - Note any issues or observations
   - Take screenshots if needed

3. **After Testing:**
   - Review all results
   - Document any failures
   - Create issues for bugs found
   - Sign off on completion

---

## Test 1: XSS Protection

### Test 1.1: Blog Post XSS Protection

**Objective:** Verify that malicious scripts are stripped from blog post content.

**Steps:**
1. Navigate to a blog post page
2. Open browser developer console
3. In backend/admin panel, create/edit blog post with:
   ```html
   <script>alert('XSS Attack')</script>
   <p>Normal content here</p>
   <img src=x onerror=alert(1)>
   <iframe src="https://evil.com"></iframe>
   ```
4. View the blog post in frontend
5. Check rendered HTML in DevTools

**Expected Results:**
- [ ] `<script>` tags removed
- [ ] `onerror` attributes stripped
- [ ] `<iframe>` tags removed
- [ ] Normal HTML preserved
- [ ] No JavaScript alerts triggered
- [ ] No console errors

**Actual Results:**
- [ ] ✅ PASS
- [ ] ❌ FAIL

**Notes:**
_________________________________________________________

---

### Test 1.2: Lease Preview XSS Protection

**Objective:** Verify that malicious scripts are stripped from lease preview content.

**Steps:**
1. Log in as Landlord
2. Navigate to Leases section
3. Open "Customize Lease" modal
4. In backend, create lease template with:
   ```html
   <script>alert('XSS in Lease')</script>
   <h1>Lease Agreement</h1>
   <p>Normal lease content</p>
   <img src=x onerror=alert('Lease XSS')>
   ```
5. Select property and click "Preview"
6. Check rendered HTML in DevTools

**Expected Results:**
- [ ] `<script>` tags removed
- [ ] `onerror` attributes stripped
- [ ] Normal lease content preserved
- [ ] No JavaScript alerts triggered
- [ ] No console errors

**Actual Results:**
- [ ] ✅ PASS
- [ ] ❌ FAIL

**Notes:**
_________________________________________________________

---

### Test 1.3: HTML Entity Encoding

**Objective:** Verify that HTML entities are properly handled.

**Steps:**
1. Create content with HTML entities:
   ```html
   <p>&lt;script&gt;alert('test')&lt;/script&gt;</p>
   <p>&amp;copy; 2026</p>
   ```
2. View in blog post or lease preview

**Expected Results:**
- [ ] Entities properly decoded and displayed
- [ ] No script execution
- [ ] Special characters display correctly

**Actual Results:**
- [ ] ✅ PASS
- [ ] ❌ FAIL

**Notes:**
_________________________________________________________

---

## Test 2: Token Refresh Flow

### Test 2.1: Automatic Token Refresh on 401

**Objective:** Verify that expired access tokens are automatically refreshed.

**Steps:**
1. Log in as any user
2. Open DevTools → Network tab
3. Wait for access token to expire (or manually expire it)
4. Perform any API action (e.g., fetch properties)
5. Monitor network requests

**Expected Results:**
- [ ] First request returns 401
- [ ] Automatic refresh request to `/auth/refresh/`
- [ ] New access token stored
- [ ] Original request retried with new token
- [ ] Original request succeeds
- [ ] User remains logged in

**Actual Results:**
- [ ] ✅ PASS
- [ ] ❌ FAIL

**Notes:**
_________________________________________________________

---

### Test 2.2: Expired Refresh Token

**Objective:** Verify that expired refresh tokens trigger logout.

**Steps:**
1. Log in as any user
2. Manually expire refresh token in localStorage
3. Wait for access token to expire or trigger API call
4. Monitor network requests and user session

**Expected Results:**
- [ ] Refresh attempt made
- [ ] Refresh request returns 401
- [ ] User logged out
- [ ] Redirect to `/login?session=expired`
- [ ] Session storage cleared

**Actual Results:**
- [ ] ✅ PASS
- [ ] ❌ FAIL

**Notes:**
_________________________________________________________

---

### Test 2.3: Concurrent 401 Requests

**Objective:** Verify that multiple simultaneous 401s trigger only one refresh.

**Steps:**
1. Log in as any user
2. Open DevTools → Network tab
3. Expire access token
4. Trigger multiple API calls simultaneously
5. Monitor network requests

**Expected Results:**
- [ ] Multiple 401 responses received
- [ ] Only ONE refresh request made
- [ ] All original requests retried after refresh
- [ ] All requests succeed
- [ ] No infinite loops

**Actual Results:**
- [ ] ✅ PASS
- [ ] ❌ FAIL

**Notes:**
_________________________________________________________

---

### Test 2.4: Refresh Token Timeout

**Objective:** Verify that refresh requests timeout after 10 seconds.

**Steps:**
1. Log in as any user
2. Simulate slow network (DevTools → Network → Throttling → Slow 3G)
3. Expire access token
4. Trigger API call
5. Monitor network requests

**Expected Results:**
- [ ] Refresh request made
- [ ] If refresh takes > 10 seconds, request times out
- [ ] User logged out
- [ ] Redirect to login page

**Actual Results:**
- [ ] ✅ PASS
- [ ] ❌ FAIL

**Notes:**
_________________________________________________________

---

## Test 3: Token Expiration Validation

### Test 3.1: Expired Token on Route Access

**Objective:** Verify that expired tokens are detected before route rendering.

**Steps:**
1. Log in as any user
2. Navigate to protected route (e.g., `/tenant/dashboard`)
3. Manually expire token in localStorage
4. Navigate to another protected route
5. Monitor console and user session

**Expected Results:**
- [ ] Token expiration detected immediately
- [ ] User logged out before route renders
- [ ] Redirect to `/login?session=expired`
- [ ] Console warning logged
- [ ] Session storage cleared

**Actual Results:**
- [ ] ✅ PASS
- [ ] ❌ FAIL

**Notes:**
_________________________________________________________

---

### Test 3.2: Periodic Token Validation

**Objective:** Verify that tokens are checked every 60 seconds.

**Steps:**
1. Log in as any user
2. Navigate to protected route
3. Stay on page for > 60 seconds
4. Manually expire token (after initial check)
5. Wait for next periodic check
6. Monitor console

**Expected Results:**
- [ ] Token checked immediately on mount
- [ ] Token checked again after 60 seconds
- [ ] Expired token detected on next check
- [ ] User logged out when expired
- [ ] Console shows periodic validation warnings

**Actual Results:**
- [ ] ✅ PASS
- [ ] ❌ FAIL

**Notes:**
_________________________________________________________

---

### Test 3.3: Invalid Token Format

**Objective:** Verify that malformed tokens trigger logout.

**Steps:**
1. Log in as any user
2. Manually corrupt token in localStorage
3. Navigate to protected route
4. Monitor console and user session

**Expected Results:**
- [ ] Token validation fails
- [ ] User logged out
- [ ] Redirect to login page
- [ ] Console error about invalid token
- [ ] Session storage cleared

**Actual Results:**
- [ ] ✅ PASS
- [ ] ❌ FAIL

**Notes:**
_________________________________________________________

---

## Test 4: Route Protection

### Test 4.1: Unauthorized Role Access

**Objective:** Verify that users cannot access routes for other roles.

**Test Cases:**

#### 4.1.1: Tenant → Admin Route
- [ ] Log in as Tenant
- [ ] Navigate to `/admin/overview`
- [ ] Verify redirect to fallback
- [ ] Verify console warning
- [ ] Result: [ ] ✅ PASS [ ] ❌ FAIL

#### 4.1.2: Artisan → Landlord Route
- [ ] Log in as Artisan
- [ ] Navigate to `/landlord/properties`
- [ ] Verify redirect
- [ ] Result: [ ] ✅ PASS [ ] ❌ FAIL

#### 4.1.3: Admin → Super Admin Route
- [ ] Log in as Admin
- [ ] Navigate to `/super-admin/users`
- [ ] Verify redirect
- [ ] Result: [ ] ✅ PASS [ ] ❌ FAIL

**Notes:**
_________________________________________________________

---

### Test 4.2: Role Tampering in localStorage

**Objective:** Verify that role tampering is caught by backend.

**Steps:**
1. Log in as Tenant
2. Manually change role in localStorage to "admin"
3. Navigate to `/admin/overview`
4. Try to perform admin action (e.g., approve user)
5. Monitor network requests

**Expected Results:**
- [ ] Frontend allows navigation
- [ ] Backend API returns 403 Forbidden
- [ ] Admin action fails
- [ ] Toast message about permission
- [ ] User cannot perform admin actions

**Actual Results:**
- [ ] ✅ PASS
- [ ] ❌ FAIL

**Notes:**
_________________________________________________________

---

## Test 5: API Security

### Test 5.1: Missing Authorization Header

**Objective:** Verify that missing tokens trigger 401.

**Steps:**
1. Clear all tokens from localStorage
2. Try to access protected API endpoint
3. Monitor network requests

**Expected Results:**
- [ ] Request made without Authorization header
- [ ] Backend returns 401 Unauthorized
- [ ] User redirected to login page
- [ ] Toast message about authentication

**Actual Results:**
- [ ] ✅ PASS
- [ ] ❌ FAIL

**Notes:**
_________________________________________________________

---

### Test 5.2: Invalid Token Format

**Objective:** Verify that invalid tokens are rejected.

**Steps:**
1. Log in as any user
2. Manually corrupt token in localStorage
3. Trigger API call
4. Monitor network requests

**Expected Results:**
- [ ] Request made with corrupted token
- [ ] Backend returns 401 Unauthorized
- [ ] Refresh attempt made (if refresh token valid)
- [ ] If refresh fails, user logged out

**Actual Results:**
- [ ] ✅ PASS
- [ ] ❌ FAIL

**Notes:**
_________________________________________________________

---

### Test 5.3: Unauthorized Role (403)

**Objective:** Verify that role-based API restrictions work.

**Steps:**
1. Log in as Tenant
2. Try to access Admin-only endpoint (e.g., `/admin/users/pending/`)
3. Monitor network requests

**Expected Results:**
- [ ] Request made with valid token
- [ ] Backend returns 403 Forbidden
- [ ] Toast message about permission
- [ ] User cannot access admin data

**Actual Results:**
- [ ] ✅ PASS
- [ ] ❌ FAIL

**Notes:**
_________________________________________________________

---

### Test 5.4: Error Handling (404, 500)

**Objective:** Verify graceful error handling.

#### Test 5.4.1: 404 Error
- [ ] Try to access non-existent resource (e.g., `/properties/999999/`)
- [ ] Verify user-friendly error message
- [ ] Verify no application crash
- [ ] Result: [ ] ✅ PASS [ ] ❌ FAIL

#### Test 5.4.2: 500 Error
- [ ] Simulate server error (if possible)
- [ ] Verify user-friendly error message
- [ ] Verify no application crash
- [ ] Verify error logged to console
- [ ] Result: [ ] ✅ PASS [ ] ❌ FAIL

**Notes:**
_________________________________________________________

---

## Test 6: URL Parameter Validation

### Test 6.1: Valid ID Parameters

**Objective:** Verify that valid IDs pass validation.

#### Test 6.1.1: Valid Numeric ID
- [ ] Log in as Admin
- [ ] Navigate to `/admin/approvals/user/123`
- [ ] Verify ID validated successfully
- [ ] Verify user details loaded
- [ ] Verify no console warnings
- [ ] Result: [ ] ✅ PASS [ ] ❌ FAIL

#### Test 6.1.2: Valid UUID
- [ ] Navigate to `/admin/approvals/user/550e8400-e29b-41d4-a716-446655440000`
- [ ] Verify UUID validated successfully
- [ ] Verify user details loaded
- [ ] Result: [ ] ✅ PASS [ ] ❌ FAIL

**Notes:**
_________________________________________________________

---

### Test 6.2: Invalid ID Parameters

**Objective:** Verify that invalid IDs are rejected.

#### Test 6.2.1: Invalid ID Format
- [ ] Navigate to `/admin/approvals/user/abc`
- [ ] Verify ID validation fails
- [ ] Verify console warning
- [ ] Verify redirect to `/admin/approvals`
- [ ] Verify toast message
- [ ] Verify no API call made
- [ ] Result: [ ] ✅ PASS [ ] ❌ FAIL

#### Test 6.2.2: SQL Injection Attempt
- [ ] Navigate to `/admin/approvals/user/1' OR '1'='1`
- [ ] Verify validation fails
- [ ] Verify SQL injection blocked
- [ ] Verify no API call made
- [ ] Result: [ ] ✅ PASS [ ] ❌ FAIL

#### Test 6.2.3: XSS Attempt
- [ ] Navigate to `/admin/approvals/user/<script>alert(1)</script>`
- [ ] Verify validation fails
- [ ] Verify XSS attempt blocked
- [ ] Verify no script execution
- [ ] Result: [ ] ✅ PASS [ ] ❌ FAIL

**Notes:**
_________________________________________________________

---

## Test Results Summary

### Overall Status

**Total Tests:** 18  
**Passed:** _____  
**Failed:** _____  
**Not Tested:** _____

### Test Categories

| Category | Total | Passed | Failed | Status |
|----------|-------|--------|--------|--------|
| XSS Protection | 3 | _____ | _____ | [ ] ✅ [ ] ❌ |
| Token Refresh | 4 | _____ | _____ | [ ] ✅ [ ] ❌ |
| Token Expiration | 3 | _____ | _____ | [ ] ✅ [ ] ❌ |
| Route Protection | 2 | _____ | _____ | [ ] ✅ [ ] ❌ |
| API Security | 4 | _____ | _____ | [ ] ✅ [ ] ❌ |
| URL Validation | 2 | _____ | _____ | [ ] ✅ [ ] ❌ |

---

## Issues Found

### Critical Issues
1. _________________________________________________________
2. _________________________________________________________
3. _________________________________________________________

### Medium Issues
1. _________________________________________________________
2. _________________________________________________________

### Low Issues
1. _________________________________________________________
2. _________________________________________________________

---

## Test Environment Details

**Browser:** _______________  
**Browser Version:** _______________  
**OS:** _______________  
**Backend URL:** _______________  
**Frontend URL:** _______________  
**Test Date:** _______________  
**Test Duration:** _______________

---

## Sign-Off

### Tester
- **Name:** _______________
- **Date:** _______________
- **Signature:** _______________

### Review
- **Reviewed By:** _______________
- **Date:** _______________
- **Status:** [ ] Approved [ ] Needs Rework

---

## Notes

**Additional Observations:**
_________________________________________________________
_________________________________________________________
_________________________________________________________

**Recommendations:**
_________________________________________________________
_________________________________________________________
_________________________________________________________

---

**End of Test Execution Worksheet**

*Complete this worksheet during security testing and attach to project documentation.*
