import { redirect, notFound } from 'next/navigation'
import { getCurrentUser } from '@/lib/auth'
import { db } from '@/lib/db'
import { OrderDetailsClient } from './order-details-client'

async function getOrder(orderId: string, userId: string) {
  const order = await db.order.findFirst({
    where: {
      id: orderId,
      userId,
    },
    include: {
      items: {
        include: {
          product: {
            select: {
              id: true,
              name: true,
              slug: true,
              images: {
                where: { isPrimary: true },
                take: 1,
              },
            },
          },
        },
      },
    },
  })

  if (!order) {
    return null
  }

  return {
    ...order,
    total: Number(order.total),
    subtotal: Number(order.subtotal),
    tax: Number(order.tax),
    shippingCost: Number(order.shipping),
    shippingAddress: order.notes || '{}',
    items: order.items.map((item) => ({
      ...item,
      price: Number(item.price),
      quantity: item.quantity,
    })),
  }
}

export default async function OrderDetailPage({
  params,
}: {
  params: { id: string }
}) {
  const user = await getCurrentUser()

  if (!user) {
    redirect('/auth/login')
  }

  const order = await getOrder(params.id, user.id)

  if (!order) {
    notFound()
  }

  return <OrderDetailsClient order={order} />
}
