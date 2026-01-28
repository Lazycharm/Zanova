import { getCurrentUser } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { db } from '@/lib/db'
import { ShopsClient } from './shops-client'

export const dynamic = 'force-dynamic'

interface SearchParams {
  page?: string
  search?: string
  status?: string
}

async function getShops(searchParams: SearchParams) {
  const page = parseInt(searchParams.page || '1')
  const limit = 20
  const skip = (page - 1) * limit

  const where: any = {}

  if (searchParams.search) {
    where.OR = [
      { name: { contains: searchParams.search, mode: 'insensitive' } },
      { slug: { contains: searchParams.search, mode: 'insensitive' } },
    ]
  }

  if (searchParams.status && searchParams.status !== 'all') {
    where.status = searchParams.status
  }

  const [shops, total] = await Promise.all([
    db.shop.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        _count: {
          select: {
            products: true,
            orders: true,
          },
        },
      },
    }),
    db.shop.count({ where }),
  ])

  return {
    shops: shops.map((shop) => ({
      id: shop.id,
      name: shop.name,
      slug: shop.slug,
      status: shop.status,
      level: shop.level,
      balance: Number(shop.balance),
      totalSales: shop.totalSales,
      rating: Number(shop.rating),
      commissionRate: Number(shop.commissionRate),
      logo: shop.logo,
      user: {
        id: shop.user.id,
        name: shop.user.name,
        email: shop.user.email,
      },
      productCount: shop._count.products,
      orderCount: shop._count.orders,
      createdAt: shop.createdAt.toISOString(),
    })),
    total,
    pages: Math.ceil(total / limit),
    page,
  }
}

export default async function ShopsPage({
  searchParams,
}: {
  searchParams: SearchParams
}) {
  const currentUser = await getCurrentUser()

  if (!currentUser) {
    redirect('/auth/login')
  }

  if (currentUser.role !== 'ADMIN' && currentUser.role !== 'MANAGER') {
    redirect('/')
  }

  const data = await getShops(searchParams)

  return <ShopsClient {...data} searchParams={searchParams} />
}
