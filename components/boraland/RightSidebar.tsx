import { GameStats } from '@/app/boraland/page'
import { getLevelProgress } from '@/lib/game/leveling'

export default function RightSidebar({ stats }: { stats: GameStats | null }) {
  const totalXp = stats?.totalXp || 0
  const levelProgress = getLevelProgress(totalXp)
  const progressPercent = levelProgress.progressPercent
  const level = levelProgress.level
  const xpIntoLevel = levelProgress.xpIntoLevel
  const xpForNextLevel = levelProgress.xpForNextLevel
  const xpToNextLevel = levelProgress.xpToNextLevel
  const dust = stats?.dust || 0
  const fmt = (value: number) => value.toLocaleString()

  return (
    <aside className="w-full lg:w-80 shrink-0 flex flex-col gap-4 md:gap-6">
    <div className="bora-glass-panel rounded-2xl p-4 md:p-6">
    <h3 className="font-display text-base md:text-lg font-bold text-white mb-4 md:mb-6 flex items-center gap-2">
    <span className="material-symbols-outlined text-accent-cyan text-lg md:text-xl">bar_chart</span> Performance
                    </h3>
    <div className="space-y-4 md:space-y-6">
    <div>
    <div className="flex justify-between text-xs md:text-sm mb-2">
    <span className="text-gray-400">Level {level}</span>
    <span className="text-white font-bold">{fmt(xpIntoLevel)} <span className="text-gray-500 font-normal">/ {fmt(xpForNextLevel)}</span></span>
    </div>
    <div className="h-2 w-full bg-gray-800 rounded-full overflow-hidden">
    <div className="h-full bg-gradient-to-r from-accent-cyan to-blue-500 shadow-[0_0_10px_rgba(6,182,212,0.5)]" style={{width: `${progressPercent}%`}}></div>
    </div>
    <div className="flex justify-between text-[10px] md:text-xs text-gray-500 mt-2">
    <span>Total XP {fmt(totalXp)}</span>
    <span>{fmt(xpToNextLevel)} XP to Lvl {level + 1}</span>
    </div>
    </div>
    <div className="grid grid-cols-2 gap-3 md:gap-4">
    <div className="bg-white/5 rounded-xl p-2 md:p-3 border border-white/5 text-center">
    <div className="text-[10px] md:text-xs text-gray-500 mb-1">Streak</div>
    <div className="text-lg md:text-xl font-bold text-white flex justify-center items-center gap-1">
    <span className="material-symbols-outlined text-orange-500 text-base md:text-lg">local_fire_department</span>
                                    {/* Mocked for now as API doesn't return streak yet */}
                                    --
                                 </div>
    </div>
    <div className="bg-white/5 rounded-xl p-2 md:p-3 border border-white/5 text-center">
    <div className="text-[10px] md:text-xs text-gray-500 mb-1">Dust</div>
    <div className="text-lg md:text-xl font-bold text-white flex justify-center items-center gap-1">
    <span className="material-symbols-outlined text-amber-400 text-base md:text-lg">sparkles</span>
    {dust}
    </div>
    </div>
    <div className="bg-white/5 rounded-xl p-2 md:p-3 border border-white/5 text-center">
    <div className="text-[10px] md:text-xs text-gray-500 mb-1">Win Rate</div>
    <div className="text-lg md:text-xl font-bold text-white">--%</div>
    </div>
    </div>
    <div className="pt-3 md:pt-4 border-t border-white/5">
    <div className="flex items-center justify-between mb-2">
    <span className="text-xs md:text-sm text-gray-400">Total Cards</span>
    <span className="text-xs md:text-sm text-white font-bold">{stats?.total || 0}</span>
    </div>
    {/* Simplified bar chart for visualization - static for now */}
    <div className="flex items-end gap-0.5 md:gap-1 h-10 md:h-12">
    <div className="w-full bg-purple-500/20 h-[30%] rounded-t-sm"></div>
    <div className="w-full bg-purple-500/30 h-[50%] rounded-t-sm"></div>
    <div className="w-full bg-purple-500/40 h-[40%] rounded-t-sm"></div>
    <div className="w-full bg-purple-500/60 h-[70%] rounded-t-sm"></div>
    <div className="w-full bg-purple-500/80 h-[60%] rounded-t-sm"></div>
    <div className="w-full bg-accent-neon h-[90%] rounded-t-sm shadow-[0_0_10px_rgba(168,85,247,0.4)]"></div>
    </div>
    </div>
    </div>
    </div>
    <div className="bora-glass-panel rounded-2xl p-4 md:p-6 relative overflow-hidden flex-grow flex flex-col">
    <div className="absolute inset-0 bg-gradient-to-b from-transparent to-bora-primary/10"></div>
    <div className="flex justify-between items-center mb-3 md:mb-4 z-10">
    <h3 className="font-display text-xs md:text-sm font-bold text-white uppercase tracking-wider">Showcase</h3>
    <span className="text-[10px] md:text-xs text-accent-pink border border-accent-pink/30 px-1.5 md:px-2 py-0.5 rounded bg-accent-pink/10">{stats?.latest?.card?.category || 'RANDOM'}</span>
    </div>
    <div className="flex-grow flex items-center justify-center py-3 md:py-4 relative z-10 perspective-1000">
    <div className="absolute w-32 h-44 md:w-40 md:h-56 bg-gradient-to-tr from-accent-pink to-bora-primary rounded-xl blur-[30px] opacity-40 animate-pulse"></div>
    <div className="w-40 h-60 md:w-48 md:h-72 bg-gray-900 rounded-xl border border-white/10 relative overflow-hidden shadow-2xl transform hover:scale-105 transition-transform duration-500 group">
    {stats?.latest?.card ? (
        <>
        <div className="absolute inset-0 bg-cover bg-center" style={{backgroundImage: `url('${stats.latest.card.imageUrl || `https://placehold.co/400x600/2a1b3d/ffffff?text=${encodeURIComponent(stats.latest.card.title || stats.latest.card.category || 'Card')}`}')`}}></div>
        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-80"></div>
        <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/10 to-white/0 opacity-0 group-hover:opacity-100 transition-opacity duration-700" style={{backgroundSize: '200% 200%', animation: 'shine 3s infinite'}}></div>
        <div className="absolute bottom-3 left-3 md:bottom-4 md:left-4">
        <h4 className="font-display font-bold text-base md:text-xl text-white">{stats.latest.card.title || stats.latest.card.subcategory || stats.latest.card.category}</h4>
        <p className="text-[10px] md:text-xs text-gray-300">{stats.latest.card.subcategory || stats.latest.card.category}</p>
        </div>
        </>
    ) : (
        <div className="flex items-center justify-center h-full text-white/50 text-center px-4">
            Play to earn your first card!
        </div>
    )}
    </div>
    </div>
    <div className="text-center z-10 mt-auto">
    <button className="text-xs text-gray-400 hover:text-white transition-colors flex items-center justify-center gap-1 w-full">
    <span className="material-symbols-outlined text-sm">autorenew</span> Rotate Showcase
                        </button>
    </div>
    </div>
    </aside>
  )
}
