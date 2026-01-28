import { redirect } from 'next/navigation'
import { getCurrentUser } from '@/lib/auth'
import { db } from '@/lib/db'
import { SellerOrdersClient } from './orders-client'

export const dynamic = 'force-dynamic'

interface SearchParams {
  page?: string
  status?: string
}

async function getSellerOrders(userId: string, searchParams: SearchParams) {
  const page = parseInt(searchParams.page || '1')
  const limit = 20
  const skip = (page - 1) * limit

  // Get user's shop
  const user = await db.user.findUnique({
    where: { id: userId },
    include: { shop: true },
  })

  if (!user?.shop) {
    return {
      orders: [],
      total: 0,
      pages: 0,
      page: 1,
    }
  }

  const where: any = {
    items: {
      some: {
        product: {
          shopId: user.shop.id,
        },
      },
    },
  }

  if (searchParams.status && searchParams.status !== 'all') {
    where.status = searchParams.status
  }

  const [orders, total] = await Promise.all([
    db.order.findMany({
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
        items: {
          where: {
            product: {
              shopId: user.shop.id,
            },
          },
          include: {
            product: {
              select: {
                name: true,
                slug: true,
              },
            },
          },
        },
      },
    }),
    db.order.count({ where }),
  ])

  return {
    orders: orders.map((order) => ({
      id: order.id,
      orderNumber: order.orderNumber,
      status: order.status,
      paymentStatus: order.paymentStatus,
      total: Number(order.total),
      createdAt: order.createdAt,
      userName: order.user.name,
      userEmail: order.user.email,
      items: order.items.map((item) => ({
        id: item.id,
        name: item.name,
        quantity: item.quantity,
        price: Number(item.price),
        image: item.image,
      })),
    })),
    total,
    pages: Math.ceil(total / limit),
    page,
  }
}

export default async function SellerOrdersPage({
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

  const user = await db.user.findUnique({
    where: { id: currentUser.id },
    include: { shop: true },
  })

  if (!user?.shop) {
    redirect('/seller/create-shop')
  }

  const data = await getSellerOrders(currentUser.id, searchParams)

  return <SellerOrdersClient {...data} searchParams={searchParams} />
}
