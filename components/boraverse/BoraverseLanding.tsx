'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Play, Trophy, Sparkles, Gift, TrendingUp, CheckCircle, ArrowRight } from 'lucide-react'
import QuizScreen from './QuizScreen'

interface PreviewCard {
  publicId: string
  rarity: string
  member: string
  era: string
  set: string
}

const rarityColors = {
  common: 'from-slate-300 to-slate-400',
  rare: 'from-sky-400 to-sky-500',
  epic: 'from-fuchsia-400 to-fuchsia-500',
  legendary: 'from-amber-400 to-amber-500'
}

const rarityGlows = {
  common: 'shadow-slate-300/20',
  rare: 'shadow-sky-400/30',
  epic: 'shadow-fuchsia-400/40',
  legendary: 'shadow-amber-400/50'
}

export default function BoraverseLanding() {
  const [demoMode, setDemoMode] = useState(false)

  // Mock preview cards for the preview strip
  const mockPreviewCards: PreviewCard[] = [
    { publicId: 'armyverse/photocards/jungkook-era1-rare', rarity: 'rare', member: 'Jungkook', era: 'DARK&WILD', set: 'BTS' },
    { publicId: 'armyverse/photocards/jimin-era2-epic', rarity: 'epic', member: 'Jimin', era: 'WINGS', set: 'BTS' },
    { publicId: 'armyverse/photocards/v-era3-legendary', rarity: 'legendary', member: 'V', era: 'LOVE YOURSELF', set: 'BTS' },
    { publicId: 'armyverse/photocards/rm-era1-common', rarity: 'common', member: 'RM', era: '2 COOL 4 SKOOL', set: 'BTS' },
    { publicId: 'armyverse/photocards/jin-era2-rare', rarity: 'rare', member: 'Jin', era: 'WINGS', set: 'BTS' },
    { publicId: 'armyverse/photocards/suga-era3-epic', rarity: 'epic', member: 'Suga', era: 'LOVE YOURSELF', set: 'BTS' },
    { publicId: 'armyverse/photocards/j-hope-era1-common', rarity: 'common', member: 'J-Hope', era: 'DARK&WILD', set: 'BTS' }
  ]

  const features = [
    {
      icon: Trophy,
      title: 'Test Your Knowledge',
      description: 'Answer challenging questions about BTS members, songs, and history'
    },
    {
      icon: Sparkles,
      title: 'Collect Rare Photocards',
      description: 'Earn beautiful digital photocards with different rarities and designs'
    },
    {
      icon: TrendingUp,
      title: 'Climb the Leaderboard',
      description: 'Compete with ARMYs worldwide and show off your BTS expertise'
    },
    {
      icon: Gift,
      title: 'Complete Quests',
      description: 'Unlock achievements and earn bonus rewards through special challenges'
    }
  ]

  const steps = [
    {
      step: '1',
      title: 'Sign In & Play',
      description: 'Connect with your ARMYVERSE account to start collecting'
    },
    {
      step: '2',
      title: 'Answer Questions',
      description: 'Test your BTS knowledge across all eras and members'
    },
    {
      step: '3',
      title: 'Collect Rewards',
      description: 'Earn photocards, climb leaderboards, and complete achievements'
    }
  ]

  if (demoMode) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <div className="sticky top-0 z-20 bg-black/20 backdrop-blur-md border-b border-white/10">
          <div className="max-w-7xl mx-auto px-4 py-3">
            <div className="flex items-center justify-between">
              <Link href="/boraverse" className="text-xl font-bold bg-gradient-to-r from-fuchsia-400 to-rose-400 bg-clip-text text-transparent">
                Boraverse
              </Link>
              <button
                onClick={() => setDemoMode(false)}
                className="px-4 py-2 rounded-xl border border-white/20 bg-white/5 text-white/80 hover:bg-white/10 transition-colors"
              >
                ← Back to Landing
              </button>
            </div>
          </div>
        </div>
        <QuizScreen demoMode={true} onExit={() => setDemoMode(false)} />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Hero Section */}
      <section className="relative px-4 py-16 md:py-24">
        <div className="max-w-7xl mx-auto text-center">
          <div className="mb-8">
            <h1 className="text-5xl md:text-7xl font-bold bg-gradient-to-r from-fuchsia-400 via-rose-400 to-purple-400 bg-clip-text text-transparent mb-6">
              Boraverse
              <div className="inline-block ml-4 w-16 h-16 bg-gradient-to-r from-fuchsia-400 to-purple-400 rounded-full opacity-20 animate-pulse"></div>
            </h1>
            <p className="text-xl md:text-2xl text-white/80 mb-8 max-w-3xl mx-auto">
              Test your BTS knowledge. Collect beautiful photocards. Compete with ARMYs worldwide.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
            <Link
              href="/auth/signin"
              className="px-8 py-4 rounded-2xl bg-gradient-to-r from-[#FF9AD5] to-[#C084FC] text-black font-semibold text-lg shadow-[0_10px_30px_rgba(129,0,255,0.15)] hover:translate-y-0.5 transition-all duration-200 flex items-center gap-2"
            >
              Sign In & Play
              <ArrowRight className="w-5 h-5" />
            </Link>
            <button
              onClick={() => setDemoMode(true)}
              className="px-8 py-4 rounded-2xl border border-[#3b1a52]/60 bg-white/5 backdrop-blur-md text-white font-semibold text-lg hover:bg-white/10 transition-all duration-200 flex items-center gap-2"
            >
              <Play className="w-5 h-5" />
              Play Demo
            </button>
          </div>

          {/* Preview Strip */}
          <div className="mb-16">
            <h3 className="text-2xl font-semibold text-white/90 mb-6">Sample Collection</h3>
            <div className="flex gap-4 overflow-x-auto pb-4 px-2 scrollbar-hide">
              {mockPreviewCards.map((card, index) => (
                <div
                  key={index}
                  className={`relative flex-shrink-0 w-20 h-28 rounded-xl bg-gradient-to-br ${rarityColors[card.rarity as keyof typeof rarityColors]} ${rarityGlows[card.rarity as keyof typeof rarityGlows]} shadow-lg hover:scale-105 transition-transform duration-200`}
                >
                  <div className="absolute inset-1 rounded-lg bg-black/20 flex items-center justify-center">
                    <div className="text-xs text-white font-medium text-center">
                      <div>{card.member}</div>
                      <div className="text-white/70">{card.rarity}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="px-4 py-16">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-white text-center mb-12">
            How Boraverse Works
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <div
                key={index}
                className="rounded-2xl border border-[#3b1a52]/60 bg-white/5 backdrop-blur-md p-6 hover:bg-white/10 transition-colors"
              >
                <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-fuchsia-400 to-purple-400 flex items-center justify-center mb-4">
                  <feature.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">{feature.title}</h3>
                <p className="text-white/70">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="px-4 py-16">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-white text-center mb-12">
            Get Started in 3 Easy Steps
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {steps.map((step, index) => (
              <div key={index} className="text-center">
                <div className="w-16 h-16 rounded-full bg-gradient-to-r from-fuchsia-400 to-purple-400 flex items-center justify-center mx-auto mb-4 text-2xl font-bold text-white">
                  {step.step}
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">{step.title}</h3>
                <p className="text-white/70">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Trust & Footer CTA */}
      <section className="px-4 py-16">
        <div className="max-w-4xl mx-auto text-center">
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-white mb-4">
              Ready to Join the Boraverse?
            </h2>
            <p className="text-white/70 mb-8">
              Start your collection today. No downloads required — play directly in your browser.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/auth/signin"
              className="px-8 py-4 rounded-2xl bg-gradient-to-r from-[#FF9AD5] to-[#C084FC] text-black font-semibold text-lg shadow-[0_10px_30px_rgba(129,0,255,0.15)] hover:translate-y-0.5 transition-all duration-200"
            >
              Create Account & Start Playing
            </Link>
            <button
              onClick={() => setDemoMode(true)}
              className="px-8 py-4 rounded-2xl border border-[#3b1a52]/60 bg-white/5 backdrop-blur-md text-white font-semibold text-lg hover:bg-white/10 transition-all duration-200"
            >
              Try Demo (No Login Required)
            </button>
          </div>

          <div className="mt-12 pt-8 border-t border-white/10">
            <div className="flex flex-wrap justify-center gap-8 text-sm text-white/60">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-400" />
                <span>Secure & Private</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-400" />
                <span>Mobile Optimized</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-400" />
                <span>Free to Play</span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
