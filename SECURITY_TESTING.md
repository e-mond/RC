# Security Testing Guide

**Date:** January 20, 2026  
**Status:** ⏳ **PENDING**

---

## Overview

This guide provides comprehensive instructions for testing all security fixes implemented in the RentalConnects frontend application.

---

## Quick Start

### Option 1: Manual Testing (Recommended)

1. **Open Test Worksheet:**
   - Use `SECURITY_TEST_EXECUTION_WORKSHEET.md`
   - Follow step-by-step instructions
   - Document results

2. **Load Test Helpers:**
   - Open browser console
   - Copy contents of `test-security.js`
   - Use helper functions for testing

3. **Execute Tests:**
   - Follow test cases in worksheet
   - Check each expected result
   - Document any failures

**Estimated Time:** 2-3 hours

---

### Option 2: Automated Unit Tests

```bash
# Run unit tests
npm test -- sanitize.test.js
npm test -- validateParams.test.js

# Run all tests
npm test
```

**Estimated Time:** 5-10 minutes

---

## Test Categories

### 1. XSS Protection Tests (3 tests)

**Test Cases:**
- Test 1.1: Blog Post XSS Protection
- Test 1.2: Lease Preview XSS Protection
- Test 1.3: HTML Entity Encoding

**Guide:** See detailed instructions in `SECURITY_TEST_EXECUTION_WORKSHEET.md`

---

### 2. Token Refresh Tests (4 tests)

**Test Cases:**
- Test 2.1: Automatic Token Refresh on 401
- Test 2.2: Expired Refresh Token
- Test 2.3: Concurrent 401 Requests
- Test 2.4: Refresh Token Timeout

**Guide:** See detailed instructions in `SECURITY_TEST_EXECUTION_WORKSHEET.md`

---

### 3. Token Expiration Tests (3 tests)

**Test Cases:**
- Test 3.1: Expired Token on Route Access
- Test 3.2: Periodic Token Validation
- Test 3.3: Invalid Token Format

**Guide:** See detailed instructions in `SECURITY_TEST_EXECUTION_WORKSHEET.md`

---

### 4. Route Protection Tests (2 tests)

**Test Cases:**
- Test 4.1: Unauthorized Role Access
- Test 4.2: Role Tampering in localStorage

**Guide:** See detailed instructions in `SECURITY_TEST_EXECUTION_WORKSHEET.md`

---

### 5. API Security Tests (4 tests)

**Test Cases:**
- Test 5.1: Missing Authorization Header
- Test 5.2: Invalid Token Format
- Test 5.3: Unauthorized Role (403)
- Test 5.4: Error Handling (404, 500)

**Guide:** See detailed instructions in `SECURITY_TEST_EXECUTION_WORKSHEET.md`

---

### 6. URL Parameter Validation Tests (2 tests)

**Test Cases:**
- Test 6.1: Valid ID Parameters
- Test 6.2: Invalid ID Parameters

**Guide:** See detailed instructions in `SECURITY_TEST_EXECUTION_WORKSHEET.md`

---

## Test Execution

### Prerequisites

- [ ] Backend API running and accessible
- [ ] Test user accounts for each role
- [ ] Browser developer tools enabled
- [ ] Network tab open for monitoring

### Execution Steps

1. **Review Test Worksheet:**
   - Open `SECURITY_TEST_EXECUTION_WORKSHEET.md`
   - Review all test cases
   - Understand expected results

2. **Execute Tests:**
   - Follow test cases in order
   - Document results (✅ PASS / ❌ FAIL)
   - Note any issues or observations

3. **Document Results:**
   - Complete test worksheet
   - Document any failures
   - Create issues for bugs found

---

## Test Helpers

### Browser Console Helpers

**File:** `test-security.js`

**Available Functions:**
- `runTokenChecks()` - Check all token/user status
- `expireAccessToken()` - Expire token for testing
- `expireRefreshToken()` - Expire refresh token
- `corruptToken()` - Corrupt token for testing
- `monitorAPIRequests()` - Monitor API calls
- `testURLValidation(id)` - Test URL validation
- `checkDOMPurify()` - Verify DOMPurify loaded
- `testSanitization(html)` - Test HTML sanitization

**Load Helpers:**
```javascript
// Copy contents of test-security.js into browser console
```

---

## Test Results Template

```markdown
## Security Test Results

**Date:** _______________
**Tester:** _______________
**Environment:** _______________

### Summary
- Total Tests: 18
- Passed: _____
- Failed: _____
- Not Tested: _____

### Results by Category
- XSS Protection: [ ] ✅ PASS [ ] ❌ FAIL
- Token Refresh: [ ] ✅ PASS [ ] ❌ FAIL
- Token Expiration: [ ] ✅ PASS [ ] ❌ FAIL
- Route Protection: [ ] ✅ PASS [ ] ❌ FAIL
- API Security: [ ] ✅ PASS [ ] ❌ FAIL
- URL Validation: [ ] ✅ PASS [ ] ❌ FAIL

### Issues Found
1. _________________________________________________________
2. _________________________________________________________

### Sign-Off
- [ ] All tests passed
- [ ] Ready for production
```

---

## Related Documentation

- **Test Worksheet:** `SECURITY_TEST_EXECUTION_WORKSHEET.md` - Detailed test cases
- **Automation Guide:** `SECURITY_TEST_AUTOMATION_GUIDE.md` - Automation instructions
- **Complete Guide:** `SECURITY_TESTING_COMPLETE_GUIDE.md` - Complete testing guide
- **Security Docs:** `docs/SECURITY.md` - Security documentation

---

**End of Security Testing Guide**
