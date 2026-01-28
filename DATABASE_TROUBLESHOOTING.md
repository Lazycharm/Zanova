# Database Connection Troubleshooting

## Issue: 503 Service Unavailable - Database Connection Error

If you're getting a 503 error when trying to login, it means the database connection is failing in Netlify's serverless functions.

## Common Causes & Solutions

### 1. DATABASE_URL Format Issue

**Problem:** Netlify serverless functions need a connection pooler URL, not a direct database URL.

**Solution:** Use Supabase's connection pooler (port 6543) instead of direct connection (port 5432).

**Correct Format:**
```
postgresql://user:password@host.pooler.supabase.com:6543/dbname?pgbouncer=true&connection_limit=1
```

**Wrong Format:**
```
postgresql://user:password@host.supabase.com:5432/dbname
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
