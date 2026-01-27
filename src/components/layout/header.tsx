'use client'

import Link from 'next/link'
import Image from 'next/image'
import { Icon } from '@iconify/react'
import { useCartStore, useUserStore, useUIStore } from '@/lib/store'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { getInitials } from '@/lib/utils'
import { LanguageSelector } from '@/components/language-selector'
import { useLanguage } from '@/contexts/language-context'

export function Header() {
  const { t } = useLanguage()
  const user = useUserStore((state) => state.user)
  const itemCount = useCartStore((state) => state.getItemCount())
  const setSearchOpen = useUIStore((state) => state.setSearchOpen)

  return (
    <header className="sticky top-0 z-40 w-full bg-card border-b border-border hidden lg:block">
      <div className="container mx-auto px-6">
        <div className="flex h-16 items-center gap-8">
          {/* Logo */}
          <Link href="/" className="flex items-center flex-shrink-0">
            <Image
              src="/images/logo.png"
              alt="ZANOVA"
              width={120}
              height={40}
              className="object-contain"
              priority
            />
          </Link>

          {/* Navigation */}
          <nav className="hidden lg:flex items-center gap-8 flex-shrink-0">
            <Link
              href="/"
              className="text-sm font-medium text-foreground hover:text-primary transition-colors whitespace-nowrap"
            >
              {t('home')}
            </Link>
            <Link
              href="/categories"
              className="text-sm font-medium text-foreground hover:text-primary transition-colors whitespace-nowrap"
            >
              {t('categories')}
            </Link>
            <Link
              href="/products"
              className="text-sm font-medium text-foreground hover:text-primary transition-colors whitespace-nowrap"
            >
              {t('allProducts')}
            </Link>
            <Link
              href="/deals"
              className="text-sm font-medium text-destructive hover:text-destructive/80 transition-colors whitespace-nowrap"
            >
              {t('deals')}
            </Link>
          </nav>

          {/* Search */}
          <div className="hidden lg:flex flex-1 max-w-2xl">
            <button
              onClick={() => setSearchOpen(true)}
              className="w-full flex items-center gap-3 px-4 py-2 bg-input rounded-lg text-sm text-muted-foreground hover:bg-muted transition-colors"
            >
              <Icon icon="solar:magnifer-linear" className="size-5" />
              <span>{t('searchProducts')}</span>
            </button>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3 flex-shrink-0">
            {/* Language Selector */}
            <LanguageSelector />

            {/* Cart */}
            <Link href="/cart" className="relative">
              <Button variant="ghost" size="icon">
                <Icon icon="solar:cart-large-linear" className="size-6" />
                {itemCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-destructive text-white text-[10px] font-bold rounded-full size-5 flex items-center justify-center">
                    {itemCount > 9 ? '9+' : itemCount}
                  </span>
                )}
              </Button>
            </Link>

            {/* User Menu */}
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={user.avatar || undefined} alt={user.name} />
                      <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">{user.name}</p>
                      <p className="text-xs leading-none text-muted-foreground">
                        {user.email}
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/account">
                      <Icon icon="solar:user-circle-linear" className="mr-2 size-4" />
                      {t('account')}
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/account/orders">
                      <Icon icon="solar:box-linear" className="mr-2 size-4" />
                      Orders
                    </Link>
                  </DropdownMenuItem>
                  {user.canSell && (
                    <>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem asChild>
                        <Link href="/seller/dashboard">
                          <Icon icon="solar:shop-linear" className="mr-2 size-4" />
                          Seller Dashboard
                        </Link>
                      </DropdownMenuItem>
                    </>
                  )}
                  {(user.role === 'ADMIN' || user.role === 'MANAGER') && (
                    <>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem asChild>
                        <Link href="/admin">
                          <Icon icon="solar:settings-linear" className="mr-2 size-4" />
                          Admin Panel
                        </Link>
                      </DropdownMenuItem>
                    </>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/auth/logout">
                      <Icon icon="solar:logout-2-linear" className="mr-2 size-4" />
                      {t('logout')}
                    </Link>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="flex items-center gap-2">
                <Button variant="ghost" asChild>
                  <Link href="/auth/login">{t('login')}</Link>
                </Button>
                <Button asChild>
                  <Link href="/auth/register">Sign up</Link>
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}
