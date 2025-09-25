'use client'

import { Heart } from 'lucide-react'

export default function Loading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-900 via-pink-700 to-blue-900 animate-gradient-x">
      <div className="flex flex-col items-center">
        <div className="animate-spin-slow mb-6">
          <span className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full">
            <Heart className="w-12 h-12 text-white" />
          </span>
        </div>
        <div className="text-2xl font-bold text-white tracking-wide animate-pulse">Loading ARMYVERSE…</div>
      </div>
      <style jsx global>{`
        @keyframes gradient-x {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        .animate-gradient-x {
          background-size: 200% 200%;
          animation: gradient-x 3s ease-in-out infinite;
        }
        .animate-spin-slow {
          animation: spin 2s linear infinite;
        }
      `}</style>
    </div>
  )
}