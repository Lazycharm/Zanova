import { db } from '@/lib/db'
import { ProductsClient } from './products-client'

interface SearchParams {
  page?: string
  search?: string
  category?: string
  status?: string
}

async function getProducts(searchParams: SearchParams) {
  const page = parseInt(searchParams.page || '1')
  const limit = 20
  const skip = (page - 1) * limit

  const where: Record<string, unknown> = {}

  if (searchParams.search) {
    where.OR = [
      { name: { contains: searchParams.search, mode: 'insensitive' } },
      { sku: { contains: searchParams.search, mode: 'insensitive' } },
    ]
  }

  if (searchParams.category) {
    where.categoryId = searchParams.category
  }

  if (searchParams.status) {
    where.status = searchParams.status
  }

  const [products, total, categories] = await Promise.all([
    db.product.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        category: { select: { name: true } },
        shop: { select: { name: true } },
        images: { where: { isPrimary: true }, take: 1 },
      },
    }),
    db.product.count({ where }),
    db.category.findMany({
      where: { isActive: true },
      orderBy: { name: 'asc' },
    }),
  ])

  return {
    products: products.map((p) => ({
      id: p.id,
      name: p.name,
      sku: p.sku,
      price: Number(p.price),
      comparePrice: p.comparePrice ? Number(p.comparePrice) : null,
      stock: p.stock,
      status: p.status,
      isFeatured: p.isFeatured,
      categoryName: p.category.name,
      shopName: p.shop?.name || null,
      image: p.images[0]?.url || null,
    })),
    total,
    pages: Math.ceil(total / limit),
    page,
    categories: categories.map(c => ({ id: c.id, name: c.name })),
  }
}

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: SearchParams
}) {
  const data = await getProducts(searchParams)
  return <ProductsClient {...data} searchParams={searchParams} />
}
