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

### Option 1: Using Netlify Functions (Recommended)
Create a one-time seed function or use Netlify's CLI:

```bash
# Install Netlify CLI if you haven't
npm install -g netlify-cli

# Login to Netlify
netlify login

# Link to your site
netlify link

# Run seed command (requires DATABASE_URL to be set)
netlify functions:invoke seed --no-identity
```

### Option 2: Using Netlify Shell/SSH
1. Go to Netlify Dashboard → Site → Functions
2. Use Netlify's shell access (if available) or deploy a temporary function
3. Run: `npm run db:seed`

### Option 3: Manual Database Access
Connect to your database directly and run the seed script:
```bash
# Set DATABASE_URL in your local environment
export DATABASE_URL="your-database-url"

# Run seed
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
