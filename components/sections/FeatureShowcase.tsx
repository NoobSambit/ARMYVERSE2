'use client'

import React, { useEffect, useRef, useState } from 'react'
import FeatureCard from '@/components/ui/FeatureCard'
import { TrendingUp, Sparkles, Music, Gamepad2, BarChart3, UserCircle } from 'lucide-react'

export default function FeatureShowcase() {
  const scrollRef = useRef<HTMLDivElement>(null)
  const [activeIndex, setActiveIndex] = useState(0)

  const features = [
    {
      icon: TrendingUp,
      title: 'BTS + Solo Trends',
      description: 'Live charts across Spotify and YouTube.',
      href: '/trending',
      delay: 0,
      accentColor: '#4c1d95'
    },
    {
      icon: Sparkles,
      title: 'AI Playlist',
      description: 'Instant mixes from your vibe or activity.',
      href: '/ai-playlist',
      delay: 80,
      accentColor: '#be185d'
    },
    {
      icon: Music,
      title: 'Streaming Playlists',
      description: 'Goal-driven sets for comeback streaming.',
      href: '/create-playlist',
      delay: 160,
      accentColor: '#7c2d12'
    },
    {
      icon: Gamepad2,
      title: 'Boraverse (Games)',
      description: 'Quizzes, mastery, and weekly leaderboards.',
      href: '/boraverse',
      delay: 240,
      accentColor: '#312e81'
    },
    {
      icon: BarChart3,
      title: 'Streaming Stats',
      description: 'Global performance snapshots and momentum.',
      href: '/spotify',
      delay: 320,
      accentColor: '#9d174d'
    },
    {
      icon: UserCircle,
      title: 'Spotify Analytics',
      description: 'Your top artists, habits, and insights.',
      href: '/stats',
      delay: 400,
      accentColor: '#6b21a8'
    }
  ]

  useEffect(() => {
    const scrollContainer = scrollRef.current
    if (!scrollContainer) return

    const handleScroll = () => {
      const scrollLeft = scrollContainer.scrollLeft
      const cardWidth = scrollContainer.offsetWidth * 0.85
      const index = Math.round(scrollLeft / cardWidth)
      setActiveIndex(index)
    }

    scrollContainer.addEventListener('scroll', handleScroll)
    return () => scrollContainer.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <div className="w-full h-full flex flex-col">
      {/* Header */}
      <div className="mb-6 animate-fade-up">
        <h2 className="text-2xl lg:text-3xl font-bold text-white mb-2 bg-gradient-to-r from-[#4c1d95] via-[#be185d] to-[#7c2d12] bg-clip-text text-transparent">
          Everything You Need
        </h2>
        <p className="text-white/70 text-sm lg:text-base">
          All features at a glance. Choose your adventure.
        </p>
      </div>
      
      {/* Features Grid - 2x3 on desktop, horizontal scroll on mobile */}
      <div 
        ref={scrollRef}
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-4 auto-rows-fr max-md:flex max-md:overflow-x-auto max-md:snap-x max-md:snap-mandatory max-md:gap-4 max-md:pb-4 scrollbar-hide"
      >
        {features.map((feature) => (
          <FeatureCard
            key={feature.title}
            icon={feature.icon}
            title={feature.title}
            description={feature.description}
            href={feature.href}
            delay={feature.delay}
            accentColor={feature.accentColor}
          />
        ))}
      </div>

      {/* Swipe indicator dots (mobile only) */}
      <div className="flex md:hidden justify-center gap-2 mt-4">
        {features.map((_, index) => (
          <div
            key={index}
            className={`w-2 h-2 rounded-full transition-all duration-300 ${
              index === activeIndex 
                ? 'bg-[#be185d] w-6' 
                : 'bg-white/30'
            }`}
          />
        ))}
      </div>
    </div>
  )
}