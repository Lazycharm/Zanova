# Supabase Connection Guide for Netlify

## You ARE using Supabase for Database ✅
- Supabase = Your Database Provider
- Netlify = Your Hosting Provider (serverless functions)

## The Problem

Your current connection URL uses the **direct connection** (port 5432):
```
postgresql://postgres:...@db.mcqtqdgssnpkbrsyonnd.supabase.co:5432/postgres
```

**This doesn't work with Netlify serverless functions** because they can't maintain persistent connections.

## The Solution

You need Supabase's **Connection Pooler URL** (port 6543) for Netlify.

## How to Get Your Supabase Connection Pooler URL

1. **Go to Supabase Dashboard:**
   - Visit https://app.supabase.com
   - Select your project: `mcqtqdgssnpkbrsyonnd`

2. **Navigate to Settings → Database:**
   - Click "Settings" (gear icon) in left sidebar
   - Click "Database"

3. **Find "Connection Pooling" Section:**
   - Scroll down to "Connection Pooling"
   - Look for "Connection string" with "Transaction" mode
   - It should show port **6543** and `.pooler.supabase.com`

4. **Copy the Connection Pooler URL:**
   - It should look like:
     ```
     postgresql://postgres.mcqtqdgssnpkbrsyonnd:[PASSWORD]@aws-0-us-west-2.pooler.supabase.com:6543/postgres?pgbouncer=true
     ```
   - Notice: `.pooler.supabase.com` (not `.supabase.co`)
   - Notice: Port **6543** (not 5432)

5. **Add Connection Limit:**
   - Append `&connection_limit=1` to the URL
   - Final format:
     ```
     postgresql://postgres.mcqtqdgssnpkbrsyonnd:[PASSWORD]@aws-0-us-west-2.pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1
     ```

## Update Netlify Environment Variable

1. **Go to Netlify Dashboard:**
   - Site Settings → Environment Variables

2. **Update DATABASE_URL:**
   - Replace with the connection pooler URL from step 5 above
   - Make sure to replace `[PASSWORD]` with your actual Supabase password

3. **Redeploy:**
   - Trigger a new deployment (environment variables require redeploy)

## Key Differences

| Direct Connection (Port 5432) | Connection Pooler (Port 6543) |
|------------------------------|-------------------------------|
| ❌ Doesn't work with Netlify | ✅ Works with Netlify |
| `.supabase.co` hostname | `.pooler.supabase.com` hostname |
| For persistent connections | For serverless functions |
| Port 5432 | Port 6543 |

## Summary

- **Database:** Supabase (unchanged)
- **Hosting:** Netlify (unchanged)
- **What Changed:** Use Supabase's connection pooler URL instead of direct connection URL

You're still using Supabase for your database - you just need to use the correct connection URL format for Netlify's serverless functions.
