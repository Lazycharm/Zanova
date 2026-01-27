import { redirect } from 'next/navigation'
import { getCurrentUser } from '@/lib/auth'
import { db } from '@/lib/db'
import { FavoritesClient } from './favorites-client'

async function getUserFavorites(userId: string) {
  const favorites = await db.favorite.findMany({
    where: { userId },
    include: {
      product: {
        include: {
          images: {
            where: { isPrimary: true },
            take: 1,
          },
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  })

  return favorites.map((fav) => ({
    userId: fav.userId,
    productId: fav.productId,
    product: {
      id: fav.product.id,
      name: fav.product.name,
      slug: fav.product.slug,
      price: Number(fav.product.price),
      comparePrice: fav.product.comparePrice ? Number(fav.product.comparePrice) : null,
      rating: Number(fav.product.rating),
      reviews: fav.product.totalReviews,
      image: fav.product.images[0]?.url || '/placeholder-product.jpg',
      isFeatured: fav.product.isFeatured,
    },
  }))
}

export default async function FavoritesPage() {
  const user = await getCurrentUser()

  if (!user) {
    redirect('/auth/login')
  }

  const favorites = await getUserFavorites(user.id)

  return <FavoritesClient favorites={favorites} />
}
