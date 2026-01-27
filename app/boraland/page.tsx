'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { apiFetch } from '@/lib/client/api'
import BoralandLanding from '@/components/boraland/BoralandLanding'
import BoralandHeader from '@/components/boraland/BoralandHeader'
import CommandCenter from '@/components/boraland/CommandCenter'
import MainContent from '@/components/boraland/MainContent'
import RightSidebar from '@/components/boraland/RightSidebar'
import FangateContent from '@/components/boraland/FangateContent'
import ArmyBattlesContent from '@/components/boraland/ArmyBattlesContent'
import BoraRushContent from '@/components/boraland/BoraRushContent'
import MobileNav from '@/components/boraland/MobileNav'
import MobileStatsDrawer from '@/components/boraland/MobileStatsDrawer'
import GuidedTour, { RestartTourButton } from '@/components/ui/GuidedTour'
import {
  BORALAND_TOUR_ID,
  boralandDashboardTourSteps,
  boralandDashboardTourStepsMobile
} from '@/lib/tours/boralandTour'

export type InventoryItem = {
  id?: string
  card?: {
    title?: string | null
    category?: string
    subcategory?: string | null
    imageUrl?: string
    thumbUrl?: string
    sourceUrl?: string
  }
}

export type GameStats = {
  total?: number
  latest?: InventoryItem | null
  showcaseItems?: InventoryItem[]
  totalXp?: number
  dust?: number
  quizStats?: {
    quizzesPlayed: number
    questionsCorrect: number
    totalQuestions: number
    accuracy: number | null
  }
}

export type PoolInfo = {
  name?: string
  totalCards?: number
  categories?: number
}

type Tab = 'home' | 'fangate' | 'armybattles' | 'leaderboard' | 'borarush'

export default function Page() {
  const { user } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()
  const [mounted, setMounted] = useState(false)
  const [stats, setStats] = useState<GameStats | null>(null)
  const [pool, setPool] = useState<PoolInfo | null>(null)
  const [activeTab, setActiveTab] = useState<Tab>('home')
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 1024)
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  useEffect(() => {
    setMounted(true)
    const tabParam = searchParams.get('tab') as Tab
    if (tabParam && ['home', 'fangate', 'armybattles', 'borarush'].includes(tabParam)) {
      setActiveTab(tabParam)
    }
  }, [searchParams])

  useEffect(() => {
    if (!user) return

    let active = true
      ; (async () => {
        try {
          // Fetch recent inventory items for showcase rotation.
          const res = await apiFetch('/api/game/inventory?limit=8')
          if (!active) return
          const showcaseItems = Array.isArray(res?.items) ? res.items : []

          let totalXp = 0
          let dust = 0
          let quizStats = { quizzesPlayed: 0, questionsCorrect: 0, totalQuestions: 0, accuracy: null as number | null }
          try {
            const state = await apiFetch('/api/game/state')
            totalXp = state?.totalXp || 0
            dust = state?.dust || 0
            if (state?.quizStats) {
              quizStats = state.quizStats
            }
          } catch (e) {
            console.error("Failed to fetch state", e)
          }

          setStats({
            total: res?.total || 0,
            latest: showcaseItems[0],
            showcaseItems,
            totalXp,
            dust,
            quizStats
          })

          try {
            const pools = await apiFetch('/api/game/pools')
            if (active) setPool(pools.active || null)
          } catch (e) {
            console.error("Failed to fetch pools", e)
          }
        } catch (e: unknown) {
          console.error("Failed to load game data", e)
        }
      })()
    return () => { active = false }
  }, [user])

  // Show loading state during SSR
  if (!mounted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
      </div>
    )
  }

  // If user is authenticated, show the new dashboard UI
  if (user) {
    return (
      <div className="h-[100dvh] bg-background-deep text-gray-200 flex flex-col relative overflow-hidden">
        <div className="fixed inset-0 z-0 pointer-events-none">
          <div className="absolute inset-0 bg-grid-pattern bg-[length:40px_40px] opacity-[0.05]"></div>
          <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-bora-primary/20 rounded-full blur-[100px] -translate-x-1/2 -translate-y-1/2"></div>
          <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-accent-cyan/10 rounded-full blur-[120px] translate-x-1/3 translate-y-1/3"></div>
        </div>

        <BoralandHeader
          activeTab={activeTab}
          onTabChange={(tab) => {
            if (tab === 'leaderboard') {
              router.push('/boraland/leaderboard')
            } else {
              setActiveTab(tab)
            }
          }}
        />

        <main className="flex-1 z-10 p-3 md:p-4 lg:p-6 flex flex-col lg:flex-row gap-4 lg:gap-6 overflow-hidden pb-20 lg:pb-0">
          <div className="hidden lg:block w-64 shrink-0 overflow-y-auto scrollbar-hide">
            <CommandCenter />
          </div>

          <div className="flex-1 overflow-y-auto scrollbar-hide">
            {activeTab === 'home' && <MainContent pool={pool} onTabChange={setActiveTab} />}
            {activeTab === 'fangate' && <FangateContent />}
            {activeTab === 'borarush' && <BoraRushContent />}
            {activeTab === 'armybattles' && <ArmyBattlesContent />}
          </div>

          <div className="hidden lg:block w-80 shrink-0 overflow-y-auto scrollbar-hide">
            <RightSidebar stats={stats} />
          </div>
        </main>

        <MobileStatsDrawer stats={stats} />
        <MobileNav />

        {/* Guided Tour - Only on Home tab for clean UX */}
        {activeTab === 'home' && (
          <GuidedTour
            tourId={BORALAND_TOUR_ID}
            steps={isMobile ? boralandDashboardTourStepsMobile : boralandDashboardTourSteps}
            showOnFirstVisit={true}
          />
        )}

        {/* Floating Tour Restart Button */}
        <div className="fixed bottom-20 lg:bottom-4 left-4 z-40">
          <RestartTourButton
            tourId={BORALAND_TOUR_ID}
            label="Dashboard Tour"
            className="px-3 py-2 rounded-xl bg-black/60 backdrop-blur border border-white/10 hover:bg-white/10 transition-all shadow-lg"
          />
        </div>
      </div>
    )
  }

  // Otherwise, show the public landing page
  return <BoralandLanding />
}
