'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { apiFetch } from '@/lib/client/api'
import BoralandLanding from '@/components/boraland/BoralandLanding'
import BoralandHeader from '@/components/boraland/BoralandHeader'
import CommandCenter from '@/components/boraland/CommandCenter'
import MainContent from '@/components/boraland/MainContent'
import RightSidebar from '@/components/boraland/RightSidebar'
import FangateContent from '@/components/boraland/FangateContent'
import ArmyBattlesContent from '@/components/boraland/ArmyBattlesContent'

export type InventoryItem = {
  card?: {
    member: string
    era: string
    rarity: string
    imageUrl?: string
  }
}

export type GameStats = {
  total?: number
  latest?: InventoryItem | null
  totalXp?: number
}

export type PoolInfo = {
  name?: string
  set?: string
  weights?: {
    common: number
    rare: number
    epic: number
    legendary: number
  }
}

type Tab = 'home' | 'fangate' | 'armybattles'

export default function Page() {
  const { user } = useAuth()
  const [mounted, setMounted] = useState(false)
  const [stats, setStats] = useState<GameStats | null>(null)
  const [pool, setPool] = useState<PoolInfo | null>(null)
  const [activeTab, setActiveTab] = useState<Tab>('home')

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!user) return

    let active = true
    ;(async () => {
      try {
        // Fetch inventory count and latest item
        const res = await apiFetch('/api/game/inventory?limit=1')
        if (!active) return

        let totalXp = 0
        try {
          const state = await apiFetch('/api/game/state')
          totalXp = state?.totalXp || 0
        } catch (e) {
          console.error("Failed to fetch state", e)
        }

        setStats({ 
            total: res?.total || 0,
            latest: res?.items?.[0], 
            totalXp 
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
        <div className="h-screen bg-background-deep text-gray-200 flex flex-col relative overflow-hidden">
            <div className="fixed inset-0 z-0 pointer-events-none">
                <div className="absolute inset-0 bg-grid-pattern bg-[length:40px_40px] opacity-[0.05]"></div>
                <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-bora-primary/20 rounded-full blur-[100px] -translate-x-1/2 -translate-y-1/2"></div>
                <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-accent-cyan/10 rounded-full blur-[120px] translate-x-1/3 translate-y-1/3"></div>
            </div>

            <BoralandHeader activeTab={activeTab} onTabChange={setActiveTab} />

            <main className="flex-1 z-10 p-4 lg:p-6 flex flex-col lg:flex-row gap-6 overflow-hidden">
                <div className="w-full lg:w-64 shrink-0 overflow-y-auto">
                    <CommandCenter />
                </div>

                <div className="flex-1 overflow-y-auto">
                    {activeTab === 'home' && <MainContent pool={pool} onTabChange={setActiveTab} />}
                    {activeTab === 'fangate' && <FangateContent />}
                    {activeTab === 'armybattles' && <ArmyBattlesContent />}
                </div>

                <div className="w-full lg:w-80 shrink-0 overflow-y-auto">
                    <RightSidebar stats={stats} />
                </div>
            </main>
        </div>
    )
  }

  // Otherwise, show the public landing page
  return <BoralandLanding />
}
