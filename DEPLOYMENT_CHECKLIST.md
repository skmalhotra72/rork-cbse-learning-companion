# 🚀 Deployment Checklist

Use this checklist to ensure all deployment steps are completed correctly.

---

## Pre-Deployment Preparation

### 1. Code & Repository
- [ ] All features tested locally
- [ ] Code reviewed and approved
- [ ] No sensitive data (API keys, passwords) in code
- [ ] `.gitignore` includes `.env.local`, `node_modules`, etc.
- [ ] README.md updated with project info
- [ ] Version number updated in `app.json` and `package.json`

### 2. Environment Configuration
- [ ] `.env.example` created with all required variables
- [ ] Production `.env.local` prepared (DO NOT COMMIT)
- [ ] All environment variables documented
- [ ] Feature flags configured for production

---

## Database Setup

### Supabase Configuration
- [ ] Supabase project created
- [ ] Database password saved securely
- [ ] Region selected (closest to target users)

### Schema & Data
- [ ] `supabase-schema-complete.sql` executed successfully
- [ ] `supabase-seed-subjects.sql` executed successfully
- [ ] All tables created and verified
- [ ] Row Level Security (RLS) enabled on all tables
- [ ] RLS policies tested with different user roles

### Storage
- [ ] `uploads` bucket created
- [ ] Storage policies configured for authenticated users
- [ ] File upload tested from app

### API Keys
- [ ] Supabase URL saved to environment
- [ ] Anon key saved to environment
- [ ] Service role key saved securely (backend only)
- [ ] Keys added to `app.json` extra config

### Backup & Recovery
- [ ] Automatic backup enabled in Supabase
- [ ] Backup schedule configured
- [ ] Recovery procedure documented

---

## Backend Deployment

### Pre-Deploy
- [ ] Backend code tested locally
- [ ] All tRPC routes working
- [ ] Error handling implemented
- [ ] Logging configured
- [ ] CORS settings verified

### Hosting Platform (Choose One)

#### ☐ Vercel
- [ ] Vercel account created
- [ ] `vercel.json` configured
- [ ] Project created in Vercel dashboard
- [ ] Environment variables added in Vercel
- [ ] Deployed with `vercel --prod`
- [ ] Custom domain configured (optional)
- [ ] SSL certificate verified

#### ☐ Railway
- [ ] Railway account created
- [ ] Railway CLI installed
- [ ] Project initialized
- [ ] Environment variables set
- [ ] Deployed with `railway up`
- [ ] Custom domain configured (optional)

#### ☐ Self-Hosted VPS
- [ ] Server provisioned (Ubuntu 22.04+ recommended)
- [ ] Node.js/Bun installed
- [ ] Application cloned to server
- [ ] Dependencies installed
- [ ] Systemd service created and enabled
- [ ] Nginx/Apache configured as reverse proxy
- [ ] SSL certificate obtained (Let's Encrypt)
- [ ] Firewall configured
- [ ] Monitoring setup (PM2, systemd logs)

### Post-Deploy
- [ ] Backend URL accessible: `https://your-backend.com/api/`
- [ ] Health check endpoint returns 200 OK
- [ ] tRPC endpoint accessible: `https://your-backend.com/api/trpc`
- [ ] HTTPS working (no mixed content warnings)
- [ ] Backend URL added to `EXPO_PUBLIC_RORK_API_BASE_URL`

---

## Mobile App Configuration

### App Metadata
- [ ] App name finalized
- [ ] Bundle identifier/package name set (unique)
- [ ] Version number set (1.0.0 for initial release)
- [ ] App description written
- [ ] Keywords chosen for ASO (App Store Optimization)

### Assets
- [ ] App icon created (1024x1024 PNG)
- [ ] Splash screen created
- [ ] Adaptive icon created (Android)
- [ ] Favicon created (Web)
- [ ] All assets optimized and compressed

### Privacy & Legal
- [ ] Privacy policy created and hosted
- [ ] Terms of service created and hosted
- [ ] URLs added to app.json
- [ ] Data collection practices documented
- [ ] COPPA compliance verified (if targeting users under 13)

### Permissions
- [ ] Camera permission reason set
- [ ] Photo library permission reason set
- [ ] Microphone permission reason set (if used)
- [ ] All permission descriptions user-friendly

---

## Build & Submit

### EAS Setup
- [ ] EAS CLI installed: `npm install -g eas-cli`
- [ ] Expo account created
- [ ] Logged in: `eas login`
- [ ] EAS configured: `eas build:configure`
- [ ] `eas.json` reviewed and customized

### iOS Build
- [ ] Apple Developer Account active ($99/year)
- [ ] App created in App Store Connect
- [ ] Bundle identifier matches App Store Connect
- [ ] Team ID added to `eas.json` (if applicable)
- [ ] Production build created: `eas build --platform ios --profile production`
- [ ] Build successful and downloaded

### Android Build
- [ ] Google Play Developer Account active ($25 one-time)
- [ ] App created in Google Play Console
- [ ] Package name matches Google Play Console
- [ ] Signing key configured (EAS can auto-generate)
- [ ] Production build created: `eas build --platform android --profile production`
- [ ] Build successful and downloaded

### Testing Builds
- [ ] iOS build tested on physical iPhone
- [ ] Android build tested on physical Android device
- [ ] All critical flows tested on both platforms
- [ ] Performance acceptable on low-end devices
- [ ] Web version tested in Chrome, Safari, Firefox

---

## App Store Submission

### iOS App Store
- [ ] App Store Connect listing filled out:
  - [ ] App name
  - [ ] Subtitle
  - [ ] Description
  - [ ] Keywords
  - [ ] Support URL
  - [ ] Marketing URL
  - [ ] Screenshots (all required sizes)
  - [ ] Privacy policy URL
- [ ] Age rating completed
- [ ] Pricing & availability set
- [ ] App Review Information filled out
- [ ] Build uploaded: `eas submit --platform ios`
- [ ] Build selected in App Store Connect
- [ ] Submitted for review
- [ ] Reviewed and approved

### Google Play Store
- [ ] Google Play Console listing filled out:
  - [ ] App name
  - [ ] Short description
  - [ ] Full description
  - [ ] Screenshots (all required sizes)
  - [ ] Feature graphic
  - [ ] App icon
  - [ ] Privacy policy URL
- [ ] Content rating completed
- [ ] Pricing & distribution set
- [ ] App content declarations completed
- [ ] Build uploaded: `eas submit --platform android`
- [ ] Release created (Production, Open Testing, or Closed Testing)
- [ ] Submitted for review
- [ ] Reviewed and approved

---

## Post-Launch

### Monitoring & Analytics
- [ ] Error tracking configured (Sentry, Bugsnag, etc.)
- [ ] Analytics dashboard accessible
- [ ] User activity being tracked
- [ ] AI logs being recorded
- [ ] Database performance monitored
- [ ] Backend uptime monitored

### User Support
- [ ] Support email set up
- [ ] FAQ/Help section created
- [ ] Feedback mechanism in app
- [ ] Social media accounts created (optional)
- [ ] Community forum/Discord set up (optional)

### OTA Updates
- [ ] OTA update strategy defined
- [ ] Update channel configured
- [ ] Test update published to verify system works
- [ ] Rollback procedure documented

### Marketing & Launch
- [ ] App Store screenshots optimized
- [ ] Launch announcement prepared
- [ ] Social media posts scheduled
- [ ] Press release drafted (if applicable)
- [ ] Beta testers notified
- [ ] Landing page created (optional)

---

## Week 1 Post-Launch

### Daily Tasks
- [ ] **Day 1**: Monitor error logs hourly
- [ ] **Day 1**: Check user feedback/reviews
- [ ] **Day 1**: Verify all core features working in production
- [ ] **Day 2-3**: Respond to user reviews
- [ ] **Day 2-3**: Fix critical bugs if any
- [ ] **Day 4-7**: Analyze usage patterns
- [ ] **Day 4-7**: Identify most used vs. least used features
- [ ] **Day 7**: Weekly metrics review (downloads, DAU, retention)

### Metrics to Track
- [ ] Total downloads
- [ ] Daily Active Users (DAU)
- [ ] Registration conversion rate
- [ ] Feature usage (diagnostics, quizzes, bridge mode)
- [ ] Error rate & types
- [ ] App crashes
- [ ] Average session duration
- [ ] User retention (Day 1, Day 7, Day 30)
- [ ] App Store ratings & reviews

---

## Ongoing Maintenance

### Weekly
- [ ] Review user feedback and ratings
- [ ] Check error logs for new issues
- [ ] Monitor database performance
- [ ] Review AI logs for prompt improvements
- [ ] Backup verification

### Monthly
- [ ] Update dependencies (security patches)
- [ ] Review and optimize database queries
- [ ] Analyze user behavior trends
- [ ] Plan new features based on feedback
- [ ] Review and optimize AI costs
- [ ] Check storage usage and costs

### Quarterly
- [ ] Major dependency updates
- [ ] Performance optimization sprint
- [ ] Security audit
- [ ] UX/UI improvements
- [ ] Feature roadmap review
- [ ] Infrastructure scaling assessment

---

## Emergency Procedures

### App Crash/Critical Bug
1. [ ] Identify affected version
2. [ ] Push hotfix via OTA if possible
3. [ ] If OTA not sufficient, prepare emergency build
4. [ ] Submit expedited review to App Store (if critical)
5. [ ] Notify users via in-app message or social media

### Database Issues
1. [ ] Check Supabase status page
2. [ ] Verify RLS policies
3. [ ] Check connection limits
4. [ ] Review query performance
5. [ ] Restore from backup if needed

### Backend Outage
1. [ ] Check hosting platform status
2. [ ] Review server logs
3. [ ] Verify environment variables
4. [ ] Restart service
5. [ ] Scale up if traffic spike
6. [ ] Communicate status to users

---

## Success Criteria

### Launch Goals (First 30 Days)
- [ ] 1,000+ downloads
- [ ] 4.0+ star rating
- [ ] <1% crash rate
- [ ] 50%+ Day 1 retention
- [ ] 20%+ Day 7 retention
- [ ] 100+ active students completing diagnostics
- [ ] 50+ active parents setting up rewards

### Long-Term Goals (3-6 Months)
- [ ] 10,000+ downloads
- [ ] 4.5+ star rating
- [ ] <0.5% crash rate
- [ ] 70%+ Day 1 retention
- [ ] 40%+ Day 7 retention
- [ ] 20%+ Day 30 retention
- [ ] Feature requests & roadmap prioritized
- [ ] Positive user testimonials & case studies

---

## Notes & Reminders

**Important:**
- Never commit API keys or secrets to Git
- Always test on physical devices before submission
- Keep backups of signing keys and passwords
- Document all production credentials securely (use password manager)
- Set up 2FA on all accounts (Expo, Supabase, hosting, etc.)

**Contact Information:**
- Expo Support: https://expo.dev/support
- Supabase Support: https://supabase.com/support
- Apple Developer Support: https://developer.apple.com/support/
- Google Play Support: https://support.google.com/googleplay/android-developer

---

*Use this checklist for every major release. Make a copy and check off items as you complete them.*
