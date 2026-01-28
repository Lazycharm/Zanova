import { SignJWT, jwtVerify } from 'jose'
import { cookies } from 'next/headers'
import { db } from './db'
import bcrypt from 'bcryptjs'
import { UserRole, UserStatus } from '@prisma/client'

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'zalora-secret-key'
)

export interface JWTPayload {
  userId: string
  email: string
  role: UserRole
  impersonatedBy?: string // For admin login-as-user feature
  exp?: number
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12)
}

export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword)
}

export async function createToken(payload: Omit<JWTPayload, 'exp'>): Promise<string> {
  return new SignJWT(payload as unknown as Record<string, unknown>)
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime('7d')
    .setIssuedAt()
    .sign(JWT_SECRET)
}

export async function verifyToken(token: string): Promise<JWTPayload | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET)
    return payload as unknown as JWTPayload
  } catch {
    return null
  }
}

export async function getSession(): Promise<JWTPayload | null> {
  const cookieStore = await cookies()
  const token = cookieStore.get('auth-token')?.value
  if (!token) return null
  return verifyToken(token)
}

export async function getCurrentUser() {
  try {
    // Check if database is available
    if (!process.env.DATABASE_URL) {
      console.warn('DATABASE_URL not configured, returning null user')
      return null
    }

    const session = await getSession()
    if (!session) return null

    // Check if session is expired
    if (session.exp && session.exp < Date.now() / 1000) {
      return null
    }

    const [user, userSellingSetting] = await Promise.all([
      db.user.findUnique({
        where: { id: session.userId },
        select: {
          id: true,
          email: true,
          name: true,
          avatar: true,
          role: true,
          status: true,
          balance: true,
          canSell: true,
          shop: {
            select: {
              id: true,
              name: true,
              slug: true,
              status: true,
            },
          },
        },
      }),
      db.setting.findUnique({
        where: { key: 'user_selling_enabled' },
      }),
    ])

    if (!user || user.status !== UserStatus.ACTIVE) return null

    const userSellingEnabled = userSellingSetting?.value === 'true'

    return {
      ...user,
      balance: Number(user.balance),
      canSell: user.canSell && userSellingEnabled, // Only true if both are enabled
      isImpersonating: !!session.impersonatedBy,
      impersonatedBy: session.impersonatedBy,
    }
  } catch (error) {
    console.error('getCurrentUser error:', error)
    // Return null on error to prevent crashes
    // Database errors should not cause auth failures - let middleware handle token validation
    return null
  }
}

export async function login(email: string, password: string) {
  try {
    // Check if database is available
    if (!process.env.DATABASE_URL) {
      console.error('[LOGIN] DATABASE_URL not configured')
      return { success: false, error: 'Database connection error. Please contact support.' }
    }

    let user
    try {
      user = await db.user.findUnique({
        where: { email },
        select: {
          id: true,
          email: true,
          password: true,
          name: true,
          role: true,
          status: true,
        },
      })
    } catch (dbError) {
      console.error('[LOGIN] Database query error:', dbError)
      const errorMessage = dbError instanceof Error ? dbError.message : 'Unknown database error'
      console.error('[LOGIN] Error details:', {
        message: errorMessage,
        name: dbError instanceof Error ? dbError.name : 'Unknown',
        stack: dbError instanceof Error ? dbError.stack : undefined,
      })
      return { 
        success: false, 
        error: `Database connection error: ${errorMessage}. Please check your DATABASE_URL configuration.` 
      }
    }

    if (!user) {
      // Check if any users exist at all (to help diagnose seeding issue)
      try {
        const userCount = await db.user.count()
        if (userCount === 0) {
          console.warn('[LOGIN] No users found in database. Database may need to be seeded.')
          return { 
            success: false, 
            error: 'No users found. Please seed the database by running: npm run db:seed' 
          }
        }
      } catch (countError) {
        console.error('[LOGIN] Error checking user count:', countError)
      }
      return { success: false, error: 'Invalid email or password' }
    }

    if (user.status === UserStatus.BANNED) {
      return { success: false, error: 'Your account has been banned' }
    }

    if (user.status === UserStatus.SUSPENDED) {
      return { success: false, error: 'Your account has been suspended' }
    }

    const isValidPassword = await verifyPassword(password, user.password)
    if (!isValidPassword) {
      return { success: false, error: 'Invalid email or password' }
    }

    // Update last login
    try {
      await db.user.update({
        where: { id: user.id },
        data: {
          lastLoginAt: new Date(),
        },
      })
    } catch (error) {
      console.error('Error updating last login:', error)
      // Continue even if update fails
    }

    const token = await createToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    })

    // Set cookie
    try {
      const cookieStore = await cookies()
      cookieStore.set('auth-token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 7, // 7 days
        path: '/',
      })
    } catch (error) {
      console.error('Error setting cookie:', error)
      return { success: false, error: 'Failed to set authentication cookie' }
    }

    // Create session record
    try {
      await db.session.create({
        data: {
          userId: user.id,
          token,
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        },
      })
    } catch (error) {
      console.error('Error creating session:', error)
      // Continue even if session creation fails - cookie is set
    }

    return { 
      success: true, 
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      }
    }
  } catch (error) {
    console.error('Login function error:', error)
    return { success: false, error: 'Database connection error. Please try again.' }
  }
}

export async function loginAsUser(adminId: string, targetUserId: string) {
  // Verify admin
  const admin = await db.user.findUnique({
    where: { id: adminId },
    select: { role: true, status: true },
  })

  if (!admin || (admin.role !== UserRole.ADMIN && admin.role !== UserRole.MANAGER)) {
    return { success: false, error: 'Unauthorized' }
  }

  // Get target user
  const targetUser = await db.user.findUnique({
    where: { id: targetUserId },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      status: true,
    },
  })

  if (!targetUser) {
    return { success: false, error: 'User not found' }
  }

  // Create token with impersonation flag
  const token = await createToken({
    userId: targetUser.id,
    email: targetUser.email,
    role: targetUser.role,
    impersonatedBy: adminId,
  })

  const cookieStore = await cookies()
  cookieStore.set('auth-token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 2, // 2 hours for impersonation
    path: '/',
  })

  return { 
    success: true, 
    user: targetUser,
  }
}

export async function logout() {
  const session = await getSession()
  
  if (session) {
    // If impersonating, return to admin
    if (session.impersonatedBy) {
      const admin = await db.user.findUnique({
        where: { id: session.impersonatedBy },
        select: {
          id: true,
          email: true,
          role: true,
        },
      })

      if (admin) {
        const token = await createToken({
          userId: admin.id,
          email: admin.email,
          role: admin.role,
        })

        const cookieStore = await cookies()
        cookieStore.set('auth-token', token, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax',
          maxAge: 60 * 60 * 24 * 7,
          path: '/',
        })

        return { success: true, returnedToAdmin: true }
      }
    }

    // Delete session from database
    await db.session.deleteMany({
      where: { userId: session.userId },
    })
  }

  const cookieStore = await cookies()
  cookieStore.delete('auth-token')
  
  return { success: true }
}

export async function register(data: {
  email: string
  password: string
  name: string
}) {
  try {
    // Check if database is available
    if (!process.env.DATABASE_URL) {
      console.error('[REGISTER] DATABASE_URL not configured')
      return { success: false, error: 'Database connection error. Please contact support.' }
    }

    let existingUser
    try {
      existingUser = await db.user.findUnique({
        where: { email: data.email },
      })
    } catch (dbError) {
      console.error('[REGISTER] Database query error:', dbError)
      const errorMessage = dbError instanceof Error ? dbError.message : 'Unknown database error'
      return { 
        success: false, 
        error: `Database connection error: ${errorMessage}. Please check your DATABASE_URL configuration.` 
      }
    }

    if (existingUser) {
      return { success: false, error: 'Email already registered' }
    }

    const hashedPassword = await hashPassword(data.password)

    let user
    try {
      user = await db.user.create({
        data: {
          email: data.email,
          password: hashedPassword,
          name: data.name,
        },
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
        },
      })
    } catch (createError) {
      console.error('[REGISTER] Database create error:', createError)
      const errorMessage = createError instanceof Error ? createError.message : 'Unknown database error'
      return { 
        success: false, 
        error: `Database connection error: ${errorMessage}. Please check your DATABASE_URL configuration.` 
      }
    }

    // Auto login after registration
    const token = await createToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    })

    const cookieStore = await cookies()
    cookieStore.set('auth-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7,
      path: '/',
    })

    return { success: true, user }
  } catch (error) {
    console.error('[REGISTER] Unexpected error:', error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Registration failed. Please try again.' 
    }
  }
}

export function requireAuth(allowedRoles?: UserRole[]) {
  return async function () {
    const session = await getSession()
    
    if (!session) {
      return { authorized: false, error: 'Not authenticated' }
    }

    if (allowedRoles && !allowedRoles.includes(session.role)) {
      return { authorized: false, error: 'Insufficient permissions' }
    }

    return { authorized: true, session }
  }
}

export const requireAdmin = requireAuth([UserRole.ADMIN])
export const requireManager = requireAuth([UserRole.ADMIN, UserRole.MANAGER])
