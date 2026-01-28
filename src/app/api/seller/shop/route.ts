import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getSession } from '@/lib/auth'
import { ShopStatus } from '@prisma/client'

export async function POST(req: NextRequest) {
  try {
    const session = await getSession()

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user can sell
    const user = await db.user.findUnique({
      where: { id: session.userId },
      select: { canSell: true, shop: true },
    })

    if (!user?.canSell) {
      return NextResponse.json({ error: 'You do not have permission to create a shop' }, { status: 403 })
    }

    if (user.shop) {
      return NextResponse.json({ error: 'You already have a shop' }, { status: 400 })
    }

    const body = await req.json()
    const { name, slug, description, logo, banner } = body

    if (!name || !slug) {
      return NextResponse.json(
        { error: 'Name and slug are required' },
        { status: 400 }
      )
    }

    // Check if slug already exists
    const existing = await db.shop.findUnique({ where: { slug } })
    if (existing) {
      return NextResponse.json({ error: 'Slug already exists' }, { status: 400 })
    }

    // Create shop
    const shop = await db.shop.create({
      data: {
        userId: session.userId,
        name,
        slug,
        description: description || null,
        logo: logo || null,
        banner: banner || null,
        status: ShopStatus.PENDING,
      },
    })

    return NextResponse.json({ shop })
  } catch (error) {
    console.error('Error creating shop:', error)
    return NextResponse.json({ error: 'Failed to create shop' }, { status: 500 })
  }
}

export async function PUT(req: NextRequest) {
  try {
    const session = await getSession()

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await db.user.findUnique({
      where: { id: session.userId },
      include: { shop: true },
    })

    if (!user?.shop) {
      return NextResponse.json({ error: 'Shop not found' }, { status: 404 })
    }

    const body = await req.json()
    const { name, slug, description, logo, banner } = body

    // Check if slug is being changed and if it's already taken
    if (slug && slug !== user.shop.slug) {
      const existing = await db.shop.findFirst({
        where: {
          slug,
          NOT: { id: user.shop.id },
        },
      })
      if (existing) {
        return NextResponse.json({ error: 'Slug already exists' }, { status: 400 })
      }
    }

    // Update shop
    const shop = await db.shop.update({
      where: { id: user.shop.id },
      data: {
        name: name || undefined,
        slug: slug || undefined,
        description: description !== undefined ? description : undefined,
        logo: logo !== undefined ? logo : undefined,
        banner: banner !== undefined ? banner : undefined,
      },
    })

    return NextResponse.json({ shop })
  } catch (error) {
    console.error('Error updating shop:', error)
    return NextResponse.json({ error: 'Failed to update shop' }, { status: 500 })
  }
}
