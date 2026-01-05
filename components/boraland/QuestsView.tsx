'use client'

import { useEffect, useState } from 'react'
import { apiFetch } from '@/lib/client/api'
import StreamingQuestCard from './StreamingQuestCard'
import QuizQuestCard from './QuizQuestCard'
import QuestBoardHeader from './quests/QuestBoardHeader'

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
  reward?: { dust: number; xp: number }
}

type StreakInfo = {
    current: number
    nextMilestone: number
    daysRemaining?: number
}

export default function QuestsView({ dailyStreak }: { dailyStreak?: StreakInfo }) {
  const [quests, setQuests] = useState<Quest[]>([])
  const [filter, setFilter] = useState<'daily' | 'weekly' | 'special'>('daily')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [isStreamingConnected, setIsStreamingConnected] = useState(false)

  const load = async () => {
    setError(null)
    try {
      const res = await apiFetch('/api/game/quests')
      setQuests(res.quests || [])

      // Check if user has connected Last.fm or Stats.fm
      try {
        const integrations = await apiFetch('/api/user/integrations')
        setIsStreamingConnected(!!(integrations.lastfm?.username || integrations.statsfm?.username))
      } catch (e) {
        setIsStreamingConnected(false)
      }
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed to load')
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

  const verifyStreaming = async () => {
    setError(null)
    try {
      const result = await apiFetch('/api/game/quests/verify-streaming', { method: 'POST' })
      await load()

      // Show success message if available
      if (result.message) {
        // Could show a success toast here
        console.log(result.message)
      }
    } catch (e: any) {
      // Handle specific error cases
      if (e.needsConnection) {
        setError('Please connect Last.fm or Stats.fm to verify your streaming progress.')
      } else {
        setError(e.message || 'Failed to verify streaming progress. Please try again.')
      }
    }
  }

  // Filter logic
  const filtered = quests.filter(q => {
    if (filter === 'daily') return q.period === 'daily'
    if (filter === 'weekly') return q.period === 'weekly'
    if (filter === 'special') return q.period === 'special' || q.period === 'event'
    return true
  })

  return (
    <section className="col-span-12 lg:col-span-7 flex flex-col gap-6">
      <QuestBoardHeader dailyStreak={dailyStreak} />

      {/* Tabs and Verify Button */}
      <div className="flex items-center justify-between gap-2 border-b border-white/10 pb-1">
        <div className="flex items-center gap-2">
          <button
              onClick={() => setFilter('daily')}
              className={`px-6 py-3 text-sm font-medium border-b-2 relative transition-colors ${
                  filter === 'daily'
                  ? 'text-white border-bora-primary'
                  : 'text-gray-500 border-transparent hover:text-gray-300'
              }`}
          >
              Daily Quests
              {quests.some(q => q.period === 'daily' && q.completed && !q.claimed) && (
                  <span className="absolute top-2 right-1 w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
              )}
          </button>
          <button
              onClick={() => setFilter('weekly')}
              className={`px-6 py-3 text-sm font-medium border-b-2 relative transition-colors ${
                  filter === 'weekly'
                  ? 'text-white border-bora-primary'
                  : 'text-gray-500 border-transparent hover:text-gray-300'
              }`}
          >
              Weekly Quests
          </button>
          <button
              onClick={() => setFilter('special')}
              className={`px-6 py-3 text-sm font-medium border-b-2 relative transition-colors ${
                  filter === 'special'
                  ? 'text-white border-bora-primary'
                  : 'text-gray-500 border-transparent hover:text-gray-300'
              }`}
          >
              Special Events
          </button>
        </div>

        {/* Verify Progress Button */}
        {isStreamingConnected && (
          <button
            onClick={verifyStreaming}
            className="px-4 py-2 rounded-xl bg-green-600/20 text-green-400 text-xs font-bold border border-green-600/30 hover:bg-green-600/30 transition-all flex items-center gap-2"
          >
            <span className="material-symbols-outlined text-sm">verified</span>
            Verify Progress
          </button>
        )}
      </div>

      {error && <div className="mb-4 text-rose-300">{error}</div>}

      <div className="space-y-4">
        {loading ? (
             <div className="animate-pulse space-y-4">
                <div className="h-48 bg-white/5 rounded-2xl"></div>
                <div className="h-24 bg-white/5 rounded-2xl"></div>
             </div>
        ) : filtered.length === 0 ? (
             <div className="text-center py-10 text-gray-500">
                No quests available for this period.
             </div>
        ) : (
            filtered.map(q => {
                if (q.goalType.startsWith('stream:')) {
                    return (
                        <StreamingQuestCard
                            key={q.code}
                            quest={q}
                            onClaim={claim}
                            onVerify={verifyStreaming}
                            isConnected={isStreamingConnected}
                        />
                    )
                } else {
                    return (
                        <QuizQuestCard
                            key={q.code}
                            quest={q}
                            onClaim={claim}
                            onAction={() => {}} // Could link to blog/quiz page
                        />
                    )
                }
            })
        )}
      </div>
    </section>
  )
}
