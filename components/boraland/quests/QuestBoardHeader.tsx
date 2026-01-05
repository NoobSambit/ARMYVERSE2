'use client'

type StreakInfo = {
  current: number
  nextMilestone: number
  daysRemaining?: number // For daily
  weeksRemaining?: number // For weekly
}

export default function QuestBoardHeader({ dailyStreak }: { dailyStreak?: StreakInfo }) {
  return (
    <div className="flex flex-col sm:flex-row justify-between items-end sm:items-center gap-4 mb-2">
      <div>
        <h1 className="text-3xl font-bold text-white mb-1">Quest Board</h1>
        <p className="text-gray-400 text-sm">Complete tasks to earn Dust and XP.</p>
      </div>
      
      {dailyStreak && (
        <div className="bora-glass-panel rounded-xl p-3 flex items-center gap-4 border-l-4 border-l-orange-500 pr-6 min-w-[200px]">
          <div className="bg-orange-500/20 p-2 rounded-xl">
            <span className="material-symbols-outlined text-orange-500">local_fire_department</span>
          </div>
          <div>
            <div className="text-xs text-gray-400 uppercase font-semibold">Current Streak</div>
            <div className="text-xl font-bold text-white flex items-baseline gap-1">
                {dailyStreak.current} <span className="text-xs font-normal text-gray-500">days</span>
            </div>
          </div>
          <div className="h-8 w-[1px] bg-white/10 mx-2"></div>
          <div>
            <div className="text-[10px] text-gray-400">Next Bonus</div>
            <div className="text-xs font-medium text-orange-300">{dailyStreak.daysRemaining ?? '?'} Days</div>
          </div>
        </div>
      )}
    </div>
  )
}
