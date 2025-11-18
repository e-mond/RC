# Environment Variable Setup

## Issue Fixed

The `.env` file had the wrong API URL: `https://your-backend-server.com/api`

## Solution

The `.env` file has been updated to:
```
VITE_API_BASE_URL=http://localhost:8000/api
```

## Important: Restart Frontend Server

**After updating the `.env` file, you MUST restart the frontend development server:**

1. Stop the current frontend server (Ctrl+C)
2. Start it again:
   ```bash
   cd RC
   npm run dev
   ```

Vite reads environment variables only when the server starts, so changes to `.env` require a restart.

## Verification

After restarting, check the browser console - API calls should now go to:
- `http://localhost:8000/api/auth/login`
- `http://localhost:8000/api/auth/signup/tenant`
- etc.

Instead of:
- `https://your-backend-server.com/api/...`

## If Issues Persist

1. **Clear browser cache**
2. **Hard refresh:** Ctrl+Shift+R (Windows/Linux) or Cmd+Shift+R (Mac)
3. **Check .env file:** Make sure it contains:
   ```
   VITE_API_BASE_URL=http://localhost:8000/api
   ```
4. **Verify backend is running:**
   ```bash
   cd RC_backend
   source bin/activate
   python manage.py runserver 8000
   ```

## Environment File Location

- **File:** `RC/.env`
- **Content:** `VITE_API_BASE_URL=http://localhost:8000/api`

## Note

The `.env` file is in `.gitignore` and won't be committed to git. Each developer should have their own `.env` file with the correct API URL for their environment.

