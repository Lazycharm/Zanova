import { redirect } from 'next/navigation'
import { getCurrentUser } from '@/lib/auth'
import { db } from '@/lib/db'
import { SellerProductsClient } from './products-client'

export const dynamic = 'force-dynamic'

interface SearchParams {
  page?: string
  search?: string
  category?: string
  status?: string
}

async function getSellerProducts(userId: string, searchParams: SearchParams) {
  const page = parseInt(searchParams.page || '1')
  const limit = 20
  const skip = (page - 1) * limit

  // Get user's shop
  const user = await db.user.findUnique({
    where: { id: userId },
    include: { shop: true },
  })

  if (!user?.shop) {
    return {
      products: [],
      total: 0,
      pages: 0,
      page: 1,
      categories: [],
    }
  }

  const where: any = {
    shopId: user.shop.id,
  }

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
      image: p.images[0]?.url || null,
    })),
    total,
    pages: Math.ceil(total / limit),
    page,
    categories: categories.map(c => ({ id: c.id, name: c.name })),
  }
}

export default async function SellerProductsPage({
  searchParams,
}: {
  searchParams: SearchParams
}) {
  const currentUser = await getCurrentUser()

  if (!currentUser) {
    redirect('/auth/login')
  }

  if (!currentUser.canSell) {
    redirect('/account')
  }

  const user = await db.user.findUnique({
    where: { id: currentUser.id },
    include: { shop: true },
  })

  if (!user?.shop) {
    redirect('/seller/create-shop')
  }

  const data = await getSellerProducts(currentUser.id, searchParams)

  return <SellerProductsClient {...data} searchParams={searchParams} />
}
