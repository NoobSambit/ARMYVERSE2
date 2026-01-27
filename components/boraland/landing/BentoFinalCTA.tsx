'use client'

import Link from 'next/link'

export default function BentoFinalCTA() {
  return (
    <div data-tour="landing-cta" className="bento-card col-span-1 md:col-span-4 lg:col-span-6 row-span-2 rounded-3xl p-5 sm:p-6 md:p-8 lg:p-12 flex flex-col md:flex-row items-center justify-between gap-4 md:gap-8 relative overflow-hidden group">
      {/* Gradient Background - matches original design */}
      <div className="absolute inset-0 bg-gradient-to-r from-primary/20 via-background-dark to-accent-green/10 z-0" />
      <div className="absolute -right-20 -bottom-40 w-60 md:w-80 h-60 md:h-80 bg-primary/40 rounded-full blur-[60px] md:blur-[80px] group-hover:bg-primary/50 transition-colors duration-500" />

      {/* Content */}
      <div className="relative z-10 max-w-2xl text-center md:text-left">
        <h2 className="text-xl sm:text-2xl md:text-4xl lg:text-5xl font-black text-white mb-3 md:mb-4 leading-tight font-display">
          READY TO START YOUR RUN?
        </h2>
        <p className="text-sm sm:text-base md:text-lg text-gray-300 font-body">
          Play quizzes, complete quests, and craft your way to a legendary photocard collection.
        </p>
        <div className="flex items-center gap-3 md:gap-4 mt-4 md:mt-6 justify-center md:justify-start flex-wrap">
          <div className="flex items-center gap-1.5 text-gray-400 text-xs md:text-sm font-body">
            <svg className="w-4 h-4 md:w-5 md:h-5 text-accent-green flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
            </svg>
            <span>Free to Play</span>
          </div>
          <div className="w-1 h-1 bg-gray-600 rounded-full"></div>
          <div className="flex items-center gap-1.5 text-gray-400 text-xs md:text-sm font-body">
            <svg className="w-4 h-4 md:w-5 md:h-5 text-accent-green flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
            </svg>
            <span>No Downloads</span>
          </div>
          <div className="w-1 h-1 bg-gray-600 rounded-full hidden md:block"></div>
          <div className="flex items-center gap-1.5 text-gray-400 text-xs md:text-sm font-body hidden md:flex">
            <svg className="w-4 h-4 md:w-5 md:h-5 text-accent-green flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
            </svg>
            <span>Mobile Friendly</span>
          </div>
        </div>
      </div>

      {/* CTA Button */}
      <div className="relative z-10 w-full md:w-auto">
        <Link
          href="/auth/signin"
          className="w-full md:w-auto bg-primary text-background-dark hover:bg-primary/90 h-12 md:h-16 px-6 sm:px-8 md:px-12 rounded-full font-black text-base sm:text-lg md:text-xl transition-all shadow-[0_0_20px_rgba(0,240,255,0.3)] hover:shadow-[0_0_30px_rgba(0,240,255,0.5)] transform hover:scale-105 font-display flex items-center justify-center gap-2"
        >
          Activate Account
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
          </svg>
        </Link>
        <p className="text-center text-gray-500 text-[10px] md:text-xs mt-2 md:mt-3 font-body">
          No payment required • Start playing instantly
        </p>
      </div>
    </div>
  )
}
