'use client'

import { useState } from 'react'
import { X, Wallet } from 'lucide-react'
import MasteryRightSidebar from './mastery/MasteryRightSidebar'

type GameState = {
  dust: number
  totalXp: number
  level: number
  streaks: {
    daily: { current: number; nextMilestone: number; daysRemaining: number }
    weekly: { current: number; nextMilestone: number; weeksRemaining: number }
  }
  potentialRewards: {
    dailyMilestoneBadge?: any
    weeklyMilestoneBadge?: any
    dailyPhotocard?: { type: string }
    weeklyPhotocard?: { type: string }
  }
  latestBadges: any[]
}

export default function MobileWalletDrawer({ state }: { state: GameState | null }) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      {/* Floating Wallet Button - Only visible on mobile */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-20 right-4 z-[55] lg:hidden w-14 h-14 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 shadow-lg shadow-pink-500/30 flex items-center justify-center hover:scale-110 active:scale-95 transition-transform group"
        aria-label="View Wallet"
      >
        <Wallet className="w-6 h-6 text-white group-hover:rotate-12 transition-transform" />
      </button>

      {/* Bottom Drawer */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[70] lg:hidden"
            onClick={() => setIsOpen(false)}
          />
          
          {/* Drawer */}
          <div className="fixed bottom-0 left-0 right-0 z-[75] lg:hidden animate-slide-up">
            <div className="bg-[#0F0B1E] rounded-t-3xl shadow-2xl max-h-[85vh] overflow-hidden flex flex-col">
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b border-white/10 shrink-0">
                <div className="flex items-center gap-2">
                  <div className="w-1 h-6 bg-gradient-to-b from-purple-600 to-pink-600 rounded-full" />
                  <h2 className="text-lg font-bold text-white">Wallet & Rewards</h2>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
                  aria-label="Close"
                >
                  <X className="w-5 h-5 text-white" />
                </button>
              </div>

              {/* Content */}
              <div className="overflow-y-auto p-4 pb-8">
                <MasteryRightSidebar state={state as any} masteryData={null} />
              </div>

              {/* Pull indicator */}
              <div className="absolute top-2 left-1/2 -translate-x-1/2">
                <div className="w-12 h-1 bg-white/20 rounded-full" />
              </div>
            </div>
          </div>
        </>
      )}
    </>
  )
}
