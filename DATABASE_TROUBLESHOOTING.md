# Database Connection Troubleshooting - Supabase + Netlify

## Issue: 503 Service Unavailable - Database Connection Error

If you're getting a 503 error when trying to login, it means the database connection is failing in Netlify's serverless functions.

## Supabase Connection Strings

Supabase provides **two types** of connection strings:

### 1. Direct Connection (Port 5432) ❌ DON'T USE FOR NETLIFY
- **Use for:** Local development, persistent connections
- **Format:** `postgresql://user:password@host.supabase.co:5432/postgres`
- **Problem:** Serverless functions can't maintain persistent connections

### 2. Connection Pooler (Port 6543) ✅ USE FOR NETLIFY
- **Use for:** Serverless functions (Netlify, Vercel, etc.)
- **Format:** `postgresql://user:password@host.pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1`
- **Why:** Handles connection pooling for short-lived serverless functions

## How to Get Your Supabase Connection Pooler URL

1. **Go to Supabase Dashboard:**
   - Visit https://app.supabase.com
   - Select your project

2. **Navigate to Settings:**
   - Click on "Settings" (gear icon) in the left sidebar
   - Click on "Database"

3. **Find Connection Pooling:**
   - Scroll down to "Connection Pooling" section
   - Look for "Connection string" with "Transaction" mode
   - It should show port **6543** and hostname ending in `.pooler.supabase.com`

4. **Copy the Connection String:**
   - It should look like:
     ```
     postgresql://postgres.[project-ref]:[password]@aws-0-[region].pooler.supabase.com:6543/postgres?pgbouncer=true
     ```
   - Or use the "URI" format if available

5. **Add Connection Limit (Important):**
   - Append `&connection_limit=1` to the URL
   - Final format:
     ```
     postgresql://postgres.[project-ref]:[password]@aws-0-[region].pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1
     ```

## Common Causes & Solutions

### 1. Using Direct Connection Instead of Pooler

**Problem:** You're using the direct connection URL (port 5432) in Netlify.

**Solution:** Switch to the connection pooler URL (port 6543).

**Correct Format for Netlify:**
```
postgresql://postgres.[project-ref]:[password]@aws-0-[region].pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1
```

**Wrong Format (Direct Connection):**
```
postgresql://postgres.[project-ref]:[password]@db.[project-ref].supabase.co:5432/postgres
```

### 2. Check DATABASE_URL in Netlify

1. Go to Netlify Dashboard → Site Settings → Environment Variables
2. Verify `DATABASE_URL` is set correctly
3. Make sure it uses port **6543** (not 5432)
4. Ensure it includes `?pgbouncer=true&connection_limit=1`

### 3. Test Database Connection

You can test if your DATABASE_URL works by calling the seed endpoint:

```
https://zalora.sbs/api/admin/seed?key=change-this-in-production
```

If this works, your DATABASE_URL is correct. If it fails, check the error message.

### 4. Connection Pooling Issues

Netlify serverless functions have a cold start issue. Each function invocation creates a new connection, which can cause:
- Connection timeouts
- Too many connections errors
- Slow response times

**Solution:** Use a connection pooler (pgbouncer) which is already configured in the correct DATABASE_URL format.

### 5. Prisma Client Connection

The Prisma Client might not be properly initialized in serverless environments.

**Check Netlify Function Logs:**
1. Go to Netlify Dashboard → Functions
2. Click on `/api/auth/login`
3. Check the logs for detailed error messages

### 6. Quick Fix: Restart Deployment

Sometimes a fresh deployment fixes connection issues:

1. Go to Netlify Dashboard → Deploys
2. Click "Trigger deploy" → "Clear cache and deploy site"

### 7. Verify Database is Accessible

Make sure your database:
- Is running and accessible
- Allows connections from Netlify's IP addresses
- Has the correct credentials
- Is not blocked by firewall rules

## Debugging Steps

1. **Check Netlify Function Logs:**
   - Look for `[LOGIN] Database query error:` messages
   - Check for connection timeout errors
   - Look for authentication errors

2. **Test with Seed Endpoint:**
   ```
   https://zalora.sbs/api/admin/seed?key=change-this-in-production
   ```
   If this works but login doesn't, there's a specific issue with the login route.

3. **Check Environment Variables:**
   - Verify DATABASE_URL is set in Netlify
   - Make sure there are no extra spaces or quotes
   - Verify the URL is URL-encoded if it contains special characters

4. **Test Database Connection Locally:**
   ```bash
   # Set DATABASE_URL locally
   $env:DATABASE_URL = "your-database-url"
   
   # Test connection
   npx prisma db pull
   ```

## Most Likely Solution

If the seed endpoint worked but login doesn't, the issue is likely:

1. **Connection pooling:** Make sure DATABASE_URL uses port 6543 with pgbouncer
2. **Cold start timeout:** Serverless functions might timeout on first connection
3. **Prisma Client initialization:** The client might need to be reinitialized

Try redeploying after ensuring DATABASE_URL uses the pooler format.
