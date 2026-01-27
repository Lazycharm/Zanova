import { db } from '@/lib/db'
import { CategoriesClient } from './categories-client'

async function getCategories() {
  const categories = await db.category.findMany({
    orderBy: { sortOrder: 'asc' },
    include: {
      _count: {
        select: { products: true },
      },
      parent: {
        select: { name: true },
      },
    },
  })

  return categories
}

export default async function AdminCategoriesPage() {
  const categories = await getCategories()

  return <CategoriesClient categories={categories} />
}
