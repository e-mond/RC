# Frontend Testing Guide

**Date:** January 2026  
**Status:** Production-Ready  
**Purpose:** Comprehensive testing guide for RentalConnects frontend

---

## Overview

This guide covers all testing requirements for the RentalConnects frontend, including:
- Functional and integration testing
- Security-oriented testing
- Penetration and abuse awareness testing
- Responsiveness and mobile accessibility testing
- Map features verification

---

## 1. Functional & Integration Testing

### 1.1 Role-Based Flows

#### Tenant Flow
**Test Steps:**
1. Login as tenant
2. Browse properties (`/tenant/properties`)
3. View property details
4. Add to favorites
5. Request viewing
6. View rentals (`/tenant/rentals`)
7. View payments (`/tenant/payments`)
8. View maintenance requests (`/tenant/maintenance`) - Premium only
9. View wishlist (`/tenant/wishlist`)
10. View lease agreements (`/tenant/leases`)

**Expected Results:**
- All routes accessible
- No console errors
- Data loads correctly
- Actions work (favorite, viewing request)
- Premium features show upgrade prompt for free users

#### Landlord Flow
**Test Steps:**
1. Login as landlord
2. View dashboard (`/landlord`)
3. View properties (`/landlord/properties`)
4. Create new property (`/landlord/properties/new`)
5. Edit property (`/landlord/properties/:id/edit`)
6. View bookings (`/landlord/bookings`)
7. View analytics (`/landlord/analytics`) - Premium only
8. View wallet (`/landlord/wallet`) - Premium only
9. Manage ads (`/landlord/ads`) - Premium only

**Expected Results:**
- All routes accessible
- Property CRUD works
- Image uploads work (Cloudinary)
- Premium features gated correctly
- Upgrade prompts shown for free users

#### Artisan Flow
**Test Steps:**
1. Login as artisan
2. View dashboard (`/artisan`)
3. View tasks (`/artisan/tasks`)
4. View task details (`/artisan/tasks/:id`)
5. View earnings (`/artisan/earnings`)
6. View schedule (`/artisan/schedule`)
7. Manage ads (`/artisan/ads`) - Premium only

**Expected Results:**
- All routes accessible
- Task management works
- Earnings display correctly
- Premium features gated

#### Admin Flow
**Test Steps:**
1. Login as admin
2. View dashboard (`/admin`)
3. View user approvals (`/admin/approvals`)
4. Approve/reject user
5. View property approvals (`/admin/approvals/properties`)
6. Approve/reject property
7. View reports (`/admin/reports`)
8. View leases (`/admin/leases`)

**Expected Results:**
- All routes accessible
- Approval actions work
- Modals display correctly
- Error handling works

#### Super Admin Flow
**Test Steps:**
1. Login as super admin
2. View dashboard (`/super-admin`)
3. Manage users (`/super-admin/users`)
4. Create/delete user
5. Manage roles (`/super-admin/roles`)
6. View audit logs (`/super-admin/audit`)
7. Manage pricing (`/super-admin/pricing`)
8. Manage announcements (`/super-admin/announcements`)

**Expected Results:**
- All routes accessible
- User management works
- Role assignment works
- Audit logs display
- Pricing updates work

---

### 1.2 Property Flows

#### Property Listing
**Test Steps:**
1. Navigate to `/properties` (public)
2. Search properties
3. Filter by price, type, location
4. View property details
5. Navigate to landlord profile

**Expected Results:**
- Properties load correctly
- Search works
- Filters work
- No console errors
- Responsive on mobile

#### Property Creation (Landlord)
**Test Steps:**
1. Login as landlord
2. Navigate to `/landlord/properties/new`
3. Fill property form
4. Upload images
5. Select location on map
6. Submit form

**Expected Results:**
- Form validation works
- Image uploads work (Cloudinary)
- Map picker works
- Form submission works
- Success message shown

#### Property Approval (Admin)
**Test Steps:**
1. Login as admin
2. Navigate to `/admin/approvals/properties`
3. View pending properties
4. Approve property
5. Reject property (with reason)

**Expected Results:**
- Pending properties list loads
- Approval action works
- Rejection modal works
- Success/error toasts shown

---

### 1.3 User Profile Navigation

#### Public Profile
**Test Steps:**
1. Navigate to `/users/:id` (authenticated)
2. View user details
3. View user properties (if landlord)
4. View user reviews

**Expected Results:**
- Profile loads correctly
- All sections display
- No permission errors
- Responsive layout

#### Self Profile
**Test Steps:**
1. Navigate to `/profile`
2. Edit profile
3. Update preferences
4. Setup wallet (if applicable)

**Expected Results:**
- Profile loads correctly
- Edit form works
- Updates save correctly
- Wallet setup works

#### Admin Profile View
**Test Steps:**
1. Login as admin
2. Navigate to user profile via admin panel
3. View user details
4. View user properties
5. View user activity

**Expected Results:**
- Profile loads correctly
- Admin-specific data visible
- No permission errors

---

### 1.4 Wallet & Payment Flows

#### Wallet Setup
**Test Steps:**
1. Navigate to `/profile`
2. Click "Setup Wallet"
3. Choose bank account or mobile money
4. Fill wallet details
5. Submit

**Expected Results:**
- Wallet setup modal opens
- Form validation works
- Submission works
- Success message shown
- Wallet balance updates

#### Wallet Top-Up
**Test Steps:**
1. Navigate to wallet page
2. Click "Top Up"
3. Enter amount
4. Initiate payment (Paystack)
5. Complete payment

**Expected Results:**
- Top-up modal opens
- Payment flow works
- Payment verification works
- Balance updates
- Transaction history updates

---

### 1.5 Image Uploads

#### Cloudinary Upload
**Test Steps:**
1. Create/edit property
2. Upload property images
3. Verify images upload
4. Check Cloudinary URLs

**Expected Results:**
- Images upload successfully
- Cloudinary URLs generated
- Images display correctly
- No manual URL construction
- Error handling works

---

### 1.6 Error Handling

#### API Failure Handling
**Test Steps:**
1. Disconnect backend
2. Attempt API calls
3. Verify error messages
4. Check toast notifications

**Expected Results:**
- User-friendly error messages
- Toast notifications shown
- No silent failures
- Loading states handled
- Graceful degradation

---

## 2. Security-Oriented Frontend Testing

### 2.1 Unauthorized API Access

**Test Cases:**
1. **Direct API Call:**
   - Open browser console
   - Call API endpoint directly
   - Verify 401/403 response

2. **Token Manipulation:**
   - Modify token in localStorage
   - Attempt API call
   - Verify token refresh/logout

3. **Expired Token:**
   - Wait for token expiration
   - Attempt API call
   - Verify automatic logout

**Expected Results:**
- Backend validates all requests
- Frontend handles 401/403 correctly
- No unauthorized access possible

---

### 2.2 Route Protection

**Test Cases:**
1. **URL Manipulation:**
   - As tenant, navigate to `/landlord/properties`
   - Verify redirect to tenant dashboard

2. **Direct URL Access:**
   - Logout
   - Navigate to `/tenant/properties`
   - Verify redirect to login

3. **Role Escalation:**
   - As admin, navigate to `/super-admin/users`
   - Verify redirect to admin dashboard

**Expected Results:**
- Route guards work correctly
- Unauthorized access blocked
- Redirects work properly

---

### 2.3 State Manipulation

**Test Cases:**
1. **Role Manipulation:**
   - Modify user.role in localStorage
   - Navigate to restricted route
   - Verify backend validation

2. **Permission Manipulation:**
   - Modify user.permissions in state
   - Attempt admin action
   - Verify backend rejects

**Expected Results:**
- Backend validates all permissions
- Frontend state changes don't grant access
- Backend is source of truth

---

### 2.4 Data Rendering

**Test Cases:**
1. **Admin-Only Data:**
   - As tenant, check if admin data visible
   - Verify no admin data in responses

2. **Private Data:**
   - Check if private user data exposed
   - Verify sensitive data not logged

**Expected Results:**
- No admin data visible to non-admins
- No private data exposed
- Sensitive data not in console

---

## 3. Penetration & Abuse Awareness Testing

### 3.1 Invalid Actions

**Test Cases:**
1. **Submit Invalid Data:**
   - Submit form with invalid fields
   - Submit empty forms
   - Submit malformed JSON

**Expected Results:**
- Validation errors shown
- Form doesn't submit
- User-friendly error messages

---

### 3.2 Malformed Payloads

**Test Cases:**
1. **XSS Attempts:**
   - Submit `<script>alert('xss')</script>` in form
   - Verify sanitization

2. **SQL Injection Attempts:**
   - Submit SQL in form fields
   - Verify backend handles correctly

3. **Large Payloads:**
   - Submit very large data
   - Verify size limits

**Expected Results:**
- XSS attempts sanitized
- Malformed data rejected
- Size limits enforced

---

### 3.3 Token Handling

**Test Cases:**
1. **Expired Token:**
   - Use expired token
   - Verify refresh attempt
   - Verify logout if refresh fails

2. **Revoked Access:**
   - Revoke user access (backend)
   - Attempt API call
   - Verify 401 response

3. **Invalid Token:**
   - Use invalid token format
   - Verify error handling

**Expected Results:**
- Expired tokens handled
- Revoked access detected
- Invalid tokens rejected

---

### 3.4 Error Response Handling

**Test Cases:**
1. **401 Response:**
   - Trigger 401 error
   - Verify token refresh
   - Verify logout if refresh fails

2. **403 Response:**
   - Trigger 403 error
   - Verify permission error toast
   - Verify no data exposed

3. **404 Response:**
   - Trigger 404 error
   - Verify user-friendly message
   - Verify redirect if needed

**Expected Results:**
- All error codes handled
- User-friendly messages
- No sensitive data exposed

---

### 3.5 Console Logging

**Test Cases:**
1. **Production Build:**
   - Build production bundle
   - Check console for sensitive data
   - Verify no secrets logged

**Expected Results:**
- No sensitive data in console
- No API keys logged
- No tokens logged
- No user passwords logged

---

## 4. Responsiveness & Mobile Accessibility

### 4.1 Responsive Testing

#### Mobile (320px - 768px)
**Test Components:**
- Forms
- Modals
- Dashboards
- Tables
- Maps
- Upload components
- Toast notifications

**Expected Results:**
- No horizontal scrolling
- Touch targets ≥ 44px
- Text readable without zoom
- Forms usable
- Modals fit screen
- Tables scrollable

#### Tablet (768px - 1024px)
**Test Components:**
- All components
- Layout adjustments
- Navigation

**Expected Results:**
- Layout adapts correctly
- Navigation works
- All features accessible

#### Desktop (1024px+)
**Test Components:**
- All components
- Full layout
- Sidebar navigation

**Expected Results:**
- Full layout displayed
- Sidebar visible
- All features accessible

---

### 4.2 Touch Input

**Test Cases:**
1. **Touch Targets:**
   - Verify buttons ≥ 44px
   - Verify spacing between targets
   - Test on actual mobile device

2. **Gestures:**
   - Swipe navigation
   - Pinch zoom (maps)
   - Scroll behavior

**Expected Results:**
- All buttons tappable
- No accidental clicks
- Gestures work smoothly

---

### 4.3 Keyboard Navigation

**Test Cases:**
1. **Tab Navigation:**
   - Tab through all interactive elements
   - Verify focus indicators
   - Verify tab order

2. **Keyboard Shortcuts:**
   - Enter to submit forms
   - Escape to close modals
   - Arrow keys in dropdowns

**Expected Results:**
- All elements keyboard accessible
- Focus indicators visible
- Keyboard shortcuts work

---

### 4.4 Screen Reader Support

**Test Cases:**
1. **ARIA Labels:**
   - Verify all interactive elements have labels
   - Verify form inputs have labels
   - Verify images have alt text

2. **Semantic HTML:**
   - Verify proper HTML structure
   - Verify headings hierarchy
   - Verify landmarks

**Expected Results:**
- Screen reader can navigate
- All content announced
- Forms accessible

---

## 5. Map Features Verification

### 5.1 Map View Support

#### Standard View (2D)
**Test Steps:**
1. Open map component
2. Verify standard view displays
3. Verify map controls work
4. Test on mobile

**Expected Results:**
- Standard view loads
- Map controls functional
- Mobile usable

#### Satellite View
**Test Steps:**
1. Open map component
2. Click view toggle
3. Verify satellite view displays
4. Test switching back

**Expected Results:**
- Satellite view loads
- Toggle works smoothly
- No errors

#### Street View
**Test Steps:**
1. Open EnhancedPropertyMapSearch
2. Toggle to street view
3. Verify street view displays

**Expected Results:**
- Street view loads
- Toggle works
- No errors

#### 3D View
**Status:** ⚠️ **NOT SUPPORTED**

**Reason:** OpenLayers (ol) doesn't natively support 3D views

**Current Implementation:**
- Maps support: 2D, Satellite, Street
- 3D view requires different library (Mapbox GL, Cesium)

**Recommendation:**
- Document limitation
- Consider migration to Mapbox GL for 3D support
- Or use Google Maps API for 3D view

**Test Steps:**
1. Verify 3D view not available
2. Document limitation
3. Verify fallback works

**Expected Results:**
- No 3D view option (expected)
- No errors from missing 3D
- Other views work correctly

---

### 5.2 Map Component Testing

#### EnhancedPropertyMapSearch
**Test Steps:**
1. View properties on map
2. Toggle between 2D, satellite, street
3. Click markers
4. Use GPS location
5. Test on mobile

**Expected Results:**
- All views work
- Markers clickable
- GPS works
- Mobile usable

#### PropertyMapView
**Test Steps:**
1. View property on map
2. Toggle between 2D and satellite
3. Click "Open in Google Maps"
4. Test on mobile

**Expected Results:**
- Map displays correctly
- Toggle works
- Google Maps link works
- Mobile usable

#### MapPicker
**Test Steps:**
1. Use in property form
2. Search address
3. Use GPS
4. Drag marker
5. Click to place marker

**Expected Results:**
- Address search works
- GPS works
- Marker draggable
- Click to place works

---

### 5.3 Map Mobile Usability

**Test Cases:**
1. **Touch Controls:**
   - Pan map with touch
   - Zoom with pinch
   - Tap markers

2. **Performance:**
   - Map loads quickly
   - Smooth panning
   - No lag

**Expected Results:**
- Touch controls work
- Performance acceptable
- No crashes

---

## 6. Testing Checklist

### Functional Testing
- [ ] All role-based flows work
- [ ] Property CRUD works
- [ ] User profile navigation works
- [ ] Wallet operations work
- [ ] Image uploads work
- [ ] Error handling works

### Security Testing
- [ ] Unauthorized API access blocked
- [ ] Route protection works
- [ ] State manipulation doesn't grant access
- [ ] No sensitive data exposed

### Penetration Testing
- [ ] Invalid actions handled
- [ ] Malformed payloads rejected
- [ ] Token handling works
- [ ] Error responses handled
- [ ] No sensitive data in console

### Responsiveness Testing
- [ ] Mobile layout works (320px+)
- [ ] Tablet layout works (768px+)
- [ ] Desktop layout works (1024px+)
- [ ] Touch input works
- [ ] Keyboard navigation works
- [ ] Screen reader support works

### Map Testing
- [ ] Standard view works
- [ ] Satellite view works
- [ ] Street view works (where available)
- [ ] 3D view limitation documented
- [ ] Mobile usability verified

---

## 7. Test Execution

### Manual Testing

**Tools:**
- Browser DevTools
- Responsive Design Mode
- Screen reader (NVDA/VoiceOver)
- Mobile device testing

**Process:**
1. Test each role flow
2. Test each feature
3. Test error scenarios
4. Test responsive layouts
5. Test accessibility

### Automated Testing

**Tools:**
- Vitest (unit tests)
- Testing Library (component tests)
- Playwright (E2E tests - future)

**Current Coverage:**
- Service functions
- Utility functions
- Component rendering
- Encryption functionality

---

## 8. Test Results Documentation

### Test Execution Log

**Date:** [Test Date]  
**Tester:** [Tester Name]  
**Environment:** [Mock/Real API]

**Results:**
- [ ] All functional tests passed
- [ ] All security tests passed
- [ ] All responsiveness tests passed
- [ ] All map tests passed
- [ ] Issues found: [List issues]

---

**Last Updated:** January 2026  
**Maintained By:** Frontend Team
