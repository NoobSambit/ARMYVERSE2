'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { 
  Play, Trophy, Sparkles, Gift, TrendingUp, CheckCircle, ArrowRight, 
  Zap, Star, Award, Target, Users, Crown, Gem, Heart, ChevronRight,
  Gamepad2, Swords, BarChart3, Clock
} from 'lucide-react'
import QuizScreen from './QuizScreen'

interface PhotocardPreview {
  publicId: string
  rarity: 'common' | 'rare' | 'epic' | 'legendary'
  member: string
  era: string
  set: string
  imageUrl: string
  isLimited: boolean
}

const rarityConfig = {
  common: {
    gradient: 'from-slate-400 via-slate-300 to-slate-400',
    borderGlow: 'shadow-[0_0_20px_rgba(148,163,184,0.3)]',
    textColor: 'text-slate-300',
    bgGlow: 'bg-slate-400/10',
    chance: '70%',
    description: 'Your starting collection'
  },
  rare: {
    gradient: 'from-blue-400 via-cyan-300 to-blue-500',
    borderGlow: 'shadow-[0_0_25px_rgba(96,165,250,0.4)]',
    textColor: 'text-blue-300',
    bgGlow: 'bg-blue-400/10',
    chance: '22%',
    description: 'Notable moments captured'
  },
  epic: {
    gradient: 'from-purple-400 via-fuchsia-400 to-purple-500',
    borderGlow: 'shadow-[0_0_30px_rgba(192,132,252,0.5)]',
    textColor: 'text-fuchsia-300',
    bgGlow: 'bg-purple-400/10',
    chance: '7%',
    description: 'Iconic era-defining cards'
  },
  legendary: {
    gradient: 'from-amber-300 via-yellow-200 to-amber-400',
    borderGlow: 'shadow-[0_0_40px_rgba(251,191,36,0.6)]',
    textColor: 'text-amber-200',
    bgGlow: 'bg-amber-400/10',
    chance: '1%',
    description: 'Ultra-rare masterpieces'
  }
}

export default function BoraverseLanding() {
  const [demoMode, setDemoMode] = useState(false)
  const [photocards, setPhotocards] = useState<PhotocardPreview[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Fetch real photocards from the API
    fetch('/api/game/photocards/preview')
      .then(res => res.json())
      .then(data => {
        if (data.cards && data.cards.length > 0) {
          setPhotocards(data.cards)
        }
        setLoading(false)
      })
      .catch(err => {
        console.error('Failed to fetch preview cards:', err)
        setLoading(false)
      })
  }, [])

  const gameFeatures = [
    {
      icon: Gamepad2,
      title: 'Quiz Gameplay',
      description: 'Answer 10 challenging questions about BTS - from debut era to present day',
      color: 'from-purple-400 to-fuchsia-400'
    },
    {
      icon: Sparkles,
      title: 'Earn Photocards',
      description: 'Each quiz rewards you with digital photocards based on your performance',
      color: 'from-blue-400 to-cyan-400'
    },
    {
      icon: Swords,
      title: 'Craft & Upgrade',
      description: 'Combine duplicate cards to craft higher rarity photocards',
      color: 'from-amber-400 to-orange-400'
    },
    {
      icon: Trophy,
      title: 'Weekly Leaderboards',
      description: 'Compete with ARMYs worldwide and claim exclusive rewards',
      color: 'from-pink-400 to-rose-400'
    },
    {
      icon: Target,
      title: 'Complete Quests',
      description: 'Special challenges for bonus XP, rare cards, and achievements',
      color: 'from-green-400 to-emerald-400'
    },
    {
      icon: BarChart3,
      title: 'Mastery System',
      description: 'Level up your knowledge in specific eras and member categories',
      color: 'from-indigo-400 to-violet-400'
    }
  ]

  const rarityBreakdown = [
    { rarity: 'legendary', label: 'Legendary', ...rarityConfig.legendary },
    { rarity: 'epic', label: 'Epic', ...rarityConfig.epic },
    { rarity: 'rare', label: 'Rare', ...rarityConfig.rare },
    { rarity: 'common', label: 'Common', ...rarityConfig.common }
  ] as const

  // Get sample cards for each rarity to display
  const getSampleCardsByRarity = (rarity: string, count: number) => {
    return photocards.filter(c => c.rarity === rarity).slice(0, count)
  }

  if (demoMode) {
    return (
      <div className="min-h-screen page-gradient">
        <div className="sticky top-0 z-20 bg-black/30 backdrop-blur-xl border-b border-white/10">
          <div className="max-w-7xl mx-auto px-4 py-3">
            <div className="flex items-center justify-between">
              <div className="text-xl font-bold bg-gradient-to-r from-fuchsia-400 via-purple-400 to-rose-400 bg-clip-text text-transparent">
                Boraverse Demo
              </div>
              <button
                onClick={() => setDemoMode(false)}
                className="btn-glass-secondary"
              >
                <ArrowRight className="w-4 h-4 rotate-180" />
                Back
              </button>
            </div>
          </div>
        </div>
        <QuizScreen demoMode={true} onExit={() => setDemoMode(false)} />
      </div>
    )
  }

  return (
    <div className="min-h-screen page-gradient relative overflow-hidden">
      {/* Aurora Background Effects */}
      <div className="aurora-container absolute inset-0 pointer-events-none">
        <div className="aurora-glow aurora-glow-1" />
        <div className="aurora-glow aurora-glow-2" />
        <div className="aurora-glow aurora-glow-3" />
      </div>

      {/* Hero Section */}
      <section className="relative px-4 py-12 md:py-20">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12 md:mb-16">
            {/* Title with Premium Styling */}
            <div className="inline-flex items-center gap-3 mb-6 px-4 py-2 rounded-full border border-fuchsia-400/20 bg-fuchsia-400/5 backdrop-blur-sm">
              <Star className="w-5 h-5 text-fuchsia-400 animate-pulse" />
              <span className="text-sm font-medium text-fuchsia-300">The Ultimate BTS Knowledge Game</span>
            </div>
            
            <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold mb-6 relative">
              <span className="bg-gradient-to-r from-fuchsia-400 via-purple-400 to-rose-400 bg-clip-text text-transparent animate-fade-up">
                Boraverse
              </span>
            </h1>
            
            <p className="text-lg md:text-xl lg:text-2xl text-white/80 mb-4 max-w-3xl mx-auto font-light leading-relaxed">
              Test your BTS knowledge through challenging quizzes and build your ultimate photocard collection
            </p>
            
            <p className="text-sm md:text-base text-white/60 mb-10 max-w-2xl mx-auto">
              Compete globally • Earn rewards • Collect rare photocards • Master BTS history
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16">
              <Link
                href="/auth/signin"
                className="group relative px-8 py-4 rounded-2xl bg-gradient-to-r from-[#FF9AD5] via-[#C084FC] to-[#A274FF] text-white font-semibold text-lg shadow-[0_20px_50px_rgba(192,132,252,0.3)] hover:shadow-[0_25px_60px_rgba(192,132,252,0.4)] hover:-translate-y-0.5 transition-all duration-300 flex items-center gap-2"
              >
                <Trophy className="w-5 h-5 group-hover:scale-110 transition-transform" />
                Start Playing Now
                <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <button
                onClick={() => setDemoMode(true)}
                className="group px-8 py-4 rounded-2xl border border-white/20 bg-white/5 backdrop-blur-md text-white font-semibold text-lg hover:bg-white/10 hover:border-white/30 transition-all duration-300 flex items-center gap-2"
              >
                <Play className="w-5 h-5 group-hover:scale-110 transition-transform" />
                Try Demo Mode
              </button>
            </div>
          </div>

          {/* Photocard Preview Gallery */}
          {!loading && photocards.length > 0 && (
            <div className="mb-16">
              <div className="text-center mb-8">
                <h3 className="text-2xl md:text-3xl font-bold text-white mb-2">Collect Stunning Photocards</h3>
                <p className="text-white/70">Each quiz earns you beautiful digital cards from across BTS history</p>
              </div>
              
              <div className="relative">
                <div className="flex gap-3 md:gap-4 overflow-x-auto pb-6 px-2 scrollbar-hide snap-x snap-mandatory">
                  {photocards.slice(0, 12).map((card, index) => (
                    <div
                      key={index}
                      className="group relative flex-shrink-0 snap-start"
                      style={{ animationDelay: `${index * 50}ms` }}
                    >
                      <div className={`relative w-32 h-44 md:w-40 md:h-56 rounded-xl overflow-hidden border-2 transition-all duration-300 hover:scale-105 hover:-translate-y-2 ${rarityConfig[card.rarity].borderGlow}`}>
                        <div className={`absolute inset-0 bg-gradient-to-br ${rarityConfig[card.rarity].gradient} opacity-20`} />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                        
                        {card.imageUrl && (
                          <Image
                            src={card.imageUrl}
                            alt={`${card.member} - ${card.era}`}
                            fill
                            className="object-cover"
                            sizes="(max-width: 768px) 128px, 160px"
                          />
                        )}
                        
                        {/* Card Info Overlay */}
                        <div className="absolute bottom-0 left-0 right-0 p-2 md:p-3 bg-gradient-to-t from-black/90 via-black/70 to-transparent">
                          <div className={`text-xs font-bold uppercase tracking-wider mb-1 ${rarityConfig[card.rarity].textColor}`}>
                            {card.rarity}
                          </div>
                          <div className="text-white font-semibold text-sm truncate">{card.member}</div>
                          <div className="text-white/70 text-xs truncate">{card.era}</div>
                        </div>
                        
                        {/* Rarity Badge */}
                        <div className={`absolute top-2 right-2 px-2 py-1 rounded-full backdrop-blur-md border ${rarityConfig[card.rarity].bgGlow} border-white/20 flex items-center gap-1`}>
                          {card.rarity === 'legendary' && <Crown className="w-3 h-3 text-amber-300" />}
                          {card.rarity === 'epic' && <Gem className="w-3 h-3 text-purple-300" />}
                          {card.rarity === 'rare' && <Star className="w-3 h-3 text-blue-300" />}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                
                {/* Gradient fade edges */}
                <div className="absolute left-0 top-0 bottom-6 w-12 bg-gradient-to-r from-[#0f0b16] to-transparent pointer-events-none" />
                <div className="absolute right-0 top-0 bottom-6 w-12 bg-gradient-to-l from-[#0f0b16] to-transparent pointer-events-none" />
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Game Features Section */}
      <section className="relative px-4 py-16 md:py-20">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4">
              How It Works
            </h2>
            <p className="text-lg text-white/70 max-w-2xl mx-auto">
              Six powerful ways to engage, collect, and compete in the Boraverse
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            {gameFeatures.map((feature, index) => (
              <div
                key={index}
                className="group relative container-glass rounded-2xl p-6 hover:bg-white/10 transition-all duration-300 hover:-translate-y-1"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                {/* Icon with gradient background */}
                <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300 shadow-lg`}>
                  <feature.icon className="w-7 h-7 text-white" />
                </div>
                
                <h3 className="text-xl font-bold text-white mb-2 group-hover:text-fuchsia-300 transition-colors">
                  {feature.title}
                </h3>
                <p className="text-white/70 text-sm leading-relaxed">
                  {feature.description}
                </p>
                
                {/* Hover indicator */}
                <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                  <ChevronRight className="w-5 h-5 text-fuchsia-400" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Rarity System Section */}
      <section className="relative px-4 py-16 md:py-20">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 mb-4 px-4 py-2 rounded-full border border-amber-400/20 bg-amber-400/5 backdrop-blur-sm">
              <Crown className="w-5 h-5 text-amber-400" />
              <span className="text-sm font-medium text-amber-300">Collect Them All</span>
            </div>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4">
              Rarity System
            </h2>
            <p className="text-lg text-white/70 max-w-2xl mx-auto">
              Every card has a rarity tier. Higher scores unlock better drop rates.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            {rarityBreakdown.map((item, index) => (
              <div
                key={item.rarity}
                className="relative container-glass rounded-2xl p-6 overflow-hidden group hover:scale-105 transition-all duration-300"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                {/* Gradient background overlay */}
                <div className={`absolute inset-0 bg-gradient-to-br ${item.gradient} opacity-5 group-hover:opacity-10 transition-opacity`} />
                
                {/* Rarity icon */}
                <div className="relative mb-4">
                  {item.rarity === 'legendary' && (
                    <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${item.gradient} flex items-center justify-center ${item.borderGlow}`}>
                      <Crown className="w-8 h-8 text-white" />
                    </div>
                  )}
                  {item.rarity === 'epic' && (
                    <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${item.gradient} flex items-center justify-center ${item.borderGlow}`}>
                      <Gem className="w-8 h-8 text-white" />
                    </div>
                  )}
                  {item.rarity === 'rare' && (
                    <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${item.gradient} flex items-center justify-center ${item.borderGlow}`}>
                      <Star className="w-8 h-8 text-white" />
                    </div>
                  )}
                  {item.rarity === 'common' && (
                    <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${item.gradient} flex items-center justify-center ${item.borderGlow}`}>
                      <Heart className="w-8 h-8 text-white" />
                    </div>
                  )}
                </div>
                
                <div className="relative">
                  <h3 className={`text-2xl font-bold mb-1 ${item.textColor}`}>
                    {item.label}
                  </h3>
                  <div className="flex items-center gap-2 mb-3">
                    <div className={`px-3 py-1 rounded-full ${item.bgGlow} border border-white/10 text-sm font-semibold ${item.textColor}`}>
                      {item.chance} Drop Rate
                    </div>
                  </div>
                  <p className="text-white/70 text-sm">
                    {item.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
          
          {/* Rarity explanation */}
          <div className="mt-12 container-glass rounded-2xl p-6 md:p-8 max-w-4xl mx-auto">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-gradient-to-br from-purple-400 to-fuchsia-400 flex items-center justify-center">
                <Zap className="w-6 h-6 text-white" />
              </div>
              <div>
                <h4 className="text-xl font-bold text-white mb-2">Performance-Based Drops</h4>
                <p className="text-white/70 text-sm md:text-base leading-relaxed">
                  The better you perform in quizzes, the higher your chances of earning rare and legendary photocards. 
                  Answer difficult questions correctly to boost your XP and unlock premium rewards. Every perfect score brings you closer to that legendary card!
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Reward Mechanisms Section */}
      <section className="relative px-4 py-16 md:py-20">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4">
              Rewards & Progression
            </h2>
            <p className="text-lg text-white/70 max-w-2xl mx-auto">
              Multiple ways to earn, upgrade, and expand your collection
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">
            {/* XP & Levels */}
            <div className="container-glass rounded-2xl p-6 md:p-8 group hover:bg-white/10 transition-all">
              <div className="flex items-start gap-4 mb-4">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center flex-shrink-0 shadow-lg">
                  <TrendingUp className="w-7 h-7 text-white" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-white mb-1">XP & Level System</h3>
                  <p className="text-white/60 text-sm">Progress through ranks</p>
                </div>
              </div>
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                  <span className="text-white/80 text-sm">Earn XP for correct answers (5-20 XP per question)</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                  <span className="text-white/80 text-sm">Difficult questions award bonus XP</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                  <span className="text-white/80 text-sm">Level up to unlock new features and rewards</span>
                </li>
              </ul>
            </div>

            {/* Crafting System */}
            <div className="container-glass rounded-2xl p-6 md:p-8 group hover:bg-white/10 transition-all">
              <div className="flex items-start gap-4 mb-4">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center flex-shrink-0 shadow-lg">
                  <Swords className="w-7 h-7 text-white" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-white mb-1">Crafting System</h3>
                  <p className="text-white/60 text-sm">Upgrade your collection</p>
                </div>
              </div>
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
                  <span className="text-white/80 text-sm">Combine duplicates into Stardust currency</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
                  <span className="text-white/80 text-sm">Use Stardust to craft specific rare cards</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
                  <span className="text-white/80 text-sm">Strategic collection management pays off</span>
                </li>
              </ul>
            </div>

            {/* Quests & Achievements */}
            <div className="container-glass rounded-2xl p-6 md:p-8 group hover:bg-white/10 transition-all">
              <div className="flex items-start gap-4 mb-4">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-400 to-fuchsia-500 flex items-center justify-center flex-shrink-0 shadow-lg">
                  <Target className="w-7 h-7 text-white" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-white mb-1">Quests & Challenges</h3>
                  <p className="text-white/60 text-sm">Daily and weekly goals</p>
                </div>
              </div>
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-purple-400 flex-shrink-0 mt-0.5" />
                  <span className="text-white/80 text-sm">Complete daily quests for bonus rewards</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-purple-400 flex-shrink-0 mt-0.5" />
                  <span className="text-white/80 text-sm">Unlock achievements for major milestones</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-purple-400 flex-shrink-0 mt-0.5" />
                  <span className="text-white/80 text-sm">Special event quests with exclusive cards</span>
                </li>
              </ul>
            </div>

            {/* Leaderboards */}
            <div className="container-glass rounded-2xl p-6 md:p-8 group hover:bg-white/10 transition-all">
              <div className="flex items-start gap-4 mb-4">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-pink-400 to-rose-500 flex items-center justify-center flex-shrink-0 shadow-lg">
                  <Trophy className="w-7 h-7 text-white" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-white mb-1">Global Leaderboards</h3>
                  <p className="text-white/60 text-sm">Compete worldwide</p>
                </div>
              </div>
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-pink-400 flex-shrink-0 mt-0.5" />
                  <span className="text-white/80 text-sm">Weekly leaderboards reset every Monday</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-pink-400 flex-shrink-0 mt-0.5" />
                  <span className="text-white/80 text-sm">Top players earn exclusive legendary cards</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-pink-400 flex-shrink-0 mt-0.5" />
                  <span className="text-white/80 text-sm">Compete with ARMYs from around the world</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="relative px-4 py-16 md:py-24">
        <div className="max-w-5xl mx-auto">
          {/* Main CTA Card */}
          <div className="relative container-glass rounded-3xl p-8 md:p-12 overflow-hidden">
            {/* Gradient background */}
            <div className="absolute inset-0 bg-gradient-to-br from-fuchsia-500/10 via-purple-500/10 to-rose-500/10" />
            
            {/* Content */}
            <div className="relative text-center">
              <div className="inline-flex items-center gap-2 mb-6 px-4 py-2 rounded-full border border-fuchsia-400/30 bg-fuchsia-400/10 backdrop-blur-sm">
                <Users className="w-4 h-4 text-fuchsia-300" />
                <span className="text-sm font-medium text-fuchsia-200">Join thousands of ARMYs playing now</span>
              </div>
              
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4">
                Ready to Start Your Journey?
              </h2>
              <p className="text-lg md:text-xl text-white/70 mb-8 max-w-2xl mx-auto">
                Test your knowledge, build your collection, and compete with ARMYs worldwide. No downloads, no waiting.
              </p>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-8">
                <Link
                  href="/auth/signin"
                  className="group w-full sm:w-auto px-8 py-4 rounded-2xl bg-gradient-to-r from-[#FF9AD5] via-[#C084FC] to-[#A274FF] text-white font-semibold text-lg shadow-[0_20px_50px_rgba(192,132,252,0.3)] hover:shadow-[0_25px_60px_rgba(192,132,252,0.4)] hover:-translate-y-0.5 transition-all duration-300 flex items-center justify-center gap-2"
                >
                  <Award className="w-5 h-5 group-hover:scale-110 transition-transform" />
                  Create Free Account
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Link>
                <button
                  onClick={() => setDemoMode(true)}
                  className="group w-full sm:w-auto px-8 py-4 rounded-2xl border border-white/20 bg-white/5 backdrop-blur-md text-white font-semibold text-lg hover:bg-white/10 hover:border-white/30 transition-all duration-300 flex items-center justify-center gap-2"
                >
                  <Play className="w-5 h-5 group-hover:scale-110 transition-transform" />
                  Play Demo Now
                </button>
              </div>

              {/* Trust Indicators */}
              <div className="flex flex-wrap justify-center gap-6 md:gap-8 pt-8 border-t border-white/10">
                <div className="flex items-center gap-2 text-white/70">
                  <CheckCircle className="w-5 h-5 text-green-400" />
                  <span className="text-sm font-medium">100% Free</span>
                </div>
                <div className="flex items-center gap-2 text-white/70">
                  <CheckCircle className="w-5 h-5 text-green-400" />
                  <span className="text-sm font-medium">No Download</span>
                </div>
                <div className="flex items-center gap-2 text-white/70">
                  <CheckCircle className="w-5 h-5 text-green-400" />
                  <span className="text-sm font-medium">Mobile Friendly</span>
                </div>
                <div className="flex items-center gap-2 text-white/70">
                  <CheckCircle className="w-5 h-5 text-green-400" />
                  <span className="text-sm font-medium">Play Anywhere</span>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
            <div className="container-glass rounded-xl p-4 text-center">
              <div className="text-2xl md:text-3xl font-bold text-fuchsia-400 mb-1">10</div>
              <div className="text-xs md:text-sm text-white/60">Questions per Quiz</div>
            </div>
            <div className="container-glass rounded-xl p-4 text-center">
              <div className="text-2xl md:text-3xl font-bold text-purple-400 mb-1">100+</div>
              <div className="text-xs md:text-sm text-white/60">Unique Photocards</div>
            </div>
            <div className="container-glass rounded-xl p-4 text-center">
              <div className="text-2xl md:text-3xl font-bold text-blue-400 mb-1">4</div>
              <div className="text-xs md:text-sm text-white/60">Rarity Tiers</div>
            </div>
            <div className="container-glass rounded-xl p-4 text-center">
              <div className="text-2xl md:text-3xl font-bold text-rose-400 mb-1">∞</div>
              <div className="text-xs md:text-sm text-white/60">Fun & Learning</div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
