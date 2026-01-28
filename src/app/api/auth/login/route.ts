import { NextResponse } from 'next/server'
import { login } from '@/lib/auth'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { email, password } = body

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      )
    }

    // Check if DATABASE_URL is configured
    if (!process.env.DATABASE_URL) {
      console.error('[LOGIN] DATABASE_URL not configured')
      return NextResponse.json(
        { 
          error: 'Database not configured. Please set DATABASE_URL environment variable.',
          code: 'DATABASE_NOT_CONFIGURED'
        },
        { status: 503 }
      )
    }

    console.log(`[LOGIN] Attempting login for: ${email}`)
    const result = await login(email, password)

    if (!result.success || !result.user) {
      console.log(`[LOGIN] Failed: ${result.error}`)
      
      // Provide more helpful error message
      let errorMessage = result.error || 'Invalid email or password'
      let statusCode = 401
      
      // If database connection error, return 503
      if (errorMessage.includes('Database connection') || errorMessage.includes('DATABASE_URL')) {
        statusCode = 503
        errorMessage = 'Database connection error. Please check your database configuration.'
      }
      
      return NextResponse.json(
        { error: errorMessage },
        { status: statusCode }
      )
    }

    console.log(`[LOGIN] Success: ${email} (${result.user.role})`)
    return NextResponse.json({ 
      success: true,
      user: result.user 
    })
  } catch (error) {
    console.error('[LOGIN] Error:', error)
    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : 'Internal server error',
        code: 'INTERNAL_ERROR'
      },
      { status: 500 }
    )
  }
}
