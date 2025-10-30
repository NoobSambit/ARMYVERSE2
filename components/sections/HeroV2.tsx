'use client'

import React, { useEffect, useRef } from 'react'
import Image from 'next/image'
import { TrendingUp, Sparkles, Gamepad2, BarChart3, BookOpen, Music } from 'lucide-react'
import FeatureShowcase from './FeatureShowcase'

export default function HeroV2() {
  const heroRef = useRef<HTMLDivElement>(null)
  const spotlightRef = useRef<HTMLDivElement>(null)
  const rafId = useRef<number>()

  // Cursor spotlight effect using RAF + CSS custom properties (no React state updates)
  useEffect(() => {
    const hero = heroRef.current
    const spotlight = spotlightRef.current
    if (!hero || !spotlight) return

    // Only add listener if user hasn't requested reduced motion and not on mobile
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    const isMobile = window.matchMedia('(max-width: 768px)')
    if (mediaQuery.matches || isMobile.matches) return

    let mouseX = 0
    let mouseY = 0

    const handleMouseMove = (e: MouseEvent) => {
      const rect = hero.getBoundingClientRect()
      mouseX = e.clientX - rect.left
      mouseY = e.clientY - rect.top
      
      // Use RAF to batch updates and sync with browser paint
      if (!rafId.current) {
        rafId.current = requestAnimationFrame(() => {
          spotlight.style.setProperty('--spotlight-x', `${mouseX}px`)
          spotlight.style.setProperty('--spotlight-y', `${mouseY}px`)
          rafId.current = undefined
        })
      }
    }

    // Attach to hero element only, not window
    hero.addEventListener('mousemove', handleMouseMove, { passive: true })
    return () => {
      hero.removeEventListener('mousemove', handleMouseMove)
      if (rafId.current) cancelAnimationFrame(rafId.current)
    }
  }, [])

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId)
    element?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <section ref={heroRef} className="relative h-[calc(100vh-4rem)] flex items-center py-4 lg:py-6">
      {/* Enhanced background gradients */}
      <div className="absolute inset-0 -z-20 hero-global-gradients"></div>
      
      {/* Aurora background glow - animated with new color scheme */}
      <div className="absolute inset-0 -z-10 aurora-container">
        <div className="aurora-glow aurora-glow-1" />
        <div className="aurora-glow aurora-glow-2" />
        <div className="aurora-glow aurora-glow-3" />
        <div className="aurora-glow aurora-glow-4" />
      </div>
      
      {/* Cursor spotlight effect */}
      <div 
        ref={spotlightRef}
        className="absolute inset-0 -z-10 opacity-0 hover:opacity-100 transition-opacity duration-500 pointer-events-none"
        style={{
          background: `radial-gradient(600px circle at var(--spotlight-x, 50%) var(--spotlight-y, 50%), rgba(76, 29, 149, 0.1), transparent 40%)`
        }}
      />
      
      {/* Noise overlay for texture */}
      <div className="absolute inset-0 -z-10 opacity-[0.015] mix-blend-overlay pointer-events-none bg-noise" />

      <div className="relative z-10 mx-auto max-w-7xl px-4 w-full">
        {/* Desktop: Two-column layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-8 items-center">
          {/* LEFT COLUMN: Logo + Title + CTAs */}
          <div className="flex flex-col items-center text-center relative lg:mt-24">
            {/* Logo */}
            <div 
              className="relative w-full max-w-[280px] sm:max-w-[380px] lg:max-w-lg aspect-square -mb-20 lg:absolute lg:top-0 lg:left-1/2 lg:transform lg:-translate-x-1/2 lg:-translate-y-56 lg:w-[529px] lg:max-w-none"
            >
              <Image
                src="https://res.cloudinary.com/dacgtjw7w/image/upload/v1755014757/ChatGPT_Image_Aug_12_2025_09_28_26_PM_rewlxg.png"
                alt="ARMYVERSE logo"
                fill
                priority
                sizes="(max-width: 768px) 280px, (max-width: 1024px) 380px, 512px"
                className="object-contain opacity-90 animate-pulse-glow"
              />
            </div>

            {/* Container for Title + CTAs */}
            <div className="bg-[#0d0a10] rounded-2xl p-6 w-full max-w-2xl text-center lg:mt-56">
              {/* Title and tagline */}
              <div className="mb-4">
                <div className="relative">
                  {/* Gradient border layer */}
                  {/* Main text layer */}
                  <h1 className="relative text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight mb-2 bg-gradient-to-r from-[#c4b5fd] via-[#f472b6] to-[#fb923c] bg-clip-text text-transparent">
                    ARMYVERSE
                  </h1>
                </div>
                <p className="text-base sm:text-lg bg-gradient-to-r from-[#4c1d95] via-[#be185d] to-[#7c2d12] bg-clip-text text-transparent font-light animate-fade-in-words" style={{ textShadow: '0 0 20px rgba(76, 29, 149, 0.4)' }}>
                  Where Streaming Meets Passion
                </p>
              </div>

              {/* Primary CTAs */}
              <div className="flex flex-col sm:flex-row gap-2 mb-3 w-full sm:w-auto justify-center">
                <button
                  onClick={() => scrollToSection('trending')}
                  className="btn-glass-primary w-full sm:w-auto"
                  aria-label="Explore Trending"
                >
                  <TrendingUp className="w-5 h-5" />
                  <span>Explore Trending</span>
                </button>
                <a
                  href="/create-playlist"
                  className="btn-glass-secondary w-full sm:w-auto"
                  aria-label="Create Playlists"
                >
                  <Sparkles className="w-5 h-5" />
                  <span>Create Playlists</span>
                </a>
              </div>

              {/* Secondary CTAs - Ghost buttons */}
              <div className="grid grid-cols-2 sm:flex sm:flex-wrap gap-2 justify-center w-full sm:w-auto text-xs">
                <a href="/boraverse" className="btn-glass-ghost text-sm px-3 h-9">
                  <Gamepad2 className="w-4 h-4" />
                  <span>Play Boraverse</span>
                </a>
                <a href="/stats" className="btn-glass-ghost text-sm px-3 h-9">
                  <BarChart3 className="w-4 h-4" />
                  <span>View Stats</span>
                </a>
                <a href="/blog" className="btn-glass-ghost text-sm px-3 h-9">
                  <BookOpen className="w-4 h-4" />
                  <span>Read Blog</span>
                </a>
                <a href="/spotify" className="btn-glass-ghost text-sm px-3 h-9">
                  <Music className="w-4 h-4" />
                  <span>Spotify Stats</span>
                </a>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: Feature Showcase */}
          <div className="w-full lg:pl-8">
            <FeatureShowcase />
          </div>
        </div>
      </div>
      <div className="absolute bottom-0 left-0 right-0 h-36 pointer-events-none hero-bottom-fade z-0" />
    </section>
  )
}