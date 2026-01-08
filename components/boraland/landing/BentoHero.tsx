'use client'

import Link from 'next/link'
import React from 'react'

export default function BentoHero() {

  return (
    <div className="bento-card col-span-1 md:col-span-4 lg:col-span-4 row-span-2 rounded-2xl p-5 sm:p-6 md:p-8 flex flex-col justify-between relative overflow-hidden group min-h-[320px] sm:min-h-[360px] md:min-h-[400px]">
      {/* Background Image with Gradient Overlay */}
      <div className="absolute inset-0 z-0 opacity-30 bg-gradient-to-br from-purple-900/50 via-fuchsia-900/50 to-background-dark transition-transform duration-700 group-hover:scale-105" />
      <div className="absolute inset-0 bg-gradient-to-t from-background-dark via-background-dark/80 to-transparent z-10" />

      {/* Online Players Badge */}
      <div className="relative z-20 flex justify-between items-start w-full">
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-accent-green/20 border border-accent-green/30 backdrop-blur-sm">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent-green opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-accent-green"></span>
          </span>
          <span className="text-xs font-semibold text-accent-green font-display tracking-wide">
            DAILY + WEEKLY QUESTS
          </span>
        </div>
      </div>

      {/* Hero Content */}
      <div className="relative z-20 mt-auto max-w-2xl">
        <h1 className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-black tracking-tight leading-[0.95] text-white mb-3 sm:mb-4 font-display">
          INITIATE{' '}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent-green">
            BORALAND
          </span>
        </h1>
        <p className="text-sm sm:text-base md:text-lg lg:text-xl text-gray-300 mb-5 sm:mb-6 md:mb-8 max-w-xl font-body font-medium leading-relaxed">
          Take 10-question BTS quizzes, earn performance-based photocard drops, and chase weekly leaderboard rewards.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-wrap gap-3 md:gap-4">
          <Link
            href="/auth/signin"
            className="bg-primary hover:bg-primary/90 text-background-dark h-11 sm:h-12 px-5 sm:px-6 md:px-8 rounded-full font-bold text-sm md:text-base transition-all flex items-center gap-2 group/btn font-display shadow-lg shadow-primary/20 hover:shadow-primary/40"
          >
            Join the ARMYVERSE
            <svg className="w-5 h-5 group-hover/btn:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </Link>
          <Link
            href="/boraland/play"
            className="bg-white/10 hover:bg-white/20 backdrop-blur-md text-white border border-white/10 h-11 sm:h-12 px-4 sm:px-5 md:px-6 rounded-full font-bold text-sm md:text-base transition-all flex items-center gap-2 font-display"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z" />
            </svg>
            Try a Quiz
          </Link>
        </div>
      </div>
    </div>
  )
}
