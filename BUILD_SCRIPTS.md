# 🔨 Build Scripts Reference

This document provides all the commands you'll need for building, deploying, and managing the CBSE Learning Companion app.

---

## Development Scripts

### Local Development

```bash
# Start development server with tunnel (mobile testing)
bun start

# Start web development server
bun start-web

# Start with debug logs
bun start-web-dev

# Run backend locally (for testing)
bun run backend/hono.ts

# Type checking
npx tsc --noEmit

# Linting
bun lint
```

---

## Build Scripts (EAS)

### Prerequisites

```bash
# Install EAS CLI globally
npm install -g eas-cli

# Login to Expo account
eas login

# Configure EAS (first time only)
eas build:configure
```

### Production Builds

```bash
# Build for iOS (App Store)
eas build --platform ios --profile production

# Build for Android (Play Store)
eas build --platform android --profile production

# Build for both platforms
eas build --platform all --profile production

# Check build status
eas build:list
```

### Preview Builds (Testing)

```bash
# iOS simulator build
eas build --platform ios --profile preview

# Android APK for testing
eas build --platform android --profile preview
```

### Development Builds

```bash
# iOS development build
eas build --platform ios --profile development

# Android development build
eas build --platform android --profile development
```

---

## Submission Scripts

### App Store Submission

```bash
# Submit to iOS App Store
eas submit --platform ios

# Submit specific build
eas submit --platform ios --id <build-id>

# Submit with options
eas submit --platform ios --latest --verbose
```

### Google Play Submission

```bash
# Submit to Google Play
eas submit --platform android

# Submit specific build
eas submit --platform android --id <build-id>

# Submit to internal testing track
eas submit --platform android --track internal
```

---

## Over-The-Air (OTA) Updates

```bash
# Publish update to production
eas update --branch production --message "Bug fixes and improvements"

# Publish to staging
eas update --branch staging --message "Testing new features"

# View update history
eas update:list --branch production

# Rollback to previous version
eas update:rollback --branch production
```

---

## Database Management

### Supabase Migrations

```bash
# Connect to Supabase (from dashboard SQL editor)
# Copy and paste migration files:

# 1. Schema setup
# Run: supabase-schema-complete.sql

# 2. Seed data
# Run: supabase-seed-subjects.sql

# Export database (backup)
# Download from Supabase dashboard → Database → Backups
```

### Local Database (if self-hosting)

```bash
# Create backup
pg_dump -h localhost -U postgres cbse_db > backup_$(date +%Y%m%d).sql

# Restore backup
psql -h localhost -U postgres cbse_db < backup_20250129.sql

# Run migrations
psql -h localhost -U postgres cbse_db < supabase-schema-complete.sql
```

---

## Backend Deployment

### Vercel Deployment

```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy to preview
vercel

# Deploy to production
vercel --prod

# View logs
vercel logs <deployment-url>

# Set environment variable
vercel env add SUPABASE_URL production

# Pull environment variables
vercel env pull .env.local
```

### Railway Deployment

```bash
# Install Railway CLI
npm i -g @railway/cli

# Login
railway login

# Initialize project
railway init

# Set environment variables
railway variables set SUPABASE_URL=your-url
railway variables set SUPABASE_ANON_KEY=your-key

# Deploy
railway up

# View logs
railway logs

# Open dashboard
railway open
```

### Self-Hosted Deployment

```bash
# On your server (Ubuntu/Debian)

# Install Bun
curl -fsSL https://bun.sh/install | bash

# Clone repository
git clone <your-repo-url>
cd cbse-learning-companion

# Install dependencies
bun install

# Set up environment
cp .env.example .env.production
nano .env.production

# Start with PM2 (process manager)
npm install -g pm2
pm2 start bun --name cbse-backend -- run backend/hono.ts
pm2 save
pm2 startup

# View logs
pm2 logs cbse-backend

# Restart
pm2 restart cbse-backend

# Stop
pm2 stop cbse-backend
```

---

## Testing Scripts

### Manual Testing

```bash
# Test backend health
curl https://your-backend.com/api/

# Test tRPC endpoint
curl https://your-backend.com/api/trpc/example.hi

# Test Supabase connection
# Use Supabase Studio in dashboard
```

### Automated Testing

```bash
# Run tests (when implemented)
bun test

# E2E tests (when implemented)
bun test:e2e

# Check for type errors
npx tsc --noEmit

# Check for lint errors
bun lint
```

---

## Monitoring & Debugging

### View Logs

```bash
# Vercel logs
vercel logs

# Railway logs
railway logs

# Expo logs (during development)
npx expo start --dev-client

# View build logs
eas build:view <build-id>
```

### Debugging

```bash
# Start with console logs
DEBUG=* bun start

# React Native debugger
# Press 'j' in terminal to open debugger

# View network requests
# Use React Native Debugger app or Flipper
```

---

## Certificate & Credentials

### iOS Certificates

```bash
# View certificates
eas credentials

# Configure push notifications
eas credentials --platform ios

# Revoke and create new
eas credentials --platform ios --clear-provisioning-profile
```

### Android Keystore

```bash
# View keystores
eas credentials --platform android

# Create new keystore
eas credentials --platform android

# Download keystore
eas credentials --platform android --download
```

---

## Maintenance Scripts

### Update Dependencies

```bash
# Update all Expo dependencies
npx expo install --fix

# Update specific package
bun update <package-name>

# Check for outdated packages
bun outdated

# Update EAS CLI
npm update -g eas-cli
```

### Clean & Reset

```bash
# Clear Expo cache
npx expo start -c

# Clear Metro bundler cache
rm -rf node_modules/.cache

# Full clean
rm -rf node_modules
rm bun.lock
bun install

# Reset iOS build
rm -rf ios
npx expo prebuild --platform ios --clean

# Reset Android build
rm -rf android
npx expo prebuild --platform android --clean
```

---

## CI/CD Pipeline Scripts

### GitHub Actions Example

Create `.github/workflows/deploy.yml`:

```yaml
name: Build and Deploy

on:
  push:
    branches: [main]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Bun
        uses: oven-sh/setup-bun@v1
        
      - name: Install dependencies
        run: bun install
        
      - name: Type check
        run: bunx tsc --noEmit
        
      - name: Lint
        run: bun lint
        
      - name: Build iOS
        run: eas build --platform ios --non-interactive --no-wait
        env:
          EXPO_TOKEN: ${{ secrets.EXPO_TOKEN }}
```

---

## Quick Reference Commands

### Most Used Commands

```bash
# Development
bun start                    # Start dev server
bun start-web               # Start web dev server

# Building
eas build --platform all    # Build for both platforms

# Deploying Backend
vercel --prod               # Deploy to Vercel

# Updating App
eas update --branch production --message "Update"

# Submitting
eas submit --platform ios   # Submit to App Store
eas submit --platform android # Submit to Play Store
```

### One-Line Setups

```bash
# Full setup from scratch
git clone <repo> && cd cbse-learning-companion && bun install && cp .env.example .env.local

# Deploy backend to Vercel
npm i -g vercel && vercel --prod

# Build and submit iOS
eas build --platform ios --profile production && eas submit --platform ios --latest

# Build and submit Android
eas build --platform android --profile production && eas submit --platform android --latest
```

---

## Emergency Commands

### Rollback OTA Update

```bash
# List updates
eas update:list --branch production

# Rollback to previous
eas update:rollback --branch production

# Rollback to specific version
eas channel:edit production --branch <branch-id>
```

### Emergency Backend Restart

```bash
# Vercel
vercel rollback <deployment-url>

# Railway
railway rollback

# Self-hosted (PM2)
pm2 restart cbse-backend

# Self-hosted (systemd)
sudo systemctl restart cbse-backend
```

### Database Recovery

```bash
# Restore from Supabase backup (via dashboard)
# Go to: Database → Backups → Restore

# Restore self-hosted
psql -h localhost -U postgres cbse_db < backup.sql
```

---

## Environment-Specific Commands

### Development

```bash
export NODE_ENV=development
bun start
```

### Staging

```bash
export NODE_ENV=staging
eas update --branch staging
```

### Production

```bash
export NODE_ENV=production
eas update --branch production
vercel --prod
```

---

## Useful Aliases (Add to ~/.bashrc or ~/.zshrc)

```bash
# Expo shortcuts
alias expostart="bun start"
alias expoweb="bun start-web"
alias expobuild="eas build --platform all --profile production"
alias exposubmit="eas submit --platform all"

# Backend shortcuts
alias vdeploy="vercel --prod"
alias vlogs="vercel logs"

# Database shortcuts
alias dbbackup="pg_dump -h localhost -U postgres cbse_db > backup_$(date +%Y%m%d).sql"
```

---

## Need Help?

- **EAS Documentation**: https://docs.expo.dev/eas/
- **Vercel Documentation**: https://vercel.com/docs
- **Supabase Documentation**: https://supabase.com/docs
- **Project Docs**: See DEPLOYMENT_GUIDE.md

---

*Keep this reference handy during deployment and maintenance!*
