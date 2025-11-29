# 🚀 Deployment Quick Reference Card

**One-page reference for deploying CBSE Learning Companion**

---

## Essential URLs

- **Supabase Dashboard**: https://supabase.com/dashboard
- **Vercel Dashboard**: https://vercel.com/dashboard
- **Expo Dashboard**: https://expo.dev
- **App Store Connect**: https://appstoreconnect.apple.com
- **Google Play Console**: https://play.google.com/console

---

## Critical Commands

### First-Time Setup

```bash
# Install tools
npm install -g eas-cli vercel

# Login to services
eas login
vercel login

# Configure environment
cp .env.example .env.local
# Edit .env.local with your values

# Test locally
bun install
bun start
```

### Deploy Backend (Vercel)

```bash
# First deploy
vercel

# Production deploy
vercel --prod

# Test
curl https://your-project.vercel.app/api/
```

### Build & Deploy App

```bash
# Configure EAS (first time)
eas build:configure

# Build for both platforms
eas build --platform all --profile production

# Submit to stores
eas submit --platform ios
eas submit --platform android

# Push OTA update
eas update --branch production --message "Bug fixes"
```

---

## Environment Variables (Minimum Required)

### .env.local

```env
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_ANON_KEY=eyJhbGci...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGci...
EXPO_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJhbGci...
EXPO_PUBLIC_RORK_API_BASE_URL=https://your-backend.vercel.app
EXPO_PUBLIC_TOOLKIT_URL=https://toolkit.rork.com
```

### Vercel Environment Variables

Add via dashboard or CLI:
- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `NODE_ENV=production`

---

## Database Setup (Supabase)

```sql
-- Run in Supabase SQL Editor in this order:

-- 1. Create all tables
-- Copy/paste: supabase-schema-complete.sql

-- 2. Seed subject data
-- Copy/paste: supabase-seed-subjects.sql

-- 3. Create storage bucket
-- Name: uploads
-- Public: OFF
```

---

## Troubleshooting

| Issue | Quick Fix |
|-------|-----------|
| Build fails | Check logs: `eas build:view <build-id>` |
| Backend 404 | Verify `EXPO_PUBLIC_RORK_API_BASE_URL` is set |
| DB connection error | Check Supabase credentials in Vercel |
| AI not working | Verify `EXPO_PUBLIC_TOOLKIT_URL` |
| Vars not loading | Restart: `npx expo start -c` |

---

## File Checklist

- [ ] `.env.local` created and filled
- [ ] `app.json` updated (bundle IDs, extra config)
- [ ] `vercel.json` exists (for backend)
- [ ] `.gitignore` includes `.env.local`
- [ ] Database migrations run
- [ ] Storage bucket created

---

## Pre-Submission Checklist

### Technical
- [ ] Backend returns 200 OK at `/api/`
- [ ] App connects to backend
- [ ] Authentication works
- [ ] All features tested on device

### Metadata
- [ ] App name finalized
- [ ] Bundle ID/Package name unique
- [ ] Privacy policy URL set
- [ ] Screenshots prepared (iOS: 6.7" & 5.5", Android: multiple)
- [ ] App description written

---

## Emergency Commands

```bash
# Rollback OTA update
eas update:rollback --branch production

# Rollback backend (Vercel)
vercel rollback <deployment-url>

# Restore database (Supabase dashboard)
# Database → Backups → Restore

# View logs
vercel logs
eas build:view <build-id>
```

---

## Cost Quick Reference

| Service | Free Tier | Paid |
|---------|-----------|------|
| Supabase | 500MB DB | $25/mo |
| Vercel | 100GB bandwidth | $20/mo |
| Expo EAS | 15 builds/mo | $29/mo |
| Apple | N/A | $99/year |
| Google | N/A | $25 one-time |

---

## Timeline

1. **Backend/DB**: 1 hour
2. **Configure App**: 30 min
3. **Build**: 1-2 hours (waiting)
4. **Submit**: 2-3 hours
5. **Review**: 1-7 days

**Total: 1-2 hours active work, 1-7 days for approval**

---

## Support

- **Full Guides**: See `DEPLOYMENT_GUIDE.md`
- **Quick Start**: See `PRODUCTION_QUICKSTART.md`
- **All Commands**: See `BUILD_SCRIPTS.md`
- **Environment Setup**: See `ENVIRONMENT_SETUP.md`

---

## Status Tracker

```
[ ] Database Setup
[ ] Backend Deployed
[ ] Environment Configured
[ ] Local Testing Complete
[ ] iOS Build Created
[ ] Android Build Created
[ ] iOS Submitted
[ ] Android Submitted
[ ] iOS Approved
[ ] Android Approved
[ ] App Live! 🎉
```

---

**Print or save this reference for quick access during deployment!**
