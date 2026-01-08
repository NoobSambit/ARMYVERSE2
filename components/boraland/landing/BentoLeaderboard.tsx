'use client'

import Link from 'next/link'
import { Trophy } from 'lucide-react'

export default function BentoLeaderboard() {
  return (
    <Link href="/auth/signin" className="bento-card col-span-1 md:col-span-2 lg:col-span-2 row-span-1 rounded-2xl p-4 sm:p-5 md:p-6 flex flex-col justify-center relative overflow-hidden group">
      {/* Background Gradient */}
      <div className="absolute inset-0 bg-gradient-to-r from-background-dark to-transparent z-0" />

      {/* Trophy Icon */}
      <div className="absolute right-0 top-0 h-full w-1/2 md:w-2/3 flex items-center justify-center opacity-10 z-[-1]">
        <Trophy className="w-32 h-32 md:w-40 md:h-40 text-primary" />
      </div>

      <div className="relative z-10">
        <div className="flex items-center gap-2 md:gap-3 mb-2">
          <Trophy className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-primary" />
          <h3 className="text-sm sm:text-base md:text-lg font-bold text-white font-display">Global Leaderboard</h3>
        </div>
        <p className="text-[10px] sm:text-xs md:text-sm text-gray-400 mb-3 md:mb-4 font-body">
          Weekly ranked seasons with global rewards, badges, and rare photocard drops
        </p>

        {/* Top Players Preview */}
        <div className="flex items-center gap-2 md:gap-3">
          <div className="flex -space-x-2 items-center">
            <div className="w-8 h-8 md:w-10 md:h-10 rounded-full border-2 border-background-dark bg-gradient-to-br from-amber-400 to-yellow-300 flex items-center justify-center text-xs font-bold text-amber-900 font-display shadow-lg">
              1
            </div>
            <div className="w-8 h-8 md:w-10 md:h-10 rounded-full border-2 border-background-dark bg-gradient-to-br from-gray-300 to-slate-400 flex items-center justify-center text-xs font-bold text-slate-700 font-display shadow-lg">
              2
            </div>
            <div className="w-8 h-8 md:w-10 md:h-10 rounded-full border-2 border-background-dark bg-gradient-to-br from-amber-600 to-amber-700 flex items-center justify-center text-xs font-bold text-amber-100 font-display shadow-lg">
              3
            </div>
          </div>
          <div className="w-8 h-8 md:w-10 md:h-10 rounded-full border-2 border-background-dark bg-surface-dark flex items-center justify-center text-[10px] md:text-xs font-bold text-white font-display">
            +10k
          </div>
        </div>
      </div>

      {/* Hover Glow */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-transparent rounded-2xl" />
      </div>
    </Link>
  )
}
