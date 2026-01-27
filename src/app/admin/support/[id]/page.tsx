import { notFound } from 'next/navigation'
import { db } from '@/lib/db'
import { TicketDetailClient } from './ticket-detail-client'

async function getTicket(id: string) {
  const ticket = await db.supportTicket.findUnique({
    where: { id },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          avatar: true,
        },
      },
      messages: {
        orderBy: { createdAt: 'asc' },
      },
    },
  })

  if (!ticket) {
    return null
  }

  return {
    id: ticket.id,
    ticketNumber: ticket.ticketNumber,
    subject: ticket.subject,
    status: ticket.status,
    priority: ticket.priority,
    createdAt: ticket.createdAt.toISOString(),
    updatedAt: ticket.updatedAt.toISOString(),
    user: ticket.user ? {
      id: ticket.user.id,
      name: ticket.user.name,
      email: ticket.user.email,
      avatar: ticket.user.avatar,
    } : null,
    messages: ticket.messages.map(m => ({
      id: m.id,
      message: m.message,
      senderEmail: m.senderEmail,
      isFromAdmin: m.isFromAdmin,
      isAI: m.isAI,
      createdAt: m.createdAt.toISOString(),
    })),
  }
}

export default async function TicketDetailPage({
  params,
}: {
  params: { id: string }
}) {
  const ticket = await getTicket(params.id)

  if (!ticket) {
    notFound()
  }

  return <TicketDetailClient ticket={ticket} />
}
