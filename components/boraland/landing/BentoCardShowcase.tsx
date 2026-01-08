'use client'

import Image from 'next/image'
import { useState, useEffect } from 'react'
import { Crown, Gem, Star } from 'lucide-react'

interface PhotocardPreview {
  publicId: string
  rarity: 'common' | 'rare' | 'epic' | 'legendary'
  member: string
  era: string
  set: string
  imageUrl: string
  isLimited: boolean
}

const rarityConfig = {
  common: {
    gradient: 'from-slate-400 via-slate-300 to-slate-400',
    textColor: 'text-slate-300',
    bgGlow: 'bg-slate-400/10',
    borderColor: 'border-slate-400/30',
    label: 'Standard'
  },
  rare: {
    gradient: 'from-blue-400 via-cyan-300 to-blue-500',
    textColor: 'text-cyan-300',
    bgGlow: 'bg-cyan-400/10',
    borderColor: 'border-cyan-400/30',
    label: 'Epic'
  },
  epic: {
    gradient: 'from-purple-400 via-fuchsia-400 to-purple-500',
    textColor: 'text-fuchsia-300',
    bgGlow: 'bg-fuchsia-400/10',
    borderColor: 'border-fuchsia-400/30',
    label: 'Legendary'
  },
  legendary: {
    gradient: 'from-amber-300 via-yellow-200 to-amber-400',
    textColor: 'text-amber-200',
    bgGlow: 'bg-amber-400/10',
    borderColor: 'border-amber-400/30',
    label: 'Mythic'
  }
}

export default function BentoCardShowcase() {
  const [photocards, setPhotocards] = useState<PhotocardPreview[]>([])
  const [visibleCards, setVisibleCards] = useState<PhotocardPreview[]>([])
  const [loading, setLoading] = useState(true)
  const [currentIndex, setCurrentIndex] = useState(0)

  useEffect(() => {
    fetch('/api/game/photocards/preview')
      .then(res => res.json())
      .then(data => {
        if (data.cards && data.cards.length > 0) {
          // Sort by rarity (legendary first) and take all
          const sortedCards = data.cards.sort((a: PhotocardPreview, b: PhotocardPreview) => {
            const rarityOrder = { legendary: 4, epic: 3, rare: 2, common: 1 }
            return rarityOrder[b.rarity] - rarityOrder[a.rarity]
          })
          setPhotocards(sortedCards)
          // Show first 3 initially
          setVisibleCards(sortedCards.slice(0, 3))
        }
        setLoading(false)
      })
      .catch(err => {
        console.error('Failed to fetch preview cards:', err)
        setLoading(false)
      })
  }, [])

  // Rotate cards every 2 seconds
  useEffect(() => {
    if (photocards.length <= 3) return

    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => {
        const nextIndex = (prevIndex + 1) % photocards.length
        // Get next 3 cards with wraparound
        const nextCards = []
        for (let i = 0; i < 3; i++) {
          nextCards.push(photocards[(nextIndex + i) % photocards.length])
        }
        setVisibleCards(nextCards)
        return nextIndex
      })
    }, 2000)

    return () => clearInterval(interval)
  }, [photocards])

  const renderCard = (card: PhotocardPreview, index: number) => {
    const config = rarityConfig[card.rarity]

    return (
      <div
        key={`${card.publicId}-${index}`}
        className="relative w-full h-full flex-shrink-0 rounded-xl overflow-hidden group cursor-pointer transition-all duration-500 hover:scale-105"
        style={{ animation: 'fadeIn 0.5s ease-in-out' }}
      >
        {/* Card Image */}
        {card.imageUrl && (
          <div className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-110">
            <Image
              src={card.imageUrl}
              alt={`${card.member} - ${card.era}`}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 50vw, 33vw"
            />
          </div>
        )}

        {/* Gradient Overlay */}
        <div className={`absolute inset-0 bg-gradient-to-br ${config.gradient} opacity-20`} />
        <div className="absolute bottom-0 left-0 w-full p-2 md:p-3 bg-gradient-to-t from-black/95 via-black/70 to-transparent pt-10 md:pt-12">

          <div className="flex items-center justify-between gap-1">
            <div className="min-w-0 flex-1">
              <p className="text-[10px] md:text-xs font-bold tracking-wider uppercase font-display mb-0.5 flex items-center gap-1">
                {card.rarity === 'legendary' && <Crown className="w-2.5 h-2.5 md:w-3 md:h-3 text-amber-300 flex-shrink-0" />}
                {card.rarity === 'epic' && <Gem className="w-2.5 h-2.5 md:w-3 md:h-3 text-fuchsia-300 flex-shrink-0" />}
                {card.rarity === 'rare' && <Star className="w-2.5 h-2.5 md:w-3 md:h-3 text-cyan-300 flex-shrink-0" />}
                <span className={`${config.textColor} truncate`}>{config.label}</span>
              </p>
              <p className="text-white font-bold text-xs md:text-sm font-display truncate">{card.member}</p>
            </div>
            <div className="text-lg md:text-xl flex-shrink-0">
              {card.rarity === 'legendary' && <Crown className={`w-4 h-4 md:w-5 md:h-5 ${config.textColor} drop-shadow-lg`} />}
              {card.rarity === 'epic' && <Gem className={`w-4 h-4 md:w-5 md:h-5 ${config.textColor} drop-shadow-lg`} />}
              {card.rarity === 'rare' && <Star className={`w-4 h-4 md:w-5 md:h-5 ${config.textColor} drop-shadow-lg`} />}
              {card.rarity === 'common' && <Star className={`w-4 h-4 md:w-5 md:h-5 text-slate-400 drop-shadow-lg`} />}
            </div>
          </div>
        </div>

        {/* Shine Effect on Hover */}
        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none">
          <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
        </div>

        {/* Border Glow */}
        <div className={`absolute inset-0 border-2 ${config.borderColor} rounded-xl pointer-events-none`} />
      </div>
    )
  }

  if (loading) {
    return (
      <div className="col-span-1 md:col-span-2 lg:col-span-2 row-span-2 grid grid-rows-2 gap-3 md:gap-4">
        {[1, 2].map((i) => (
          <div key={i} className="bento-card rounded-2xl p-5 flex items-center justify-center relative overflow-hidden min-h-[160px] md:min-h-[180px]">
            <div className="animate-pulse flex flex-col items-center gap-3">
              <div className="w-16 h-16 rounded-full bg-white/10"></div>
              <div className="w-24 h-4 rounded bg-white/10"></div>
            </div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="col-span-1 md:col-span-2 lg:col-span-2 row-span-2 grid grid-rows-2 gap-3 md:gap-4">
      {/* First row - horizontal scrolling cards */}
      <div className="bento-card rounded-2xl p-0 flex items-center gap-2 md:gap-3 overflow-hidden relative min-h-[160px] md:min-h-[180px]">
        {visibleCards.slice(0, 2).map((card, index) => (
          <div key={`row1-${card.publicId}`} className="relative w-1/2 h-full">
            {renderCard(card, index)}
          </div>
        ))}
        {/* Progress indicator */}
        <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 flex gap-1 z-20">
          {Array.from({ length: Math.min(Math.ceil(photocards.length / 3), 6) }).map((_, i) => (
            <div
              key={i}
              className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${
                Math.floor(currentIndex / 3) === i ? 'bg-primary' : 'bg-white/20'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Second row - third card */}
      <div className="bento-card rounded-2xl p-0 flex items-center justify-center overflow-hidden relative min-h-[160px] md:min-h-[180px]">
        {visibleCards[2] && (
          <div className="relative w-full h-full">
            {renderCard(visibleCards[2], 2)}
          </div>
        )}
      </div>
    </div>
  )
}
