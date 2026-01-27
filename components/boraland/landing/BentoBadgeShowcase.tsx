'use client'

import Image from 'next/image'
import { useState, useEffect } from 'react'

interface Badge {
  code: string
  name: string
  category: string
  imageUrl: string
  tier: number
  maxTier: number
  description: string
}

export default function BentoBadgeShowcase() {
  const [badges, setBadges] = useState<Badge[]>([])
  const [visibleBadges, setVisibleBadges] = useState<Badge[]>([])
  const [loading, setLoading] = useState(true)
  const [currentIndex, setCurrentIndex] = useState(0)

  useEffect(() => {
    fetch('/api/game/badges/preview')
      .then(res => res.json())
      .then(data => {
        console.log('Badges data:', data)
        if (data.badges && data.badges.length > 0) {
          // Sort by tier (highest first)
          const sortedBadges = data.badges.sort((a: Badge, b: Badge) => b.tier - a.tier)
          console.log('Sorted badges:', sortedBadges)
          setBadges(sortedBadges)
          setVisibleBadges(sortedBadges.slice(0, 3))
        }
        setLoading(false)
      })
      .catch(err => {
        console.error('Failed to fetch preview badges:', err)
        setLoading(false)
      })
  }, [])

  useEffect(() => {
    if (badges.length <= 3) return

    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => {
        const nextIndex = (prevIndex + 3) % badges.length
        const nextBadges = badges.slice(nextIndex, nextIndex + 3)
        setVisibleBadges(nextBadges.length === 3 ? nextBadges : [...nextBadges, ...badges.slice(0, 3 - nextBadges.length)])
        return nextIndex
      })
    }, 2000)

    return () => clearInterval(interval)
  }, [badges])

  const getBadgeGlow = (tier: number, maxTier: number) => {
    const percentage = (tier / maxTier) * 100
    if (percentage >= 80) return 'shadow-[0_0_15px_rgba(251,191,36,0.6)]'
    if (percentage >= 60) return 'shadow-[0_0_15px_rgba(192,132,252,0.6)]'
    if (percentage >= 40) return 'shadow-[0_0_15px_rgba(34,211,238,0.6)]'
    return ''
  }

  const renderBadge = (badge: Badge, index: number) => {
    const glowClass = getBadgeGlow(badge.tier, badge.maxTier)

    return (
      <div
        key={`${badge.code}-${currentIndex}-${index}`}
        className="relative w-1/3 h-full self-stretch flex-shrink-0 rounded-2xl overflow-hidden group cursor-pointer transition-all duration-500 hover:scale-105 animate-fade-in bg-white/5 border-2 border-white/10"
      >
        {/* Badge Image */}
        <div className="absolute inset-0 flex items-center justify-center p-2 md:p-3">
          <Image
            src={badge.imageUrl}
            alt={badge.name}
            fill
            className="object-contain transition-transform duration-700 group-hover:scale-110"
            sizes="(max-width: 768px) 33vw, 16vw"
            unoptimized
            onError={() => {
              console.error('Failed to load badge image:', badge.imageUrl)
            }}
          />
        </div>

        {/* Badge Info Overlay - always visible */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent opacity-100 flex flex-col justify-end p-2">
          <p className="text-white font-bold text-[10px] md:text-xs font-display text-center truncate">
            {badge.name}
          </p>
          <p className="text-gray-300 text-[8px] md:text-[10px] text-center truncate">
            {badge.description}
          </p>
        </div>

        {/* Glow Effect */}
        <div className={`absolute inset-0 pointer-events-none rounded-2xl ${glowClass}`} />
      </div>
    )
  }

  if (loading) {
    return (
      <div data-tour="landing-badges" className="bento-card col-span-1 md:col-span-2 lg:col-span-2 row-span-1 rounded-[28px] p-4 md:p-5 flex items-center justify-center relative overflow-hidden min-h-[140px] sm:min-h-[160px] md:min-h-[180px]">
        <div className="animate-pulse flex flex-col items-center gap-3">
          <div className="w-16 h-16 rounded-full bg-white/10"></div>
          <div className="w-24 h-4 rounded bg-white/10"></div>
        </div>
      </div>
    )
  }

  if (badges.length === 0) {
    return (
      <div data-tour="landing-badges" className="bento-card col-span-1 md:col-span-2 lg:col-span-2 row-span-1 rounded-[28px] p-4 md:p-5 flex items-center justify-center relative overflow-hidden min-h-[140px] sm:min-h-[160px] md:min-h-[180px]">
        <p className="text-gray-400 text-sm">No badges available</p>
      </div>
    )
  }

  return (
    <div data-tour="landing-badges" className="bento-card col-span-1 md:col-span-2 lg:col-span-2 row-span-1 rounded-[28px] p-2.5 sm:p-3 md:p-4 flex items-center gap-2 md:gap-3 overflow-hidden relative min-h-[140px] sm:min-h-[160px] md:min-h-[180px] h-full">
      <div className="flex items-stretch gap-2 md:gap-3 w-full h-full">
        {visibleBadges.map((badge, index) => renderBadge(badge, index))}
      </div>

      <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 flex gap-1 z-20">
        {Array.from({ length: Math.ceil(badges.length / 3) }).map((_, i) => (
          <div
            key={i}
            className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${Math.floor(currentIndex / 3) === i ? 'bg-accent-green' : 'bg-white/20'
              }`}
          />
        ))}
      </div>
    </div>
  )
}
