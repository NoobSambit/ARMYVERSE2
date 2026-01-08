'use client'

import Link from 'next/link'

export default function BentoCrafting() {
  return (
    <Link href="/auth/signin" className="bento-card col-span-1 md:col-span-2 lg:col-span-2 row-span-1 rounded-2xl p-4 sm:p-5 md:p-6 flex items-center gap-3 md:gap-4 group hover:bg-white/5 transition-colors">
      <div className="size-10 md:size-12 rounded-full bg-accent-green/20 flex items-center justify-center shrink-0 group-hover:bg-accent-green/30 transition-colors">
        <svg className="w-5 h-5 md:w-6 md:h-6 text-accent-green" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      </div>
      <div className="flex-1 min-w-0">
        <h4 className="text-white font-bold text-sm sm:text-base md:text-lg leading-tight font-display group-hover:text-accent-green transition-colors">
          Stardust Crafting
        </h4>
        <p className="text-gray-400 text-[10px] sm:text-xs md:text-sm mt-0.5 md:mt-1 font-body">
          Convert duplicates into Stardust and craft exact cards
        </p>
      </div>
      <svg className="w-5 h-5 text-gray-500 group-hover:text-white group-hover:translate-x-1 transition-all" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
      </svg>
    </Link>
  )
}
