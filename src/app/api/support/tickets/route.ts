import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getSession } from '@/lib/auth'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { subject, message, email, priority = 'MEDIUM' } = body

    if (!subject || !message) {
      return NextResponse.json(
        { error: 'Subject and message are required' },
        { status: 400 }
      )
    }

    // Try to get authenticated user
    const session = await getSession()
    let userId = session?.userId || null
    let userEmail = email

    // If no authenticated user, require email
    if (!userId && !userEmail) {
      return NextResponse.json(
        { error: 'Email is required for guest tickets' },
        { status: 400 }
      )
    }

    // If authenticated, get user email
    if (userId) {
      const user = await db.user.findUnique({
        where: { id: userId },
        select: { email: true },
      })
      if (user) {
        userEmail = user.email
      }
    }

    // Generate ticket number
    const ticketNumber = `TKT-${Date.now()}-${Math.random().toString(36).substr(2, 5).toUpperCase()}`

    // Create support ticket
    const ticket = await db.supportTicket.create({
      data: {
        ticketNumber,
        userId,
        subject,
        priority,
        status: 'OPEN',
        messages: {
          create: {
            message,
            senderEmail: userEmail,
            isFromAdmin: false,
          },
        },
      },
      include: {
        messages: true,
      },
    })

    return NextResponse.json({
      success: true,
      ticket: {
        id: ticket.id,
        ticketNumber: ticket.ticketNumber,
        subject: ticket.subject,
        status: ticket.status,
      },
    })
  } catch (error) {
    console.error('Error creating support ticket:', error)
    return NextResponse.json(
      { error: 'Failed to create support ticket' },
      { status: 500 }
    )
  }
}

export async function GET(req: NextRequest) {
  try {
    const session = await getSession()

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { userId, role } = session

    // Admins can see all tickets, users see only their own
    const where = role === 'ADMIN' || role === 'MANAGER' 
      ? {} 
      : { userId }

    const tickets = await db.supportTicket.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: {
            name: true,
            email: true,
          },
        },
        messages: {
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
      },
    })

    return NextResponse.json({ tickets })
  } catch (error) {
    console.error('Error fetching tickets:', error)
    return NextResponse.json(
      { error: 'Failed to fetch tickets' },
      { status: 500 }
    )
  }
}
