# 🏗️ Hosting Strategy

This document outlines different hosting strategies for the CBSE Learning Companion app, including cost estimates, scalability, and recommendations.

---

## Architecture Components

The application consists of three main components that need hosting:

1. **Mobile App** (React Native/Expo) - Distributed via App Store/Play Store
2. **Backend API** (Hono + tRPC) - Needs hosting
3. **Database** (PostgreSQL via Supabase) - Managed service

---

## Recommended Strategy (Beginner-Friendly)

### 🎯 Best for: MVPs, small to medium user base (< 10,000 users)

```
Mobile App (Expo) → Backend (Vercel) → Database (Supabase)
                  ↓
            Rork AI Toolkit
```

**Components:**
- **Mobile App**: Distributed via App Store ($99/year) & Google Play ($25 one-time)
- **Backend**: Vercel (Free tier → $20/month Pro)
- **Database**: Supabase (Free tier → $25/month Pro)
- **AI**: Rork AI Toolkit (Included with Rork platform)

**Monthly Cost Estimate:**
- $0 - $50/month (early stage)
- $50 - $200/month (growing)

**Pros:**
- ✅ Quick setup (< 1 hour)
- ✅ Automatic scaling
- ✅ Built-in SSL/HTTPS
- ✅ Generous free tiers
- ✅ Great developer experience
- ✅ Automatic deployments from Git

**Cons:**
- ❌ Vendor lock-in (but easy to migrate)
- ❌ Costs increase with scale
- ❌ Limited customization

---

## Alternative Strategies

### Strategy 1: All-in-One (Supabase Edge Functions)

```
Mobile App → Supabase (Database + Edge Functions + Storage)
```

**Setup:**
- Use Supabase Edge Functions instead of separate backend
- All logic runs on Supabase's infrastructure

**Cost:**
- $25/month (Supabase Pro)
- AI costs separate (if using OpenAI directly)

**Pros:**
- ✅ Single platform to manage
- ✅ Lowest latency (everything in one place)
- ✅ Integrated auth and storage

**Cons:**
- ❌ Edge Functions have limitations (Deno runtime)
- ❌ Harder to migrate away from Supabase
- ❌ Less flexibility for complex backend logic

**When to Use:**
- Simple apps with minimal backend logic
- Want to minimize infrastructure complexity
- Already invested in Supabase ecosystem

---

### Strategy 2: Self-Hosted (VPS)

```
Mobile App → VPS (Backend + Database) → Optional CDN
```

**Setup:**
- Rent a VPS (DigitalOcean, Hetzner, Linode)
- Run PostgreSQL and Node.js backend
- Configure Nginx, SSL, monitoring

**Cost:**
- $12 - $40/month (VPS)
- $0 - $20/month (CDN like CloudFlare)
- Total: $12 - $60/month

**Pros:**
- ✅ Full control over infrastructure
- ✅ Predictable costs
- ✅ Can optimize for performance
- ✅ No vendor lock-in

**Cons:**
- ❌ Requires DevOps expertise
- ❌ Manual scaling
- ❌ You manage backups, security, updates
- ❌ Higher time investment

**When to Use:**
- Have DevOps experience
- Want maximum control
- Long-term cost optimization
- Specific compliance requirements

**Recommended VPS Providers:**
- **DigitalOcean**: $12/month (1GB RAM, 1 CPU) - User-friendly
- **Hetzner**: $5/month (2GB RAM, 1 CPU) - Best value
- **Linode**: $12/month (2GB RAM, 1 CPU) - Reliable
- **Vultr**: $12/month (2GB RAM, 1 CPU) - Good performance

---

### Strategy 3: Enterprise (AWS/GCP/Azure)

```
Mobile App → Load Balancer → Container Cluster (ECS/GKE/AKS)
                           ↓
                       RDS Database
                           ↓
                    S3/Cloud Storage
```

**Cost:**
- $200 - $1,000+/month (depending on traffic)

**Pros:**
- ✅ Maximum scalability
- ✅ Advanced features (auto-scaling, multi-region)
- ✅ Enterprise-grade security
- ✅ Best for high traffic (100K+ users)

**Cons:**
- ❌ Complex setup
- ❌ Expensive
- ❌ Overkill for most apps
- ❌ Requires dedicated DevOps team

**When to Use:**
- Proven product with large user base
- Enterprise customers
- Compliance requirements (HIPAA, SOC2)
- Multi-region deployment needed

---

## Detailed Setup: Recommended Strategy

### Step-by-Step: Vercel + Supabase

#### 1. Setup Supabase (Database)

**Cost**: Free tier (50,000 MAU, 500MB database, 1GB storage)

1. Sign up at https://supabase.com
2. Create new project
3. Run SQL migrations (see DEPLOYMENT_GUIDE.md)
4. Configure storage bucket
5. Get API keys

**Upgrade to Pro** ($25/month) when:
- Database size > 500MB
- Need > 2GB storage
- Want daily backups
- Need 7-day log retention

#### 2. Setup Vercel (Backend)

**Cost**: Free tier (100GB bandwidth, unlimited requests)

1. Sign up at https://vercel.com
2. Connect GitHub repository
3. Configure build settings:
   - Framework Preset: Other
   - Build Command: (leave empty)
   - Output Directory: (leave empty)
4. Add environment variables
5. Deploy

**Upgrade to Pro** ($20/month) when:
- Bandwidth > 100GB/month
- Need team collaboration
- Want faster builds
- Need advanced analytics

#### 3. Setup Expo (Mobile App)

**Cost**: Free (EAS build: 15 builds/month free)

1. Sign up at https://expo.dev
2. Install EAS CLI: `npm install -g eas-cli`
3. Configure: `eas build:configure`
4. Build: `eas build --platform all --profile production`

**Upgrade to Production** ($29/month) when:
- Need unlimited builds
- Want priority build queue
- Need 30-day build retention

#### 4. Setup App Stores

**iOS**: $99/year (Apple Developer Program)
**Android**: $25 one-time (Google Play Developer)

---

## Cost Comparison Table

| Strategy | Setup Time | Monthly Cost (Start) | Monthly Cost (10K users) | Scaling Difficulty |
|----------|------------|---------------------|-------------------------|-------------------|
| Vercel + Supabase | 1-2 hours | $0 - $25 | $50 - $100 | Easy ⭐⭐⭐ |
| Supabase All-in-One | 2-3 hours | $25 | $50 - $100 | Easy ⭐⭐⭐ |
| Self-Hosted VPS | 1-2 days | $12 - $40 | $40 - $100 | Hard ⭐ |
| AWS/GCP/Azure | 1-2 weeks | $200+ | $500+ | Complex ⭐⭐ |

---

## Scaling Timeline & Migration Plan

### Stage 1: Launch (0 - 1,000 users)
**Use**: Vercel Free + Supabase Free
- Cost: $0/month
- Plenty of resources for testing and early users

### Stage 2: Growth (1,000 - 10,000 users)
**Use**: Vercel Pro + Supabase Pro
- Cost: $45/month
- Better performance, backups, support

### Stage 3: Established (10,000 - 100,000 users)
**Options:**
1. Stay on Vercel + Supabase with higher tiers ($150 - $300/month)
2. Migrate to self-hosted VPS ($100 - $200/month)
3. Move to AWS/GCP for better pricing at scale

### Stage 4: Enterprise (100,000+ users)
**Use**: AWS/GCP with dedicated DevOps
- Cost: $500 - $2,000/month
- Multi-region, auto-scaling, high availability

---

## Geographic Considerations

### Choosing Regions

**Supabase Regions:**
- Choose closest to target users for lowest latency
- For India: Singapore or Mumbai (if available)
- For global: US East (Virginia) for good worldwide coverage

**Vercel Regions:**
- Automatically deploys to edge network
- No configuration needed
- 84+ locations worldwide

**Self-Hosted:**
- For Indian users: AWS Mumbai, Azure Mumbai, or Hetzner Germany
- Consider CDN (CloudFlare) for static assets

---

## Monitoring & Costs Management

### Essential Monitoring

1. **Application Performance**
   - Response times
   - Error rates
   - API usage

2. **Infrastructure Costs**
   - Database size growth
   - API calls/bandwidth
   - Storage usage

3. **User Metrics**
   - Daily Active Users (DAU)
   - Cost per user
   - Feature usage

### Cost Optimization Tips

1. **Database**
   - Enable RLS to prevent unauthorized access
   - Add indexes for frequently queried fields
   - Archive old data to reduce size

2. **Backend**
   - Implement caching where possible
   - Optimize AI calls (don't regenerate same content)
   - Use pagination for large data sets

3. **Storage**
   - Compress images before upload
   - Set retention policies for logs
   - Clean up unused files regularly

4. **AI Costs**
   - Cache frequently asked questions
   - Optimize prompts to reduce token usage
   - Set rate limits per user

---

## Disaster Recovery & Backups

### Supabase
- **Free Tier**: Manual backups only
- **Pro Tier**: Daily automated backups (7 days retention)
- **Export regularly**: pg_dump for safety

### Self-Hosted
- **Daily backups** using cron + pg_dump
- Store in different location (S3, BackBlaze)
- Test restore procedure monthly

### Application Data
- User-uploaded images: Mirror to S3 or BackBlaze
- Critical data: Export to CSV/JSON weekly
- Keep copy of environment variables securely

---

## Security Checklist

### Database
- [ ] RLS enabled on all tables
- [ ] Only necessary permissions granted
- [ ] Regular security updates
- [ ] Monitor for unusual access patterns

### Backend
- [ ] HTTPS only (no HTTP)
- [ ] CORS configured correctly
- [ ] Rate limiting enabled
- [ ] Input validation on all endpoints
- [ ] Secrets in environment variables (never in code)

### Mobile App
- [ ] API keys properly scoped (anon key only)
- [ ] Sensitive data encrypted on device
- [ ] Code obfuscation enabled
- [ ] Certificate pinning (for high security needs)

---

## Recommended Tools

### Development
- **Local Backend**: Bun (faster than Node.js)
- **Database GUI**: Supabase Studio (built-in)
- **API Testing**: Postman or Thunder Client (VS Code)
- **Mobile Testing**: Expo Go app (iOS/Android)

### Production
- **Monitoring**: Sentry (errors), Vercel Analytics
- **Logging**: Supabase Dashboard, Vercel Logs
- **Uptime**: UptimeRobot (free) or Better Uptime
- **Analytics**: Built-in admin dashboard + Expo Analytics

### DevOps (Self-Hosted)
- **Server Management**: PM2, systemd
- **Reverse Proxy**: Nginx or Caddy
- **SSL**: Let's Encrypt (via Certbot)
- **Monitoring**: Grafana + Prometheus
- **Logs**: Loki or ELK stack

---

## Migration Paths

### From Vercel to Self-Hosted

1. Set up VPS with Node.js/Bun
2. Clone repository
3. Install dependencies
4. Configure environment
5. Run backend as service (systemd)
6. Update `EXPO_PUBLIC_RORK_API_BASE_URL`
7. Test thoroughly
8. Switch DNS/update app config
9. Monitor for 24 hours

### From Supabase to Self-Hosted Database

1. Export data: `pg_dump`
2. Set up PostgreSQL on VPS
3. Import data: `psql`
4. Update connection strings
5. Test all queries
6. Gradual migration (read from new, write to both)
7. Full cutover

---

## Conclusion

**For most teams launching CBSE Learning Companion:**

🏆 **Start with**: Vercel + Supabase
- Fast setup
- Generous free tiers
- Easy to scale
- Can migrate later if needed

**Scale up when:**
- Costs become significant (>$200/month)
- Need more control
- Have DevOps expertise in-house

**Remember:** The best hosting strategy is one that:
1. Gets you to market quickly
2. Scales with your growth
3. Fits your budget
4. Matches your team's skills

---

*Questions? Check DEPLOYMENT_GUIDE.md or reach out to support.*
