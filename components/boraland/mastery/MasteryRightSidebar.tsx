'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { getBadgeImagePath } from '@/lib/utils/badgeImages'
// import BadgeRewardsModal from './BadgeRewardsModal' // We might need a specific MasteryBadgeModal

type GameState = {
  dust: number
  totalXp: number
  level: number
  latestBadges: any[]
}

type Milestone = { level: number; rewards: { xp: number; dust: number } }

type MasteryResponse = {
  milestones: Milestone[]
  summary: { totalTracks: number; claimableCount: number; dust: number; totalXp: number }
}

export default function MasteryRightSidebar({ state, masteryData }: { state: GameState | null, masteryData: MasteryResponse | null }) {
  const [showBadgeModal, setShowBadgeModal] = useState(false)

  if (!state) return null

  // Helper to format numbers with commas
  const fmt = (n: number) => n.toLocaleString()

  return (
    <aside className="col-span-12 lg:col-span-3 flex flex-col gap-4 md:gap-6">
      {/* Wallet */}
      <div className="bora-glass-panel rounded-2xl p-4 md:p-5 border-t-2 md:border-t-4 border-t-bora-primary relative overflow-hidden bg-gradient-to-b from-surface-lighter/10 to-transparent">
        <div className="flex items-center justify-between mb-3 md:mb-4">
          <h3 className="text-xs md:text-sm font-bold text-gray-300 uppercase tracking-wide">My Wallet</h3>
          <span className="material-symbols-outlined text-gray-500 cursor-help text-xs md:text-sm">info</span>
        </div>
        <div className="space-y-3 md:space-y-4">
          <div className="flex items-center justify-between p-2 md:p-3 rounded-xl bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/20 transition-all">
            <div className="flex items-center gap-2 md:gap-3">
              <div className="w-7 h-7 md:w-8 md:h-8 rounded-full bg-purple-500/20 flex items-center justify-center text-purple-400 shadow-[0_0_10px_rgba(168,85,247,0.3)]">
                <span className="material-symbols-outlined text-xs md:text-sm">auto_awesome</span>
              </div>
              <span className="text-xs md:text-sm text-gray-300">Dust</span>
            </div>
            <span className="text-base md:text-lg font-bold text-white drop-shadow-md">{fmt(state.dust)}</span>
          </div>
          <div className="flex items-center justify-between p-2 md:p-3 rounded-xl bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/20 transition-all">
            <div className="flex items-center gap-2 md:gap-3">
              <div className="w-7 h-7 md:w-8 md:h-8 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400 shadow-[0_0_10px_rgba(59,130,246,0.3)]">
                <span className="material-symbols-outlined text-xs md:text-sm">bolt</span>
              </div>
              <span className="text-xs md:text-sm text-gray-300">Total XP</span>
            </div>
            <span className="text-base md:text-lg font-bold text-white drop-shadow-md">{fmt(state.totalXp)}</span>
          </div>
        </div>
        <div className="mt-4 pt-4 border-t border-white/10 text-center">
          <Link href="/shop" className="text-xs text-bora-primary hover:text-bora-primary/80 flex items-center justify-center gap-1 transition-colors">
            Visit Shop to spend Dust <span className="material-symbols-outlined text-xs">arrow_forward</span>
          </Link>
        </div>
      </div>

      {/* How Mastery Works */}
      <div className="bora-glass-panel rounded-2xl p-4 md:p-5 relative overflow-hidden bg-gradient-to-br from-amber-500/5 to-transparent border-amber-500/10">
        <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-full blur-[40px] -translate-y-1/2 translate-x-1/2 pointer-events-none" />
        <div className="flex items-center justify-between mb-3 relative z-10">
            <h4 className="text-sm font-bold text-white flex items-center gap-2 uppercase tracking-wide">
                <div className="w-6 h-6 rounded-full bg-amber-500/20 flex items-center justify-center">
                   <span className="material-symbols-outlined text-amber-300 text-xs">tips_and_updates</span>
                </div>
                How it Works
            </h4>
            <span className="text-[10px] text-amber-200/80 px-2 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/20">Live</span>
        </div>
        <ul className="text-xs text-gray-300 space-y-2.5 leading-relaxed relative z-10">
            <li className="flex gap-2.5 items-start">
                <span className="text-amber-500 mt-1 text-[8px]">●</span>
                <span>Earn XP for correct answers (auto-detected member/era).</span>
            </li>
            <li className="flex gap-2.5 items-start">
                <span className="text-amber-500 mt-1 text-[8px]">●</span>
                <span>OT7 levels 7× slower; only awarded when all 7 members are in the question.</span>
            </li>
            <li className="flex gap-2.5 items-start">
                <span className="text-amber-500 mt-1 text-[8px]">●</span>
                <span>Milestones at 5/10/25/50/100 grant XP + Dust.</span>
            </li>
        </ul>
      </div>

      {/* Potential Rewards */}
      {masteryData && (
        <div className="bora-glass-panel rounded-2xl p-4 md:p-5 relative overflow-hidden bg-gradient-to-br from-purple-500/5 to-transparent border-purple-500/10">
            <div className="absolute -right-4 -top-4 w-24 h-24 bg-purple-500 blur-[50px] opacity-20 pointer-events-none"></div>
            <div className="flex items-center justify-between mb-3 relative z-10">
                <h4 className="text-sm font-bold text-white flex items-center gap-2 uppercase tracking-wide">
                    <div className="w-6 h-6 rounded-full bg-purple-500/20 flex items-center justify-center">
                        <span className="material-symbols-outlined text-purple-300 text-xs">redeem</span>
                    </div>
                    Rewards
                </h4>
                <span className="text-[10px] text-purple-200/80 bg-purple-500/10 px-2 py-0.5 rounded-full border border-purple-500/20">{masteryData.milestones.length} Milestones</span>
            </div>
            <div className="grid grid-cols-2 gap-2 relative z-10">
            {masteryData.milestones.map((ms) => (
                <div key={ms.level} className="rounded-xl bg-surface-lighter/30 border border-white/5 hover:border-purple-500/30 hover:bg-purple-500/10 px-3 py-2.5 shadow-sm transition-all group relative overflow-hidden">
                    <div className="text-[10px] font-bold text-gray-400 group-hover:text-purple-300 uppercase tracking-wide mb-1 transition-colors">Level {ms.level}</div>
                    <div className="flex flex-col gap-0.5">
                        <span className="text-xs font-bold text-white group-hover:text-white transition-colors">+{ms.rewards.xp} XP</span>
                        <span className="text-[10px] text-gray-400 group-hover:text-purple-200 transition-colors">+{ms.rewards.dust} Dust</span>
                    </div>
                </div>
            ))}
            </div>
        </div>
      )}

      {/* Badges Preview */}
      {masteryData && (
        <div className="bora-glass-panel rounded-2xl p-4 md:p-5 relative overflow-hidden bg-gradient-to-br from-yellow-500/5 to-transparent border-yellow-500/10">
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-yellow-500/10 rounded-full blur-[40px] translate-y-1/2 -translate-x-1/2 pointer-events-none" />
             <div className="flex items-center justify-between mb-3 relative z-10">
                <h4 className="text-sm font-bold text-white flex items-center gap-2 uppercase tracking-wide">
                    <div className="w-6 h-6 rounded-full bg-yellow-500/20 flex items-center justify-center">
                        <span className="material-symbols-outlined text-yellow-300 text-xs">emoji_events</span>
                    </div>
                    Badges
                </h4>
                <span className="text-[10px] text-yellow-200/80 italic">Preview</span>
            </div>
            <div className="grid grid-cols-4 gap-2 relative z-10">
            {masteryData.milestones.map((ms, i) => {
                // Generate varied colors for badge slots based on level
                const colors = [
                    'border-gray-500/30 bg-gray-500/10 text-gray-400', // L5
                    'border-green-500/30 bg-green-500/10 text-green-300', // L10
                    'border-blue-500/30 bg-blue-500/10 text-blue-300', // L25
                    'border-purple-500/30 bg-purple-500/10 text-purple-300', // L50
                    'border-yellow-500/30 bg-yellow-500/10 text-yellow-300 shadow-[0_0_10px_rgba(234,179,8,0.1)]', // L100
                ]
                const styleClass = colors[i % colors.length] || colors[0]
                
                return (
                    <div 
                        key={`badge-${ms.level}`} 
                        className={`aspect-square rounded-xl border flex flex-col items-center justify-center gap-1 transition-all cursor-help hover:scale-105 hover:brightness-125 ${styleClass}`}
                        title={`Level ${ms.level} Badge`}
                    >
                        <span className="material-symbols-outlined text-[16px] opacity-70">workspace_premium</span>
                        <span className="text-[9px] font-bold">L{ms.level}</span>
                    </div>
                )
            })}
            </div>
            <p className="text-[10px] text-gray-500 mt-3 leading-tight relative z-10">
                Badges will automatically unlock when you claim the corresponding milestone rewards.
            </p>
        </div>
      )}
    </aside>
  )
}
