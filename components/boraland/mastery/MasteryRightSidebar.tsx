'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { apiFetch } from '@/lib/client/api'
import {
  getMasteryBadgeImagePath,
  getBadgeRarityColors,
} from '@/lib/utils/badgeImages'
import MasteryBadgeRewardsModal from './MasteryBadgeRewardsModal'

type GameState = {
  dust: number
  totalXp: number
  level: number
  latestBadges: any[]
}

type MasteryDefinition = {
  key: string
  displayName?: string
  coverImage?: string
}
type MasteryTrack = {
  definition: MasteryDefinition
  track: {
    kind: 'member' | 'era'
    key: string
    xp: number
    level: number
    xpToNext: number
    nextMilestone: number | null
    claimable: number[]
    claimedMilestones: number[]
  }
}

type Milestone = {
  level: number
  rewards: { xp: number; dust: number }
  badge?: {
    rarity: 'common' | 'rare' | 'epic' | 'legendary'
    description: string
    isSpecialAtMax: boolean
  }
}

type MasteryResponse = {
  members: MasteryTrack[]
  eras: MasteryTrack[]
  milestones: Milestone[]
  summary: {
    totalTracks: number
    claimableCount: number
    dust: number
    totalXp: number
  }
}

type EarnedBadge = {
  code: string
  kind: 'member' | 'era'
  key: string
  milestone: number
  rarity: 'common' | 'rare' | 'epic' | 'legendary'
  imagePath: string
  earnedAt: string
  variant?: 'milestone' | 'special'
}

export default function MasteryRightSidebar({
  state,
  masteryData,
}: {
  state: GameState | null
  masteryData: MasteryResponse | null
}) {
  const [showBadgeModal, setShowBadgeModal] = useState(false)
  const [earnedBadges, setEarnedBadges] = useState<EarnedBadge[]>([])
  const [loadingBadges, setLoadingBadges] = useState(false)

  // Fetch earned badges when modal opens
  useEffect(() => {
    if (showBadgeModal && earnedBadges.length === 0) {
      setLoadingBadges(true)
      apiFetch('/api/game/mastery/badges')
        .then(res => {
          if (res.badges) {
            setEarnedBadges(res.badges)
          }
        })
        .catch(console.error)
        .finally(() => setLoadingBadges(false))
    }
  }, [showBadgeModal, earnedBadges.length])

  if (!state) return null

  // Helper to format numbers with commas
  const fmt = (n: number) => n.toLocaleString()

  // Get recent badges (last 4)
  const recentBadges = earnedBadges.slice(0, 4)

  // Rarity colors for badges
  const rarityColors: Record<string, string> = {
    common: 'border-gray-500/30 bg-gray-500/10 text-gray-400',
    rare: 'border-blue-500/30 bg-blue-500/10 text-blue-300',
    epic: 'border-purple-500/30 bg-purple-500/10 text-purple-300',
    legendary:
      'border-yellow-500/30 bg-yellow-500/10 text-yellow-300 shadow-[0_0_10px_rgba(234,179,8,0.1)]',
  }

  return (
    <aside className="col-span-12 lg:col-span-3 flex flex-col gap-4 md:gap-6">
      {/* Wallet */}
      <div className="bora-glass-panel rounded-2xl p-4 md:p-5 border-t-2 md:border-t-4 border-t-bora-primary relative overflow-hidden bg-gradient-to-b from-surface-lighter/10 to-transparent">
        <div className="flex items-center justify-between mb-3 md:mb-4">
          <h3 className="text-xs md:text-sm font-bold text-gray-300 uppercase tracking-wide">
            My Wallet
          </h3>
          <span className="material-symbols-outlined text-gray-500 cursor-help text-xs md:text-sm">
            info
          </span>
        </div>
        <div className="space-y-3 md:space-y-4">
          <div className="flex items-center justify-between p-2 md:p-3 rounded-xl bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/20 transition-all">
            <div className="flex items-center gap-2 md:gap-3">
              <div className="w-7 h-7 md:w-8 md:h-8 rounded-full bg-purple-500/20 flex items-center justify-center text-purple-400 shadow-[0_0_10px_rgba(168,85,247,0.3)]">
                <span className="material-symbols-outlined text-xs md:text-sm">
                  auto_awesome
                </span>
              </div>
              <span className="text-xs md:text-sm text-gray-300">Dust</span>
            </div>
            <span className="text-base md:text-lg font-bold text-white drop-shadow-md">
              {fmt(state.dust)}
            </span>
          </div>
          <div className="flex items-center justify-between p-2 md:p-3 rounded-xl bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/20 transition-all">
            <div className="flex items-center gap-2 md:gap-3">
              <div className="w-7 h-7 md:w-8 md:h-8 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400 shadow-[0_0_10px_rgba(59,130,246,0.3)]">
                <span className="material-symbols-outlined text-xs md:text-sm">
                  bolt
                </span>
              </div>
              <span className="text-xs md:text-sm text-gray-300">Total XP</span>
            </div>
            <span className="text-base md:text-lg font-bold text-white drop-shadow-md">
              {fmt(state.totalXp)}
            </span>
          </div>
        </div>
        <div className="mt-4 pt-4 border-t border-white/10 text-center">
          <Link
            href="/shop"
            className="text-xs text-bora-primary hover:text-bora-primary/80 flex items-center justify-center gap-1 transition-colors"
          >
            Visit Shop to spend Dust{' '}
            <span className="material-symbols-outlined text-xs">
              arrow_forward
            </span>
          </Link>
        </div>
      </div>

      {/* How Mastery Works */}
      <div className="bora-glass-panel rounded-2xl p-4 md:p-5 relative overflow-hidden bg-gradient-to-br from-amber-500/5 to-transparent border-amber-500/10">
        <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-full blur-[40px] -translate-y-1/2 translate-x-1/2 pointer-events-none" />
        <div className="flex items-center justify-between mb-3 relative z-10">
          <h4 className="text-sm font-bold text-white flex items-center gap-2 uppercase tracking-wide">
            <div className="w-6 h-6 rounded-full bg-amber-500/20 flex items-center justify-center">
              <span className="material-symbols-outlined text-amber-300 text-xs">
                tips_and_updates
              </span>
            </div>
            How it Works
          </h4>
          <span className="text-[10px] text-amber-200/80 px-2 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/20">
            Live
          </span>
        </div>
        <ul className="text-xs text-gray-300 space-y-2.5 leading-relaxed relative z-10">
          <li className="flex gap-2.5 items-start">
            <span className="text-amber-500 mt-1 text-[8px]">●</span>
            <span>Earn XP for correct answers (auto-detected member/era).</span>
          </li>
          <li className="flex gap-2.5 items-start">
            <span className="text-amber-500 mt-1 text-[8px]">●</span>
            <span>
              OT7 levels 7× slower; only awarded when all 7 members are in the
              question.
            </span>
          </li>
          <li className="flex gap-2.5 items-start">
            <span className="text-amber-500 mt-1 text-[8px]">●</span>
            <span>
              Milestones at 5/10/25/50/100 grant <strong>XP</strong>,{' '}
              <strong>Dust</strong>, and <strong>Badges</strong>!
            </span>
          </li>
        </ul>
      </div>

      {/* Milestone Rewards with Badges */}
      {masteryData && (
        <div className="bora-glass-panel rounded-2xl p-4 md:p-5 relative overflow-hidden bg-gradient-to-br from-purple-500/5 to-transparent border-purple-500/10">
          <div className="absolute -right-4 -top-4 w-24 h-24 bg-purple-500 blur-[50px] opacity-20 pointer-events-none"></div>
          <div className="flex items-center justify-between mb-3 relative z-10">
            <h4 className="text-sm font-bold text-white flex items-center gap-2 uppercase tracking-wide">
              <div className="w-6 h-6 rounded-full bg-purple-500/20 flex items-center justify-center">
                <span className="material-symbols-outlined text-purple-300 text-xs">
                  redeem
                </span>
              </div>
              Milestone Rewards
            </h4>
            <span className="text-[10px] text-purple-200/80 bg-purple-500/10 px-2 py-0.5 rounded-full border border-purple-500/20">
              {masteryData.milestones.length} Levels
            </span>
          </div>

          {/* Milestone Cards Grid */}
          <div className="space-y-2 relative z-10">
            {masteryData.milestones.map((ms, i) => {
              const rarity =
                ms.badge?.rarity ||
                (['common', 'rare', 'rare', 'epic', 'legendary'] as const)[i] ||
                'common'
              const colors = getBadgeRarityColors(rarity)

              return (
                <div
                  key={ms.level}
                  className={`rounded-xl bg-surface-lighter/30 border hover:border-purple-500/30 hover:bg-purple-500/10 p-3 shadow-sm transition-all group relative overflow-hidden ${colors.border}`}
                >
                  <div className="flex items-center gap-3">
                    {/* Badge Preview */}
                    <div
                      className={`w-10 h-10 rounded-lg ${colors.bg} flex items-center justify-center shrink-0 ${colors.glow}`}
                    >
                      <Image
                        src={`/badges/mastery/milestone-${ms.level}.png`}
                        alt={`Level ${ms.level} Badge`}
                        width={32}
                        height={32}
                        className="w-7 h-7 object-contain"
                        onError={e => {
                          const target = e.target as HTMLImageElement
                          target.style.display = 'none'
                          const parent = target.parentElement
                          if (parent) {
                            parent.innerHTML = `<span class="material-symbols-outlined text-xl ${colors.text}">workspace_premium</span>`
                          }
                        }}
                      />
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-white">
                          Level {ms.level}
                        </span>
                        <span
                          className={`text-[9px] uppercase font-semibold ${colors.text}`}
                        >
                          {rarity}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-[10px] text-gray-400 mt-0.5">
                        <span className="flex items-center gap-0.5">
                          <span className="material-symbols-outlined text-[10px] text-blue-400">
                            bolt
                          </span>
                          +{ms.rewards.xp} XP
                        </span>
                        <span className="flex items-center gap-0.5">
                          <span className="material-symbols-outlined text-[10px] text-purple-400">
                            auto_awesome
                          </span>
                          +{ms.rewards.dust} Dust
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

          {/* View All Rewards Button */}
          <button
            data-tour="badge-rewards-button"
            onClick={() => setShowBadgeModal(true)}
            className="w-full mt-4 py-2.5 text-xs font-semibold text-white bg-gradient-to-r from-purple-600 to-pink-500 rounded-xl hover:from-purple-500 hover:to-pink-400 transition-all shadow-lg hover:shadow-purple-500/25 flex items-center justify-center gap-2"
          >
            <span className="material-symbols-outlined text-sm">
              workspace_premium
            </span>
            View All Badge Rewards
          </button>
        </div>
      )}

      {/* Recent Badges */}
      <div className="bora-glass-panel rounded-2xl p-4 md:p-5 relative overflow-hidden bg-gradient-to-br from-yellow-500/5 to-transparent border-yellow-500/10">
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-yellow-500/10 rounded-full blur-[40px] translate-y-1/2 -translate-x-1/2 pointer-events-none" />
        <div className="flex items-center justify-between mb-3 relative z-10">
          <h4 className="text-sm font-bold text-white flex items-center gap-2 uppercase tracking-wide">
            <div className="w-6 h-6 rounded-full bg-yellow-500/20 flex items-center justify-center">
              <span className="material-symbols-outlined text-yellow-300 text-xs">
                emoji_events
              </span>
            </div>
            Recent Badges
          </h4>
          <button
            onClick={() => setShowBadgeModal(true)}
            className="text-[10px] text-yellow-300 hover:text-yellow-200 transition-colors"
          >
            View All
          </button>
        </div>

        <div className="grid grid-cols-4 gap-2 relative z-10">
          {recentBadges.length > 0
            ? recentBadges.map((badge, i) => {
              const colors = rarityColors[badge.rarity] || rarityColors.common

              return (
                <div
                  key={`${badge.code}-${i}`}
                  className={`aspect-square rounded-xl border flex flex-col items-center justify-center gap-1 transition-all cursor-help hover:scale-105 hover:brightness-125 ${colors}`}
                  title={`${badge.key} - Level ${badge.milestone}${badge.variant === 'special' ? ' (Special)' : ''}`}
                >
                  <Image
                    src={badge.imagePath}
                    alt={`${badge.key} Level ${badge.milestone}${badge.variant === 'special' ? ' Special' : ''}`}
                    width={24}
                    height={24}
                    className="w-6 h-6 object-contain"
                    onError={e => {
                      const target = e.target as HTMLImageElement
                      target.style.display = 'none'
                      const parent = target.parentElement
                      if (parent) {
                        parent.innerHTML = `<span class="material-symbols-outlined text-[16px] opacity-70">workspace_premium</span><span class="text-[9px] font-bold">L${badge.milestone}</span>`
                      }
                    }}
                  />
                  <span className="text-[8px] font-bold truncate max-w-full px-1">
                    {badge.key.slice(0, 4)}
                  </span>
                </div>
              )
            })
            : // Placeholder badges when no badges earned
            masteryData?.milestones.slice(0, 4).map((ms, i) => {
              const colors = [
                'border-gray-500/30 bg-gray-500/10 text-gray-500',
                'border-gray-500/30 bg-gray-500/10 text-gray-500',
                'border-gray-500/30 bg-gray-500/10 text-gray-500',
                'border-gray-500/30 bg-gray-500/10 text-gray-500',
              ]

              return (
                <div
                  key={`placeholder-${ms.level}`}
                  className={`aspect-square rounded-xl border flex flex-col items-center justify-center gap-1 transition-all opacity-50 ${colors[i]}`}
                  title={`Level ${ms.level} Badge - Locked`}
                >
                  <span className="material-symbols-outlined text-[16px] opacity-70">
                    lock
                  </span>
                  <span className="text-[9px] font-bold">L{ms.level}</span>
                </div>
              )
            })}
        </div>

        <p className="text-[10px] text-gray-500 mt-3 leading-tight relative z-10">
          {recentBadges.length > 0
            ? 'Claim milestone rewards to unlock more badges!'
            : 'Reach milestones and claim rewards to earn badges.'}
        </p>
      </div>

      {/* Mastery Badge Rewards Modal */}
      <MasteryBadgeRewardsModal
        isOpen={showBadgeModal}
        onClose={() => setShowBadgeModal(false)}
        milestones={
          masteryData?.milestones.map(ms => ({
            ...ms,
            badge: ms.badge || {
              rarity: 'common' as const,
              description: 'Mastery milestone badge',
              isSpecialAtMax: ms.level === 100,
            },
          })) || []
        }
        memberTracks={masteryData?.members || []}
        eraTracks={masteryData?.eras || []}
        earnedBadges={earnedBadges}
      />
    </aside>
  )
}
