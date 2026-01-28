import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { db } from '@/lib/db'
import { createNotification } from '@/lib/notifications'

export async function POST(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session?.userId) {
      return NextResponse.json(
        { message: 'Please login to place an order' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { items, address, paymentMethod, cryptoType, cryptoAddressId, total } = body

    if (!items || items.length === 0) {
      return NextResponse.json(
        { message: 'No items in order' },
        { status: 400 }
      )
    }

    // Generate unique order number
    const orderNumber = `ORD-${Date.now()}-${Math.random().toString(36).substring(2, 9).toUpperCase()}`

    // Calculate values
    const subtotal = items.reduce((sum: number, item: any) => sum + (item.price * item.quantity), 0)
    const shippingCost = 0 // Free shipping
    const tax = subtotal * 0.1 // 10% tax
    const totalAmount = subtotal + shippingCost + tax

    // Create order
    const order = await db.order.create({
      data: {
        userId: session.userId,
        orderNumber,
        subtotal,
        shipping: shippingCost,
        tax,
        total: totalAmount,
        status: 'PENDING_PAYMENT',
        paymentStatus: 'PENDING',
        paymentMethod: paymentMethod === 'cod' 
          ? 'CASH_ON_DELIVERY' 
          : paymentMethod === 'card'
          ? 'BANK_TRANSFER'
          : cryptoType as any,
        cryptoCurrency: paymentMethod === 'crypto' ? cryptoType : undefined,
        notes: JSON.stringify({ 
          shippingAddress: address,
          cryptoAddressId: paymentMethod === 'crypto' ? cryptoAddressId : undefined
        }),
        items: {
          create: await Promise.all(items.map(async (item: any) => {
            const product = await db.product.findUnique({
              where: { id: item.productId },
              include: {
                images: {
                  where: { isPrimary: true },
                  take: 1,
                },
              },
            })
            return {
              productId: item.productId,
              name: product?.name || 'Unknown Product',
              quantity: item.quantity,
              price: item.price,
              image: product?.images[0]?.url || null,
            }
          })),
        },
      },
      include: {
        items: true,
        user: {
          select: {
            id: true,
          },
        },
      },
    })

    // Create notification for order placement
    try {
      await createNotification({
        userId: order.user.id,
        title: 'Order Placed',
        message: `Your order ${order.orderNumber} has been placed successfully`,
        type: 'order',
        link: `/account/orders/${order.id}`,
      })
    } catch (error) {
      console.error('Error creating notification:', error)
      // Don't fail the request if notification creation fails
    }

    return NextResponse.json({
      message: 'Order placed successfully',
      orderId: order.id,
      order,
    })
  } catch (error) {
    console.error('Order creation error:', error)
    return NextResponse.json(
      { message: 'Failed to place order' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session?.userId) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      )
    }

    const orders = await db.order.findMany({
      where: {
        userId: session.userId,
      },
      include: {
        items: {
          include: {
            product: {
              include: {
                images: {
                  where: {
                    isPrimary: true,
                  },
                  take: 1,
                },
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    return NextResponse.json({ orders })
  } catch (error) {
    console.error('Orders fetch error:', error)
    return NextResponse.json(
      { message: 'Failed to fetch orders' },
      { status: 500 }
    )
  }
}
