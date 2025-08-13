'use client'

import React from 'react'
import Image from 'next/image'
import { TrendingUp, Sparkles } from 'lucide-react'

export default function Hero() {
  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId)
    element?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <section className="relative overflow-hidden pt-10 sm:pt-14 pb-12 sm:pb-24">
      {/* Background gradient accents */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute -top-24 right-[-10%] w-[40rem] h-[40rem] bg-[#A274FF]/20 blur-[120px] rounded-full" />
        <div className="absolute -bottom-24 left-[-10%] w-[36rem] h-[36rem] bg-[#FF9AD5]/20 blur-[120px] rounded-full" />
      </div>

      <div className="relative z-10 mx-auto max-w-6xl px-4">
        {/* Centered logo */}
        <div className="flex items-center justify-center">
          <div className="relative w-[84%] sm:w-[72%] md:w-[66%] lg:w-[54%] aspect-square">
            <Image
              src="https://res.cloudinary.com/dacgtjw7w/image/upload/v1755014757/ChatGPT_Image_Aug_12_2025_09_28_26_PM_rewlxg.png"
              alt="ARMYVERSE logo"
              fill
              priority
              sizes="(max-width: 640px) 70vw, (max-width: 1024px) 55vw, 45vw"
              className="object-contain opacity-90 drop-shadow-[0_0_30px_rgba(162,116,255,0.35)]"
            />
          </div>
        </div>

        {/* Overlay card with headline and CTAs */}
        <div className="relative z-20 mx-auto -mt-24 sm:-mt-28 md:-mt-32 lg:-mt-40 max-w-3xl rounded-3xl bg-black/30 backdrop-blur-md border border-white/10 shadow-xl p-6 sm:p-8 text-center">
          <h1 className="text-4xl sm:text-5xl font-semibold tracking-tight text-white">ARMYVERSE</h1>
          <p className="mt-2 text-base sm:text-lg text-white/80">Where Streaming Meets Passion</p>

          <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              onClick={() => scrollToSection('trending')}
              className="inline-flex items-center px-6 py-3 rounded-full bg-gradient-to-r from-[#FF9AD5] to-[#A274FF] text-white shadow-lg hover:scale-105 transition-transform focus:outline-none focus-visible:ring-2 focus-visible:ring-[#C084FC]"
              aria-label="Explore Trending"
            >
              <TrendingUp className="w-5 h-5 mr-2" />
              Explore Trending
            </button>
            <a
              href="/create-playlist"
              className="inline-flex items-center px-6 py-3 rounded-full border border-white/20 text-white/90 hover:text-white bg-white/0 hover:bg-white/10 transition-colors"
              aria-label="Create Playlists"
            >
              <Sparkles className="w-5 h-5 mr-2" />
              Create Playlists
            </a>
          </div>

          <div className="mt-5 flex flex-wrap items-center justify-center gap-2 text-xs sm:text-sm">
            <span className="px-3 py-1 rounded-full bg-white/6 border border-white/10 text-white/80">BTS + Solo Trends</span>
            <span className="px-3 py-1 rounded-full bg-white/6 border border-white/10 text-white/80">AI Playlist</span>
            <span className="px-3 py-1 rounded-full bg-white/6 border border-white/10 text-white/80">Spotify Analytics</span>
          </div>
        </div>
      </div>
    </section>
  )
}