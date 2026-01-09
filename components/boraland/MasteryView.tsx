'use client'

import { useMemo, useState } from 'react'
import { apiFetch } from '@/lib/client/api'
import { useToast } from '@/components/ui/Toast'

type MasteryDefinition = { key: string; displayName?: string; coverImage?: string }
type MasteryTrack = {
  definition: MasteryDefinition
  track: {
    kind: 'member' | 'era'
    key: string
    xp: number
    level: number
    xpToNext: number
    nextMilestone: number | null
    claimable: number[]
    claimedMilestones: number[]
  }
}

type Milestone = { level: number; rewards: { xp: number; dust: number } }

type MasteryResponse = {
  members: MasteryTrack[]
  eras: MasteryTrack[]
  milestones: Milestone[]
  summary: { totalTracks: number; claimableCount: number; dust: number; totalXp: number }
}

interface MasteryViewProps {
    data: MasteryResponse | null
    loading: boolean
    onRefresh: () => void
}

export default function MasteryView({ data, loading, onRefresh }: MasteryViewProps) {
  const [claimingKey, setClaimingKey] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null) // Although data is passed, claim error is local
  const [activePane, setActivePane] = useState<'members' | 'eras'>('members')
  const { showToast } = useToast()

  const dividerFor = (track: MasteryTrack['track']) => {
    return track.kind === 'member' && track.key.toUpperCase() === 'OT7' ? 7 : 1
  }

  const progressPercent = (track: MasteryTrack['track']) => {
    const divider = dividerFor(track)
    const perLevel = 100 * divider
    const currentLevelXp = track.xp - track.level * perLevel
    const span = perLevel || 1
    return Math.min(100, Math.max(0, (currentLevelXp / span) * 100))
  }

  const claim = async (kind: 'member' | 'era', key: string, milestone?: number) => {
    try {
      setClaimingKey(`${kind}:${key}`)
      await apiFetch('/api/game/mastery/claim', { method: 'POST', body: JSON.stringify({ kind, key, milestone }) })
      onRefresh()
      showToast('success', 'Reward claimed')
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : 'Unable to claim'
      setError(message)
      showToast('error', message)
    } finally {
      setClaimingKey(null)
    }
  }

  const renderMilestones = (item: MasteryTrack) => {
    const isClaiming = claimingKey === `${item.track.kind}:${item.track.key}`
    return (
      <div className="flex items-center gap-3 mt-3">
        {data?.milestones.map((ms) => {
          const claimed = item.track.claimedMilestones.includes(ms.level)
          const claimable = item.track.claimable.includes(ms.level)
          const baseClass = 'w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold transition shadow-sm'
          const stateClass = claimed
            ? 'bg-emerald-500 text-white shadow-[0_8px_16px_rgba(16,185,129,0.25)]'
            : claimable
              ? 'bg-gradient-to-br from-primary to-secondary text-white cursor-pointer hover:translate-y-[1px]'
              : 'bg-gray-100 text-gray-500'
          return (
            <button
              key={ms.level}
              disabled={!claimable || isClaiming}
              onClick={() => claimable && claim(item.track.kind, item.track.key, ms.level)}
              className={`${baseClass} ${stateClass} ${isClaiming ? 'opacity-60' : ''}`}
              title={claimable ? `Claim +${ms.rewards.xp} XP / +${ms.rewards.dust} Dust` : ''}
            >
              {claimed ? '✓' : ms.level}
            </button>
          )
        })}
      </div>
    )
  }

  const renderTrackCard = (item: MasteryTrack) => {
    const display = item.definition.displayName || item.definition.key
    const pct = progressPercent(item.track)
    const claimableReward = item.track.claimable.length ? data?.milestones.find(m => m.level === item.track.claimable[0]) : null
    const isClaiming = claimingKey === `${item.track.kind}:${item.track.key}`

    return (
      <div key={item.track.key} className="relative rounded-2xl border border-white/10 bg-white/5 shadow-[0_12px_40px_rgba(0,0,0,0.15)] p-5 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-white/5 to-white/0 pointer-events-none" />
        <div className="flex justify-between items-start">
          <div>
            <div className="text-[10px] uppercase tracking-wider text-gray-300">{item.track.kind === 'member' ? 'Member' : 'Era'}</div>
            <h4 className="text-lg font-semibold text-white">{display}</h4>
            <div className="flex items-center gap-2 mt-1">
              <span className={`px-2 py-0.5 rounded-full text-[11px] font-bold ${item.track.key.toUpperCase() === 'OT7' ? 'bg-gradient-to-r from-primary to-secondary text-white shadow-[0_8px_20px_rgba(168,85,247,0.3)]' : 'bg-white/10 text-white/90 border border-white/10'}`}>
                Lvl {item.track.level}
              </span>
              <span className="text-[10px] text-gray-400">Next milestone: {item.track.nextMilestone ?? 'Max'}</span>
            </div>
          </div>
          <div className="text-right">
            <div className="text-[11px] text-gray-400">Total XP</div>
            <div className="font-mono text-sm text-white">{item.track.xp}</div>
          </div>
        </div>
        <div className="mt-3">
          <div className="h-2 rounded-full bg-white/10 overflow-hidden">
            <div className="h-full bg-gradient-to-r from-primary to-secondary" style={{ width: `${pct}%` }} />
          </div>
          <div className="flex justify-between text-[11px] text-gray-400 mt-1">
            <span>{item.track.xp} XP</span>
            <span>{item.track.xpToNext} XP to next</span>
          </div>
        </div>
        {renderMilestones(item)}
        <div className="mt-3 text-xs text-gray-200 bg-white/5 border border-white/10 rounded-lg px-3 py-2 flex items-center justify-between">
          {claimableReward ? (
            <>
              <div className="text-left">
                <div className="text-[11px] text-gray-400">Claimable</div>
                <div className="font-semibold text-white">+{claimableReward.rewards.xp} XP • +{claimableReward.rewards.dust} Dust</div>
              </div>
              <button
                onClick={() => claim(item.track.kind, item.track.key, claimableReward.level)}
                disabled={isClaiming}
                className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-primary to-secondary text-white font-semibold text-xs shadow hover:translate-y-[1px] transition"
              >
                Claim
              </button>
            </>
          ) : (
            <div className="text-gray-400">Keep going to reach the next milestone.</div>
          )}
        </div>
      </div>
    )
  }

  const summaryCards = useMemo(() => {
    const s = data?.summary
    return [
      { label: 'Claimable', value: s?.claimableCount ?? 0, icon: 'redeem', color: 'from-primary to-pink-500' },
      { label: 'Dust', value: s?.dust ?? 0, icon: 'auto_awesome', color: 'from-amber-400 to-amber-600' },
      { label: 'Total XP', value: s?.totalXp ?? 0, icon: 'bolt', color: 'from-cyan-400 to-blue-500' }
    ]
  }, [data])

  return (
    <div className="max-w-7xl w-full mx-auto px-3 md:px-6 py-6 md:py-8">
      <div className="mb-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold text-white">Mastery</h2>
            <p className="text-gray-400 text-sm">Track member & era mastery, claim XP and Dust rewards.</p>
          </div>
          <div className="flex flex-col gap-2 w-full md:w-auto">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {summaryCards.map((c) => (
                <div key={c.label} className="relative rounded-xl border border-white/10 bg-gradient-to-br from-white/10 via-white/5 to-white/0 px-4 py-3 overflow-hidden shadow-[0_12px_30px_rgba(0,0,0,0.3)]">
                  <div className={`absolute -right-6 -top-6 w-20 h-20 rounded-full bg-gradient-to-br ${c.color} opacity-25`} />
                  <div className="flex items-center justify-between relative z-10">
                    <div>
                      <div className="text-[11px] uppercase tracking-wider text-gray-300">{c.label}</div>
                      <div className="text-xl font-bold text-white">{c.value}</div>
                    </div>
                    <span className="material-symbols-outlined text-white/80">{c.icon}</span>
                  </div>
                </div>
              ))}
            </div>
            <div className="flex items-center justify-between md:hidden">
              <div className="flex rounded-full bg-white/5 border border-white/10 p-1">
                <button
                  className={`px-3 py-1 rounded-full text-xs font-semibold ${activePane === 'members' ? 'bg-gradient-to-r from-primary to-secondary text-white shadow' : 'text-gray-300'}`}
                  onClick={() => setActivePane('members')}
                >
                  Members
                </button>
                <button
                  className={`px-3 py-1 rounded-full text-xs font-semibold ${activePane === 'eras' ? 'bg-gradient-to-r from-primary to-secondary text-white shadow' : 'text-gray-300'}`}
                  onClick={() => setActivePane('eras')}
                >
                  Eras
                </button>
              </div>
              {onRefresh && (
                <button onClick={onRefresh} className="text-xs text-gray-300 border border-white/10 rounded-full px-3 py-1 bg-white/5">
                  Refresh
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {error && <div className="mb-4 text-rose-300 text-sm">{error}</div>}
      {(loading) && !data && <div className="text-gray-400 text-sm">Loading mastery...</div>}

      {data && (
        <div className="space-y-8">
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            <section className={`space-y-3 ${activePane === 'members' ? '' : 'hidden md:block'}`}>
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary">groups</span> Member Mastery
                </h3>
                <span className="text-[11px] text-gray-400 bg-white/5 px-2 py-1 rounded-full">{data.members.length} Tracks</span>
              </div>
              <div className="space-y-3">
                {data.members.length === 0 ? (
                  <div className="text-gray-500 text-sm text-center py-6 border border-dashed border-white/10 rounded-xl">No member mastery data yet</div>
                ) : (
                  data.members.map((m) => renderTrackCard(m))
                )}
              </div>
            </section>

            <section className={`space-y-3 ${activePane === 'eras' ? '' : 'hidden md:block'}`}>
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                  <span className="material-symbols-outlined text-pink-400">album</span> Era Mastery
                </h3>
                <span className="text-[11px] text-gray-400 bg-white/5 px-2 py-1 rounded-full">{data.eras.length} Eras</span>
              </div>
              <div className="space-y-3">
                {data.eras.length === 0 ? (
                  <div className="text-gray-500 text-sm text-center py-6 border border-dashed border-white/10 rounded-xl">No era mastery data yet</div>
                ) : (
                  data.eras.map((e) => renderTrackCard(e))
                )}
              </div>
            </section>
          </div>
        </div>
      )}
    </div>
  )
}
