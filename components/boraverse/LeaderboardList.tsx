'use client'

import { useEffect, useState } from 'react'
import { apiFetch } from '@/lib/client/api'

export default function LeaderboardList() {
  const [entries, setEntries] = useState<any[]>([])
  const [cursor, setCursor] = useState<string | null>(null)
  const [me, setMe] = useState<any | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const load = async (next?: string | null) => {
    setLoading(true)
    setError(null)
    try {
      const res = await apiFetch(`/api/game/leaderboard${next ? `?cursor=${next}` : ''}`)
      setEntries((prev) => [...prev, ...res.entries])
      setCursor(res.nextCursor || null)
      setMe(res.me || null)
    } catch (e: any) {
      setError(e?.message || 'Failed to load')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load(null) }, [])

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      {error && <div className="mb-4 text-rose-300">{error}</div>}
      <div className="rounded-2xl border border-[#3b1a52]/60 bg-white/5 backdrop-blur-md">
        <div className="divide-y divide-white/10">
          {entries.map((e, i) => (
            <div key={e._id || i} className="flex items-center gap-4 p-4">
              <div className="w-8 text-center text-white/70">{i + 1}</div>
              <img src={e.avatarUrl || '/avatar-placeholder.svg'} alt="avatar" className="w-8 h-8 rounded-full" />
              <div className="flex-1 text-white">{e.displayName || 'User'}</div>
              <div className="text-fuchsia-300 font-semibold">{e.score}</div>
            </div>
          ))}
        </div>
      </div>
      {cursor && (
        <div className="flex justify-center mt-6">
          <button onClick={() => load(cursor)} className="px-4 py-2 rounded-xl border border-[#3b1a52]/60 text-white/90">Load more</button>
        </div>
      )}
      {me && (
        <div className="mt-8 rounded-2xl border border-[#3b1a52]/60 bg-white/5 backdrop-blur-md p-4">
          <div className="text-white/70 mb-2">You</div>
          <div className="flex items-center gap-4">
            <img src={me.avatarUrl || '/avatar-placeholder.svg'} alt="avatar" className="w-8 h-8 rounded-full" />
            <div className="flex-1 text-white">{me.displayName || 'You'}</div>
            <div className="text-fuchsia-300 font-semibold">{me.score}</div>
            {me.rank && <div className="text-white/60">Rank {me.rank}</div>}
          </div>
        </div>
      )}
    </div>
  )
}


