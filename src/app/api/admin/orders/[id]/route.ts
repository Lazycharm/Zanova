import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { db } from '@/lib/db'
import { createNotification } from '@/lib/notifications'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getSession()
    if (!session || (session.role !== 'ADMIN' && session.role !== 'MANAGER')) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      )
    }

    const order = await db.order.findUnique({
      where: { id: params.id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          },
        },
        address: true,
        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                slug: true,
                images: {
                  select: {
                    url: true,
                  },
                  take: 1,
                },
              },
            },
          },
        },
      },
    })

    if (!order) {
      return NextResponse.json(
        { message: 'Order not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ order })
  } catch (error) {
    console.error('Fetch order error:', error)
    return NextResponse.json(
      { message: 'Failed to fetch order' },
      { status: 500 }
    )
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getSession()
    if (!session || (session.role !== 'ADMIN' && session.role !== 'MANAGER')) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { status, paymentStatus, trackingNumber, adminNotes, shippedAt, deliveredAt } = body

    const updateData: any = {}

    if (status) {
      updateData.status = status
      // Auto-set timestamps based on status
      if (status === 'SHIPPED' && !shippedAt) {
        updateData.shippedAt = new Date()
      }
      if (status === 'DELIVERED' && !deliveredAt) {
        updateData.deliveredAt = new Date()
      }
    }

    if (paymentStatus) {
      updateData.paymentStatus = paymentStatus
      if (paymentStatus === 'COMPLETED' && !body.paidAt) {
        updateData.paidAt = new Date()
      }
    }

    if (trackingNumber !== undefined) {
      updateData.trackingNumber = trackingNumber || null
    }

    if (adminNotes !== undefined) {
      updateData.adminNotes = adminNotes || null
    }

    if (shippedAt) {
      updateData.shippedAt = new Date(shippedAt)
    }

    if (deliveredAt) {
      updateData.deliveredAt = new Date(deliveredAt)
    }

    // Get order before update to check for status changes
    const oldOrder = await db.order.findUnique({
      where: { id: params.id },
      select: {
        userId: true,
        status: true,
        paymentStatus: true,
        orderNumber: true,
      },
    })

    if (!oldOrder) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }

    const order = await db.order.update({
      where: { id: params.id },
      data: updateData,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        items: {
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

    // Create notifications for status changes
    try {
      if (status && status !== oldOrder.status) {
        let notificationTitle = ''
        let notificationMessage = ''
        let notificationType: 'order' | 'payment' | 'promo' | 'system' | 'support' = 'order'

        switch (status) {
          case 'SHIPPED':
            notificationTitle = 'Order Shipped'
            notificationMessage = `Your order ${order.orderNumber} has been shipped${order.trackingNumber ? ` with tracking number ${order.trackingNumber}` : ''}`
            break
          case 'DELIVERED':
            notificationTitle = 'Order Delivered'
            notificationMessage = `Your order ${order.orderNumber} has been delivered`
            break
          case 'CANCELLED':
            notificationTitle = 'Order Cancelled'
            notificationMessage = `Your order ${order.orderNumber} has been cancelled`
            break
          case 'REFUNDED':
            notificationTitle = 'Order Refunded'
            notificationMessage = `Your order ${order.orderNumber} has been refunded`
            break
          case 'PAID':
            notificationTitle = 'Payment Received'
            notificationMessage = `Payment for order ${order.orderNumber} has been received`
            notificationType = 'payment'
            break
        }

        if (notificationTitle) {
          await createNotification({
            userId: order.user.id,
            title: notificationTitle,
            message: notificationMessage,
            type: notificationType,
            link: `/account/orders/${order.id}`,
          })
        }
      }

      if (paymentStatus && paymentStatus !== oldOrder.paymentStatus) {
        if (paymentStatus === 'COMPLETED') {
          await createNotification({
            userId: order.user.id,
            title: 'Payment Confirmed',
            message: `Payment for order ${order.orderNumber} has been confirmed`,
            type: 'payment',
            link: `/account/orders/${order.id}`,
          })
        }
      }
    } catch (error) {
      console.error('Error creating notification:', error)
      // Don't fail the request if notification creation fails
    }

    return NextResponse.json({
      message: 'Order updated successfully',
      order,
    })
  } catch (error) {
    console.error('Update order error:', error)
    return NextResponse.json(
      { message: 'Failed to update order' },
      { status: 500 }
    )
  }
}
