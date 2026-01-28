import { redirect } from 'next/navigation'
import { getCurrentUser } from '@/lib/auth'
import { db } from '@/lib/db'
import { AdminShopDetailsClient } from './shop-details-client'

async function getShopData(shopId: string) {
  const shop = await db.shop.findUnique({
    where: { id: shopId },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          avatar: true,
          role: true,
          status: true,
          balance: true,
          canSell: true,
          createdAt: true,
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
          category: {
            select: {
              name: true,
            },
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
    return null
  }

  // Get recent orders
  const recentOrders = await db.order.findMany({
    where: {
      items: {
        some: {
          product: {
            shopId: shop.id,
          },
        },
      },
    },
    orderBy: { createdAt: 'desc' },
    take: 5,
    include: {
      user: {
        select: {
          name: true,
          email: true,
        },
      },
      items: {
        where: {
          product: {
            shopId: shop.id,
          },
        },
        take: 1,
      },
    },
  })

  // Get followers count - use stored value if available, otherwise calculate from favorites
  let followersCount = shop.followers || 0
  if (followersCount === 0) {
    // Calculate from favorites if not set
    const followers = await db.favorite.findMany({
      where: {
        product: {
          shopId: shop.id,
        },
      },
      select: {
        userId: true,
      },
      distinct: ['userId'],
    })
    followersCount = followers.length
  }

  return {
    shop: {
      id: shop.id,
      name: shop.name,
      slug: shop.slug,
      description: shop.description,
      logo: shop.logo,
      banner: shop.banner,
      status: shop.status,
      level: shop.level,
      balance: Number(shop.balance),
      totalSales: shop.totalSales,
      rating: Number(shop.rating),
      commissionRate: Number(shop.commissionRate),
      createdAt: shop.createdAt.toISOString(),
      productCount: shop._count.products,
      orderCount: shop._count.orders,
      followersCount: shop.followers || followersCount,
    },
    owner: {
      id: shop.user.id,
      name: shop.user.name,
      email: shop.user.email,
      avatar: shop.user.avatar,
      role: shop.user.role,
      status: shop.user.status,
      balance: Number(shop.user.balance),
      canSell: shop.user.canSell,
      createdAt: shop.user.createdAt.toISOString(),
    },
    products: shop.products.map((p) => ({
      id: p.id,
      name: p.name,
      slug: p.slug,
      price: Number(p.price),
      stock: p.stock,
      status: p.status,
      image: p.images[0]?.url || null,
      categoryName: p.category.name,
    })),
    recentOrders: recentOrders.map((order) => ({
      id: order.id,
      orderNumber: order.orderNumber,
      status: order.status,
      paymentStatus: order.paymentStatus,
      total: Number(order.total),
      userName: order.user.name,
      createdAt: order.createdAt.toISOString(),
    })),
  }
}

export default async function AdminShopDetailsPage({
  params,
}: {
  params: { id: string }
}) {
  const currentUser = await getCurrentUser()

  if (!currentUser) {
    redirect('/auth/login')
  }

  if (currentUser.role !== 'ADMIN' && currentUser.role !== 'MANAGER') {
    redirect('/')
  }

  const data = await getShopData(params.id)

  if (!data) {
    redirect('/admin/shops')
  }

  return <AdminShopDetailsClient {...data} />
}
