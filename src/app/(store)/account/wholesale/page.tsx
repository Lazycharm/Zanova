import { redirect } from 'next/navigation'
import { getCurrentUser } from '@/lib/auth'
import { db } from '@/lib/db'
import { WholesaleClient } from './wholesale-client'

export const dynamic = 'force-dynamic'

interface SearchParams {
  page?: string
  category?: string
  minPrice?: string
  maxPrice?: string
  search?: string
}

async function getWholesaleData(userId: string, searchParams: SearchParams) {
  const page = parseInt(searchParams.page || '1')
  const limit = 24
  const skip = (page - 1) * limit

  const where: any = {
    status: 'PUBLISHED',
  }

  // Category filter
  if (searchParams.category) {
    where.categoryId = searchParams.category
  }

  // Price filter
  if (searchParams.minPrice || searchParams.maxPrice) {
    where.price = {}
    if (searchParams.minPrice) {
      where.price.gte = parseFloat(searchParams.minPrice)
    }
    if (searchParams.maxPrice) {
      where.price.lte = parseFloat(searchParams.maxPrice)
    }
  }

  // Search filter
  if (searchParams.search) {
    where.OR = [
      { name: { contains: searchParams.search, mode: 'insensitive' } },
      { description: { contains: searchParams.search, mode: 'insensitive' } },
    ]
  }

  const [products, total, categories, user] = await Promise.all([
    db.product.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        images: {
          where: { isPrimary: true },
          take: 1,
        },
        category: {
          select: { name: true },
        },
      },
    }),
    db.product.count({ where }),
    db.category.findMany({
      where: { isActive: true, parentId: null },
      orderBy: { name: 'asc' },
    }),
    db.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        avatar: true,
        balance: true,
        shop: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    }),
  ])

  return {
    products: products.map((p) => ({
      id: p.id,
      name: p.name,
      slug: p.slug,
      price: Number(p.price),
      comparePrice: p.comparePrice ? Number(p.comparePrice) : null,
      image: p.images[0]?.url || '/placeholder-product.jpg',
      categoryName: p.category?.name || 'Uncategorized',
      categoryId: p.categoryId,
    })),
    total,
    pages: Math.ceil(total / limit),
    page,
    categories: categories.map(c => ({ id: c.id, name: c.name, slug: c.slug })),
    user: user ? {
      id: user.id,
      name: user.name,
      email: user.email,
      avatar: user.avatar,
      balance: Number(user.balance),
      shop: user.shop,
    } : null,
  }
}

export default async function WholesalePage({
  searchParams,
}: {
  searchParams: SearchParams
}) {
  const currentUser = await getCurrentUser()

  if (!currentUser) {
    redirect('/auth/login')
  }

  if (!currentUser.canSell) {
    redirect('/account')
  }

  const data = await getWholesaleData(currentUser.id, searchParams)

  return <WholesaleClient {...data} searchParams={searchParams} />
}
