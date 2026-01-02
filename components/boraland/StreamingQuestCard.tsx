'use client'

type StreamingQuest = {
  code: string
  title: string
  period: string
  progress: number
  goalValue: number
  completed: boolean
  claimed: boolean
  streamingMeta?: {
    trackTargets?: Array<{ trackName: string; artistName: string; count: number }>
    albumTargets?: Array<{ albumName: string; trackCount: number }>
  }
}

export default function StreamingQuestCard({
  quest,
  onClaim,
  onVerify
}: {
  quest: StreamingQuest
  onClaim: (code: string) => void
  onVerify: () => void
}) {
  return (
    <div className="rounded-2xl border border-[#3b1a52]/60 bg-white/5 backdrop-blur-md p-4">
      <div className="flex items-center justify-between mb-3">
        <div>
          <div className="text-white/90 font-medium">{quest.title}</div>
          <div className="text-white/60 text-sm">{quest.period} • {quest.progress}/{quest.goalValue}</div>
        </div>

        <div className="text-2xl">🎵</div>
      </div>

      {/* Track targets */}
      {quest.streamingMeta?.trackTargets && (
        <div className="mb-3 space-y-1">
          {quest.streamingMeta.trackTargets.map((target, idx) => (
            <div key={idx} className="text-sm text-white/70">
              • {target.trackName} by {target.artistName} ({target.count}x)
            </div>
          ))}
        </div>
      )}

      {/* Album targets */}
      {quest.streamingMeta?.albumTargets && (
        <div className="mb-3 space-y-1">
          {quest.streamingMeta.albumTargets.map((target, idx) => (
            <div key={idx} className="text-sm text-white/70">
              • {target.trackCount} songs from {target.albumName}
            </div>
          ))}
        </div>
      )}

      {/* Progress bar */}
      <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden mb-3">
        <div
          className="h-full bg-gradient-to-r from-[#FF9AD5] to-[#C084FC] transition-all"
          style={{ width: `${Math.min((quest.progress / quest.goalValue) * 100, 100)}%` }}
        />
      </div>

      {/* Actions */}
      <div className="flex gap-2">
        <button
          onClick={onVerify}
          className="flex-1 px-3 py-1 rounded-lg border border-[#3b1a52]/60 text-white/90 text-sm hover:bg-white/10"
        >
          Check Progress
        </button>

        <button
          disabled={!quest.completed || quest.claimed}
          onClick={() => onClaim(quest.code)}
          className="flex-1 px-3 py-1 rounded-lg border border-[#3b1a52]/60 disabled:opacity-50 text-white/90 text-sm hover:bg-white/10"
        >
          {quest.claimed ? 'Claimed' : quest.completed ? 'Claim' : 'In progress'}
        </button>
      </div>
    </div>
  )
}
