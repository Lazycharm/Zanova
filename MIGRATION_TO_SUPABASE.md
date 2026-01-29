# Migration from Prisma to Supabase JS Client

## Summary

This document tracks the migration from Prisma ORM to Supabase JS Client for better compatibility with serverless hosting (Netlify, Hostinger).

## Completed Changes

### 1. Package Dependencies
- ✅ Removed `@prisma/client` from dependencies
- ✅ Removed `prisma` from devDependencies  
- ✅ Added `@supabase/supabase-js` to dependencies
- ✅ Removed Prisma-related scripts from `package.json`

### 2. Configuration Files
- ✅ Deleted `prisma/schema.prisma`
- ✅ Deleted `prisma/seed.ts`
- ✅ Deleted `scripts/generate-prisma.js`
- ✅ Deleted `src/lib/db.ts`
- ✅ Deleted `supabase-setup-prisma-user.sql`

### 3. Core Library Files
- ✅ Created `src/lib/supabase.ts` - Supabase client setup
- ✅ Updated `src/lib/auth.ts` - All Prisma queries replaced with Supabase

### 4. API Routes (Partially Complete)
- ✅ Updated `src/app/api/auth/me/route.ts`

## Remaining Work

### API Routes (64 files remaining)
All files in `src/app/api/` need to be updated:

**Pattern to replace:**
```typescript
// OLD (Prisma)
import { db } from '@/lib/db'
const user = await db.user.findUnique({ where: { id } })

// NEW (Supabase)
import { supabaseAdmin } from '@/lib/supabase'
const { data: user } = await supabaseAdmin
  .from('users')
  .select('*')
  .eq('id', id)
  .single()
```

**Key conversions:**
- `db.user.findUnique()` → `supabaseAdmin.from('users').select().eq().single()`
- `db.user.findMany()` → `supabaseAdmin.from('users').select()`
- `db.user.create()` → `supabaseAdmin.from('users').insert()`
- `db.user.update()` → `supabaseAdmin.from('users').update().eq()`
- `db.user.delete()` → `supabaseAdmin.from('users').delete().eq()`
- `db.user.count()` → `supabaseAdmin.from('users').select('*', { count: 'exact', head: true })`

### Server Components (25+ files)
All files in `src/app/` that import `db` need updates:
- `src/app/(store)/page.tsx`
- `src/app/(store)/layout.tsx`
- `src/app/admin/**/*.tsx`
- `src/app/(store)/seller/**/*.tsx`
- etc.

### Seed Script
- Need to create new seed script using Supabase JS client

## Environment Variables

### Removed
- ❌ `DATABASE_URL` (no longer needed)

### Required
- ✅ `NEXT_PUBLIC_SUPABASE_URL` - Your Supabase project URL
- ✅ `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Supabase anonymous key (public)
- ✅ `SUPABASE_SERVICE_ROLE_KEY` - Supabase service role key (server-side only, keep secret!)

## Database Schema

The database schema remains the same in Supabase. All tables and relationships are preserved:
- `users`
- `shops`
- `products`
- `categories`
- `orders`
- `settings`
- `sessions`
- `hero_slides`
- etc.

## Next Steps

1. Update all API routes to use Supabase
2. Update all server components to use Supabase
3. Create new seed script
4. Test all functionality
5. Update deployment documentation

## Notes

- Supabase JS client works with both serverless and traditional hosting
- No build-time database connections required
- All queries are runtime-only
- Service role key is used for admin operations (bypasses RLS)
- Anonymous key is used for public operations (respects RLS)
