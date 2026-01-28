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
    <header className="sticky top-0 z-40 w-full bg-white border-b border-border hidden lg:block">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between gap-4">
          {/* Logo - Left */}
          <Link href="/" className="flex items-center flex-shrink-0">
            <Image
              src="/images/logo.png"
              alt="ZALORA Fashion"
              width={140}
              height={40}
              className="object-contain"
              priority
            />
          </Link>

          {/* Search Bar - Center */}
          <div className="flex-1 flex items-center gap-2 max-w-2xl mx-8">
            <div className="flex-1 relative">
              <input
                type="text"
                placeholder="100% selected good products"
                onClick={() => setSearchOpen(true)}
                className="w-full px-4 py-2 pr-12 bg-gray-50 border border-border rounded-lg text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                readOnly
              />
              <Icon 
                icon="solar:magnifer-linear" 
                className="absolute right-3 top-1/2 -translate-y-1/2 size-5 text-muted-foreground pointer-events-none" 
              />
            </div>
            <Button
              onClick={() => setSearchOpen(true)}
              variant="outline"
              size="sm"
              className="whitespace-nowrap px-3"
            >
              Search Products
            </Button>
            <Button
              onClick={() => setSearchOpen(true)}
              variant="outline"
              size="sm"
              className="whitespace-nowrap px-3"
            >
              Search Store
            </Button>
          </div>

          {/* Actions - Right */}
          <div className="flex items-center gap-1 flex-shrink-0">
            {/* Home */}
            <Link href="/">
              <Button variant="ghost" size="icon" title="Home">
                <Icon icon="solar:home-2-linear" className="size-6" />
              </Button>
            </Link>

            {/* Account */}
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" title="Account">
                    <Icon icon="solar:user-circle-linear" className="size-6" />
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
              <Link href="/auth/login">
                <Button variant="ghost" size="icon" title="Account">
                  <Icon icon="solar:user-circle-linear" className="size-6" />
                </Button>
              </Link>
            )}

            {/* Cart */}
            <Link href="/cart" className="relative">
              <Button variant="ghost" size="icon" title="Cart">
                <Icon icon="solar:cart-large-linear" className="size-6" />
                {itemCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold rounded-full size-5 flex items-center justify-center">
                    {itemCount > 9 ? '9+' : itemCount}
                  </span>
                )}
              </Button>
            </Link>

            {/* Language Selector */}
            <LanguageSelector />

          </div>
        </div>
      </div>
    </header>
  )
}
