# Supabase Connection URL Fix

## Your Current URL (Incomplete):
```
postgresql://postgres.mcqtqdgssnpkbrsyonnd:[YOUR-PASSWORD]@aws-0-us-west-2.pooler.supabase.com:6543/postgres
```

## Complete URL (For Netlify):
```
postgresql://postgres.mcqtqdgssnpkbrsyonnd:[YOUR-PASSWORD]@aws-0-us-west-2.pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1
```

## Steps to Fix:

1. **Replace `[YOUR-PASSWORD]`** with your actual Supabase database password
   - You can find this in Supabase Dashboard → Settings → Database → Database password

2. **Add the query parameters** at the end:
   - `?pgbouncer=true&connection_limit=1`

3. **Final format should be:**
   ```
   postgresql://postgres.mcqtqdgssnpkbrsyonnd:your-actual-password@aws-0-us-west-2.pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1
   ```

4. **Update in Netlify:**
   - Go to Netlify Dashboard → Site Settings → Environment Variables
   - Find `DATABASE_URL`
   - Replace with the complete URL above (with your actual password)
   - Save

5. **Redeploy:**
   - Trigger a new deployment or wait for auto-deploy
   - Test login again

## Why These Parameters Are Needed:

- `pgbouncer=true`: Enables connection pooling mode
- `connection_limit=1`: Limits connections per serverless function (prevents connection exhaustion)

## Security Note:

Make sure to:
- Never commit your password to Git
- Keep your DATABASE_URL secure in Netlify environment variables
- Use different passwords for development and production if possible
