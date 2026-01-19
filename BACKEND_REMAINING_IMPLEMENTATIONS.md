# Backend Remaining Implementations - Quick Reference

**Date:** January 2026  
**Status:** Active Tracking  
**Purpose:** Quick reference list of backend implementations still needed

**See Also:**
- `BACKEND_PROPERTY_API_IMPLEMENTATION.md` - Complete property API specifications
- `PROPERTY_STATUS_FLOW_DOCUMENTATION.md` - Property status workflow details

---

## ✅ Completed by Backend Team

### Email System
- ✅ Logo styling (circular, 80px, teal border)
- ✅ 16 email templates (12 original + 4 login activity)
- ✅ Login activity email notifications (successful, failed, new device, suspicious)
- ✅ Email sending infrastructure

### Login Activity Tracking
- ✅ Login tracking utilities
- ✅ Device fingerprinting
- ✅ IP address extraction
- ✅ Location geolocation
- ✅ Suspicious activity detection
- ✅ Login notification emails

### In-App Login Activity Notifications
- ✅ `login_success` notification type (optional, rate-limited)
- ✅ `login_new_device` notification type
- ✅ `login_suspicious` notification type
- ✅ Notification creation with metadata (IP, device, location)
- ✅ Action URLs to security settings

---

## ⚠️ Backend Still Needs to Implement

### 1. Property Management

#### Property Approval/Rejection Notifications
**Status:** ⚠️ Needs Implementation

**Required:**
- ✅ In-app notification: `property_approved` (when property approved)
- ✅ In-app notification: `property_rejected` (when property rejected)
- ⚠️ **Email notification:** Property approval email (using `generatePropertyApprovalEmail`)
- ⚠️ **Email notification:** Property rejection email (using `generatePropertyRejectionEmail`)

**When to Create:**
- Property approved by admin → `property_approved` notification + email
- Property rejected by admin → `property_rejected` notification + email

**Backend Implementation:**
```python
# When property is approved
Notification.objects.create(
    user=property.landlord,
    notification_type='property_approved',
    title='Property Approved!',
    message=f'Your property "{property.title}" has been approved and is now live.',
    action_url=f'/properties/{property.id}',
)

# Send email
send_property_approval_email(property.landlord, {
    'propertyTitle': property.title,
    'propertyId': property.id,
})
```

**Email Templates Available:**
- `generatePropertyApprovalEmail()` - Frontend ready
- `generatePropertyRejectionEmail()` - Frontend ready

---

### 2. Booking/Viewing Request Notifications

#### Viewing Request Notifications
**Status:** ⚠️ Needs Implementation

**Required:**
- ✅ In-app notification: `booking_created` (to landlord when viewing requested)
- ✅ In-app notification: `viewing_scheduled` (to tenant when viewing confirmed)
- ✅ In-app notification: `booking_rejected` (to tenant when viewing rejected)
- ⚠️ **Email notification:** Viewing request email (to landlord)
- ⚠️ **Email notification:** Viewing confirmed email (to tenant)
- ⚠️ **Email notification:** Viewing rejected email (to tenant)

**When to Create:**
- Tenant requests viewing → `booking_created` notification (to landlord) + email
- Landlord confirms viewing → `viewing_scheduled` notification (to tenant) + email
- Landlord rejects viewing → `booking_rejected` notification (to tenant) + email

**Backend Implementation:**
```python
# When viewing request is created
Notification.objects.create(
    user=property.landlord,
    notification_type='booking_created',
    title='New Viewing Request',
    message=f'{tenant.name} requested a viewing for "{property.title}"',
    action_url=f'/landlord/bookings/{request.id}',
)

# Send email to landlord
send_viewing_request_email(property.landlord, {
    'tenantName': tenant.name,
    'propertyTitle': property.title,
    'requestDate': request.requested_date,
    'requestId': request.id,
})
```

**Email Templates Available:**
- `generateViewingRequestEmail()` - Frontend ready
- `generateBookingConfirmationEmail()` - Frontend ready (for confirmed viewings)

---

### 3. Payment Notifications

#### Payment/Wallet Notifications
**Status:** ⚠️ Needs Implementation

**Required:**
- ✅ In-app notification: `wallet_topup` (when wallet topped up)
- ⚠️ **Email notification:** Payment confirmation email (using `generatePaymentConfirmationEmail`)

**When to Create:**
- Wallet top-up successful → `wallet_topup` notification + email
- Payment received → `payment_received` notification + email
- Payment failed → `payment_failed` notification + email

**Backend Implementation:**
```python
# When payment is successful
Notification.objects.create(
    user=user,
    notification_type='wallet_topup',
    title='Wallet Top-Up Successful',
    message=f'Your wallet has been topped up with {amount}.',
    action_url='/profile/wallet',
)

# Send email
send_payment_confirmation_email(user, {
    'amount': amount,
    'transactionId': transaction_id,
})
```

**Email Templates Available:**
- `generatePaymentConfirmationEmail()` - Frontend ready

---

### 4. Maintenance Notifications

#### Maintenance Request Notifications
**Status:** ⚠️ Needs Implementation

**Required:**
- ✅ In-app notification: `maintenance_requested` (to landlord)
- ✅ In-app notification: `maintenance_completed` (to tenant)
- ⚠️ **Email notification:** Maintenance request email (to landlord)
- ⚠️ **Email notification:** Maintenance completed email (to tenant)

**When to Create:**
- Tenant creates maintenance request → `maintenance_requested` notification (to landlord) + email
- Maintenance completed → `maintenance_completed` notification (to tenant) + email

**Backend Implementation:**
```python
# When maintenance request is created
Notification.objects.create(
    user=property.landlord,
    notification_type='maintenance_requested',
    title='New Maintenance Request',
    message=f'Maintenance request for "{property.title}"',
    action_url=f'/landlord/maintenance/{request.id}',
)

# Send email to landlord
# (Email template needed - not yet in frontend templates)
```

**Email Templates Available:**
- ⚠️ Maintenance email templates not yet created (can be added to frontend)

---

### 5. Message Notifications

#### New Message Notifications
**Status:** ⚠️ Needs Implementation

**Required:**
- ⚠️ In-app notification: `message` or `new_message` (when new message received)
- ⚠️ **Email notification:** New message email (using `generateNewMessageEmail`)

**When to Create:**
- New message received → `new_message` notification + email

**Backend Implementation:**
```python
# When new message is received
Notification.objects.create(
    user=recipient,
    notification_type='new_message',
    title='New Message',
    message=f'New message from {sender.name}',
    action_url=f'/messages?conversation={conversation.id}',
)

# Send email
send_new_message_email(recipient, {
    'senderName': sender.name,
    'messagePreview': message.text[:100],
    'conversationId': conversation.id,
})
```

**Email Templates Available:**
- `generateNewMessageEmail()` - Frontend ready

---

### 6. Account Management Notifications

#### Account Status Notifications
**Status:** ⚠️ Partial Implementation

**Required:**
- ✅ In-app notification: `account_pending` (on signup)
- ✅ In-app notification: `account_approved` (on approval)
- ✅ In-app notification: `account_rejected` (on rejection)
- ✅ In-app notification: `account_suspended` (on suspension)
- ✅ In-app notification: `welcome` (on first login after approval)
- ✅ **Email notification:** Account approval email (using `generateAccountApprovalEmail`)
- ✅ **Email notification:** Account rejection email (using `generateAccountRejectionEmail`)
- ✅ **Email notification:** Account suspension email (using `generateAccountSuspensionEmail`)
- ✅ **Email notification:** Welcome email (using `generateWelcomeEmail`)

**Status:** ✅ Most implemented, verify all are working

---

### 7. Login Activity Notifications

#### Login Notifications (In-App)
**Status:** ✅ **COMPLETE** (Backend Team - January 2026)

**Completed:**
- ✅ **Email notification:** Successful login email
- ✅ **Email notification:** Failed login email
- ✅ **Email notification:** New device login email
- ✅ **Email notification:** Suspicious login email
- ✅ **In-app notification:** `login_success` (regular login, optional, rate-limited)
- ✅ **In-app notification:** `login_new_device` (new device)
- ✅ **In-app notification:** `login_suspicious` (suspicious activity)

**When to Create:**
- Successful login → `login_success` notification (optional, can be rate-limited)
- New device login → `login_new_device` notification
- Suspicious login → `login_suspicious` notification

**Backend Implementation:**
```python
# When login is successful (optional - can be rate-limited)
# Only create for new devices or suspicious activity
if is_new_device or is_suspicious:
    Notification.objects.create(
        user=user,
        notification_type='login_new_device' if is_new_device else 'login_suspicious',
        title='Login from New Device' if is_new_device else '🚨 Suspicious Login Detected',
        message=f'Login detected from {device} at {location}',
        action_url='/profile/security',
        metadata={
            'ip_address': ip_address,
            'device': device,
            'location': location,
        }
    )
```

**Note:** Regular successful logins may not need in-app notifications (only email). Focus on new device and suspicious activity.

---

### 8. Premium Upgrade Notifications

#### Premium Upgrade Notifications
**Status:** ⚠️ Needs Implementation

**Required:**
- ⚠️ In-app notification: `premium_upgrade` (when upgraded to premium)
- ⚠️ **Email notification:** Premium upgrade email (using `generatePremiumUpgradeEmail`)

**When to Create:**
- User upgrades to premium → `premium_upgrade` notification + email

**Backend Implementation:**
```python
# When user upgrades to premium
Notification.objects.create(
    user=user,
    notification_type='premium_upgrade',
    title='Welcome to Premium!',
    message=f'Your account has been upgraded to Premium {plan_type}.',
    action_url='/dashboard',
)

# Send email
send_premium_upgrade_email(user, {
    'planType': plan_type,
    'amount': amount,
    'features': premium_features,
})
```

**Email Templates Available:**
- `generatePremiumUpgradeEmail()` - Frontend ready

---

## 📋 Quick Implementation Checklist

### Property Management
- [ ] Property approval notification + email
- [ ] Property rejection notification + email

### Booking/Viewing
- [ ] Viewing request notification + email (to landlord)
- [ ] Viewing confirmed notification + email (to tenant)
- [ ] Viewing rejected notification + email (to tenant)

### Payments
- [ ] Payment confirmation notification + email
- [ ] Payment failed notification + email
- [ ] Wallet top-up notification + email

### Maintenance
- [ ] Maintenance request notification + email (to landlord)
- [ ] Maintenance completed notification + email (to tenant)

### Messages
- [ ] New message notification + email

### Login Activity
- [ ] Login success notification (optional, rate-limited)
- [ ] New device login notification
- [ ] Suspicious login notification

### Premium
- [ ] Premium upgrade notification + email

---

## 🔧 Backend Endpoints Still Needed

### 1. Delete User Endpoint ⚠️ CRITICAL
**Status:** ⚠️ **NOT IMPLEMENTED**

**Frontend Tries:**
- DELETE `/api/super-admin/users/{id}/`
- POST `/api/super-admin/users/{id}/delete/`
- PATCH `/api/super-admin/users/{id}/` (with `action: "delete"`)

**Backend Must Implement:** One of the above methods

**Priority:** 🔴 **HIGH** - User deletion feature not working

---

### 2. Property Approval Endpoints
**Status:** ⚠️ Needs Verification

**Required:**
- GET `/api/admin/properties/pending/` - List pending properties
- PATCH `/api/admin/properties/{id}/approve/` - Approve property
- PATCH `/api/admin/properties/{id}/reject/` - Reject property (with reason)

**Frontend Ready:** ✅ Yes

---

### 3. Premium Pricing Endpoints
**Status:** ⚠️ Needs Implementation

**Required:**
- GET `/api/super-admin/premium/pricing/` - Get current pricing
- PUT `/api/super-admin/premium/pricing/` - Update pricing

**Frontend Ready:** ✅ Yes

---

### 4. System Stats Endpoint
**Status:** ⚠️ Needs Implementation

**Required:**
- GET `/api/super-admin/system/stats/` - Get system statistics

**Frontend Ready:** ✅ Yes

---

### 5. Lease Preview Endpoint
**Status:** ⚠️ Needs Implementation

**Required:**
- GET `/api/leases/templates/preview/` - Preview customized lease

**Frontend Ready:** ✅ Yes

---

## 📧 Email Notifications Summary

### Email Templates Available (16 total)

**Account Management (6):**
1. ✅ Welcome Email
2. ✅ Password Reset Email
3. ✅ Account Approval Email
4. ✅ Account Rejection Email
5. ✅ Account Suspension Email
6. ✅ Premium Upgrade Email

**Activity & Notifications (6):**
7. ✅ Payment Confirmation Email
8. ✅ Booking Confirmation Email
9. ✅ New Message Email
10. ✅ Property Approval Email
11. ✅ Property Rejection Email
12. ✅ Viewing Request Email

**Login Activity (4):**
13. ✅ Successful Login Email
14. ✅ Failed Login Email
15. ✅ New Device Login Email
16. ✅ Suspicious Login Email

### Email Notifications Backend Should Send

**Property Events:**
- [ ] Property approved → Send `generatePropertyApprovalEmail()`
- [ ] Property rejected → Send `generatePropertyRejectionEmail()`

**Booking/Viewing Events:**
- [ ] Viewing requested → Send `generateViewingRequestEmail()` (to landlord)
- [ ] Viewing confirmed → Send `generateBookingConfirmationEmail()` (to tenant)

**Payment Events:**
- [ ] Payment successful → Send `generatePaymentConfirmationEmail()`

**Message Events:**
- [ ] New message received → Send `generateNewMessageEmail()`

**Premium Events:**
- [ ] Premium upgrade → Send `generatePremiumUpgradeEmail()`

---

## 🔔 In-App Notifications Summary

### Notification Types Backend Should Create

**Property (2):**
- [ ] `property_approved` - When property approved
- [ ] `property_rejected` - When property rejected

**Booking/Viewing (3):**
- [ ] `booking_created` - When viewing requested (to landlord)
- [ ] `viewing_scheduled` - When viewing confirmed (to tenant)
- [ ] `booking_rejected` - When viewing rejected (to tenant)

**Payment (3):**
- [ ] `wallet_topup` - When wallet topped up
- [ ] `payment_received` - When payment received
- [ ] `payment_failed` - When payment failed

**Maintenance (2):**
- [ ] `maintenance_requested` - When maintenance requested (to landlord)
- [ ] `maintenance_completed` - When maintenance completed (to tenant)

**Messages (1):**
- [ ] `new_message` - When new message received

**Login Activity (3):**
- [ ] `login_success` - Regular login (optional, rate-limited)
- [ ] `login_new_device` - New device login
- [ ] `login_suspicious` - Suspicious login

**Premium (1):**
- [ ] `premium_upgrade` - When upgraded to premium

**Account (5):**
- ✅ `account_pending` - On signup (implemented)
- ✅ `account_approved` - On approval (implemented)
- ✅ `account_rejected` - On rejection (implemented)
- ✅ `account_suspended` - On suspension (implemented)
- ✅ `welcome` - First login after approval (implemented)

---

## 📝 Implementation Priority

### 🔴 High Priority (Critical Features)
1. **Delete User Endpoint** - User deletion feature not working
2. **Property Approval/Rejection** - Notifications + emails
3. **Viewing Request** - Notifications + emails

### 🟡 Medium Priority (Important Features)
4. **Payment Notifications** - Wallet top-up, payment confirmations
5. **New Message Notifications** - Real-time messaging alerts
6. **Login Activity Notifications** - New device, suspicious activity

### 🟢 Low Priority (Nice to Have)
7. **Premium Upgrade Notifications** - Upgrade confirmations
8. **Maintenance Notifications** - Request/completion alerts
9. **Regular Login Notifications** - Can be rate-limited or optional

---

## 🎯 Quick Reference

### Email Templates to Use

**Property:**
- `generatePropertyApprovalEmail(user, { propertyTitle, propertyUrl })`
- `generatePropertyRejectionEmail(user, { propertyTitle, reason, supportUrl })`

**Booking/Viewing:**
- `generateViewingRequestEmail(user, { tenantName, propertyTitle, requestDate, viewRequestUrl })`
- `generateBookingConfirmationEmail(user, { propertyTitle, bookingDate, landlordName })`

**Payment:**
- `generatePaymentConfirmationEmail(user, { amount, transactionId })`

**Messages:**
- `generateNewMessageEmail(user, { senderName, messagePreview, conversationUrl })`

**Premium:**
- `generatePremiumUpgradeEmail(user, { planType, amount, features })`

**See:** `BACKEND_EMAIL_IMPLEMENTATION_GUIDE.md` for complete examples

---

## 📚 Related Documentation

- **`BACKEND_EMAIL_IMPLEMENTATION_GUIDE.md`** - Complete email implementation guide
- **`FRONTEND_BACKEND_NOTIFICATION_INTEGRATION_GUIDE.md`** - Notification system guide
- **`BACKEND_DEPENDENCY_CHANGES.md`** - Endpoint requirements
- **`EMAIL_TEMPLATES_GUIDE.md`** - Frontend email template usage

---

**Last Updated:** January 2026  
**Status:** Active Tracking  
**Next Review:** After backend implements remaining features
