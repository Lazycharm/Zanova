'use client'

import Link from 'next/link'
import Image from 'next/image'
import { Icon } from '@iconify/react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { formatPrice } from '@/lib/utils'
import { useCartStore } from '@/lib/store'
import toast from 'react-hot-toast'

interface Product {
  id: string
  name: string
  slug: string
  price: number
  comparePrice?: number | null
  rating?: number
  reviews?: number
  image: string
  isFeatured?: boolean
  categoryName?: string
}

interface ProductCardProps {
  product: Product
}

export function ProductCard({ product }: ProductCardProps) {
  const addItem = useCartStore((state) => state.addItem)

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    
    addItem({
      productId: product.id,
      name: product.name,
      price: product.price,
      image: product.image,
      quantity: 1,
    })
    
    toast.success('Added to cart!')
  }

  const discount = product.comparePrice
    ? Math.round(((product.comparePrice - product.price) / product.comparePrice) * 100)
    : 0

  return (
    <Link href={`/products/${product.slug}`}>
      <Card className="overflow-hidden group hover:shadow-lg transition-all h-full">
        {/* Product Image */}
        <div className="aspect-square relative bg-muted">
          <Image
            src={product.image}
            alt={product.name}
            fill
            className="object-cover group-hover:scale-110 transition-transform duration-300"
            loading="lazy"
            sizes="(max-width: 768px) 50vw, (max-width: 1200px) 25vw, 20vw"
          />
          
          {/* Badges */}
          <div className="absolute top-2 left-2 flex flex-col gap-1">
            {product.isFeatured && (
              <Badge className="bg-primary text-primary-foreground">
                <Icon icon="solar:star-bold" className="size-3 mr-1" />
                Featured
              </Badge>
            )}
            {discount > 0 && (
              <Badge variant="destructive">-{discount}%</Badge>
            )}
          </div>

          {/* Quick Add Button - Desktop */}
          <div className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity hidden lg:block">
            <Button
              size="icon"
              className="rounded-full"
              onClick={handleAddToCart}
            >
              <Icon icon="solar:cart-plus-bold" className="size-5" />
            </Button>
          </div>
        </div>

        {/* Product Info */}
        <CardContent className="p-3">
          {/* Category */}
          {product.categoryName && (
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">
              {product.categoryName}
            </p>
          )}

          {/* Product Name */}
          <h3 className="font-medium text-sm line-clamp-2 mb-2 group-hover:text-primary transition-colors min-h-[40px]">
            {product.name}
          </h3>

          {/* Rating */}
          {product.rating !== undefined && product.reviews !== undefined && (
            <div className="flex items-center gap-1 mb-2">
              <div className="flex items-center">
                <Icon icon="solar:star-bold" className="size-3 text-amber-400" />
                <span className="text-xs font-medium ml-1">{product.rating.toFixed(1)}</span>
              </div>
              <span className="text-xs text-muted-foreground">({product.reviews})</span>
            </div>
          )}

          {/* Price */}
          <div className="flex items-center justify-between">
            <div className="flex items-baseline gap-2">
              <span className="font-bold text-primary">{formatPrice(product.price)}</span>
              {product.comparePrice && (
                <span className="text-xs text-muted-foreground line-through">
                  {formatPrice(product.comparePrice)}
                </span>
              )}
            </div>
          </div>

          {/* Mobile Add to Cart */}
          <Button
            size="sm"
            className="w-full mt-3 lg:hidden"
            onClick={handleAddToCart}
          >
            <Icon icon="solar:cart-plus-bold" className="size-4 mr-1" />
            Add to Cart
          </Button>
        </CardContent>
      </Card>
    </Link>
  )
}
