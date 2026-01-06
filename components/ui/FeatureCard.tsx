'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { ArrowRight, LucideIcon, Info } from 'lucide-react'
import FeatureInfoModal from './FeatureInfoModal'

interface FeatureCardProps {
  icon: LucideIcon
  title: string
  description: string
  href: string
  delay?: number
  accentColor?: string
  longDescription?: string
  features?: string[]
}

export default function FeatureCard({
  icon: Icon,
  title,
  description,
  href,
  delay = 0,
  accentColor = '#A274FF',
  longDescription = '',
  features = []
}: FeatureCardProps) {
  const [modalOpen, setModalOpen] = useState(false)

  // Debug log
  console.log('FeatureCard:', title, 'features:', features, 'length:', features?.length)

  const handleInfoClick = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setModalOpen(true)
  }

  return (
    <>
      <Link
        href={href}
        className="group relative overflow-hidden rounded-[28px] p-6 h-full flex flex-col animate-fade-up max-md:min-w-[85vw] max-md:snap-center transition-all duration-300"
        style={{
          animationDelay: `${delay}ms`,
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)'
        }}
      >
        {/* Frosted glass background - reduced blur on mobile */}
        <div className="absolute inset-0 bg-white/[0.03] backdrop-blur-md md:backdrop-blur-lg max-md:backdrop-blur-sm border border-white/[0.08] rounded-[28px] transition-all duration-300 group-hover:bg-white/[0.06] group-hover:border-white/[0.12]" style={{ willChange: 'auto' }} />

        {/* Subtle glow effect on hover - disabled on touch devices */}
        <div
          className="absolute inset-0 rounded-[28px] opacity-0 group-hover:opacity-100 transition-opacity duration-500 max-md:hidden"
          style={{
            boxShadow: `0 0 40px ${accentColor}40, inset 0 0 20px ${accentColor}10`
          }}
        />

        {/* Content */}
        <div className="relative z-10 flex flex-col h-full">
          {/* Header with icon and info button */}
          <div className="flex items-start justify-between mb-4">
            <div
              className="inline-flex items-center justify-center w-12 h-12 rounded-2xl transition-all duration-300 group-hover:scale-110"
              style={{
                background: `linear-gradient(135deg, ${accentColor}20, ${accentColor}10)`,
                boxShadow: `0 4px 16px ${accentColor}30`
              }}
            >
              <Icon
                className="w-6 h-6 transition-all duration-300 group-hover:scale-110"
                style={{ color: accentColor }}
              />
            </div>

            {/* Info button */}
            {features.length > 0 && (
              <button
                onClick={handleInfoClick}
                className="p-2.5 rounded-xl bg-white/10 border border-white/20 text-white hover:text-white hover:bg-white/20 hover:border-white/30 transition-all duration-200 hover:scale-110 opacity-100"
                aria-label={`Learn more about ${title}`}
                style={{ zIndex: 20 }}
              >
                <Info className="w-5 h-5" />
              </button>
            )}
          </div>

          {/* Title and description */}
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-white mb-2 transition-all duration-300 group-hover:text-purple-200">
              {title}
            </h3>
            <p className="text-sm sm:text-base text-white/60 leading-relaxed group-hover:text-white/80 transition-colors duration-300">
              {description}
            </p>
          </div>

          {/* Arrow indicator */}
          <div
            className="mt-4 flex items-center opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-0 group-hover:translate-x-1"
            style={{ color: accentColor }}
          >
            <span className="text-sm font-medium mr-1">Explore</span>
            <ArrowRight className="w-4 h-4" />
          </div>
        </div>
      </Link>

      {/* Feature Info Modal */}
      {features.length > 0 && (
        <FeatureInfoModal
          open={modalOpen}
          onOpenChange={setModalOpen}
          details={{
            icon: Icon,
            title,
            description,
            longDescription,
            features,
            accentColor
          }}
        />
      )}
    </>
  )
}