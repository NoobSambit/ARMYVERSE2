'use client'

import Image from 'next/image'
import { Play, ExternalLink } from 'lucide-react'
import React from 'react'

export interface MemberItem {
  member: string
  track: {
    id: string
    name: string
    artist: string
    albumArt: string
    popularity: number
    spotifyUrl: string
    estimatedStreams: number
  }
}

interface MemberCarouselProps {
  items: MemberItem[]
}

export default function MemberCarousel({ items }: MemberCarouselProps) {
  if (!items?.length) return null

  return (
    <div className="overflow-x-auto no-scrollbar">
      <div className="flex gap-4 min-w-full pr-2">
        {items.map((member) => (
          <article key={member.member} className="min-w-[220px] max-w-[240px] w-[220px]">
            <div className="relative bg-white/6 backdrop-blur-md rounded-2xl p-3 border border-white/10 hover:border-[#C084FC]/40 transition-all">
              {/* Member badge */}
              <div className="absolute top-2 left-2 z-10">
                <div className="px-3 py-1 bg-gradient-to-r from-[#A274FF] to-[#FF9AD5] rounded-full">
                  <span className="text-white text-xs font-bold">{member.member}</span>
                </div>
              </div>
              <div className="relative rounded-xl overflow-hidden mb-3 aspect-square">
                <Image src={member.track.albumArt} alt={member.track.name} fill sizes="220px" className="object-cover" unoptimized />
              </div>
              <h3 className="text-white text-sm font-semibold line-clamp-2">{member.track.name}</h3>
              <p className="text-white/70 text-xs">{member.track.artist}</p>
              <div className="mt-2 flex items-center justify-between">
                <span className="text-white/70 text-xs">{Intl.NumberFormat('en', { notation: 'compact' }).format(member.track.estimatedStreams)} views</span>
                <div className="flex items-center gap-2">
                  <a href={member.track.spotifyUrl} target="_blank" rel="noopener noreferrer" aria-label="Play" className="p-2 rounded-full bg-[#A274FF] hover:bg-[#8C5CFF] text-white"><Play size={14} /></a>
                  <a href={member.track.spotifyUrl} target="_blank" rel="noopener noreferrer" aria-label="Open" className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white"><ExternalLink size={14} /></a>
                </div>
              </div>
            </div>
          </article>
        ))}
      </div>
    </div>
  )
}


