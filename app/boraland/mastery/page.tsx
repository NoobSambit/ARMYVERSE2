'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { useToast } from '@/components/ui/Toast'
import { apiFetch } from '@/lib/client/api'
import BoralandHeader from '@/components/boraland/BoralandHeader'
import CommandCenter from '@/components/boraland/CommandCenter'
import MasteryView from '@/components/boraland/MasteryView'
import MasteryRightSidebar from '@/components/boraland/mastery/MasteryRightSidebar'
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
    dailyPhotocard?: { rarity: string }
    weeklyPhotocard?: { rarity: string }
  }
  latestBadges: any[]
}

type MasteryDefinition = { key: string; displayName?: string; coverImage?: string }
type MasteryTrack = {
  definition: MasteryDefinition
  track: {
    kind: 'member' | 'era'
    key: string
    xp: number
    level: number
    xpToNext: number
    nextMilestone: number | null
    claimable: number[]
    claimedMilestones: number[]
  }
}

type Milestone = { level: number; rewards: { xp: number; dust: number } }

type MasteryResponse = {
  members: MasteryTrack[]
  eras: MasteryTrack[]
  milestones: Milestone[]
  summary: { totalTracks: number; claimableCount: number; dust: number; totalXp: number }
}

export default function Page() {
  const { user } = useAuth()
  const router = useRouter()
  const { showToast } = useToast()
  const warnedRef = useRef(false)
  const [gameState, setGameState] = useState<GameState | null>(null)
  const [masteryData, setMasteryData] = useState<MasteryResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'home' | 'fangate' | 'armybattles'>('home')

  useEffect(() => {
    if (user === null && !warnedRef.current) {
      warnedRef.current = true
      showToast('warning', 'Sign in to access mastery')
      router.push('/boraland')
    }
  }, [user, router, showToast])

  useEffect(() => {
    if (!user) return

    const fetchData = async () => {
        try {
            const [stateRes, masteryRes] = await Promise.all([
                apiFetch('/api/game/state'),
                apiFetch('/api/game/mastery')
            ])
            setGameState(stateRes)
            setMasteryData(masteryRes)
        } catch (e) {
            console.error("Failed to fetch game data", e)
        } finally {
            setLoading(false)
        }
    }

    fetchData()
  }, [user])

  const refreshMastery = async () => {
      try {
          const res = await apiFetch('/api/game/mastery')
          setMasteryData(res)
          // Also refresh game state to update dust/xp
          const stateRes = await apiFetch('/api/game/state')
          setGameState(stateRes)
      } catch (e) {
          console.error("Failed to refresh mastery", e)
      }
  }

  if (user === undefined || (loading && (!gameState || !masteryData))) {
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
                <MasteryView 
                    data={masteryData} 
                    loading={loading} 
                    onRefresh={refreshMastery}
                />
            </div>
            
            <div className="hidden lg:block w-80 shrink-0 overflow-y-auto scrollbar-hide">
                <MasteryRightSidebar state={gameState} masteryData={masteryData} />
            </div>
        </main>
        
        <MobileWalletDrawer state={gameState} />
        <MobileNav />
    </div>
  )
}
