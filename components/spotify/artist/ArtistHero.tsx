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
    <section className="relative w-full rounded-2xl overflow-hidden mb-8 h-[280px] group">
      {/* Background Image */}
      <div 
        className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105"
        style={{ backgroundImage: `url('${heroImage || '/placeholder-hero.jpg'}')` }}
      />
      
      {/* Gradients */}
      <div className="absolute inset-0 bg-gradient-to-r from-[#151022] via-[#151022]/80 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-t from-[#151022] via-transparent to-transparent" />
      
      {/* Content */}
      <div className="relative z-10 h-full flex flex-col justify-end p-8 md:p-10">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex items-end gap-6"
        >
          {/* Avatar */}
          <div 
            className="h-32 w-32 rounded-full border-4 border-[#151022] bg-cover bg-center shadow-2xl shrink-0"
            style={{ backgroundImage: `url('${avatarImage || '/placeholder-avatar.jpg'}')` }}
          />
          
          <div className="mb-2">
            <div className="flex items-center gap-2 mb-1">
              {verified && (
                <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-[#895af6]/20 text-[#895af6] border border-[#895af6]/20">
                  Verified Artist
                </span>
              )}
              {tags.map(tag => (
                <span key={tag} className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-white/10 text-white border border-white/10">
                  {tag}
                </span>
              ))}
            </div>
            <h1 className="text-5xl md:text-6xl font-bold text-white tracking-tight mb-1">
              {name}
            </h1>
            <p className="text-[#a290cb] text-lg">{subtitle}</p>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
