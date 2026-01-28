import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { db } from '@/lib/db'

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
