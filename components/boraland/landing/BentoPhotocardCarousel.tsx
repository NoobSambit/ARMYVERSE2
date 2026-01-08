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
    borderColor: 'border-slate-400/30',
    label: 'Standard'
  },
  rare: {
    gradient: 'from-blue-400 via-cyan-300 to-blue-500',
    textColor: 'text-cyan-300',
    borderColor: 'border-cyan-400/30',
    label: 'Epic'
  },
  epic: {
    gradient: 'from-purple-400 via-fuchsia-400 to-purple-500',
    textColor: 'text-fuchsia-300',
    borderColor: 'border-fuchsia-400/30',
    label: 'Legendary'
  },
  legendary: {
    gradient: 'from-amber-300 via-yellow-200 to-amber-400',
    textColor: 'text-amber-200',
    borderColor: 'border-amber-400/30',
    label: 'Mythic'
  }
}

export default function BentoPhotocardCarousel() {
  const [photocards, setPhotocards] = useState<PhotocardPreview[]>([])
  const [visibleCards, setVisibleCards] = useState<PhotocardPreview[]>([])
  const [loading, setLoading] = useState(true)
  const [currentIndex, setCurrentIndex] = useState(0)

  useEffect(() => {
    fetch('/api/game/photocards/preview')
      .then(res => res.json())
      .then(data => {
        console.log('Photocards data:', data)
        if (data.cards && data.cards.length > 0) {
          const sortedCards = data.cards.sort((a: PhotocardPreview, b: PhotocardPreview) => {
            const rarityOrder = { legendary: 4, epic: 3, rare: 2, common: 1 }
            return rarityOrder[b.rarity] - rarityOrder[a.rarity]
          })
          console.log('Sorted cards:', sortedCards)
          setPhotocards(sortedCards)
          setVisibleCards(sortedCards.slice(0, 3))
        }
        setLoading(false)
      })
      .catch(err => {
        console.error('Failed to fetch preview cards:', err)
        setLoading(false)
      })
  }, [])

  useEffect(() => {
    if (photocards.length <= 3) return

    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => {
        const nextIndex = (prevIndex + 3) % photocards.length
        const nextCards = photocards.slice(nextIndex, nextIndex + 3)
        setVisibleCards(nextCards.length === 3 ? nextCards : [...nextCards, ...photocards.slice(0, 3 - nextCards.length)])
        return nextIndex
      })
    }, 2000)

    return () => clearInterval(interval)
  }, [photocards])

  const renderCard = (card: PhotocardPreview, index: number) => {
    const config = rarityConfig[card.rarity]

    return (
      <div
        key={`${card.publicId}-${currentIndex}-${index}`}
        className="relative w-1/3 h-full self-stretch flex-shrink-0 rounded-2xl overflow-hidden group cursor-pointer transition-all duration-500 hover:scale-105 animate-fade-in"
      >
        {card.imageUrl && (
          <div className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-110">
            <Image
              src={card.imageUrl}
              alt={`${card.member} - ${card.era}`}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 33vw, 16vw"
            />
          </div>
        )}

        <div className={`absolute inset-0 bg-gradient-to-br ${config.gradient} opacity-20`} />
        <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/90 to-transparent pt-8">
          <p className="text-[8px] md:text-[10px] font-bold uppercase tracking-wider font-display mb-0.5 flex items-center gap-1">
            {card.rarity === 'legendary' && <Crown className="w-2 h-2 text-amber-300" />}
            {card.rarity === 'epic' && <Gem className="w-2 h-2 text-fuchsia-300" />}
            {card.rarity === 'rare' && <Star className="w-2 h-2 text-cyan-300" />}
            <span className={config.textColor}>{config.label}</span>
          </p>
          <p className="text-white font-bold text-[10px] md:text-xs font-display truncate">{card.member}</p>
        </div>

        <div className={`absolute inset-0 border ${config.borderColor} rounded-2xl pointer-events-none`} />
      </div>
    )
  }

  if (loading) {
    return (
      <div className="bento-card col-span-1 md:col-span-2 lg:col-span-2 row-span-1 rounded-[28px] p-4 md:p-5 flex items-center justify-center relative overflow-hidden min-h-[140px] sm:min-h-[160px] md:min-h-[180px]">
        <div className="animate-pulse flex flex-col items-center gap-3">
          <div className="w-16 h-16 rounded-full bg-white/10"></div>
          <div className="w-24 h-4 rounded bg-white/10"></div>
        </div>
      </div>
    )
  }

  if (photocards.length === 0) {
    return (
      <div className="bento-card col-span-1 md:col-span-2 lg:col-span-2 row-span-1 rounded-[28px] p-4 md:p-5 flex items-center justify-center relative overflow-hidden min-h-[140px] sm:min-h-[160px] md:min-h-[180px]">
        <p className="text-gray-400 text-sm">No photocards available</p>
      </div>
    )
  }

  return (
    <div className="bento-card col-span-1 md:col-span-2 lg:col-span-2 row-span-1 rounded-[28px] p-2.5 sm:p-3 md:p-4 flex items-center gap-2 md:gap-3 overflow-hidden relative min-h-[140px] sm:min-h-[160px] md:min-h-[180px] h-full">
      <div className="flex items-stretch gap-2 md:gap-3 w-full h-full">
        {visibleCards.map((card, index) => renderCard(card, index))}
      </div>
      <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 flex gap-1 z-20">
        {Array.from({ length: Math.ceil(photocards.length / 3) }).map((_, i) => (
          <div
            key={i}
            className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${
              Math.floor(currentIndex / 3) === i ? 'bg-primary' : 'bg-white/20'
            }`}
          />
        ))}
      </div>
    </div>
  )
}
