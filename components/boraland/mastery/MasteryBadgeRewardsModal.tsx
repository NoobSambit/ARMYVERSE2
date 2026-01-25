'use client'

import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import Image from 'next/image'
import {
  getMasteryBadgeImagePath,
  getMasteryBadgeRarity,
  getBadgeRarityColors,
} from '@/lib/utils/badgeImages'

type Milestone = {
  level: number
  rewards: { xp: number; dust: number }
  badge: {
    rarity: 'common' | 'rare' | 'epic' | 'legendary'
    description: string
    isSpecialAtMax: boolean
  }
}

type MasteryTrack = {
  definition: { key: string; displayName?: string }
  track: {
    kind: 'member' | 'era'
    key: string
    xp: number
    level: number
    claimedMilestones: number[]
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

type MasteryBadgeRewardsModalProps = {
  isOpen: boolean
  onClose: () => void
  milestones: Milestone[]
  memberTracks?: MasteryTrack[]
  eraTracks?: MasteryTrack[]
  earnedBadges?: EarnedBadge[]
}

export default function MasteryBadgeRewardsModal({
  isOpen,
  onClose,
  milestones,
  memberTracks = [],
  eraTracks = [],
  earnedBadges = [],
}: MasteryBadgeRewardsModalProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'members' | 'eras'>(
    'overview'
  )

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

  // Calculate totals
  const totalPossibleBadges =
    (memberTracks.length + eraTracks.length) * milestones.length +
    memberTracks.length
  const totalEarnedBadges = earnedBadges.length

  // Get earned badges grouped by type
  const memberBadges = earnedBadges.filter(b => b.kind === 'member')
  const eraBadges = earnedBadges.filter(b => b.kind === 'era')

  // Get the badge status for a specific track and milestone
  const getBadgeStatus = (
    kind: 'member' | 'era',
    key: string,
    milestone: number
  ) => {
    const track =
      kind === 'member'
        ? memberTracks.find(t => t.track.key === key)
        : eraTracks.find(t => t.track.key === key)

    if (!track) return 'locked'

    const isClaimed = track.track.claimedMilestones.includes(milestone)
    if (isClaimed) return 'earned'

    const currentLevel = track.track.level
    if (currentLevel >= milestone) return 'claimable'

    return 'locked'
  }

  return createPortal(
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-2 md:p-4 bg-black/80 backdrop-blur-md animate-fade-in"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-6xl max-h-[95vh] md:h-[90vh] flex flex-col bg-[#0F0B1E] border border-[#302249] rounded-2xl shadow-2xl overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {/* Sticky Header */}
        <div className="shrink-0 bg-[#0F0B1E]/95 backdrop-blur-xl z-20 border-b border-[#302249]">
          {/* Top Bar */}
          <div className="flex items-center justify-between px-3 md:px-6 py-3 md:py-5">
            <div className="flex flex-col gap-0.5 md:gap-1">
              <h1 className="text-white text-lg md:text-2xl font-bold tracking-tight flex items-center gap-2">
                <span className="material-symbols-outlined text-yellow-400">
                  workspace_premium
                </span>
                Mastery Badge Rewards
              </h1>
              <p className="text-gray-400 text-xs md:text-sm hidden sm:block">
                Earn exclusive badges by reaching mastery milestones
              </p>
            </div>
            <button
              onClick={onClose}
              className="group relative z-50 p-2 rounded-full hover:bg-white/20 active:bg-white/30 transition-all text-white bg-white/10 shrink-0 cursor-pointer hover:rotate-90"
              aria-label="Close modal"
              title="Close"
            >
              <span className="material-symbols-outlined text-xl md:text-2xl font-bold">
                close
              </span>
            </button>
          </div>

          {/* Tabs */}
          <div className="px-3 md:px-6 pb-3 md:pb-4">
            <div className="flex h-10 md:h-12 w-full max-w-md items-center rounded-full bg-[#231b2e] p-0.5 md:p-1 border border-[#302249]">
              <button
                onClick={() => setActiveTab('overview')}
                className={`flex h-full grow items-center justify-center rounded-full px-3 md:px-4 text-xs md:text-sm font-semibold transition-all ${activeTab === 'overview'
                  ? 'bg-bora-primary shadow-lg text-white'
                  : 'text-gray-400'
                  }`}
              >
                Overview
              </button>
              <button
                onClick={() => setActiveTab('members')}
                className={`flex h-full grow items-center justify-center rounded-full px-3 md:px-4 text-xs md:text-sm font-semibold transition-all ${activeTab === 'members'
                  ? 'bg-bora-primary shadow-lg text-white'
                  : 'text-gray-400'
                  }`}
              >
                Members
              </button>
              <button
                onClick={() => setActiveTab('eras')}
                className={`flex h-full grow items-center justify-center rounded-full px-3 md:px-4 text-xs md:text-sm font-semibold transition-all ${activeTab === 'eras'
                  ? 'bg-bora-primary shadow-lg text-white'
                  : 'text-gray-400'
                  }`}
              >
                Eras
              </button>
            </div>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto scrollbar-thin bg-[#0F0B1E] p-3 md:p-6">
          {activeTab === 'overview' && (
            <OverviewTab
              milestones={milestones}
              totalEarnedBadges={totalEarnedBadges}
              totalPossibleBadges={totalPossibleBadges}
              memberBadges={memberBadges}
              eraBadges={eraBadges}
            />
          )}

          {activeTab === 'members' && (
            <TrackBadgesTab
              kind="member"
              tracks={memberTracks}
              milestones={milestones}
              getBadgeStatus={getBadgeStatus}
            />
          )}

          {activeTab === 'eras' && (
            <TrackBadgesTab
              kind="era"
              tracks={eraTracks}
              milestones={milestones}
              getBadgeStatus={getBadgeStatus}
            />
          )}
        </div>
      </div>
    </div>,
    document.body
  )
}

// Overview Tab Component
function OverviewTab({
  milestones,
  totalEarnedBadges,
  totalPossibleBadges,
  memberBadges,
  eraBadges,
}: {
  milestones: Milestone[]
  totalEarnedBadges: number
  totalPossibleBadges: number
  memberBadges: EarnedBadge[]
  eraBadges: EarnedBadge[]
}) {
  const progressPercent =
    totalPossibleBadges > 0
      ? Math.round((totalEarnedBadges / totalPossibleBadges) * 100)
      : 0

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 md:gap-6 lg:gap-8">
      {/* LEFT COLUMN: Milestone Badges */}
      <div className="lg:col-span-8 flex flex-col gap-8">
        {/* Milestone Badges Section */}
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-white text-lg font-bold flex items-center gap-2">
                <span className="material-symbols-outlined text-yellow-500">
                  military_tech
                </span>
                Milestone Badges
              </h2>
              <p className="text-gray-400 text-xs mt-1">
                Reach these levels in any member or era track to unlock badges
              </p>
            </div>
          </div>

          {/* Milestone Badge Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
            {milestones.map(ms => {
              const colors = getBadgeRarityColors(ms.badge.rarity)
              const imagePath = `/badges/mastery/milestone-${ms.level}.png`

              return (
                <div
                  key={ms.level}
                  className={`group relative flex flex-col items-center justify-center gap-2 p-4 rounded-xl bg-[#231b2e] border transition-all hover:bg-[#2d233b] ${colors.border} ${ms.level === 100 ? 'ring-2 ring-yellow-500/30' : ''}`}
                >
                  {ms.level === 100 && (
                    <div className="absolute -top-2 bg-gradient-to-r from-yellow-500 to-amber-400 text-black text-[10px] font-bold px-2 py-0.5 rounded-full shadow-md uppercase tracking-wide">
                      Legendary
                    </div>
                  )}
                  <div
                    className={`w-16 h-16 rounded-full ${colors.bg} flex items-center justify-center overflow-hidden shadow-lg mb-1 p-2 ${colors.glow}`}
                  >
                    <Image
                      src={imagePath}
                      alt={`Level ${ms.level} Badge`}
                      width={64}
                      height={64}
                      className="w-full h-full object-contain"
                      onError={e => {
                        const target = e.target as HTMLImageElement
                        target.style.display = 'none'
                        const parent = target.parentElement
                        if (parent) {
                          parent.innerHTML = `<span class="material-symbols-outlined text-3xl ${colors.text}">workspace_premium</span>`
                        }
                      }}
                    />
                  </div>
                  <div className="text-center">
                    <p className="text-white text-sm font-bold">
                      Level {ms.level}
                    </p>
                    <p
                      className={`text-[10px] uppercase font-semibold ${colors.text}`}
                    >
                      {ms.badge.rarity}
                    </p>
                  </div>
                  <div className="text-center text-[10px] text-gray-400 mt-1">
                    <div>+{ms.rewards.xp} XP</div>
                    <div>+{ms.rewards.dust} Dust</div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Divider */}
        <div className="h-px w-full bg-[#302249]"></div>

        {/* Special Member Badges Section */}
        <div className="flex flex-col gap-4">
          <h2 className="text-white text-lg font-bold flex items-center gap-2">
            <span className="material-symbols-outlined text-purple-400">
              diamond
            </span>
            Special Level 100 Badges
          </h2>
          <p className="text-gray-400 text-xs -mt-2">
            Unique legendary badges for reaching Level 100 mastery with each
            member
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 2xl:grid-cols-8 gap-4">
            {[
              'RM',
              'Jin',
              'Suga',
              'J-Hope',
              'Jimin',
              'V',
              'Jungkook',
              'OT7',
            ].map(member => {
              const earned = memberBadges.some(
                b => b.key === member && b.milestone === 100 && b.variant === 'special'
              )
              const imagePath = getMasteryBadgeImagePath('member', member, 100)

              return (
                <div
                  key={member}
                  className={`group relative flex flex-col items-center justify-center gap-2 p-3 rounded-2xl border transition-all ${earned
                    ? 'bg-[#2d233b] border-yellow-500/50 shadow-[0_0_15px_rgba(234,179,8,0.2)]'
                    : 'bg-[#231b2e]/60 border-[#302249]'
                    }`}
                >
                  <div
                    className={`w-16 h-16 md:w-20 md:h-20 rounded-2xl flex items-center justify-center overflow-visible p-1 ${earned ? 'bg-yellow-500/20' : 'bg-[#1a1426]'}`}
                  >
                    <Image
                      src={imagePath}
                      alt={`${member} Level 100`}
                      width={80}
                      height={80}
                      className="w-full h-full object-contain"
                      onError={e => {
                        const target = e.target as HTMLImageElement
                        target.style.display = 'none'
                        const parent = target.parentElement
                        if (parent) {
                          parent.innerHTML = `<span class="material-symbols-outlined text-xl text-gray-500">workspace_premium</span>`
                        }
                      }}
                    />
                  </div>
                  <p
                    className={`text-xs font-bold ${earned ? 'text-white' : 'text-gray-400'}`}
                  >
                    {member}
                  </p>
                  {earned && (
                    <span className="absolute -top-1 -right-1 material-symbols-outlined text-yellow-400 text-sm">
                      verified
                    </span>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* RIGHT COLUMN: Stats & Info */}
      <div className="lg:col-span-4 flex flex-col gap-6">
        {/* Progress Card */}
        <div className="bg-[#302249] rounded-2xl p-6 shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-bora-primary/20 rounded-full blur-3xl -mr-10 -mt-10"></div>
          <div className="relative z-10 flex flex-col gap-4">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-gray-400 text-sm font-medium">
                  Total Badges
                </p>
                <h2 className="text-4xl font-extrabold text-white mt-1">
                  {totalEarnedBadges}
                </h2>
              </div>
              <div className="p-3 bg-white/10 rounded-full backdrop-blur-sm">
                <span className="material-symbols-outlined text-white text-2xl">
                  workspace_premium
                </span>
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <div className="flex justify-between text-xs text-white/80">
                <span>Collection Progress</span>
                <span>{progressPercent}%</span>
              </div>
              <div className="w-full bg-black/20 rounded-full h-3">
                <div
                  className="bg-gradient-to-r from-bora-primary to-purple-400 h-3 rounded-full relative transition-all duration-500"
                  style={{ width: `${progressPercent}%` }}
                >
                  <div className="absolute right-0 top-0 bottom-0 w-3 bg-white/30 rounded-full animate-pulse"></div>
                </div>
              </div>
              <p className="text-xs text-gray-400 mt-1">
                {totalEarnedBadges} of {totalPossibleBadges} badges collected
              </p>
            </div>
          </div>
        </div>

        {/* Badge Breakdown */}
        <div className="bg-[#231b2e] border border-[#302249] rounded-2xl p-5 flex flex-col gap-4">
          <h4 className="text-white font-bold text-sm flex items-center gap-2">
            <span className="material-symbols-outlined text-purple-400 text-lg">
              bar_chart
            </span>
            Badge Breakdown
          </h4>
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-[#302249]/50 rounded-xl p-3 text-center">
              <p className="text-2xl font-bold text-purple-400">
                {memberBadges.length}
              </p>
              <p className="text-[10px] text-gray-400 uppercase">
                Member Badges
              </p>
            </div>
            <div className="bg-[#302249]/50 rounded-xl p-3 text-center">
              <p className="text-2xl font-bold text-pink-400">
                {eraBadges.length}
              </p>
              <p className="text-[10px] text-gray-400 uppercase">Era Badges</p>
            </div>
          </div>
        </div>

        {/* Info Card */}
        <div className="bg-[#1e2a45] border border-blue-500/20 rounded-2xl p-5 flex gap-4 shadow-lg">
          <div className="shrink-0 pt-0.5">
            <span className="material-symbols-outlined text-blue-400">
              info
            </span>
          </div>
          <div className="flex flex-col gap-2">
            <h4 className="text-white font-bold text-sm">How Badges Work</h4>
            <p className="text-blue-100/70 text-xs leading-relaxed">
              Earn XP in member and era tracks by answering quiz questions
              correctly. When you reach milestone levels (5, 10, 25, 50, 100),
              claim your rewards to unlock exclusive badges and earn Dust!
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

// Track Badges Tab Component
function TrackBadgesTab({
  kind,
  tracks,
  milestones,
  getBadgeStatus,
}: {
  kind: 'member' | 'era'
  tracks: MasteryTrack[]
  milestones: Milestone[]
  getBadgeStatus: (
    kind: 'member' | 'era',
    key: string,
    milestone: number
  ) => 'earned' | 'claimable' | 'locked'
}) {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h2 className="text-white text-lg font-bold flex items-center gap-2">
          <span className="material-symbols-outlined text-purple-400">
            {kind === 'member' ? 'groups' : 'album'}
          </span>
          {kind === 'member' ? 'Member' : 'Era'} Badge Progress
        </h2>
        <span className="text-xs text-gray-400 bg-[#302249] px-3 py-1 rounded-full">
          {tracks.length} {kind === 'member' ? 'Members' : 'Eras'}
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {tracks.map(track => {
          const displayName =
            track.definition.displayName || track.definition.key
          const earnedCount = milestones.filter(
            ms => getBadgeStatus(kind, track.track.key, ms.level) === 'earned'
          ).length

          return (
            <div
              key={track.track.key}
              className="bg-[#231b2e] border border-[#302249] rounded-xl p-4 hover:border-purple-500/30 transition-colors"
            >
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-white font-bold">{displayName}</h3>
                <span className="text-xs text-gray-400">
                  {earnedCount}/{milestones.length} badges
                </span>
              </div>

              <div className="flex gap-2">
                {milestones.map(ms => {
                  const status = getBadgeStatus(kind, track.track.key, ms.level)
                  const imagePath = `/badges/mastery/milestone-${ms.level}.png`

                  return (
                    <div
                      key={ms.level}
                      className={`relative flex-1 aspect-square rounded-lg flex items-center justify-center p-1 transition-all ${status === 'earned'
                        ? 'bg-purple-500/20 border border-purple-500/40'
                        : status === 'claimable'
                          ? 'bg-yellow-500/20 border border-yellow-500/40 animate-pulse'
                      : 'bg-[#161022] border border-[#302249]'
                        }`}
                      title={`Level ${ms.level} - ${status}`}
                    >
                      <Image
                        src={imagePath}
                        alt={`Level ${ms.level}`}
                        width={32}
                        height={32}
                        className="w-full h-full object-contain"
                        onError={e => {
                          const target = e.target as HTMLImageElement
                          target.style.display = 'none'
                          const parent = target.parentElement
                          if (parent) {
                            const color =
                              status === 'earned'
                                ? 'text-purple-400'
                                : status === 'claimable'
                                  ? 'text-yellow-400'
                                  : 'text-gray-600'
                            parent.innerHTML = `<span class="material-symbols-outlined text-sm ${color}">workspace_premium</span>`
                          }
                        }}
                      />
                      {status === 'earned' && (
                        <span className="absolute -top-1 -right-1 material-symbols-outlined text-green-400 text-xs bg-[#231b2e] rounded-full">
                          check_circle
                        </span>
                      )}
                      {status === 'claimable' && (
                        <span className="absolute -top-1 -right-1 material-symbols-outlined text-yellow-400 text-xs bg-[#231b2e] rounded-full">
                          redeem
                        </span>
                      )}
                    </div>
                  )
                })}
              </div>

              <div className="mt-2 text-[10px] text-gray-500 flex justify-between">
                <span>Lvl {track.track.level}</span>
                <span>{track.track.xp} XP</span>
              </div>
            </div>
          )
        })}
      </div>

      {tracks.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          <span className="material-symbols-outlined text-4xl mb-2">
            emoji_events
          </span>
          <p>No {kind} tracks available yet</p>
        </div>
      )}
    </div>
  )
}
