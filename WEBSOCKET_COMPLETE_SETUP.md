# WebSocket Complete Setup Guide

**Created:** January 2026  
**Status:** Setup & Verification Guide  
**Purpose:** Complete guide for WebSocket/real-time features setup

---

## ✅ What You've Completed

1. ✅ **Installed `socket.io-client`** (v4.8.3) - Correct library!
2. ✅ **WebSocket service implemented** (`src/services/websocketService.js`)
3. ✅ **Integrated in Messages** (`src/pages/Messages/MessagesInbox.jsx`)
4. ✅ **Environment variables configured** in `.env` files

**Note:** You mentioned "react-websocket" but you're using `socket.io-client`, which is the **correct** library for Socket.IO!

---

## ⚠️ CRITICAL FIX: WebSocket URL Format

### Issue Found

Socket.IO uses **HTTP/HTTPS URLs**, not `ws://` or `wss://`!

### Fixed in Code ✅

I've updated `src/services/websocketService.js` to use the correct format.

### Update Your `.env` File

**Change from:**
```env
VITE_WS_URL=ws://localhost:8000  # ❌ WRONG
```

**To:**
```env
VITE_WS_URL=http://localhost:8000  # ✅ CORRECT
```

**Production:**
```env
VITE_WS_URL=https://api.rentalconnects.com  # ✅ CORRECT
```

**Why:** Socket.IO automatically handles WebSocket protocol - you just provide the HTTP URL!

---

## 📋 Complete Environment Variables Checklist

### Required Variables

```env
# ✅ Backend API (Required)
VITE_API_BASE_URL=http://localhost:8000/api

# ✅ WebSocket (Required for real-time)
VITE_WS_URL=http://localhost:8000  # Development
# VITE_WS_URL=https://api.rentalconnects.com  # Production

# ✅ Payments (Required for payments)
VITE_PAYSTACK_PUBLIC_KEY=pk_test_xxxxxxxxxxxxx

# ✅ Image Uploads (Required for uploads)
VITE_CLOUDINARY_CLOUD_NAME=your-cloud-name
VITE_CLOUDINARY_UPLOAD_PRESET=rentalconnects_upload

# ⚠️ Optional but Recommended
VITE_EMAIL_LOGO_URL=https://rentalconnects.com/logo.png
VITE_APP_URL=https://rentalconnects.com
VITE_TINYMCE_API_KEY=your-tinymce-key
VITE_USE_MOCK=false  # Set to false for production
```

---

## 🔍 What's Missing

### 1. Backend Socket.IO Server ⚠️ CRITICAL

**Status:** Needs to be implemented by backend team

**Required:**
- Socket.IO server running on backend
- JWT authentication for Socket.IO connections
- Event handlers for all Socket.IO events

**See:** Backend requirements section below

### 2. WebSocket URL in `.env` ⚠️ NEEDS UPDATE

**Action Required:**
- Update `VITE_WS_URL` to use `http://` instead of `ws://`
- Restart dev server after change

### 3. Testing & Verification ⚠️ NEEDS TESTING

**Action Required:**
- Test WebSocket connection
- Verify real-time messaging works
- Test typing indicators
- Test read receipts

---

## 🚀 Next Steps

### Step 1: Update Environment Variable (Do Now)

**In your `.env` file:**

```env
# Change this:
# VITE_WS_URL=ws://localhost:8000

# To this:
VITE_WS_URL=http://localhost:8000
```

**Then restart your dev server:**
```bash
npm run dev
```

### Step 2: Verify Frontend Setup

**Check these files:**

1. ✅ `package.json` - `socket.io-client` installed (v4.8.3)
2. ✅ `src/services/websocketService.js` - Service implemented
3. ✅ `src/pages/Messages/MessagesInbox.jsx` - Integration done
4. ✅ `.env` file - `VITE_WS_URL` set (needs format fix)

### Step 3: Backend Socket.IO Server

**Backend team needs to:**

1. **Install Socket.IO server:**
   ```bash
   # Python/Django
   pip install python-socketio
   
   # Node.js
   npm install socket.io
   ```

2. **Implement Socket.IO server:**
   - Accept connections with JWT auth
   - Handle events: `join_conversation`, `send_message`, `typing`, `mark_read`
   - Emit events: `new_message`, `typing`, `message_read`

3. **Test connection:**
   - Frontend connects successfully
   - Events are received/sent correctly

### Step 4: Test WebSocket Connection

**In browser console (after Step 1-3):**

1. Navigate to `/messages`
2. Open browser console
3. Look for: `WebSocket connected`
4. Try sending a message
5. Verify real-time delivery

---

## 📚 Backend Socket.IO Requirements

### Connection Authentication

**Frontend sends:**
```javascript
{
  auth: {
    token: "jwt_token_here",
    userId: "user_id_here"
  }
}
```

**Backend must:**
- Verify JWT token
- Extract user from token
- Associate socket with user

### Events to Handle

#### 1. `join_conversation`
**Frontend sends:**
```javascript
{
  conversation_id: "conv_123"
}
```

**Backend should:**
- Join socket to conversation room
- Return success/error

#### 2. `leave_conversation`
**Frontend sends:**
```javascript
{
  conversation_id: "conv_123"
}
```

**Backend should:**
- Leave socket from conversation room

#### 3. `send_message`
**Frontend sends:**
```javascript
{
  conversation_id: "conv_123",
  message: "encrypted_message",
  encrypted: true
}
```

**Backend should:**
- Save message to database
- Emit `new_message` to conversation room
- Return message data via callback

#### 4. `typing`
**Frontend sends:**
```javascript
{
  conversation_id: "conv_123",
  is_typing: true
}
```

**Backend should:**
- Emit `typing` to conversation room (except sender)

#### 5. `mark_read`
**Frontend sends:**
```javascript
{
  conversation_id: "conv_123",
  message_id: "msg_456"
}
```

**Backend should:**
- Update message read status
- Emit `message_read` to conversation room

### Events to Emit

#### 1. `new_message`
**Emit to:** Conversation room
**Data:**
```javascript
{
  id: "msg_123",
  conversation_id: "conv_123",
  sender_id: "user_456",
  message: "encrypted_message",
  timestamp: "2026-01-20T10:00:00Z",
  status: "delivered"
}
```

#### 2. `typing`
**Emit to:** Conversation room (except sender)
**Data:**
```javascript
{
  conversation_id: "conv_123",
  user_id: "user_456",
  is_typing: true
}
```

#### 3. `message_read`
**Emit to:** Conversation room
**Data:**
```javascript
{
  conversation_id: "conv_123",
  message_id: "msg_456",
  read_by: "user_789",
  read_at: "2026-01-20T10:00:00Z"
}
```

---

## 🧪 Testing Checklist

### Frontend Testing

- [ ] WebSocket connects successfully (check console)
- [ ] Can send messages via WebSocket
- [ ] Receive messages in real-time
- [ ] Typing indicators work
- [ ] Read receipts work
- [ ] Reconnection works (disconnect/reconnect)
- [ ] Encryption/decryption works

### Backend Testing

- [ ] Socket.IO server accepts connections
- [ ] JWT authentication works
- [ ] All events are handled correctly
- [ ] Events are emitted to correct rooms
- [ ] Multiple users can connect
- [ ] Room management works (join/leave)

---

## 🔧 Troubleshooting

### Issue: WebSocket Not Connecting

**Check:**
1. ✅ `VITE_WS_URL` is set in `.env`
2. ✅ URL format is `http://` not `ws://`
3. ✅ Backend Socket.IO server is running
4. ✅ Backend accepts Socket.IO connections
5. ✅ CORS is configured for Socket.IO

**Debug:**
```javascript
// In browser console
console.log('WS URL:', import.meta.env.VITE_WS_URL);
// Should show: http://localhost:8000 (not ws://)
```

### Issue: Connection Refused

**Possible causes:**
- Backend Socket.IO server not running
- Wrong URL in `VITE_WS_URL`
- Backend not configured for Socket.IO
- Port blocked by firewall

**Solution:**
- Verify backend is running
- Check backend logs for connection attempts
- Verify URL format

### Issue: Authentication Failed

**Possible causes:**
- JWT token invalid/expired
- Backend not verifying token
- Token not sent correctly

**Solution:**
- Check token in `authStore`
- Verify backend JWT verification
- Check backend logs

---

## 📝 Files Summary

### Files Using WebSocket

1. **`src/services/websocketService.js`** - WebSocket service (✅ Fixed URL format)
2. **`src/pages/Messages/MessagesInbox.jsx`** - Real-time messaging
3. **`src/pages/Notifications/NotificationsCenter.jsx`** - Could use WebSocket (currently polling)

### Environment Variables Needed

**Required:**
- `VITE_WS_URL` - WebSocket server URL (HTTP format)
- `VITE_API_BASE_URL` - Backend API URL
- `VITE_PAYSTACK_PUBLIC_KEY` - Payment processing
- `VITE_CLOUDINARY_CLOUD_NAME` - Image uploads
- `VITE_CLOUDINARY_UPLOAD_PRESET` - Image uploads

**Optional:**
- `VITE_EMAIL_LOGO_URL` - Email templates
- `VITE_APP_URL` - Email links
- `VITE_TINYMCE_API_KEY` - Rich text editor
- `VITE_USE_MOCK` - Mock mode (set to `false` for production)

---

## ✅ Action Items

### Immediate (Do Now)

1. ✅ **Fix WebSocket URL format** - Updated in code
2. ⚠️ **Update `.env` file** - Change `ws://` to `http://`
3. ⚠️ **Restart dev server** - Required for env changes

### This Week

1. **Backend Setup:**
   - Backend team implements Socket.IO server
   - Test connection from frontend
   - Verify all events work

2. **Testing:**
   - Test real-time messaging
   - Test typing indicators
   - Test read receipts

### This Month

1. **Production:**
   - Configure production WebSocket URL
   - Deploy with real-time features
   - Monitor connection stability

---

## 📞 Support

**If issues persist:**
- Check browser console for errors
- Check backend logs for connection attempts
- Verify Socket.IO server is running
- Test with mock mode first (`VITE_USE_MOCK=true`)

---

**Last Updated:** January 2026  
**Status:** Ready for Backend Integration  
**Next:** Update `.env` and test connection
