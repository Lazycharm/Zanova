# Supabase Connection Fix

## Current Issue
Your DATABASE_URL is trying to connect to Supabase pooler on port 5432, but it should use port **6543**.

**Error:** `Can't reach database server at aws-0-us-west-2.pooler.supabase.com:5432`

## Solution

### Step 1: Get Your Supabase Connection String

1. Go to your Supabase project dashboard
2. Navigate to **Settings** → **Database**
3. Find the **Connection Pooling** section
4. Copy the **Connection String** (it should use port **6543**)

### Step 2: Update Your .env File

Replace your current `DATABASE_URL` with the connection pooling URL:

```env
# ❌ WRONG - Direct connection (port 5432)
DATABASE_URL="postgresql://user:pass@aws-0-us-west-2.pooler.supabase.com:5432/db"

# ✅ CORRECT - Connection pooling (port 6543)
DATABASE_URL="postgresql://postgres.xxxxx:[YOUR-PASSWORD]@aws-0-us-west-2.pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1"
```

### Step 3: Key Points

- **Port 6543** = Connection Pooling (use this for Next.js)
- **Port 5432** = Direct Connection (don't use this for serverless)
- Add `?pgbouncer=true&connection_limit=1` to the URL
- Use the **pooler** hostname (ends with `.pooler.supabase.com`)

### Step 4: Restart Your Dev Server

```bash
# Stop the server (Ctrl+C)
# Clear Next.js cache
rm -rf .next
# Restart
npm run dev
```

## Alternative: Use Direct Connection (Not Recommended)

If you must use direct connection temporarily:

```env
DATABASE_URL="postgresql://postgres.xxxxx:[PASSWORD]@aws-0-us-west-2.pooler.supabase.com:5432/postgres?connection_limit=3"
```

**Note:** Direct connections have lower limits and may cause connection pool exhaustion.

## Verify Your Connection

After updating, check your Supabase dashboard:
- **Settings** → **Database** → **Connection Pooling**
- Ensure you're using the **Session** mode connection string
- Port should be **6543**, not 5432
