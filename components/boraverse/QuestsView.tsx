'use client'

import { useEffect, useState } from 'react'
import { apiFetch } from '@/lib/client/api'

export default function QuestsView() {
  const [quests, setQuests] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await apiFetch('/api/game/quests')
      setQuests(res.quests || [])
    } catch (e: any) {
      setError(e?.message || 'Failed to load')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  const claim = async (code: string) => {
    try {
      await apiFetch('/api/game/quests/claim', { method: 'POST', body: JSON.stringify({ code }) })
      await load()
    } catch (e) {}
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <h2 className="text-white text-2xl font-semibold mb-4">Quests</h2>
      {error && <div className="mb-4 text-rose-300">{error}</div>}
      <div className="space-y-3">
        {quests.map((q) => (
          <div key={q.code} className="rounded-2xl border border-[#3b1a52]/60 bg-white/5 backdrop-blur-md p-4 flex items-center justify-between">
            <div>
              <div className="text-white/90 font-medium">{q.title}</div>
              <div className="text-white/60 text-sm">{q.period} • {q.progress}/{q.goalValue}</div>
            </div>
            <button disabled={!q.completed || q.claimed} onClick={() => claim(q.code)} className="px-3 py-1 rounded-lg border border-[#3b1a52]/60 disabled:opacity-50">
              {q.claimed ? 'Claimed' : q.completed ? 'Claim' : 'In progress'}
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}


