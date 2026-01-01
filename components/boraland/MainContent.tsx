import Link from 'next/link'
import { PoolInfo } from '@/app/boraland/page'

type Tab = 'home' | 'fangate' | 'armybattles'

export default function MainContent({ onTabChange }: { pool: PoolInfo | null, onTabChange?: (tab: Tab) => void }) {
  return (
    <section className="flex-grow flex flex-col gap-6 overflow-y-auto scrollbar-hide">
    {/* Banner */}
    <div className="relative w-full h-[400px] rounded-3xl overflow-hidden group shadow-2xl shadow-purple-900/20 border border-white/10">
    <div className="absolute inset-0 bg-[url('https://placehold.co/1200x600/1a0b2e/FFFFFF?text=Quiz+Banner')] bg-cover bg-center transition-transform duration-700 group-hover:scale-105"></div>
    <div className="absolute inset-0 bg-gradient-to-t from-[#030014] via-[#030014]/80 to-transparent"></div>
    <div className="absolute bottom-0 left-0 w-full p-8 md:p-10 flex flex-col items-start z-10">
    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent-pink/20 border border-accent-pink/40 text-accent-pink text-xs font-bold uppercase tracking-wider mb-4 animate-pulse">
    <span className="w-2 h-2 rounded-full bg-accent-pink"></span> Live Event
                        </div>
    <h1 className="font-display text-4xl md:text-5xl font-bold text-white mb-2 leading-tight">
                            BTS <span className="text-transparent bg-clip-text bg-gradient-to-r from-bora-primary to-accent-pink">Era Quiz</span> Challenge
                        </h1>
    <p className="text-gray-300 max-w-xl text-lg mb-8 leading-relaxed">
                            Test your knowledge on BTS eras, songs, and moments. Collect exclusive digital photocards for perfect scores.
                        </p>
    <div className="flex items-center gap-4 w-full">
    <Link href="/boraland/play" className="flex-1 md:flex-none bg-white text-black hover:bg-gray-100 font-bold text-lg px-8 py-4 rounded-xl shadow-[0_0_20px_rgba(255,255,255,0.3)] hover:shadow-[0_0_30px_rgba(255,255,255,0.5)] transition-all flex items-center justify-center gap-2 group/btn">
    <span className="material-symbols-outlined group-hover/btn:rotate-12 transition-transform">play_arrow</span>
                                Start Quiz
                            </Link>
    <div className="flex flex-col">
    <span className="text-xs text-gray-500 uppercase tracking-wider">Quiz Type</span>
    <span className="text-white font-medium flex items-center gap-1">
    <span className="material-symbols-outlined text-sm text-purple-400">school</span> BTS Era Knowledge
                            </span>
    </div>
    </div>
    </div>
    <div className="absolute top-6 right-6 flex flex-col gap-2">
    <div className="bora-glass-panel px-4 py-2 rounded-lg flex items-center gap-2 text-sm text-gray-300">
    <span className="material-symbols-outlined text-accent-cyan text-base">groups</span>
    <span>1,204 Active</span>
    </div>
    </div>
    </div>

    {/* Cards */}
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
    <div className="bora-glass-panel p-6 rounded-2xl relative overflow-hidden group hover:border-bora-primary/50 transition-colors cursor-pointer">
    <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
    <span className="material-symbols-outlined text-[120px]">school</span>
    </div>
    <h3 className="font-display text-xl font-bold text-white mb-2">Practice Mode</h3>
    <p className="text-sm text-gray-400 mb-4">Sharpen your BTS knowledge without pressure. Study mode for learning.</p>
    <div className="flex items-center text-bora-primary text-sm font-semibold group-hover:translate-x-1 transition-transform">
                            Start Practice <span className="material-symbols-outlined text-base ml-1">arrow_forward</span>
    </div>
    </div>
    <div className="bora-glass-panel p-6 rounded-2xl relative overflow-hidden group hover:border-accent-pink/50 transition-colors cursor-pointer">
    <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
    <span className="material-symbols-outlined text-[120px]">diversity_3</span>
    </div>
    <h3 className="font-display text-xl font-bold text-white mb-2">Competitive Quiz</h3>
    <p className="text-sm text-gray-400 mb-4">Earn XP and climb the leaderboard. Race against time for high scores.</p>
    <div className="flex items-center text-accent-pink text-sm font-semibold group-hover:translate-x-1 transition-transform">
                            Join Competition <span className="material-symbols-outlined text-base ml-1">swords</span>
    </div>
    </div>
    </div>

    {/* Other ARMYVERSE Features */}
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
      <button
        onClick={() => onTabChange?.('fangate')}
        className="bora-glass-panel p-6 rounded-2xl relative overflow-hidden group hover:border-purple-500/50 transition-colors cursor-pointer text-left"
      >
        <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
          <span className="material-symbols-outlined text-[120px]">verified_user</span>
        </div>
        <h3 className="font-display text-xl font-bold text-white mb-2">Fangate</h3>
        <p className="text-sm text-gray-400 mb-4">Verify your BTS fandom to unlock exclusive concert ticketing access.</p>
        <div className="flex items-center text-purple-400 text-sm font-semibold group-hover:translate-x-1 transition-transform">
          Explore Fangate <span className="material-symbols-outlined text-base ml-1">arrow_forward</span>
        </div>
      </button>

      <button
        onClick={() => onTabChange?.('armybattles')}
        className="bora-glass-panel p-6 rounded-2xl relative overflow-hidden group hover:border-cyan-500/50 transition-colors cursor-pointer text-left"
      >
        <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
          <span className="material-symbols-outlined text-[120px]">swords</span>
        </div>
        <h3 className="font-display text-xl font-bold text-white mb-2">ArmyBattles</h3>
        <p className="text-sm text-gray-400 mb-4">Compete in real-time music streaming battles with live leaderboards.</p>
        <div className="flex items-center text-cyan-400 text-sm font-semibold group-hover:translate-x-1 transition-transform">
          Enter Arena <span className="material-symbols-outlined text-base ml-1">arrow_forward</span>
        </div>
      </button>
    </div>
    </section>
  )
}
