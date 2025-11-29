# 🔐 Environment Variables Setup Guide

Complete guide to configuring environment variables for all deployment scenarios.

---

## Understanding Environment Variables

### Types of Variables

1. **Backend-Only** (Server-side)
   - Prefix: None (e.g., `SUPABASE_SERVICE_ROLE_KEY`)
   - Access: Only in backend code
   - Security: Never exposed to frontend
   - Use: API keys, service role keys, secrets

2. **Frontend-Accessible** (Client-side)
   - Prefix: `EXPO_PUBLIC_` (e.g., `EXPO_PUBLIC_SUPABASE_URL`)
   - Access: Available in React Native code
   - Security: Public - users can see these
   - Use: API endpoints, public keys

3. **Both**
   - Some values need both versions
   - Example: `SUPABASE_URL` (backend) and `EXPO_PUBLIC_SUPABASE_URL` (frontend)

---

## File Structure

```
project-root/
├── .env.local          # Local development (gitignored)
├── .env.example        # Template (committed to Git)
├── .env.production     # Production (gitignored, if self-hosting)
├── .env.staging        # Staging (gitignored, if needed)
└── app.json           # Expo config (contains EXPO_PUBLIC_* vars)
```

---

## Required Variables

### 1. Supabase Configuration

#### Backend + Frontend

```env
# Backend access (server-side only)
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=eyJhbGci...your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=eyJhbGci...your-service-role-key-here

# Frontend access (exposed to app)
EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJhbGci...your-anon-key-here
```

**Where to get:**
- Supabase Dashboard → Settings → API
- URL: Project URL
- Anon Key: `anon` `public` key
- Service Role: `service_role` key (⚠️ keep secret!)

**Security Notes:**
- ✅ OK to expose: `EXPO_PUBLIC_SUPABASE_URL`, `EXPO_PUBLIC_SUPABASE_ANON_KEY`
- ❌ NEVER expose: `SUPABASE_SERVICE_ROLE_KEY`
- Anon key is safe because it's protected by Row Level Security (RLS)

### 2. Backend API URL

```env
# Your deployed backend URL
EXPO_PUBLIC_RORK_API_BASE_URL=https://your-backend.vercel.app
```

**Where to get:**
- After deploying backend to Vercel/Railway/VPS
- Your backend domain (with HTTPS)
- Local development: Auto-set by Rork CLI

### 3. AI Toolkit

```env
# Rork AI Toolkit endpoint
EXPO_PUBLIC_TOOLKIT_URL=https://toolkit.rork.com
```

**Where to get:**
- Default: `https://toolkit.rork.com` (if using Rork platform)
- Custom: Your own AI service URL (if self-hosting)

### 4. App Configuration

```env
# Environment type
NODE_ENV=production

# App version (optional, can also be in app.json)
APP_VERSION=1.0.0

# Storage bucket name (optional, defaults to 'uploads')
SUPABASE_STORAGE_BUCKET=uploads
```

---

## Optional Variables

### Analytics & Monitoring

```env
# Sentry (Error tracking)
SENTRY_DSN=https://your-sentry-dsn@sentry.io/project

# Amplitude (Analytics)
AMPLITUDE_API_KEY=your-amplitude-key

# Google Analytics (Web)
GA_TRACKING_ID=UA-XXXXXXXXX-X
```

### Feature Flags

```env
# Enable/disable features
ENABLE_ADMIN_ANALYTICS=true
ENABLE_DIAGNOSTICS=true
ENABLE_GAMIFICATION=true
ENABLE_REWARDS=true
ENABLE_TEXTBOOK_HELP=true
ENABLE_DEBUG_LOGS=false
```

### Rate Limiting

```env
# API rate limits (if implementing custom limits)
RATE_LIMIT_WINDOW_MS=60000
RATE_LIMIT_MAX_REQUESTS=100
```

### Email (if adding email features)

```env
# Email service (SendGrid, Mailgun, etc.)
EMAIL_SERVICE_API_KEY=your-email-api-key
EMAIL_FROM=noreply@yourapp.com
```

---

## Setting Up for Different Environments

### Local Development

**File**: `.env.local`

```env
# Supabase (development project)
SUPABASE_URL=https://dev-project.supabase.co
SUPABASE_ANON_KEY=dev-anon-key
SUPABASE_SERVICE_ROLE_KEY=dev-service-role-key

EXPO_PUBLIC_SUPABASE_URL=https://dev-project.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=dev-anon-key

# Backend (auto-set by Rork CLI)
EXPO_PUBLIC_RORK_API_BASE_URL=

# AI Toolkit
EXPO_PUBLIC_TOOLKIT_URL=https://toolkit.rork.com

# Development flags
NODE_ENV=development
ENABLE_DEBUG_LOGS=true
```

**How to use:**
```bash
# Copy example
cp .env.example .env.local

# Edit with your values
nano .env.local

# Start app
bun start
```

### Staging/Testing

**File**: `.env.staging`

```env
# Supabase (staging project)
SUPABASE_URL=https://staging-project.supabase.co
SUPABASE_ANON_KEY=staging-anon-key
SUPABASE_SERVICE_ROLE_KEY=staging-service-role-key

EXPO_PUBLIC_SUPABASE_URL=https://staging-project.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=staging-anon-key

# Backend (staging URL)
EXPO_PUBLIC_RORK_API_BASE_URL=https://staging-backend.vercel.app

# AI Toolkit
EXPO_PUBLIC_TOOLKIT_URL=https://toolkit.rork.com

# Staging flags
NODE_ENV=staging
ENABLE_DEBUG_LOGS=true
ENABLE_ADMIN_ANALYTICS=true
```

**How to use:**
```bash
# Load staging environment
export $(cat .env.staging | xargs)

# Build for staging
eas build --profile staging
```

### Production

**Backend (Vercel):**
- Set in Vercel Dashboard → Project Settings → Environment Variables
- Each variable added individually
- Mark as "Production" environment

**Backend (Railway):**
```bash
railway variables set SUPABASE_URL=your-url
railway variables set SUPABASE_ANON_KEY=your-key
railway variables set SUPABASE_SERVICE_ROLE_KEY=your-key
railway variables set NODE_ENV=production
```

**Mobile App (app.json):**
```json
{
  "expo": {
    "extra": {
      "EXPO_PUBLIC_SUPABASE_URL": "https://prod.supabase.co",
      "EXPO_PUBLIC_SUPABASE_ANON_KEY": "prod-anon-key"
    }
  }
}
```

---

## Platform-Specific Setup

### Vercel

1. Go to Project Settings → Environment Variables
2. Add each variable:
   - Name: `SUPABASE_URL`
   - Value: `https://your-project.supabase.co`
   - Environment: Production, Preview, Development
3. Click "Save"
4. Redeploy project

**CLI Method:**
```bash
# Add variable
vercel env add SUPABASE_URL production

# Pull variables to local
vercel env pull .env.local
```

### Railway

```bash
# Set variables
railway variables set KEY=value

# View variables
railway variables

# Delete variable
railway variables delete KEY
```

### Heroku

```bash
# Set variables
heroku config:set SUPABASE_URL=your-url

# View variables
heroku config

# Delete variable
heroku config:unset KEY
```

### Netlify

1. Site Settings → Build & deploy → Environment
2. Add environment variable
3. Click "Save"

### Self-Hosted (systemd)

**File**: `/etc/systemd/system/cbse-backend.service`

```ini
[Service]
Environment="SUPABASE_URL=https://your-project.supabase.co"
Environment="SUPABASE_ANON_KEY=your-key"
Environment="SUPABASE_SERVICE_ROLE_KEY=your-key"
Environment="NODE_ENV=production"
```

Or use environment file:
```ini
[Service]
EnvironmentFile=/var/www/cbse-learning-companion/.env.production
```

---

## EAS Build Configuration

### eas.json

```json
{
  "build": {
    "development": {
      "env": {
        "NODE_ENV": "development"
      }
    },
    "preview": {
      "env": {
        "NODE_ENV": "staging"
      }
    },
    "production": {
      "env": {
        "NODE_ENV": "production"
      }
    }
  }
}
```

### EAS Secrets

For sensitive values during build:

```bash
# Add secret
eas secret:create --scope project --name SUPABASE_SERVICE_ROLE_KEY --value your-key

# List secrets
eas secret:list

# Delete secret
eas secret:delete --name SUPABASE_SERVICE_ROLE_KEY
```

Use in eas.json:
```json
{
  "build": {
    "production": {
      "env": {
        "SUPABASE_SERVICE_ROLE_KEY": "@SUPABASE_SERVICE_ROLE_KEY"
      }
    }
  }
}
```

---

## Accessing Variables in Code

### Backend (Node.js/Bun)

```typescript
// Direct access
const supabaseUrl = process.env.SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// With validation
if (!process.env.SUPABASE_URL) {
  throw new Error('SUPABASE_URL is not set');
}

// From .env file (development)
// Bun automatically loads .env, .env.local
// Node.js needs: require('dotenv').config()
```

### Frontend (React Native)

```typescript
import Constants from 'expo-constants';

// Method 1: From expo-constants (recommended)
const supabaseUrl = Constants.expoConfig?.extra?.EXPO_PUBLIC_SUPABASE_URL;
const anonKey = Constants.expoConfig?.extra?.EXPO_PUBLIC_SUPABASE_ANON_KEY;

// Method 2: Direct access (works if EXPO_PUBLIC_ prefix)
const apiUrl = process.env.EXPO_PUBLIC_RORK_API_BASE_URL;

// With fallback
const url = Constants.expoConfig?.extra?.EXPO_PUBLIC_SUPABASE_URL || 
            process.env.EXPO_PUBLIC_SUPABASE_URL;
```

### In app.json

```json
{
  "expo": {
    "extra": {
      "EXPO_PUBLIC_SUPABASE_URL": "https://project.supabase.co",
      "EXPO_PUBLIC_SUPABASE_ANON_KEY": "key"
    }
  }
}
```

---

## Security Best Practices

### ✅ DO:

1. **Use `.env.local` for local development**
   - Never commit to Git
   - Add to `.gitignore`

2. **Keep service role keys secret**
   - Only in backend code
   - Only in secure environment variables
   - Never in frontend code or Git

3. **Use different keys for dev/staging/prod**
   - Separate Supabase projects
   - Separate API endpoints
   - Easy to test without affecting production

4. **Rotate keys regularly**
   - Generate new keys every 3-6 months
   - Immediately if compromised
   - Update all environments

5. **Use password managers for team**
   - 1Password, LastPass, Bitwarden
   - Share securely with team members
   - Track who has access

### ❌ DON'T:

1. **Never commit secrets to Git**
   ```bash
   # Always in .gitignore:
   .env.local
   .env.production
   .env.staging
   ```

2. **Don't expose service role keys**
   ```typescript
   // ❌ WRONG - exposes secret
   const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
   return { key };
   
   // ✅ RIGHT - use internally only
   const supabase = createClient(url, process.env.SUPABASE_SERVICE_ROLE_KEY);
   ```

3. **Don't hardcode values**
   ```typescript
   // ❌ WRONG
   const url = "https://myproject.supabase.co";
   
   // ✅ RIGHT
   const url = process.env.EXPO_PUBLIC_SUPABASE_URL;
   ```

4. **Don't share keys in chat/email**
   - Use secure methods (password managers, encrypted storage)
   - Rotate keys if accidentally shared

---

## Troubleshooting

### Variables not loading

**Problem**: `undefined` when accessing `process.env.VARIABLE_NAME`

**Solutions:**

1. **Check variable name prefix**
   - Frontend: Must start with `EXPO_PUBLIC_`
   - Backend: No prefix needed

2. **Restart development server**
   ```bash
   # Stop server (Ctrl+C)
   # Start again
   bun start
   ```

3. **Clear Expo cache**
   ```bash
   npx expo start -c
   ```

4. **Verify file is loaded**
   ```bash
   # Check .env.local exists
   ls -la .env.local
   
   # Print variables (careful not to expose secrets!)
   echo $EXPO_PUBLIC_SUPABASE_URL
   ```

### Variables not working in production

**Problem**: App works locally but not in production

**Solutions:**

1. **Verify environment variables in hosting platform**
   - Vercel: Project Settings → Environment Variables
   - Railway: `railway variables`
   - Check spelling and values

2. **Check app.json**
   - `extra` object should contain `EXPO_PUBLIC_*` variables
   - Rebuild app after changing

3. **Rebuild app**
   ```bash
   eas build --platform all --profile production
   ```

### "Invalid API key" errors

**Problem**: Supabase returns 401 or "Invalid API key"

**Solutions:**

1. **Check key is correct**
   - Copy again from Supabase Dashboard → Settings → API
   - No extra spaces or newlines

2. **Verify key type**
   - Frontend: Use `anon` public key
   - Backend: Use `service_role` key for admin operations

3. **Check RLS policies**
   - Ensure policies allow the operation
   - Test with `service_role` key to rule out RLS issues

---

## Environment Variables Checklist

### Development Setup
- [ ] `.env.local` created from `.env.example`
- [ ] Supabase credentials added
- [ ] Variables load correctly
- [ ] App connects to development database
- [ ] Backend API accessible locally

### Staging Setup (if applicable)
- [ ] `.env.staging` created
- [ ] Separate Supabase project
- [ ] Staging backend deployed
- [ ] Variables set in staging environment
- [ ] Can test without affecting production

### Production Setup
- [ ] Backend environment variables set (Vercel/Railway/VPS)
- [ ] `app.json` updated with production values
- [ ] All secrets rotated (different from dev)
- [ ] Variables tested in production build
- [ ] No development/staging values in production

### Security
- [ ] `.env.local` in `.gitignore`
- [ ] No secrets committed to Git
- [ ] Service role keys only in backend
- [ ] Team uses password manager
- [ ] Keys documented securely

---

## Quick Reference

### Most Important Variables

```env
# Must have for app to work
EXPO_PUBLIC_SUPABASE_URL=
EXPO_PUBLIC_SUPABASE_ANON_KEY=
EXPO_PUBLIC_RORK_API_BASE_URL=
EXPO_PUBLIC_TOOLKIT_URL=

# Backend only
SUPABASE_SERVICE_ROLE_KEY=
```

### Getting Started Commands

```bash
# Setup
cp .env.example .env.local
nano .env.local

# Test locally
bun start

# Deploy backend
vercel --prod

# Build app
eas build --platform all
```

---

*Keep this guide handy when setting up new environments or troubleshooting configuration issues!*
