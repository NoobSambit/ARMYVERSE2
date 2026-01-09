'use client'

import Image from 'next/image'
import { useState, useEffect } from 'react'

interface PhotocardPreview {
  cardId: string
  title?: string | null
  category?: string
  subcategory?: string | null
  imageUrl?: string
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
          setPhotocards(data.cards)
          setVisibleCards(data.cards.slice(0, 3))
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

  const gradients = [
    'from-rose-300 via-orange-200 to-amber-200',
    'from-cyan-300 via-blue-200 to-slate-200',
    'from-emerald-300 via-lime-200 to-teal-200',
    'from-fuchsia-300 via-purple-200 to-indigo-200'
  ]

  const renderCard = (card: PhotocardPreview, index: number) => {
    const gradient = gradients[index % gradients.length]
    const title = card.title || card.subcategory || card.category || 'Photocard'
    const meta = card.subcategory ? `${card.category || 'Gallery'} • ${card.subcategory}` : (card.category || 'Gallery')

    return (
      <div
        key={`${card.cardId}-${index}`}
        className="relative w-full h-full flex-shrink-0 rounded-xl overflow-hidden group cursor-pointer transition-all duration-500 hover:scale-105"
        style={{ animation: 'fadeIn 0.5s ease-in-out' }}
      >
        {/* Card Image */}
        <div className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-110">
          <Image
            src={card.imageUrl || `https://placehold.co/600x800/1f102c/ffffff?text=${encodeURIComponent(title)}`}
            alt={title}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 50vw, 33vw"
          />
        </div>

        {/* Gradient Overlay */}
        <div className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-20`} />
        <div className="absolute bottom-0 left-0 w-full p-2 md:p-3 bg-gradient-to-t from-black/95 via-black/70 to-transparent pt-10 md:pt-12">

          <div className="flex items-center justify-between gap-1">
            <div className="min-w-0 flex-1">
              <p className="text-[10px] md:text-xs font-bold tracking-wider uppercase font-display mb-0.5 text-white/70 truncate">
                {meta}
              </p>
              <p className="text-white font-bold text-xs md:text-sm font-display truncate">{title}</p>
            </div>
            <div className="text-lg md:text-xl flex-shrink-0 text-white/70">*</div>
          </div>
        </div>

        {/* Shine Effect on Hover */}
        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none">
          <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
        </div>

        {/* Border Glow */}
        <div className="absolute inset-0 border-2 border-white/10 rounded-xl pointer-events-none" />
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
          <div key={`row1-${card.cardId}`} className="relative w-1/2 h-full">
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
