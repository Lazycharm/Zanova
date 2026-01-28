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
      icon,
      image,
      isActive,
      showOnHome,
      parentId,
    } = body

    // If slug is being updated, check if it's already taken
    if (slug) {
      const existing = await db.category.findFirst({
        where: {
          slug,
          NOT: { id: params.id },
        },
      })
      if (existing) {
        return NextResponse.json({ error: 'Slug already exists' }, { status: 400 })
      }
    }

    const category = await db.category.update({
      where: { id: params.id },
      data: {
        name: name || undefined,
        slug: slug || undefined,
        description: description !== undefined ? description || null : undefined,
        icon: icon !== undefined ? icon || null : undefined,
        image: image !== undefined ? image || null : undefined,
        isActive: isActive !== undefined ? isActive : undefined,
        showOnHome: showOnHome !== undefined ? showOnHome : undefined,
        parentId: parentId !== undefined ? parentId || null : undefined,
      },
    })

    return NextResponse.json({ category })
  } catch (error) {
    console.error('Error updating category:', error)
    return NextResponse.json({ error: 'Failed to update category' }, { status: 500 })
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

    // CategoryId is required on Product (non-nullable). If products exist, block deletion.
    const productsInCategory = await db.product.count({
      where: { categoryId: params.id },
    })
    if (productsInCategory > 0) {
      return NextResponse.json(
        {
          error:
            'Cannot delete this category because it has products. Move products to another category first.',
        },
        { status: 400 }
      )
    }

    // Delete the category
    await db.category.delete({
      where: { id: params.id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting category:', error)
    return NextResponse.json({ error: 'Failed to delete category' }, { status: 500 })
  }
}
