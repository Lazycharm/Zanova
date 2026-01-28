import { Suspense } from 'react'
import { db } from '@/lib/db'
import { DealsClient } from './deals-client'

export const metadata = {
  title: 'Deals & Sales - ZALORA',
  description: 'Best deals and discounts on fashion products',
}

async function getDeals() {
  // Get products with discounts (comparePrice > price)
  const products = await db.product.findMany({
    where: {
      status: 'PUBLISHED',
      comparePrice: { not: null },
    },
    include: {
      images: {
        where: { isPrimary: true },
        take: 1,
      },
      category: {
        select: { name: true },
      },
    },
    orderBy: { createdAt: 'desc' },
    take: 50,
  })

  return products.map((p) => ({
    id: p.id,
    name: p.name,
    slug: p.slug,
    price: Number(p.price),
    comparePrice: p.comparePrice ? Number(p.comparePrice) : null,
    rating: Number(p.rating),
    reviews: p.totalReviews,
    image: p.images[0]?.url || '/placeholder-product.jpg',
    categoryName: p.category.name,
    isFeatured: p.isFeatured,
  }))
}

export default async function DealsPage() {
  const products = await getDeals()

  return (
    <Suspense fallback={<div>Loading deals...</div>}>
      <DealsClient products={products} />
    </Suspense>
  )
}
