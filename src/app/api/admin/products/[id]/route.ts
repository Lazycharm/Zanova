import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getSession } from '@/lib/auth'

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
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

    // If slug is being updated, check if it's already taken
    if (slug) {
      const existing = await db.product.findFirst({
        where: {
          slug,
          NOT: { id: params.id },
        },
      })
      if (existing) {
        return NextResponse.json({ error: 'Slug already exists' }, { status: 400 })
      }
    }

    // Update product
    const product = await db.product.update({
      where: { id: params.id },
      data: {
        name: name || undefined,
        slug: slug || undefined,
        description: description !== undefined ? description || null : undefined,
        price: price !== undefined ? price : undefined,
        comparePrice: comparePrice !== undefined ? comparePrice || null : undefined,
        stock: stock !== undefined ? stock : undefined,
        sku: sku !== undefined ? sku || null : undefined,
        categoryId: categoryId !== undefined ? categoryId || null : undefined,
        shopId: shopId !== undefined ? shopId || null : undefined,
        status: status || undefined,
        isFeatured: isFeatured !== undefined ? isFeatured : undefined,
      },
    })

    // Update images if provided
    if (images && Array.isArray(images)) {
      // Delete existing images
      await db.productImage.deleteMany({
        where: { productId: params.id },
      })

      // Create new images
      if (images.length > 0) {
        await Promise.all(
          images.map((url: string, index: number) =>
            db.productImage.create({
              data: {
                productId: params.id,
                url,
                alt: name || product.name,
                isPrimary: index === 0,
                sortOrder: index,
              },
            })
          )
        )
      }
    }

    return NextResponse.json({ product })
  } catch (error) {
    console.error('Error updating product:', error)
    return NextResponse.json({ error: 'Failed to update product' }, { status: 500 })
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const auth = await getSession()

    if (!auth || (auth.role !== 'ADMIN' && auth.role !== 'MANAGER')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Delete product images first
    await db.productImage.deleteMany({
      where: { productId: params.id },
    })

    // Delete the product
    await db.product.delete({
      where: { id: params.id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting product:', error)
    return NextResponse.json({ error: 'Failed to delete product' }, { status: 500 })
  }
}
