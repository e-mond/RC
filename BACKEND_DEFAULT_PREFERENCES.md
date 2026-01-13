# Backend Default User Preferences

**Date:** January 20, 2026  
**Status:** Required Implementation

---

## Overview

When a user signs up for the first time, the backend **MUST** create default user preferences with all notifications enabled by default. This ensures users receive welcome notifications, messages, emails, and announcements from the system.

---

## Default Preferences Schema

### Required Fields

All new users should have these default preferences created automatically during signup:

```json
{
  "emailNotifications": true,           // REQUIRED: Enabled by default
  "smsNotifications": true,             // REQUIRED: Enabled by default
  "messageNotifications": true,         // REQUIRED: Enabled by default
  "announcementNotifications": true,    // REQUIRED: Enabled by default
  "marketingEmails": true,              // REQUIRED: Enabled by default
  "twoFactorAuth": false,               // Disabled by default (user can enable)
  "profileVisibility": "public",        // Public by default
  "dataSharing": false,                 // Disabled by default
  "language": "en"                      // English by default
}
```

---

## Backend Implementation Requirements

### 1. User Preferences Model

**Django Model Example:**
```python
class UserPreferences(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='preferences')
    
    # Notification preferences (all enabled by default)
    email_notifications = models.BooleanField(default=True)
    sms_notifications = models.BooleanField(default=True)
    message_notifications = models.BooleanField(default=True)
    announcement_notifications = models.BooleanField(default=True)
    marketing_emails = models.BooleanField(default=True)
    
    # Security preferences
    two_factor_auth = models.BooleanField(default=False)
    
    # Privacy preferences
    profile_visibility = models.CharField(
        max_length=20,
        choices=[('public', 'Public'), ('private', 'Private'), ('friends_only', 'Friends Only')],
        default='public'
    )
    data_sharing = models.BooleanField(default=False)
    
    # Localization
    language = models.CharField(max_length=10, default='en')
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'user_preferences'
        verbose_name = 'User Preferences'
        verbose_name_plural = 'User Preferences'
```

### 2. Signup Signal Handler

**Django Signal Example:**
```python
from django.db.models.signals import post_save
from django.dispatch import receiver
from .models import User, UserPreferences

@receiver(post_save, sender=User)
def create_user_preferences(sender, instance, created, **kwargs):
    """
    Automatically create default preferences when a new user is created.
    All notifications are enabled by default.
    """
    if created:
        UserPreferences.objects.create(
            user=instance,
            email_notifications=True,
            sms_notifications=True,
            message_notifications=True,
            announcement_notifications=True,
            marketing_emails=True,
            two_factor_auth=False,
            profile_visibility='public',
            data_sharing=False,
            language='en'
        )
```

### 3. Signup Serializer

**Django REST Framework Serializer Example:**
```python
class UserSignupSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['email', 'password', 'full_name', 'phone', 'role']
    
    def create(self, validated_data):
        user = User.objects.create_user(**validated_data)
        # Preferences are created automatically via signal
        # But we can also create them explicitly here if needed
        return user
```

### 4. Preferences API Endpoint

**Endpoint:** `GET /api/auth/preferences/`

**Response Format:**
```json
{
  "emailNotifications": true,
  "smsNotifications": true,
  "messageNotifications": true,
  "announcementNotifications": true,
  "marketingEmails": true,
  "twoFactorAuth": false,
  "profileVisibility": "public",
  "dataSharing": false,
  "language": "en"
}
```

**Behavior:**
- If preferences don't exist (404), backend should create them with defaults
- Return defaults if user preferences not found
- Use camelCase in JSON response (frontend expects camelCase)

---

## Frontend Expectations

### Default Behavior

1. **On Signup:**
   - Backend creates preferences with all notifications enabled
   - Frontend receives preferences in user object or via separate API call

2. **On Login:**
   - Frontend fetches preferences from `/api/auth/preferences/`
   - If 404, frontend uses defaults (but backend should always create them)

3. **On First Load:**
   - If preferences API returns 404, frontend uses `DEFAULT_PREFERENCES`
   - Frontend gracefully handles connection errors

### Frontend Default Preferences

**File:** `src/services/preferencesService.js`

```javascript
export const DEFAULT_PREFERENCES = {
  emailNotifications: true,      // Enabled by default
  smsNotifications: true,         // Enabled by default
  messageNotifications: true,    // Enabled by default
  announcementNotifications: true, // Enabled by default
  marketingEmails: true,          // Enabled by default
  twoFactorAuth: false,           // Disabled by default
  profileVisibility: "public",    // Public by default
  dataSharing: false,            // Disabled by default
  language: "en"                  // English by default
};
```

---

## API Endpoints

### Get User Preferences

**Endpoint:** `GET /api/auth/preferences/`

**Authentication:** Required (Bearer token)

**Response (200):**
```json
{
  "emailNotifications": true,
  "smsNotifications": true,
  "messageNotifications": true,
  "announcementNotifications": true,
  "marketingEmails": true,
  "twoFactorAuth": false,
  "profileVisibility": "public",
  "dataSharing": false,
  "language": "en"
}
```

**Response (404):**
- Should not happen if preferences are created on signup
- Frontend will use defaults if 404 occurs

### Update User Preferences

**Endpoint:** `PATCH /api/auth/preferences/`

**Authentication:** Required (Bearer token)

**Request Body:**
```json
{
  "emailNotifications": false,
  "smsNotifications": true
}
```

**Response (200):**
```json
{
  "emailNotifications": false,
  "smsNotifications": true,
  "messageNotifications": true,
  "announcementNotifications": true,
  "marketingEmails": true,
  "twoFactorAuth": false,
  "profileVisibility": "public",
  "dataSharing": false,
  "language": "en"
}
```

---

## Testing Checklist

- [ ] New user signup creates preferences automatically
- [ ] All notification preferences are `true` by default
- [ ] Preferences API returns correct defaults for new users
- [ ] Preferences can be updated via PATCH endpoint
- [ ] Frontend receives preferences in camelCase format
- [ ] 404 handling works correctly (should not happen)

---

## Migration Script

If you need to create preferences for existing users:

```python
from django.core.management.base import BaseCommand
from accounts.models import User, UserPreferences

class Command(BaseCommand):
    help = 'Create default preferences for existing users'

    def handle(self, *args, **options):
        users_without_prefs = User.objects.filter(preferences__isnull=True)
        count = 0
        
        for user in users_without_prefs:
            UserPreferences.objects.create(
                user=user,
                email_notifications=True,
                sms_notifications=True,
                message_notifications=True,
                announcement_notifications=True,
                marketing_emails=True,
                two_factor_auth=False,
                profile_visibility='public',
                data_sharing=False,
                language='en'
            )
            count += 1
        
        self.stdout.write(
            self.style.SUCCESS(f'Created preferences for {count} users')
        )
```

---

## Summary

**Critical Requirements:**
1. ✅ All new users must have preferences created on signup
2. ✅ All notification preferences must be `true` by default
3. ✅ Preferences API must return camelCase field names
4. ✅ 404 should not occur (preferences always exist)

**Why This Matters:**
- Users expect to receive welcome notifications
- System announcements should reach all users by default
- Messages and emails should be enabled for communication
- Users can opt-out later if they choose

---

**End of Document**
