import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getSession } from '@/lib/auth'

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getSession()

    if (!session || (session.role !== 'ADMIN' && session.role !== 'MANAGER')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const { message } = body

    if (!message) {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      )
    }

    // Get admin user email
    const user = await db.user.findUnique({
      where: { id: session.userId },
      select: { email: true },
    })

    // Create the reply message
    const reply = await db.ticketMessage.create({
      data: {
        ticketId: params.id,
        senderId: session.userId,
        senderEmail: user?.email || 'admin@zalora.com',
        message,
        isFromAdmin: true,
      },
    })

    // Update ticket status to IN_PROGRESS if it's OPEN
    await db.supportTicket.updateMany({
      where: {
        id: params.id,
        status: 'OPEN',
      },
      data: {
        status: 'IN_PROGRESS',
      },
    })

    return NextResponse.json({ success: true, message: reply })
  } catch (error) {
    console.error('Error sending reply:', error)
    return NextResponse.json(
      { error: 'Failed to send reply' },
      { status: 500 }
    )
  }
}
