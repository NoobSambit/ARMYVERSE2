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

export default function BentoPhotocardCarousel() {
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
        key={`${card.cardId}-${currentIndex}-${index}`}
        className="relative w-1/3 h-full self-stretch flex-shrink-0 rounded-2xl overflow-hidden group cursor-pointer transition-all duration-500 hover:scale-105 animate-fade-in"
      >
        <div className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-110">
          <Image
            src={card.imageUrl || `https://placehold.co/400x600/1f102c/ffffff?text=${encodeURIComponent(title)}`}
            alt={title}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 33vw, 16vw"
          />
        </div>

        <div className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-20`} />
        <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/90 to-transparent pt-8">
          <p className="text-[8px] md:text-[10px] font-bold uppercase tracking-wider font-display mb-0.5 text-white/70 truncate">
            {meta}
          </p>
          <p className="text-white font-bold text-[10px] md:text-xs font-display truncate">{title}</p>
        </div>
        <div className="absolute inset-0 border border-white/10 rounded-2xl pointer-events-none" />
      </div>
    )
  }

  if (loading) {
    return (
      <div data-tour="landing-photocards" className="bento-card col-span-1 md:col-span-2 lg:col-span-2 row-span-1 rounded-[28px] p-4 md:p-5 flex items-center justify-center relative overflow-hidden min-h-[140px] sm:min-h-[160px] md:min-h-[180px]">
        <div className="animate-pulse flex flex-col items-center gap-3">
          <div className="w-16 h-16 rounded-full bg-white/10"></div>
          <div className="w-24 h-4 rounded bg-white/10"></div>
        </div>
      </div>
    )
  }

  if (photocards.length === 0) {
    return (
      <div data-tour="landing-photocards" className="bento-card col-span-1 md:col-span-2 lg:col-span-2 row-span-1 rounded-[28px] p-4 md:p-5 flex items-center justify-center relative overflow-hidden min-h-[140px] sm:min-h-[160px] md:min-h-[180px]">
        <p className="text-gray-400 text-sm">No photocards available</p>
      </div>
    )
  }

  return (
    <div data-tour="landing-photocards" className="bento-card col-span-1 md:col-span-2 lg:col-span-2 row-span-1 rounded-[28px] p-2.5 sm:p-3 md:p-4 flex items-center gap-2 md:gap-3 overflow-hidden relative min-h-[140px] sm:min-h-[160px] md:min-h-[180px] h-full">
      <div className="flex items-stretch gap-2 md:gap-3 w-full h-full">
        {visibleCards.map((card, index) => renderCard(card, index))}
      </div>
      <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 flex gap-1 z-20">
        {Array.from({ length: Math.ceil(photocards.length / 3) }).map((_, i) => (
          <div
            key={i}
            className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${Math.floor(currentIndex / 3) === i ? 'bg-primary' : 'bg-white/20'
              }`}
          />
        ))}
      </div>
    </div>
  )
}
