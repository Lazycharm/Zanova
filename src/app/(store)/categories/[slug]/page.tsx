import { Suspense } from 'react'
import { db } from '@/lib/db'
import { notFound } from 'next/navigation'
import { CategoryProductsClient } from './category-products-client'

// Revalidate every 5 minutes
export const revalidate = 300

interface SearchParams {
  page?: string
  sort?: string
}

async function getCategoryData(slug: string, searchParams: SearchParams) {
  const category = await db.category.findUnique({
    where: { slug },
    include: {
      children: {
        where: { isActive: true },
        orderBy: { sortOrder: 'asc' },
      },
    },
  })

  if (!category) {
    return null
  }

  const page = parseInt(searchParams.page || '1')
  const limit = 20
  const skip = (page - 1) * limit

  let orderBy: Record<string, unknown> = { createdAt: 'desc' }
  if (searchParams.sort === 'price-asc') {
    orderBy = { price: 'asc' }
  } else if (searchParams.sort === 'price-desc') {
    orderBy = { price: 'desc' }
  } else if (searchParams.sort === 'popular') {
    orderBy = { totalReviews: 'desc' }
  } else if (searchParams.sort === 'rating') {
    orderBy = { rating: 'desc' }
  }

  const [products, total] = await Promise.all([
    db.product.findMany({
      where: {
        categoryId: category.id,
        status: 'PUBLISHED',
      },
      skip,
      take: limit,
      orderBy,
      include: {
        images: {
          where: { isPrimary: true },
          take: 1,
        },
      },
    }),
    db.product.count({
      where: {
        categoryId: category.id,
        status: 'PUBLISHED',
      },
    }),
  ])

  return {
    category,
    products: products.map((p) => ({
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
    total,
    pages: Math.ceil(total / limit),
    page,
  }
}

export default async function CategoryPage({
  params,
  searchParams,
}: {
  params: { slug: string }
  searchParams: SearchParams
}) {
  const data = await getCategoryData(params.slug, searchParams)

  if (!data) {
    notFound()
  }

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <CategoryProductsClient
        category={data.category}
        products={data.products}
        total={data.total}
        pages={data.pages}
        page={data.page}
        searchParams={searchParams}
      />
    </Suspense>
  )
}
