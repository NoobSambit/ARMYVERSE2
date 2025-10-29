'use client'

import React from 'react'
import Link from 'next/link'
import { ArrowRight, LucideIcon } from 'lucide-react'

interface FeatureCardProps {
  icon: LucideIcon
  title: string
  description: string
  href: string
  delay?: number
  accentColor?: string
}

export default function FeatureCard({ icon: Icon, title, description, href, delay = 0, accentColor = '#A274FF' }: FeatureCardProps) {
  return (
    <Link
      href={href}
      className="group relative overflow-hidden rounded-[28px] p-6 h-full flex flex-col animate-fade-up max-md:min-w-[85vw] max-md:snap-center transition-all duration-300"
      style={{ 
        animationDelay: `${delay}ms`,
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)'
      }}
    >
      {/* Frosted glass background - reduced blur on mobile */}
      <div className="absolute inset-0 bg-white/[0.03] backdrop-blur-xl md:backdrop-blur-xl max-md:backdrop-blur-md border border-white/[0.08] rounded-[28px] transition-all duration-300 group-hover:bg-white/[0.06] group-hover:border-white/[0.12]" />
      
      {/* Subtle glow effect on hover - disabled on touch devices */}
      <div 
        className="absolute inset-0 rounded-[28px] opacity-0 group-hover:opacity-100 transition-opacity duration-500 max-md:hidden"
        style={{ 
          boxShadow: `0 0 40px ${accentColor}40, inset 0 0 20px ${accentColor}10`
        }}
      />
      
      {/* Content */}
      <div className="relative z-10 flex flex-col h-full">
        {/* Icon with soft glow */}
        <div 
          className="mb-4 inline-flex items-center justify-center w-12 h-12 rounded-2xl transition-all duration-300 group-hover:scale-110"
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
  )
}