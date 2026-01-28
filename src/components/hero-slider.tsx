'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Icon } from '@iconify/react'
import { motion, AnimatePresence } from 'framer-motion'

interface HeroSlide {
  id: string
  title: string | null
  subtitle: string | null
  image: string
  mobileImage: string | null
  ctaText: string | null
  ctaLink: string | null
}

interface HeroSliderProps {
  slides: HeroSlide[]
  autoPlayInterval?: number
}

export function HeroSlider({ slides, autoPlayInterval = 5000 }: HeroSliderProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isAutoPlaying, setIsAutoPlaying] = useState(true)

  useEffect(() => {
    if (!isAutoPlaying || slides.length <= 1) return

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % slides.length)
    }, autoPlayInterval)

    return () => clearInterval(interval)
  }, [isAutoPlaying, slides.length, autoPlayInterval])

  const goToSlide = (index: number) => {
    setCurrentIndex(index)
    setIsAutoPlaying(false)
    setTimeout(() => setIsAutoPlaying(true), 10000) // Resume after 10s
  }

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % slides.length)
    setIsAutoPlaying(false)
    setTimeout(() => setIsAutoPlaying(true), 10000)
  }

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + slides.length) % slides.length)
    setIsAutoPlaying(false)
    setTimeout(() => setIsAutoPlaying(true), 10000)
  }

  if (slides.length === 0) {
    return (
      <div className="w-full h-[400px] lg:h-[500px] bg-muted flex items-center justify-center">
        <p className="text-muted-foreground">No slides available</p>
      </div>
    )
  }

  const currentSlide = slides[currentIndex]

  return (
    <div className="relative w-full h-[400px] lg:h-[500px] group">
      {/* Slides */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentIndex}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
          className="absolute inset-0"
        >
          <Image
            src={currentSlide.mobileImage || currentSlide.image}
            alt={currentSlide.title || 'Slide'}
            fill
            className="object-cover lg:hidden"
            priority={currentIndex === 0}
          />
          <Image
            src={currentSlide.image}
            alt={currentSlide.title || 'Slide'}
            fill
            className="object-cover hidden lg:block"
            priority={currentIndex === 0}
          />

          {/* Logo Watermark */}
          <div className="absolute bottom-4 right-4 lg:bottom-8 lg:right-8 opacity-60 z-10">
            <div className="text-white text-right">
              <div className="text-xs lg:text-sm mb-1">From</div>
              <div className="text-lg lg:text-2xl font-bold font-heading">ZALORA</div>
            </div>
          </div>

          {/* Overlay Content */}
          {(currentSlide.title || currentSlide.subtitle || currentSlide.ctaText) && (
            <div className="absolute inset-0 bg-black/30 flex flex-col items-center justify-center text-center p-6 text-white">
              {currentSlide.subtitle && (
                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="text-sm lg:text-lg mb-2 tracking-widest uppercase"
                >
                  {currentSlide.subtitle}
                </motion.p>
              )}
              {currentSlide.title && (
                <motion.h2
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="text-3xl lg:text-5xl font-bold mb-6"
                >
                  {currentSlide.title}
                </motion.h2>
              )}
              {currentSlide.ctaText && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                >
                  <Link
                    href={currentSlide.ctaLink || '/deals'}
                    className="bg-white text-black px-8 py-3 text-sm font-bold tracking-widest uppercase hover:bg-gray-100 transition-colors inline-block"
                  >
                    {currentSlide.ctaText}
                  </Link>
                </motion.div>
              )}
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Navigation Arrows */}
      {slides.length > 1 && (
        <>
          <button
            onClick={prevSlide}
            className="absolute left-4 top-1/2 -translate-y-1/2 size-10 lg:size-12 rounded-full bg-white/90 hover:bg-white shadow-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-10"
            aria-label="Previous slide"
          >
            <Icon icon="solar:arrow-left-bold" className="size-5 lg:size-6 text-gray-800" />
          </button>
          <button
            onClick={nextSlide}
            className="absolute right-4 top-1/2 -translate-y-1/2 size-10 lg:size-12 rounded-full bg-white/90 hover:bg-white shadow-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-10"
            aria-label="Next slide"
          >
            <Icon icon="solar:arrow-right-bold" className="size-5 lg:size-6 text-gray-800" />
          </button>
        </>
      )}

      {/* Dots Indicator */}
      {slides.length > 1 && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-10">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`h-2 rounded-full transition-all ${
                index === currentIndex
                  ? 'w-8 bg-white'
                  : 'w-2 bg-white/50 hover:bg-white/75'
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      )}

      {/* Auto-play indicator */}
      {isAutoPlaying && slides.length > 1 && (
        <div className="absolute top-4 right-4 bg-black/50 text-white px-3 py-1 rounded-full text-xs flex items-center gap-2 z-10">
          <Icon icon="solar:play-circle-bold" className="size-4" />
          Auto
        </div>
      )}
    </div>
  )
}
