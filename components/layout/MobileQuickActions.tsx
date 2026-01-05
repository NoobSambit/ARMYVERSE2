'use client'

import Link from 'next/link'
import { Home } from 'lucide-react'

export default function MobileQuickActions() {
  return (
    <nav className="fixed bottom-2 left-1/2 -translate-x-1/2 z-50 md:hidden">
      <div className="flex items-center gap-3 rounded-full border border-white/10 bg-black/50 backdrop-blur-md px-4 py-2 shadow-xl">
        <Link href="/" className="inline-flex items-center gap-1 text-white/90 hover:text-white" aria-label="Home">
          <Home className="w-5 h-5" />
          <span className="text-sm">Home</span>
        </Link>
        {/* Connect removed */}
      </div>
    </nav>
  )
}


