'use client'

type Tab = 'home' | 'fangate' | 'armybattles' | 'leaderboard' | 'borarush'

export default function BoralandHeader({
  activeTab,
  onTabChange
}: {
  activeTab: Tab
  onTabChange: (tab: Tab) => void
}) {
  const activeStyle = "bg-bora-primary/20 text-accent-neon font-medium shadow-[0_0_10px_rgba(168,85,247,0.2)] border border-bora-primary/30"
  const inactiveStyle = "text-gray-400 hover:text-white transition-colors"

  return (
    <header className="z-40 h-14 md:h-16 shrink-0 flex items-center justify-center px-3">
      <nav data-tour="bora-header" className="flex items-center gap-0.5 md:gap-1 bg-white/5 rounded-full p-0.5 md:p-1 border border-white/5 backdrop-blur-md">
        <button
          className={`px-3 md:px-6 py-1.5 md:py-2 rounded-full text-xs md:text-sm ${activeTab === 'home' ? activeStyle : inactiveStyle}`}
          onClick={() => onTabChange('home')}
        >
          Home
        </button>
        <button
          className={`px-3 md:px-6 py-1.5 md:py-2 rounded-full text-xs md:text-sm ${activeTab === 'borarush' ? activeStyle : inactiveStyle}`}
          onClick={() => onTabChange('borarush')}
        >
          BoraRush
        </button>
        <button
          className={`px-3 md:px-6 py-1.5 md:py-2 rounded-full text-xs md:text-sm ${activeTab === 'fangate' ? activeStyle : inactiveStyle}`}
          onClick={() => onTabChange('fangate')}
        >
          Fangate
        </button>
        <button
          className={`px-3 md:px-6 py-1.5 md:py-2 rounded-full text-xs md:text-sm whitespace-nowrap ${activeTab === 'armybattles' ? activeStyle : inactiveStyle}`}
          onClick={() => onTabChange('armybattles')}
        >
          <span className="hidden md:inline">ArmyBattles</span>
          <span className="md:hidden">Battles</span>
        </button>
      </nav>
    </header>
  )
}
