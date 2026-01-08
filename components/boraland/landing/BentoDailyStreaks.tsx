'use client'

import Link from 'next/link'

export default function BentoDailyStreaks() {
  const maxStreak = 7
  const currentStreak = 5
  const streakDays = Array.from({ length: maxStreak }, (_, i) => i < currentStreak)

  return (
    <Link
      href="/auth/signin"
      className="bento-card col-span-1 md:col-span-2 lg:col-span-2 row-span-1 rounded-2xl p-4 sm:p-5 md:p-6 flex flex-col justify-between bg-gradient-to-br from-surface-dark/40 to-primary/10"
    >
      <div className="flex justify-between items-start">
        <div className="flex flex-col">
          <span className="text-[10px] md:text-xs uppercase tracking-wider text-primary font-bold mb-1 font-display">
            Quest Streaks
          </span>
          <h3 className="text-sm sm:text-base md:text-xl font-bold text-white font-display">
            Daily + Weekly Streaks
          </h3>
        </div>
        <div className="p-1.5 md:p-2 bg-accent-green/20 text-accent-green rounded-full">
          <svg className="w-4 h-4 md:w-5 md:h-5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12.9 2.15c.13-.36.52-.51.87-.34l8 4c.33.16.48.55.36.89l-.9 2.7c-.12.36-.5.55-.86.43L2.15 5.1c-.36-.13-.51-.52-.34-.87l1.35-2.7c.13-.26.42-.41.71-.36l9.03 1.98z" />
            <path d="M13 10v11c0 .55-.45 1-1 1s-1-.45-1-1V10c0-.55.45-1 1-1s1 .45 1 1z" />
          </svg>
        </div>
      </div>

      <div className="mt-3 md:mt-4">
        <div className="flex justify-between text-[10px] sm:text-xs text-gray-400 mb-1.5 md:mb-2 font-body">
          <span>Current Streak</span>
          <span className="text-white font-bold font-display">{currentStreak} Days</span>
        </div>
        <div className="flex gap-1">
          {streakDays.map((completed, i) => (
            <div
              key={i}
              className={`h-2 flex-1 rounded-full transition-all duration-300 ${
                completed ? 'bg-accent-green shadow-[0_0_8px_rgba(57,255,20,0.5)]' : 'bg-white/10'
              }`}
            />
          ))}
        </div>
        <p className="text-[10px] sm:text-xs text-gray-400 mt-2 md:mt-3 font-body">
          Complete quests to earn streak and milestone badges
        </p>
      </div>
    </Link>
  )
}
