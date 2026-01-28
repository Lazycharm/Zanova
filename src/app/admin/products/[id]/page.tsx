import { db } from '@/lib/db'
import { notFound } from 'next/navigation'
import { ProductFormClient } from '../product-form-client'

export const dynamic = 'force-dynamic'

async function getProduct(id: string) {
  if (id === 'new') {
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

  return product
}

async function getFormData() {
  const categories = await db.category.findMany({
    where: { isActive: true },
    orderBy: { name: 'asc' },
  })

  const shops = await db.shop.findMany({
    where: { status: 'ACTIVE' },
    orderBy: { name: 'asc' },
  })

  return { categories, shops }
}

export default async function EditProductPage({
  params,
}: {
  params: { id: string }
}) {
  const [product, { categories, shops }] = await Promise.all([
    getProduct(params.id),
    getFormData(),
  ])

  if (params.id !== 'new' && !product) {
    notFound()
  }

  return (
    <ProductFormClient
      product={product ? {
        ...product,
        price: Number(product.price),
        comparePrice: product.comparePrice ? Number(product.comparePrice) : null,
        rating: Number(product.rating),
      } : null}
      categories={categories}
      shops={shops}
    />
  )
}
