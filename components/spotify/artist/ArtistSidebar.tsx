'use client'

import React from 'react'
import { Globe, Star, ExternalLink } from 'lucide-react'

interface ArtistSidebarProps {
  rankings: {
    global: { rank: number; label: string };
    kpop: { rank: number; label: string };
  }
  socials: Array<{ name: string; url: string; icon: React.ReactNode; color: string }>
  similar: Array<{ name: string; imageUrl: string }>
}

export default function ArtistSidebar({ rankings, socials, similar }: ArtistSidebarProps) {
  return (
    <div className="flex flex-col gap-6">
      {/* Rankings Card */}
      <div className="bg-[#2e2249] rounded-xl p-5 border border-white/5">
        <h3 className="text-white font-bold text-lg mb-4">Rankings</h3>
        <div className="flex flex-col gap-4">
          <div className="bg-[#151022] p-4 rounded-xl flex items-center justify-between border border-white/5">
            <div>
              <p className="text-[#a290cb] text-xs font-bold uppercase tracking-wide mb-1">Global Artist Rank</p>
              <div className="flex items-center gap-2">
                <span className="text-white text-2xl font-bold">#{rankings.global.rank}</span>
                <span className="bg-[#895af6]/20 text-[#895af6] text-[10px] px-1.5 py-0.5 rounded font-bold">
                  {rankings.global.label}
                </span>
              </div>
            </div>
            <div className="h-10 w-10 rounded-full bg-[#895af6]/10 flex items-center justify-center">
              <Globe className="w-5 h-5 text-[#895af6]" />
            </div>
          </div>
          <div className="bg-[#151022] p-4 rounded-xl flex items-center justify-between border border-white/5">
            <div>
              <p className="text-[#a290cb] text-xs font-bold uppercase tracking-wide mb-1">K-Pop Rank</p>
              <div className="flex items-center gap-2">
                <span className="text-white text-2xl font-bold">#{rankings.kpop.rank}</span>
                <span className="bg-[#0bda6f]/20 text-[#0bda6f] text-[10px] px-1.5 py-0.5 rounded font-bold">
                  {rankings.kpop.label}
                </span>
              </div>
            </div>
            <div className="h-10 w-10 rounded-full bg-[#0bda6f]/10 flex items-center justify-center">
              <Star className="w-5 h-5 text-[#0bda6f] fill-current" />
            </div>
          </div>
        </div>
        <button className="w-full mt-4 py-2 text-xs font-medium text-[#a290cb] hover:text-white border border-white/10 rounded-xl hover:bg-white/5 transition-colors">
          View Detailed Rankings
        </button>
      </div>

      {/* On the Web */}
      <div className="bg-[#2e2249] rounded-xl p-5 border border-white/5">
        <h3 className="text-white font-bold text-lg mb-4">On the Web</h3>
        <div className="flex flex-col gap-2">
          {socials.map((social, i) => (
            <a 
              key={i}
              href={social.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between p-3 rounded-xl hover:bg-white/5 transition-colors group"
            >
              <div className="flex items-center gap-3">
                <div 
                  className="h-8 w-8 rounded-full flex items-center justify-center"
                  style={{ backgroundColor: `${social.color}20`, color: social.color }}
                >
                  {social.icon}
                </div>
                <span className="text-sm font-medium text-white">{social.name}</span>
              </div>
              <ExternalLink className="w-4 h-4 text-[#a290cb] group-hover:translate-x-1 transition-transform" />
            </a>
          ))}
        </div>
      </div>

      {/* Similar Artists */}
      <div className="bg-[#2e2249] rounded-xl p-5 border border-white/5">
        <h3 className="text-white font-bold text-lg mb-4">Similar Artists</h3>
        <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
          {similar.map((artist, i) => (
            <div key={i} className="flex flex-col items-center gap-2 min-w-[72px]">
              <div 
                className="h-16 w-16 rounded-full bg-white/5 bg-cover bg-center"
                style={{ backgroundImage: `url('${artist.imageUrl}')` }}
              />
              <span className="text-xs text-[#a290cb] text-center truncate w-full">{artist.name}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
