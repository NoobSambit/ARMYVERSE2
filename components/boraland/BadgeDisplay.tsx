'use client'

import { useEffect, useState } from 'react'
import { apiFetch } from '@/lib/client/api'

type Badge = {
  code: string
  name: string
  description: string
  icon: string
  rarity: string
  earnedAt: Date
}

export default function BadgeDisplay() {
  const [badges, setBadges] = useState<Badge[]>([])

  useEffect(() => {
    apiFetch('/api/game/badges').then(res => setBadges(res.badges || []))
  }, [])

  if (badges.length === 0) return null

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      {badges.map(badge => (
        <div
          key={badge.code}
          className={`rounded-xl border p-3 text-center ${
            badge.rarity === 'legendary' ? 'border-amber-400 bg-amber-500/10' :
            badge.rarity === 'epic' ? 'border-purple-400 bg-purple-500/10' :
            badge.rarity === 'rare' ? 'border-blue-400 bg-blue-500/10' :
            'border-white/20 bg-white/5'
          }`}
        >
          <div className="text-4xl mb-2">{badge.icon}</div>
          <div className="text-white font-medium text-sm">{badge.name}</div>
          <div className="text-white/60 text-xs mt-1">{badge.description}</div>
        </div>
      ))}
    </div>
  )
}
