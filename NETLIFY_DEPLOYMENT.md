# Netlify Deployment Guide

## Pre-Deployment Checklist

✅ **Completed:**
- Removed demo credentials from login page
- Updated `netlify.toml` configuration
- Verified build passes successfully
- All TypeScript errors resolved

## Environment Variables Required

Make sure to set these in Netlify Dashboard → Site Settings → Environment Variables:

### Required Variables:
```
DATABASE_URL=postgresql://user:password@host:6543/dbname?pgbouncer=true&connection_limit=1
JWT_SECRET=your-secret-key-here
NEXT_PUBLIC_BASE_URL=https://your-site.netlify.app
```

### Important Notes:

1. **Database Connection:**
   - Use Supabase connection pooler (port **6543**, not 5432)
   - Add `pgbouncer=true&connection_limit=1` to your DATABASE_URL
   - Example: `postgresql://user:pass@aws-0-us-west-2.pooler.supabase.com:6543/dbname?pgbouncer=true&connection_limit=1`

2. **Build Settings:**
   - Build command: `npm run build` (already in netlify.toml)
   - Publish directory: `.next` (handled by @netlify/plugin-nextjs)
   - Node version: 18 (set in netlify.toml)

3. **Next.js Plugin:**
   - The `@netlify/plugin-nextjs` plugin is configured
   - This handles Next.js routing and serverless functions automatically

## Deployment Steps

1. **Connect Repository:**
   - Go to Netlify Dashboard
   - Click "Add new site" → "Import an existing project"
   - Connect your Git repository

2. **Configure Build Settings:**
   - Netlify will auto-detect `netlify.toml`
   - Verify build command: `npm run build`
   - Verify publish directory: `.next` (auto-handled)

3. **Set Environment Variables:**
   - Go to Site Settings → Environment Variables
   - Add all required variables listed above
   - Make sure DATABASE_URL uses port 6543 with pgbouncer

4. **Deploy:**
   - Click "Deploy site"
   - Monitor build logs for any errors
   - Once deployed, test the site functionality

## Database Seeding (IMPORTANT!)

After deployment, you **MUST** seed the database to create the admin user and initial data:

### Option 1: Using Seed API Endpoint (Easiest - Recommended)

A seed API endpoint has been created at `/api/admin/seed`. You can call it via HTTP:

**Step 1:** Add `SEED_SECRET_KEY` to Netlify environment variables:
- Go to Netlify Dashboard → Site Settings → Environment Variables
- Add: `SEED_SECRET_KEY` = `your-secret-key-here` (use a strong random string)

**Step 2:** Call the seed endpoint:

**Using GET (easiest):**
```
https://your-site.netlify.app/api/admin/seed?key=your-secret-key-here
```

**Using POST (more secure):**
```bash
curl -X POST https://your-site.netlify.app/api/admin/seed \
  -H "Authorization: Bearer your-secret-key-here"
```

Or use any HTTP client (Postman, browser, etc.)

**Note:** The endpoint will check if the database is already seeded and skip if admin user exists.

### Option 2: Using Netlify CLI

```powershell
# PowerShell (Windows)
$env:DATABASE_URL = "your-database-url-from-netlify"
npm run db:seed

# Or get DATABASE_URL from Netlify
netlify env:get DATABASE_URL
```

### Option 3: Manual Database Access
Connect to your database directly and run the seed script:
```bash
# Set DATABASE_URL in your local environment
# PowerShell:
$env:DATABASE_URL = "your-database-url"

# Then run seed
npm run db:seed
```

### Default Admin Credentials (After Seeding):
- **Email:** `admin@zalora.com` (or value from `ADMIN_EMAIL` env var)
- **Password:** `admin123` (or value from `ADMIN_PASSWORD` env var)

**⚠️ IMPORTANT:** Change the admin password immediately after first login!

## Post-Deployment Verification

- [ ] Database seeded with admin user
- [ ] Homepage loads correctly
- [ ] Login page works (use admin@zalora.com / admin123)
- [ ] Country selection page displays correctly
- [ ] Admin dashboard accessible
- [ ] Database connections working
- [ ] Images loading properly

## Troubleshooting

### Build Fails:
- Check Node version (should be 18)
- Verify all environment variables are set
- Check build logs for specific errors

### Database Connection Issues:
- Ensure DATABASE_URL uses port 6543 (not 5432)
- Verify `pgbouncer=true&connection_limit=1` is in URL
- Check Supabase connection pooler is enabled

### Runtime Errors:
- Check Netlify Functions logs
- Verify environment variables are set correctly
- Check browser console for client-side errors
