'use client'

import { useEffect, useState } from 'react'
import { apiFetch } from '@/lib/client/api'
import StreamingQuestCard from './StreamingQuestCard'

type Quest = {
  code: string
  title: string
  period: string
  goalType: string
  progress: number
  goalValue: number
  completed: boolean
  claimed: boolean
  streamingMeta?: any
}

export default function QuestsView() {
  const [quests, setQuests] = useState<Quest[]>([])
  const [filter, setFilter] = useState<'all' | 'daily' | 'weekly' | 'streaming' | 'quiz'>('all')
  const [hasLastfm, setHasLastfm] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const load = async () => {
    setError(null)
    try {
      const res = await apiFetch('/api/game/quests')
      setQuests(res.quests || [])

      // Check Last.fm integration
      const integrations = await apiFetch('/api/user/integrations')
      setHasLastfm(!!integrations.lastfm?.username)
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed to load')
    }
  }

  useEffect(() => { load() }, [])

  const claim = async (code: string) => {
    try {
      await apiFetch('/api/game/quests/claim', { method: 'POST', body: JSON.stringify({ code }) })
      await load()
    } catch (e) {}
  }

  const verifyStreaming = async () => {
    try {
      await apiFetch('/api/game/quests/verify-streaming', { method: 'POST' })
      await load()
    } catch (e: any) {
      setError(e.message || 'Verification failed')
    }
  }

  const filtered = quests.filter(q => {
    if (filter === 'all') return true
    if (filter === 'daily') return q.period === 'daily'
    if (filter === 'weekly') return q.period === 'weekly'
    if (filter === 'streaming') return q.goalType.startsWith('stream:')
    if (filter === 'quiz') return !q.goalType.startsWith('stream:')
    return true
  })

  const streamingQuests = filtered.filter(q => q.goalType.startsWith('stream:'))
  const quizQuests = filtered.filter(q => !q.goalType.startsWith('stream:'))

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <h2 className="text-white text-2xl font-semibold mb-4">Quests</h2>

      {/* Filter tabs */}
      <div className="flex gap-2 mb-4 overflow-x-auto">
        {['all', 'daily', 'weekly', 'streaming', 'quiz'].map(f => (
          <button
            key={f}
            onClick={() => setFilter(f as any)}
            className={`px-3 py-1 rounded-lg text-sm whitespace-nowrap ${
              filter === f
                ? 'bg-white/20 text-white'
                : 'bg-white/5 text-white/60 hover:bg-white/10'
            }`}
          >
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      {error && <div className="mb-4 text-rose-300">{error}</div>}

      {/* Streaming quests */}
      {streamingQuests.length > 0 && (
        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-white/90 font-medium">Streaming Quests</h3>
            {hasLastfm && (
              <button
                onClick={verifyStreaming}
                className="text-sm px-3 py-1 rounded-lg bg-white/10 text-white/90 hover:bg-white/20"
              >
                Refresh Streams
              </button>
            )}
          </div>

          {!hasLastfm && (
            <div className="mb-3 p-3 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-200 text-sm">
              Connect Last.fm to track streaming quests
            </div>
          )}

          <div className="space-y-3">
            {streamingQuests.map(q => (
              <StreamingQuestCard
                key={q.code}
                quest={q}
                onClaim={claim}
                onVerify={verifyStreaming}
              />
            ))}
          </div>
        </div>
      )}

      {/* Quiz quests */}
      {quizQuests.length > 0 && (
        <div>
          <h3 className="text-white/90 font-medium mb-3">Quiz Quests</h3>
          <div className="space-y-3">
            {quizQuests.map(q => (
              <div key={q.code} className="rounded-2xl border border-[#3b1a52]/60 bg-white/5 backdrop-blur-md p-4 flex items-center justify-between">
                <div>
                  <div className="text-white/90 font-medium">{q.title}</div>
                  <div className="text-white/60 text-sm">{q.period} • {q.progress}/{q.goalValue}</div>
                </div>
                <button
                  disabled={!q.completed || q.claimed}
                  onClick={() => claim(q.code)}
                  className="px-3 py-1 rounded-lg border border-[#3b1a52]/60 disabled:opacity-50"
                >
                  {q.claimed ? 'Claimed' : q.completed ? 'Claim' : 'In progress'}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
