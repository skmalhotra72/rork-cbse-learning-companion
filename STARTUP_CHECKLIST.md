# ✅ Startup Checklist

## Before You Start

- [ ] You have `bun` installed
- [ ] You're in project directory: `/home/user/rork-app`
- [ ] File `env.local` exists and has all credentials

---

## Terminal Setup

### Terminal 1 (Backend) 🔧

```bash
cd /home/user/rork-app
bun run backend/hono.ts
```

**Look for:**
```
✅ 🚀 Backend API starting on http://localhost:3000
✅ 📡 tRPC endpoint: http://localhost:3000/api/trpc  
✅ 🏥 Health check: http://localhost:3000/health/supabase
```

- [ ] Backend started successfully
- [ ] No error messages
- [ ] Listening on port 3000

**KEEP THIS TERMINAL RUNNING!**

---

### Terminal 2 (Frontend) 📱

```bash
cd /home/user/rork-app
npx expo start
```

**Look for:**
```
✅ Metro waiting on exp://...
✅ QR code displayed
```

- [ ] Expo started successfully
- [ ] QR code visible
- [ ] No "Failed to fetch" in logs

**KEEP THIS TERMINAL RUNNING TOO!**

---

## Verification (Terminal 3) 🧪

```bash
cd /home/user/rork-app
bun verify-setup.ts
```

**Expected:**
- [ ] ✅ All environment variables set
- [ ] ✅ Backend is running
- [ ] ✅ Supabase is connected
- [ ] ✅ tRPC endpoint accessible

---

## Test Login 🎮

**Student Account:**
- Email: `student@test.com`
- Password: `password123`

**What should happen:**
- [ ] No "Failed to fetch" error
- [ ] Successfully logged in
- [ ] Redirected to student dashboard

**Parent Account:**
- Email: `parent@test.com`  
- Password: `password123`

**What should happen:**
- [ ] No "Failed to fetch" error
- [ ] Successfully logged in
- [ ] Redirected to parent home

---

## Common Issues

### ❌ "Failed to fetch"
→ Backend is not running. Start it in Terminal 1.

### ❌ "Port 3000 already in use"
```bash
lsof -i :3000
kill -9 <PID>
```

### ❌ "Cannot find module"
```bash
bun install
```

### ❌ Backend crashes
→ Check `env.local` has Supabase credentials

---

## All Green? 🎉

If all checkboxes are ✅, you're ready to develop!

Both terminals should stay open while you work:
- Terminal 1: Backend API logs
- Terminal 2: Expo metro bundler logs

Happy coding! 🚀
