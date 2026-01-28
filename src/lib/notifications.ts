import { db } from './db'

export interface CreateNotificationParams {
  userId: string
  title: string
  message: string
  type: 'order' | 'payment' | 'promo' | 'system' | 'support'
  link?: string | null
}

/**
 * Create a notification for a user
 */
export async function createNotification(params: CreateNotificationParams) {
  try {
    const notification = await db.notification.create({
      data: {
        userId: params.userId,
        title: params.title,
        message: params.message,
        type: params.type,
        link: params.link || null,
      },
    })
    return notification
  } catch (error) {
    console.error('Error creating notification:', error)
    throw error
  }
}

/**
 * Create notifications for multiple users
 */
export async function createNotificationsForUsers(
  userIds: string[],
  params: Omit<CreateNotificationParams, 'userId'>
) {
  try {
    const notifications = await Promise.all(
      userIds.map((userId) =>
        db.notification.create({
          data: {
            userId,
            title: params.title,
            message: params.message,
            type: params.type,
            link: params.link || null,
          },
        })
      )
    )
    return notifications
  } catch (error) {
    console.error('Error creating notifications:', error)
    throw error
  }
}

/**
 * Create notification for all users (broadcast)
 */
export async function createBroadcastNotification(
  params: Omit<CreateNotificationParams, 'userId'>
) {
  try {
    const users = await db.user.findMany({
      select: { id: true },
    })

    const notifications = await Promise.all(
      users.map((user) =>
        db.notification.create({
          data: {
            userId: user.id,
            title: params.title,
            message: params.message,
            type: params.type,
            link: params.link || null,
          },
        })
      )
    )
    return notifications
  } catch (error) {
    console.error('Error creating broadcast notification:', error)
    throw error
  }
}
