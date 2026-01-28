'use client'

import Link from 'next/link'
import Image from 'next/image'
import { Icon } from '@iconify/react'
import { useState } from 'react'
import { useLanguage } from '@/contexts/language-context'

interface Category {
  id: string
  name: string
  slug: string
  icon?: string | null
  image?: string | null
}

interface StoreSidebarProps {
  categories: Category[]
}

function CategoryIconImage({ 
  src, 
  slug, 
  icon, 
  alt 
}: { 
  src: string | null | undefined
  slug: string
  icon: string | null | undefined
  alt: string
}) {
  const [hasError, setHasError] = useState(false)
  const [staticImageError, setStaticImageError] = useState(false)

  // Priority: uploaded image -> static image in public/images/categories -> icon font
  const imageSrc = src || `/images/categories/${slug}.png`

  // If both uploaded and static images fail, show icon
  if ((hasError && staticImageError) || (!src && staticImageError)) {
    return (
      <Icon
        icon={icon || 'solar:box-bold'}
        className="size-5 text-muted-foreground"
      />
    )
  }

  return (
    <div className="relative size-5 flex-shrink-0">
      <Image
        src={imageSrc}
        alt={alt}
        fill
        className="object-contain"
        onError={() => {
          if (src && !hasError) {
            // First error: uploaded image failed, try static image
            setHasError(true)
          } else {
            // Second error: static image also failed, show icon
            setStaticImageError(true)
          }
        }}
        unoptimized
      />
    </div>
  )
}

export function StoreSidebar({ categories }: StoreSidebarProps) {
  const { t } = useLanguage()

  return (
    <aside className="hidden lg:flex lg:flex-col lg:w-64 lg:fixed lg:left-0 lg:top-16 lg:bottom-0 bg-white border-r border-border overflow-y-auto z-30">
      {/* Categories Section */}
      <div className="p-4">
        <nav className="space-y-1">
          {categories.map((category) => {
            return (
              <Link
                key={category.id}
                href={`/categories/${category.slug}`}
                className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-foreground hover:bg-muted transition-colors group"
              >
                <CategoryIconImage
                  src={category.image}
                  slug={category.slug}
                  icon={category.icon}
                  alt={category.name}
                />
                <span>{category.name}</span>
              </Link>
            )
          })}
        </nav>
      </div>

      {/* Divider */}
      <div className="border-t border-border my-2" />

      {/* About ZaloraFashion Section */}
      <div className="px-4 py-2">
        <h3 className="text-xs font-semibold text-muted-foreground uppercase mb-2 px-3">
          About ZaloraFashion
        </h3>
        <nav className="space-y-1">
          <Link
            href="/about"
            className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
          >
            <Icon icon="solar:info-circle-linear" className="size-4" />
            <span>About Us</span>
          </Link>
          <Link
            href="/auth/register"
            className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
          >
            <Icon icon="solar:user-plus-linear" className="size-4" />
            <span>Join us</span>
          </Link>
          <Link
            href="/contact"
            className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
          >
            <Icon icon="solar:letter-linear" className="size-4" />
            <span>Contact Us</span>
          </Link>
        </nav>
      </div>

      {/* Exchange and Cooperation Section */}
      <div className="px-4 py-2">
        <h3 className="text-xs font-semibold text-muted-foreground uppercase mb-2 px-3">
          Exchange and Cooperation
        </h3>
        <nav className="space-y-1">
          <Link
            href="/merchant-agreement"
            className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
          >
            <Icon icon="solar:document-text-linear" className="size-4" />
            <span>Merchant Agreement</span>
          </Link>
        </nav>
      </div>
    </aside>
  )
}
