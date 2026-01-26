'use client'

import { useEffect, useState } from 'react'

type StreakInfo = {
  current: number
  nextMilestone: number
  daysRemaining?: number // For daily
  weeksRemaining?: number // For weekly
}

export default function QuestBoardHeader({ dailyStreak }: { dailyStreak?: StreakInfo }) {
  const [timeLeft, setTimeLeft] = useState(() => getTimeLeft())

  useEffect(() => {
    const update = () => setTimeLeft(getTimeLeft())
    update()
    const id = setInterval(update, 60 * 1000)
    return () => clearInterval(id)
  }, [])

  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 md:gap-4 mb-2">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-white mb-1">Quest Board</h1>
        <p className="text-gray-400 text-xs md:text-sm">Complete tasks to earn Dust and XP.</p>
        <div className="mt-2 flex flex-wrap items-center gap-2 text-[10px] md:text-xs text-gray-400">
          <div className="px-2 py-1 rounded-full bg-white/5 border border-white/10">
            Daily resets in <span className="text-gray-200 font-semibold">{timeLeft.daily}</span>
          </div>
          <div className="px-2 py-1 rounded-full bg-white/5 border border-white/10">
            Weekly resets in <span className="text-gray-200 font-semibold">{timeLeft.weekly}</span>
          </div>
          <span className="text-[10px] text-gray-500">UTC</span>
        </div>
      </div>
      
      {dailyStreak && (
        <div className="bora-glass-panel rounded-xl p-2 md:p-3 flex items-center gap-2 md:gap-4 border-l-2 md:border-l-4 border-l-orange-500 w-full sm:w-auto">
          <div className="bg-orange-500/20 p-1.5 md:p-2 rounded-xl">
            <span className="material-symbols-outlined text-orange-500 text-base md:text-xl">local_fire_department</span>
          </div>
          <div className="flex-1">
            <div className="text-[10px] md:text-xs text-gray-400 uppercase font-semibold">Streak</div>
            <div className="text-lg md:text-xl font-bold text-white flex items-baseline gap-1">
                {dailyStreak.current} <span className="text-xs font-normal text-gray-500">days</span>
            </div>
          </div>
          <div className="h-8 w-[1px] bg-white/10 hidden sm:block"></div>
          <div className="hidden sm:block">
            <div className="text-[10px] text-gray-400">Next Bonus</div>
            <div className="text-xs font-medium text-orange-300">{dailyStreak.daysRemaining ?? '?'} Days</div>
          </div>
        </div>
      )}
    </div>
  )
}

function getTimeLeft() {
  const now = new Date()

  const nextDaily = new Date(Date.UTC(
    now.getUTCFullYear(),
    now.getUTCMonth(),
    now.getUTCDate() + 1,
    0, 0, 0, 0
  ))

  const day = now.getUTCDay()
  let daysUntilMonday = (8 - day) % 7
  if (daysUntilMonday === 0) daysUntilMonday = 7

  const nextWeekly = new Date(Date.UTC(
    now.getUTCFullYear(),
    now.getUTCMonth(),
    now.getUTCDate() + daysUntilMonday,
    0, 0, 0, 0
  ))

  return {
    daily: formatDuration(nextDaily.getTime() - now.getTime()),
    weekly: formatDuration(nextWeekly.getTime() - now.getTime())
  }
}

function formatDuration(ms: number) {
  const totalMinutes = Math.max(0, Math.ceil(ms / 60000))
  const hours = Math.floor(totalMinutes / 60)
  const minutes = totalMinutes % 60
  return `${hours}h ${String(minutes).padStart(2, '0')}m`
}
