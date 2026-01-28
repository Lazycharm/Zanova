import { redirect } from 'next/navigation'
import { getCurrentUser } from '@/lib/auth'
import { db } from '@/lib/db'
import { SellerDashboardClient } from './dashboard-client'

async function getSellerStats(userId: string, shopId: string | null) {
  if (!shopId) {
    return {
      totalProducts: 0,
      totalOrders: 0,
      totalRevenue: 0,
      pendingOrders: 0,
      activeProducts: 0,
      recentOrders: [],
    }
  }

  const [totalProducts, totalOrders, totalRevenue, pendingOrders, activeProducts, recentOrders] = await Promise.all([
    db.product.count({ where: { shopId } }),
    db.order.count({
      where: {
        items: {
          some: {
            product: {
              shopId,
            },
          },
        },
      },
    }),
    db.order.aggregate({
      where: {
        items: {
          some: {
            product: {
              shopId,
            },
          },
        },
        paymentStatus: 'COMPLETED',
      },
      _sum: {
        total: true,
      },
    }),
    db.order.count({
      where: {
        items: {
          some: {
            product: {
              shopId,
            },
          },
        },
        status: {
          in: ['PENDING_PAYMENT', 'PROCESSING'],
        },
      },
    }),
    db.product.count({
      where: {
        shopId,
        status: 'PUBLISHED',
      },
    }),
    db.order.findMany({
      where: {
        items: {
          some: {
            product: {
              shopId,
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
          },
        },
        items: {
          where: {
            product: {
              shopId,
            },
          },
          take: 1,
        },
      },
    }),
  ])

  return {
    totalProducts,
    totalOrders,
    totalRevenue: Number(totalRevenue._sum.total || 0),
    pendingOrders,
    activeProducts,
    recentOrders: recentOrders.map((order) => ({
      id: order.id,
      orderNumber: order.orderNumber,
      userName: order.user.name,
      total: Number(order.total),
      status: order.status,
      createdAt: order.createdAt.toISOString(),
    })),
  }
}

export default async function SellerDashboardPage() {
  const currentUser = await getCurrentUser()

  if (!currentUser) {
    redirect('/auth/login')
  }

  if (!currentUser.canSell) {
    redirect('/account')
  }

  // Get user's shop
  const user = await db.user.findUnique({
    where: { id: currentUser.id },
    include: {
      shop: true,
    },
  })

  const stats = await getSellerStats(currentUser.id, user?.shop?.id || null)

  // Convert Decimal fields to numbers for client component
  const shopData = user?.shop ? {
    ...user.shop,
    balance: Number(user.shop.balance),
    rating: Number(user.shop.rating),
    commissionRate: Number(user.shop.commissionRate),
  } : null

  return <SellerDashboardClient stats={stats} shop={shopData} />
}
