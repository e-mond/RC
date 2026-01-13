/**
 * Security Test Helper Script
 * 
 * This script provides helper functions for security testing.
 * Run in browser console during manual testing.
 * 
 * Usage:
 * 1. Open browser console
 * 2. Copy and paste functions as needed
 * 3. Execute tests manually
 */

// ============================================
// Token Management Helpers
// ============================================

/**
 * Get current access token
 */
function getAccessToken() {
  return localStorage.getItem('token') || sessionStorage.getItem('token');
}

/**
 * Get current refresh token
 */
function getRefreshToken() {
  return localStorage.getItem('refreshToken') || sessionStorage.getItem('refreshToken');
}

/**
 * Expire access token manually (for testing)
 */
function expireAccessToken() {
  const token = getAccessToken();
  if (!token) {
    console.error('No access token found');
    return;
  }
  
  try {
    const parts = token.split('.');
    if (parts.length !== 3) {
      console.error('Invalid token format');
      return;
    }
    
    // Decode payload
    const payload = JSON.parse(atob(parts[1].replace(/-/g, '+').replace(/_/g, '/')));
    
    // Set expiration to past
    payload.exp = Math.floor(Date.now() / 1000) - 3600; // 1 hour ago
    
    // Re-encode (note: this won't work with signed tokens, but useful for testing)
    const newPayload = btoa(JSON.stringify(payload).replace(/\+/g, '-').replace(/\//g, '_'));
    const expiredToken = `${parts[0]}.${newPayload}.${parts[2]}`;
    
    localStorage.setItem('token', expiredToken);
    console.log('✅ Access token expired (for testing)');
    console.log('Token expiration set to:', new Date(payload.exp * 1000));
  } catch (error) {
    console.error('Error expiring token:', error);
  }
}

/**
 * Expire refresh token manually (for testing)
 */
function expireRefreshToken() {
  const token = getRefreshToken();
  if (!token) {
    console.error('No refresh token found');
    return;
  }
  
  try {
    const parts = token.split('.');
    if (parts.length !== 3) {
      console.error('Invalid token format');
      return;
    }
    
    const payload = JSON.parse(atob(parts[1].replace(/-/g, '+').replace(/_/g, '/')));
    payload.exp = Math.floor(Date.now() / 1000) - 3600;
    
    const newPayload = btoa(JSON.stringify(payload).replace(/\+/g, '-').replace(/\//g, '_'));
    const expiredToken = `${parts[0]}.${newPayload}.${parts[2]}`;
    
    localStorage.setItem('refreshToken', expiredToken);
    console.log('✅ Refresh token expired (for testing)');
  } catch (error) {
    console.error('Error expiring refresh token:', error);
  }
}

/**
 * Corrupt token (for testing invalid token format)
 */
function corruptToken() {
  const token = getAccessToken();
  if (!token) {
    console.error('No access token found');
    return;
  }
  
  // Remove a character to corrupt the token
  const corrupted = token.slice(0, -5) + 'XXXXX';
  localStorage.setItem('token', corrupted);
  console.log('✅ Token corrupted (for testing)');
}

/**
 * Clear all tokens
 */
function clearAllTokens() {
  localStorage.removeItem('token');
  localStorage.removeItem('refreshToken');
  sessionStorage.removeItem('token');
  sessionStorage.removeItem('refreshToken');
  console.log('✅ All tokens cleared');
}

/**
 * Check token expiration status
 */
function checkTokenStatus() {
  const token = getAccessToken();
  if (!token) {
    console.log('❌ No access token found');
    return;
  }
  
  try {
    const parts = token.split('.');
    if (parts.length !== 3) {
      console.log('❌ Invalid token format');
      return;
    }
    
    const payload = JSON.parse(atob(parts[1].replace(/-/g, '+').replace(/_/g, '/')));
    const now = Math.floor(Date.now() / 1000);
    const exp = payload.exp;
    
    console.log('Token Status:');
    console.log('  Expiration:', new Date(exp * 1000).toLocaleString());
    console.log('  Current Time:', new Date(now * 1000).toLocaleString());
    console.log('  Expired:', exp < now ? '❌ YES' : '✅ NO');
    console.log('  Time Remaining:', exp < now ? 'Expired' : `${Math.floor((exp - now) / 60)} minutes`);
    console.log('  User ID:', payload.user_id || payload.sub || 'N/A');
    console.log('  Role:', payload.role || 'N/A');
  } catch (error) {
    console.error('Error checking token:', error);
  }
}

// ============================================
// XSS Testing Helpers
// ============================================

/**
 * Test XSS payload in blog post
 * Copy this HTML to a blog post in backend/admin panel
 */
const XSS_TEST_PAYLOAD = `
<script>alert('XSS Attack')</script>
<p>Normal content here</p>
<img src=x onerror=alert(1)>
<iframe src="https://evil.com"></iframe>
<p>More normal content</p>
`;

/**
 * Check if DOMPurify is loaded
 */
function checkDOMPurify() {
  if (typeof window.DOMPurify !== 'undefined') {
    console.log('✅ DOMPurify is loaded');
    return true;
  } else {
    console.log('❌ DOMPurify is NOT loaded');
    console.log('Check if package is installed: npm list dompurify');
    return false;
  }
}

/**
 * Test sanitization function
 */
function testSanitization(html) {
  if (!checkDOMPurify()) {
    return;
  }
  
  try {
    const { sanitizeHtml } = require('@/utils/sanitize');
    const sanitized = sanitizeHtml(html);
    console.log('Original HTML:', html);
    console.log('Sanitized HTML:', sanitized);
    console.log('Scripts removed:', !sanitized.includes('<script>') ? '✅ YES' : '❌ NO');
    return sanitized;
  } catch (error) {
    console.error('Error testing sanitization:', error);
  }
}

// ============================================
// URL Parameter Testing Helpers
// ============================================

/**
 * Test URL parameter validation
 */
function testURLValidation(id) {
  console.log('Testing URL parameter:', id);
  
  // Test numeric ID
  const numericRegex = /^\d+$/;
  if (numericRegex.test(id)) {
    console.log('✅ Valid numeric ID');
    return true;
  }
  
  // Test UUID
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  if (uuidRegex.test(id)) {
    console.log('✅ Valid UUID');
    return true;
  }
  
  console.log('❌ Invalid ID format');
  return false;
}

// ============================================
// Network Monitoring Helpers
// ============================================

/**
 * Monitor API requests (run in console before making requests)
 */
function monitorAPIRequests() {
  const originalFetch = window.fetch;
  const requests = [];
  
  window.fetch = function(...args) {
    const url = args[0];
    const options = args[1] || {};
    
    requests.push({
      url,
      method: options.method || 'GET',
      headers: options.headers || {},
      timestamp: new Date().toISOString()
    });
    
    console.log('📡 API Request:', {
      method: options.method || 'GET',
      url,
      hasAuth: !!options.headers?.Authorization,
      timestamp: new Date().toLocaleTimeString()
    });
    
    return originalFetch.apply(this, args).then(response => {
      console.log('📥 API Response:', {
        url,
        status: response.status,
        statusText: response.statusText,
        timestamp: new Date().toLocaleTimeString()
      });
      return response;
    });
  };
  
  console.log('✅ API request monitoring enabled');
  console.log('To view all requests:', 'console.log(requests)');
  
  return requests;
}

// ============================================
// Role Testing Helpers
// ============================================

/**
 * Get current user role
 */
function getCurrentRole() {
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  return user.role || 'unknown';
}

/**
 * Tamper with role (for testing)
 */
function tamperRole(newRole) {
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  user.role = newRole;
  localStorage.setItem('user', JSON.stringify(user));
  console.log(`✅ Role tampered to: ${newRole} (for testing)`);
  console.log('⚠️ This should be caught by backend on API calls');
}

/**
 * Check current user info
 */
function checkUserInfo() {
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  console.log('Current User Info:');
  console.log('  ID:', user.id || 'N/A');
  console.log('  Name:', user.name || user.fullName || 'N/A');
  console.log('  Email:', user.email || 'N/A');
  console.log('  Role:', user.role || 'N/A');
  console.log('  Subscription:', user.subscription || 'N/A');
}

// ============================================
// Test Execution Helpers
// ============================================

/**
 * Run all token status checks
 */
function runTokenChecks() {
  console.log('=== Token Status Check ===');
  checkTokenStatus();
  console.log('\n=== User Info ===');
  checkUserInfo();
  console.log('\n=== DOMPurify Check ===');
  checkDOMPurify();
}

/**
 * Reset test environment
 */
function resetTestEnvironment() {
  console.log('Resetting test environment...');
  clearAllTokens();
  console.log('✅ Test environment reset');
  console.log('⚠️ You will need to log in again');
}

// ============================================
// Export for use
// ============================================

console.log(`
╔══════════════════════════════════════════════════════════╗
║         Security Test Helper Functions Loaded            ║
╚══════════════════════════════════════════════════════════╝

Available Functions:
  Token Management:
    - getAccessToken()
    - getRefreshToken()
    - expireAccessToken()
    - expireRefreshToken()
    - corruptToken()
    - clearAllTokens()
    - checkTokenStatus()

  XSS Testing:
    - checkDOMPurify()
    - testSanitization(html)
    - XSS_TEST_PAYLOAD (constant)

  URL Validation:
    - testURLValidation(id)

  Network Monitoring:
    - monitorAPIRequests()

  Role Testing:
    - getCurrentRole()
    - tamperRole(newRole)
    - checkUserInfo()

  Utilities:
    - runTokenChecks()
    - resetTestEnvironment()

Example Usage:
  runTokenChecks()           // Check all token/user status
  expireAccessToken()        // Expire token for testing
  monitorAPIRequests()       // Monitor API calls
  testURLValidation('123')  // Test URL validation
`);
