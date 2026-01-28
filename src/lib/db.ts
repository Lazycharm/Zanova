import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

// Check if DATABASE_URL is available
const isDatabaseAvailable = !!process.env.DATABASE_URL

let dbInstance: PrismaClient

if (isDatabaseAvailable) {
  dbInstance =
    globalForPrisma.prisma ??
    new PrismaClient({
      log: ['error'],
    })

  if (process.env.NODE_ENV !== 'production') {
    globalForPrisma.prisma = dbInstance
  }
} else {
  // Create a mock PrismaClient that throws helpful errors
  dbInstance = new Proxy({} as PrismaClient, {
    get() {
      throw new Error(
        'DATABASE_URL is not configured. Please set it in your environment variables.'
      )
    },
  })
}

export const db = dbInstance

// Helper function to check if database is available
export function isDbAvailable(): boolean {
  return isDatabaseAvailable
}
