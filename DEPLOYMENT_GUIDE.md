# Zanova Deployment Guide

Complete guide for deploying Zanova e-commerce platform with Supabase.

## Prerequisites

- Node.js 18+ installed
- Supabase account (free tier works)
- Git repository access
- Hosting provider account (Netlify, Hostinger, Vercel, etc.)

## Environment Variables

Create a `.env.local` file in the root directory with the following variables:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Application Configuration
NEXT_PUBLIC_APP_URL=https://your-domain.com
JWT_SECRET=your_random_jwt_secret_key_min_32_chars

# Admin Configuration
ADMIN_EMAIL=admin@zanova.com
ADMIN_PASSWORD=your_secure_admin_password

# Seed Configuration (for initial database setup)
SEED_SECRET_KEY=your_random_seed_secret_key
```

### Getting Supabase Credentials

1. Go to [Supabase Dashboard](https://app.supabase.com)
2. Create a new project or select existing project
3. Go to **Settings** → **API**
4. Copy:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public** key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **service_role** key → `SUPABASE_SERVICE_ROLE_KEY` (keep this secret!)

## Database Setup

### 1. Run Database Migrations

The database schema should already be set up in your Supabase project. If you need to set it up:

1. Go to Supabase Dashboard → **SQL Editor**
2. Run your database schema SQL (if you have one)
3. Or use Supabase migrations if configured

### 2. Seed Initial Data

After deployment, seed the database with initial admin user:

```bash
# Using the seed API endpoint
curl -X POST "https://your-domain.com/api/admin/seed?key=your_seed_secret_key"
```

Or visit: `https://your-domain.com/api/admin/seed?key=your_seed_secret_key`

**Default Admin Credentials:**
- Email: `admin@zanova.com` (or your `ADMIN_EMAIL`)
- Password: Your `ADMIN_PASSWORD`

## Deployment Options

### Option 1: Netlify

1. **Connect Repository**
   - Go to [Netlify Dashboard](https://app.netlify.com)
   - Click "Add new site" → "Import an existing project"
   - Connect your Git repository

2. **Build Settings**
   - Build command: `npm run build`
   - Publish directory: `.next`
   - Node version: `18` or `20`

3. **Environment Variables**
   - Go to Site settings → Environment variables
   - Add all environment variables from `.env.local`

4. **Deploy**
   - Netlify will automatically deploy on push to main branch
   - Or click "Deploy site" manually

### Option 2: Hostinger (Node.js Web App)

1. **Upload Files**
   - Upload your project files via FTP or File Manager
   - Or use Git deployment if available

2. **Node.js Configuration**
   - Go to Hostinger Control Panel → Node.js
   - Create new Node.js app
   - Set Node version to `18` or `20`
   - Set startup file to: `server.js` (if using custom server) or use Next.js default

3. **Environment Variables**
   - Add all environment variables in Hostinger Control Panel
   - Or create `.env` file in project root

4. **Build & Start**
   - Run: `npm install`
   - Run: `npm run build`
   - Start the app

### Option 3: Vercel (Recommended for Next.js)

1. **Import Project**
   - Go to [Vercel Dashboard](https://vercel.com)
   - Click "Add New Project"
   - Import your Git repository

2. **Configure**
   - Framework Preset: Next.js (auto-detected)
   - Root Directory: `./` (default)

3. **Environment Variables**
   - Add all environment variables in project settings

4. **Deploy**
   - Click "Deploy"
   - Vercel handles everything automatically

## Post-Deployment Checklist

- [ ] Environment variables are set correctly
- [ ] Database is seeded with admin user
- [ ] Test admin login at `/auth/login`
- [ ] Test homepage loads correctly
- [ ] Test product browsing
- [ ] Test user registration
- [ ] Test order placement (if payment is configured)
- [ ] Check admin dashboard at `/admin`
- [ ] Verify API routes are working

## Troubleshooting

### Database Connection Issues

- Verify Supabase credentials are correct
- Check if Supabase project is active
- Ensure `SUPABASE_SERVICE_ROLE_KEY` is used (not anon key) for server-side operations

### Build Errors

- Ensure Node.js version is 18+
- Run `npm install` before building
- Check for missing dependencies

### Authentication Issues

- Verify `JWT_SECRET` is set and is at least 32 characters
- Check if admin user exists in database
- Try seeding database again

### API Route Errors

- Check server logs for detailed error messages
- Verify environment variables are accessible at runtime
- Ensure Supabase service role key has proper permissions

## Security Notes

- **Never commit** `.env.local` or `.env` files to Git
- Keep `SUPABASE_SERVICE_ROLE_KEY` secret (it bypasses Row Level Security)
- Use strong passwords for admin accounts
- Regularly update dependencies for security patches
- Enable Supabase Row Level Security (RLS) policies for production

## Support

For issues or questions:
1. Check Supabase logs in Dashboard → Logs
2. Check application logs in your hosting provider
3. Review Next.js documentation for framework-specific issues

## Architecture

- **Frontend**: Next.js 14+ (React)
- **Backend**: Next.js API Routes
- **Database**: Supabase (PostgreSQL)
- **Authentication**: JWT tokens stored in HTTP-only cookies
- **File Storage**: Local filesystem (consider cloud storage for production)

## Migration from Prisma

This project has been migrated from Prisma ORM to Supabase JS client:
- All database queries use `@supabase/supabase-js`
- No Prisma schema or migrations needed
- Direct SQL queries through Supabase client
- Better compatibility with serverless environments
