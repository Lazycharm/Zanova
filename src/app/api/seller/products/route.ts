import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getSession } from '@/lib/auth'

export async function POST(req: NextRequest) {
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
      return NextResponse.json({ error: 'You must create a shop first' }, { status: 400 })
    }

    const body = await req.json()
    const {
      name,
      slug,
      description,
      price,
      comparePrice,
      stock,
      sku,
      categoryId,
      status,
      images,
    } = body

    if (!name || !slug || price === undefined) {
      return NextResponse.json(
        { error: 'Name, slug, and price are required' },
        { status: 400 }
      )
    }

    // Check if slug already exists
    const existing = await db.product.findUnique({ where: { slug } })
    if (existing) {
      return NextResponse.json({ error: 'Slug already exists' }, { status: 400 })
    }

    // Create product
    const product = await db.product.create({
      data: {
        name,
        slug,
        description: description || null,
        price,
        comparePrice: comparePrice || null,
        stock: stock || 0,
        sku: sku || null,
        categoryId: categoryId || null,
        shopId: user.shop.id,
        status: status || 'DRAFT',
        isFeatured: false,
      },
    })

    // Create images
    if (images && Array.isArray(images) && images.length > 0) {
      await Promise.all(
        images.map((url: string, index: number) =>
          db.productImage.create({
            data: {
              productId: product.id,
              url,
              alt: name,
              isPrimary: index === 0,
              sortOrder: index,
            },
          })
        )
      )
    }

    return NextResponse.json({ product })
  } catch (error) {
    console.error('Error creating product:', error)
    return NextResponse.json({ error: 'Failed to create product' }, { status: 500 })
  }
}
