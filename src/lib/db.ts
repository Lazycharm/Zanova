import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

// Simple Prisma Client setup - works with Supabase on Netlify
// Netlify runs Next.js API routes as serverless functions automatically
// Just use Supabase connection pooler URL and Prisma works fine
const dbInstance =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
  })

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = dbInstance
}

export const db = dbInstance
