'use client'

import Link from 'next/link'
import Image from 'next/image'
import RarityPill from './RarityPill'
import { useMemo, useState } from 'react'
import { apiFetch } from '@/lib/client/api'

type Reward = {
  cardId: string
  rarity: 'common'|'rare'|'epic'|'legendary' | null | undefined
  member: string
  era: string
  set: string
  publicId: string
  imageUrl: string
} | null

export default function ResultModal({ open, onClose, xp, correctCount, reward, rarityWeightsUsed, pityApplied, reason, review, demoMode = false }: { open: boolean; onClose: () => void; xp: number; correctCount: number; reward: Reward; rarityWeightsUsed?: Record<string, number> | null; pityApplied?: boolean; reason?: string | null; review?: { items: Array<{ id: string; question: string; choices: string[]; difficulty: 'easy'|'medium'|'hard'; userAnswerIndex: number; correctIndex: number; xpAward: number }>; summary: { xp: number; correctCount: number } } | null; demoMode?: boolean }) {
  const [shareUrl, setShareUrl] = useState<string | null>(null)
  const [sharing, setSharing] = useState(false)
  const [showReview, setShowReview] = useState(false)
  const [filter, setFilter] = useState<'all'|'correct'|'wrong'>('all')

  const filteredItems = useMemo(() => {
    if (!review) return []
    const items = review.items || []
    if (filter === 'all') return items
    if (filter === 'correct') return items.filter(it => it.userAnswerIndex >= 0 && it.userAnswerIndex === it.correctIndex)
    return items.filter(it => it.userAnswerIndex !== it.correctIndex)
  }, [review, filter])

  if (!open) return null

  const ring = reward?.rarity === 'legendary' ? 'shadow-[0_0_40px_rgba(251,191,36,0.35)]' : reward?.rarity === 'epic' ? 'shadow-[0_0_40px_rgba(232,121,249,0.35)]' : ''
  const doShare = async () => {
    if (!reward) return
    try {
      setSharing(true)
      const res = await apiFetch('/api/game/share', { method: 'POST', body: JSON.stringify({ inventoryItemId: reward.cardId }) })
      setShareUrl(res.shareUrl)
      await navigator.clipboard.writeText(res.shareUrl)
    } catch (e) {
      // noop
    } finally {
      setSharing(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 overflow-y-auto">
      <div className={`w-full max-w-lg rounded-2xl border border-[#3b1a52]/60 bg-white/5 backdrop-blur-md p-6 ${ring} max-h-[90vh] overflow-y-auto`}>
        <div className="text-center text-white text-2xl font-semibold">
          {demoMode ? 'Demo Result' : 'Your Result'}
        </div>
        <div className="text-center text-white/70 mt-1">XP earned: {xp} • Correct: {correctCount}</div>
        {(!reward && reason === 'low_xp') && (
          <div className="text-center text-amber-300 text-sm mt-1">Need at least 5 XP to earn a card.</div>
        )}
        {demoMode && (
          <div className="text-center text-blue-300 text-sm mt-1">Demo Mode - Preview Only</div>
        )}
        {reward && (
          <div className="mt-4 flex flex-col items-center">
            <div className="relative">
              <Image src={reward.imageUrl} alt={`${reward.member} ${reward.era}`} width={192} height={256} className="w-48 h-64 object-cover rounded-xl" />
              {(reward.rarity === 'legendary' || reward.rarity === 'epic') && (
                <div className="pointer-events-none absolute -inset-2 rounded-2xl animate-pulse" style={{ boxShadow: reward.rarity === 'legendary' ? '0 0 50px rgba(251,191,36,0.35)' : '0 0 50px rgba(232,121,249,0.35)' }} />
              )}
              {demoMode && (
                <div className="absolute inset-0 bg-black/20 rounded-xl flex items-center justify-center">
                  <div className="bg-black/60 text-white px-3 py-1 rounded-full text-sm font-semibold">
                    DEMO
                  </div>
                </div>
              )}
            </div>
            <div className="mt-2 flex items-center gap-2 text-white">
              <RarityPill rarity={reward.rarity} />
              <span>{reward.member} • {reward.era}</span>
            </div>
          </div>
        )}
        {(rarityWeightsUsed && reward) && (
          <div className="mt-4 rounded-xl border border-[#3b1a52]/60 bg-white/5 p-4 text-white/80">
            <div className="font-semibold text-white mb-2">Odds this run</div>
            <div className="grid grid-cols-2 gap-y-1 text-sm">
              <div>Common</div><div className="text-right">{rarityWeightsUsed.common}%</div>
              <div>Rare</div><div className="text-right">{rarityWeightsUsed.rare}%</div>
              <div>Epic</div><div className="text-right">{rarityWeightsUsed.epic}%</div>
              <div>Legendary</div><div className="text-right">{rarityWeightsUsed.legendary}%</div>
            </div>
            <div className="mt-2 text-xs text-white/60">Rolled: <span className="text-white">{reward.rarity}</span>{pityApplied ? ' • Pity applied' : ''}</div>
          </div>
        )}
        {/* Review Answers */}
        {!!review && (
          <div className="mt-4 rounded-2xl border border-[#3b1a52]/60 bg-white/5">
            <button
              aria-expanded={showReview}
              aria-controls="quiz-review-panel"
              onClick={() => {
                setShowReview(!showReview)
                if (!showReview) {
                  const region = document.getElementById('review-live')
                  if (region) region.textContent = `Showing review for ${review.items.length} questions.`
                }
              }}
              className="w-full text-left px-4 py-3 text-white/90 font-semibold flex items-center justify-between"
            >
              Review answers
              <span className="text-white/60 text-sm">{showReview ? 'Hide' : 'Show'}</span>
            </button>
            <div id="review-live" aria-live="polite" className="sr-only" />
            {showReview && (
              <div id="quiz-review-panel" className="px-4 pb-4">
                <div className="flex items-center gap-2 text-xs text-white/70 mb-3">
                  <button onClick={() => setFilter('all')} className={`px-2 py-1 rounded-xl border ${filter==='all'?'border-white/60 text-white':'border-white/20'}`}>All</button>
                  <button onClick={() => setFilter('correct')} className={`px-2 py-1 rounded-xl border ${filter==='correct'?'border-white/60 text-white':'border-white/20'}`}>Correct</button>
                  <button onClick={() => setFilter('wrong')} className={`px-2 py-1 rounded-xl border ${filter==='wrong'?'border-white/60 text-white':'border-white/20'}`}>Wrong</button>
                </div>
                <div className="space-y-3 max-h-80 overflow-auto pr-1">
                  {filteredItems.map((it, idx) => {
                    return (
                      <div key={it.id} className="rounded-xl border border-[#3b1a52]/60 p-3 bg-white/5">
                        <div className="flex items-start justify-between gap-3">
                          <div className="text-white/90 text-sm flex-1">{idx+1}. {it.question}</div>
                          <div className="text-xs text-white/70 flex items-center gap-2">
                            <span className={`px-2 py-0.5 rounded-full ${it.difficulty==='easy'?'bg-emerald-500/20 text-emerald-200':it.difficulty==='medium'?'bg-amber-500/20 text-amber-200':'bg-fuchsia-500/20 text-fuchsia-200'}`}>{it.difficulty}</span>
                            <span className="px-2 py-0.5 rounded-full bg-white/10 text-white/80">+{it.xpAward} XP</span>
                          </div>
                        </div>
                        <ul className="mt-2 space-y-1">
                          {it.choices.map((choice, cIdx) => {
                            const userPick = it.userAnswerIndex === cIdx
                            const correct = it.correctIndex === cIdx
                            return (
                              <li key={cIdx} aria-selected={userPick} className={`px-3 py-2 rounded-xl text-sm ${correct ? 'bg-emerald-600/20 border border-emerald-400/40' : userPick ? 'bg-rose-600/10 border border-rose-400/30' : 'bg-white/5 border border-white/10'}`}>
                                <span className="text-white/90">{choice}</span>
                                {correct && <span className="sr-only"> correct answer</span>}
                                <span className="ml-2 text-xs text-white/70">
                                  {correct ? 'Correct' : (userPick ? 'Your pick' : '')}
                                </span>
                              </li>
                            )
                          })}
                        </ul>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}
          </div>
        )}
        <div className="mt-6 flex gap-3 justify-center flex-wrap">
          {demoMode ? (
            <>
              <Link href="/auth/signin" className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#FF9AD5] to-[#C084FC] text-black font-semibold">
                Sign In to Collect
              </Link>
              <button
                onClick={() => {
                  onClose()
                  // Could trigger another demo quiz here if desired
                }}
                className="px-4 py-2 rounded-xl border border-[#3b1a52]/60 text-white/90"
              >
                Try Another Demo
              </button>
            </>
          ) : (
            <>
              <Link href="/boraland/inventory" className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#FF9AD5] to-[#C084FC] text-black font-semibold">
                View in Inventory
              </Link>
              <Link href="/boraland/play" className="px-4 py-2 rounded-xl border border-[#3b1a52]/60 text-white/90">
                Play Again
              </Link>
              <button onClick={doShare} disabled={sharing} className="px-4 py-2 rounded-xl border border-[#3b1a52]/60 text-white/90">
                {sharing ? 'Sharing…' : 'Share'}
              </button>
            </>
          )}
          <button onClick={onClose} className="px-4 py-2 rounded-xl border border-[#3b1a52]/60 text-white/90">
            Close
          </button>
        </div>
        {shareUrl && <div className="mt-3 text-center text-white/70">Share link copied to clipboard.</div>}
      </div>
    </div>
  )
}


