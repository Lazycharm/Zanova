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

    console.log(`[LOGIN] Attempting login for: ${email}`)
    const result = await login(email, password)

    if (!result.success) {
      console.log(`[LOGIN] Failed: ${result.error}`)
      return NextResponse.json(
        { error: result.error },
        { status: 401 }
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
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    )
  }
}
