import { redirect } from 'next/navigation'
import { getCurrentUser } from '@/lib/auth'
import { db } from '@/lib/db'
import { SellerOrderDetailsClient } from './order-details-client'

async function getOrder(orderId: string, userId: string) {
  const user = await db.user.findUnique({
    where: { id: userId },
    include: { shop: true },
  })

  if (!user?.shop) {
    return null
  }

  const order = await db.order.findUnique({
    where: { id: orderId },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
      address: true,
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
  })

  // Verify order has items from this shop
  if (!order || order.items.length === 0) {
    return null
  }

  return {
    ...order,
    total: Number(order.total),
    subtotal: Number(order.subtotal),
    shipping: Number(order.shipping),
    tax: Number(order.tax),
    items: order.items.map((item) => ({
      ...item,
      price: Number(item.price),
      product: item.product ? {
        name: item.product.name,
        slug: item.product.slug,
      } : null,
    })),
  }
}

export default async function SellerOrderDetailsPage({
  params,
}: {
  params: { id: string }
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

  const order = await getOrder(params.id, currentUser.id)

  if (!order) {
    redirect('/seller/orders')
  }

  return <SellerOrderDetailsClient order={order} />
}
