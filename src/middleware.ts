import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { jwtVerify } from 'jose'

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'zanova-secret-key'
)

// Protected routes that require authentication
const protectedRoutes = [
  '/account',
  '/checkout',
  '/seller',
]

// Admin routes that require admin/manager role
const adminRoutes = ['/admin']

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const token = request.cookies.get('auth-token')?.value

  // Skip maintenance check - will be handled by layout component for better performance
  // Middleware should only handle auth, not slow database/API calls

  // Allow access to maintenance page
  if (pathname === '/maintenance') {
    return NextResponse.next()
  }

  // Check if route is protected
  const isProtectedRoute = protectedRoutes.some((route) =>
    pathname.startsWith(route)
  )
  const isAdminRoute = adminRoutes.some((route) =>
    pathname.startsWith(route)
  )

  // If not a protected route, continue
  if (!isProtectedRoute && !isAdminRoute) {
    return NextResponse.next()
  }

  // If no token, redirect to login
  if (!token) {
    const loginUrl = new URL('/auth/login', request.url)
    loginUrl.searchParams.set('redirect', pathname)
    return NextResponse.redirect(loginUrl)
  }

  try {
    // Verify token
    const { payload } = await jwtVerify(token, JWT_SECRET)
    
    // For admin routes, check role
    if (isAdminRoute) {
      if (payload.role !== 'ADMIN' && payload.role !== 'MANAGER') {
        return NextResponse.redirect(new URL('/', request.url))
      }
    }

    return NextResponse.next()
  } catch {
    // Invalid token, redirect to login
    const response = NextResponse.redirect(new URL('/auth/login', request.url))
    response.cookies.delete('auth-token')
    return response
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     * - api routes (handled separately)
     */
    '/((?!_next/static|_next/image|favicon.ico|api|images|icons).*)',
  ],
}
