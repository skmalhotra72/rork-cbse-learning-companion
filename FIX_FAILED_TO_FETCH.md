# 🔥 CRITICAL FIX: "Failed to fetch" Error

## 🎯 The Problem

Your app is showing **"Failed to fetch"** because:
- ❌ The **backend server is NOT running**
- ✅ Frontend is running fine
- ✅ Supabase is connected
- ❌ Backend API on port 3000 is **not responding**

---

## ⚡ Quick Fix (2 Steps)

### Step 1: Open Terminal 1 - Start Backend

```bash
cd /home/user/rork-app
bun run backend/hono.ts
```

**Expected Output:**
```
🚀 Backend API starting on http://localhost:3000
📡 tRPC endpoint: http://localhost:3000/api/trpc
🏥 Health check: http://localhost:3000/health/supabase
```

✅ **LEAVE THIS TERMINAL RUNNING!**

---

### Step 2: Open Terminal 2 - Start Frontend

```bash
cd /home/user/rork-app
npx expo start
```

**Expected Output:**
```
› Metro waiting on exp://...
› Scan the QR code above with Expo Go (Android) or Camera (iOS)
```

---

## 🧪 Verify It's Fixed

Run this in a **NEW terminal**:

```bash
cd /home/user/rork-app
bun verify-setup.ts
```

Should show all ✅ checks passing.

---

## 🎮 Test Login

Now try logging in again with:

**Student Account:**
- Email: `student@test.com`
- Password: `password123`

**Parent Account:**
- Email: `parent@test.com`
- Password: `password123`

The "Failed to fetch" error should be **GONE**! 🎉

---

## ❓ Still Getting Errors?

### Error: "Port 3000 is already in use"

```bash
# Find what's using port 3000
lsof -i :3000

# Kill it
kill -9 <PID>

# Then start backend again
bun run backend/hono.ts
```

### Error: Backend crashes immediately

Check your `env.local` file has these set:
```bash
SUPABASE_URL=https://gevcprpgzxbozzqgjgmk.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOi...
EXPO_PUBLIC_RORK_API_BASE_URL=http://localhost:3000
```

### Error: "Cannot find module"

```bash
# Reinstall dependencies
bun install
```

---

## 📖 Why This Happens

Your app has 2 parts:
1. **Frontend (Expo)** - The UI you see
2. **Backend (Hono/tRPC)** - The API that talks to Supabase

Both need to run **at the same time**:
- Frontend runs on port 8081 (Expo)
- Backend runs on port 3000 (API)

The "Failed to fetch" error means the frontend can't reach the backend because it's not running.

---

## 💡 Pro Tip

Always check both terminals are running:
- ✅ Terminal 1: Backend logs showing API requests
- ✅ Terminal 2: Expo showing bundle updates

---

Need more help? See `START_APP.md` for detailed instructions.
