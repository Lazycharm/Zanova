import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

// Prisma Client setup - works with Supabase
// Standard Node.js hosting (Hostinger) - can use direct Supabase connection
let dbInstance: PrismaClient

try {
  dbInstance =
    globalForPrisma.prisma ??
    new PrismaClient({
      log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
    })

  if (process.env.NODE_ENV !== 'production') {
    globalForPrisma.prisma = dbInstance
  }
} catch (error) {
  console.error('Failed to initialize Prisma Client:', error)
  // Create a mock client that throws helpful errors
  dbInstance = new PrismaClient({
    datasources: {
      db: {
        url: process.env.DATABASE_URL || 'missing',
      },
    },
  })
}

export const db = dbInstance
