import { redirect } from 'next/navigation'
import { getCurrentUser } from '@/lib/auth'
import { db } from '@/lib/db'
import { UserDetailsClient } from './user-details-client'

export const dynamic = 'force-dynamic'

async function getUserData(userId: string) {
  const user = await db.user.findUnique({
    where: { id: userId },
    include: {
      shop: {
        include: {
          _count: {
            select: {
              products: true,
              orders: true,
            },
          },
        },
      },
      _count: {
        select: {
          orders: true,
          addresses: true,
          reviews: true,
          favorites: true,
        },
      },
      orders: {
        take: 5,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          orderNumber: true,
          status: true,
          paymentStatus: true,
          total: true,
          createdAt: true,
        },
      },
    },
  })

  if (!user) {
    return null
  }

  return {
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      avatar: user.avatar,
      phone: user.phone,
      role: user.role,
      status: user.status,
      balance: Number(user.balance),
      canSell: user.canSell,
      emailVerified: user.emailVerified?.toISOString() || null,
      lastLoginAt: user.lastLoginAt?.toISOString() || null,
      lastLoginIp: user.lastLoginIp,
      createdAt: user.createdAt.toISOString(),
      orderCount: user._count.orders,
      addressCount: user._count.addresses,
      reviewCount: user._count.reviews,
      favoriteCount: user._count.favorites,
    },
    shop: user.shop
      ? {
          id: user.shop.id,
          name: user.shop.name,
          slug: user.shop.slug,
          status: user.shop.status,
          level: user.shop.level,
          balance: Number(user.shop.balance),
          rating: Number(user.shop.rating),
          productCount: user.shop._count.products,
          orderCount: user.shop._count.orders,
        }
      : null,
    recentOrders: user.orders.map((order) => ({
      id: order.id,
      orderNumber: order.orderNumber,
      status: order.status,
      paymentStatus: order.paymentStatus,
      total: Number(order.total),
      createdAt: order.createdAt.toISOString(),
    })),
  }
}

export default async function UserDetailsPage({
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

  const data = await getUserData(params.id)

  if (!data) {
    redirect('/admin/users')
  }

  return <UserDetailsClient {...data} />
}
