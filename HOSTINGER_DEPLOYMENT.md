# Hostinger Deployment Guide

## Overview

This guide covers deploying your Next.js application to Hostinger's Node.js hosting platform with Supabase as the database.

## Prerequisites

- Hostinger account with Node.js hosting enabled
- Supabase account and project
- Git repository with your code

## Environment Variables

Set these in Hostinger's control panel → Environment Variables:

### Required Variables:
```
DATABASE_URL=postgresql://prisma.[PROJECT-REF]:[PRISMA-PASSWORD]@[DB-REGION].pooler.supabase.com:5432/postgres
JWT_SECRET=your-secret-key-here
NEXT_PUBLIC_APP_URL=https://your-domain.com
ADMIN_EMAIL=admin@zanova.com
ADMIN_PASSWORD=admin123
SEED_SECRET_KEY=your-secret-key-here
NODE_ENV=production
```

### Important Notes:

1. **Database Connection (Supabase):**
   - **Recommended:** Use Supabase's **Supavisor Session mode** (port **5432**) with a custom Prisma user
   - Format: `postgresql://prisma.[PROJECT-REF]:[PRISMA-PASSWORD]@[DB-REGION].pooler.supabase.com:5432/postgres`
   - **Alternative:** Direct connection: `postgresql://prisma.[PROJECT-REF]:[PRISMA-PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres`
   - Get connection string from: Supabase Dashboard → Settings → Database → Connection string
   - **IMPORTANT:** Create a custom Prisma user first (see "Supabase Database Setup" section below)

2. **Node Version:**
   - Hostinger supports Node.js 18+
   - Make sure your Hostinger plan includes Node.js support

## Supabase Database Setup (IMPORTANT!)

Before deploying, set up a custom Prisma user in Supabase for better control and monitoring:

### Step 1: Create Prisma User in Supabase

1. Go to your Supabase Dashboard
2. Open the **SQL Editor**
3. Run this SQL to create a custom Prisma user:

```sql
-- Create custom user for Prisma
CREATE USER "prisma" WITH PASSWORD 'your_secure_password_here' BYPASSRLS CREATEDB;

-- Extend prisma's privileges to postgres (necessary to view changes in Dashboard)
GRANT "prisma" TO "postgres";

-- Grant necessary permissions over the public schema
GRANT USAGE ON SCHEMA public TO prisma;
GRANT CREATE ON SCHEMA public TO prisma;
GRANT ALL ON ALL TABLES IN SCHEMA public TO prisma;
GRANT ALL ON ALL ROUTINES IN SCHEMA public TO prisma;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO prisma;

-- Set default privileges for future tables
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON TABLES TO prisma;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON ROUTINES TO prisma;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON SEQUENCES TO prisma;
```

**⚠️ Security:** Use a strong password generator for the Prisma user password!

### Step 2: Get Your Connection String

1. In Supabase Dashboard, go to **Settings** → **Database**
2. Find **Connection string** → **Supavisor Session mode** (port 5432)
3. The format should be:
   ```
   postgres://prisma.[PROJECT-REF]:[PRISMA-PASSWORD]@[DB-REGION].pooler.supabase.com:5432/postgres
   ```
4. Replace `[PRISMA-PASSWORD]` with the password you created in Step 1

**Note:** For Hostinger (server-based deployment), use **Session mode (port 5432)**, NOT Transaction mode (port 6543).

## Deployment Steps

### 1. Prepare Your Repository

Make sure your code is pushed to Git:
```bash
git add .
git commit -m "Prepare for Hostinger deployment"
git push
```

### 2. Connect to Hostinger

1. **Log in to Hostinger Control Panel**
   - Go to your Hostinger account
   - Navigate to your hosting plan

2. **Set Up Node.js Application**
   - Go to "Node.js" section in control panel
   - Click "Create Node.js App"
   - Select your domain/subdomain
   - Choose Node.js version (18 or higher)

3. **Connect Git Repository**
   - In Node.js app settings, find "Git" section
   - Connect your Git repository
   - Set branch to `main` or `master`
   - Set build command: `npm run build`
   - Set start command: `npm start`
   - Set root directory: `/` (or leave default)

### 3. Configure Build Settings

**Build Command:**
```bash
npm run build
```

**Start Command:**
```bash
npm start
```

**Node Version:**
- Select Node.js 18 or higher

### 4. Set Environment Variables

1. Go to your Node.js app settings
2. Find "Environment Variables" section
3. Add all required variables listed above
4. Make sure `DATABASE_URL` uses Supabase direct connection (port 5432)

### 5. Deploy

1. Click "Deploy" or "Redeploy" in Hostinger control panel
2. Wait for build to complete
3. Check build logs for any errors

### 6. Seed Database

After deployment, seed your database:

**Option 1: Using Seed API Endpoint (Easiest)**

Visit this URL in your browser (replace with your domain and secret key):
```
https://your-domain.com/api/admin/seed?key=your-secret-key-here
```

**Option 2: SSH Access**

If Hostinger provides SSH access:
```bash
# Connect via SSH
ssh your-username@your-domain.com

# Navigate to app directory
cd /path/to/your/app

# Set environment variables
export DATABASE_URL="your-supabase-connection-string"

# Run seed
npm run db:seed
```

### 7. Verify Deployment

1. Visit your domain
2. Test login with admin credentials:
   - Email: `admin@zanova.com` (or your ADMIN_EMAIL)
   - Password: `admin123` (or your ADMIN_PASSWORD)
3. Check admin dashboard
4. Test registration

## Post-Deployment Checklist

- [ ] Homepage loads correctly
- [ ] Login works
- [ ] Registration works
- [ ] Admin dashboard accessible
- [ ] Database connection working
- [ ] Images loading properly
- [ ] API routes working

## Troubleshooting

### Build Fails:
- Check Node version (should be 18+)
- Verify all environment variables are set
- Check build logs for specific errors
- Ensure `package.json` has correct build script
- **Permission Errors:** If you see "Permission denied" for Prisma, the `postinstall` script has been removed. Prisma will generate during the build step instead.

### Database Connection Issues:
- Verify `DATABASE_URL` uses direct connection (port 5432)
- Check Supabase database is running
- Verify credentials are correct
- Check if Supabase allows connections from Hostinger's IP

### App Not Starting:
- Check start command is `npm start`
- Verify `package.json` has `start` script
- Check Node.js version compatibility
- Review application logs in Hostinger control panel

### 503/500 Errors:
- Check environment variables are set correctly
- Verify database connection string
- Check application logs for detailed errors
- Ensure Prisma Client is generated (`npm run db:generate`)

## Database Connection Format

**For Hostinger (Direct Connection):**
```
postgresql://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres
```

**NOT the connection pooler** (that's for serverless hosting like Netlify/Vercel)

## Support

- Hostinger Support: Check Hostinger documentation or support
- Application Logs: Available in Hostinger control panel
- Database: Supabase Dashboard → Logs

## Notes

- Hostinger uses traditional Node.js hosting, so you can use direct Supabase connections
- No need for connection pooler (pgbouncer) - that's only for serverless platforms
- Your app runs as a persistent Node.js process, not serverless functions
- Environment variables are set in Hostinger control panel, not in code
