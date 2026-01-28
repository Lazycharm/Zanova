'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import Image from 'next/image'
import { Icon } from '@iconify/react'
import { Button } from '@/components/ui/button'

const countries = [
  { code: 'AT', name: 'Austria', flag: '🇦🇹' },
  { code: 'FR', name: 'France', flag: '🇫🇷' },
  { code: 'DE', name: 'Germany', flag: '🇩🇪' },
  { code: 'IT', name: 'Italy', flag: '🇮🇹' },
  { code: 'ES', name: 'Spain', flag: '🇪🇸' },
  { code: 'CH', name: 'Switzerland', flag: '🇨🇭' },
  { code: 'GB', name: 'United Kingdom', flag: '🇬🇧' },
  { code: 'JP', name: 'Japan', flag: '🇯🇵' },
  { code: 'CN', name: 'China', flag: '🇨🇳' },
  { code: 'US', name: 'USA', flag: '🇺🇸' },
  { code: 'CA', name: 'Canada', flag: '🇨🇦' },
  { code: 'MX', name: 'Mexico', flag: '🇲🇽' },
  { code: 'BR', name: 'Brazil', flag: '🇧🇷' },
  { code: 'CO', name: 'Colombia', flag: '🇨🇴' },
  { code: 'CL', name: 'Chile', flag: '🇨🇱' },
  { code: 'PE', name: 'Peru', flag: '🇵🇪' },
  { code: 'VE', name: 'Venezuela', flag: '🇻🇪' },
  { code: 'HN', name: 'Honduras', flag: '🇭🇳' },
  { code: 'MA', name: 'Morocco', flag: '🇲🇦' },
]

const features = [
  {
    icon: 'solar:box-bold',
    title: 'Efficient logistics',
    description: 'Lay an efficient logistics network to solve cross-border logistics problems. ZaloraFashion Logistics Service SLS & Localized Fulfillment',
    image: '/imgs/index/logistics.jpg',
  },
  {
    icon: 'solar:wallet-bold',
    title: 'Safe and fast payment',
    description: 'Sellers can withdraw funds through ZaloraFashion official wallet, or third-party payment service providers LianLian, Payoneer, PingPong. The transaction is safe and fast, and the platform payment cycle is once a week',
    image: '/imgs/index/gathering.jpg',
  },
  {
    icon: 'solar:monitor-bold',
    title: 'Powerful management platform',
    description: 'The backend provides functions such as batch new products, order tracking, sales reports, etc. One-stop shop to meet store management needs',
    image: '/imgs/index/platform.jpg',
  },
  {
    icon: 'solar:chat-round-call-bold',
    title: 'Local customer service',
    description: 'The customer service team is highly localized, covering areas with small languages. Currently providing free customer service to solve language problems',
    image: '/imgs/index/service.jpg',
  },
  {
    icon: 'solar:star-bold',
    title: 'Recommended products',
    description: 'Provide product selection suggestions and operation information every week. Help you gain a deeper understanding of the market, accurately select products, and easily create hot items',
    image: '/imgs/index/selection.jpg',
  },
  {
    icon: 'solar:code-bold',
    title: 'API Integration',
    description: 'Connect with domestic mainstream ERP to efficiently manage products and orders. Flexibly customize the backend system that best suits you',
    image: '/imgs/index/api.jpg',
  },
]

export function CountrySelection() {
  const router = useRouter()
  const [selectedCountry, setSelectedCountry] = useState<string | null>(null)

  const handleCountrySelect = (countryCode: string) => {
    setSelectedCountry(countryCode)
    // Store the selection
    localStorage.setItem('selected-country', countryCode)
    localStorage.setItem('country-selected', 'true')
    localStorage.setItem('has-visited', 'true')
    
    // Redirect to homepage after selection
    setTimeout(() => {
      router.push('/')
    }, 500)
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
      {/* Header */}
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center mb-8">
          <Image
            src="/images/logo.png"
            alt="ZALORA"
            width={180}
            height={60}
            className="object-contain"
            priority
          />
        </div>

        {/* Main Content */}
        <div className="max-w-6xl mx-auto">
          {/* Title */}
          <div className="text-center mb-12">
            <h1 className="text-3xl lg:text-4xl font-bold text-foreground mb-4">
              ZaloraFashion is available in the following countries
            </h1>
            <p className="text-muted-foreground text-lg">
              Select your country to continue shopping
            </p>
          </div>

          {/* Country Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-16">
            {countries.map((country) => (
              <button
                key={country.code}
                onClick={() => handleCountrySelect(country.code)}
                className={`
                  relative flex flex-col items-center gap-4 p-6 rounded-xl border-2 transition-all
                  hover:border-primary hover:shadow-xl hover:scale-[1.03] active:scale-[0.98]
                  ${selectedCountry === country.code ? 'border-primary bg-primary/5 shadow-xl ring-2 ring-primary/20' : 'border-border bg-white'}
                `}
              >
                {/* Flag with background circle */}
                <div className={`
                  w-20 h-20 rounded-full flex items-center justify-center
                  transition-all duration-300
                  ${selectedCountry === country.code ? 'bg-primary/10 scale-110' : 'bg-gray-50'}
                `}>
                  <span className="text-6xl flag-emoji">{country.flag}</span>
                </div>
                
                {/* Country name */}
                <span className="font-semibold text-base text-center leading-tight">
                  {country.name}
                </span>
                
                {/* Selected checkmark */}
                {selectedCountry === country.code && (
                  <div className="absolute top-3 right-3">
                    <Icon icon="solar:check-circle-bold" className="size-7 text-primary drop-shadow-lg" />
                  </div>
                )}
              </button>
            ))}
          </div>

          {/* Features Section */}
          <div className="mb-16">
            <div className="text-center mb-8">
              <h2 className="text-2xl lg:text-3xl font-bold text-foreground mb-2">
                Why Choose ZaloraFashion?
              </h2>
              <p className="text-muted-foreground">
                Professional cross-border solutions for your business
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {features.map((feature, index) => (
                <div
                  key={index}
                  className="bg-white rounded-xl p-6 border border-border hover:shadow-lg transition-shadow"
                >
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                      <Icon icon={feature.icon} className="size-6 text-primary" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-lg mb-2">{feature.title}</h3>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {feature.description}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Skip Button */}
          <div className="text-center pb-8">
            <Button
              variant="outline"
              size="lg"
              onClick={() => {
                localStorage.setItem('country-selected', 'true')
                localStorage.setItem('has-visited', 'true')
                router.push('/')
              }}
              className="min-w-[200px]"
            >
              Skip for now
            </Button>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="border-t border-border py-6">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          Copyright © 2023-2026 ZaloraFashion. All rights reserved.
        </div>
      </div>
    </div>
  )
}
