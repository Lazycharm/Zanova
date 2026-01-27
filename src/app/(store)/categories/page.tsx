import { db } from '@/lib/db'
import { CategoriesClient } from './categories-client'

// Revalidate every 5 minutes for better performance
export const revalidate = 300

export const metadata = {
  title: 'Categories - ZANOVA',
  description: 'Browse all product categories',
}

async function getCategories() {
  const categories = await db.category.findMany({
    where: {
      isActive: true,
      parentId: null,
    },
    orderBy: { sortOrder: 'asc' },
    include: {
      _count: {
        select: { products: true },
      },
      children: {
        where: { isActive: true },
        orderBy: { sortOrder: 'asc' },
      },
    },
  })

  return categories
}

export default async function CategoriesPage() {
  const categories = await getCategories()

  // Default category colors for visual appeal
  const categoryColors = [
    { color: '#E3F2FD', iconColor: '#1976D2' }, // Lifestyle
    { color: '#FFF3E0', iconColor: '#F57C00' }, // Men Shoes
    { color: '#FFF8E1', iconColor: '#FFA000' }, // Women Shoes
    { color: '#F3E5F5', iconColor: '#7B1FA2' }, // Accessories
    { color: '#E0F2F1', iconColor: '#00796B' }, // Men Clothing
    { color: '#FCE4EC', iconColor: '#C2185B' }, // Women Bags
    { color: '#E8EAF6', iconColor: '#303F9F' }, // Men Bags
    { color: '#FBE9E7', iconColor: '#D84315' }, // Women Clothing
    { color: '#F1F8E9', iconColor: '#689F38' }, // Girls
    { color: '#EFEBE9', iconColor: '#5D4037' }, // Boys
    { color: '#E0F7FA', iconColor: '#0097A7' }, // Electronics
    { color: '#F5F5F5', iconColor: '#616161' }, // Home & Garden
  ]

  const mappedCategories = categories.map((category, index) => ({
    id: category.id,
    name: category.name,
    slug: category.slug,
    description: category.description,
    icon: category.icon || 'solar:box-bold',
    image: category.image,
    productCount: category._count.products,
    subcategories: category.children.map((sub) => ({
      id: sub.id,
      name: sub.name,
      slug: sub.slug,
    })),
    color: categoryColors[index]?.color || '#F5F5F5',
    iconColor: categoryColors[index]?.iconColor || '#616161',
  }))

  return <CategoriesClient categories={mappedCategories} />
}
