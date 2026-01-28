import { redirect } from 'next/navigation'
import { getCurrentUser } from '@/lib/auth'
import { db } from '@/lib/db'
import { AdminNotificationsClient } from './notifications-client'

async function getNotifications() {
  const notifications = await db.notification.findMany({
    orderBy: { createdAt: 'desc' },
    take: 100,
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
  })

  return {
    notifications: notifications.map((n) => ({
      id: n.id,
      title: n.title,
      message: n.message,
      type: n.type,
      link: n.link,
      isRead: n.isRead,
      createdAt: n.createdAt.toISOString(),
      user: {
        id: n.user.id,
        name: n.user.name,
        email: n.user.email,
      },
    })),
  }
}

export default async function AdminNotificationsPage() {
  const currentUser = await getCurrentUser()

  if (!currentUser) {
    redirect('/auth/login')
  }

  if (currentUser.role !== 'ADMIN' && currentUser.role !== 'MANAGER') {
    redirect('/')
  }

  const data = await getNotifications()

  return <AdminNotificationsClient {...data} />
}
