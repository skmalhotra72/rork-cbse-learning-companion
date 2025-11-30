# 🚀 How to Start the Backend Server

## The Problem
The app is failing with "Failed to fetch" because **the backend server is not running**.

The frontend is trying to connect to `http://localhost:3000/api/trpc` but nothing is listening on that port.

## The Solution

You need to run **TWO separate processes**:
1. **Backend Server** (Port 3000)
2. **Frontend App** (Expo)

---

## Steps to Fix

### Terminal 1: Start the Backend Server

```bash
cd /home/user/rork-app
bun run backend/hono.ts
```

You should see:
```
🚀 Backend API starting on http://localhost:3000
📡 tRPC endpoint: http://localhost:3000/api/trpc
🏥 Health check: http://localhost:3000/health/supabase
```

**Keep this terminal running!**

---

### Terminal 2: Start the Frontend App

```bash
cd /home/user/rork-app
bun start
```

Or if you prefer web:
```bash
bun start-web
```

---

## Verify Backend is Running

Open a new terminal and test:

```bash
# Test basic health
curl http://localhost:3000

# Test Supabase connection
curl http://localhost:3000/health/supabase

# Test tRPC endpoint (should return error but proves it's listening)
curl http://localhost:3000/api/trpc
```

---

## Test Login

Once both servers are running:

1. Open the app
2. Try logging in with dummy credentials:
   - **Student**: `student@test.com` / `password123`
   - **Parent**: `parent@test.com` / `password123`

The "Failed to fetch" error should be gone!

---

## Common Issues

### Issue: "Port 3000 already in use"
```bash
# Find what's using the port
lsof -i :3000

# Kill it
kill -9 <PID>
```

### Issue: Backend crashes immediately
- Check `env.local` has correct Supabase credentials
- Check `SUPABASE_URL` and `SUPABASE_ANON_KEY` are set

### Issue: Still getting "Failed to fetch"
- Make sure `EXPO_PUBLIC_RORK_API_BASE_URL=http://localhost:3000` in `env.local`
- Restart the frontend app after backend starts

---

## Pro Tip: Run Both Together

You can run both in one command:

```bash
bun run backend/hono.ts & bun start
```

But it's easier to use separate terminals for debugging.
