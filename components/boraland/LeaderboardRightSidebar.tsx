'use client'

import Image from 'next/image'
import { getPercentileCategory } from '@/lib/game/leaderboard'
import type { TimeFrame, UserEntry } from './LeaderboardList'

type LeaderboardRightSidebarProps = {
  timeFrame: TimeFrame
  me: UserEntry | null
}

const timeFrameLabelMap: Record<TimeFrame, string> = {
  daily: 'Daily',
  weekly: 'Weekly',
  alltime: 'All-Time'
}

const resetCopyMap: Record<TimeFrame, string> = {
  daily: 'Resets every day at 00:00 UTC.',
  weekly: 'Resets every Monday at 00:00 UTC.',
  alltime: 'Never resets. All-time standings only.'
}

export default function LeaderboardRightSidebar({ timeFrame, me }: LeaderboardRightSidebarProps) {
  const rankLabel = me?.rank ? `#${me.rank.toLocaleString()}` : '—'
  const percentile = me?.rank ? getPercentileCategory(me.rank) : 'No rank yet'
  const xpIntoLevel = me?.xpIntoLevel || 0
  const xpForNextLevel = me?.xpForNextLevel || 0
  const xpToNextLevel = me?.xpToNextLevel || 0
  const progressPercent = me?.xpProgress || 0
  const accuracy = me?.stats?.totalQuestions
    ? Math.round((me.stats.questionsCorrect / me.stats.totalQuestions) * 100)
    : null
  const xpLabel = timeFrame === 'alltime' ? 'Total XP' : 'Period XP'

  return (
    <aside className="w-80 bg-white dark:bg-[#130f26] border-l border-gray-200 dark:border-white/5 hidden xl:flex flex-col p-6 overflow-y-auto shrink-0 h-full">
      {/* Your Rank Card */}
      <div className="bg-gradient-to-br from-[#2d1b4e] to-[#1e1b2e] rounded-2xl p-6 border border-white/5 shadow-lg relative overflow-hidden mb-6">
        <div className="absolute -right-6 -top-6 w-32 h-32 bg-primary/20 rounded-full blur-2xl"></div>
        <h3 className="text-sm font-bold text-gray-300 uppercase mb-4 flex items-center gap-2">
          {timeFrameLabelMap[timeFrame]} Rank
        </h3>
        <div className="flex items-center gap-4 mb-6">
          <div className="w-16 h-16 rounded-full border-2 border-primary p-0.5">
            <div className="w-full h-full rounded-full bg-gray-800 relative overflow-hidden">
              <Image
                src={me?.avatarUrl || '/avatar-placeholder.svg'}
                alt="User"
                fill
                className="object-cover"
              />
            </div>
          </div>
          <div>
            <div className="text-2xl font-bold text-white">{rankLabel}</div>
            <div className="text-xs text-gray-400">{percentile}</div>
          </div>
        </div>
        <div className="space-y-1 mb-2">
          <div className="flex justify-between text-xs font-semibold">
            <span className="text-gray-300">Level {me?.level || 1}</span>
            <span className="text-primary">{xpForNextLevel ? `${xpIntoLevel}/${xpForNextLevel} XP` : '—'}</span>
          </div>
          <div className="h-2 w-full bg-black/40 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-blue-500 to-primary rounded-full shadow-[0_0_10px_rgba(139,92,246,0.5)]"
              style={{ width: `${Math.min(100, Math.max(0, progressPercent))}%` }}
            ></div>
          </div>
          <div className="text-[10px] text-right text-gray-500">
            {xpForNextLevel ? `${xpToNextLevel} XP to Level ${(me?.level || 1) + 1}` : 'Complete a quiz to rank'}
          </div>
        </div>
      </div>

      {/* Performance Stats */}
      <div className="mb-6">
        <h3 className="text-sm font-bold text-gray-900 dark:text-gray-100 mb-4">Performance</h3>
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-gray-50 dark:bg-white/5 p-4 rounded-xl border border-gray-200 dark:border-white/5 text-center">
            <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">{xpLabel}</div>
            <div className="text-xl font-bold dark:text-white">{me ? me.score.toLocaleString() : '—'}</div>
          </div>
          <div className="bg-gray-50 dark:bg-white/5 p-4 rounded-xl border border-gray-200 dark:border-white/5 text-center">
            <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Accuracy</div>
            <div className="text-xl font-bold text-orange-500 flex items-center justify-center gap-1">
              {accuracy !== null ? `${accuracy}%` : '—'}
            </div>
          </div>
        </div>
      </div>

      {/* Ranking Tips */}
      <div className="mb-6">
        <h3 className="text-sm font-bold text-gray-900 dark:text-gray-100 mb-4">Ranking Tips</h3>
        <div className="space-y-2">
          <div className="flex items-center justify-between p-3 rounded-lg bg-gradient-to-r from-yellow-500/10 to-transparent border border-yellow-500/20">
            <div className="flex items-center gap-2">
              <span className="text-lg">🥇</span>
              <span className="text-sm font-semibold dark:text-white">Top 1</span>
            </div>
            <span className="text-xs text-yellow-500 font-bold">Hold #1 for glory</span>
          </div>
          <div className="flex items-center justify-between p-3 rounded-lg bg-gradient-to-r from-gray-400/10 to-transparent border border-gray-400/20">
            <div className="flex items-center gap-2">
              <span className="text-lg">🥈</span>
              <span className="text-sm font-semibold dark:text-white">Top 10</span>
            </div>
            <span className="text-xs text-gray-400 font-bold">Stay consistent</span>
          </div>
          <div className="flex items-center justify-between p-3 rounded-lg bg-gradient-to-r from-orange-600/10 to-transparent border border-orange-600/20">
            <div className="flex items-center gap-2">
              <span className="text-lg">🥉</span>
              <span className="text-sm font-semibold dark:text-white">Top 100</span>
            </div>
            <span className="text-xs text-orange-400 font-bold">Grind daily XP</span>
          </div>
        </div>
      </div>

      {/* Competition Info */}
      <div className="bg-gradient-to-br from-pink-500/10 to-purple-500/10 rounded-2xl p-4 border border-white/5">
        <h4 className="text-sm font-bold dark:text-white mb-2">{timeFrameLabelMap[timeFrame]} Competition</h4>
        <p className="text-xs text-gray-400 dark:text-gray-300 mb-3">
          {resetCopyMap[timeFrame]}
        </p>
        <div className="text-xs text-gray-400">
          Earn XP through quizzes and quests to climb the ranks.
        </div>
      </div>
    </aside>
  )
}
