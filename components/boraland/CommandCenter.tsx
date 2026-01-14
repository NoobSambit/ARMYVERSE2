'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { PiBackpackFill, PiTrophyFill, PiMedalFill, PiCheckSquareFill } from 'react-icons/pi'

export default function CommandCenter({ className = "lg:w-64" }: { className?: string }) {
  const pathname = usePathname()

  return (
    <aside className={`w-full ${className} flex flex-col gap-4 shrink-0 overflow-y-auto lg:overflow-visible h-full hidden lg:flex`}>
      <div className="bora-glass-panel rounded-2xl p-1 flex flex-col gap-1 h-full">
        <div className="p-4 mb-2 border-b border-white/5">
          <h2 className="font-display text-sm text-gray-500 uppercase tracking-widest mb-1">Command Center</h2>
        </div>
        
        <nav className="flex-1 flex flex-col gap-1 px-1">
            <NavItem 
            href="/boraland/inventory" 
            icon={<PiBackpackFill className="text-xl" />} 
            label="Inventory" 
            subLabel="View collection" 
            color="blue" 
            isActive={pathname === '/boraland/inventory'}
            />
            <NavItem 
            href="/boraland/leaderboard" 
            icon={<PiTrophyFill className="text-xl" />} 
            label="Leaderboard" 
            subLabel="Global Rankings" 
            color="purple" 
            isActive={pathname === '/boraland/leaderboard'}
            />
            <NavItem 
            href="/boraland/mastery" 
            icon={<PiMedalFill className="text-xl" />} 
            label="Mastery" 
            subLabel="Skill Tree" 
            color="orange" 
            isActive={pathname === '/boraland/mastery'}
            />
            <NavItem 
            href="/boraland/quests" 
            icon={<PiCheckSquareFill className="text-xl" />} 
            label="Quests" 
            subLabel="Daily challenges" 
            color="green" 
            isActive={pathname === '/boraland/quests'}
            />
        </nav>

        <div className="mt-auto p-4 border-t border-white/5">
            <div className="bg-gradient-to-r from-purple-900/50 to-indigo-900/50 rounded-xl p-3 border border-white/10">
                <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-indigo-300 uppercase">Season 4</span>
                    <span className="text-xs text-gray-400">24d left</span>
                </div>
                <div className="w-full h-1.5 bg-gray-800 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 w-[65%]"></div>
                </div>
            </div>
        </div>
      </div>
    </aside>
  )
}

function NavItem({ href, icon, label, subLabel, color, isActive = false }: { href: string, icon: React.ReactNode, label: string, subLabel: string, color: string, isActive?: boolean }) {
  // Styles based on the provided HTML and adapted for dark theme compatibility
  
  let containerClass = "group flex items-center gap-4 p-3 rounded-xl transition-all border"
  let iconContainerClass = "w-10 h-10 rounded-lg flex items-center justify-center text-xl transition-transform"
  
  if (isActive) {
    // Active styling
    containerClass += " bg-bora-primary/20 border-bora-primary/30 shadow-[0_0_15px_rgba(139,92,246,0.15)]"
    iconContainerClass += " bg-bora-primary text-white shadow-lg shadow-bora-primary/40"
  } else {
    // Inactive styling
    containerClass += " hover:bg-white/5 border-transparent hover:border-white/10"
    
    // Icon colors based on prop - using slightly different opacity for dark mode
    if (color === 'blue') iconContainerClass += " bg-blue-500/10 text-blue-400 group-hover:text-blue-300 group-hover:scale-110"
    else if (color === 'purple') iconContainerClass += " bg-purple-500/10 text-purple-400 group-hover:text-purple-300 group-hover:scale-110"
    else if (color === 'orange') iconContainerClass += " bg-orange-500/10 text-orange-400 group-hover:text-orange-300 group-hover:scale-110"
    else if (color === 'green') iconContainerClass += " bg-green-500/10 text-green-400 group-hover:text-green-300 group-hover:scale-110"
    else iconContainerClass += " bg-gray-500/10 text-gray-400 group-hover:text-gray-300 group-hover:scale-110"
  }

  return (
    <Link className={containerClass} href={href}>
      <div className={iconContainerClass}>
        {icon}
      </div>
      <div>
        <div className={`font-semibold ${isActive ? 'text-white' : 'text-gray-400 group-hover:text-gray-200'}`}>{label}</div>
        <div className={`text-xs ${isActive ? 'text-purple-300' : 'text-gray-500 group-hover:text-gray-400'}`}>{subLabel}</div>
      </div>
    </Link>
  )
}
