'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { apiFetch, demoFetch } from '@/lib/client/api'
import QuestionCard from './QuestionCard'
import TimerBar from './TimerBar'
import ResultModal from './ResultModal'

type Question = { id: string; question: string; choices: string[] }

type Reward = {
  cardId: string
  rarity: 'common'|'rare'|'epic'|'legendary' | null | undefined
  member: string
  era: string
  set: string
  publicId: string
  imageUrl: string
} | null

type Review = {
  items: Array<{
    id: string
    question: string
    choices: string[]
    difficulty: 'easy'|'medium'|'hard'
    userAnswerIndex: number
    correctIndex: number
    xpAward: number
  }>
  summary: { xp: number; correctCount: number }
}

interface QuizScreenProps {
  demoMode?: boolean
  onExit?: () => void
}

export default function QuizScreen({ demoMode = false, onExit }: QuizScreenProps) {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [sessionId, setSessionId] = useState<string | null>(null)
  const [sessionSeed, setSessionSeed] = useState<string | null>(null)
  const [questions, setQuestions] = useState<Question[]>([])
  const [answers, setAnswers] = useState<number[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [, setExpiresAt] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [result, setResult] = useState<{ xp: number; correctCount: number; reward: Reward | null; dustAwarded?: number; duplicate?: boolean; rarityWeightsUsed?: Record<string, number> | null; pityApplied?: boolean; reason?: string | null; review?: Review | null } | null>(null)
  const [redirecting, setRedirecting] = useState(false)
  const [mode, setMode] = useState<'ranked'|'demo'|'unknown'>('unknown')

  // Ref to prevent race conditions and double triggers
  const didCompleteRef = useRef(false)

  const start = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      if (demoMode) {
        const res = await demoFetch('/api/game/quiz/demo/start', { method: 'POST', body: JSON.stringify({ count: 10 }) })
        setQuestions(res.questions)
        setSessionSeed(res.sessionSeed)
        setAnswers(new Array(res.questions.length).fill(-1))
        setExpiresAt(res.expiresAt)
        setMode('demo')
        setLoading(false)
      } else {
        const res = await apiFetch('/api/game/quiz/start', { method: 'POST', body: JSON.stringify({}) })
        setSessionId(res.sessionId)
        setQuestions(res.questions)
        setAnswers(new Array(res.questions.length).fill(-1))
        setExpiresAt(res.expiresAt)
        setMode('ranked')
        setLoading(false)
      }
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed to start')
      setLoading(false)
    }
  }, [demoMode])

  // Run once per mount (or demo/ranked toggle) to start a quiz; do not rerun on session updates
  useEffect(() => {
    start()
  }, [demoMode, start])

  // Warn on close when an active ranked session exists
  useEffect(() => {
    const warn = (e: BeforeUnloadEvent) => {
      if (!demoMode && sessionId && !result) {
        e.preventDefault()
        e.returnValue = ''
      }
    }
    window.addEventListener('beforeunload', warn)
    return () => window.removeEventListener('beforeunload', warn)
  }, [demoMode, sessionId, result])

  const selectAnswer = useCallback((idx: number) => {
    setAnswers(prev => {
      const copy = [...prev]
      copy[currentIndex] = idx
      return copy
    })
  }, [currentIndex])

  const nextQuestion = useCallback(() => {
    if (currentIndex < questions.length - 1) {
      didCompleteRef.current = false // Reset for next question
      setCurrentIndex(currentIndex + 1)
    }
  }, [currentIndex, questions.length])

  const submitQuiz = useCallback(async () => {
    if (!sessionId && !sessionSeed) return

    // Prevent double submission
    if (isSubmitting) return

    setIsSubmitting(true)
    didCompleteRef.current = true // Prevent any further timer callbacks

    try {
      if (demoMode) {
        const payload = {
          answers,
          sessionSeed: sessionSeed!
        }
        const res = await demoFetch('/api/game/quiz/demo/complete', { method: 'POST', body: JSON.stringify(payload) })
        setResult({
          xp: res.xp,
          correctCount: res.correctCount,
          reward: res.previewReward || null,
          dustAwarded: 0,
          duplicate: false,
          rarityWeightsUsed: res.rarityWeightsUsed || null,
          pityApplied: false,
          reason: null,
          review: res.review
        })
      } else {
        const payload = { sessionId, answers }
        const res = await apiFetch('/api/game/quiz/complete', { method: 'POST', body: JSON.stringify(payload) })
        setResult({
          xp: res.xp,
          correctCount: res.correctCount,
          reward: res.reward || null,
          dustAwarded: res.dustAwarded || 0,
          duplicate: !!res.duplicate,
          rarityWeightsUsed: res.rarityWeightsUsed || null,
          pityApplied: !!res.pityApplied,
          reason: res.reason || null,
          review: res.review
        })
      }
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed to complete')
    } finally {
      setIsSubmitting(false)
    }
  }, [sessionId, sessionSeed, isSubmitting, demoMode, answers])

  const onTimeout = useCallback(() => {
    if (didCompleteRef.current) return // Prevent race conditions

    if (currentIndex < questions.length - 1) {
      nextQuestion()
    } else {
      submitQuiz()
    }
  }, [currentIndex, nextQuestion, questions.length, submitQuiz])

  // Timer duration - memoized to prevent unnecessary re-renders
  const timerDuration = useMemo(() => 20000, [])

  // Accessibility announcement for 5 seconds remaining
  const handleTimerTick = useCallback((remainingMs: number) => {
    if (remainingMs <= 5000) {
      const region = document.getElementById('timer-live')
      if (region) {
        region.textContent = '5 seconds left'
      }
    }
  }, [])

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-8">
        <div className="space-y-3">
          <div className="h-6 rounded bg-white/10 animate-pulse" />
          <div className="h-6 rounded bg-white/10 animate-pulse" />
          <div className="h-6 rounded bg-white/10 animate-pulse" />
        </div>
      </div>
    )
  }
  if (error) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-8 text-rose-300">
        {error} <button className="underline" onClick={start}>Retry</button>
      </div>
    )
  }

  const q = questions[currentIndex]
  if (!q) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-8 text-white/80">
        No questions available.
        <div className="mt-3">
          <button onClick={start} className="px-4 py-2 rounded-xl border border-[#3b1a52]/60">Retry</button>
        </div>
      </div>
    )
  }
  const progress = `${currentIndex + 1}/${questions.length}`

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <div className="sticky top-0 z-10 bg-gradient-to-b from-black/60 to-transparent backdrop-blur-md mb-4">
        <div className="flex items-center justify-between py-2">
          <div className="flex items-center gap-4">
            {demoMode && onExit && (
              <button onClick={onExit} className="text-white/60 hover:text-white">
                ← Exit Demo
              </button>
            )}
            <div className="text-white/80">Q {progress}</div>
          </div>
          <div className="flex-1 mx-4">
            <TimerBar
              key={`timer-${currentIndex}`}
              durationMs={timerDuration}
              onTick={handleTimerTick}
              onComplete={onTimeout}
            />
            <div className="mt-1 text-center text-white/50 text-xs">XP: +1 easy, +2 medium, +3 hard. 5+ XP unlocks drops; 25+ XP now gives 25% legendary with heavy rare/epic boosts.</div>
          </div>
          <button
            disabled={isSubmitting}
            onClick={currentIndex < questions.length - 1 ? nextQuestion : submitQuiz}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#FF9AD5] to-[#C084FC] text-black font-semibold disabled:opacity-50"
          >
            {currentIndex < questions.length - 1 ? 'Next' : 'Submit'}
          </button>
        </div>
        {mode === 'demo' && (
          <div className="mt-2 text-center text-blue-300 text-sm">Demo mode: preview rewards, no collection</div>
        )}
      </div>

      <QuestionCard question={q.question} choices={q.choices} selectedIndex={answers[currentIndex]} onSelect={selectAnswer} />

      <ResultModal
        open={!!result}
        onClose={() => {
          setResult(null)
          if (!demoMode && result && !redirecting) {
            setRedirecting(true)
            window.location.href = '/boraland'
          }
        }}
        xp={result?.xp || 0}
        correctCount={result?.correctCount || 0}
        reward={result?.reward || null}
        dustAwarded={result?.dustAwarded || 0}
        duplicate={!!result?.duplicate}
        rarityWeightsUsed={result?.rarityWeightsUsed || null}
        pityApplied={result?.pityApplied || false}
        reason={result?.reason || null}
        review={result?.review}
        demoMode={demoMode}
      />
    </div>
  )
}
