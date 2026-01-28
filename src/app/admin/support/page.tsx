import { db } from '@/lib/db'
import { SupportTicketsClient } from './support-client'

export const dynamic = 'force-dynamic'

async function getSupportTickets() {
  const tickets = await db.supportTicket.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      user: {
        select: {
          name: true,
          email: true,
          avatar: true,
        },
      },
      messages: {
        orderBy: { createdAt: 'desc' },
        take: 1,
      },
    },
  })

  return tickets.map((ticket) => ({
    id: ticket.id,
    ticketNumber: ticket.ticketNumber,
    subject: ticket.subject,
    status: ticket.status,
    priority: ticket.priority,
    createdAt: ticket.createdAt.toISOString(),
    updatedAt: ticket.updatedAt.toISOString(),
    user: ticket.user ? {
      name: ticket.user.name,
      email: ticket.user.email,
      avatar: ticket.user.avatar,
    } : null,
    lastMessage: ticket.messages[0] ? {
      message: ticket.messages[0].message,
      senderEmail: ticket.messages[0].senderEmail,
      createdAt: ticket.messages[0].createdAt.toISOString(),
    } : null,
  }))
}

export default async function SupportPage() {
  const tickets = await getSupportTickets()
  return <SupportTicketsClient tickets={tickets} />
}
