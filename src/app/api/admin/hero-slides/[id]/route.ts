import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getSession } from '@/lib/auth'

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const auth = await getSession()

    if (!auth) {
      console.error('[Hero Slides PUT] No auth session found')
      return NextResponse.json({ error: 'Unauthorized: No session found' }, { status: 401 })
    }

    if (auth.role !== 'ADMIN' && auth.role !== 'MANAGER') {
      console.error(`[Hero Slides PUT] Insufficient permissions. Role: ${auth.role}, User: ${auth.email}`)
      return NextResponse.json({ error: 'Unauthorized: Insufficient permissions' }, { status: 401 })
    }

    const body = await req.json()
    const {
      title,
      subtitle,
      image,
      mobileImage,
      ctaText,
      ctaLink,
      isActive,
      sortOrder,
      startsAt,
      endsAt,
    } = body

    const slide = await db.heroSlide.update({
      where: { id: params.id },
      data: {
        title: title !== undefined ? title || null : undefined,
        subtitle: subtitle !== undefined ? subtitle || null : undefined,
        image: image || undefined,
        mobileImage: mobileImage !== undefined ? mobileImage || null : undefined,
        ctaText: ctaText !== undefined ? ctaText || null : undefined,
        ctaLink: ctaLink !== undefined ? ctaLink || null : undefined,
        isActive: isActive !== undefined ? isActive : undefined,
        sortOrder: sortOrder !== undefined ? sortOrder : undefined,
        startsAt: startsAt !== undefined ? (startsAt ? new Date(startsAt) : null) : undefined,
        endsAt: endsAt !== undefined ? (endsAt ? new Date(endsAt) : null) : undefined,
      },
    })

    return NextResponse.json({ slide })
  } catch (error) {
    console.error('Error updating hero slide:', error)
    return NextResponse.json({ error: 'Failed to update slide' }, { status: 500 })
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const auth = await getSession()

    if (!auth) {
      console.error('[Hero Slides PUT] No auth session found')
      return NextResponse.json({ error: 'Unauthorized: No session found' }, { status: 401 })
    }

    if (auth.role !== 'ADMIN' && auth.role !== 'MANAGER') {
      console.error(`[Hero Slides PUT] Insufficient permissions. Role: ${auth.role}, User: ${auth.email}`)
      return NextResponse.json({ error: 'Unauthorized: Insufficient permissions' }, { status: 401 })
    }

    await db.heroSlide.delete({
      where: { id: params.id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting hero slide:', error)
    return NextResponse.json({ error: 'Failed to delete slide' }, { status: 500 })
  }
}
