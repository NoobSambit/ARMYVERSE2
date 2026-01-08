'use client'

import Link from 'next/link'

export default function BentoNavbar() {
  return (
    <nav className="fixed top-0 left-0 w-full z-50 px-4 md:px-6 py-3 md:py-4 flex justify-between items-center pointer-events-none">
      {/* Logo */}
      <div className="pointer-events-auto backdrop-blur-md bg-background-dark/80 px-3 md:px-4 py-2 rounded-full border border-white/10 flex items-center gap-2 hover:border-white/20 transition-colors">
        <div className="size-5 md:size-6 text-primary">
          <svg className="w-5 h-5 md:w-6 md:h-6" fill="currentColor" viewBox="0 0 24 24">
            <path d="M6 3h12l4 6-10 13L2 9l4-6z" />
          </svg>
        </div>
        <span className="font-bold tracking-tight text-white font-display text-sm md:text-base">
          BORALAND
        </span>
      </div>

      {/* Navigation Links */}
      <div className="pointer-events-auto hidden md:flex items-center gap-2 backdrop-blur-md bg-background-dark/80 p-1.5 rounded-full border border-white/10">
        <Link
          href="#features"
          className="px-4 py-1.5 text-sm font-medium hover:text-primary transition-colors font-body"
        >
          Features
        </Link>
        <Link
          href="#quests"
          className="px-4 py-1.5 text-sm font-medium hover:text-primary transition-colors font-body"
        >
          Quests
        </Link>
        <Link
          href="#community"
          className="px-4 py-1.5 text-sm font-medium hover:text-primary transition-colors font-body"
        >
          Community
        </Link>
      </div>

      {/* Login Button */}
      <div className="pointer-events-auto">
        <Link
          href="/auth/signin"
          className="flex items-center justify-center rounded-full bg-primary text-background-dark hover:bg-primary/90 h-9 md:h-10 px-4 md:px-6 text-xs md:text-sm font-bold transition-colors font-display shadow-lg shadow-primary/20 hover:shadow-primary/40"
        >
          Login
        </Link>
      </div>
    </nav>
  )
}
