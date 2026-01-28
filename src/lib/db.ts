import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

// Check if DATABASE_URL is available
const isDatabaseAvailable = !!process.env.DATABASE_URL

let dbInstance: PrismaClient

if (isDatabaseAvailable) {
  // For Netlify serverless functions, create a new PrismaClient instance each time
  // This prevents connection pooling issues in serverless environments
  if (process.env.NETLIFY || process.env.NODE_ENV === 'production') {
    // Serverless environment - create fresh instance
    dbInstance = new PrismaClient({
      log: ['error'],
      datasources: {
        db: {
          url: process.env.DATABASE_URL,
        },
      },
    })
  } else {
    // Development - reuse global instance
    dbInstance =
      globalForPrisma.prisma ??
      new PrismaClient({
        log: ['query', 'error', 'warn'],
        datasources: {
          db: {
            url: process.env.DATABASE_URL,
          },
        },
      })
    globalForPrisma.prisma = dbInstance
  }
} else {
  // Create a mock PrismaClient that returns empty results instead of throwing
  // This allows the app to run without crashing when DATABASE_URL is missing
  const createMockModel = () => ({
    findMany: async () => [],
    findUnique: async () => null,
    findFirst: async () => null,
    create: async () => {
      throw new Error('DATABASE_URL is not configured. Cannot create records.')
    },
    update: async () => {
      throw new Error('DATABASE_URL is not configured. Cannot update records.')
    },
    delete: async () => {
      throw new Error('DATABASE_URL is not configured. Cannot delete records.')
    },
    count: async () => 0,
    aggregate: async () => ({ _count: 0, _sum: null, _avg: null, _min: null, _max: null }),
  })

  dbInstance = new Proxy({} as PrismaClient, {
    get(_target, prop) {
      // Return a mock model for any property access
      return createMockModel()
    },
  })
}

export const db = dbInstance

// Helper function to check if database is available
export function isDbAvailable(): boolean {
  return isDatabaseAvailable
}
