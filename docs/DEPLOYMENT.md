# AI Tools Explorer - Deployment Guide

<div align="center">
  <h3>🚀 Deployment & Hosting Instructions</h3>
  <p>Deploy your AI Tools Explorer to production</p>
</div>

---

## 📖 Table of Contents

1. [Prerequisites](#prerequisites)
2. [Environment Variables](#environment-variables)
3. [Deployment Options](#deployment-options)
4. [Vercel Deployment](#vercel-deployment)
5. [Netlify Deployment](#netlify-deployment)
6. [Self-Hosting](#self-hosting)
7. [Database Setup](#database-setup)
8. [Edge Functions](#edge-functions)
9. [Custom Domain](#custom-domain)
10. [Monitoring & Maintenance](#monitoring--maintenance)

---

## ✅ Prerequisites

Before deploying, ensure you have:

- [ ] GitHub repository with latest code
- [ ] Supabase project (or Lovable Cloud)
- [ ] Environment variables ready
- [ ] Database migrations applied
- [ ] Edge functions configured

---

## 🔐 Environment Variables

### Required Variables

| Variable | Description | Where to Get |
|----------|-------------|--------------|
| `VITE_SUPABASE_URL` | Supabase project URL | Supabase Dashboard → Settings → API |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | Supabase anon key | Supabase Dashboard → Settings → API |

### Optional Variables

| Variable | Description |
|----------|-------------|
| `VITE_SITE_URL` | Production site URL |

### Edge Function Secrets

Configure in Supabase Dashboard → Edge Functions → Secrets:

| Secret | Description |
|--------|-------------|
| `RESEND_API_KEY` | Email service API key |
| `LOVABLE_API_KEY` | AI recommendations API |

---

## 🌐 Deployment Options

| Platform | Best For | Complexity |
|----------|----------|------------|
| **Vercel** | Speed, DX, automatic deploys | ⭐ Easy |
| **Netlify** | JAMstack, forms, functions | ⭐ Easy |
| **Cloudflare Pages** | Global CDN, Workers | ⭐⭐ Medium |
| **Railway** | Full-stack, databases | ⭐⭐ Medium |
| **Self-hosted** | Full control, compliance | ⭐⭐⭐ Advanced |

---

## 🔺 Vercel Deployment

### Automatic Deployment (Recommended)

1. **Connect Repository**
   - Go to [vercel.com](https://vercel.com)
   - Sign in with GitHub
   - Click "Add New Project"
   - Select your repository

2. **Configure Project**
   - Framework Preset: `Vite`
   - Build Command: `npm run build`
   - Output Directory: `dist`

3. **Add Environment Variables**
   ```
   VITE_SUPABASE_URL = your_supabase_url
   VITE_SUPABASE_PUBLISHABLE_KEY = your_anon_key
   ```

4. **Deploy**
   - Click "Deploy"
   - Wait for build to complete

### Manual Deployment

```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy
vercel --prod
```

### Vercel Configuration

Create `vercel.json` for custom settings:

```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "framework": "vite",
  "rewrites": [
    { "source": "/(.*)", "destination": "/" }
  ]
}
```

---

## 🔷 Netlify Deployment

### Via Netlify UI

1. **Connect Repository**
   - Go to [netlify.com](https://netlify.com)
   - Sign in with GitHub
   - Click "Add new site" → "Import an existing project"

2. **Configure Build**
   - Build command: `npm run build`
   - Publish directory: `dist`

3. **Environment Variables**
   - Site settings → Build & deploy → Environment
   - Add variables

4. **Deploy**

### Via Netlify CLI

```bash
# Install
npm i -g netlify-cli

# Login
netlify login

# Deploy
netlify deploy --prod
```

### Netlify Configuration

Create `netlify.toml`:

```toml
[build]
  command = "npm run build"
  publish = "dist"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

---

## 🖥️ Self-Hosting

### Docker Deployment

Create `Dockerfile`:

```dockerfile
# Build stage
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Production stage
FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

Create `nginx.conf`:

```nginx
server {
    listen 80;
    server_name _;
    root /usr/share/nginx/html;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

Build and run:

```bash
docker build -t ai-tools-explorer .
docker run -p 80:80 ai-tools-explorer
```

### Docker Compose

```yaml
version: '3.8'
services:
  app:
    build: .
    ports:
      - "80:80"
    environment:
      - VITE_SUPABASE_URL=${VITE_SUPABASE_URL}
      - VITE_SUPABASE_PUBLISHABLE_KEY=${VITE_SUPABASE_PUBLISHABLE_KEY}
```

---

## 🗄️ Database Setup

### New Supabase Project

1. **Create Project**
   - Go to [supabase.com](https://supabase.com)
   - Create new project
   - Note the project URL and anon key

2. **Apply Migrations**
   - Go to SQL Editor
   - Run migration files from `supabase/migrations/`

3. **Seed Data (Optional)**
   - Import initial tools data
   - Create admin user

### Using Existing Database

1. **Export current data** (if needed)
2. **Update environment variables** with new credentials
3. **Verify RLS policies** are in place

---

## ⚡ Edge Functions

### Deployment with Supabase CLI

```bash
# Install CLI
npm i -g supabase

# Login
supabase login

# Link project
supabase link --project-ref your-project-ref

# Deploy functions
supabase functions deploy recommend-tools
supabase functions deploy send-notification-email
supabase functions deploy notify-new-tools
supabase functions deploy generate-sitemap
```

### Via Dashboard

1. Go to Supabase Dashboard → Edge Functions
2. Create new function
3. Paste code from `supabase/functions/`
4. Deploy

### Verify Deployment

```bash
# Test function
curl -X POST \
  https://your-project.supabase.co/functions/v1/recommend-tools \
  -H "Content-Type: application/json" \
  -d '{"task": "test"}'
```

---

## 🌍 Custom Domain

### Vercel

1. Go to Project Settings → Domains
2. Add your domain
3. Update DNS records:
   - Type: `CNAME`
   - Name: `www`
   - Value: `cname.vercel-dns.com`

### Netlify

1. Go to Site Settings → Domain management
2. Add custom domain
3. Update DNS records

### SSL Certificate

Both Vercel and Netlify provide free SSL certificates automatically.

---

## 📊 Monitoring & Maintenance

### Performance Monitoring

- **Vercel Analytics**: Built-in web vitals
- **Supabase**: Database metrics dashboard
- **Sentry**: Error tracking (optional)

### Health Checks

Monitor:
- [ ] Site availability
- [ ] API response times
- [ ] Database connections
- [ ] Edge function errors

### Backup Strategy

1. **Database**
   - Enable point-in-time recovery
   - Schedule regular backups

2. **Code**
   - Keep repository up-to-date
   - Tag releases

### Update Process

1. Create feature/fix branch
2. Test locally
3. Push to GitHub
4. Automatic preview deployment
5. Review and merge to main
6. Automatic production deployment

---

## 🆘 Troubleshooting

### Build Failures

```bash
# Clear cache
rm -rf node_modules .vite
npm install
npm run build
```

### Environment Variables Not Loading

- Ensure prefix is `VITE_` for client-side variables
- Check variable names match exactly
- Redeploy after adding variables

### 404 on Page Refresh

Add SPA redirect rules (shown in platform configs above)

### Database Connection Issues

- Verify Supabase URL and key
- Check RLS policies
- Verify network/firewall rules

---

## 📚 Additional Resources

- [Vite Deployment Guide](https://vitejs.dev/guide/static-deploy.html)
- [Supabase Documentation](https://supabase.com/docs)
- [Vercel Documentation](https://vercel.com/docs)
- [Netlify Documentation](https://docs.netlify.com)

---

<div align="center">
  <strong>Deploy with confidence! 🚀</strong>
</div>
