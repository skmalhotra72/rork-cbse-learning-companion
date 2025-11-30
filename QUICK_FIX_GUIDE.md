# Quick Fix Guide - "Failed to Fetch" Error

## Problem
Getting `TRPCClientError: Failed to fetch` when trying to login or signup.

## Root Cause
The backend API URL (`EXPO_PUBLIC_RORK_API_BASE_URL`) was not configured in your environment.

## ✅ Solution Applied

### 1. Backend API URL Configured
Updated `env.local` with:
```bash
EXPO_PUBLIC_RORK_API_BASE_URL=http://localhost:3000
```

### 2. Backend Server Configured
Updated `backend/hono.ts` to properly export the server configuration for Bun.

### 3. Created Startup Guides
- `START_APP.md` - How to start the app
- `LOGIN_CREDENTIALS.md` - Test account credentials

---

## 🚀 How to Start the App Now

### Step 1: Start Backend (Terminal 1)
```bash
bun run --watch backend/hono.ts
```

**Expected output:**
```
🚀 Backend API starting on http://localhost:3000
📡 tRPC endpoint: http://localhost:3000/api/trpc
🏥 Health check: http://localhost:3000/health/supabase
```

### Step 2: Start Frontend (Terminal 2)
```bash
npx expo start
```

If it asks about port 8082, press `Y` to accept.

### Step 3: Test Login
Use these credentials:
- **Student:** `student1@test.com` / `Test@123456`
- **Parent:** `parent1@test.com` / `Test@123456`

---

## 🔍 Verify Everything is Working

### 1. Check Backend Health
Open in browser: http://localhost:3000/

You should see:
```json
{"status":"ok","message":"API is running"}
```

### 2. Check Supabase Connection
Open in browser: http://localhost:3000/health/supabase

You should see:
```json
{"status":"ok","connected":true,"message":"Supabase connection successful"}
```

### 3. Test Login
- Open the app in Expo
- Navigate to login screen
- Use the test credentials above
- You should successfully login and be redirected to dashboard

---

## ⚠️ Troubleshooting

### Error: "Failed to fetch" still appears
1. Make sure backend is running (check Terminal 1)
2. Check that `env.local` has `EXPO_PUBLIC_RORK_API_BASE_URL=http://localhost:3000`
3. Restart the Expo server (Terminal 2): Press `r` in the terminal or restart with `npx expo start --clear`

### Error: "Port 3000 already in use"
Kill the process using port 3000:
```bash
# On Linux/Mac
lsof -ti:3000 | xargs kill -9

# On Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F
```

### Error: Login credentials don't work
1. Verify dummy data was created: Check `supabase-dummy-data.sql`
2. Create users manually in Supabase Auth Dashboard with the credentials
3. See `LOGIN_CREDENTIALS.md` for all test accounts

### Error: "bunx: command not found"
This is expected. We've bypassed the Rork CLI and are using Bun and Expo directly.

---

## 📝 For Mobile Device Testing

If you want to test on a physical device:

1. Find your computer's IP address:
   ```bash
   # Linux/Mac
   ifconfig | grep "inet "
   
   # Windows
   ipconfig
   ```

2. Update `env.local`:
   ```bash
   EXPO_PUBLIC_RORK_API_BASE_URL=http://YOUR_IP_ADDRESS:3000
   ```

3. Make sure your phone is on the **same WiFi network**

4. Restart both backend and frontend

---

## ✨ Summary

The issue was that the `EXPO_PUBLIC_RORK_API_BASE_URL` environment variable wasn't set, causing the frontend to fail when trying to connect to the backend API.

**Fixed by:**
1. Setting the API URL in `env.local`
2. Configuring the backend to run on port 3000
3. Providing clear startup instructions

**You can now:**
- Start backend with `bun run --watch backend/hono.ts`
- Start frontend with `npx expo start`
- Login with test credentials from `LOGIN_CREDENTIALS.md`
