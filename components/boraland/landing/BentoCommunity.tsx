'use client'

import Link from 'next/link'

export default function BentoCommunity() {
  return (
    <Link href="/auth/signin" className="bento-card col-span-1 md:col-span-2 lg:col-span-2 row-span-1 rounded-2xl p-4 sm:p-5 md:p-6 flex items-center gap-3 md:gap-4 group hover:bg-white/5 transition-colors">
      <div className="size-10 md:size-12 rounded-full bg-primary/20 flex items-center justify-center shrink-0 group-hover:bg-primary/30 transition-colors">
        <svg className="w-5 h-5 md:w-6 md:h-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      </div>
      <div className="flex-1 min-w-0">
        <h4 className="text-white font-bold text-sm sm:text-base md:text-lg leading-tight font-display group-hover:text-primary transition-colors">
          Quest Challenges
        </h4>
        <p className="text-gray-400 text-[10px] sm:text-xs md:text-sm mt-0.5 md:mt-1 font-body">
          Daily and weekly quests for Stardust, XP, and badges
        </p>
      </div>
      <svg className="w-5 h-5 text-gray-500 group-hover:text-white group-hover:translate-x-1 transition-all" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
      </svg>
    </Link>
  )
}
