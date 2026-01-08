'use client'

import React from 'react'
import { motion } from 'framer-motion'

interface ArtistHeroProps {
  name: string
  subtitle?: string
  heroImage?: string
  avatarImage?: string
  verified?: boolean
  tags?: string[]
}

export default function ArtistHero({
  name,
  subtitle = 'Global Pop Icons • Debut 2013',
  heroImage,
  avatarImage,
  verified = true,
  tags = ['K-Pop']
}: ArtistHeroProps) {
  return (
    <section className="relative w-full rounded-2xl overflow-hidden mb-6 md:mb-8 h-[200px] sm:h-[240px] md:h-[280px] group">
      {/* Background Image */}
      <div
        className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105"
        style={{ backgroundImage: `url('${heroImage || '/placeholder-hero.jpg'}')` }}
      />

      {/* Gradients */}
      <div className="absolute inset-0 bg-gradient-to-r from-[#151022] via-[#151022]/80 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-t from-[#151022] via-transparent to-transparent" />

      {/* Content */}
      <div className="relative z-10 h-full flex flex-col justify-end p-4 sm:p-6 md:p-8 lg:p-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex items-end gap-3 sm:gap-4 md:gap-6"
        >
          {/* Avatar */}
          <div
            className="h-16 w-16 sm:h-20 sm:w-20 md:h-28 md:w-28 lg:h-32 lg:w-32 rounded-full border-3 sm:border-4 border-[#151022] bg-cover bg-center shadow-2xl shrink-0"
            style={{ backgroundImage: `url('${avatarImage || '/placeholder-avatar.jpg'}')` }}
          />

          <div className="mb-1 md:mb-2 min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 mb-1">
              {verified && (
                <span className="px-1.5 sm:px-2 py-0.5 rounded text-[8px] sm:text-[10px] font-bold uppercase tracking-wider bg-[#895af6]/20 text-[#895af6] border border-[#895af6]/20">
                  Verified
                </span>
              )}
              {tags.map(tag => (
                <span key={tag} className="px-1.5 sm:px-2 py-0.5 rounded text-[8px] sm:text-[10px] font-bold uppercase tracking-wider bg-white/10 text-white border border-white/10">
                  {tag}
                </span>
              ))}
            </div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold text-white tracking-tight mb-0.5 md:mb-1 truncate">
              {name}
            </h1>
            <p className="text-[#a290cb] text-xs sm:text-sm md:text-base lg:text-lg truncate">{subtitle}</p>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
