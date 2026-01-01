'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { apiFetch } from '@/lib/client/api'

type InventoryItem = {
  card?: {
    member: string
    era: string
    rarity: string
  }
}

type GameStats = {
  total?: number
  latest?: InventoryItem | null
  totalXp?: number
}

type PoolInfo = {
  name?: string
  set?: string
  weights?: {
    common: number
    rare: number
    epic: number
    legendary: number
  }
}

export default function GameHub() {
  const [stats, setStats] = useState<GameStats | null>(null)
  const [pool, setPool] = useState<PoolInfo | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let active = true
    ;(async () => {
      try {
        const res = await apiFetch('/api/game/inventory?limit=1')
        if (!active) return
        let totalXp = 0
        try {
          const state = await apiFetch('/api/game/state')
          totalXp = state?.totalXp || 0
        } catch {}
        setStats({ latest: res?.items?.[0], totalXp })
        try {
          const pools = await apiFetch('/api/game/pools')
          if (active) setPool(pools.active || null)
        } catch {}
      } catch (e: unknown) {
        setError(e instanceof Error ? e.message : 'Failed to load')
      }
    })()
    return () => { active = false }
  }, [])

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="text-center mb-8">
        <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-fuchsia-400 to-rose-400 bg-clip-text text-transparent mb-2">
          Welcome back to Boraland
        </h1>
        <p className="text-white/70">Ready for your next quiz? Let&apos;s collect some photocards!</p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="rounded-2xl border border-[#3b1a52]/60 bg-white/5 backdrop-blur-md p-6">
          <div className="text-white/60 text-sm mb-1">Total Cards</div>
          <div className="text-2xl font-bold text-white">
            {stats && typeof stats.total === 'number' ? stats.total : 'Loading...'}
          </div>
        </div>
        <div className="rounded-2xl border border-[#3b1a52]/60 bg-white/5 backdrop-blur-md p-6">
          <div className="text-white/60 text-sm mb-1">Total XP</div>
          <div className="text-2xl font-bold text-white">{typeof stats?.totalXp === 'number' ? stats.totalXp : 'Loading...'}</div>
        </div>
        <div className="rounded-2xl border border-[#3b1a52]/60 bg-white/5 backdrop-blur-md p-6">
          <div className="text-white/60 text-sm mb-1">Latest Pull</div>
          <div className="text-white">
            {stats?.latest ? (
              <div>
                <div className="font-semibold">{stats.latest.card?.member}</div>
                <div className="text-sm text-white/70">{stats.latest.card?.era} • {stats.latest.card?.rarity}</div>
              </div>
            ) : (
              <div className="text-white/50">Play to get your first card!</div>
            )}
          </div>
        </div>
        <div className="rounded-2xl border border-[#3b1a52]/60 bg-white/5 backdrop-blur-md p-6">
          <div className="text-white/60 text-sm mb-1">Current Streak</div>
          <div className="text-2xl font-bold text-white">—</div>
        </div>
      </div>

      {/* Main Actions */}
      <div className="text-center mb-8">
        <Link href="/boraland/play" className="inline-block px-8 py-4 rounded-2xl bg-gradient-to-r from-[#FF9AD5] to-[#C084FC] text-black font-semibold text-lg shadow-[0_10px_30px_rgba(129,0,255,0.15)] hover:translate-y-0.5 transition-all duration-200 mb-6">
          Start Quiz
        </Link>

        <div className="text-white/60 text-sm">
          Test your BTS knowledge • Earn photocards • Climb the leaderboard
        </div>
      </div>

      {/* Navigation Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <Link href="/boraland/inventory" className="group">
          <div className="rounded-2xl border border-[#3b1a52]/60 bg-white/5 backdrop-blur-md p-4 text-center hover:bg-white/10 transition-colors">
            <div className="text-2xl mb-2">🖼️</div>
            <div className="font-semibold text-white">Inventory</div>
            <div className="text-xs text-white/60">View collection</div>
          </div>
        </Link>
        <Link href="/boraland/leaderboard" className="group">
          <div className="rounded-2xl border border-[#3b1a52]/60 bg-white/5 backdrop-blur-md p-4 text-center hover:bg-white/10 transition-colors">
            <div className="text-2xl mb-2">🏆</div>
            <div className="font-semibold text-white">Leaderboard</div>
            <div className="text-xs text-white/60">See rankings</div>
          </div>
        </Link>
        <Link href="/boraland/mastery" className="group">
          <div className="rounded-2xl border border-[#3b1a52]/60 bg-white/5 backdrop-blur-md p-4 text-center hover:bg-white/10 transition-colors">
            <div className="text-2xl mb-2">⭐</div>
            <div className="font-semibold text-white">Mastery</div>
            <div className="text-xs text-white/60">Track progress</div>
          </div>
        </Link>
        <Link href="/boraland/quests" className="group">
          <div className="rounded-2xl border border-[#3b1a52]/60 bg-white/5 backdrop-blur-md p-4 text-center hover:bg-white/10 transition-colors">
            <div className="text-2xl mb-2">📋</div>
            <div className="font-semibold text-white">Quests</div>
            <div className="text-xs text-white/60">Complete challenges</div>
          </div>
        </Link>
      </div>

      {/* Active Pool Info */}
      <div className="rounded-2xl border border-[#3b1a52]/60 bg-white/5 backdrop-blur-md p-4">
        <div className="text-white/60 text-sm mb-2">Active Pool</div>
        {pool ? (
          <div className="text-white">
            <div className="font-semibold">{pool.name || pool.set || 'Default Pool'}</div>
            {pool.weights && (
              <div className="mt-2 text-sm text-white/70">
                Rarity chances: Common {pool.weights.common}% • Rare {pool.weights.rare}% • Epic {pool.weights.epic}% • Legendary {pool.weights.legendary}%
              </div>
            )}
          </div>
        ) : (
          <div className="text-white/50">Loading pool information...</div>
        )}
      </div>

      {error && <div className="mt-4 text-rose-300 text-center">{error}</div>}
    </div>
  )
}


