# WebSocket Setup Checklist

**Created:** January 2026  
**Status:** Setup Guide  
**Purpose:** Complete checklist for WebSocket/real-time features setup

---

## ✅ What You've Done

1. ✅ Installed `socket.io-client` (package.json shows version 4.8.3)
2. ✅ WebSocket service implemented (`src/services/websocketService.js`)
3. ✅ Integrated in Messages (`src/pages/Messages/MessagesInbox.jsx`)
4. ✅ Environment variables placed in `.env` files

---

## 🔍 Current Status

### WebSocket Library
- **Using:** `socket.io-client` (✅ Correct - this is the right library)
- **Note:** You mentioned "react-websocket" but you're actually using `socket.io-client`, which is correct!

### WebSocket Service
- **File:** `src/services/websocketService.js`
- **Status:** ✅ Fully implemented
- **Features:**
  - Real-time messaging
  - Typing indicators
  - Read receipts
  - Auto-reconnection
  - Message encryption

---

## ⚠️ Important: Socket.IO URL Format

### Current Code Issue

Your code uses:
```javascript
const WS_URL = import.meta.env.VITE_WS_URL || "ws://localhost:8000";
```

**Problem:** Socket.IO uses **HTTP/HTTPS URLs**, not `ws://` or `wss://`!

### Correct Format

```javascript
// ❌ WRONG (current)
VITE_WS_URL=ws://localhost:8000
VITE_WS_URL=wss://api.rentalconnects.com

// ✅ CORRECT (Socket.IO format)
VITE_WS_URL=http://localhost:8000
VITE_WS_URL=https://api.rentalconnects.com
```

**Socket.IO automatically handles WebSocket protocol** - you just provide the HTTP URL!

---

## 🔧 What's Missing & Next Steps

### 1. Fix WebSocket URL Format ⚠️ CRITICAL

**File:** `src/services/websocketService.js`

**Current:**
```javascript
const WS_URL = import.meta.env.VITE_WS_URL || "ws://localhost:8000";
```

**Fix to:**
```javascript
const WS_URL = import.meta.env.VITE_WS_URL || "http://localhost:8000";
```

**Update `.env` file:**
```env
# Development
VITE_WS_URL=http://localhost:8000

# Production
VITE_WS_URL=https://api.rentalconnects.com
```

---

### 2. Backend Requirements

Your backend needs to implement **Socket.IO server** (not plain WebSocket).

#### Backend Must Support:

**Connection:**
- Socket.IO server running on backend
- Accepts JWT token in auth
- Accepts userId in auth

**Events to Handle:**
- `join_conversation` - User joins a conversation room
- `leave_conversation` - User leaves a conversation room
- `send_message` - Send a message (with encryption support)
- `typing` - Typing indicator
- `mark_read` - Mark message as read

**Events to Emit:**
- `new_message` - New message received
- `typing` - User is typing
- `message_read` - Message was read

**Example Backend (Django/Node.js):**
```python
# Django example with python-socketio
@socketio.on('join_conversation')
def handle_join(data):
    conversation_id = data['conversation_id']
    join_room(conversation_id)

@socketio.on('send_message')
def handle_message(data, callback):
    # Process message
    # Emit to room
    emit('new_message', message_data, room=conversation_id)
    callback({'data': message_data})
```

---

### 3. Environment Variables Checklist

Verify these in your `.env` file:

```env
# ✅ Required for WebSocket
VITE_WS_URL=http://localhost:8000  # Development
# VITE_WS_URL=https://api.rentalconnects.com  # Production

# ✅ Required for API
VITE_API_BASE_URL=http://localhost:8000/api

# ✅ Required for Payments
VITE_PAYSTACK_PUBLIC_KEY=pk_test_xxxxxxxxxxxxx

# ✅ Required for Image Uploads
VITE_CLOUDINARY_CLOUD_NAME=your-cloud-name
VITE_CLOUDINARY_UPLOAD_PRESET=rentalconnects_upload

# ⚠️ Optional but Recommended
VITE_EMAIL_LOGO_URL=https://rentalconnects.com/logo.png
VITE_APP_URL=https://rentalconnects.com
VITE_TINYMCE_API_KEY=your-tinymce-key
```

---

### 4. Backend Socket.IO Server Setup

#### Required Backend Implementation

**Backend must:**
1. ✅ Install Socket.IO server library
   - Python: `python-socketio`
   - Node.js: `socket.io`
   - Django: `django-socketio` or `python-socketio`

2. ✅ Accept JWT authentication
   ```python
   # Backend must verify JWT token from auth.token
   token = request.auth.get('token')
   user = verify_jwt_token(token)
   ```

3. ✅ Handle Socket.IO events
   - `join_conversation`
   - `leave_conversation`
   - `send_message`
   - `typing`
   - `mark_read`

4. ✅ Emit events to clients
   - `new_message`
   - `typing`
   - `message_read`

---

## 📋 Complete Setup Checklist

### Frontend (What You Need to Do)

- [ ] **Fix WebSocket URL format** - Change `ws://` to `http://` in code
- [ ] **Update `.env` file** - Use HTTP URLs, not WebSocket URLs
- [ ] **Verify `VITE_WS_URL`** is set correctly
- [ ] **Test WebSocket connection** - Check browser console for connection status
- [ ] **Verify Socket.IO client** - Ensure `socket.io-client` is installed (✅ Already done)

### Backend (What Backend Team Needs to Do)

- [ ] **Install Socket.IO server** library
- [ ] **Set up Socket.IO server** on backend
- [ ] **Implement JWT authentication** for Socket.IO connections
- [ ] **Handle `join_conversation` event**
- [ ] **Handle `leave_conversation` event**
- [ ] **Handle `send_message` event**
- [ ] **Handle `typing` event**
- [ ] **Handle `mark_read` event**
- [ ] **Emit `new_message` event** to conversation room
- [ ] **Emit `typing` event** to conversation room
- [ ] **Emit `message_read` event** to conversation room
- [ ] **Test WebSocket connection** from frontend

---

## 🔧 Immediate Fixes Needed

### Fix 1: Update WebSocket URL Format

**File:** `src/services/websocketService.js`

**Change:**
```javascript
// FROM:
const WS_URL = import.meta.env.VITE_WS_URL || "ws://localhost:8000";

// TO:
const WS_URL = import.meta.env.VITE_WS_URL || "http://localhost:8000";
```

### Fix 2: Update Environment Variable

**In your `.env` file:**

```env
# Change from:
# VITE_WS_URL=ws://localhost:8000

# To:
VITE_WS_URL=http://localhost:8000

# Production:
# VITE_WS_URL=https://api.rentalconnects.com
```

---

## 🧪 Testing WebSocket

### 1. Check Connection Status

Open browser console and look for:
```
WebSocket connected
```

### 2. Test in Messages Page

1. Navigate to `/messages`
2. Open browser console
3. Check for connection logs
4. Try sending a message
5. Verify real-time delivery

### 3. Debug Connection Issues

If connection fails, check:
- ✅ Backend Socket.IO server is running
- ✅ `VITE_WS_URL` is correct (HTTP, not WS)
- ✅ JWT token is valid
- ✅ Backend accepts Socket.IO connections
- ✅ CORS is configured for Socket.IO

---

## 📚 Backend Implementation Guide

### For Backend Team

Share this with your backend team:

**Required Socket.IO Events:**

1. **Connection Authentication:**
   ```javascript
   // Frontend sends: { token, userId } in auth
   // Backend must verify JWT token
   ```

2. **Events to Handle:**
   - `join_conversation` - `{ conversation_id }`
   - `leave_conversation` - `{ conversation_id }`
   - `send_message` - `{ conversation_id, message, encrypted }`
   - `typing` - `{ conversation_id, is_typing }`
   - `mark_read` - `{ conversation_id, message_id }`

3. **Events to Emit:**
   - `new_message` - New message in conversation
   - `typing` - User typing indicator
   - `message_read` - Message read receipt

**See:** `BACKEND_WEBSOCKET_IMPLEMENTATION.md` (create this if needed)

---

## 🚀 Next Steps

### Immediate (Do Now)

1. ✅ **Fix WebSocket URL** - Change `ws://` to `http://` in `websocketService.js`
2. ✅ **Update `.env`** - Use HTTP URL format
3. ✅ **Restart dev server** - Changes require restart

### Short-term (This Week)

1. **Backend Setup:**
   - Backend team implements Socket.IO server
   - Test connection from frontend
   - Verify all events work

2. **Testing:**
   - Test real-time messaging
   - Test typing indicators
   - Test read receipts
   - Test reconnection

### Long-term (This Month)

1. **Production Deployment:**
   - Configure production WebSocket URL
   - Set up SSL for `wss://` (Socket.IO handles this)
   - Monitor connection stability

2. **Optimization:**
   - Implement connection pooling
   - Add connection health monitoring
   - Optimize reconnection logic

---

## 🔍 Verification

### Check These Files

1. **`src/services/websocketService.js`**
   - ✅ Uses `socket.io-client`
   - ⚠️ URL format (needs fix: use `http://` not `ws://`)

2. **`.env` file**
   - ✅ `VITE_WS_URL` is set
   - ⚠️ Format (should be `http://` not `ws://`)

3. **`package.json`**
   - ✅ `socket.io-client` installed (v4.8.3)

4. **`src/pages/Messages/MessagesInbox.jsx`**
   - ✅ Uses WebSocket service
   - ✅ Handles connection status

---

## 📝 Summary

### What's Working ✅
- Socket.IO client installed
- WebSocket service implemented
- Integration in Messages page
- Environment variables configured

### What Needs Fixing ⚠️
- **WebSocket URL format** - Change from `ws://` to `http://`
- **Backend Socket.IO server** - Needs to be implemented

### What's Next 🚀
1. Fix URL format in code and `.env`
2. Backend implements Socket.IO server
3. Test real-time messaging
4. Deploy to production

---

**Last Updated:** January 2026  
**Status:** Ready for Backend Integration
