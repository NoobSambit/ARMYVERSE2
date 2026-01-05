'use client'

type QuizQuest = {
  code: string
  title: string
  period: string
  progress: number
  goalValue: number
  completed: boolean
  claimed: boolean
  reward?: { dust: number; xp: number }
  type?: string // 'quiz' | 'social' etc.
}

export default function QuizQuestCard({
  quest,
  onClaim,
  onAction
}: {
  quest: QuizQuest
  onClaim: (code: string) => void
  onAction?: () => void
}) {
  const percent = Math.min((quest.progress / quest.goalValue) * 100, 100)
  const dust = quest.reward?.dust || 100
  const xp = quest.reward?.xp || 25
  const isSocial = quest.type === 'social' || quest.title.toLowerCase().includes('comment') || quest.title.toLowerCase().includes('share')
  
  // Colors based on type
  const theme = isSocial ? 'cyan' : 'pink'
  const icon = isSocial ? 'forum' : 'quiz'
  const label = isSocial ? 'Social' : 'Knowledge'
  
  // Tailwind dynamic classes (using safe list or full strings if possible, or mapping)
  const colorMap = {
      pink: {
          bg: 'bg-pink-500/20',
          text: 'text-pink-400',
          border: 'border-pink-500/20',
          hoverText: 'group-hover:text-pink-300',
          tagBg: 'bg-pink-500/10',
          tagText: 'text-pink-300',
          gradient: 'from-pink-500 to-rose-500'
      },
      cyan: {
          bg: 'bg-cyan-500/20',
          text: 'text-cyan-400',
          border: 'border-cyan-500/20',
          hoverText: 'group-hover:text-cyan-300',
          tagBg: 'bg-cyan-500/10',
          tagText: 'text-cyan-300',
          gradient: 'from-cyan-500 to-blue-500'
      }
  }

  const colors = colorMap[theme as keyof typeof colorMap] || colorMap.pink

  return (
    <div className={`bora-glass-panel rounded-2xl p-5 hover:bg-surface-lighter/30 transition-all cursor-pointer group ${quest.claimed ? 'opacity-60 grayscale' : ''}`}>
      <div className="flex justify-between items-center mb-3">
        <div className="flex gap-4 items-center">
          <div className={`w-12 h-12 rounded-xl ${colors.bg} ${colors.text} flex items-center justify-center border ${colors.border} group-hover:scale-110 transition-transform shrink-0`}>
            <span className="material-symbols-outlined text-2xl">{icon}</span>
          </div>
          <div>
            <h3 className={`text-lg font-bold text-white ${colors.hoverText} transition-colors leading-tight`}>{quest.title}</h3>
            <div className="flex items-center gap-2 mt-1">
              <span className={`text-xs px-2 py-0.5 rounded ${colors.tagBg} ${colors.tagText} border ${colors.border}`}>{label}</span>
            </div>
          </div>
        </div>
        <div className="flex flex-col items-end gap-1 shrink-0">
          <span className="text-sm font-bold text-accent-neon">+{dust} Dust</span>
          <span className="text-xs text-gray-500">+{xp} XP</span>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="flex-1">
             <div className="flex justify-between text-xs mb-1.5">
                <span className="text-gray-400 font-medium">Progress</span>
                <span className="text-gray-300 font-bold">{quest.progress} / {quest.goalValue}</span>
             </div>
             <div className="bg-surface-lighter h-2 rounded-full overflow-hidden">
                <div className={`bg-gradient-to-r ${colors.gradient} h-full rounded-full transition-all duration-500`} style={{ width: `${percent}%` }}></div>
             </div>
        </div>
        
        {quest.completed && !quest.claimed ? (
            <button 
                onClick={(e) => { e.stopPropagation(); onClaim(quest.code) }}
                className="px-6 py-2 rounded-xl bg-bora-primary text-white text-sm font-bold hover:bg-bora-primary-dark shadow-lg shadow-bora-primary/25 transition-all animate-pulse"
            >
                Claim
            </button>
        ) : quest.claimed ? (
            <button disabled className="px-6 py-2 rounded-xl bg-surface-lighter text-gray-500 text-sm font-bold border border-white/5 cursor-not-allowed">
                Claimed
            </button>
        ) : (
            <button 
                onClick={onAction}
                className="px-6 py-2 rounded-xl bg-surface-lighter text-gray-400 text-sm font-bold border border-white/5 hover:text-white transition-colors"
            >
                Go
            </button>
        )}
      </div>
    </div>
  )
}
