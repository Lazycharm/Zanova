import { db } from '@/lib/db'
import { HomePageClient } from './home-client'

// Revalidate every 5 minutes for better performance
export const revalidate = 300

async function getHomeData() {
  const [featuredProducts, newArrivals, categories, heroSlides] = await Promise.all([
    db.product.findMany({
      where: { isFeatured: true, status: 'PUBLISHED' },
      take: 4,
      include: { images: { where: { isPrimary: true }, take: 1 } },
      orderBy: { createdAt: 'desc' },
    }),
    db.product.findMany({
      where: { status: 'PUBLISHED' },
      take: 4,
      include: { images: { where: { isPrimary: true }, take: 1 } },
      orderBy: { createdAt: 'desc' },
    }),
    db.category.findMany({
      where: { isActive: true, showOnHome: true, parentId: null },
      take: 12,
      orderBy: { sortOrder: 'asc' },
    }),
    db.heroSlide.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: 'asc' },
      take: 5,
    }),
  ])

  return { featuredProducts, newArrivals, categories, heroSlides }
}

export default async function HomePage() {
  const { featuredProducts, newArrivals, categories, heroSlides } = await getHomeData()

  // Default data for development
  const defaultCategories = [
    { id: '1', name: 'Lifestyle', slug: 'lifestyle', icon: 'solar:gift-bold', image: null, color: '#E3F2FD', iconColor: '#1976D2' },
    { id: '2', name: 'Men Shoes', slug: 'men-shoes', icon: 'mdi:shoe-formal', image: null, color: '#FFF3E0', iconColor: '#F57C00' },
    { id: '3', name: 'Women Shoes', slug: 'women-shoes', icon: 'mdi:shoe-heel', image: null, color: '#FFF8E1', iconColor: '#FFA000' },
    { id: '4', name: 'Accessories', slug: 'accessories', icon: 'solar:glasses-bold', image: null, color: '#F3E5F5', iconColor: '#7B1FA2' },
    { id: '5', name: 'Men Clothing', slug: 'men-clothing', icon: 'solar:t-shirt-bold', image: null, color: '#E0F2F1', iconColor: '#00796B' },
    { id: '6', name: 'Women Bags', slug: 'women-bags', icon: 'solar:bag-3-bold', image: null, color: '#FCE4EC', iconColor: '#C2185B' },
    { id: '7', name: 'Men Bags', slug: 'men-bags', icon: 'solar:case-minimalistic-bold', image: null, color: '#E8EAF6', iconColor: '#303F9F' },
    { id: '8', name: 'Women Clothing', slug: 'women-clothing', icon: 'mdi:dress', image: null, color: '#FBE9E7', iconColor: '#D84315' },
    { id: '9', name: 'Girls', slug: 'girls', icon: 'solar:user-bold', image: null, color: '#F1F8E9', iconColor: '#689F38' },
    { id: '10', name: 'Boys', slug: 'boys', icon: 'solar:user-bold', image: null, color: '#EFEBE9', iconColor: '#5D4037' },
    { id: '11', name: 'Global', slug: 'global', icon: 'solar:globe-bold', image: null, color: '#E0F7FA', iconColor: '#0097A7' },
    { id: '12', name: 'More', slug: 'more', icon: 'solar:menu-dots-bold', image: null, color: '#F5F5F5', iconColor: '#808089' },
  ]

  const defaultProducts = [
    {
      id: '1',
      name: 'Nike Air Zoom Pegasus 39 Running Shoe',
      price: 120,
      comparePrice: 160,
      rating: 4.8,
      reviews: 1200,
      image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&q=80',
      slug: 'nike-air-zoom-pegasus-39',
    },
    {
      id: '2',
      name: 'Essential Cotton Crew Neck T-Shirt Black',
      price: 25,
      comparePrice: 30,
      rating: 4.5,
      reviews: 850,
      image: 'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=400&q=80',
      slug: 'essential-cotton-tshirt-black',
    },
    {
      id: '3',
      name: 'Urban Explorer Waterproof Backpack',
      price: 89,
      comparePrice: null,
      rating: 4.9,
      reviews: 230,
      image: 'https://images.unsplash.com/photo-1591561954557-26941169b49e?w=400&q=80',
      slug: 'urban-explorer-backpack',
    },
    {
      id: '4',
      name: 'Classic Aviator Sunglasses Gold Frame',
      price: 145,
      comparePrice: 160,
      rating: 4.7,
      reviews: 500,
      image: 'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=400&q=80',
      slug: 'classic-aviator-sunglasses-gold',
    },
  ]

  const displayCategories = categories.length > 0 
    ? categories.map((c, i) => ({
        id: c.id,
        name: c.name,
        slug: c.slug,
        icon: c.icon || defaultCategories[i]?.icon || 'solar:box-bold',
        image: c.image, // Add uploaded image
        color: defaultCategories[i]?.color || '#F5F5F5',
        iconColor: defaultCategories[i]?.iconColor || '#808089',
      }))
    : defaultCategories

  const displayFeatured = featuredProducts.length > 0
    ? featuredProducts.map(p => ({
        id: p.id,
        name: p.name,
        price: Number(p.price),
        comparePrice: p.comparePrice ? Number(p.comparePrice) : null,
        rating: Number(p.rating),
        reviews: p.totalReviews,
        image: p.images[0]?.url || defaultProducts[0].image,
        slug: p.slug,
      }))
    : defaultProducts

  const displayNewArrivals = newArrivals.length > 0
    ? newArrivals.map(p => ({
        id: p.id,
        name: p.name,
        price: Number(p.price),
        comparePrice: p.comparePrice ? Number(p.comparePrice) : null,
        rating: Number(p.rating),
        reviews: p.totalReviews,
        image: p.images[0]?.url || defaultProducts[0].image,
        slug: p.slug,
      }))
    : defaultProducts

  // Default hero slides if none exist
  const defaultHeroSlides = [
    {
      id: '1',
      title: 'Welcome to ZALORA',
      subtitle: 'Fall Sale',
      image: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=1200&q=80',
      mobileImage: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=800&q=80',
      ctaText: 'Shop Now',
      ctaLink: '/products',
    },
    {
      id: '2',
      title: 'New Arrivals',
      subtitle: 'Latest Collection',
      image: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=1200&q=80',
      mobileImage: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=800&q=80',
      ctaText: 'Discover',
      ctaLink: '/products?sort=newest',
    },
    {
      id: '3',
      title: 'Pay with Crypto',
      subtitle: 'BTC, ETH, USDT',
      image: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=1200&q=80',
      mobileImage: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=800&q=80',
      ctaText: 'Learn More',
      ctaLink: '/about',
    },
  ]

  const displayHeroSlides = heroSlides.length > 0 ? heroSlides : defaultHeroSlides

  return (
    <HomePageClient
      categories={displayCategories}
      featuredProducts={displayFeatured}
      newArrivals={displayNewArrivals}
      heroSlides={displayHeroSlides}
    />
  )
}
