'use client'

import { useState, useRef, useEffect } from 'react'
import { Icon } from '@iconify/react'
import { ProductCard } from './product-card'

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

interface ProductSliderProps {
  products: Product[]
  title: string
  viewAllLink?: string
}

export function ProductSlider({ products, title, viewAllLink = '/products' }: ProductSliderProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const [showLeftArrow, setShowLeftArrow] = useState(false)
  const [showRightArrow, setShowRightArrow] = useState(true)

  const checkScroll = () => {
    if (scrollContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current
      setShowLeftArrow(scrollLeft > 0)
      setShowRightArrow(scrollLeft < scrollWidth - clientWidth - 10)
    }
  }

  useEffect(() => {
    checkScroll()
    const container = scrollContainerRef.current
    if (container) {
      container.addEventListener('scroll', checkScroll)
      return () => container.removeEventListener('scroll', checkScroll)
    }
  }, [])

  const scroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const scrollAmount = 300
      const newScrollLeft = direction === 'left'
        ? scrollContainerRef.current.scrollLeft - scrollAmount
        : scrollContainerRef.current.scrollLeft + scrollAmount
      
      scrollContainerRef.current.scrollTo({
        left: newScrollLeft,
        behavior: 'smooth'
      })
    }
  }

  return (
    <div className="relative">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-bold text-lg text-foreground font-heading">{title}</h3>
        <a href={viewAllLink} className="text-sm text-primary hover:underline">
          View All
        </a>
      </div>

      <div className="relative group">
        {/* Left Arrow */}
        {showLeftArrow && (
          <button
            onClick={() => scroll('left')}
            className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-background/90 hover:bg-background shadow-lg rounded-full p-2 transition-all opacity-0 group-hover:opacity-100"
          >
            <Icon icon="solar:alt-arrow-left-linear" className="size-5 text-foreground" />
          </button>
        )}

        {/* Right Arrow */}
        {showRightArrow && (
          <button
            onClick={() => scroll('right')}
            className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-background/90 hover:bg-background shadow-lg rounded-full p-2 transition-all opacity-0 group-hover:opacity-100"
          >
            <Icon icon="solar:alt-arrow-right-linear" className="size-5 text-foreground" />
          </button>
        )}

        {/* Products Container */}
        <div
          ref={scrollContainerRef}
          className="flex gap-4 overflow-x-auto scrollbar-hide scroll-smooth pb-2"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {products.map((product) => (
            <div key={product.id} className="flex-shrink-0 w-[160px] lg:w-[200px]">
              <ProductCard product={product} />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
