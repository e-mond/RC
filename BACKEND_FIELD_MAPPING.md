# Backend Field Mapping Reference

This document shows the exact field names the backend expects vs what the frontend sends.

## Tenant Signup

**Frontend Form Fields:**
- `fullName` → Backend expects: `full_name`
- `email` → Backend expects: `email` ✓
- `phone` → Backend expects: `phone` ✓
- `password` → Backend expects: `password` ✓
- `confirmPassword` → **NOT sent to backend** (frontend validation only)
- `idUpload` → Backend expects: `id_document`
- `location` → **NOT sent to backend** (frontend preference only)
- `rentRange` → **NOT sent to backend** (frontend preference only)
- `agree` → **NOT sent to backend** (frontend validation only)

**Backend Required Fields:**
- `email` (string, required, unique)
- `password` (string, required, min 8 chars)
- `full_name` (string, required)
- `phone` (string, required, Ghana format)

**Backend Optional Fields:**
- `id_document` (file, optional)
- `profile_picture` (file, optional)

---

## Landlord Signup

**Frontend Form Fields:**
- `fullName` → Backend expects: `full_name`
- `email` → Backend expects: `email` ✓
- `phone` → Backend expects: `phone` ✓
- `password` → Backend expects: `password` ✓
- `businessName` → Backend expects: `business_name`
- `businessType` → **NOT sent to backend** (frontend only)
- `idUpload` → Backend expects: `id_document`
- `businessRegistration` → Backend expects: `business_registration`

**Backend Required Fields:**
- `email` (string, required, unique)
- `password` (string, required)
- `full_name` (string, required)
- `phone` (string, required)

**Backend Optional Fields:**
- `business_name` (string, optional)
- `business_registration` (file, optional)
- `id_document` (file, optional)
- `profile_picture` (file, optional)

---

## Artisan Signup

**Frontend Form Fields:**
- `fullName` → Backend expects: `full_name`
- `email` → Backend expects: `email` ✓
- `phone` → Backend expects: `phone` ✓
- `password` → Backend expects: `password` ✓
- `profession` → Backend expects: `specialization`
- `experience` → Backend expects: `years_experience`
- `idUpload` → Backend expects: `id_document`
- `certifications` → Backend expects: `certifications` (array of files)

**Backend Required Fields:**
- `email` (string, required, unique)
- `password` (string, required)
- `full_name` (string, required)
- `phone` (string, required)
- `specialization` (string, required)

**Backend Optional Fields:**
- `years_experience` (integer, optional)
- `certifications` (file[], optional)
- `id_document` (file, optional)
- `profile_picture` (file, optional)

---

## Common Issues

### 400 Bad Request Errors

**Cause:** Field name mismatch between frontend and backend

**Solution:** 
1. Check that all field names use snake_case (`full_name`, not `fullName`)
2. Ensure required fields are present
3. Remove frontend-only fields before sending

### Missing Required Fields

**Backend will return 400 if:**
- `email` is missing or invalid
- `password` is missing or too short (< 8 chars)
- `full_name` is missing
- `phone` is missing (for all roles)
- `specialization` is missing (for artisans)

### File Upload Issues

**Common problems:**
- File size too large (max 5MB for documents, 2MB for profile pictures)
- Invalid file format (only PDF, JPG, PNG allowed)
- Field name mismatch (`id_document` not `idUpload`)

---

## Testing Checklist

- [ ] Tenant signup with all required fields
- [ ] Tenant signup with optional ID document
- [ ] Landlord signup with business registration
- [ ] Artisan signup with certifications
- [ ] Verify field names match backend expectations
- [ ] Verify file uploads work correctly
- [ ] Verify error messages are clear
