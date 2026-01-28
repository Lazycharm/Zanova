'use client'

import { Icon } from '@iconify/react'
import Image from 'next/image'
import Link from 'next/link'
import { HeroSlider } from '@/components/hero-slider'
import { CategoryIcon } from '@/components/category-icon'
import { ScrollingText } from '@/components/scrolling-text'
import { ProductSlider } from '@/components/product-slider'
import { useLanguage } from '@/contexts/language-context'
import { getCategoryTranslationKey } from '@/lib/category-translations'
import { LanguageSelector } from '@/components/language-selector'

interface Category {
  id: string
  name: string
  slug: string
  icon: string | null
  image: string | null
  color: string
  iconColor: string
}

interface Product {
  id: string
  name: string
  price: number
  comparePrice: number | null
  rating: number
  reviews: number
  image: string
  slug: string
}

interface HeroSlide {
  id: string
  title: string | null
  subtitle: string | null
  image: string
  mobileImage: string | null
  ctaText: string | null
  ctaLink: string | null
}

interface HomePageClientProps {
  categories: Category[]
  featuredProducts: Product[]
  newArrivals: Product[]
  heroSlides: HeroSlide[]
}

export function HomePageClient({
  categories,
  featuredProducts,
  newArrivals,
  heroSlides,
}: HomePageClientProps) {
  const { t } = useLanguage()
  
  return (
    <div className="flex flex-col w-full min-h-screen bg-background font-sans">
      {/* Mobile Header */}
      <div className="bg-primary px-4 pt-4 pb-12 rounded-b-[2rem] relative z-0 lg:hidden">
        <div className="flex justify-between items-center mb-4">
          <Link href="/" className="flex items-center">
            <Image
              src="/images/logo.png"
              alt="ZALORA"
              width={120}
              height={40}
              className="object-contain"
              priority
            />
          </Link>
          <div className="flex items-center gap-2">
            <LanguageSelector variant="mobile" />
            <Link
              href="/auth/login"
              className="bg-[#0D47A1] text-white text-xs font-semibold px-4 py-1.5 rounded-md"
            >
              Log in
            </Link>
          </div>
        </div>
        
        <div className="flex justify-between items-center mb-6 text-white">
          <div className="flex flex-col">
            <div className="text-sm font-medium opacity-90">Mega Sale Event</div>
            <div className="flex items-center gap-1">
              <span className="text-accent font-bold text-lg font-heading">Best Deals</span>
              <div className="bg-accent text-accent-foreground rounded-full size-4 flex items-center justify-center">
                <Icon icon="solar:arrow-right-linear" className="size-3" />
              </div>
            </div>
          </div>
          <div className="relative bg-accent text-accent-foreground px-3 py-1 rounded-sm shadow-sm flex items-center gap-1">
            <div className="absolute -left-1 top-1/2 -translate-y-1/2 size-2 bg-accent rotate-45" />
            <Icon icon="solar:calendar-bold" className="size-4" />
            <span className="text-xs font-bold whitespace-nowrap">WEEKEND SALE</span>
          </div>
        </div>

        {/* Search Bar */}
        <div className="absolute left-4 right-4 -bottom-6 z-10">
          <div className="bg-card rounded-xl shadow-lg p-3 flex items-center gap-3">
            <div className="flex-1 flex items-center bg-input rounded-lg px-3 py-2 gap-2 border border-border/50">
              <Icon icon="solar:magnifer-linear" className="text-muted-foreground size-5" />
              <input
                type="text"
                placeholder="Search products..."
                className="flex-1 bg-transparent border-none outline-none text-sm placeholder:text-muted-foreground/70 truncate"
              />
            </div>
            <Link href="/cart" className="p-1 relative">
              <Icon icon="solar:cart-large-2-linear" className="size-6 text-foreground" />
            </Link>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 px-4 mt-10 lg:mt-0 lg:px-6">
        {/* Hero Slider - Desktop */}
        <div className="hidden lg:block mb-8">
          <HeroSlider slides={heroSlides} />
        </div>

        {/* Hero Slider - Mobile */}
        <div className="lg:hidden rounded-xl overflow-hidden mb-6 shadow-sm">
          <HeroSlider slides={heroSlides} autoPlayInterval={4000} />
        </div>

        {/* Categories Grid */}
        <div className="container mx-auto lg:px-4">
          <div className="grid grid-cols-4 lg:grid-cols-6 xl:grid-cols-12 gap-y-6 gap-x-2 lg:gap-4 mb-8">
            {categories.map((category) => {
              const translationKey = getCategoryTranslationKey(category.slug)
              const categoryName = translationKey ? t(translationKey) : category.name
              
              return (
                <Link
                  key={category.id}
                  href={`/categories/${category.slug}`}
                  className="flex flex-col items-center gap-2 group"
                >
                  <div
                    className="size-12 lg:size-16 rounded-full flex items-center justify-center transition-transform group-hover:scale-110 overflow-hidden relative"
                    style={{ backgroundColor: category.color }}
                  >
                    <CategoryIcon
                      src={category.image}
                      alt={categoryName}
                      icon={category.icon}
                      slug={category.slug}
                      size={48}
                    />
                  </div>
                  <span className="text-[10px] lg:text-xs text-center text-muted-foreground font-medium">
                    {categoryName}
                  </span>
                </Link>
              )
            })}
          </div>

          {/* Scrolling Text Banner */}
          <ScrollingText className="mb-6" />

          {/* Hot Selling Products */}
          <div className="mb-8">
            <ProductSlider 
              products={featuredProducts}
              title={t('hotSelling')}
              viewAllLink="/products?sort=popular"
            />
          </div>

          {/* New Arrivals */}
          <div className="mb-8">
            <ProductSlider 
              products={newArrivals}
              title={t('newArrivals')}
              viewAllLink="/products?sort=newest"
            />
          </div>
        </div>
      </div>
    </div>
  )
}

function ProductCard({ product }: { product: Product }) {
  const discount = product.comparePrice
    ? Math.round(((product.comparePrice - product.price) / product.comparePrice) * 100)
    : 0

  return (
    <Link
      href={`/products/${product.slug}`}
      className="bg-card rounded-xl overflow-hidden border border-border/50 shadow-sm flex flex-col group"
    >
      <div className="aspect-[4/5] bg-muted relative overflow-hidden">
        <Image
          src={product.image}
          alt={product.name}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-300"
        />
        {discount > 0 && (
          <div className="absolute top-2 left-2 bg-destructive text-white text-[10px] font-bold px-1.5 py-0.5 rounded-sm">
            -{discount}%
          </div>
        )}
      </div>
      <div className="p-3 flex flex-col flex-1">
        <h4 className="text-sm font-medium text-foreground line-clamp-2 mb-1">
          {product.name}
        </h4>
        <div className="flex items-center gap-1 mb-2">
          <Icon icon="solar:star-bold" className="size-3 text-accent" />
          <span className="text-xs text-muted-foreground">
            {product.rating} ({product.reviews > 1000 ? `${(product.reviews / 1000).toFixed(1)}k` : product.reviews})
          </span>
        </div>
        <div className="mt-auto flex items-baseline gap-2">
          <span className="text-base font-bold text-primary">${product.price}</span>
          {product.comparePrice && (
            <span className="text-xs text-muted-foreground line-through">
              ${product.comparePrice}
            </span>
          )}
        </div>
      </div>
    </Link>
  )
}
