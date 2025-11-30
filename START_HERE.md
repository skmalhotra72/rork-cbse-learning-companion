# 🚀 START HERE - Quick Start Guide

## ✅ Everything is Fixed and Ready!

The critical Supabase configuration mismatch has been resolved. Your app is ready to run.

---

## 🎮 Start the App (2 Simple Steps)

### Terminal 1: Start Backend
```bash
cd /home/user/rork-app
tsx backend/hono.ts
```

**Wait for:**
```
🚀 Backend API starting on http://localhost:3000
📡 tRPC endpoint: http://localhost:3000/api/trpc
🏥 Health check: http://localhost:3000/health/supabase
```

✅ **Keep this running!**

---

### Terminal 2: Start Frontend
```bash
cd /home/user/rork-app
npx expo start --tunnel
```

**Wait for:**
```
› Metro waiting on exp://...
› Scan the QR code above
```

✅ **Keep this running too!**

---

## 🎯 Test Login

Once both terminals are running, test with these accounts:

### Student Login
```
Email: student1@test.com
Password: Test@123456
```

### Parent Login
```
Email: parent1@test.com
Password: Test@123456
```

---

## ❓ Something Not Working?

### "Failed to fetch" Error
→ Backend is not running. Start Terminal 1 first.

### "Illegal instruction" Error
→ Use `tsx` not `bun run`. Command: `tsx backend/hono.ts`

### "bunx command not found" Error
→ Use `npx expo start --tunnel` instead of `bun start`

### "Port 3000 already in use"
```bash
lsof -i :3000
kill -9 <PID>
```

---

## 📄 More Help

- **Full audit report:** See `FIXES_APPLIED.md`
- **Critical issues found:** See `CRITICAL_ISSUES_FOUND.md`
- **Database setup:** See `DUMMY_DATA_SETUP.md`
- **Login credentials:** See `LOGIN_CREDENTIALS.md`

---

## ✅ What Was Fixed

✅ Supabase URL mismatch resolved  
✅ Frontend and backend now use same database  
✅ Configuration synchronized  
✅ Ready to run immediately  

---

**That's it! Just run those 2 commands and test login. 🎉**
