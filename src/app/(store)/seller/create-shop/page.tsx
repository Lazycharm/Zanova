import { redirect } from 'next/navigation'
import { getCurrentUser } from '@/lib/auth'
import { db } from '@/lib/db'
import { CreateShopClient } from './create-shop-client'

export default async function CreateShopPage() {
  const currentUser = await getCurrentUser()

  if (!currentUser) {
    redirect('/auth/login')
  }

  if (!currentUser.canSell) {
    redirect('/account')
  }

  // Check if user already has a shop
  const user = await db.user.findUnique({
    where: { id: currentUser.id },
    include: {
      shop: true,
    },
  })

  if (user?.shop) {
    redirect('/seller/shop')
  }

  const categories = await db.category.findMany({
    where: { isActive: true },
    orderBy: { name: 'asc' },
  })

  return <CreateShopClient categories={categories.map(c => ({ id: c.id, name: c.name }))} />
}
