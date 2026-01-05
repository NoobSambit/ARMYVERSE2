'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { useToast } from '@/components/ui/Toast'
import { apiFetch } from '@/lib/client/api'
import CommandCenter from '@/components/boraland/CommandCenter'
import QuestsView from '@/components/boraland/QuestsView'
import QuestRightSidebar from '@/components/boraland/quests/QuestRightSidebar'

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

export default function Page() {
  const { user } = useAuth()
  const router = useRouter()
  const { showToast } = useToast()
  const [gameState, setGameState] = useState<GameState | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user === null) {
      showToast('warning', 'Sign in to access quests')
      router.push('/boraland')
    }
  }, [user, router, showToast])

  useEffect(() => {
    if (!user) return

    const fetchState = async () => {
        try {
            const res = await apiFetch('/api/game/state')
            setGameState(res)
        } catch (e) {
            console.error("Failed to fetch game state", e)
        } finally {
            setLoading(false)
        }
    }

    fetchState()
  }, [user])

  if (user === undefined || (loading && !gameState)) {
    return (
      <div className="min-h-screen bg-[#0F0B1E] flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
      </div>
    )
  }

  if (!user) return null

  return (
    <div className="bg-[#0F0B1E] text-white min-h-screen flex flex-col transition-colors duration-300 font-sans">
        {/* Navigation - mimicking the design's nav or assuming global nav handles it. 
            The design shows a top nav. In Next.js App Router, layout.tsx usually handles top nav. 
            We'll assume the layout provides the top nav, or we can add a sub-nav here if needed.
            For now, we just render the main content grid.
        */}
        
        {/* Sub-nav pills (Home, Fangate, Quests, ArmyBattles) from design */}
        <div className="flex justify-center py-6">
            <div className="inline-flex bg-surface-dark rounded-full p-1 border border-white/5">
                <button onClick={() => router.push('/boraland')} className="px-6 py-1.5 rounded-full text-sm text-gray-400 hover:text-white transition-colors">Home</button>
                <button onClick={() => router.push('/boraland/fangate')} className="px-6 py-1.5 rounded-full text-sm text-gray-400 hover:text-white transition-colors">Fangate</button>
                <button className="px-6 py-1.5 rounded-full text-sm text-white bg-bora-primary/20 border border-bora-primary/30 shadow-[0_0_15px_rgba(139,92,246,0.3)]">Quests</button>
                <button onClick={() => router.push('/boraland/battles')} className="px-6 py-1.5 rounded-full text-sm text-gray-400 hover:text-white transition-colors">ArmyBattles</button>
            </div>
        </div>

        <main className="flex-1 max-w-[1600px] w-full mx-auto px-6 pb-12 grid grid-cols-12 gap-6">
            <div className="col-span-12 lg:col-span-2">
                <CommandCenter className="lg:w-full" />
            </div>
            
            <QuestsView dailyStreak={gameState?.streaks.daily} />
            
            <QuestRightSidebar state={gameState} />
        </main>
    </div>
  )
}
