import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getSession } from '@/lib/auth'
import { ShopStatus, ShopLevel } from '@prisma/client'

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getSession()

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (session.role !== 'ADMIN' && session.role !== 'MANAGER') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await req.json()
    const {
      name,
      slug,
      description,
      status,
      level,
      balance,
      rating,
      commissionRate,
      followers,
      totalSales,
    } = body

    const updateData: any = {}

    if (name !== undefined) {
      updateData.name = name
    }

    if (slug !== undefined) {
      updateData.slug = slug
    }

    if (description !== undefined) {
      updateData.description = description || null
    }

    if (status && Object.values(ShopStatus).includes(status)) {
      updateData.status = status
    }

    if (level && Object.values(ShopLevel).includes(level)) {
      updateData.level = level
    }

    if (balance !== undefined) {
      const balanceValue = parseFloat(balance)
      if (balanceValue >= 0) {
        updateData.balance = balanceValue
      } else {
        return NextResponse.json(
          { error: 'Balance must be greater than or equal to 0' },
          { status: 400 }
        )
      }
    }

    if (rating !== undefined) {
      const ratingValue = parseFloat(rating)
      if (ratingValue >= 0 && ratingValue <= 5) {
        updateData.rating = ratingValue
      } else {
        return NextResponse.json(
          { error: 'Rating must be between 0 and 5' },
          { status: 400 }
        )
      }
    }

    if (commissionRate !== undefined) {
      const rate = parseFloat(commissionRate)
      if (rate >= 0 && rate <= 100) {
        updateData.commissionRate = rate
      } else {
        return NextResponse.json(
          { error: 'Commission rate must be between 0 and 100' },
          { status: 400 }
        )
      }
    }

    if (followers !== undefined) {
      const followersValue = parseInt(followers)
      if (followersValue >= 0) {
        updateData.followers = followersValue
      } else {
        return NextResponse.json(
          { error: 'Followers count must be greater than or equal to 0' },
          { status: 400 }
        )
      }
    }

    if (totalSales !== undefined) {
      const totalSalesValue = parseInt(totalSales)
      if (totalSalesValue >= 0) {
        updateData.totalSales = totalSalesValue
      } else {
        return NextResponse.json(
          { error: 'Total sales must be greater than or equal to 0' },
          { status: 400 }
        )
      }
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json({ error: 'No valid fields to update' }, { status: 400 })
    }

    const shop = await db.shop.update({
      where: { id: params.id },
      data: updateData,
    })

    return NextResponse.json({ shop })
  } catch (error: any) {
    console.error('Error updating shop:', error)
    if (error.code === 'P2002') {
      return NextResponse.json(
        { error: 'Shop slug already exists' },
        { status: 400 }
      )
    }
    return NextResponse.json({ error: 'Failed to update shop' }, { status: 500 })
  }
}

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getSession()

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (session.role !== 'ADMIN' && session.role !== 'MANAGER') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const shop = await db.shop.findUnique({
      where: { id: params.id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        products: {
          take: 10,
          orderBy: { createdAt: 'desc' },
          include: {
            images: {
              where: { isPrimary: true },
              take: 1,
            },
          },
        },
        _count: {
          select: {
            products: true,
            orders: true,
          },
        },
      },
    })

    if (!shop) {
      return NextResponse.json({ error: 'Shop not found' }, { status: 404 })
    }

    return NextResponse.json({
      shop: {
        ...shop,
        balance: Number(shop.balance),
        rating: Number(shop.rating),
        products: shop.products.map((p) => ({
          ...p,
          price: Number(p.price),
          image: p.images[0]?.url || null,
        })),
      },
    })
  } catch (error) {
    console.error('Error fetching shop:', error)
    return NextResponse.json({ error: 'Failed to fetch shop' }, { status: 500 })
  }
}
