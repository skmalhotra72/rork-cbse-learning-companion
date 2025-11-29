# 🔑 API Keys Configuration Guide

## Where to Add Your API Keys

All API keys should be added to the `env.local` file in the root of your project.

---

## 1. OpenAI API Key

### Current Status in `env.local`:
```env
OPENAI_API_KEY=your-openai-api-key-here
```

### How to Get Your OpenAI API Key:

1. **Go to OpenAI Platform:**
   - Visit: https://platform.openai.com/api-keys

2. **Sign In:**
   - Use your OpenAI account credentials
   - If you don't have an account, create one at https://platform.openai.com/signup

3. **Create API Key:**
   - Click the **"+ Create new secret key"** button
   - Give it a name (e.g., "CBSE Learning App")
   - Click **"Create secret key"**

4. **Copy the Key:**
   - The key will start with `sk-proj-...` or `sk-...`
   - **Important:** Copy it immediately! You won't be able to see it again
   - Store it somewhere safe temporarily

5. **Add to `env.local`:**
   ```env
   OPENAI_API_KEY=sk-proj-YOUR_ACTUAL_KEY_HERE
   ```
   Replace `your-openai-api-key-here` with your actual key

6. **Restart the Server:**
   - Stop your Expo server (Ctrl+C or Cmd+C)
   - Start it again: `npx expo start`

---

## 2. Supabase Configuration

### Current Status in `env.local`:
```env
# Already configured ✅
SUPABASE_URL=https://ziaqpnuvvlnemxiwjckp.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

EXPO_PUBLIC_SUPABASE_URL=https://ziaqpnuvvlnemxiwjckp.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Status:** ✅ Supabase credentials are already configured!

However, you still need to:
1. **Run the SQL migration** (see `SUPABASE_SETUP_GUIDE.md`)
2. **Add `extra` field to `app.json`** (see below)

---

## 3. app.json Configuration (Required for Supabase to Work)

The app needs environment variables exposed in `app.json`.

### Edit `app.json`:
Find the `experiments` section and add `extra` field after it:

```json
{
  "expo": {
    ...
    "experiments": {
      "typedRoutes": true
    },
    "extra": {
      "EXPO_PUBLIC_SUPABASE_URL": "https://ziaqpnuvvlnemxiwjckp.supabase.co",
      "EXPO_PUBLIC_SUPABASE_ANON_KEY": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InppYXFwbnV2dmxuZW14aXdqY2twIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ0MTk3ODgsImV4cCI6MjA3OTk5NTc4OH0.z3qfPEu_KEWfg5kJ4JAftFERhAB3TzeuibxH8ZzP-XA"
    }
  }
}
```

**After editing:** Restart your Expo server with cache clear:
```bash
npx expo start -c
```

---

## 📋 Complete Checklist

### To Enable Full App Functionality:

- [ ] **1. Add OpenAI API Key to `env.local`**
  - Get key from https://platform.openai.com/api-keys
  - Replace `your-openai-api-key-here` in `env.local`

- [ ] **2. Run Supabase SQL Migration**
  - Go to Supabase Dashboard → SQL Editor
  - Copy contents of `supabase-setup.sql`
  - Run the query to create tables

- [ ] **3. Add `extra` field to `app.json`**
  - Add the configuration shown above
  - This exposes Supabase credentials to the app

- [ ] **4. Restart Expo Server**
  - Stop server (Ctrl+C)
  - Clear cache: `npx expo start -c`
  - Check that Supabase icon is now active

---

## 🔒 Security Notes

### Environment Variables:
- ✅ `OPENAI_API_KEY` - Stays on backend only (secure)
- ✅ `SUPABASE_URL` - Safe to expose (public)
- ✅ `SUPABASE_ANON_KEY` - Safe to expose (has RLS protection)
- ✅ `EXPO_PUBLIC_*` - Variables exposed to frontend

### Important:
- Never commit `.env.local` to git (it's already in `.gitignore`)
- The Supabase anon key is safe to expose because:
  - Row Level Security (RLS) protects your data
  - It only grants limited, policy-controlled access
  - It's designed to be used in client-side code

---

## 🧪 Testing the Connection

### After completing all steps:

1. **Test Supabase:**
   - Open your app
   - Check if the Supabase icon is green/active
   - Go through onboarding and create a profile
   - Check Supabase Dashboard → Table Editor to see if data is saved

2. **Test OpenAI:**
   - Go to the "Diagnose" screen
   - Upload a test or image
   - The AI should analyze and provide feedback

---

## ❓ Troubleshooting

### Issue: "Missing Supabase credentials" error
**Solution:**
- Check that `extra` field is added to `app.json`
- Restart Expo with cache clear: `npx expo start -c`

### Issue: OpenAI features not working
**Solution:**
- Verify `OPENAI_API_KEY` in `env.local` starts with `sk-`
- Check you have credits in your OpenAI account
- Restart the server after adding the key

### Issue: Supabase icon still inactive
**Solution:**
- Verify you added the `extra` field correctly in `app.json`
- Check for typos in the credentials
- Clear cache and restart: `npx expo start -c`

---

## 💰 Billing Information

### OpenAI:
- You need to add a payment method to your OpenAI account
- Check usage at: https://platform.openai.com/usage
- Set usage limits to avoid unexpected charges

### Supabase:
- Free tier includes:
  - 500MB database space
  - 1GB file storage
  - 2GB bandwidth
- Upgrade only if you exceed limits

---

## 📞 Need Help?

If you encounter issues:
1. Check the console logs for error messages
2. Verify all credentials are correct
3. Make sure you completed all checklist items
4. Restart the server after any changes

---

**Last Updated:** 2025-11-29
**Project:** CBSE Learning Companion
