'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { getBadgeImagePath } from '@/lib/utils/badgeImages'
import BadgeRewardsModal from './BadgeRewardsModal'

type GameState = {
  dust: number
  totalXp: number
  level: number
  streaks: {
    daily: { current: number; nextMilestone: number; daysRemaining: number }
    weekly: { current: number; nextMilestone: number; weeksRemaining: number }
  }
  potentialRewards: {
    dailyMilestoneBadge?: Badge
    weeklyMilestoneBadge?: Badge
    dailyPhotocard?: { type: string }
    weeklyPhotocard?: { type: string }
  }
  latestBadges: Badge[]
}

type Badge = {
  code: string
  name: string
  description?: string
  icon: string
  rarity: 'common' | 'rare' | 'epic' | 'legendary'
  type?: string
  earnedAt?: string
  atStreak?: number
}

export default function QuestRightSidebar({ state }: { state: GameState | null }) {
  const [showBadgeModal, setShowBadgeModal] = useState(false)

  if (!state) return null

  // Helper to format numbers with commas
  const fmt = (n: number) => n.toLocaleString()

  return (
    <aside className="col-span-12 lg:col-span-3 flex flex-col gap-4 md:gap-6">
      {/* Wallet */}
      <div className="bora-glass-panel rounded-2xl p-4 md:p-5 border-t-2 md:border-t-4 border-t-bora-primary relative overflow-hidden">
        <div className="flex items-center justify-between mb-3 md:mb-4">
          <h3 className="text-xs md:text-sm font-bold text-gray-300 uppercase tracking-wide">My Wallet</h3>
          <span className="material-symbols-outlined text-gray-500 cursor-help text-xs md:text-sm">info</span>
        </div>
        <div className="space-y-3 md:space-y-4">
          <div className="flex items-center justify-between p-2 md:p-3 rounded-xl bg-surface-lighter/50 hover:bg-surface-lighter transition-colors">
            <div className="flex items-center gap-2 md:gap-3">
              <div className="w-7 h-7 md:w-8 md:h-8 rounded-full bg-purple-500/20 flex items-center justify-center text-purple-400">
                <span className="material-symbols-outlined text-xs md:text-sm">auto_awesome</span>
              </div>
              <span className="text-xs md:text-sm text-gray-300">Dust</span>
            </div>
            <span className="text-base md:text-lg font-bold text-white">{fmt(state.dust)}</span>
          </div>
          <div className="flex items-center justify-between p-2 md:p-3 rounded-xl bg-surface-lighter/50 hover:bg-surface-lighter transition-colors">
            <div className="flex items-center gap-2 md:gap-3">
              <div className="w-7 h-7 md:w-8 md:h-8 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400">
                <span className="material-symbols-outlined text-xs md:text-sm">bolt</span>
              </div>
              <span className="text-xs md:text-sm text-gray-300">Total XP</span>
            </div>
            <span className="text-base md:text-lg font-bold text-white">{fmt(state.totalXp)}</span>
          </div>
        </div>
        <div className="mt-4 pt-4 border-t border-white/10 text-center">
          <Link href="/shop" className="text-xs text-bora-primary hover:text-bora-primary/80 flex items-center justify-center gap-1 transition-colors">
            Visit Shop to spend Dust <span className="material-symbols-outlined text-xs">arrow_forward</span>
          </Link>
        </div>
      </div>

      {/* Potential Rewards */}
      <div className="bora-glass-panel rounded-2xl p-4 md:p-5 relative overflow-hidden">
        <div className="absolute -right-4 -top-4 w-24 h-24 bg-bora-primary blur-[50px] opacity-20 pointer-events-none"></div>
        <h3 className="text-xs md:text-sm font-bold text-gray-300 uppercase tracking-wide mb-3 md:mb-4">Potential Rewards</h3>
        <div className="grid grid-cols-2 gap-2 md:gap-3">
          {/* Photocard Preview */}
          <div className="bg-surface-lighter rounded-xl p-3 flex flex-col items-center justify-center text-center gap-2 border border-white/5 hover:border-bora-primary/50 transition-colors group cursor-pointer">
             <div className="w-12 h-16 rounded bg-gray-800 flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform border border-white/10">
                <span className="text-xs text-gray-500">Random</span>
             </div>
             <p className="text-[10px] text-gray-400 leading-tight">Random Photocard</p>
          </div>

          {/* Badge Preview */}
          <div className="bg-surface-lighter rounded-xl p-3 flex flex-col items-center justify-center text-center gap-2 border border-white/5 hover:border-bora-primary/50 transition-colors group cursor-pointer">
            {state.potentialRewards.dailyMilestoneBadge ? (
              <div className="w-12 h-12 rounded-full bg-yellow-500/20 flex items-center justify-center shadow-[0_0_10px_rgba(234,179,8,0.2)] group-hover:scale-110 transition-transform p-1">
                <Image
                  src={getBadgeImagePath(state.potentialRewards.dailyMilestoneBadge.code)}
                  alt={state.potentialRewards.dailyMilestoneBadge.name}
                  width={48}
                  height={48}
                  className="w-full h-full object-contain"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement
                    target.style.display = 'none'
                    const parent = target.parentElement
                    if (parent) {
                      parent.innerHTML = `<span class="text-xl">${state.potentialRewards.dailyMilestoneBadge?.icon || '🏆'}</span>`
                    }
                  }}
                />
              </div>
            ) : (
              <div className="w-12 h-12 rounded-full bg-yellow-500/20 text-yellow-400 flex items-center justify-center shadow-[0_0_10px_rgba(234,179,8,0.2)] group-hover:scale-110 transition-transform">
                <span className="text-xl">🏆</span>
              </div>
            )}
            <p className="text-[10px] text-gray-400 leading-tight">
                {state.potentialRewards.dailyMilestoneBadge?.name || 'Milestone Badge'}
            </p>
          </div>
        </div>
        <button
          onClick={() => setShowBadgeModal(true)}
          className="w-full mt-4 py-2 text-xs font-medium text-gray-400 bg-surface-lighter rounded-xl hover:text-white hover:bg-white/10 transition-colors"
        >
          View All Rewards
        </button>
      </div>

      {/* Latest Badges */}
      <div className="bora-glass-panel rounded-2xl p-4 md:p-5">
        <div className="flex justify-between items-center mb-3 md:mb-4">
          <h3 className="text-xs md:text-sm font-bold text-gray-300 uppercase tracking-wide">Latest Badges</h3>
          <Link href="/boraland/achievements" className="text-[10px] text-bora-primary hover:text-white transition-colors">View All</Link>
        </div>
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          {state.latestBadges.length > 0 ? (
            state.latestBadges.map((badge, i) => {
              return (
                <div key={i} className={`flex-shrink-0 w-12 h-12 rounded-full p-0.5 ${
                    badge.rarity === 'legendary' ? 'bg-gradient-to-tr from-yellow-500 to-orange-600' :
                    badge.rarity === 'epic' ? 'bg-gradient-to-tr from-purple-600 to-blue-500' :
                    badge.rarity === 'rare' ? 'bg-gradient-to-tr from-blue-500 to-cyan-500' :
                    'bg-gray-700'
                }`} title={badge.name}>
                    <div className="w-full h-full rounded-full bg-surface-dark flex items-center justify-center relative overflow-hidden group cursor-help p-1">
                      <Image
                        src={getBadgeImagePath(badge.code)}
                        alt={badge.name}
                        width={48}
                        height={48}
                        className="w-full h-full object-contain relative z-10 group-hover:scale-125 transition-transform"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement
                          target.style.display = 'none'
                          const parent = target.parentElement
                          if (parent) {
                            parent.innerHTML = `<span class="text-lg relative z-10 group-hover:scale-125 transition-transform">${badge.icon}</span>`
                          }
                        }}
                      />
                      <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    </div>
                </div>
              )
            })
          ) : (
             <div className="text-xs text-gray-500 italic">No badges yet</div>
          )}

          {/* Placeholder/Locked badges visual filler if few badges */}
          {[...Array(Math.max(0, 4 - state.latestBadges.length))].map((_, i) => (
             <div key={`locked-${i}`} className="flex-shrink-0 w-12 h-12 rounded-full bg-gray-700 p-0.5 border border-dashed border-gray-500" title="Locked">
                <div className="w-full h-full rounded-full bg-surface-dark flex items-center justify-center">
                    <span className="material-symbols-outlined text-gray-500 text-lg">lock</span>
                </div>
             </div>
          ))}
        </div>
      </div>

      {/* Badge Rewards Modal */}
      <BadgeRewardsModal
        isOpen={showBadgeModal}
        onClose={() => setShowBadgeModal(false)}
        dailyMilestoneBadge={state.potentialRewards.dailyMilestoneBadge}
        weeklyMilestoneBadge={state.potentialRewards.weeklyMilestoneBadge}
        dailyStreak={state.streaks.daily}
        weeklyStreak={state.streaks.weekly}
      />
    </aside>
  )
}
