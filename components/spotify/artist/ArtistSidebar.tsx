'use client'

import React, { useState } from 'react'
import { Globe, Star, ExternalLink, Info } from 'lucide-react'
import MobileDrawer from '@/components/spotify/MobileDrawer'

interface ArtistSidebarProps {
  rankings: {
    global?: { rank: number; label: string }
    kpop: { rank: number; label: string }
  }
  socials: Array<{
    name: string
    url: string
    icon: React.ReactNode
    color: string
  }>
  similar: Array<{ name: string; imageUrl: string }>
}

export default function ArtistSidebar({
  rankings,
  socials,
  similar,
}: ArtistSidebarProps) {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)

  return (
    <>
      {/* Mobile trigger button */}
      <div className="lg:hidden fixed bottom-4 right-4 z-40">
        <button
          onClick={() => setIsDrawerOpen(true)}
          className="bg-[#895af6] hover:bg-[#7a4ae6] text-white p-3 rounded-full shadow-lg transition-all hover:scale-105"
          aria-label="View artist details"
        >
          <Info className="w-5 h-5" />
        </button>
      </div>

      {/* Desktop Sidebar */}
      <div className="hidden lg:flex flex-col gap-4 sm:gap-6">
        {/* Rankings Card */}
        <div className="bg-[#2e2249] rounded-xl p-4 sm:p-5 border border-white/5">
          <h3 className="text-white font-bold text-base sm:text-lg mb-3 sm:mb-4">
            Rankings
          </h3>
          <div className="flex flex-col gap-3 sm:gap-4">
            {rankings.global && (
              <div className="bg-[#151022] p-3 sm:p-4 rounded-xl flex items-center justify-between border border-white/5">
                <div>
                  <p className="text-[#a290cb] text-[10px] sm:text-xs font-bold uppercase tracking-wide mb-1">
                    Global Artist Rank
                  </p>
                  <div className="flex items-center gap-1.5 sm:gap-2">
                    <span className="text-white text-xl sm:text-2xl font-bold">
                      #{rankings.global.rank}
                    </span>
                    <span className="bg-[#895af6]/20 text-[#895af6] text-[9px] sm:text-[10px] px-1 sm:px-1.5 py-0.5 rounded font-bold">
                      {rankings.global.label}
                    </span>
                  </div>
                </div>
                <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-full bg-[#895af6]/10 flex items-center justify-center">
                  <Globe className="w-4 h-4 sm:w-5 sm:h-5 text-[#895af6]" />
                </div>
              </div>
            )}
            <div className="bg-[#151022] p-3 sm:p-4 rounded-xl flex items-center justify-between border border-white/5">
              <div>
                <p className="text-[#a290cb] text-[10px] sm:text-xs font-bold uppercase tracking-wide mb-1">
                  K-Pop Rank
                </p>
                <div className="flex items-center gap-1.5 sm:gap-2">
                  <span className="text-white text-xl sm:text-2xl font-bold">
                    #{rankings.kpop.rank}
                  </span>
                  <span className="bg-[#0bda6f]/20 text-[#0bda6f] text-[9px] sm:text-[10px] px-1 sm:px-1.5 py-0.5 rounded font-bold">
                    {rankings.kpop.label}
                  </span>
                </div>
              </div>
              <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-full bg-[#0bda6f]/10 flex items-center justify-center">
                <Star className="w-4 h-4 sm:w-5 sm:h-5 text-[#0bda6f] fill-current" />
              </div>
            </div>
          </div>
          <button className="w-full mt-3 sm:mt-4 py-2 text-[10px] sm:text-xs font-medium text-[#a290cb] hover:text-white border border-white/10 rounded-xl hover:bg-white/5 transition-colors">
            View Detailed Rankings
          </button>
        </div>

        {/* On the Web */}
        <div className="bg-[#2e2249] rounded-xl p-4 sm:p-5 border border-white/5">
          <h3 className="text-white font-bold text-base sm:text-lg mb-3 sm:mb-4">
            On the Web
          </h3>
          <div className="flex flex-col gap-1.5 sm:gap-2">
            {socials.map((social, i) => (
              <a
                key={i}
                href={social.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between p-2.5 sm:p-3 rounded-xl hover:bg-white/5 transition-colors group"
              >
                <div className="flex items-center gap-2 sm:gap-3">
                  <div
                    className="h-7 w-7 sm:h-8 sm:w-8 rounded-full flex items-center justify-center"
                    style={{
                      backgroundColor: `${social.color}20`,
                      color: social.color,
                    }}
                  >
                    {social.icon}
                  </div>
                  <span className="text-sm font-medium text-white">
                    {social.name}
                  </span>
                </div>
                <ExternalLink className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#a290cb] group-hover:translate-x-1 transition-transform" />
              </a>
            ))}
          </div>
        </div>

        {/* Similar Artists */}
        <div className="bg-[#2e2249] rounded-xl p-4 sm:p-5 border border-white/5">
          <h3 className="text-white font-bold text-base sm:text-lg mb-3 sm:mb-4">
            Similar Artists
          </h3>
          <div className="flex gap-3 sm:gap-4 overflow-x-auto pb-2 scrollbar-hide">
            {similar.map((artist, i) => (
              <div
                key={i}
                className="flex flex-col items-center gap-1.5 sm:gap-2 min-w-[60px] sm:min-w-[72px]"
              >
                <div
                  className="h-12 w-12 sm:h-16 sm:w-16 rounded-full bg-white/5 bg-cover bg-center"
                  style={{ backgroundImage: `url('${artist.imageUrl}')` }}
                />
                <span className="text-[10px] sm:text-xs text-[#a290cb] text-center truncate w-full">
                  {artist.name}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      <MobileDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        title="Artist Details"
        position="bottom"
      >
        <div className="flex flex-col gap-6">
          {/* Rankings Card */}
          <div className="bg-[#2e2249] rounded-xl p-5 border border-white/5">
            <h3 className="text-white font-bold text-lg mb-4">Rankings</h3>
            <div className="flex flex-col gap-4">
              {rankings.global && (
                <div className="bg-[#151022] p-4 rounded-xl flex items-center justify-between border border-white/5">
                  <div>
                    <p className="text-[#a290cb] text-xs font-bold uppercase tracking-wide mb-1">
                      Global Artist Rank
                    </p>
                    <div className="flex items-center gap-2">
                      <span className="text-white text-2xl font-bold">
                        #{rankings.global.rank}
                      </span>
                      <span className="bg-[#895af6]/20 text-[#895af6] text-[10px] px-1.5 py-0.5 rounded font-bold">
                        {rankings.global.label}
                      </span>
                    </div>
                  </div>
                  <div className="h-10 w-10 rounded-full bg-[#895af6]/10 flex items-center justify-center">
                    <Globe className="w-5 h-5 text-[#895af6]" />
                  </div>
                </div>
              )}
              <div className="bg-[#151022] p-4 rounded-xl flex items-center justify-between border border-white/5">
                <div>
                  <p className="text-[#a290cb] text-xs font-bold uppercase tracking-wide mb-1">
                    K-Pop Rank
                  </p>
                  <div className="flex items-center gap-2">
                    <span className="text-white text-2xl font-bold">
                      #{rankings.kpop.rank}
                    </span>
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
                      style={{
                        backgroundColor: `${social.color}20`,
                        color: social.color,
                      }}
                    >
                      {social.icon}
                    </div>
                    <span className="text-sm font-medium text-white">
                      {social.name}
                    </span>
                  </div>
                  <ExternalLink className="w-4 h-4 text-[#a290cb] group-hover:translate-x-1 transition-transform" />
                </a>
              ))}
            </div>
          </div>

          {/* Similar Artists */}
          <div className="bg-[#2e2249] rounded-xl p-5 border border-white/5">
            <h3 className="text-white font-bold text-lg mb-4">
              Similar Artists
            </h3>
            <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
              {similar.map((artist, i) => (
                <div
                  key={i}
                  className="flex flex-col items-center gap-2 min-w-[72px]"
                >
                  <div
                    className="h-16 w-16 rounded-full bg-white/5 bg-cover bg-center"
                    style={{ backgroundImage: `url('${artist.imageUrl}')` }}
                  />
                  <span className="text-xs text-[#a290cb] text-center truncate w-full">
                    {artist.name}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </MobileDrawer>
    </>
  )
}
