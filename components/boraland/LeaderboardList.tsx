'use client'

import { useEffect, useState, useCallback } from 'react'
import Image from 'next/image'
import { apiFetch } from '@/lib/client/api'
import ProfileViewModal from '@/components/profile/ProfileViewModal'
import { PiCrownFill, PiGlobeHemisphereWestFill, PiArrowUp, PiArrowDown, PiMinus } from 'react-icons/pi'

type LeaderboardEntry = {
  _id: string
  userId: string
  avatarUrl?: string
  displayName: string
  score: number
  level: number
  rank: number
  rankChange?: number | null
  stats?: {
    quizzesPlayed: number
    questionsCorrect: number
    totalQuestions: number
  }
  isPlaceholder?: boolean
}

export type UserEntry = {
  avatarUrl?: string
  displayName: string
  score: number
  level: number
  rank?: number
  rankChange?: number | null
  xpProgress?: number
  xpToNextLevel?: number
  totalXp?: number
  xpIntoLevel?: number
  xpForNextLevel?: number
  stats?: {
    quizzesPlayed: number
    questionsCorrect: number
    totalQuestions: number
  }
}

export type TimeFrame = 'daily' | 'weekly' | 'alltime'

type LeaderboardResponse = {
  period: string
  periodKey: string
  entries: LeaderboardEntry[]
  nextCursor?: string
  me: UserEntry | null
}

type LeaderboardListProps = {
  timeFrame: TimeFrame
  onTimeFrameChange: (frame: TimeFrame) => void
  onMeChange?: (me: UserEntry | null) => void
}

const TOP_SLOTS = 10

function placeholderEntry(rank: number): LeaderboardEntry {
  return {
    _id: `placeholder-${rank}`,
    userId: '',
    avatarUrl: '/avatar-placeholder.svg',
    displayName: 'Open Slot',
    score: 0,
    level: 1,
    rank,
    rankChange: null,
    stats: { quizzesPlayed: 0, questionsCorrect: 0, totalQuestions: 0 },
    isPlaceholder: true
  }
}

export default function LeaderboardList({ timeFrame, onTimeFrameChange, onMeChange }: LeaderboardListProps) {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([])
  const [cursor, setCursor] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isLoadingMore, setIsLoadingMore] = useState(false)

  const load = useCallback(async (next?: string | null) => {
    if (next) {
      setIsLoadingMore(true)
    } else {
      setError(null)
      setIsLoading(true)
      onMeChange?.(null)
    }

    try {
      // Refresh current user's profile data in leaderboard on first load
      if (!next) {
        try {
          await apiFetch(`/api/game/leaderboard/refresh?period=${timeFrame}`, { method: 'POST' })
        } catch (err) {
          console.warn('Failed to refresh leaderboard profile:', err)
        }
      }

      const res = await apiFetch(`/api/game/leaderboard?period=${timeFrame}${next ? `&cursor=${next}` : ''}`) as LeaderboardResponse

      if (next) {
        setEntries((prev) => [...prev, ...res.entries])
      } else {
        setEntries(res.entries)
      }

      setCursor(res.nextCursor || null)
      onMeChange?.(res.me || null)
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed to load')
    } finally {
      if (next) setIsLoadingMore(false)
      else setIsLoading(false)
    }
  }, [timeFrame, onMeChange])

  useEffect(() => {
    load(null)
  }, [load])

  // Split entries into top 3 and rest
  const paddedTop = Array.from({ length: TOP_SLOTS }, (_, index) => entries[index] || placeholderEntry(index + 1))
  const top3 = paddedTop.slice(0, 3)
  const rest = [...paddedTop.slice(3), ...entries.slice(TOP_SLOTS)]
  const xpHeader = timeFrame === 'alltime' ? 'Total XP' : 'Period XP'

  // Helper to get rank change component
  const getRankChangeIndicator = (change: number | null | undefined) => {
    if (change === null || change === undefined) return null
    if (change > 0) return <span className="text-green-500 flex items-center gap-0.5 text-xs"><PiArrowUp />{change}</span>
    if (change < 0) return <span className="text-red-500 flex items-center gap-0.5 text-xs"><PiArrowDown />{Math.abs(change)}</span>
    return <span className="text-gray-500 flex items-center gap-0.5 text-xs"><PiMinus />0</span>
  }

  if (isLoading) {
    return (
      <div className="w-full flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="w-full">
      {/* Header Section */}
      <div data-tour="leaderboard-header" className="flex flex-col md:flex-row justify-between items-end mb-8 gap-4">
        <div>
          <h2 className="text-3xl font-bold dark:text-white mb-2 flex items-center gap-2">
            Global Rankings <PiGlobeHemisphereWestFill className="text-primary" />
          </h2>
          <p className="text-gray-500 dark:text-gray-400">Compete with ARMYs worldwide and earn exclusive rewards.</p>
        </div>
        <div data-tour="leaderboard-tabs" className="bg-white dark:bg-[#1e1b2e] p-1 rounded-xl shadow-sm border border-gray-200 dark:border-white/10 inline-flex">
          <button
            onClick={() => onTimeFrameChange('daily')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${timeFrame === 'daily' ? 'bg-primary text-white shadow-md' : 'hover:text-primary dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-white/5'}`}
          >
            Daily
          </button>
          <button
            onClick={() => onTimeFrameChange('weekly')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${timeFrame === 'weekly' ? 'bg-primary text-white shadow-md' : 'hover:text-primary dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-white/5'}`}
          >
            Weekly
          </button>
          <button
            onClick={() => onTimeFrameChange('alltime')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${timeFrame === 'alltime' ? 'bg-primary text-white shadow-md' : 'hover:text-primary dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-white/5'}`}
          >
            All-Time
          </button>
        </div>
      </div>

      {error && <div className="mb-4 text-rose-300 text-sm">{error}</div>}

      {/* Podium Section */}
      {top3.length > 0 && (
        <div data-tour="leaderboard-list" className="flex items-end justify-center gap-4 mb-12 min-h-[300px] px-4">
          {/* 2nd Place */}
          {top3[1] && (
            <div
              className="flex flex-col items-center w-1/3 max-w-[220px]"
              onClick={() => top3[1].isPlaceholder ? null : setSelectedUserId(top3[1].userId)}
            >
              <div className="mb-3 relative group cursor-pointer">
                {!top3[1].isPlaceholder && top3[1].rankChange !== undefined && top3[1].rankChange !== null && (
                  <div className="absolute -top-2 left-1/2 -translate-x-1/2 z-10">
                    {getRankChangeIndicator(top3[1].rankChange)}
                  </div>
                )}
                <div className="absolute -inset-0.5 bg-gradient-to-b from-gray-300 to-gray-500 rounded-full opacity-75 blur group-hover:opacity-100 transition duration-1000"></div>
                <div className="w-20 h-20 rounded-full border-4 border-gray-300 relative bg-gray-800 overflow-hidden">
                  <Image
                    src={top3[1].avatarUrl || '/avatar-placeholder.svg'}
                    alt="2nd Place"
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 bg-gray-300 text-gray-900 text-xs font-bold px-2 py-0.5 rounded-full shadow-lg">#2</div>
              </div>
              <div className="bg-white/80 dark:bg-[#1e1b2e]/60 backdrop-blur-md border-t-4 border-gray-300 w-full p-4 rounded-xl text-center shadow-lg">
                <h3 className="font-bold text-gray-900 dark:text-white truncate">{top3[1].displayName}</h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">Level {top3[1].level}</p>
                <div className="text-lg font-bold text-primary">{top3[1].isPlaceholder ? '—' : `${top3[1].score.toLocaleString()} XP`}</div>
                {top3[1].isPlaceholder && <div className="text-[10px] text-gray-400 mt-1">Play to claim</div>}
              </div>
            </div>
          )}

          {/* 1st Place */}
          {top3[0] && (
            <div
              className="flex flex-col items-center w-1/3 max-w-[240px] z-10 -mb-4"
              onClick={() => top3[0].isPlaceholder ? null : setSelectedUserId(top3[0].userId)}
            >
              <PiCrownFill className="text-4xl text-yellow-400 mb-2 drop-shadow-lg animate-bounce" />
              <div className="mb-3 relative group cursor-pointer">
                {!top3[0].isPlaceholder && top3[0].rankChange !== undefined && top3[0].rankChange !== null && (
                  <div className="absolute -top-2 left-1/2 -translate-x-1/2 z-10">
                    {getRankChangeIndicator(top3[0].rankChange)}
                  </div>
                )}
                <div className="absolute -inset-1 bg-gradient-to-b from-yellow-300 to-yellow-600 rounded-full opacity-75 blur group-hover:opacity-100 transition duration-1000"></div>
                <div className="w-28 h-28 rounded-full border-4 border-yellow-400 relative bg-gray-800 overflow-hidden">
                  <Image
                    src={top3[0].avatarUrl || '/avatar-placeholder.svg'}
                    alt="1st Place"
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 bg-yellow-400 text-yellow-900 text-sm font-bold px-3 py-0.5 rounded-full shadow-lg shadow-yellow-500/50">#1</div>
              </div>
              <div className="bg-white/90 dark:bg-[#1e1b2e]/80 backdrop-blur-md border-t-4 border-yellow-400 w-full p-6 rounded-t-2xl rounded-b-xl text-center shadow-[0_0_10px_rgba(139,92,246,0.5),0_0_20px_rgba(139,92,246,0.3)] relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-yellow-400/10 to-transparent pointer-events-none"></div>
                <h3 className="font-bold text-lg text-gray-900 dark:text-white truncate">{top3[0].displayName}</h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">Level {top3[0].level}</p>
                <div className="text-xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-500">
                  {top3[0].isPlaceholder ? '—' : `${top3[0].score.toLocaleString()} XP`}
                </div>
                {top3[0].isPlaceholder && <div className="text-[10px] text-gray-400 mt-1">Play to claim</div>}
              </div>
            </div>
          )}

          {/* 3rd Place */}
          {top3[2] && (
            <div
              className="flex flex-col items-center w-1/3 max-w-[220px]"
              onClick={() => top3[2].isPlaceholder ? null : setSelectedUserId(top3[2].userId)}
            >
              <div className="mb-3 relative group cursor-pointer">
                {!top3[2].isPlaceholder && top3[2].rankChange !== undefined && top3[2].rankChange !== null && (
                  <div className="absolute -top-2 left-1/2 -translate-x-1/2 z-10">
                    {getRankChangeIndicator(top3[2].rankChange)}
                  </div>
                )}
                <div className="absolute -inset-0.5 bg-gradient-to-b from-orange-400 to-orange-700 rounded-full opacity-75 blur group-hover:opacity-100 transition duration-1000"></div>
                <div className="w-20 h-20 rounded-full border-4 border-orange-600 relative bg-gray-800 overflow-hidden">
                  <Image
                    src={top3[2].avatarUrl || '/avatar-placeholder.svg'}
                    alt="3rd Place"
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 bg-orange-600 text-white text-xs font-bold px-2 py-0.5 rounded-full shadow-lg">#3</div>
              </div>
              <div className="bg-white/80 dark:bg-[#1e1b2e]/60 backdrop-blur-md border-t-4 border-orange-600 w-full p-4 rounded-xl text-center shadow-lg">
                <h3 className="font-bold text-gray-900 dark:text-white truncate">{top3[2].displayName}</h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">Level {top3[2].level}</p>
                <div className="text-lg font-bold text-primary">{top3[2].isPlaceholder ? '—' : `${top3[2].score.toLocaleString()} XP`}</div>
                {top3[2].isPlaceholder && <div className="text-[10px] text-gray-400 mt-1">Play to claim</div>}
              </div>
            </div>
          )}
        </div>
      )}

      {/* List Section */}
      <div className="bg-white/50 dark:bg-[#1e1b2e]/40 rounded-2xl border border-gray-200 dark:border-white/5 backdrop-blur-sm p-4">
        <div className="grid grid-cols-12 gap-4 text-xs font-semibold uppercase text-gray-400 px-6 py-3">
          <div className="col-span-1">Rank</div>
          <div className="col-span-6">Player</div>
          <div className="col-span-2 text-center">Level</div>
          <div className="col-span-3 text-right">{xpHeader}</div>
        </div>
        <div className="space-y-2">
          {rest.map((e) => (
            <div
              key={e._id}
              onClick={() => e.isPlaceholder ? null : setSelectedUserId(e.userId)}
              className={`grid grid-cols-12 gap-4 items-center bg-white dark:bg-[#181524] hover:bg-gray-50 dark:hover:bg-[#1f1b2e] p-4 rounded-xl border border-gray-100 dark:border-white/5 transition-all group ${e.isPlaceholder ? 'opacity-60 cursor-default' : 'cursor-pointer'}`}
            >
              <div className="col-span-1">
                <div className="flex items-center gap-1">
                  <span className="text-gray-500 font-bold">{String(e.rank).padStart(2, '0')}</span>
                  {!e.isPlaceholder && e.rankChange !== undefined && e.rankChange !== null && (
                    <span className="text-xs">{getRankChangeIndicator(e.rankChange)}</span>
                  )}
                </div>
              </div>
              <div className="col-span-6 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-white/5 relative overflow-hidden">
                  <Image
                    src={e.avatarUrl || '/avatar-placeholder.svg'}
                    alt="Avatar"
                    fill
                    className="object-cover"
                  />
                </div>
                <div>
                  <div className="font-semibold text-gray-900 dark:text-white group-hover:text-primary transition-colors">{e.displayName}</div>
                  <div className="text-xs text-gray-400">{e.isPlaceholder ? 'Play to claim' : 'Title: ARMY'}</div>
                </div>
              </div>
              <div className="col-span-2 text-center">
                <span className="bg-primary/10 text-primary px-2 py-1 rounded text-xs font-bold">{e.level}</span>
              </div>
              <div className="col-span-3 text-right font-mono font-medium text-gray-700 dark:text-gray-300">{e.isPlaceholder ? '—' : e.score.toLocaleString()}</div>
            </div>
          ))}
        </div>

        {cursor && (
          <button
            onClick={() => load(cursor)}
            disabled={isLoadingMore}
            className="w-full mt-4 py-3 text-sm text-gray-500 dark:text-gray-400 hover:text-primary dark:hover:text-white transition-colors border-t border-gray-200 dark:border-white/5 disabled:opacity-50"
          >
            {isLoadingMore ? 'Loading...' : 'View More Rankings'}
          </button>
        )}
      </div>

      {/* Profile View Modal */}
      <ProfileViewModal userId={selectedUserId} onClose={() => setSelectedUserId(null)} />
    </div>
  )
}
