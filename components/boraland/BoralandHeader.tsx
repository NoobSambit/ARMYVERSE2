'use client'

type Tab = 'home' | 'fangate' | 'armybattles'

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
    <header className="z-40 h-16 shrink-0 flex items-center justify-center">
        <nav className="flex items-center gap-1 bg-white/5 rounded-full p-1 border border-white/5 backdrop-blur-md">
            <button
                className={`px-6 py-2 rounded-full text-sm ${activeTab === 'home' ? activeStyle : inactiveStyle}`}
                onClick={() => onTabChange('home')}
            >
                Home
            </button>
            <button
                className={`px-6 py-2 rounded-full text-sm ${activeTab === 'fangate' ? activeStyle : inactiveStyle}`}
                onClick={() => onTabChange('fangate')}
            >
                Fangate
            </button>
            <button
                className={`px-6 py-2 rounded-full text-sm ${activeTab === 'armybattles' ? activeStyle : inactiveStyle}`}
                onClick={() => onTabChange('armybattles')}
            >
                ArmyBattles
            </button>
        </nav>
    </header>
  )
}
