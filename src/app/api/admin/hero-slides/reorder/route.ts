import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getSession } from '@/lib/auth'

export async function POST(req: NextRequest) {
  try {
    const auth = await getSession()

    if (!auth) {
      console.error('[Hero Slides Reorder] No auth session found')
      return NextResponse.json({ error: 'Unauthorized: No session found' }, { status: 401 })
    }

    if (auth.role !== 'ADMIN' && auth.role !== 'MANAGER') {
      console.error(`[Hero Slides Reorder] Insufficient permissions. Role: ${auth.role}, User: ${auth.email}`)
      return NextResponse.json({ error: 'Unauthorized: Insufficient permissions' }, { status: 401 })
    }

    const body = await req.json()
    const { slides } = body

    if (!Array.isArray(slides)) {
      return NextResponse.json({ error: 'Invalid slides data' }, { status: 400 })
    }

    // Update each slide's sortOrder
    await Promise.all(
      slides.map((slide: { id: string; sortOrder: number }) =>
        db.heroSlide.update({
          where: { id: slide.id },
          data: { sortOrder: slide.sortOrder },
        })
      )
    )

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error reordering hero slides:', error)
    return NextResponse.json({ error: 'Failed to reorder slides' }, { status: 500 })
  }
}
