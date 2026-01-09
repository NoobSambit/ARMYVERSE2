'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
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

export default function QuestsView({ dailyStreak, onStateRefresh }: { dailyStreak?: StreakInfo; onStateRefresh?: () => Promise<void> }) {
  const router = useRouter()
  const [quests, setQuests] = useState<Quest[]>([])
  const [filter, setFilter] = useState<'daily' | 'weekly' | 'special'>('daily')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [isStreamingConnected, setIsStreamingConnected] = useState(false)
  const [isVerifying, setIsVerifying] = useState(false)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

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

  const startQuiz = () => {
    router.push('/boraland/quest-play')
  }

  const claim = async (code: string) => {
    try {
      await apiFetch('/api/game/quests/claim', { method: 'POST', body: JSON.stringify({ code }) })
      await load()
      if (onStateRefresh) {
        await onStateRefresh()
      }
    } catch (e) {}
  }

  const verifyStreaming = async () => {
    setError(null)
    setSuccessMessage(null)
    setIsVerifying(true)
    try {
      const result = await apiFetch('/api/game/quests/verify-streaming', { method: 'POST' })
      await load()

      // Show success message
      if (result.message) {
        setSuccessMessage(result.message)
        // Auto-hide success message after 5 seconds
        setTimeout(() => setSuccessMessage(null), 5000)
      }
    } catch (e: any) {
      // Handle specific error cases
      if (e.needsConnection) {
        setError('Please connect Last.fm or Stats.fm to verify your streaming progress.')
      } else {
        setError(e.message || 'Failed to verify streaming progress. Please try again.')
      }
      // Auto-hide error message after 5 seconds
      setTimeout(() => setError(null), 5000)
    } finally {
      setIsVerifying(false)
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
    <section className="flex flex-col gap-4 md:gap-6 h-full">
      <QuestBoardHeader dailyStreak={dailyStreak} />

      {/* Tabs and Verify Button */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-2 border-b border-white/10 pb-1">
        <div className="flex items-center gap-1 md:gap-2 overflow-x-auto w-full sm:w-auto scrollbar-hide">
          <button
              onClick={() => setFilter('daily')}
              className={`px-3 md:px-6 py-2 md:py-3 text-xs md:text-sm font-medium border-b-2 relative transition-colors whitespace-nowrap ${
                  filter === 'daily'
                  ? 'text-white border-bora-primary'
                  : 'text-gray-500 border-transparent hover:text-gray-300'
              }`}
          >
              <span className="hidden sm:inline">Daily Quests</span>
              <span className="sm:hidden">Daily</span>
              {quests.some(q => q.period === 'daily' && q.completed && !q.claimed) && (
                  <span className="absolute top-1 right-0 w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
              )}
          </button>
          <button
              onClick={() => setFilter('weekly')}
              className={`px-3 md:px-6 py-2 md:py-3 text-xs md:text-sm font-medium border-b-2 relative transition-colors whitespace-nowrap ${
                  filter === 'weekly'
                  ? 'text-white border-bora-primary'
                  : 'text-gray-500 border-transparent hover:text-gray-300'
              }`}
          >
              <span className="hidden sm:inline">Weekly Quests</span>
              <span className="sm:hidden">Weekly</span>
          </button>
          <button
              onClick={() => setFilter('special')}
              className={`px-3 md:px-6 py-2 md:py-3 text-xs md:text-sm font-medium border-b-2 relative transition-colors whitespace-nowrap ${
                  filter === 'special'
                  ? 'text-white border-bora-primary'
                  : 'text-gray-500 border-transparent hover:text-gray-300'
              }`}
          >
              <span className="hidden sm:inline">Special Events</span>
              <span className="sm:hidden">Special</span>
          </button>
        </div>

        {/* Verify Progress Button */}
        {isStreamingConnected && (
          <button
            onClick={verifyStreaming}
            disabled={isVerifying}
            className={`px-3 md:px-4 py-1.5 md:py-2 rounded-xl text-[10px] md:text-xs font-bold border transition-all flex items-center gap-1.5 md:gap-2 shrink-0 ${
              isVerifying
                ? 'bg-green-600/10 text-green-400/50 border-green-600/20 cursor-wait'
                : 'bg-green-600/20 text-green-400 border-green-600/30 hover:bg-green-600/30'
            }`}
          >
            <span className={`material-symbols-outlined text-xs md:text-sm ${isVerifying ? 'animate-spin' : ''}`}>
              {isVerifying ? 'refresh' : 'verified'}
            </span>
            <span className="hidden sm:inline">{isVerifying ? 'Verifying...' : 'Verify Progress'}</span>
            <span className="sm:hidden">{isVerifying ? 'Verifying...' : 'Verify'}</span>
          </button>
        )}
      </div>

      {successMessage && (
        <div className="mb-4 p-3 md:mb-6 rounded-xl bg-green-500/10 border border-green-500/20 flex items-center gap-3 animate-slide-down">
          <span className="material-symbols-outlined text-green-400 shrink-0">check_circle</span>
          <span className="text-green-300 text-sm font-medium">{successMessage}</span>
        </div>
      )}

      {error && (
        <div className="mb-4 p-3 md:mb-6 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center gap-3 animate-slide-down">
          <span className="material-symbols-outlined text-rose-400 shrink-0">error</span>
          <span className="text-rose-300 text-sm">{error}</span>
        </div>
      )}

      <div className="space-y-3 md:space-y-4">
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
                            onAction={startQuiz}
                        />
                    )
                }
            })
        )}
      </div>
    </section>
  )
}
