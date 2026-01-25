'use client'

import {
  getBadgeImagePath,
  getBadgeRarityColors,
  getBadgeCategory,
} from '@/lib/utils/badgeImages'
import Image from 'next/image'
import StreakBadgeWithOverlay from './StreakBadgeWithOverlay'
import { useEffect } from 'react'

type BadgeItem = {
  id: string
  badge: {
    code: string
    name: string
    description: string
    icon: string
    rarity: 'common' | 'rare' | 'epic' | 'legendary'
    type: 'streak' | 'achievement' | 'event' | 'quest' | 'completion'
    criteria?: {
      streakDays?: number
      streakWeeks?: number
      questPeriod?: 'daily' | 'weekly'
      questType?: 'streaming' | 'quiz' | 'any'
      threshold?: number
    }
  }
  earnedAt: string
  metadata?: {
    streakCount?: number
    questCode?: string
    cyclePosition?: number
    milestoneNumber?: number
    completionDate?: string
    completionStreakCount?: number
    completionType?: 'daily' | 'weekly'
    masteryKind?: 'member' | 'era'
    masteryKey?: string
    masteryLevel?: number
    masteryVariant?: 'milestone' | 'special'
  }
}

type BadgeModalProps = {
  badge: BadgeItem | null
  onClose: () => void
}

export default function BadgeModal({ badge, onClose }: BadgeModalProps) {
  useEffect(() => {
    if (!badge) return
    const handler = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [badge, onClose])

  if (!badge) return null

  const colors = getBadgeRarityColors(badge.badge.rarity)
  const getMasteryInfo = () => {
    const masteryKind = badge.metadata?.masteryKind
    const masteryKey = badge.metadata?.masteryKey
    const masteryLevel = badge.metadata?.masteryLevel
    if (!masteryKind || !masteryKey || !masteryLevel) return null
    return {
      kind: masteryKind,
      key: masteryKey,
      level: masteryLevel,
      variant: badge.metadata?.masteryVariant || 'milestone'
    }
  }

  const masteryInfo = getMasteryInfo()
  const category = masteryInfo
    ? masteryInfo.kind === 'member'
      ? 'Member Mastery'
      : 'Era Mastery'
    : getBadgeCategory(badge.badge.code)

  const isCompletionBadge = badge.badge.code.includes('completion')
  const hasStreakCount = !!(
    badge.metadata?.completionStreakCount || badge.metadata?.streakCount
  )
  const streakCount =
    badge.metadata?.completionStreakCount || badge.metadata?.streakCount || 0
  const completionType =
    badge.metadata?.completionType ||
    (badge.badge.code.includes('daily') ? 'daily' : 'weekly')

  const cyclePosition = streakCount > 0 ? ((streakCount - 1) % 10) + 1 : 1
  const imagePath =
    isCompletionBadge && hasStreakCount
      ? `/badges/${completionType}-streak/streak-${cyclePosition}.png`
      : getBadgeImagePath(badge.badge.code)

  const getStreakLabel = () => {
    if (!streakCount) return null
    const isDaily = badge.badge.code.includes('daily')
    const isWeekly = badge.badge.code.includes('weekly')
    const unit = isDaily ? 'Day' : isWeekly ? 'Week' : null
    if (!unit) return null
    return `${unit} ${streakCount}`
  }

  const displayName = (() => {
    if (masteryInfo) {
      const scope = masteryInfo.kind === 'member' ? 'Mastery' : 'Era Mastery'
      const suffix = masteryInfo.variant === 'special' ? ' (Special)' : ''
      return `${masteryInfo.key} ${scope} - Level ${masteryInfo.level}${suffix}`
    }
    const label = getStreakLabel()
    if (!label) return badge.badge.name
    if (badge.badge.code.includes('streak') || badge.badge.code.includes('completion')) {
      return `${label} - ${badge.badge.name}`
    }
    return badge.badge.name
  })()

  const displayDescription = (() => {
    if (masteryInfo) {
      const scope = masteryInfo.kind === 'member' ? 'member' : 'era'
      return `Reach level ${masteryInfo.level} in ${masteryInfo.key} ${scope} mastery`
    }
    if (badge.metadata?.streakCount) {
      const unit = badge.badge.code.includes('weekly') ? 'weeks' : 'days'
      return `Complete ${badge.metadata.streakCount} ${unit} in a row`
    }
    return badge.badge.description
  })()

  const isNewBadge = (() => {
    const earnedDate = new Date(badge.earnedAt)
    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
    return earnedDate > sevenDaysAgo
  })()

  const earnedDate = new Date(badge.earnedAt)
  const earnedDateFormatted = earnedDate.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
  const earnedTimeFormatted = earnedDate.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
  })

  const formatCyclePosition = (pos: number) => {
    if (pos <= 10) return `Day ${pos} of current streak cycle`
    if (pos <= 20) return `Day ${pos - 10} of second streak cycle`
    if (pos <= 30) return `Day ${pos - 20} of third streak cycle`
    if (pos <= 40) return `Day ${pos - 30} of fourth streak cycle`
    if (pos <= 50) return `Day ${pos - 40} of fifth streak cycle`
    return `Day ${pos}`
  }

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `I earned the ${displayName} badge!`,
          text: `${displayDescription}\n\nRarity: ${badge.badge.rarity}\nCategory: ${category}\nEarned on: ${earnedDateFormatted}`,
          url: window.location.href,
        })
      } catch (err) {
        console.error('Share failed:', err)
      }
    } else {
      navigator.clipboard.writeText(
        `I earned the ${displayName} badge!\n\n${displayDescription}\n\nRarity: ${badge.badge.rarity}\nCategory: ${category}\nEarned on: ${earnedDateFormatted}`
      )
      alert('Badge details copied to clipboard!')
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg rounded-2xl border border-white/10 bg-[#120a24]/95 shadow-2xl overflow-hidden flex flex-col"
        onClick={e => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        <div className="sticky top-0 z-10 flex items-center justify-between gap-3 border-b border-white/10 px-4 py-3 bg-[#120a24]/95 backdrop-blur">
          <div className="min-w-0">
            <p className="text-xs uppercase tracking-wider text-gray-500">
              Badge Details
            </p>
            <h3 className="text-base md:text-lg font-semibold text-white truncate">
              {displayName}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white"
            aria-label="Close details"
          >
            <span className="material-symbols-outlined text-lg">close</span>
          </button>
        </div>

        <div className="p-4 overflow-y-auto">
          <div className="flex flex-col items-center gap-4 mb-6">
            <div className="relative w-32 h-32 rounded-full bg-gradient-to-br from-white/5 to-white/0 flex items-center justify-center">
              {isCompletionBadge && hasStreakCount ? (
                <div className="relative w-full h-full flex items-center justify-center">
                  <StreakBadgeWithOverlay
                    imagePath={imagePath}
                    badgeName={badge.badge.name}
                    streakCount={streakCount}
                    size="xl"
                    fallbackIcon={badge.badge.icon}
                    type={completionType}
                  />
                </div>
              ) : (
                <Image
                  src={imagePath}
                  alt={badge.badge.name}
                  width={128}
                  height={128}
                  className="w-full h-full object-contain"
                  onError={e => {
                    const target = e.target as HTMLImageElement
                    target.style.display = 'none'
                    const parent = target.parentElement
                    if (parent) {
                      parent.innerHTML = `<span class="text-5xl">${badge.badge.icon}</span>`
                    }
                  }}
                />
              )}
            </div>

            <div className="text-center">
              <h2
                className={`text-2xl font-display font-bold ${colors.text} mb-1`}
              >
                {displayName}
              </h2>
              <p className="text-xs text-gray-500 uppercase tracking-wider mb-2">
                {badge.badge.rarity} · {category}
              </p>
              {isNewBadge && (
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-green-500/20 text-green-400 text-[10px] font-bold uppercase tracking-wider border border-green-500/30">
                  <span className="material-symbols-outlined text-[12px]">
                    new_releases
                  </span>
                  New Badge
                </span>
              )}
            </div>

            <p className="text-sm text-gray-300 text-center leading-relaxed">
              {displayDescription}
            </p>
          </div>

          <div className="space-y-3 border-t border-white/10 pt-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <p className="text-[10px] uppercase tracking-wider text-gray-500 mb-1">
                  Badge Type
                </p>
                <p className="text-white text-sm capitalize">
                  {badge.badge.type}
                </p>
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-wider text-gray-500 mb-1">
                  Rarity
                </p>
                <p className={`${colors.text} text-sm capitalize font-medium`}>
                  {badge.badge.rarity}
                </p>
              </div>
            </div>

            <div>
              <p className="text-[10px] uppercase tracking-wider text-gray-500 mb-1">
                Earned Date
              </p>
              <p className="text-white text-sm">{earnedDateFormatted}</p>
              <p className="text-xs text-gray-500">{earnedTimeFormatted}</p>
            </div>

            {badge.metadata?.streakCount && (
              <div>
                <p className="text-[10px] uppercase tracking-wider text-gray-500 mb-1">
                  Streak Count
                </p>
                <p className="text-white text-sm">
                  {badge.metadata.streakCount}{' '}
                  {badge.badge.code.includes('weekly') ? 'weeks' : 'days'}
                </p>
                {badge.metadata.cyclePosition && (
                  <p className="text-xs text-gray-500">
                    {formatCyclePosition(badge.metadata.cyclePosition)}
                  </p>
                )}
              </div>
            )}

            {badge.metadata?.completionStreakCount && (
              <div>
                <p className="text-[10px] uppercase tracking-wider text-gray-500 mb-1">
                  Completion Streak
                </p>
                <p className="text-white text-sm">
                  {badge.metadata.completionStreakCount}{' '}
                  {badge.badge.code.includes('weekly') ? 'weeks' : 'days'}
                </p>
              </div>
            )}

            {badge.metadata?.milestoneNumber && (
              <div>
                <p className="text-[10px] uppercase tracking-wider text-gray-500 mb-1">
                  Milestone Level
                </p>
                <p className="text-white text-sm">
                  Level {badge.metadata.milestoneNumber}
                </p>
              </div>
            )}

            {badge.metadata?.questCode && (
              <div>
                <p className="text-[10px] uppercase tracking-wider text-gray-500 mb-1">
                  Quest
                </p>
                <p className="text-white text-sm font-medium">
                  {badge.metadata.questCode}
                </p>
              </div>
            )}

            {badge.badge.criteria && (
              <div>
                <p className="text-[10px] uppercase tracking-wider text-gray-500 mb-1">
                  Criteria
                </p>
                <div className="space-y-1">
                  {badge.badge.criteria.streakDays && (
                    <p className="text-gray-300 text-sm">
                      {badge.badge.criteria.streakDays} day streak
                    </p>
                  )}
                  {badge.badge.criteria.streakWeeks && (
                    <p className="text-gray-300 text-sm">
                      {badge.badge.criteria.streakWeeks} week streak
                    </p>
                  )}
                  {badge.badge.criteria.questPeriod && (
                    <p className="text-gray-300 text-sm capitalize">
                      {badge.badge.criteria.questPeriod} quest
                    </p>
                  )}
                  {badge.badge.criteria.questType &&
                    badge.badge.criteria.questType !== 'any' && (
                      <p className="text-gray-300 text-sm capitalize">
                        {badge.badge.criteria.questType} quest
                      </p>
                    )}
                  {badge.badge.criteria.threshold && (
                    <p className="text-gray-300 text-sm">
                      Threshold: {badge.badge.criteria.threshold}
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>

          <div className="flex flex-wrap gap-2 pt-4 border-t border-white/10 mt-4">
            <button
              onClick={handleShare}
              className="flex-1 min-w-[140px] px-4 py-2 rounded-xl bg-bora-primary/20 text-bora-primary border border-bora-primary/30 text-sm font-medium hover:bg-bora-primary/30 transition-colors"
            >
              <span className="flex items-center justify-center gap-2">
                <span className="material-symbols-outlined text-base">
                  share
                </span>
                Share Badge
              </span>
            </button>
            <button
              onClick={onClose}
              className="flex-1 min-w-[140px] px-4 py-2 rounded-xl bg-white/5 text-gray-200 border border-white/10 text-sm font-medium hover:bg-white/10 hover:border-white/30 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
