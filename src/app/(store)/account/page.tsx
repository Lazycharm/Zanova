import { redirect } from 'next/navigation'
import { getCurrentUser } from '@/lib/auth'
import { db } from '@/lib/db'
import { AccountClient } from './account-client'

async function getAccountData(userId: string) {
  const [orders, favorites, user] = await Promise.all([
    db.order.count({ where: { userId } }),
    db.favorite.count({ where: { userId } }),
    db.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        avatar: true,
        balance: true,
        role: true,
        canSell: true,
        shop: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    }),
  ])

  return {
    orders,
    favorites,
    user: user ? {
      id: user.id,
      name: user.name,
      email: user.email,
      avatar: user.avatar,
      balance: Number(user.balance),
      role: user.role,
      canSell: user.canSell,
      shop: user.shop,
    } : null,
  }
}

export default async function AccountPage() {
  const currentUser = await getCurrentUser()

  if (!currentUser) {
    redirect('/auth/login')
  }

  const data = await getAccountData(currentUser.id)

  if (!data.user) {
    redirect('/auth/login')
  }

  return <AccountClient user={data.user} stats={{ orders: data.orders, favorites: data.favorites }} />
}
