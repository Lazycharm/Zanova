import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user || (session.user.role !== 'ADMIN' && session.user.role !== 'MANAGER')) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      )
    }

    const order = await db.order.update({
      where: { id: params.id },
      data: {
        paymentStatus: 'COMPLETED',
        status: 'PROCESSING',
        paidAt: new Date(),
      },
    })

    return NextResponse.json({
      message: 'Order payment approved successfully',
      order,
    })
  } catch (error) {
    console.error('Approve order error:', error)
    return NextResponse.json(
      { message: 'Failed to approve order' },
      { status: 500 }
    )
  }
}
