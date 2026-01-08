'use client'

import Link from 'next/link'
import BentoHero from './landing/BentoHero'
import BentoPhotocardCarousel from './landing/BentoPhotocardCarousel'
import BentoBadgeShowcase from './landing/BentoBadgeShowcase'
import BentoLoreQuests from './landing/BentoLoreQuests'
import BentoStats from './landing/BentoStats'
import BentoTierSystem from './landing/BentoTierSystem'
import BentoDailyStreaks from './landing/BentoDailyStreaks'
import BentoLeaderboard from './landing/BentoLeaderboard'
import BentoCommunity from './landing/BentoCommunity'
import BentoCrafting from './landing/BentoCrafting'
import BentoFinalCTA from './landing/BentoFinalCTA'

export default function BoralandLanding() {
  return (
    <div className="min-h-screen bg-background-deep text-white font-body overflow-x-hidden selection:bg-primary selection:text-background-dark">
      {/* Ambient Background Effects */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        {/* Primary glow */}
        <div className="absolute top-[-10%] left-[-5%] w-[400px] md:w-[600px] h-[400px] md:h-[600px] bg-primary/15 rounded-full blur-[100px] md:blur-[120px]" />
        {/* Secondary glow */}
        <div className="absolute bottom-[-10%] right-[-5%] w-[400px] md:w-[600px] h-[400px] md:h-[600px] bg-accent-green/10 rounded-full blur-[100px] md:blur-[120px]" />
        {/* Grid pattern */}
        <div className="absolute inset-0 bg-grid-pattern opacity-[0.03]" />
      </div>

      {/* Navigation */}
      {/* Main Content */}
      <main className="relative w-full max-w-[1400px] mx-auto p-3 md:p-4 lg:p-6 pt-16 sm:pt-20 md:pt-24 pb-6 md:pb-12">
        {/* Bento Grid Layout */}
        <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-6 gap-2 md:gap-3 lg:gap-4 auto-rows-[minmax(140px,auto)] md:auto-rows-[minmax(160px,auto)]">

          {/* Hero Section - Spans 4 columns, 2 rows */}
          <BentoHero />

          {/* Photocard Carousel - Spans 2 columns, 1 row */}
          <BentoPhotocardCarousel />

          {/* Badge Showcase - Spans 2 columns, 1 row */}
          <BentoBadgeShowcase />

          {/* Lore Quests - Spans 3 columns, 1 row */}
          <BentoLoreQuests />

          {/* Stats - Spans 3 columns, 1 row */}
          <BentoStats />

          {/* Tier System - Spans 2 columns, 2 rows */}
          <BentoTierSystem />

          {/* Daily Streaks - Spans 2 columns, 1 row */}
          <BentoDailyStreaks />

          {/* Leaderboard - Spans 2 columns, 1 row */}
          <BentoLeaderboard />

          {/* Community/Quests - Spans 2 columns, 1 row */}
          <BentoCommunity />

          {/* Crafting - Spans 2 columns, 1 row */}
          <BentoCrafting />

          {/* Final CTA - Spans full width, 2 rows */}
          <BentoFinalCTA />

        </div>
      </main>

      {/* Footer */}
      <footer className="mt-8 md:mt-12 border-t border-white/5 pt-6 md:pt-8">
        <div className="max-w-[1400px] mx-auto px-3 md:px-4 lg:px-6 flex flex-col md:flex-row justify-between items-center text-gray-500 text-xs md:text-sm font-body gap-4">
          <p>© 2024 Boraland. Unofficial Fan Project. Not affiliated with HYBE/BTS.</p>
          <div className="flex gap-4 md:gap-6">
            <Link href="/privacy" className="hover:text-white transition-colors">
              Privacy Policy
            </Link>
            <Link href="/terms" className="hover:text-white transition-colors">
              Terms of Service
            </Link>
            <a
              href="https://github.com/armyverse/armyverse"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-white transition-colors"
            >
              GitHub
            </a>
          </div>
        </div>
      </footer>
    </div>
  )
}
