'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { useToast } from '@/components/ui/Toast'
import { apiFetch } from '@/lib/client/api'
import BoralandHeader from '@/components/boraland/BoralandHeader'
import CommandCenter from '@/components/boraland/CommandCenter'
import QuestsView from '@/components/boraland/QuestsView'
import QuestRightSidebar from '@/components/boraland/quests/QuestRightSidebar'
import MobileNav from '@/components/boraland/MobileNav'
import MobileWalletDrawer from '@/components/boraland/MobileWalletDrawer'

// Type definition for state
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

export default function Page() {
  const { user } = useAuth()
  const router = useRouter()
  const { showToast } = useToast()
  const warnedRef = useRef(false)
  const [gameState, setGameState] = useState<GameState | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'home' | 'fangate' | 'armybattles' | 'leaderboard'>('home')

  useEffect(() => {
    if (user === null && !warnedRef.current) {
      warnedRef.current = true
      showToast('warning', 'Sign in to access quests')
      router.push('/boraland')
    }
  }, [user, router, showToast])

  const fetchState = useCallback(async () => {
    try {
      const res = await apiFetch('/api/game/state')
      setGameState(res)
    } catch (e) {
      console.error('Failed to fetch game state', e)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (!user) return
    fetchState()
  }, [user, fetchState])

  if (user === undefined || (loading && !gameState)) {
    return (
      <div className="min-h-screen bg-[#0F0B1E] flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
      </div>
    )
  }

  if (!user) return null

  return (
    <div className="h-[100dvh] bg-background-deep text-gray-200 flex flex-col overflow-hidden relative">
        {/* Background Effects */}
        <div className="fixed inset-0 z-0 pointer-events-none">
            <div className="absolute inset-0 bg-grid-pattern bg-[length:40px_40px] opacity-[0.05]"></div>
            <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-bora-primary/20 rounded-full blur-[100px] -translate-x-1/2 -translate-y-1/2"></div>
            <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-accent-cyan/10 rounded-full blur-[120px] translate-x-1/3 translate-y-1/3"></div>
        </div>

        <BoralandHeader activeTab={activeTab} onTabChange={(tab) => {
          setActiveTab(tab)
          if (tab === 'home') router.push('/boraland')
          else if (tab === 'fangate') router.push('/boraland')
          else if (tab === 'armybattles') router.push('/boraland')
        }} />

        <main className="flex-1 z-10 p-3 md:p-4 lg:p-6 flex flex-col lg:flex-row gap-4 lg:gap-6 overflow-hidden pb-20 lg:pb-0">
            <div className="hidden lg:block w-64 shrink-0 overflow-y-auto scrollbar-hide">
                <CommandCenter />
            </div>
            
            <div className="flex-1 overflow-y-auto scrollbar-hide">
                <QuestsView dailyStreak={gameState?.streaks.daily} onStateRefresh={fetchState} />
            </div>
            
            <div className="hidden lg:block w-80 shrink-0 overflow-y-auto scrollbar-hide">
                <QuestRightSidebar state={gameState} />
            </div>
        </main>
        
        <MobileWalletDrawer state={gameState} />
        <MobileNav />
    </div>
  )
}
