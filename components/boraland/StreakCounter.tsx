'use client'

import { useEffect, useState } from 'react'
import { apiFetch } from '@/lib/client/api'

export default function StreakCounter() {
  const [streak, setStreak] = useState(0)

  useEffect(() => {
    apiFetch('/api/game/state').then(res => {
      setStreak(res?.streak?.dailyCount || 0)
    })
  }, [])

  return (
    <div className="flex items-center gap-2">
      <div className="text-2xl">🔥</div>
      <div>
        <div className="text-white font-semibold text-lg">{streak} Days</div>
        <div className="text-white/60 text-xs">Current Streak</div>
      </div>
    </div>
  )
}
