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
  const session = await getSession()
  if (!session) return null

  const user = await db.user.findUnique({
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
  })

  if (!user || user.status !== UserStatus.ACTIVE) return null

  return {
    ...user,
    balance: Number(user.balance),
    isImpersonating: !!session.impersonatedBy,
    impersonatedBy: session.impersonatedBy,
  }
}

export async function login(email: string, password: string) {
  const user = await db.user.findUnique({
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

  if (!user) {
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
  await db.user.update({
    where: { id: user.id },
    data: {
      lastLoginAt: new Date(),
    },
  })

  const token = await createToken({
    userId: user.id,
    email: user.email,
    role: user.role,
  })

  // Set cookie
  const cookieStore = await cookies()
  cookieStore.set('auth-token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7, // 7 days
    path: '/',
  })

  // Create session record
  await db.session.create({
    data: {
      userId: user.id,
      token,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    },
  })

  return { 
    success: true, 
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    }
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
  const existingUser = await db.user.findUnique({
    where: { email: data.email },
  })

  if (existingUser) {
    return { success: false, error: 'Email already registered' }
  }

  const hashedPassword = await hashPassword(data.password)

  const user = await db.user.create({
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
