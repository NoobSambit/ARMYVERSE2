'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import BoraverseLanding from '@/components/boraverse/BoraverseLanding'
import GameHub from '@/components/boraverse/GameHub'

export default function Page() {
  const { user } = useAuth()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  // Show loading state during SSR
  if (!mounted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
      </div>
    )
  }

  // If user is authenticated, show the game hub
  if (user) {
    return <GameHub />
  }

  // Otherwise, show the public landing page
  return <BoraverseLanding />
}


