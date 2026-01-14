'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { useToast } from '@/components/ui/Toast'
import BoralandHeader from '@/components/boraland/BoralandHeader'
import CommandCenter from '@/components/boraland/CommandCenter'
import CraftView from '@/components/boraland/CraftView'
import MobileNav from '@/components/boraland/MobileNav'

export default function Page() {
  const { user } = useAuth()
  const router = useRouter()
  const { showToast } = useToast()
  const [activeTab, setActiveTab] = useState<'home' | 'fangate' | 'armybattles' | 'leaderboard'>('home')

  useEffect(() => {
    if (user === null) {
      showToast('warning', 'Sign in to access crafting')
      router.push('/boraland')
    }
  }, [user, router, showToast])

  if (user === undefined) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
      </div>
    )
  }

  if (!user) {
    return null
  }

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
                <CraftView />
            </div>
        </main>
        
        <MobileNav />
    </div>
  )
}
