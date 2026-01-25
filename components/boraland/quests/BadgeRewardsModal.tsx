'use client'

/* eslint-disable @typescript-eslint/no-unused-vars */
import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import Image from 'next/image'
import { getBadgeImagePath, getBadgeRarityColors } from '@/lib/utils/badgeImages'

type Badge = {
  code: string
  name: string
  description?: string
  icon: string
  rarity: 'common' | 'rare' | 'epic' | 'legendary'
  type?: string
  criteria?: {
    streakDays?: number
    streakWeeks?: number
  }
  atStreak?: number
}

type BadgeRewardsModalProps = {
  isOpen: boolean
  onClose: () => void
  dailyMilestoneBadge?: Badge
  weeklyMilestoneBadge?: Badge
  dailyStreak?: { current: number; nextMilestone: number; daysRemaining: number }
  weeklyStreak?: { current: number; nextMilestone: number; weeksRemaining: number }
}

export default function BadgeRewardsModal({
  isOpen,
  onClose,
  dailyStreak,
  weeklyStreak
}: BadgeRewardsModalProps) {
  const [activeTab, setActiveTab] = useState<'daily' | 'weekly'>('daily')
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])

  if (!isOpen || !mounted) return null

  const activeStreak = activeTab === 'daily' ? dailyStreak : weeklyStreak
  const currentStreak = activeStreak?.current || 0
  const cyclePosition = ((currentStreak - 1) % 10) + 1
  const cycleNumber = Math.floor((currentStreak - 1) / 10) + 1

  // Badge data
  const streakBadges = Array.from({ length: 10 }, (_, i) => {
    const num = i + 1
    const code = `${activeTab}_streak_${num}`
    const rarities: ('common' | 'rare' | 'epic' | 'legendary')[] =
      num <= 4 ? ['common', 'common', 'common', 'common'] :
        num <= 7 ? ['rare', 'rare', 'rare'] :
          num <= 9 ? ['epic', 'epic'] : ['legendary']

    const isEarned = currentStreak >= num
    const isCurrent = num === cyclePosition && currentStreak > 0

    return {
      code,
      name: `${activeTab === 'daily' ? 'Day' : 'Week'} ${num}`,
      rarity: rarities[num - 1],
      streakCount: num,
      isEarned,
      isCurrent
    }
  })

  const milestoneBadges = [
    {
      code: `${activeTab}_milestone_1`,
      name: activeTab === 'daily' ? 'Dedicated Devotee' : 'Weekly Warrior',
      rarity: 'epic' as const,
      streakCount: 10,
      description: activeTab === 'daily' ? 'Reach a 10-day streak to unlock this exclusive achievement' : 'Reach a 10-week streak to unlock this exclusive achievement',
      reward: 'Random Photocard'
    },
    {
      code: `${activeTab}_milestone_2`,
      name: activeTab === 'daily' ? 'Persistent Pioneer' : 'Marathon Master',
      rarity: 'epic' as const,
      streakCount: 20,
      description: activeTab === 'daily' ? 'Reach a 20-day streak to unlock this exclusive achievement' : 'Reach a 20-week streak to unlock this exclusive achievement',
      reward: 'Random Photocard'
    },
    {
      code: `${activeTab}_milestone_3`,
      name: activeTab === 'daily' ? 'Consistent Champion' : 'Endurance Elite',
      rarity: 'legendary' as const,
      streakCount: 30,
      description: activeTab === 'daily' ? 'Reach a 30-day streak to unlock this exclusive profile frame' : 'Reach a 30-week streak to unlock this exclusive profile frame',
      reward: 'Random Photocard + Profile Frame'
    },
    {
      code: `${activeTab}_milestone_4`,
      name: activeTab === 'daily' ? 'Legendary Loyalist' : 'Unstoppable Force',
      rarity: 'legendary' as const,
      streakCount: 40,
      description: activeTab === 'daily' ? 'Reach a 40-day streak for elite status' : 'Reach a 40-week streak for elite status',
      reward: 'Bonus Photocard Pack'
    },
    {
      code: `${activeTab}_milestone_5`,
      name: activeTab === 'daily' ? 'Ultimate ARMY' : 'Eternal Devotion',
      rarity: 'legendary' as const,
      streakCount: 50,
      description: activeTab === 'daily' ? 'The ultimate 50-day achievement + exclusive rewards' : 'The ultimate 50-week achievement + exclusive rewards',
      reward: 'Elite Status + Bonus Photocard Pack'
    }
  ]

  const nextRewardDay = cyclePosition < 10 ? cyclePosition + 1 : 10
  const progressToNext = ((cyclePosition) / 10) * 100

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-2 md:p-4 bg-black/80 backdrop-blur-md animate-fade-in" onClick={onClose}>
      <div className="relative w-full max-w-6xl max-h-[95vh] md:h-[90vh] flex flex-col bg-[#0F0B1E] border border-[#302249] rounded-2xl shadow-2xl overflow-hidden" onClick={(e) => e.stopPropagation()}>
        {/* Sticky Header */}
        <div className="shrink-0 bg-[#0F0B1E]/95 backdrop-blur-xl z-20 border-b border-[#302249]">
          {/* Top Bar */}
          <div className="flex items-center justify-between px-3 md:px-6 py-3 md:py-5">
            <div className="flex flex-col gap-0.5 md:gap-1">
              <h1 className="text-white text-lg md:text-2xl font-bold tracking-tight">Badge Rewards</h1>
              <p className="text-gray-400 text-xs md:text-sm hidden sm:block">Track your consistency and earn exclusive Boraland items.</p>
            </div>
            <button
              onClick={onClose}
              className="group relative z-50 p-2 rounded-full hover:bg-white/20 active:bg-white/30 transition-all text-white bg-white/10 shrink-0 cursor-pointer hover:rotate-90"
              aria-label="Close modal"
              title="Close"
            >
              <span className="material-symbols-outlined text-xl md:text-2xl font-bold">close</span>
            </button>
          </div>

          {/* Tabs */}
          <div className="px-3 md:px-6 pb-3 md:pb-4">
            <div className="flex h-10 md:h-12 w-full max-w-md items-center rounded-full bg-[#231b2e] p-0.5 md:p-1 border border-[#302249]">
              <button
                onClick={() => setActiveTab('daily')
                }
                className={`flex h-full grow items-center justify-center rounded-full px-3 md:px-4 text-xs md:text-sm font-semibold transition-all ${activeTab === 'daily'
                  ? 'bg-bora-primary shadow-lg text-white'
                  : 'text-gray-400'
                  }`}
              >
                Daily Streak
              </button >
              <button
                onClick={() => setActiveTab('weekly')}
                className={`flex h-full grow items-center justify-center rounded-full px-3 md:px-4 text-xs md:text-sm font-semibold transition-all ${activeTab === 'weekly'
                  ? 'bg-bora-primary shadow-lg text-white'
                  : 'text-gray-400'
                  }`}
              >
                Weekly Streak
              </button>
            </div >
          </div >
        </div >

        {/* Scrollable Content */}
        < div className="flex-1 overflow-y-auto scrollbar-thin bg-[#0F0B1E] p-3 md:p-6" >
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 md:gap-6 lg:gap-8">
            {/* LEFT COLUMN: Badges & Milestones */}
            <div className="lg:col-span-8 flex flex-col gap-8">
              {/* 10-Day Cycle Section */}
              <div className="flex flex-col gap-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-white text-lg font-bold flex items-center gap-2">
                      <span className="material-symbols-outlined text-bora-primary">cycle</span>
                      10-{activeTab === 'daily' ? 'Day' : 'Week'} Cycle
                    </h2>
                    <p className="text-gray-400 text-xs mt-1">
                      Badges reset every 10 {activeTab === 'daily' ? 'days' : 'weeks'}. Collect them all!
                    </p>
                  </div>
                  <span className="text-xs font-medium text-bora-primary bg-bora-primary/10 px-3 py-1 rounded-full border border-bora-primary/20">
                    Cycle {cycleNumber} Active
                  </span>
                </div>

                {/* Badge Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-3">
                  {streakBadges.map((badge) => (
                    <StreakBadgeCard
                      key={badge.code}
                      badge={badge}
                      type={activeTab}
                    />
                  ))}
                </div>
              </div>

              {/* Divider */}
              <div className="h-px w-full bg-[#302249]"></div>

              {/* Lifetime Milestones Section */}
              <div className="flex flex-col gap-4">
                <h2 className="text-white text-lg font-bold flex items-center gap-2">
                  <span className="material-symbols-outlined text-yellow-500">trophy</span>
                  Lifetime Milestones
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {milestoneBadges.map((milestone) => (
                    <MilestoneBadgeCard
                      key={milestone.code}
                      milestone={milestone}
                      currentStreak={currentStreak}
                      type={activeTab}
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* RIGHT COLUMN: Stats & Info */}
            <div className="lg:col-span-4 flex flex-col gap-6">
              {/* Current Streak Card */}
              <div className="bg-[#302249] rounded-2xl p-6 shadow-xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-bora-primary/20 rounded-full blur-3xl -mr-10 -mt-10"></div>
                <div className="relative z-10 flex flex-col gap-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-gray-400 text-sm font-medium">Current Streak</p>
                      <h2 className="text-4xl font-extrabold text-white mt-1">
                        {currentStreak} {activeTab === 'daily' ? 'Days' : 'Weeks'}
                      </h2>
                    </div>
                    <div className="p-3 bg-white/10 rounded-full backdrop-blur-sm">
                      <span className="material-symbols-outlined text-white text-2xl">
                        {activeTab === 'daily' ? 'local_fire_department' : 'diamond'}
                      </span>
                    </div>
                  </div>
                  <div className="flex flex-col gap-2">
                    <div className="flex justify-between text-xs text-white/80">
                      <span>Progress to next reward</span>
                      <span>{Math.round(progressToNext)}%</span>
                    </div>
                    <div className="w-full bg-black/20 rounded-full h-3">
                      <div
                        className="bg-gradient-to-r from-bora-primary to-purple-400 h-3 rounded-full relative transition-all duration-500"
                        style={{ width: `${progressToNext}%` }}
                      >
                        <div className="absolute right-0 top-0 bottom-0 w-3 bg-white/30 rounded-full animate-pulse"></div>
                      </div>
                    </div>
                    <p className="text-xs text-gray-400 mt-1">
                      Next Badge: <span className="text-white font-bold">{activeTab === 'daily' ? 'Day' : 'Week'} {nextRewardDay}</span>
                    </p>
                  </div>
                </div>
              </div>

              {/* Info Card */}
              <div className="bg-[#1e2a45] border border-blue-500/20 rounded-2xl p-5 flex gap-4 shadow-lg">
                <div className="shrink-0 pt-0.5">
                  <span className="material-symbols-outlined text-blue-400">info</span>
                </div>
                <div className="flex flex-col gap-2">
                  <h4 className="text-white font-bold text-sm">How Streaks Work</h4>
                  <p className="text-blue-100/70 text-xs leading-relaxed">
                    Streaks reset if you miss a {activeTab === 'daily' ? 'day' : 'week'}. The cycle refreshes every 10 {activeTab === 'daily' ? 'days' : 'weeks'}, bringing new badge opportunities.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div >
      </div >
    </div >,
    document.body
  )
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function StreakBadgeCard({
  badge,
  type: streakType
}: {
  badge: {
    code: string
    name: string
    rarity: 'common' | 'rare' | 'epic' | 'legendary'
    streakCount: number
    isEarned: boolean
    isCurrent: boolean
  }
  type: 'daily' | 'weekly'
}) {
  const colors = getBadgeRarityColors(badge.rarity)
  const imagePath = getBadgeImagePath(badge.code)

  if (badge.isCurrent) {
    // Current/Today badge - highlighted
    return (
      <div className="group relative flex flex-col items-center justify-center gap-2 p-3 rounded-xl bg-[#2e2344] border-2 border-bora-primary shadow-[0_0_15px_rgba(139,92,246,0.2)] transition-all cursor-pointer hover:shadow-[0_0_20px_rgba(139,92,246,0.4)]">
        <div className="absolute -top-3 bg-bora-primary text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-md uppercase tracking-wide">
          Today
        </div>
        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-bora-primary to-[#5f32ad] flex items-center justify-center overflow-hidden shadow-lg mb-1 ring-2 ring-white/10 p-2">
          <Image
            src={imagePath}
            alt={badge.name}
            width={64}
            height={64}
            className="w-full h-full object-contain"
            onError={(e) => {
              const target = e.target as HTMLImageElement
              target.style.display = 'none'
              const parent = target.parentElement
              if (parent) {
                parent.innerHTML = `<span class="material-symbols-outlined text-3xl text-white">stars</span>`
              }
            }}
          />
        </div>
        <div className="text-center">
          <p className="text-white text-xs font-bold">{badge.name}</p>
          <p className="text-bora-primary text-[10px] font-semibold animate-pulse">Claim Now</p>
        </div>
      </div>
    )
  }

  if (badge.isEarned) {
    // Earned/Claimed badge
    return (
      <div className="group relative flex flex-col items-center justify-center gap-2 p-3 rounded-xl bg-[#231b2e] border border-[#302249] transition-all hover:bg-[#2d233b]">
        <div className="absolute top-2 right-2 text-bora-primary">
          <span className="material-symbols-outlined text-[18px]">check_circle</span>
        </div>
        <div className={`w-16 h-16 rounded-full ${colors.bg} flex items-center justify-center overflow-hidden shadow-inner mb-1 p-2`}>
          <Image
            src={imagePath}
            alt={badge.name}
            width={64}
            height={64}
            className="w-full h-full object-contain opacity-80"
            onError={(e) => {
              const target = e.target as HTMLImageElement
              target.style.display = 'none'
              const parent = target.parentElement
              if (parent) {
                parent.innerHTML = `<span class="material-symbols-outlined text-3xl text-gray-400">stars</span>`
              }
            }}
          />
        </div>
        <div className="text-center">
          <p className="text-white text-xs font-bold">{badge.name}</p>
          <p className="text-gray-400 text-[10px]">{badge.rarity}</p>
        </div>
      </div>
    )
  }

  // Locked badge
  return (
    <div className="group relative flex flex-col items-center justify-center gap-2 p-3 rounded-xl bg-[#231b2e]/50 border border-[#302249]">
      <div className="absolute top-2 right-2 text-gray-500">
        <span className="material-symbols-outlined text-[18px]">lock</span>
      </div>
      <div className="w-16 h-16 rounded-full bg-[#1a1426] flex items-center justify-center mb-1">
        <Image
          src={imagePath}
          alt={badge.name}
          width={64}
          height={64}
          className="w-full h-full object-contain p-2"
          onError={(e) => {
            const target = e.target as HTMLImageElement
            target.style.display = 'none'
            const parent = target.parentElement
            if (parent) {
              parent.innerHTML = `<span class="material-symbols-outlined text-3xl text-[#453069]">stars</span>`
            }
          }}
        />
      </div>
      <div className="text-center">
        <p className="text-white/60 text-xs font-bold">{badge.name}</p>
        <p className="text-gray-500 text-[10px]">{badge.rarity}</p>
      </div>
    </div>
  )
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function MilestoneBadgeCard({
  milestone,
  currentStreak,
  type: streakType
}: {
  milestone: {
    code: string
    name: string
    rarity: 'epic' | 'legendary'
    streakCount: number
    description: string
    reward: string
  }
  currentStreak: number
  type: 'daily' | 'weekly'
}) {
  const imagePath = getBadgeImagePath(milestone.code)
  const isLocked = currentStreak < milestone.streakCount
  const progress = Math.min((currentStreak / milestone.streakCount) * 100, 100)
  const hasBonus = milestone.reward.includes('Pack') || milestone.reward.includes('Frame')

  return (
    <div className="relative overflow-hidden rounded-2xl bg-[#231b2e] border border-[#302249] p-4 flex gap-4 items-center group cursor-pointer hover:border-bora-primary/50 transition-colors">
      {/* Glow effect */}
      <div className={`absolute -right-10 -top-10 w-32 h-32 ${milestone.rarity === 'legendary' ? 'bg-yellow-500/10' : 'bg-bora-primary/20'} blur-3xl rounded-full pointer-events-none`}></div>

      {/* Badge Image */}
      <div className="shrink-0 w-20 h-20 rounded-xl bg-[#161022] flex items-center justify-center border border-[#302249] overflow-hidden p-2">
        <Image
          src={imagePath}
          alt={milestone.name}
          width={80}
          height={80}
          className="w-full h-full object-contain"
          onError={(e) => {
            const target = e.target as HTMLImageElement
            target.style.display = 'none'
            const parent = target.parentElement
            if (parent) {
              parent.innerHTML = `<span class="material-symbols-outlined text-4xl text-gray-600">workspace_premium</span>`
            }
          }}
        />
      </div>

      {/* Info */}
      <div className="flex flex-col gap-1 z-10 flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <h3 className="text-white font-bold text-base truncate">{milestone.name}</h3>
          {isLocked ? (
            <span className="bg-[#302249] text-xs text-gray-400 px-2 py-0.5 rounded-full shrink-0">Locked</span>
          ) : (
            <span className="material-symbols-outlined text-green-400 text-lg">check_circle</span>
          )}
        </div>
        {hasBonus && (
          <span className="bg-gradient-to-r from-yellow-600 to-yellow-400 text-black font-bold text-[10px] px-2 py-0.5 rounded-full flex items-center gap-1 w-fit">
            <span className="material-symbols-outlined text-[12px]">card_giftcard</span> Bonus
          </span>
        )}
        <p className="text-gray-400 text-xs leading-relaxed line-clamp-2">{milestone.description}</p>

        {/* Progress Bar */}
        <div className="w-full bg-[#161022] rounded-full h-1.5 mt-2">
          <div
            className="bg-bora-primary h-1.5 rounded-full transition-all duration-500"
            style={{ width: `${progress}%` }}
          ></div>
        </div>
        <p className="text-[10px] text-gray-400 mt-1 text-right">
          {currentStreak} / {milestone.streakCount} {streakType === 'daily' ? 'Days' : 'Weeks'}
        </p>
      </div>
    </div>
  )
}
