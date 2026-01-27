import { db } from '@/lib/db'
import { notFound } from 'next/navigation'
import { ProductDetailClient } from './product-detail-client'

// Revalidate every 5 minutes
export const revalidate = 300

async function getProduct(slug: string) {
  const product = await db.product.findUnique({
    where: { slug },
    include: {
      images: {
        orderBy: { sortOrder: 'asc' },
      },
      category: true,
      shop: {
        select: {
          id: true,
          name: true,
          slug: true,
        },
      },
    },
  })

  if (!product || product.status !== 'PUBLISHED') {
    return null
  }

  // Get related products from same category
  const relatedProducts = await db.product.findMany({
    where: {
      categoryId: product.categoryId,
      status: 'PUBLISHED',
      NOT: { id: product.id },
    },
    include: {
      images: {
        where: { isPrimary: true },
        take: 1,
      },
    },
    take: 4,
  })

  return {
    product: {
      ...product,
      price: Number(product.price),
      comparePrice: product.comparePrice ? Number(product.comparePrice) : null,
      rating: Number(product.rating),
    },
    relatedProducts: relatedProducts.map((p) => ({
      id: p.id,
      name: p.name,
      slug: p.slug,
      price: Number(p.price),
      comparePrice: p.comparePrice ? Number(p.comparePrice) : null,
      rating: Number(p.rating),
      reviews: p.totalReviews,
      image: p.images[0]?.url || '/placeholder-product.jpg',
      isFeatured: p.isFeatured,
    })),
  }
}

export default async function ProductDetailPage({
  params,
}: {
  params: { slug: string }
}) {
  const data = await getProduct(params.slug)

  if (!data) {
    notFound()
  }

  return <ProductDetailClient product={data.product} relatedProducts={data.relatedProducts} />
}
