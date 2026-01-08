'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import { apiFetch } from '@/lib/client/api'
import ProfileViewModal from '@/components/profile/ProfileViewModal'

type LeaderboardEntry = {
  _id: string
  userId: string
  avatarUrl?: string
  displayName: string
  score: number
}

type UserEntry = {
  avatarUrl?: string
  displayName: string
  score: number
  rank?: number
}

export default function LeaderboardList() {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([])
  const [cursor, setCursor] = useState<string | null>(null)
  const [me, setMe] = useState<UserEntry | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null)

  const load = async (next?: string | null) => {
    setError(null)
    try {
      // Refresh current user's profile data in leaderboard on first load
      if (!next) {
        try {
          await apiFetch('/api/game/leaderboard/refresh', { method: 'POST' })
        } catch (err) {
          console.warn('Failed to refresh leaderboard profile:', err)
        }
      }
      
      const res = await apiFetch(`/api/game/leaderboard${next ? `?cursor=${next}` : ''}`)
      setEntries((prev) => [...prev, ...res.entries])
      setCursor(res.nextCursor || null)
      setMe(res.me || null)
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed to load')
    }
  }

  useEffect(() => { load(null) }, [])

  return (
    <div className="max-w-3xl mx-auto px-0 md:px-4 py-4 md:py-8">
      <div className="mb-4 md:mb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-white mb-1">Leaderboard</h1>
        <p className="text-gray-400 text-xs md:text-sm">Top players this week</p>
      </div>

      {error && <div className="mb-4 text-rose-300 text-sm">{error}</div>}
      <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md overflow-hidden">
        <div className="divide-y divide-white/10">
          {entries.map((e, i) => (
            <div 
              key={e._id || i} 
              className="flex items-center gap-2 md:gap-4 p-3 md:p-4 hover:bg-white/5 transition-colors cursor-pointer group"
              onClick={() => e.userId && setSelectedUserId(e.userId)}
            >
              <div className={`w-6 md:w-8 text-center font-bold ${
                i === 0 ? 'text-yellow-400' : 
                i === 1 ? 'text-gray-300' : 
                i === 2 ? 'text-orange-400' : 
                'text-white/70'
              }`}>
                {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : i + 1}
              </div>
              <Image 
                src={e.avatarUrl || '/avatar-placeholder.svg'} 
                alt="avatar" 
                width={32} 
                height={32} 
                className="w-7 h-7 md:w-8 md:h-8 rounded-full" 
              />
              <div className="flex-1 text-sm md:text-base text-white group-hover:text-purple-300 transition-colors truncate">
                {e.displayName || 'User'}
              </div>
              <div className="text-fuchsia-300 font-semibold text-sm md:text-base">{e.score}</div>
            </div>
          ))}
        </div>
      </div>
      {cursor && (
        <div className="flex justify-center mt-4 md:mt-6">
          <button 
            onClick={() => load(cursor)} 
            className="px-4 py-2 rounded-xl border border-white/10 bg-white/5 text-white/90 hover:bg-white/10 transition-colors text-sm"
          >
            Load more
          </button>
        </div>
      )}
      {me && (
        <div className="mt-4 md:mt-8 rounded-2xl border border-bora-primary/30 bg-bora-primary/10 backdrop-blur-md p-3 md:p-4">
          <div className="text-white/70 mb-2 text-xs md:text-sm font-medium">Your Rank</div>
          <div className="flex items-center gap-2 md:gap-4">
            <Image 
              src={me.avatarUrl || '/avatar-placeholder.svg'} 
              alt="avatar" 
              width={32} 
              height={32} 
              className="w-7 h-7 md:w-8 md:h-8 rounded-full" 
            />
            <div className="flex-1 text-white text-sm md:text-base truncate">{me.displayName || 'You'}</div>
            <div className="text-fuchsia-300 font-semibold text-sm md:text-base">{me.score}</div>
            {me.rank && <div className="text-white/60 text-xs md:text-sm">#{me.rank}</div>}
          </div>
        </div>
      )}
      
      {/* Profile View Modal */}
      <ProfileViewModal userId={selectedUserId} onClose={() => setSelectedUserId(null)} />
    </div>
  )
}


