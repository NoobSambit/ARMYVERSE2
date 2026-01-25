'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { useToast } from '@/components/ui/Toast'
import BoralandHeader from '@/components/boraland/BoralandHeader'
import CommandCenter from '@/components/boraland/CommandCenter'
import MobileNav from '@/components/boraland/MobileNav'

export default function Page() {
  const { user } = useAuth()
  const router = useRouter()
  const { showToast } = useToast()

  // Tab State for Header
  const [activeTab, setActiveTab] = useState<
    'home' | 'fangate' | 'armybattles' | 'leaderboard' | 'borarush'
  >('home')

  useEffect(() => {
    if (user === null) {
      showToast('warning', 'Sign in to access the shop')
      router.push('/boraland')
    }
  }, [user, router, showToast])

  if (!user) return null

  return (
    <div className="h-[100dvh] bg-background-deep text-gray-200 flex flex-col overflow-hidden relative">
      {/* Background Effects */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute inset-0 bg-grid-pattern bg-[length:40px_40px] opacity-[0.05]"></div>
        <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-bora-primary/20 rounded-full blur-[100px] -translate-x-1/2 -translate-y-1/2"></div>
        <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-accent-cyan/10 rounded-full blur-[120px] translate-x-1/3 translate-y-1/3"></div>
      </div>

      <BoralandHeader
        activeTab={activeTab}
        onTabChange={tab => {
          setActiveTab(tab)
          if (tab === 'home') router.push('/boraland')
          else if (tab === 'fangate') router.push('/boraland')
          else if (tab === 'armybattles') router.push('/boraland')
          else if (tab === 'borarush') router.push('/boraland?tab=borarush')
        }}
      />

      <main className="flex-grow z-10 p-3 md:p-4 lg:p-6 flex flex-col lg:flex-row gap-4 lg:gap-6 overflow-hidden pb-20 lg:pb-0">
        <div className="hidden lg:block w-64 shrink-0">
          <CommandCenter />
        </div>

        <div className="flex-grow flex items-center justify-center">
          <div className="text-center">
            <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-bora-primary/20 flex items-center justify-center animate-pulse">
              <span className="material-symbols-outlined text-6xl text-bora-primary">
                shopping_bag
              </span>
            </div>
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-4 font-orbitron">
              COMING SOON
            </h1>
            <p className="text-lg text-gray-400 max-w-md mx-auto">
              The shop is under construction. Soon you'll be able to spend your
              Dust here!
            </p>
          </div>
        </div>
      </main>

      <MobileNav />
    </div>
  )
}
