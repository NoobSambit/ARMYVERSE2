'use client'

type StreakInfo = {
  current: number
  nextMilestone: number
  daysRemaining?: number // For daily
  weeksRemaining?: number // For weekly
}

export default function QuestBoardHeader({ dailyStreak }: { dailyStreak?: StreakInfo }) {
  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 md:gap-4 mb-2">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-white mb-1">Quest Board</h1>
        <p className="text-gray-400 text-xs md:text-sm">Complete tasks to earn Dust and XP.</p>
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
