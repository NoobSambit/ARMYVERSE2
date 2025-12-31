'use client'

import { Heart } from 'lucide-react'

export default function Loading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-950">
      <div className="flex flex-col items-center gap-6">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-zinc-800 rounded-full"></div>
          <div className="absolute top-0 left-0 w-16 h-16 border-4 border-purple-500 rounded-full border-t-transparent animate-spin"></div>
        </div>
        <div className="text-lg font-medium text-zinc-400">Loading ARMYVERSE…</div>
      </div>
    </div>
  )
}