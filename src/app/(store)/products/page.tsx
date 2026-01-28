import { Suspense } from 'react'
import type { Prisma } from '@prisma/client'
import { db } from '@/lib/db'
import { ProductsClient } from './products-client'

export const metadata = {
  title: 'All Products - ZALORA',
  description: 'Browse our complete product catalog',
}

interface SearchParams {
  page?: string
  search?: string
  category?: string
  sort?: string
  minPrice?: string
  maxPrice?: string
}

async function getProducts(searchParams: SearchParams) {
  const page = parseInt(searchParams.page || '1')
  const limit = 20
  const skip = (page - 1) * limit

  const where: Prisma.ProductWhereInput = {
    status: 'PUBLISHED',
  }

  // Search filter
  if (searchParams.search) {
    where.OR = [
      { name: { contains: searchParams.search, mode: 'insensitive' } },
      { description: { contains: searchParams.search, mode: 'insensitive' } },
    ]
  }

  // Category filter
  if (searchParams.category) {
    where.categoryId = searchParams.category
  }

  // Price filter
  if (searchParams.minPrice || searchParams.maxPrice) {
    where.price = {}
    if (searchParams.minPrice) {
      where.price.gte = parseFloat(searchParams.minPrice)
    }
    if (searchParams.maxPrice) {
      where.price.lte = parseFloat(searchParams.maxPrice)
    }
  }

  // Sort options
  let orderBy: Prisma.ProductOrderByWithRelationInput = { createdAt: 'desc' }
  if (searchParams.sort === 'price-asc') {
    orderBy = { price: 'asc' }
  } else if (searchParams.sort === 'price-desc') {
    orderBy = { price: 'desc' }
  } else if (searchParams.sort === 'popular') {
    orderBy = { totalReviews: 'desc' }
  } else if (searchParams.sort === 'rating') {
    orderBy = { rating: 'desc' }
  }

  const [products, total, categories] = await Promise.all([
    db.product.findMany({
      where,
      skip,
      take: limit,
      orderBy,
      include: {
        images: {
          where: { isPrimary: true },
          take: 1,
        },
        category: {
          select: { name: true },
        },
      },
    }),
    db.product.count({ where }),
    db.category.findMany({
      where: { isActive: true, parentId: null },
      orderBy: { name: 'asc' },
    }),
  ])

  return {
    products: products.map((p) => ({
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
    })),
    total,
    pages: Math.ceil(total / limit),
    page,
    categories,
  }
}

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: SearchParams
}) {
  const { products, total, pages, page, categories } = await getProducts(searchParams)

  return (
    <Suspense fallback={<div>Loading products...</div>}>
      <ProductsClient
        products={products}
        total={total}
        pages={pages}
        page={page}
        categories={categories}
        searchParams={searchParams}
      />
    </Suspense>
  )
}
