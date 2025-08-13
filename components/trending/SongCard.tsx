'use client'

import Image from 'next/image'
import { Play, ExternalLink } from 'lucide-react'
import React from 'react'

type Platform = 'spotify' | 'youtube'

export interface SongCardProps {
  id: string
  title: string
  artist: string
  thumbnailUrl: string
  duration?: string
  popularityOrViews?: string
  platform: Platform
  openUrl: string
  rank?: number
}

export default function SongCard({ id, title, artist, thumbnailUrl, duration, popularityOrViews, platform, openUrl, rank }: SongCardProps) {
  const aria = `${rank ? `#${rank} ` : ''}${title} by ${artist}`

  return (
    <article key={id} className="group relative" aria-label={aria}>
      {/* Rank */}
      {typeof rank === 'number' && (
        <div className="absolute top-2 left-2 z-10">
          <div className="w-8 h-8 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center text-black font-bold text-sm">
            #{rank}
          </div>
        </div>
      )}

      <div className="bg-white/6 backdrop-blur-md rounded-2xl p-3 border border-white/10 hover:border-[#C084FC]/40 transition-all duration-300 focus-within:ring-2 focus-within:ring-[#C084FC] hover:-translate-y-1 hover:shadow-lg">
        <div className="flex items-center gap-3">
          {/* Thumbnail */}
          <div className="relative rounded-lg overflow-hidden shrink-0 w-20 h-20 sm:w-20 sm:h-20 md:w-20 md:h-20">
            <Image
              src={thumbnailUrl}
              alt={title}
              fill
              sizes="(max-width: 640px) 64px, 80px"
              className="object-cover"
              unoptimized
            />
          </div>

        
          <div className="min-w-0 flex-1">
            <h3 className="text-white font-semibold text-sm truncate" title={title}>{title}</h3>
            <p className="text-white/70 text-xs truncate" title={artist}>{artist}</p>
            <div className="mt-1 flex items-center gap-2 text-[11px] text-white/70">
              {duration && <span>{duration}</span>}
              {duration && <span className="opacity-40">|</span>}
              {popularityOrViews && <span>{popularityOrViews}</span>}
              <span className="opacity-40">|</span>
              <span className={`inline-flex items-center px-2 py-0.5 rounded-full border text-[10px] ${platform === 'spotify' ? 'border-green-500 text-green-400' : 'border-pink-500 text-pink-300'}`}>{platform === 'spotify' ? 'Spotify' : 'YouTube'}</span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 self-start">
            <a
              href={openUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 rounded-full bg-[#A274FF] hover:bg-[#8C5CFF] text-white transition-colors"
              aria-label={`Play on ${platform}`}
            >
              <Play size={14} />
            </a>
            <a
              href={openUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
              aria-label={`Open link in ${platform}`}
            >
              <ExternalLink size={14} />
            </a>
          </div>
        </div>
      </div>
    </article>
  )
}


