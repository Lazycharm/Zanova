import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getSession } from '@/lib/auth'

export async function POST(req: NextRequest) {
  try {
    const auth = await getSession()

    if (!auth || (auth.role !== 'ADMIN' && auth.role !== 'MANAGER')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
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
      shopId,
      status,
      isFeatured,
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
        shopId: shopId || null,
        status: status || 'DRAFT',
        isFeatured: isFeatured || false,
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
