'use client'

import Link from 'next/link'

export default function BentoLoreQuests() {
  return (
    <Link href="/auth/signin" className="bento-card col-span-1 md:col-span-3 lg:col-span-3 row-span-1 rounded-2xl p-4 sm:p-5 md:p-6 flex flex-col justify-center group hover:bg-white/5 transition-colors">
      <div className="flex items-center gap-3 md:gap-4 mb-2 md:mb-3">
        <div className="p-2 rounded-lg bg-primary/20 text-primary group-hover:bg-primary/30 transition-colors">
          <svg className="w-5 h-5 md:w-6 md:h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
          </svg>
        </div>
        <h3 className="text-base sm:text-lg md:text-xl font-bold text-white font-display group-hover:text-primary transition-colors">
          Lore Quests
        </h3>
      </div>
      <p className="text-gray-400 text-xs sm:text-sm leading-relaxed font-body">
        10-question BTS quizzes with performance-based photocard drops across every era.
      </p>
    </Link>
  )
}
