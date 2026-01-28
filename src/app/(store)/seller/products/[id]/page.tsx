import { redirect } from 'next/navigation'
import { getCurrentUser } from '@/lib/auth'
import { db } from '@/lib/db'
import { SellerProductFormClient } from '../product-form-client'

export const dynamic = 'force-dynamic'

async function getProduct(id: string, userId: string) {
  if (id === 'new') {
    return null
  }

  // Get user's shop
  const user = await db.user.findUnique({
    where: { id: userId },
    include: { shop: true },
  })

  if (!user?.shop) {
    return null
  }

  const product = await db.product.findUnique({
    where: { id },
    include: {
      images: {
        orderBy: { sortOrder: 'asc' },
      },
    },
  })

  // Verify product belongs to user's shop
  if (!product || product.shopId !== user.shop.id) {
    return null
  }

  return product
}

async function getFormData() {
  const categories = await db.category.findMany({
    where: { isActive: true },
    orderBy: { name: 'asc' },
  })

  return {
    categories: categories.map(c => ({ id: c.id, name: c.name })),
  }
}

export default async function SellerProductPage({
  params,
}: {
  params: { id: string }
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

  const [product, formData] = await Promise.all([
    getProduct(params.id, currentUser.id),
    getFormData(),
  ])

  // If editing and product not found, redirect
  if (params.id !== 'new' && !product) {
    redirect('/seller/products')
  }

  // Convert Decimal fields to numbers for client component
  const productData = product ? {
    ...product,
    price: Number(product.price),
    comparePrice: product.comparePrice ? Number(product.comparePrice) : null,
    costPrice: product.costPrice ? Number(product.costPrice) : null,
  } : null

  return (
    <SellerProductFormClient
      product={productData}
      categories={formData.categories}
    />
  )
}
