# Login Activity Emails - Quick Reference

## 🎯 What Was Implemented

✅ **Logo Styling:** 80px × 80px circular with 3px teal border  
✅ **4 Email Templates:** Successful, Failed, New Device, Suspicious  
✅ **Login Tracking:** IP, device, location extraction  
✅ **Rate Limiting:** Prevents email spam  
✅ **Device Detection:** Tracks known devices  
✅ **Suspicious Activity Detection:** Multiple failed attempts, unusual patterns  

---

## 📧 Email Types

| Email Type | Subject | When Sent | Rate Limit |
|------------|---------|-----------|------------|
| **Successful Login** | "New Login Detected - RentalConnects" | After successful auth | 1/hour (unless new device) |
| **Failed Login** | "Failed Login Attempt - RentalConnects Security Alert" | Wrong password | 1/15 minutes |
| **New Device** | "Login from New Device - RentalConnects" | First login from device | Once per device |
| **Suspicious** | "🚨 Suspicious Login Activity - RentalConnects Security Alert" | ≥3 failed attempts, unusual patterns | 1/hour |

---

## ⚙️ Configuration

### Settings (`rc_backend/settings.py`)
```python
ENABLE_LOGIN_NOTIFICATIONS = True  # Enable/disable
LOGIN_NOTIFICATION_RATE_LIMIT = 15  # minutes
```

### Environment Variables (`.env`)
```bash
ENABLE_LOGIN_NOTIFICATIONS=True
LOGIN_NOTIFICATION_RATE_LIMIT=15
```

---

## 🔧 Key Functions

### Login Tracking (`accounts/login_tracking.py`)
```python
get_client_ip(request)              # Extract IP address
get_device_info(request)             # Parse device/browser/OS
get_location_from_ip(ip_address)     # Get location (optional)
generate_device_fingerprint(request) # Create device ID
check_rate_limit(user_id, type, minutes) # Rate limiting
detect_suspicious_activity(user, request, ip, location) # Detection
```

### Email Sending (`accounts/email_utils.py`)
```python
send_successful_login_email(user, login_data)
send_failed_login_email(user, login_data)      # Rate limited
send_new_device_login_email(user, login_data)
send_suspicious_login_email(user, login_data)  # Rate limited
```

### Email Templates (`accounts/email_templates.py`)
```python
generate_successful_login_email(user, login_data)
generate_failed_login_email(user, login_data)
generate_new_device_login_email(user, login_data)
generate_suspicious_login_email(user, login_data)
```

---

## 📝 Login Data Format

```python
login_data = {
    'loginTime': 'January 20, 2026 at 10:00 AM',  # Formatted time
    'ipAddress': '192.168.1.1',                   # IP address
    'device': 'Desktop (Windows) on Windows',     # Device + OS
    'location': 'Accra, Greater Accra, Ghana',   # Location (optional)
    'reason': 'Multiple failed login attempts'    # For suspicious emails
}
```

---

## 🚀 Usage

### Automatic (Already Integrated)
Login tracking is **automatically active** in `login_view()`. No code changes needed!

### Manual Usage
```python
from accounts.login_tracking import get_client_ip, get_device_info
from accounts.email_utils import send_successful_login_email

ip_address = get_client_ip(request)
device_info = get_device_info(request)

login_data = {
    'loginTime': timezone.now().strftime('%B %d, %Y at %I:%M %p'),
    'ipAddress': ip_address,
    'device': f"{device_info.get('device', 'Unknown Device')}",
    'location': get_location_from_ip(ip_address) or 'Unknown Location',
}

send_successful_login_email(user, login_data)
```

---

## 🎨 Logo Styling

All emails use:
- **Size:** 80px × 80px
- **Shape:** Circular (`border-radius: 50%`)
- **Border:** 3px solid teal (#0b6e4f)
- **CSS:** `width: 80px; height: 80px; border-radius: 50%; border: 3px solid #0b6e4f;`

---

## 🧪 Testing

### Test Successful Login
1. Login with valid credentials
2. Check email for "New Login Detected"

### Test Failed Login
1. Enter wrong password
2. Check email for "Failed Login Attempt"
3. Try again within 15 min → No email (rate limited)

### Test New Device
1. Login from new browser/device
2. Check email for "Login from New Device"
3. Login again from same device → No email (device known)

### Test Suspicious Activity
1. Enter wrong password 3+ times
2. Check email for "Suspicious Login Activity"

---

## 🐛 Troubleshooting

### Emails Not Sending?
```python
# Check settings
from django.conf import settings
print(settings.ENABLE_LOGIN_NOTIFICATIONS)  # Should be True
print(settings.EMAIL_HOST)                   # Should be configured
```

### Rate Limiting Issues?
```python
# Clear cache
from django.core.cache import cache
cache.clear()
```

### Check Logs
```bash
tail -f logs/django.log | grep -i "login\|email"
```

---

## 📚 Documentation

- **Full Guide:** `LOGIN_ACTIVITY_EMAILS_IMPLEMENTATION.md`
- **Backend Guide:** `BACKEND_EMAIL_IMPLEMENTATION_GUIDE.md`
- **Code:** `accounts/login_tracking.py`, `accounts/email_utils.py`

---

## ✅ Status

**Implementation:** ✅ Complete  
**Integration:** ✅ Active in login view  
**Testing:** ⚠️ Manual testing recommended  
**Production:** ✅ Ready (with testing)

---

**Quick Tip:** All login activity emails are automatically sent. Just ensure `ENABLE_LOGIN_NOTIFICATIONS=True` in settings!
