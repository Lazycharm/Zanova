import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getSession } from '@/lib/auth'

export async function GET(req: NextRequest) {
  try {
    const auth = await getSession()

    if (!auth || (auth.role !== 'ADMIN' && auth.role !== 'MANAGER')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const slides = await db.heroSlide.findMany({
      orderBy: { sortOrder: 'asc' },
    })

    return NextResponse.json({ slides })
  } catch (error) {
    console.error('Error fetching hero slides:', error)
    return NextResponse.json({ error: 'Failed to fetch slides' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const auth = await getSession()

    if (!auth || (auth.role !== 'ADMIN' && auth.role !== 'MANAGER')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
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

    if (!image) {
      return NextResponse.json({ error: 'Image is required' }, { status: 400 })
    }

    const slide = await db.heroSlide.create({
      data: {
        title: title || null,
        subtitle: subtitle || null,
        image,
        mobileImage: mobileImage || null,
        ctaText: ctaText || null,
        ctaLink: ctaLink || null,
        isActive: isActive !== undefined ? isActive : true,
        sortOrder: sortOrder !== undefined ? sortOrder : 0,
        startsAt: startsAt ? new Date(startsAt) : null,
        endsAt: endsAt ? new Date(endsAt) : null,
      },
    })

    return NextResponse.json({ slide })
  } catch (error) {
    console.error('Error creating hero slide:', error)
    return NextResponse.json({ error: 'Failed to create slide' }, { status: 500 })
  }
}
